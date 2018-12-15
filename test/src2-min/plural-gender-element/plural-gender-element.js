/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import '../../../i18n-behavior.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Polymer as Polymer$0 } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<template id="plural-gender-element">
    <p>
      <i18n-format id="compound-format-text" on-rendered="_rendered">
        <json-data>{
          "0": "You ({3}) gave no gifts.",
          "1": {
            "male": "You ({3}) gave him ({4}) {5}.",
            "female": "You ({3}) gave her ({4}) {5}.",
            "other": "You ({3}) gave them ({4}) {5}."
          },
          "one": {
            "male": "You ({3}) gave him ({4}) and one other person {5}.",
            "female": "You ({3}) gave her ({4}) and one other person {5}.",
            "other": "You ({3}) gave them ({4}) and one other person {5}."
          },
          "other": "You ({3}) gave them ({4}) and {1} other people gifts."
        }</json-data>
        <i18n-number offset="1">{{recipients.length}}</i18n-number>
        <span>{{recipients.0.gender}}</span>
        <span>{{sender.name}}</span>
        <span>{{recipients.0.name}}</span>
        <span>a gift</span>
      </i18n-format>
    </p>
  </template>`;

document.head.appendChild($_documentContainer.content);
switch (syntax) {
default:
case 'mixin':
  {
    class PluralGenderElement extends Mixins.Localizable(Polymer.LegacyElement) {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <p>
      <i18n-format id="compound-format-text" on-rendered="_rendered">
        <json-data>{
          "0": "You ({3}) gave no gifts.",
          "1": {
            "male": "You ({3}) gave him ({4}) {5}.",
            "female": "You ({3}) gave her ({4}) {5}.",
            "other": "You ({3}) gave them ({4}) {5}."
          },
          "one": {
            "male": "You ({3}) gave him ({4}) and one other person {5}.",
            "female": "You ({3}) gave her ({4}) and one other person {5}.",
            "other": "You ({3}) gave them ({4}) and one other person {5}."
          },
          "other": "You ({3}) gave them ({4}) and {1} other people gifts."
        }</json-data>
        <i18n-number offset="1">{{recipients.length}}</i18n-number>
        <span>{{recipients.0.gender}}</span>
        <span>{{sender.name}}</span>
        <span>{{recipients.0.name}}</span>
        <span>a gift</span>
      </i18n-format>
    </p>
`;
      }

      static get is() { return 'plural-gender-element' }
      static get config () {
        return {
          properties: {
            sender: {
              type: Object
            },
            recipients: {
              type: Array
            }
          },
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated(e) {
        console.log('plural-gender-element lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
        if (this.renderedEffectiveLang === this.effectiveLang ||
            (this.renderedEffectiveLang === '' && this.effectiveLang === 'en')) {
          this.fire('local-dom-ready');
        }
      }

      _rendered() {
        console.log('plural-gender-element rendered lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (this.lang === this.effectiveLang) {
          this.fire('local-dom-ready');
        }
        else {
          this.renderedEffectiveLang = this.effectiveLang;
        }
      }
    }
    customElements.define(PluralGenderElement.is, PluralGenderElement);
  }
  break;
case 'base-element':
  {
    class PluralGenderElement extends BaseElements.I18nElement {
      static get importMeta() {
        return import.meta;
      }

      static get template() {
        return html`
    <p>
      <i18n-format id="compound-format-text" on-rendered="_rendered">
        <json-data>{
          "0": "You ({3}) gave no gifts.",
          "1": {
            "male": "You ({3}) gave him ({4}) {5}.",
            "female": "You ({3}) gave her ({4}) {5}.",
            "other": "You ({3}) gave them ({4}) {5}."
          },
          "one": {
            "male": "You ({3}) gave him ({4}) and one other person {5}.",
            "female": "You ({3}) gave her ({4}) and one other person {5}.",
            "other": "You ({3}) gave them ({4}) and one other person {5}."
          },
          "other": "You ({3}) gave them ({4}) and {1} other people gifts."
        }</json-data>
        <i18n-number offset="1">{{recipients.length}}</i18n-number>
        <span>{{recipients.0.gender}}</span>
        <span>{{sender.name}}</span>
        <span>{{recipients.0.name}}</span>
        <span>a gift</span>
      </i18n-format>
    </p>
`;
      }

      static get is() { return 'plural-gender-element' }
      static get config () {
        return {
          properties: {
            sender: {
              type: Object
            },
            recipients: {
              type: Array
            }
          },
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated(e) {
        console.log('plural-gender-element lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
        if (this.renderedEffectiveLang === this.effectiveLang ||
            (this.renderedEffectiveLang === '' && this.effectiveLang === 'en')) {
          this.fire('local-dom-ready');
        }
      }

      _rendered() {
        console.log('plural-gender-element rendered lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (this.lang === this.effectiveLang) {
          this.fire('local-dom-ready');
        }
        else {
          this.renderedEffectiveLang = this.effectiveLang;
        }
      }
    }
    customElements.define(PluralGenderElement.is, PluralGenderElement);
  }
  break;
case 'thin':
  {
    Define = class PluralGenderElement extends BaseElements.I18nElement {
      static get config () {
        return {
          properties: {
            sender: {
              type: Object
            },
            recipients: {
              type: Array
            }
          },
          listeners: {
            'lang-updated': '_langUpdated'
          }          
        }
      }

      _langUpdated(e) {
        console.log('plural-gender-element lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
        if (this.renderedEffectiveLang === this.effectiveLang ||
            (this.renderedEffectiveLang === '' && this.effectiveLang === 'en')) {
          this.fire('local-dom-ready');
        }
      }

      _rendered() {
        console.log('plural-gender-element rendered lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (this.lang === this.effectiveLang) {
          this.fire('local-dom-ready');
        }
        else {
          this.renderedEffectiveLang = this.effectiveLang;
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
    <p>
      <i18n-format id="compound-format-text" on-rendered="_rendered">
        <json-data>{
          "0": "You ({3}) gave no gifts.",
          "1": {
            "male": "You ({3}) gave him ({4}) {5}.",
            "female": "You ({3}) gave her ({4}) {5}.",
            "other": "You ({3}) gave them ({4}) {5}."
          },
          "one": {
            "male": "You ({3}) gave him ({4}) and one other person {5}.",
            "female": "You ({3}) gave her ({4}) and one other person {5}.",
            "other": "You ({3}) gave them ({4}) and one other person {5}."
          },
          "other": "You ({3}) gave them ({4}) and {1} other people gifts."
        }</json-data>
        <i18n-number offset="1">{{recipients.length}}</i18n-number>
        <span>{{recipients.0.gender}}</span>
        <span>{{sender.name}}</span>
        <span>{{recipients.0.name}}</span>
        <span>a gift</span>
      </i18n-format>
    </p>
`,

      is: 'plural-gender-element',

      behaviors: [
        BehaviorsStore.I18nBehavior
      ],

      properties: {
        sender: {
          type: Object
        },
        recipients: {
          type: Array
        }
      },

      listeners: {
        'lang-updated': '_langUpdated'
      },

      _langUpdated: function (e) {
        console.log('plural-gender-element lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (e.composedPath()[0] === this) {
          this.model = deepcopy(this.text.model);
        }
        if (this.renderedEffectiveLang === this.effectiveLang ||
            (this.renderedEffectiveLang === '' && this.effectiveLang === 'en')) {
          this.fire('local-dom-ready');
        }
      },

      _rendered: function () {
        console.log('plural-gender-element rendered lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
        if (this.lang === this.effectiveLang) {
          this.fire('local-dom-ready');
        }
        else {
          this.renderedEffectiveLang = this.effectiveLang;
        }
      }
    });
  }
  break;
}
