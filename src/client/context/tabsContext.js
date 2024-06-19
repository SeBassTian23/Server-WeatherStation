import React, { createContext, useReducer, useMemo, useEffect } from "react";
import tabsReducer from "./tabsReducer";

import { getStoredValue } from '../helpers/localstorage'

export const initialState = {
  tab: getStoredValue('tab') || 'calendar'
}

export const TabsContext = createContext();

const TabsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tabsReducer, initialState);

  const contextValue = useMemo(() => {
    return [state, dispatch];
  }, [state, dispatch]);

  useEffect(() => {
    for (let item in state) {
      localStorage.setItem(item, state[item])
    }
  }, [state])

  return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
}

export default TabsContextProvider;