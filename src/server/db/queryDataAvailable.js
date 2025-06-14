if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const db = process.env.SQLITE_FILE? require('./sqlite.js') : null;
const Data = process.env.MONGO_CONNECTION_STRING? require('./models/data.js') : null;

// Get Data
var queryDataAvailable = function (query) {
  if(db)
    return new Promise(function (resolve, reject) {
      db.all(query.SQLITE, function (err, rows) {
        resolve(rows);
      });
    });
  if(Data){
    return Data.aggregate(query.MONGODB).sort({ Time: -1 }).exec().then(rows => {
      return rows;
    })
  }
};

module.exports = queryDataAvailable;
