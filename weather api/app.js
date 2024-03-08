//! express

const express = require('express');
const weather = require('./handlers/weather');

const app = express();

app.get('/api/v1/weather/:city', weather.getCity);

app.listen(10000, (err) => {
  if (err) {
    return console.log('Could not start a servvice');
  }
  console.log('Service started successfully');
});
