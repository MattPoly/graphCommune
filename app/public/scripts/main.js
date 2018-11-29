let map;

let geoJsonGraphLayer;
let geoJsonGraphLayerOption = {
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.prop0);
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, { radius: 3, color: "#FFA500", fillColor: "#FFA500" });
    },
    style: function(feature) {
      switch (feature.geometry.type) {
          case 'LineString': return {color: "#007BFF", fillColor: "#007BFF"};
          default:   return {};
      }
  }
};

let geoJsonResolveLayer;
let geoJsonResolveLayerOption = {
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.prop0);
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, { radius: 3, color: "#42f445", fillColor: "#42f445" });
    },
    style: function(feature) {
      switch (feature.geometry.type) {
          case 'LineString': return {color: "#42f445", fillColor: "#42f445"};
          default:   return {};
      }
  }
};

let gares = [];

function updateGares() {
  let selectGareDepart = document.getElementById('selectGareDepart');
  let selectGareArrive = document.getElementById('selectGareArrive');

  // Clean gare selects
  while (selectGareDepart.childNodes[1]) {
      selectGareDepart.removeChild(selectGareDepart.childNodes[1]);
  }
  while (selectGareArrive.childNodes[1]) {
      selectGareArrive.removeChild(selectGareArrive.childNodes[1]);
  }

  // Sort gares
  gares.sort(function(obj1, obj2) {
    return obj1.name > obj2.name;
  });

  // Add options
  let option;
  for(let i in gares) {
    option = document.createElement("option");
    option.value = gares[i].id;
    option.text = gares[i].name;

    selectGareDepart.appendChild(option);
    // Créer un clone du noeud "option"
    selectGareArrive.appendChild(option.cloneNode(true));
  }
}

function getAjax(url, success) {
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3 && xhr.status == 200) success(xhr.responseText);
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
    return xhr;
}

function initMap(id = 'map') {
    // Create variable to hold map element, give initial settings to map
    map = L.map(id, { center: [47.584, 2.505], zoom: 1 });

    // Add OpenStreetMap tile layer to map element
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

document.addEventListener('DOMContentLoaded', function () {
    initMap();

    getAjax('/testAlgo?id=isFret-N_isVoyageur-O', function (data) {
        let myData = JSON.parse(data);
        let geoJsonData = myData.path;

        updateGeoJsonLayer(geoJsonData, "resolve");
    });
});

function selectType() {
  if(geoJsonResolveLayer !== undefined) {
    geoJsonResolveLayer.clearLayers();
  }

  let isVoyageur = document.querySelector('[name=voyageur]').checked;
  let isFret = document.querySelector('[name=fret]').checked;
  let url = "/graph?isFret="+(isFret?"O":"N")+"&isVoyageur="+(isVoyageur?"O":"N")

  getAjax(url, function (data) {
      let myData = JSON.parse(data);
      let geoJsonData = myData.GeoJSON;
      updateGeoJsonLayer(geoJsonData, "graph");
      gares = [];
      for(let gare in myData.graph.points) {
        gares.push(myData.graph.points[gare]);
      }
      updateGares();
  });
}

function resolveGraph() {
  if(geoJsonResolveLayer !== undefined) {
    geoJsonResolveLayer.clearLayers();
  }

  let url = "/testAlgo?id="+getGraphId();

  getAjax(url, function (data) {
      let myData = JSON.parse(data);
      let geoJsonData = myData.path;
      updateGeoJsonLayer(geoJsonData, "resolve");
  });
}

function getGraphId() {
  let isVoyageur = document.querySelector('[name=voyageur]').checked;
  let isFret = document.querySelector('[name=fret]').checked;

  return "isFret-"+(isFret?"O":"N")+"_isVoyageur-"+(isVoyageur?"O":"N");
}

function updateGeoJsonLayer(geoJsonData, layerType = "graph") {
  let layer;
  let layerOption = {};

 // get Layer's Data
  switch (layerType) {
    case "graph":
      layer = geoJsonGraphLayer;
      layerOption = geoJsonGraphLayerOption;
      break;
    case "resolve":
      layer = geoJsonResolveLayer;
      layerOption = geoJsonResolveLayerOption;
      break;
  }


  if(layer !== undefined) {
    layer.clearLayers();
    layer.addData(geoJsonData);
  } else {
    layer = L.geoJson(geoJsonData, layerOption);
    layer.addTo(map);
  }

   // Update Layer's reference
  switch (layerType) {
    case "graph":
      geoJsonGraphLayer = layer;
      break;
    case "resolve":
      geoJsonResolveLayer = layer;
      break;
  }

  map.fitBounds(layer.getBounds());

}
