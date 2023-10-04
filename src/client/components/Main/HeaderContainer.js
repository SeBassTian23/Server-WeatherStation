import React from 'react'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';

export default function HeaderContainer(props) {
  return (
    <header>
      <Navbar bg="dark" className='align-items-center border-bottom border-5 border-info pb-1 mb-3 pt-2'>
        <Container>
          <Row>
            <Col sm className='ps-sm-0 ps-lg-5'>
              <h2 className='text-light'>
                Weather Station
                <small className='text-secondary fs-5'> {/*font-size: 0.5em; */}
                  {props.locationName}
                </small>
              </h2>
            </Col>
          </Row>
        </Container>
      </Navbar>
    </header>
  )
}
