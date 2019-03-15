/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2019, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import { I18nControllerCoreMixin, I18nControllerBehavior, html, defaultLang, attributesRepository, bundles, paramAttribute, debuglog } from './i18n-controller-core.js';
import deepcopy from 'deepcopy/dist/deepcopy.js';

export { I18nControllerBehavior, html, defaultLang, attributesRepository, bundles };

/**
 * I18nControllerMixin: Polymer-independent parts of `BehaviorsStore.I18nBehavior`
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
export const I18nControllerMixin = Object.assign({
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
      template = _template;
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
        attributesRepository._created();
        attributesRepository.registerLocalizableAttributes(id, template);
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
    var id = node.getAttribute ? (node.getAttribute('text-id') || node.getAttribute('id')) : null;
    var text;
    var messageId;
    var attrId;
    var isLocalizable;
    var dummy;
    var renamedAttributes = [];
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
        if (!(isLocalizable = attributesRepository.isLocalizableAttribute(node, attribute.name))) {
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
              renamedAttributes.push(attribute.name);
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
              renamedAttributes.push(attribute.name);
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
            renamedAttributes.push(attribute.name);
          }
          else {
            attribute.value = '{{' + attrId + '}}';
          }
        }
        break;
      }
    }, this);
    renamedAttributes.forEach(name => node.removeAttribute(name));
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
    var id = node.getAttribute ? (node.getAttribute('text-id') || node.getAttribute('id')) : null;
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
            node.innerHTML = '';
            templateText = document.createElement('i18n-format');
            templateText.setAttribute('lang', '{{effectiveLang}}');
            // insert i18n-format
            node.appendChild(templateText);
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
          parent.insertBefore(templateText, node);
          parent.removeChild(node);
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
}, I18nControllerCoreMixin);
