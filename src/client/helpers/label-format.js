const cols = [
  "Temperature [C]",
  "rel. Humidity [%]",
  "Pressure (PMSL) [hPa]",
  "AQI",
  "UV-Index",
  "Heat Index [C]",
  "Dew Point [C]",
  "PM1.0 [ug/m3]",
  "PM2.5 [ug/m3]",
  "PM10.0 [ug/m3]",
  ">0.3 [um/0.1L]",
  ">0.5 [um/0.1L]",
  ">1.0 [um/0.1L]",
  ">2.5 [um/0.1L]",
  ">5.0 [um/0.1L]",
  ">10.0 [um/0.1L]",
  "Light (visible)",
  "Light (IR)",
  "Light (UV)",
  "Air [KOhms]",
  "Pressure [hPa]",
  "Battery [V]"
]

">2.5 [um/0.1L]".replace(/\[um\/0.1L\]/i, '[µm/0.1L]')

export const LabelUnitFormat = (str) => {
  let label = cols.find( val => val === str )

  if( label !== undefined ){
    return str.replace(/\[C\]/i, '[℃]')
              .replace(/\[F\]/i, '[℉]')
              .replace(/\[(micro\s?|u)g\/m3\]/i, '[µg/m³]')
              .replace(/\[um\/0.1L\]/i, '[µm/0.1L]')
              .replace(/\[KOhms\]/, '[kΩ]');
  }
  return str
}

export const LabelUnitStrip = (str) => {
  return str.replace(/\s?\[(C|F|%|hPa|V|ug\/m3|um\s|KOhms|um\/0.1L|℃|℉|µg\/m³|kΩ|µm\/0.1L|a\.u\.)\]\s?/i, '');
}

export const LabelGetUnit = (str) => {
  str = LabelUnitFormat(str);
  let unit = str.match(/\[(.*)\]$/i);
  return unit? unit[1]: null;
}