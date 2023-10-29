import React from 'react'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function FooterContainer(props) {
  return (
    <footer>
      <Container>
        <Row className="px-1 py-2">
          <Col sm className="text-end text-muted small">
            Sources: <a href="https://github.com/sebasstian23/ESP32-WeatherStation" rel="noreferrer" target="_blank">Weather Station</a>
            {" | "}
            <a href="https://github.com/sebasstian23/Server-WeatherStation" rel="noreferrer" target="_blank">Application</a>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
