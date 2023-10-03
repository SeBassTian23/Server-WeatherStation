const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = process.env.SQLITE_FILE || "./db.sqlite";
const DEVICE_ID = process.env.DEVICE_ID || "Placeholder";
const DEVICE_DESCRIPTION = process.env.DEVICE_DESCRIPTION || "Greenwich, UK";
const DEVICE_LATITUDE = process.env.DEVICE_LATITUDE || 51.4825766;
const DEVICE_LONGITUDE = process.env.DEVICE_LONGITUDE || 0;
const DEVICE_ALTITUDE = process.env.DEVICE_ALTITUDE || 6;
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE || "UTC";

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
                    console.log('Empty Database, creating from schema.');
                    let query = fs.readFileSync('./src/server/db/sql/db.sql', 'utf8') || "";
                    db.exec(query, ()=> {
                      // Add Initial Device
                      query = `BEGIN TRANSACTION;\n`
                      query += `INSERT INTO "devices" ("device_id","description","latitude","longitude","altitude","timezone","default","created_at","updated_at")`
                      query += ` VALUES `
                      query += `('${DEVICE_ID}','${DEVICE_DESCRIPTION}',${DEVICE_LATITUDE},${DEVICE_LONGITUDE},${DEVICE_ALTITUDE},'${DEVICE_TIMEZONE}',1, '${new Date().toISOString()}','${new Date().toISOString()}');\n`
                      query += `COMMIT;`
                      db.exec(query, ()=> {
                        console.log('Initial Device Added.');
                      });
                    });

                }
                // TODO: Add mechanism to allow database updates here.
                else{
                    console.log('Tables found, DB initialized already.');
                    db.all(`SELECT * FROM devices`, function (err, rows) {

                      // List devices found
                      console.log('Devices found:', rows.length);
                      
                      // Check if for new/updated device
                      let defaultDevice = rows.findIndex((el)=>{ return el.device_id == DEVICE_ID });
                      if( defaultDevice > -1 ){

                        // If Device is default
                        if(rows[defaultDevice].default == 1)
                          console.log('Default Device:', rows[defaultDevice].device_id, rows[defaultDevice].description);
                        
                        // If Device is not default
                        else{
                          let query = `UPDATE "devices" SET "default"=0;`
                          query += `UPDATE "devices" SET "default"=1 WHERE "ID" = ${rows[defaultDevice].ID}`
                          db.exec(query,()=>{
                            console.log('Set as Default:', rows[defaultDevice].device_id, rows[defaultDevice].description)
                          })
                        }
                      }
                      
                      // If the device doesn't exist
                      else{
                        db.exec(`UPDATE "devices" SET "default"=0`, () => {
                          let query = `BEGIN TRANSACTION;\n`
                          query += `INSERT INTO "devices" ("device_id","description","latitude","longitude","altitude","timezone","default","created_at","updated_at")`
                          query += ` VALUES `
                          query += `('${DEVICE_ID}','${DEVICE_DESCRIPTION}',${DEVICE_LATITUDE},${DEVICE_LONGITUDE},${DEVICE_ALTITUDE},'${DEVICE_TIMEZONE}',1, '${new Date().toISOString()}','${new Date().toISOString()}');\n`
                          query += `COMMIT;`
                          db.exec(query, ()=> {
                            console.log('Device added as default',DEVICE_ID, DEVICE_DESCRIPTION);
                          });
                        });
                      }
                    });
                }
            }
        });
    });
};

module.exports = db;