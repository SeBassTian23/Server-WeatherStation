var express = require('express');
var router = express.Router();

const _ = require('lodash');

/* Date and Time functions */
var dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat');
var timezone = require('dayjs/plugin/timezone');
var utc = require('dayjs/plugin/utc');
var advancedFormat = require('dayjs/plugin/advancedFormat');
var { getSunriseDateTimeUtc, getSunsetDateTimeUtc } = require('suntimes');
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

/* Database */
let db = require('../database.js');

/* Models */
const linFitTrend = require('../models/trend.js');
const almanacSummary = require('../models/almanac.js');
const unitConverter = require('../models/convert.js');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const DEVICE_ID = process.env.DEVICE_ID;
const DEVICE_LATITUDE = process.env.DEVICE_LATITUDE;
const DEVICE_LONGITUDE = process.env.DEVICE_LONGITUDE;
const DEVICE_ALTITUDE = process.env.DEVICE_ALTITUDE;
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE;

const SITE_OBSERVATIONS_MAX = process.env.SITE_OBSERVATIONS_MAX;

const colors = {
  blue: "#0d6efd",
  indigo: "#6610f2",
  purple: "#6f42c1",
  pink: "#d63384",
  red: "#dc3545",
  orange: "#fd7e14",
  yellow: "#ffc107",
  green: "#198754",
  teal: "#20c997",
  cyan: "#0dcaf0",
  gray: "#adb5bd",
  black: "#000"
};

// Order of headers
const header = require('../db-cols.json');

var page_data_template = {
  title: 'Today | Weather Station',
  time: dayjs().format('LT'),
  weekday: dayjs().format('dddd'),
  month: dayjs().format('MMMM DD'),
  year: dayjs().format('YYYY'),
  range: null,
  view: 'now',
  location: {
    lat: DEVICE_LATITUDE,
    lng: DEVICE_LONGITUDE,
    alt: DEVICE_ALTITUDE
  },
  sunrise: getSunriseDateTimeUtc(new Date(), DEVICE_LATITUDE, DEVICE_LONGITUDE),
  sunset: getSunsetDateTimeUtc(new Date(), DEVICE_LATITUDE, DEVICE_LONGITUDE),
  sunriseFormated: dayjs(getSunriseDateTimeUtc(new Date(), DEVICE_LATITUDE, DEVICE_LONGITUDE)).format('LT'),
  sunsetFormated: dayjs(getSunsetDateTimeUtc(new Date(), DEVICE_LATITUDE, DEVICE_LONGITUDE)).format('LT'),
  dates: [],
  selectedDate: 'now',
  current: [],
  summary: [],
  graphs: {},
  graphOptions: [
    {
      yaxis: "Temperature [℃]",
      traces: { "Temperature [C]": { "l": "Temperature", "c": colors.red }, "Dew Point [C]": { "l": "Dew Point", "c": colors.green }, "Heat Index [C]": { "l": "Heat Index", "c": colors.orange } }
    },
    {
      yaxis: "rel. Humidity [%]",
      traces: { "rel. Humidity [%]": { "l": "rel. Humidity", "c": colors.blue } }
    },
    {
      yaxis: "Pressure [hPa]",
      traces: { "Pressure (PMSL) [hPa]": { "l": "Pressure (PMSL)", "c": colors.green } }
    },
    {
      yaxis: "Light Intensity [a.u.]",
      traces: { "Light (UV)": { "l": "UV", "c": colors.indigo }, "Light (visible)": { "l": "Visible", "c": colors.yellow }, "Light (IR)": { "l": "IR", "c": colors.red } }
    },
    {
      yaxis: "Particles [μg/m³]",
      traces: { "PM10.0 [micro g/m3]": { "l": "PM 10", "c": colors.green }, "PM2.5 [micro g/m3]": { "l": "PM 2.5", "c": colors.purple }, "PM1.0 [micro g/m3]": { "l": "PM 1", "c": colors.grey } }
    },
    {
      yaxis: "Particle Count in 0.1 L",
      traces: { "> 0.3um / 0.1L": { "l": "> 0.3", "c": colors.red }, "> 0.5um / 0.1L": { "l": "> 0.5", "c": colors.orange }, "> 1.0um / 0.1L": { "l": "> 1.0", "c": colors.yellow }, "> 2.5um / 0.1L": { "l": "> 2.5", "c": colors.green }, "> 5.0um / 0.1L": { "l": "> 5.0", "c": colors.blue }, "> 10.0um / 0.1L": { "l": "> 10.0", "c": colors.purple } }
    },
    {
      yaxis: "Index",
      traces: { "UV-Index": { "l": "UV Index", "c": colors.yellow } }
    },
    {
      yaxis: "Index",
      traces: { "AQI": { "l": "Air Quality Index", "c": colors.grey } }
    },
    {
      yaxis: "Resistance [kΩ]",
      traces: { "Air [KOhms]": { "l": "Air [kΩ]", "c": colors.teal } }
    },
    {
      yaxis: "Voltage",
      traces: { "Battery [V]": { "l": "Battery", "c": colors.grey } }
    }
  ],
  observations: [],
  download: 'latest',
  device_id: DEVICE_ID,
  battery_voltage: "N/A"
};

// Get Weather Data Summary
var querySummary = function (device_id, start_time, end_time, header) {
  var h = header.map(function (x) {
    return `AVG("${x}") AS "AVG-${x}", MIN("${x}") AS "MIN-${x}", MAX("${x}") AS "MAX-${x}"`;
  });

  var q = `SELECT "created_at" AS Time, ${h.join(",")} from data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID DESC LIMIT 1`;
  return new Promise(function (resolve, reject) {
    db.get(q, function (err, row) {
      resolve(row);
    });
  });
};

// Get Almanac
var queryAlmanac = function (device_id, start_time, end_time, header) {
  var h = header.map(function (x) {
    return `
    SELECT '${x}' as col, 'max' as type,  MAX(data.\`${x}\`) as value, created_at FROM data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}')
    UNION
    SELECT '${x}' as col, 'min' as type,  MIN(data.\`${x}\`) as value, created_at FROM data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}')
    UNION
    SELECT '${x}' as col, 'avg' as type,  AVG(data.\`${x}\`) as value, NULL FROM data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}')
    `;
  });

  var q = h.join("UNION");

  return new Promise(function (resolve, reject) {
    db.all(q, function (err, rows) {
      resolve(rows);
    });
  });
};

// Get all days with data
var queryDates = function (device_id, tz_offset) {
  q = `SELECT DISTINCT(strftime('%Y-%m-%d', datetime(created_at, '${tz_offset} hours')  )) as dates FROM data WHERE data.device_id = "${device_id}"`;
  return new Promise(function (resolve, reject) {
    db.all(q, function (err, rows) {
      rows = rows.map(function (x) {
        return x.dates;
      });
      resolve(rows);
    });
  });
};

// Application Data
var queryAppData = function (device_id) {
  var q = `SELECT 
    COUNT(ID) as measurements,
    MAX(created_at) as latest,
    MIN(created_at) as start,
    COUNT(DISTINCT(strftime('%Y-%m-%d',datetime(data.created_at)))) as days,
    (SELECT COUNT(DISTINCT(device_id)) FROM data) as devices,
    (SELECT data."Battery [V]" FROM data WHERE device_id = "${device_id}" ORDER BY rowid DESC LIMIT 1) as "Battery [V]",
    (SELECT ((page_count * page_size * 0.000001 )) as size FROM pragma_page_count(), pragma_page_size()) as dbsize
  FROM data
  WHERE device_id = "${device_id}"`;
  return new Promise(function (resolve, reject) {
    db.get(q, function (err, row) {
      resolve(row);
    });
  });
};

// Build Current Data View
var buildCurrent = function (header, rows, units) {
  var arr = [];
  var value = "N/A";
  for (i in header) {
    value = (rows[0][header[i]] === null) ? "N/A" : rows[0][header[i]];
    var obj = {
      header: header[i],
      title: formatUnit(header[i], false),
      value: (_.isNumber(_.round(value, 2))) ? _.round(value, 2) : "N/A",
      trend: function (rows, field) {
        var data = [];
        for (var r in rows)
          data.push(rows[r][header[i]]);
        var trend = linFitTrend(data.slice(0, 20).reverse());

        if (trend > 1)
          trend = "↗";
        else if (trend < -1)
          trend = "↘";
        else
          trend = null;

        if (field == "Temperature [C]") {
          if (value <= unitConverter(0, '[C]', units)[0])
            trend = "thermometer-snow text-primary";
          else if (value < unitConverter(10, '[C]', units)[0])
            trend = "thermometer-low";
          else if (value > unitConverter(35, '[C]', units)[0])
            trend = "thermometer-sun text-danger";
          else if (value > unitConverter(30, '[C]', units)[0])
            trend = "thermometer-sun text-warning";
          else if (value > unitConverter(25, '[C]', units)[0])
            trend = "thermometer-high";
          else
            trend = "thermometer-half";
        }

        if (field == "rel. Humidity [%]")
          trend = "moisture";

        if (field == "Pressure (PMSL) [hPa]")
          trend = "speedometer2";

        if (field == "Heat Index [C]") {
          if (value >= unitConverter(52, '[C]', units)[0])
            trend = "heat-index-3";
          else if (value > unitConverter(39, '[C]', units)[0])
            trend = "heat-index-2";
          else if (value > unitConverter(32, '[C]', units)[0])
            trend = "heat-index-1";
          else if (value >= unitConverter(27, '[C]', units)[0])
            trend = "heat-index-0";
        }

        return trend;
      }(rows, header[i]),
      unit: formatUnit(header[i], true),
      field: header[i]
    };

    var conv = unitConverter(obj.value, obj.unit, units);
    obj.unit = conv[1];

    arr.push(obj);
  }

  // Color temperature thermometer by heat index if it is available
  var hiIdx = arr.findIndex(function(e){ return e.header == "Heat Index [C]"; });
  var tiIdx = arr.findIndex(function(e){ return e.header == "Temperature [C]"; });
  if(hiIdx > -1 && tiIdx > -1 ){
    if( arr[hiIdx].trend && arr[hiIdx].trend.match(/heat-index/i) ){
      arr[tiIdx].trend = `thermometer-sun ${arr[hiIdx].trend}`;
    }
  }

  return arr || [];
};

// Build Weather Data Summary
var buildSummary = function (header, summary, units) {
  var arr = [];
  for (var i in header) {

    var value_avg = (summary[`AVG-${header[i]}`] === null) ? "N/A" : summary[`AVG-${header[i]}`];
    var value_min = (summary[`MIN-${header[i]}`] === null) ? "N/A" : summary[`MIN-${header[i]}`];
    var value_max = (summary[`MAX-${header[i]}`] === null) ? "N/A" : summary[`MAX-${header[i]}`];

    if (['UV-Index', 'AQI'].indexOf(header[i]) > -1) {
      value_avg = _.isNumber(value_avg) ? _.round(value_avg, 0) : "N/A";
    }

    var obj = {
      header: header[i],
      title: formatUnit(header[i], false),
      unit: formatUnit(header[i], true),
      avg: _.isNumber(value_avg) ? _.round(value_avg, 2) : "N/A",
      min: _.isNumber(value_avg) ? _.round(value_min, 2) : "N/A",
      max: _.isNumber(value_avg) ? _.round(value_max, 2) : "N/A"
    };

    obj.avg = unitConverter(obj.avg, obj.unit, units)[0];
    obj.min = unitConverter(obj.min, obj.unit, units)[0];
    obj.max = unitConverter(obj.max, obj.unit, units)[0];
    obj.unit = unitConverter(obj.avg, obj.unit, units)[1];

    arr.push(obj);
  }
  return arr || [];
};

// Build Weather Data Graphs
var buildGraphs = function (header, rows, units) {
  var obj = {};
  for (var i in rows) {
    for (var j in header) {
      if (obj[header[j]] === undefined)
        obj[header[j]] = [];
      if (rows[i][header[j]] === null || rows[i][header[j]] == "N/A")
        obj[header[j]].push({ x: rows[i].Time, y: null });
      else {
        obj[header[j]].push({ x: rows[i].Time, y: _.round(unitConverter(rows[i][header[j]], header[j], units)[0], 2) });
      }
    }
    // rows[i].Time = dayjs(rows[i].Time).format('LT');
  }
  return obj || {};
};

// Build Weather Data Observations
var buildObservationTable = function (rows, max, units) {
  var observations = rows.slice(0, max);
  for (i in observations) {
    observations[i].Time = dayjs(observations[i].Time).format('LT');
    for (j in observations[i]) {
      if (_.isNumber(observations[i][j]))
        observations[i][j] = _.round(unitConverter(observations[i][j], j, units)[0], 2);
    }
  }
  return observations || [];
};

// Set application data info
const buildAppSummary = function (data, appdata) {
  data.measurements = appdata.measurements;
  data.days = appdata.days;
  data.start = dayjs(appdata.start).tz(DEVICE_TIMEZONE).format('lll');
  data.latest = dayjs(appdata.latest).tz(DEVICE_TIMEZONE).format('lll');
  data.timezone = DEVICE_TIMEZONE;
  data.size = `${_.round(appdata.dbsize, 2)} MB`;
  data.devices = appdata.devices;
  data.battery_voltage = _.round(appdata["Battery [V]"], 2) || "N/A";
  // data.current[0].value = dayjs(rows[0].Time).format('LT');
  return data;
};

const buildAlmanac = function (data, type, units) {

  var almanac = { params: {} };

  for (var i in data) {

    if (almanac.params[data[i].col] === undefined)
      almanac.params[data[i].col] = {};

    almanac.params[data[i].col][data[i].type] = data[i].value;

    if (data[i].created_at)
      almanac.params[data[i].col][`${data[i].type}_time`] = dayjs(data[i].created_at).format('H');
    almanac.params[data[i].col][`${data[i].type}_day`] = dayjs(data[i].created_at).format('dddd, Do');
    almanac.params[data[i].col][`${data[i].type}_month`] = dayjs(data[i].created_at).format('M');
  }

  return almanacSummary(almanac, type, units);

};

// Format Units
const formatUnit = function (unit, extract) {
  if (extract) {
    if (unit.match(/\s\[.+$/)) {
      var u = unit.match(/\[(.+)\]/);
      if (u)
        return u[1].replace(/(um \/ 0.1L)/, ' μm/0.1L').replace(/micro\s?/, 'μ').replace(/m3/, 'm³').replace(/^C$/, '℃').replace(/^F$/, '℉').replace(/KOhms/, 'kΩ');
    }
    else
      return "";
  }
  else {
    return unit.replace(/\[(.+)\]/, '').replace(/\s\[.+$/, '').replace(/(um \/ 0.1L)/, ' μm/0.1L').trim();
  }
};

/* GET home page. */
router.get('/', function (req, res) {

  var units = req.cookies.unit || null;

  // clone data element
  var data = _.cloneDeep(page_data_template);

  var start_time = dayjs().startOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var end_time = dayjs().endOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var tz_offset = dayjs().tz(DEVICE_TIMEZONE).format('ZZ');
  tz_offset = `${tz_offset[0]}${(Number(tz_offset.slice(3, 5)) != 0) ? (Number(tz_offset.slice(1, 3)) + Number(tz_offset.slice(3, 5)) / 60) : Number(tz_offset.slice(1, 3))}`;

  // Get data 
  var q = `SELECT "created_at" AS Time, "${header.join("\",\"")}" from data WHERE data.device_id = "${DEVICE_ID}" AND datetime(created_at) >= datetime('${start_time}') ORDER BY ROWID DESC`;
  const q1 = new Promise(function (resolve, reject) {
    db.all(q, function (err, rows) {
      resolve(rows);
    });
  });

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_time, end_time, header);

  // Get all days with data
  const q3 = queryDates(DEVICE_ID, tz_offset);

  // Get the application data infro
  const q4 = queryAppData(DEVICE_ID);

  Promise.all([q1, q2, q3, q4]).then(function (values) {

    var rows = values[0];
    var summary = values[1];
    var dates = values[2];
    var appdata = values[3];

    if (rows !== undefined && rows.length > 0) {
      data.graphs = buildGraphs(header, rows, units);
      data.observations = buildObservationTable(rows, SITE_OBSERVATIONS_MAX, units);
      data.current = buildCurrent(header, rows, units);
      data.summary = buildSummary(header, summary, units);
    }

    data.graphs = JSON.stringify(data.graphs, null, 0);

    for (var i in data.graphOptions) {
      if (!data.graphOptions[i].yaxis.match(/\[(.+)\]/))
        continue;
      var u = formatUnit(data.graphOptions[i].yaxis, true);
      u = unitConverter(0, u, units)[1];
      data.graphOptions[i].yaxis = data.graphOptions[i].yaxis.replace(/\[(.+)\]/, `[${u}]`);
    }

    data.dates = JSON.stringify(dates, null, 0);

    data = buildAppSummary(data, appdata);
    
    if( dayjs().isSame(appdata.latest, 'day') )
      data.time = dayjs(appdata.latest).tz(DEVICE_TIMEZONE).format('LT');
    else
      data.time = "N/A";
    data.year = dayjs().tz(DEVICE_TIMEZONE).format('YYYY');
    data.weekday = dayjs().tz(DEVICE_TIMEZONE).format('dddd');
    data.month = dayjs().tz(DEVICE_TIMEZONE).format('MMMM DD');
    data.sunrise = getSunriseDateTimeUtc(new Date(), DEVICE_LATITUDE, DEVICE_LONGITUDE);
    data.sunset = getSunsetDateTimeUtc(new Date(), DEVICE_LATITUDE, DEVICE_LONGITUDE);

    res.render('index', data);
  });

});

/* GET past day */
router.get('/:year([0-9]{4})/:month([0-9]{1,2})/:day([0-9]{1,2})', function (req, res) {

  var units = req.cookies.unit || null;

  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);
  var day = parseInt(req.params.day);

  var selectedDate = `${year}-${month}-${day}`;

  // clone data element
  var data = _.cloneDeep(page_data_template);

  var start_time = dayjs(selectedDate).startOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var end_time = dayjs(selectedDate).endOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var tz_offset = dayjs().tz(`America/Detroit`).format('ZZ');
  tz_offset = `${tz_offset[0]}${(Number(tz_offset.slice(3, 5)) != 0) ? (Number(tz_offset.slice(1, 3)) + Number(tz_offset.slice(3, 5)) / 60) : Number(tz_offset.slice(1, 3))}`;

  data.title = `${selectedDate} | Weather Station`;
  data.view = 'day';
  data.year = dayjs(selectedDate).format('YYYY');
  data.weekday = dayjs(selectedDate).format('dddd');
  data.month = dayjs(selectedDate).format('MMMM DD');
  data.sunrise = getSunriseDateTimeUtc(new Date(year, month - 1, day), DEVICE_LATITUDE, DEVICE_LONGITUDE);
  data.sunset = getSunsetDateTimeUtc(new Date(year, month - 1, day), DEVICE_LATITUDE, DEVICE_LONGITUDE);
  data.selectedDate = selectedDate;
  data.download = dayjs(selectedDate).format('YYYY-MM-DD');

  var q = `SELECT "created_at" AS Time, "${header.join("\",\"")}" from data WHERE data.device_id = "${DEVICE_ID}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID DESC`;
  const q1 = new Promise(function (resolve, reject) {
    db.all(q, function (err, rows) {
      resolve(rows);
    });
  });

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_time, end_time, header);

  // Get all days with data
  const q3 = queryDates(DEVICE_ID, tz_offset);

  // Get the application data infro
  const q4 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q5 = queryAlmanac(DEVICE_ID, start_time, end_time, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4, q5]).then(function (values) {

    var rows = values[0];
    var summary = values[1];
    var dates = values[2];
    var appdata = values[3];
    var almanac = values[4];

    if (rows !== undefined && rows.length > 0) {
      data.graphs = buildGraphs(header, rows, units);
      data.current = buildCurrent(header, rows, units);
      data.summary = buildSummary(header, summary, units);
    }

    data.graphs = JSON.stringify(data.graphs, null, 0);
    for (var i in data.graphOptions) {
      if (!data.graphOptions[i].yaxis.match(/\[(.+)\]/))
        continue;
      var u = formatUnit(data.graphOptions[i].yaxis, true);
      u = unitConverter(0, u, units)[1];
      data.graphOptions[i].yaxis = data.graphOptions[i].yaxis.replace(/\[(.+)\]/, `[${u}]`);
    }

    data.dates = JSON.stringify(dates, null, 0);

    data = buildAppSummary(data, appdata);

    data.selectedDate = selectedDate;

    data.almanac = buildAlmanac(almanac, "day", units);

    res.render('index', data);
  });

});

/* GET past month */
router.get('/:year([0-9]{4})/:month([0-9]{1,2})', function (req, res) {

  var units = req.cookies.unit || null;

  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);

  var selectedDate = `${year}-${month}`;

  // clone data element
  var data = _.cloneDeep(page_data_template);

  var start_day = dayjs(selectedDate).startOf('month').tz(DEVICE_TIMEZONE).toISOString();
  var end_day = dayjs(selectedDate).endOf('month').tz(DEVICE_TIMEZONE).toISOString();
  var tz_offset = dayjs().tz(DEVICE_TIMEZONE).format('ZZ');
  tz_offset = `${tz_offset[0]}${(Number(tz_offset.slice(3, 5)) != 0) ? (Number(tz_offset.slice(1, 3)) + Number(tz_offset.slice(3, 5)) / 60) : Number(tz_offset.slice(1, 3))}`;

  data.title = `${selectedDate} | Weather Station`;
  data.month = dayjs(selectedDate).format('MMMM');
  data.year = dayjs(selectedDate).format('YYYY');
  data.view = 'month';
  data.next = dayjs(selectedDate).add(1, 'month').format('/YYYY/MM');
  data.previous = dayjs(selectedDate).subtract(1, 'month').format('/YYYY/MM');
  data.sunrise = null;
  data.sunset = null;
  data.download = dayjs(selectedDate).format('YYYY-MM');

  var q = `SELECT strftime('%Y-%m-%dT%H:00:00Z', datetime(data.created_at)) AS Time,
    ${header.map(function (x) { return `AVG( data.'${x}' ) as '${x}'`; }).join(",")}
  FROM data  
  WHERE data.device_id = "${DEVICE_ID}" AND
  datetime(created_at) BETWEEN datetime('${start_day}') AND datetime('${end_day}') 
  GROUP BY Time
  ORDER BY Time ASC`;

  const q1 = new Promise(function (resolve, reject) {
    db.all(q, function (err, rows) {
      resolve(rows);
    });
  });

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_day, end_day, header);

  // Get all days with data
  const q3 = queryDates(DEVICE_ID, tz_offset);

  // Get the application data infro
  const q4 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q5 = queryAlmanac(DEVICE_ID, start_day, end_day, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4, q5]).then(function (values) {

    var rows = values[0];
    var summary = values[1];
    var dates = values[2];
    var appdata = values[3];
    var almanac = values[4];

    if (rows !== undefined && rows.length > 0) {
      data.graphs = buildGraphs(header, rows, units);
      data.current = buildCurrent(header, rows, units);
      data.summary = buildSummary(header, summary, units);
    }

    data.graphs = JSON.stringify(data.graphs, null, 0);
    for (var i in data.graphOptions) {
      if (!data.graphOptions[i].yaxis.match(/\[(.+)\]/))
        continue;
      var u = formatUnit(data.graphOptions[i].yaxis, true);
      u = unitConverter(0, u, units)[1];
      data.graphOptions[i].yaxis = data.graphOptions[i].yaxis.replace(/\[(.+)\]/, `[${u}]`);
    }

    data.dates = JSON.stringify(dates, null, 0);

    data = buildAppSummary(data, appdata);

    data.selectedDate = selectedDate;

    data.almanac = buildAlmanac(almanac, "month", units);

    res.render('index', data);
  });


});

/* GET past year */
router.get('/:year([0-9]{4})', function (req, res) {

  var units = req.cookies.unit || null;

  var year = parseInt(req.params.year);
  var selectedDate = `${year}`;

  // clone data element
  var data = _.cloneDeep(page_data_template);

  var start_day = dayjs(selectedDate).startOf('year').tz(DEVICE_TIMEZONE).toISOString();
  var end_day = dayjs(selectedDate).endOf('year').tz(DEVICE_TIMEZONE).toISOString();
  var tz_offset = dayjs().tz(DEVICE_TIMEZONE).format('ZZ');
  tz_offset = `${tz_offset[0]}${(Number(tz_offset.slice(3, 5)) != 0) ? (Number(tz_offset.slice(1, 3)) + Number(tz_offset.slice(3, 5)) / 60) : Number(tz_offset.slice(1, 3))}`;

  data.title = `${selectedDate} | Weather Station`;
  data.month = dayjs(selectedDate).format('MMMM');
  data.year = dayjs(selectedDate).format('YYYY');
  data.view = 'year';
  data.next = dayjs(selectedDate).add(1, 'month').format('/YYYY');
  data.previous = dayjs(selectedDate).subtract(1, 'month').format('/YYYY');
  data.sunrise = null;
  data.sunset = null;
  data.download = dayjs(selectedDate).format('YYYY');

  var q = `SELECT strftime('%Y-%m-%dT00:00:00Z',datetime(data.created_at)) as Time,
    ${header.map(function (x) { return `AVG( data.'${x}' ) as '${x}'`; }).join(",")}
  FROM data  
  WHERE data.device_id = "${DEVICE_ID}" AND
  datetime(created_at) BETWEEN datetime('${start_day}') AND datetime('${end_day}') 
  GROUP BY Time
  ORDER BY Time ASC`;

  const q1 = new Promise(function (resolve, reject) {
    db.all(q, function (err, rows) {
      resolve(rows);
    });
  });

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_day, end_day, header);

  // Get all days with data
  const q3 = queryDates(DEVICE_ID, tz_offset);

  // Get the application data infro
  const q4 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q5 = queryAlmanac(DEVICE_ID, start_day, end_day, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4, q5]).then(function (values) {

    var rows = values[0];
    var summary = values[1];
    var dates = values[2];
    var appdata = values[3];
    var almanac = values[4];

    if (rows !== undefined && rows.length > 0) {
      data.graphs = buildGraphs(header, rows, units);
      data.current = buildCurrent(header, rows, units);
      data.summary = buildSummary(header, summary, units);
    }

    data.graphs = JSON.stringify(data.graphs, null, 0);
    for (var i in data.graphOptions) {
      if (!data.graphOptions[i].yaxis.match(/\[(.+)\]/))
        continue;
      var u = formatUnit(data.graphOptions[i].yaxis, true);
      u = unitConverter(0, u, units)[1];
      data.graphOptions[i].yaxis = data.graphOptions[i].yaxis.replace(/\[(.+)\]/, `[${u}]`);
    }

    data.dates = JSON.stringify(dates, null, 0);

    data = buildAppSummary(data, appdata);

    data.selectedDate = selectedDate;

    data.almanac = buildAlmanac(almanac, "year", units);

    res.render('index', data);
  });
});

/* GET range */
router.get('/:range([0-9]{4}-[0-9]{1,2}-[0-9]{1,2},[0-9]{4}-[0-9]{1,2}-[0-9]{1,2})', function (req, res) {

  var range = req.params.range.split(",");

  var units = req.cookies.unit || null;

  // clone data element
  var data = _.cloneDeep(page_data_template);

  var start_day = dayjs(range[0]).startOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var end_day = dayjs(range[1]).endOf('day').tz(DEVICE_TIMEZONE).toISOString();
  var tz_offset = dayjs().tz(DEVICE_TIMEZONE).format('ZZ');
  tz_offset = `${tz_offset[0]}${(Number(tz_offset.slice(3, 5)) != 0) ? (Number(tz_offset.slice(1, 3)) + Number(tz_offset.slice(3, 5)) / 60) : Number(tz_offset.slice(1, 3))}`;

  data.title = `${range.join(" - ")} | Weather Station`;
  data.month = dayjs(range[1]).format('MMMM');
  data.year = dayjs(range[1]).format('YYYY');
  data.view = 'range';
  data.next = dayjs(range[1]).add(1, 'month').format('/YYYY/MM');
  data.previous = dayjs(range[0]).subtract(1, 'month').format('/YYYY/MM');
  data.sunrise = null;
  data.sunset = null;
  data.download = range.join(',');

  var q = `SELECT strftime('%Y-%m-%dT00:00:00Z',datetime(data.created_at)) as Time,
    ${header.map(function (x) { return `AVG( data.'${x}' ) as '${x}'`; }).join(",")}
  FROM data  
  WHERE data.device_id = "${DEVICE_ID}" AND
  datetime(created_at) BETWEEN datetime('${start_day}') AND datetime('${end_day}') 
  GROUP BY Time
  ORDER BY Time ASC`;

  const q1 = new Promise(function (resolve, reject) {
    db.all(q, function (err, rows) {
      resolve(rows);
    });
  });

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_day, end_day, header);

  // Get all days with data
  const q3 = queryDates(DEVICE_ID, tz_offset);

  // Get the application data infro
  const q4 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q5 = queryAlmanac(DEVICE_ID, start_day, end_day, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  Promise.all([q1, q2, q3, q4, q5]).then(function (values) {

    var rows = values[0];
    var summary = values[1];
    var dates = values[2];
    var appdata = values[3];
    var almanac = values[4];

    if (rows !== undefined && rows.length > 0) {
      data.graphs = buildGraphs(header, rows, units);
      data.current = buildCurrent(header, rows, units);
      data.summary = buildSummary(header, summary, units);
    }

    data.graphs = JSON.stringify(data.graphs, null, 0);
    for (var i in data.graphOptions) {
      if (!data.graphOptions[i].yaxis.match(/\[(.+)\]/))
        continue;
      var u = formatUnit(data.graphOptions[i].yaxis, true);
      u = unitConverter(0, u, units)[1];
      data.graphOptions[i].yaxis = data.graphOptions[i].yaxis.replace(/\[(.+)\]/, `[${u}]`);
    }

    data.dates = JSON.stringify(dates, null, 0);

    data = buildAppSummary(data, appdata);

    data.selectedDate = `${range[1]}`
    data.range = `${dayjs(range[0]).format('LL')} - ${dayjs(range[1]).format('LL')}`;

    data.almanac = buildAlmanac(almanac, "range", units);

    res.render('index', data);
  });
});

module.exports = router;
