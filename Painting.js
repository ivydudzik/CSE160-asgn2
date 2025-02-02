// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_Size;

// INIT FUNCTIONS //
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// HTML FUNCTIONS //

// UI Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// UI Globals
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10;
let g_selectedSegments = 10;
let g_selectedType = POINT;
let g_mirrorMode = false;

// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clear').onclick = function () { g_shapesList = []; renderAllShapes(); };

  document.getElementById('point').onclick = function () { g_selectedType = POINT; };
  document.getElementById('triangle').onclick = function () { g_selectedType = TRIANGLE; };
  document.getElementById('circle').onclick = function () { g_selectedType = CIRCLE; };

  document.getElementById('mirrormode').onclick = function () { if (g_mirrorMode) g_mirrorMode = false; else g_mirrorMode = true; };

  document.getElementById('sketch').onclick = function () { let sketch = new TotoroSketch(); g_shapesList.push(sketch); renderAllShapes(); };

  // Color Slider Events
  document.getElementById('redSlide').addEventListener("mouseup", function () { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener("mouseup", function () { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener("mouseup", function () { g_selectedColor[2] = this.value / 100; });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener("mouseup", function () { g_selectedSize = this.value; });

  // Circle Segment Slider Events
  document.getElementById('segmentSlide').addEventListener("mouseup", function () { g_selectedSegments = this.value; });
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
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];  // The array to store the sizes of a point

function click(ev) {

  // Get click event in WebGL coordinates
  [x, y] = convertCoordinatesEventToGL(ev);


  // Create and store the new shape
  switch (g_selectedType) {
    case TRIANGLE:
      let triangle = new Triangle();
      triangle.position = [x, y];
      triangle.color = g_selectedColor.slice();
      triangle.size = g_selectedSize;
      g_shapesList.push(triangle);
      if (g_mirrorMode) {
        let triangle_mirror = new Triangle();
        triangle_mirror.position = [-x, y];
        triangle_mirror.color = g_selectedColor.slice();
        triangle_mirror.size = g_selectedSize;
        g_shapesList.push(triangle_mirror);
      }
      break;
    case POINT:
      let point = new Point();
      point.position = [x, y];
      point.color = g_selectedColor.slice();
      point.size = g_selectedSize;
      g_shapesList.push(point);
      if (g_mirrorMode) {
        let point_mirror = new Point();
        point_mirror.position = [-x, y];
        point_mirror.color = g_selectedColor.slice();
        point_mirror.size = g_selectedSize;
        g_shapesList.push(point_mirror);
      }
      break;
    case CIRCLE:
      let circle = new Circle();
      circle.position = [x, y];
      circle.color = g_selectedColor.slice();
      circle.size = g_selectedSize;
      circle.segments = g_selectedSegments;
      g_shapesList.push(circle);
      if (g_mirrorMode) {
        let circle_mirror = new Circle();
        circle_mirror.position = [-x, y];
        circle_mirror.color = g_selectedColor.slice();
        circle_mirror.size = g_selectedSize;
        circle_mirror.segments = g_selectedSegments;
        g_shapesList.push(circle_mirror);
      }
      break;
  }

  // Draw every shape in the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}
function renderAllShapes() {

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

