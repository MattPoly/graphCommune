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
    let timerStart = Date.now();
    
    let openList = {}; // les options à epxlorer
    let closedList = {}; // les options déjà explorer
    let isPossible = false;

    let currentNode,
        tabNeighbour;

    openList[start] = { //on met l'id de la node de départ de la lsite ouverte afin d'initialiser l'itération
        id: start,
        parent: null, //pas de parent pour la node de départ
        distance: 0,
        distanceToEnd: gareService.calculDistance(graph.points[start].coordinates, graph.points[end].coordinates)
    };

    while (Object.keys(openList).length !== 0 && currentNode !== end) { // tant qu'il reste des options a explorer et que l'on a pas atteint la destination
        currentNode = getBestHeuristique(openList);
        if(currentNode === end) isPossible = true;

        closedList[currentNode] = openList[currentNode]; //on le met dans la liste fermée
        delete openList[currentNode]; //on l'enleve de la liste ouverte

        tabNeighbour = graph.successeurs[currentNode]; // récupération des voisins

        if(tabNeighbour){
            tabNeighbour.map(neighbour => { //parcours des successeurs
                if (!closedList[neighbour]) { // si la gare est dans la liste fermée il a déjà été analysé, on le passe
                    
                    //sauvegarde de la longueur du chemin
                    let distance = closedList[currentNode].distance + gareService.calculDistance(graph.points[neighbour].coordinates, graph.points[currentNode].coordinates); 
                    
                    // calcul de l'heuristique (distance jusqu'a la fin)
                    let distanceToEnd = gareService.calculDistance(graph.points[neighbour].coordinates, graph.points[end].coordinates); 
                    
                    if (!openList[neighbour]) { // si la gare n'est pas dans la liste ouverte
                        openList[neighbour] = {
                            id: neighbour,
                            parent: currentNode,
                            distance: distance,
                            distanceToEnd : distanceToEnd

                        }
                    } else { //s'il a déjà été testé, on repère si la distance s'améliore
                        if (openList[neighbour].distance > distance) {
                            openList[neighbour].parent = currentNode
                            openList[neighbour].distance = distance;
                        }
                    }
                }

            });
        }   
    }

    let path = generatePath(closedList, start, end, graph); //on reconstruit le chemin
    let length = false;
    if (closedList[end]) length = closedList[end].distance;

    let timerEnd = Date.now() - timerStart; //calcul du temms écoulé en milliseconde
    return {
        isPossible : isPossible,
        start : start,
        end : end,
        path : path,
        temps : timerEnd,
        distance : length
    };
}

exports.dikjstra = (graph, start, end) => {

    let timerStart = Date.now();


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

    while (Object.keys(openList).length !== 0){

        idCurrGare = getBestDistance(openList);

        if(idCurrGare === end) isPossible = true;

        closedList[idCurrGare] = openList[idCurrGare]; //on le met dans la liste fermée
        delete openList[idCurrGare]; //on l'enleve de la liste ouverte

        tabNeighbour = graph.successeurs[idCurrGare];

        if(tabNeighbour){
            tabNeighbour.map(neighbour => { //parcours des successeurs
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
                            openList[neighbour].distance = distanceFromStart;
                        }
                    }
                }

            });
        }
    }

    let path = generatePath(closedList, start, end, graph);
    let timerEnd = Date.now() - timerStart;
    let length = false;
    if(closedList[end]) length = closedList[end].distance;

    return {
        isPossible: isPossible,
        start: start,
        end: end,
        path: path,
        temps : timerEnd,
        distance : length
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

function getBestHeuristique(openList) {

    let lowestDistanceGare = openList[Object.keys(openList)[0]];
    Object.keys(openList).map(gareKey => {
        if (openList[gareKey].distance + openList[gareKey].distanceToEnd < lowestDistanceGare.distance + lowestDistanceGare.distanceToEnd) lowestDistanceGare = openList[gareKey];
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