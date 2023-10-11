import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './styles/app.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import SettingsContextProvider from './context/settingsContext';

const root = createRoot( document.getElementById('root') )
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsContextProvider>
        <App />
      </SettingsContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
