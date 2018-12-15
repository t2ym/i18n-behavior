/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="preference-element">
  <template localizable-text="embedded">
    <span id="oldLang"></span>
  <template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {}
}
</json-data>
</template>
</template>
  
</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
  importMeta: import.meta,
  is: 'preference-element',

  behaviors: [
    BehaviorsStore.I18nBehavior
  ],

  listeners: {
    'lang-updated': '_langUpdated'
  },

  _langUpdated: function (e) {
    if (dom(e).rootTarget === this) {
      console.log(e.detail);
      console.log('navigator.language = ' + navigator.language);
      if (e.detail.lastLang === 'en') {
        this.$.oldLang.lang = e.detail.oldLang;
        this.fire('local-dom-ready');
      }
    }
  }
});
