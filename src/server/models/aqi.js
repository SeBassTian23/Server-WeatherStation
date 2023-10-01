/*
 * Calculate AQI according to AirNOW.gov
 * Equations taken from javascript code on website
 * https://www.airnow.gov/aqi/aqi-calculator-concentration/
 * 
 * Predict the AQI from the last 12h of measurements
 * https://usepa.servicenowservices.com/airnow?id=kb_article_view&sys_id=fed0037b1b62545040a1a7dbe54bcbd4
 * 
 */

const _ = require('lodash');

const Linear = function(AQIhigh, AQIlow, Conchigh, Conclow, Conc) {
    return ((Conc - Conclow) / (Conchigh - Conclow)) * (AQIhigh - AQIlow) + AQIlow;
};

// Calculate AQI for PM2.5 particles
const AQIPM25 = function( conc) {
    var c =  (10.0 * conc) / 10.0;
    var AQI;
    if (c >= 0 && c < 12.1) {
        AQI = Linear(50.0, 0.0, 12.0, 0.0, c);
    }
    else if (c >= 12.1 && c < 35.5) {
        AQI = Linear(100.0, 51.0, 35.4, 12.1, c);
    }
    else if (c >= 35.5 && c < 55.5) {
        AQI = Linear(150.0, 101.0, 55.4, 35.5, c);
    }
    else if (c >= 55.5 && c < 150.5) {
        AQI = Linear(200.0, 151.0, 150.4, 55.5, c);
    }
    else if (c >= 150.5 && c < 250.5) {
        AQI = Linear(300.0, 201.0, 250.4, 150.5, c);
    }
    else if (c >= 250.5 && c < 350.5) {
        AQI = Linear(400.0, 301.0, 350.4, 250.5, c);
    }
    else if (c >= 350.5 && c < 500.5) {
        AQI = Linear(500.0, 401.0, 500.4, 350.5, c);
    }
    else {
        AQI = -1;
    }
    return AQI;
};

// Calculate AQI for PM10 particles
const AQIPM10 = function( c) {
    var AQI;
    if (c >= 0.0 && c < 55.0) {
        AQI = Linear(50.0, 0.0, 54.0, 0.0, c);
    }
    else if (c >= 55.0 && c < 155.0) {
        AQI = Linear(100.0, 51.0, 154.0, 55.0, c);
    }
    else if (c >= 155.0 && c < 255.0) {
        AQI = Linear(150.0, 101.0, 254.0, 155.0, c);
    }
    else if (c >= 255.0 && c < 355.0) {
        AQI = Linear(200.0, 151.0, 354.0, 255.0, c);
    }
    else if (c >= 355.0 && c < 425.0) {
        AQI = Linear(300.0, 201.0, 424.0, 355.0, c);
    }
    else if (c >= 425.0 && c < 505.0) {
        AQI = Linear(400.0, 301.0, 504.0, 425.0, c);
    }
    else if (c >= 505.0 && c < 605.0) {
        AQI = Linear(500.0, 401.0, 604.0, 505.0, c);
    }
    else {
        AQI = -1;
    }
    return AQI;
};

const calculateAQI = function( PM25, PM10 ) {
    var AQI10 = AQIPM10( PM10 );
    var AQI25 = AQIPM25( PM25 );
    if( AQI10 > AQI25 ) {
        return AQI10;
    }
    else {
        return AQI25;
    } 
};

const predictAQI = function( PM25, PM10 ){

    var PMmax = _.max(PM25);
    var PMmin = _.min(PM25);
    var len   = 12 / PM25.length;
    var weightFactor = 1-((PMmax - PMmin) / PMmax) < 0.5? 0.5 : 1-((PMmax - PMmin) / PMmax);


    // range = max - min;
    // rateofchange = range/max
    // weightfactor = 1-rateofchange
    // sumofdatatimesweightingfactor += hourly[i]*(Math.pow(weightfactor, i));
    // sumofweightingfactor += Math.pow(weightfactor, i);
	// nowCast = sumofdatatimesweightingfactor / sumofweightingfactor
    // nowCast = Math.floor(10*nowCast)/10


    var AQI25_nowCast = 0;
    var AQI25_wft = 0;
    var AQI25_wf = 0;
    PM25.map(function(x, idx){
        AQI25_wft += x * Math.pow(weightFactor, (idx + 1) * len );
        AQI25_wf += Math.pow(weightFactor, (idx + 1) * len );
    });
    AQI25_nowCast = _.round( AQI25_wft/AQI25_wf, 0 );


    PMmax = _.max(PM10);
    PMmin = _.min(PM10);
    len   = 12 / PM10.length;
    weightFactor = 1-((PMmax - PMmin) / PMmax) < 0.5? 0.5 : 1-((PMmax - PMmin) / PMmax);

    var AQI10_nowCast = 0;
    var AQI10_wft = 0;
    var AQI10_wf = 0;
    PM10.map(function(x, idx){
        AQI10_wft += x * Math.pow(weightFactor, (idx + 1) * len );
        AQI10_wf  += Math.pow(weightFactor, (idx + 1) * len );
    });
    AQI10_nowCast = _.round( AQI10_wft/AQI10_wf, 0 );

    return _.round( calculateAQI( AQI25_nowCast, AQI10_nowCast ), 0);
};

module.exports = predictAQI;