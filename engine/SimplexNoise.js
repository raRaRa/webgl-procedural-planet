'use strict';

/*vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}*/

var SimplexNoise_GV1 = 1.0 / 289.0;

function mod289_vec4(x) {

    var temp = Vec4.scale(x, SimplexNoise_GV1);
    temp = Vec4.floor(temp);
    temp = Vec4.mul(temp, Vec4.fromValues(289.0, 289.0, 289.0, 289.0 ));
    temp = Vec4.sub(x, temp);

    return temp;
}

/*
float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}*/

function mod289_float(x) {
    return x - Math.floor(x * (1.0 / 289.0)) * 289.0;
}

/*
vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}*/

function permute_vec4(x) {

    var temp = Vec4.scale(x, 34.0);
    temp = Vec4.addNum(temp, 1.0);
    temp = Vec4.mul(temp, x);

    return mod289_vec4(temp);
}

/*
float permute(float x) {
    return mod289(((x*34.0)+1.0)*x);
}
*/

function permute_float(x) {
    return mod289_float( ((x*34.0)+1.0)*x );
}

/*
vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}*/

var lhs = Vec4.fromValues(1.79284291400159, 1.79284291400159, 1.79284291400159, 1.79284291400159);

function taylorInvSqrt_vec4(r) {

    
    var temp = Vec4.scale(r, 0.85373472095314);
    temp = Vec4.sub(lhs, temp);

    return temp;
}

/*
float taylorInvSqrt(float r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}*/

function taylorInvSqrt_float(r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

function fract_vec3(x) {
    return Vec3.sub(x, Vec3.floor(x));
}

function fract_float(x) {
    return x - Math.floor(x);
}
/*
function fract_vec4(x) {
    return Vec4.sub(x, Vec4.floor(x));
}*/

/*vec4 grad4(float j, vec4 ip)
{
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
}*/

var ip = Vec4.fromValues(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);
var ones = Vec3.fromValues(1.0, 1.0, 1.0);

function grad4(j) {
   //    var ones = Vec4.fromValues(1.0, 1.0, 1.0, -1.0);
    //var p = Vec4.create();
    //var s = Vec4.create();
    //p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    var temp = Vec3.mul(Vec3.fromValues(j, j, j), Vec3.fromValues(ip.x, ip.y, ip.z));
    temp = fract_vec3(temp);
    temp = Vec3.scale(temp, 7.0);
    temp = Vec3.floor(temp);
    temp = Vec3.mul(temp, Vec3.fromValues(ip.z, ip.z, ip.z));
    temp = Vec3.subNum(temp, 1.0);

    //p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    var temp2 = Vec3.abs(Vec3.fromValues(temp.x, temp.y, temp.z));
    temp2 = 1.5 - Vec3.dot(temp2, ones);

    var p = Vec4.fromValues(temp.x, temp.y, temp.z, temp2);

    //s = vec4(lessThan(p, vec4(0.0)));

    var s = Vec4.lessThan(p, Vec4.fromValues(0, 0, 0, 0));

    //p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
    var temp3 = Vec3.scale(Vec3.fromValues(s.x, s.y, s.z), 2.0);
    temp3 = Vec3.sub(temp3, ones);
    temp3 = Vec3.mul(temp3, Vec3.fromValues(s.w, s.w, s.w));
    temp3 = Vec3.add(Vec3.fromValues(p.x, p.y, p.z), temp3);

    p.x = temp3.x;
    p.y = temp3.y;
    p.z = temp3.z;
    
    return p;
}

var C = Vec4.fromValues(0.138196601125011,  // (5 - sqrt(5))/20  G4
                        0.276393202250021,  // 2 * G4
                        0.414589803375032,  // 3 * G4
                       -0.447213595499958)  // -1 + 4 * G4

var SimplexNoise_GV2 = Vec4.fromValues(0.309016994374947451, 0.309016994374947451, 0.309016994374947451, 0.309016994374947451);

//float snoise(vec4 v)
function snoise(v) {
    var i = Vec4.dot(v, SimplexNoise_GV2);
    i = Vec4.floor(Vec4.addNum(v, i));

    var x0 = Vec4.sub(v, i);
    x0 = Vec4.addNum(x0, Vec4.dot(i, Vec4.fromValues(C.x, C.x, C.x, C.x)) );

    var i0 = Vec4.create();
    var isX = Vec3.step(Vec3.fromValues(x0.y, x0.z, x0.w), Vec3.fromValues(x0.x, x0.x, x0.x));
    var isYZ = Vec3.step(Vec3.fromValues(x0.z, x0.w, x0.w), Vec3.fromValues(x0.y, x0.y, x0.z));

    i0.x = isX.x + isX.y + isX.z;
    var temp1 = Vec3.sub(ones, isX);
    i0.y = temp1.x;
    i0.z = temp1.y;
    i0.w = temp1.z;
    i0.y += isYZ.x + isYZ.y;
    var temp2 = Vec2.sub(Vec2.fromValues(1.0, 1.0), Vec2.fromValues(isYZ.x, isYZ.y));
    i0.z += temp2.x;
    i0.w += temp2.y;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    /*// i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );*/

    var i3 = Vec4.clamp(i0, 0.0, 1.0);
    var i2 = Vec4.clamp( Vec4.subNum(i0, 1.0), 0.0, 1.0);
    var i1 = Vec4.clamp( Vec4.subNum(i0, 2.0), 0.0, 1.0);

    /*vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;*/

    var x1 = Vec4.addNum( Vec4.sub(x0, i1), C.x );
    var x2 = Vec4.addNum( Vec4.sub(x0, i2), C.y );
    var x3 = Vec4.addNum( Vec4.sub(x0, i3), C.z );
    var x4 = Vec4.addNum( x0, C.w );

    // Permutations
    //i = mod289(i);
    i = mod289_vec4(i);

//.log    console.log(i);

    //float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    var j0 = permute_float( permute_float( permute_float( permute_float(i.w) + i.z) + i.y) + i.x);

  /*  vec4 j1 = permute( permute( permute( permute (
            i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
                                         + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
                                + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
                       + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));*/

  /*  vec4 j1_tmp1 = permute( vec4(i.w, i.w, i.w, i.w) + vec4(i1.w, i2.w, i3.w, 1.0 ) );
    vec4 j1_tmp2 = permute( j1_tmp1 + vec4(i.z, i.z, i.z, i.z) + vec4(i1.z, i2.z, i3.z, 1.0) );
    vec4 j1_tmp3 = permute( j1_tmp2 + vec4(i.y, i.y, i.y, i.y) + vec4(i1.y, i2.y, i3.y, 1.0) );
    vec4 j1 = permute( j1_tmp3 + vec4(i.x, i.x, i.x, i.x) + vec4(i1.x, i2.x, i3.x, 1.0) );*/

    var j1_tmp1 = permute_vec4( Vec4.addNum(Vec4.fromValues(i1.w, i2.w, i3.w, 1.0 ), i.w) );
    var j1_tmp2 = permute_vec4( Vec4.add(Vec4.addNum(j1_tmp1, i.z), Vec4.fromValues(i1.z, i2.z, i3.z, 1.0) ));
    var j1_tmp3 = permute_vec4( Vec4.add(Vec4.addNum(j1_tmp2, i.y), Vec4.fromValues(i1.y, i2.y, i3.y, 1.0) ));
    var j1 = permute_vec4( Vec4.add(Vec4.addNum(j1_tmp3, i.x), Vec4.fromValues(i1.x, i2.x, i3.x, 1.0) ));

    // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
    // 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    /*vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);*/

    
    var p0 = grad4(j0);
    var p1 = grad4(j1.x);
    var p2 = grad4(j1.y);
    var p3 = grad4(j1.z);
    var p4 = grad4(j1.w);

    // Normalise gradients
   /* vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));*/

    var norm = taylorInvSqrt_vec4(Vec4.fromValues(Vec4.dot(p0,p0), Vec4.dot(p1,p1), Vec4.dot(p2, p2), Vec4.dot(p3,p3)));
    p0 = Vec4.scale(p0, norm.x);
    p1 = Vec4.scale(p1, norm.y);
    p2 = Vec4.scale(p2, norm.z);
    p3 = Vec4.scale(p3, norm.w);
    p4 = Vec4.scale( p4, taylorInvSqrt_float(Vec4.dot(p4,p4)) );


    var m0 = Vec3.maxNum( Vec3.sub(Vec3.fromValues(0.6, 0.6, 0.6), Vec3.fromValues(Vec4.dot(x0,x0), Vec4.dot(x1,x1), Vec4.dot(x2,x2)) ), 0.0);
    var m1 = Vec2.maxNum( Vec2.sub(Vec2.fromValues(0.6, 0.6), Vec2.fromValues(Vec4.dot(x3,x3), Vec4.dot(x4,x4)) ), 0.0);

    /*m0 = m0 * m0;
    m1 = m1 * m1;*/

    m0 = Vec3.mul(m0, m0);
    m1 = Vec2.mul(m1, m1);



    return 49.0 * ( Vec3.dot(Vec3.mul(m0, m0), Vec3.fromValues( Vec4.dot( p0, x0 ), Vec4.dot( p1, x1 ), Vec4.dot( p2, x2 )))
                    + Vec2.dot(Vec2.mul(m1, m1), Vec2.fromValues( Vec4.dot( p3, x3 ), Vec4.dot( p4, x4 ) ) ) ) ;
}
/*
float fBm3(in vec3 p, in float H, in float lacunarity, in float offset, in float gain, float time) {
    float result; 
    float frequency = 1.0; 
    float signal;
    float weight;

    signal = offset - abs(snoise(vec4(p, time)));
    signal*= signal;
    result = signal;
    weight = 1.0;

    for(int i = 0; i < octaves; i++) {
        p*= lacunarity;
        weight = clamp(signal*gain, 0.0,1.0);
        signal = offset - abs(snoise(vec4(p, time)));
        signal*= signal * weight;
        result+= signal * pow(frequency, -H);
        frequency*= lacunarity;
    }

    return result;

}
*/

function clamp(x, a, b) {
    //return num < min ? min : (num > max ? max : num);
    return Math.min(Math.max(x, a), b)
};

var octaves = 6;

function fBm3(p, H, lacunarity, offset, gain, time) {
    var result; 
    var frequency = 1.0; 
    var signal;
    var weight;
    var temp = Vec3.fromValues(p.x, p.y, p.z);

    signal = offset - Math.abs(snoise(Vec4.fromValues(p.x, p.y, p.z, time)));
    signal*= signal;
    result = signal;
    weight = 1.0;

    for(var i = 0; i < octaves; i++) {
        temp = Vec3.scale(temp, lacunarity);
        weight = clamp(signal*gain, 0.0, 1.0);
        signal = offset - Math.abs(snoise(Vec4.fromValues(temp.x, temp.y, temp.z, time)));
        signal *= signal * weight;
        result += signal * Math.pow(frequency, -H);
        frequency *= lacunarity;
    }

    return result;

}
/*
float getTerraced(float val, float n, float power)
{
    float dVal = val * n;
    float f = fract(dVal);
    float i = floor(dVal);

    return (i + pow(f, power)) / n;
}*/

function getTerraced(val, n, power)
{
    var dVal = val * n;
    var f = fract_float(dVal);
    var i = Math.floor(dVal);

    return (i + Math.pow(f, power)) / n;
}