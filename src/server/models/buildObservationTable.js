const {round, isNumber} = require('lodash');

// Build Weather Data Observations
const buildObservationTable = function (rows, max) {
  var observations = rows.slice(0, max);
  for (i in observations) {
    for (j in observations[i]) {
      if (isNumber(observations[i][j]))
        observations[i][j] = round(observations[i][j], 2);
    }
  }
  return observations || [];
};

module.exports = buildObservationTable;