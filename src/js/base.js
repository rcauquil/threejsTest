// ------------------------------------------
// VARS
// ------------------------------------------
var scene, camera, renderer, effect;
var controls;
var material, materialf3;
var ambientLight, directionalLight;
var cube;
var camMode = "normal";


// ------------------------------------------
// INIT
// ------------------------------------------
function init() {

  scene = new THREE.Scene();

  // CAMERA
  // ---------------------
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.rotation.x = 0.2;
  camera.position.y = -15;
  camera.position.z = 20;
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
  var geometry = new THREE.BoxGeometry(5, 5, 5);

  // MATERIALS
  // ---------------------
  // SIMPLE f3
  materialSimple = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('assets/02-box.jpg')
  });

  // UV TEST
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

  // OBJECTS
  // ---------------------
  // CUBE
  cube = new THREE.Mesh(geometry, material);
  cube.overdraw = true;
  cube.position.z = 2.5;
  scene.add(cube);
  // PLANE
  var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10), new THREE.MeshNormalMaterial());
  plane.overdraw = true;
  scene.add(plane);

  // CONTROLS
  // ---------------------
  controls = new THREE.OrbitControls(camera);
  controls.addEventListener('change', render);
  controls.target.set(0,0,0);
  controls.noPan = true;
  controls.noZoom = false;
}


// ------------------------------------------
// RESIZE SCREEN
// ------------------------------------------
function setWindowSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  switch(camMode) {
    case "nomal":
      renderer.setSize(window.innerWidth, window.innerHeight);
      break;
    case "vr":
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

// ROTATE
function rotateZ(elem) {
  elem.rotation.z += 0.01;
}

// ANIMATE ALL
// ----------------
function animate() {
  requestAnimationFrame(animate);
  rotateZ(cube);
  controls.update();
  render(camMode);
}


// ------------------------------------------
// RENDER
// ------------------------------------------

// CHANGE VIEW on keydown
document.addEventListener('keydown', onDocumentKeyDown, false);
function onDocumentKeyDown() {
  switch (event.keyCode) {
    case 78:
      camMode = "normal";
      break;
    case 83:
      camMode = "vr";
      break;
    default:
      camMode = camMode;
  }
}

// RENDER
function render(mode) {
  switch(camMode) {
    case "nomal":
      renderer.render(scene, camera);
      break;
    case "vr":
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
render(camMode);
animate();


// ------------------------------------------
// STATS
// ------------------------------------------
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();stats.domElement.style.cssText='position:fixed;left:0;top:0;z-index:10000';document.body.appendChild(stats.domElement);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop);});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})();

