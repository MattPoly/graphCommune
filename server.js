'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.set('view engine', 'pug')


app.get('/hello', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
});

app.get('/', (req, res) => {
  // Get JSON datas
  let gares = require('./liste-des-gares.json');
  
  let garesVoyageurs = gares.filter((gare) => {
    return gare.fields.voyageurs === "O";
  })
  
  // Send the third train's station
  res.send(garesVoyageurs[2]);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
