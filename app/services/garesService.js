'use strict'

let toRadians = (number) => {
    return number * Math.PI / 180;
}

/**
 * Calculate distance between two couple of coordinates
 * Source: https://www.movable-type.co.uk/scripts/latlong.html
 * 
 * @param {*} coordinates1 
 * @param {*} coordinates2 
 */
exports.calculDistance = (coordinates1, coordinates2) => {
    let lon1 = coordinates1[0];
    let lat1 = coordinates1[1];
    let lon2 = coordinates2[0];
    let lat2 = coordinates2[1];

    let R = 6371; // km
    var φ1 = toRadians(lat1);
    var φ2 = toRadians(lat2);
    var Δφ = toRadians(lat2 - lat1);
    var Δλ = toRadians(lon2 - lon1);

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;

    return d;
}


exports.getGares = (filters) => {
    let rawData = require('../liste-des-gares.json');
    let visitedCommune = {};
    let isVoyageur = true;
    let isFret = true;


    let garesFiltrees = rawData.filter((data) => {
        if(visitedCommune[data.fields.commune] === undefined) {
            visitedCommune[data.fields.commune] = data.recordid;
        }

        if(filters.isVoyageur !== undefined) {
            isVoyageur = (data.fields.voyageurs === filters.isVoyageur);
        }

        if(filters.isFret !== undefined) {
            isFret = (data.fields.fret === filters.isFret);
        }

        return data.geometry !== undefined
            && data.fields.commune !== undefined
            && data.fields.libelle_gare !== undefined
            && isVoyageur
            && isFret
            && visitedCommune[data.fields.commune] === data.recordid;
    });

    return garesFiltrees;
}

exports.generateGraph = (gares) => {
    let graph = {
        "points": {},
        "successeurs": {}
    };

    gares.forEach((gare) => {
        graph.points[gare.recordid] = {
            "id": gare.recordid,
            "name": gare.fields.libelle_gare,
            "coordinates": gare.geometry.coordinates
        };
    });
    
    let garesTotal = gares.length;
    let distanceMinDefault = 5; // km
    let distanceMin = distanceMinDefault;
    let garesProches = [];
  
    let i = 0;
    let gareCourante = {};
  
  
    while(garesTotal !== i) {
      gareCourante = gares[i];
    
      do {
        garesProches = gares.filter((gare) => {
          if(gareCourante.recordid !== gare.recordid) {
            let distance = this.calculDistance(gareCourante.geometry.coordinates, gare.geometry.coordinates);
            return distance <= distanceMin;
          } else {
            return false;
          }
        });
        distanceMin = distanceMin + 5;
      } while (garesProches.length === 0);
      
      distanceMin = distanceMinDefault;
      graph.successeurs[gareCourante.recordid] = garesProches.map((a) => a.recordid);
  
      i++;
    }

    //console.log(graph);
    return graph;
}