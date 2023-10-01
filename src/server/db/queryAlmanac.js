let db = require('./sqlite.js');
const Data = require('./models/data');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const DB_TYPE = process.env.SQLITE_FILE? "SQLITE" : process.env.MONGO_CONNECTION_STRING? "MONGODB" : null || "SQLITE";

const {min, max, mean } = require('lodash');

// Get Almanac
var queryAlmanac = function (device_id, start_time, end_time, header) {

  var query;

  if(DB_TYPE === 'SQLITE'){
    var h = header.map(function (x) {
      return `
      SELECT '${x}' as col, 'max' as type,  MAX(data.\`${x}\`) as value, created_at FROM data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}')
      UNION
      SELECT '${x}' as col, 'min' as type,  MIN(data.\`${x}\`) as value, created_at FROM data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}')
      UNION
      SELECT '${x}' as col, 'avg' as type,  AVG(data.\`${x}\`) as value, NULL FROM data WHERE data.device_id = "${device_id}" AND datetime(created_at) BETWEEN datetime('${start_time}') AND datetime('${end_time}')
      `;
    });
    query = h.join("UNION");
  }

  if(DB_TYPE === 'MONGODB')
    query = {
      device_id, 
      created_at: {
        $gte: new Date(start_time),
        $lt: new Date(end_time)
      }
    }

  if(DB_TYPE === 'SQLITE')
    return new Promise(function (resolve, reject) {
      db.all(query, function (err, rows) {
        resolve(rows);
      });
    });

  if(DB_TYPE === 'MONGODB')
    return Data.find(query, [...header, ...['created_at']].map(itm=>itm.replace(/\./g,','))).then((mongo) => {
      
      let data = {
        created_at: []
      }
      for(let h in header){
        data[header[h]] = []
      }

      for(let i in mongo){
        for(let h in header){
          data[header[h]].push(mongo[i][header[h].replace(/\./g, ',')] || null )
        }
        data['created_at'].push(mongo[i]['created_at'] || null )
      }

      let output = []
      for(let i in header){
        // Average value
        output.push({
          col: header[i],
          type: 'avg',
          value: mean(data[header[i]]),
          created_at: null
        })
        // Minimum value
        let minimum = min(data[header[i]])
        let minimumIdx = data[header[i]].findIndex(itm => itm === minimum)
        output.push({
          col: header[i],
          type: 'min',
          value: minimum,
          created_at: data['created_at'][minimumIdx] || null
        })
        // Maximum value
        let maximum = max(data[header[i]])
        let maximumIdx = data[header[i]].findIndex(itm => itm === maximum)
        output.push({
          col: header[i],
          type: 'max',
          value: maximum,
          created_at: data['created_at'][maximumIdx] || null
        })
      }
      return output;
    });

};

module.exports = queryAlmanac;
