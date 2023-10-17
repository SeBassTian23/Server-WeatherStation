var express = require('express');
var router = express.Router();

const { cloneDeep, merge } = require('lodash');

/* Date and Time functions */
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const customParseFormat = require('dayjs/plugin/customParseFormat')
const { getSunriseDateTimeUtc, getSunsetDateTimeUtc } = require('suntimes');
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/* Database */
const DB_TYPE = process.env.SQLITE_FILE ? "SQLITE" : process.env.MONGO_CONNECTION_STRING ? "MONGODB" : null || "SQLITE"

/* Constants */
const DEVICE_ID = process.env.DEVICE_ID;
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE;
const SITE_OBSERVATIONS_MAX = process.env.SITE_OBSERVATIONS_MAX;

const PAGE_DATA_TEMPLATE = require('../models/page_data_template');
const COLUMNS_TO_DISPLAY = require('../constants/db-cols.json');

/* Queries */
const querySummary = require('../db/querySummary.js');
const queryAlmanac = require('../db/queryAlmanac.js');
const queryAppData = require('../db/queryAppData.js');
const queryData = require('../db/queryData.js');

/* Compile Data for Views */
const buildCurrent = require('../models/buildCurrent');
const buildSummary = require('../models/buildSummary');
const buildGraphs = require('../models/buildGraphs');
const buildObservationTable = require('../models/buildObservationTable');
const buildAlmanac = require('../models/buildAlmanac');
const buildSideBarData = require('../models/buildSideBarData');

const replaceInKeysWith = require('../helpers/replaceInKeysWith');

/* GET home page. */
router.get('/', function (req, res) {

  // clone data element
  var data = cloneDeep(PAGE_DATA_TEMPLATE);

  var start_time = dayjs().startOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var end_time = dayjs().endOf('day').tz(DEVICE_TIMEZONE).toISOString();

  var query;

  if (DB_TYPE == "SQLITE")
    query = `SELECT "created_at" AS Time, "${COLUMNS_TO_DISPLAY.join("\",\"")}" FROM data WHERE device_id = "${DEVICE_ID}" AND datetime(created_at) >= datetime('${start_time}') ORDER BY ROWID DESC`;

  if (DB_TYPE == "MONGODB")
    query = [
      { $match: { device_id: DEVICE_ID, created_at: { $gte: new Date(start_time) } } },
      { $addFields: { Time: '$created_at' } },
      { $project: { created_at: 0, _id: 0, __v: 0 } }
    ];

  // Get data
  const q1 = queryData(query);

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_time, end_time, COLUMNS_TO_DISPLAY);

  // Get the application data infro
  const q3 = queryAppData(DEVICE_ID);

  Promise.all([q1, q2, q3]).then(function (values) {

    var rows = values[0];
    var summary = values[1];
    var appdata = values[2];

    data.graphs.data = buildGraphs(COLUMNS_TO_DISPLAY, rows.slice(0, 30))

    // Determine Sunrise and Sunset
    data.graphs.sunrise = getSunriseDateTimeUtc(new Date(), appdata.latitude, appdata.longitude)
    data.graphs.sunset = getSunsetDateTimeUtc(new Date(), appdata.latitude, appdata.longitude)
    data.graphs.period = "now"

    let observations = buildObservationTable(rows, SITE_OBSERVATIONS_MAX)
    for(let i in observations)
      observations[i] = replaceInKeysWith(observations[i] , ",", ".");
    data.table = {
      // columns: Object.keys(observations[0] || []),
      columns: ["Time", ...COLUMNS_TO_DISPLAY],
      rows: observations
    }

    var cards = buildCurrent(COLUMNS_TO_DISPLAY, rows) || []

    cards.push({
      "field": 'Sunrise',
      'size': 'sm',
      'value': data.graphs.sunrise,
      'unit': null,
      'label': 'Sunrise'
    })
    cards.push({
      "field": 'Sunset',
      'size': 'sm',
      'value': data.graphs.sunset,
      'unit': null,
      'label': 'Sunset'
    })

    data.subheader.cards = cards.splice(0, 4).map(item => { item.size = 'lg'; return item })
    data.summary.cards = cards

    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.period = "now"
    data.summary.table.left = summaryTable.splice(0, 11)
    data.summary.table.right = summaryTable.splice(0, 11)

    data.sidebar = merge(data.sidebar, buildSideBarData(appdata))

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: data
    })

  });

});

/* GET past day */
router.get('/:year([0-9]{4})/:month([0-9]{1,2})/:day([0-9]{1,2})', function (req, res) {

  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);
  var day = parseInt(req.params.day);

  var selectedDate = `${year}-${month}-${day}`;

  // clone data element
  var data = cloneDeep(PAGE_DATA_TEMPLATE);

  var start_time = dayjs(selectedDate).startOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var end_time = dayjs(selectedDate).endOf('day').tz(DEVICE_TIMEZONE).toISOString();

  // Data Queries
  var query;

  if (DB_TYPE == "SQLITE")
    query = `SELECT "created_at" AS Time, "${COLUMNS_TO_DISPLAY.join("\",\"")}" from data WHERE data.device_id = "${DEVICE_ID}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID DESC`;

  if (DB_TYPE == "MONGODB")
    query = [
      { $match: { device_id: DEVICE_ID, created_at: { $gte: new Date(start_time), $lte: new Date(end_time) } } },
      { $addFields: { Time: '$created_at' } },
      { $project: { created_at: 0, _id: 0, __v: 0 } }
    ];

  // Get data
  const q1 = queryData(query);

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_time, end_time, COLUMNS_TO_DISPLAY);

  // Get the application data infro
  const q3 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q4 = queryAlmanac(DEVICE_ID, start_time, end_time, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4]).then(function (values) {

    var rows = values[0].map(itm => replaceInKeysWith(itm, ",", ".")) || values[0];
    var summary = replaceInKeysWith(values[1], ",", ".") || values[1];
    var appdata = values[2];
    var almanac = values[3];

    data.graphs.data = buildGraphs(COLUMNS_TO_DISPLAY, rows)
    data.graphs.sunrise = getSunriseDateTimeUtc(new Date(year, month - 1, day), appdata.latitude, appdata.longitude)
    data.graphs.sunset = getSunsetDateTimeUtc(new Date(year, month - 1, day), appdata.latitude, appdata.longitude)
    data.graphs.period = "day"

    data.subheader.almanac = buildAlmanac(almanac, "day")

    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.period = "day"
    data.summary.table.left = summaryTable.splice(0, 11)
    data.summary.table.right = summaryTable.splice(0, 11)

    data.sidebar = merge(data.sidebar, buildSideBarData(appdata, dayjs(selectedDate).format('YYYY-MM-DD')))

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: data
    })

  });

});

/* GET past month */
router.get('/:year([0-9]{4})/:month([0-9]{1,2})', function (req, res) {

  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);

  var selectedDate = `${year}-${month}`;

  // clone data element
  var data = cloneDeep(PAGE_DATA_TEMPLATE);

  var start_day = dayjs(selectedDate).startOf('month').tz(DEVICE_TIMEZONE).toISOString();
  var end_day = dayjs(selectedDate).endOf('month').tz(DEVICE_TIMEZONE).toISOString();

  /* Queries */
  var query;

  if (DB_TYPE == "SQLITE")
    query = `SELECT strftime('%Y-%m-%dT%H:00:00Z', datetime(data.created_at)) AS Time,
      ${COLUMNS_TO_DISPLAY.map(function (x) { return `AVG( data.'${x}' ) as '${x}'`; }).join(",")}
      FROM data  
      WHERE data.device_id = "${DEVICE_ID}" AND
      datetime(created_at) BETWEEN datetime('${start_day}') AND datetime('${end_day}') 
      GROUP BY Time
      ORDER BY Time ASC`;

  if (DB_TYPE == "MONGODB") {
    query = [
      { $match: { device_id: DEVICE_ID, created_at: { $gte: new Date(start_day), $lte: new Date(end_day) } } },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" },
            hour: { $hour: "$created_at" }
          }
        }
      },
      {
        $project: {
          _id: 0,
          Time: {
            $dateToString: {
              format: "%Y-%m-%dT%H:00:00Z",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                  hour: "$_id.hour"
                }
              }
            }
          }
        }
      }
    ]

    COLUMNS_TO_DISPLAY.forEach(el => {
      el = el.replace(/\./g, ",")
      query[1]['$group'][`avg${el}`] = { $avg: `$${el}` }
      query[2]['$project'][el] = `$avg${el}`
    });
  }

  // Get data
  const q1 = queryData(query);

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_day, end_day, COLUMNS_TO_DISPLAY);

  // Get the application data infro
  const q3 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q4 = queryAlmanac(DEVICE_ID, start_day, end_day, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4]).then(function (values) {

    var rows = values[0]? values[0].map(itm => replaceInKeysWith(itm, ",", ".")) : values[0];
    var summary = replaceInKeysWith(values[1], ",", ".") || values[1];
    var appdata = values[2];
    var almanac = values[3];

    data.graphs.data = buildGraphs(COLUMNS_TO_DISPLAY, rows)
    data.graphs.sunrise = null
    data.graphs.sunset = null
    data.graphs.period = "month"

    data.subheader.almanac = buildAlmanac(almanac, "month")

    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.period = "month"
    data.summary.table.left = summaryTable.splice(0, 11)
    data.summary.table.right = summaryTable.splice(0, 11)

    data.sidebar = merge(data.sidebar, buildSideBarData(appdata, dayjs(selectedDate).format('YYYY-MM')))

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: data
    })

  });

});

/* GET past year */
router.get('/:year([0-9]{4})', function (req, res) {

  var year = parseInt(req.params.year);
  var selectedDate = `${year}`;

  // clone data element
  var data = cloneDeep(PAGE_DATA_TEMPLATE);

  var start_day = dayjs(selectedDate).startOf('year').tz(DEVICE_TIMEZONE).toISOString();
  var end_day = dayjs(selectedDate).endOf('year').tz(DEVICE_TIMEZONE).toISOString();

  /* Queries */
  var query;

  if (DB_TYPE == "SQLITE")
    query = `SELECT strftime('%Y-%m-%dT00:00:00Z',datetime(data.created_at)) as Time,
      ${COLUMNS_TO_DISPLAY.map(function (x) { return `AVG( data.'${x}' ) as '${x}'`; }).join(",")}
    FROM data  
    WHERE data.device_id = "${DEVICE_ID}" AND
    datetime(created_at) BETWEEN datetime('${start_day}') AND datetime('${end_day}') 
    GROUP BY Time
    ORDER BY Time ASC`;

  if (DB_TYPE == "MONGODB") {
    query = [
      { $match: { device_id: DEVICE_ID, created_at: { $gte: new Date(start_day), $lte: new Date(end_day) } } },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" },
            // hour: { $hour: "$created_at" }
          }
        }
      },
      {
        $project: {
          _id: 0,
          Time: {
            $dateToString: {
              format: "%Y-%m-%dT00:00:00Z",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                  // hour: "$_id.hour"
                }
              }
            }
          }
        }
      }
    ]

    COLUMNS_TO_DISPLAY.forEach(el => {
      el = el.replace(/\./g, ",")
      query[1]['$group'][`avg${el}`] = { $avg: `$${el}` }
      query[2]['$project'][el] = `$avg${el}`
    });
  }

  // Get data
  const q1 = queryData(query);

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_day, end_day, COLUMNS_TO_DISPLAY);

  // Get the application data infro
  const q3 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q4 = queryAlmanac(DEVICE_ID, start_day, end_day, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4]).then(function (values) {

    var rows = values[0].map(itm => replaceInKeysWith(itm, ",", ".")) || values[0];
    var summary = values[1];
    var appdata = values[2];
    var almanac = values[3];

    data.graphs.data = buildGraphs(COLUMNS_TO_DISPLAY, rows)
    data.graphs.sunrise = null
    data.graphs.sunset = null
    data.graphs.period = "year"

    data.subheader.almanac = buildAlmanac(almanac, "year")

    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.period = "year"
    data.summary.table.left = summaryTable.splice(0, 11)
    data.summary.table.right = summaryTable.splice(0, 11)

    data.sidebar = merge(data.sidebar, buildSideBarData(appdata, selectedDate))

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: data
    })

  });

});

/* GET range */
router.get('/:range([0-9]{4}-[0-9]{1,2}-[0-9]{1,2},[0-9]{4}-[0-9]{1,2}-[0-9]{1,2})', function (req, res) {

  var range = req.params.range.split(",");

  // clone data element
  var data = cloneDeep(PAGE_DATA_TEMPLATE);

  var start_day = dayjs(range[0]).startOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var end_day = dayjs(range[1]).endOf('day').tz(DEVICE_TIMEZONE).toISOString();

  var query;

  if (DB_TYPE == 'SQLITE')
    query = `SELECT strftime('%Y-%m-%dT00:00:00Z',datetime(data.created_at)) as Time,
      ${COLUMNS_TO_DISPLAY.map(function (x) { return `AVG( data.'${x}' ) as '${x}'`; }).join(",")}
    FROM data  
    WHERE data.device_id = "${DEVICE_ID}" AND
    datetime(created_at) BETWEEN datetime('${start_day}') AND datetime('${end_day}') 
    GROUP BY Time
    ORDER BY Time ASC`;

  if (DB_TYPE == 'MONGODB') {
    query = [
      { $match: { device_id: DEVICE_ID, created_at: { $gte: new Date(start_day), $lte: new Date(end_day) } } },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" },
            hour: { $hour: "$created_at" }
          }
        }
      },
      {
        $project: {
          _id: 0,
          Time: {
            $dateToString: {
              format: "%Y-%m-%dT%H:00:00Z",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                  hour: "$_id.hour"
                }
              }
            }
          }
        }
      }
    ]

    COLUMNS_TO_DISPLAY.forEach(el => {
      el = el.replace(/\./g, ",")
      query[1]['$group'][`avg${el}`] = { $avg: `$${el}` }
      query[2]['$project'][el] = `$avg${el}`
    });
  }

  // Get Data
  const q1 = queryData(query);

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_day, end_day, COLUMNS_TO_DISPLAY);

  // Get the application data infro
  const q3 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q4 = queryAlmanac(DEVICE_ID, start_day, end_day, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4]).then(function (values) {

    var rows = values[0].map(itm => replaceInKeysWith(itm, ",", ".")) || values[0];
    var summary = values[1];
    var appdata = values[2];
    var almanac = values[3];

    data.graphs.data = buildGraphs(COLUMNS_TO_DISPLAY, rows)
    data.graphs.sunrise = null
    data.graphs.sunset = null
    data.graphs.period = "range"

    data.subheader.almanac = buildAlmanac(almanac, "range")

    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.period = "range"
    data.summary.table.left = summaryTable.splice(0, 11)
    data.summary.table.right = summaryTable.splice(0, 11)

    data.sidebar = merge(data.sidebar, buildSideBarData(appdata, range))

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: data
    })

  });

});

module.exports = router;
