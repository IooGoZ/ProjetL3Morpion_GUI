
import * as parser from "/js/parser.js";

//DEBUG--------------------------------------
function divlog(str) {
    let el = document.getElementById("console");
    el.innerHTML += str + "<br/>";
}

function sendRequest() {
    const str = prompt("Request :");
    wsSend(str);
}

//FORMS--------------------------------------
function initListener() {
    document.getElementById("create_game_button").addEventListener("click", createGame);
    document.getElementById("run_game_button").addEventListener("click", runGame);
    document.getElementById("set_delay_button").addEventListener("click", setDelay);
}

function createGame() {
    let width = document.getElementById("create_game_width").value;
    let height = document.getElementById("create_game_height").value;
    let depth = document.getElementById("create_game_depth").value;

    parser.unparserCreateNewGame(width, height, depth);
}

function runGame() {
    parser.unparserRunGame();
}

function setDelay() {
    let delay = document.getElementById("set_delay_value").value;
    parser.unparserSetDelay(delay);
}

//WS ----------------------------------------
let socket = new WebSocket("ws://localhost:80");
parser.defineWSServer(socket);
initListener();
//WS EVENT-----------------------------------
socket.onopen = function(e) {
    divlog("[open] Connection established");
    divlog("Sending to server");
};

socket.onmessage = function(event) {
    divlog(`[message] Data received from server: ${event.data}`);
    parser.parserMaster(event.data);
};

socket.onclose = function(event) {
if (event.wasClean) {
    divlog(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
} else {
    divlog('[close] Connection died');
}
};

socket.onerror = function(error) {
    divlog(`[error]`);
};