const {round} = require('lodash')

// Build Weather Data Graphs
const buildGraphs = function (header, rows) {
  var obj = {};
  for (var i in rows) {
    for (var j in header) {
      if (obj[header[j]] === undefined)
        obj[header[j]] = [];
      if (rows[i][header[j]] === null || rows[i][header[j]] == "N/A")
        obj[header[j]].push({ x: rows[i].Time, y: null });
      else {
        obj[header[j]].push({ x: rows[i].Time, y: round(rows[i][header[j]], 2) });
      }
    }
  }
  return obj || {};
};

module.exports = buildGraphs;