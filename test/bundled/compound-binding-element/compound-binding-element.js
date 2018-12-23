/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="compound-binding-element">
    outermost text at the beginning with compound {{param1}} and {{param2}} variables
    <div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1>outermost header 1 with {{param1}} and {{param2}} variables</h1>
    outermost text in the middle with {{param1}} and {{param2}} variables
    <span>simple text without id with {{param1}} and {{param2}} variables</span>
    <span>simple text without id 2 with {{param1}} and {{param2}} variables</span>
    <span id="label-1">simple text with id and {{param1}} and {{param2}} variables</span>
    <span id="label-2">simple text with id and {{param1}} and {{param2}} variables 2</span>
    <div>
      <span>simple text within div with {{param1}} and {{param2}} variables</span> 
      <span>simple text within div with {{param1}} and {{param2}} variables 2</span> 
      <div><div>great grandchild text within div with {{param1}} and {{param2}} variables</div></div> 
    </div>
    <div>
      simple text as the first element in div with {{param1}} and {{param2}} variables
      <span>simple text within div with {{param1}} and {{param2}} variables</span>
      simple text in the middle of div with {{param1}} and {{param2}} variables 
      <span>simple text within div with {{param1}} and {{param2}} variables 2</span>
      <div><div>great grandchild text within div with {{param1}} and {{param2}} variables</div></div>
      simple text at the last element in div with {{param1}} and {{param2}} variables
    </div>
    <div id="toplevel-div">
      <span>simple text within div with {{param1}} and {{param2}} variables</span>
      <span>simple text within div 2 with {{param1}} and {{param2}} variables</span>
      <div id="second-level-div">
        <div id="third-level-div">great grandchild text within div with {{param1}} and {{param2}} variables</div>
        <div>great grandchild text within div without id with {{param1}} and {{param2}} variables</div>
      </div>
    </div>
    <div>
      <ul>
        <li>line item without id 1 with {{param1}} and {{param2}} variables</li>
        <li>line item without id 2 with {{param1}} and {{param2}} variables</li>
        <li>line item without id 3 with {{param1}} and {{param2}} variables</li>
      </ul>
      <ul id="line-items">
        <li>line item with id 1 with {{param1}} and {{param2}} variables</li>
        <li>line item with id 2 with {{param1}} and {{param2}} variables</li>
        <li>line item with id 3 with {{param1}} and {{param2}} variables</li>
      </ul>
    </div>
    <p>A paragraph with {{param1}} is converted to {{param2}}.</p>
    <p id="paragraph">A paragraph with <b>id</b>, {{param1}}, and {{param2}} is converted to <code>&lt;i18n-format&gt;</code>.</p>
    outermost text at the end with {{param1}} and {{param2}} variables
  </template>`;

document.head.appendChild($_documentContainer.content);
switch (syntax) {
default:
case 'mixin':
  {
    class CompoundBindingElement extends Mixins.Localizable(Polymer.LegacyElement) {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`<i18n-format lang="{{effectiveLang}}"><span>{{text.text.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1><i18n-format lang="{{effectiveLang}}"><span>{{text.h1_3.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></h1><i18n-format lang="{{effectiveLang}}"><span>{{text.text_4.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.span_5.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span><i18n-format lang="{{effectiveLang}}"><span>{{text.span_6.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span id="label-1"><i18n-format lang="{{effectiveLang}}"><span>{{text.label-1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span id="label-2"><i18n-format lang="{{effectiveLang}}"><span>{{text.label-2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <div>
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:span.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span> 
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span> 
      <div><div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:div_2:div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div></div> 
    </div>
    <div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:span_3.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <div><div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:div_4:div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div></div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text_5.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
    <div id="toplevel-div">
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.toplevel-div:span.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.toplevel-div:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <div id="second-level-div">
        <div id="third-level-div"><i18n-format lang="{{effectiveLang}}"><span>{{text.third-level-div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
        <div><i18n-format lang="{{effectiveLang}}"><span>{{text.second-level-div:div_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
      </div>
    </div>
    <div>
      <ul>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
      </ul>
      <ul id="line-items">
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
      </ul>
    </div>
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></p>
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><span slot="2">{{param1}}</span><span slot="3">{{param2}}</span><code slot="4">{{text.paragraph.4}}</code></i18n-format></p><i18n-format lang="{{effectiveLang}}"><span>{{text.text_15.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "text": [
    " outermost text at the beginning with compound {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "h1_3": [
    "outermost header 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "text_4": [
    " outermost text in the middle with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "span_5": [
    "simple text without id with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "span_6": [
    "simple text without id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "label-1": [
    "simple text with id and {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "label-2": [
    "simple text with id and {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:span": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:span_1": [
    "simple text within div with {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:div_2:div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text": [
    " simple text as the first element in div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:span_1": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text_2": [
    " simple text in the middle of div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:span_3": [
    "simple text within div with {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:div_4:div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text_5": [
    " simple text at the last element in div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "toplevel-div:span": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "toplevel-div:span_1": [
    "simple text within div 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "third-level-div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "second-level-div:div_1": [
    "great grandchild text within div without id with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li": [
    "line item without id 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li_1": [
    "line item without id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li_2": [
    "line item without id 3 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li": [
    "line item with id 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li_1": [
    "line item with id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li_2": [
    "line item with id 3 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "p_13": [
    "A paragraph with {1} is converted to {2}.",
    "{{param1}}",
    "{{param2}}"
  ],
  "paragraph": [
    "A paragraph with {1}, {2}, and {3} is converted to {4}.",
    "id",
    "{{param1}}",
    "{{param2}}",
    "&lt;i18n-format&gt;"
  ],
  "text_15": [
    " outermost text at the end with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ]
}
</json-data>
</template>
`);
      }

      static get is() { return 'compound-binding-element' }
      static get config () {
        return {
          properties: {
            param1: {
              type: String,
              value: 'parameter 1'
            },
            param2: {
              type: String,
              value: 'parameter 2'
            }
          },
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      ready() {
        super.ready();
      }

      _langUpdated (e) {
        console.log(this.is, 'lang-updated', e.detail);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }
    }
    customElements.define(CompoundBindingElement.is, CompoundBindingElement);
  }
  break;
case 'base-element':
  {
    class CompoundBindingElement extends BaseElements.I18nElement {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`<i18n-format lang="{{effectiveLang}}"><span>{{text.text.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1><i18n-format lang="{{effectiveLang}}"><span>{{text.h1_3.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></h1><i18n-format lang="{{effectiveLang}}"><span>{{text.text_4.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.span_5.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span><i18n-format lang="{{effectiveLang}}"><span>{{text.span_6.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span id="label-1"><i18n-format lang="{{effectiveLang}}"><span>{{text.label-1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span id="label-2"><i18n-format lang="{{effectiveLang}}"><span>{{text.label-2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <div>
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:span.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span> 
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span> 
      <div><div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:div_2:div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div></div> 
    </div>
    <div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:span_3.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <div><div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:div_4:div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div></div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text_5.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
    <div id="toplevel-div">
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.toplevel-div:span.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.toplevel-div:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <div id="second-level-div">
        <div id="third-level-div"><i18n-format lang="{{effectiveLang}}"><span>{{text.third-level-div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
        <div><i18n-format lang="{{effectiveLang}}"><span>{{text.second-level-div:div_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
      </div>
    </div>
    <div>
      <ul>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
      </ul>
      <ul id="line-items">
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
      </ul>
    </div>
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></p>
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><span slot="2">{{param1}}</span><span slot="3">{{param2}}</span><code slot="4">{{text.paragraph.4}}</code></i18n-format></p><i18n-format lang="{{effectiveLang}}"><span>{{text.text_15.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "text": [
    " outermost text at the beginning with compound {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "h1_3": [
    "outermost header 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "text_4": [
    " outermost text in the middle with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "span_5": [
    "simple text without id with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "span_6": [
    "simple text without id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "label-1": [
    "simple text with id and {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "label-2": [
    "simple text with id and {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:span": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:span_1": [
    "simple text within div with {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:div_2:div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text": [
    " simple text as the first element in div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:span_1": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text_2": [
    " simple text in the middle of div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:span_3": [
    "simple text within div with {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:div_4:div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text_5": [
    " simple text at the last element in div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "toplevel-div:span": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "toplevel-div:span_1": [
    "simple text within div 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "third-level-div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "second-level-div:div_1": [
    "great grandchild text within div without id with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li": [
    "line item without id 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li_1": [
    "line item without id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li_2": [
    "line item without id 3 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li": [
    "line item with id 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li_1": [
    "line item with id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li_2": [
    "line item with id 3 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "p_13": [
    "A paragraph with {1} is converted to {2}.",
    "{{param1}}",
    "{{param2}}"
  ],
  "paragraph": [
    "A paragraph with {1}, {2}, and {3} is converted to {4}.",
    "id",
    "{{param1}}",
    "{{param2}}",
    "&lt;i18n-format&gt;"
  ],
  "text_15": [
    " outermost text at the end with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ]
}
</json-data>
</template>
`);
      }

      static get is() { return 'compound-binding-element' }
      static get config () {
        return {
          properties: {
            param1: {
              type: String,
              value: 'parameter 1'
            },
            param2: {
              type: String,
              value: 'parameter 2'
            }
          },
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      ready() {
        super.ready();
      }

      _langUpdated (e) {
        console.log(this.is, 'lang-updated', e.detail);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }
    }
    customElements.define(CompoundBindingElement.is, CompoundBindingElement);
  }
  break;
case 'thin':
  {
    Define = class CompoundBindingElement extends BaseElements.I18nElement {
      static get config () {
        return {
          properties: {
            param1: {
              type: String,
              value: 'parameter 1'
            },
            param2: {
              type: String,
              value: 'parameter 2'
            }
          },
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      ready() {
        super.ready();
      }

      _langUpdated (e) {
        console.log(this.is, 'lang-updated', e.detail);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }
    };
  }
  break;
case 'legacy':
  {
    Polymer$0({
      importMeta: import.meta,

      _template: ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`<i18n-format lang="{{effectiveLang}}"><span>{{text.text.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1><i18n-format lang="{{effectiveLang}}"><span>{{text.h1_3.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></h1><i18n-format lang="{{effectiveLang}}"><span>{{text.text_4.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.span_5.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span><i18n-format lang="{{effectiveLang}}"><span>{{text.span_6.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span id="label-1"><i18n-format lang="{{effectiveLang}}"><span>{{text.label-1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <span id="label-2"><i18n-format lang="{{effectiveLang}}"><span>{{text.label-2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
    <div>
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:span.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span> 
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span> 
      <div><div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_9:div_2:div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div></div> 
    </div>
    <div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><span><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:span_3.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <div><div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:div_4:div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div></div><i18n-format lang="{{effectiveLang}}"><span>{{text.div_10:text_5.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
    <div id="toplevel-div">
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.toplevel-div:span.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <span><i18n-format lang="{{effectiveLang}}"><span>{{text.toplevel-div:span_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></span>
      <div id="second-level-div">
        <div id="third-level-div"><i18n-format lang="{{effectiveLang}}"><span>{{text.third-level-div.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
        <div><i18n-format lang="{{effectiveLang}}"><span>{{text.second-level-div:div_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></div>
      </div>
    </div>
    <div>
      <ul>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.div_12:ul:li_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
      </ul>
      <ul id="line-items">
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li_1.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
        <li><i18n-format lang="{{effectiveLang}}"><span>{{text.line-items:li_2.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></li>
      </ul>
    </div>
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format></p>
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><span slot="2">{{param1}}</span><span slot="3">{{param2}}</span><code slot="4">{{text.paragraph.4}}</code></i18n-format></p><i18n-format lang="{{effectiveLang}}"><span>{{text.text_15.0}}</span><span slot="1">{{param1}}</span><span slot="2">{{param2}}</span></i18n-format><template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "text": [
    " outermost text at the beginning with compound {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "h1_3": [
    "outermost header 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "text_4": [
    " outermost text in the middle with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "span_5": [
    "simple text without id with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "span_6": [
    "simple text without id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "label-1": [
    "simple text with id and {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "label-2": [
    "simple text with id and {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:span": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:span_1": [
    "simple text within div with {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_9:div_2:div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text": [
    " simple text as the first element in div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:span_1": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text_2": [
    " simple text in the middle of div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:span_3": [
    "simple text within div with {1} and {2} variables 2",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:div_4:div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_10:text_5": [
    " simple text at the last element in div with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ],
  "toplevel-div:span": [
    "simple text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "toplevel-div:span_1": [
    "simple text within div 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "third-level-div": [
    "great grandchild text within div with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "second-level-div:div_1": [
    "great grandchild text within div without id with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li": [
    "line item without id 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li_1": [
    "line item without id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "div_12:ul:li_2": [
    "line item without id 3 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li": [
    "line item with id 1 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li_1": [
    "line item with id 2 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "line-items:li_2": [
    "line item with id 3 with {1} and {2} variables",
    "{{param1}}",
    "{{param2}}"
  ],
  "p_13": [
    "A paragraph with {1} is converted to {2}.",
    "{{param1}}",
    "{{param2}}"
  ],
  "paragraph": [
    "A paragraph with {1}, {2}, and {3} is converted to {4}.",
    "id",
    "{{param1}}",
    "{{param2}}",
    "&lt;i18n-format&gt;"
  ],
  "text_15": [
    " outermost text at the end with {1} and {2} variables ",
    "{{param1}}",
    "{{param2}}"
  ]
}
</json-data>
</template>
`),

      is: 'compound-binding-element',

      behaviors: [
        BehaviorsStore.I18nBehavior
      ],

      properties: {
        param1: {
          type: String,
          value: 'parameter 1'
        },
        param2: {
          type: String,
          value: 'parameter 2'
        }
      },

      listeners: {
        'lang-updated': '_langUpdated'
      },

      ready: function () {
        //this.observeHtmlLang = false;
      },

      attached: function () {
      },

      _langUpdated: function (e) {
        console.log(this.is, 'lang-updated', e.detail);
        if (dom(e).rootTarget === this) {
          this.model = deepcopy(this.text.model);
        }
      }
    });
  }
  break;
}
