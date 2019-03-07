/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2019, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
/**
The singleton element `<i18n-preference>` maintains user preference for `i18n-behavior`.
The element is automatically attached at the end of `<body>` element when it is not
included in the root html document.

It just initializes `<html lang>` attribute with `navigator.language` value
unless `<i18n-preference persist>` attribute is specified.

It stores the value of `<html lang>` attribute into localstorage named `i18n-behavior-preference`
when `<i18n-preference persist>` attribute is specified.

The stored value is synchronized with that of `<html lang>` attribute on changes.

- - -

### TODO

- Per-user preference handling for application.

@group I18nBehavior
@element i18n-preference
*/
import { polyfill } from 'wc-putty/polyfill.js';

// html element of this document
export const html = document.querySelector('html');
// app global default language
export const defaultLang = html.hasAttribute('lang') ? html.getAttribute('lang') : '';

export class I18nPreference extends polyfill(HTMLElement) {
  static get importMeta() {
    return import.meta;
  }

  static get is() {
    return 'i18n-preference';
  }

  static get observedAttributes() {
    return [ 'persist' ];
  }

  constructor() {
    super();
    /**
     * Key of localStorage
     */
    this._storageKey = 'i18n-behavior-preference';
    /**
     * Persistence of preference 
     */
    this.persist = this.hasAttribute('persist');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
    case 'persist':
      this.persist = this.hasAttribute(name);
      //console.log(`attributeChangedCallback name="${name}" oldValue="${oldValue}" newValue="${newValue}" this.persist=${this.persist}`);
      break;
    /* istanbul ignore next */
    default:
      /* istanbul ignore next */
      break;
    }
  }

  get persist() {
    return this._persist;
  }
  set persist(value) {
    this._persist = value;
    this._update();
  }

  get value() {
    return JSON.parse(window.localStorage.getItem(this._storageKey));
  }
  set value(_value) {
    //console.log('save', _value, 'this.value', this.value);
    this._lastSavedValue = _value;
    if (_value === undefined || _value === null) {
      window.localStorage.removeItem(this._storageKey);
    }
    else {
      window.localStorage.setItem(this._storageKey, JSON.stringify(_value));
    }
  }

  /**
   * Connected callback to initialize html.lang and its observation
   */
  connectedCallback() {
    this._update();
    this._observe();
  }

  /**
   * Disconnected callback to disconnect html.lang observation
   */
  disconnectedCallback() {
    this._disconnect();
  }

  _update() {
    //console.log(`_update persist=${this.persist} <html lang=${html.getAttribute('lang')}> <html preferred=${html.hasAttribute('preferred')}> value="${this.value}"(type: ${typeof this.value})`);
    if (this.persist) {
      if (this.value === null) {
        if (this.isInitialized) {
          // store html.lang value
          if (this.value !== html.getAttribute('lang')) {
            this.value = html.getAttribute('lang');
          }
        }
        else {
          if (html.hasAttribute('preferred')) {
            if (this.value !== html.getAttribute('lang')) {
              this.value = html.getAttribute('lang');
            }
          }
          else {
            let value = navigator.language;
            if (this.value !== value) {
              this.value = value;
            }
            if (html.getAttribute('lang') !== value) {
              html.setAttribute('lang', value);
            }
          }
          this.isInitialized = true;
        }
      }
      else {
        // preferred attribute in html to put higher priority
        // in the default html language than navigator.language
        if (html.hasAttribute('preferred')) {
          if (this.value !== defaultLang) {
            // overwrite the storage by the app default language
            this.value = defaultLang;
          }
          if (html.getAttribute('lang') !== defaultLang) {
            // reset to the defaultLang if preferred
            // Note: defaultLang does not change from the initial value at the loading
            html.setAttribute('lang', defaultLang);
          }
        }
        else {
          // load the value from the storage
          html.setAttribute('lang', this.value);
        }
      }
    }
    else {
      if (this.value !== null) {
        this.value = null;
      }
      // set html lang with navigator.language
      if (!html.hasAttribute('preferred')) {
        html.setAttribute('lang', navigator.language);
      }
    }
  }

  /**
   * Handle attribute value changes on html
   *
   * @param {MutationRecord[]} mutations Array of MutationRecords for html.lang
   *
   * Note: 
   *   - Bound to this element
   */
  _htmlLangMutationObserverCallback(mutations) {
    mutations.forEach(function(mutation) {
      switch (mutation.type) {
      case 'attributes':
        if (mutation.attributeName === 'lang') {
          if (this.persist) {
            if (this.value !== mutation.target.getAttribute('lang')) {
              this.value = mutation.target.getAttribute('lang');
            }
          }
          else {
            if (this.value !== null) {
              this.value = null;
            }
          }
        }
        break;
      /* istanbul ignore next: mutation.type is always attributes */
      default:
        /* istanbul ignore next: mutation.type is always attributes */
        break;
      }
    }.bind(this));
  }

  /**
   * "storage" event handler
   */
  _onStorageEvent(event) {
    //console.log(`_onStorageEvent: key="${event.key}" oldValue="${event.oldValue}"(type:${typeof event.oldValue}) newValue="${event.newValue}"(type:${typeof event.newValue}) url="${event.url}" storageArea="${JSON.stringify(event.storageArea)}"`);
    // Note: IE11 dispatches unnecessary storage events even from the same window with obsolete event.newValue
    if (event.key === this._storageKey && event.newValue === JSON.stringify(this.value) && event.newValue !== JSON.stringify(this._lastSavedValue)) {
      this._update();
    }
  }

  /**
   * Set up html.lang mutation observer
   */
  _observe() {
    // observe html lang mutations
    if (!this._htmlLangMutationObserver) {
      this._htmlLangMutationObserverCallbackBindThis = 
        this._htmlLangMutationObserverCallback.bind(this);
      this._htmlLangMutationObserver =
        new MutationObserver(this._htmlLangMutationObserverCallbackBindThis);
    }
    this._htmlLangMutationObserver.observe(html, { attributes: true });
    // set up StorageEvent handler
    if (!this._onStorageEventBindThis) {
      this._onStorageEventBindThis = this._onStorageEvent.bind(this);
    }
    window.addEventListener('storage', this._onStorageEventBindThis);
  }

  /**
   * Disconnect html.lang mutation observer
   */
  _disconnect() {
    if (this._htmlLangMutationObserver) {
      this._htmlLangMutationObserver.disconnect();
    }
    // tear down StorageEvent handler, using _onStorageEventBindThis as a status indicator
    if (this._onStorageEventBindThis) {
      window.removeEventListener('storage', this._onStorageEventBindThis);
      this._onStorageEventBindThis = null;
    }
  }
}
customElements.define(I18nPreference.is, I18nPreference);
