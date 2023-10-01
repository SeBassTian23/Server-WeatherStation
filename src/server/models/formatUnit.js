// Format Units
const formatUnit = function (unit, extract) {
  if (extract) {
    if (unit.match(/\s\[.+$/)) {
      var u = unit.match(/\[(.+)\]/);
      if (u)
        return u[1].replace(/(um \/ 0.1L)/, ' μm/0.1L').replace(/micro\s?/, 'μ').replace(/m3/, 'm³').replace(/^C$/, '℃').replace(/^F$/, '℉').replace(/KOhms/, 'kΩ');
    }
    else
      return "";
  }
  else {
    return unit.replace(/\[(.+)\]/, '').replace(/\s\[.+$/, '').replace(/(um \/ 0.1L)/, ' μm/0.1L').trim();
  }
};

module.exports = formatUnit;