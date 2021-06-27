var express = require('express');
const { Parser } = require('json2csv');
const db = require('../database');
var router = express.Router();

var dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat');
var timezone = require('dayjs/plugin/timezone');
var utc = require('dayjs/plugin/utc');
dayjs.extend(localizedFormat);
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

router.get('/:date', async (req, res) => {

    var selectedDate = req.params.date;

    if (req.params.date != 'latest' && !dayjs(selectedDate).isValid())
        return res.status(404).send({
            error: `No data found to download or invalid date provided.`
        });

    var start_time = dayjs().startOf('day').tz(DEVICE_TIMEZONE).toISOString();
    var end_time = dayjs().endOf('day').tz(DEVICE_TIMEZONE).toISOString();

    var q = `SELECT *from data WHERE data.device_id = "${DEVICE_ID}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID DESC`;

    if (req.params.date != 'latest' && req.params.date.split('-').length == 3) {
        var start_time = dayjs(selectedDate).startOf('day').tz(DEVICE_TIMEZONE).toISOString();
        var end_time = dayjs(selectedDate).endOf('day').tz(DEVICE_TIMEZONE).toISOString();
        var q = `SELECT * from data WHERE device_id = "${DEVICE_ID}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID DESC`;
    }
    if (req.params.date != 'latest' && req.params.date.split('-').length == 2) {
        var start_time = dayjs(selectedDate).startOf('month').tz(DEVICE_TIMEZONE).toISOString();
        var end_time = dayjs(selectedDate).endOf('month').tz(DEVICE_TIMEZONE).toISOString();
        var q = `SELECT * from data WHERE device_id = "${DEVICE_ID}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID DESC`;
    }
    await db.all(q, function (err, rows) {
        if (err)
            res.status(500).send();
        else {
            let json2csv = new Parser();
            let csv = rows.length == 0? "" : json2csv.parse(rows);
            res.header('Content-Type', 'text/csv');
            res.attachment(`Weather-Data ${selectedDate.replace('/', '-')}.csv`);
            res.send(csv);
        }
    });

});

module.exports = router;
