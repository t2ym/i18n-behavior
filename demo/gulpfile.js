'use strict';

const gulp = require('gulp');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const crisper = require('gulp-crisper');
const sourcemaps = require('gulp-sourcemaps');
const vulcanize = require('gulp-vulcanize');
const debug = require('gulp-debug');
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const runSequence = require('run-sequence');
const del = require('del');

gulp.task('clean', function() {
  return del([
    '../bower_components/i18n-element',
    './webcomponentsjs',
    'vulcanized',
    'pocbabelvulcanized',
    'pocmin'
  ], { force: true });
});

gulp.task('patchshadycss', () => {
  return gulp.src([ '../bower_components/shadycss/shadycss.min.js' ])
    .pipe(replace(/\n}\)[.]call\(this\)\n/, '\n}).call(this);\n', 'g'))
    .pipe(debug())
    .pipe(gulp.dest('../bower_components/shadycss/'));
});

gulp.task('polyfillclone', () => {
  return gulp.src([ 'webcomponents-lite.min.html' ])
    .pipe(debug())
    .pipe(gulp.dest('../bower_components/webcomponentsjs/'));
});

gulp.task('webcomponents-min', () => {
  return gulp.src([ '../bower_components/webcomponentsjs/webcomponents-lite.min.html' ], { base: '../bower_components/webcomponentsjs/' })
    .pipe(vulcanize({
      abspath: '',
      excludes: [],
      stripExcludes: false,
      inlineScripts: true
    }))
    .pipe(crisper({
      scriptInHead: false
    }))
    .pipe(gulpif('*.js', uglify()))
    .pipe(debug())
    .pipe(gulp.dest('./webcomponentsjs/'));
});

gulp.task('libclone', () => {
  return gulp.src([ '../*.html', '../*.js' ])
    .pipe(debug())
    .pipe(gulp.dest('../bower_components/i18n-element/'));
});

gulp.task('clone', () => {
  return gulp.src([ 'poc/**/*' ])
    .pipe(debug())
    .pipe(gulp.dest('../bower_components/i18n-element/demo/poc'));
});

gulp.task('vulcanize', () => {
  return gulp.src([ '../bower_components/i18n-element/demo/poc/**/* ' ], { base: '../bower_components/i18n-element/demo/poc' })
    .pipe(gulpif('index.html', replace(/"[.][.]\/[.][.]\/[.][.]\/webcomponentsjs\/webcomponents-lite[.]js"/, '"../webcomponentsjs/webcomponents-lite.min.js"', 'g')))
    .pipe(gulpif('imports.html', vulcanize({
      abspath: '',
      excludes: [],
      stripExcludes: false,
      inlineScripts: true
    })))
    .pipe(debug())
    .pipe(gulp.dest('vulcanized'));
});

gulp.task('babel', () => {
  return gulp.src([ 'vulcanized/**/*' ])
    .pipe(gulpif('imports.html', crisper({
      scriptInHead: false
    })))
    .pipe(sourcemaps.init())
    .pipe(gulpif('imports.js', babel({ 
      "presets": [ /*'es2015'*/ ],
      "plugins": [
        'check-es2015-constants',
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoped-functions',
        'transform-es2015-block-scoping',
        'transform-es2015-classes',
        'transform-es2015-computed-properties',
        'transform-es2015-destructuring',
        'transform-es2015-duplicate-keys',
        'transform-es2015-for-of',
        'transform-es2015-function-name',
        'transform-es2015-literals',
        //'transform-es2015-modules-commonjs',
        'transform-es2015-object-super',
        'transform-es2015-parameters',
        'transform-es2015-shorthand-properties',
        'transform-es2015-spread',
        'transform-es2015-sticky-regex',
        'transform-es2015-template-literals',
        'transform-es2015-typeof-symbol',
        'transform-es2015-unicode-regex',
        'transform-regenerator'
      ]
    })))
    //.pipe(gulpif('imports.js', uglify()))
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(debug())
    .pipe(gulp.dest('pocbabelvulcanized'));
});

gulp.task('rejoin', () => {
  return gulp.src([
      'pocbabelvulcanized/index.html',
      'pocbabelvulcanized/imports.html',
      'pocbabelvulcanized/imports.js',
      'pocbabelvulcanized/locales/*',
      'pocbabelvulcanized/sourcemaps/*' ], { base: 'pocbabelvulcanized' })
    .pipe(gulpif('imports.html', vulcanize({
      abspath: '',
      excludes: [],
      stripExcludes: false,
      inlineScripts: true
    })))
    .pipe(debug())
    .pipe(gulp.dest('pocmin'));
});

gulp.task('default', (cb) => {
  runSequence('clean', 'patchshadycss', 'polyfillclone', 'webcomponents-min', 'libclone', 'clone', 'vulcanize', 'babel', 'rejoin', cb);
});
