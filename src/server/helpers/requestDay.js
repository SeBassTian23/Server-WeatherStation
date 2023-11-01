/* Date and Time functions */
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/* Constants */
const DEVICE_ID = process.env.DEVICE_ID;
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE;
const COLUMNS_TO_DISPLAY = require('../constants/db-cols.json');

const querySummary = require('../db/querySummary.js');
const queryAlmanac = require('../db/queryAlmanac.js');
const queryAppData = require('../db/queryAppData.js');
const queryData = require('../db/queryData.js');

const requestDay = function (req) {

  var year = parseInt(req.params.year);
  var month = parseInt(req.params.month);
  var day = parseInt(req.params.day);
  
  var selectedDate = `${year}-${month}-${day}`;
  
  var start_time = dayjs.tz(dayjs(selectedDate).startOf('day').toISOString(), DEVICE_TIMEZONE);
  var end_time = dayjs.tz(dayjs(selectedDate).endOf('day').toISOString(), DEVICE_TIMEZONE);
  
  // Data Queries
  var query = {
    "SQLITE": `SELECT "created_at" AS Time, "${COLUMNS_TO_DISPLAY.join("\",\"")}" from data WHERE data.device_id = "${DEVICE_ID}" AND datetime(created_at) BETWEEN datetime('${start_time.toISOString()}') AND datetime('${end_time.toISOString()}') ORDER BY ROWID DESC`,
    "MONGODB": [
      { $match: { device_id: DEVICE_ID, created_at: { $gte: start_time.toDate(), $lte: end_time.toDate() } } },
      { $addFields: { Time: '$created_at' } },
      { $project: { created_at: 0, _id: 0, __v: 0 } }
    ]
  };
  
  // Get data
  const q1 = queryData(query);
  
  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_time, end_time, COLUMNS_TO_DISPLAY);
  
  // Get the application data infro
  const q3 = queryAppData(DEVICE_ID);
  
  // Get the almanac summary
  const q4 = queryAlmanac(DEVICE_ID, start_time, end_time, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  return [q1, q2, q3, q4]
}

module.exports = requestDay;