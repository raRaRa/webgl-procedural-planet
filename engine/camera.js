'use strict';

var speed = 0;
var pitchSpeed = 0;
var yawSpeed = 0;
var strafeSpeed = 0;
var rotateSpeed = 0;

function Camera(isPlanet){
    this.speed = 0.2;
    this.mvMatrix    = mat4.create();
    this.orbitMatrix = mat4.create();
    this.eyeMatrix   = mat4.create();
    this.pMatrix     = mat4.create();
    this.nMatrix     = mat4.create();
    this.cMatrix     = mat4.create();

    this.isPlanet = isPlanet;
    
    this.fovDegrees = 60;

    //this.aspectRatio = 1.6;
    this.aspectRatio = gl.viewportWidth / gl.viewportHeight;

    this.fov         = this.fovDegrees * (Math.PI / 180);

    this.orbit = [0, 0, 0]; // where we are orbiting
    this.eye   = [0, 0, 0]; // where eye/camera is

    this.orbitRotation  = quat.create();
    this.eyeRotation    = quat.create();
    this.eyeRotationInv = quat.create();
    
    this.rotYaw     = 0;
    this.orbitYaw   = 0;
    this.orbitPitch = 0;

    this.far  = 100;
    this.near = 0.00001;
    this.up   = [0, 1, 0];

    frustum.setCamInternals(this.fovDegrees, this.aspectRatio, this.near, this.far);

    var cameraObj = this;

    $('#consoleInput input').bind('keypress', function (e) {
        if (!consoleVisible || e.which == 176)
            e.preventDefault();

        switch(e.which) {
            case 13:
                var command = $('#consoleInput input').prop('value');

                switch(command.toLowerCase()) {
                    case "about":
                        print("----------------------------------------------------");
                        print("WebGL Procedural Planet Experiment");
                        print("Written by Jón Trausti - icewolfy@gmail.com");
                        print("----------------------------------------------------");
                        break;
                    case "save":
                        localStorage.setItem('camera_eye', JSON.stringify(cameraObj.eye));
                        localStorage.setItem('camera_eye_rotation', JSON.stringify(cameraObj.eyeRotation));
                        print("Position saved", this.eye);
                        break;
                    case "load":
                        var camera_eye = JSON.parse(localStorage.getItem("camera_eye"));
                        var camera_eye_rotation = JSON.parse(localStorage.getItem("camera_eye_rotation"));
                        if (camera_eye !== undefined) {
                            cameraObj.eye = camera_eye;
                            cameraObj.eyeRotation = camera_eye_rotation;
                            print("Position loaded");
                        }
                        else {
                            print("No saved data found");
                        }
                        break;
                    default:
                        printError("Unknown command '" + command + "'");
                        break;
                }

                
                $('#consoleInput input').prop('value', '');
                break;
        }
    });

    function setSpeed(e)  {
        switch(e.which) {
            case 87: // Forward
                speed = .2 * planetScale;
                break;
            case 83: // Backward
                speed = -.2 * planetScale;
                break;
            case 38: // Up cursor
                pitchSpeed = 0.02;
                break;
            case 40: // Down cursor
                pitchSpeed = -0.02;
                break;
            case 37: // LEft cursor
                yawSpeed = 0.02;
                break;
            case 39: // Right cursor
                yawSpeed = -0.02;
                break;
            case 65: // A
                strafeSpeed = 1;
                break;
            case 68: // D
                strafeSpeed = -1;
                break;
            case 81: // Q
                rotateSpeed = 0.02;
                break;
            case 69: // E
                rotateSpeed = -0.02;
                break;
        }
    }

    $(document).on('keydown', function(e) {
        switch(e.which) {
            case 220:
                e.preventDefault();
                toggleConsole();
                break;
            default:
                if (!consoleVisible) {
                    setSpeed(e);
                }
                break;
        }
    });

    $(document).on('keyup', function(e) {
        if (consoleVisible) {
           // e.preventDefault();
            return;
        }
        switch(e.which) {
            case 87: // Forward
                if (speed > 0)
                    speed = 0;
                break;
            case 83: // Backward
                if (speed < 0)
                        speed = 0;
                break;
            case 38: // Up cursor
                pitchSpeed = 0;
                break;
            case 40: // Down cursor
                pitchSpeed = 0;
                break;
            case 81: // Q
                rotateSpeed = 0;
                break;
            case 69: // E
                rotateSpeed = 0;
                break;
            case 37: // LEft cursor
                yawSpeed = 0;
                break;
            case 39: // Right cursor
                yawSpeed = -0;
                break;
            case 65: // A
                if (strafeSpeed > 0)
                    strafeSpeed = 0;
                break;
            case 68: // D
                if (strafeSpeed < 0)
                    strafeSpeed = 0;
                break;
        }
    });

   /* document.addEventListener("keydown", function (event) {
        event.preventDefault();
        
        var ctrl = event.shiftKey;
        var delta = 0.2;
        var key = event.keyCode;        
        var c1 = 0.005;
        var c2 = 0.12;

        if (key == 100) camera.changeOrbitYaw(+0.01 * delta);   // numpad 4
        if (key == 102) camera.changeOrbitYaw(-0.01 * delta);   // numpad 6
        if (key == 98)  camera.changeOrbitPitch(-0.01 * delta); // numpad 2
        if (key == 104) camera.changeOrbitPitch(+0.01 * delta); // numpad 8

        if (key == 38) camera.changeEyePitch(+0.01 * delta * 10); // up arrow
        if (key == 40) camera.changeEyePitch(-0.01 * delta * 10); // down arrow
        if (key == 37) camera.changeEyeYaw(+0.01 * delta * 10);   // left arrow
        if (key == 39) camera.changeEyeYaw(-0.01 * delta * 10);   // right arrow

        if(key == 87) camera.moveEyeForward(c2 * camera.speed);
        if(key == 83) camera.moveEyeBackward(c2 * camera.speed);
        if(key == 65) camera.moveEyeLeft(-c2 * camera.speed);
        if(key == 68) camera.moveEyeRight(-c2 * camera.speed);
        if(key == 82) camera.moveEyeUp(c2 * delta);
        if(key == 70) camera.moveEyeDown(c2 * delta);
        
        if(key == 81) camera.changeEyeYaw(c1 * delta);
        if(key == 69) camera.changeEyeYaw(-c1 * delta);

        camera.speed = Math.min((vec3.distance(camera.eye, [0, 0, 0]) - 3.0001) / 4, 0.3);
    }); */

}

Camera.prototype.update = function(isOrbit){    
    
   /* if(isOrbit) {
        var eye = vec3.create();
                
        vec3.sub(eye, this.eye, this.orbit);
        
        mat4.fromRotationTranslation(this.orbitMatrix, this.orbitRotation, this.orbit);
        mat4.fromRotationTranslation(this.eyeMatrix,   this.eyeRotation,   eye);        
        mat4.multiply(this.mvMatrix, this.orbitMatrix, this.eyeMatrix);
    }
    else {
        
        */

    mat4.fromRotationTranslation(this.mvMatrix, this.eyeRotation, this.eye);//this.eye);
    quat.invert(this.eyeRotationInv, this.eyeRotation);

    if (!freezeFrustum) {
        frustum.setCamDef(this.eye, this.getEyeUpVector(), this.getEyeRightVector());
    }

   // $('.pointVisible').html(frustum.pointInFrustum(vec3.create(0, 0, 0)));

    $('.numPatches').html(numPatchesRendered);

};

Camera.prototype.getModelViewMatrix = function () {
    mat4.invert(this.cMatrix, this.mvMatrix);
    return this.cMatrix;
};

Camera.prototype.getProjectionMatrix = function () {
    mat4.perspective(this.pMatrix, this.fov, this.aspectRatio, this.near, this.far);
    return this.pMatrix;
};

Camera.prototype.getNormalMatrix = function () {    
    var mvMatrix = this.getModelViewMatrix();
    var nMatrix  = this.nMatrix;

    mat4.copy(nMatrix, mvMatrix);
    mat4.invert(nMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix);

    return nMatrix;
};

Camera.prototype.setOrbit = function (newOrbit) {        
    vec3.copy(this.orbit, newOrbit);
    this.update();
};

Camera.prototype.setEye = function (eye) {
    vec3.copy(this.eye, eye);
    this.update();
};

/*Camera.prototype.changeOrbitYaw = function(amount){
    var rotYaw = quat.create();
    
    quat.setAxisAngle(rotYaw, this.up, amount);
    quat.multiply(this.orbitRotation, rotYaw, this.orbitRotation);
    quat.normalize(this.orbitRotation, this.orbitRotation);
    
    this.orbitYaw += amount;
    
    this.update(true);
};

Camera.prototype.changeOrbitPitch = function(amount){
    quat.rotateX(this.orbitRotation, this.orbitRotation, amount);
    quat.normalize(this.orbitRotation, this.orbitRotation);
    
    this.update(true);
};*/

Camera.prototype.changeEyeYaw = function (amount) {    
 /*   var rotYaw = quat.create();    
    quat.setAxisAngle(rotYaw, this.up, amount);
    quat.multiply(this.eyeRotation, rotYaw, this.eyeRotation);
    
    this.rotYaw += amount;
    
    this.update();*/

    quat.rotateY(this.eyeRotation, this.eyeRotation, amount);
    quat.normalize(this.eyeRotation, this.eyeRotation);
    this.update();
};

Camera.prototype.changeEyeRotate = function (amount) {    
 /*   var rotYaw = quat.create();    
    quat.setAxisAngle(rotYaw, this.up, amount);
    quat.multiply(this.eyeRotation, rotYaw, this.eyeRotation);
    
    this.rotYaw += amount;
    
    this.update();*/

    quat.rotateZ(this.eyeRotation, this.eyeRotation, amount);
    quat.normalize(this.eyeRotation, this.eyeRotation);
    this.update();
};

Camera.prototype.changeEyePitch = function (amount) {
    quat.rotateX(this.eyeRotation, this.eyeRotation, amount);
    quat.normalize(this.eyeRotation, this.eyeRotation);
    this.update();
};

Camera.prototype.moveEye = function (direction, velocity) {
    vec3.scale(direction, direction, velocity);
    vec3.sub(this.eye, this.eye, direction);
    this.update();
};

Camera.prototype.moveEyeForward = function (velocity) {
    var dir   = vec3.fromValues(0, 0, 0);
    var right = this.getEyeRightVector();
    var upVector = this.getEyeUpVector();
    
    vec3.cross(dir, right, upVector);
    vec3.normalize(dir, dir);

    //this.moveEye(this.getEyeForwardVector(), velocity);

    this.moveEye(dir, velocity);

    this.update();
};

Camera.prototype.moveEyeBackward = function (velocity) {
    this.moveEyeForward(-velocity);

    //this.moveEye(this.getEyeForwardVector(), velocity);
    
    this.update();
};

Camera.prototype.moveEyeLeft = function (velocity) {
    this.moveEye(this.getEyeRightVector(), -velocity);
};

Camera.prototype.moveEyeRight = function (velocity) {
    this.moveEye(this.getEyeRightVector(), velocity);
};    

Camera.prototype.moveEyeUp = function (velocity) {
    this.eye[1] += velocity;
    this.update();
};

Camera.prototype.moveEyeDown = function (velocity) {
    this.eye[1] -= velocity;
    this.update();
};

Camera.prototype.getEyeForwardVector = function () {
    var q  = this.eyeRotation;
    var qx = q[0], qy = q[1], qz = q[2], qw = q[3];

    var x =     2 * (qx * qz + qw * qy);
    var y =     2 * (qy * qx - qw * qx);
    var z = 1 - 2 * (qx * qx + qy * qy);

    return vec3.fromValues(x, y, z);
};

Camera.prototype.getEyeBackwardVector = function () {
    var v = this.getEyeForwardVector();
    vec3.negate(v, v);
    return v;
};    

Camera.prototype.getEyeRightVector = function () {
    var q  = this.eyeRotation;
    var qx = q[0], 
        qy = q[1], 
        qz = q[2], 
        qw = q[3];

    var x = 1 - 2 * (qy * qy + qz * qz);
    var y =     2 * (qx * qy + qw * qz);
    var z =     2 * (qx * qz - qw * qy);

    return vec3.fromValues(x, y, z);
};

Camera.prototype.getEyeUpVector = function () {
    var q  = this.eyeRotation;
    var qx = q[0], qy = q[1], qz = q[2], qw = q[3];

    var x =     2 * (qx * qy - qw * qz);
    var y = 1 - 2 * (qx * qx + qz * qz);
    var z =     2 * (qy * qz + qw * qx);

    return vec3.fromValues(x, y, z);
};

Camera.prototype.getEyeDownVector = function () {
    var v = this.getEyeUpVector();
    vec3.negate(v, v);
    return v;
};

