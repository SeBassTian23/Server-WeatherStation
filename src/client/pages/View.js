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

    const fetchData = async( useCache, path )  => {

      let cached;
      if (useCache === 'on' && path !== '/') {
        if ('caches' in window) {
          const fetchFromCache = async (path) => {
            const cache = await caches.open('weather-station');
                  
            // Try to get from cache first
            const cachedResponse = await cache.match(path);
            if (cachedResponse) {
              return await cachedResponse.json();
            }
          };
          cached = await fetchFromCache(path);
        }
        else {
          const fetchFromLocalStorage = async (path) => {
            let cachedData = localStorage.getItem('cachedData') || '{}';
            cachedData = JSON.parse(cachedData);
            return cachedData[path];
          }
          cached = await fetchFromLocalStorage(path);
        }
      }

      if(cached !== undefined){
        fetch('/data/status')
          .then(res => res.json())
          .then(obj => {
            setData({ ...cached, ...{ station: obj.body.station }, ...{ calendar: {maxDate: obj.body.calendar.maxDate } } });
            setLoading(false);
          })
          .catch((err) => {
            console.error(err.message);
          });
      }
      else {
        fetch('/api' + props.path)
        .then(res => res.json())
        .then(obj => {
          setData(obj.body);
          setLoading(false);
          if (state.cache === 'on' && props.path !== '/') {
            if ('caches' in window) {
              let cachedData = obj.body;
              delete cachedData.station;
              const response = new Response(JSON.stringify(cachedData), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Date': new Date().toISOString()
                }
              });
              caches.open('weather-station').then( e => e.put(props.path, response) )
            }
            else {
              // Fall back to local storage
              cachedData = localStorage.getItem('cachedData') || '{}';
              cachedData = JSON.parse(cachedData);
              cachedData[props.path] = obj.body;
              delete cachedData[props.path].station
              localStorage.setItem('cachedData', JSON.stringify(cachedData))
            }
          }
        })
        .catch((err) => {
          setLoading(false);
          if (err.code === 22 || err.code === 1014 || err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED")
            localStorage.removeItem('cachedData')
        });
      }
    }

    fetchData( state.cache, props.path);

  }, [props.path]);

  return (
    <main>
      <Container>
        <SubHeader isLoading={loading} {...data.subheader} {...data.datetime}  {...data.station} />
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
