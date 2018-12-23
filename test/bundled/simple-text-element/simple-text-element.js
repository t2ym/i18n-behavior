/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="simple-text-element">
    outermost text at the beginning 
    <div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1>outermost header 1</h1>
    outermost text in the middle 
    <span>simple text without id</span>
    <span>simple text without id 2</span>
    <span id="label-1">simple text with id</span>
    <span id="label-2">simple text with id 2</span>
    <div>
      <span>simple text within div</span> 
      <span>simple text within div 2</span> 
      <div><div>great grandchild text within div</div></div> 
    </div>
    <div>
      simple text as the first element in div 
      <span>simple text within div</span>
      simple text in the middle of div 
      <span>simple text within div 2</span>
      <div><div>great grandchild text within div</div></div>
      simple text at the last element in div
    </div>
    <div id="toplevel-div">
      <span>simple text within div</span>
      <span>simple text within div 2</span>
      <div id="second-level-div">
        <div id="third-level-div">great grandchild text within div</div>
        <div>great grandchild text within div without id</div>
      </div>
    </div>
    <div>
      <ul>
        <li>line item without id 1</li>
        <li>line item without id 2</li>
        <li>line item without id 3</li>
      </ul>
      <ul id="line-items">
        <li>line item with id 1</li>
        <li>line item with id 2</li>
        <li>line item with id 3</li>
      </ul>
    </div>
    <p>A paragraph with <b>parameters</b> is converted to <code>&lt;i18n-format&gt;</code>.</p>
    <p id="paragraph">A paragraph with <b>id</b> is converted to <code>&lt;i18n-format&gt;</code>.</p>
    outermost text at the end 
  </template>`;

document.head.appendChild($_documentContainer.content);
switch (syntax) {
default:
case 'mixin':
  {
    class SimpleTextElement extends Mixins.Localizable(Polymer.LegacyElement) {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`{{text.text}}<div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1>{{text.h1_3}}</h1>{{text.text_4}}<span>{{text.span_5}}</span>
    <span>{{text.span_6}}</span>
    <span id="label-1">{{text.label-1}}</span>
    <span id="label-2">{{text.label-2}}</span>
    <div>
      <span>{{text.div_9:span}}</span> 
      <span>{{text.div_9:span_1}}</span> 
      <div><div>{{text.div_9:div_2:div}}</div></div> 
    </div>
    <div>{{text.div_10:text}}<span>{{text.div_10:span_1}}</span>{{text.div_10:text_2}}<span>{{text.div_10:span_3}}</span>
      <div><div>{{text.div_10:div_4:div}}</div></div>{{text.div_10:text_5}}</div>
    <div id="toplevel-div">
      <span>{{text.toplevel-div:span}}</span>
      <span>{{text.toplevel-div:span_1}}</span>
      <div id="second-level-div">
        <div id="third-level-div">{{text.third-level-div}}</div>
        <div>{{text.second-level-div:div_1}}</div>
      </div>
    </div>
    <div>
      <ul>
        <li>{{text.div_12:ul:li}}</li>
        <li>{{text.div_12:ul:li_1}}</li>
        <li>{{text.div_12:ul:li_2}}</li>
      </ul>
      <ul id="line-items">
        <li>{{text.line-items:li}}</li>
        <li>{{text.line-items:li_1}}</li>
        <li>{{text.line-items:li_2}}</li>
      </ul>
    </div>
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><b slot="1">{{text.p_13.1}}</b><code slot="2">{{text.p_13.2}}</code></i18n-format></p>
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><code slot="2">{{text.paragraph.2}}</code></i18n-format></p>{{text.text_15}}<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "text": " outermost text at the beginning ",
  "h1_3": "outermost header 1",
  "text_4": " outermost text in the middle ",
  "span_5": "simple text without id",
  "span_6": "simple text without id 2",
  "label-1": "simple text with id",
  "label-2": "simple text with id 2",
  "div_9:span": "simple text within div",
  "div_9:span_1": "simple text within div 2",
  "div_9:div_2:div": "great grandchild text within div",
  "div_10:text": " simple text as the first element in div ",
  "div_10:span_1": "simple text within div",
  "div_10:text_2": " simple text in the middle of div ",
  "div_10:span_3": "simple text within div 2",
  "div_10:div_4:div": "great grandchild text within div",
  "div_10:text_5": " simple text at the last element in div ",
  "toplevel-div:span": "simple text within div",
  "toplevel-div:span_1": "simple text within div 2",
  "third-level-div": "great grandchild text within div",
  "second-level-div:div_1": "great grandchild text within div without id",
  "div_12:ul:li": "line item without id 1",
  "div_12:ul:li_1": "line item without id 2",
  "div_12:ul:li_2": "line item without id 3",
  "line-items:li": "line item with id 1",
  "line-items:li_1": "line item with id 2",
  "line-items:li_2": "line item with id 3",
  "p_13": [
    "A paragraph with {1} is converted to {2}.",
    "parameters",
    "&lt;i18n-format&gt;"
  ],
  "paragraph": [
    "A paragraph with {1} is converted to {2}.",
    "id",
    "&lt;i18n-format&gt;"
  ],
  "text_15": " outermost text at the end "
}
</json-data>
</template>
`);
      }

      static get is() { return 'simple-text-element' }
      static get config () {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated (e) {
        console.log(this.is, 'lang-updated', e.detail);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }
    }
    customElements.define(SimpleTextElement.is, SimpleTextElement);
  }
  break;
case 'base-element':
  {
    class SimpleTextElement extends BaseElements.I18nElement {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`{{text.text}}<div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1>{{text.h1_3}}</h1>{{text.text_4}}<span>{{text.span_5}}</span>
    <span>{{text.span_6}}</span>
    <span id="label-1">{{text.label-1}}</span>
    <span id="label-2">{{text.label-2}}</span>
    <div>
      <span>{{text.div_9:span}}</span> 
      <span>{{text.div_9:span_1}}</span> 
      <div><div>{{text.div_9:div_2:div}}</div></div> 
    </div>
    <div>{{text.div_10:text}}<span>{{text.div_10:span_1}}</span>{{text.div_10:text_2}}<span>{{text.div_10:span_3}}</span>
      <div><div>{{text.div_10:div_4:div}}</div></div>{{text.div_10:text_5}}</div>
    <div id="toplevel-div">
      <span>{{text.toplevel-div:span}}</span>
      <span>{{text.toplevel-div:span_1}}</span>
      <div id="second-level-div">
        <div id="third-level-div">{{text.third-level-div}}</div>
        <div>{{text.second-level-div:div_1}}</div>
      </div>
    </div>
    <div>
      <ul>
        <li>{{text.div_12:ul:li}}</li>
        <li>{{text.div_12:ul:li_1}}</li>
        <li>{{text.div_12:ul:li_2}}</li>
      </ul>
      <ul id="line-items">
        <li>{{text.line-items:li}}</li>
        <li>{{text.line-items:li_1}}</li>
        <li>{{text.line-items:li_2}}</li>
      </ul>
    </div>
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><b slot="1">{{text.p_13.1}}</b><code slot="2">{{text.p_13.2}}</code></i18n-format></p>
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><code slot="2">{{text.paragraph.2}}</code></i18n-format></p>{{text.text_15}}<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "text": " outermost text at the beginning ",
  "h1_3": "outermost header 1",
  "text_4": " outermost text in the middle ",
  "span_5": "simple text without id",
  "span_6": "simple text without id 2",
  "label-1": "simple text with id",
  "label-2": "simple text with id 2",
  "div_9:span": "simple text within div",
  "div_9:span_1": "simple text within div 2",
  "div_9:div_2:div": "great grandchild text within div",
  "div_10:text": " simple text as the first element in div ",
  "div_10:span_1": "simple text within div",
  "div_10:text_2": " simple text in the middle of div ",
  "div_10:span_3": "simple text within div 2",
  "div_10:div_4:div": "great grandchild text within div",
  "div_10:text_5": " simple text at the last element in div ",
  "toplevel-div:span": "simple text within div",
  "toplevel-div:span_1": "simple text within div 2",
  "third-level-div": "great grandchild text within div",
  "second-level-div:div_1": "great grandchild text within div without id",
  "div_12:ul:li": "line item without id 1",
  "div_12:ul:li_1": "line item without id 2",
  "div_12:ul:li_2": "line item without id 3",
  "line-items:li": "line item with id 1",
  "line-items:li_1": "line item with id 2",
  "line-items:li_2": "line item with id 3",
  "p_13": [
    "A paragraph with {1} is converted to {2}.",
    "parameters",
    "&lt;i18n-format&gt;"
  ],
  "paragraph": [
    "A paragraph with {1} is converted to {2}.",
    "id",
    "&lt;i18n-format&gt;"
  ],
  "text_15": " outermost text at the end "
}
</json-data>
</template>
`);
      }

      static get is() { return 'simple-text-element' }
      static get config () {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated (e) {
        console.log(this.is, 'lang-updated', e.detail);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
      }
    }
    customElements.define(SimpleTextElement.is, SimpleTextElement);
  }
  break;
case 'thin':
  {
    Define = class SimpleTextElement extends BaseElements.I18nElement {
      static get config () {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
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

      _template: ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`{{text.text}}<div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; </span>
    <h1>{{text.h1_3}}</h1>{{text.text_4}}<span>{{text.span_5}}</span>
    <span>{{text.span_6}}</span>
    <span id="label-1">{{text.label-1}}</span>
    <span id="label-2">{{text.label-2}}</span>
    <div>
      <span>{{text.div_9:span}}</span> 
      <span>{{text.div_9:span_1}}</span> 
      <div><div>{{text.div_9:div_2:div}}</div></div> 
    </div>
    <div>{{text.div_10:text}}<span>{{text.div_10:span_1}}</span>{{text.div_10:text_2}}<span>{{text.div_10:span_3}}</span>
      <div><div>{{text.div_10:div_4:div}}</div></div>{{text.div_10:text_5}}</div>
    <div id="toplevel-div">
      <span>{{text.toplevel-div:span}}</span>
      <span>{{text.toplevel-div:span_1}}</span>
      <div id="second-level-div">
        <div id="third-level-div">{{text.third-level-div}}</div>
        <div>{{text.second-level-div:div_1}}</div>
      </div>
    </div>
    <div>
      <ul>
        <li>{{text.div_12:ul:li}}</li>
        <li>{{text.div_12:ul:li_1}}</li>
        <li>{{text.div_12:ul:li_2}}</li>
      </ul>
      <ul id="line-items">
        <li>{{text.line-items:li}}</li>
        <li>{{text.line-items:li_1}}</li>
        <li>{{text.line-items:li_2}}</li>
      </ul>
    </div>
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><b slot="1">{{text.p_13.1}}</b><code slot="2">{{text.p_13.2}}</code></i18n-format></p>
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><code slot="2">{{text.paragraph.2}}</code></i18n-format></p>{{text.text_15}}<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "text": " outermost text at the beginning ",
  "h1_3": "outermost header 1",
  "text_4": " outermost text in the middle ",
  "span_5": "simple text without id",
  "span_6": "simple text without id 2",
  "label-1": "simple text with id",
  "label-2": "simple text with id 2",
  "div_9:span": "simple text within div",
  "div_9:span_1": "simple text within div 2",
  "div_9:div_2:div": "great grandchild text within div",
  "div_10:text": " simple text as the first element in div ",
  "div_10:span_1": "simple text within div",
  "div_10:text_2": " simple text in the middle of div ",
  "div_10:span_3": "simple text within div 2",
  "div_10:div_4:div": "great grandchild text within div",
  "div_10:text_5": " simple text at the last element in div ",
  "toplevel-div:span": "simple text within div",
  "toplevel-div:span_1": "simple text within div 2",
  "third-level-div": "great grandchild text within div",
  "second-level-div:div_1": "great grandchild text within div without id",
  "div_12:ul:li": "line item without id 1",
  "div_12:ul:li_1": "line item without id 2",
  "div_12:ul:li_2": "line item without id 3",
  "line-items:li": "line item with id 1",
  "line-items:li_1": "line item with id 2",
  "line-items:li_2": "line item with id 3",
  "p_13": [
    "A paragraph with {1} is converted to {2}.",
    "parameters",
    "&lt;i18n-format&gt;"
  ],
  "paragraph": [
    "A paragraph with {1} is converted to {2}.",
    "id",
    "&lt;i18n-format&gt;"
  ],
  "text_15": " outermost text at the end "
}
</json-data>
</template>
`),

      is: 'simple-text-element',

      behaviors: [
        BehaviorsStore.I18nBehavior
      ],

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
