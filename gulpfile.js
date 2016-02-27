/*
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
const gulp = require('gulp');
const gulpif = require('gulp-if');
const size = require('gulp-size');
const debug = require('gulp-debug');
const fs = require('fs');
const path = require('path');
const del = require('del');
const merge = require('merge-stream');
const runSequence = require('run-sequence');
const JSONstringify = require('json-stringify-safe');
//const babel = require('gulp-babel');
const crisper = require('gulp-crisper');
const minifyHtml = require('gulp-minify-html');
const uglify = require('gulp-uglify');
const vulcanize = require('gulp-vulcanize');
const i18nPreprocess = require('gulp-i18n-preprocess');
const i18nLeverage = require('gulp-i18n-leverage');

// Global object to store localizable attributes repository
var attributesRepository = {};

// Store Bundles for i18n-behavior
var bundles = {};

gulp.task('clean', function() {
  return del(['test/preprocess', 'test/vulcanize', 'test/minify']);
});

// Scan HTMLs and construct localizable attributes repository
gulp.task('scan', function () {
  return gulp.src([ 'test/src/**/*.html', '!test/src/**/*-test.html' ]) // input custom element HTMLs
    .pipe(i18nPreprocess({
      constructAttributesRepository: true, // construct attributes repository
      attributesRepository: attributesRepository, // output object
      srcPath: 'test/src', // path to source root
      attributesRepositoryPath: 'i18n-attr-repo.html', // path to i18n-attr-repo.html
      dropHtml: true // drop HTMLs
    }))
    .pipe(gulp.dest('test/preprocess')); // no outputs; dummy output path
});

// Preprocess templates and externalize JSON
gulp.task('preprocess', function () {
  console.log('attributesRepository = ' + JSON.stringify(attributesRepository, null, 2));
  var elements = gulp.src([ 'test/src/**/*.html', '!test/src/**/*-test.html' ]) // input custom element HTMLs
    .pipe(i18nPreprocess({
      replacingText: true, // replace UI texts with {{annotations}}
      jsonSpace: 2, // JSON format with 2 spaces
      srcPath: 'test/src', // path to source root
      attributesRepository: attributesRepository // input attributes repository
    }))
    .pipe(gulp.dest('test/preprocess')); // output preprocessed HTMLs and default JSON files to dist

  var html = gulp.src([ 'test/src/**/*-test.html' ]) // non-custom-element HTMLs
    .pipe(i18nPreprocess({
      replacingText: true, // replace UI texts with {{annotations}}
      jsonSpace: 2, // JSON format with 2 spaces
      srcPath: 'test/src', // path to source root
      force: true, // force processing even without direct i18n-behavior.html import
      attributesRepository: attributesRepository // input attributes repository
     }))
    .pipe(gulp.dest('test/preprocess'));

  return merge(elements, html)
    .pipe(size({title: 'preprocess'}));
});

// Merge code changes into JSON
gulp.task('leverage', function () {
  return gulp.src([ 'test/src/**/locales/*.json' ]) // input localized JSON files in source
    .pipe(i18nLeverage({
      jsonSpace: 2, // JSON format with 2 spaces
      srcPath: 'test/src', // path to source root
      distPath: 'test/preprocess', // path to dist root to fetch next default JSON files
      bundles: bundles // output bundles object
    }))
    .pipe(debug())
    .pipe(gulp.dest('test/preprocess')); // path to output next localized JSON files
});

// Save attributes respository in test/preprocess just for testing
gulp.task('attributes-repository', function (callback) {
  var DEST_DIR = 'test' + path.sep + 'preprocess';

  fs.writeFileSync(DEST_DIR + path.sep + 'attributes-repository.json', 
                    JSONstringify(attributesRepository, null, 2));
  callback();
});

gulp.task('clone', function () {
  return gulp.src([ '*.html', 'test/preprocess/**/*' ], { base: '.' })
    .pipe(debug())
    .pipe(gulp.dest('bower_components/i18n-behavior'));
});

gulp.task('vulcanize', function() {
  return gulp.src(['bower_components/i18n-behavior/test/preprocess/basic-test.html'])
    .pipe(vulcanize({
      excludes: [
        'bower_components/webcomponentsjs/webcomponents.js',
        'bower_components/web-component-tester/browser.js'
      ],
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest('test/vulcanize'))
    .pipe(size({title: 'vulcanize'}));
});

gulp.task('clean-clone', function() {
  return del(['bower_components/i18n-behavior']);
});

gulp.task('bundles', function (callback) {
  var DEST_DIR = 'test' + path.sep + 'vulcanize';
  var localesPath = DEST_DIR + path.sep + 'locales';

  try {
    fs.mkdirSync(localesPath);
  }
  catch (e) {}
  for (var lang in bundles) {
    bundles[lang].bundle = true;
    if (lang) {
      fs.writeFileSync(localesPath + path.sep + 'bundle.' + lang + '.json', 
                        JSONstringify(bundles[lang], null, 2));
    }
    else {
      // This is not required for deployment
      fs.writeFileSync(DEST_DIR + path.sep + 'bundle.json', 
                        JSONstringify(bundles[lang], null, 2));
    }
  }
  callback();
});

gulp.task('minify', function() {
  return gulp.src(['test/vulcanize/**/*', '!test/vulcanize/bundle.json'])
    .pipe(gulpif('*.html', crisper({
      scriptInHead: false
    })))
    .pipe(gulpif('*.html', minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    .pipe(gulpif('*.js', uglify({
      preserveComments: 'some'
    })))
    .pipe(gulp.dest('test/minify'))
    .pipe(size({title: 'minify'}));
});

gulp.task('mini-bundles', function (callback) {
  var DEST_DIR = 'test' + path.sep + 'minify';
  var localesPath = DEST_DIR + path.sep + 'locales';

  try {
    fs.mkdirSync(localesPath);
  }
  catch (e) {}
  for (var lang in bundles) {
    bundles[lang].bundle = true;
    if (lang) {
      fs.writeFileSync(localesPath + path.sep + 'bundle.' + lang + '.json', 
                        JSONstringify(bundles[lang], null, 0));
    }
  }
  callback();
});
 
gulp.task('pretest', ['clean'], function(cb) {
  runSequence(
    'scan',
    'preprocess',
    'leverage',
    'attributes-repository',
    'clone',
    'vulcanize',
    'clean-clone',
    'bundles',
    'minify',
    'mini-bundles',
    /*
    'feedback',
    */
    cb);
});

require('web-component-tester').gulp.init(gulp, [ 'pretest' ]);

