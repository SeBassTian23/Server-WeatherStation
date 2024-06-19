import React, { createContext, useReducer, useMemo, useEffect } from "react";
import settingsReducer from "./settingsReducer";

import { getStoredValue } from '../helpers/localstorage'
import { guessPreferences } from '../helpers/preferences'

export const initialState = {
  theme: getStoredValue('theme') || 'auto',
  calendarType: getStoredValue('calendarType') || guessPreferences('calendar') || 'iso8601',
  units: getStoredValue('units') || guessPreferences('units') || 'metric',
  peaks: getStoredValue('peaks') || false,
  cache: getStoredValue('cache') || 'off'
}

export const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  const contextValue = useMemo(() => {
    return [state, dispatch];
  }, [state, dispatch]);

  useEffect(() => {
    for (let item in state) {
      localStorage.setItem(item, state[item])
    }
  }, [state])

  useEffect(() => {

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.body.setAttribute('data-bs-theme', theme);
    })

    let theme = state.theme;

    if (state.theme === 'auto')
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    document.body.setAttribute('data-bs-theme', theme);

  }, [state.theme])

  useEffect(() => {
    if (state.cache === 'off')
      localStorage.removeItem('cachedData');
  }, [state.cache])

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}

export default SettingsContextProvider
