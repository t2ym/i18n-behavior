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
const gutil = require('gulp-util');
const gulpignore = require('gulp-ignore');
const gulpmatch = require('gulp-match');
const sort = require('gulp-sort');
const grepContents = require('gulp-grep-contents');
const size = require('gulp-size');
const merge = require('gulp-merge');
const through = require('through2');
const path = require('path');
const stripBom = require('strip-bom');
const JSONstringify = require('json-stringify-safe');
const i18nPreprocess = require('gulp-i18n-preprocess');
const i18nLeverage = require('gulp-i18n-leverage');
const XliffConv = require('xliff-conv');
const i18nAddLocales = require('gulp-i18n-add-locales');

const logging = require('plylog');
const mergeStream = require('merge-stream');

gulp.task('clean', function() {
  return del([
    '../bower_components/i18n-element',
    './webcomponentsjs',
    './.tmp',
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

// Global object to store localizable attributes repository
var attributesRepository = {};

// Bundles object
var prevBundles = {};
var bundles = {};

var title = 'I18N transform';
var tmpDir = '../bower_components/i18n-element/demo/poc';

var xliffOptions = {};

// Scan HTMLs and construct localizable attributes repository
var scan = gulpif('*.html', i18nPreprocess({
  constructAttributesRepository: true, // construct attributes repository
  attributesRepository: attributesRepository, // output object
  srcPath: 'poc', // path to source root
  targetVersion: 2, // target Polymer version
  attributesRepositoryPath: 
    '../i18n-attr-repo.html', // path to i18n-attr-repo.html
  dropHtml: false // do not drop HTMLs
}));

var basenameSort = sort({
  comparator: function(file1, file2) {
    var base1 = path.basename(file1.path).replace(/^bundle[.]/, ' bundle.');
    var base2 = path.basename(file2.path).replace(/^bundle[.]/, ' bundle.');
    return base1.localeCompare(base2);
  }
});

var dropDefaultJSON = gulpignore([ '**/*.json', '!**/locales/*.json' ]);

var preprocess = gulpif('**/*.html', i18nPreprocess({
  replacingText: true, // replace UI texts with {{annotations}}
  jsonSpace: 2, // JSON format with 2 spaces
  srcPath: 'poc', // path to source root
  targetVersion: 2, // target Polymer version
  force: true,
  attributesRepository: attributesRepository // input attributes repository
}));

var tmpJSON = gulpif([ '**/*.json', '!**/locales/*' ], gulp.dest(tmpDir));

var unbundleFiles = [];
var importXliff = through.obj(function (file, enc, callback) {
  // bundle files must come earlier
  unbundleFiles.push(file);
  callback();
}, function (callback) {
  var match;
  var file;
  var bundleFileMap = {};
  var xliffConv = new XliffConv(xliffOptions);
  while (unbundleFiles.length > 0) {
    file = unbundleFiles.shift();
    if (path.basename(file.path).match(/^bundle[.]json$/)) {
      prevBundles[''] = JSON.parse(stripBom(String(file.contents)));
      bundleFileMap[''] = file;
    }
    else if (match = path.basename(file.path).match(/^bundle[.]([^.\/]*)[.]json$/)) {
      prevBundles[match[1]] = JSON.parse(stripBom(String(file.contents)));
      bundleFileMap[match[1]] = file;
    }
    else if (match = path.basename(file.path).match(/^bundle[.]([^.\/]*)[.]xlf$/)) {
      xliffConv.parseXliff(String(file.contents), { bundle: prevBundles[match[1]] }, function (output) {
        if (bundleFileMap[match[1]]) {
          bundleFileMap[match[1]].contents = new Buffer(JSONstringify(output, null, 2));
        }
      });
    }
    else if (gulpmatch(file, '**/locales/*.json') &&
             (match = path.basename(file.path, '.json').match(/^([^.]*)[.]([^.]*)/))) {
      if (prevBundles[match[2]] && prevBundles[match[2]][match[1]]) {
        file.contents = new Buffer(JSONstringify(prevBundles[match[2]][match[1]], null, 2));
      }
    }
    this.push(file);
  }
  callback();
});

var leverage = gulpif([ '**/locales/*.json', '!**/locales/bundle.*.json' ], i18nLeverage({
  jsonSpace: 2, // JSON format with 2 spaces
  srcPath: 'poc', // path to source root
  distPath: tmpDir, // path to dist root to fetch next default JSON files
  bundles: bundles // output bundles object
}));

var bundleFiles = [];
var exportXliff = through.obj(function (file, enc, callback) {
  bundleFiles.push(file);
  callback();
}, function (callback) {
  var file;
  var cwd = bundleFiles[0].cwd;
  var base = bundleFiles[0].base;
  var xliffConv = new XliffConv(xliffOptions);
  var srcLanguage = 'en';
  var promises = [];
  var self = this;
  var lang;
  while (bundleFiles.length > 0) {
    file = bundleFiles.shift();
    if (!gulpmatch(file, [ '**/bundle.json', '**/locales/bundle.*.json', '**/xliff/bundle.*.xlf' ])) {
      this.push(file);
    }
  }
  for (lang in bundles) {
    bundles[lang].bundle = true;
    this.push(new gutil.File({
      cwd: cwd,
      base: base,
      path: lang ? path.join(cwd, 'poc', 'locales', 'bundle.' + lang + '.json')
                 : path.join(cwd, 'poc', 'bundle.json'),
      contents: new Buffer(JSONstringify(bundles[lang], null, 2))
    }));
  }
  for (lang in bundles) {
    if (lang) {
      (function (destLanguage) {
        promises.push(new Promise(function (resolve, reject) {
          xliffConv.parseJSON(bundles, {
            srcLanguage: srcLanguage,
            destLanguage: destLanguage
          }, function (output) {
            self.push(new gutil.File({
              cwd: cwd,
              base: base,
              path: path.join(cwd, 'poc', 'xliff', 'bundle.' + destLanguage + '.xlf'),
              contents: new Buffer(output)
            }));
            resolve();
          });
        }));
      })(lang);
    }
  }
  Promise.all(promises).then(function (outputs) {
    callback();
  });
});

var feedback = gulpif([ '**/bundle.json', '**/locales/*.json', '**/*.json', '**/xliff/bundle.*.xlf' ], gulp.dest('poc'));

var config = {
  // list of target locales to add
  locales: gutil.env.targets ? gutil.env.targets.split(/ /) : []
}

// Gulp task to add locales to I18N-ready elements and pages
// Usage: gulp locales --targets="{space separated list of target locales}"
gulp.task('locales', function() {
  var elements = gulp.src([ 'poc/elements/**/*.html' ], { base: 'poc' });
    //.pipe(grepContents(/(i18n-behavior.html|i18n-element.html)/));
    //.pipe(grepContents(/<dom-module /));

  var pages = gulp.src([ 'poc/index.html' ], { base: 'poc' })
    .pipe(grepContents(/<i18n-dom-bind /));

  return merge(elements, pages)
    .pipe(i18nAddLocales(config.locales))
    .pipe(gulp.dest('poc'))
    .pipe(debug({ title: 'Add locales:'}))
});

gulp.task('i18n', () => {
  return gulp.src([ 'poc/**/* ' ], { base: 'poc' })
    .pipe(scan)
    .pipe(basenameSort)
    .pipe(dropDefaultJSON)
    .pipe(preprocess)
    .pipe(tmpJSON)
    .pipe(importXliff)
    .pipe(leverage)
    .pipe(exportXliff)
    .pipe(feedback)
    .pipe(debug({ title: title }))
    .pipe(size({ title: title }))
    .pipe(gulp.dest('../bower_components/i18n-element/demo/poc'));
});

gulp.task('vulcanize', () => {
  return gulp.src([ '../bower_components/i18n-element/demo/poc/**/* ' ], { base: '../bower_components/i18n-element/demo/poc' })
    .pipe(gulpif('index.html', replace(/"[.][.]\/[.][.]\/[.][.]\/webcomponentsjs\/webcomponents-lite[.]js"/, '"../webcomponentsjs/webcomponents-lite.min.js"', 'g')))
    .pipe(gulpif('imports.html', vulcanize({
      abspath: '',
      excludes: [],
      stripExcludes: false,
      inlineScripts: true,
      stripComments: true
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
      'pocbabelvulcanized/locales/bundle.*.json',
      'pocbabelvulcanized/sourcemaps/*',
      '!pocbabelvulcanized/sourcemaps/*.json.map' ],
      { base: 'pocbabelvulcanized' })
    .pipe(gulpif('imports.html', vulcanize({
      abspath: '',
      excludes: [],
      stripExcludes: false,
      inlineScripts: true
    })))
    .pipe(gulpignore([ 'imports.js' ]))
    .pipe(debug())
    .pipe(gulp.dest('pocmin'));
});

gulp.task('default', (cb) => {
  runSequence('clean', 'patchshadycss', 'polyfillclone', 'webcomponents-min', 'libclone', 'i18n', 'vulcanize', 'babel', 'rejoin', cb);
});
