import React from "react";

export const SettingsContext = React.createContext({
  theme: 'light', // default value
  units:  'internation',
  toggleTheme: (a) => {
    console.log('theme',a)
  },
  toggleUnits: (a) => {
    console.log('units', a)
  },
});

export function useSettingsStore() {
  return React.useContext(SettingsContext);
}