'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.set('view engine', 'pug')

app.use(express.static('public'));

app.get('/', (req, res) => {
  let myGeoJSON = require('./liste-des-gares.json');
  
  console.log('1 - gares: '+ myGeoJSON.features.length );
  let garesVoyageurs = myGeoJSON.features.filter((feature) => {
    return feature.properties.voyageurs === "N" && feature.properties.fret === "O";
  });
  console.log('2 - gares: '+ garesVoyageurs.length );

  res.render('index', { title: 'Hey', jsonData: garesVoyageurs });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
