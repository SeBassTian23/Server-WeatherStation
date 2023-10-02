import React, {useState, useEffect} from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Cards from './Cards'
import Almanac from '../Helpers/Almanac'

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)


export default function SubHeader(props) {

  const [data, setData] = useState({
    almanac: '',
    cards: [],
    selectedDate: new Date()
  });

  useEffect( () => {
    setData(props);
    console.log(data)
  }, [props])

  let summary = ''
  if (data.almanac != '')
    summary = <Almanac {...data.almanac} />
  
  if (data.cards && data.cards.length > 0)
    summary = (
      <Row id='summary-cards-lg' xs='2' sm='2' lg='4'>
        <Cards items={data.cards || []} size='lg' />
      </Row>
      )

  
    let header = dayjs(data.selectedDate).format('dddd')
    let subheader = dayjs(data.selectedDate).format('MMMM D, YYYY')

    if(data.period === 'day'){
      header = dayjs(data.selectedDate).format('dddd')
      subheader = dayjs(data.selectedDate).format('MMMM D, YYYY')
    }
    if(data.period === 'month'){
      header = dayjs(data.selectedDate).format('MMMM')
      subheader = dayjs(data.selectedDate).format('YYYY')
    }
    if(data.period === 'year'){
      header = dayjs(data.selectedDate).format('YYYY')
      subheader = dayjs(data.selectedDate).format('MMMM, YYYY')
    }

  return (
    <Row className='align-items-center pb-3'>
      <Col sm={{order:1}} className='order-2'>
        {summary}
      </Col>
      <Col sm={{span:4, order:2}} className='order-1 pb-4 pb-sm-0'>
        <Col className='text-center'>
          <h1 className='fw-light text-info'>{header}</h1>
          {subheader}
        </Col>
      </Col>
    </Row>
  )
}
