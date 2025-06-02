import React from 'react'
import {unitConverter} from './convert'
import {aqi} from '../constants/parameters'

// 
export const periodToStr = function(type){
  // Day
  if( type == "day")
     return `This day`;
      
  // Month
  if( type == "month")
    return `This month`;

  // Year
  if( type == "year")
    return `This year`;

  // Year
  if( type == "range")
    return `This time period`;
}

// Parts of the Day
export const timeToStr = function( input, type ){

    var str = input;

    const times = {
        "day": {
            "night": [0,2],
            "late night": [2,5],
            "early morning": [5,8],
            "morning": [8,11],
            "late morning": [11,12],
            "early afternoon": [12,14],
            "afternoon": [14,16],
            "late afternoon": [16,17],
            "early evening": [17,19],
            "evening": [19,21],
            "early night": [21,24]
        }
    };

    if( times[type] === undefined)
        return str;

    for( var phrase in times[type] ){
        if( input !== null && input <= times[type][phrase][1] ){
            return phrase;
        }
    }
    return str;
};

export const temperatureToStr = function( data, type, units='metric' ){

    var str = "N/A";

    const temperature = {
        "extremely cold": [-Infinity, -18],
        "very cold": [-18, 0],
        "cold": [0, 10],
        "cool": [10, 16],
        "mild": [16, 20],
        "moderate": [20, 26],
        "warm": [26, 30],
        "hot": [30, 35],
        "very hot": [35, 40],
        "extremely hot": [40, 46],
        "scorching": [46, Infinity]
    };

    var min = unitConverter(data.min, "[C]", units);
    var max = unitConverter(data.max, "[C]", units);
    var avg = unitConverter(data.avg, "[C]", units);

    return (
      <>
        <strong>{valueAsWords(data.avg, temperature)}</strong>
        {(type == "day" && (data.max - data.min) > 10 ) && <>
            {' '}with temperatures between {min}
            {' '}in the <strong>{timeToStr(data.min_time, type)}</strong> and {max}
            {' '}in the <strong>{timeToStr(data.max_time, type)}</strong>
        </>}
        {(type == "month" && (data.max - data.min) > 10 ) && <>
            {' '}with temperatures between {min}
            {' '}on <strong>{timeToStr(data.min_day, type)}</strong> and {max}
            {' '}on <strong>{timeToStr(data.max_day, type)}</strong>
        </>}
        {(type !== "month" && type !== "day" ) && <> with an average temperature of {avg}</>}
      </>
    );
};

export const humidityToStr = function( data, type, units ){
     
    var humidity = {
        "low": [0,30],
        "medium": [30,50],
        "high": [51,100]
    };
    
    return (
        <>
          <strong>{valueAsWords(data.avg, humidity)}</strong>
          {(type == "day" && valueAsWords(data.avg, humidity) === 'low' ) && <> with a minimum of {data.min? data.min.toFixed(0) : data.min}%</>}
          {(type == "day" && valueAsWords(data.avg, humidity) === 'medium' ) && <> at an average of {data.avg? data.avg.toFixed(0) : data.avg}%</>}
          {(type == "day" && valueAsWords(data.avg, humidity) === 'high' ) && <> with a maximum of {data.max? data.max.toFixed(0) : data.max}%</>}
          {(type == "month" ) && <> ({data.avg? data.avg.toFixed(0) : data.avg}%)</>}
        </>
      );
};

export const airqualityToStr = function( data, type, units ){

    const airquality = {};
    for (let item of aqi.items) {
        airquality[item.title.toLowerCase()] = item.range; 
    }
    
    return (
        <>
          <strong>{valueAsWords(data.avg? data.avg.toFixed(0) : data.avg, airquality)}</strong>
          {(type == "day" && valueAsWords(data.max, airquality) !== valueAsWords(data.avg, airquality) ) && <> reaching <strong>{valueAsWords(data.max, airquality)}</strong> levels in the <strong>{timeToStr(data.max_time, type)}</strong></>}
          {(type == "month" ) && <> reaching <strong>{valueAsWords(data.max, airquality)}</strong> levels on <strong>{data.max_day}</strong></>}
        </>
      );
};

export const almanacSummary = function( data, type, units ){

    var str;
    var temperaturestr = temperatureToStr(data.params["Temperature [C]"], type, units );
    var humiditystr = humidityToStr(data.params["rel. Humidity [%]"], type, units );
    var aqistr = airqualityToStr(data.params.AQI, type, units );

    // Day
    if( type == "day")
        str = `This day `;
        
    // Month
    if( type == "month")
        str = `This month `;

    // Year
    if( type == "year")
        str = `This year `;

    // Year
    if( type == "range")
        str = `This time period `;

    if(type && str)
        str += `was ${temperaturestr}. The humidity levels were ${humiditystr} and the average air quality was ${aqistr}.`;

    return str || "";
};

export function valueAsWords(value, description) {
    for (let key in description) {
        if (value >= description[key][0] && value < description[key][1]) {
            return key;
        }
    }
    return value;
}
