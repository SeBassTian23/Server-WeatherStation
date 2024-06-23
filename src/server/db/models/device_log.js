const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeviceLogSchema = new Schema({
  device_id: {
    type: String,
    bsonType: 'string', 
    required: true,
    index: true
  },
  log_type: {
    type: String,
    bsonType: 'string',
    required: true,
    enum: ['log', 'info', 'warn','error'],
    index: true
  },
	message: {
    type: String,
    bsonType: 'string',
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
    bsonType: "timestamp",
    required: true
  }
});

module.exports = mongoose.model('DeviceLog', DeviceLogSchema);