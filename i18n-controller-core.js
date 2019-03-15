/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2019, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import 'i18n-format/i18n-format.js';
import { html, defaultLang } from './i18n-preference.js';
import { attributesRepository } from './i18n-attr-repo.js';
import deepcopy from 'deepcopy/dist/deepcopy.js';

export { html, defaultLang, attributesRepository };

const isXhrNativeJsonResponseType = (() => {
  try {
    new XMLHttpRequest().responseType = 'json';
    return true;
  }
  catch (e) {
    return false;
  }
})();

// app global bundle storage
export const bundles = { '': {} }; // with an empty default bundle
// shared fetching instances for bundles
const bundleFetchingInstances = {};

// path for start URL
const startUrl = (function () {
  let path = window.location.pathname;
  if (document.querySelector('meta[name=app-root]') &&
      document.querySelector('meta[name=app-root]').getAttribute('content')) {
    // <meta name="app-root" content="/"> to customize application root
    path = document.querySelector('meta[name=app-root]').getAttribute('content');
  }
  else if (document.querySelector('link[rel=manifest]') &&
           document.querySelector('link[rel=manifest]').getAttribute('href') &&
           document.querySelector('link[rel=manifest]').getAttribute('href').match(/^\//)) {
    // assume manifest is located at the application root folder
    path = document.querySelector('link[rel=manifest]').getAttribute('href');
  }
  return path.replace(/\/[^\/]*$/,'/');
})();

// path for locales from <html locales-path="locales">
const localesPath = html.hasAttribute('locales-path') ? html.getAttribute('locales-path') : 'locales';

// Support ShadowDOM V1
export const paramAttribute = 'slot';

// set up userPreference
let userPreference = document.querySelector('i18n-preference');
if (!userPreference) {
  userPreference = document.createElement('i18n-preference');
  // append to body
  addEventListener('load', function (event) {
    if (!document.querySelector('i18n-preference')) {
      document.querySelector('body').appendChild(userPreference);
    }
  });
  setTimeout(function () {
    if (!document.querySelector('i18n-preference')) {
      document.querySelector('body').appendChild(userPreference);
    }
  }, 0);
}

// debug log when <html debug> attribute exists
export const debuglog = html.hasAttribute('debug') ?
  function (arg) {
    console.log(arg);
  } :
  function () {};

/**
 * Apply `BehaviorsStore.I18nControllerBehavior` to manipulate internal variables for I18N
 *
 * Note: This behavior is not for normal custom elements to apply I18N. UI is not expected.
 *
 * @polymerBehavior I18nControllerBehavior
 * @memberof BehaviorsStore
 */
export const I18nControllerBehavior = {
  properties: {

    /**
     * Flag for detection of `I18nControllerBehavior`
     *
     * `true` if I18nControllerBehavior is applied
     *
     * Note: Module-specific JSON resources are NOT fetched for `I18nControllerBehavior`
     */
    isI18nController: {
      type: Boolean,
      value: true,
      readOnly: true
    },

    /**
     * HTML element object for the current document
     */
    html: {
      type: Object,
      value: html
    },

    /**
     * Master bundles object for storing all the localized and default resources
     */
    masterBundles: {
      type: Object,
      value: bundles
    },

    /**
     * Default lang for the document, i.e., the initial value of `<html lang>` attribute
     */
    defaultLang: {
      type: String,
      value: defaultLang,
      readOnly: true
    },

    /**
     * List of elements which are fetching bundles
     */
    bundleFetchingInstances: {
      type: Object,
      value: bundleFetchingInstances
    },

    /**
     * Root URL path of the application ends with '/' to fetch bundles
     */
    startUrl: {
      type: String,
      value: startUrl,
      readOnly: true
    },

    /**
     * Path for locales
     *
     * Default value is `'locales'`
     */
    localesPath: {
      type: String,
      value: localesPath,
      readOnly: true
    },

    /**
     * <i18n-attr-repo> element to store attributes repository
     */
    attributesRepository: {
      type: Object,
      value: attributesRepository,
      readOnly: true
    },

    /**
     * <i18n-preference> element
     */
    userPreference: {
      type: Object,
      value: userPreference,
      readOnly: true
    }
  }
};
/**
 * I18nControllerCoreMixin: Polymer-independent core parts of `BehaviorsStore.I18nBehavior`
 *
 *     <dom-module id="custom-element">
 *       <template>
 *         <span>Hard-coded UI texts are automatically made localizable</span>
 *       </template>
 *       <﻿﻿script﻿﻿>
 *         Polymer({
 *           is: 'custom-element',
 *           behaviors: [ 
 *             BehaviorsStore.I18nBehavior  // Add this behavior
 *           ]
 *         });
 *       <﻿﻿/script﻿﻿>
 *     </dom-module>
 *
 * `I18nBehavior` automatically extracts UI texts from `template` and 
 * binds them to localizable variables in `this.text` object.
 *
 * According to the `lang` attribute value, `this.text`, and thus the bound UI texts,
 * dynamically mutates by loading localized values from a JSON file in the `locales` directory.
 * By default, `lang` attribute values of all the localizable elements with `I18nBehavior` are
 * automatically updated according to `<html lang>` attribute value.
 *
 * The UI text externalization can be processed at build time as well by `gulp-*` task
 * so that `I18nBehavior` can immediately recognize the extracted texts in JSON and 
 * skip run-time externalization.
 *
 * Run-time externalization is suitable for development and debugging 
 * since the code changes are immediately reflected at reloading without build-time preprocesses.
 * In contrast, build-time externalization is suitable for production builds 
 * since it eliminates run-time externalization overheads.
 * 
 * ### Steps to localize a custom element
 *
 * 1. [JavaScript] Add `BehaviorsStore.I18nBehavior` to `behaviors`
 * 1. [gulp] Add `gulp-*` filter for `custom-element.html` and generate `custom-element.json`
 * 1. [locales] Put `custom-element.lang.json` in `locales` directory
 * 1. [translation] Translate `locales/custom-element.lang.json`
 *
 * - - -
 *
 * ### Directory structure of bundle files
 *
 * Normal bundles (`/element-root/locales/element-name.*.json`) for elements
 * are stored under their root directories.
 *
 * Shared bundles (`/locales/bundle.*.json`) are generated at build time 
 * by merging all the targeted bundles of the localizable elements. 
 *
 * Once the shared bundles are loaded, there should be no need to search for 
 * normal bundles per element unless the element is intentionally excluded 
 * from the shared bundles.
 *
 * ```
 *      /bundle.json 
 *      /locales/bundle.ja.json
 *              /bundle.fr.json
 *              /bundle.zh-Hans.json
 *
 *      /elements/my-list/my-list.json
 *                       /locales/my-list.ja.json
 *                               /my-list.zh-Hans.json
 *
 *               /google-chart-demo/google-chart-demo.json
 *                                 /locales/google-chart-demo.ja.json
 *                                         /google-chart-demo.fr.json
 * ```
 *
 * - - -
 *
 * ### Localizable `<template is="i18n-dom-bind" id="app">` element
 *
 * `<template is="i18n-dom-bind">` template element extends 
 * `<template is="dom-bind">` template element with all the capabilities of 
 * `I18nBehavior`.  
 *
 * The `id` attribute value is used for naming bundle files instead of the element name.
 * 
 * The bundle files are stored at the locales directory under the application root. 
 *
 * ```
 *      /app.json
 *      /locales/app.ja.json
 *              /app.fr.json
 *              /app.zh-Hans.json
 * ```
 */
export const I18nControllerCoreMixin = {
  /* 
     bundles = 
     {
      "": {},
      "en": {
        "my-list": {
          "p_2": "You now have:",
          "model": {
            "list": {
              "items": [
                "item 1", "item 2"
              ]
            }
          }
        },
        "google-chart-demo": {
          "simple-chart-desc": [
            "template {1} string", "param 1"
          ]
          "model": {
            "simple-chart": {
              "options": { "title": "Simple Chart" },
              "rows": []
            }
          }
        }
      },
      "ja": {
        "my-list": {},
        "google-chart-demo": {}
      }
    }

    bundles[lang]
    /bundle.json - fallback
    /locales/bundle.en.json
            /bundle.ja.json
            /bundle.fr.json
            /bundle.zh-Hans.json

    bundles[lang][is]
    /elements/my-list/my-list.json - fallback
                     /locales/my-list.en.json
                             /my-list.ja.json
                             /my-list.zh-Hans.json

             /google-chart-demo/google-chart-demo.json - fallback
                               /locales/google-chart-demo.en.json
                                       /google-chart-demo.ja.json
                                       /google-chart-demo.zh-Hans.json

    app/elements/my-list/my-list.json
                        /locales/my-list.fr.json
                                /my-list.ja.json
                                /my-list.zh-Hans.json

    dist/elements/my-list/my-list.json
                         /locales/my-list.fr.json
                                 /my-list.ja.json
                                 /my-list.zh-Hans.json

  */


  /**
   * The backend logic for `this.text` object.
   *
   * @param {string} lang Locale for the text message bundle.
   * @return {Object} Text message bundle for the locale.
   */
  _getBundle: function (lang) {
    //console.log('_getBundle called for ' + this.is + ' with lang = ' + lang);

    var resolved;
    var id = this.is === 'i18n-dom-bind' || this.constructor.is === 'i18n-dom-bind' ? this.id : this.is;

    if (lang && lang.length > 0) {
      var fallbackLanguageList = this._enumerateFallbackLanguages(lang);
      var tryLang;
      while ((tryLang = fallbackLanguageList.shift())) {
        if (!bundles[tryLang]) {
          // set up an empty bundle for the language if missing
          bundles[tryLang] = {};
        }
        if (bundles[tryLang][id]) {
          // bundle found
          resolved = bundles[tryLang][id];
          break;
        }
      }
    }
    else {
      // lang is not specified
      lang = '';
      resolved = bundles[lang][id];
    }

    // Fallback priorities: last > app default > element default > fallback > {}
    // TODO: need more research on fallback priorities
    if (!resolved) { 
      if (this._fetchStatus && bundles[this._fetchStatus.lastLang] && bundles[this._fetchStatus.lastLang][id]) {
        // old bundle for now (no changes should be shown)
        resolved = bundles[this._fetchStatus.lastLang][id]; 
      }
      else if (defaultLang && defaultLang.length > 0 &&
               bundles[defaultLang] && bundles[defaultLang][id]) {
        // app default language for now
        resolved = bundles[defaultLang][id]; 
      }
      else if (this.templateDefaultLang && this.templateDefaultLang.length > 0 &&
               bundles[this.templateDefaultLang] && bundles[this.templateDefaultLang][id]) {
        // element default language for now
        resolved = bundles[this.templateDefaultLang][id]; 
      }
      /* no more fallback should happen */
      /* istanbul ignore else */
      else if (bundles[''][id]) {
        // fallback language for now (this should be the same as element default)
        resolved = bundles[''][id];
      }
      else {
        // give up providing a bundle (this should not happen)
        resolved = {};
      }
    }

    return resolved;
  },

  /**
   * Enumerate fallback locales for the target locale.
   * 
   * Subset implementation of BCP47 (https://tools.ietf.org/html/bcp47).
   *
   * ### Examples:
   *
   *| Target Locale | Fallback 1 | Fallback 2 | Fallback 3 |
   *|:--------------|:-----------|:-----------|:-----------|
   *| ru            | N/A        | N/A        | N/A        |
   *| en-GB         | en         | N/A        | N/A        |
   *| en-Latn-GB    | en-GB      | en-Latn    | en         |
   *| fr-CA         | fr         | N/A        | N/A        |
   *| zh-Hans-CN    | zh-Hans    | zh         | N/A        |
   *| zh-CN         | zh-Hans    | zh         | N/A        |
   *| zh-TW         | zh-Hant    | zh         | N/A        |
   *
   * #### Note:
   *
   * For zh language, the script Hans or Hant is supplied as its default script when a country/region code is supplied.
   *
   * @param {string} lang Target locale.
   * @return {Array} List of fallback locales including the target locale at the index 0.
   */
  _enumerateFallbackLanguages: function (lang) {
    var result = [];
    var parts;
    var match;
    var isExtLangCode = 0;
    var extLangCode;
    var isScriptCode = 0;
    var scriptCode;
    var isCountryCode = 0;
    var countryCode;
    var n;
    if (!lang || lang.length === 0) {
      result.push('');
    }
    else {
      parts = lang.split(/[-_]/);
      // normalize ISO-639-1 language codes
      if (parts.length > 0 &&
          parts[0].match(/^[A-Za-z]{2,3}$/)) {
        // language codes have to be lowercased
        // e.g. JA -> ja, FR -> fr
        // TODO: normalize 3-letter codes to 2-letter codes
        parts[0] = parts[0].toLowerCase();
      }
      // normalize ISO-639-3 extension language codes
      if (parts.length >= 2 &&
          parts[1].match(/^[A-Za-z]{3}$/) &&
          !parts[1].match(/^[Cc][Hh][SsTt]$/)) { // exclude CHS,CHT
        // extension language codes have to be lowercased
        // e.g. YUE -> yue
        isExtLangCode = 1;
        extLangCode = parts[1] = parts[1].toLowerCase();
      }
      // normalize ISO-15924 script codes
      if (parts.length >= isExtLangCode + 2 &&
          (match = parts[isExtLangCode + 1].match(/^([A-Za-z])([A-Za-z]{3})$/))) {
        // script codes have to be capitalized only at the first character
        // e.g. HANs -> Hans, lAtN -> Latn
        isScriptCode = 1;
        scriptCode = parts[isExtLangCode + 1] = match[1].toUpperCase() + match[2].toLowerCase();
      }
      // normalize ISO-3166-1 country/region codes
      if (parts.length >= isExtLangCode + isScriptCode + 2 &&
          (match = parts[isExtLangCode + isScriptCode + 1].match(/^[A-Za-z0-9]{2,3}$/))) {
        // country/region codes have to be capitalized
        // e.g. cn -> CN, jP -> JP
        isCountryCode = 1;
        countryCode = parts[isExtLangCode + isScriptCode + 1] = match[0].toUpperCase();
      }
      // extensions have to be in lowercases
      // e.g. U-cA-Buddhist -> u-ca-buddhist, X-LiNux -> x-linux
      if (parts.length >= isExtLangCode + isScriptCode + isCountryCode + 2) {
        for (n = isExtLangCode + isScriptCode + isCountryCode + 1; n < parts.length; n++) {
          parts[n] = parts[n].toLowerCase();
        }
      }
      // enumerate fallback languages
      while (parts.length > 0) {
        // normalize delimiters as -
        // e.g. ja_JP -> ja-JP
        result.push(parts.join('-'));
        if (isScriptCode &&
            isCountryCode &&
            parts.length == isExtLangCode + isScriptCode + 2) {
          // script code can be omitted to default
          // e.g. en-Latn-GB -> en-GB, zh-Hans-CN -> zh-CN
          parts.splice(isExtLangCode + isScriptCode, 1);
          result.push(parts.join('-'));
          parts.splice(isExtLangCode + isScriptCode, 0, scriptCode);
        }
        if (isExtLangCode &&
            isCountryCode &&
            parts.length == isExtLangCode + isScriptCode + 2) {
          // ext lang code can be omitted to default
          // e.g. zh-yue-Hans-CN -> zh-Hans-CN
          parts.splice(isExtLangCode, 1);
          result.push(parts.join('-'));
          parts.splice(isExtLangCode, 0, extLangCode);
        }
        if (isExtLangCode &&
            isScriptCode &&
            parts.length == isExtLangCode + isScriptCode + 1) {
          // ext lang code can be omitted to default
          // e.g. zh-yue-Hans -> zh-Hans
          parts.splice(isExtLangCode, 1);
          result.push(parts.join('-'));
          parts.splice(isExtLangCode, 0, extLangCode);
        }
        if (!isScriptCode &&
            !isExtLangCode &&
            isCountryCode &&
            parts.length == 2) {
          // default script code can be added in certain cases with country codes
          // e.g. zh-CN -> zh-Hans-CN, zh-TW -> zh-Hant-TW
          switch (result[result.length - 1]) {
          case 'zh-CN':
          case 'zh-CHS':
            result.push('zh-Hans');
            break;
          case 'zh-TW':
          case 'zh-SG':
          case 'zh-HK':
          case 'zh-CHT':
            result.push('zh-Hant');
            break;
          default:
            break;
          }
        }
        parts.pop();
      }
    }
    return result;
  },

  /**
   * Observer of `this.lang` changes.
   *
   * Update `this.text` object if the text message bundle of the new `lang` is locally available.
   *
   * Trigger fetching of the text message bundle of the new `lang` if the bundle is not locally available.
   *
   * @param {string} lang New value of `lang`.
   * @param {string} oldLang Old value of `lang`.
   */
  _langChanged: function (lang, oldLang) {
    //console.log(this.id + ':_langChanged lang = ' + lang + ' oldLang = ' + oldLang);
    var id = (this.is || this.getAttribute('is')) === 'i18n-dom-bind' ? this.id : this.is;
    lang = lang || ''; // undefined and null are treated as default ''
    oldLang = oldLang || '';
    if (lang !== oldLang &&
        bundles[oldLang] && bundles[oldLang][id]) {
      this._fetchStatus.lastLang = oldLang;
    }
    if (bundles[lang] && bundles[lang][id]) {
      // bundle available for the new language
      if (this._fetchStatus && lang !== this._fetchStatus.ajaxLang) {
        // reset error status
        this._fetchStatus.error = null;
      }
      if (this.__data) {
        this.notifyPath('text', this._getBundle(this.lang));
      }
      this.effectiveLang = lang;
      this.fire('lang-updated', { 
        lang: this.lang, 
        oldLang: oldLang, 
        lastLang: this._fetchStatus.lastLang 
      });
    }
    else {
      // fetch the missing bundle
      this._fetchLanguage(lang);
    }
  },

  /**
   * Trigger fetching of the appropriate text message bundle of the target locale.
   *
   * ### Two Layers of Fallbacks:
   *
   * 1. Missing bundles fall back to those of their fallback locales.
   * 1. Missing texts in the non-default bundles fall back to those in the default bundle. 
   *
   * ### Fallback Examples:
   *
   *| Locale      | Bundle Status                    |
   *|:------------|:---------------------------------|
   *| fr-CA       | existent with sparse texts       |
   *| fr          | existent with full texts         |
   *| ja          | existent with some missing texts |
   *| zh-Hans-CN  | missing                          |
   *| zh-Hans     | existent with some missing texts |
   *| zh          | missing                          |
   *| en          | existent with full texts         |
   *| ''(default) | existent with full texts         |
   *
   *| Target      | Fallback bundle       | Resolved locale |
   *|:------------|:----------------------|:----------------|
   *| en          | en                    | en              |
   *| ja          | ja + ''(default)      | ja              |
   *| fr-CA       | fr-CA + fr            | fr-CA           |
   *| zh-Hans-CN  | zh-Hans + ''(default) | zh-Hans         |
   *
   * @param {string} lang Target locale.
   */
  _fetchLanguage: function (lang) {
    if (this._fetchStatus) {
      this._fetchStatus.fallbackLanguageList = this._enumerateFallbackLanguages(lang);
      this._fetchStatus.fallbackLanguageList.push('');
      this._fetchStatus.targetLang = this._fetchStatus.fallbackLanguageList.shift();
      this._fetchBundle(this._fetchStatus.targetLang);
    }
  },

  /**
   * Fetch the text message bundle of the target locale 
   * cooperatively with other instances.
   *
   * @param {string} lang Target locale.
   */
  _fetchBundle: function (lang) {
    //console.log('_fetchBundle lang = ' + lang);
    var id = this.is === 'i18n-dom-bind' || this.constructor.is === 'i18n-dom-bind' ? this.id : this.is;
    if (!lang || lang.length === 0) {
      // handle empty cases
      if (defaultLang && defaultLang.length > 0 && bundles[defaultLang] && bundles[defaultLang][id]) {
        lang = defaultLang; // app default language
      }
      else if (this.templateDefaultLang && this.templateDefaultLang.length > 0) {
        lang = this.templateDefaultLang; // element default language
      }
      else {
        lang = ''; // fallback default language
      }
    }

    // set up an empty bundle if inexistent
    bundles[lang] = bundles[lang] || {};

    if (bundles[lang][id]) {
      // bundle is available; no need to fetch
      if (this._fetchStatus.targetLang === lang) {
        // reset error status
        this._fetchStatus.error = null;
        if (this.lang === lang) {
          this.notifyPath('text', this._getBundle(this.lang));
          this.fire('lang-updated', { 
            lang: this.lang, 
            lastLang: this._fetchStatus.lastLang
          });
        }
        else {
          this.lang = lang; // trigger lang-updated event
        }
      }
      else {
        var nextFallbackLanguage = this._fetchStatus.fallbackLanguageList.shift();
        // bundle is available; no need to fetch
        this._fetchStatus.fetchingInstance = null;
        if (nextFallbackLanguage) {
          this._fetchBundle(nextFallbackLanguage);
        }
        else {
          this._constructBundle(this._fetchStatus.targetLang);
          // reset error status
          this._fetchStatus.error = null;
          if (this.lang === this._fetchStatus.targetLang) {
            this.notifyPath('text', this._getBundle(this.lang));
            this.fire('lang-updated', { 
              lang: this.lang,
              lastLang: this._fetchStatus.lastLang
            });
          }
          else {
            this.lang = this._fetchStatus.targetLang; // trigger lang-updated event
          }
        }
      }
    }
    else if (this._fetchStatus.fetchingInstance) {
      if (this._fetchStatus.fetchingInstance !== this) {
        // fetching in progress by another instance
        // TODO: redundant addEventListener multiple times
        this._forwardLangEventBindThis = this._forwardLangEventBindThis ||
                                          this._forwardLangEvent.bind(this);
        this._fetchStatus.fetchingInstance
          .addEventListener('lang-updated', this._forwardLangEventBindThis);
      }
    }
    else if (bundleFetchingInstances[lang]) {
      // fetching bundle.lang.json in progress by an instance of another element
      this._fetchStatus.fetchingInstance = this;
      this._fetchStatus.ajaxLang = lang;
      this._handleBundleFetchedBindThis = this._handleBundleFetchedBindThis ||
                                          this._handleBundleFetched.bind(this);
      bundleFetchingInstances[lang]
        .addEventListener('bundle-fetched', this._handleBundleFetchedBindThis);
      //console.log(this.is + ' addEventListener bundle-fetched');
    }
    else {
      // proceed to fetch
      this._fetchStatus.fetchingInstance = this;
      if (!this._fetchStatus.ajax) {
        // set up ajax client
        this._fetchStatus.ajax = new XMLHttpRequest();
        this._fetchStatus.ajax[ isXhrNativeJsonResponseType ? 'responseType' : '_responseType' ] = 'json';
        this._fetchStatus._handleResponseBindFetchingInstance = this._handleResponse.bind(this);
        this._fetchStatus._handleErrorBindFetchingInstance = this._handleError.bind(this);
        this._fetchStatus.ajax.addEventListener('load', this._fetchStatus._handleResponseBindFetchingInstance);
        this._fetchStatus.ajax.addEventListener('error', this._fetchStatus._handleErrorBindFetchingInstance);
      }
      else {
        if (this._fetchStatus._handleResponseBindFetchingInstance) {
          this._fetchStatus.ajax.removeEventListener('load', this._fetchStatus._handleResponseBindFetchingInstance);
        }
        if (this._fetchStatus._handleErrorBindFetchingInstance) {
          this._fetchStatus.ajax.removeEventListener('error', this._fetchStatus._handleErrorBindFetchingInstance);
        }
        this._fetchStatus._handleResponseBindFetchingInstance = this._handleResponse.bind(this);
        this._fetchStatus._handleErrorBindFetchingInstance = this._handleError.bind(this);
        this._fetchStatus.ajax.addEventListener('load', this._fetchStatus._handleResponseBindFetchingInstance);
        this._fetchStatus.ajax.addEventListener('error', this._fetchStatus._handleErrorBindFetchingInstance);
      }
      // TODO: app global bundles have to be handled
      var url;
      var skipFetching = false;

      var importBaseURI = this.constructor.importMeta
        ? this.constructor.importMeta.url
        : location.href;
      if (lang === '') {
        url = this.resolveUrl(id + '.json', importBaseURI);
      }
      else {
        if (bundles[lang] && bundles[lang].bundle) {
          // missing in the bundle
          url = this.resolveUrl(localesPath + '/' + id + '.' + lang + '.json', importBaseURI);
          skipFetching = !!this.isI18nController;
        }
        else {
          // fetch the bundle
          bundleFetchingInstances[lang] = this;
          url = this.resolveUrl(startUrl + localesPath + '/bundle.' + lang + '.json', importBaseURI);
        }
      }
      this._fetchStatus.ajax.url = url;
      this._fetchStatus.ajaxLang = lang;
      try {
        this._fetchStatus.error = null;
        if (skipFetching) {
          this._handleError({ detail: { error: 'skip fetching for I18nController' }});
        }
        else {
          this._fetchStatus.ajax.open('GET', this._fetchStatus.ajax.url);
          this._fetchStatus.ajax.setRequestHeader('Accept', 'application/json');
          this._fetchStatus.ajax.send();
        }
      }
      catch (e) {
        if (this._fetchStatus.ajax.readyState !== 0 /* UNSENT */ && this._fetchStatus.ajax.readyState !== 4 /* DONE */) {
          this._fetchStatus.ajax.onabort = function onAbort(event) {
            this._fetchStatus.ajax.onabort = null;
            this._handleError({ detail: { error: 'ajax request failed: ' + e }});
          }.bind(this);
          this._fetchStatus.ajax.abort();
        }
        else {
          // TODO: extract error message from the exception e
          this._handleError({ detail: { error: 'ajax request failed: ' + e }});
        }
      }
    }
  },

  /**
   * Handles Ajax load event for a bundle
   *
   * @param {Object} event XMLHttpRequest `load` event.
   */
  _handleResponse: function (event) {
    //console.log('_handleResponse ajaxLang = ' + this._fetchStatus.ajaxLang);
    let response;
    if (this._fetchStatus.ajax.status >= 200 && this._fetchStatus.ajax.status < 300) {
      if (isXhrNativeJsonResponseType) {
        response = this._fetchStatus.ajax.response;
      }
      else {
        try {
          response = JSON.parse(this._fetchStatus.ajax.responseText);
        }
        catch (e) {
          response = null;
        }
      }
    }
    else {
      // Typically HTTP 404
      event.detail = event.detail || {};
      event.detail.error = this._fetchStatus.ajax.status + ' ' + this._fetchStatus.ajax.statusText + ' for ' + this._fetchStatus.ajax.url;
      this._handleError(event); // Forwarding to _handleError()
      return;
    }
    if (this._fetchStatus.ajax.url.indexOf('/' + localesPath + '/bundle.') >= 0) {
      bundles[this._fetchStatus.ajaxLang] = bundles[this._fetchStatus.ajaxLang] || {};
      this._deepMap(bundles[this._fetchStatus.ajaxLang],
                    response,
                    function (text) { return text; });
      bundles[this._fetchStatus.ajaxLang].bundle = true;
      bundleFetchingInstances[this._fetchStatus.ajaxLang] = null;
      //console.log('bundle-fetched ' + this.is + ' ' + this._fetchStatus.ajaxLang);
      this.fire('bundle-fetched', { success: true, lang: this._fetchStatus.ajaxLang });
      var id = this.is === 'i18n-dom-bind' ? this.id : this.is;
      if (bundles[this._fetchStatus.ajaxLang][id]) {
        this._fetchStatus.lastResponse = bundles[this._fetchStatus.ajaxLang][id];
      }
      else {
        // bundle does not contain text for this.is
        this._fetchStatus.fetchingInstance = null;
        this._fetchBundle(this._fetchStatus.ajaxLang);
        return;
      }
    }
    else {
      this._fetchStatus.lastResponse = response;
    }
    if (this._fetchStatus.lastResponse) {
      var nextFallbackLanguage = this._fetchStatus.fallbackLanguageList.shift();
      // store the raw response
      this._fetchStatus.rawResponses[this._fetchStatus.ajaxLang] = 
        this._fetchStatus.lastResponse;

      this._fetchStatus.fetchingInstance = null;
      if (nextFallbackLanguage) {
        this._fetchBundle(nextFallbackLanguage);        
      }
      else {
        this._fetchBundle('');
      }
    }
    else {
      event.detail = event.detail || {};
      event.detail.error = 'empty response for ' + this._fetchStatus.ajax.url;
      this._handleError(event);
    }
  },

  /**
   * Handles Ajax error event or forwarded load event for a bundle.
   *
   * @param {Object} event `error` event or forwarded `load` event
   */
  _handleError: function (event) {
    event.detail = event.detail || {};
    event.detail.error = event.detail.error || this._fetchStatus.ajax.statusText;
    var nextFallbackLanguage;
    this._fetchStatus.fetchingInstance = null;
    if (this._fetchStatus.ajax.url.indexOf('/' + localesPath + '/bundle.') >= 0) {
      bundles[this._fetchStatus.ajaxLang] = bundles[this._fetchStatus.ajaxLang] || {};
      bundles[this._fetchStatus.ajaxLang].bundle = true;
      bundleFetchingInstances[this._fetchStatus.ajaxLang] = null;
      // falls back to its element-specific bundle
      this._fetchBundle(this._fetchStatus.ajaxLang);
      //console.log('bundle-fetched ' + this.is + ' ' + this._fetchStatus.ajaxLang);
      this.fire('bundle-fetched', { success: false, lang: this._fetchStatus.ajaxLang });
      return;
    }
    nextFallbackLanguage = this._fetchStatus.fallbackLanguageList.shift();
    if (this._fetchStatus.ajaxLang === this._fetchStatus.targetLang) {
      if (nextFallbackLanguage) {
        //console.log(this.is + ': ' + this._fetchStatus.ajaxLang +
        //            ' falls back to ' + nextFallbackLanguage);
        this._fetchStatus.targetLang = nextFallbackLanguage;
        this._fetchBundle(nextFallbackLanguage);
      }
      else {
        this._fetchStatus.error = event.detail.error;
        //console.log(this._fetchStatus.error);
        // falls back to default
        this.lang = '';
      }
    }
    else {
      // fetching dependent fallback languages
      if (nextFallbackLanguage) {
        //console.log(this.is + ': ' + this._fetchStatus.ajaxLang +
        //            ' is missing and skipped');
        //console.log(this.is + ': step to the next dependent fallback ' +
        //            nextFallbackLanguage);
        this._fetchBundle(nextFallbackLanguage);
      }
      else {
        this._fetchBundle('');
      }
    }
  },

  /**
   * Forward `lang-updated` event to other instances of the same element.
   *
   * @param {Object} event `lang-updated` event object.
   */
  _forwardLangEvent: function (event) {
    //console.log('_forwardLangEvent ' + this.is + ' ' + event.detail.lang);
    event.target.removeEventListener(event.type, this._forwardLangEventBindThis);
    if (this.lang === event.detail.lang) {
      this.notifyPath('text', this._getBundle(this.lang));
      this.fire(event.type, event.detail);
    }
    else {
      this.lang = event.detail.lang;
      this.notifyPath('text', this._getBundle(this.lang));
    }
  },

  /**
   * Handle `bundle-fetched` event.
   *
   * @param {Object} event `bundle-fetched` event object.
   */
  _handleBundleFetched: function (event) {
    var detail = event.detail;
    //console.log('_handleBundleFetched ' + this.is + ' ' + detail.lang);
    event.target.removeEventListener(event.type, this._handleBundleFetchedBindThis);
    if (this._fetchStatus.ajaxLang === detail.lang) {
      this._fetchStatus.fetchingInstance = null;
      this._fetchBundle(this._fetchStatus.ajaxLang);
    }
  },

  /**
   * Construct the text message bundle of the target locale with fallback of missing texts.
   *
   * @param {strings} lang Target locale.
   */
  _constructBundle: function (lang) {
    var fallbackLanguageList = this._enumerateFallbackLanguages(lang);
    var bundle = {};
    var raw;
    var baseLang;
    var id = this.is === 'i18n-dom-bind' ? this.id : this.is;
    var i;
    fallbackLanguageList.push('');
    for (i = 0; i < fallbackLanguageList.length; i++) {
      if (bundles[fallbackLanguageList[i]] &&
          bundles[fallbackLanguageList[i]][id]) {
        break;
      }
    }
    fallbackLanguageList.splice(i + 1, fallbackLanguageList.length);
    while ((baseLang = fallbackLanguageList.pop()) !== undefined) {
      if (bundles[baseLang][id]) {
        bundle = deepcopy(bundles[baseLang][id]);
      }
      else {
        raw = this._fetchStatus.rawResponses[baseLang];
        if (raw) {
          this._deepMap(bundle, raw, function (text) { return text; });
        }
      }
    }
    // store the constructed bundle
    if (!bundles[lang]) {
      bundles[lang] = {};
    }
    bundles[lang][id] = bundle;
  },

  /**
   * Recursively map the source object onto the target object with the specified map function.
   * 
   * The method is used to merge a bundle into its fallback bundle.
   *
   * @param {Object} target Target object.
   * @param {Object} source Source object.
   * @param {Function} map Mapping function.
   */
  _deepMap: function (target, source, map) {
    var value;
    for (var prop in source) {
      value = source[prop];
      switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        if (typeof target === 'object') {
          target[prop] = map(value, prop);
        }
        break;
      case 'object':
        if (typeof target === 'object') {
          if (Array.isArray(value)) {
            // TODO: cannot handle deep objects properly
            target[prop] = target[prop] || [];
            this._deepMap(target[prop], value, map);
          }
          else {
            target[prop] = target[prop] || {};
            this._deepMap(target[prop], value, map);
          }
        }
        break;
      default:
        if (typeof target === 'object') {
          target[prop] = value;
        }
        break;
      }
    }
  },

  /**
   * Return the first non-null argument.
   *
   * Utility method for use in annotations.
   *
   * ### Example Usage:
   * ```
   *   <input is="iron-input" class="flex"
   *     type="search" id="query" bind-value="{{query}}"
   *     autocomplete="off"
   *     placeholder="{{or(placeholder,text.search)}}">
   * ```
   *
   * @param {*} arguments List of arguments.
   */
  or: function () {
    var result = arguments[0];
    var i = 1;
    while (!result && i < arguments.length) {
      result = arguments[i++];
    }
    return result;
  },


  /**
   * Translate a string by a message table.
   *
   * Utility method for use in annotations.
   *
   * ### Example Usage:
   * ```
   *   <span>{{tr(status,text.statusMsgs)}}</span>
   *   <span>{{tr(errorId,text)}}</span>
   *   <template>
   *     <json-data text-id="statusMsgs">{
   *       "signed-in": "Authenticated",
   *       "signed-out": "Not Authenticated",
   *       "error": "Error in Authentication",
   *       "default": "Unknown Status in Authentication"
   *     }</json-data>
   *     <span text-id="http-404">File Not Found</span>
   *     <span text-id="http-301">Moved Permanently</span>
   *   </template>
   * ```
   *
   * Note: The second `table` parameter should always be specified in order
   * to trigger automatic updates on `this.text` mutations, i.e., updates of `this.effectiveLang`.
   *
   * @param {string} key Key of the message.
   * @param {Object} table The message table object or this.text itself if omitted
   * @return {string} Translated string, `table.default` if `table[key]` is undefined, or key string if table.default is undefined.
   */
  tr: function (key, table) {
    if (table) {
      if (typeof table === 'object') {
        if (typeof table[key] !== 'undefined') {
          return table[key];
        }
        else if (typeof table['default'] !== 'undefined') {
          return table['default'];
        }
        else {
          return key;
        }
      }
      else {
        return key;
      }
    }
    else {
      return (typeof this.text === 'object') &&
             (typeof key !== 'undefined') &&
             (typeof this.text[key] !== 'undefined') ? this.text[key] : key;
    }
  },

  /**
   * Format a parameterized string.
   *
   * Utility method for use in annotations.
   *
   * ### Example Usage:
   * ```
   *   <span attr="{{i18nFormat(text.param.0,text.textparam1,text.textparam2)}}"></span>
   *   <template>
   *     <json-data text-id="param">[
   *       "String with {1} and {2} are formetted",
   *       "[[text.textparam1]]",
   *       "[[text.textparam2]]"
   *     ]</json-data>
   *     <span text-id="textparam1">Parameter 1</span>
   *     <span text-id="textparam2">Parameter 2</span>
   *   </template>
   * ```
   *
   * Note: Compound bindings in attributes are automatically converted to {{i18nFormat()}} in preprocessing.
   *
   * @param {*} arguments List of arguments.
   * @return {string} Formatted string
   */
  i18nFormat: function () {
    if (arguments.length > 0) {
      var formatted = arguments[0] || '';
      for (var n = 1; n < arguments.length; n++) {
        formatted = formatted.replace('{' + n + '}', arguments[n]);
      }
    }
    return formatted;
  }
};
