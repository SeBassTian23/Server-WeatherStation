import React, { useContext } from 'react'

import SidebarNavigation from './SidebarNavigation'
import SidebarTabs from './SidebarTabs'

import TabContainer from 'react-bootstrap/TabContainer'
import { TabsContext } from '../../context/tabsContext'

export default function Sidebar(props) {
  const [state, dispatch] = useContext(TabsContext);
  return (
    <TabContainer defaultActiveKey={state.tab || "calendar"}>
      <SidebarNavigation />
      <SidebarTabs {...props} />
    </TabContainer>
  )
}
