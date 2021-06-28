'use strict';

var glProgramHeightMap;
var heightVerticesBuffer;
var heightTextureUVBuffer;
var junkBuffer;
var heightVerticesIndexBuffer;


function HeightMap(res, patch, positionMapTexture) {

	this.positionMapTexture = positionMapTexture;
	this.patch = patch;
	this.res = res;
	this.depth = patch.depth;

	//this.rttFramebufferPosMap = gl.createFramebuffer();

	if (heightVerticesIndexBuffer == null) {
		glProgramHeightMap = utils.addShaderProg(gl, 'heightmap');

	    // Position attribute for the quad that gets drawn on the whole screen
	    glProgramHeightMap.vertexPos 	= gl.getAttribLocation(glProgramHeightMap, 'aVertexPosition');
	 	glProgramHeightMap.uv 			= gl.getAttribLocation(glProgramHeightMap, 'aTextureCoord');
	 	glProgramHeightMap.texture1 	= gl.getUniformLocation(glProgramHeightMap, "uPositionMap");
	  	glProgramHeightMap.depth 		= gl.getUniformLocation(glProgramHeightMap, "depth");
	  	glProgramHeightMap.res 			= gl.getUniformLocation(glProgramHeightMap, "res");

	 	gl.enableVertexAttribArray(glProgramHeightMap.vertexPos);
	 	gl.enableVertexAttribArray(glProgramHeightMap.uv);

		var heightVertices = [
		    -1.0,  1.0, 0.0,
		     1.0,  1.0, 0.0,
		    -1.0, -1.0, 0.0,
		     1.0, -1.0, 0.0
		];

	  	// upload vertices
		heightVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, heightVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(heightVertices), gl.STATIC_DRAW);

	    // upload indices buffer
		var heightVertexIndices = [
		    1, 0, 2,
		    2, 3, 1
		]

		heightVerticesIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, heightVerticesIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(heightVertexIndices), gl.STATIC_DRAW);

/*
		var pw = 0;	//(1.0 / this.res);
		var px = (1.0 / this.res);

		var textureCoordinates = [
			0.0 + px, 1.0,      // 0---1
		    1.0, 1.0,			// |   |
		    0.0 + px, 0.0 + px,	// |   |
		    1.0, 0.0 + px		// 2---3
		];

		// upload texture coords
		heightTextureUVBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, heightTextureUVBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

*/
		junkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3]), gl.STATIC_DRAW);

		rttFramebufferPosMap = gl.createFramebuffer();
	}

	

	// Texture Coordinate for the heightmap texture

	// 0---1
	// |   |
	// |   |
	// 2---3

	// Pixel offset since the heightmap contains one neighbor texel
	var po = 0;//(1.0 / this.res) ;
	//po = po * 3;

/*
	var textureCoordinates = [
		0.0 + po, 1.0 - po,	// 0
	    1.0 - po, 1.0 - po,	// 1
	    0.0 + po, 0.0 + po,	// 2
	    1.0 - po, 0.0 + po	// 3
	];
*/

	var textureCoordinates = [
		0.0 + po, 1.0,	// 0
	    1.0 - po, 1.0,	// 1
	    0.0 + po, 0.0,	// 2
	    1.0 - po, 0.0	// 3
	];

	// upload texture coords
	heightTextureUVBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, heightTextureUVBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
}


HeightMap.prototype.createTextureFramebuffer = function() 
{
	gl.enable(gl.CULL_FACE);
	gl.disable(gl.DEPTH_TEST);
	gl.cullFace(gl.BACK);
	//gl.disable(gl.CULL_FACE);
	//gl.viewport(0, 0, heightmapRes, heightmapRes);
	//this.rttFramebufferPosMap = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebufferPosMap);
	
	this.heightMapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.heightMapTexture);

	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
   // gl.generateMipmap(gl.TEXTURE_2D);



	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.res, this.res, 0, gl.RGB, gl.FLOAT, null); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).


	//var renderbuffer = gl.createRenderbuffer();
   // gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  //  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, res, res);

	
	// Set wrapping to CLAMP_TO_EDGE
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.heightMapTexture, 0);
   // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
    //gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    return this.heightMapTexture;
}

HeightMap.prototype.bakeHeightMap = function() {
	//gl.disableVertexAttribArray(glProgram.verticesLocation);
	//gl.disableVertexAttribArray(glProgram.barycentricLocation);
	//gl.disableVertexAttribArray(glProgram.uv);
//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebufferPosMap);

	gl.useProgram(glProgramHeightMap);

	gl.uniform1f(glProgramHeightMap.depth, this.depth);
	gl.uniform1f(glProgramHeightMap.res, this.res);
	gl.uniform1i(glProgramHeightMap.texture1, 0);  // texture unit 0

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.positionMapTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
	gl.vertexAttribPointer(glProgram.verticesLocation, 1, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.barycentricLocation, 1, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.heightmapTexCoord, 1, gl.FLOAT, false, 0, 0);
	//gl.vertexAttribPointer(glProgram.normalUV, 1, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, heightVerticesBuffer);
	gl.vertexAttribPointer(glProgramHeightMap.vertexPos, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, heightTextureUVBuffer);
	gl.vertexAttribPointer(glProgramHeightMap.uv, 2, gl.FLOAT, false, 0, 0);

	gl.viewport(0, 0, this.res, this.res);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, heightVerticesIndexBuffer);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

//	gl.bindTexture(gl.TEXTURE_2D, this.heightMapTexture);


	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  //  gl.generateMipmap(gl.TEXTURE_2D);

  	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	//gl.disableVertexAttribArray(glProgramHeightMap.vertexPos);
	//gl.disableVertexAttribArray(glProgramHeightMap.uv);
//	gl.deleteBuffer(verticesBuffer);
}