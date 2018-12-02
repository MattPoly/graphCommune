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
    "GeoJSON": geoJsonService.convertGraphToGeoJSON(graphe),
    "graph" : graphe
  });

});

app.get('/resolve', (req, res) => {
  let queries = req.query;
  let id = queries.id;
  let filters = this.generateFilters(id);

  let gares = garesService.getGares(filters);
  let graphe = garesService.generateGraph(gares);

  // Get Starting point and ending point
  let start = queries.start;
  let end = queries.end;

  // Algo
  let algo = queries.algo;
  let resolvePath;

  switch (algo) {
    case "astar" :
      resolvePath = algoService.aStarPath(graphe, start, end);
      break;
    case "dikjstra":
      resolvePath = algoService.dikjstra(graphe, start, end);
      break;
    default:
      resolvePath = algoService.aStarPath(graphe, start, end);
  }
  
  let GeoJSON = (resolvePath.isPossible) ? geoJsonService.convertGraphToGeoJSON(resolvePath.path) : false;

  res.send({
    "info": resolvePath,
    "GeoJSON": GeoJSON
  });

});

app.get('/testAlgo', (req, res) => {
  let queries = req.query;
  let id = queries.id;
  let filters = this.generateFilters(id);
  let gares = garesService.getGares(filters);
  let graphe = garesService.generateGraph(gares);

  //let aStarPath = algoService.aStarPath(graphe, '7c71f00ac4e661e60023a737462beff3ddac885e', 'bb9ff5bc4dd40d9a01ec45106b78ca169ba8f53d');
  //chemin entre beauvoisin et goncelin
  //let aStarPath = algoService.aStarPath(graphe, '830f890f2af67edca009ec88ad336d0ddd8b63f0', '33bc6acd93fa5e13a9df29f1a05140f9ed873f65');

  let dikjstraPath = algoService.dikjstra(graphe, '708fb117a9aedf9e9874d90cafbfbba81328d707', '47b58580206a3119da0bccb4943c6d782f8118ce')
  let path = false;
  if (dikjstraPath.path) path = geoJsonService.convertGraphToGeoJSON(dikjstraPath.path);
  //if (aStarPath.path) path = geoJsonService.convertGraphToGeoJSON(aStarPath.path);
  res.send({
    //'astarInfo': aStarPath,
    'dikjstraInfo': dikjstraPath,
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