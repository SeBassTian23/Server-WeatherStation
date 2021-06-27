var color = Chart.helpers.color;
var chartOptions = {
    animation: {
        duration: 0,
        show: true
    },
    maintainAspectRatio: false,
    scales: {
        xAxes: [{
            type: 'time',
            distribution: 'linear',
            offset: true,
            ticks: {
                major: {
                    enabled: true,
                    fontStyle: 'bold'
                },
                source: 'data',
                autoSkip: true,
                autoSkipPadding: 35,
                maxRotation: 0,
                sampleSize: 50
            }
        }],
        yAxes: [{
            gridLines: {
                drawBorder: false
            },
            scaleLabel: {
                display: true
            }
        }]
    },
    sunRiseSet: {
        backgroundColor: 'rgba(235, 235, 235, 0.5)',
        sunrise: sunrise || null,
        sunset: sunset || null
    },
    tooltips: {
        enable: false,
        intersect: false,
        mode: 'index',
        callbacks: {
            label: function(tooltipItem, myData) {
                var label = myData.datasets[tooltipItem.datasetIndex].label || '';
                if (label) {
                    label += ': ';
                }
                label += parseFloat(tooltipItem.value);
                return label;
            },
            title: function(tooltipItem, myData) {
                var min = myData.datasets[0].data[0].t;
                var max = myData.datasets[0].data[(myData.datasets[0].data.length-1)].t;
                var dateformat = "LT";
                if( moment(min).format('MMM') != moment(max).format('MMM')){
                    dateformat = "MMM Do";
                }
                else if( moment(max).diff(moment(min), 'days') > 0 ){
                    dateformat = "MMM Do - LT";
                }
                var title = [];
                tooltipItem.map(function(i){
                    var d = moment(i.label).format(dateformat);
                    if(d && title.indexOf(d) == -1)
                        title.push( d );
                });
                return title.join(', ');
            }
        }
    },
    legend:{
        display: true,
        labels: {
            usePointStyle: false
        }
    },
    plugins: {
        zoom: {
            // Container for zoom options
            zoom: {
                // Boolean to enable zooming
                enabled: true,
    
                // Enable drag-to-zoom behavior
                drag: true,
    
                // Drag-to-zoom effect can be customized
                // drag: {
                // 	 borderColor: 'rgba(225,225,225,0.3)'
                // 	 borderWidth: 5,
                // 	 backgroundColor: 'rgb(225,225,225)',
                // 	 animationDuration: 0
                // },
    
                // Zooming directions. Remove the appropriate direction to disable
                // Eg. 'y' would only allow zooming in the y direction
                // A function that is called as the user is zooming and returns the
                // available directions can also be used:
                //   mode: function({ chart }) {
                //     return 'xy';
                //   },
                mode: 'xy',
    
                rangeMin: {
                    // Format of min zoom range depends on scale type
                    x: null,
                    y: null
                },
                rangeMax: {
                    // Format of max zoom range depends on scale type
                    x: null,
                    y: null
                },
    
                // Speed of zoom via mouse wheel
                // (percentage of zoom on a wheel event)
                speed: 0.1,
    
                // Minimal zoom distance required before actually applying zoom
                threshold: 2,
    
                // On category scale, minimal zoom level before actually applying zoom
                sensitivity: 3
    
                // Function called while the user is zooming
                // onZoom: function({chart}) { console.log(`I'm zooming!!!`); },
                // // Function called once zooming is completed
                // onZoomComplete: function({chart}) { console.log(`I was zoomed!!!`); }
            }
        }
    }
};

Chart.pluginService.register({
    beforeDraw: function(chart, easing) {
      if (chart.config.options.sunRiseSet && (chart.config.options.sunRiseSet.sunrise || chart.config.options.sunRiseSet.sunset) ) {
        var ctx = chart.chart.ctx;
        var chartArea = chart.chartArea;

        var height = chartArea.bottom - chartArea.top;
        var xaxis = chart.scales['x-axis-0'];

        ctx.save();

        ctx.fillStyle = chart.config.options.sunRiseSet.backgroundColor || 'rgba(235, 235, 235, 0.5)';
        // Sunrise
        if(chart.config.options.sunRiseSet.sunrise){
            var riseWidth = xaxis.getPixelForValue(chart.config.options.sunRiseSet.sunrise) - chartArea.left;
            if(riseWidth > 0)
                ctx.fillRect(chartArea.left, chartArea.top, riseWidth, height); // Changed order

        }

        // Sunset
        if(chart.config.options.sunRiseSet.sunset){
            var setWidth = chartArea.right - xaxis.getPixelForValue(chart.config.options.sunRiseSet.sunset);
            if(setWidth > 0)
                ctx.fillRect(chartArea.right-setWidth, chartArea.top, setWidth, height); // Changed order
        }

        ctx.restore();
      }
    }
  });

var colors = {
    "red":    "rgb(255, 99, 132)",
    "orange": "rgb(255, 159, 64)",
    "yellow": "rgb(255, 205, 86)",
    "green":  "rgb(75, 192, 192)",
    "blue":   "rgb(54, 162, 235)",
    "purple": "rgb(153, 102, 255)",
    "grey":   "rgb(201, 203, 207)"
};

var charts = {};

document.querySelectorAll('canvas[id^="chart"]').forEach(function(v,i){
    var id = v.id;
    var axisLabel = v.dataset.yaxis;
    var traces = v.dataset.traces;
    var selectedDate = v.dataset['selected-date'];
    var ctx = v.getContext('2d');
    var cfg = Object.assign({}, chartOptions);
    cfg.scales.yAxes[0].scaleLabel.labelString = axisLabel;
    var datasets = [];
    traces = JSON.parse(traces) || {};
    for(var key in traces){
        datasets.push({
            label: traces[key].l,
            backgroundColor: color(colors[traces[key].c] || traces[key].c || "grey").alpha(0.2).rgbString(),
            borderColor: colors[traces[key].c] || traces[key].c || "grey",
            data: graphs[key] || [],
            type: 'line',
            pointRadius: 0,
            fill: false,
            lineTension: 0,
            borderWidth: 2
        });
    }
    charts[id] = new Chart(ctx, {
        data: {datasets: datasets},
        options: cfg
    });
});

document.querySelectorAll('canvas[id^="chart"]').forEach(function(v,i){
    var id = v.id;
    v.addEventListener('dblclick', function() {
        charts[id].resetZoom();
    });
});
