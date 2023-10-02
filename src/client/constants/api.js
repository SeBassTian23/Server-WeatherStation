export const apiStructure = {
  "graphs": {
  },
  "subheader": {
      "almanac": {},
      "cards": []
  },
  "summary": {
      "download": "#",
      "period": "day",
      "table": {
          "left": [],
          "right": []
      },
      "cards": []
  },
  "sidebar": {
      "calendar": {
          "minDate": new Date(),
          "maxDate": new Date(),
          "currentDate": new Date(),
          "selectedDate": `${new Date().getFullYear()}-${new Date().getDate()}-${new Date().getDay()+1}`
      },
      "station": {
          "device": {
              "device_id": "N/A",
              "description": "N/A",
              "location": {
                  "lat": 0,
                  "lng": 0,
                  "alt": 0,
                  "elevation_unit": "Altitude [m]",
                  "timezone": "UTC"
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
}