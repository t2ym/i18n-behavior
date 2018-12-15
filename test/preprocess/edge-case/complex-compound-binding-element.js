/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="complex-compound-binding-element">
  <template localizable-text="embedded">
    <h5 id="item-update2"><i18n-format lang="{{effectiveLang}}"><span>{{text.item-update2:text.0}}</span><span param="1">{{text.updated}}</span></i18n-format><template is="dom-repeat" items="{{text.authors}}">
        {{item.name}}
      </template>{{text.item-update2:text_2}}<template is="dom-if" if="true">
        <span><b>{{text.item-update2:template_3:span:b}}</b></span>
      </template>
      <b>{{text.item-update2:b_4}}</b>
      <template is="dom-if" if="true">{{text.item-update2:template_5:text}}</template>{{text.item-update2:text_6}}</h5>
    <h5 id="item-update"><i18n-format lang="{{effectiveLang}}"><span>{{text.item-update.0}}</span><span param="1">{{text.updated}}</span><template is="dom-repeat" items="{{text.authors}}"><!-- comment node -->
        <span param="2">  {{item.name}}  </span>
      </template><template is="dom-if" if="true">
        <b param="3">{{text.item-update.3}}</b>
      </template><b param="4">{{text.item-update.4}}</b><template is="dom-if" if="true"><span param="5">{{text.item-update.5}}</span></template><template is="dom-if" if="true"><!-- comment --><span param="6"> </span></template><template is="dom-if" if="true"><span param="7">{{text.updated}}</span></template></i18n-format></h5>
    <h5 id="item-update3"><i18n-format lang="{{effectiveLang}}"><span>{{text.item-update3:text.0}}</span><span param="1">{{text.updated}}</span></i18n-format><template is="dom-repeat" items="{{text.authors}}">
        {{item.name}}
      </template>{{text.item-update3:text_2}}<template is="dom-if" if="true">
        <b>{{text.item-update3:template_3:b}}</b><b>{{text.item-update3:template_3:b_1}}</b>
      </template>
      <b>{{text.item-update3:b_4}}</b>
      <template is="dom-if" if="true">{{text.item-update3:template_5:text}}</template>{{text.item-update3:text_6}}</h5>
    <h5 id="item-update4"><i18n-format lang="{{effectiveLang}}"><span>{{text.item-update4:text.0}}</span><span param="1">{{text.updated}}</span></i18n-format><template is="dom-repeat" items="{{text.authors}}"><i18n-format lang="{{effectiveLang}}"><span>{{text.item-update4:template_1:text.0}}</span><span param="1">{{item.name}}</span><span param="2">{{text.updated}}</span></i18n-format></template>{{text.item-update4:text_2}}<template is="dom-if" if="true">
        <b>{{text.item-update4:template_3:b}}</b>
      </template>
      <b>{{text.item-update4:b_4}}</b>
      <template is="dom-if" if="true">{{text.item-update4:template_5:text}}</template>{{text.item-update4:text_6}}</h5>
    <p id="paragraph"><i18n-format lang="{{effectiveLang}}"><span>{{text.paragraph.0}}</span><template is="dom-repeat" items="{{text.parameters}}">
        <i param="1">{{item}} </i>
      </template><code param="2">{{text.paragraph.2}}</code></i18n-format></p>
    <p id="paragraph2">{{text.paragraph2:text}}<template is="dom-repeat" items="{{text.parameters}}">
        <span><i>{{item}}</i> </span>
      </template>{{text.paragraph2:text_2}}<b>{{text.paragraph2:b_3}}</b>{{text.paragraph2:text_4}}<code>{{text.paragraph2:code_5}}</code>{{text.paragraph2:text_6}}<template is="dom-if" if="false"></template>
      <template is="dom-if" if="false">  </template>
      <template is="dom-if" if="false">{{text.updated}}</template>
    </p>
    <template>
      <json-data id="authors">{{text.authors}}</json-data>
      <span id="updated">{{text.updated}}</span>
      <json-data id="parameters">{{text.parameters}}</json-data>
    </template>
  <template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "item-update2:text": [
    "updated: {1}, by: ",
    "{{text.updated}}"
  ],
  "item-update2:text_2": " xxx ",
  "item-update2:template_3:span:b": "IF CONTENT",
  "item-update2:b_4": "abc",
  "item-update2:template_5:text": "IF CONTENT 2",
  "item-update2:text_6": " hello ",
  "item-update": [
    "updated: {1}, by: \\n      {2}\\n      xxx\\n      {3}\\n      {4}\\n      {5}\\n      hello\\n      \\n      {6}\\n      {7} ",
    "{{text.updated}}",
    "  {{item.name}}  ",
    "IF CONTENT",
    "abc",
    "IF CONTENT 2",
    "&lt;template&gt;",
    "{{text.updated}}"
  ],
  "item-update3:text": [
    "updated: {1}, by: ",
    "{{text.updated}}"
  ],
  "item-update3:text_2": " xxx ",
  "item-update3:template_3:b": "IF",
  "item-update3:template_3:b_1": "CONTENT",
  "item-update3:b_4": "abc",
  "item-update3:template_5:text": "IF CONTENT 2",
  "item-update3:text_6": " hello ",
  "item-update4:text": [
    "updated: {1}, by: ",
    "{{text.updated}}"
  ],
  "item-update4:template_1:text": [
    " {1} = {2} ",
    "{{item.name}}",
    "{{text.updated}}"
  ],
  "item-update4:text_2": " xxx ",
  "item-update4:template_3:b": "IF CONTENT",
  "item-update4:b_4": "abc",
  "item-update4:template_5:text": "IF CONTENT 2",
  "item-update4:text_6": " hello ",
  "paragraph": [
    "A paragraph with \\n      {1}\\n      is converted to \\n      {2}. ",
    "{{item}} ",
    "&lt;i18n-format&gt;"
  ],
  "paragraph2:text": "A paragraph with deep ",
  "paragraph2:text_2": " is ",
  "paragraph2:b_3": "not",
  "paragraph2:text_4": " converted to ",
  "paragraph2:code_5": "&lt;i18n-format&gt;",
  "paragraph2:text_6": ". ",
  "authors": [
    {
      "name": "Joe"
    },
    {
      "name": "Alice"
    }
  ],
  "updated": "Jan 1st, 2016",
  "parameters": [
    "parameter 1",
    "parameter 2"
  ]
}
</json-data>
</template>
</template>
  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
  importMeta: import.meta,
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
