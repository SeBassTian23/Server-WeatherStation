var express = require('express');
var router = express.Router();

const DB_TYPE = process.env.SQLITE_FILE ? "SQLITE" : process.env.MONGO_CONNECTION_STRING ? "MONGODB" : null

/* GET home page. */
router.get(/^(?!\/(data|api|download|db)\/).+$/, function (req, res) {

  const titleAdd = req.url.slice(1).split('/').join('-') || null

  if(!DB_TYPE){
    res.render('error', {
      error: 'Database Issue',
      errormsg: 'No database connection has been defined. Use SQLITE or MongoDB to store your weather Data.'
    });
    return 
  }

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
