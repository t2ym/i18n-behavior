[![Build Status](https://travis-ci.org/t2ym/i18n-behavior.svg?branch=master)](https://travis-ci.org/t2ym/i18n-behavior)
[![Coverage Status](https://coveralls.io/repos/github/t2ym/i18n-behavior/badge.svg?branch=master)](https://coveralls.io/github/t2ym/i18n-behavior?branch=master)
[![npm](https://img.shields.io/npm/v/i18n-behavior.svg)](https://www.npmjs.com/package/i18n-behavior)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/t2ym/i18n-behavior)

# i18n-behavior

Instant and Modular I18N framework for lit-html and Polymer

[API Docs](https://t2ym.github.io/i18n-behavior/), [Demo](https://t2ym.github.io/i18n-behavior/demo/preprocess/)

<img src="https://raw.githubusercontent.com/wiki/t2ym/i18n-behavior/i18n-behavior.gif" width="768px">

## Conceptual Workflow

<img src="https://raw.githubusercontent.com/wiki/t2ym/i18n-behavior/PolymerI18nFlow.gif" width="768px">

## Browser Compatibility

### Polymer 3.x & lit-html with the help of `i18n-element`

| Browser   | Chrome  | Firefox  | Edge 13+  | IE 11  | Safari 9+ | Chrome Android  | Mobile Safari  | Opera  |
|:----------|:-------:|:--------:|:---------:|:------:|:---------:|:---------------:|:--------------:|:------:|
| Supported | ✔       | ✔        | ✔         | ✔      | ✔         | ✔               | ✔              | ✔      |

- Polyfilled by `@webcomponents/webcomponentsjs/webcomponents-{bundle|loader}.js`

## Install

```sh
    npm install i18n-behavior
```

[Quick Tour](#quick-tour) with [I18N-ready pwa-starter-kit](https://github.com/t2ym/pwa-starter-kit)

## Import

```js
    import { I18nBehavior } from 'i18n-behavior/i18n-behavior.js'
```

## Usage

### Run-time Automatic I18N (for development)

Apply `BehaviorsStore.I18nBehavior` or imported `I18nBehavior` for run-time automatic I18N.

#### Source Code:

- Note: [`i18n-element`](https://www.npmjs.com/package/i18n-element) package wraps `i18n-behavior` to support `lit-html` and Polymer class syntax

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

#### I18N-ready preprocessed DOM at element registration: 

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

#### `text` dynamic property:

`this.text` dynamic object property represents an object with UI text strings for the current locale.

```javascript
    this.text = {
      "label": "UI Text Label"
    }
```

`this.text` dynamic object is SHARED among all the instances of the same custom element.

#### `model` dynamic property:

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

#### Localized text strings fetched from JSON:

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

### Build-time Automatic I18N (for production)

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

## Compatible Versions

| i18n-behavior | i18n-element | Polymer | lit-html |
|:--------------|:-------------|:--------|:---------|
| 3             | 3            | 3       | 1        |
| 2             | 2            | 1-2     | -        |
| 1             | -            | 1       | -        |

## Quick Tour

### Quick deployment of [I18N-ready `pwa-starter-kit`](https://github.com/t2ym/pwa-starter-kit)

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

## Changelogs

## Next Release 3.0.0

- Support Polymer 3.x with ES modules with the help of [`i18n-element`](https://www.npmjs.com/package/i18n-element)
- Support `lit-html` with the help of [`i18n-element`](https://www.npmjs.com/package/i18n-element)

| Module        | Packager | Version | Description |
|:--------------|:---------|:--------|:------------|
| [i18n-element](https://github.com/t2ym/i18n-element) | npm | [3.0.0](https://github.com/t2ym/i18n-element/releases/tag/3.0.0) | I18N base element class |
| [i18n-behavior](https://github.com/t2ym/i18n-behavior) | npm | [3.0.0](https://github.com/t2ym/i18n-behavior/releases/tag/3.0.0) | Run-time I18N handler |
| [i18n-format](https://github.com/t2ym/i18n-format) | npm | [3.0.0](https://github.com/t2ym/i18n-format/releases/tag/3.0.0) | I18N text formatter |
| [i18n-number](https://github.com/t2ym/i18n-number) | npm | [3.0.1](https://github.com/t2ym/i18n-number/releases/tag/3.0.1) | I18N number formatter |
| [gulp-i18n-preprocess](https://github.com/t2ym/gulp-i18n-preprocess) | npm | [1.2.3](https://github.com/t2ym/gulp-i18n-preprocess/releases/tag/1.2.3) | Build-time I18N preprocessor |
| [gulp-i18n-leverage](https://github.com/t2ym/gulp-i18n-leverage) | npm | [1.1.4](https://github.com/t2ym/gulp-i18n-leverage/releases/tag/1.1.4) | L10N JSON updater |
| [gulp-i18n-add-locales](https://github.com/t2ym/gulp-i18n-add-locales) | npm | [0.1.1](https://github.com/t2ym/gulp-i18n-add-locales/releases/tag/0.1.1) | L10N JSON placeholder generator |
| [xliff-conv](https://github.com/t2ym/xliff-conv) | npm/bower | [1.0.12](https://github.com/t2ym/xliff-conv/releases/tag/1.0.12) | XLIFF/JSON converter |
| [live-localizer](https://github.com/t2ym/live-localizer) | npm | [3.0.0](https://github.com/t2ym/live-localizer/releases/tag/3.0.0) | L10N widget |

## Stable Release 2.0.0

- Hybrid support of Polymer 1.x/2.x in the legacy syntax
- [i18n-element](https://github.com/t2ym/i18n-element) I18N base element class for Polymer 2.x
- [live-localizer](https://github.com/t2ym/live-localizer) L10N widget

| Module        | Packager | Version | Description |
|:--------------|:---------|:--------|:------------|
| [i18n-element](https://github.com/t2ym/i18n-element) | npm/bower | [2.0.0](https://github.com/t2ym/i18n-element/releases/tag/2.0.0) | I18N base element class |
| [i18n-behavior](https://github.com/t2ym/i18n-behavior) | npm/bower | [2.0.0](https://github.com/t2ym/i18n-behavior/releases/tag/2.0.0) | Run-time I18N handler |
| [i18n-format](https://github.com/t2ym/i18n-format) | npm/bower | [2.0.0](https://github.com/t2ym/i18n-format/releases/tag/2.0.0) | I18N text formatter |
| [i18n-number](https://github.com/t2ym/i18n-number) | npm/bower | [2.0.2](https://github.com/t2ym/i18n-number/releases/tag/2.0.2) | I18N number formatter |
| [gulp-i18n-preprocess](https://github.com/t2ym/gulp-i18n-preprocess) | npm | [1.2.3](https://github.com/t2ym/gulp-i18n-preprocess/releases/tag/1.2.3) | Build-time I18N preprocessor |
| [gulp-i18n-leverage](https://github.com/t2ym/gulp-i18n-leverage) | npm | [1.1.3](https://github.com/t2ym/gulp-i18n-leverage/releases/tag/1.1.3) | L10N JSON updater |
| [gulp-i18n-add-locales](https://github.com/t2ym/gulp-i18n-add-locales) | npm | [0.1.0](https://github.com/t2ym/gulp-i18n-add-locales/releases/tag/0.1.0) | L10N JSON placeholder generator |
| [xliff-conv](https://github.com/t2ym/xliff-conv) | npm/bower | [1.0.10](https://github.com/t2ym/xliff-conv/releases/tag/1.0.10) | XLIFF/JSON converter |
| [live-localizer](https://github.com/t2ym/live-localizer) | npm/bower | [2.0.1](https://github.com/t2ym/live-localizer/releases/tag/2.0.1) | L10N widget (WIP) |

## Stable Release 1.1.0

- XLIFF import/export support with [xliff-conv](https://github.com/t2ym/xliff-conv) converter
- Experimental [Polymer CLI pre-release 0.11.1](https://www.polymer-project.org/1.0/docs/tools/polymer-cli) support with [I18N task integration](https://github.com/t2ym/gulp-i18n-preprocess#integrate-with-polymer-cli-project-templates-highly-experimental), based on a private API
- [Selective I18N-target attribute](https://github.com/t2ym/i18n-behavior/issues/42) support via [`<i18n-attr-repo>` element](https://github.com/t2ym/i18n-behavior/issues/40)
- [Compound bindings](https://github.com/t2ym/i18n-behavior/issues/46) support for I18N-target attributes

| Module        | Packager | Version | Description |
|:--------------|:---------|:--------|:------------|
| [i18n-behavior](https://github.com/t2ym/i18n-behavior) | bower | [1.1.0](https://github.com/t2ym/i18n-behavior/releases/tag/1.1.0) | Run-time I18N handler |
| [i18n-format](https://github.com/t2ym/i18n-format) | bower | [1.0.0](https://github.com/t2ym/i18n-format/releases/tag/1.0.0) | I18N text formatter |
| [i18n-number](https://github.com/t2ym/i18n-number) | bower | [1.0.1](https://github.com/t2ym/i18n-number/releases/tag/1.0.1) | I18N number formatter |
| [gulp-i18n-preprocess](https://github.com/t2ym/gulp-i18n-preprocess) | npm | [1.1.0](https://github.com/t2ym/gulp-i18n-preprocess/releases/tag/1.1.0) | Build-time I18N preprocessor |
| [gulp-i18n-leverage](https://github.com/t2ym/gulp-i18n-leverage) | npm | [1.0.13](https://github.com/t2ym/gulp-i18n-leverage/releases/tag/1.0.13) | L10N JSON updater |
| [gulp-i18n-add-locales](https://github.com/t2ym/gulp-i18n-add-locales) | npm | [0.1.0](https://github.com/t2ym/gulp-i18n-add-locales/releases/tag/0.1.0) | L10N JSON placeholder generator |
| [xliff-conv](https://github.com/t2ym/xliff-conv) | npm/bower | [1.0.1](https://github.com/t2ym/xliff-conv/releases/tag/1.0.1) | XLIFF/JSON converter |

## Stable Release 1.0.0

- Instant I18N by one line addition of `I18nBehavior`
- Minimal or no overhead for development: Run-time automatic extraction of hard-coded UI text strings from HTML templates
- Optimal for production: Build-time automatic extraction and bundling of hard-coded UI text strings from HTML templates by [`gulp-i18n-preprocess`](https://github.com/t2ym/gulp-i18n-preprocess) preprocessor
- Modular (per element) JSON support for storing and fetching localized UI text strings
- Bundled (per app) JSON support for storing and fetching localized UI text strings
- Automatic application of [`<i18n-format>`](https://github.com/t2ym/i18n-format) with [Unicode CLDR plural rules](http://cldr.unicode.org/index/cldr-spec/plural-rules) and Gender support
- [Polymer 1.2.0](https://www.polymer-project.org/1.0/docs/release-notes.html#release-120httpsgithubcompolymerpolymertreev120-2015-10-22)'s [Compound Bindings](https://www.polymer-project.org/1.0/docs/devguide/data-binding.html#compound-bindings) support with [`<i18n-format>`](https://github.com/t2ym/i18n-format)
- `i18n-dom-bind` template instead of `dom-bind` for instant I18N of bound templates
- Dynamic on-demand fetching of localized UI text strings from JSON under `locales` directories
- Real-time observation of `<html lang>` attribute value for UI text localization
- Robust fallback of missing UI text strings to parent locales and finally to the default locale (e.g. "fr-CA" -> "fr" -> "en") with practical [BCP47](https://tools.ietf.org/html/bcp47) support
- `this.text` dynamic object shared among the same custom element to access localized strings
- `this.model` object deepcopied from `this.text.model` object per instance to access localized attribute strings
- [`i18n-attr-repo`](https://t2ym.github.io/i18n-behavior/components/i18n-behavior/#i18n-attr-repo) to maintain repository of I18N target attributes
- [`gulp-i18n-leverage`](https://github.com/t2ym/gulp-i18n-leverage) filter to merge changes in the default language in HTML templates into localized JSON resources.
- [`gulp-i18n-leverage`](https://github.com/t2ym/gulp-i18n-leverage) filter to put meta infomation, that is, L10N "TO DO" list, for the merged changes in JSON resources
- Option to define I18N target strings manually by `<json-data>` elements

| Module        | Packager | Version | Description |
|:--------------|:---------|:--------|:------------|
| [i18n-behavior](https://github.com/t2ym/i18n-behavior) | bower | [1.0.0](https://github.com/t2ym/i18n-behavior/releases/tag/1.0.0) | Run-time I18N handler |
| [i18n-format](https://github.com/t2ym/i18n-format) | bower | [1.0.0](https://github.com/t2ym/i18n-format/releases/tag/1.0.0) | I18N text formatter |
| [i18n-number](https://github.com/t2ym/i18n-number) | bower | [1.0.0](https://github.com/t2ym/i18n-number/releases/tag/1.0.0) | I18N number formatter |
| [gulp-i18n-preprocess](https://github.com/t2ym/gulp-i18n-preprocess) | npm | [1.0.0](https://github.com/t2ym/gulp-i18n-preprocess/releases/tag/1.0.0) | Build-time I18N preprocessor |
| [gulp-i18n-leverage](https://github.com/t2ym/gulp-i18n-leverage) | npm | [1.0.0](https://github.com/t2ym/gulp-i18n-leverage/releases/tag/1.0.0) | L10N JSON updater |
| [gulp-i18n-add-locales](https://github.com/t2ym/gulp-i18n-add-locales) | npm | [0.1.0](https://github.com/t2ym/gulp-i18n-add-locales/releases/tag/0.1.0) | L10N JSON placeholder generator |

## License

[BSD-2-Clause](https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md)
