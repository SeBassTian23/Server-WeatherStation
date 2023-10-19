import React,{ useState, useEffect, useContext } from 'react'

import { LabelUnitStrip } from '../../helpers/label-format';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table'

import NoData from '../Helpers/NoData';
import Cards from './Cards'

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

export default function Summary(props) {

  const [summary, setSummary] = useState(null);

  useEffect( () => {
    setSummary(props)
  }, [props] )

  return (
    <>
      {(summary && summary.cards && summary.cards.length > 0) && <Row className='row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 mb-3'>
            <Cards items={summary.cards || []} />
          </Row>}
      {(summary && summary.table) && <SummaryTable {...summary.table} period={summary.period} selectedDate={summary.selectedDate} />}
    </>
  );
}

function SummaryTable(props) {

  const [state] = useContext(SettingsContext);
  
  const period = (props.period === 'now')? 'today' : `the period of ${ (props.period === 'range')? dayjs.duration( dayjs(props.selectedDate[1]).diff(dayjs(props.selectedDate[0]), 'day') , "days").humanize() : `a ${props.period}`}`
  const left = props.left || []
  const right =  props.right || []
  const download = downloadLink(props.period, props.selectedDate, state.units) || '#'

  return (
    <Card>
      <Card.Body>
        <a className='float-end me-2' href={download}><i className='bi bi-download text-muted' /> </a>
        <Card.Title className='text-info'>Summary</Card.Title>
        <Card.Subtitle className='text-muted mb-2 fw-light'>Data summarized for {period}.</Card.Subtitle>
        <SummaryTableContent left={left} right={right} />
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
          <TableBody rows={left} />
        </Col>
        <Col>
          <TableBody rows={right} />
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
          <th className='text-center'>Average</th>
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
        <ValueFormat value={props.avg} title={props.title} unit={props.header} />
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
    