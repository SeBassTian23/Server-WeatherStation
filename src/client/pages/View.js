import React, { useEffect, useState, useContext } from 'react'

import SubHeader from '../components/Panels/SubHeader'
import Summary from '../components/Panels/Summary'
import Sidebar from '../components/Sidebar/Sidebar'
import Graphs from '../components/Panels/Graphs'
import Latest from '../components/Panels/Latest'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { SettingsContext } from '../context/settingsContext'
import TabsContextProvider from '../context/tabsContext'

export default function View(props) {

  const [state] = useContext(SettingsContext);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true)

  // On start connect to server for stream
  useEffect(() => {
    const sse = new EventSource('/data/stream',
      { withCredentials: true });
    function getRealtimeData(data) {
      // process the data here,
      // then pass it to state to be rendered
      fetch('/api/')
        .then(res => res.json())
        .then(obj => {
          setData(obj.body);
        })
        .catch((err) => {
          console.error(err.message);
        });
    }
    sse.onmessage = e => getRealtimeData(e.data);
    sse.onerror = () => {
      // error log here 
      sse.close();
    }
    return () => {
      sse.close();
    };
  }, []);

  // On props change fetch new data
  useEffect(() => {
    setLoading(true);
    var cachedData = {};
    if (state.cache === 'on' && props.path !== '/') {
      cachedData = localStorage.getItem('cachedData') || '{}';
      cachedData = JSON.parse(cachedData)
      if (cachedData[props.path] !== undefined) {
        fetch('/data/status')
          .then(res => res.json())
          .then(obj => {
            setData({ ...cachedData[props.path], ...{ station: obj.body.station } });
            setLoading(false);
          })
          .catch((err) => {
            console.error(err.message);
          });
        return
      }
    }

    fetch('/api' + props.path)
      .then(res => res.json())
      .then(obj => {
        if (state.cache === 'on' && props.path !== '/') {
          cachedData[props.path] = obj.body;
          delete cachedData[props.path].station
          localStorage.setItem('cachedData', JSON.stringify(cachedData))
        }
        setData(obj.body);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err.message);
      });
  }, [props.path]);

  return (
    <main>
      <Container>
        <SubHeader isLoading={loading} {...data.subheader} {...data.datetime} />
        <Row className='align-items-top pb-4'>
          <Col sm>
            <Summary isLoading={loading} {...data.summary} {...data.datetime} />
          </Col>
          <Col as='aside' lg='4' className='pt-4 pt-lg-0 d-print-none'>
            <TabsContextProvider>
              <Sidebar isLoading={loading} calendar={data.calendar} station={data.station} {...data.datetime} />
            </TabsContextProvider>
          </Col>
        </Row>
      </Container>
      <Container>
        <Graphs isLoading={loading} {...data.graphs} {...data.datetime} />
      </Container>
      {props.path === '/' &&
        <Container>
          <Latest isLoading={loading} {...data.table} {...data.datetime} />
        </Container>
      }
    </main>
  )
}
