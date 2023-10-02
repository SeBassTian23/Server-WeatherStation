import React from 'react'

import SidebarNavigation from './SidebarNavigation'
import SidebarTabs from './SidebarTabs'

import TabContainer from 'react-bootstrap/TabContainer'

export default function Sidebar(props) {
  return (
    <TabContainer defaultActiveKey="calender">
      <SidebarNavigation />
      <SidebarTabs {...props} />
    </TabContainer>
  )
}
