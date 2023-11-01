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

const requestYear = function (req) {

  var year = parseInt(req.params.year);
  var selectedDate = `${year}`;

  var start_day = dayjs.tz(dayjs(selectedDate).startOf('year').toISOString(), DEVICE_TIMEZONE);
  var end_day = dayjs.tz(dayjs(selectedDate).endOf('year').toISOString(), DEVICE_TIMEZONE);

  /* Queries */
  var query = {
    "SQLITE": `SELECT strftime('%Y-%m-%dT00:00:00Z',datetime(data.created_at)) as Time,
      ${COLUMNS_TO_DISPLAY.map(function (x) { return `AVG( data.'${x}' ) as '${x}'`; }).join(",")}
      FROM data  
      WHERE data.device_id = "${DEVICE_ID}" AND
      datetime(created_at) BETWEEN datetime('${start_day.toISOString()}') AND datetime('${end_day.toISOString()}') 
      GROUP BY Time
      ORDER BY Time ASC`,
    "MONGODB": [
      { $match: { device_id: DEVICE_ID, created_at: { $gte: start_day.toDate(), $lte: end_day.toDate() } } },
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
  }

  COLUMNS_TO_DISPLAY.forEach(el => {
    el = el.replace(/\./g, ",")
    query.MONGODB[1]['$group'][`avg${el}`] = { $avg: `$${el}` }
    query.MONGODB[2]['$project'][el] = `$avg${el}`
  });

  // Get data
  const q1 = queryData(query);

  // Get the weather data summary
  const q2 = querySummary(DEVICE_ID, start_day, end_day, COLUMNS_TO_DISPLAY);

  // Get the application data infro
  const q3 = queryAppData(DEVICE_ID);

  // Get the almanac summary
  const q4 = queryAlmanac(DEVICE_ID, start_day, end_day, ['Temperature [C]', 'rel. Humidity [%]', 'AQI'])

  return [q1, q2, q3, q4]
}

module.exports = requestYear;