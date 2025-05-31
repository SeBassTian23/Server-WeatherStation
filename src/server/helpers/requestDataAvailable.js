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

const queryDataAvailable = require('../db/queryDataAvailable.js');

const requestDataAvailable = function (req) {

  var range = req.params.range.split(",");

  var start_day = dayjs.tz(dayjs(range[0]).startOf(range[1]).toISOString(), DEVICE_TIMEZONE);
  var end_day = dayjs.tz(dayjs(range[0]).endOf(range[1]).toISOString(), DEVICE_TIMEZONE);

  let groupBy = '%Y-%m-%d';
  if( dayjs(end_day).diff(dayjs(start_day), 'day') > 60 )
    groupBy = '%Y-%m-%d';

  if( range[1] == "month" ){
    start_day = start_day.subtract(6, 'days')
    end_day = end_day.add(6, 'days')
  }

  if( range[1] == "year" ){
    groupBy = '%Y-%m';
  }

  if( range[1] == "decade" ){
    end_day = end_day.add(9, 'years')
    groupBy = '%Y';
  }

  if( range[1] == "century" ){
    end_day = end_day.add(99, 'years')
    groupBy = '%Y';
  }

  var query = {
    "SQLITE": `SELECT DISTINCT(strftime('${groupBy}', datetime(data.created_at))) as Time
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
            hour: { $hour: "$created_at" }
          }
        }
      },
      {
        $project: {
          _id: 0,
          Time: {
            $dateToString: {
              format: groupBy,
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
  }

  // Get Data
  return queryDataAvailable(query)
}

module.exports = requestDataAvailable;