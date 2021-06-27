
// https://github.com/G6EJD/BME680-Example

var hum_weighting = 0.25; // so hum effect is 25% of the total air quality score
var gas_weighting = 0.75; // so gas effect is 75% of the total air quality score

var humidity_score, gas_score;
var gas_reference = 2500;
var hum_reference = 40;
var gas_lower_limit = 10000;  // Bad air quality limit
var gas_upper_limit = 300000; // Good air quality limit

// Calculate humidity contribution to IAQ index
function GetHumidityScore( current_humidity ) {  
  var humidity_score;
    // Humidity +/-5% around optimum
  if (current_humidity >= 38 && current_humidity <= 42)
    humidity_score = 0.25 * 100;
  else
  { // Humidity is sub-optimal
    if (current_humidity < 38)
      humidity_score = 0.25 / hum_reference * current_humidity * 100;
    else
    {
      humidity_score = ((-0.25 / (100 - hum_reference) * current_humidity) + 0.416666) * 100;
    }
  }
  return humidity_score;
}

function GetGasScore( gas_reference ) {
  //Calculate gas contribution to IAQ index
  var gas_score = (0.75 / (gas_upper_limit - gas_lower_limit) * gas_reference - (gas_lower_limit * (0.75 / (gas_upper_limit - gas_lower_limit)))) * 100.00;
  if (gas_score > 75)
    gas_score = 75; // Sometimes gas readings can go outside of expected scale maximum
  if (gas_score <  0)
    gas_score = 0;  // Sometimes gas readings can go outside of expected scale minimum
  return gas_score;
}

var ohms     = 100.1 * 1000;
var humidity = 79.9;

var score = GetHumidityScore( humidity ) + GetGasScore( ohms);

var air_quality_score = (100 - score);

console.log( air_quality_score );
