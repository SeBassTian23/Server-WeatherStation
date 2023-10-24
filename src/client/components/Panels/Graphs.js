import React, { useState, useContext, useEffect } from 'react';

import { cloneDeep, inRange } from 'lodash';

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(localizedFormat)
dayjs.extend(duration)
dayjs.extend(relativeTime)

import { SettingsContext } from '../../context/settingsContext';
import { unitConverter } from '../../helpers/convert';
import { LabelUnitStrip } from '../../helpers/label-format';
import { LabelGetUnit } from '../../helpers/label-format';

import timezoneAdjust, {timezoneGetOffset} from '../../helpers/timezone-adjust'

import { aqi } from '../../constants/parameters'

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

import { chartOptions } from '../../constants/graph'

const sunRiseSetPlugin = {
  id: 'sunriseset',
  version: '1.0.0',
  beforeDraw(chart, args, options) {
    if (options.sunrise || options.sunset) {
      var ctx = chart.ctx;
      var chartArea = chart.chartArea;

      var height = chartArea.bottom - chartArea.top;

      ctx.save();

      ctx.fillStyle = options.backgroundColor || 'rgba(235, 235, 235, 0.5)';

      // Sunrise
      if (options.sunrise) {
        var riseWidth = chart.scales.x.getPixelForValue(chart.scales.x.parse(options.sunrise)) - chartArea.left;
        if (riseWidth > 0)
          ctx.fillRect(chartArea.left, chartArea.top, riseWidth, height); // Changed order

      }
      // Sunset
      if (options.sunset) {
        var setWidth = chartArea.right - chart.scales.x.getPixelForValue(chart.scales.x.parse(options.sunset));
        if (setWidth > 0)
          ctx.fillRect(chartArea.right - setWidth, chartArea.top, setWidth, height); // Changed order
      }
      ctx.restore();
    }
  }
};

ChartJS.register(ArcElement,
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

export default function Graphs(props) {
  const [isGraphWidth, setGraphWidth] = useState("false");
  const ToggleGraphWidth = () => {
    setGraphWidth(!isGraphWidth);
  };

  const period = (props.period === 'now')? 'today' : `the period of ${ (props.period === 'range')? dayjs.duration( dayjs(props.selectedDate[1]).diff(dayjs(props.selectedDate[0]), 'day') , "days").humanize() : `a ${props.period}`}`

  if (props.data && Object.keys(props.data).length === 0)
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

const GraphContainer = (props) => {
  const [state] = useContext(SettingsContext);

  const [theme, setTheme] = useState(state.theme);

  const data = props.data || []
  const options = props.options || []

  useEffect(() => {

    if(state.theme === 'auto')
      setTheme( window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' );
    else
      setTheme(state.theme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      setTheme( window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' );
    });

  }, [state.theme])

  let width, height, gradient;
  function getGradient(ctx, chartArea, yAxis) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      width = chartWidth;
      height = chartHeight;
      gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

      aqi.items.forEach(itm=>{
        if(itm.range[0]/yAxis.max <= 1 && inRange(itm.range[0], yAxis.min, yAxis.max) || inRange(itm.range[1], yAxis.min, yAxis.max)){
          gradient.addColorStop( itm.range[0]/yAxis.max, itm.color )
          return
        }
        if( inRange(yAxis.min, itm.range[0], itm.range[1]) || inRange(yAxis.max, itm.range[0], itm.range[1]) ){
          gradient.addColorStop( itm.range[0]/yAxis.max, itm.color )
          return
        }
        if( inRange(yAxis.min, itm.range[0], itm.range[1]) && inRange(yAxis.max, itm.range[0], itm.range[1]) ){
          gradient.addColorStop( 1, itm.color )
          return
        }
      })
    }

    return gradient;
  }

  function borderColor(context){
    const chart = context.chart;
    const {ctx, chartArea} = chart;

    if (!chartArea) {
      // This case happens on initial chart load
      return;
    }
    return getGradient(ctx, chartArea, chart.scales.y);
  }

  let graphSetup = options.map((plot, idx) => {
    let traces = []
    for (let key in plot.traces) {
      const tzoffset = timezoneGetOffset(data[key]? data[key][0].x : 0, props.timezone);
      traces.push({
        label: plot.traces[key].l,
        data: data[key]? data[key].map(itm => {
          return { ...itm, ...{ x: dayjs(itm.x).subtract(tzoffset, 'minutes'), y: unitConverter(itm.y, LabelGetUnit(plot.yaxis), state.units)[0] } } //x: timezoneAdjust(itm.x, props.timezone),
        }) : [],
        borderColor: (key === 'AQI')? borderColor : color(plot.traces[key].c || 'grey').rgbString(),
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
    output.options.plugins.sunriseset.sunrise = timezoneAdjust(props.sunrise, props.timezone) || null;
    output.options.plugins.sunriseset.sunset = timezoneAdjust(props.sunset, props.timezone) || null;

    // Set x-axis label format
    output.options.scales.x.time.unit = [null, 'now', 'day'].indexOf(props.period) > -1? 'hour' : 'day'
    
    // Set y-axis label
    let unit = unitConverter(1, LabelGetUnit(plot.yaxis), state.units)[1]
    output.options.scales.y = {
      title: {
        text: `${LabelUnitStrip(plot.yaxis)}${unit ? ` [${unit}]` : ''}`,
        display: true
      }
    }

    // Set min/max for y axis
    output.options.scales.y.min = plot.min;
    output.options.scales.y.max = plot.max;

    if (theme === 'dark') {
      output.options.scales.x.grid = { color: 'rgba(255, 255, 255, 0.05)' };
      output.options.scales.y.grid = { color: 'rgba(255, 255, 255, 0.05)' };
      output.options.scales.x.ticks = { color: 'rgb(222, 226, 230)' };
      output.options.scales.y.ticks = { color: 'rgb(222, 226, 230)' };
      output.options.scales.y.title['color'] = 'rgb(222, 226, 230)';
      output.options.plugins.sunriseset.backgroundColor = 'rgba(235, 235, 235, 0.1)'
      output.options.color = 'rgb(222, 226, 230)';
    }
    else {
      output.options.color = ChartJS.defaults.color;
      output.options.plugins.sunriseset.backgroundColor = null;
    }

    return output;
  })

  if (graphSetup.length > 0) {
    return (
      <Row xs={1} className={props.className} id='graphs-container'>
        {graphSetup.map((g, idx) => (
          <Col className='py-3' key={idx}>
            <GraphCanvas {...g} idx={idx} />
          </Col>
        )
        )}
      </Row>
    )
  }
}

const GraphCanvas = (props) => {
  const [chart, setChart] = useState(null);
  const onDoubleClick = () => {
    if (chart) {
      chart.resetZoom();
    }
  }

  return <Line ref={setChart} width={400} height={175} id={`graph-${props.idx}`} options={props.options} data={props.data} className="ratio ratio-21x9" onDoubleClick={(e) => onDoubleClick()} />
}