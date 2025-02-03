// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// INIT FUNCTIONS //
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
}

// HTML FUNCTIONS //

// UI Globals
let g_viewAngleY = 0;
let g_viewAngleX = 0;

let g_cubeRotationAngle = 0;
let g_cubeRotVecX = 0;
let g_cubeRotVecY = 0;
let g_cubeRotVecZ = 1;

let g_creaturePosX = 0;
let g_creaturePosY = 0;
let g_creaturePosZ = 0;
let g_creatureScaleX = 1;
let g_creatureScaleY = 1;
let g_creatureScaleZ = 1;
let g_creatureAngle = 0;

let g_feetAngle = 0
let g_headAngle = 0
let g_earAngle = 0;

let g_animatingBulbasaur = true;
let g_explodingBulbasaur = false;

// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('animOn').onclick = function () { g_animatingBulbasaur = true; g_explodingBulbasaur = false; };
  document.getElementById('animOff').onclick = function () { g_animatingBulbasaur = false; g_explodingBulbasaur = false; };

  // Scene Manipulation Sliders
  document.getElementById('viewAngleYSlide').addEventListener("mousemove", function () { g_viewAngleY = this.value; renderScene(); });
  document.getElementById('viewAngleXSlide').addEventListener("mousemove", function () { g_viewAngleX = this.value; renderScene(); });

  // Creature Manipulation Sliders
  document.getElementById('feetAngleSlide').addEventListener("mousemove", function () { g_feetAngle = this.value; renderScene(); });
  document.getElementById('headAngleSlide').addEventListener("mousemove", function () { g_headAngle = this.value; renderScene(); });
  document.getElementById('earAngleSlide').addEventListener("mousemove", function () { g_earAngle = this.value; renderScene(); });

  document.getElementById('cubeRotationAngleSlide').addEventListener("mousemove", function () { g_cubeRotationAngle = this.value; renderScene(); });
  document.getElementById('cubeRotationXSlide').addEventListener("mousemove", function () { g_cubeRotVecX = this.value; renderScene(); });
  document.getElementById('cubeRotationYSlide').addEventListener("mousemove", function () { g_cubeRotVecY = this.value; renderScene(); });
  document.getElementById('cubeRotationZSlide').addEventListener("mousemove", function () { g_cubeRotVecZ = this.value; renderScene(); });

}

function main() {
  // Set up canvas and gl vars
  setupWebGL();

  // Set up GLSL shader program and connect vars
  connectVariablesToGLSL();

  // Add HTML UI Actions
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onclick = click;
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  requestAnimationFrame(tick);
}



function click(ev) {

  if (ev.shiftKey) { explode() }

  // Get click event in WebGL coordinates
  [x, y] = convertCoordinatesEventToGL(ev);

  g_viewAngleY = x * 360;
  g_viewAngleX = y * 360;

  renderScene();
}

function explode() {
  g_animatingBulbasaur = false;
  g_explodingBulbasaur = true;
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function updateAnimationAngles() {
  if (g_animatingBulbasaur) {
    g_creaturePosY = 0.01 * Math.sin(g_seconds * 8 + 0.75);
    g_creatureAngle = 1 * Math.sin(g_seconds * 8 + 0.75);
    g_creatureScaleY = 1 + 0.1 * Math.sin(g_seconds * 8 + 0.75);
    g_creatureScaleZ = 1 - 0.1 * Math.sin(g_seconds * 8 + 0.75);

    g_headAngle = (15 * Math.sin(g_seconds * 3 + 0.25));
    g_earAngle = (15 * Math.sin(g_seconds * 8));
    g_feetAngle = (30 * Math.sin(g_seconds * 8 + 0.75));
  } else if (g_explodingBulbasaur) {
    g_creaturePosX = 0.01 * Math.sin(g_seconds * 16);
    g_creaturePosY = 0.01 * Math.sin(g_seconds * 16);
    g_creaturePosZ = 0.01 * Math.sin(g_seconds * 16);
    g_creatureAngle = 1 * Math.cos(g_seconds * 16);
    g_creatureScaleX = 1 + 0.5 * Math.cos(g_seconds * 4);
    g_creatureScaleY = 1 - 0.5 * Math.cos(g_seconds * 4);
    g_creatureScaleZ = 1 + 0.5 * Math.cos(g_seconds * 4);

    g_headAngle = (90 * Math.tan(g_seconds * 16));
    g_earAngle = (90 * Math.tan(g_seconds * 16));
    g_feetAngle = (90 * Math.tan(g_seconds * 16));
  }
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  // Save time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);

  updateAnimationAngles();

  renderScene();

  requestAnimationFrame(tick);
}

function renderScene() {

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  var globalRotateMatrix = new Matrix4();
  globalRotateMatrix.rotate(g_viewAngleY, 0, 1, 0);
  globalRotateMatrix.rotate(g_viewAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotateMatrix.elements);

  /// BULBASAUR MODEL ///

  let objectSpaceMatrix = new Matrix4();
  objectSpaceMatrix.translate(g_creaturePosX, g_creaturePosY, g_creaturePosZ);
  objectSpaceMatrix.rotate(g_creatureAngle, 0, 0, 1);
  objectSpaceMatrix.scale(g_creatureScaleX, g_creatureScaleY, g_creatureScaleZ);
  objectSpaceMatrix.translate(0, 0, 0); // Set Origin

  // Creature Body
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(0.0, 0.0, 0.0);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.45, 0.25, 0.35);
  box.matrix.translate(-0.5, -0.5, -0.5); // Set Origin
  box.render();

  // Creature Bulb Base
  var box = new Cube();
  box.color = [0.55, 0.8, 0.55, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(0.0, 0.2, 0.0);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.325, 0.15, 0.225);
  box.matrix.translate(-0.5, -0.5, -0.5); // Set Origin
  box.render();

  // Creature Bulb Top
  var box = new Cube();
  box.color = [0.55, 0.8, 0.55, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(0.0, 0.3, 0.0);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.175, 0.075, 0.125);
  box.matrix.translate(-0.5, -0.5, -0.5); // Set Origin
  box.render();

  // Creature Head
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(0.25, 0.1, 0.0);
  box.matrix.rotate(g_headAngle, 1, 0, 0);
  let headSpaceMatrix = new Matrix4(box.matrix);
  box.matrix.scale(0.15, 0.25, 0.25);
  box.matrix.translate(-0.5, -0.5, -0.5); // Set Origin
  box.render();

  // Creature Ear Left
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix = new Matrix4(headSpaceMatrix);
  box.matrix.translate(0.0, .125, 0.09);
  box.matrix.rotate(g_earAngle, 0, 0, 1);
  box.matrix.scale(0.05, 0.05, 0.05);
  box.matrix.translate(-0.5, 0, -0.5); // Set Origin
  let leftEarSpaceMatrix = new Matrix4(box.matrix);
  box.render();

  // Creature Ear Right
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix = new Matrix4(headSpaceMatrix);
  box.matrix.translate(0.0, 0.125, -0.09);
  box.matrix.rotate(g_earAngle, 0, 0, 1);
  box.matrix.scale(0.05, 0.05, 0.05);
  box.matrix.translate(-0.5, 0, -0.5); // Set Origin
  let rightEarSpaceMatrix = new Matrix4(box.matrix);
  box.render();

  // Creature Ear Tip Left
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix = new Matrix4(leftEarSpaceMatrix);
  box.matrix.translate(0.0, 0.75, 0.0);
  box.matrix.rotate(g_earAngle, 0, 0, 1);
  box.matrix.scale(0.5, 0.5, 0.5);
  box.matrix.translate(0.5, 0, 0.5);
  box.render();

  // Creature Ear Tip Right
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix = new Matrix4(rightEarSpaceMatrix);
  box.matrix.translate(0.0, 0.75, 0.0);
  box.matrix.rotate(g_earAngle, 0, 0, 1);
  box.matrix.scale(0.5, 0.5, 0.5);
  box.matrix.translate(0.5, 0, 0.5);
  box.render();

  // Creature Left Fore Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(0.175, -0.125, 0.125);
  box.matrix.rotate(g_feetAngle, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -1, -0.5); // Set Origin
  box.render();

  // Creature Right Fore Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(0.175, -0.125, -0.125);
  box.matrix.rotate(g_feetAngle, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -1, -0.5); // Set Origin
  box.render();

  // Creature Left Hind Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(-0.175, -0.125, 0.125);
  box.matrix.rotate(-g_feetAngle, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -1, -0.5); // Set Origin
  box.render();

  // Creature Right Hind Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix = new Matrix4(objectSpaceMatrix);
  box.matrix.translate(-0.175, -0.125, -0.125);
  box.matrix.rotate(-g_feetAngle, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -1, -0.5); // Set Origin
  box.render();

  // // Make a Test Triangle
  // let TestTriangleModelMatrix = new Matrix4()
  // gl.uniformMatrix4fv(u_ModelMatrix, false, TestTriangleModelMatrix.elements);
  // drawTriangle3D([-1.0, 0.0, 0.0, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0])

  // // Rotateable Cube
  // var box = new Cube();
  // box.color = [1, 0.455, 0.545, 1.0];
  // box.matrix.translate(0.25, 0.0, 0.0);
  // box.matrix.rotate(g_cubeRotationAngle, g_cubeRotVecX, g_cubeRotVecY, g_cubeRotVecZ);
  // box.matrix.scale(.25, 0.25, 0.25);
  // box.render();

}

