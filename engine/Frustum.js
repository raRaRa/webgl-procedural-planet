'use strict';

var HALF_ANG2RAD = Math.PI / 360.0;

var freezeFrustum = false;
var drawFrustum = false;

var	TOP 	= 0,
	BOTTOM 	= 1,
	LEFT 	= 2,
	RIGHT 	= 3,
	NEARP 	= 4,
	FARP 	= 5


function Frustum() {

	$( "#freezeFrustum" ).change(function() {
	  freezeFrustum = $('#freezeFrustum').prop('checked');
	  if (!freezeFrustum) {
	  	camera.update();
	  }
	});

	$( "#drawFrustum" ).change(function() {
	  drawFrustum = $('#drawFrustum').prop('checked');
	});


	this.modelViewMatrix = mat4.create();

	this.program = utils.addShaderProg(gl, 'lines');
	this.program.aVertexPosition 	= gl.getAttribLocation(this.program, 'aVertexPosition');
  	this.program.uPMatrix 			= gl.getUniformLocation(this.program, "uPMatrix");
	this.program.uMVMatrix 			= gl.getUniformLocation(this.program, "uMVMatrix");

	gl.enableVertexAttribArray(this.program.aVertexPosition);



	this.camPos = vec3.create();
	this.X = vec3.create();
	this.Y = vec3.create();
	this.Z = vec3.create();
	this.ntl = vec3.create(), this.nbr = vec3.create(), this.ntr = vec3.create(), this.nbl = vec3.create();
	this.ftl = vec3.create(), this.fbr = vec3.create(), this.ftr = vec3.create(), this.fbl = vec3.create();	

	this.plane = [];
	
	for (var i = 0; i < 6; i++) {
		this.plane[i] = new Plane();
	}

	this.program.meshBuffer = gl.createBuffer();

	this.indices = [
    	0, 1,
    	2, 3,

    	4, 5,
    	6, 7,
    	8, 9,
    	10, 11,
    	12, 13,
    	// Far plane
    	14, 15,
    	16, 17,
    	18, 19,
    	20, 21,
    	/*16, 17,
    	18, 19,
    	20, 21,
    	22, 23*/
	];

	this.frustumIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.frustumIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
}

Frustum.prototype.setCamDef = function(p, u, r) {

	var nc = vec3.create(), fc = vec3.create();

	// Get the front(Z), right(X) and up(Y) vectors
	vec3.set(this.camPos, p[0], p[1], p[2]);
	vec3.set(this.X, r[0], r[1], r[2]);
	vec3.set(this.Y, u[0], u[1], u[2]);
	vec3.cross(this.Z, this.X, this.Y);

	// compute the center of the near and far planes
	//nc = p - Z * nearD;
	nc = vec3.fromValues(this.Z[0] * this.nearD, this.Z[1] * this.nearD, this.Z[2] * this.nearD);
	vec3.sub(nc, p, nc);
	//fc = p - Z * farD;
	fc = vec3.fromValues(this.Z[0] * this.farD, this.Z[1] * this.farD, this.Z[2] * this.farD);
	vec3.sub(fc, p, fc);

	var Ynh = vec3.fromValues(this.Y[0] * this.nh, this.Y[1] * this.nh, this.Y[2] * this.nh);
	var Xnw = vec3.fromValues(this.X[0] * this.nw, this.X[1] * this.nw, this.X[2] * this.nw);

	var Yfh = vec3.fromValues(this.Y[0] * this.fh, this.Y[1] * this.fh, this.Y[2] * this.fh);
	var Xfw = vec3.fromValues(this.X[0] * this.fw, this.X[1] * this.fw, this.X[2] * this.fw);

	// compute the 8 corners of the frustum
	/*
	ntl = nc + Y * nh - X * nw;
	ntr = nc + Y * nh + X * nw;
	nbl = nc - Y * nh - X * nw;
	nbr = nc - Y * nh + X * nw;
	*/

	vec3.add(this.ntl, nc, Ynh);
	vec3.sub(this.ntl, this.ntl, Xnw);

	vec3.add(this.ntr, nc, Ynh);
	vec3.add(this.ntr, this.ntr, Xnw);

	vec3.sub(this.nbl, nc, Ynh);
	vec3.sub(this.nbl, this.nbl, Xnw);

	vec3.sub(this.nbr, nc, Ynh);
	vec3.add(this.nbr, this.nbr, Xnw);

	/*
	ftl = fc + Y * fh - X * fw;
	fbr = fc - Y * fh + X * fw;
	ftr = fc + Y * fh + X * fw;
	fbl = fc - Y * fh - X * fw;
	*/

	vec3.add(this.ftl, fc, Yfh);
	vec3.sub(this.ftl, this.ftl, Xfw);

	vec3.sub(this.fbr, fc, Yfh);
	vec3.add(this.fbr, this.fbr, Xfw);

	vec3.add(this.ftr, fc, Yfh);
	vec3.add(this.ftr, this.ftr, Xfw);

	vec3.sub(this.fbl, fc, Yfh);
	vec3.sub(this.fbl, this.fbl, Xfw);


	// compute the six planes
	// the function set3Points asssumes that the points
	// are given in counter clockwise order
	this.plane[TOP].set3Points(this.ntr, this.ntl, this.ftl);
	this.plane[BOTTOM].set3Points(this.nbl, this.nbr, this.fbr);
	this.plane[LEFT].set3Points(this.ntl, this.nbl, this.fbl);
	this.plane[RIGHT].set3Points(this.nbr, this.ntr, this.fbr);
	var minusZ = vec3.create();
	vec3.negate(minusZ, this.Z);
	this.plane[NEARP].setNormalAndPoint(minusZ, nc);
	this.plane[FARP].setNormalAndPoint(this.Z, fc);

	// Initializing variables
	var aux = vec3.create(), normal = vec3.create();

	var ncYnhSub = vec3.create();
	vec3.sub(ncYnhSub, nc, Ynh);
	var ncYnhAdd = vec3.create();
	vec3.add(ncYnhAdd, nc, Ynh);

	var ncXnwSub = vec3.create();
	vec3.sub(ncXnwSub, nc, Xnw);
	var ncXnwAdd = vec3.create();
	vec3.add(ncXnwAdd, nc, Xnw);

	//aux = (nc + Y*nh) - p;
	vec3.sub(aux, ncYnhAdd, p);

	//normal = aux * X;
	vec3.cross(normal, aux, this.X);
	this.plane[TOP].setNormalAndPoint(normal, ncYnhAdd);

	//aux = (nc - Y*nh) - p
	vec3.sub(aux, ncYnhSub, p);
	//normal = X * aux;
	vec3.cross(normal, this.X, aux);
	this.plane[BOTTOM].setNormalAndPoint(normal, ncYnhSub);

	//aux = (nc - X*nw) - p
	vec3.sub(aux, ncXnwSub, p);
	//normal = aux * Y;
	vec3.cross(normal, aux, this.Y);
	this.plane[LEFT].setNormalAndPoint(normal, ncXnwSub);

	//aux = (nc + X*nw) - p
	vec3.sub(aux, ncXnwAdd, p);
	//normal = Y * aux;
	vec3.cross(normal, this.Y, aux);
	this.plane[RIGHT].setNormalAndPoint(normal, ncXnwAdd);
}

Frustum.prototype.setCamInternals = function(angle, ratio, nearD, farD) {
	this.ratio = ratio;
	this.angle = angle * HALF_ANG2RAD;
	this.nearD = nearD;
	this.farD = farD;

	//console.log(this.nearD);

	// compute width and height of the near and far plane sections
	this.tang = Math.tan(this.angle);
	/*sphereFactorY = 1.0 / Math.cos(this.angle);//tang * sin(this->angle) + cos(this->angle);

	var anglex = Math.atan(tang * ratio);
	sphereFactorX = 1.0 / Math.cos(anglex); //tang*ratio * sin(anglex) + cos(anglex);
*/
	this.nh = nearD * this.tang;
	this.nw = this.nh * this.ratio; 

	this.fh = farD * this.tang;
	this.fw = this.fh * this.ratio;
}

Frustum.prototype.pointInFrustum = function(p) {
	var pcz,pcx,pcy,aux;

	// compute vector from camera position to p
	//Vec3 v = p-camPos;
	var v = vec3.create();
	vec3.sub(v, p, this.camPos);

	// compute and test the Z coordinate
	//pcz = v.innerProduct(-Z);
	var negZ = vec3.create();
	vec3.negate(negZ, this.Z);
	pcz = innerProduct(v, negZ);
	if (pcz > this.farD || pcz < this.nearD)
		return false;

	// compute and test the Y coordinate
	pcy = innerProduct(v, this.Y);
	aux = pcz * this.tang;

	if (pcy > aux || pcy < -aux)
		return false;
		
	// compute and test the X coordinate
	pcx = innerProduct(v, this.X);
	aux = aux * this.ratio;

	if (pcx > aux || pcx < -aux)
		return false;

	return true;
}

Frustum.prototype.boxInFrustum = function(b) {

	var result = true;

	for(var i=0; i < 6; i++) {

		if (this.plane[i].distance(b.getVertexP(this.plane[i].normal)) < 0)
			return false;
		else if (this.plane[i].distance(b.getVertexN(this.plane[i].normal)) < 0)
			result = true;
	}

	return result;
 }

 Frustum.prototype.draw = function() {
	var vertices = [
		// Draw the near plane
		// Near Top Left
    	this.ntl[0], this.ntl[1], this.ntl[2],
    	// Near Top Right
    	this.ntr[0], this.ntr[1], this.ntr[2],
    	// Near Bottom Left
    	this.nbl[0], this.nbl[1], this.nbl[2],
    	// Near Bottom Right
    	this.nbr[0], this.nbr[1], this.nbr[2],

		// Draw line from Near Top Left to Near Bottom Left
    	this.ntl[0], this.ntl[1], this.ntl[2],
    	this.nbl[0], this.nbl[1], this.nbl[2],

		// Draw line from Near Top Right to Near Bottom Right
    	this.ntr[0], this.ntr[1], this.ntr[2],
    	this.nbr[0], this.nbr[1], this.nbr[2],

    	// Draw line from Near Top Left to Far Top Left
    	this.ntl[0], this.ntl[1], this.ntl[2],
    	this.ftl[0], this.ftl[1], this.ftl[2],


    	// Draw line from Near Top Right to Far Top Right
    	this.ntr[0], this.ntr[1], this.ntr[2],
    	this.ftr[0], this.ftr[1], this.ftr[2],

    	// Draw line from Near Bottom Left to Far Bottom Left
    	this.nbl[0], this.nbl[1], this.nbl[2],
    	this.fbl[0], this.fbl[1], this.fbl[2],

    	// Draw line from Near Bottom Right to Far Bottom Right
    	this.nbr[0], this.nbr[1], this.nbr[2],
    	this.fbr[0], this.fbr[1], this.fbr[2],

    	// Draw line from Near Bottom Left to Near Bottom Right
    	this.nbl[0], this.nbl[1], this.nbl[2],
    	this.nbr[0], this.nbr[1], this.nbr[2],

 		// Draw the far plane
		// Far Top Left
    	this.ftl[0], this.ftl[1], this.ftl[2],
    	// Far Top Right
    	this.ftr[0], this.ftr[1], this.ftr[2],
    	// Far Bottom Left
    	this.fbl[0], this.fbl[1], this.fbl[2],
    	// Far Bottom Right
    	this.fbr[0], this.fbr[1], this.fbr[2],

	];
	
	gl.useProgram(this.program);
	gl.lineWidth(2.0);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//gl.disable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.uniformMatrix4fv(this.program.uMVMatrix, false, camera.getModelViewMatrix());
	gl.uniformMatrix4fv(this.program.uPMatrix,  false, camera.getProjectionMatrix());

	//gl.uniform3fv(glProgram.color, [0, 0, 0]);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.program.meshBuffer);
	gl.vertexAttribPointer(this.program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// Disable stuff from previous program (terrainpatch)
	gl.vertexAttribPointer(glProgram.barycentricLocation, 3, gl.FLOAT, false, 0, 0);


	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.frustumIndexBuffer);
	//console.log(this.indices.length / 2);
	gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);	
}
