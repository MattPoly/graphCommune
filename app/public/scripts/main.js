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

let map;

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

    getAjax('/', function (data) {
        let myData = JSON.parse(data);
        let myDataGroup = new L.featureGroup();
        let geoJsonData = myData.GeoJSON;
        
        // Add JSON to map
        L.geoJson(geoJsonData, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.prop0);
                // Add each feature's to a group
                myDataGroup.addLayer(layer);
            },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {radius:"3", color:"#FFA500"});
            }
        }).addTo(map);
        // Resize the map to fit to the group's bounds
        map.fitBounds(myDataGroup.getBounds());
        //L.circle([geoJsonData.features[0].geometry.coordinates[1], geoJsonData.features[0].geometry.coordinates[0]],{radius: 75000}).addTo(map);
    });
});
