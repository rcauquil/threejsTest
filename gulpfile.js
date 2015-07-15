var gulp = require('gulp');
var gutil = require('gulp-util');
var ignore = require('gulp-ignore');
var del = require('del');

var connect = require('gulp-connect');

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
    'src/js/*.js'
  ],
  styles: [
    'src/style/**/*.less'
  ],
  html: ['src/**/*.html'],
  fonts: ['src/assets/fonts/*'],
  images: ['src/assets/images/**/*'],
  libs: [
    'bower_components/threejs/build/three.js',
    'bower_components/threejs/examples/js/libs/dat.gui.min.js',
    'bower_components/threejs/examples/js/effects/StereoEffect.js',
    'bower_components/threejs/examples/js/controls/OrbitControls.js'
  ]
};


// SERVER
// -------------------------------------

gulp.task('server', function () {
  connect.server({
    root: ['dist', 'path'],
    port: 9000,
    livereload: true
  });
});


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
    .pipe(gulp.dest('dist/'))
    .pipe(connect.reload());
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
    .pipe(gulp.dest('dist/css/'))
    .pipe(connect.reload());
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
    .pipe(gulp.dest('dist/js/'))
    .pipe(connect.reload());
});

gulp.task('libs', function() {
  return gulp.src(paths.libs)
    .pipe(uglify({mangle: false}))
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest('dist/js/'));
});


// FONTS
// -------------------------------------
gulp.task('fonts', function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('./dist/fonts/'));
});


// IMAGES
// -------------------------------------
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('./dist/img/'))
    .pipe(connect.reload());
});


// WATCH
// -------------------------------------
gulp.task('watch', function () {
  gulp.watch([paths.scripts], ['scripts']);
  gulp.watch([paths.styles], ['styles']);
  gulp.watch([paths.html], ['html']);
  gulp.watch([paths.images], ['images']);
});


// CLEAN
// -------------------------------------
gulp.task('clean', function () {
  del(['dist/']);
});


// TASKS
// -------------------------------------
gulp.task('default', [
  'lint',
  'jscs',
  'watch',
  'server'
]);

gulp.task('build', [
  'lint',
  'jscs',
  'html',
  'styles',
  'scripts',
  'libs',
  'fonts',
  'images'
]);