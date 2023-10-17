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
        traces: { "Temperature [C]": { "l": "Temperature", "c": colors.red }, "Dew Point [C]": { "l": "Dew Point", "c": colors.green }, "Heat Index [C]": { "l": "Heat Index", "c": colors.orange } }
      },
      {
        yaxis: "rel. Humidity [%]",
        traces: { "rel. Humidity [%]": { "l": "rel. Humidity", "c": colors.blue } }
      },
      {
        yaxis: "Pressure [hPa]",
        traces: { "Pressure (PMSL) [hPa]": { "l": "Pressure (PMSL)", "c": colors.green } }
      },
      {
        yaxis: "Light Intensity [a.u.]",
        traces: { "Light (UV)": { "l": "UV", "c": colors.indigo }, "Light (visible)": { "l": "Visible", "c": colors.yellow }, "Light (IR)": { "l": "IR", "c": colors.red } }
      },
      {
        yaxis: "Particles [μg/m³]",
        traces: { "PM10.0 [ug/m3]": { "l": "PM 10", "c": colors.green }, "PM2.5 [ug/m3]": { "l": "PM 2.5", "c": colors.purple }, "PM1.0 [ug/m3]": { "l": "PM 1", "c": colors.grey } }
      },
      {
        yaxis: "Particle Count in 0.1 L",
        traces: { ">0.3 um/0.1L": { "l": ">0.3", "c": colors.red }, ">0.5 um/0.1L": { "l": ">0.5", "c": colors.orange }, ">1.0 um/0.1L": { "l": ">1.0", "c": colors.yellow }, ">2.5 um/0.1L": { "l": ">2.5", "c": colors.green }, ">5.0 um/0.1L": { "l": ">5.0", "c": colors.blue }, ">10.0 um/0.1L": { "l": ">10.0", "c": colors.purple } }
      },
      {
        yaxis: "Index",
        traces: { "UV-Index": { "l": "UV Index", "c": colors.yellow } }
      },
      {
        yaxis: "Index",
        traces: { "AQI": { "l": "Air Quality Index", "c": colors.grey } }
      },
      {
        yaxis: "Resistance [kΩ]",
        traces: { "Air [KOhms]": { "l": "Air [kΩ]", "c": colors.teal } }
      },
      {
        yaxis: "Voltage",
        traces: { "Battery [V]": { "l": "Battery", "c": colors.grey } }
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