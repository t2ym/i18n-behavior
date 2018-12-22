/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="complex-compound-binding-element">
    <h5 id="item-update2">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <span><b>IF CONTENT</b></span>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template><!-- comment node -->
        <span>  {{item.name}}  </span>
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
      <dom-if if="true"><template></template></dom-if>
      <dom-if if="true"><template> <!-- comment --></template></dom-if>
      <dom-if if="true"><template>{{text.updated}}</template></dom-if>
    </h5>
    <h5 id="item-update3">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF</b><b>CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update4">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}} = {{text.updated}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <p id="paragraph">A paragraph with 
      <dom-repeat items="{{text.parameters}}"><template>
        <i>{{item}} </i>
      </template></dom-repeat>
      is converted to 
      <code>&lt;i18n-format&gt;</code>.
    </p>
    <p id="paragraph2">A paragraph with deep 
      <dom-repeat items="{{text.parameters}}"><template>
        <span><i>{{item}}</i> </span>
      </template></dom-repeat>
      is <b>not</b> converted to 
      <code>&lt;i18n-format&gt;</code>.
      <dom-if if="false"><template></template></dom-if>
      <dom-if if="false"><template>  </template></dom-if>
      <dom-if if="false"><template>{{text.updated}}</template></dom-if>
    </p>
    <template>
      <json-data id="authors">[
        { "name": "Joe" }, { "name": "Alice" }
      ]</json-data>
      <span id="updated">Jan 1st, 2016</span>
      <json-data id="parameters">[
        "parameter 1", "parameter 2"
      ]</json-data>
    </template>
  </template>`;

document.head.appendChild($_documentContainer.content);
switch (syntax) {
default:
case 'mixin':
  {
    class ComplexCompoundBindingElement extends Mixins.Localizable(Polymer.LegacyElement) {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <h5 id="item-update2">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <span><b>IF CONTENT</b></span>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template><!-- comment node -->
        <span>  {{item.name}}  </span>
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
      <dom-if if="true"><template></template></dom-if>
      <dom-if if="true"><template> <!-- comment --></template></dom-if>
      <dom-if if="true"><template>{{text.updated}}</template></dom-if>
    </h5>
    <h5 id="item-update3">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF</b><b>CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update4">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}} = {{text.updated}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <p id="paragraph">A paragraph with 
      <dom-repeat items="{{text.parameters}}"><template>
        <i>{{item}} </i>
      </template></dom-repeat>
      is converted to 
      <code>&lt;i18n-format&gt;</code>.
    </p>
    <p id="paragraph2">A paragraph with deep 
      <dom-repeat items="{{text.parameters}}"><template>
        <span><i>{{item}}</i> </span>
      </template></dom-repeat>
      is <b>not</b> converted to 
      <code>&lt;i18n-format&gt;</code>.
      <dom-if if="false"><template></template></dom-if>
      <dom-if if="false"><template>  </template></dom-if>
      <dom-if if="false"><template>{{text.updated}}</template></dom-if>
    </p>
    <template>
      <json-data id="authors">[
        { "name": "Joe" }, { "name": "Alice" }
      ]</json-data>
      <span id="updated">Jan 1st, 2016</span>
      <json-data id="parameters">[
        "parameter 1", "parameter 2"
      ]</json-data>
    </template>
`;
      }

      static get is() { return 'complex-compound-binding-element' }
      static get config () {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated(e) {
        console.log('complex-compound-binding-element: lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        window.setTimeout(function () {
          Array.prototype.forEach.call(this.root.querySelectorAll('i18n-format'), function (node) {
            if (!node.elements) {
              console.log('elements are missing', node);
              node.ready();
            }
            node.render();
          });
          console.log(this.is + ' local-dom-ready ');
          this.fire('local-dom-ready');
        }.bind(this), 1);
      }
    }
    customElements.define(ComplexCompoundBindingElement.is, ComplexCompoundBindingElement);
  }
  break;
case 'base-element':
  {
    class ComplexCompoundBindingElement extends BaseElements.I18nElement {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <h5 id="item-update2">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <span><b>IF CONTENT</b></span>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template><!-- comment node -->
        <span>  {{item.name}}  </span>
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
      <dom-if if="true"><template></template></dom-if>
      <dom-if if="true"><template> <!-- comment --></template></dom-if>
      <dom-if if="true"><template>{{text.updated}}</template></dom-if>
    </h5>
    <h5 id="item-update3">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF</b><b>CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update4">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}} = {{text.updated}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <p id="paragraph">A paragraph with 
      <dom-repeat items="{{text.parameters}}"><template>
        <i>{{item}} </i>
      </template></dom-repeat>
      is converted to 
      <code>&lt;i18n-format&gt;</code>.
    </p>
    <p id="paragraph2">A paragraph with deep 
      <dom-repeat items="{{text.parameters}}"><template>
        <span><i>{{item}}</i> </span>
      </template></dom-repeat>
      is <b>not</b> converted to 
      <code>&lt;i18n-format&gt;</code>.
      <dom-if if="false"><template></template></dom-if>
      <dom-if if="false"><template>  </template></dom-if>
      <dom-if if="false"><template>{{text.updated}}</template></dom-if>
    </p>
    <template>
      <json-data id="authors">[
        { "name": "Joe" }, { "name": "Alice" }
      ]</json-data>
      <span id="updated">Jan 1st, 2016</span>
      <json-data id="parameters">[
        "parameter 1", "parameter 2"
      ]</json-data>
    </template>
`;
      }

      static get is() { return 'complex-compound-binding-element' }
      static get config () {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated(e) {
        console.log('complex-compound-binding-element: lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        window.setTimeout(function () {
          Array.prototype.forEach.call(this.root.querySelectorAll('i18n-format'), function (node) {
            if (!node.elements) {
              console.log('elements are missing', node);
              node.ready();
            }
            node.render();
          });
          console.log(this.is + ' local-dom-ready ');
          this.fire('local-dom-ready');
        }.bind(this), 1);
      }
    }
    customElements.define(ComplexCompoundBindingElement.is, ComplexCompoundBindingElement);
  }
  break;
case 'thin':
  {
    Define = class ComplexCompoundBindingElement extends BaseElements.I18nElement {
      static get config () {
        return {
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated(e) {
        console.log('complex-compound-binding-element: lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        window.setTimeout(function () {
          Array.prototype.forEach.call(this.root.querySelectorAll('i18n-format'), function (node) {
            if (!node.elements) {
              console.log('elements are missing', node);
              node.ready();
            }
            node.render();
          });
          console.log(this.is + ' local-dom-ready ');
          this.fire('local-dom-ready');
        }.bind(this), 1);
      }
    };
  }
  break;
case 'legacy':
  {
    Polymer$0({
      importMeta: import.meta,

      _template: html`
    <h5 id="item-update2">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <span><b>IF CONTENT</b></span>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template><!-- comment node -->
        <span>  {{item.name}}  </span>
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
      <dom-if if="true"><template></template></dom-if>
      <dom-if if="true"><template> <!-- comment --></template></dom-if>
      <dom-if if="true"><template>{{text.updated}}</template></dom-if>
    </h5>
    <h5 id="item-update3">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF</b><b>CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <h5 id="item-update4">updated: {{text.updated}}, by: 
      <dom-repeat items="{{text.authors}}"><template>
        {{item.name}} = {{text.updated}}
      </template></dom-repeat>
      xxx
      <dom-if if="true"><template>
        <b>IF CONTENT</b>
      </template></dom-if>
      <b>abc</b>
      <dom-if if="true"><template>IF CONTENT 2</template></dom-if>
      hello
    </h5>
    <p id="paragraph">A paragraph with 
      <dom-repeat items="{{text.parameters}}"><template>
        <i>{{item}} </i>
      </template></dom-repeat>
      is converted to 
      <code>&lt;i18n-format&gt;</code>.
    </p>
    <p id="paragraph2">A paragraph with deep 
      <dom-repeat items="{{text.parameters}}"><template>
        <span><i>{{item}}</i> </span>
      </template></dom-repeat>
      is <b>not</b> converted to 
      <code>&lt;i18n-format&gt;</code>.
      <dom-if if="false"><template></template></dom-if>
      <dom-if if="false"><template>  </template></dom-if>
      <dom-if if="false"><template>{{text.updated}}</template></dom-if>
    </p>
    <template>
      <json-data id="authors">[
        { "name": "Joe" }, { "name": "Alice" }
      ]</json-data>
      <span id="updated">Jan 1st, 2016</span>
      <json-data id="parameters">[
        "parameter 1", "parameter 2"
      ]</json-data>
    </template>
`,

      is: 'complex-compound-binding-element',

      behaviors: [
        BehaviorsStore.I18nBehavior
      ],

      listeners: {
        'lang-updated': '_langUpdated'
      },

      _langUpdated: function (e) {
        console.log('complex-compound-binding-element: lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        window.setTimeout(function () {
          Array.prototype.forEach.call(this.root.querySelectorAll('i18n-format'), function (node) {
            if (!node.elements) {
              console.log('elements are missing', node);
              node.ready();
            }
            node.render();
          });
          console.log(this.is + ' local-dom-ready ');
          this.fire('local-dom-ready');
        }.bind(this), 1);
      }
    });
  }
  break;
}
