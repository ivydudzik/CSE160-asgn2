// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
attribute vec2 a_Position; 
attribute vec3 a_Color; 
varying vec3 v_Color; 
void main() { 
v_Color = a_Color; 
gl_Position = vec4(a_Position, 0.0, 1.0); 
}
`

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
varying vec3 v_Color; 
void main() { 
gl_FragColor = vec4(v_Color, 1.0); 
}
`

// Global Vars
let canvas;
let gl;
let u_FragColor;

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

  // Get the storage location of a_Color
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return;
  }


}

function main() {
  // Set up canvas and gl vars
  setupWebGL();

  // Set up GLSL shader program and connect vars
  connectVariablesToGLSL();

  // === VERTEX BUFFER SETUP IN JAVASCRIPT 
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // -1.0, 1.0,
  //   1.0, 1.0,
  //   0.0, -1.0,
  let vertices = new Float32Array([
    -1.0, 1.0,
    1.0, 1.0,
    1.0, -1.0,

    -1.0, -1.0,
    -1.0, 1.0,
    1.0, -1.0,

    0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,


  ]);

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the vertexBuffer buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // // Create a buffer object
  // var colorBuffer = gl.createBuffer();
  // if (!colorBuffer) {
  //   console.log('Failed to create the colorBuffer buffer object');
  //   return -1;
  // }
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 48);
  gl.enableVertexAttribArray(a_Color);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
