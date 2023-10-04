import React,{ useState, useEffect } from 'react'

import { LabelUnitStrip } from '../../helpers/label-format';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table'

import NoData from '../Helpers/NoData';

import Cards from './Cards'

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
      {(summary && summary.table) && <SummaryTable {...summary.table} period={summary.period} download={summary.download} />}
    </>
  );
}

function SummaryTable(props) {

  const period = (props.period === 'now')? 'today' : `the period of a ${props.period}`
  const left = props.left || []
  const right =  props.right || []
  const download =  `/download/${props.download}` || '#'

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
    <Table className='table-sm ws-obs-tbl'>
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

  let unit = ""
  if( props.unit && props.unit !== "" )
    unit = <small className="text-muted">[{props.unit}]</small>

  return (
    <tr>
      <td className='text-start'>{LabelUnitStrip(props.header)} <small className='text-muted'>{unit}</small></td>
      <td className='text-center'>
        <ValueFormat value={props.avg} title={props.title} />
      </td>
      <td className='text-end'>
        <ValueFormat value={props.min} title={props.title} />
      </td>
      <td className='text-center small text-muted'>→</td>
      <td className='text-start'>
        <ValueFormat value={props.max} title={props.title} />
      </td>
    </tr>
  )
}

function ValueFormat(props) {
  //(class=`index ${addClass}`) #{value}] #[small #[small.text-muted #{unit}]]
  if( props.addClass )
    return(
      <span className={props.addClass} title={props.title ? props.title: null}>{props.value}</span>
    )
  return (
    props.value
  )
}
    