import React, { createContext, useReducer, useMemo, useEffect } from "react";
import settingsReducer from "./settingsReducer";

export const initialState = {
  theme: getStoredValue('theme') || 'auto',
  calendarType: getStoredValue('calendarType') || guessPreferences('calendar') || 'iso8601',
  units: getStoredValue('units') || guessPreferences('units') ||  'metric',
  peaks: getStoredValue('peaks') || false,
  cache: getStoredValue('cache') || 'off'
}

export const SettingsContext = createContext();

const SettingsContextProvider = ({children}) => {
  const [state,dispatch] = useReducer(settingsReducer, initialState);

  const contextValue = useMemo(() => {
    return [state,dispatch];
  }, [state, dispatch]);

  useEffect( () => {
    for(let item in state){
      localStorage.setItem(item, state[item])
    }
  }, [state])

  useEffect(()=>{

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      let theme = window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light'
      document.body.setAttribute('data-bs-theme', theme);
    })

    let theme = state.theme;

    if(state.theme === 'auto')  
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light';
    
    document.body.setAttribute('data-bs-theme', theme);

  },[state.theme])

  useEffect( () => {
    if(state.cache === 'off')
      localStorage.removeItem('cachedData');
  }, [state.cache])

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}

export default SettingsContextProvider

// Get and validate value from local storage
function getStoredValue(item) {
  let value = localStorage.getItem(item);
  // Valid theme values
  if( item === 'theme' && ['auto', 'light', 'dark'].indexOf(value) === -1 )
    return null;
  // Valid calendar types
  if( item === 'calendarType' && ['gregory','iso8601','hebrew','arabic'].indexOf(value) === -1 )
    return null;
  // Valid units
  if( item === 'units' && ['metric','imperial'].indexOf(value) === -1 )
    return null;
  // Valid peaks
  if( item === 'peaks' && ['show', 'hide'].indexOf(value) === -1 )
    return null;
  // Valid cache options
  if( item === 'cache' && ['on','off'].indexOf(value) === -1 )
    return null;
  return value;
}

import {fahrenheitCountries} from '../constants/units-imperial'
import {sundayFirst, mondayFirst, saturdayFirst} from '../constants/weekday-start'

// Guess preferred calendar or units based on the RFC 5646 standard
function guessPreferences(setting){
  const userLanguage = navigator.language || navigator.userLanguage || 'en-US'

  if(setting === 'calendar'){
    if(sundayFirst.includes(userLanguage))
      return userLanguage === 'he-IL'? 'hebrew' : 'gregory'
    if(mondayFirst.includes(userLanguage))
      return 'iso8601'
    if(saturdayFirst.includes(userLanguage))
      return 'islamic'  
  }
  if(setting === 'units'){
    return fahrenheitCountries.includes(userLanguage)? 'imperial' : 'metric'
  }
  return null;
}
