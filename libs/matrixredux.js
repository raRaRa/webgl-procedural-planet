'use strict';

var Vec2 = {};

Vec2.create = function() {
  return {
    x: 0,
    y: 0
  };
};

Vec2.fromValues = function(a, b) {
  return {
    x: a !== null ? a : 0.0,
    y: b !== null ? b : 0.0
  };
};

Vec2.clone = function(a) {
  return {
    x: a.x,
    y: a.y
  };
};

//NOTE: Removed set

Vec2.add = function(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
};

Vec2.sub =
  Vec2.subtract = function(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y
    };
  };

Vec2.mul =
  Vec2.multiply = function(a, b) {
    return {
      x: a.x * b.x,
      y: a.y * b.y
    };
  };

Vec2.div =
  Vec2.divide = function(a, b) {
    return {
      x: a.x / b.x,
      y: a.y / b.y
    };
  };

Vec2.min = function(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y)
  };
};

Vec2.max = function(a, b) {
  return {
    x: Math.max(a.x, b.x),
    y: Math.max(a.y, b.y)
  };
};

Vec2.maxNum = function(a, b) {
  return {
    x: Math.max(a.x, b),
    y: Math.max(a.y, b)
  };
};

Vec2.scale = function(a, b) {
  return {
    x: a.x * b,
    y: a.y * b
  };
};

Vec2.scaleAndAdd = function(a, b, scale) {
  return {
    x: a.x + (b.x * scale),
    y: a.y + (b.y * scale)
  };
};

Vec2.dist =
  Vec2.distance = function(a, b) {
    var x = b.x - a.x,
      y = b.y - a.y;
    return Math.sqrt(x * x + y * y);
  };

Vec2.sqrDist =
  Vec2.squaredDistance = function(a, b) {
    var x = b.x - a.x,
      y = b.y - a.y;
    return x * x + y * y;
  };

Vec2.len =
  Vec2.length = function(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  };

Vec2.sqrLen =
  Vec2.squaredLength = function(a) {
    return a.x * a.x + a.y * a.y;
  };

Vec2.neg =
  Vec2.negate = function(a) {
    return {
      x: -a.x,
      y: -a.y
    };
  };

Vec2.inv =
  Vec2.inverse = function(a) {
    return {
      x: 1.0 / a.x,
      y: 1.0 / a.y
    };
  };

Vec2.norm =
  Vec2.normalize = function(a) {
    var len = a.x * a.x + a.y * a.y;
    if (len > 0) {
      len = Math.sqrt(len);
      return {
        x: a.x / len,
        y: a.y / len
      };
    }
    return a;
  };

Vec2.dot = function(a, b) {
  return a.x * b.x + a.y * b.y;
};

//NOTE: Removed cross for vec2

Vec2.lerp = function(a, b, t) {
  return {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y)
  };
};

Vec2.random = function(scale) {
  scale = scale || 1.0;
  var r = Math.random() * 2.0 * Math.PI;
  return {
    x: Math.cos(r) * scale,
    y: Math.sin(r) * scale
  };
};

//TODO: transformMat2
//TODO: transformMat2d
//TODO: transformMat3
//TODO: transformMat4
//TODO: forEach

Vec2.str = function(a) {
  return 'vec2(' + a.x + ', ' + a.y + ')';
};

var Vec3 = {};

Vec3.create = function() {
  return {
    x: 0,
    y: 0,
    z: 0
  };
};

Vec3.fromValues = function(x, y, z) {
  return {
    x: x !== null ? x : 0.0,
    y: y !== null ? y : 0.0,
    z: z !== null ? z : 0.0
  };
};

Vec3.clone = function(a) {
  return {
    x: a.x,
    y: a.y,
    z: a.z
  };
};

//NOTE: Removed set

Vec3.add = function(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
};

Vec3.subNum = function(a, b) {
  return {
    x: a.x - b,
    y: a.y - b,
    z: a.z - b
  };
};

Vec3.sub =
  Vec3.subtract = function(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z
    };
  };

Vec3.mul =
  Vec3.multiply = function(a, b) {
    return {
      x: a.x * b.x,
      y: a.y * b.y,
      z: a.z * b.z
    };
  };

Vec3.div =
  Vec3.divide = function(a, b) {
    return {
      x: a.x / b.x,
      y: a.y / b.y,
      z: a.z / b.z
    };
  };

Vec3.min = function(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    z: Math.min(a.z, b.z)
  };
};

Vec3.max = function(a, b) {
  return {
    x: Math.max(a.x, b.x),
    y: Math.max(a.y, b.y),
    z: Math.max(a.z, b.z)
  };
};

Vec3.maxNum = function(a, b) {
  return {
    x: Math.max(a.x, b),
    y: Math.max(a.y, b),
    z: Math.max(a.z, b)
  };
};

Vec3.floor = function(a) {
  return {
    x: Math.floor(a.x),
    y: Math.floor(a.y),
    z: Math.floor(a.z)
  };
};

Vec3.abs = function(a) {
  return {
    x: Math.abs(a.x),
    y: Math.abs(a.y),
    z: Math.abs(a.z)
  };
};

Vec3.lessThan = function(a, b) {
  return {
    x: (a.x < b.x ? 1 : 0),
    y: (a.y < b.y ? 1 : 0),
    z: (a.z < b.z ? 1 : 0)
  };
};

Vec3.clamp = function(a, min, max) {
  return {
    x: (a.x < min ? min : (a.x > max ? max : a.x) ),
    y: (a.y < min ? min : (a.y > max ? max : a.y) ),
    z: (a.z < min ? min : (a.z > max ? max : a.z) )
  };
};

Vec3.step = function(edge, b) {
  return {
    x: (b.x < edge.x ? 0 : 1),
    y: (b.y < edge.y ? 0 : 1),
    z: (b.z < edge.z ? 0 : 1)
  };
};

Vec3.scale = function(a, b) {
  return {
    x: a.x * b,
    y: a.y * b,
    z: a.z * b
  };
};

Vec3.scaleAndAdd = function(a, b, scale) {
  return {
    x: a.x + (b.x * scale),
    y: a.y + (b.y * scale),
    z: a.z + (b.z * scale)
  };
};

Vec3.dist =
  Vec3.distance = function(a, b) {
    var x = b.x - a.x,
      y = b.y - a.y,
      z = b.z - a.z;
    return Math.sqrt(x * x + y * y + z * z);
  };

Vec3.sqrDist =
  Vec3.squaredDistance = function(a, b) {
    var x = b.x - a.x,
      y = b.y - a.y,
      z = b.z - a.z;
    return x * x + y * y + z * z;
  };

Vec3.len =
  Vec3.length = function(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
  };

Vec3.sqrLen =
  Vec3.squaredLength = function(a) {
    return a.x * a.x + a.y * a.y + a.z * a.z;
  };

Vec3.neg =
  Vec3.negate = function(a) {
    return {
      x: -a.x,
      y: -a.y,
      z: -a.z
    };
  };

Vec3.inv =
  Vec3.inverse = function(a) {
    return {
      x: 1.0 / a.x,
      y: 1.0 / a.y,
      z: 1.0 / a.z
    };
  };

Vec3.norm =
  Vec3.normalize = function(a) {
    var len = a.x * a.x + a.y * a.y + a.z * a.z;
    if (len > 0) {
      return {
        x: a.x / len,
        y: a.y / len,
        z: a.z / len
      };
    }
    return a;
  };

Vec3.dot = function(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};

Vec3.cross = function(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
};

Vec3.lerp = function(a, b, t) {
  return {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
    z: a.z + t * (b.z - a.z)
  };
};

Vec3.random = function(scale) {
  scale = scale || 1.0;
  var r = Math.random() * 2.0 * Math.PI;
  var z = (Math.random * 2.0) - 1.0;
  var s = Math.sqrt(1.0 - z * z) * scale;

  return {
    x: Math.cos(r) * s,
    y: Math.sin(r) * s,
    z: z * scale
  };
};

//TODO: transformMat4
//TODO: transformMat3
//TODO: transformQuat

Vec3.rotateX = function(a, b, c) {
  var p = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
  var r = {
    x: p.x,
    y: p.y * Math.cos(c) - p.z * Math.sin(c),
    z: p.y * Math.sin(c) + p.z * Math.cos(c)
  };
  return {
    x: r.x + b.x,
    y: r.y + b.y,
    z: r.z + b.z
  };
};

Vec3.rotateY = function(a, b, c) {
  var p = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
  var r = {
    x: p.z * Math.sin(c) + p.x * Math.cos(c),
    y: p.y,
    z: p.z * Math.cos(c) - p.x * Math.sin(c)
  };
  return {
    x: r.x + b.x,
    y: r.y + b.y,
    z: r.z + b.z
  };
};

Vec3.rotateZ = function(a, b, c) {
  var p = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
  var r = {
    x: p.x * Math.cos(c) - p.y * Math.sin(c),
    y: p.x * Math.sin(c) + p.y * Math.cos(c),
    z: p.z
  };
  return {
    x: r.x + b.x,
    y: r.y + b.y,
    z: r.z + b.z
  };
};

//TODO: Vec3.forEach

Vec3.str = function(a) {
  return 'vec3(' + a.x + ', ' + a.y + ', ' + a.z + ')';
};










var Vec4 = {};

Vec4.create = function() {
  return {
    x: 0,
    y: 0,
    z: 0,
    w: 0
  };
};

Vec4.fromValues = function(a, b, c, d) {
  return {
    x: a,
    y: b,
    z: c,
    w: d
  };
};

Vec4.clone = function(a) {
  return {
    x: a.x,
    y: a.y,
    z: a.z,
    w: a.w
  };
};

Vec4.add = function(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
    w: a.w + b.w
  };
};

Vec4.addNum = function(a, b) {
  return {
    x: a.x + b,
    y: a.y + b,
    z: a.z + b,
    w: a.w + b
  };
};

Vec4.subNum = function(a, b) {
  return {
    x: a.x - b,
    y: a.y - b,
    z: a.z - b,
    w: a.w - b
  };
};

Vec4.sub =
  Vec4.subtract = function(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z,
      w: a.w - b.w
    };
  };

Vec4.mul =
  Vec4.multiply = function(a, b) {
    return {
      x: a.x * b.x,
      y: a.y * b.y,
      z: a.z * b.z,
      w: a.w * b.w
    };
  };

Vec4.div =
  Vec4.divide = function(a, b) {
    return {
      x: a.x / b.x,
      y: a.y / b.y,
      z: a.z / b.z,
      w: a.w / b.w
    };
  };

Vec4.min = function(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    z: Math.min(a.z, b.z),
    w: Math.min(a.w, b.w)
  };
};

Vec4.max = function(a, b) {
  return {
    x: Math.max(a.x, b.x),
    y: Math.max(a.y, b.y),
    z: Math.max(a.z, b.z),
    w: Math.max(a.w, b.w)
  };
};

Vec4.floor = function(a) {
  return {
    x: Math.floor(a.x),
    y: Math.floor(a.y),
    z: Math.floor(a.z),
    w: Math.floor(a.w)
  };
};

Vec4.abs = function(a) {
  return {
    x: Math.abs(a.x),
    y: Math.abs(a.y),
    z: Math.abs(a.z),
    w: Math.abs(a.w)
  };
};

Vec4.lessThan = function(a, b) {
  return {
    x: (a.x < b.x ? 1 : 0),
    y: (a.y < b.y ? 1 : 0),
    z: (a.z < b.z ? 1 : 0),
    w: (a.w < b.w ? 1 : 0)
  };
};

Vec4.clamp = function(a, min, max) {
  return {
    x: (a.x < min ? min : (a.x > max ? max : a.x) ),
    y: (a.y < min ? min : (a.y > max ? max : a.y) ),
    z: (a.z < min ? min : (a.z > max ? max : a.z) ),
    w: (a.w < min ? min : (a.w > max ? max : a.w) )
  };
};

Vec4.step = function(edge, b) {
  return {
    x: (b.x < edge.x ? 0.0 : 1.0),
    y: (b.y < edge.y ? 0.0 : 1.0),
    z: (b.z < edge.z ? 0.0 : 1.0),
    w: (b.w < edge.w ? 0.0 : 1.0)
  };
};

Vec4.scale = function(a, b) {
  return {
    x: a.x * b,
    y: a.y * b,
    z: a.z * b,
    w: a.w * b
  };
};

Vec4.scaleAndAdd = function(a, b, scale) {
  return {
    x: a.x + (b.x * scale),
    y: a.y + (b.y * scale),
    z: a.z + (b.z * scale),
    w: a.w + (b.w * scale)
  };
};

Vec4.dist =
  Vec4.distance = function(a, b) {
    var x = b.x - a.x,
      y = b.y - a.y,
      z = b.z - a.z,
      w = b.w - a.w;
    return Math.sqrt(x * x + y * y + z * z + w * w);
  };

Vec4.sqrDist =
  Vec4.squaredDistance = function(a, b) {
    var x = b.x - a.x,
      y = b.y - a.y,
      z = b.z - a.z,
      w = b.w - a.w;
    return x * x + y * y + z * z + w * w;
  };

Vec4.len =
  Vec4.length = function(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w);
  };

Vec4.sqrLen =
  Vec4.squaredLength = function(a) {
    return a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;
  };

Vec4.neg =
  Vec4.negate = function(a) {
    return {
      x: -a.x,
      y: -a.y,
      z: -a.z,
      w: -a.w
    };
  };

Vec4.inv =
  Vec4.inverse = function(a) {
    return {
      x: 1.0 / a.x,
      y: 1.0 / a.y,
      z: 1.0 / a.z,
      w: 1.0 / a.w
    };
  };

Vec4.norm =
  Vec4.normalize = function(a) {
    var len = a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w;

    if (len > 0) {
      len = Math.sqrt(len);
      return {
        x: a.x / len,
        y: a.y / len,
        z: a.z / len,
        w: a.w / len
      };
    }
    return a;
  };

Vec4.dot = function(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
};

Vec4.lerp = function(a, b, t) {
  return {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
    z: a.z + t * (b.z - a.z),
    w: a.w + t * (b.w - a.w)
  };
};

/**
 * TODO: Find alternative for this damn method
 */
Vec4.random = function(scale) {
  scale = scale || 1.0;
  var t = Vec4.fromValues(Math.random(), Math.random(), Math.random(), Math.random());
  return Vec4.scale(Vec4.normalize(t), scale);
};

//TODO: Vec4.transformMat4
//TODO: Vec4.transformQuat
//TODO: Vec4.forEach

Vec4.str = function(a) {
  return 'vec4(' + a.x + ', ' + a.y + ', ' + a.z + ', ' + a.w + ')';
};