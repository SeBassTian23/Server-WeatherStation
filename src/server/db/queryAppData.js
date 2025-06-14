if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const db = process.env.SQLITE_FILE? require('./sqlite.js') : null;
const Data = process.env.MONGO_CONNECTION_STRING? require('./models/data') : null;
const Device = process.env.MONGO_CONNECTION_STRING? require('./models/device') : null;

const COLUMNS_TO_DISPLAY = require('../constants/db-cols.json');

// Application Data
var queryAppData = function (device_id) {
  var query;

  if (db)
    query = `SELECT 
      devices.device_id,
      devices.description,
      devices.latitude,
      devices.longitude,
      devices.altitude,
      devices.timezone,
      COUNT(data.ID) as measurements,
      MAX(data.created_at) as latest,
      MIN(data.created_at) as start,
      COUNT(DISTINCT(strftime('%Y-%m-%d',datetime(data.created_at)))) as days,
      COALESCE((SELECT data."Battery [V]" FROM data WHERE data.device_id = "${device_id}" ORDER BY rowid DESC LIMIT 1), 'N/A') as battery,
      (SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()) as dbsize
      FROM devices
      LEFT JOIN data ON devices.device_id = data.device_id
      WHERE devices.device_id = "${device_id}"`

  if (Data && Device)
    query = [
      {
        $match: {
          device_id
        }
      },
      {
        $lookup: {
          from: 'datas',
          let: { device_id: '$device_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$device_id', '$$device_id']
                }
              }
            },
            {
              $group: {
                _id: null,
                measurements: { $sum: 1 },
                latest: { $max: '$created_at' },
                start: { $min: '$created_at' },
                days: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } } },
                battery: { $last: '$Battery [V]' },
                // dbsize: {
                //   $sum: {
                //     $strLenCP: {
                //       $concat: [
                //         { $toString: '$_id' },
                //         '$device_id',
                //         { $toString: '$created_at' },
                //         { $toString: '$Battery [V]' },
                //         { $toString: '$Temperature [C]' },
                //         { $toString: '$rel, Humidity [%]' },
                //         { $toString: '$Pressure [hPa]' },
                //         { $toString: '$Pressure (PMSL) [hPa]' },
                //         { $toString: '$Air [KOhms]' },
                //         { $toString: '$Light (visible)' },
                //         { $toString: '$Light (IR)' },
                //         { $toString: '$Light (UV)' },
                //         { $toString: '$UV-Index' },
                //         { $toString: '$PM1,0 [ug/m3]' },
                //         { $toString: '$PM2,5 [ug/m3]' },
                //         { $toString: '$PM10,0 [ug/m3]' },
                //         { $toString: '$>0,3 [um/0,1L]' },
                //         { $toString: '$>0,5 [um/0,1L]' },
                //         { $toString: '$>1,0 [um/0,1L]' },
                //         { $toString: '$>2,5 [um/0,1L]' },
                //         { $toString: '$>5,0 [um/0,1L]' },
                //         { $toString: '$>10,0 [um/0,1L]' },
                //         { $toString: '$Heat Index [C]' },
                //         { $toString: '$Dew Point [C]' },
                //         { $toString: '$AQI' }

                //       ]
                //     }
                //   }
                // }
              }
            }
          ],
          as: 'data'
        }
      },
      {
        $project: {
          _id: 0,
          device_id: 1,
          description: 1,
          latitude: 1,
          longitude: 1,
          altitude: 1,
          timezone: 1,
          measurements: { $arrayElemAt: ['$data.measurements', 0] },
          latest: { $arrayElemAt: ['$data.latest', 0] },
          start: { $arrayElemAt: ['$data.start', 0] },
          days: { $size: { "$ifNull": [ { $arrayElemAt: ['$data.days', 0] }, [] ] } },
          battery: { $arrayElemAt: ['$data.battery', 0] },
          dbsize: null
        }
      }
    ]

  if (db)
    return new Promise(function (resolve, reject) {
      db.get(query, function (err, row) {
        row.db_type = "SQLite";
        resolve(row);
      });
    });

  if (Data && Device){
    return Data.aggregate([
      {
        $collStats:
          {
            storageStats: { scale: 1 },
          }
      },
      {
          $project: {
           dbsize: '$storageStats.storageSize' 
          }
      }
    ]).then(size=>{
      return Device.aggregate(query)
      .then(data => {
        return {...data[0], ...size[0], ...{db_type: "MongoDB"}}
      });
    })
  }
};

module.exports = queryAppData;
