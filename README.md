[![Build Status](https://travis-ci.org/t2ym/i18n-behavior.svg?branch=master)](https://travis-ci.org/t2ym/i18n-behavior)

# i18n-behavior

Instant and Modular I18N for Polymer (beta for Release 0.1.0)

[API Docs](https://t2ym.github.io/i18n-behavior/components/i18n-behavior/), [Demo](https://t2ym.github.io/i18n-behavior/components/i18n-behavior/demo/), and [Test](https://t2ym.github.io/i18n-behavior/components/i18n-behavior/test/) on GitHub Pages (https://t2ym.github.io/i18n-behavior)

<img src="https://raw.githubusercontent.com/wiki/t2ym/i18n-behavior/i18n-behavior.gif" width="768px">

## Features

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

## Conceptual Workflow

<img src="https://raw.githubusercontent.com/wiki/t2ym/i18n-behavior/PolymerI18nFlow.gif" width="768px">

## Install

```
    bower install --save i18n-behavior
```

[Quick Tour](#quick-tour) with [polymer-starter-kit-i18n](https://github.com/t2ym/polymer-starter-kit-i18n)

## Import

```html
    <link rel="import" href="/path/to/bower_components/i18n-behavior/i18n-behavior.html">
```

## Usage

### Run-time Automatic I18N (for development)

Apply `BehaviorsStore.I18nBehavior` for run-time automatic I18N.

#### Source Code:

```html
    <dom-module id="custom-element">
      <template>
        <span id="label">UI text label</span> <!-- no need to touch UI text strings -->
      </template>
      <script>
        Polymer({
          is: 'custom-element',
          behaviors: [
            BehaviorsStore.I18nBehavior // Add this line for I18N
          ]
        });
      </script>
    </dom-module>
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

```
    this.text = {
      "label": "UI Text Label"
    }
```

`this.text` dynamic object is SHARED among all the instances of the same custom element.

#### `model` dynamic property:

`this.model` is deepcopied from `this.text.model` per instance to store I18N target attributes.
UI text strings in I18N target attributes are automatically extracted and replaced with annotations
according to the shared repository (`i18n-attr-repo`) of I18N target attributes per elements 
(like `placeholder` attribute of `input` element).

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

## TODOs

- (In Progress) Comprehensive tests with Web Component Tester

## Quick Tour

### Quick demo project deployment

```
    git clone https://github.com/t2ym/polymer-starter-kit-i18n.git
    cd polymer-starter-kit-i18n
    npm install -g gulp bower # if missing
    npm install && bower install
    # Development build with scan/preprocess/leverage/bundle/feedback tasks
    gulp --dev
    # Run-time I18N demo on http://localhost:5000
    gulp serve
    # Build-time I18N demo on http://localhost:5001
    gulp serve:dist --dev
```

### Change language on the demo

##### 1. Press F12 to open debugger console on the browser

##### 2. Navigate to the elements or DOM tab in the debugger

##### 3. Change `lang` attribute of `html` element from "en" to "ja" or "fr"

```
    <html lang="ja">
```

### Update UI strings on the demo

##### 1. Change any UI strings in the following HTMLs

```
    polymer-starter-kit-i18n/app/index.html
                                /elements/my-greeting/my-greeting.html
                                /elements/my-list/my-list.html
```

##### 2. Merge changes into JSON files

```
    cd polymer-starter-kit-i18n
    gulp --dev
```

##### 3. Check diffs

```
    git diff app
```

## Testing

### Test Suites

| Test Suites      | UI Strings | L10N JSON | HTML       |
|:-----------------|:-----------|:----------|:-----------|
| test/src         | Hard-coded | Modular   | Modular    |
| test/preprocess  | Extracted  | Modular   | Modular    |
| test/vulcanize   | Extracted  | Bundled   | Vulcanized |

### Online Test

Available at https://t2ym.github.io/i18n-behavior/components/i18n-behavior/test/

### Rebuild Test Suites

Rebuild [preprocessed](https://github.com/t2ym/gulp-i18n-preprocess) and [vulcanized](https://github.com/Polymer/vulcanize) test suites by the following commmand.

```
    gulp pretest
```

### Local/Remote Browsers Test

These `test:*` tasks perform the `pretest` task as a dependency.

```
    gulp test:local  # local browsers; Chrome and Firefox are preset in wct.conf.json
    gulp test:remote # remote browsers on Sauce Labs; Edge, IE10/11, Safari 7/8/9 are preset in wct.conf.json
```

## License

[BSD-2-Clause](https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md)
