'use strict';

var glProgramNormalMap;
var normalVerticesBuffer;
var normalTextureUVBuffer;
var junkBuffer;
var normalVerticesIndexBuffer;


function NormalMap(res, patch, positionMapTexture) {

	this.positionMapTexture = positionMapTexture;
	this.patch = patch;
	this.res = res;
	this.depth = patch.depth;

	//this.rttFramebufferPosMap = gl.createFramebuffer();

	if (normalVerticesIndexBuffer == null) {
		glProgramNormalMap = utils.addShaderProg(gl, 'normalmap');

	    // Position attribute for the quad that gets drawn on the whole screen
	    glProgramNormalMap.vertexPos 	= gl.getAttribLocation(glProgramNormalMap, 'aVertexPosition');
	 	glProgramNormalMap.uv 			= gl.getAttribLocation(glProgramNormalMap, 'aTextureCoord');
	 	glProgramNormalMap.texture1 	= gl.getUniformLocation(glProgramNormalMap, "uPositionMap");
	  	glProgramNormalMap.depth 		= gl.getUniformLocation(glProgramNormalMap, "depth");
	  	glProgramNormalMap.res 			= gl.getUniformLocation(glProgramNormalMap, "res");
	  	glProgramNormalMap.normalMul	= gl.getUniformLocation(glProgramNormalMap, "normalMul");

	 	gl.enableVertexAttribArray(glProgramNormalMap.vertexPos);
	 	gl.enableVertexAttribArray(glProgramNormalMap.uv);

		var normalVertices = [
		    -1.0,  1.0, 0.0,
		     1.0,  1.0, 0.0,
		    -1.0, -1.0, 0.0,
		     1.0, -1.0, 0.0
		];

	  	// upload vertices
		normalVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalVertices), gl.STATIC_DRAW);

	    // upload indices buffer
		var normalVertexIndices = [
		    1, 0, 2,
		    2, 3, 1
		]

		normalVerticesIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, normalVerticesIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(normalVertexIndices), gl.STATIC_DRAW);


		var pw = 0;	//(1.0 / this.res);
		var px = 0;//(1.0 / this.res) / 2;

		var textureCoordinates = [
			0.0 + px, 1.0,
		    1.0, 1.0,
		    0.0 + px, 0.0,
		    1.0, 0.0
		];

		// upload texture coords
		normalTextureUVBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalTextureUVBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);


		junkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3]), gl.STATIC_DRAW);

		rttFramebufferPosMap = gl.createFramebuffer();
	}
}


NormalMap.prototype.createTextureFramebuffer = function() 
{
	gl.enable(gl.CULL_FACE);
	gl.disable(gl.DEPTH_TEST);
	gl.cullFace(gl.BACK);
	//gl.disable(gl.CULL_FACE);
	//gl.viewport(0, 0, heightmapRes, heightmapRes);
	//this.rttFramebufferPosMap = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebufferPosMap);
	
	this.normalMapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.normalMapTexture);

	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
   // gl.generateMipmap(gl.TEXTURE_2D);

	if (false) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.res, this.res, 0, gl.RGB, gl.FLOAT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
		
		//gl.generateMipmap(gl.TEXTURE_2D);
	}
	else {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.res, this.res, 0, gl.RGB, gl.UNSIGNED_BYTE, null); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
	}

	//var renderbuffer = gl.createRenderbuffer();
   // gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  //  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, res, res);

	
	// Set wrapping to CLAMP_TO_EDGE
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.normalMapTexture, 0);
   // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
    //gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    return this.normalMapTexture;
}

NormalMap.prototype.bakeNormalMap = function() {
	//gl.disableVertexAttribArray(glProgram.verticesLocation);
	//gl.disableVertexAttribArray(glProgram.barycentricLocation);
	//gl.disableVertexAttribArray(glProgram.uv);

//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebufferPosMap);
	gl.useProgram(glProgramNormalMap);

	gl.uniform1f(glProgramNormalMap.depth, this.depth);
	gl.uniform1f(glProgramNormalMap.res, this.res);
	gl.uniform1i(glProgramNormalMap.texture1, 0);  // texture unit 0
	if (this.patch.cubePosition.z == -1 || this.patch.cubePosition.x == 1 || this.patch.cubePosition.y == 1)
		gl.uniform1f(glProgramNormalMap.normalMul, -1.0);
	else
		gl.uniform1f(glProgramNormalMap.normalMul, 1.0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.positionMapTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
	gl.vertexAttribPointer(glProgram.verticesLocation, 1, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.barycentricLocation, 1, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.heightmapTexCoord, 1, gl.FLOAT, false, 0, 0);
	//gl.vertexAttribPointer(glProgram.normalUV, 1, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalVerticesBuffer);
	gl.vertexAttribPointer(glProgramNormalMap.vertexPos, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, normalTextureUVBuffer);
	gl.vertexAttribPointer(glProgramNormalMap.uv, 2, gl.FLOAT, false, 0, 0);

	gl.viewport(0, 0, this.res, this.res);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, normalVerticesIndexBuffer);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

//	gl.bindTexture(gl.TEXTURE_2D, this.normalMapTexture);


	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  //  gl.generateMipmap(gl.TEXTURE_2D);

  	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	//gl.disableVertexAttribArray(glProgramNormalMap.vertexPos);
	//gl.disableVertexAttribArray(glProgramNormalMap.uv);
//	gl.deleteBuffer(verticesBuffer);
}