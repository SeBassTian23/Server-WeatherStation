import React from 'react';

import Col from 'react-bootstrap/Col';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)

import {LabelUnitStrip, LabelGetUnit} from '../../helpers/label-format'

export default function Cards(props) {

  const items = props.items || []
  
  return (
    <>
      {items.map( (card,idx) => {
        
        let icon;
        if(card.icon){
          if(card.icon !== '↗' && card.icon !== '↘')
            icon = <i className={`${card.icon}`} />
          else
            icon = card.icon
        } 

        return (
          <Col className='text-center text-nowrap mb-2' key={idx}>
            <div className={`border ${card.size === 'sm' ? 'h-100 mini-card' : ''}`}>
              <div className={`fw-light mt-2 mb-0 ${card.size === 'lg' ? 'fs-4' : 'fs-5'}`} data-field={card.field}>
                {card.icon && <strong className='text-info indicator'>{icon}</strong>}
                {(card.label == "Sunrise" || card.label == "Sunset")? dayjs(card.value).format('LT') : card.value}
                {LabelGetUnit(card.label) &&
                  <span className='text-muted unit'>{LabelGetUnit(card.label)}</span>
                }
              </div>
              <span className='mb-2 d-block text-muted smaller'>{LabelUnitStrip(card.label)}</span>
            </div>
          </Col>
        )
      })}
    </>
  )
}

//       if title == "Sunrise"
//         - trend = "sunrise"

//       else if title == "Sunset"
//         - trend = "sunset"

//       else if title == "Pressure (PMSL)"
//         if Number(value)
//           - value = parseFloat(value).toFixed(0)

//       else if title == "AQI"
//         - trend = "tree"
//         - unit = "AQI"
//         if value >= 0 && value <= 50
//           - addClass = 'aqi-0-50'
//           - etitle = 'Good'
//         else if value >= 51 && value <= 100
//           - addClass = 'aqi-51-100'
//           - etitle = 'Moderate'
//         else if value >= 101 && value <= 150
//           - addClass = 'aqi-101-150'
//           - etitle = 'Unhealthy for Sensitive Groups'
//         else if value >= 151 && value <= 200
//           - addClass = 'aqi-151-200'
//           - etitle = 'Unhealthy'
//         else if value >= 201 && value <= 300
//           - addClass = 'aqi-201-300'
//           - etitle = 'Very Unhealthy'
//         else if value >= 301
//           - addClass = 'aqi-301'
//           - etitle = 'Hazardous'
//         else
//           - addClass = 'aqi-nan'
//           - etitle = 'Not available'

//       else if title == "UV-Index"
//           if value < 3
//             - addClass = 'uv-index-0-2'
//             - etitle = "Low"
//           else if value == 3 || value == 4 || value == 5
//             - addClass = 'uv-index-3-5'
//             - etitle = "Moderate"
//           else if value == 6 || value == 7
//             - addClass = 'uv-index-6-7'
//             - etitle = "High"
//           else if value == 8 || value == 9 || value == 10
//             - addClass = 'uv-index-8-10'
//             - etitle = "Very High"
//           else if value > 10
//             - addClass = 'uv-index-11'
//             - value = "11+"
//             - etitle = "Extreme"
//           else
//             - addClass = 'uv-index-nan'
//             - etitle = 'Not available'

//       if size && size == 'main'
//         h2.mt-2.mb-0(title=etitle, data-field=field) 
//           if trend && trend != "↗" && trend != "↘"
//             | #[span.text-info.indicator #[i(class='bi bi-'+trend)]]#{value}#[small.text-muted.unit #{unit}]
//           else
//             | #[span.text-info.indicator #{trend}]#{value}#[small.text-muted.unit #{unit}]
//       else
//         h4.fw-light.mt-2.mb-0(title=etitle, data-field=field) 
//           if title == "UV-Index"
//             | #[span(class=`index ${addClass}`) #{value}]
//           else if trend && trend != "↗" && trend != "↘"
//             | #[span.text-info.indicator #[i(class='bi bi-'+trend)]]#{value}#[small.text-muted.unit #{unit}]
//           else
//             | #[span.text-info.indicator #{trend}]#{value}#[small.text-muted.unit #{unit}]
    
//       if size == 'main'
//         if title == "AQI"
//           small.text-truncate.badge(class=addClass, style="max-width: 88%;") #{etitle}
//         else
//           small.mb-2.d-block.text-muted #{title}
//       else
//         if title == "Heat Index" && trend && trend != "↗" && trend != "↘"
//           if trend == "heat-index-0"
//             - etitle = "Caution"
//           else if trend == "heat-index-1"
//             - etitle = "Extreme Caution"
//           else if trend == "heat-index-2"
//             - etitle = "Danger"
//           else if trend == "heat-index-3"
//             - etitle = "Extreme Danger"

//           small.mb-2.d-block(title=etitle).text-muted.smaller #[i.bi.bi-exclamation-diamond-fill(class=trend)] #{title}
//         else
//           small.mb-2.d-block.text-muted.smaller #{title}

//       if title == 'UV-Index'
//         //- div(style=`background: lightgrey; width: 100%; height: 3px; margin-top: -3px;`)
//         div(style=`width: calc(100%*(${value/11})); height: 1px; margin-top: -1px;`, class=addClass)
