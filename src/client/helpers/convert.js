const _ = require('lodash');

// Convert units from metric into imperial
export const unitConverter = function( value, unit, format){

  // console.log( format )

  if( (format === undefined || format === null) && unit === undefined){
    return [value, ""];
  }
  if( (unit == "℃" || unit.match(/\[C\]/i) ) && format == "i" && value != "N/A" ){
    return [ _.round(value * 1.8 + 32, 2), "℉" ];
  }
  else if( (unit == "hPa" || unit.match(/\[hPa\]/i)) && format == "i" && value != "N/A" ){
    return [ _.round(value * 0.02952998751 , 2), "inHg" ];
  }
  else{
    return [value, unit];
  }
};
