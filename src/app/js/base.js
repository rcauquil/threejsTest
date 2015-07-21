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
var cPlayer;
var oPlayers = {};
var oPositions = {};
var players = {};

// ------------------------------------------
// KEYS
// ------------------------------------------
var keys = {};
document.addEventListener('keydown',function(e){keys[e.keyCode]=true;},false);
document.addEventListener('keyup',function(e){keys[e.keyCode]=false;},false);


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

  // GEOMETRIES
  // ---------------------


  // MATERIALS
  // ---------------------
  // SIMPLE f3
  materialSimple = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('assets/02-box.jpg')
  });

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
// ANIMATE
// ------------------------------------------

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
  var n = (keys[a] ? s : 0) + (keys[b] ? -s : 0);
  o.translateY(n);
}


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
  player.position.z = 2.5;

  return player;
}

function addPlayer(user) {
  if (socket.id !== user.name) {
    // Players
    players[user.name] = {
      obj: new Player(),
      name: socket.id,
      position: {},
      rotation: {}
    };
    players[user.name].obj = new Player();
    players[user.name].obj.name = user;
    // Init Position
    players[user.name].obj.position.x = user.position.x;
    players[user.name].obj.position.y = user.position.y;
    players[user.name].obj.position.z = user.position.z;
    // Init Rotation
    players[user.name].obj.rotation.x = user.rotation._x;
    players[user.name].obj.rotation.y = user.rotation._y;
    players[user.name].obj.rotation.z = user.rotation._z;
    // Add to scene
    scene.add(players[user.name].obj);
  }
}

// 1: INIT the current socket player
socket.on('initPlayer', function(){
  // Player
  players[socket.id] = {
    obj: new Player(),
    name: socket.id,
    position: {},
    rotation: {}
  };
  players[socket.id].name = socket.id;
  scene.add(players[socket.id].obj);
  // 2: INIT users
  // Ask for all current users
  socket.emit('initUsers');
});

// 2: INIT users
// Get the users and init an instance for all of them
socket.on('initUsers', function(users){
  // Loop on users
  for (var user in users) {
    addPlayer(users[user]);
  }
  // 3: ADD current socket player to the users array on the server
  socket.emit('addUser', players[socket.id]);
});

// 4: ADD new user
socket.on('newUser', function(user) {
  addPlayer(user);
});

// SET the positions of all current players
socket.on('setPosition', function(users) {
  for (var user in users) {
    if (players[user] && user !== socket.id) {
      players[user].obj.position.x = users[user].position.x;
      players[user].obj.position.y = users[user].position.y;
      players[user].obj.position.z = users[user].position.z;
      players[user].obj.rotation.x = users[user].rotation._x;
      players[user].obj.rotation.y = users[user].rotation._y;
      players[user].obj.rotation.z = users[user].rotation._z;
    }
  }
});

// DELETE the disconnected player
socket.on('deletePlayer', function(id) {
  scene.remove(players[id].obj);
  delete players[id];
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
    // Set current socket player obj position and rotation
    players[socket.id].position = players[socket.id].obj.position;
    players[socket.id].rotation = players[socket.id].obj.rotation;
    // Send the position of the current socket player to all players
    socket.emit('sendPosition', players[socket.id]);
    // Control the current socket player
    moveObj(players[socket.id].obj, 50 * deltaTime, 38, 40);
    rotateObj(players[socket.id].obj, Math.PI * deltaTime, 37, 39);
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

