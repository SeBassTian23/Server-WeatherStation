import React, { useContext } from 'react';

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)

import { SettingsContext } from '../../context/settingsContext';
import { unitConverter } from '../../helpers/convert';
import { LabelUnitStrip } from '../../helpers/label-format'; 
import { LabelGetUnit } from '../../helpers/label-format';
import downloadLink from '../../helpers/download-link';

import timezoneAdjust from '../../helpers/timezone-adjust'

export default function Latest(props) {

  const [state] = useContext(SettingsContext);

  if(Array.isArray(props.rows) && props.rows.length >0)
    return (
      <Card className='card rounded-0 mt-4'>
        <Card.Body>
          <a className='float-end bg-transparent border-0' href={downloadLink('now', new Date(), state.units)} title="Download Latest Observations">
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

  const [state] = useContext(SettingsContext);

  const header = props.columns || []
  const rows = props.rows || []

  const formatHeader = (itm) => {
    let unit = unitConverter(1, LabelGetUnit(itm), state.units)[1]
    return `${LabelUnitStrip(itm)}${unit? ` [${unit}]`: '' }`
  }

  if(header.length > 0 & rows.length >0){
    return (
      <Row className='table-responsive'>
        <Table className='table-sm small table-striped'>
          <thead className='thead-light text-center small'>
            <tr>
              {header.map( (name,idx) => (
                <td key={idx}>{formatHeader(name)}</td>
                )
              )}
            </tr>
          </thead>
          <tbody className='text-center text-nowrap'>
            {rows.map( (row, idx) => (
                <tr key={idx}>
                  {header.map( (name, idx) => (
                    <td key={idx}>{
                        (name === 'Time')? dayjs(timezoneAdjust(row[name],props.timezone)).format('LT') : unitConverter(row[name], name, state.units)[0]
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
}
