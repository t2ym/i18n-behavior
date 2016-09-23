/*
@license
Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
// From polymer#2.0-preview src/legacy/class.html
Polymer.Utils = Polymer.Utils || {};
Polymer.Utils.MixinBehavior = function(behavior, Base) {
  var utils = Polymer.Utils;
  var metaProps = {
    attached: true,
    detached: true,
    ready: true,
    created: true,
    beforeRegister: true,
    registered: true,
    attributeChanged: true,
    // meta objects
    behaviors: true,
    hostAttributes: true,
    properties: true,
    observers: true,
    listeners: true
  };
  var config = {
    properties: behavior.properties,
    observers: behavior.observers
  };

  class PolymerGenerated extends Base {

    static get config() {
      return config;
    }

    _invokeFunction(fn, args) {
      if (fn) {
        fn.apply(this, args);
      }
    }

    constructor() {
      super();
      // call `registered` only if it was not called for *this* constructor
      if (!PolymerGenerated.hasOwnProperty('__registered')) {
        PolymerGenerated.__registered = true;
        if (behavior.registered) {
          behavior.registered.call(Object.getPrototypeOf(this));
        }
      }
    }

    created() {
      super.created();
      this._invokeFunction(behavior.created);
    }

    _applyConfigMetaData() {
      super._applyConfigMetaData();
      this._applyConfigMetaDataFrom(behavior);
    }

    _applyListeners() {
      super._applyListeners();
      this._applyConfigListeners(behavior);
    }

    _ensureAttributes() {
      // ensure before calling super so that subclasses can override defaults
      this._ensureConfigAttributes(behavior);
      super._ensureAttributes();
    }

    ready() {
      super.ready();
      this._invokeFunction(behavior.ready);
    }

    attached() {
      super.attached();
      this._invokeFunction(behavior.attached);
    }

    detached() {
      super.detached();
      this._invokeFunction(behavior.detached);
    }

    attributeChanged(name, old, value) {
      super.attributeChanged(name, old, value);
      this._invokeFunction(behavior.attributeChanged, [name, old, value]);
    }
  }

  for (var p in behavior) {
    if (!(p in metaProps))
      utils.copyOwnProperty(p, behavior, PolymerGenerated.prototype);
  }

  return PolymerGenerated;
}