'use strict';


var planetScale = 14;
var patchSize = 16;

var DEBUG_WORLDSPACE = false;

var glProgram = null;
var camera;
//var cameraPlanet;
var numPatchesRendered = 0;
var frustum = null;
var drawWireframe = 0;
var lightPos = vec3.fromValues(0, 0, 800);

function Main()
{
	print("WebGL Planet Experiment");
	print("---------------------------------");

	print("Initializing WebGL")
	initWebGL('canvas');

	if(gl) {
		resourceLoaded();
	}
	else {
		printError("Your browser does not appear to support WebGL");
	}
}
$('#drawWireframe').prop('checked', drawWireframe);
$('#maxdepth').val(MAX_QUADTREE_DEPTH);
$('#distancemul').val(DISTANCE_MUL);

$('#lightx').on('change', function() {
	lightPos[0] = $(this).val();
});

$("#lightx").mousemove( function(e){
    lightPos[0] = $(this).val();

});

$('#maxdepth').on('change', function() {
	MAX_QUADTREE_DEPTH = $(this).val();
});

$('#distancemul').on('change', function() {
	DISTANCE_MUL = $(this).val();
});


var verticesIndexBuffer;
var lineIndexBuffer;
var stats;

var patches = [];
var quadTrees = [];
var normalMatrix;

var LUTTexture;


var consoleVisible = true;

$('#console').css('width', $('canvas').width( ));

$('#console').on('mousedown', function(e) {
	e.preventDefault();
	$('#consoleInput input').focus();
});

function hideConsole() {
	$('#console').addClass('hideConsole');
	consoleVisible = false;
}

function toggleConsole() {
	$('#console').toggleClass('hideConsole');
	$('#console').toggleClass('showConsole');
	consoleVisible = !consoleVisible;

	if (consoleVisible) {
		$('#consoleInput input').focus();
	}
}

function print(text) {
	$('#consoleText').append("<p>"+text+"</p>");
	$("#console").scrollTop($("#console")[0].scrollHeight);
}

function printError(text) {
	$('#consoleText').append("<p class=\"error\">Error: "+text+"</p>");
	$("#console").scrollTop($("#console")[0].scrollHeight);
}

function loadMainShader()
{
	glProgram = utils.addShaderProg(gl, 'program');
}

function loadStats() {
	stats = new Stats();

	stats.setMode(3);
	//document.body.appendChild( stats.domElement );

	$('#canvas').after(stats.domElement);

	$('#ms').show();

	$( "#drawWireframe" ).change(function() {
	  drawWireframe = $('#drawWireframe').prop('checked') ? 1 : 0;
	});
}

function resourceLoaded()
{
	loadMainShader();

	frustum = new Frustum();
	camera 	= new Camera(false);
	//cameraPlanet = new Camera(true);
	normalMatrix = mat3.create();

	loadStats();

	glProgram.verticesLocation 		= gl.getAttribLocation(glProgram, 'aVertexPosition');
	glProgram.normals 				= gl.getAttribLocation(glProgram, 'aNormal');
	glProgram.uv 					= gl.getAttribLocation(glProgram, 'aUV');
	glProgram.heightmapTexCoord 	= gl.getAttribLocation(glProgram, 'aHeightmapTexCoord');
	glProgram.normalUV				= gl.getAttribLocation(glProgram, 'normalUV');
	glProgram.barycentricLocation 	= gl.getAttribLocation(glProgram, 'barycentric');	

  	glProgram.uPMatrix 		= gl.getUniformLocation(glProgram, "uPMatrix");
  	glProgram.nMatrix 		= gl.getUniformLocation(glProgram, "nMatrix");
	glProgram.uMVMatrix 	= gl.getUniformLocation(glProgram, "uMVMatrix");
	glProgram.uMVMatrixWorld= gl.getUniformLocation(glProgram, "uMVMatrixWorld");
	glProgram.logDepthBufFC = gl.getUniformLocation(glProgram, "logDepthBufFC");
	glProgram.color 		= gl.getUniformLocation(glProgram, "color");
	glProgram.drawWireframe = gl.getUniformLocation(glProgram, "drawWireframe");
	glProgram.texture1 		= gl.getUniformLocation(glProgram, "uPositionMap");
	glProgram.texture2 		= gl.getUniformLocation(glProgram, "uHeightMap");
  	glProgram.texture3 		= gl.getUniformLocation(glProgram, "uLUT");
  	glProgram.lightPos		= gl.getUniformLocation(glProgram, "lightPos");
  	glProgram.patchPos		= gl.getUniformLocation(glProgram, "patchPos");
  	glProgram.cameraPos		= gl.getUniformLocation(glProgram, "cameraPos");
  	glProgram.depth 		= gl.getUniformLocation(glProgram, "depth");
  	glProgram.res 			= gl.getUniformLocation(glProgram, "res");
  	glProgram.normalMul		= gl.getUniformLocation(glProgram, "normalMul");
  	glProgram.uHeightmapOffset		= gl.getUniformLocation(glProgram, "uHeightmapOffset");

	gl.enableVertexAttribArray(glProgram.verticesLocation);
	//gl.enableVertexAttribArray(glProgram.normal);
	gl.enableVertexAttribArray(glProgram.heightmapTexCoord);
	gl.enableVertexAttribArray(glProgram.uv);
	//gl.enableVertexAttribArray(glProgram.normalUV);
	gl.enableVertexAttribArray(glProgram.barycentricLocation);



	// LINE
/*	glProgram.lineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, glProgram.lineBuffer);
	gl.vertexAttribPointer(glProgram.verticesLocation, 3, gl.FLOAT, false, 0, 0);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesLine), gl.STATIC_DRAW);*/

	/*lineIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STATIC_DRAW);*/
	// LINE END
	var cubeImage = null;
	
	function initTextures() {
		print("Loading <a href='/textures/lut.png'>lut.png</a>");
		LUTTexture = gl.createTexture();
		cubeImage = new Image();
		cubeImage.onload = function() { handleTextureLoaded(cubeImage, LUTTexture); }
		cubeImage.src = "/textures/lut.png";
	}

	function handleTextureLoaded(image, texture) {
		gl.bindTexture(gl.TEXTURE_2D, texture);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		// gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);

		startEngine();
	}

	initTextures();
}

function startEngine() {
	camera.setOrbit([0.0, 0, 0.0]);
	camera.setEye([0.0, 0.0, 20.0]);

//	gl.uniform1f( glProgram.logDepthBufFC, 2.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 ) );

	generateQuadTrees();	

	print("Done loading!");

	hideConsole();

	animLoop();
}

function generateQuadTrees() {
	// Left and right faces
	quadTrees.push(new QuadTree(glProgram,
								0,
								Vec3.fromValues(0, 0, -1), // Position on the cube
								0, // depth
							   -1, 1, // top left x y
								2, null)); // with and parent

	quadTrees.push(new QuadTree(glProgram,
								1,
								Vec3.fromValues(0, 0, 1), // Position on the cube
								0, // depth
							   -1, 1, // top left x y
								2, null)); // with and parent


	// Top and bottom faces
	quadTrees.push(new QuadTree(glProgram, 
								2,
								Vec3.fromValues(0, -1, 0), // Position on the cube
								0, // depth
							   -1, 1, // top left x y
								2, null)); // with and parent

	quadTrees.push(new QuadTree(glProgram,
								3,
								Vec3.fromValues(0, 1, 0), // Position on the cube
								0, // depth
							   -1, 1, // top left x y
								2, null)); // with and parent

	// Front and back faces
	quadTrees.push(new QuadTree(glProgram,
								4,
								Vec3.fromValues(-1, 0, 0), // Position on the cube
								0, // depth
							   -1, 1, // top left x y
								2, null)); // with and parent

	quadTrees.push(new QuadTree(glProgram,
								5,
								Vec3.fromValues(1, 0, 0), // Position on the cube
								0, // depth
							   -1, 1, // top left x y
								2, null)); // with and parent
}


var lightAnim = 0.1;

function setMatrixUniforms() {

	//console.log(camera.eye[2] - cameraPlanet.eye[2]);
	//camera.setEye([camera.eye[0], camera.eye[1], camera.eye[2]]);

	//cameraPlanet.setEye(camera.eye);
	//lightPos[0] = Math.sin(lightAnim+= 0.005) * 600;

	if (DEBUG_WORLDSPACE) {
		gl.uniformMatrix4fv(glProgram.uMVMatrix, false, camera.getModelViewMatrix());
		gl.uniformMatrix4fv(glProgram.uMVMatrixWorld, false, camera.getModelViewMatrix());		
	}

	//gl.uniformMatrix4fv(glProgram.uMVMatrix, false, camera.getModelViewMatrix());
	gl.uniformMatrix4fv(glProgram.uMVMatrixWorld, false, camera.getModelViewMatrix());
	gl.uniformMatrix4fv(glProgram.uPMatrix,  false, camera.getProjectionMatrix());
	mat3.normalFromMat4(normalMatrix, camera.getModelViewMatrix());
	gl.uniformMatrix3fv(glProgram.nMatrix,  false, normalMatrix);
	gl.uniform3f(glProgram.lightPos, lightPos[0], lightPos[1], lightPos[2]);
	//gl.uniform3f(glProgram.lightPos, lightPos[0] , lightPos[1], lightPos[2] );
	gl.uniform3f(glProgram.cameraPos, camera.eye[0], camera.eye[1], camera.eye[2])
}

var radius = planetScale * planetScale;
var lastDistHorizon = 0;

function drawQuadTrees() {

	gl.uniform1f(glProgram.logDepthBufFC, 2.0 / (Math.log(200000.0 + 1.0) / Math.LN2));
	
	//distPlanet *= distPlanet;

	var distHorizon = (distPlanet - radius) * 2.0;//* 1.16;;
	numPatchesRendered = 0;

	setMatrixUniforms();

	for (var i = 0; i < quadTrees.length; i++) {
		quadTrees[i].draw(distPlanet, distHorizon, false);
	}

	/*if (lastDistHorizon != distHorizon) {
		$('.distHorizon').html(distHorizon);
		lastDistHorizon = distHorizon;
	}*/

	//gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function drawLine() {
/*	gl.bindBuffer(gl.ARRAY_BUFFER, glProgram.lineBuffer);
	gl.vertexAttribPointer(glProgram.verticesLocation, 3, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.barycentricLocation, 3, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.uv, 3, gl.FLOAT, false, 0, 0);


	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
	gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, 0);	*/
}

var secret = 1;
var distPlanet = 0;

function animLoop()
{
	stats.begin();

	distPlanet = fastDistPlanet();
	var distPlanetCamera = fastDistPlanetCamera();

	var planetScaleSurface = planetScale * planetScale * 1.0000001;

	if (speed != 0) {
		var tempSpeed = Math.min((distPlanetCamera - planetScaleSurface) / (300 * planetScale), 0.10);
	  	camera.moveEyeForward(speed * tempSpeed * secret);
 	}

 	if (pitchSpeed != 0)
 	{
 		camera.changeEyePitch(pitchSpeed);
 	}
 	if (rotateSpeed != 0)
 	{
 		camera.changeEyeRotate(rotateSpeed);
 	}
 	if (yawSpeed != 0)
 	{
 		camera.changeEyeYaw(yawSpeed);
 	}
 	if (strafeSpeed != 0) {
 		var tempSpeed = Math.min((distPlanetCamera - planetScaleSurface) / (300 * planetScale), 0.10);
		camera.moveEyeRight(strafeSpeed * tempSpeed);
 	} 		

	drawScene();

	stats.end();
	window.requestAnimFrame(animLoop, canvas);
}

function fastDistPlanet() {
	var dx = camera.eye[0];
	var dy = camera.eye[1];
	var dz = camera.eye[2];

	return (dx*dx + dy*dy + dz*dz);
}

function fastDistPlanetCamera() {
	var dx = camera.eye[0];
	var dy = camera.eye[1];
	var dz = camera.eye[2];

	return (dx*dx + dy*dy + dz*dz);
}

function drawScene()
{
	numPatchesRendered = 0;
	//gl.useProgram(glProgram);


	//gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	//gl.useProgram(glProgram);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//drawLine();
	//gl.enable(gl.CULL_FACE);
	gl.useProgram(glProgram);
	drawQuadTrees();
	//gl.disable(gl.CULL_FACE);

	if (drawFrustum) {
		frustum.draw();
	}
}

Main();
