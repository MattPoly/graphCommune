'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.set('view engine', 'pug')
app.use(express.static('app/public'));
app.set('views', 'app/views');

// Services
const geoJsonService = require('./services/geoJsonService');
const garesService = require('./services/garesService');



app.get('/', (req, res) => {
  let gares = garesService.GetGaresFretOnly();

  let graphe = garesService.generateGraph(gares);

  res.render('index', { title: 'GraphCommune', jsonData: geoJsonService.convertGraphToGeoJSON(graphe) });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);