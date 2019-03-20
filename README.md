[![Build Status](https://travis-ci.org/t2ym/i18n-behavior.svg?branch=master)](https://travis-ci.org/t2ym/i18n-behavior)
[![Coverage Status](https://coveralls.io/repos/github/t2ym/i18n-behavior/badge.svg?branch=master)](https://coveralls.io/github/t2ym/i18n-behavior?branch=master)
[![npm](https://img.shields.io/npm/v/i18n-behavior.svg)](https://www.npmjs.com/package/i18n-behavior)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/t2ym/i18n-behavior)

# i18n-behavior

Instant and Modular I18N engine for [`lit-html`](https://lit-html.polymer-project.org/) and [Polymer](https://polymer-library.polymer-project.org/)

`html`\`\` tagged template literal API is provided by [`i18n-element`](https://github.com/t2ym/i18n-element)

## Compatible Versions

- Polymer library (`@polymer/polymer` NPM package) is configured as a **peer** dependency since 4.0.0
- Polymer elements using `I18nBehavior` must depend on `@polymer/polymer` NPM package themselves

| i18n-behavior  | i18n-element   | Polymer | lit-html |
|:---------------|:---------------|:--------|:---------|
| 4.x            | 4.x            | 3.x (optional) | 1.x      |
| 3.x            | 3.x            | 3.x (mandatory) | 1.x      |
| 2.x            | 2.x            | 1.x-2.x | -        |
| 1.x            | -              | 1.x     | -        |

- [Changelog](https://github.com/t2ym/i18n-behavior/blob/master/CHANGELOG.md)

## Browser Compatibility

| Browser   | Chrome  | Firefox  | Edge 13+  | IE 11  | Safari 10+ | Chrome Android  | Mobile Safari  | Opera  |
|:----------|:-------:|:--------:|:---------:|:------:|:---------:|:---------------:|:--------------:|:------:|
| Supported | ✔       | ✔        | ✔         | ✔      | ✔         | ✔               | ✔              | ✔      |

- Polyfilled by `@webcomponents/webcomponentsjs/webcomponents-{bundle|loader}.js`

## Conceptual Workflow

- `demo/gulpfile.js` provides support for extracting UI strings from `html` tagged template literals in JavaScript sources as well as Polymer HTML templates in HTML Imports

<img src="https://raw.githubusercontent.com/wiki/t2ym/i18n-behavior/PolymerI18nFlow.gif" width="768px">

## Install

```sh
    npm install i18n-behavior
```

## Import for Polymer elements

```js
    import { I18nBehavior } from 'i18n-behavior/i18n-behavior.js'
```

## Quick Tour

[I18N-ready `pwa-starter-kit`](https://github.com/t2ym/pwa-starter-kit)

```sh
    npm install -g polymer-cli
    git clone https://github.com/t2ym/pwa-starter-kit
    cd pwa-starter-kit
    npm ci
    # Add Locales
    gulp locales --targets="de es fr ja zh-Hans"
    # I18N Process
    gulp
    # Translate XLIFF ./xliff/bundle.*.xlf
    # Merge Translation
    gulp
    # Dev build on http://localhost:8080
    polymer serve
    # Static build
    polymer build
    # Static build on http://localhost:8080
    cd build/{esm-unbundled|esm-bundled|es6-bundled|es5-bundled}
    python -m SimpleHTTPServer -p 8080
```

## Usage in Polymer legacy syntax

- [API Docs](https://t2ym.github.io/i18n-behavior/)
- [Demo](https://t2ym.github.io/i18n-behavior/demo/preprocess/)
- ES6 class syntax support is provided by [`i18n-element`](https://github.com/t2ym/i18n-element)

### Run-time Automatic I18N

Apply `BehaviorsStore.I18nBehavior` or imported `I18nBehavior`

#### Source Code

```js
    // Legacy Polymer syntax
    Polymer({
      importMeta: import.meta,
      is: 'custom-element',
      _template: html`
        <span id="label">UI text label</span> <!-- no need to touch UI text strings -->
      `,
      behaviors: [
        I18nBehavior // Add this line for I18N
      ]
    });
```

#### I18N-ready preprocessed DOM at element registration

Hard-coded UI text strings are automatically extracted and replaced with annotations bound to `text` object.

`lang` attribute specifies the current locale. By default, `<html lang>` attribute is observed and
mirrored to those for I18N-ready element instances.

```html
    <html lang="en"><!-- html lang attribute is observed and mirrored -->
      ...
      <custom-element lang="en">
        <span id="label">{{text.label}}</span><!-- UI texts are bound to text object -->
      </custom-element>
      ...
    </html>
```

If the containing element of the target text has `id` attribute, the string id is named with the `id` value.
If not, the string id is automatically generated. It is recommended to put meaningful `id` to each string 
for robustness. When attaching `id` attribute is too much for the containing element, `text-id` attribute can be used instead.

```html
    <span text-id="label">{{text.label}}</span>
```

#### `text` dynamic property

`this.text` dynamic object property represents an object with UI text strings for the current locale.

```javascript
    this.text = {
      "label": "UI Text Label"
    }
```

`this.text` dynamic object is SHARED among all the instances of the same custom element.

#### `model` dynamic property

`this.model` is deepcopied from `this.text.model` per instance to store I18N target attribute values.
UI text strings in I18N target attributes are automatically extracted and replaced with annotations
according to the shared repository (`i18n-attr-repo`) of I18N target attributes per elements 
(like `placeholder` attribute of `input` element).

On `lang-updated` event, `this.text.model` is updated but `this.model` is NOT automatically updated
and needs explicit update like this.

```javascript
    listeners: {
      'lang-updated': '_langUpdated'
    },

    _langUpdated: function (event) {
      if (Polymer.dom(event).rootTarget === this) {
        this.model = deepcopy(this.text.model);
      }
    }
```

#### `<json-data>` for manual text definitions

Optionally, any JSON data can be manually added to I18N target strings via `<json-data>` element.
This option is effective for manual extraction of hard-coded UI text strings in JavaScript literals.

```html
  <dom-module id="my-element">
    <template>
      ... <!-- ordinary template for rendering -->
      <template><!-- containing template element to avoid rendering -->
        <json-data id="items">[
          "Responsive Web App boilerplate",
          "Iron Elements and Paper Elements",
          "End-to-end Build Tooling (including Vulcanize)",
          "Unit testing with Web Component Tester",
          "Routing with Page.js",
          "Offline support with the Platinum Service Worker Elements"
        ]</json-data>
        <json-data id="sender">{ "name": "Sam", "gender": "male" }</json-data>
      </template>
    </template>
    <script>
    ...
    this.text.items[0] === 'Responsive Web App boilerplate'
    this.text.sender.name === 'Sam'
    ...
    </script>
  </dom-module>
```

#### Localized text strings fetched from JSON

While default text strings are extracted from the hard-coded strings in HTML template,
localized text strings are asynchronously fetched from JSON files under `locales` directory at the server.

```
    /bundle.json
    /locales/bundle.ja.json
            /bundle.fr.json
            /bundle.zh-Hans.json
    
    /elements/my-list/my-list.json
                     /locales/my-list.ja.json
                             /my-list.zh-Hans.json
    
             /google-chart-demo/google-chart-demo.json
                               /locales/google-chart-demo.ja.json
                                       /google-chart-demo.fr.json
```

### Build-time Automatic I18N

[`gulp-i18n-preprocess`](https://github.com/t2ym/gulp-i18n-preprocess) filter performs build-time automatic I18N and embeds UI texts as JSON.

I18N-ready Source Code preprocessed by [`gulp-i18n-preprocess`](https://github.com/t2ym/gulp-i18n-preprocess):

```html
    <dom-module id="custom-element">
      <template localizable-text="embedded">
        <span id="label">{{text.label}}</span>
        <template id="localizable-text">
          <json-data>{
            "label": "UI Text Label"
          }</json-data>
        </template>
      </template>
    </dom-module>
```

Default text values are immediately extracted from the embedded JSON 
without overheads of run-time traversal into the whole template.

## License

[BSD-2-Clause](https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md)
