import React, { useContext, useEffect, useState, useReducer, createContext } from 'react'

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
              <UnitsSelect />
              <Form.Text className="text-muted">Select Units to Display Data</Form.Text>
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Display Mode</Card.Subtitle>
              <ThemeSelect />
              <Form.Text className="text-muted">Select Light/Dark Mode</Form.Text>
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Calendar</Card.Subtitle>
              <CalendarSelect />
              <Form.Text className="text-muted">Select Type of Calendar</Form.Text>
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Cache</Card.Subtitle>
              <CacheToggle />
              <Form.Text className="text-muted">Cache Data from past Days when viewed</Form.Text>
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
    <Form.Select defaultValue={state.units} onChange={(e)=>selectHandler(e)} aria-label="Select Display Mode" id='selectUnits' size='sm' className='mt-2'>
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
    <Form.Select defaultValue={state.theme} onChange={(e)=>selectHandler(e)} aria-label="Select Display Mode" id='radioDisplayModeLight' size='sm' className='mt-2'>
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
    <Form.Select defaultValue={state.calendarType} onChange={(e)=>selectHandler(e)} aria-label="Select Display Mode" id='radioCalendarTypeSelect' size='sm' className='mt-2'>
      {[{label:'Gregory',value:'gregory'},{label:'ISO8601',value:'iso8601'},{label:'Hebrew',value:'hebrew'},{label:'Islamic',value:'islamic'}].map( (m,idx) => {
        return <option key={`calendarmode${idx}`} value={m.value}>{m.label}</option>
      })}
    </Form.Select>
  )
}

const CacheToggle = (props) => {
  const [ state, dispatch ] = useContext(SettingsContext)
  const [checked, setChecked] = useState( (state.cache === 'on')? true : null );

  const toggleHandler = (e) => {
    setChecked(prev => !prev)
    dispatch({type: ACTIONS.TOGGLE_CACHE, payload: e.target.checked? 'on': 'off' })
  };

  return (
    <Form.Check type='switch' id='checkCache' className='mt-2'>
      <Form.Check.Input type='checkbox' isValid={false} onChange={(e) => toggleHandler(e)} checked={checked} />
      <Form.Check.Label>Cache Data</Form.Check.Label>
    </Form.Check>
  )
}