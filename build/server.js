var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// SERVE static files
app.use(express.static(__dirname + '/app'));

var USERS = {};

// ------------------------------------------------------------
// SOCKET IO
// ------------------------------------------------------------
io.on('connection', function(socket){

  // ------------------------------
  // INIT GAME
  // ------------------------------

  // 1: Init the current socket player
  io.to(socket.id).emit("initPlayer");

  // 2: Send to the current socket player the USERS array
  socket.on('initUsers', function() {
    io.to(socket.id).emit('initUsers', USERS);
  });

  // 3: Add the current socket player to the USERS array
  socket.on('addUser', function(user) {
    USERS[user.name] = user;
    socket.broadcast.emit('newUser', USERS[user.name]);
  });


  // ------------------------------
  // SERVER LOOP
  // ------------------------------

  // 1: GET the player intended action
  socket.on('movePlayer', function(name, keys, sequence) {

    // Calculate the position
    var posX = 50 * 0.015;
    var posY = 50 * 0.015;
    posX = (keys['37'] ? -posX : 0) + (keys['39'] ? posX : 0);
    posY = (keys['38'] ? posY : 0) + (keys['40'] ? -posY : 0);

    // Set the position
    USERS[name].position.x += posX;
    USERS[name].position.y += posY;

    // Sequences
    USERS[name].sequences.push(sequence);
    //console.log(name + " IS MOVING : " + USERS[name].sequences);
    //console.log(USERS[name].position);

    // Send position to current user
    io.to(name).emit('movePlayer', name, USERS[name].position, sequence);
    USERS[name].sequences.shift();
  });


  // ------------------------------
  // UPDATE LOOP
  // ------------------------------
  // Send to all players the positions of all users
  // at a 100ms time
  setInterval(function(){
    io.emit('setPosition', USERS);
  }, 100);


  // ------------------------------
  // CONNECTIONS
  // ------------------------------

  // Connected
  console.log("user " + socket.id + " connected");

  // DISCONNECT handler
  socket.on('disconnect', function(){
    socket.broadcast.emit('deletePlayer', socket.id);
    // Delete the current user from the array
    delete USERS[socket.id];
    console.log("user " + socket.id + " disconnected");
  });
});


// ------------------------------------------------------------
// SERVER
// ------------------------------------------------------------
http.listen(3000, function(){
  console.log('listening on *:3000');
});