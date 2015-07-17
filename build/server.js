var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// SERVE static files
app.use(express.static(__dirname + '/app'));


// --------------------
// SOCKET IO
// --------------------
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


// --------------------
// SERVER
// --------------------
http.listen(3000, function(){
  console.log('listening on *:3000');
});