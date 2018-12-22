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

//const logging = require('plylog');
const mergeStream = require('merge-stream');

// Global object to store localizable attributes repository
var attributesRepository = {};

// Bundles object
var prevBundles = {};
var bundles = {};

// Preprocessed templates
var preprocessedTemplates = {};

var title = 'I18N transform';
var srcDir = 'src3';
var tmpDir = 'tmp';
var destDir = 'preprocess3';

var xliffOptions = {};

gulp.task('clean', function() {
  return del([
    tmpDir,
    destDir
  ], { force: true });
});

var indexHTML = gulpif([ '**/index.html' ], gulp.dest(destDir));

function btoa(str) {
  let buf = Buffer.from(str);
  return buf.toString('base64');
}

function atob(base64) {
  let buf = Buffer.from(base64, 'base64');
  return buf.toString();
}

var unmodulize = gulpif(['**/*.js'], through.obj(function (file, enc, callback) {
  let htmlTemplate = `<!-- temporary HTML --><encoded-original><link rel="import" href="../../../i18n-element.html"><innerHTML><dom-module>`;
  let code = stripBom(String(file.contents));
  let template = code.match(/html`([^`]*)`/);
  let innerHTML = code.match(/[.]innerHTML = `([^`]*)`/);
  let name = file.path.split('/').pop().replace(/[.]js$/,'');
  let original = '';
  if (template || innerHTML) {
    let html = htmlTemplate;
    if (template) {
      original = btoa(template[1]);
      if (atob(original) !== template[1]) {
        console.error('atob(btoa(template[1])) !== template[1]');
      }
      html = html.replace('<dom-module>', 
        `<dom-module id="${name}"><template>${template[1]}</template></dom-module>\n`);
    }
    else {
      html = html.replace('<dom-module>', '');
    }
    if (innerHTML) {
      /*
      original = btoa(innerHTML[1]);
      if (atob(original) !== innerHTML[1]) {
        console.error('atob(btoa(innerHTML[1])) !== innerHTML[1]');
      }
      */
      html = html.replace('<innerHTML>', innerHTML[1]);
    }
    else {
      html = html.replace('<innerHTML>', '');
    }
    //console.log('original', original);
    html = html.replace('<encoded-original>', `<encoded-original>${original}</encoded-original>`);
    let htmlFile = new gutil.File({
      cwd: file.cwd,
      base: file.base,
      path: file.path.substring(0, file.path.length - 3) + '.html',
      contents: new Buffer(html)
    });
    console.log('unmodulize: htmlFile.path = ', htmlFile.path, ' name = ', name /*, 'html = ', html */);
    this.push(htmlFile);
  }
  callback(null, file);
}));

// Scan HTMLs and construct localizable attributes repository
var scan = gulpif('*.html', i18nPreprocess({
  constructAttributesRepository: true, // construct attributes repository
  attributesRepository: attributesRepository, // output object
  srcPath: srcDir, // path to source root
  targetVersion: 2, // target Polymer version
  attributesRepositoryPath: 
    path.join(tmpDir, 'i18n-attr-repo.html'), // path to i18n-attr-repo.html
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

/* TODO: Feedback preprocessed HTMLs into templates in JavaScript components */
var preprocess = gulpif('**/*.html', i18nPreprocess({
  replacingText: true, // replace UI texts with {{annotations}}
  jsonSpace: 2, // JSON format with 2 spaces
  srcPath: srcDir, // path to source root
  targetVersion: 2, // target Polymer version
  force: true,
  attributesRepository: attributesRepository // input attributes repository
}));

var tmpHTML = gulpif([ '**/*.html' ], gulp.dest(tmpDir));

var dropDummyHTML = gulpif('**/*.html', through.obj(function (file, enc, callback) {
  let temporaryHTML = '<!-- temporary HTML -->';
  let code = stripBom(String(file.contents));
  if (code.indexOf(temporaryHTML) >= 0 || file.path.match(/\/index[.]html$/)) {
    let match1 = code.match(/<encoded-original>(.*)<[/]encoded-original>/);
    let match2 = code.match(/<dom-module id="(.*)"><template localizable-text="embedded">([^`]*)<[/]template><[/]dom-module>/);
    if (match1 && match2) {
      let name = match2[1];
      let original = atob(match1[1]);
      let preprocessed = match2[2];
      console.log('setting preprocessedTemplates name = ' + name);
      preprocessedTemplates[name] = {
        original: original,
        preprocessed: preprocessed,
      };
    }
    console.log('dropDummyHTML dropping ', file.path);
    callback(null, null);
  }
  else {
    callback(null, file);
  }
}));

var preprocessJs = gulpif(['**/*.js'], through.obj(function (file, enc, callback) {
  let code = stripBom(String(file.contents));
  let name = file.path.split('/').pop().replace(/[.]js$/,'');
  if (preprocessedTemplates[name]) {
    if (code.indexOf('html`' + preprocessedTemplates[name].original + '`') < 0) {
      console.error('preprocessJs name = ' + name + ' template not found');
    }
    preprocessedTemplates[name].preprocessed = preprocessedTemplates[name].preprocessed.replace(/\\n/g, '\\\\n').replace(/\\"/g, '\\\\"');
    while (code.indexOf('html`' + preprocessedTemplates[name].original + '`') >= 0) {
      code = code.replace(
        'html`' + preprocessedTemplates[name].original + '`',
        '((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`' + preprocessedTemplates[name].preprocessed + '`)');
    }
    file.contents = Buffer.from(code);
    console.log('preprocessJs name = ' + name);
  }
  callback(null, file);
}));

var tmpJSON = gulpif([ '**/*.json', '!**/locales/*' ], gulp.dest(tmpDir));

var unbundleFiles = [];
var importXliff = through.obj(function (file, enc, callback) {
  // bundle files must come earlier
  unbundleFiles.push(file);
  callback();
}, function (callback) {
  console.log('attributesRepository', attributesRepository);
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
  srcPath: srcDir, // path to source root
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
      path: lang ? path.join(cwd, srcDir, 'locales', 'bundle.' + lang + '.json')
                 : path.join(cwd, srcDir, 'bundle.json'),
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
              path: path.join(cwd, srcDir, 'xliff', 'bundle.' + destLanguage + '.xlf'),
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

var feedback = gulpif([ '**/bundle.json', '**/locales/*.json', '**/*.json', '**/xliff/bundle.*.xlf' ], gulp.dest(srcDir));

var dropXliff = gulpignore([ '**/xliff', '**/xliff/**' ]);

var dropBundles = gulpignore([ '**/locales/bundle.*.json', '**/bundle.json' ]);

var dropNullTemplateDefaultLangElementJSON = gulpignore([ '**/locales/null-template-default-lang-element.ja.json' ]);

var config = {
  // list of target locales to add
  locales: gutil.env.targets ? gutil.env.targets.split(/ /) : []
}

// Gulp task to add locales to I18N-ready elements and pages
// Usage: gulp locales --targets="{space separated list of target locales}"
gulp.task('locales', function() {
  var elements = gulp.src([ path.join(srcDir, '*.html') ], { base: srcDir });
    //.pipe(grepContents(/(i18n-behavior.html|i18n-element.html)/));
    //.pipe(grepContents(/<dom-module /));

  var pages = gulp.src([ path.join(srcDir, 'index.html') ], { base: srcDir })
    .pipe(grepContents(/<i18n-dom-bind /));

  return merge(elements, pages)
    .pipe(i18nAddLocales(config.locales))
    .pipe(gulp.dest('tmp'))
    .pipe(debug({ title: 'Add locales:'}))
});

gulp.task('i18n', () => {
  return gulp.src([ path.join(srcDir, '**/*') ], { base: srcDir })
    //.pipe(indexHTML)
    .pipe(basenameSort)
    .pipe(unmodulize)
    .pipe(basenameSort)
    .pipe(scan)
    .pipe(dropDefaultJSON)
    .pipe(preprocess)
    .pipe(tmpHTML)
    .pipe(dropDummyHTML)
    .pipe(basenameSort)
    .pipe(preprocessJs)
    .pipe(tmpJSON)
    .pipe(importXliff)
    .pipe(leverage)
    .pipe(exportXliff)
    //.pipe(feedback)
    .pipe(debug({ title: title }))
    .pipe(size({ title: title }))
    .pipe(dropXliff)
    .pipe(dropBundles)
    .pipe(dropNullTemplateDefaultLangElementJSON)
    .pipe(gulp.dest(destDir));
});

gulp.task('i18n-attr-repo.html', function () {
  return gulp.src([ '../i18n-attr-repo.js' ])
    .pipe(through.obj(function (file, enc, callback) {
      let htmlTemplate = `<!-- temporary HTML --><link rel="import" href="../../../i18n-element.html"><innerHTML><dom-module>`;
      let code = stripBom(String(file.contents));
      let template = code.match(/html`([^`]*)`/);
      let innerHTML = code.match(/[.]innerHTML = `([^`]*)`/);
      let name = file.path.split('/').pop().replace(/[.]js$/,'');
      if (template || innerHTML) {
        let html = htmlTemplate;
        if (template) {
          html = html.replace('<dom-module>', 
            `<dom-module id="${name}"><template>${template[1]}</template></dom-module>\n`);
        }
        else {
          html = html.replace('<dom-module>', '');
        }
        if (innerHTML) {
          html = html.replace('<innerHTML>', innerHTML[1]);
        }
        else {
          html = html.replace('<innerHTML>', '');
        }
        let htmlFile = new gutil.File({
          cwd: file.cwd,
          base: file.base,
          path: file.path.substring(0, file.path.length - 3) + '.html',
          contents: new Buffer(html)
        });
        console.log('i18n-attr-repo.html: htmlFile.path = ', htmlFile.path, ' name = ', name /*, 'html = ', html */);
        this.push(htmlFile);
      }
      callback(null, file);
    }))
    .pipe(gulp.dest(tmpDir));
});

gulp.task('default', (cb) => {
  runSequence('clean', 'i18n-attr-repo.html', 'i18n', cb);
});
