/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="commented-simple-text-element"><!-- comment -->
    outermost text at the beginning <!-- comment -->
    <div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; <!-- comment --></span><!-- comment -->
    <h1>outermost header 1<!-- comment --></h1><!-- comment -->
    outermost text in the middle <!-- comment -->
    <span>simple text without id<!-- comment --></span><!-- comment -->
    <span>simple text without id 2<!-- comment --></span><!-- comment -->
    <span id="label-1">simple text with id<!-- comment --></span><!-- comment -->
    <span id="label-2">simple text with id 2<!-- comment --></span><!-- comment -->
    <div>
      <span><!-- comment -->simple text within div<!-- comment --></span> <!-- comment -->
      <span><!-- comment -->simple text within div 2<!-- comment --></span> <!-- comment -->
      <div><div>great grandchild text within div</div><!-- comment --></div> <!-- comment -->
    </div>
    <!-- comment -->
    <div>
      simple text as the first element in div <!-- comment -->
      <span>simple text within div<!-- comment --></span><!-- comment -->
      simple text in the middle of div <!-- comment -->
      <span>simple text within div 2</span><!-- comment -->
      <div><div>great grandchild text within div</div><!-- comment --></div><!-- comment -->
      simple text at the last element in div
    </div><!-- comment -->
    <div id="toplevel-div"><!-- comment -->
      <span>simple text within div</span><!-- comment -->
      <span>simple text within div 2</span><!-- comment -->
      <div id="second-level-div"><!-- comment -->
        <div id="third-level-div">great grandchild text within div<!-- comment --></div>
        <div>great grandchild text within div without id</div><!-- comment -->
      </div>
    </div>
    <div>
      <ul><!-- comment -->
        <li>line item without id 1</li><!-- comment -->
        <li>line item without id 2</li><!-- comment -->
        <li>line item without id 3</li><!-- comment -->
      </ul><!-- comment -->
      <ul id="line-items"><!-- comment -->
        <li>line item with id 1<!-- comment --></li>
        <li>line item with id 2<!-- comment --></li>
        <li>line item with id 3<!-- comment --></li>
      </ul><!-- comment -->
    </div><!-- comment -->
    <p><!-- comment -->A paragraph with <!-- comment --><b>parameters</b><!-- comment --> is converted to <!-- comment --><code>&lt;i18n-format&gt;</code><!-- comment -->.<!-- comment --></p><!-- comment -->
    <p id="paragraph"><!-- comment -->A paragraph with <!-- comment --><b>id</b><!-- comment --> is converted to <!-- comment --><code>&lt;i18n-format&gt;</code><!-- comment -->.<!-- comment --></p>
    outermost text at the end <!-- comment -->
  </template>`;

document.head.appendChild($_documentContainer.content);
switch (syntax) {
default:
case 'mixin':
  {
    class CommentedSimpleTextElement extends Mixins.Localizable(Polymer.LegacyElement) {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`
<!-- comment -->{{text.text}}<!-- comment -->
    <div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; <!-- comment --></span><!-- comment -->
    <h1>{{text.h1_3}}<!-- comment --></h1><!-- comment -->{{text.text_4}}<!-- comment -->
    <span>{{text.span_5}}<!-- comment --></span><!-- comment -->
    <span>{{text.span_6}}<!-- comment --></span><!-- comment -->
    <span id="label-1">{{text.label-1}}<!-- comment --></span><!-- comment -->
    <span id="label-2">{{text.label-2}}<!-- comment --></span><!-- comment -->
    <div>
      <span><!-- comment -->{{text.div_9:span}}<!-- comment --></span> <!-- comment -->
      <span><!-- comment -->{{text.div_9:span_1}}<!-- comment --></span> <!-- comment -->
      <div><div>{{text.div_9:div_2:div}}</div><!-- comment --></div> <!-- comment -->
    </div>
    <!-- comment -->
    <div>{{text.div_10:text}}<!-- comment -->
      <span>{{text.div_10:span_1}}<!-- comment --></span><!-- comment -->{{text.div_10:text_2}}<!-- comment -->
      <span>{{text.div_10:span_3}}</span><!-- comment -->
      <div><div>{{text.div_10:div_4:div}}</div><!-- comment --></div><!-- comment -->{{text.div_10:text_5}}</div><!-- comment -->
    <div id="toplevel-div"><!-- comment -->
      <span>{{text.toplevel-div:span}}</span><!-- comment -->
      <span>{{text.toplevel-div:span_1}}</span><!-- comment -->
      <div id="second-level-div"><!-- comment -->
        <div id="third-level-div">{{text.third-level-div}}<!-- comment --></div>
        <div>{{text.second-level-div:div_1}}</div><!-- comment -->
      </div>
    </div>
    <div>
      <ul><!-- comment -->
        <li>{{text.div_12:ul:li}}</li><!-- comment -->
        <li>{{text.div_12:ul:li_1}}</li><!-- comment -->
        <li>{{text.div_12:ul:li_2}}</li><!-- comment -->
      </ul><!-- comment -->
      <ul id="line-items"><!-- comment -->
        <li>{{text.line-items:li}}<!-- comment --></li>
        <li>{{text.line-items:li_1}}<!-- comment --></li>
        <li>{{text.line-items:li_2}}<!-- comment --></li>
      </ul><!-- comment -->
    </div><!-- comment -->
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><b slot="1">{{text.p_13.1}}</b><code slot="2">{{text.p_13.2}}</code></i18n-format></p><!-- comment -->
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><code slot="2">{{text.paragraph.2}}</code></i18n-format></p>{{text.text_15}}<!-- comment -->
<template id="localizable-text">
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

      static get is() { return 'commented-simple-text-element' }
      static get config () {
        return {
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
    customElements.define(CommentedSimpleTextElement.is, CommentedSimpleTextElement);
  }
  break;
case 'base-element':
  {
    class CommentedSimpleTextElement extends BaseElements.I18nElement {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`
<!-- comment -->{{text.text}}<!-- comment -->
    <div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; <!-- comment --></span><!-- comment -->
    <h1>{{text.h1_3}}<!-- comment --></h1><!-- comment -->{{text.text_4}}<!-- comment -->
    <span>{{text.span_5}}<!-- comment --></span><!-- comment -->
    <span>{{text.span_6}}<!-- comment --></span><!-- comment -->
    <span id="label-1">{{text.label-1}}<!-- comment --></span><!-- comment -->
    <span id="label-2">{{text.label-2}}<!-- comment --></span><!-- comment -->
    <div>
      <span><!-- comment -->{{text.div_9:span}}<!-- comment --></span> <!-- comment -->
      <span><!-- comment -->{{text.div_9:span_1}}<!-- comment --></span> <!-- comment -->
      <div><div>{{text.div_9:div_2:div}}</div><!-- comment --></div> <!-- comment -->
    </div>
    <!-- comment -->
    <div>{{text.div_10:text}}<!-- comment -->
      <span>{{text.div_10:span_1}}<!-- comment --></span><!-- comment -->{{text.div_10:text_2}}<!-- comment -->
      <span>{{text.div_10:span_3}}</span><!-- comment -->
      <div><div>{{text.div_10:div_4:div}}</div><!-- comment --></div><!-- comment -->{{text.div_10:text_5}}</div><!-- comment -->
    <div id="toplevel-div"><!-- comment -->
      <span>{{text.toplevel-div:span}}</span><!-- comment -->
      <span>{{text.toplevel-div:span_1}}</span><!-- comment -->
      <div id="second-level-div"><!-- comment -->
        <div id="third-level-div">{{text.third-level-div}}<!-- comment --></div>
        <div>{{text.second-level-div:div_1}}</div><!-- comment -->
      </div>
    </div>
    <div>
      <ul><!-- comment -->
        <li>{{text.div_12:ul:li}}</li><!-- comment -->
        <li>{{text.div_12:ul:li_1}}</li><!-- comment -->
        <li>{{text.div_12:ul:li_2}}</li><!-- comment -->
      </ul><!-- comment -->
      <ul id="line-items"><!-- comment -->
        <li>{{text.line-items:li}}<!-- comment --></li>
        <li>{{text.line-items:li_1}}<!-- comment --></li>
        <li>{{text.line-items:li_2}}<!-- comment --></li>
      </ul><!-- comment -->
    </div><!-- comment -->
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><b slot="1">{{text.p_13.1}}</b><code slot="2">{{text.p_13.2}}</code></i18n-format></p><!-- comment -->
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><code slot="2">{{text.paragraph.2}}</code></i18n-format></p>{{text.text_15}}<!-- comment -->
<template id="localizable-text">
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

      static get is() { return 'commented-simple-text-element' }
      static get config () {
        return {
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
    customElements.define(CommentedSimpleTextElement.is, CommentedSimpleTextElement);
  }
  break;
case 'thin':
  {
    Define = class CommentedSimpleTextElement extends BaseElements.I18nElement {
      static get config () {
        return {
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

      _template: ((t) => { t.setAttribute("localizable-text", "embedded"); return t; })(html`
<!-- comment -->{{text.text}}<!-- comment -->
    <div><div></div></div><!-- nested empty div -->
    <span id="whitespace"> &nbsp; <!-- comment --></span><!-- comment -->
    <h1>{{text.h1_3}}<!-- comment --></h1><!-- comment -->{{text.text_4}}<!-- comment -->
    <span>{{text.span_5}}<!-- comment --></span><!-- comment -->
    <span>{{text.span_6}}<!-- comment --></span><!-- comment -->
    <span id="label-1">{{text.label-1}}<!-- comment --></span><!-- comment -->
    <span id="label-2">{{text.label-2}}<!-- comment --></span><!-- comment -->
    <div>
      <span><!-- comment -->{{text.div_9:span}}<!-- comment --></span> <!-- comment -->
      <span><!-- comment -->{{text.div_9:span_1}}<!-- comment --></span> <!-- comment -->
      <div><div>{{text.div_9:div_2:div}}</div><!-- comment --></div> <!-- comment -->
    </div>
    <!-- comment -->
    <div>{{text.div_10:text}}<!-- comment -->
      <span>{{text.div_10:span_1}}<!-- comment --></span><!-- comment -->{{text.div_10:text_2}}<!-- comment -->
      <span>{{text.div_10:span_3}}</span><!-- comment -->
      <div><div>{{text.div_10:div_4:div}}</div><!-- comment --></div><!-- comment -->{{text.div_10:text_5}}</div><!-- comment -->
    <div id="toplevel-div"><!-- comment -->
      <span>{{text.toplevel-div:span}}</span><!-- comment -->
      <span>{{text.toplevel-div:span_1}}</span><!-- comment -->
      <div id="second-level-div"><!-- comment -->
        <div id="third-level-div">{{text.third-level-div}}<!-- comment --></div>
        <div>{{text.second-level-div:div_1}}</div><!-- comment -->
      </div>
    </div>
    <div>
      <ul><!-- comment -->
        <li>{{text.div_12:ul:li}}</li><!-- comment -->
        <li>{{text.div_12:ul:li_1}}</li><!-- comment -->
        <li>{{text.div_12:ul:li_2}}</li><!-- comment -->
      </ul><!-- comment -->
      <ul id="line-items"><!-- comment -->
        <li>{{text.line-items:li}}<!-- comment --></li>
        <li>{{text.line-items:li_1}}<!-- comment --></li>
        <li>{{text.line-items:li_2}}<!-- comment --></li>
      </ul><!-- comment -->
    </div><!-- comment -->
    <p><i18n-format lang="{{effectiveLang}}"><span>{{text.p_13.0}}</span><b slot="1">{{text.p_13.1}}</b><code slot="2">{{text.p_13.2}}</code></i18n-format></p><!-- comment -->
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><b slot="1">{{text.paragraph.1}}</b><code slot="2">{{text.paragraph.2}}</code></i18n-format></p>{{text.text_15}}<!-- comment -->
<template id="localizable-text">
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

      is: 'commented-simple-text-element',

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
