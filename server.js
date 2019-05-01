'use strict';

require('dotenv').config();
var lata;
var longa;
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

app.use(express.static('./'));
app.get('/',(request,response) => {
  response.status(200).send('Connected!');
});

app.get('/location',(request,response) => {
  try {
    sendLocation(request, response);
  } catch(err) {
    handleError(err, response);
  }
});

app.get('/weather', (request, response) => {
  // let forecasts = sendWeather(request, response);
  // response.send(forecasts);
  try {
    const darkUrl = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lata},${longa}`;
    //console.log(mapsUrl);

    superagent.get(darkUrl)
      .end( (err,darkSkyApiResponse) => {
        //console.log(darkSkyApiResponse.body);
        const darkSkyDailyData = darkSkyApiResponse.body.daily.data;
        console.log('hi1');
        const darkSkyDailyArr = darkSkyDailyData.map(element => {
          return new Forecast(element.summary, element.time);
        });
        console.log('my dark array',darkSkyDailyArr);
        response.send(darkSkyDailyArr);
      });
  } catch(err) {
    handleError(err, response);
  }
});

app.use('*', (request, response) => response.send('This route does not exist'));

app. listen (PORT, () => {
  console.log(`Listen on port: ${PORT}`);
});


// function sendWeather() {
//   const weather = require('./data/darksky.json');
//   let forecastArray = weather.daily.data;
//   let someArr = [];
//   forecastArray.map(element => {
//     someArr.push(new Forecast(element.time, element.summary));
//   });
//   return someArr;
// }
// console.log('should return weather', sendWeather());
function sendLocation(request, response){
  const queryData = request.query.data;
  const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GEOCODE_API_KEY}`;

  superagent.get(mapsUrl)
    .end( (err,googleMapsApiResponse) => {
      // console.log(googleMapsApiResponse.body);
      const location = new Location(queryData, googleMapsApiResponse.body);
      lata = location.latitude;
      longa = location.longitude;
      response.send(location);
    });
}

function Forecast(summary,time) {
  this.forecast = summary;
  this.time = new Date(time * 1000).toString().slice(0, 15);
  this.created_at = Date.now();
}

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}

function handleError(err, res) {
  if (err) res.status(500).send('Sorry, something went wrong');
}
