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
const algoService = require('./services/shortestPathService');




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

app.get('/resolve', (req, res) => {
  let queries = req.query;
  let id = queries.id;
  let filters = this.generateFilters(id);

  let gares = garesService.getGares(filters);
  let graphe = garesService.generateGraph(gares);

  console.log(graphe);
  res.send({
    "id": this.generateId(filters),
    "GeoJSON": geoJsonService.convertGraphToGeoJSON(graphe)
  });

});

app.get('/testAlgo', (req, res) => {
  let queries = req.query;
  let id = queries.id;
  let filters = this.generateFilters(id);
  let gares = garesService.getGares(filters);
  let graphe = garesService.generateGraph(gares);

  let aStarPath = algoService.aStarPath(graphe, '830f890f2af67edca009ec88ad336d0ddd8b63f0', '5b949389012d8427ad9bbecdbfe08586576d1543');
  //chemin entre beauvoisin et goncelin
  //let aStarPath = algoService.aStarPath(graphe, '830f890f2af67edca009ec88ad336d0ddd8b63f0', '5b949389012d8427ad9bbecdbfe08586576d1543');

  let path = false;
  //res.send(aStarPath.path);
  if (aStarPath.path) path = geoJsonService.convertGraphToGeoJSON(aStarPath.path);
  res.send({
    'astarInfo': aStarPath,
    'path': path,
    'graph' : graphe
  });


});

exports.generateId = (filters) => {
  let id;
  if (Object.keys(filters).length !== 0) {
    id = "";
    Object.keys(filters).forEach((key) => {
      id += key + "-";
      if(typeof filters[key] === "string") {
        id += filters[key];
      } else if (typeof filters[key] === "array") {
        id += filters[key].joint('&');
      }
      id += "_";
    });
    id = id.substr(0, id.length-1);
  } else {
    id = "default";
  }
  return id;
}

exports.generateFilters = (id) => {
  let filters = {};
  let arrayFilter = [];
  if (id !== "default") {
    let splitedIds = id.split("_");
    splitedIds.forEach((splitedId) => {
      arrayFilter = splitedId.split("-");
      if(arrayFilter[1].includes("&")) {
        filters[arrayFilter[0]] = arrayFilter[1].split("&");
      } else {
        filters[arrayFilter[0]] = arrayFilter[1];
      }
    });
  }
  return filters;
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);