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

const buildAlmanac = function (data, type) {

  var almanac = { params: {}, type: type };

  for (var i in data) {

    if (almanac.params[data[i].col] === undefined)
      almanac.params[data[i].col] = {};

    almanac.params[data[i].col][data[i].type] = data[i].value;

    if (data[i].created_at)
      almanac.params[data[i].col][`${data[i].type}_time`] = dayjs(data[i].created_at).format('H');
    almanac.params[data[i].col][`${data[i].type}_day`] = dayjs(data[i].created_at).format('dddd, Do');
    almanac.params[data[i].col][`${data[i].type}_month`] = dayjs(data[i].created_at).format('M');
  }

  return almanac;
};

module.exports = buildAlmanac;