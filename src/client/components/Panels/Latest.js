import React from 'react';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'

import NoData from '../Helpers/NoData';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)

import { LabelUnitFormat } from '../../helpers/label-format';

export default function Latest(props) {
  return (
    <Card className='card rounded-0 mt-4'>
      <Card.Body>
        <a className='float-end bg-transparent border-0' href='/download/latest' title="Download Latest Observations">
          <i className='bi bi-download text-muted' />
        </a>
        <Card.Title className='text-info'>Latest Observations</Card.Title>
        <Card.Subtitle className='mb-2 text-muted fw-light'>Latest <b>{props.rows? props.rows.length : 0}</b> observation(s) for today.</Card.Subtitle>
        <LatestContent {...props} />
      </Card.Body>
    </Card>
  )
}

const LatestContent = (props) => {

  const header = props.columns || []
  const rows = props.rows || []

  if(header.length > 0 & rows.length >0){
    return (
      <Row className='table-responsive'>
        <Table className='table-sm small table-striped'>
          <thead className='thead-light text-center small'>
            <tr>
              {header.map( (name,idx) => (
                <td key={idx}>{LabelUnitFormat(name)}</td>
                )
              )}
            </tr>
          </thead>
          <tbody className='text-center text-nowrap'>
            {rows.map( (row, idx) => (
                <tr key={idx}>
                  {header.map( (name, idx) => (
                    <td key={idx}>{
                        (name === 'Time')? dayjs(row[name]).format('LT'): row[name]
                      }</td>
                    )
                  )} 
                </tr>
              )
            )}            
          </tbody>
        </Table>
      </Row>
    )
  }
  else {
    return (
      <NoData />
    )
  }
}
