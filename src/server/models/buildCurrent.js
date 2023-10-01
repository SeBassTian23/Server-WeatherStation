
const { isNumber, round } = require('lodash');
const replaceInKeysWith = require('../helpers/replaceInKeysWith');
const linFitTrend = require('./trend');

// Build Current Data View
const buildCurrent = function (header, rows) {
  var arr = [];
  var value = "N/A";
  if (rows.length == 0)
    return []

  for(let i in header)
    header[i] = header[i].replace(/,/, ".");

  for(let i in rows)
    rows[i] = replaceInKeysWith(rows[i], ",", ".");

  for (i in header) {
    value = (rows[0][header[i]] === null) ? "N/A" : rows[0][header[i]];
    var obj = {
      label: header[i],
      value: (isNumber(round(value, 2))) ? round(value, 2) : "N/A",
      icon: function (rows, field) {
        var data = [];
        for (var r in rows)
          data.push(rows[r][header[i]]);
        var trend = linFitTrend(data.slice(0, 20).reverse());

        if (trend > 1)
          trend = "↗";
        else if (trend < -1)
          trend = "↘";
        else
          trend = null;

        if (field == "Temperature [C]") {
          if (value <= 0)
            trend = "bi-thermometer-snow text-primary";
          else if (value < 10)
            trend = "bi-thermometer-low";
          else if (value > 35)
            trend = "bi-thermometer-sun text-danger";
          else if (value > 30)
            trend = "bi-thermometer-sun text-warning";
          else if (value > 25)
            trend = "bi-thermometer-high";
          else
            trend = "bi-thermometer-half";
        }

        if (field == "rel. Humidity [%]")
          trend = "bi-moisture";

        if (field == "Pressure (PMSL) [hPa]")
          trend = "bi-speedometer";

        if (field == "AQI")
          trend = "bi-tree-fill";

        if (field == "Heat Index [C]") {
          if (value >= 52)
            trend = "bi-exclamation-diamond-fill heat-index-3";
          else if (value > 39)
            trend = "bi-exclamation-diamond-fill heat-index-2";
          else if (value > 32)
            trend = "bi-exclamation-diamond-fill heat-index-1";
          else if (value >= 27)
            trend = "bi-exclamation-diamond-fill heat-index-0";
        }

        return trend;
      }(rows, header[i]),
    };
    arr.push(obj);
  }

  // Color temperature thermometer by heat index if it is available
  var hiIdx = arr.findIndex(function (e) { return e.label == "Heat Index [C]"; });
  var tiIdx = arr.findIndex(function (e) { return e.label == "Temperature [C]"; });
  if (hiIdx > -1 && tiIdx > -1) {
    if (arr[hiIdx].icon && arr[hiIdx].icon.match(/heat-index/i)) {
      arr[tiIdx].icon = `bi-thermometer-sun ${arr[hiIdx].icon}`;
    }
  }

  return arr || [];
};

module.exports = buildCurrent;