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
          "id": point.id,
          "name": point.name
        }
      });
    });

    let gareCourante = {};
    let successeur = {};
    let prop = '';
    let arcs = [];

    let successeursListId = Object.keys(successeursList);
    let successeurs = [];
    successeursListId.forEach((successeurListId) => {
      gareCourante = points[successeurListId];
      successeurs = successeursList[successeurListId];

      successeurs.forEach((successeurId) => {
        if(arcs.indexOf(successeurListId+"-"+successeurId) == -1 && arcs.indexOf(successeurId+"-"+successeurListId) == -1) {
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
              "name": prop
            }
          };
          geoJsonData.features.push(successeurGeoJson);
          arcs.push(successeurListId+"-"+successeurId);
        }

      });

    });

    return geoJsonData;
  }
