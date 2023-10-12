import React from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {periodToStr, temperatureToStr, humidityToStr, airqualityToStr} from '../../helpers/almanac'


export default function Almanac(props) {

  if(!props.params)
    return <></>

  const period = periodToStr(props.type);
  const temperature = temperatureToStr( props.params['Temperature [C]'] || {}, props.type);
  const humidity = humidityToStr( props.params['rel. Humidity [%]'] || [], props.type);
  const airquality = airqualityToStr( props.params['AQI'] || [], props.type);

  if(temperature.props.children === 'N/A' && humidity.props.children === 'N/A' && airquality.props.children === 'N/A')
    return <></>

  return (
    <Row>
      <Col>
        {period} was {temperature}. The humidity levels were {humidity} and the average air quality was {airquality}.
      </Col>
    </Row>
  )
}