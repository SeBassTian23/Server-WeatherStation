import React, { useContext } from 'react'

import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';

import * as Parameters from '../../constants/parameters'
import { SettingsContext } from '../../context/settingsContext'
import { unitConverter } from '../../helpers/convert'

export default function TabInfo(props) {

  const [state] = useContext(SettingsContext);

  return (
    <Tab.Pane eventKey='info'>
      <Card>
        <Card.Body>
          <Card.Title className='text-info'>Info</Card.Title>
          <Card.Subtitle className='fw-light'>Resources for Parameters</Card.Subtitle>
          <Tab.Container defaultActiveKey="aqi-index">
            <Nav variant="underline" className='mt-3 fw-bold small justify-content-right'>
              <Nav.Item className='lh-1'>
                <Nav.Link eventKey="aqi-index">{Parameters.aqi.title}</Nav.Link>
              </Nav.Item>
              <Nav.Item className='lh-1'>
                <Nav.Link eventKey="uv-index">{Parameters.uvi.title}</Nav.Link>
              </Nav.Item>
              <Nav.Item className='lh-1'>
                <Nav.Link eventKey="heat-index">{Parameters.hi.title}</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content className="mt-3 p-0">
              <Tab.Pane eventKey="aqi-index"><ParameterBody {...Parameters.aqi} units={state.units} /></Tab.Pane>
              <Tab.Pane eventKey="uv-index"><ParameterBody {...Parameters.uvi} units={state.units} /></Tab.Pane>
              <Tab.Pane eventKey="heat-index"><ParameterBody {...Parameters.hi} units={state.units} /></Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Tab.Pane>
  )
}

function ParameterBody(props) {
  const units = props.units;
  return (
    <Col md={'auto'} className='d-flex align-items-start px-1 flex-column'>
      <ul className='list-unstyled small'>
        {props.items.map((itm, idx) => (
          <li key={idx} className='d-flex justify-content-between align-items-start'>
            <span className='me-2'><i className='bi bi-square-fill' style={{ "color": itm.color }} /> {itm.title}: </span>
            <span className='fw-light text-muted'>
              {(itm.range[1] !== Infinity) ?
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
