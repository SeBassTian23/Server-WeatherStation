import {fahrenheitCountries} from '../constants/units-imperial'
import {sundayFirst, mondayFirst, saturdayFirst} from '../constants/weekday-start'

// Guess preferred calendar or units based on the RFC 5646 standard
export const guessPreferences = (setting) => {
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