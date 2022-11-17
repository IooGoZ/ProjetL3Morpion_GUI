// Caractère de séparation 
let ID_CHAR = 'µ';
let SPLIT_CHAR = '¤';

let ws_server;

//DEBUG--------------------------------------
function divlog(str) {
    let el = document.getElementById("console");
    el.innerHTML += str + "<br/>";
}

function wsSend(str) {
    divlog("[send] " + str);
    ws_server.send(str);
}

export function defineWSServer(server) {
    ws_server = server;
}

// Permet "d'empaqueter" un message avec son id et son contenu puis l'envoyer
// C'est comme un envoi a la poste : le timbre (id) et la lettre (msg)
function parseMake(id, msg) 
{
	// On prepare le paquet
    msg = id + ID_CHAR + msg;
		
	// On envoie le paquet parse 
	wsSend(msg);
}
// Parse les dimensions du plateau pour creer une nouvelle partie
export function unparserCreateNewGame(width, height, depth) // tous int
{
    //On definit l'id
    var id = 0;

    //On redige le "message" : les 3 valeurs separes par le separateur
    var msg = width + SPLIT_CHAR + height + SPLIT_CHAR + depth;

    // On envoie au parseMaker
    parseMake(id, msg);
}

// Parse une valeur de delai
export function unparserSetDelay(delay) { // delay : int
    //On definit l'id
    var id = 1  ;

    // On envoie au parseMaker
    parseMake(id, delay);
}

// Parse un message vide pour indiquer que le jeu doit commencer
export function unparserRunGame() {
    //On definit l'id
    var id = 2;

    // On envoie au parseMaker
    parseMake(id, "0");
}

// Parse pour mettre en jeu ou reprendre la partie
export function unparserPauseResume(paused) { // paused : bool 
    //On definit l'id
    var id = 3;

    //On redige le "message"
    var msg
    if (paused) {
        msg = "0";
    }
    else
    {
        msg = "1";
    }

    // On envoie au parseMaker
    parseMake(id, msg);
}

// Parse pour afficher l'action courante
export function unparserDisplayAction(playerId, position) { // position {x, y, z}
    //On definit l'id
    var id = 4;

    //On redige le "message"
    var msg = playerId + SPLIT_CHAR + position.x + SPLIT_CHAR + position.y + SPLIT_CHAR + position.z; 

    // On envoie au parseMaker
    parseMake(id, msg);
}