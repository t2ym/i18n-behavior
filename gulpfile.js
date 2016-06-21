/*
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
const gulp = require('gulp');
const gulpif = require('gulp-if');
const size = require('gulp-size');
const debug = require('gulp-debug');
const gutil = require('gulp-util');
const sort = require('gulp-sort');
const fs = require('fs');
const path = require('path');
const del = require('del');
const merge = require('merge-stream');
const runSequence = require('run-sequence');
const through = require('through2');
const JSONstringify = require('json-stringify-safe');
//const babel = require('gulp-babel');
const crisper = require('gulp-crisper');
const minifyHtml = require('gulp-minify-html');
const uglify = require('gulp-uglify');
const vulcanize = require('gulp-vulcanize');
const replace = require('gulp-replace');
const i18nPreprocess = require('gulp-i18n-preprocess');
const i18nLeverage = require('gulp-i18n-leverage');

// Global object to store localizable attributes repository
var attributesRepository = {};

// Store Bundles for i18n-behavior
var bundles = {};

gulp.task('clean', function() {
  return del([ 
    'test/src-lite',
    'test/preprocess',
    'test/preprocess-lite',
    'test/preprocess-raw',
    'test/vulcanize',
    'test/vulcanize-lite',
    'test/minify',
    'test/minify-lite'
  ]);
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

gulp.task('src-lite', function () {
  return gulp.src([ 'test/src/**/*' ])
    .pipe(gulpif('*-test.html', 
      replace('../webcomponentsjs/webcomponents.min.js',
              '../webcomponentsjs/webcomponents-lite.min.js')))
    .pipe(gulp.dest('test/src-lite'));
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

  var js = gulp.src([ 'test/src/**/*.js' ])
    .pipe(gulp.dest('test/preprocess'));

  return merge(elements, html, js)
    .pipe(size({title: 'preprocess'}));
});

// Merge code changes into JSON
gulp.task('leverage', function () {
  return gulp.src([ 'test/src/**/locales/*.json' ]) // input localized JSON files in source
    .pipe(i18nLeverage({
      jsonSpace: 2, // JSON format with 2 spaces
      srcPath: 'test/src', // path to source root
      distPath: 'test/preprocess', // path to dist root to fetch next default JSON files
      finalize: false, // leave meta
      bundles: bundles // output bundles object
    }))
    //.pipe(debug())
    .pipe(gulp.dest('test/preprocess')); // path to output next localized JSON files
});

// Save attributes respository in test/preprocess just for testing
gulp.task('attributes-repository', function (callback) {
  var DEST_DIR = 'test' + path.sep + 'preprocess';

  fs.writeFileSync(DEST_DIR + path.sep + 'attributes-repository.json', 
                    JSONstringify(attributesRepository, null, 2));
  callback();
});

gulp.task('preprocess-raw', function () {
  return gulp.src([ 'test/preprocess/**/*' ])
    //.pipe(debug())
    .pipe(gulp.dest('test/preprocess-raw'));
});

gulp.task('preprocess-lite', function () {
  return gulp.src([ 'test/preprocess/**/*' ])
    .pipe(gulpif('*-test.html', 
      replace('../webcomponentsjs/webcomponents.min.js',
              '../webcomponentsjs/webcomponents-lite.min.js')))
    .pipe(gulp.dest('test/preprocess-lite'));
});

gulp.task('clone', function () {
  return gulp.src([ '*.html', '*.js', 'test/preprocess/**/*' ], { base: '.' })
    //.pipe(debug())
    .pipe(gulp.dest('bower_components/i18n-behavior'));
});

gulp.task('vulcanize', function() {
  return gulp.src(['bower_components/i18n-behavior/test/preprocess/*-test.html'])
    .pipe(vulcanize({
      excludes: [
        'bower_components/webcomponentsjs/webcomponents.min.js',
        'bower_components/webcomponentsjs/webcomponents-lite.min.js',
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

gulp.task('clone-lite', function () {
  return gulp.src([ '*.html', '*.js', 'test/preprocess-lite/**/*' ], { base: '.' })
    //.pipe(debug())
    .pipe(gulp.dest('bower_components/i18n-behavior'));
});

gulp.task('vulcanize-lite', function() {
  return gulp.src(['bower_components/i18n-behavior/test/preprocess-lite/*-test.html'])
    .pipe(vulcanize({
      excludes: [
        'bower_components/webcomponentsjs/webcomponents.min.js',
        'bower_components/webcomponentsjs/webcomponents-lite.min.js',
        'bower_components/web-component-tester/browser.js'
      ],
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .pipe(gulp.dest('test/vulcanize-lite'))
    .pipe(size({title: 'vulcanize-lite'}));
});

gulp.task('clean-clone-lite', function() {
  return del(['bower_components/i18n-behavior']);
});

gulp.task('bundles', function (callback) {
  var DEST_DIR = 'test' + path.sep + 'vulcanize';
  var DEST_DIR_LITE = 'test' + path.sep + 'vulcanize-lite';
  var localesPath = DEST_DIR + path.sep + 'locales';
  var localesPathLite = DEST_DIR_LITE + path.sep + 'locales';

  try {
    fs.mkdirSync(localesPath);
    fs.mkdirSync(localesPathLite);
  }
  catch (e) {}
  for (var lang in bundles) {
    bundles[lang].bundle = true;
    if (lang) {
      fs.writeFileSync(localesPath + path.sep + 'bundle.' + lang + '.json', 
                        JSONstringify(bundles[lang], null, 2));
      fs.writeFileSync(localesPathLite + path.sep + 'bundle.' + lang + '.json', 
                        JSONstringify(bundles[lang], null, 2));
    }
    else {
      // This is not required for deployment
      fs.writeFileSync(DEST_DIR + path.sep + 'bundle.json', 
                        JSONstringify(bundles[lang], null, 2));
      fs.writeFileSync(DEST_DIR_LITE + path.sep + 'bundle.json', 
                        JSONstringify(bundles[lang], null, 2));
    }
  }
  callback();
});

gulp.task('bundle-ru', function () {
  return gulp.src(['test/vulcanize/**/locales/bundle.ru.json'])
    .pipe(gulp.dest('test/preprocess'));
});

gulp.task('bundle-ru-lite', function () {
  return gulp.src(['test/vulcanize-lite/**/locales/bundle.ru.json'])
    .pipe(gulp.dest('test/preprocess-lite'));
});

gulp.task('empty-ja', function () {
  return gulp.src(['test/src/**/locales/null-template-default-lang-element.ja.json'])
    .pipe(gulp.dest('test/preprocess'));
});

gulp.task('empty-bundle-ja', function (done) {
  del('test/vulcanize/locales/bundle.ja.json');
  del('test/vulcanize-lite/locales/bundle.ja.json');
  done();
});

gulp.task('empty-mini-bundle-ja', function (done) {
  del('test/minify/locales/bundle.ja.json');
  del('test/minify-lite/locales/bundle.ja.json');
  done();
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

gulp.task('minify-lite', function() {
  return gulp.src(['test/vulcanize-lite/**/*', '!test/vulcanize-lite/bundle.json'])
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
    .pipe(gulp.dest('test/minify-lite'))
    .pipe(size({title: 'minify-lite'}));
});

gulp.task('mini-bundles', function (callback) {
  var DEST_DIR = 'test' + path.sep + 'minify';
  var DEST_DIR_LITE = 'test' + path.sep + 'minify-lite';
  var localesPath = DEST_DIR + path.sep + 'locales';
  var localesPathLite = DEST_DIR_LITE + path.sep + 'locales';

  try {
    fs.mkdirSync(localesPath);
    fs.mkdirSync(localesPathLite);
  }
  catch (e) {}
  for (var lang in bundles) {
    bundles[lang].bundle = true;
    if (lang) {
      fs.writeFileSync(localesPath + path.sep + 'bundle.' + lang + '.json', 
                        JSONstringify(bundles[lang], null, 0));
      fs.writeFileSync(localesPathLite + path.sep + 'bundle.' + lang + '.json', 
                        JSONstringify(bundles[lang], null, 0));
    }
  }
  callback();
});

gulp.task('fake-server', function() {
  var fakeContents = {};
  var fakeServerFiles = [];
  var fakeServerTemplate = '"use strict";\nvar fakeServerContents =\n%%%CONTENTS%%%;\n';

  return gulp.src(['test/**/*.json', '!test/*-wct.conf.json', '!test/coverage*'])
    .pipe(sort())
    .pipe(through.obj(function (file, enc, callback) {
      fakeServerFiles.push(file);
      callback();
    }, function (callback) {
      var base = fakeServerFiles[0].base;
      var cwd = fakeServerFiles[0].cwd;
      var file;
      var match;
      var suite;
      while (fakeServerFiles.length > 0) {
        file = fakeServerFiles.shift();
        match = file.path.substr(file.base.length).match(/^([^\/]*)(\/.*)$/);
        fakeContents[match[1]] = fakeContents[match[1]] || {};
        fakeContents[match[1]][match[2]] = String(file.contents);
      }
      for (suite in fakeContents) {
        this.push(new gutil.File({
          cwd: cwd,
          base: base,
          path: path.join(base, suite, 'fake-server.js'),
          contents: new Buffer(fakeServerTemplate
            .replace(/%%%CONTENTS%%%/g, JSONstringify(fakeContents[suite], null, 2)))
        }));
      }
      callback();
    }))
    .pipe(debug({ title: 'fake-server' }))
    .pipe(gulp.dest('test'))
    .pipe(size({ title: 'fake-server' }));
});

gulp.task('pretest', ['clean'], function(cb) {
  runSequence(
    'scan',
    'src-lite',
    'preprocess',
    'leverage',
    'attributes-repository',
    'preprocess-raw',
    'empty-ja',
    'preprocess-lite',
    'clone',
    'vulcanize',
    'clean-clone',
    'clone-lite',
    'vulcanize-lite',
    'clean-clone-lite',
    'bundles',
    'bundle-ru',
    'bundle-ru-lite',
    'empty-bundle-ja',
    'minify',
    'minify-lite',
    'mini-bundles',
    'empty-mini-bundle-ja',
    'fake-server',
    /*
    'feedback',
    */
    cb);
});

require('web-component-tester').gulp.init(gulp, [ 'pretest' ]);

