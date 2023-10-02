const unitConverter = require('./convert.js');

// Parts of the Day
const timeToStr = function( input, type ){

    var str = input;

    times = {
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
            str = `<strong>${phrase}</strong>`;
            break;
        }
    }
    return str;
};

const temperatureToStr = function( data, type, units ){

    var str = "N/A";

    var temperature = {
        "freezing": [Infinity,0],
        "very cold": [0,6],
        "cold": [6,10],
        "cool": [10,14],
        "mild": [14,18],
        "moderate": [18,23],
        "warm": [23,27],
        "very warm": [27,30],
        "hot": [30,40],
        "scorching": [41, Infinity]
    };

    for( var phrase in temperature ){
        if( data.avg !== null &&  data.avg <= temperature[phrase][1] ){
            str = `<strong>${phrase}</strong>`;
            var min = unitConverter(data.min, "℃", units);
            var max = unitConverter(data.max, "℃", units);
            if ((data.min !== null && data.max !== null) && (data.max - data.min) > 10 && type == "day"){
                str += ` with temperatures between ${min[0]}${min[1]} in the ${timeToStr(data.min_time, type)} and ${max[0]}${max[1]} in the ${timeToStr(data.max_time, type)}`;
            }
            else if ((data.min !== null && data.max !== null) && (data.max - data.min) > 10 && type == "month"){
                str += ` with temperatures between ${min[0]}${min[1]} on ${timeToStr(data.min_day, type)} and ${max[0]}${max[1]} on ${timeToStr(data.max_day, type)}`;
            }
            else{
                str += ` with an average temperature of ${data.avg? data.avg.toFixed(2) : data.avg}℃`;
            }
            break;
        }
    }
    return str;
};

const humidityToStr = function( data, type, units ){
     
    var str = "N/A";

    var humidity = {
        "low": [0,30],
        "medium": [30,50],
        "high": [51,100]
    };

    for( var phrase in humidity ){
        if( (data.min !== null && data.max !== null && data.avg !== null ) &&  data.avg <= humidity[phrase][1] ){
            str = `<strong>${phrase}</strong>`;
            if( type == "day"){
                if(phrase == 'low')
                    str += ` with a minimum of ${data.min.toFixed(0) || data.min}%`;
                if(phrase == 'medium')
                    str += ` at an average of ${data.avg.toFixed(0) || data.avg}%`;
                if(phrase == 'high')
                    str += ` with a maximum of ${data.max.toFixed(0) || data.max}%`;
            }
            if( type == "month"){
                str += ` (${data.avg.toFixed(0) || data.avg}%)`;
            }

            break;
        }
    }
    
    return str;
};

const airqualityToStr = function( data, type, units ){
     
    var str = "N/A";

    var airquality = {
        "good": [0,50],
        "moderate": [51,100],
        "unhealthy for sensitive groups": [101,150],
        "unhealthy": [151,200],
        "very unhealthy": [201,300],
        "hazardous": [301, Infinity]
    };

    var avg = null
    for( var phrase in airquality ){
        if( data.avg !== null && data.avg <= airquality[phrase][1] ){
            avg = phrase;
            str = `<strong>${phrase}</strong>`;
            break;
        }
    }

    for( phrase in airquality ){
        if( data.max !== null && data.max <= airquality[phrase][1] ){
            if(  str != avg && type == "day")
                str += ` reaching <strong>${phrase}</strong> levels in the ${timeToStr(data.max_time, type)}`;
            else if(  str != avg && type == "month")
                str += ` reaching <strong>${phrase}</strong> levels on ${timeToStr(data.max_day, type)}`;
            break;
        }
    }
    
    return str;
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