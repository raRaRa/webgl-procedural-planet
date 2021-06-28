'use strict';

// Debug variables
var DEBUG_CUBE = false;
var DEBUG_POSMAP = false;
var DEBUG_TURNOFF_CPU_NOISE = true;

// Creates a mesh for each side of the cube
var terrainBaryBuffer;
var terrainUVBuffer;
var heightmapTexCoordBuffer;
var baryCoordinates = [];
var terrainUV = [];
var heightmapTexCoord = [];

var currDepth = -1;

function TerrainPatch(glProgram, patchSize, faceId, cubePosition, x, y, width, depth) {
	this.x = x;
	this.y = y;

	this.faceId = faceId;

	this.cubePosition = cubePosition;
	this.depth = depth;
	this.width = width;
	this.patchSize = patchSize;
	this.patchCorners = [];
	this.vertices = [];
	this.normalUV = [];
	this.mulX = 1;
	this.mulY = 1;
	this.min = vec3.fromValues(999999, 999999, 999999);
	this.max = vec3.fromValues(-999999, -999999, -999999);
	this.res = 128;
	this.modelMatrix = mat4.create();
	this.modelViewMatrix = mat4.create();
	this.viewSpacePos = vec3.create();
	this.centerPos = Vec3.create();
	this.texelStep = this.width / this.res;


	if (this.cubePosition.y == 1) {
		this.cullFace = gl.FRONT;
	}
	else if (this.cubePosition.y == -1) {
		this.cullFace = gl.BACK;
	}
	else if (this.cubePosition.x == 1) {
		this.cullFace = gl.FRONT
	}
	else if (this.cubePosition.x == -1) {
		this.cullFace = gl.BACK;
	}
	else if (this.cubePosition.z == 1) {
		this.cullFace = gl.BACK;
	}
	else if (this.cubePosition.z == -1) {
		this.cullFace = gl.FRONT;
	}

	var step = width / (this.res); // One pixel?
	//console.log(width, this.res);


	if (!DEBUG_QUADTREE) {
		this.heightmapOffset = 1.0 / (this.res + 2) * 0.5;

		if (this.cubeZ == 1)
			this.heightmapOffset *= -1;

		this.heightmapOffset = 0;
	}

	//step = width / (this.res);	
	//step = width / (posMapRes - 2);
//	step += step;
	//step = 1 / posMapRes;



	//step = 0;
	if (this.cubePosition.x != 0) {
		this.mulY = -1;

		this.patchCorners[0] = vec3.fromValues(x - step, 			y + step, 			this.cubePosition.x);
		this.patchCorners[1] = vec3.fromValues(x + width + step, 	y + step, 			this.cubePosition.x);
		this.patchCorners[2] = vec3.fromValues(x - step, 			y - width - step, 	this.cubePosition.x);
		this.patchCorners[3] = vec3.fromValues(x + width + step, 	y - width - step, 	this.cubePosition.x);

		if (depth > currDepth) {
			currDepth = depth;
//			console.log(this.patchCorners[0], x, y, depth, this.patchCorners, step, width);
		}

 	}
	else if (this.cubePosition.y != 0) {
		this.patchCorners[0] = vec3.fromValues(x - step, 			this.cubePosition.y, (y + step) * -1);
		this.patchCorners[1] = vec3.fromValues(x + width + step, 	this.cubePosition.y, (y + step) * -1);
		this.patchCorners[2] = vec3.fromValues(x - step, 			this.cubePosition.y, (y - width - step) * -1);
		this.patchCorners[3] = vec3.fromValues(x - width - step, 	this.cubePosition.y, (y + width + step) * -1);
	}
	else {
		this.mulY = -1;

		this.patchCorners[0] = vec3.fromValues(this.cubePosition.z, y + step, 		x - step);
		this.patchCorners[1] = vec3.fromValues(this.cubePosition.z, y + step, 		x + width + step);
		this.patchCorners[2] = vec3.fromValues(this.cubePosition.z, y - width - step, x - step);
		this.patchCorners[3] = vec3.fromValues(this.cubePosition.z, y - width - step, x + width + step);	
	}

	this.createMesh();

	// The reason why the resolution has +3 instead of +2 is because of the interpolation in the fragment shader. It goes from 0 + 0.5 to res - 1.0 + 0.5. After subtracting half texel in the fragment shader
	// the interpolation will be from 0 to res-1 instead of 0 to res. To fix this we add 1 to the resolution. It feels like a ugly hack but it works for now. Maybe look into it later.
	

	if (!DEBUG_QUADTREE) {
		this.noise = new PositionMap(this.res + 3, this, this.patchCorners);
		this.positionMapTexture = this.noise.createTextureFramebuffer();
		this.noise.bakePositionMap();
	


		if (!DEBUG_POSMAP) {
			var normalMap = new NormalMap(this.res, this, this.positionMapTexture);
			this.normalMapTexture = normalMap.createTextureFramebuffer();
			normalMap.bakeNormalMap();

			var heightMap = new HeightMap(this.res + 2, this, this.positionMapTexture);
			this.heightMapTexture = heightMap.createTextureFramebuffer();
			heightMap.bakeHeightMap();

			// Delete the Position Map texture
			gl.deleteTexture(this.positionMapTexture);
		}
	}

	// Switch to the main program
	gl.useProgram(glProgram);

	if (verticesIndexBuffer == null) {
		
		var indices = [];
		var index = 0;

		// Create mesh from 0 to size, then we normalize it and center it around 0, so that it's from -1 to 1
		for (var y = 0; y < patchSize * patchSize; y++) {
			indices.push(index, index + 1, index + 2, index + 3, index + 2, index + 1);

			index += 4;
		}

		var indexNum = indices.length;

		// upload indices buffer
		verticesIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		verticesIndexBuffer.numItems = indexNum;
	}	

	// Re-using the bary coordinates for all patches. There's no difference between patches.
	if (terrainBaryBuffer == null) {
		terrainBaryBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainBaryBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(baryCoordinates), gl.STATIC_DRAW);
	}

	// Create OpenGL mesh
	this.meshBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	// Create OpenGL mesh
	/*this.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);*/

	// Normal buffer
	/*this.normalsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);*/

	terrainUVBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrainUVBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrainUV), gl.STATIC_DRAW);


	if (!DEBUG_QUADTREE) {
		heightmapTexCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, heightmapTexCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(heightmapTexCoord), gl.STATIC_DRAW);

		this.normalUVBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalUVBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalUV), gl.STATIC_DRAW);
	}


	// This is used for the frustum view culling. It defines the boundary of this patch.
	if (this.cubePosition.x != 0) {
		this.meshWidthX = this.max[0] - this.min[0];
		this.meshWidthY = this.max[1] - this.min[1];
		this.meshDepth = this.max[2] - this.min[2] + 10;
	}
	else if (this.cubePosition.z != 0) {
		this.meshWidthX = this.max[2] - this.min[2];
		this.meshWidthY = this.max[1] - this.min[1];
		this.meshDepth = this.max[0] - this.min[0] + 10;
	}
	else {
		this.meshWidthX = this.max[0] - this.min[0];
		this.meshWidthY = this.max[2] - this.min[2];
		this.meshDepth = this.max[1] - this.min[1] + 10;
	}
}

TerrainPatch.prototype.createMesh = function() {

	var centerX = ( (9 / patchSize * this.width) + this.x) * this.mulX;
	var centerY = ( (9 / patchSize * this.width) - this.y) * this.mulY;
	
	if (this.cubePosition.x != 0) 
	{
		this.centerPos = getSpherePoint(this.faceId, centerX, centerY, this.cubePosition.x);
	}
	else if (this.cubePosition.y != 0) 
	{
		this.centerPos = getSpherePoint(this.faceId, centerX, this.cubePosition.y, centerY);
	}	
	else 
	{
		this.centerPos = getSpherePoint(this.faceId, this.cubePosition.z, centerY, centerX);
	}

	// Create mesh from 0 to patchSize, then we normalize it and center it around 0, so that it's from -1 to 1.
	for (var meshY = 0; meshY < this.patchSize; meshY++) {
		//console.log("-");
		for (var meshX = 0; meshX < this.patchSize; meshX++) {
			
			// for each triangle push bary coordinates
			if (terrainBaryBuffer == null) 
			{
				baryCoordinates.push(
					1, 0, 0,
					0, 1, 0,
					0, 0, 1,

					1, 0, 0);
			}

			
			// 0 / 18
			// 1 / 18
			var normalPosX = meshX / patchSize;
			var normalPosXRight = (meshX + 1) / patchSize;
			var normalPosY = meshY / patchSize;
			var normalPosYRight = (meshY + 1) / patchSize;

			if (terrainUVBuffer == null) {

				terrainUV.push(	
					normalPosX, 		normalPosY, 
					normalPosXRight, 	normalPosY,
					normalPosX, 		normalPosYRight,
					normalPosXRight, 	normalPosYRight);
			


				var normalCoordX = (normalPosX * (this.res - 2) + 1) / this.res;
				var normalCoordXRight = (normalPosXRight * (this.res - 2) + 1) / this.res;

				var normalCoordY = (normalPosY * (this.res-2) + 1) / this.res;
				var normalCoordYRight = (normalPosYRight * (this.res - 	2) + 1) / this.res;


				this.normalUV.push(
						normalCoordX, 		normalCoordY, 
						normalCoordXRight, 	normalCoordY,
						normalCoordX, 		normalCoordYRight,
						normalCoordXRight, 	normalCoordYRight
						);


				var hmTexelHalf = 1.0 / (this.res + 2) * 0.5;

				var hmX = 		(normalPosX * (this.res - 2) + 1) / this.res;
				var hmXRight = 	(normalPosXRight * (this.res - 2) + 1) / this.res;
				var hmY = 		(normalPosY * (this.res - 2) + 1) / this.res;
				var hmYRight = 	(normalPosYRight * (this.res - 2) + 1) / this.res;

				/*var hmX 		= normalCoordX + hmTexelHalf;
				var hmXRight 	= normalCoordXRight + hmTexelHalf;
				var hmY 		= normalCoordY + hmTexelHalf;
				var hmYRight 	= normalCoordYRight + hmTexelHalf;*/
	/*
				var hmX = meshX / patchSize;
				var hmXRight = (meshX + 1) / patchSize;
				var hmY = meshY / patchSize;
				var hmYRight = (meshY + 1) / patchSize;
	*/

				heightmapTexCoord.push(	
					hmX, 		hmY, 
					hmXRight, 	hmY,
					hmX, 		hmYRight,
					hmXRight, 	hmYRight);


			}

			var tempX = ((meshX / patchSize * this.width) + this.x) * this.mulX;
			var tempY = ((meshY / patchSize * this.width) - this.y) * this.mulY;
			
			var tempRightX = ( ((meshX + 1) / patchSize * this.width) + this.x) * this.mulX;
			var tempRightY = ( ((meshY + 1) / patchSize * this.width) - this.y) * this.mulY;

			if (this.cubePosition.x != 0) {
				this.addSpherePoint(tempX, 		tempY, 		this.cubePosition.x);
				this.addSpherePoint(tempRightX, tempY, 		this.cubePosition.x);
				this.addSpherePoint(tempX,		tempRightY, this.cubePosition.x);
				this.addSpherePoint(tempRightX, tempRightY, this.cubePosition.x);
			}
			else if (this.cubePosition.y != 0) {
				this.addSpherePoint(tempX, 		this.cubePosition.y, tempY);
				this.addSpherePoint(tempRightX, this.cubePosition.y, tempY);
				this.addSpherePoint(tempX, 		this.cubePosition.y, tempRightY);
				this.addSpherePoint(tempRightX, this.cubePosition.y, tempRightY);
			}	
			else 
			{
				this.addSpherePoint(this.cubePosition.z, tempY, 		tempX);
				this.addSpherePoint(this.cubePosition.z, tempY, 		tempRightX);
				this.addSpherePoint(this.cubePosition.z, tempRightY, 	tempX);
				this.addSpherePoint(this.cubePosition.z, tempRightY, 	tempRightX);
			}
		}
	}
}

TerrainPatch.prototype.addSpherePoint = function(x, y, z) {
	/*var tempX2 = x * x; // x^2
	var tempY2 = y * y; // y^2
	var tempZ2 = z * z; // z^2

	var xSphere = x * Math.sqrt( 1 - (tempY2) / 2 - (tempZ2) / 2 + (tempY2 * tempZ2) / 3 ) * planetScale;
	var ySphere = y * Math.sqrt( 1 - (tempZ2) / 2 - (tempX2) / 2 + (tempZ2 * tempX2) / 3 ) * planetScale;
	var zSphere = z * Math.sqrt( 1 - (tempX2) / 2 - (tempY2) / 2 + (tempX2 * tempY2) / 3 ) * planetScale;*/

	var spherePoint = getSpherePoint(this.faceId, x, y, z);

	if (DEBUG_CUBE) {
		spherePoint.x = x * planetScale;
		spherePoint.y = y * planetScale;
		spherePoint.z = z * planetScale;
	}

	this.min[0] = Math.min(this.min[0], spherePoint.x);
	this.min[1] = Math.min(this.min[1], spherePoint.y);
	this.min[2] = Math.min(this.min[2], spherePoint.z);

	this.max[0] = Math.max(this.max[0], spherePoint.x);
	this.max[1] = Math.max(this.max[1], spherePoint.y);
	this.max[2] = Math.max(this.max[2], spherePoint.z);


	if (DEBUG_WORLDSPACE === false) {
		this.vertices.push( spherePoint.x - this.centerPos.x, spherePoint.y - this.centerPos.y, spherePoint.z - this.centerPos.z );
	}
	else {
		this.vertices.push( spherePoint.x, spherePoint.y, spherePoint.z );
	}
}


var debug1 = 1.0;
var debug2 = 1.0;
var debug3 = 1.0;
	
TerrainPatch.prototype.draw = function() 
{
	//gl.enableVertexAttribArray(glProgram.verticesLocation);
	//gl.enableVertexAttribArray(glProgram.barycentricLocation);
	//gl.enableVertexAttribArray(glProgram.uv);
	gl.depthMask(true);
	gl.enable(gl.DEPTH_TEST);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.cullFace(this.cullFace);
//	gl.uniform3fv(glProgram.color, this.color);
	gl.uniform1f(glProgram.drawWireframe, drawWireframe);
	gl.uniform1f(glProgram.depth, this.depth);
	gl.uniform1f(glProgram.res, this.res);
	
	if (!DEBUG_QUADTREE) {
		gl.uniform1f(glProgram.uHeightmapOffset, this.heightmapOffset);

		if (this.cubePosition.z == -1 || this.cubePosition.x == 1 || this.cubePosition.y == 1) {
			gl.uniform1f(glProgram.normalMul, -1.0);
		}
		else {
			gl.uniform1f(glProgram.normalMul, 1.0);
		}
	}
	
	//gl.uniform3f(glProgram.lightPos, lightPos[0]- camera.eye[0], lightPos[1]- camera.eye[1], lightPos[2]- camera.eye[2]);



	if (DEBUG_WORLDSPACE === false) {

		// Get the view space position for this patch
		this.viewSpacePos = vec3.fromValues(this.centerPos.x - camera.eye[0], this.centerPos.y - camera.eye[1], this.centerPos.z - camera.eye[2]);

		// Send the patch center position
		gl.uniform3f(glProgram.patchPos, this.centerPos.x, this.centerPos.y, this.centerPos.z);

		mat4.fromRotationTranslation(this.modelMatrix, camera.eyeRotationInv, [0, 0, 0]);
		mat4.translate(this.modelViewMatrix, this.modelMatrix, this.viewSpacePos);

		gl.uniformMatrix4fv(glProgram.uMVMatrixWorld, false, camera.getModelViewMatrix());
		gl.uniformMatrix4fv(glProgram.uMVMatrix, false, this.modelViewMatrix);
	}

	// Debug values for position map shader
	gl.uniform3f(glProgram.debugvalues, debug1, debug2, debug3);

	//mat3.normalFromMat4(normalMatrix, this.modelViewMatrix);
	//gl.uniformMatrix3fv(glProgram.nMatrix,  false, normalMatrix);

	//var test = vec3.create();
	//vec3.transformMat4(test, lightPos, this.modelMatrix);

	//gl.uniform3f(glProgram.lightPos, test[0], test[1], test[2]);



	//this.viewSpacePos = vec3.fromValues(this.position[0] - camera.eye[0], this.position[1] - camera.eye[1], this.position[2] - camera.eye[2]);

	//mat4.fromRotationTranslation(this.modelViewMatrix, camera.eyeRotation, [0, 0, 0]);
	//mat4.translate(this.modelViewMatrix, this.modelViewMatrix, -camera.eye[0], -camera.eye[1], -camera.eye[2]);
	//mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [-camera.eye[0], -camera.eye[1], -camera.eye[2]]);
	//mat4.translate(this.modelViewMatrix, this.modelViewMatrix, this.viewSpacePos);

	/*gl.uniformMatrix4fv(glProgram.uMVMatrix, false, this.modelViewMatrix);
	mat3.normalFromMat4(normalMatrix, this.modelViewMatrix);
	gl.uniformMatrix3fv(glProgram.nMatrix,  false, normalMatrix);
*/
	gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuffer);
	gl.vertexAttribPointer(glProgram.verticesLocation, 3, gl.FLOAT, false, 0, 0);

	/*gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	gl.vertexAttribPointer(glProgram.normals, 3, gl.FLOAT, false, 0, 0);*/

	gl.bindBuffer(gl.ARRAY_BUFFER, terrainBaryBuffer);
	gl.vertexAttribPointer(glProgram.barycentricLocation, 3, gl.FLOAT, false, 0, 0);

	if (!DEBUG_QUADTREE) {
		gl.bindBuffer(gl.ARRAY_BUFFER, terrainUVBuffer);
		gl.vertexAttribPointer(glProgram.uv, 2, gl.FLOAT, false, 0, 0);

	

		gl.bindBuffer(gl.ARRAY_BUFFER, heightmapTexCoordBuffer);
		gl.vertexAttribPointer(glProgram.heightmapTexCoord, 2, gl.FLOAT, false, 0, 0);

//	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalUVBuffer);
//	gl.vertexAttribPointer(glProgram.normalUV, 2, gl.FLOAT, false, 0, 0);

		gl.uniform1i(glProgram.texture1, 0);  // texture unit 0
	  	gl.uniform1i(glProgram.texture2, 1);  // texture unit 1
	  	gl.uniform1i(glProgram.texture3, 2);  // texture unit 1

	  	// Texture 0
		gl.activeTexture(gl.TEXTURE0);

		if (DEBUG_POSMAP == false) {
			gl.bindTexture(gl.TEXTURE_2D, this.normalMapTexture);
		}
		else {
			gl.bindTexture(gl.TEXTURE_2D, this.positionMapTexture);
		}

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


		// Texture 1
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.heightMapTexture);

		// Texture 2
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, LUTTexture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, verticesIndexBuffer);
	gl.drawElements(gl.TRIANGLES, verticesIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}