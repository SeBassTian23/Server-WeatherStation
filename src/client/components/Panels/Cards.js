import React, {useContext} from 'react';

import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)

import { SettingsContext } from '../../context/settingsContext';
import { unitConverter } from '../../helpers/convert';
import {LabelUnitStrip, LabelGetUnit} from '../../helpers/label-format'

import {aqi,uvi,hi} from '../../constants/parameters'
import timezoneAdjust from '../../helpers/timezone-adjust';

export default function Cards(props) {

  const [state] = useContext(SettingsContext);
  const items = props.items || []
  
  return (
    <>
      {items.map( (card,idx) => {
        
        const value = unitConverter(card.value, LabelGetUnit(card.label), state.units)
        
        // Content for card title tag
        let cardTitle = `${LabelUnitStrip(card.label)}: ${value.join(" ")}`
        
        let icon = null;

        if(card.trend)
          icon = card.trend

        // Temperature
        if (card.label == "Temperature [C]") {
          if (card.value <= 0)
            icon = <i className={`bi-thermometer-snow text-primary`} />
          else if (card.value < 10)
            icon = <i className={`bi-thermometer-low`} />
          else if (card.value > 35)
            icon = <i className={`bi-thermometer-sun text-danger`} />
          else if (card.value > 30)
            icon = <i className={`bi-thermometer-sun text-warning`} />
          else if (card.value > 25)
            icon = <i className={`i-thermometer-high`} />
          else
            icon = <i className={`bi-thermometer-half`} />
        }

        // Indicate Air Quality
        if(card.label === 'AQI'){
          icon = <i className={`bi-tree-fill`} />
          let idx = aqi.items.findIndex( itm => {
            const range = itm.label.split("-");
            return card.value >= parseInt(range[0]) && (card.value <= parseInt(range[1]) || Number.isNaN( parseInt(range[1]) ) )
          });
          if(idx > -1){
            icon = <i className={`bi-tree-fill`} style={{color: `${aqi.items[idx].color}`}} />
            cardTitle = `Air Quality: ${aqi.items[idx].title}`
          }
        }

        // Heat Index
        if(card.label === 'Heat Index [C]'){
          let idx = hi.items.findIndex( itm => {
            const range = itm.label.split("-");
            return card.value >= parseInt(range[0]) && (card.value <= parseInt(range[1]) || Number.isNaN( parseInt(range[1]) ) )
          });
          if(idx > -1){
            icon = <i className={`bi-exclamation-diamond-fill`} style={{color: `${hi.items[idx].color}`}} />
            cardTitle = `Heat Index: ${hi.items[idx].title}`
          }
        }

        // UV Index
        if(card.label === 'UV-Index'){
          let idx = uvi.items.findIndex( itm => {
            const range = itm.label.split("-");
            return card.value >= parseInt(range[0]) && (card.value <= parseInt(range[1]) || Number.isNaN( parseInt(range[1]) ) )
          });
          if(idx > -1 && card.value > 2){
            icon = <i className={`bi-exclamation-triangle-fill`} style={{color: `${uvi.items[idx].color}`}} />
            cardTitle = `UV-Index: ${uvi.items[idx].title}`
          }
        }

        if(card.label === 'rel. Humidity [%]')
          icon = <i className={`bi-moisture`} />

        if(card.label === "Pressure (PMSL) [hPa]")
          icon = <i className={`bi-speedometer`} />

        if(card.label === 'Sunrise'){
          icon = <i className='bi-sunrise-fill' />
          cardTitle = 'Sunrise (local time): ' + dayjs(timezoneAdjust(card.value, card.unit || 'UTC')).format('LT')
        }

        if(card.label === 'Sunset'){
          icon = <i className='bi-sunset-fill' />
          cardTitle = 'Sunset (local time): ' + dayjs(timezoneAdjust(card.value, card.unit || 'UTC')).format('LT')
        }

        return (
          <Col className='text-center text-nowrap mb-2' key={idx}>
            <Card className={ 'bg-light-subtle'} title={cardTitle.trimEnd()}>
              <div className={`mt-2 mb-0 ${card.size === 'lg' ? 'fs-4' : 'fs-5 fw-light'}`} data-field={card.field}>
                {icon && <strong className='text-info indicator'>{icon}</strong>}
                {(card.label == "Sunrise" || card.label == "Sunset")? dayjs(timezoneAdjust(card.value, card.unit || 'UTC')).format('LT') : value[0]}
                {LabelGetUnit(card.label) &&
                  <span className='text-muted unit'>{value[1]}</span>
                }
              </div>
              <span className='mb-2 d-block text-muted smaller'>{LabelUnitStrip(card.label)}</span>
            </Card>
          </Col>
        )
      })}
    </>
  )
}
