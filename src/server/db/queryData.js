/* IAQ */
const IAQ = require('iaq');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const db = process.env.SQLITE_FILE? require('./sqlite.js') : null;
const Data = process.env.MONGO_CONNECTION_STRING? require('./models/data') : null;

// Get Data
var queryData = function (query) {
  if(db)
    return new Promise(function (resolve, reject) {
      db.all(query.SQLITE, function (err, rows) {

        rows = rows.forEach(row => {
          let iaq = new IAQ(row['Air [KOhms]'], row['rel. Humidity [%]']);
          row['IAQ'] = iaq.values().iaqScore
          return row
        })

        resolve(rows);
      });
    });
  if(Data){
    return Data.aggregate(query.MONGODB).sort({ Time: -1 }).exec().then(rows => {
      rows = rows.map(row=>{
        // Gas resistance needs to be converted to Ohm to work properly
        let iaq = new IAQ(row['Air [KOhms]']*1000, row['rel, Humidity [%]']);
        row['IAQ'] = iaq.values().iaqScore || null
        return row;
      })
      return rows;
    })
  }
};

module.exports = queryData;
