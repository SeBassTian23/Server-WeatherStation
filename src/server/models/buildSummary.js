// Build Weather Data Summary

const {isNumber,round} = require('lodash');
const formatUnit = require('./formatUnit');
const replaceInKeysWith = require('../helpers/replaceInKeysWith');

const buildSummary = function (header, summary) {
  var arr = [];

  if (!summary || !summary.Time)
    return arr

  for (var i in header) {

    var value_avg = (summary[`AVG-${header[i]}`] === null) ? "N/A" : summary[`AVG-${header[i]}`];
    var value_min = (summary[`MIN-${header[i]}`] === null) ? "N/A" : summary[`MIN-${header[i]}`];
    var value_max = (summary[`MAX-${header[i]}`] === null) ? "N/A" : summary[`MAX-${header[i]}`];

    if (['UV-Index', 'AQI'].indexOf(header[i]) > -1) {
      value_avg = isNumber(value_avg) ? round(value_avg, 0) : "N/A";
    }

    var obj = {
      header: header[i],
      title: formatUnit(header[i], false),
      unit: formatUnit(header[i], true),
      avg: isNumber(value_avg) ? round(value_avg, 2) : "N/A",
      min: isNumber(value_avg) ? round(value_min, 2) : "N/A",
      max: isNumber(value_avg) ? round(value_max, 2) : "N/A"
    };

    obj = replaceInKeysWith(obj, ",", ".");
    arr.push(obj);
  }
  return arr || [];
};

module.exports = buildSummary;