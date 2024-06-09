var express = require('express');
var router = express.Router();

const {isInteger, isNumber, cloneDeep, merge} = require('lodash');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const DEVICE_ID = process.env.DEVICE_ID;

const queryAppData = require('../db/queryAppData.js');
const buildSideBarData = require('../models/buildSideBarData');

const COLUMNS_TO_DISPLAY = require('../constants/db-cols.json');
const PAGE_DATA_TEMPLATE = require('../models/page_data_template');

const API_TOKEN = process.env.API_TOKEN;
const PAGE_TITLE_LOCATION = process.env.PAGE_TITLE_LOCATION;
const WIDGET_URL = process.env.WIDGET_URL;

/* Database */
const db = process.env.SQLITE_FILE? require('../db/sqlite.js') : null;
const Data = process.env.MONGO_CONNECTION_STRING? require('../db/models/data') : null;
const Device = process.env.MONGO_CONNECTION_STRING? require('../db/models/device') : null;

const replaceInKeysWith = require('../helpers/replaceInKeysWith');

// Clients for streams
let clients = []

// Sent udpate notification to all clients
function sendEventsToAll(newFact) {
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(newFact)}\n\n`))
  }

/* Stream triggered when a new datapoint is pushed */
router.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Headers":
        // "Origin, X-Requested-With, Content-Type, Accept",
    });

    const clientId = Date.now();

    const newClient = {
        id: clientId,
        res
      };
    
    clients.push(newClient);

    // Close connection if client drops out
    res.on('close', () => {
        clients = clients.filter(client => client.id !== clientId);
        console.log('Client dropped connection.');
        res.end();
    });
});

/* GET home page. */
router.get('/', (req, res) => {
    if( req.query.token === undefined || req.query.token !== API_TOKEN){
        res.status(403).json({
            error: `Provide the correct token to get data.`            
        });
    }
    else{
        if(Data && Device)
            Device.findOne({default: true})
            .then(device => {
                // Find all entries for the default device
                const deviceID = device.device_id;

                return Data.find({ device_id: deviceID }).countDocuments().then(count => {
                    return {
                        device_id: deviceID, 
                        count
                        };
                    });
            })
            .then(row => {
                if(row.count == 0){
                    res.json({
                        message: `success`,
                        details: `There are not datasets for device »${row.device_id}«.`,
                        body: {}
                    });
                }
                else{
                    res.json({
                        message: `success`,
                        details: `Currently there are »${row.count}« datasets from device »${row.device_id}«.`,
                        body: row
                    }); 
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: `Query Error`,
                    errorMessage: String(err).replace(/Error:\s?/i,' ')
                }); 
            });

        if(db)
            db.serialize(function(){

                let device_id;
                let q = `Select COUNT(data.ID) AS "count", data.device_id from data INNER JOIN devices ON devices.device_id = data.device_id WHERE devices."default" = 1`
                
                // TODO: More string validation
                if( req.query.device ){
                    device_id = req.query.device;
                    q = `Select COUNT(data.ID) AS "count", data.device_id from data INNER JOIN devices ON devices.device_id = data.device_id WHERE devices.device_id = "${device_id}"`
                }

                db.get(q, function(err, row){
                    if(err){
                        return res.status(500).json({
                            error: `Database query failed.`
                        });
                    }
                    else if(!row.device_id){
                        res.json({
                            message: `success`,
                            details: `There are not datasets for device »${device_id}«.`,
                            body: {}
                        });
                    }
                    else{
                        res.json({
                            message: `success`,
                            details: `Currently there are »${row.count}« datasets from device »${row.device_id}«.`,
                            body: row
                        });   
                    }
                }); 
            });
    }
});

router.get('/vacuum', (req, res) => {
    if( req.query.token === undefined || req.query.token !== API_TOKEN){
        res.status(403).json({
            error: `Provide the correct token to vacuum the database.`
        });
    }
    else{
        if(Data && Device)
            res.status(403).json({
                error: `The Database doesn't support vacuuming.`
            });

        if(db)
            db.get(`VACUUM;`, function(err, row){
                if(err){
                    return res.status(500).json({
                        error: `Database vacuuming failed.`
                    });
                }
                res.json({
                    message: `success`,
                    details: `Database vacuumed!`
                }); 
            });
    }
});

/* Get a specific dataset */
router.get('/:datum([0-9]+|[0-9a-fA-F]{24}|latest|devices)', (req, res) => {
    if( req.query.token === undefined || req.query.token !== API_TOKEN){
        res.status(403).json({
            error: `Provide the correct token to get data.`            
        });
    }
    else if(req.params.datum === "devices"){

        if(Data && Device)
            Device.find({},{device: "$device_id", _id: 0}).then( rows => {
                res.json({
                    message: `success`,
                    details: `There are »${rows.length}« devices available.`,
                    body: rows
                });  
            });

        if(db)
            db.serialize(function(){
                db.all(`SELECT DISTINCT(data.device_id) AS device from data`, function(err, rows){
                    if(err){
                        return res.status(500).json({
                            error: `Database query failed.`
                        });
                    }
                    res.json({
                        message: `success`,
                        details: `There are »${rows.length}« devices available.`,
                        body: rows
                    });   
                }); 
            });
    }
    else if(req.params.datum === "latest"){

        if(Data && Device)
            Device.findOne({default: true})
            .then(device => {
                // Find all entries for the default device
                const deviceID = device.device_id;
                const timezone = device.timezone;

                return Data.findOne({ device_id: deviceID }, {__v: 0 }).sort({_id: -1}).then(entry => {
                    if(!entry)
                        return {device_id: deviceID}
                    return {...replaceInKeysWith(entry.toJSON(), ",", "." ), ...{timezone}};
                    });
            })
            .then(entry => {
                if(Object.keys(entry).length <= 1){
                    res.json({
                        message: `success`,
                        details: `There are not datasets for device »${entry.device_id}«.`,
                        body: {}
                    });
                }
                else{
                    res.json({
                        message: `success`,
                        details: `Latest dataset »${entry._id}« from device »${entry.device_id}« at »${entry.created_at}«.`,
                        body: entry
                    }); 
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: `Query Error`,
                    errorMessage: String(err).replace(/Error:\s?/i,' ')
                }); 
            });
        
        if(db)
            db.serialize(function(){

                let device_id;
                let q = `SELECT data.*, devices.timezone from data INNER JOIN devices ON data.device_id = devices.device_id WHERE devices."default" = 1 ORDER BY data.ROWID DESC LIMIT 1`
                
                // TODO: More string validation
                if( req.query.device ){
                    device_id = req.query.device;
                    q = `SELECT data.*, devices.timezone from data INNER JOIN devices ON data.device_id = devices.device_id WHERE devices.device_id = "${device_id}" = 1 ORDER BY data.ROWID DESC LIMIT 1`
                }

                db.get(q, function(err, row){
                    if(err){
                        res.status(500).json({
                            error: `Database query failed.`
                        });
                    }
                    if(!row){
                        res.json({
                            message: `success`,
                            details: `There are not datasets for device »${device_id}«.`,
                            body: {}
                        });       
                    }
                    else{
                        res.json({
                            message: `success`,
                            details: `Latest dataset »${row.ID}« from device »${row.device_id}« at »${row.created_at}«.`,
                            body: row
                        });   
                    }
                });
            });
    }
    else if( isInteger(Number(req.params.datum)) && db ){
        // Only applies to SQLite Database
        db.serialize(function(){
            db.get(`SELECT data.* from data WHERE data.ID = ${Number(req.params.datum)} LIMIT 1`, function(err, row){
                if(err){
                    res.status(500).json({
                        error: `Database query failed.`
                    });
                }
                res.json({
                    message: `success`,
                    details: `Dataset for ID »${row.ID}« returned.`,
                    body: row
                });   
            }); 
        });
    }
    else if( req.params.datum.match(/^[0-9a-fA-F]{24}$/) && Data && Device ){
        // Only applies to MongoDB
        Data.findOne({_id: req.params.datum }, {__v: 0})
        .then( row => {
            if(!row){
                res.status(404).json({
                    error: `No dataset for the query »${req.params.datum}« available.`            
                });            
            }
            else{
                res.json({
                    message: `success`,
                    details: `Dataset for ID »${row._id}« returned.`,
                    body: replaceInKeysWith(row.toJSON(), ',', '.')
                });     
            }
        })
    }
    else{
        res.status(404).json({
            error: `No dataset for the query »${req.params.datum}« available.`            
        });
    }
});

/* Get widget dataset */
router.get('/widget', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", CORS_URL);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET');

    if(Data && Device)
        Device.findOne({default: true})
        .then(device => {
            // Find all entries for the default device
            const deviceID = device.device_id;
            const timezone = device.timezone;
            const description = device.description;
            const title = PAGE_TITLE_LOCATION;

            return Data.findOne({ device_id: deviceID }, {__v: 0 }).sort({_id: -1}).then(entry => {
                if(!entry)
                    return {device_id: deviceID}
                return {...replaceInKeysWith(entry.toJSON(), ",", "." ), ...{timezone,description,title}};
                });
        })
        .then(entry => {
            if(Object.keys(entry).length <= 1){
                res.json({
                    message: `success`,
                    details: `There are not datasets for device »${entry.device_id}«.`,
                    body: {}
                });
            }
            else{
                res.json({
                    message: `success`,
                    details: `Latest dataset »${entry._id}« from device »${entry.device_id}« at »${entry.created_at}«.`,
                    body: entry
                }); 
            }
        })
        .catch(err => {
            res.status(500).json({
                error: `Query Error`,
                errorMessage: String(err).replace(/Error:\s?/i,' ')
            }); 
        });
        
    if(db)
        db.serialize(function(){

            let device_id;
            let q = `SELECT data.*, devices.timezone, device.description from data INNER JOIN devices ON data.device_id = devices.device_id WHERE devices."default" = 1 ORDER BY data.ROWID DESC LIMIT 1`
            
            // TODO: More string validation
            if( req.query.device ){
                device_id = req.query.device;
                timezone = req.query.timezone;
                description = req.query.description;
                title = PAGE_TITLE_LOCATION;
                q = `SELECT data.*, devices.timezone from data INNER JOIN devices ON data.device_id = devices.device_id WHERE devices.device_id = "${device_id}" = 1 ORDER BY data.ROWID DESC LIMIT 1`
            }

            db.get(q, function(err, row){
                if(err){
                    res.status(500).json({
                        error: `Database query failed.`
                    });
                }
                if(!row){
                    res.json({
                        message: `success`,
                        details: `There are not datasets for device »${device_id}«.`,
                        body: {}
                    });       
                }
                else{
                    res.json({
                        message: `success`,
                        details: `Latest dataset »${row.ID}« from device »${row.device_id}« at »${row.created_at}«.`,
                        body: {...row, ...{timezone,description,title}}
                    });   
                }
            });
        });

});

router.get('/status', (req, res) => {
    // if( req.query.token === undefined || req.query.token !== API_TOKEN){
    //     res.status(403).json({
    //         error: `Provide the correct token to get data.`            
    //     });
    // }
    // else{
        
        var data = cloneDeep(PAGE_DATA_TEMPLATE);
        var status = data.sidebar
        
        // Get the application data infro
        const q1 = queryAppData(DEVICE_ID);
        
        Promise.all([q1]).then(function (values) {
            status = merge(status, buildSideBarData(values[0]))
            res.json({
                message: `success`,
                details: `status`,
                body: status
            });
        })
        .catch(err => {
            res.status(500).json({
                error: `Query Error`,
                errorMessage: String(err).replace(/Error:\s?/i,' ')
            }); 
        });

    // }
});

/* Save dataset to DB */
router.post('/', (req, res) => {
    if( req.body.token === undefined || req.body.token !== API_TOKEN){
        res.status(403).json({
            error: `Provide the correct token to submit data.`            
        });
    }
    else{
        if(Data && Device){
            var insert = {};
            var cols = [...COLUMNS_TO_DISPLAY]
            for(var i in cols){
                insert[cols[i]] = null;
            }
            insert = {...insert, ...req.body.data }
            insert["created_at"] = new Date().toISOString();
    
            const entry = new Data(replaceInKeysWith(insert, '\\.', ','));
            entry.save()
            .then((savedEntry)=>{
                sendEventsToAll({ id: savedEntry._id, msg:'New Datapoint Added', created_at: new Date().toISOString() });
                res.json({
                    message: `success`,
                    details: `Dataset saved with ID »${savedEntry._id}«.`,
                    body: {ID: savedEntry._id }
                });             
            })
            .catch((err) => {
                res.status(500).json({
                    error: `Data submission failed.`,
                    errorMessage: String(err).replace(/Error:\s?/i,'')
                });            
            });
        }

        if(db)
            db.serialize(function() {
                var ins = [];
                var cols = [...COLUMNS_TO_DISPLAY]
                cols.push("device_id");
                cols.push("created_at");
                for(var i in cols){
                    if(req.body.data[cols[i]] !== undefined){
                        if(cols[i] == "created_at")
                            ins.push(`"${new Date().toISOString()}"`);
                        else if(cols[i] == "device_id")
                            ins.push(`"${req.body.data[cols[i]]}"`);
                        else if(req.body.data[cols[i]] !== null && isNumber(req.body.data[cols[i]]) )
                            ins.push( req.body.data[cols[i]] );
                        else
                            ins.push(`NULL`);
                    }
                    else{
                        ins.push(`NULL`);
                    }
                }
                var q = `INSERT INTO data ("${cols.join('","')}") VALUES (${ins})`;
                db.exec(q, function(err){
                    if( err )
                        return res.status(500).json({
                            error: `Data submission failed.`,
                            errorMessage: String(err).replace(/Error:\s?/i,'')
                        });
                    db.get(`SELECT data.ID from data ORDER BY ROWID DESC LIMIT 1`, function(err, row){
                        if(err){
                            return res.status(500).json({
                                error: `Database query failed.`
                            });
                        }
                        sendEventsToAll({ id: row.ID, msg:'New Datapoint Added', created_at: new Date().toISOString() });
                        res.json({
                            message: `success`,
                            details: `Dataset saved with ID »${row.ID}«.`,
                            body: {ID: row.ID }
                        });   
                    }); 
                });
            });
    }
});

module.exports = router;
