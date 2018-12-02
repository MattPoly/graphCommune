let map;

let geoJsonGraphLayer;
let geoJsonGraphLayerOption = {
    onEachFeature: function (feature, layer) {
      if(feature.geometry.type == "Point") {
        layer.bindPopup(
          `<div>`+feature.properties.name+`</div>
          <div>
          <button class='btn btn-sm btn-primary' onclick='setGare("`+feature.properties.id+`","depart")'>Départ</button>
          <button class='btn btn-sm btn-success' onclick='setGare("`+feature.properties.id+`","arrive")'>Arrivée</button>
          </div>`
        );
      }
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, { radius: 6, color: "#FFA500", fillColor: "#FFA500", zindex: 100});
    },
    style: function(feature) {
      switch (feature.geometry.type) {
          case 'LineString': return {color: "#007BFF", fillColor: "#007BFF", zindex: 10};
          default:   return {};
      }
  }
};

let geoJsonResolveLayer;
let geoJsonResolveLayerOption = {
    onEachFeature: function (feature, layer) {
      if(feature.geometry.type == "Point") {
        layer.bindPopup(feature.properties.name);
      }
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, { radius: 6, color: "#42f445", fillColor: "#42f445" });
    },
    style: function(feature) {
      switch (feature.geometry.type) {
          case 'LineString': return {color: "#42f445", fillColor: "#42f445"};
          default:   return {};
      }
  }
};

let gares = [];

let markerGareDepart = L.marker();
let markerGareArrive = L.marker();

let selectGareDepartDOM;
let selectGareArriveDOM;
let selectAlgoDOM;

let countGaresDOM;
let countLiensDOM;
let isPossibleDOM;
let gareDepartDOM;
let gareArriveDOM;
let distanceDOM;
let poidTotalDOM;
let resolveAlgoDOM;
let tempsCalculDOM;

function updateGares() {

  // Clean gare selects
  while (selectGareDepartDOM.childNodes[1]) {
    selectGareDepartDOM.removeChild(selectGareDepart.childNodes[1]);
  }
  while (selectGareArriveDOM.childNodes[1]) {
    selectGareArriveDOM.removeChild(selectGareArrive.childNodes[1]);
  }

  map.removeLayer(markerGareDepart);
  map.removeLayer(markerGareArrive);

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

  // Maj count des gares
  countGaresDOM.textContent = gares.length;
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

    selectGareDepartDOM = document.getElementById('selectGareDepart');
    selectGareArriveDOM = document.getElementById('selectGareArrive');
    selectAlgoDOM = document.getElementById('selectAlgo');

    countGaresDOM = document.getElementById('countGares');
    countLiensDOM = document.getElementById('countLiens');
    isPossibleDOM = document.getElementById('isPossible');
    gareDepartDOM = document.getElementById('gareDepart');
    gareArriveDOM = document.getElementById('gareArrive');
    distanceDOM = document.getElementById('distance');
    poidTotalDOM = document.getElementById('poidTotal');
    resolveAlgoDOM = document.getElementById('resolveAlgo');
    tempsCalculDOM = document.getElementById('tempsCalcul');
});

function selectType() {
  if(geoJsonResolveLayer !== undefined) {
    geoJsonResolveLayer.clearLayers();
  }
  resetInfos();

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

  let gareDepartId = selectGareDepartDOM.value;
  let gareArriveId = selectGareArriveDOM.value;
  let algo = selectAlgoDOM.value;
  
  if(gareArriveId != "" && gareDepartId != "") {
    let url = "/resolve?id="+getGraphId()+"&start="+gareDepartId+"&end="+gareArriveId+"&algo="+algo;
  
    getAjax(url, function (data) {
      let myData = JSON.parse(data);
      let geoJsonData = myData.GeoJSON;
      updateInfos(myData);
      if(geoJsonData != false) {
        updateGeoJsonLayer(geoJsonData, "resolve");
      }
    });
  } else {
    alert("Houston t'as oublié de sélectionner des gares.");
  }
}

function updateInfos(data) {
  resetInfos();

  gareDepartDOM.textContent = selectGareDepartDOM.options[selectGareDepartDOM.selectedIndex].text;
  gareArriveDOM.textContent = selectGareArriveDOM.options[selectGareArriveDOM.selectedIndex].text;
  resolveAlgoDOM.textContent = selectAlgoDOM.options[selectAlgoDOM.selectedIndex].text;

  if(data.GeoJSON != false) {
    let infos = data.info;
    isPossibleDOM.textContent = "Yes";
    distanceDOM.textContent = infos.distance;
    poidTotalDOM.textContent = infos.poids;
    tempsCalculDOM.textContent = infos.temps;
  } else {
    isPossibleDOM.textContent = "Nope";
  }
}

function resetInfos() {
  isPossibleDOM.textContent = "-";
  gareDepartDOM.textContent = "-";
  gareArriveDOM.textContent = "-";
  distanceDOM.textContent = "-";
  poidTotalDOM.textContent = "-";
  resolveAlgoDOM.textContent = "-";
  tempsCalculDOM.textContent = "-";
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

function marquerGare(id, position = "depart") {
  if(id !== undefined && id !== "") {
    let coordinates = gares.find(x => x.id === id).coordinates;
    switch (position) {
      case "depart":
        map.removeLayer(markerGareDepart);
        markerGareDepart.setLatLng([coordinates[1],coordinates[0]]).addTo(map);
        break;
      case "arrive":
        map.removeLayer(markerGareArrive);
        markerGareArrive.setLatLng([coordinates[1],coordinates[0]]).addTo(map);
        break;
    }
  } else {
    map.removeLayer(markerGareDepart);
    map.removeLayer(markerGareArrive);
  }
}

function setGare(id, position = "depart") {
  let select;
  switch (position) {
    case "depart":
      document.getElementById('selectGareDepart').value = id;
      break;
    case "arrive":
      document.getElementById('selectGareArrive').value = id;
      break;
  }
  marquerGare(id, position);
}
