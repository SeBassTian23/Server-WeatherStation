import React from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {periodToStr, temperatureToStr, humidityToStr, airqualityToStr} from '../../helpers/almanac'


export default function Almanac(props) {

  if(!props.params)
    return <></>

  const period = periodToStr(props.type);
  const temperature = temperatureToStr( props.params['Temperature [C]'] || {}, props.type, props.units);
  const humidity = humidityToStr( props.params['rel. Humidity [%]'] || [], props.type);
  const airquality = airqualityToStr( props.params['AQI'] || [], props.type);

  if(!props.params['Temperature [C]'].avg && !props.params['rel. Humidity [%]'].avg && !props.params['AQI'].avg)
    return <></>

  return (
    <Row>
      <Col>
        {period} was {temperature}. The humidity levels were {humidity} and the average air quality was {airquality}.
      </Col>
    </Row>
  )
}