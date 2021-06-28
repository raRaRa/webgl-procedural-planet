'use strict';

var vertices = [
     0.0,  1.0,  0.0, 
     0.0,  0.0,  0.0, 
     1.0,  0.0,  0.0, 
     1.0,  1.0,  0.0
];


var verticesLine = [
    0.0, -4.0, 0.0,
    0.0, 4.0, 0.0
];

var lineIndices = [
    0, 1
];

///Convert cube-face coordinates to 3D normalized coordinates
//@param f face id
//@param faceh horizontal face coordinate in range <-1 .. 1>
//@param facev vertical face coordinate in range <-1 .. 1>
//@param xyz [out] 3D normalized coordinates
//@return xyz
//@note face coordinates (u,v) are converted to 3D by normalization of
// (u, v, 1 + M * (1 - u^2) * (1 - v^2))
//cubeface_to_xyz( int f, FLOAT faceh, FLOAT facev, FLOAT xyz[3] )

//static const FLOAT M = FLOAT(0.5/(M_SQRT2 - 1) - 1);
var M = (0.5/(Math.SQRT2 - 1) - 1);

function cubeface_to_xyz( f, faceh, facev)
{
    //FLOAT q0 = faceh*faceh;
    //FLOAT q1 = facev*facev;
    var q0 = faceh * faceh;
    var q1 = facev * facev;

    



    //FLOAT w = 1 + M * (1 - q0) * (1 - q1);
    var w = 1 + M * (1 - q0) * (1 - q1);
    //FLOAT d = 1 / sqrt( q0 + q1 + w*w );
    var d = 1 / Math.sqrt( q0 + q1 + w*w );

    //FLOAT fv = f&1 ? facev : -facev;
    var fv = f&1 ? facev : -facev;
    //const FLOAT xyzxy[5] = { faceh, fv, f&1 ? w : -w, faceh, fv };

   // var xyzxy = Vec3.fromValues(0, 0, 0);
    var indexOffset = 2 - (f >> 1);
    var xyzxy = [faceh, fv, (f&1 ? w : -w), faceh, fv]

   // const FLOAT* pxyz = xyzxy + 2 - (f>>1);
   // xyz[0] = pxyz[0 + indexOffset] * d;
   // xyz[1] = pxyz[1 + indexOffset] * d;
   // xyz[2] = pxyz[2 + indexOffset] * d;


    var result = Vec3.fromValues(xyzxy[0 + indexOffset] * d, xyzxy[1 + indexOffset] * d, xyzxy[2 + indexOffset] * d);
    return Vec3.scale(result, planetScale);
}


function getSpherePoint(faceId, x, y, z) {
	
	switch(faceId) {
		case 0:
			return cubeface_to_xyz(faceId, y, -z);
		case 1:
			return cubeface_to_xyz(faceId, y, z);
		case 2:
			return cubeface_to_xyz(faceId, z, -x);
		case 3:
			return cubeface_to_xyz(faceId, z, x);
		case 4:
			return cubeface_to_xyz(faceId, x, -y);
		case 5:
			return cubeface_to_xyz(faceId, x, y);
		default:
			console.log("ERROR");
	}
}

function cubeface_old_to_xyz(x, y, z) {
	var tempX2 = x * x; // x^2
	var tempY2 = y * y; // y^2
	var tempZ2 = z * z; // z^2

	var result = Vec3.fromValues(x * Math.sqrt( 1 - (tempY2) / 2 - (tempZ2) / 2 + (tempY2 * tempZ2) / 3 ),
								 y * Math.sqrt( 1 - (tempZ2) / 2 - (tempX2) / 2 + (tempZ2 * tempX2) / 3 ),
								 z * Math.sqrt( 1 - (tempX2) / 2 - (tempY2) / 2 + (tempX2 * tempY2) / 3 ));


	// TODO: Re-use from parent

	if (DEBUG_TURNOFF_CPU_NOISE) {
		result = Vec3.scale(result, planetScale);
	}
	else {
		var height = fBm3(result, 0.05, 3.0, 0.7, 1.0, 1.0) * 1.2;
		height = getTerraced(height, 15.0, 1.5 );
		var temp = Vec3.scale(result, height);
		result = Vec3.scale(result, planetScale);
		result = Vec3.add(result, temp);
	}

	return result;
}
