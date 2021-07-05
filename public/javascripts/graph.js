var color = Chart.helpers.color;

var sunRiseSetPlugin = {
    id: 'sunriseset',
    version: '1.0.0',
    beforeDraw(chart, args, options) {
        if(options.sunrise || options.sunset){
            var ctx = chart.ctx;
            var chartArea = chart.chartArea;
    
            var height = chartArea.bottom - chartArea.top;
    
            ctx.save();
    
            ctx.fillStyle = options.backgroundColor || 'rgba(235, 235, 235, 0.5)';
            
            // Sunrise
            if(options.sunrise){
                var riseWidth = chart.scales.x.getPixelForValue( chart.scales.x.parse(options.sunrise) ) - chartArea.left;
                if(riseWidth > 0)
                    ctx.fillRect(chartArea.left, chartArea.top, riseWidth, height); // Changed order
    
            }
            // Sunset
            if(options.sunset){
                var setWidth = chartArea.right - chart.scales.x.getPixelForValue( chart.scales.x.parse(options.sunset) );
                if(setWidth > 0)
                    ctx.fillRect(chartArea.right-setWidth, chartArea.top, setWidth, height); // Changed order
            }
            ctx.restore();
        }
    }
  };

var chartOptions = {
    animation: {
        duration: 0,
        show: false
    },
    maintainAspectRatio: false,
    scales: {
        x: {
            type: 'time',
            distribution: 'linear',
            // offset: true,
            ticks: {
                major: {
                    enabled: true,
                    fontStyle: 'bold'
                },
                source: 'auto',
                autoSkip: true,
                autoSkipPadding: 35,
                maxRotation: 0,
                sampleSize: 50
            }
        },
        y: {
            title: {
                text: "y-Axis",
                display: true
            }
        }
    },
    plugins: {
        sunriseset: {
            backgroundColor: 'rgba(235, 235, 235, 0.5)',
            sunrise: sunrise || null,
            sunset: sunset || null
        },
        legend:{
            display: true,
            labels: {
                pointStyle: 'line',
                usePointStyle: true
            }
        },
        tooltip: {
            enabled: true,
            usePointStyle: true,
            mode: 'index',
            position: 'nearest',
            intersect: false,
            animation: {
                duration: 0
            },
            callbacks: {
                label: function(context){
                    var label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    label += parseFloat(context.parsed.y);
                    return label;
                },
                labelPointStyle: function(context) {
                    return {
                        pointStyle: 'line'
                    };
                }
            }
        },
        zoom: {
            // Container for zoom options
            zoom: {
                wheel: {
                    enabled: false,
                },
                pinch: {
                    enabled: false
                },
                drag: {
                    enabled: true
                },
                mode: 'xy'
            }
        }
    }
};

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
    cfg.scales.y.title.text = axisLabel;
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
        options: cfg,
        plugins: [sunRiseSetPlugin]
    });
});

document.querySelectorAll('canvas[id^="chart"]').forEach(function(v,i){
    var id = v.id;
    v.addEventListener('dblclick', function() {
        charts[id].resetZoom();
    });
});
