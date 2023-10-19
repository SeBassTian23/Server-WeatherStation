const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema({
  device_id: {
    type: String,
    required: true,
    index: true
  },
	created_at: {
    type: Date,
    default: Date.now,
    bsonType: "timestamp",
    required: true,
    index: true,
  },
	"Battery [V]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Temperature [C]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"rel, Humidity [%]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Pressure [hPa]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Pressure (PMSL) [hPa]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Air [KOhms]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Light (visible)": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Light (IR)": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Light (UV)": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"UV-Index": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"PM1,0 [ug/m3]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"PM2,5 [ug/m3]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"PM10,0 [ug/m3]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	">0,3 [um/0,1L]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	">0,5 [um/0,1L]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	">1,0 [um/0,1L]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	">2,5 [um/0,1L]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	">5,0 [um/0,1L]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	">10,0 [um/0,1L]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Heat Index [C]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"Dew Point [C]": {
    type: Number,
    bsonType: 'number',
    required: false,
  },
	"AQI": {
    type: Number,
    bsonType: 'number',
    required: false,
  }
});

module.exports = mongoose.model('Data', DataSchema);