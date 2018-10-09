'use strict';

/*

Feature LineString:

{    
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [[102, 0], [103, 1]]
    },
    "properties": {
        "prop0": "value0",
        "prop1": 0
    }
}

*/

exports.convertGraphToGeoJSON = (graphe = {}) => {
    let points = graphe.points;
    let successeursList = graphe.successeurs;
    
    let geoJsonData = {
      "type": "FeatureCollection",
      "features": []
    };
  
    let keys = Object.keys(points);
    keys.forEach((pointId) => {
      let point = points[pointId];
      geoJsonData.features.push({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": point.coordinates
        },
        "properties": {
          "prop0": point.name
        }
      });
    });
  
    let gareCourante = {};
    let successeur = {};
    let prop = '';
    
    let successeursListId = Object.keys(successeursList);
    let successeurs = [];
    successeursListId.forEach((successeurId) => {
      gareCourante = points[successeurId];
      successeurs = successeursList[successeurId];
  
      successeurs.forEach((successeurId) => {
        successeur = points[successeurId];
        prop = gareCourante.name + ' - ' + successeur.name;
        let successeurGeoJson = {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              gareCourante.coordinates,
              successeur.coordinates
            ]
          },
          "properties": {
            "prop0": prop
          }
        };
        geoJsonData.features.push(successeurGeoJson);
  
      });
  
    });
  
    return geoJsonData;
  }