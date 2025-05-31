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
const { Hemisphere, Moon } = require('lunarphase-js');
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/* Constants */
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE;
const SITE_OBSERVATIONS_MAX = process.env.SITE_OBSERVATIONS_MAX;

const PAGE_DATA_TEMPLATE = require('../models/page_data_template');
const COLUMNS_TO_DISPLAY = require('../constants/db-cols.json');

/* Compile Data for Views */
const buildCurrent = require('../models/buildCurrent');
const buildSummary = require('../models/buildSummary');
const buildGraphs = require('../models/buildGraphs');
const buildObservationTable = require('../models/buildObservationTable');
const buildAlmanac = require('../models/buildAlmanac');
const buildSideBarData = require('../models/buildSideBarData');

const replaceInKeysWith = require('../helpers/replaceInKeysWith');

/* Requests */
const requestCurrent = require('../helpers/requestCurrent')
const requestDay = require('../helpers/requestDay')
const requestMonth = require('../helpers/requestMonth')
const requestYear = require('../helpers/requestYear')
const requestRange = require('../helpers/requestRange')
const requestDataAvailable = require('../helpers/requestDataAvailable')

/* GET home page. */
router.get('/', function (req, res) {

  var start_time = dayjs.tz(dayjs(), DEVICE_TIMEZONE).startOf('day');

  // clone data element
  var data = cloneDeep(PAGE_DATA_TEMPLATE);

  Promise.all( requestCurrent(req) ).then(function (values) {

    var rows = values[0].map(itm => replaceInKeysWith(itm, ",", ".")) || values[0];
    var summary = values[1];
    var appdata = values[2];

    // Graph Data
    data.graphs.data = buildGraphs([...COLUMNS_TO_DISPLAY, 'IAQ'], rows)

    // Date And Time
    data.datetime.sunrise = getSunriseDateTimeUtc(start_time.toDate(), appdata.latitude, appdata.longitude)
    data.datetime.sunset = getSunsetDateTimeUtc(start_time.toDate(), appdata.latitude, appdata.longitude)
    data.datetime.lunarphase = Moon.lunarPhase(start_time.toDate(), {
      hemisphere: (appdata.latitude >= 0)? Hemisphere.NORTHERN : Hemisphere.SOUTHERN,
    });
    data.datetime.period = "now"

    // Observation Table
    let observations = buildObservationTable(rows, SITE_OBSERVATIONS_MAX)
    for(let i in observations)
      observations[i] = replaceInKeysWith(observations[i] , ",", ".");
    data.table = {
      columns: ["Time", ...COLUMNS_TO_DISPLAY, 'IAQ'],
      rows: observations
    }

    // Summary
    var cards = buildCurrent(COLUMNS_TO_DISPLAY, rows) || []
    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    for(let i in cards){
      let idx = summaryTable.findIndex( itm => itm.header === cards[i].label )
      if(idx > -1){
        summaryTable[idx].trend = cards[i].trend
        summaryTable[idx].latest = cards[i].value
      }
    }
    data.subheader.cards = cards.splice(0, 4).map(item => { item.size = 'lg'; return item })
    data.summary.tableLeft = summaryTable.splice(0, 11)
    data.summary.tableRight = summaryTable.splice(0, 11)

    // Sidebar
    data = merge(data, buildSideBarData(appdata))

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: data
    })

  });

});

/* GET past day */
router.get('/:year([0-9]{4})/:month([0-9]{1,2})/:day([0-9]{1,2})', function (req, res) {

  // clone data element
  var data = cloneDeep(PAGE_DATA_TEMPLATE);

  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);
  var day = parseInt(req.params.day);
  var selectedDate = `${year}-${month}-${day}`;

  Promise.all( requestDay(req) ).then(function (values) {

    var rows = values[0].map(itm => replaceInKeysWith(itm, ",", ".")) || values[0];
    var summary = replaceInKeysWith(values[1], ",", ".") || values[1];
    var appdata = values[2];
    var almanac = values[3];

    // Graph Data
    data.graphs.data = buildGraphs([...COLUMNS_TO_DISPLAY, 'IAQ'], rows)
    
    // Date and Time
    data.datetime.sunrise = getSunriseDateTimeUtc(new Date(year, month - 1, day), appdata.latitude, appdata.longitude)
    data.datetime.sunset = getSunsetDateTimeUtc(new Date(year, month - 1, day), appdata.latitude, appdata.longitude)
    data.datetime.lunarphase = Moon.lunarPhase(new Date(year, month - 1, day), {
      hemisphere: (appdata.latitude >= 0)? Hemisphere.NORTHERN : Hemisphere.SOUTHERN,
    });
    data.datetime.period = "day"

    // Subheader
    data.subheader.almanac = buildAlmanac(almanac, "day")

    // Sumary
    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.tableLeft = summaryTable.splice(0, 11)
    data.summary.tableRight = summaryTable.splice(0, 11)

    // Sidebar
    data = merge(data, buildSideBarData(appdata, dayjs(selectedDate).format('YYYY-MM-DD')))

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

  Promise.all( requestMonth(req) ).then(function (values) {

    var rows = values[0]? values[0].map(itm => replaceInKeysWith(itm, ",", ".")) : values[0];
    var summary = replaceInKeysWith(values[1], ",", ".") || values[1];
    var appdata = values[2];
    var almanac = values[3];

    // Graph Data
    data.graphs.data = buildGraphs([...COLUMNS_TO_DISPLAY, 'IAQ'], rows)
    
    // Date and Time
    data.datetime.period = "month"

    // Subheader
    data.subheader.almanac = buildAlmanac(almanac, "month")

    //
    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.tableLeft = summaryTable.splice(0, 11)
    data.summary.tableRight = summaryTable.splice(0, 11)

    data = merge(data, buildSideBarData(appdata, dayjs(selectedDate).format('YYYY-MM')))

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

  Promise.all( requestYear(req) ).then(function (values) {

    var rows = values[0].map(itm => replaceInKeysWith(itm, ",", ".")) || values[0];
    var summary = values[1];
    var appdata = values[2];
    var almanac = values[3];

    data.graphs.data = buildGraphs([...COLUMNS_TO_DISPLAY, 'IAQ'], rows)
    data.datetime.period = "year"

    data.subheader.almanac = buildAlmanac(almanac, "year")

    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.tableLeft = summaryTable.splice(0, 11)
    data.summary.tableRight = summaryTable.splice(0, 11)

    data = merge(data, buildSideBarData(appdata, selectedDate))

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

  Promise.all( requestRange(req) ).then(function (values) {

    var rows = values[0].map(itm => replaceInKeysWith(itm, ",", ".")) || values[0];
    var summary = values[1];
    var appdata = values[2];
    var almanac = values[3];

    data.graphs.data = buildGraphs([...COLUMNS_TO_DISPLAY, 'IAQ'], rows)
    data.datetime.period = "range"

    data.subheader.almanac = buildAlmanac(almanac, "range")

    let summaryTable = buildSummary(COLUMNS_TO_DISPLAY, summary)
    data.summary.tableLeft = summaryTable.splice(0, 11)
    data.summary.tableRight = summaryTable.splice(0, 11)

    data = merge(data, buildSideBarData(appdata, range))

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: data
    })

  });

});


/* GET range */
router.get('/check/:range([0-9]{4}-[0-9]{1,2}-[0-9]{1,2},(month|year|decade|century))', function (req, res) {

  requestDataAvailable(req).then(function (values) {

    values = values.map( itm => {
      return itm.Time
    });

    res.json({
      message: `success`,
      details: `Data returned.`,
      body: values
    })

  });

});

module.exports = router;