import React, { useEffect, useState } from 'react'

import SubHeader from '../components/Panels/SubHeader'
import Summary from '../components/Panels/Summary'
import Sidebar from '../components/Sidebar/Sidebar'
import Graphs from '../components/Panels/Graphs'
import Latest from '../components/Panels/Latest'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// import useEventStream from '../hooks/useEventStream'
import {apiStructure} from '../constants/api'

export default function Current(props) {

  const [data, setData] = useState(apiStructure);

  useEffect(() => {
    const sse = new EventSource('/data/stream',
      { withCredentials: true });
    function getRealtimeData(data) {
      // process the data here,
      // then pass it to state to be rendered
      console.log('Data udpated')
      fetch('/api/')
        .then(res => res.json())
        .then(obj => {  
          setData(obj.body);
        })
        .catch((err) => {
          console.log(err.message);
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

  useEffect(() => {
    fetch('/api/')
      .then(res => res.json())
      .then(obj => {  
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
            <Summary {...data.summary} />
          </Col>
          <Col as='aside' sm='4' className='pt-4 pt-sm-0 d-print-none'>
            <Sidebar {...data.sidebar} />
          </Col>
        </Row>
      </Container>
      <Container>
        <Graphs {...data.graphs}/>
      </Container>
      <Container>
        <Latest {...data.table} />
      </Container>
    </main>
  )
}
