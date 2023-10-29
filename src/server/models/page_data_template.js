if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const DEVICE_ID = process.env.DEVICE_ID;

const colors = {
  blue: "#0d6efd",
  indigo: "#6610f2",
  purple: "#6f42c1",
  pink: "#d63384",
  red: "#dc3545",
  orange: "#fd7e14",
  yellow: "#ffc107",
  green: "#198754",
  teal: "#20c997",
  cyan: "#0dcaf0",
  gray: "#adb5bd",
  black: "#000"
};

const PAGE_DATA_TEMPLATE = {
  "graphs": {
    "options": [
      {
        yaxis: "Temperature [℃]",
        traces: {
          "Temperature [C]": { "l": "Temperature", "c": colors.red, fill: true },
          "Dew Point [C]": { "l": "Dew Point", "c": colors.green, fill: false },
          "Heat Index [C]": { "l": "Heat Index", "c": colors.orange, fill: false }
        },
        min: null,
        max: null
      },
      {
        yaxis: "rel. Humidity [%]",
        traces: { "rel. Humidity [%]": { "l": "rel. Humidity", "c": colors.blue, fill: true } },
        min: 0,
        max: 100
      },
      {
        yaxis: "Pressure [hPa]",
        traces: { "Pressure (PMSL) [hPa]": { "l": "Pressure (PMSL)", "c": colors.green, fill: true } },
        min: null,
        max: null
      },
      {
        yaxis: "Light Intensity [a.u.]",
        traces: {
          "Light (UV)": { "l": "UV", "c": colors.indigo, fill: false },
          "Light (visible)": { "l": "Visible", "c": colors.yellow, fill: false },
          "Light (IR)": { "l": "IR", "c": colors.red, fill: false }
        },
        min: null,
        max: null
      },
      {
        yaxis: "Particles [μg/m³]",
        traces: {
          "PM10.0 [ug/m3]": { "l": "PM10", "c": colors.green, fill: false },
          "PM2.5 [ug/m3]": { "l": "PM2.5", "c": colors.purple, fill: false },
          "PM1.0 [ug/m3]": { "l": "PM1.0", "c": colors.grey, fill: false }
        },
        min: null,
        max: null
      },
      {
        yaxis: "Particle Count in 0.1 L",
        traces: {
          ">0.3 [um/0.1L]": { "l": ">0.3", "c": colors.red, fill: false },
          ">0.5 [um/0.1L]": { "l": ">0.5", "c": colors.orange, fill: false },
          ">1.0 [um/0.1L]": { "l": ">1.0", "c": colors.yellow, fill: false },
          ">2.5 [um/0.1L]": { "l": ">2.5", "c": colors.green, fill: false },
          ">5.0 [um/0.1L]": { "l": ">5.0", "c": colors.blue, fill: false },
          ">10.0 [um/0.1L]": { "l": ">10.0", "c": colors.purple, fill: false }
        },
        min: null,
        max: null
      },
      {
        yaxis: "UV Index",
        traces: { "UV-Index": { "l": "UV Index", "c": colors.yellow, fill: true } },
        min: 0,
        max: 12
      },
      {
        yaxis: "Air Quality Index",
        traces: {
          "AQI": { "l": "PM2.5 & PM10", "c": colors.grey, fill: true },
          "IAQ": { "l": "VOC", "c": colors.blue, fill: false }
        },
        min: 0,
        max: null
      },
      {
        yaxis: "Resistance [kΩ]",
        traces: { "Air [KOhms]": { "l": "Air [kΩ]", "c": colors.teal, fill: true } },
        min: 0,
        max: null
      },
      {
        yaxis: "Voltage",
        traces: { "Battery [V]": { "l": "Battery", "c": colors.grey, fill: true } },
        min: 3.5,
        max: 4.5
      }
    ],
    "data": [],
    "sunrise": null,
    "sunset": null,
    "period": "now"
  },
  "subheader": {
    "almanac": "",
    "cards": []
  },
  "summary": {
    "download": "latest",
    "period": "now",
    "table": {
      "left": [],
      "right": []
    },
    "cards": []
  },
  "sidebar": {
    "calendar": {
      "minDate": null,
      "maxDate": null,
      "currentDate": null,
      "selectedDate": null
    },
    "station": {
      "device": {
        "device_id": DEVICE_ID,
        "description": "N/A",
        "location": {
          "lat": null,
          "lng": null,
          "alt": null,
          "elevation_unit": "Altitude [m]",
          "timezone": null
        },
        "voltage": "N/A",
        "active": false
      },
      "statistics": {
        "measurements": "N/A",
        "days": "N/A",
        "latest": "N/A",
        "start": "N/A",
        "size": "N/A"
      }
    }
  }
};

module.exports = PAGE_DATA_TEMPLATE;