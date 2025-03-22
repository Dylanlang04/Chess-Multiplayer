const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const fs = require("fs") //need to read static files
const url = require("url") //to parse url strings

const PORT = process.env.PORT || 3000
app.listen(PORT) //start server listening on PORT

const ROOT_DIR = "public" //dir to serve static files from
//set used to store currently connected users.
const users = new Set()
let players = 0;
let playerColours = {}
let turn = "white"


const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

function handler(request, response) {
    let urlObj = url.parse(request.url, true, false)
    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    let receivedData = ""

    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk
    })

    //event handler for the end of the message
    request.on("end", function() {
      console.log("REQUEST END: ")
      console.log("received data: ", receivedData)
      console.log("type: ", typeof receivedData)

   
  
      if (request.method == "GET") {
        //handle GET requests as static file requests
        fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          response.writeHead(200, {
            "Content-Type": get_mime(urlObj.pathname)
          })
          response.end(data)
        })
      }
    })
}


io.on("connection", function(socket) { //runs when a new user connects via socket.
  console.log("A user connected") // logged to terminal

  socket.on("register", function(username) { //listens for the register event.
    if (!isValidUsername(username)) { // checks for valid username, if not valid, print an error
        socket.emit("registrationError", `ERROR: ${username} IS NOT A VALID USER NAME`)
        return
    }
    players += 1
    if (players <= 2) {
      users.add(username) // if valid, add it to users
      socket.player = players
      socket.username = username  //gives ther current socket the valid username entered.
      const colour = players === 1 ? "white" : "black";
      playerColours[username] = colour;
      io.emit("updatePlayers", Array.from(users));
      socket.emit("registrationSuccess", {player: players, colour}) // print a successful registration message.
      socket.emit("turnUpdate", { turn, playerColour: colour }); 
      console.log(`${username} has joined the game`) // logged to terminal
    } else {
      players -= 1
    }
    
  })
  socket.on("sendMove", function(fromTo) {
    turn = turn === "white" ? "black" : "white"
    console.log(turn)
    io.emit("receiveMove", {
      fromx: parseInt(fromTo[0][0]),
      fromy: parseInt(fromTo[0][1]),
      tox: parseInt(fromTo[1][0]),
      toy: parseInt(fromTo[1][1]),
      turn
    })
  }) 
  

  socket.on("disconnect", function() { //listens for the disconnect event.
    if (socket.username) { 
      users.delete(socket.username) //deletes the username if the user disconnecting was a registered user.
      io.emit("updatePlayers", Array.from(users));
      players -= 1
      console.log(`${socket.username} disconnected`) // logs that the user has disconnected to terminal
      // WE NEED TO ADD LOGIC TO MAKE SURE PLAYER 2 BECOMES WHITE AND PLAYER 1
    
    }
  })
})

function isValidUsername(username) {
  
  return /^[A-Za-z][A-Za-z0-9]*(?: [A-Za-z0-9]+)*$/.test(username) && !/^Me$/i.test(username) 
}


console.log("Server Running at PORT: 3000  CNTL-C to quit")
console.log("To Test:")
console.log("Open several browsers at: http://localhost:3000/index.html")