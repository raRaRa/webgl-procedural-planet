'use strict';

var gl = null, canvas = null;

function initWebGL(elementId){
	var canvas = document.getElementById(elementId);
	
	try
	{
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;

		addExtension("OES_texture_float");
		addExtension("OES_standard_derivatives");
       // addExtension("EXT_texture_rg");
        //addExtension("EXT_frag_depth");
		//addExtension("GL_EXT_frag_depth");
	}
	catch(ex)
	{
	}
	
}

function addExtension(name) {
	
    print("Loading WebGL extension '"+name+"'");

	var ext = null;
	
	try
	{ 
		ext = gl.getExtension(name);
	} 
	catch(e) 
	{
		printError("Could not load extension '"+name+"'")
	}

	if ( !ext ) 
	{
		printError("Error loading extension '"+name+"'"); 

		return false;
	}

	return true;
}

function makeShader(src, type) {

	//compile the vertex shader
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
	{
		alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
	}

	return shader;
}

var utils = {};

utils.allShaders = {};
utils.FRAGMENT_SHADER = "x-shader/x-fragment";
utils.VERTEX_SHADER = "x-shader/x-vertex";

utils.addShaderProg = function (gl, program) {

    var vertexShaderName = program + ".vertex";
    var fragmentShaderName = program + ".fragment";

    utils.loadShader(vertexShaderName, utils.VERTEX_SHADER);
    utils.loadShader(fragmentShaderName, utils.FRAGMENT_SHADER);

    var vertexShader = utils.getShader(gl, vertexShaderName);
    var fragmentShader = utils.getShader(gl, fragmentShaderName);

    print("Linking shader '"+program+"'");
    var prog = gl.createProgram();
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        printError(" - Could not create shader program")
    }

    return prog;
};

utils.loadShader = function(file, type) {

    print("Loading shader '<a href=\""+file+"\">"+file+"</a>'");
    var cache, shader;

    $.ajax({
        async: false, // need to wait... todo: deferred?
        url: "/shaders/" + file, //todo: use global config for shaders folder?
        success: function(result) {
           cache = {script: result, type: type};
        }
    });

    // store in global cache
    utils.allShaders[file] = cache;
};

utils.getShader = function (gl, id) {

    //get the shader object from our main.shaders repository
    var shaderObj = utils.allShaders[id];
    var shaderScript = shaderObj.script;
    var shaderType = shaderObj.type;

    //create the right shader
    var shader;
    if (shaderType == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderType == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    //wire up the shader and compile
    gl.shaderSource(shader, shaderScript);
    gl.compileShader(shader);

    //if things didn't go so well alert
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    //return the shader reference
    return shader;

};//end:getShader