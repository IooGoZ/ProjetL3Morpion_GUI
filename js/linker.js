
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

//PLAYER LIST--------------------------------

document.getElementById("create_game_player_add").addEventListener("click", function() {
    var select = document.getElementById("create_game_player");
    var option = select.options[select.selectedIndex];
    var select_result = document.getElementById("create_game_player_result");
    var option_result = document.createElement("option");
    option_result.value = option.value;
    option_result.text = option.text;
    select_result.add(option_result);
});

document.getElementById("create_game_player_remove").addEventListener("click", function() {
    var select = document.getElementById("create_game_player_result");
    select.remove(select.selectedIndex);
});

document.getElementById("create_game_player_up").addEventListener("click", function() {
    var select = document.getElementById("create_game_player_result");
    var option = select.options[select.selectedIndex];
    if (option != null) {
        var option_prev = select.options[select.selectedIndex - 1];
        if (option_prev != null) {
            var value = option.value;
            var text = option.text;
            option.value = option_prev.value;
            option.text = option_prev.text;
            option_prev.value = value;
            option_prev.text = text;
            select.selectedIndex = select.selectedIndex - 1;
        }
    }
});

document.getElementById("create_game_player_down").addEventListener("click", function() {
    var select = document.getElementById("create_game_player_result");
    var option = select.options[select.selectedIndex];
    if (option != null) {
        var option_next = select.options[select.selectedIndex + 1];
        if (option_next != null) {
            var value = option.value;
            var text = option.text;
            option.value = option_next.value;
            option.text = option_next.text;
            option_next.value = value;
            option_next.text = text;
            select.selectedIndex = select.selectedIndex + 1;
        }
    }
});

function getPlayerList() {
    var select = document.getElementById("create_game_player_result");
    var player_list = [];
    for (var i = 0; i < select.options.length; i++) {
        player_list.push(select.options[i].value);
    }
    if (document.getElementById("create_game_player_random").checked) {
        player_list = player_list.sort(() => Math.random() - 0.5);
    }
    return player_list;
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
    let player_list = getPlayerList();

    parser.unparserCreateNewGame(width, height, depth, player_list);
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
};

socket.onmessage = function(event) {
    divlog("[message] " + event.data);
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