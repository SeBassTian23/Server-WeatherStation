import React, {useContext, useEffect} from 'react'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {Link} from 'react-router-dom'

import { SettingsContext } from '../context/settingsContext'


export default function NotFound(props) {

  const [state] = useContext(SettingsContext);

  useEffect( () => {

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      let theme = window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light'
      document.body.setAttribute('data-bs-theme', theme);
    })

    let theme = state.theme;

    if(state.theme === 'auto')  
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light';
    
    document.body.setAttribute('data-bs-theme', theme);

  }, [state.theme])
  
  return (
    <main>
      <Container>
        <Row className="d-flex align-items-center">
          <Col className="p-3">
            <h3 className="mb-4">
              <i className="bi-bug-fill"></i> Page not found
            </h3><Link className="btn btn-outline-info" to="/">Back to Today's Weather</Link>
          </Col>
          <Col className="col-md-8 col-sm-12 p-3">
            <img className="img-fluid" id="img-404" src="/images/404.svg" alt="404 error" />
          </Col>
        </Row>
      </Container>
    </main>
  )
}
