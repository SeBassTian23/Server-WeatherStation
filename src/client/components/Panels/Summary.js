import React,{ useState, useEffect, useContext } from 'react'

import { LabelUnitStrip } from '../../helpers/label-format';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table'

import NoData from '../Helpers/NoData';
import Placeholder from 'react-bootstrap/Placeholder';

import {SettingsContext} from '../../context/settingsContext'
import {unitConverter} from '../../helpers/convert'

import downloadLink from '../../helpers/download-link';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(localizedFormat)
dayjs.extend(duration)
dayjs.extend(relativeTime)

import timezoneAdjust from '../../helpers/timezone-adjust';

export default function Summary(props) {

  const [summary, setSummary] = useState({});

  useEffect( () => {
    setSummary(summary => {
      return {...summary, ...props}
    });
  }, [props] )

  if(props.isLoading || !summary.selectedDate){
    return <>
      <Card>
        <Card.Body>
          <Card.Title className='text-info'>Summary</Card.Title>
          <Placeholder animation='glow'>
            <Placeholder sm={5} className='mb-4 fw-light' />
            <Row xs={{cols: 1}} xl={{cols: 2}} >
              <Col className='table-responsive'>
                <TableBody period={props.period} />
                {[...new Array(12)].map( (e, idx) => {
                  return <Placeholder sm={12} key={idx} bg={ idx % 2 ? 'secondary' : null} size={'lg'} className='mb-2' />
                  })
                }
              </Col>
              <Col className='table-responsive'>
                <TableBody period={props.period} />
                {[...new Array(12)].map( (e, idx) => {
                  return <Placeholder sm={12} key={idx} bg={ idx % 2 ? 'secondary' : null} size={'lg'} className='mb-2' />
                  })
                }
              </Col>
            </Row>
          </Placeholder>
        </Card.Body>
      </Card>
    </>
  }

  return (<SummaryTable {...summary} period={summary.period} selectedDate={summary.selectedDate} sunrise={summary.sunrise} sunset={summary.sunset} timezone={summary.timezone} />);
}

function SummaryTable(props) {

  const [state] = useContext(SettingsContext);
  const period = (props.period === 'now')? 'today' : `the period of ${ (props.period === 'range' && props.selectedDate)? dayjs.duration( dayjs(props.selectedDate[1]).diff(dayjs(props.selectedDate[0]), 'day') , "days").humanize() : `a ${props.period}`}`
  const left = props.tableLeft || []
  const right =  props.tableRight || []
  const download = downloadLink(props.period, props.selectedDate, state.units) || '#'

  return (
    <Card>
      <Card.Body>
        <a className='float-end me-2' href={download} aria-label="Download Latest Observations as CSV"><i className='bi bi-download text-muted' /> </a>
        <Card.Title className='text-info'>Summary</Card.Title>
        <Card.Subtitle className='text-muted mb-4 fw-light'>Data summarized for {period}.</Card.Subtitle>
        <SummaryTableContent left={left} right={right} period={props.period} />
        {(props.sunrise && left.length > 0) &&
        <ul className='list-unstyled mb-0 text-muted fw-light small columns-4'>
          <li><i className='bi-sunrise-fill text-info' /> Sunrise: {dayjs(timezoneAdjust(props.sunrise, props.timezone || 'UTC')).format('LT')} (local)</li>
          <li><i className='bi-sunset-fill text-info' /> Sunset: {dayjs(timezoneAdjust(props.sunset, props.timezone || 'UTC')).format('LT')} (local)</li>
          <li><i className='bi-sun-fill text-info' /> Daylight: {dayjs.duration( dayjs(props.sunset).diff(dayjs(props.sunrise), 'minute') , "minute").format('HH:mm')} hrs</li>
          <li><i className='bi-moon-fill text-info' /> Moon: {props.lunarphase}</li>
        </ul>}
      </Card.Body>
    </Card>
  )
}

function SummaryTableContent(props) {
  const left = props.left || []
  const right = props.right || []
  if(left.length > 0 & right.length > 0){
    return (
      <Row xs={{cols: 1}} xl={{cols: 2}} >
        <Col>
          <TableBody rows={left} period={props.period} />
        </Col>
        <Col>
          <TableBody rows={right} period={props.period} />
        </Col>
      </Row>
    )
  }
  else{
    return(
      <NoData />
    )
  }
}

function TableBody ( props ) {

  const rows = props.rows || []

  return (
    <Table className='table-sm ws-obs-tbl' striped >
      <thead className='thead-light small text-center'>
        <tr>
          <th className='text-start' style={{width: '45%'}}>Parameter</th>
          <th className='text-center'>{props.period === 'now'? 'Current' : 'Average'}</th>
          <th className='text-end'>Low</th>
          <th className='text-center'><small>→</small></th>
          <th className='text-start'>High</th>
        </tr>
      </thead>
      <tbody className='text-center small text-nowrap'>
        {rows.map( (row,idx) => (
            <TableRow {...row} key={idx} />
          )
        )}
      </tbody>
    </Table>
  )
}

function TableRow ( props ) {
  const [state] = useContext(SettingsContext);
  let unit = ""
  if( props.unit && props.unit !== "" ){
    unit = <small className="text-muted">[{unitConverter(1, props.unit, state.units)[1]}]</small>
  }

  return (
    <tr>
      <td className='text-start'>{LabelUnitStrip(props.header)} <small className='text-muted'>{unit}</small></td>
      <td className='text-center'>
      {props.trend && <><small className='text-info'>{props.trend}</small> {' '}</> }
        <ValueFormat value={props.latest? props.latest : props.avg} title={props.title} unit={props.header} />
      </td>
      <td className='text-end'>
        <ValueFormat value={props.min} title={props.title} unit={props.header} />
      </td>
      <td className='text-center small text-muted'>→</td>
      <td className='text-start'>
        <ValueFormat value={props.max} title={props.title} unit={props.header} />
      </td>
    </tr>
  )
}

function ValueFormat(props) {
  const [state] = useContext(SettingsContext);
  //(class=`index ${addClass}`) #{value}] #[small #[small.text-muted #{unit}]]
  const value = unitConverter(props.value, props.unit, state.units)[0]

  if( props.addClass )
    return(
      <span className={props.addClass} title={props.title ? props.title: null}>{value}</span>
    )
  return (
    value
  )
}
    