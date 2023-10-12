import {round} from 'lodash';

export const unitConversion = ( number, from, to) => {
  const units = ['C','F','K','hPa','inHg','mBar']
  return number( number )
}

// Convert units from metric into imperial
export const unitConverter = function( value, unit=null, format=null){

  // if unit and format are not available
  if( (unit === undefined || unit === null)){
    return [value, ""];
  }

  // Convert temperature from Celsius to Fahrenheit or Kelvin
  if( (unit == "℃" || unit.match(/\[C|℃\]/i) ) ){
    console.log()
    if( ['imperial', 'i'].indexOf(format) > -1 )
      return [ round(value * 1.8 + 32, 2), "℉" ];
    if( ['si'].indexOf(format) > -1 )
      return [ round(value + 273.15, 2), "K" ];
    return [ round(value, 2), "℃" ];
  }
  
  // Convert pressure from hectopascals to inches Mercury or pascals
  if( (unit == "hPa" || unit.match(/\[hPa\]/i) ) ){
    if( ['imperial', 'i'].indexOf(format) > -1 )
      return [ round(value * 0.02952998751 , 2), "inHg" ];
    if( ['si'].indexOf(format) > -1 )
      return [ round(value * 100, 2), "Pa" ];
    return [ round(value, 2), "hPa" ];
  }

  return [round(value, 2), unit]

};
