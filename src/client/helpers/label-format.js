
export const LabelUnitFormat = (str) => {
  if( typeof str === 'string' ){
    return str.replace(/\[C\]/i, '[℃]')
              .replace(/\[F\]/i, '[℉]')
              .replace(/\[(micro\s?|u)g\/m3\]/i, '[µg/m³]')
              .replace(/\[um\/0.1L\]/i, '[µm/0.1L]')
              .replace(/\[KOhms\]/, '[kΩ]');
  }
  return str;
}

export const LabelUnitStrip = (str) => {
  return str.replace(/\s?\[(C|F|%|hPa|V|ug\/m3|um\s|KOhms|um\/0.1L|℃|℉|µg\/m³|kΩ|µm\/0.1L|a\.u\.)\]\s?/i, '');
}

export const LabelGetUnit = (str) => {
  str = LabelUnitFormat(str);
  let unit = str.match(/\[(.*)\]$/i);
  return unit? unit[1]: null;
}