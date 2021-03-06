/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
/* <link rel="import" href="../../../../paper-input/paper-input.html"> */
/* <link rel="import" href="../../../../google-chart/google-chart.html"> */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '../../../i18n-behavior.js';

import './text-attribute-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="simple-attribute-element">
    <style attr="This is not extracted">
    google-chart {
      width: 300px;
    }
    </style>
    <div id="outer-div">
      <div id="ordinary-div" attr="This is not targeted for extraction">text 1</div>

      <input id="standard-input" placeholder="standard HTML5 attribute">
      <input placeholder="standard HTML5 attribute without id">

      <paper-input id="paper-input-element" label="paper-input label" error-message="paper-input error message" placeholder="paper-input placeholder" value="this is not a target">
      </paper-input>

      <paper-input label="paper-input label without id" error-message="paper-input error message without id" placeholder="paper-input placeholder without id" value="this is not a target">
      </paper-input>

      <google-chart type="pie" id="pie-chart" options="{&quot;title&quot;: &quot;Distribution of days in 2001H1&quot;}" cols="[ {&quot;label&quot;: &quot;Month&quot;, &quot;type&quot;: &quot;string&quot;},{&quot;label&quot;: &quot;Days&quot;, &quot;type&quot;: &quot;number&quot;} ]" rows="[ [&quot;Jan&quot;, 31],[&quot;Feb&quot;, 28],[&quot;Mar&quot;, 31],[&quot;Apr&quot;, 30],[&quot;May&quot;, 31],[&quot;Jun&quot;, 30] ]">
      </google-chart>

      <google-chart id="column-chart" type="column" options="{&quot;title&quot;: &quot;Inventory&quot;}" data="[ [&quot;Year&quot;, &quot;Things&quot;, &quot;Stuff&quot;],
                [&quot;2004&quot;, 1000, 400],
                [&quot;2005&quot;, 1170, 460],
                [&quot;2006&quot;, 660, 1120],
                [&quot;2007&quot;, 1030, 540] ]">
      </google-chart>

      <text-attribute-element id="custom-attr" custom-text-attr1="custom text attribute 1" custom-text-attr2="custom text attribute 2" custom-text-attr3="custom text attribute 3" out-of-scope-attr="out of scope attr">
      </text-attribute-element>

      <text-attribute-element id="selective-attr" boolean-attr="" empty-attr="" string-attr="abc" custom-text-attr4="{{text.ordinary-div}} custom-text-attr4 attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]] {{text.ordinary-div}}" custom-text-attr5\$="[[text.ordinary-div]] custom-text-attr5 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]" i18n-target="i18n-target attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]]" i18n-target2="i18n-target2 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]">
      </text-attribute-element>
      <text-attribute-element id="selective-attr2" boolean-attr="" boolean-attr2="" string-attr="aaa" i18n-target="i18n-target attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr3" i18n-target6="i18n-target6 attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr4" boolean-attr="" i18n-target6="i18n-target6 attribute 3" i18n-target7="unmatching i18n-target4 attribute">
      </text-attribute-element>
      <text-attribute-element id="selective-attr5" string-attr="xxx" i18n-target7="unmatching i18n-target7 attribute">
      </text-attribute-element>

      <span id="test-json-data-1">{{model.json-data-id.attr1}}</span>
      <span id="test-json-data-2">{{model.json-data-id.i18n-target-attr}}</span>
      <span id="test-json-data-3">{{model.template_2:json-data_1.attr1}}</span>
      <span id="test-json-data-4">{{model.template_2:json-data_1.i18n-target-attr}}</span>

    </div>
    <template>
      <json-data id="json-data-id" attr1="this attr1 is extracted" i18n-target-attr="this attribute is also extracted"></json-data>
      <json-data attr1="this attr1 without id is extracted" i18n-target-attr="this attribute without id is also extracted"></json-data>
    </template>
  </template>`;

document.head.appendChild($_documentContainer.content);
switch (syntax) {
default:
case 'mixin':
  {
    class SimpleAttributeElement extends Mixins.Localizable(Polymer.LegacyElement) {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <style attr="This is not extracted">
    google-chart {
      width: 300px;
    }
    </style>
    <div id="outer-div">
      <div id="ordinary-div" attr="This is not targeted for extraction">text 1</div>

      <input id="standard-input" placeholder="standard HTML5 attribute">
      <input placeholder="standard HTML5 attribute without id">

      <paper-input id="paper-input-element" label="paper-input label" error-message="paper-input error message" placeholder="paper-input placeholder" value="this is not a target">
      </paper-input>

      <paper-input label="paper-input label without id" error-message="paper-input error message without id" placeholder="paper-input placeholder without id" value="this is not a target">
      </paper-input>

      <google-chart type="pie" id="pie-chart" options="{&quot;title&quot;: &quot;Distribution of days in 2001H1&quot;}" cols="[ {&quot;label&quot;: &quot;Month&quot;, &quot;type&quot;: &quot;string&quot;},{&quot;label&quot;: &quot;Days&quot;, &quot;type&quot;: &quot;number&quot;} ]" rows="[ [&quot;Jan&quot;, 31],[&quot;Feb&quot;, 28],[&quot;Mar&quot;, 31],[&quot;Apr&quot;, 30],[&quot;May&quot;, 31],[&quot;Jun&quot;, 30] ]">
      </google-chart>

      <google-chart id="column-chart" type="column" options="{&quot;title&quot;: &quot;Inventory&quot;}" data="[ [&quot;Year&quot;, &quot;Things&quot;, &quot;Stuff&quot;],
                [&quot;2004&quot;, 1000, 400],
                [&quot;2005&quot;, 1170, 460],
                [&quot;2006&quot;, 660, 1120],
                [&quot;2007&quot;, 1030, 540] ]">
      </google-chart>

      <text-attribute-element id="custom-attr" custom-text-attr1="custom text attribute 1" custom-text-attr2="custom text attribute 2" custom-text-attr3="custom text attribute 3" out-of-scope-attr="out of scope attr">
      </text-attribute-element>

      <text-attribute-element id="selective-attr" boolean-attr="" empty-attr="" string-attr="abc" custom-text-attr4="{{text.ordinary-div}} custom-text-attr4 attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]] {{text.ordinary-div}}" custom-text-attr5\$="[[text.ordinary-div]] custom-text-attr5 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]" i18n-target="i18n-target attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]]" i18n-target2="i18n-target2 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]">
      </text-attribute-element>
      <text-attribute-element id="selective-attr2" boolean-attr="" boolean-attr2="" string-attr="aaa" i18n-target="i18n-target attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr3" i18n-target6="i18n-target6 attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr4" boolean-attr="" i18n-target6="i18n-target6 attribute 3" i18n-target7="unmatching i18n-target4 attribute">
      </text-attribute-element>
      <text-attribute-element id="selective-attr5" string-attr="xxx" i18n-target7="unmatching i18n-target7 attribute">
      </text-attribute-element>

      <span id="test-json-data-1">{{model.json-data-id.attr1}}</span>
      <span id="test-json-data-2">{{model.json-data-id.i18n-target-attr}}</span>
      <span id="test-json-data-3">{{model.template_2:json-data_1.attr1}}</span>
      <span id="test-json-data-4">{{model.template_2:json-data_1.i18n-target-attr}}</span>

    </div>
    <template>
      <json-data id="json-data-id" attr1="this attr1 is extracted" i18n-target-attr="this attribute is also extracted"></json-data>
      <json-data attr1="this attr1 without id is extracted" i18n-target-attr="this attribute without id is also extracted"></json-data>
    </template>
`;
      }

      static get is() { return 'simple-attribute-element' }
      static get config() {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
            //'pie-chart.google-chart-render': '_pieChartRendered',
            //'column-chart.google-chart-render': '_columnChartRendered'
          }
        };
      }

      connectedCallback() {
        super.connectedCallback();
        this._intervalId = window.setInterval(this._checkChartStatus.bind(this), 1000);
        setTimeout(function () {
          this.isPieChartRendered = true;
          this.isColumnChartRendered = true;
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready'); // TODO: this is an ad-hoc solution
        }.bind(this), 200);
      }

      disconnectedCallback() {
        super.disconnectedCallback();
      }

      _checkChartStatus() {
        var pieChartInnerHtml = this.$['pie-chart'].$.chartdiv.innerHTML;
        var columnChartInnerHtml = this.$['column-chart'].$.chartdiv.innerHTML;
        var notLoaded = false;
        if (pieChartInnerHtml === 'Undefined chart type') {
          this.isPieChartRendered = true; // google api to blame; this is not responsible
        }
        if (columnChartInnerHtml === 'Undefined chart type') {
          this.isColumnChartRendered = true; // google api to blame; this is not responsible
        }
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }

      _langUpdated(e) {
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }

      _pieChartRendered() {
        this.isPieChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }

      _columnChartRendered() {
        this.isColumnChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }
    }
    customElements.define(SimpleAttributeElement.is, SimpleAttributeElement);
  }
  break;
case 'base-element':
  {
    class SimpleAttributeElement extends BaseElements.I18nElement {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <style attr="This is not extracted">
    google-chart {
      width: 300px;
    }
    </style>
    <div id="outer-div">
      <div id="ordinary-div" attr="This is not targeted for extraction">text 1</div>

      <input id="standard-input" placeholder="standard HTML5 attribute">
      <input placeholder="standard HTML5 attribute without id">

      <paper-input id="paper-input-element" label="paper-input label" error-message="paper-input error message" placeholder="paper-input placeholder" value="this is not a target">
      </paper-input>

      <paper-input label="paper-input label without id" error-message="paper-input error message without id" placeholder="paper-input placeholder without id" value="this is not a target">
      </paper-input>

      <google-chart type="pie" id="pie-chart" options="{&quot;title&quot;: &quot;Distribution of days in 2001H1&quot;}" cols="[ {&quot;label&quot;: &quot;Month&quot;, &quot;type&quot;: &quot;string&quot;},{&quot;label&quot;: &quot;Days&quot;, &quot;type&quot;: &quot;number&quot;} ]" rows="[ [&quot;Jan&quot;, 31],[&quot;Feb&quot;, 28],[&quot;Mar&quot;, 31],[&quot;Apr&quot;, 30],[&quot;May&quot;, 31],[&quot;Jun&quot;, 30] ]">
      </google-chart>

      <google-chart id="column-chart" type="column" options="{&quot;title&quot;: &quot;Inventory&quot;}" data="[ [&quot;Year&quot;, &quot;Things&quot;, &quot;Stuff&quot;],
                [&quot;2004&quot;, 1000, 400],
                [&quot;2005&quot;, 1170, 460],
                [&quot;2006&quot;, 660, 1120],
                [&quot;2007&quot;, 1030, 540] ]">
      </google-chart>

      <text-attribute-element id="custom-attr" custom-text-attr1="custom text attribute 1" custom-text-attr2="custom text attribute 2" custom-text-attr3="custom text attribute 3" out-of-scope-attr="out of scope attr">
      </text-attribute-element>

      <text-attribute-element id="selective-attr" boolean-attr="" empty-attr="" string-attr="abc" custom-text-attr4="{{text.ordinary-div}} custom-text-attr4 attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]] {{text.ordinary-div}}" custom-text-attr5\$="[[text.ordinary-div]] custom-text-attr5 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]" i18n-target="i18n-target attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]]" i18n-target2="i18n-target2 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]">
      </text-attribute-element>
      <text-attribute-element id="selective-attr2" boolean-attr="" boolean-attr2="" string-attr="aaa" i18n-target="i18n-target attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr3" i18n-target6="i18n-target6 attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr4" boolean-attr="" i18n-target6="i18n-target6 attribute 3" i18n-target7="unmatching i18n-target4 attribute">
      </text-attribute-element>
      <text-attribute-element id="selective-attr5" string-attr="xxx" i18n-target7="unmatching i18n-target7 attribute">
      </text-attribute-element>

      <span id="test-json-data-1">{{model.json-data-id.attr1}}</span>
      <span id="test-json-data-2">{{model.json-data-id.i18n-target-attr}}</span>
      <span id="test-json-data-3">{{model.template_2:json-data_1.attr1}}</span>
      <span id="test-json-data-4">{{model.template_2:json-data_1.i18n-target-attr}}</span>

    </div>
    <template>
      <json-data id="json-data-id" attr1="this attr1 is extracted" i18n-target-attr="this attribute is also extracted"></json-data>
      <json-data attr1="this attr1 without id is extracted" i18n-target-attr="this attribute without id is also extracted"></json-data>
    </template>
`;
      }

      static get is() { return 'simple-attribute-element' }
      static get config() {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
            //'pie-chart.google-chart-render': '_pieChartRendered',
            //'column-chart.google-chart-render': '_columnChartRendered'
          }
        };
      }

      connectedCallback() {
        super.connectedCallback();
        this._intervalId = window.setInterval(this._checkChartStatus.bind(this), 1000);
        setTimeout(function () {
          this.isPieChartRendered = true;
          this.isColumnChartRendered = true;
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready'); // TODO: this is an ad-hoc solution
        }.bind(this), 200);
      }

      disconnectedCallback() {
        super.disconnectedCallback();
      }

      _checkChartStatus() {
        var pieChartInnerHtml = this.$['pie-chart'].$.chartdiv.innerHTML;
        var columnChartInnerHtml = this.$['column-chart'].$.chartdiv.innerHTML;
        var notLoaded = false;
        if (pieChartInnerHtml === 'Undefined chart type') {
          this.isPieChartRendered = true; // google api to blame; this is not responsible
        }
        if (columnChartInnerHtml === 'Undefined chart type') {
          this.isColumnChartRendered = true; // google api to blame; this is not responsible
        }
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }

      _langUpdated(e) {
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }

      _pieChartRendered() {
        this.isPieChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }

      _columnChartRendered() {
        this.isColumnChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }
    }
    customElements.define(SimpleAttributeElement.is, SimpleAttributeElement);
  }
  break;
case 'thin':
  {
    Define = class SimpleAttributeElement extends BaseElements.I18nElement {
      static get config() {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
            //'pie-chart.google-chart-render': '_pieChartRendered',
            //'column-chart.google-chart-render': '_columnChartRendered'
          }
        };
      }

      connectedCallback() {
        super.connectedCallback();
        this._intervalId = window.setInterval(this._checkChartStatus.bind(this), 1000);
        setTimeout(function () {
          this.isPieChartRendered = true;
          this.isColumnChartRendered = true;
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready'); // TODO: this is an ad-hoc solution
        }.bind(this), 200);
      }

      disconnectedCallback() {
        super.disconnectedCallback();
      }

      _checkChartStatus() {
        var pieChartInnerHtml = this.$['pie-chart'].$.chartdiv.innerHTML;
        var columnChartInnerHtml = this.$['column-chart'].$.chartdiv.innerHTML;
        var notLoaded = false;
        if (pieChartInnerHtml === 'Undefined chart type') {
          this.isPieChartRendered = true; // google api to blame; this is not responsible
        }
        if (columnChartInnerHtml === 'Undefined chart type') {
          this.isColumnChartRendered = true; // google api to blame; this is not responsible
        }
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }

      _langUpdated(e) {
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }

      _pieChartRendered() {
        this.isPieChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }

      _columnChartRendered() {
        this.isColumnChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }
    }
  }
  break;
case 'legacy':
  {
    Polymer$0({
      importMeta: import.meta,

      _template: (t => { ['text-attr', 'custom-text-attr1', 'custom-text-attr3'].forEach(a => t.setAttribute(a, '')); return t; })(html`
    <style attr="This is not extracted">
    google-chart {
      width: 300px;
    }
    </style>
    <div id="outer-div">
      <div id="ordinary-div" attr="This is not targeted for extraction">text 1</div>

      <input id="standard-input" placeholder="standard HTML5 attribute">
      <input placeholder="standard HTML5 attribute without id">

      <paper-input id="paper-input-element" label="paper-input label" error-message="paper-input error message" placeholder="paper-input placeholder" value="this is not a target">
      </paper-input>

      <paper-input label="paper-input label without id" error-message="paper-input error message without id" placeholder="paper-input placeholder without id" value="this is not a target">
      </paper-input>

      <google-chart type="pie" id="pie-chart" options="{&quot;title&quot;: &quot;Distribution of days in 2001H1&quot;}" cols="[ {&quot;label&quot;: &quot;Month&quot;, &quot;type&quot;: &quot;string&quot;},{&quot;label&quot;: &quot;Days&quot;, &quot;type&quot;: &quot;number&quot;} ]" rows="[ [&quot;Jan&quot;, 31],[&quot;Feb&quot;, 28],[&quot;Mar&quot;, 31],[&quot;Apr&quot;, 30],[&quot;May&quot;, 31],[&quot;Jun&quot;, 30] ]">
      </google-chart>

      <google-chart id="column-chart" type="column" options="{&quot;title&quot;: &quot;Inventory&quot;}" data="[ [&quot;Year&quot;, &quot;Things&quot;, &quot;Stuff&quot;],
                [&quot;2004&quot;, 1000, 400],
                [&quot;2005&quot;, 1170, 460],
                [&quot;2006&quot;, 660, 1120],
                [&quot;2007&quot;, 1030, 540] ]">
      </google-chart>

      <text-attribute-element id="custom-attr" custom-text-attr1="custom text attribute 1" custom-text-attr2="custom text attribute 2" custom-text-attr3="custom text attribute 3" out-of-scope-attr="out of scope attr">
      </text-attribute-element>

      <text-attribute-element id="selective-attr" boolean-attr="" empty-attr="" string-attr="abc" custom-text-attr4="{{text.ordinary-div}} custom-text-attr4 attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]] {{text.ordinary-div}}" custom-text-attr5="[[text.ordinary-div]] custom-text-attr5 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]" i18n-target="i18n-target attribute with param {{text.ordinary-div}} and param [[text.ordinary-div]]" i18n-target2="i18n-target2 attribute with param {{or('',text.ordinary-div)}} and param [[text.ordinary-div]]">
      </text-attribute-element>
      <text-attribute-element id="selective-attr2" boolean-attr="" boolean-attr2="" string-attr="aaa" i18n-target="i18n-target attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr3" i18n-target6="i18n-target6 attribute 2">
      </text-attribute-element>
      <text-attribute-element id="selective-attr4" boolean-attr="" i18n-target6="i18n-target6 attribute 3" i18n-target7="unmatching i18n-target4 attribute">
      </text-attribute-element>
      <text-attribute-element id="selective-attr5" string-attr="xxx" i18n-target7="unmatching i18n-target7 attribute">
      </text-attribute-element>

      <span id="test-json-data-1">{{model.json-data-id.attr1}}</span>
      <span id="test-json-data-2">{{model.json-data-id.i18n-target-attr}}</span>
      <span id="test-json-data-3">{{model.template_2:json-data_1.attr1}}</span>
      <span id="test-json-data-4">{{model.template_2:json-data_1.i18n-target-attr}}</span>

    </div>
    <template>
      <json-data id="json-data-id" attr1="this attr1 is extracted" i18n-target-attr="this attribute is also extracted"></json-data>
      <json-data attr1="this attr1 without id is extracted" i18n-target-attr="this attribute without id is also extracted"></json-data>
    </template>
`),

      is: 'simple-attribute-element',

      behaviors: [
        BehaviorsStore.I18nBehavior
      ],

      listeners: {
        'lang-updated': '_langUpdated',
        'pie-chart.google-chart-render': '_pieChartRendered',
        'column-chart.google-chart-render': '_columnChartRendered'
      },

      ready: function () {
        //this.observeHtmlLang = false;
      },

      attached: function () {
        this._intervalId = window.setInterval(this._checkChartStatus.bind(this), 1000);
        setTimeout(function () {
          this.isPieChartRendered = true;
          this.isColumnChartRendered = true;
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready'); // TODO: this is an ad-hoc solution
        }.bind(this), 200);
      },

      _checkChartStatus: function () {
        var pieChartInnerHtml = this.$['pie-chart'].$.chartdiv.innerHTML;
        var columnChartInnerHtml = this.$['column-chart'].$.chartdiv.innerHTML;
        var notLoaded = false;
        if (pieChartInnerHtml === 'Undefined chart type') {
          this.isPieChartRendered = true; // google api to blame; this is not responsible
        }
        if (columnChartInnerHtml === 'Undefined chart type') {
          this.isColumnChartRendered = true; // google api to blame; this is not responsible
        }
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      },

      _langUpdated: function (e) {
        if (dom(e).rootTarget === this) {
          this.model = deepcopy(this.text.model);
        }
      },

      _pieChartRendered: function () {
        this.isPieChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      },

      _columnChartRendered: function () {
        this.isColumnChartRendered = true;
        if (this.isPieChartRendered && this.isColumnChartRendered) {
          window.clearInterval(this._intervalId);
          this.fire('local-dom-ready');
        }
      }
    });
  }
  break;
}
