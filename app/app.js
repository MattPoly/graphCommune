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

  if (req.accepts('text/html')) {
    res.set('Content-Type', 'text/html');
    res.render('index', { title: 'GraphCommune' });
  }
});

app.get('/graph', (req, res) => {
  let filters = req.query;
  console.log( filters);

  let gares = garesService.getGares(filters);
  console.log("gares:" + gares.length);

  let graphe = garesService.generateGraph(gares);

  res.send({
    "id": this.generateId(filters),
    "GeoJSON": geoJsonService.convertGraphToGeoJSON(graphe)
  });

});

exports.generateId = (filters) => {
  let id = 'default';
  if (Object.keys(filters).length !== 0) {
    id = 'filter';
  }
  return id;
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);