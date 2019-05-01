'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use(express.static('./'));
app.get('/',(request,response) => {
  response.status(200).send('Connected!');
});

app.get('/location',(request,response) => {
  try {
    const location = require('./data/geo.json');
    const res = parserExplorer(location,request);
    response.send(res);
  } catch(err) {
    handleError(err, response);
  }
});

app.get('/weather', (request, response) => {
  let forecasts = sendWeather(request, response);
  response.send(forecasts);
});

app.use('*', (request, response) => response.send('This route does not exist'));

app. listen (PORT, () => {
  console.log(`Listen on port: ${PORT}`);
});

const parserExplorer = (location, req) => {
  const loc = new Location(req.query.data, location.results[0].formatted_address, location.results[0].geometry.location.lat, location.results[0].geometry.location.lng);
  return loc;
};

function sendWeather() {
  const weather = require('./data/darksky.json');
  let forecastArray = [];
  weather.daily.data.forEach(element => {
    forecastArray.push(new Forecast(element.time, element.summary));
  });
  return forecastArray;
}

function Forecast(time, forecast) {
  this.forecast = forecast;
  this.time = new Date(time * 1000).toString().slice(0, 15);
  this.created_at = Date.now();
}

function Location(query, name, lat, lon) {
  this.search_query = query;
  this.formatted_query = name;
  this.latitude = lat;
  this.longitude = lon;
}

function handleError(err, res) {
  if (err) res.status(500).send('Sorry, something went wrong');
}
