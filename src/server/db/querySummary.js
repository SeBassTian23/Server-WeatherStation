let db = require('./sqlite.js');
const Data = require('./models/data');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const replaceInKeysWith = require('../helpers/replaceInKeysWith');

const DB_TYPE = process.env.SQLITE_FILE? "SQLITE" : process.env.MONGO_CONNECTION_STRING? "MONGODB" : null || "SQLITE";

// Get Weather Data Summary
var querySummary = function (device_id, start_time, end_time, header) {

  var query;
  if(DB_TYPE == 'SQLITE'){
    var h = header.map(function (x) {
      return `AVG("${x}") AS "AVG-${x}", MIN("${x}") AS "MIN-${x}", MAX("${x}") AS "MAX-${x}"`;
    });
    query = `SELECT "created_at" AS Time, ${h.join(",")} from data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}') ORDER BY ROWID DESC LIMIT 1`;
  }

  if(DB_TYPE == 'MONGODB'){
    query = [
      {
        $match: {
          device_id: device_id,
          created_at: {
            $gte: new Date(start_time), 
            $lt: new Date(end_time)
          }
        }
      },
      {
        $group: {
          _id: null,
          "Time": {"$min": "$created_at"}, 
        }
      },
      { 
        $project: {
          "_id": 0,
          "Time": "$Time",
        }
      }
    ]

    header.forEach(itm => {
      let col = itm.replace(/\./g,',');

      query[1]['$group'][`avg-${col}`] = { $avg: `$${col}` }
      query[1]['$group'][`min-${col}`] = { $min: `$${col}` }
      query[1]['$group'][`max-${col}`] = { $max: `$${col}` }

      query[2]['$project'][`AVG-${col}`] = { $avg: `$avg-${col}` }
      query[2]['$project'][`MIN-${col}`] = { $min: `$min-${col}` }
      query[2]['$project'][`MAX-${col}`] = { $max: `$max-${col}` }
      
    });
  }

  if(DB_TYPE == 'SQLITE')
    return new Promise(function (resolve, reject) {
      db.get(query, function (err, row) {
        resolve(row);
      });
    });

  if(DB_TYPE == 'MONGODB')
    return Data.aggregate(query).then((mongo) => {
      return replaceInKeysWith(mongo[0], ",", ".");
    });

};

module.exports = querySummary;