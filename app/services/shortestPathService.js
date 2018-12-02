"use strict";

const gareService = require('./garesService.js');


/**
 * 
 * @param {*} map ensemble des points et siuccesseurs à analyser 
 * @param {*} start id du point de départ
 * @param {*} end id du point à, atteindre
 * @returns ensemble des points constituant le plus court chemin | null si impossible
 */
exports.aStarPath = (graph, start, end) => {
    
    let openList = {}; // les options à epxlorer
    let closedList = {}; // les options déjà explorer
    let isPossible = false;

    let currentNode,
        tabNeighbour;

    openList[start] = { //on met l'id de la node de départ de la lsite ouverte afin d'initialiser l'itération
        id: start,
        parent: null, //pas de parent pour la node de départ
        distance: gareService.calculDistance(graph.points[start].coordinates, graph.points[end].coordinates)
    };

    while (Object.keys(openList).length !== 0 && currentNode !== end) { // tant qu'il reste des options a explorer et que l'on a pas atteint la destination
        currentNode = getBestDistance(openList);
        if(currentNode === end) isPossible = true;

        closedList[currentNode] = openList[currentNode]; //on le met dans la liste fermée
        delete openList[currentNode]; //on l'enleve de la liste ouverte

        tabNeighbour = graph.successeurs[currentNode];

        if(tabNeighbour){
            tabNeighbour.map(neighbour => { //parcours des successeurs
                if (!closedList[neighbour]) { // si la gare est dans la liste fermée il a déjà été analysé, on le passe
                    if (!openList[neighbour]) { // si la gare n'est pas dans la liste ouverte
                        openList[neighbour] = {
                            id: neighbour,
                            parent: currentNode,
                            distance: gareService.calculDistance(graph.points[neighbour].coordinates, graph.points[end].coordinates)
                        }
                    } else {
                        if (openList[neighbour].distance > gareService.calculDistance(graph.points[neighbour].coordinates, graph.points[end].coordinates)) {
                            openList[neighbour].parent = currentNode
                        }
                    }
                }

            });
        }   
    }


    return {
        isPossible : isPossible,
        start : start,
        end : end,
        path : generatePath(closedList, start, end, graph),
        //graph : graph
    };
}

exports.dikjstra = (graph, start, end) => {
    let openList = {}; //les gares a visiter
    let closedList = {}; //les gares visitées
    let isPossible = false;

    let idCurrGare,
    tabNeighbour;

    // graph.points.forEach(gare => { //toutes les distances à l'infini
    //     openList[gare] = {
    //         id: gare,
    //         parent: null, //pas de parent pour la node de départ
    //         distance: Infinity
    //     }
    // });

    openList[start] = { 
        id: start,
        parent: null, 
        distance: 0
    };

    while (idCurrGare !== end && Object.keys(openList).length !== 0){

        idCurrGare = getBestDistance(openList);

        if(idCurrGare === end) isPossible = true;

        closedList[idCurrGare] = openList[idCurrGare]; //on le met dans la liste fermée
        delete openList[idCurrGare]; //on l'enleve de la liste ouverte

        tabNeighbour = graph.successeurs[idCurrGare];

        if(tabNeighbour){
            tabNeighbour.map(neighbour => { //parcours des successeurs
                console.log(idCurrGare);
                console.log(tabNeighbour);
                console.log(neighbour);
                if (!closedList[neighbour]) { // si la gare est dans la liste fermée il a déjà été analysé, on le passe

                    let distanceFromStart =
                        closedList[idCurrGare].distance
                        + gareService.calculDistance(graph.points[neighbour].coordinates, graph.points[idCurrGare].coordinates);

                    if (!openList[neighbour]) { // si la gare n'est pas dans la liste ouverte

                        openList[neighbour] = {
                            id: neighbour,
                            parent: idCurrGare,
                            distance: distanceFromStart
                        }
                    } else {
                        if (openList[neighbour].distance > distanceFromStart) {
                            openList[neighbour].parent = idCurrGare
                        }
                    }
                }

            });
        }
        

    }

    return {
        isPossible: isPossible,
        start: start,
        end: end,
        path: generatePath(closedList, start, end, graph),
        //graph : graph
    };
}

/**
 * 
 * @param {*} openList 
 */
function getBestDistance(openList) {

    let lowestDistanceGare = openList[Object.keys(openList)[0]];
    Object.keys(openList).map(gareKey => {
        if (openList[gareKey].distance < lowestDistanceGare.distance) lowestDistanceGare = openList[gareKey];
    });
    return lowestDistanceGare.id;
}

//genere le sous graph de chemin
function generatePath(closedList, start, end, graph){
    let path = {
        "points": {},
        "successeurs": {}
    }; 
    let futurFils = null;

    if(closedList[end]){
        let currNode = closedList[end];
        while(currNode !== undefined){ //on itère jusqu'à remonter au parent
            path.points[currNode.id] = graph.points[currNode.id];
            if (futurFils) path.successeurs[currNode.id] = [futurFils];
            futurFils = currNode.id; //on enregistre la node courante pour la mettre en successeur a la prochaine iter
            currNode = closedList[currNode.parent];
        }
        return path;
    }
    return false;
}