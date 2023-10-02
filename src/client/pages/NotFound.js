import React from 'react'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {Link} from 'react-router-dom'

export default function NotFound(props) {
  return (
    <main>
      <Container>
        <Row className="d-flex align-items-center">
          <Col className="p-3">
            <h3 className="mb-4">
              <i className="bi-bug-fill"></i> Page not found
            </h3><Link className="btn btn-light" to="/">Back to Today's Weather</Link>
          </Col>
          <Col className="col-md-8 col-sm-12 p-3">
            <img className="img-fluid" src="/images/404.svg" alt="404 error" />
          </Col>
        </Row>
      </Container>
    </main>
  )
}
