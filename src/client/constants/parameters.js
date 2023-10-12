export const aqi = {
  title: "Air Quality Index",
  source: "airnow.gov",
  url: "https://www.airnow.gov/aqi/aqi-basics/",
  items: [
    {
      color: "rgb(0,228,0)",
      title: "Good",
      label: "0-50",
      range: [0,50]
    },
    {
      color: "rgb(255,255,0)",
      title: "Moderate",
      label: "51-100",
      range: [51,100]
    },
    {
      color: "rgb(255,126,0)",
      title: "Unhealthy for sensitive groups",
      label: "101-150",
      range: [101,150]
    },
    {
      color: "rgb(255,0,0)",
      title: "Unhealthy",
      label: "151-200",
      range: [151,200]
    },
    {
      color: "rgb(153,0,76)",
      title: "Very Unhealthy",
      label: "201-300",
      range: [201,300]
    },
    {
      color: "rgb(76,0,38)",
      title: "Hazardous",
      label: "301 or higher",
      range: [301,Infinity]
    }
  ]
}

export const uvi = {
  title: "UV Index",
  source: "who.int",
  url: "https://www.who.int/news-room/q-a-detail/radiation-the-ultraviolet-(uv)-index",
  items: [
    {
      color: "rgb(61,164,44)",
      title: "Low",
      label: "0-2",
      range: [0,2]
    },
    {
      color: "rgb(255,243,0)",
      title: "Moderate",
      label: "3-5",
      range: [3,5]
    },
    {
      color: "rgb(241,138,0)",
      title: "High",
      label: "6-7",
      range: [6,7]
    },
    {
      color: "rgb(215,46,15)",
      title: "Very High",
      label: "8-10",
      range: [8-10]
    },
    {
      color: "rgb(178,102,161)",
      title: "Extreme",
      label: "11+",
      range: [11,Infinity]
    }
  ]
}

export const hi = {
  title: "Heat Index",
  source: "weather.gov",
  url: "https://www.weather.gov/ama/heatindex",
  items: [
    {
      color: "#fff300",
      title: "Caution",
      label: "27℃ - 32℃",
      range: [27,32]
    },
    {
      color: "#fdd015",
      title: "Extreme Caution",
      label: "32℃ - 39℃",
      range: [32,39]
    },
    {
      color: "#fb6600",
      title: "Danger",
      label: "39℃ - 51℃",
      range: [39,51]
    },
    {
      color: "#cc0003",
      title: "Extreme Danger",
      label: "52℃ or higher",
      range: [52, Infinity] 
    },
  ]
}