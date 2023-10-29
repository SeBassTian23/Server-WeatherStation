import React, {useState, useEffect, useContext} from 'react'

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Cards from './Cards'
import Almanac from '../Helpers/Almanac'

import {SettingsContext} from '../../context/settingsContext'

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(localizedFormat)
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.extend(advancedFormat)
dayjs.extend(timezone)

import timezoneAdjust from '../../helpers/timezone-adjust';

export default function SubHeader(props) {

  const [state] = useContext(SettingsContext);

  const [data, setData] = useState({
    almanac: '',
    cards: [],
    period: null,
    selectedDate: new Date(),
    timezone: 'UTC'
  });

  useEffect( () => {
    setData(data => {
      return {...data,...props}
    });
  }, [props])

  let summary = ''
  if (data.almanac != '')
    summary = <Almanac {...data.almanac} units={state.units} />
  
  if (data.cards && data.cards.length > 0)
    summary = (
      <Row id='summary-cards-lg' xs='2' sm='2' lg='4'>
        <Cards items={data.cards || []} size='lg' />
      </Row>
      )

  let headerFormat = 'dddd'
  let subheaderFormat = 'MMMM D, YYYY | hh:mm a (z)'

  if(data.period === 'day'){
    subheaderFormat = 'MMMM D, YYYY'
  }
  if(data.period === 'month'){
    headerFormat = 'MMMM'
    subheaderFormat = 'YYYY'
  }
  if(data.period === 'year'){
    headerFormat = 'YYYY'
    subheaderFormat = 'MMMM, YYYY'
  }

  let header, subheader;

  if(data.period !== 'range'){
    header = dayjs(data.selectedDate).format(headerFormat)
    subheader = dayjs.tz(dayjs(data.selectedDate), data.timezone).format(subheaderFormat)
  }

  if(data.period === 'range'){
    header = dayjs.duration( dayjs(data.selectedDate[1]).diff(dayjs(data.selectedDate[0]), 'day') , "days").humanize();
    subheader = `${dayjs(timezoneAdjust(data.selectedDate[0], data.timezone)).format('MMMM D, YYYY')} - ${dayjs(timezoneAdjust(data.selectedDate[1], data.timezone)).format('MMMM D, YYYY')}`
  }

  return (
    <Row className='align-items-center pb-3'>
      <Col sm={{order:1}} className='order-2'>
        {summary}
      </Col>
      <Col sm={{span:4, order:2}} className='order-1 pb-4 pb-sm-0'>
        <Col className='text-center'>
          <span className='fs-1 fw-bold text-info d-block'>{header}</span>
          {subheader}
        </Col>
      </Col>
    </Row>
  )
}
