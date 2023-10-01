var express = require('express');
var router = express.Router();

/* GET home page. */
router.get(/^(?!\/(data|api|download|db)\/).+$/, function (req, res) {
  console.log(req.url.slice(1).split('/').join('-'))

  const titleAdd = req.url.slice(1).split('/').join('-') || null

  res.render('index', {
    "locale": "en_US",
    "description": "Personal Weatherstation",
    "keywords": "weather, temperature, humidity, pressure, air quality",
    "url": "https://weather.kuhlgert.com",
    "author": {
      "name": "Sebastian Kuhlgert",
      "email": "sebastian.kuhlgert@gmail.com",
      "url": "https://kuhlgert.com"
    },
    "title": titleAdd? `${titleAdd} | ` : '' + "Weather Station"
  });
});

module.exports = router;
