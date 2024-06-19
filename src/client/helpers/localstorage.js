// Get and validate value from local storage
export const getStoredValue = (item) => {
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