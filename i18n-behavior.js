/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
/* For earlier initialization on Polymer 2.x */
/* TODO: convert to HTML import to avoid multiple deepcopy registration */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { Base } from '@polymer/polymer/polymer-legacy.js';

import '@polymer/iron-ajax/iron-ajax.js';
import 'i18n-format/i18n-format.js';
import './i18n-preference.js';
import './i18n-attr-repo.js';
import { ElementMixin } from '@polymer/polymer/lib/mixins/element-mixin.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { DomModule } from '@polymer/polymer/lib/elements/dom-module.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { MutableDataBehavior } from '@polymer/polymer/lib/legacy/mutable-data-behavior.js';
import deepcopy from 'deepcopy/dist/deepcopy.js';
//const $_documentContainer = document.createElement('template');
//$_documentContainer.innerHTML = `<i18n-attr-repo></i18n-attr-repo>`;
//document.head.appendChild($_documentContainer.content);
/* jshint -W100 */
(function(document) {
  'use strict';

  var html = document.querySelector('html');
  if (window.ShadowDOMPolyfill) {
    // Fix #38. Add reflectToAttribute effect on html.lang property
    // for supplementing Shadow DOM MutationObserver polyfill
    Object.defineProperty(html, 'lang', {
      get: function () {
        return this.getAttribute('lang');
      },
      set: function (value) {
        this.setAttribute('lang', value);
      }
    });
  }

  // Safari 7 predefines non-configurable standard properties
  // Note: They become configurable with ShadowDOMPolyfill, which wraps them.
  var isStandardPropertyConfigurable = (function () {
    var langPropertyDescriptor = Object.getOwnPropertyDescriptor(document.createElement('span'), 'lang');
    return !langPropertyDescriptor || langPropertyDescriptor.configurable;
  })();
  // Polymer 1.4.0 on Safari 7 inserts extra unexpected whitepace node at the beginning of template
  var extraWhiteSpaceNode = !isStandardPropertyConfigurable;
  if (ElementMixin) {
    isStandardPropertyConfigurable = false;
  }

  // app global bundle storage
  var bundles = { '': {} }; // with an empty default bundle
  // app global default language
  var defaultLang = html.hasAttribute('lang') ? html.getAttribute('lang') : '';
  // shared fetching instances for bundles
  var bundleFetchingInstances = {};

  // path for start URL
  var startUrl = (function () {
    var path = window.location.pathname;
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
  var localesPath = html.hasAttribute('locales-path') ? 
                      html.getAttribute('locales-path') : 'locales';

  // Support ShadowDOM V1 on Polymer 2.x
  var paramAttribute = ElementMixin ? 'slot' : 'param';

  var attributesRepository = document.createElement('i18n-attr-repo');
  // ((!window.HTMLImports || HTMLImports.hasNative || HTMLImports.useNative) ? document.currentScript : (document._currentScript || document.currentScript)).ownerDocument.querySelector('i18n-attr-repo');

  // set up userPreference
  var userPreference = document.querySelector('i18n-preference');
  if (!userPreference) {
    userPreference = document.createElement('i18n-preference');
    // append to body
    addEventListener('load', function (event) {
      document.querySelector('body').appendChild(userPreference);
    });
  }

  // debug log when <html debug> attribute exists
  var debuglog = html.hasAttribute('debug') ?
    function (arg) {
      console.log(arg);
    } :
    function () {};

  window.BehaviorsStore = window.BehaviorsStore || {};
  /**
   * Apply `BehaviorsStore.I18nControllerBehavior` to manipulate internal variables for I18N
   *
   * Note: This behavior is not for normal custom elements to apply I18N. UI is not expected.
   *
   * @polymerBehavior BehaviorsStore.I18nControllerBehavior
   * @group I18nBehavior
   */
  BehaviorsStore.I18nControllerBehavior = {
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
   * Apply `BehaviorsStore.I18nBehavior` to implement localizable elements.
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
   *
   * - - -
   *
   * ### TODOs
   *
   * - Support user locale preference per user
   *
   * @polymerBehavior BehaviorsStore.I18nBehavior
   * @group I18nBehavior
   * @hero hero.svg
   * @demo demo/index.html
   */
  BehaviorsStore.I18nBehavior = {

    /**
     * Fired when the text message bundle object (`this.text`) is updated after `this.lang` is changed.
     *
     * @event lang-updated
     */

    /**
     * Fired when a shared bundle is fetched.
     *
     * @event bundle-fetched
     */

    properties: {
      /**
       * The locale of the element.
       * The default value is copied from `<html lang>` attribute of the current page.
       * If `<html lang>` is not specified, `''` is set to use the template default language.
       *
       * The value is synchronized with `<html lang>` attribute of the current page by default.
       *
       * ### Note:
       *  - The value may not reflect the current UI locale until the localized texts are loaded.
       */
      lang: {
        type: String,
        value: defaultLang,
        reflectToAttribute: true,
        observer: '_langChanged'
      },

      /**
       * Text message bundle object for the current locale.
       * The object is shared among all the instances of the same element.
       * The value is updated when `lang-updated` event is fired.
       */
      text: {
        type: Object,
        computed: '_getBundle(lang)'
      },

      /**
       * Data model bundle object for the current locale.
       * The data are bound to localizable attribute values in the element template.
       * The object is cloned from `this.text.model` per instance.
       * The value is NOT automatically updated in sync with `this.text`.
       * 
       * How to manually update the model object when `lang-updated` event is fired:
       * ```
       *     this.model = deepcopy(this.text.model);
       * ```
       */
      model: {
        type: Object,
        notify: true
      },

      /**
       * The locale of the hard-coded texts in the element's template.
       * The read-only value can be specified by the `lang` attribute of the element's `template`.
       * The default value is 'en' if not specified in the `template` element.
       *
       * ```
       *  <dom-module id="custom-element">
       *    <template lang="en">
       *      <span>Hard-coded text in English</span>
       *    </template>
       *  <dom-module>
       * ```
       */
      templateDefaultLang: {
        type: String,
        value: 'en'
      },

      /**
       * The effective locale of the element.
       * The value is updated when the localized texts are loaded and `lang-updated` event is fired.
       */
      effectiveLang: {
        type: String
      },

      /**
       * Boolean flag to synchronize with the value of  `<html lang>` attribute.
       */
      observeHtmlLang: {
        type: Boolean,
        value: true,
        observer: '_observeHtmlLangChanged'
      }
    },

    listeners: {
      'lang-updated': '_updateEffectiveLang'
    },

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
      var id = this.is === 'i18n-dom-bind' || (ElementMixin && this.constructor.is === 'i18n-dom-bind') ? this.id : this.is;

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
     * Get the next fallback locale for the target locale.
     * 
     * Subset implementation of BCP47 (https://tools.ietf.org/html/bcp47).
     *
     * ### Examples:
     *
     *| Target Locale | Next Fallback |
     *|:--------------|:--------------|
     *| ru            | null          |
     *| en-GB         | en            |
     *| fr-CA         | fr            |
     *| zh-Hans-CN    | zh-Hans       |
     *
     * @param {string} lang Target locale.
     * @return {string} Next fallback locale. `null` if there are no fallback languages.
     */
    /*
    _getNextFallbackLanguage: function (lang) {
      var fallbackLanguageList = this._enumerateFallbackLanguages(lang);
      fallbackLanguageList.shift();
      var nextFallbackLanguage = fallbackLanguageList.shift();
      return nextFallbackLanguage ? nextFallbackLanguage : null;
    },
    */

    /**
     * MutationObserver callback of `lang` attribute for Safari 7
     *
     * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
     */
    _handleLangAttributeChange: function (mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.type) {
        case 'attributes':
          if (mutation.attributeName === 'lang') {
            //console.log('_handleLangAttributeChange lang = ' + this.lang + ' oldValue = ' + mutation.oldValue +
            //            ' typeof oldValue = ' + typeof mutation.oldValue);
            if (!(typeof mutation.oldValue === 'object' && !mutation.oldValue) &&
                mutation.oldValue !== this.lang) {
              if (this._lang !== mutation.oldValue) {
                //console.log('assigning this._lang = ' + mutation.oldValue + ' from old value');
                this._lang = mutation.oldValue;
              }
              //console.log('assigning this._lang = ' + this.lang);
              this._lang = this.lang;
            }
            else if (mutation.oldValue != this.lang && this._lang !== this.lang) {
              //console.log('assigning this._lang = ' + this.lang);
              this._lang = this.lang;
            }
          }
          break;
        default:
          /* istanbul ignore next: mutation.type is always attributes */
          break;
        }
      }, this);
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
        if (!ElementMixin || (ElementMixin && this.__data)) {
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
     * Called on `lang-updated` events and update `this.effectiveLang` with the value of `this.lang`.
     */
    _updateEffectiveLang: function (event) {
      if (dom(event).rootTarget === this) {
        //console.log('_updateEffectiveLang: lang = ' + this.lang);
        this.effectiveLang = this.lang;
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
      if (!lang || lang.length === 0) {
        // handle empty cases
        if (defaultLang && defaultLang.length > 0) {
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
      var id = this.is === 'i18n-dom-bind' || (ElementMixin && this.constructor.is === 'i18n-dom-bind') ? this.id : this.is;

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
          this._fetchStatus.ajax = Base.create('iron-ajax');
          this._fetchStatus.ajax.handleAs = 'json';
          this._fetchStatus._handleResponseBindFetchingInstance = this._handleResponse.bind(this);
          this._fetchStatus._handleErrorBindFetchingInstance = this._handleError.bind(this);
          this._fetchStatus.ajax.addEventListener('response', this._fetchStatus._handleResponseBindFetchingInstance);
          this._fetchStatus.ajax.addEventListener('error', this._fetchStatus._handleErrorBindFetchingInstance);
        }
        else {
          if (this._fetchStatus._handleResponseBindFetchingInstance) {
            this._fetchStatus.ajax.removeEventListener('response', this._fetchStatus._handleResponseBindFetchingInstance);
          }
          if (this._fetchStatus._handleErrorBindFetchingInstance) {
            this._fetchStatus.ajax.removeEventListener('error', this._fetchStatus._handleErrorBindFetchingInstance);
          }
          this._fetchStatus._handleResponseBindFetchingInstance = this._handleResponse.bind(this);
          this._fetchStatus._handleErrorBindFetchingInstance = this._handleError.bind(this);
          this._fetchStatus.ajax.addEventListener('response', this._fetchStatus._handleResponseBindFetchingInstance);
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
            this._fetchStatus.ajax.generateRequest();
          }
        }
        catch (e) {
          // TODO: extract error message from the exception e
          this._handleError({ detail: { error: 'ajax request failed: ' + e }});
        }
      }
    },

    /**
     * Handle Ajax success response for a bundle.
     *
     * @param {Object} event `iron-ajax` success event.
     */
    _handleResponse: function (event) {
      //console.log('_handleResponse ajaxLang = ' + this._fetchStatus.ajaxLang);
      if (this._fetchStatus.ajax.url.indexOf('/' + localesPath + '/bundle.') >= 0) {
        bundles[this._fetchStatus.ajaxLang] = bundles[this._fetchStatus.ajaxLang] || {};
        this._deepMap(bundles[this._fetchStatus.ajaxLang],
                      event.detail.response,
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
        this._fetchStatus.lastResponse = event.detail.response;
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
        event.detail.error = 'empty response for ' + this._fetchStatus.ajax.url;
        this._handleError(event);
      }
    },

    /**
     * Handle Ajax error response for a bundle.
     *
     * @param {Object} event `iron-ajax` error event.
     */
    _handleError: function (event) {
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
     * Handle changes of `observeHtmlLang` property.
     *
     * @param {Boolean} value Value of `observeHtmlLang`
     */
    _observeHtmlLangChanged: function (value) {
      if (value) {
        this._htmlLangObserver = this._htmlLangObserver || 
          new MutationObserver(this._handleHtmlLangChange.bind(this));
        this._htmlLangObserver.observe(html, { attributes: true });
      }
      else {
        if (this._htmlLangObserver) {
          this._htmlLangObserver.disconnect();
        }
      }
    },

    /**
     * MutationObserver callback of `<html lang>` attribute.
     *
     * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
     */
    _handleHtmlLangChange: function (mutations) {
      mutations.forEach(function(mutation) {
        switch (mutation.type) {
        case 'attributes':
          if (mutation.attributeName === 'lang') {
            this.lang = html.lang;
          }
          break;
        default:
          break;
        }
      }, this);
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
     * Construct a pseudo-bundle for the target locale. (Not used for now)
     *
     * @param {string} lang Target locale.
     */
    /*
    _constructPseudoBundle: function (lang) {
      var bundle = {};
      var id = this.is === 'i18n-dom-bind' ? this.id : this.is;
      this._deepMap(bundle, bundles[''][id], function (value) {
        return typeof value === 'string' ? lang + ' ' + value : value;
      });
      bundles[lang] = bundles[lang] || {};
      bundles[lang][id] = bundle;
      return bundle;
    },
    */

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
     * Construct the default bundle from the element's template.
     *
     * Extract the default bundle from the template if it is embedded as JSON at build time.
     *
     * ### Hard-coded UI text example:
     * ```
     *   <dom-module id="custom-element">
     *     <template>
     *       <span id="label">UI Text Label:</span>
     *       <input id="input-el"
     *              value="{{keyword}}"
     *              placeholder="Keyword">
     *     </template>
     *   </dom-module>
     * ```
     *
     * ### Constructed default bundle for the above example:
     * ```
     *   {
     *     "model" : {
     *       "input-el": {
     *         "placeholder": "Keyword"
     *       }
     *     },
     *     "label": "UI Text Label:"
     *   }
     * ```
     *
     * ### Processed template with bound annotations for the above example:
     * ```
     *   <dom-module id="custom-element">
     *     <template localizable-text="embedded">
     *       <span id="label">{{text.label}}</span>
     *       <input id="input-el"
     *         value="{{keyword}}"
     *         placeholder="{{model.input-el.placeholder}}">
     *     </template>
     *   </dom-module>
     * ```
     *
     * ### Embedded JSON bundle format for the above example:
     * ```
     *   <dom-module id="custom-element">
     *     <template localizable-text="embedded">
     *       <span id="label">{{text.label}}</span>
     *       <input id="input-el"
     *         value="{{keyword}}"
     *         placeholder="{{model.input-el.placeholder}}">
     *       <template id="localizable-text">
     *         <json-data>{
     *           "model" : {
     *             "input-el": {
     *               "placeholder": "Keyword"
     *             }
     *           },
     *           "label": "UI Text Label:"
     *         }</json-data>
     *       </template>
     *     </template>
     *   </dom-module>
     * ```
     */
    _constructDefaultBundle: function (_template, _id) {
      var template;
      var id = _id || this.is;
      if (this.is === 'i18n-dom-bind') {
        template = _template || this;
        id = this.id;
        /* istanbul ignore if */
        if (template.content && template.content.childNodes.length === 0) {
          // Find the real template in Internet Explorer 11 when i18n-dom-bind is concealed in a parent template
          // This does not happen on Polymer 1.3.1 or later.  So ignore this 'if' statement in code coverage.
          template = Array.prototype.map.call(document.querySelectorAll('template'), function (parentTemplate) {
            return parentTemplate.content.querySelector('template#' + id + '[is="i18n-dom-bind"]');
          }).reduce(function (prev, current) {
            return prev || current;
          });
          // Patch this.content with the real one
          if (template) {
            this.content = template.content;
          }
        }
      }
      else {
        template = _template || DomModule.import(id, 'template');
      }
      if (template) {
        this.templateDefaultLang = template.hasAttribute('lang') ? template.lang : 'en';
      }
      else {
        this.templateDefaultLang = 'en';
      }
      var bundle = { model: {} };
      var path = [];
      var templateDefaultLang = this.templateDefaultLang;
      var localizableText, jsonData;

      if (template) {
        // register localizable attributes of the element itself
        if (attributesRepository.registerLocalizableAttributes) {
          attributesRepository.registerLocalizableAttributes(id, template);
        }
        else {
          BehaviorsStore._I18nAttrRepo._created();
          BehaviorsStore._I18nAttrRepo.registerLocalizableAttributes(id, template);
        }
        if (template.getAttribute('localizable-text') === 'embedded') {
          // pick up embedded JSON from the template
          localizableText = template.content.querySelector('#localizable-text');
          if (localizableText) {
            jsonData = localizableText.content.querySelector('json-data');
            if (jsonData) {
              bundle = JSON.parse(jsonData.textContent);
            }
            else {
              console.error('<json-data> not found in <template id=\"localizable-text\">');
            }
          }
          else {
            console.error('<template id=\"localizable-text\"> not found');
          }
        }
        else {
          if (extraWhiteSpaceNode) {
            template.setAttribute('strip-whitespace', '');
          }
          // traverse template to generate bundle
          this._traverseTemplateTree(template.content, path, bundle, 0);
        }
      }

      bundles[''][id] = bundle;
      bundles[templateDefaultLang] = bundles[templateDefaultLang] || {};
      bundles[templateDefaultLang][id] = bundle;
      //console.log('text = ');
      //console.log(JSON.stringify(bundle, null, 2));

      return true;
    },

    /**
     * Traverse localizable attributes of the target element node and 
     * add them to the target bundle under the `model` object.
     * 
     * The `<i18n-attr-repo>` object is used 
     * to judge if the target attributes are localizable.
     *
     * @param {Object} node Target element node.
     * @param {string} path Path to the target node.
     * @param {Object} bundle Default bundle.
     */
    _traverseAttributes: function (node, path, bundle) {
      var name = node.nodeName.toLowerCase();
      var id = node.getAttribute ?
                 (node.getAttribute('text-id') ||
                  node.getAttribute('id')) : null;
      var text;
      var messageId;
      var attrId;
      var isLocalizable;
      var dummy;
      // pick up element attributes
      Array.prototype.forEach.call(node.attributes, function (attribute) {
        text = attribute.value;
        switch (attribute.name) {
        case 'id':
        case 'text-id':
        case 'is':
        case 'lang':
        case 'class':
        // verification required before removing these attributes
        case 'href':
        case 'src':
        case 'style':
        case 'url':
        case 'selected':
          break;
        default:
          if (!(isLocalizable = BehaviorsStore._I18nAttrRepo.isLocalizableAttribute(node, attribute.name))) {
            break;
          }
          if (text.length === 0) {
            // skip empty value attribute
          }
          else if (text.match(/^{{[^{}]*}}$/) || text.match(/^\[\[[^\[\]]*\]\]$/)) {
            // skip annotation attribute
          }
          else if (text.replace(/\n/g, ' ').match(/^{.*}|\[.*\]$/g) &&
                  !text.match(/^{{[^{}]*}}|\[\[[^\[\]]*\]\]/) &&
                  !text.match(/{{[^{}]*}}|\[\[[^\[\]]*\]\]$/)) {
            // generate message id
            messageId = this._generateMessageId(path, id);
            try {
              //console.log(messageId + ' parsing attribute ' + attribute.name + ' = ' + text);
              var value = JSON.parse(text.replace(/\n/g, ' '));
              //console.log('parsed JSON object = ');
              //console.log(value);
              switch (typeof value) {
              case 'string':
              case 'number':
              case 'object':
                // put into model
                attrId = ['model', messageId, attribute.name].join('.');
                debuglog(attrId + ' = ' + text);
                this._setBundleValue(bundle, attrId, value);
                attribute.value = '{{' + attrId + '}}';
                break;
              default: // skip other types
                break;
              }
            }
            catch (e) {
              // invalid JSON
              console.warn(e, 'Invalid JSON at <' + name + ' ' + attribute.name + '> with value = ' + text);
            }
          }
          else if (text.match(/{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]/)) {
            // compound binding attribute
            // Parameterized:
            //   e.g., attr="Compound binding attribute has [[bound.value]] {{parameters}} in the value string"
            //   replaced as "{{i18nFormat(attrId.0,bound.value,parameters)}}"
            //   extracted as [ "Compound binding attribute has {1} {2} in the value string", "[[bound.value]]", "{{parameters}}" ]
            // Concatenated: (Parameters with functions cannot be reordered in translation)
            //   e.g., attr2="Compound binding attribute has [[f1(bound.value)]] {{f2(parameters)}} in the value string"
            //   replaced as "{{attrId.0}}[[f1(bound.value)]]{{attrId.2}}{{f2(parameters)}}{{attrId.4}}"
            //   extracted as [ "Compound binding attribute has ", "[[f1(bound.value)]]", " ", "{{f2(parameters)}}", " in the value string" ]
            var parsed = text.match(/([^{}\[\]]{1,})|({{[^{}]{1,}}})|(\[\[[^\[\]]{1,}\]\])/g);
            var parameterized;
            var processed;
            var n;
            messageId = this._generateMessageId(path, id);
            attrId = ['model', messageId, attribute.name.replace(/\$$/, '')].join('.');
            if (text.match(/\)}}|\)\]\]/)) { // check for function parameter
              // Concatenate
              debuglog(attrId + ' = ' + JSON.stringify(parsed));
              this._setBundleValue(bundle, attrId, parsed);
              processed = '';
              for (n = 0; n < parsed.length; n++) {
                if (parsed[n].match(/^{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]$/)) {
                  processed += parsed[n];
                }
                else {
                  processed += '{{' + attrId + '.' + n + '}}';
                }
              }
              if (isLocalizable === '$' && !attribute.name.match(/\$$/)) {
                dummy = document.createElement('span');
                dummy.innerHTML = '<span ' + attribute.name + '$="' + processed + '"></span>';
                node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());
              }
              else {
                attribute.value = processed;
              }
            }
            else {
              // Parameterize
              parameterized = [ '' ];
              while (parsed.length) {
                if (parsed[0].match(/^{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]$/)) {
                  parameterized.push(parsed[0]);
                  parameterized[0] += '{' + (parameterized.length - 1) + '}';
                }
                else {
                  parameterized[0] += parsed[0];
                }
                parsed.shift();
              }
              debuglog(attrId + ' = ' + JSON.stringify(parameterized));
              this._setBundleValue(bundle, attrId, parameterized);
              processed = '{{i18nFormat(' + attrId + '.0';
              for (n = 1; n < parameterized.length; n++) {
                processed += ',' + parameterized[n].replace(/^[{\[][{\[](.*)[}\]][}\]]$/, '$1');
              }
              processed += ')}}';
              if (isLocalizable === '$' && !attribute.name.match(/\$$/)) {
                dummy = document.createElement('span');
                dummy.innerHTML = '<span ' + attribute.name + '$="' + processed + '"></span>';
                node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());
              }
              else {
                attribute.value = processed;
              }
            }
          }
          else {
            // string attribute
            messageId = this._generateMessageId(path, id);
            attrId = ['model', messageId, attribute.name].join('.');
            debuglog(attrId + ' = ' + text);
            this._setBundleValue(bundle, attrId, text);
            if (isLocalizable === '$' && !attribute.name.match(/\$$/)) {
              dummy = document.createElement('span');
              dummy.innerHTML = '<span ' + attribute.name + '$=' + '"{{' + attrId + '}}"' + '></span>';
              node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());
            }
            else {
              attribute.value = '{{' + attrId + '}}';
            }
          }
          break;
        }
      }, this);
    },

    /**
     * Recursively traverse text contents of the target element node
     * and add them to the target bundle object.
     *
     * Traversed text contents are replaced with annotations 
     * for the corresponding text in the bundle.
     *
     * - - -
     *
     * There are some special treatments in the following cases.
     *
     * ### Sentence with parameterized child parameter-like elements:
     *
     * As the order of the parameters can change in different languages,
     * `<i18n-format>` element is used to make the sentence localizable.
     *
     * ### Before processing
     *
     * ```
     *   <p id="p"><code>i18n-format</code> is 
     *     used for  
     *     <a href="https://www.google.com">parameterized</a> 
     *     sentences.</p>
     * ```
     *
     * ### After processing
     *
     * ```
     *   <p id="p">
     *     <i18n-format lang="{{effectiveLang}}">
     *       <span>{{text.p.0}}</span>
     *       <code>{{text.p.1}}</code>
     *       <a href="https://www.google.com">{{text.p.2}}</a>
     *     </i18n-format>
     *   </p>
     * ```
     *
     * ### Constructed bundle data: Texts are stored in an Array of strings.
     *
     * ```
     *   {
     *     "p" : [
     *       "{1} is\n used for\n {2}\n sentences.",
     *       "i18n-format",
     *       "parameterized"
     *     ]
     *   }
     * ```
     *
     * - - -
     *
     * ### `<i18n-format>` element with compound templates:
     *
     * Texts with compound templates for `<i18n-format>` element are
     * processed as below.
     *
     * `lang="{{effectiveLang}}"` attribute is added to `<i18n-format>` node
     * as well as `<i18n-number>` node.
     *
     * ### Before processing
     *
     * ```
     * <i18n-format id="sentence">
     *   <json-data>{
     *     "0": "You ({3}) gave no gifts.",
     *     "1": {
     *       "male": "You ({3}) gave him ({4}) {5}.",
     *       "female": "You ({3}) gave her ({4}) {5}.",
     *       "other": "You ({3}) gave them ({4}) {5}."
     *     },
     *     "one": {
     *       "male": 
     *         "You ({3}) gave him ({4}) and one other {5}.",
     *       "female": 
     *         "You ({3}) gave her ({4}) and one other {5}.",
     *       "other": 
     *         "You ({3}) gave them ({4}) and one other {5}."
     *     },
     *     "other": 
     *       "You ({3}) gave them ({4}) and {1} others gifts."
     *   }</json-data>
     *   <i18n-number 
     *     offset="1"
     *     >{{recipients.length}}</i18n-number>
     *   <span>{{recipients.0.gender}}</span>
     *   <span>{{sender.name}}</span>
     *   <span>{{recipients.0.name}}</span>
     *   <span>a gift</span>
     * </i18n-format>
     * ```
     *
     * ### After processing
     *
     * ```
     * <i18n-format id="sentence" 
     *              lang="{{effectiveLang}}">
     *   <json-data>{{serialize(text.sentence.0)}}</json-data>
     *   <i18n-number 
     *     offset="1"
     *     lang="{{effectiveLang}}"
     *     >{{recipients.length}}</i18n-number>
     *   <span>{{recipients.0.gender}}</span>
     *   <span>{{sender.name}}</span>
     *   <span>{{recipients.0.name}}</span>
     *   <span>{{text.sentence.5}}</span>
     * </i18n-format>
     * ```
     *
     * ### Constructed bundle data:
     *
     * ```
     * {
     *   "sentence" : [
     *     {
     *       "0": "You ({3}) gave no gifts.",
     *       "1": {
     *         "male": "You ({3}) gave him ({4}) {5}.",
     *         "female": "You ({3}) gave her ({4}) {5}.",
     *         "other": "You ({3}) gave them ({4}) {5}."
     *       },
     *       "one": {
     *         "male": 
     *         "You ({3}) gave him ({4}) and one other {5}.",
     *         "female": 
     *         "You ({3}) gave her ({4}) and one other {5}.",
     *         "other": 
     *         "You ({3}) gave them ({4}) and one other {5}."
     *       },
     *       "other": 
     *       "You ({3}) gave them ({4}) and {1} others gifts."
     *     },
     *     "{{recipients.length - 1}}",
     *     "{{recipients.0.gender}}",
     *     "{{sender.name}}",
     *     "{{recipients.0.name}}",
     *     "a gift"
     *   ]
     * }
     * ```
     *
     * @param {Object} node Target element node.
     * @param {string} path Path to the target node.
     * @param {Object} bundle Default bundle.
     * @param {Number} index Index in the siblings of the target node excluding whitespace nodes.
     */
    _traverseTemplateTree: function (node, path, bundle, index) {
      var i;
      var whiteSpaceElements = 0;
      var isWhiteSpace = false;
      var isCompoundAnnotatedNode = false;
      var text;
      var span;
      var name = node.nodeName.toLowerCase();
      var id = node.getAttribute ? 
                 (node.getAttribute('text-id') || 
                  node.getAttribute('id')) : null;
      var messageId;
      var n;
      var templateText;
      var templateTextParams;
      path.push(id ? '#' + id : name + (index > 0 ? '_' + index : ''));
      //console.log(path.join(':'));
      switch (node.nodeType) {
      case node.ELEMENT_NODE:
        switch (name) {
        case 'style':
        case 'script':
        case 'meta':
          // skip
          break;
        case 'i18n-format':
          // pick up element attributes
          this._traverseAttributes(node, path, bundle);
          // generate message id
          messageId = this._generateMessageId(path, id);
          if (!node.hasAttribute('lang')) {
            node.setAttribute('lang', '{{effectiveLang}}');
          }
          text = Array.prototype.filter.call(node.childNodes, function (child) {
            return child.nodeType === child.ELEMENT_NODE;
          }).map(function (param, n) {
            var value = param.textContent;
            var parsedValue = value.match(/^({{)(.*)(}})$/) || 
                              value.match(/^(\[\[)(.*)(\]\])$/);
            if (n === 0) {
              // template element
              if (param.tagName.toLowerCase() === 'json-data') {
                if (parsedValue) {
                  var parsedValue2 = value.match(/^({{)(serialize\(.*\))(}})$/) || 
                                     value.match(/^(\[\[)(serialize\(.*\))(\]\])$/);
                  if (!parsedValue2) {
                    // convert to {{serialize(id)}}
                    parsedValue.shift();
                    parsedValue.splice(1, 0, 'serialize(');
                    parsedValue.splice(3, 0, ')');
                    param.textContent = parsedValue.join('');
                  }
                }
                else {
                  value = JSON.parse(value);
                  param.textContent = '{{serialize(text.' + messageId + '.' + n + ')}}';
                }
              }
              else {
                if (!parsedValue) {
                  param.textContent = '{{text.' + messageId + '.' + n + '}}';
                }
              }
            }
            else {
              // param element
              // TODO: handle localization of param nodes and attributes
              if (!param.hasAttribute(paramAttribute)) {
                param.setAttribute(paramAttribute, n);
              }
              if (param.tagName.toLowerCase() === 'i18n-number') {
                if (!param.hasAttribute('lang')) {
                  param.setAttribute('lang', '{{effectiveLang}}');
                }
                var offset = param.getAttribute('offset');
                if (offset) {
                  offset = ' - ' + offset;
                }
                else {
                  offset = '';
                }
                if (parsedValue) {
                  // convert to {{path - offset}}
                  parsedValue.shift();
                  parsedValue.splice(2, 0, offset);
                  value = parsedValue.join('');
                }
                else {
                  param.textContent = '{{text.' + messageId + '.' + n + '}}';
                }
              }
              else {
                if (!parsedValue) {
                  param.textContent = '{{text.' + messageId + '.' + n + '}}';
                }
              }
            }
            return value;
          }, this);
          debuglog(messageId + ' = ' + text);
          this._setBundleValue(bundle, messageId, text);
          break;
        case 'template':
          // traverse into its content
          //console.log(path.join(':') + ':' + node.content.nodeName + ':' + 0);
          if (extraWhiteSpaceNode) {
            //if (node.hasAttribute('is') && node.getAttribute('is').match(/^(i18n-)?dom-/)) {
              node.setAttribute('strip-whitespace', '');
            //}
          }
          this._traverseTemplateTree(node.content, path, bundle, 0);
          break;
        default:
          // element node
          if (name === 'i18n-number' ||
              name === 'i18n-datetime') {
            if (!node.hasAttribute('lang')) {
              node.setAttribute('lang', '{{effectiveLang}}');
            }
          }
          // pick up element attributes
          this._traverseAttributes(node, path, bundle);
          // check annonated node
          isCompoundAnnotatedNode = false;
          if (node.childElementCount === 0) {
            if (node.textContent) {
              isCompoundAnnotatedNode = this._isCompoundAnnotatedText(node.textContent);
            }
          }
          if (node.childElementCount === 0 && !isCompoundAnnotatedNode) {
            if (node.textContent) { // use textContent for Firefox compatibility
              text = node.textContent;
              if (text.length === 0 || text.match(/^\s*$/g)) {
                // skip empty or whitespace node
              }
              else if (text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)) {
                // skip annotation node
                // TODO: compound bindings support
              }
              else {
                // a text message found
                // generate message id
                messageId = this._generateMessageId(path, id);
                // store the text message
                text = text.replace(/^[\s]*[\s]/, ' ').replace(/[\s][\s]*$/, ' ');
                if (name === 'json-data') {
                  this._setBundleValue(bundle, messageId, JSON.parse(text));
                }
                else {
                  this._setBundleValue(bundle, messageId, text);
                }
                // replace textContent with annotation
                node.textContent = '{{text.' + messageId + '}}';
                if (!id) {
                  //node.id = messageId;
                  //console.warn('add missing node id as ' + messageId + ' for ' + text);
                }
                debuglog(messageId + ' = ' + text);
              }
            }
            else {
              // skip
            }
          } 
          else {
            // has children or compound annotation
            // check if i18n-format is applicable
            var childStatus = Array.prototype.map.call(
              node.childNodes, function (child) {
                var result;
                if (child.nodeType === child.ELEMENT_NODE &&
                    child.tagName === 'TEMPLATE') {
                  var templateNonCommentChildNodes =
                    Array.prototype.filter.call(child.content.childNodes, function (templateChild) {
                      switch (templateChild.nodeType) {
                      case templateChild.COMMENT_NODE:
                        return false;
                      case templateChild.TEXT_NODE:
                        return !templateChild.textContent.match(/^\s*$/g);
                      default:
                      case templateChild.ELEMENT_NODE:
                        return true;
                      }
                    });
                  var firstChild = templateNonCommentChildNodes.shift();
                  // Examples:
                  // hasText: <template>text</template>
                  // hasCompoundAnnotatedText: <template>{{item.name}} text</template>
                  // hasTextChild: <template><b>text</b></template> or <template><br></template>
                  // hasCompoundAnnotatedChildNode: <template><b>{{item.name}} text</b></template>
                  // hasGrandChildren: <template><span><b>text</b></span></template> or 
                  //                   <template><b>A</b><i>B</i></template> or
                  //                   hasCompoundAnnotatedText
                  result = {
                    hasText: templateNonCommentChildNodes.length === 0 &&
                             firstChild &&
                             firstChild.nodeType === firstChild.TEXT_NODE &&
                             firstChild.textContent.length > 0 &&
                             !firstChild.textContent.match(/^\s*$/g),
                    hasCompoundAnnotatedText: firstChild &&
                                              firstChild.nodeType === firstChild.TEXT_NODE &&
                                              this._isCompoundAnnotatedText(firstChild.textContent),
                    hasTextChild: templateNonCommentChildNodes.length === 0 &&
                                  firstChild &&
                                  firstChild.nodeType === child.ELEMENT_NODE &&
                                  firstChild.childElementCount === 0, // including <br>
                    hasCompoundAnnotatedChildNode: firstChild &&
                                                   firstChild.nodeType === firstChild.ELEMENT_NODE &&
                                                   firstChild.childElementCount === 0 &&
                                                   this._isCompoundAnnotatedText(firstChild.textContent),
                    hasGrandChildren: templateNonCommentChildNodes.length > 0 ||
                                      (firstChild &&
                                       firstChild.nodeType === firstChild.ELEMENT_NODE &&
                                        Array.prototype.map.call(
                                          firstChild.childNodes,
                                          function (grandChild) {
                                            return grandChild.nodeType !== grandChild.TEXT_NODE;
                                          }
                                        ).reduce(function (prev, current) {
                                          return prev || current;
                                        }, false)) ||
                                      (firstChild &&
                                       firstChild.nodeType === firstChild.TEXT_NODE &&
                                       this._isCompoundAnnotatedText(firstChild.textContent))
                  };
                }
                else {
                  result = {
                    hasText: child.nodeType === child.TEXT_NODE &&
                             child.textContent.length > 0 &&
                             !child.textContent.match(/^\s*$/g),
                    hasCompoundAnnotatedText: child.nodeType === child.TEXT_NODE &&
                                              this._isCompoundAnnotatedText(child.textContent),
                    hasTextChild: child.nodeType === child.ELEMENT_NODE &&
                                  child.childElementCount === 0, // including <br>
                    hasCompoundAnnotatedChildNode: child.nodeType === child.ELEMENT_NODE &&
                                                   child.childElementCount === 0 &&
                                                   this._isCompoundAnnotatedText(child.textContent),
                    hasGrandChildren: child.nodeType === child.ELEMENT_NODE &&
                                      Array.prototype.map.call(
                                        child.childNodes,
                                        function (grandChild) {
                                          return grandChild.nodeType !== grandChild.TEXT_NODE;
                                        }
                                      ).reduce(function (prev, current) {
                                        return prev || current;
                                      }, false)
                  };
                }
                return result;
              }.bind(this)).reduce(function (prev, current) { 
                return {
                  hasText: prev.hasText || current.hasText,
                  hasCompoundAnnotatedText: prev.hasCompoundAnnotatedText || current.hasCompoundAnnotatedText,
                  hasTextChild: prev.hasTextChild || current.hasTextChild,
                  hasCompoundAnnotatedChildNode: prev.hasCompoundAnnotatedChildNode || current.hasCompoundAnnotatedChildNode,
                  hasGrandChildren: prev.hasGrandChildren || current.hasGrandChildren
                };
              }, { 
                hasText: false, 
                hasCompoundAnnotatedText: false,
                hasTextChild: false,
                hasCompoundAnnotatedChildNode: false,
                hasGrandChildren: false
              });
            if ((childStatus.hasText || node.hasAttribute('text-id')) &&
                (childStatus.hasTextChild || childStatus.hasCompoundAnnotatedText) && 
                !childStatus.hasGrandChildren &&
                !childStatus.hasCompoundAnnotatedChildNode) {
              // apply i18n-format
              /*
                    <i18n-format>
                      <span>{{text.simpleChartDesc.0}}</span>
                      <code param="1">{{text.simpleChartDesc.1}}</code>
                      <a param="2" href="link">{{text.simpleChartDesc.2}}</a>
                      <a param="3" href="link2">{{text.simpleChartDesc.3}}</a>
                    </i18n-format>
              */
              n = 0;
              messageId = this._generateMessageId(path, id);
              templateTextParams = Array.prototype.map.call(
                node.childNodes, function (child) {
                  var firstChild;
                  if (child.nodeType === child.TEXT_NODE &&
                      this._hasAnnotatedText(child.textContent)) {
                    return this._compoundAnnotationToSpan(child)
                      .map(function (_child) {
                        return {
                          node: _child,
                          templateNode: null,
                          type: _child.nodeType,
                          text: _child.nodeType === _child.TEXT_NODE ? 
                                  _child.textContent : null,
                          childTextNode: _child.nodeType === _child.ELEMENT_NODE &&
                                         _child.childNodes.length > 0
                        };
                      });
                  }
                  else if (child.nodeType === child.ELEMENT_NODE &&
                      child.tagName === 'TEMPLATE') {
                    firstChild =
                      Array.prototype.filter.call(child.content.childNodes, function (templateChild) {
                        switch (templateChild.nodeType) {
                        case templateChild.COMMENT_NODE:
                          return false;
                        case templateChild.TEXT_NODE:
                          return !templateChild.textContent.match(/^\s*$/g);
                        default:
                        case templateChild.ELEMENT_NODE:
                          return true;
                        }
                      }).shift();
                    if (!firstChild) {
                      firstChild =
                        Array.prototype.filter.call(child.content.childNodes, function (templateChild) {
                          switch (templateChild.nodeType) {
                          case templateChild.COMMENT_NODE:
                            return false;
                          default:
                            return true;
                          }
                        }).shift();
                    }
                    if (firstChild) {
                      return [{
                        node: firstChild,
                        templateNode: child,
                        type: firstChild.nodeType,
                        text: null,
                        childTextNode: true
                      }];
                    }
                    else {
                      return [];
                    }
                  }
                  else {
                    return [{
                      node: child,
                      templateNode: null,
                      type: child.nodeType,
                      text: child.nodeType === child.TEXT_NODE ? 
                              child.textContent : null,
                      childTextNode: child.nodeType === child.ELEMENT_NODE &&
                                     child.childNodes.length > 0
                    }];
                  }
                }.bind(this)).reduce(function (prev, currentList) {
                  var current;
                  var textContent;
                  for (var i = 0; i < currentList.length; i++) {
                    current = currentList[i];
                    if (current.text) {
                      prev.text[0] += current.text;
                    }
                    if (current.type === current.node.ELEMENT_NODE) {
                      n++;
                      prev.text[0] += '{' + n + '}';
                      path.push(n);
                      this._traverseAttributes(current.node, path, bundle);
                      path.pop();
                      if (current.childTextNode) {
                        textContent = current.node.textContent;
                        if (textContent.length === 0) {
                          // tag without textContent
                          prev.text.push('<' + current.node.nodeName.toLowerCase() + '>');
                          current.node.textContent = '';
                        }
                        else if (textContent.match(/^\s*$/g)) {
                          // tag with whitespace textContent
                          prev.text.push('<' + current.node.nodeName.toLowerCase() + '>');
                          current.node.textContent = ' ';
                        }
                        else if (textContent.match(/^[\s]*({{.*}}|\[\[.*\]\])[\s]*$/)) {
                          // tag with annotation
                          prev.text.push(textContent);
                          // textContent is untouched
                        }
                        else {
                          prev.text.push(current.node.textContent.replace(/^[\s]*[\s]/, ' ').replace(/[\s][\s]*$/, ' '));
                          current.node.textContent = '{{text.' + messageId + '.' + n + '}}';
                        }
                      }
                      else {
                        prev.text.push('<' + current.node.nodeName.toLowerCase() + '>');
                      }
                      current.node.setAttribute(paramAttribute, n.toString());
                      prev.params.push(current.templateNode || current.node);
                    }
                    else if (current.type === current.node.TEXT_NODE &&
                             current.childTextNode) {
                      // in template node
                      n++;
                      prev.text[0] += '{' + n + '}';
                      textContent = current.node.textContent;
                      if (textContent.length === 0) {
                        // template without textContent
                        prev.text.push('<template>');
                        current.node.textContent = '';
                      }
                      else if (textContent.match(/^\s*$/g)) {
                        // template with whitespace textContent
                        prev.text.push('<template>');
                        current.node.textContent = ' ';
                      }
                      else if (textContent.match(/^[\s]*({{.*}}|\[\[.*\]\])[\s]*$/)) {
                        // tag with annotation
                        prev.text.push(textContent);
                        // textContent is untouched
                      }
                      else {
                        prev.text.push(textContent.replace(/^[\s]*[\s]/, ' ').replace(/[\s][\s]*$/, ' '));
                        current.node.textContent = '{{text.' + messageId + '.' + n + '}}';
                      }
                      span = document.createElement('span');
                      span.setAttribute(paramAttribute, n.toString());
                      current.templateNode.content.removeChild(current.node);
                      span.appendChild(current.node);
                      current.templateNode.content.appendChild(span);
                      prev.params.push(current.templateNode);
                    }
                  }
                  return prev;
                }.bind(this), { text: [ '' ], params: [ '{{text.' + messageId + '.0}}' ] });
              // clear original childNodes before implicit removals by appendChild to i18n-format for ShadyDOM compatibility
              if (ElementMixin) {
                // Avoid ShadyDOM issue for Polymer 2.x (Implicit removal by appendChild to another element introduces inconsistencies)
                node.innerHTML = '';
              }
              templateText = document.createElement('i18n-format');
              templateText.setAttribute('lang', '{{effectiveLang}}');
              if (ElementMixin) {
                // Avoid ShadyDOM issue for Polymer 2.x (Implicit removal by appendChild to another element introduces inconsistencies)
                // insert i18n-format
                dom(node).appendChild(templateText);
              }
              span = document.createElement('span');
              // span.innerText does not set an effective value in Firefox
              span.textContent = templateTextParams.params.shift();
              templateText.appendChild(span);
              Array.prototype.forEach.call(templateTextParams.params,
                function (param) {
                  templateText.appendChild(param);
                }
              );
              if (!ElementMixin) {
                // Avoid ShadyDOM issue for Polymer 1.x (Clearance of innerHTML unexpectedly removes textContent of child nodes)
                // insert i18n-format
                node.innerHTML = '';
                dom(node).appendChild(templateText);
              }
              // store the text message
              templateTextParams.text[0] = templateTextParams.text[0].replace(/^[\s]*[\s]/, ' ').replace(/[\s][\s]*$/, ' ');
              this._setBundleValue(bundle, messageId, templateTextParams.text);
              if (!id) {
                //node.id = messageId;
                //console.warn('add missing node id as ' + messageId + ' for ' + templateTextParams.text[0]);
              }
              debuglog(messageId + ' = ' + templateTextParams.text);
            }
            else {
              // traverse childNodes
              for (i = 0; i < node.childNodes.length; i++) {
                //console.log(path.join(':') + ':' + node.childNodes[i].nodeName + ':' + (i - whiteSpaceElements) + ' i = ' + i + ' whiteSpaceElements = ' + whiteSpaceElements);
                if (this._traverseTemplateTree(node.childNodes[i], path, bundle, i - whiteSpaceElements)) {
                  whiteSpaceElements++;
                }
              }
            }
          }
          break;
        }
        break;
      case node.TEXT_NODE:
        // text node
        text = node.textContent;
        if (text.length === 0 || text.match(/^\s*$/g)) {
          // skip empty or whitespace node
          isWhiteSpace = true;
        }
        else if (text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)) {
          // skip annotation node
        }
        else {
          var parent = node.parentNode;

          if (this._isCompoundAnnotatedText(text)) {
            // apply i18n-format
            n = 0;
            messageId = this._generateMessageId(path, id);
            templateTextParams = Array.prototype.map.call(
              [ node ], function (child) {
                return this._compoundAnnotationToSpan(child)
                  .map(function (_child) {
                    return {
                      node: _child,
                      type: _child.nodeType,
                      text: _child.nodeType === _child.TEXT_NODE ? 
                              _child.textContent : null,
                      childTextNode: _child.nodeType === _child.ELEMENT_NODE &&
                                     _child.childNodes.length > 0
                    };
                  });
              }.bind(this)).reduce(function (prev, currentList) {
                var current;
                for (var i = 0; i < currentList.length; i++) {
                  current = currentList[i];
                  if (current.text) {
                    prev.text[0] += current.text;
                  }
                  if (current.type === current.node.ELEMENT_NODE) {
                    n++;
                    prev.text[0] += '{' + n + '}';
                    path.push(n);
                    this._traverseAttributes(current.node, path, bundle);
                    path.pop();
                    /* current.childTextNode is always true since current.node is <span>{{annotation}}</span> */
                    prev.text.push(current.node.textContent);
                    current.node.setAttribute(paramAttribute, n.toString());
                    prev.params.push(current.node);
                  }
                }
                return prev;
              }.bind(this), { text: [ '' ], params: [ '{{text.' + messageId + '.0}}' ] });
            templateText = document.createElement('i18n-format');
            templateText.setAttribute('lang', '{{effectiveLang}}');
            // insert i18n-format
            dom(parent).insertBefore(templateText, node);
            dom(parent).removeChild(node);
            span = document.createElement('span');
            // span.innerText does not set an effective value in Firefox
            span.textContent = templateTextParams.params.shift();
            templateText.appendChild(span);
            Array.prototype.forEach.call(templateTextParams.params,
              function (param) {
                templateText.appendChild(param);
              }
            );
            // store the text message
            templateTextParams.text[0] = templateTextParams.text[0].replace(/^[\s]*[\s]/, ' ').replace(/[\s][\s]*$/, ' ');
            this._setBundleValue(bundle, messageId, templateTextParams.text);
            debuglog(messageId + ' = ' + templateTextParams.text);
          }
          else {
            // generate message id
            messageId = this._generateMessageId(path, id);
            // store the text message
            text = text.replace(/^[\s]*[\s]/, ' ').replace(/[\s][\s]*$/, ' ');
            this._setBundleValue(bundle, messageId, text);
            // replace textContent with annotation
            node.textContent = '{{text.' + messageId + '}}';
            if (!id) {
              //span.id = messageId;
              //console.warn('add missing span with id as ' + messageId + ' for ' + text);
            }
            debuglog(messageId + ' = ' + text);
          }
        }
        break;
      case node.DOCUMENT_NODE:
      case node.DOCUMENT_FRAGMENT_NODE:
        // traverse childNodes
        for (i = 0; i < node.childNodes.length; i++) {
          //console.log(path.join(':') + ':' + node.childNodes[i].nodeName + ':' + (i - whiteSpaceElements) + ' i = ' + i + ' whiteSpaceElements = ' + whiteSpaceElements);
          if (this._traverseTemplateTree(node.childNodes[i], path, bundle, i - whiteSpaceElements)) {
            whiteSpaceElements++;
          }
        }
        break;
      default:
        isWhiteSpace = true;
        // comment node, etc.
        break;
      }
      path.pop();
      return isWhiteSpace;
    },

    /**
     * Check if the text has compound annotation 
     * 
     * @param {string} text target text to check compound annotation
     * @return {Boolean} true if the text contains compound annotation
     */
    _isCompoundAnnotatedText: function (text) {
      return !text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/) &&
             !!text.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/);
    },

    /**
     * Check if the text has annotation 
     * 
     * @param {string} text target text to check annotation
     * @return {Boolean} true if the text contains annotation
     */
    _hasAnnotatedText: function (text) {
      return !!text.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/);
    },

    /**
     * Convert compound annotations to span elements
     * 
     * @param {Text} node target text node to convert compound annotations
     * @return {Object[]} Array of Text or span elements
     */
    _compoundAnnotationToSpan: function (node) {
      var result;
      /* istanbul ignore else: node is prechecked to contain annotation(s) */
      if (node.textContent.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/)) {
        result = node.textContent
          .match(/({{[^{}]*}}|\[\[[^\[\]]*\]\]|[^{}\[\]]{1,}|[{}\[\]]{1,})/g)
          .reduce(function (prev, current) {
            if (current.match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)) {
              prev.push(current);
              prev.push('');
            }
            else {
              if (prev.length === 0) {
                prev.push(current);
              }
              else {
                prev[prev.length - 1] += current;
              }
            }
            return prev;
          }.bind(this), [])
          .map(function (item) {
            var childNode;
            if (item.match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)) {
              childNode = document.createElement('span');
              childNode.textContent = item;
            }
            else if (item) {
              childNode = document.createTextNode(item);
            }
            else {
              childNode = null;
            }
            return childNode;
          });
        if (result.length > 0) {
          if (!result[result.length - 1]) {
            result.pop(); // pop null node for ''
          }
        }
      }
      else {
        // no compound annotation
        result = [ node ];
      }
      return result;
    },

    /**
     * Add the value to the target default bundle with the specified message Id 
     * 
     * @param {Object} bundle Default bundle.
     * @param {string} messageId ID string of the value.
     * @param {Object} value Value of the text message. Normally a string.
     */
    _setBundleValue: function (bundle, messageId, value) {
      var messageIdPath = messageId.split('.');
      bundle.model = bundle.model || {};
      if (messageIdPath.length === 1) {
        bundle[messageId] = value;
      }
      else {
        var cursor = bundle;
        for (var i = 0; i < messageIdPath.length; i++) {
          if (i < messageIdPath.length - 1) {
            cursor[messageIdPath[i]] = cursor[messageIdPath[i]] || {};
            cursor = cursor[messageIdPath[i]];
          }
          else {
            cursor[messageIdPath[i]] = value;
          }
        }
      }
    },

    /**
     * Generate a message ID from the specified path and id.
     * 
     * ### TODO: 
     *
     * - Shorten or optimize ids
     *
     * @param {Array} path List of ascestor elements of the current node in traversal.
     * @param {id} id Value of `id` or `text-id` attribute of the current node.
     */
    _generateMessageId: function (path, id) {
      var messageId;
      if (!id || id.length === 0) {
        for (var i = 1; i < path.length; i++) {
          if (path[i][0] === '#') {
            if (path[i] !== '#document-fragment') {
              if (messageId && path[i].substr(0, 5) === '#text') {
                messageId += ':' + path[i].substr(1);
              }
              else {
                messageId = path[i].substr(1);
              }
            }
          }
          else {
            if (messageId) {
              messageId += ':' + path[i];
            }
            else {
              messageId = path[i];
            }
          }
        }
      }
      else {
        messageId = id;
      }
      return messageId;
    },

    /**
     * Merge `this.defaultText` into the target default bundle.
     * 
     * ### TODO: 
     *
     * - Need more research on the effective usage of this feature.
     *
     * @param {Object} bundle Default bundle.
     */
    /*
    _mergeDefaultText: function (bundle) {
      if (this.defaultText) {
        this._deepMap(bundle, this.defaultText, function (text) { return text; });
      }
    },
    */

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
    },

    // Lifecycle callbacks

    /**
     * Lifecycle callback before registration of the custom element.
     *
     * The default bundle is constructed via traversal of the element's template at this timing per registration.
     *
     * ### Notes: 
     *
     * - For `i18n-dom-bind` elements, bundle construction is put off until `ready` lifecycle callback.
     * - As called twice per custom element registration, the method skips bundle construction at the second call.
     */
    beforeRegister: function () {
      if (ElementMixin) {
        return;
      }
      if (this.is !== 'i18n-dom-bind') {
        if (!this._templateLocalizable) {
          this._templateLocalizable = this._constructDefaultBundle();
        }
      }
    },


    /**
     * Lifecycle callback at registration of the custom element.
     *
     * this._fetchStatus is initialized per registration.
     */
    registered: function () {
      if (this.is !== 'i18n-dom-bind') {
        var template = this._template || DomModule.import(this.is, 'template');
        if (!template) {
          var id = this.is;
          var current = (!window.HTMLImports || HTMLImports.useNative) ? document.currentScript
                                              : (document._currentScript || document.currentScript);
          template = (current ? current.ownerDocument
                      .querySelector('template[id=' + id + ']') : null) ||
                     document.querySelector('template[id=' + id + ']');
          if (!template) {
            template = document.createElement('template');
            template.setAttribute('id', id);
          }
          if (template) {
            var domModule = document.createElement('dom-module');
            var _noTemplateDomModule = DomModule.import(this.is);
            var assetpath = _noTemplateDomModule
              ? _noTemplateDomModule.assetpath
              : new URL((current ? current.baseURI : null) ||
                (window.currentImport ? window.currentImport.baseURI : null) ||
                (current && current.ownerDocument ? current.ownerDocument.baseURI : null) ||
                document.baseURI).pathname;
            domModule.appendChild(template);
            domModule.setAttribute('assetpath', 
                                    template.hasAttribute('basepath') ?
                                      template.getAttribute('basepath') :
                                      template.hasAttribute('assetpath') ? 
                                        template.getAttribute('assetpath') : 
                                        assetpath);
            domModule.register(id);
            this._template = template;
          }
          var bundle = { model: {} };
          bundles[''][id] = bundle;
          bundles[defaultLang] = bundles[defaultLang] || {};
          bundles[defaultLang][id] = bundle;
          console.warn('I18nBehavior.registered: ' + id + ' has no template. Supplying an empty template');
        }
        this._fetchStatus = deepcopy({ // per custom element
          fetchingInstance: null,
          ajax: null,
          ajaxLang: null,
          lastLang: null,
          fallbackLanguageList: null,
          targetLang: null,
          lastResponse: {},
          rawResponses: {}
        });
      }
    },

    /**
     * Lifecycle callback on instance creation
     */
    created: function () {
      // Fix #34. [Polymer 1.4.0] _propertyEffects have to be maintained per instance
      if (this.is === 'i18n-dom-bind') {
        this._propertyEffects = deepcopy(this._propertyEffects);
      }
      else {
        var template = DomModule.import(this.is, 'template');
        if (template && template.hasAttribute('lang')) {
          this.templateDefaultLang = template.getAttribute('lang') || '';
        }
        if (!this._fetchStatus) {
          this._fetchStatus = deepcopy({ // per custom element
            fetchingInstance: null,
            ajax: null,
            ajaxLang: null,
            lastLang: null,
            fallbackLanguageList: null,
            targetLang: null,
            lastResponse: {},
            rawResponses: {}
          });
        }
      }
      if (!isStandardPropertyConfigurable) {
        // Fix #36. Emulate lang's observer since Safari 7 predefines non-configurable lang property
        this.observer = new MutationObserver(this._handleLangAttributeChange.bind(this));
        this.observer.observe(this, {
          attributes: true,
          attributeFilter: [ 'lang' ],
          attributeOldValue: true
        });
      }
    },

    /**
     * Lifecycle callback when the template children are ready.
     */
    ready: function () {
      if (this.is === 'i18n-dom-bind') {
        if (!this._templateLocalizable) {
          this._templateLocalizable = this._constructDefaultBundle();
        }
        if (!this._fetchStatus) {
          this._fetchStatus = deepcopy({ // per instance
            fetchingInstance: null,
            ajax: null,
            ajaxLang: null,
            lastLang: null,
            fallbackLanguageList: null,
            targetLang: null, 
            lastResponse: {},
            rawResponses: {}
          });
        }
        this._onDomChangeBindThis = this._onDomChange.bind(this);
        this.addEventListener('dom-change', this._onDomChangeBindThis);
        // Fix #34. [Polymer 1.4.0] Supply an empty object if this.__data__ is undefined
        this.__data__ = this.__data__ || Object.create(null);
      }
      else {
        if (!isStandardPropertyConfigurable) {
          // Fix #36. Patch missing properties except for lang
          for (var p in this._propertyEffects) {
            if (this._propertyEffects[p] &&
                !Object.getOwnPropertyDescriptor(this, p)) {
              //console.log('ready: creating accessors for ' + p);
              Polymer.Bind._createAccessors(this, p, this._propertyEffects[p]);
            }
          }
        }
        if (ElementMixin && !this.__data) {
          this._initializeProperties();
        }
        this._langChanged(this.getAttribute('lang'), undefined);
        // model per instance
        if (this.text) {
          this.model = deepcopy(this.text.model);
        }
      }
    },

    /**
     * attached lifecycle callback.
     */
    attached: function () {
      if (this.is === 'i18n-dom-bind') {
        if (this._properties) {
          // Fix #35. [IE10] Restore properties for use in rendering
          this.properties = this._properties;
          delete this._properties;
        }
      }
      if (this.observeHtmlLang) {
        this.lang = html.lang;
        // TODO: this call is redundant
        this._observeHtmlLangChanged(true);
      }
    },

    /**
     * Handle `dom-change` event for `i18n-dom-bind`
     */
    _onDomChange: function () {
      // Fix #16: [IE11][Polymer 1.3.0] On IE11, i18n-dom-bind does not work with Polymer 1.3.0
      // Patch the broken lang property accessors manually if it is missing
      // Fix #34: [IE11][Polymer 1.4.0] Create missing property accessors including lang
      for (var p in this._propertyEffects) {
        if (this._propertyEffects[p] &&
            !Object.getOwnPropertyDescriptor(this, p)) {
          Polymer.Bind._createAccessors(this, p, this._propertyEffects[p]);
        }
      }
      this.removeEventListener('dom-change', this._onDomChangeBindThis);
      if (this.text && this.text.model) {
        this.model = deepcopy(this.text.model);
      }
      // Fix #17: [Polymer 1.3.0] observeHtmlLang is undefined in i18n-dom-bind
      // Explicitly initialize observeHtmlLang if the value is undefined.
      if (typeof this.observeHtmlLang === 'undefined' &&
          !this.hasAttribute('observe-html-lang')) {
        this.observeHtmlLang = true;
      }
      if (this.observeHtmlLang) {
        this.lang = html.lang;
        this._observeHtmlLangChanged(true);
      }
    },

    /**
     * detached lifecycle callback
     */
    detached: function () {
      if (this.observeHtmlLang) {
        this._observeHtmlLangChanged(false);
      }
    }
  };

  // Fix #36. Rename lang property as _lang to avoid conflict with the predefined lang property
  if (!isStandardPropertyConfigurable) {
    var _properties = Object.create(null);
    for (var p in BehaviorsStore.I18nBehavior.properties) {
      if (p === 'lang') {
        _properties._lang = BehaviorsStore.I18nBehavior.properties.lang;
      }
      else {
        _properties[p] = BehaviorsStore.I18nBehavior.properties[p];
      }
    }
    BehaviorsStore.I18nBehavior.properties = _properties;
    BehaviorsStore.I18nBehavior.properties._lang.reflectToAttribute = false;
    BehaviorsStore.I18nBehavior.properties.text.computed = '_getBundle(_lang)';
    BehaviorsStore.I18nBehavior._updateEffectiveLang = function (event) {
      if ((!ElementMixin && dom(event).rootTarget === this) ||
          (ElementMixin && event.composedPath()[0] === this)) {
        //console.log('lang-updated: _updateEffectiveLang: assigning effectiveLang = ' + this._lang);
        this.effectiveLang = this._lang;
      }
    };
    BehaviorsStore.I18nBehavior.hostAttributes = {
      'lang': defaultLang
    };
  }

  if (ElementMixin) {
    // Polymer 2.x
    BehaviorsStore._I18nBehavior = BehaviorsStore.I18nBehavior;
    BehaviorsStore.I18nBehavior = [ BehaviorsStore._I18nBehavior ];
    if (!document.currentScript) {
      // Polymer 3.x
      BehaviorsStore.I18nBehavior.push({
        get _template() { 
          if (this.__template) {
            return this.__template;
          }
          if (this instanceof HTMLElement &&
            (this.constructor.name || /* name is undefined in IE11 */ this.constructor.toString().replace(/^function ([^ \(]*)((.*|[\n]*)*)$/, '$1')) === 'PolymerGenerated' &&
            !this.constructor.__finalizeClass) {
            this.constructor.__finalizeClass = this.constructor._finalizeClass;
            let This = this;
            this.constructor._finalizeClass = function _finalizeClass() {
              let info = this.generatedFrom;
              if (!this._templateLocalizable) {
                let template = DomModule.import(info.is, 'template');
                if (info._template) {
                  if (!template) {
                    let m = document.createElement('dom-module');
                    m.appendChild(info._template);
                    m.register(info.is);
                  }
                  this._templateLocalizable = BehaviorsStore._I18nBehavior._constructDefaultBundle(This.__template = info._template, info.is);
                }
                else {
                  if (template) {
                    this._templateLocalizable = BehaviorsStore._I18nBehavior._constructDefaultBundle(This.__template = template, info.is);
                  }
                }
              }
              if (!this.hasOwnProperty('importPath')) {
                Object.defineProperty(this, 'importPath', { value: info.importPath });
              }
              return this.__finalizeClass();
            }
          }
          return this.__template;
        },
        set _template(value) {
          this.__template = value;
        }
      });
      if (!(function F() {}).name) {
        // IE11
        // Note: In IE11, changes in this.text object do not propagate automatically and require MutableDataBehavior to propagate
        BehaviorsStore.I18nBehavior.push(MutableDataBehavior);
      }
    }
    Object.defineProperty(BehaviorsStore.I18nBehavior, '0', {
      get: function() {
        var current = (!window.HTMLImports || HTMLImports.hasNative || HTMLImports.useNative) ? document.currentScript : (document._currentScript || document.currentScript);
        var ownerDocument = document;//current.ownerDocument;
        if (ownerDocument.nodeType === ownerDocument.DOCUMENT_NODE) {
          // HTML Imports are flatten in the root document and not under document fragment nodes
          // Fix #62: Emulate a subset of "non-HTMLImports-link-traversing" querySelectorAll for latest Firefox 51
          // since currentScript.ownerDocument, HTML Imports polyfill, and querySelectorAll behave differently
          var _tmpNode = current;
          // check for DOCUMENT_FRAGMENT_NODE for fail safe
          while (_tmpNode && _tmpNode.tagName !== 'LINK' &&
            _tmpNode.nodeType !== _tmpNode.DOCUMENT_FRAGMENT_NODE &&
            _tmpNode.nodeType !== _tmpNode.DOCUMENT_NODE) {
            _tmpNode = _tmpNode.parentNode;
          }
          if (_tmpNode &&
            (_tmpNode.nodeType === _tmpNode.DOCUMENT_FRAGMENT_NODE ||
             _tmpNode.nodeType === _tmpNode.DOCUMENT_NODE)) {
            ownerDocument = _tmpNode; // reach the containing document fragment
          }
          else if (_tmpNode && _tmpNode.import === _tmpNode) { // html-imports polyfill v1
            ownerDocument = _tmpNode.children; // reach the immediate import link containing the currentScript
            ownerDocument.querySelectorAll = function (selector) {
              var match = selector.match(/^([a-zA-Z0-9-]{1,})(:not\(\[(processed)\]\))?(\[(legacy)\])?$/);
              var list = [];
              var node;
              var tagName;
              var i;
              for (i = 0; i < this.length; i++) {
                node = this[i];
                tagName = node.tagName.toLowerCase();
                switch (tagName) {
                case 'link':
                  break;
                case match[1]:
                  if (match[2]) {
                    if (!node.hasAttribute(match[3])) {
                      list.push(node);
                    }
                  }
                  else if (match[4]) {
                    if (node.hasAttribute(match[5])) {
                      list.push(node);
                    }
                  }
                  else {
                    list.push(node);
                  }
                  break;
                default:
                  Array.prototype.forEach.call(node.querySelectorAll(selector), function (child) { list.push(child); });
                  break;
                }
              }
              return list;
            }
          }
        }
        var i18nAttrRepos = ownerDocument.querySelectorAll('i18n-attr-repo:not([processed])');
        var domModules = ownerDocument.querySelectorAll('dom-module[legacy]');
        if (domModules.length === 0) {
          domModules = ownerDocument.querySelectorAll('dom-module');
          if (domModules.length !== 1) {
            domModules = [];
          }
        }
        BehaviorsStore._I18nAttrRepo._created();
        Array.prototype.forEach.call(i18nAttrRepos, function (repo) {
          if (!repo.hasAttribute('processed')) {
            var customAttributes = repo.querySelector('template#custom');
            if (customAttributes) {
              BehaviorsStore._I18nAttrRepo._traverseTemplateTree(customAttributes.content || customAttributes._content);
            }
            repo.setAttribute('processed', '');
          }
        });
        Array.prototype.forEach.call(domModules, function (domModule) {
          if (domModule && domModule.id) {
            var template = domModule.querySelector('template');
            if (template) {
              BehaviorsStore._I18nBehavior._constructDefaultBundle(template, domModule.id);
              domModule.removeAttribute('legacy');
            }
          }
        });
        return BehaviorsStore._I18nBehavior;
      }
    });
  }
  else {
    // Polymer 1.x
  /**
   * `<template is="i18n-dom-bind">` element extends `dom-bind` template element with `I18nBehavior`
   *
   * @group I18nBehavior
   * @element i18n-dom-bind
   */
  var i18nBehaviorDomBind = {};
  Base.extend(i18nBehaviorDomBind, BehaviorsStore.I18nBehavior);
  var i18nDomBind = {};
  var domBind = document.createElement('template', 'dom-bind');
  var domBindProto = Object.getPrototypeOf(domBind);
  if (typeof domBindProto.render !== 'function') {
    domBindProto = domBind.__proto__; // fallback for IE10
  }
  Base.extend(i18nDomBind, domBindProto);
  i18nDomBind.is = 'i18n-dom-bind';
  if (!navigator.language && navigator.browserLanguage) { // Detect IE10
    // Fix #35. [IE10] Hide properties until attached phase in IE10
    // to avoid exceptions in overriding unconfigurable properties in Object.defineProperty
    i18nBehaviorDomBind._properties = i18nBehaviorDomBind.properties;
    i18nBehaviorDomBind.properties = Object.create(null);
  }
  /* As of Polymer 1.3.1, dom-bind does not have predefined behaviors */
  /* istanbul ignore if */
  if (i18nDomBind.behaviors) {
    i18nDomBind.behaviors.push(i18nBehaviorDomBind);
  }
  else {
    i18nDomBind.behaviors = [ i18nBehaviorDomBind ];
  }
  var _Polymer = Polymer$0;
  _Polymer(i18nDomBind);
  }
})(document);
