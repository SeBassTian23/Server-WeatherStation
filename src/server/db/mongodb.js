const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const Devices = require('../db/models/device');

const URI = process.env.MONGO_CONNECTION_STRING

const DEVICE_ID = process.env.DEVICE_ID || "Placeholder";
const DEVICE_DESCRIPTION = process.env.DEVICE_DESCRIPTION || "Greenwich, UK";
const DEVICE_LATITUDE = process.env.DEVICE_LATITUDE || 51.4825766;
const DEVICE_LONGITUDE = process.env.DEVICE_LONGITUDE || 0;
const DEVICE_ALTITUDE = process.env.DEVICE_ALTITUDE || 6;
const DEVICE_TIMEZONE = process.env.DEVICE_TIMEZONE || "UTC";

const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    initializeDB();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

const initializeDB = async () => {

  const Request = await Devices.find({device_id: DEVICE_ID}).countDocuments();

  // Device not found, create a new device and 
  if(!Request || Request === 0){
    const device = new Devices({
      device_id: DEVICE_ID,
      description: DEVICE_DESCRIPTION,
      latitude: DEVICE_LATITUDE,
      longitude: DEVICE_LONGITUDE,
      altitude: DEVICE_ALTITUDE,
      timezone: DEVICE_TIMEZONE,
      active: true,
      default: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    device.save();
    console.log('Initial Device Added.');
  }
  else{
    console.log('Collection found, DB initialized already.');
    
    // List devices found
    const rows = await Devices.find({device_id: DEVICE_ID});
    console.log('Devices found:', rows.length);

    // Check if for new/updated device
    let defaultDevice = rows.findIndex((el)=>{ return el.device_id == DEVICE_ID });
    if( defaultDevice > -1 ){

      // If Device is default
      if(rows[defaultDevice].default)
        console.log('Default Device:', rows[defaultDevice].device_id, rows[defaultDevice].description);
      
      // If Device is not default
      else{
        await Devices.updateMany({ device_id: { $ne: DEVICE_ID } }, { $set: { "default" : false } });

        await Devices.updateOne({ device_id: DEVICE_ID }, {
          description: DEVICE_DESCRIPTION,
          latitude: DEVICE_LATITUDE,
          longitude: DEVICE_LONGITUDE,
          altitude: DEVICE_ALTITUDE,
          timezone: DEVICE_TIMEZONE,
          active: true,
          default: true,
          updated_at: new Date()
        });

      }
    }
    else {
      // Create a new device
      await Devices.updateMany({ device_id: { $ne: DEVICE_ID } });

      const device = new Devices({
        device_id: DEVICE_ID,
        description: DEVICE_DESCRIPTION,
        latitude: DEVICE_LATITUDE,
        longitude: DEVICE_LONGITUDE,
        altitude: DEVICE_ALTITUDE,
        timezone: DEVICE_TIMEZONE,
        active: true,
        default: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      device.save();
      console.log('Device added as default',DEVICE_ID, DEVICE_DESCRIPTION);   
    }

  }

}

module.exports = connectDB;