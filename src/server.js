var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// SERVE static files
app.use(express.static(__dirname + '/app'));

var USERS = {};

// --------------------
// SOCKET IO
// --------------------
io.on('connection', function(socket){

  // 1: Init the current socket player
  io.to(socket.id).emit("initPlayer");

  // 2: Send to the current socket player the USERS array
  socket.on('initUsers', function() {
    io.to(socket.id).emit('initUsers', USERS);
  });

  // 3: Add the current socket player to the USERS array
  socket.on('addUser', function(user) {
    USERS[user.name] = user;
    socket.broadcast.emit('newUser', user);
  });

  // Send to all players the positions of all users
  socket.on('sendPosition', function(user) {
    USERS[user.name] = user;
    io.emit('setPosition', USERS);
  });

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

// --------------------
// SERVER
// --------------------
http.listen(3000, function(){
  console.log('listening on *:3000');
});