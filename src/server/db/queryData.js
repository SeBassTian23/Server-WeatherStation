let db = require('./sqlite.js');
const Data = require('./models/data');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const DB_TYPE = process.env.SQLITE_FILE? "SQLITE" : process.env.MONGO_CONNECTION_STRING? "MONGODB" : null || "SQLITE";

// Get Data
var queryData = function (query) {
  if(DB_TYPE === 'SQLITE')
    return new Promise(function (resolve, reject) {
      db.all(query, function (err, rows) {
        resolve(rows);
      });
    });
  if(DB_TYPE === 'MONGODB')
    return Data.aggregate(query).sort({ Time: -1 }).exec();
};

module.exports = queryData;
