import * as renderer from '/js/renderer.js';

// Caractère de séparation 
let ID_CHAR = 'µ';
let SPLIT_CHAR = '¤';

let ws_server;

//DEBUG--------------------------------------
function divlog(str) {
    let el = document.getElementById("console");
    el.innerHTML += str + "<br/>";
}

export function defineWSServer(server) {
    ws_server = server;
    renderer.getUnparser().defineWSServer(server);
}

// #### DE MESSAGE PARSEES A VALEURS ####

//Parser qui gere les appels aux autres parsers
export function parserMaster(info)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const infos = info.split(ID_CHAR);

    let length = infos.length;
    if (length != 2)
    {
        console.log("ERROR in parserMaster : infos.length is not equal to 2, it is egal to " + length);
        return;
    }
    else
    {
        // On recupere la valeur
        let id = infos[0];
        // On recupere le message
        let msg = infos[1];

        switch (id)
        {
            case "0" : 
                parserInitBoardLengths(msg);
                break;
			case "1" : 
                parserShowBoard(msg);
                break;
			case "2" : 
                parserPlayerPos(msg);
                break;
			case "3" : 
                parserShowWinner(msg);
                break;
			case "4" : 
                parserPauseResume(msg);
                break;
			case "5" : 
                parserException(msg);
                break;
            case "6" :
                parserRequestHuman(msg);
                break;
            default :
                console.log("ERROR in parserMaster : the ID doesn't correspond to any command");
        }
    }
}

// Parser pour la taille de plateau (void)
function parserInitBoardLengths(msg)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const msgs = msg.split(SPLIT_CHAR);
    // On verifie si le message a la bonne taille
    let length = msgs.length;
    if (length != 3)
    {
        console.log("ERROR in parserInitBoardLengths : msgs.length is not equal to 3, it is egal to " + length);
        return;
    }
    else
    {
        // On recupere les valeurs
        let width = parseInt(msgs[0]);
        let height = parseInt(msgs[1]);
        let depth = parseInt(msgs[2]);
        
        // On appelle la fonction avec les valeurs recuperes
        renderer.initBoardLength(width, height, depth);
    }
}


// Parser pour les positions du plateau (void)
function parserShowBoard(msg)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const msgs = msg.split(SPLIT_CHAR);
    // On verifie si le message a la bonne taille
    let length = msgs.length;
    if (length < 2)
    {
        console.log("ERROR in parserShowBoard : msgs.length is too small to be a correct message");
        return;
    }
    else
    {
        // On recupere les valeurs
		var playersId;
        var posList;
		var playerIdNb = 0;
		var i = 0;
		var j = 0;
		while (msgs[i] != "%")
		{
			playersId[playerIdNb] = parseInt(msg[i]);
			playerIdNb++;
			i++;
			
			while (msgs[i] != "£")
			{
				var position = {
                x : parseInt(msgs[i+0]),
                y : parseInt(msgs[i+1]),
                z : parseInt(msgs[i+2])
				}
				
				i += 3;
				j += 3;				
				posList[playerIdNb][j/3] = position;
			}
			i++;
		}
        
        // On appelle la fonction avec les valeurs recuperes
        //showBoard(posList);                 A FINIR
    }
}

// Parser pour la position du joueur (void)
function parserPlayerPos(msg)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const msgs = msg.split(SPLIT_CHAR);
    // On verifie si le message a la bonne taille
    let length = msgs.length;
    if (length != 4)
    {
        console.log("ERROR in parserShowBoard : msgs.length is not equal to 4, it is egal to " + length);
        return;
    }
    else
    {
        // On recupere les valeurs
		var playerId = parseInt(msgs[0]);
		
        var position = {
            x : parseInt(msgs[1]),
            y : parseInt(msgs[2]),
            z : parseInt(msgs[3])
        }
        
        // On appelle la fonction avec les valeurs recuperes
        renderer.playerPos(playerId, position);
    }
}

// Parser pour montrer le gagnant (void)
function parserShowWinner(msg)
{   
    // On appelle la fonction avec la valeur
    //showWinner(msg);                 A FINIR
    alert(msg + 'a gagné !');
}

// Parser pour mettre sur pause (void)
function parserPauseResume(msg)
{   
	let b = parseInt(msg); 
	switch (b)
	{
		case '0' : 
                //pauseGame();                 A FINIR
                break;
		case '1' : 
                //resumeGame();                 A FINIR
                break;
            default :
                console.log("ERROR in parserPauseResume : the message is not 0 or 1");
	}         
}

// Parser pour montrer une exception (void)
function parserException(msg)
{   
    // On appelle la fonction avec la valeur
    exception("Erreur : " + msg);
}

function parserRequestHuman(msg) {
    let id = parseInt(msg);
    renderer.setHumanId(id);
}


// #### DE VALEURS A MESSAGE PARSEES ####

export function unparserCreateNewGame(width, height, depth) {
    renderer.getUnparser().unparserCreateNewGame(width, height, depth);
}

export function unparserSetDelay(delay) {
    renderer.getUnparser().unparserSetDelay(delay);
}

export function unparserRunGame() {
    renderer.getUnparser().unparserRunGame();
}

export function unparserPauseResume(paused) {
    renderer.getUnparser().unparserPauseResume(paused);
}

export function unparserDisplayAction(playerId, position) {
    renderer.getUnparser().unparserDisplayAction(playerId, position);
}