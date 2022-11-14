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

// #### DE MESSAGE PARSEES A VALEURS ####

//Parser qui gere les appels aux autres parsers
export function parserMaster(info)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const infos = splitString(infos, ID_CHAR);

    let length = infos.length;
    if (length != 2)
    {
        console.log("ERROR in parserMaster : infos.length is not equal to 2, it is egal to " + length);
        return;
    }
    else
    {
        // On recupere la valeur
        let id = parseInt(infos[0]);
        // On recupere le message
        let msg = infos[1];

        switch (id)
        {
            case '0' : 
                parserInitBoardLengths(msg);
                break;
			case '1' : 
                parserShowBoard(msg);
                break;
			case '2' : 
                parserPlayerPos(msg);
                break;
			case '3' : 
                parserShowWinner(msg);
                break;
			case '4' : 
                parserPauseResume(msg);
                break;
			case '5' : 
                parserException(msg);
                break;
            default :
                console.log("ERROR in parserMaster : the ID doesn't correspond to any command");
        }
    }
}

// Parser pour la taille de plateau (void)
export function parserInitBoardLengths(msg)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const msgs = splitString(msg, SPLIT_CHAR);
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
        //initBoardLengths(width, height, depth);                 A FINIR
    }
}


// Parser pour les positions du plateau (void)
export function parserShowBoard(msg)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const msgs = splitString(msg, SPLIT_CHAR);
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
export function parserPlayerPos(msg)
{
    // On recupere chaque partie du message separes par le symbole SPLIT_CHAR
    const msgs = splitString(msg, SPLIT_CHAR);
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
		var playerId = msgs[0]
		
        var position = {
            x : msgs[1],
            y : msgs[2],
            z : msgs[3]
        }
        
        // On appelle la fonction avec les valeurs recuperes
        //playerPos(playerId, position);                 A FINIR
    }
}

// Parser pour montrer le gagnant (void)
export function parserShowWinner(msg)
{   
    // On appelle la fonction avec la valeur
    //showWinner(msg);                 A FINIR
}

// Parser pour mettre sur pause (void)
export function parserPauseResume(msg)
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
export function parserException(msg)
{   
    // On appelle la fonction avec la valeur
    //exception(msg);                 A FINIR
}

// #### DE VALEURS A MESSAGE PARSEES ####

// Permet "d'empaqueter" un message avec son id et son contenu puis l'envoyer
// C'est comme un envoi a la poste : le timbre (id) et la lettre (msg)
export function parseMake(id, msg) 
{
	// On prepare le paquet
    msg = id + ID_CHAR + msg;
		
	// On envoie le paquet parse 
	wsSend(msg);
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

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
    parseMake(id, " ");
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