export const chartOptions = {
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
          sunrise: null,
          sunset: null
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