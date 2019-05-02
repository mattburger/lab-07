'use strict';

require('dotenv').config();
var lata;
var longa;
var city;
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const superagent = require('superagent');
const pg = require('pg');
const sql = new pg.Client(process.env.DATABASE_URL);


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
    sendWeather(request, response);
  } catch(err) {
    handleError(err, response);
  }
});

app.get('/events', (request, response) => {
  try{
    sendEvents(request, response);
  }catch(err){
    handleError(err, response);
  }
});

app.use('*', (request, response) => response.send('This route does not exist'));

app. listen (PORT, () => {
  console.log(`Listen on port: ${PORT}`);
});

function sendLocation(request, response){
  const queryData = request.query.data;
  const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryData}&key=${process.env.GEOCODE_API_KEY}`;

  superagent.get(mapsUrl)
    .end( (err,googleMapsApiResponse) => {
      const location = new Location(queryData, googleMapsApiResponse.body);
      lata = location.latitude;
      longa = location.longitude;
      city = location.formatted_query;
      response.send(location);
    });
}

function sendWeather(request, response) {
  const darkUrl = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lata},${longa}`;

  superagent.get(darkUrl)
    .end( (err,darkSkyApiResponse) => {
      const darkSkyDailyData = darkSkyApiResponse.body.daily.data;
      const darkSkyDailyArr = darkSkyDailyData.map(element => {
        return new Forecast(element.summary, element.time);
      });
      response.send(darkSkyDailyArr);
    });
}

function sendEvents(request, response) {
  const eventUrl = `https://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENTBRITE_API_KEY}&location.address=${city}`;
  superagent.get(eventUrl)
    .end( (err,eventbriteApiResponse) => {
      const eventbriteData = eventbriteApiResponse.body.events;
      const eventbriteArr = eventbriteData.map(event => {
        return new Event(event.url, event.name.text, event.start.local, event.summary);
      });
      response.send(eventbriteArr);
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

function Event(link, name, event_date, summary){
  this.link = link;
  this.name = name;
  this.event_date = new Date(event_date).toDateString();
  this.summary = summary;
}

function handleError(err, res) {
  if (err) res.status(500).send('Sorry, something went wrong');
}
