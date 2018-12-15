/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="empty-element">
  <template localizable-text="embedded">
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
  is: 'empty-element',

  behaviors: [
    BehaviorsStore.I18nBehavior
  ]
});
