'use strict';

var glProgramPositionMap;
var noiseVerticesBuffer;
var noiseTextureUVBuffer;
var junkBuffer;
var noiseVerticesIndexBuffer;
var rttFramebufferPosMap;

/*function Noise(res, size, x, y, z){

rttFramebufferPosMap

	this.res = res;
	this.x = x;
	this.y = y;
	this.z = z;
	this.size = size;
	//rttFramebufferPosMap = null;

	*/
function PositionMap(res, patch, corners) {

	this.patch = patch;

	this.corners = corners;
	this.res = res; // Position Map has 1 pixel border

	//console.log(this.res);

	//this.rttFramebufferPosMap = gl.createFramebuffer();

	if (noiseVerticesIndexBuffer == null) {
		glProgramPositionMap = utils.addShaderProg(gl, 'posmap');

	    // Position attribute for the quad that gets drawn on the whole screen
	    glProgramPositionMap.vertexPos = gl.getAttribLocation(glProgramPositionMap, 'aVertexPosition');
	 	glProgramPositionMap.uv = gl.getAttribLocation(glProgramPositionMap, 'aTextureCoord');

	 	gl.enableVertexAttribArray(glProgramPositionMap.vertexPos);
	 	gl.enableVertexAttribArray(glProgramPositionMap.uv);
	 	
	    // Four cube corners of the patch
		glProgramPositionMap.v0 = gl.getUniformLocation(glProgramPositionMap, 'v0');
		glProgramPositionMap.v1 = gl.getUniformLocation(glProgramPositionMap, 'v1');
		glProgramPositionMap.v2 = gl.getUniformLocation(glProgramPositionMap, 'v2');
		glProgramPositionMap.v3 = gl.getUniformLocation(glProgramPositionMap, 'v3');
		glProgramPositionMap.uTexelStep = gl.getUniformLocation(glProgramPositionMap, 'uTexelStep');

		var noiseVertices = [
		    -1.0,  1.0, 0.0,
		     1.0,  1.0, 0.0,
		    -1.0, -1.0, 0.0,
		     1.0, -1.0, 0.0
		];

	  	// upload vertices
		noiseVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, noiseVerticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(noiseVertices), gl.STATIC_DRAW);

	    // upload indices buffer
		var noiseVertexIndices = [
		    1, 0, 2,
		    2, 3, 1
		]

		noiseVerticesIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, noiseVerticesIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(noiseVertexIndices), gl.STATIC_DRAW);

		var textureCoordinates = [
			0.0, 1.0,
		    1.0, 1.0,
		    0.0, 0.0,
		    1.0, 0.0
		];



		// upload texture coords
		noiseTextureUVBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, noiseTextureUVBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

		junkBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3]), gl.STATIC_DRAW);

		rttFramebufferPosMap = gl.createFramebuffer();
	}
}


PositionMap.prototype.createTextureFramebuffer = function() 
{
	gl.enable(gl.CULL_FACE);
	gl.disable(gl.DEPTH_TEST);
	gl.cullFace(gl.BACK);
	gl.depthMask(false);
	//gl.disable(gl.CULL_FACE);
	//gl.viewport(0, 0, heightmapRes, heightmapRes);
	//this.rttFramebufferPosMap = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebufferPosMap);
	
	this.positionMapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.positionMapTexture);

	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
   // gl.generateMipmap(gl.TEXTURE_2D);

	if (true) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.res, this.res, 0, gl.RGBA, gl.FLOAT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
		
		//gl.generateMipmap(gl.TEXTURE_2D);
	}
	else {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.res, this.res, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); 
	}

	//var renderbuffer = gl.createRenderbuffer();
   // gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  //  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, res, res);

	
	// Set wrapping to CLAMP_TO_EDGE
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.positionMapTexture, 0);
   // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

	gl.bindTexture(gl.TEXTURE_2D, null);
    //gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    return this.positionMapTexture;
}

PositionMap.prototype.bakePositionMap = function() {
	//gl.disableVertexAttribArray(glProgram.verticesLocation);
	//gl.disableVertexAttribArray(glProgram.barycentricLocation);
	//gl.disableVertexAttribArray(glProgram.uv);

//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebufferPosMap);

	gl.useProgram(glProgramPositionMap);

//	console.log(this.corners[1], this.corners[0]);
	var temp1 = vec3.create();
	vec3.sub(temp1, this.corners[1], this.corners[0]);
//console.log(temp1);



	var temp2 = vec3.create();
	vec3.sub(temp2, this.corners[2], this.corners[0]);


	gl.uniform1f(glProgramPositionMap.uTexelStep, this.patch.texelStep);
	gl.uniform3fv(glProgramPositionMap.v0, this.corners[0]);
	gl.uniform3fv(glProgramPositionMap.v1, temp2);
	gl.uniform3fv(glProgramPositionMap.v2, temp1);
	gl.uniform3fv(glProgramPositionMap.v3, temp2);

	gl.bindBuffer(gl.ARRAY_BUFFER, junkBuffer);
	gl.vertexAttribPointer(glProgram.verticesLocation, 1, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.barycentricLocation, 1, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(glProgram.heightmapTexCoord, 1, gl.FLOAT, false, 0, 0);
	//gl.vertexAttribPointer(glProgram.normalUV, 1, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, noiseVerticesBuffer);
	gl.vertexAttribPointer(glProgramPositionMap.vertexPos, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, noiseTextureUVBuffer);
	gl.vertexAttribPointer(glProgramPositionMap.uv, 2, gl.FLOAT, false, 0, 0);

	gl.viewport(0, 0, this.res, this.res);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, noiseVerticesIndexBuffer);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  //  gl.generateMipmap(gl.TEXTURE_2D);

  	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	//gl.disableVertexAttribArray(glProgramPositionMap.vertexPos);
	//gl.disableVertexAttribArray(glProgramPositionMap.uv);
//	gl.deleteBuffer(verticesBuffer);
}