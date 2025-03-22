

const board = document.getElementById("chessboard");
let turn = 0;
let player1 = 0;
let plater2 = 0;
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

let selectedSquare = null;
const initialBoard = [
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["r", "n", "b", "q", "k", "b", "n", "r"]
];

function createBoard() {
    board.innerHTML = "";
    initialBoard.forEach((row, i) => {
        row.forEach((cell, j) => {
            const square = document.createElement("div");
            square.classList.add("square", (i + j) % 2 === 0 ? "light" : "dark");
            if (cell) {
                square.textContent = pieces[cell];
                square.dataset.piece = cell;
            }
            square.dataset.row = i;
            square.dataset.col = j;
            square.addEventListener("click", handleSquareClick);
            board.appendChild(square);
        });
    });
}

function handleSquareClick(event) {
    const square = event.target;
    
    if (selectedSquare) {
        
        
        posValidMoves(selectedSquare, 0);
        if(square.style.backgroundColor === "red") {
            socket.emit("sendMove", [
            [parseInt(selectedSquare.dataset.col), parseInt(selectedSquare.dataset.row)], 
            [parseInt(square.dataset.col), parseInt(square.dataset.row)]
        ])
        } else {
            console.log("invalid move") 
            clearPosMoves()
        }

        selectedSquare.classList.remove("selected");
        selectedSquare.style.backgroundColor = ""; // Clear background color
        selectedSquare = null;
        
    } else if (square.textContent) {
        selectedSquare = square;
        square.classList.add("selected");
        square.style.backgroundColor = "yellow"; // Change background color when selected
        posValidMoves(square, 1);
        
    }
}
function posValidMoves(square, check) {
    switch (square.dataset.piece.toLowerCase()) {
        case 'p':
            return posPawnMove(square, check)
    }
    
}
function posPawnMove(square, check) {
    const x = parseInt(square.dataset.col);
    const y = parseInt(square.dataset.row);
    const color = square.dataset.piece === "p" ? 'black' : 'white';
    
    const direction = color === 'black' ? -1 : 1;
    if (turn <= 1) {
        getSquare(x, y + direction).style.backgroundColor = "red"
        getSquare(x, y + direction + direction).style.backgroundColor = "red" 
         
    } else {

        getSquare(x, y + direction).style.backgroundColor = "red"
        
    }

}


function getSquare(x, y) {
    return document.querySelector(`.square[data-row="${y}"][data-col="${x}"]`);
}

function clearPosMoves() {
    const squares = document.querySelectorAll(".square");
    squares.forEach(square => {
        if (square.style.backgroundColor === "red") {
            square.style.backgroundColor = ""; 
        }
    });
}

function movePiece(fromSquare, toSquare) {
    
   
        clearPosMoves()
        toSquare.textContent = fromSquare.textContent;
        toSquare.dataset.piece = fromSquare.dataset.piece;
        fromSquare.textContent = "";
        fromSquare.dataset.piece = "";
        turn += 1;    
        
}

createBoard();