/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '@polymer/polymer/polymer-legacy.js';
import { DomModule } from '@polymer/polymer/lib/elements/dom-module.js';
import { MutableDataBehavior } from '@polymer/polymer/lib/legacy/mutable-data-behavior.js';
import { I18nControllerMixin, I18nControllerBehavior, html, defaultLang, attributesRepository, bundles } from './i18n-controller.js';
import deepcopy from 'deepcopy/dist/deepcopy.js';

/**
 * @namespace BehaviorsStore
 */
export const BehaviorsStore = window.BehaviorsStore || {};
window.BehaviorsStore = BehaviorsStore;

// Re-export attributesRepository
export { attributesRepository };
BehaviorsStore._I18nAttrRepo = attributesRepository;

/**
 * Apply `BehaviorsStore.I18nControllerBehavior` to manipulate internal variables for I18N
 *
 * Note: This behavior is not for normal custom elements to apply I18N. UI is not expected.
 *
 * @polymerBehavior I18nControllerBehavior
 * @memberof BehaviorsStore
 */
export { I18nControllerBehavior };
BehaviorsStore.I18nControllerBehavior = I18nControllerBehavior;
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
 * @polymerBehavior I18nBehavior
 * @memberof BehaviorsStore
 */
let I18nBehavior = Object.assign({

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
  hostAttributes: {
    'lang': defaultLang
  },

  properties: {
    /**
     * Mirrored property for this.lang
     */
    _lang: {
      type: String,
      value: defaultLang,
      reflectToAttribute: false,
      observer: '_langChanged'
    },

    /**
     * Text message bundle object for the current locale.
     * The object is shared among all the instances of the same element.
     * The value is updated when `lang-updated` event is fired.
     */
    text: {
      type: Object,
      computed: '_getBundle(_lang)'
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
   * Called on `lang-updated` events and update `this.effectiveLang` with the value of `this.lang`.
   */
  _updateEffectiveLang: function (event) {
    if (event.composedPath()[0] === this) {
      //console.log('lang-updated: _updateEffectiveLang: assigning effectiveLang = ' + this._lang);
      this.effectiveLang = this._lang;
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

  // Lifecycle callbacks

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
        template = document.querySelector('template[id=' + id + ']');
        if (!template) {
          template = document.createElement('template');
          template.setAttribute('id', id);
        }
        if (template) {
          var domModule = document.createElement('dom-module');
          var _noTemplateDomModule = DomModule.import(this.is);
          var assetpath = _noTemplateDomModule
            ? _noTemplateDomModule.assetpath
            : new URL(document.baseURI).pathname;
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
    }
    // Fix #36. Emulate lang's observer since Safari 7 predefines non-configurable lang property
    this.observer = new MutationObserver(this._handleLangAttributeChange.bind(this));
    this.observer.observe(this, {
      attributes: true,
      attributeFilter: [ 'lang' ],
      attributeOldValue: true
    });
  },

  /**
   * Lifecycle callback when the template children are ready.
   */
  ready: function () {
    if (this.is === 'i18n-dom-bind') {
      this._onDomChangeBindThis = this._onDomChange.bind(this);
      this.addEventListener('dom-change', this._onDomChangeBindThis);
    }
    else {
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
    this.removeEventListener('dom-change', this._onDomChangeBindThis);
    if (this.text && this.text.model) {
      this.model = deepcopy(this.text.model);
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
}, I18nControllerMixin);

export const _I18nBehavior = BehaviorsStore._I18nBehavior = I18nBehavior;
BehaviorsStore.I18nBehavior = [ BehaviorsStore._I18nBehavior ];
BehaviorsStore.I18nBehavior.push({
  beforeRegister: function () {
    let info = this.constructor.generatedFrom;
    let This = this;
    if (!this.constructor._templateLocalizable) {
      let template = DomModule.import(info.is, 'template');
      if (info._template) {
        if (!template) {
          let m = document.createElement('dom-module');
          m.appendChild(info._template);
          m.register(info.is);
        }
        this.constructor._templateLocalizable = this._constructDefaultBundle(This.__template = info._template, info.is);
      }
      else {
        if (template) {
          this.constructor._templateLocalizable = this._constructDefaultBundle(This.__template = template, info.is);
        }
      }
    }
  },
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
            this._templateLocalizable = this.prototype._constructDefaultBundle(This.__template = info._template, info.is);
          }
          else {
            if (template) {
              this._templateLocalizable = this.prototype._constructDefaultBundle(This.__template = template, info.is);
            }
          }
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
Object.defineProperty(BehaviorsStore.I18nBehavior, '0', {
  get: function() {
    var ownerDocument = document;
    var i18nAttrRepos = ownerDocument.querySelectorAll('i18n-attr-repo:not([processed])');
    var domModules = ownerDocument.querySelectorAll('dom-module[legacy]');
    if (domModules.length === 0) {
      domModules = ownerDocument.querySelectorAll('dom-module');
      if (domModules.length !== 1) {
        domModules = [];
      }
    }
    attributesRepository._created();
    Array.prototype.forEach.call(i18nAttrRepos, function (repo) {
      if (!repo.hasAttribute('processed')) {
        var customAttributes = repo.querySelector('template#custom');
        if (customAttributes) {
          attributesRepository._traverseTemplateTree(customAttributes.content || customAttributes._content);
        }
        repo.setAttribute('processed', '');
      }
    });
    Array.prototype.forEach.call(domModules, function (domModule) {
      if (domModule && domModule.id) {
        var template = domModule.querySelector('template');
        if (template) {
          var _class = customElements.get(domModule.id);
          var classPrototype = _class ? _class.prototype : Object.create(BehaviorsStore._I18nBehavior);
          if (typeof classPrototype._constructDefaultBundle === 'function') {
            classPrototype._constructDefaultBundle(template, domModule.id);
          }
          domModule.removeAttribute('legacy');
        }
      }
    });
    return BehaviorsStore._I18nBehavior;
  }
});
I18nBehavior = BehaviorsStore.I18nBehavior;
export { I18nBehavior };
