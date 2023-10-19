const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
  device_id: { 
    type: String,
    bsonType: 'string', 
    required: true,
    unique: true
  },
  description: { 
    type: String,
    bsonType: 'string',
    required: true 
  },
  latitude: {
    type: Number,
		bsonType: "decimal",
		required: true,
		minimum: -90,
		maximum: 90
	},
	longitude: {
    type: Number,
		bsonType: "decimal",
		required: true,
		minimum: -180,
		maximum: 180
	},
	altitude: {
    type: Number,
		bsonType: "number",
		required: true,
	},
  timezone: {
    type: String,
    bsonType: "string",
    required: true,
  },
  active: {
    type: Boolean,
    bsonType: 'boolean',
    default: false
  },
  default: {
    type: Boolean,
    bsonType: 'boolean',
    default: false
  },
	created_at: {
    type: Date,
    default: Date.now,
    bsonType: "timestamp",
    required: true,
  },
	updated_at: {
    type: Date,
    default: Date.now,
    bsonType: "timestamp",
    required: true,
  }
});

module.exports = mongoose.model('Device', DeviceSchema);