import React, { useContext } from 'react'

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import TabPane from 'react-bootstrap/TabPane'

import Form from 'react-bootstrap/Form'

import {SettingsContext} from '../../context/settings';

export default function TabSettings(props) {

  // constructor(props) {
  //   super(props);
  // }

  // var radioElDisplayMode = document.querySelectorAll('input[name=radioDisplayMode]');
  //     radioElDisplayMode.forEach(function(el){
  //       document.cookie.split(";").forEach(function(c) {
  //         var cc = c.trim().split("=");
  //         if( cc[0] == "mode" && cc[1] == el.value){
  //           el.checked = true;
  //           document.querySelector('html').dataset.theme = `theme-${el.value}`;
  //         }
  //       });
  //       el.addEventListener('change', function (event) {
  //         var value = event.target.value;
  //         document.querySelector('html').dataset.theme = `theme-${value}`;
  //         document.cookie = `mode=${value};path=/`;
  //       });
  //     });
  return (
    <TabPane eventKey='settings'>
      <Card>
        <Card.Body>
          <Card.Title className='text-info'>Settings</Card.Title>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Application</Card.Subtitle>
              <UnitsToggleRadio />
              <Form.Text className="text-muted">Display values in imperial units</Form.Text>
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Display Mode</Card.Subtitle>
              <ThemeToggleSelect />
              <Form.Text className="text-muted">Select Light/Dark Mode</Form.Text>
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Calendar</Card.Subtitle>
              <CalendarToggleSelect />
              <Form.Text className="text-muted">Select Type of Calendar</Form.Text>
            </Col>
          </Row>
          <Row className='py-3'>
            <Col>
              <Card.Subtitle>Cache</Card.Subtitle>
              <CacheToggleRadio />
              <Form.Text className="text-muted">Cache Data from past Days when viewed</Form.Text>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </TabPane>
  )
}

const UnitsToggleRadio = (props) => {
  const settings = useContext(SettingsContext)
  return (
    <Form.Check type='switch' id='checkImpericalUnits' className='mt-2'>
      <Form.Check.Input type='checkbox' isValid={false} onChange={settings.toggleUnits} />
      <Form.Check.Label>Imperial Units <small className='text-muted'>(℉, inHg)</small></Form.Check.Label>
    </Form.Check>
  )
}

const ThemeToggleSelect = (props) => {
  const { theme, toggleTheme } = useContext(SettingsContext);
  return (
    <Form.Select onChange={toggleTheme} aria-label="Select Display Mode" id='radioDisplayModeLight' size='sm' className='mt-2'>
      {[{label:'Auto',value:'auto'},{label:'Light',value:'light'},{label:'Dark',value:'dark'}].map( (m,idx) => {
        return <option key={`displaymode${idx}`} value={m.value} defaultValue={theme}>{m.label}</option>
      })}
    </Form.Select>
  )
}

const CalendarToggleSelect = (props) => {
  const { calendar, toggleCalendar } = useContext(SettingsContext);
  return (
    <Form.Select onChange={toggleCalendar} aria-label="Select Display Mode" id='radioCalendarTypeSelect' size='sm' className='mt-2'>
      {[{label:'Gregory',value:'gregory'},{label:'ISO8601',value:'iso8601'},{label:'Hebrew',value:'hebrew'},{label:'Islamic',value:'islamic'}].map( (m,idx) => {
        return <option key={`calendarmode${idx}`} value={m.value} defaultValue={calendar}>{m.label}</option>
      })}
    </Form.Select>
  )
}

const CacheToggleRadio = (props) => {
  const settings = useContext(SettingsContext)
  return (
    <Form.Check type='switch' id='checkCache' className='mt-2'>
      <Form.Check.Input type='checkbox' isValid={false} onChange={settings.toggleCache} />
      <Form.Check.Label>Cache Data</Form.Check.Label>
    </Form.Check>
  )
}