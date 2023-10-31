import React, { useState, useEffect, useContext } from 'react'

import { useNavigate } from "react-router-dom";

import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import TabPane from 'react-bootstrap/TabPane'

import Calendar from 'react-calendar';
import dayjs from 'dayjs'

import { Link } from 'react-router-dom'

import {SettingsContext} from '../../context/settingsContext'

import '../../styles/calendar.css';

function selectedDateFormat( selectedDate ){
    if(Array.isArray(selectedDate)){
        return [
            dayjs(selectedDate[0]).isValid()? dayjs(selectedDate[0]).toDate() : new Date(),
            dayjs(selectedDate[1]).isValid()? dayjs(selectedDate[1]).toDate() : new Date()
        ]
    }
    return dayjs(selectedDate).isValid()? dayjs(selectedDate).toDate() : new Date()
}

export default function TabCalendar(props) {

    const [dates, setDates] = useState({
        minDate: props.minDate? new Date(props.minDate) : new Date(),
        maxDate: props.maxDate? new Date(props.maxDate) : new Date(),
        selectedDate: selectedDateFormat(props.selectedDate)
    });

    useEffect(() => {
        setDates(dates => {return {...dates, ...{
                    minDate: props.minDate? new Date(props.minDate) : new Date(),
                    maxDate: props.maxDate? new Date(props.maxDate) : new Date(),
                    selectedDate: selectedDateFormat(props.selectedDate)
                } 
            } 
        })
    }, [props.selectedDate])
    return (
        <TabPane eventKey='calender'>
            <CalendarCard {...dates} />
            <Card className='rounded-0 my-2'>
                <Card.Body>
                    <Card.Title className='text-info mb-2'>
                        Shortcuts
                    </Card.Title>
                    <Row className='row-cols-2' id="shortcutlinks">
                        <Col>
                            <Link className="small" id="calendar-today" to="/" title="Show today's data"><i className="bi bi-calendar-event-fill"></i> Today</Link>
                        </Col>
                        <Col>
                            <Link className="small" id="calendar-yesterday" to={dayjs().subtract(1, 'day').format('/YYYY/MM/DD')} title="Show yesterday's data"><i className="bi bi-calendar-event-fill"></i> Yesterday</Link>
                        </Col>
                        <Col>
                            <Link className="small" id="calendar-week" to={dayjs().subtract(7, 'days').format('/YYYY/MM/DD')} title="Show data from a"><i className="bi bi-calendar-date-fill"></i> A Week Ago</Link>
                        </Col>
                        <Col>
                            <Link className="small" id="calendar-range" to={`/${dayjs().subtract(7, 'days').format('YYYY-MM-DD')},${dayjs().format('YYYY-MM-DD')}`} title="Show data for last 7 days"><i className="bi bi-calendar-range-fill"></i> Last 7 Days</Link>
                        </Col>
                        <Col>
                            <Link className="small" id="calendar-month" to={dayjs().format('/YYYY/MM')}><i className="bi bi-calendar-month-fill" title="Show data for this month"></i> This Month</Link>
                        </Col>
                        <Col>
                            <Link className="small" id="calendar-year" to={dayjs().format('/YYYY')} title="Show data for this year"><i className="bi bi-calendar3-fill"></i> This Year</Link>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-muted fw-light mt-2" style={{fontSize: '0.7rem'}}>
                            Hold down the shift key (⇧) to select a range between the current and the selected date.
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </TabPane>
    )
}

function CalendarCard(props) {
    let navigate = useNavigate();
    const onClickDay = (e, event) => {
        if(event.shiftKey){
            let start = props.selectedDate
            let end = e
            // Make sure the range is okay, if dates are selected
            // in reverse order
            if(!Array.isArray(props.selectedDate)){
                if(dayjs(end).isBefore(start)){
                    start = e
                    end = props.selectedDate
                }
            }
            else{
                start = start[0] // select the first element as the start day
                if(dayjs(end).isBefore(start)){
                    start = e
                    end = props.selectedDate[0]
                }
            }
            navigate( `/${dayjs(start).format('YYYY-MM-DD')},${dayjs(end).format('YYYY-MM-DD')}`)
        }
        else{
            if( dayjs(e).format('/YYYY/MM/DD') == dayjs().format('/YYYY/MM/DD') )
                navigate('/')
            else
                navigate(dayjs(e).format('/YYYY/MM/DD'))
        }
    }
    const onClickMonth = (e) => {
        navigate(dayjs(e).format('/YYYY/MM'))
    }
    const onClickYear = (e) => {
        navigate(dayjs(e).format('/YYYY'))
    }

    const [state] = useContext(SettingsContext);

    return (
        <Card className='rounded-0 my-2'>
            <Card.Body id='calendar'>
                <Calendar
                    calendarType={state.calendarType}
                    selectRange={false}
                    onClickYear={onClickYear}
                    onClickMonth={onClickMonth}
                    onClickDay={onClickDay}
                    minDate={props.minDate}
                    maxDate={props.maxDate}
                    value={props.selectedDate} />
            </Card.Body>
        </Card>
    )
}
