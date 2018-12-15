/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import '@polymer/iron-input/iron-input.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
Polymer({
  importMeta: import.meta,

  _template: html`
    <span id="status">{{tr(status,text.statusMessages)}}</span>

    <span id="default">{{or(value,text.defaultValue)}}</span>

    <i18n-format id="annotated-format">
      <span>{{tr(status,text.statusMessageFormats)}}</span>
      <span>{{parameter}}</span>
      <span>string parameter</span>
    </i18n-format>

    <input is="iron-input" id="aria-attributes" title="tooltip text" aria-label="aria label text" aria-valuetext="aria value text" bind-value="{{value}}">

    <span>{{tr('key',text.nodefault)}}</span>
    <span>{{text.defaultValue}} {{text.defaultValue}}</span>

    <template>
      <json-data text-id="statusMessages">{
        "ok": "healthy status",
        "busy": "busy status",
        "error": "error status",
        "default": "unknown status"
      }</json-data>
      <span text-id="defaultValue">default value</span>
      <json-data text-id="statusMessageFormats">{
        "ok": "healthy status",
        "busy": "busy status with {2}",
        "error": "error status with {1} and {2}",
        "default": "unknown status"
      }</json-data>
      <json-data text-id="nodefault">{
        "ok": "ok status"
      }</json-data>
    </template>
`,

  is: 'advanced-binding-element',

  behaviors: [
    BehaviorsStore.I18nBehavior
  ],

  properties: {
    status: {
      type: String,
      value: 'ok'
    },
    value: {
      type: String
    },
    parameter: {
      type: String
    }
  },

  observers: [
  ],

  listeners: {
    'lang-updated': '_langUpdated'
  },

  ready: function () {
    //this.observeHtmlLang = false;
  },

  attached: function () {
    //console.log('advanced-binding-element: attached');
    this._isAttached = true;
    if (this._langReady) {
      //console.log('advanced-binding-element: local-dom-ready');
      this.fire('local-dom-ready');
    }
  },

  detached: function () {
    //console.log('advanced-binding-element: detached');
    this._isAttached = false;
  },

  _langUpdated: function (e) {
    //console.log('advanced-binding-element: lang-updated lang = ' + this.lang +
    //            ' effectiveLang = ' + this.effectiveLang +
    //            ' attached = ' + this._isAttached);
    if (dom(e).rootTarget === this &&
        this.effectiveLang === this.lang) {
      this.model = deepcopy(this.text.model);
      if (this._isAttached) {
        //console.log('advanced-binding-element: local-dom-ready');
        this.fire('local-dom-ready');
      }
      else {
        this._langReady = true;
      }
    }
  }
});
