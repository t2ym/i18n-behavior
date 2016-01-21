## `<i18n-behavior>`

(Work in progress)

Text formatter with [Unicode CLDR plural rules](http://cldr.unicode.org/index/cldr-spec/plural-rules) and choices (like gender) support.

[Demo](https://t2ym.github.io/i18n-behavior/components/i18n-behavior/demo) and [API Docs](https://t2ym.github.io/i18n-behavior/components/i18n-behavior/)

<img src="https://raw.githubusercontent.com/wiki/t2ym/i18n-behavior/i18n-behavior.gif" width="600px">

### Install

```
    bower install --save i18n-behavior
```

### Import

```html
    <link rel="import" href="/path/to/bower_components/i18n-behavior/i18n-behavior.html">
```

### Usage

#### Run-time Automatic I18N (for development)

Apply `BehaviorsStore.I18nBehavior` for run-time automatic I18N.

Source Code:

```html
    <dom-module id="custom-element">
      <template>
        <span id="label">UI text label</span>
      </template>
      <﻿﻿script﻿﻿>
        Polymer({
          is: 'custom-element',
          behaviors: [
            BehaviorsStore.I18nBehavior
          ]
        });
      <﻿﻿/script﻿﻿>
    </dom-module>
```

I18N-ready Run-Time DOM at element registration:

```html
    <custom-element>
      <span id="label">{{text.label}}</span>
    </custom-element>
```

`text` property represents an object with UI text strings for the current locale.

```
    this.text = {
      "label": "UI Text Label"
    }
```

#### Build-time Automatic I18N (for production)

`gulp-externalize` task performs build-time automatic I18N and embeds UI texts as JSON.

I18N-ready Source Code preprocessed by `gulp-externalize`:

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

`text` property represents an object with UI text strings for the current locale.
Default text values are extracted from the embedded JSON.

```
    this.text = {
      "label": "UI Text Label"
    }
```

### License

[BSD-2-Clause](https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md)
