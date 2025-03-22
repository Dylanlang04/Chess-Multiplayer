const socket = io()
const usernameInput = document.getElementById("username")
const connectBtn = document.getElementById("connectBtn")
const game = document.getElementById("game")
const players = document.getElementById("players")
let numPlayers = 0
let playercolour = ""

connectBtn.addEventListener("click", function() {
    const username = usernameInput.value.trim() //retrieves the input username from the users registration
    socket.emit("register", username) //sends a register event to the server.
})

socket.on("registrationSuccess", function(data) {
    socket.username = usernameInput.value.trim() //stores the username in the socket
    usernameInput.setAttribute("disabled", "") //disables the registraction text field
    connectBtn.setAttribute("disabled", "") // disables the registraction button
    
    playercolour = data.colour;
    socket.playerCol = playercolour
    
    numPlayers += 1
    
})
socket.on("turnUpdate", function(data) {
    const { turn, playerColour } = data;
    
    if (turn !== playerColour) {
        document.querySelectorAll(".square").forEach(square => {
            square.removeEventListener("click", handleSquareClick)
            
        })
    } else {
        document.querySelectorAll(".square").forEach(square => {
            square.addEventListener("click", handleSquareClick)
        
        })
    }
})

socket.on("receiveMove", function(data) {
    if (data.turn !== playercolour) {
        document.querySelectorAll(".square").forEach(square => {
            square.removeEventListener("click", handleSquareClick)
        })
    } else {
        document.querySelectorAll(".square").forEach(square => {
            square.addEventListener("click", handleSquareClick)
        })
    }
    
    movePiece(getSquare(data.fromx, data.fromy), getSquare(data.tox, data.toy))
    const newTurn = data.turn === "white" ? "black" : "white";
    turn = newTurn;
    
})
socket.on("registrationError", function(error) {
    usernameInput.value = "" 
})
socket.on("updatePlayers", function(usernames) {
    players.innerHTML =""; 
    usernames.forEach((username, index) => {
        if (index === 0) {
            players.innerHTML += `<div class="username1">Player 1: ${username}</div>`;
        } else if (index === 1) {
            players.innerHTML += `<div class="username2">Player 2: ${username}</div>`;
        }
    });

});