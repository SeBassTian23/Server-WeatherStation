import React from 'react'

import Card from 'react-bootstrap/Card'
import Nav from 'react-bootstrap/Nav'
import NavItem from 'react-bootstrap/NavItem'
import NavLink from 'react-bootstrap/NavLink'

export default function SidebarNavigation() {
  return (
    <Card className='rounded-0 p-0 mb-2' id='pills-calendar-tab'>
      <Nav as='ul' fill justify variant='pills' id="pills-tab" role="tablist">
        <SidebarNavItem eventKey='calender' label='Calendar' icon='bi-calendar-event' id="pills-calendar-tab" />
        <SidebarNavItem eventKey='station' label='Station' icon='bi-broadcast-pin' id="pills-station-tab" />
        <SidebarNavItem eventKey='settings' label='Settings' icon='bi-sliders' id="pills-settings-tab" />
        <SidebarNavItem eventKey='info' label='Info' icon='bi-info-circle' id="pills-help-tab" />
      </Nav>
    </Card>
  )
}

function SidebarNavItem( props ) {
  return(
    <NavItem as='li' role="presentation">
      <NavLink as='button' eventKey={props.eventKey} className='py-1' type="button" role="tab" aria-selected="false">
        <i className={`bi ${props.icon} fs-5`} ></i> <small className='d-block smaller'>{props.label}</small>
      </NavLink>
    </NavItem>
  )
}