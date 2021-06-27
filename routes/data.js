var express = require('express');
const db = require('../database');
var router = express.Router();

var dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(localizedFormat);

const _ = require('lodash');

let cols = require('./../db-cols.json');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const API_TOKEN = process.env.API_TOKEN;
const DEVICE_ID = process.env.DEVICE_ID;
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE;


const EventEmitter = require('events');
const Stream = new EventEmitter(); // my event emitter instance

/* Stream triggered when a new datapoint is pushed */
router.get('/stream', (req, res) => {
    res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  Stream.once("push", function(event, data) {
    res.write(`data: ${data.msg}\n\n`);
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
        db.serialize(function(){
            db.get(`Select COUNT(data.ID) AS "count" from data WHERE data.device_id = "${DEVICE_ID}"`, function(err, row){
                if(err){
                    return res.status(500).json({
                        error: `Database query failed.`
                    });
                }
                res.json({
                    message: `success`,
                    details: `Currently there are »${row.count}« datasets from device »${DEVICE_ID}«.`,
                    body: row
                });   
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
router.get('/:datum([0-9]*|latest|devices)', (req, res) => {
    if( req.query.token === undefined || req.query.token !== API_TOKEN){
        res.status(403).json({
            error: `Provide the correct token to get data.`            
        });
    }
    else if(req.params.datum === "devices"){
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
        db.serialize(function(){
            db.get(`SELECT data.* from data WHERE data.device_id = "${DEVICE_ID}" ORDER BY ROWID DESC LIMIT 1`, function(err, row){
                if(err){
                    return res.status(500).json({
                        error: `Database query failed.`
                    });
                }
                res.json({
                    message: `success`,
                    details: `Latest dataset »${row.ID}« from device »${DEVICE_ID}« at »${dayjs(row.created_at).tz(DEVICE_TIMEZONE).format('LLL')}«.`,
                    body: row
                });   
            }); 
        });
    }
    else if( _.isInteger(Number(req.params.datum)) ){
        db.serialize(function(){
            db.get(`SELECT data.* from data WHERE data.ID = ${Number(req.params.datum)} LIMIT 1`, function(err, row){
                if(err){
                    return res.status(500).json({
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
    else{
        res.status(404).json({
            error: `No dataset for the query »${req.params.datum}« available.`            
        });
    }
});

/* Save dataset to DB */
router.post('/', (req, res) => {
    if( req.body.token === undefined || req.body.token !== API_TOKEN){
        res.status(403).json({
            error: `Provide the correct token to submit data.`            
        });
    }
    else{
        db.serialize(function() {
            var ins = [];
            for(var i in cols){
                if(req.body.data[cols[i]] !== undefined){
                    if(cols[i] == "created_at")
                        ins.push(`"${dayjs().toISOString()}"`);
                    else if(cols[i] == "device_id")
                        ins.push(`"${req.body.data[cols[i]]}"`);
                    else if(req.body.data[cols[i]] !== null && _.isNumber(req.body.data[cols[i]]) )
                        ins.push( req.body.data[cols[i]] );
                    else
                        ins.push(`NULL`);
                }
                else{
                    ins.push(`NULL`);
                }
            }
            var q = `INSERT INTO data ("${cols.join('","')}") VALUES (${ins})`;
            console.log(q);
            db.exec(q);
            db.get(`SELECT data.ID from data ORDER BY ROWID DESC LIMIT 1`, function(err, row){
                if(err){
                    return res.status(500).json({
                        error: `Database query failed.`
                    });
                }
                Stream.emit("push", "data", { id: row.ID, msg: 'New Data Point' });
                res.json({
                    message: `success`,
                    details: `Dataset saved with ID »${row.ID}«.`,
                    body: {ID: row.ID }
                });   
            }); 
        });
    }
});

// router.put('/:datum', (req, res) => {
//     res.send(`PUT HTTP method on user/${req.params.datumId} resource`);
// });

// router.delete('/:datum', (req, res) => {
//     res.send(`DELETE HTTP method on user/${req.params.datumId} resource`);
// });

module.exports = router;
