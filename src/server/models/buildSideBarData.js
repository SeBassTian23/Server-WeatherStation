/* Date and Time functions */
var dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat');
var timezone = require('dayjs/plugin/timezone');
var utc = require('dayjs/plugin/utc');
var advancedFormat = require('dayjs/plugin/advancedFormat');
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat)

const { round } = require('lodash');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const DEVICE_INACTIVITY = process.env.DEVICE_INACTIVITY;

// Source: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
function fileSizeSI(a, b, c, d, e) {
  return (b = Math, c = b.log, d = 1e3, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2)
    + ' ' + (e ? 'kMGTPEZY'[--e] + 'B' : 'Bytes')
}

// Sidebar - Device Info
const buildSideBarData = function (appdata, selectedDate = new Date()) {

  let active = dayjs(new Date()).diff(appdata.latest, 'minute');
  return {
    calendar: {
      minDate: appdata.start || new Date(),
      maxDate: appdata.latest || new Date(),
      selectedDate: selectedDate
    },
    station: {
      device: {
        "device_id": appdata.device_id,
        "description": appdata.description,
        "location": {
          "lat": appdata.latitude,
          "lng": appdata.longitude,
          "alt": appdata.altitude,
          "elevation_unit": "[m]",
          "timezone": appdata.timezone
        },
        voltage: round(appdata.battery, 2),
        active: (active > DEVICE_INACTIVITY || Number.isNaN(active)) ? false : true
      },
      statistics: {
        measurements: appdata.measurements,
        days: appdata.days,
        latest: appdata.latest || 'N/A',
        start: appdata.start || 'N/A',
        size: fileSizeSI(appdata.dbsize)
      }
    },
    datetime: {
      timezone: appdata.timezone,
      selectedDate: selectedDate
    }
  }
}

module.exports = buildSideBarData;