let map;

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

    getAjax('/graph?isFret=N&isVoyageur=O', function (data) {
        let myData = JSON.parse(data);
        let myDataGroup = new L.featureGroup();
        let geoJsonData = myData.GeoJSON;

        addToMap(geoJsonData);
    });

    getAjax('/resolve?id=isFret-N_isVoyageur-O', function (data) {
        let myData = JSON.parse(data);
        let myDataGroup = new L.featureGroup();
        let geoJsonData = myData.GeoJSON;

        addToMap(geoJsonData);
    });

    getAjax('/testAlgo?id=isFret-N_isVoyageur-O', function (data) {
        let myData = JSON.parse(data);
        let myDataGroup = new L.featureGroup();
        let geoJsonData = myData.path;

        addToMap(geoJsonData, 3, "#42f445", "#42f445", "#42f445", "#42f445");
    });
});

function selectType() {
  let isVoyageur = document.querySelector('[name=voyageur]').checked;
  let isFret = document.querySelector('[name=fret]').checked;

}

function addToMap(geoJsonData, markerRadius = 3, markerColor = "#FFA500", markerFillColor = "#FFA500", stringColor = "#007BFF", stringFillColor = "#007BFF") {

  let myDataGroup = new L.featureGroup();
  // Add JSON to map
  L.geoJson(geoJsonData, {
      onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.prop0);
          // Add each feature's to a group
          myDataGroup.addLayer(layer);
      },
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, { radius: markerRadius, color: markerColor, fillColor: markerFillColor });
      },
      style: function(feature) {
        switch (feature.geometry.type) {
            case 'LineString': return {color: stringColor, fillColor: stringFillColor};
            default:   return {};
        }
    }
  }).addTo(map);

  // Resize the map to fit to the group's bounds
  map.fitBounds(myDataGroup.getBounds());
  //L.circle([geoJsonData.features[0].geometry.coordinates[1], geoJsonData.features[0].geometry.coordinates[0]],{radius: 75000}).addTo(map);
}
