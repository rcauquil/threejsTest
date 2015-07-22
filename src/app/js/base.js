// ------------------------------------------
// VARS
// ------------------------------------------
// SOCKET IO
var socket = io();
// THREEJS
var scene, camera, renderer, effect;
var controls;
var ambientLight, directionalLight;
var cube;
var lastTime;
var setView = {
  vrMode: false
};
// PLAYERS
var players = {};


// ------------------------------------------
// KEYS
// ------------------------------------------
var keys = {};
document.addEventListener('keydown',function(e){keys[e.keyCode]=true;},false);
document.addEventListener('keyup',function(e){keys[e.keyCode]=false;},false);


// ------------------------------------------
// GENERATE UUID
// ------------------------------------------
function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}


// ------------------------------------------
// CONTROL VIEW
// ------------------------------------------
var ctrlObj = {
  rotation: 0.05,
  speed: 0.6
};

window.onload = function() {
  var gui = new dat.GUI();
  // Speed rotation
  gui.add(ctrlObj, 'rotation').min(0).max(0.1).step(0.01);
  gui.add(ctrlObj, 'speed').min(0).max(1).step(0.1);
  // View
  gui.add(setView, 'vrMode');
};

// ------------------------------------------
// INIT
// ------------------------------------------
function init() {

  scene = new THREE.Scene();

  // CAMERA
  // ---------------------
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  scene.add(camera);

  // RENDERER
  // ---------------------
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // STEREOSCOPIC
  // ---------------------
  effect = new THREE.StereoEffect(renderer);

  // LIGHTS
  // ---------------------
  // AMBIENT
  ambientLight = new THREE.AmbientLight(0xbbbbbb);
  scene.add(ambientLight);
  // DIRECTIONAL lighting
  directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 0.5).normalize();
  scene.add(directionalLight);

  // OBJECTS
  // ---------------------
  // PLANE
  var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10), new THREE.MeshNormalMaterial());
  plane.overdraw = true;
  scene.add(plane);
}


// ------------------------------------------
// RESIZE SCREEN
// ------------------------------------------
function setWindowSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  switch(setView.vrMode) {
    case false:
      renderer.setSize(window.innerWidth, window.innerHeight);
      break;
    case true:
      effect.setSize(window.innerWidth, window.innerHeight);
      break;
    default:
      renderer.setSize(window.innerWidth, window.innerHeight);
  }
  camera.updateProjectionMatrix();
}


// ------------------------------------------
// PLAYER
// ------------------------------------------

// CREATE a new player object
// with map etc..
function Player() {
  // GEOMETRY
  var geometry = new THREE.BoxGeometry(5, 5, 5);
  // UV MAP
  var material = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('img/box-map.jpg')
  });
  var f1 = [new THREE.Vector2(0, 0.666), new THREE.Vector2(0.5, 0.666), new THREE.Vector2(0.5, 1), new THREE.Vector2(0, 1)];
  var f2 = [new THREE.Vector2(0.5, 0.666), new THREE.Vector2(1, 0.666), new THREE.Vector2(1, 1), new THREE.Vector2(0.5, 1)];
  var f3 = [new THREE.Vector2(0, 0.333), new THREE.Vector2(0.5, 0.333), new THREE.Vector2(0.5, 0.666), new THREE.Vector2(0, 0.666)];
  var f4 = [new THREE.Vector2(0.5, 0.333), new THREE.Vector2(1, 0.333), new THREE.Vector2(1, 0.666), new THREE.Vector2(0.5, 0.666)];
  var f5 = [new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.5, 0.333), new THREE.Vector2(0, 0.333)];
  var f6 = [new THREE.Vector2(0.5, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 0.333), new THREE.Vector2(0.5, 0.333)];
  // Init Uv
  geometry.faceVertexUvs[0] = [];
  // f1
  geometry.faceVertexUvs[0][0] = [ f1[0], f1[1], f1[3] ];
  geometry.faceVertexUvs[0][1] = [ f1[1], f1[2], f1[3] ];
  // f2
  geometry.faceVertexUvs[0][2] = [ f2[0], f2[1], f2[3] ];
  geometry.faceVertexUvs[0][3] = [ f2[1], f2[2], f2[3] ];
  // f3
  geometry.faceVertexUvs[0][4] = [ f3[0], f3[1], f3[3] ];
  geometry.faceVertexUvs[0][5] = [ f3[1], f3[2], f3[3] ];
  // f4
  geometry.faceVertexUvs[0][6] = [ f4[0], f4[1], f4[3] ];
  geometry.faceVertexUvs[0][7] = [ f4[1], f4[2], f4[3] ];
  // f5
  geometry.faceVertexUvs[0][8] = [ f5[0], f5[1], f5[3] ];
  geometry.faceVertexUvs[0][9] = [ f5[1], f5[2], f5[3] ];
  // f6
  geometry.faceVertexUvs[0][10] = [ f6[0], f6[1], f6[3] ];
  geometry.faceVertexUvs[0][11] = [ f6[1], f6[2], f6[3] ];
  // PLAYER
  var player = new THREE.Mesh(geometry, material);
  player.overdraw = true;

  return player;
}

// CREATE a user instance
function addPlayer(user) {
  if (socket.id !== user.name) {
    // CREATE the player
    players[user.name] = {
      obj: new Player(),
      name: user.name,
      position: new THREE.Vector3(user.position.x, user.position.y, user.position.z),
      rotation: new THREE.Vector3(user.rotation._x, user.rotation._y, user.rotation._z),
      lastPos: null,
      sequences: []
    };
    players[user.name].obj.name = user.name;
    players[user.name].obj.position.copy(players[user.name].position);

    // Add to scene
    scene.add(players[user.name].obj);

    // ///////
    // LOG
    // ///////
    console.log("-------------------------------------------------");
    console.log("PLAYER : " + players[user.name].name + " ADDED");
    console.log(players[user.name].obj);
    console.log(players[user.name].lastPos);
    console.log("-------------------------------------------------");
    // ///////
  }
}


// --------------------------------------------
// INIT GAME WORLD WITH USERS
// --------------------------------------------

// ---------------------------
// 1: INIT the current socket player
// ---------------------------
socket.on('initPlayer', function(){

  // Player
  players[socket.id] = {
    obj: new Player(),
    name: socket.id,
    position: new THREE.Vector3(0, 0, 2.5),
    rotation: new THREE.Vector3(0, 0, 0),
    lastPos: null,
    sequences: [],
  };
  players[socket.id].obj.name = players[socket.id].name;
  players[socket.id].obj.position.copy(players[socket.id].position);
  scene.add(players[socket.id].obj);

  // ///////
  // LOG
  // ///////
  console.log("-------------------------------------------------");
  console.log("CURRENT SOCKET PLAYER : " + socket.id + " ADDED");
  console.log(players[socket.id].obj);
  console.log(players[socket.id].lastPos);
  console.log("-------------------------------------------------");
  // ///////

  // ---------------------------
  // 2: INIT users
  // Ask for all current users
  // ---------------------------
  socket.emit('initUsers');
});

// ---------------------------
// 2: INIT users
// ---------------------------
// Get the users and init an instance for all of them
socket.on('initUsers', function(users){
  // Loop on users
  for (var user in users) {
    addPlayer(users[user]);
  }
  // ---------------------------
  // 3: ADD current socket player to the users array on the server
  // ---------------------------
  socket.emit('addUser', players[socket.id]);
});

// ---------------------------
// 4: ADD new user
// ---------------------------
socket.on('newUser', function(user) {
  console.log(user);
  addPlayer(user);
});

// ---------------------------
// DELETE the disconnected player
// ---------------------------
socket.on('deletePlayer', function(id) {
  scene.remove(players[id].obj);
  console.log("PLAYER : " + id + " DELETED");
  delete players[id];
});



// CONTROLS
// --------------------------------------------

// CAMERA
function cameraPos(o,t) {
  o.position.x = t.position.x;
  o.position.y = t.position.y + -30;
  camera.position.z = 35;
  camera.lookAt(t.position);
}

// ROTATE
function rotateObj(o,s,a,b) {
  var n = (keys[a] ? s : 0) + (keys[b] ? -s : 0);
  o.rotation.z += n;
}

// MOVE
function moveObj(o,s,a,b) {
  var n = (keys[a] ? a : 0) + (keys[b] ? b : 0);
  if (keys[a] || keys[b]) {
    socket.emit('movePlayer', o.name, n);
  }
}



function movingObj(o,t,r,b,l) {
  // IF an arrow key is down
  if (keys[t] || keys[r] || keys[b] || keys[l]) {

    // 1: SEND intended movement and associated sequences to the server
    // we are not sending position to avoid cheater
    var sequenceUUID = generateUUID();
    socket.emit('movePlayer', o.name, keys, sequenceUUID);
    o.sequences.push(sequenceUUID);

    // 2: PREDICT the movement of the player during the server process
    // normaly it's the same movement as the server will
    var posX = 50 * 0.015;
    var posY = 50 * 0.015;
    posX = (keys[l] ? -posX : 0) + (keys[r] ? posX : 0);
    posY = (keys[t] ? posY : 0) + (keys[b] ? -posY : 0);
    o.obj.position.x += posX;
    o.obj.position.y += posY;
  }
}



// POSITIONS OF USERS
// --------------------------------------------

// SET the positions of the current socket players
socket.on('movePlayer', function(name, position, sequence) {
  if (sequence !== players[name].sequences[0]) {
    players[name].obj.position.y = position.y;
    players[name].obj.position.x = position.x;
  }
  // Clear the last sequence
  players[name].sequences.shift();
});

// SET the positions of all current players
socket.on('setPosition', function(users) {
  for (var user in users) {
    if (players[user] && user !== socket.id) {
      if (players[user].lastPos !== users[user].position) {
        players[user].obj.position.copy(users[user].position);
      }
      players[user].lastPos = users[user].position;
    }
  }
});



// ANIMATE ALL
// ----------------
function animate() {
  requestAnimationFrame(animate);

  // Calculate the time delta for this frame.
  var now = Date.now();
  var deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  if (players[socket.id] !== undefined) {
    // MOVING current socket player
    movingObj(players[socket.id], 38, 39, 40, 37);
    // Camera follow the current socket player
    cameraPos(camera, players[socket.id].obj);
  }
  render(setView.vrMode);
}


// ------------------------------------------
// RENDER
// ------------------------------------------

// RENDER
function render(mode) {
  switch(setView.vrMode) {
    case false:
      renderer.render(scene, camera);
      break;
    case true:
      effect.render(scene, camera);
      break;
    default:
      renderer.render(scene, camera);
  }
  setWindowSize();
}


// ------------------------------------------
// LAUNCH
// ------------------------------------------
init();
render(setView.vrMode);
animate();


// ------------------------------------------
// STATS
// ------------------------------------------
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();stats.domElement.style.cssText='position:fixed;left:0;top:0;z-index:10000';document.body.appendChild(stats.domElement);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop);});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})();

