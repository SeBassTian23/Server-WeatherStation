import React, {useContext} from 'react'

import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import TabPane from 'react-bootstrap/TabPane'

import * as Parameters from '../../constants/parameters'
import {SettingsContext} from '../../context/settingsContext'
import { unitConverter } from '../../helpers/convert'

export default function TabInfo(props) {

  const [state] = useContext(SettingsContext);

  return (
    <TabPane eventKey='info'>
        <Card>
          <Card.Body>
            <Card.Title className='text-info'>Info</Card.Title>
            <Card.Subtitle className='fw-light'>Resources for Parameters</Card.Subtitle>
            <Row className='mt-2'>
              <ParameterBody {...Parameters.aqi} units={state.units} />
              <ParameterBody {...Parameters.uvi} units={state.units} />
              <ParameterBody {...Parameters.hi} units={state.units} />
            </Row>
          </Card.Body>
        </Card>
    </TabPane>
  )
}

function ParameterBody(props) {
  const units = props.units;
  return (
    <Col md={'auto'} className='d-flex align-items-start px-3 flex-column'>
      <h6 className='my-2'>{props.title}</h6>
      <ul className='list-unstyled small'>
        {props.items.map( (itm, idx) => (
            <li key={idx} className='d-flex justify-content-between align-items-start'>
              <span className='me-2'><i className='bi bi-square-fill' style={{ "color": itm.color }} /> {itm.title}: </span>
              <span className='fw-light text-muted'>
                {(itm.range[1] !== Infinity)? 
                  <>{unitConverter(itm.range[0], props.unit, units, true)} - {unitConverter(itm.range[1], props.unit, units, true)}</> : 
                  <>{unitConverter(itm.range[0], props.unit, units, true)} or higher</>
                }
                </span>
            </li>
          )
        )}
      </ul>
      <p className='small mt-auto '>
        <span className='fw-light'>Source: </span>
        <a href={props.url} target='_blank' rel='noreferrer'>{props.source}</a>
      </p>
    </Col>
  )
}
