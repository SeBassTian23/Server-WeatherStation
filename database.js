if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = process.env.DATABASE_FILE;

const header = require("./db-cols.json");

let db = new sqlite3.cached.Database(DBSOURCE, function(err){
  if (err) {
    console.error( err.message );
    throw err;
  }
  else {
    console.log('Connected to the SQlite database.');
    initializeDB();
  }
});

const initializeDB = function(){
    db.serialize(function() {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='data';`, function(err, row){
            if(err){
                throw(err.message);
            }
            else{
                if(row === undefined){
                    console.log('Empty Database, creating Tables.');
                    var query = jetpack.read('./db.sql') || "";
                    db.exec(query);
                }
                else{
                    console.log('Tables found, DB initialized already.');
                }
            }
        });
    });
};

module.exports = db;