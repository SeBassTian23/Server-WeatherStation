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
            Weather Station | <a href="https://github.com/sebasstian23/Server-WeatherStation" rel="noreferrer" target="_blank">GitHub</a>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
