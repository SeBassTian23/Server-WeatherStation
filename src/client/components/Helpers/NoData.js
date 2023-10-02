import React from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function NoData() {
  return (
    <Row>
      <Col className='text-center'>
        <i className='bi-activity text-muted opacity-25' style={{fontSize: '12em'}} />
        <p className='fw-light'>No data found&hellip;</p>
      </Col>
    </Row>
  )
}
