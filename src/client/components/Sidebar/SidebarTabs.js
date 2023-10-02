import React from 'react'

import TabCalendar from './TabCalendar'
import TabStation from './TabStation'
import TabSettings from './TabSettings'
import TabInfo from './TabInfo'

import TabContent from 'react-bootstrap/TabContent'

export default function SidebarTabs(props) {
  return (
    <TabContent>
      <TabCalendar {...props.calendar} />
      <TabStation {...props.station} />
      <TabSettings />
      <TabInfo />
    </TabContent>
  )
}
