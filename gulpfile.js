var gulp = require('gulp');
var gutil = require('gulp-util');
var ignore = require('gulp-ignore');
var del = require('del');

var minifyHTML = require('gulp-minify-html');

var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');

var postcss = require('gulp-postcss');
var less = require('gulp-less');
var csswring = require('csswring');

var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');



// PATHS
// -------------------------------------

var paths = {
  scripts: [
    'src/app/js/*.js'
  ],
  server: [
    'src/server.js'
  ],
  styles: [
    'src/app/style/**/*.less'
  ],
  html: ['src/app/**/*.html'],
  fonts: ['src/app/assets/fonts/*'],
  images: ['src/app/assets/images/**/*'],
  libs: [
    'node_modules/socket.io-client/socket.io.js',
    'bower_components/threejs/build/three.js',
    'bower_components/threejs/examples/js/libs/dat.gui.min.js',
    'bower_components/threejs/examples/js/effects/StereoEffect.js',
    'bower_components/threejs/examples/js/controls/OrbitControls.js'
  ]
};


// LINT
// -------------------------------------
gulp.task('lint', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});
gulp.task('jscs', function() {
  return gulp.src(paths.scripts)
    .pipe(jscs('.jscsrc'));
});


// HTML
// -------------------------------------
gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(minifyHTML())
    .pipe(gulp.dest('build/app/'));
});


// STYLES
// -------------------------------------
gulp.task('styles', function() {
  var processors = [
    csswring
  ];
  return gulp.src(paths.styles)
    .pipe(sourcemaps.init())
      .pipe(less({
        paths: ['./bower_components/rcauquil-less/']
      }))
      .pipe(concat('style.min.css'))
      .pipe(postcss(processors))
    .pipe(sourcemaps.write('../maps/'))
    .pipe(gulp.dest('build/app/css/'));
});


// SERVER
// -------------------------------------
gulp.task('server', function() {
  return gulp.src(paths.server)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('build/'));
});


// SCRIPTS
// -------------------------------------
gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(sourcemaps.init())
      .pipe(concat('main.min.js'))
      .pipe(uglify({mangle: false}))
    .pipe(sourcemaps.write('../maps/'))
    .pipe(gulp.dest('build/app/js/'));
});

gulp.task('libs', function() {
  return gulp.src(paths.libs)
    .pipe(uglify({mangle: false}))
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest('build/app/js/'));
});


// FONTS
// -------------------------------------
gulp.task('fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('./build/app/fonts/'));
});


// IMAGES
// -------------------------------------
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('./build/app/img/'));
});


// WATCH
// -------------------------------------
gulp.task('watch', function () {
  gulp.watch([paths.scripts], ['scripts']);
  gulp.watch([paths.server], ['server']);
  gulp.watch([paths.styles], ['styles']);
  gulp.watch([paths.html], ['html']);
  gulp.watch([paths.images], ['images']);
});


// CLEAN
// -------------------------------------
gulp.task('clean', function () {
  del(['build/']);
});


// TASKS
// -------------------------------------
gulp.task('default', [
  'lint',
  'jscs',
  'watch'
]);

gulp.task('build', [
  'lint',
  'jscs',
  'html',
  'styles',
  'server',
  'scripts',
  'libs',
  'fonts',
  'images'
]);