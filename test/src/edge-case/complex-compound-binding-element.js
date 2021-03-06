/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
Polymer({
  importMeta: import.meta,

  _template: html`
    <h5 id="item-update2">updated: {{text.updated}}, by: 
      <template is="dom-repeat" items="{{text.authors}}">
        {{item.name}}
      </template>
      xxx
      <template is="dom-if" if="true">
        <span><b>IF CONTENT</b></span>
      </template>
      <b>abc</b>
      <template is="dom-if" if="true">IF CONTENT 2</template>
      hello
    </h5>
    <h5 id="item-update">updated: {{text.updated}}, by: 
      <template is="dom-repeat" items="{{text.authors}}"><!-- comment node -->
        <span>  {{item.name}}  </span>
      </template>
      xxx
      <template is="dom-if" if="true">
        <b>IF CONTENT</b>
      </template>
      <b>abc</b>
      <template is="dom-if" if="true">IF CONTENT 2</template>
      hello
      <template is="dom-if" if="true"></template>
      <template is="dom-if" if="true"> <!-- comment --></template>
      <template is="dom-if" if="true">{{text.updated}}</template>
    </h5>
    <h5 id="item-update3">updated: {{text.updated}}, by: 
      <template is="dom-repeat" items="{{text.authors}}">
        {{item.name}}
      </template>
      xxx
      <template is="dom-if" if="true">
        <b>IF</b><b>CONTENT</b>
      </template>
      <b>abc</b>
      <template is="dom-if" if="true">IF CONTENT 2</template>
      hello
    </h5>
    <h5 id="item-update4">updated: {{text.updated}}, by: 
      <template is="dom-repeat" items="{{text.authors}}">
        {{item.name}} = {{text.updated}}
      </template>
      xxx
      <template is="dom-if" if="true">
        <b>IF CONTENT</b>
      </template>
      <b>abc</b>
      <template is="dom-if" if="true">IF CONTENT 2</template>
      hello
    </h5>
    <p id="paragraph">A paragraph with 
      <template is="dom-repeat" items="{{text.parameters}}">
        <i>{{item}} </i>
      </template>
      is converted to 
      <code>&lt;i18n-format&gt;</code>.
    </p>
    <p id="paragraph2">A paragraph with deep 
      <template is="dom-repeat" items="{{text.parameters}}">
        <span><i>{{item}}</i> </span>
      </template>
      is <b>not</b> converted to 
      <code>&lt;i18n-format&gt;</code>.
      <template is="dom-if" if="false"></template>
      <template is="dom-if" if="false">  </template>
      <template is="dom-if" if="false">{{text.updated}}</template>
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

  properties: {
  },

  observers: [
  ],

  listeners: {
    'lang-updated': '_langUpdated'
  },

  ready: function () {
    //this.observeHtmlLang = false;
    //console.log('complex-compound-binding-element addEventLister rendered');
    this.addEventListener('rendered', this._rendered.bind(this));
    this.addEventListener('dom-change', this._domChange.bind(this));
  },

  attached: function () {
    //console.log('complex-compound-binding-element attached');
    this._isAttached = true;
  },

  detached: function () {
    //console.log('complex-compound-binding-element detached');
    this._isAttached = false;
  },

  _langUpdated: function (e) {
    //console.log('complex-compound-binding-element: lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
    if (this._isAttached &&
        dom(e).rootTarget === this &&
        this.effectiveLang === this.lang) {
      this.model = deepcopy(this.text.model);
      Array.prototype.forEach.call(dom(this.root).querySelectorAll('template[is="dom-repeat"]'),
        function (node) {
          node.render();
        }
      );
      Array.prototype.forEach.call(dom(this.root).querySelectorAll('template[is="dom-if"]'),
        function (node) {
          node.render();
        }
      );
      this._updateRenderStatus();
      //console.log('complex-compound-binding-element renderStatus = ' + JSON.stringify(this._renderStatus));
      if (this._renderStatus &&
          this._renderStatus['item-update'] === this.effectiveLang &&
          this._renderStatus['item-update2'] === this.effectiveLang &&
          this._renderStatus['item-update3'] === this.effectiveLang &&
          this._renderStatus['item-update4'] === this.effectiveLang &&
          this._renderStatus['paragraph'] === this.effectiveLang) {
        window.setTimeout(function () {
          console.log('complex-compound-binding-element: ', this);
          console.log('complex-compound-binding-element: local-dom-ready');
          this.fire('local-dom-ready');
        }.bind(this), 1);
      }
      else {
        var isStandardPropertyConfigurable = (function () {
          var langPropertyDescriptor = Object.getOwnPropertyDescriptor(document.createElement('span'), 'lang');
          return !langPropertyDescriptor || langPropertyDescriptor.configurable;
        })();
        if (!isStandardPropertyConfigurable) {
          // Safari 7
          var en = 'en';
          if (this._renderStatus &&
            this._renderStatus['item-update'] === en &&
            this._renderStatus['item-update2'] === en &&
            this._renderStatus['item-update3'] === en &&
            this._renderStatus['item-update4'] === en &&
            this._renderStatus['paragraph'] === en &&
            this.effectiveLang === this.lang) {
            window.setTimeout(function () {
              console.log('complex-compound-binding-element: ', this);
              console.log('complex-compound-binding-element: local-dom-ready');
              this.fire('local-dom-ready');
            }.bind(this), 1);
          }
        }
      }
    }
  },

  _updateRenderStatus: function () {
    dom(this.root).querySelectorAll('i18n-format').forEach(function (fmt) {
      var id = dom(fmt).parentNode.id;
      if (fmt.lang === this.effectiveLang &&
          fmt.lastTemplateText) {
        dom(fmt.root).querySelectorAll('template[is="dom-if"]').forEach(function (node) {
          node.render();
        }.bind(this));
        dom(fmt.root).querySelectorAll('template[is="dom-repeat"]').forEach(function (node) {
          node.render();
        }.bind(this));
        this._renderStatus = this._renderStatus || {};
        this._renderStatus[id] = fmt.lang;
      }
    }.bind(this));
    dom(this.root).querySelectorAll('template[is="dom-if"]').forEach(function (node) {
      node.render();
    }.bind(this));
    dom(this.root).querySelectorAll('template[is="dom-repeat"]').forEach(function (node) {
      node.render();
    }.bind(this));
  },

  _rendered: function (e) {
    var target = dom(e).rootTarget;
    this._renderStatus = this._renderStatus || {};
    var id = dom(target).parentNode.id;
    //console.log('complex-compound-binding-element: _rendered id = ' + id + ' lang = ' + target.lang);
    this._renderStatus[id] = target.lang;
    this._updateRenderStatus();
    if (this._renderStatus['item-update'] === this.effectiveLang &&
        this._renderStatus['item-update2'] === this.effectiveLang &&
        this._renderStatus['item-update3'] === this.effectiveLang &&
        this._renderStatus['item-update4'] === this.effectiveLang &&
        this._renderStatus['paragraph'] === this.effectiveLang) {
      window.setTimeout(function () {
        //console.log('complex-compound-binding-element: ', this);
        //console.log('complex-compound-binding-element: local-dom-ready');
        this.fire('local-dom-ready');
      }.bind(this), 1);
    }
  },

  _domChange: function (e) {
    var target = dom(e).rootTarget;
    this._renderStatus = this._renderStatus || {};
    var id = dom(target).parentNode.id;
    if (target.parentNode && target.parentNode.parentNode && target.parentNode.parentNode.id === 'item-update') {
      //console.log('complex-compound-binding-element: _domChange id = ' + id + ' is = ' + target.is + ' items = ' +
      //  (target.items ? JSON.stringify(target.items) : '') +
      //  ' renderedItemCount = ' + target.renderedItemCount);
    }
    if (target.items && target.renderedItemCount === target.items.length) {
      var i;
      var cursor = target;
      for (i = 0; i < target.items.length; i++) {
        cursor = cursor.previousElementSibling ? cursor.previousElementSibling : cursor.previousSibling;
        if (target.parentNode && target.parentNode.parentNode && target.parentNode.parentNode.id === 'item-update') {
          //console.log('complex-compound-binding-element: _domChange: i = ' + i + ' ' + (cursor ? cursor.textContent : '') +
          //  'itemForElement(cursor) = ', target.itemForElement(cursor) ? JSON.stringify(target.itemForElement(cursor)) : '');
        }
      }
    }
  }
});
