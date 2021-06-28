// include plug-ins
var gulp = require('gulp'); 
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
 
// JS concat, strip debugging and minify
gulp.task('scripts', function() {
  gulp.src(['libs/*.js', 'camera.js', 'WebGL.js', 'global.js', 'Noise.js', 'Plane.js', 'AABox.js', 'Frustum.js', 'TerrainPatch.js', 'QuadTree.js', 'Main.js'])
    .pipe(concat('engine-min.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./'));
});