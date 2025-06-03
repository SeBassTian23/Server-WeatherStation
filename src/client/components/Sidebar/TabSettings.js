import React, { useContext } from 'react'

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import TabPane from 'react-bootstrap/TabPane'

import Form from 'react-bootstrap/Form'

import * as ACTIONS from '../../constants/actions'

import {SettingsContext} from '../../context/settingsContext'

export default function TabSettings(props) {
  return (
    <TabPane eventKey='settings'>
      <Card>
        <Card.Body>
          <Card.Title className='text-info'>Settings</Card.Title>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Units</Card.Subtitle>
              <Form.Text className="text-muted">Units to Display Data</Form.Text>
            </Col>
            <Col>
              <UnitsSelect />
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Calendar</Card.Subtitle>
              <Form.Text className="text-muted">Calendar Format</Form.Text>
            </Col>
            <Col>
              <CalendarSelect />
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Display Mode</Card.Subtitle>
              <Form.Text className="text-muted">UI Light/Dark Mode</Form.Text>
            </Col>
            <Col>
              <ThemeSelect />
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Peak Labels</Card.Subtitle>
              <Form.Text className="text-muted">Peak Detection and Labeling for Graphs</Form.Text>
            </Col>
            <Col>
              <PeakLabelSelect />
            </Col>
          </Row>
          <Row className='py-3'>
            <Col xs={8}>
              <Card.Subtitle>Cache</Card.Subtitle>
              <Form.Text className="text-muted">Cache Previously Viewed Days</Form.Text>
            </Col>
            <Col xs={4}>
              <CacheToggle />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </TabPane>
  )
}

const UnitsSelect = (props) => {
  const [state, dispatch] = useContext(SettingsContext);
  
  const selectHandler = (e) => {
    e.preventDefault();
    dispatch({type: ACTIONS.SELECT_UNITS,  payload: e.target.value })
  };

  return (
    <Form.Select defaultValue={state.units} onChange={(e)=>selectHandler(e)} aria-label="Select Display Mode" id='selectUnits' size='sm'>
      {[{label:'Imperial (℉, inHg)',value:'imperial'},{label:'Metric (℃, hPa)',value:'metric'},{label:'SI (K, Pa)',value:'si'}].map( (m,idx) => {
        return <option key={`units${idx}`} value={m.value}>{m.label}</option>
      })}
    </Form.Select>
  )
}

const ThemeSelect = (props) => {
  const [state, dispatch] = useContext(SettingsContext);
  
  const selectHandler = (e) => {
    e.preventDefault();
    dispatch({type: ACTIONS.SELECT_THEME,  payload: e.target.value })
  };

  return (
    <Form.Select defaultValue={state.theme} onChange={(e)=>selectHandler(e)} aria-label="Select Display Mode" id='radioDisplayModeLight' size='sm'>
      {[{label:'Auto',value:'auto'},{label:'Light',value:'light'},{label:'Dark',value:'dark'}].map( (m,idx) => {
        return <option key={`displaymode${idx}`} value={m.value}>{m.label}</option>
      })}
    </Form.Select>
  )
}

const CalendarSelect = (props) => {
  const [state, dispatch] = useContext(SettingsContext);
  
  const selectHandler = (e) => {
    e.preventDefault();
    dispatch({type: ACTIONS.SELECT_CALENDAR,  payload: e.target.value })
  };

  return (
    <Form.Select defaultValue={state.calendarType} onChange={(e)=>selectHandler(e)} aria-label="Select Display Mode" id='radioCalendarTypeSelect' size='sm'>
      {[{label:'Gregory',value:'gregory'},{label:'ISO8601',value:'iso8601'},{label:'Hebrew',value:'hebrew'},{label:'Islamic',value:'islamic'}].map( (m,idx) => {
        return <option key={`calendarmode${idx}`} value={m.value}>{m.label}</option>
      })}
    </Form.Select>
  )
}

const PeakLabelSelect = (props) => {
  const [state, dispatch] = useContext(SettingsContext);
  
  const selectHandler = (e) => {
    e.preventDefault();
    dispatch({type: ACTIONS.TOGGLE_PEAKLABEL,  payload: e.target.value })
  };

  return (
    <Form.Select defaultValue={state.peaks} onChange={(e)=>selectHandler(e)} aria-label="Select Peak Label Mode" id='PeakLabelSelect' size='sm'>
      {[{label:'Show',value: 'show'},{label:'Hide',value: 'hide'}].map( (m,idx) => {
        return <option key={`peaklabelmode${idx}`} value={m.value}>{m.label}</option>
      })}
    </Form.Select>
  )
}

const CacheToggle = (props) => {
  const [ state, dispatch ] = useContext(SettingsContext)

  const toggleHandler = (e) => {
    dispatch({type: ACTIONS.TOGGLE_CACHE, payload: e.target.checked? 'on': 'off' })
  };

  return (
    <Form.Check type='switch' id='checkCache' className='d-flex justify-content-end pe-1'>
      <Form.Check.Input type='checkbox' isValid={false} onChange={(e) => toggleHandler(e)} checked={ (state.cache === 'on')? true : false } />
    </Form.Check>
  )
}