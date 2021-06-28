'use strict';

function AABox(corner, x, y, z) {
	this.setBox(corner, x, y, z);
}

AABox.prototype.setBox = function(corner, x, y, z) {
	this.corner = vec3.fromValues(corner[0], corner[1], corner[2]);

	if (x < 0.0) {
		x = -x;
		this.corner[0] -= x;
	}
	if (y < 0.0) {
		y = -y;
		this.corner[1] -= y;
	}
	if (z < 0.0) {
		z = -z;
		this.corner[2] -= z;
	}

	this.x = x;
	this.y = y;
	this.z = z;
}

AABox.prototype.getVertexP = function(normal) {
	var res = vec3.fromValues(this.corner[0], this.corner[1], this.corner[2]);

	if (normal[0] > 0)
		res[0] += this.x;

	if (normal[1] > 0)
		res[1] += this.y;

	if (normal[2] > 0)
		res[2] += this.z;

	return res;
}

AABox.prototype.getVertexN = function(normal) {
	var res = vec3.fromValues(this.corner[0], this.corner[1], this.corner[2]);

	if (normal[0] < 0)
		res[0] += this.x;

	if (normal[1] < 0)
		res[1] += this.y;

	if (normal[2] < 0)
		res[2] += this.z;

	return res;
}