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
                    var query = initQuery(header);
                    db.exec(query);
                }
                else{
                    console.log('Tables found, DB initialized already.');
                }
            }
        });
    });
};

const initQuery = function(cols){
    return `
CREATE TABLE "data" (
    "ID"	INTEGER UNIQUE,
${cols.map(function(col){
    return `    "${col}"\tNUMERIC DEFAULT NULL`;
}).join(',\n')},
    PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE INDEX "data_idx" ON "data" (
    "created_at"	ASC
);
CREATE INDEX "device_id_idx" ON "data" (
    "device_id"	ASC
);
CREATE INDEX "list_idx" ON "data" (
    "device_id"	DESC,
    "created_at"	DESC
);`;
};

// db.on('trace', (data) => {
//   console.log(data)
// });

module.exports = db;