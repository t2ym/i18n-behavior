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
        return html`
<!-- comment -->
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
`;
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
        return html`
<!-- comment -->
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
`;
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

      _template: html`
<!-- comment -->
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
`,

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
