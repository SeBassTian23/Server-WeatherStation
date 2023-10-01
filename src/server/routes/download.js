var express = require('express');
const { Parser } = require('json2csv');
const db = require('../db/sqlite');
var router = express.Router();

var dayjs = require('dayjs');
var timezone = require('dayjs/plugin/timezone');
var utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
dayjs.extend(timezone);

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

/* GET home page. */
router.get('/', (req, res) => {
    res.status(400).send({
        msg: `No valid download`,
        error: `Define a download date.`
    });
});

const DEVICE_ID = process.env.DEVICE_ID;
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE;

const unitConverter = require('../models/convert.js');

router.get('/:date', async (req, res) => {

    var selectedDate = req.params.date;

    if (req.params.date != 'latest' && !dayjs(selectedDate).isValid())
        return res.status(404).send({
            error: `No data found to download or invalid date provided.`
        });

    var start_time = dayjs().startOf('day').tz(DEVICE_TIMEZONE).toISOString();
    var end_time = dayjs().endOf('day').tz(DEVICE_TIMEZONE).toISOString();

    if (req.params.date != 'latest' && req.params.date.split('-').length == 3) {
        var start_time = dayjs(selectedDate).startOf('day').tz(DEVICE_TIMEZONE).toISOString();
        var end_time = dayjs(selectedDate).endOf('day').tz(DEVICE_TIMEZONE).toISOString();
    }
    
    if (req.params.date != 'latest' && req.params.date.split('-').length == 2) {
        var start_time = dayjs(selectedDate).startOf('month').tz(DEVICE_TIMEZONE).toISOString();
        var end_time = dayjs(selectedDate).endOf('month').tz(DEVICE_TIMEZONE).toISOString();
    }
    
    if (req.params.date != 'latest' && String(req.params.date).match(/^\d{4}$/)) {
        var start_time = dayjs(selectedDate).startOf('year').tz(DEVICE_TIMEZONE).toISOString();
        var end_time = dayjs(selectedDate).endOf('year').tz(DEVICE_TIMEZONE).toISOString();
    }    

    var q = `SELECT * from data WHERE data.device_id = "${DEVICE_ID}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID ASC`;

    await db.all(q, function (err, rows) {
        if (err)
            res.status(500).send();
        else {
            rows = rows.map( row => {
                for(let key in row){
                    if(req.query.units && req.query.units === 'imperial'){
                        let converted = unitConverter(row[key], key, 'i')
                        let new_key = key.replace(/\[(C|hPa)\]/gi, function (x) {
                            if(x.toLowerCase() === '[c]')
                                return '[F]'
                            if(x.toLowerCase() === '[hpa]')
                                return '[inHg]'
                            return x;
                        });
                        if(key !== new_key){
                            row[new_key] = converted[0]
                            delete row[key]
                        }
                        else
                            row[key] = converted[0]
                    }
                    let created_at_offset = dayjs(row['created_at']).tz(DEVICE_TIMEZONE).format('ZZ')
                    row['created_at'] = row['created_at'].replace('Z',created_at_offset);
                    return row;
                }
            });
            let json2csv = new Parser();
            let csv = rows.length == 0? "" : json2csv.parse(rows);
            res.header('Content-Type', 'text/csv');
            res.attachment(`Weather-Data ${selectedDate.replace('/', '-')}.csv`);
            res.send(csv);
        }
    });

});

module.exports = router;
