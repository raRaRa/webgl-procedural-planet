'use strict';

function Plane() {
	this.d = vec3.create();
	this.normal = vec3.create();
	this.point = vec3.create();
}

Plane.prototype.set3Points = function(v1, v2, v3) {
	var aux1 = vec3.create(), aux2 = vec3.create();

	//aux1 = v1 - v2;
	vec3.sub(aux1, v1, v2);
	//aux2 = v3 - v2;
	vec3.sub(aux2, v3, v2);

	//normal = aux2 * aux1;
	vec3.cross(this.normal, aux2, aux1);

	//normal.normalize();
	vec3.normalize(this.normal, this.normal);

	//point.copy(v2);
	vec3.set(this.point, v2[0], v2[1], v2[2]);

	//d = -(normal.innerProduct(point));
	this.d = -innerProduct(this.normal, this.point);
}

Plane.prototype.setNormalAndPoint = function(normal, point) {
	//console.log(normal, point);
	//this.normal.copy(normal);
	//vec3.copy(this.normal, normal);
	vec3.set(this.normal, normal[0], normal[1], normal[2]);
	vec3.set(this.point, point[0], point[1], point[2]);
	//this.normal.normalize();
	vec3.normalize(this.normal, this.normal);
	//this.d = -(this.normal.innerProduct(point));
	this.d = -innerProduct(this.normal, point);
}

Plane.prototype.setCoefficients = function(a, b, c, d) {
	// set the normal vector
	//normal.set(a,b,c);
	this.normal = vec3.fromValues(a, b, c);
	//compute the lenght of the vector
	//float l = normal.length();
	var l = vec3.length(this.normal);
	// normalize the vector
	//normal.set(a/l,b/l,c/l);
	vec3.set(this.normal, a/l, b/l, c/l);
	// and divide d by th length as well
	this.d = d/l;
}

Plane.prototype.distance = function(p) {

	return (this.d + innerProduct(this.normal, p));
}

function innerProduct(v1, v2) {
	// return (x * v.x + y * v.y + z * v.z);
	return (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]);
}