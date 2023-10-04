import React, {useState} from 'react';

import { cloneDeep } from 'lodash';

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from "chart.js";

import { color } from 'chart.js/helpers';

import 'chartjs-community-adapter-dayjs';
import zoomPlugin from 'chartjs-plugin-zoom';

import { Line } from 'react-chartjs-2';

import {chartOptions} from '../../constants/graph'

// const color = ChartJS.helpers.color;

const sunRiseSetPlugin = {
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

ChartJS.register(  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
  zoomPlugin,
  sunRiseSetPlugin);

export default function Graphs( props ) {

  const [isGraphWidth, setGraphWidth] = useState("false");
  const ToggleGraphWidth = () => {
    setGraphWidth(!isGraphWidth); 
  };

  const period = (props.period === 'now')? 'today' : `over the period of a ${props.period}`

  if(props.data && Object.keys(props.data).length === 0)
    return (<></>)

  return (
    <Card>
      <Card.Body>
        <Button variant='light' className='float-end bg-transparent border-0' id='fullscreen-graphs' title="Expand/Collaps Graphs" onClick={ToggleGraphWidth}>
          <i className={`bi ${isGraphWidth ? "bi-fullscreen" : "bi-fullscreen-exit"} text-muted`} />
        </Button>
        <Card.Title className='text-info'>Observation History</Card.Title>
        <Card.Subtitle className='mb-2 text-muted fw-light'>Graphing of data collected {period}.</Card.Subtitle>

        <GraphContainer {...props} className={isGraphWidth ? "row-cols-md-2" : null} />
        <div className="small text-muted fw-light text-end">
          Click and drag to zoom in and double click to zoom out
        </div>
      </Card.Body>
    </Card>
  )
}
  
const GraphContainer = ( props ) => {

  const data = props.data || []
  const options = props.options || []

  let graphSetup = options.map( (plot,idx) => {
      let traces = []
      for(let key in plot.traces){
        traces.push({
          label: plot.traces[key].l,
          data: data[key] || [],
          backgroundColor: color(plot.traces[key].c || 'grey').alpha(0.2).rgbString(),
          borderColor: color(plot.traces[key].c || 'grey').rgbString(),
          type: 'line',
          pointRadius: 0,
          fill: false,
          lineTension: 0,
          borderWidth: 2
        })
      }

     let output = {
        options: cloneDeep(chartOptions),
        data: {
          datasets: traces
        }       
      }

      // Set sunrise/sunset
      output.options.plugins.sunriseset.sunrise = props.sunrise || null; 
      output.options.plugins.sunriseset.sunset = props.sunset || null;

      // Set y-axis label
      output.options.scales.y = {
        title: {
            text: plot.yaxis,
            display: true
        }
      }

      return output;
  })

  if(graphSetup.length > 0){
    return (
      <Row xs={1} className={props.className} id='graphs-container'>
        {graphSetup.map( (g, idx) => (
            <Col className='py-3' key={idx}>
              <GraphCanvas {...g} idx={idx} />
            </Col>
          )
        )}   
      </Row>
    )
  }
}


const GraphCanvas = ( props ) => {

  const [chart, setChart] = useState(null);  
  const onDoubleClick = () => {
    if (chart) {
      chart.resetZoom();
    }
  }

  return <Line ref={setChart} width={400} height={175} id={`graph-${props.idx}`} options={ props.options } data={props.data} className="ratio ratio-21x9" onDoubleClick={(e) => onDoubleClick()} />
}