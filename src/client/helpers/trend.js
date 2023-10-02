/**
 * Calculate Trend for line graphs
 */
 export const linFitTrend = function(data){

  var n = data.length;

  if(n < 2 || data === undefined)
    return 0;


  var min = null;
  var max = null;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < n; i++) {

    if(!min || min > data[i])
      min = data[i];

    if(!max || max < data[i])
      max = data[i];

    sum_x += i;
    sum_y += data[i];
    sum_xy += (i*data[i]);
    sum_xx += (i*i);
    sum_yy += (data[i]*data[i]);
  } 
  
  var slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  var intercept = (sum_y - slope * sum_x)/n;
  var r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

  var percent = slope / (sum_y/n) * 100;

  if(slope < 0)
    percent *= -1;

  if(r2 < 0.6)
    percent = 0;

  return slope * 100;
};