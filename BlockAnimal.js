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

// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  // Button Events
  // document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  // document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  // document.getElementById('clear').onclick = function () { g_shapesList = []; renderScene(); };

  // document.getElementById('point').onclick = function () { g_selectedType = POINT; };
  // document.getElementById('triangle').onclick = function () { g_selectedType = TRIANGLE; };
  // document.getElementById('circle').onclick = function () { g_selectedType = CIRCLE; };

  // document.getElementById('mirrormode').onclick = function () { if (g_mirrorMode) g_mirrorMode = false; else g_mirrorMode = true; };

  // document.getElementById('sketch').onclick = function () { let sketch = new TotoroSketch(); g_shapesList.push(sketch); renderScene(); };

  // // Color Slider Events
  // document.getElementById('redSlide').addEventListener("mouseup", function () { g_selectedColor[0] = this.value / 100; });
  // document.getElementById('greenSlide').addEventListener("mouseup", function () { g_selectedColor[1] = this.value / 100; });
  // document.getElementById('blueSlide').addEventListener("mouseup", function () { g_selectedColor[2] = this.value / 100; });

  // Scene Manipulation Sliders
  document.getElementById('viewAngleYSlide').addEventListener("mousemove", function () { g_viewAngleY = this.value; renderScene(); });
  document.getElementById('viewAngleXSlide').addEventListener("mousemove", function () { g_viewAngleX = this.value; renderScene(); });

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

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  renderScene();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
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

  // Creature Body
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix.translate(0.0, 0.0, 0.0);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.45, 0.25, 0.35);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Bulb Base
  var box = new Cube();
  box.color = [0.55, 0.8, 0.55, 1.0];
  box.matrix.translate(0.0, 0.2, 0.0);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.325, 0.15, 0.225);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Bulb Top
  var box = new Cube();
  box.color = [0.55, 0.8, 0.55, 1.0];
  box.matrix.translate(0.0, 0.3, 0.0);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.175, 0.075, 0.125);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Head
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix.translate(0.25, 0.1, 0.0);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.15, 0.25, 0.25);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Ear Left
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix.translate(0.25, 0.25, 0.09);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.05, 0.05, 0.05);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Ear Right
  var box = new Cube();
  box.color = [0.62, 0.875, 0.612, 1.0];
  box.matrix.translate(0.25, 0.25, -0.09);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.05, 0.05, 0.05);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Left Fore Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix.translate(0.175, -0.15, 0.125);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Right Fore Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix.translate(0.175, -0.15, -0.125);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Left Fore Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix.translate(-0.175, -0.15, 0.125);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -0.5, -0.5);
  box.render();

  // Creature Right Fore Leg
  var box = new Cube();
  box.color = [0.761, 1, 0.78, 1.0];
  box.matrix.translate(-0.175, -0.15, -0.125);
  box.matrix.rotate(0, 0, 0, 1);
  box.matrix.scale(0.075, 0.1, 0.075);
  box.matrix.translate(-0.5, -0.5, -0.5);
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

