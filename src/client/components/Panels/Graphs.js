import React, { useState, useContext, useEffect } from 'react';

import { cloneDeep, inRange } from 'lodash';

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Placeholder from 'react-bootstrap/Placeholder';

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

import { minimal_find_peaks } from '../../helpers/peak-detection'

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

import annotationPlugin from 'chartjs-plugin-annotation';

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

      if(options.inverse === true){
        // Sunrise
        if (options.sunrise && options.sunset) {
          var riseStart = chart.scales.x.getPixelForValue(chart.scales.x.parse(options.sunrise));
          var dayWidth = chart.scales.x.getPixelForValue(chart.scales.x.parse(options.sunset)) - riseStart;
          if (dayWidth > 0)
            ctx.fillRect(riseStart, chartArea.top, dayWidth, height); // Changed order
        }
      }
      else {
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
  annotationPlugin,
  sunRiseSetPlugin);

export default function Graphs(props) {
  const [isGraphWidth, setGraphWidth] = useState("false");
  const ToggleGraphWidth = () => {
    setGraphWidth(!isGraphWidth);
  };

  const period = (props.period === 'now')? 'today' : `the period of ${ (props.period === 'range' && props.selectedDate)? dayjs.duration( dayjs(props.selectedDate[1]).diff(dayjs(props.selectedDate[0]), 'day') , "days").humanize() : `a ${props.period}`}`

  if (props.data && Object.keys(props.data).length === 0)
    return (<></>)

  return (
    <Card>
      <Card.Body>
        <Button variant='light' className='float-end bg-transparent border-0 d-none d-lg-block' id='fullscreen-graphs' title="Expand/Collaps Graphs" onClick={ToggleGraphWidth}>
          <i className={`bi ${isGraphWidth ? "bi-fullscreen" : "bi-fullscreen-exit"} text-muted`} />
        </Button>
        <Card.Title className='text-info'>Observation History</Card.Title>
        {
          props.isLoading ? <Placeholder animation='glow'>
            <Placeholder sm={3} className='mb-1 fw-light' />
          </Placeholder> : 
          <Card.Subtitle className='mb-2 text-muted fw-light'>Graphing of data collected {period}.</Card.Subtitle>
        }

        <GraphContainer {...props} className={isGraphWidth ? "row-cols-lg-2" : null} />
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

  function generateGradient(ctx, chartArea, yAxis, alpha=1) {
    let width, height, gradient;
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
          gradient.addColorStop( itm.range[0]/yAxis.max, color(itm.color).alpha(alpha).rgbString() )
          return
        }
        if( inRange(yAxis.min, itm.range[0], itm.range[1]) || inRange(yAxis.max, itm.range[0], itm.range[1]) ){
          gradient.addColorStop( itm.range[0]/yAxis.max, color(itm.color).alpha(alpha).rgbString() )
          return
        }
        if( inRange(yAxis.min, itm.range[0], itm.range[1]) && inRange(yAxis.max, itm.range[0], itm.range[1]) ){
          gradient.addColorStop( 1, color(itm.color).alpha(alpha).rgbString() )
          return
        }
      })
    }
    return gradient;
  }

  function lineColor(context){
    const chart = context.chart;
    const {ctx, chartArea} = chart;

    if (!chartArea) {
      // This case happens on initial chart load
      return;
    }
    return generateGradient(ctx, chartArea, chart.scales.y);
  }

  function fillColor(context){
    const chart = context.chart;
    const {ctx, chartArea} = chart;

    if (!chartArea) {
      // This case happens on initial chart load
      return;
    }

    var gradientFill = ctx.createLinearGradient(500, 0, 100, 0);
    gradientFill.addColorStop(0, "rgba(128, 182, 244, 0.6)");
    gradientFill.addColorStop(1, "rgba(244, 144, 128, 0.6)");

    return generateGradient(ctx, chartArea, chart.scales.y, 0.1);
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
        borderColor: (key === 'AQI')? lineColor : color(plot.traces[key].c || 'grey').rgbString(),
        pointBorderColor: (key === 'AQI')? lineColor : color(plot.traces[key].c || 'grey').rgbString(),
        pointBackgroundColor: (key === 'AQI')? lineColor : color(plot.traces[key].c || 'grey').rgbString(),
        pointHoverBackgroundColor: (key === 'AQI')? lineColor : color(plot.traces[key].c || 'grey').rgbString(),
        pointHoverBorderColor: (key === 'AQI')? lineColor : color(plot.traces[key].c || 'grey').rgbString(),
        backgroundColor: (key === 'AQI')? fillColor : color(plot.traces[key].c || 'grey').alpha(0.1).rgbString(),
        borderDash: (key === 'IAQ')?[5,2] : [],
        type: 'line',
        pointRadius: 0,
        lineTension: 0,
        borderWidth: 2,
        fill: plot.traces[key].fill? {
          target: 'start'
        } : false
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

    // Set min/max for x axis (timescale)
    if(props.period === 'now'){
      output.options.scales.x.max = dayjs().endOf('day').format();
    }

    if (theme === 'dark') {
      output.options.scales.x.grid = { color: 'rgba(255, 255, 255, 0.05)' };
      output.options.scales.y.grid = { color: 'rgba(255, 255, 255, 0.05)' };
      output.options.scales.x.ticks = { color: 'rgb(222, 226, 230)' };
      output.options.scales.y.ticks = { color: 'rgb(222, 226, 230)' };
      output.options.scales.y.title['color'] = 'rgb(222, 226, 230)';
      output.options.plugins.sunriseset.backgroundColor = 'rgba(235, 235, 235, 0.1)'
      output.options.plugins.sunriseset.inverse = true
      output.options.color = 'rgb(222, 226, 230)'; 
    }
    else {
      output.options.color = ChartJS.defaults.color;
      output.options.plugins.sunriseset.backgroundColor = null;
    }

    let autoAnnotation = {};

    for (let i in output.data.datasets) {
      const dataPeaks = output.data.datasets[i].data.map(itm => itm.y) || [];

      const peaks = minimal_find_peaks( dataPeaks, 10, 0.9 ) || [];
      for(let peakIdx in peaks){
        const idx = peaks[peakIdx]
        autoAnnotation[`${output.data.datasets[i].label}-${idx}`] = {
          type: 'label',
          xValue: output.data.datasets[i].data[idx].x,
          yValue: output.data.datasets[i].data[idx].y,
          backgroundColor: 'transparent',
          display: (ctx) => ctx.chart.isDatasetVisible(i),
          content: output.data.datasets[i].data[idx].y,
          font: {
            size: 8,
          },
          color: (theme === 'dark')? 'rgb(222, 226, 230)' : 'rgba(0,0,0,1)',
          padding: {
            bottom: 20
          }
        }
      }

    }

    // Annotations
    if(state.peaks && state.peaks === 'show'){
      output.options.plugins["annotation"] = {
        clip: false,
        annotations: {
          ...autoAnnotation
        }
      }
    }

    return output;
  })

  if (graphSetup.length > 0) {
    return (
      <Row xs={1} className={props.className} id='graphs-container'>
        {graphSetup.map((g, idx) => (
          <Col className={props.isLoading? 'py-3 GraphLoadingOverlay' : 'py-3'} key={idx}>
            <GraphCanvas {...g} isLoading={props.isLoading} idx={idx} />
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

  // https://www.pluralsight.com/resources/blog/guides/how-to-create-a-right-click-menu-using-react
  const onContextMenu = (event) => {
    if(chart){
      event.preventDefault();
      // alert('Hello');
    }
  }

  return <Line ref={setChart} width={400} height={175} id={`graph-${props.idx}`} options={props.options} data={props.data} className="ratio ratio-21x9" onDoubleClick={(e) => onDoubleClick()} onContextMenu={onContextMenu} />
}