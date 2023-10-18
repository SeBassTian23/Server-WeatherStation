import React, { useContext, useEffect, useState } from 'react'

import SubHeader from '../components/Panels/SubHeader'
import Summary from '../components/Panels/Summary'
import Sidebar from '../components/Sidebar/Sidebar'
import Graphs from '../components/Panels/Graphs'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { apiStructure } from '../constants/api'
import { SettingsContext } from '../context/settingsContext'

export default function Past(props) {

  const [state] = useContext(SettingsContext);
  const [data, setData] = useState(apiStructure);

  useEffect(() => {
    var cachedData = {};
    if (state.cache === 'on') {
      cachedData = localStorage.getItem('cachedData') || '{}';
      cachedData = JSON.parse(cachedData)
      if (cachedData[props.path] !== undefined) {
        fetch('/data/status')
          .then(res => res.json())
          .then(obj => {
            setData({ ...cachedData[props.path], ...obj.body });
          })
          .catch((err) => {
            console.log(err.message);
          });
        return
      }
    }

    fetch('/api' + props.path)
      .then(res => res.json())
      .then(obj => {
        if (state.cache === 'on') {
          cachedData[props.path] = obj.body;
          delete cachedData[props.path].sidebar
          localStorage.setItem('cachedData', JSON.stringify(cachedData))
        }
        setData(obj.body);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [props.path]);

  return (
    <main>
      <Container>
        <SubHeader {...data.subheader} {...data.sidebar.calendar} period={data.summary.period || 'now'} />
        <Row className='align-items-top pb-4'>
          <Col sm>
            <Summary {...data.summary} selectedDate={data.sidebar.calendar.selectedDate} />
          </Col>
          <Col as='aside' sm='4' className='pt-4 pt-sm-0 d-print-none'>
            <Sidebar {...data.sidebar} />
          </Col>
        </Row>
      </Container>
      <Container>
        <Graphs {...data.graphs} selectedDate={data.sidebar.calendar.selectedDate} timezone={data.sidebar.station.device.location.timezone} />
      </Container>
    </main>
  )
}
