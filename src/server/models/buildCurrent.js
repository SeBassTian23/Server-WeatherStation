
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
      trend: function (rows, field) {
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