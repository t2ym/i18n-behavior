/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="item-element">
    <span id="label">A</span>
  </template>`;

document.head.appendChild($_documentContainer.content);
switch (syntax) {
default:
case 'mixin':
  {
    class ItemElement extends Mixins.Localizable(Polymer.LegacyElement) {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <span id="label">A</span>
`;
      }

      static get is() { return 'item-element' }
    }
    customElements.define(ItemElement.is, ItemElement);
  }
  break;
case 'base-element':
  {
    class ItemElement extends BaseElements.I18nElement {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <span id="label">A</span>
`;
      }

      static get is() { return 'item-element' }
    }
    customElements.define(ItemElement.is, ItemElement);
  }
  break;
case 'thin':
  {
    Define = class ItemElement extends BaseElements.I18nElement {
    }
  }
  break;
case 'legacy':
  {
    Polymer$0({
      importMeta: import.meta,

      _template: html`
    <span id="label">A</span>
`,

      is: 'item-element',

      behaviors: [
        BehaviorsStore.I18nBehavior
      ]
    });
  }
  break;
}
