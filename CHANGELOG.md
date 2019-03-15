# Changelog

## [Unreleased]
### Added
- `i18n-controller.js` - Polymer-independent I18N methods
- `i18n-controller-core.js` - Excluding preprocessor methods for preprocessed sources

### Changed
- Depend on `i18n-format@4.0.0-pre.*`
- Peer Dependency on `@polymer/polymer` in package.json

### Removed
- Explicit dependency on `@polymer/polymer` in package.json
- Safari 9 support

## [3.0.0] 2019-2-24
### Added
- Support Polymer 3.x in ES modules with the help of [`i18n-element`](https://www.npmjs.com/package/i18n-element)
- Support `lit-html` with the help of [`i18n-element`](https://www.npmjs.com/package/i18n-element)

### Changed
- Modules

| Module        | Packager | Version | Description |
|:--------------|:---------|:--------|:------------|
| [i18n-element](https://github.com/t2ym/i18n-element) | npm | [3.0.0](https://github.com/t2ym/i18n-element/releases/tag/3.0.0) | I18N base element class |
| [i18n-behavior](https://github.com/t2ym/i18n-behavior) | npm | [3.0.0](https://github.com/t2ym/i18n-behavior/releases/tag/3.0.0) | Run-time I18N handler |
| [i18n-format](https://github.com/t2ym/i18n-format) | npm | [3.0.1](https://github.com/t2ym/i18n-format/releases/tag/3.0.1) | I18N text formatter |
| [i18n-number](https://github.com/t2ym/i18n-number) | npm | [3.0.1](https://github.com/t2ym/i18n-number/releases/tag/3.0.1) | I18N number formatter |
| [gulp-i18n-preprocess](https://github.com/t2ym/gulp-i18n-preprocess) | npm | [1.2.3](https://github.com/t2ym/gulp-i18n-preprocess/releases/tag/1.2.3) | Build-time I18N preprocessor |
| [gulp-i18n-leverage](https://github.com/t2ym/gulp-i18n-leverage) | npm | [1.1.4](https://github.com/t2ym/gulp-i18n-leverage/releases/tag/1.1.4) | L10N JSON updater |
| [gulp-i18n-add-locales](https://github.com/t2ym/gulp-i18n-add-locales) | npm | [0.1.1](https://github.com/t2ym/gulp-i18n-add-locales/releases/tag/0.1.1) | L10N JSON placeholder generator |
| [xliff-conv](https://github.com/t2ym/xliff-conv) | npm/bower | [1.0.12](https://github.com/t2ym/xliff-conv/releases/tag/1.0.12) | XLIFF/JSON converter |
| [live-localizer](https://github.com/t2ym/live-localizer) | npm | [3.0.0](https://github.com/t2ym/live-localizer/releases/tag/3.0.0) | L10N widget |

### Removed
- Polymer 1.x/2.x support in HTML Imports
- Bower support

## [2.0.0]
### Added
- Hybrid support of Polymer 1.x/2.x in the legacy syntax
- [i18n-element](https://github.com/t2ym/i18n-element) I18N base element class for Polymer 2.x
- [live-localizer](https://github.com/t2ym/live-localizer) L10N widget

### Changed
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
| [live-localizer](https://github.com/t2ym/live-localizer) | npm/bower | [2.0.1](https://github.com/t2ym/live-localizer/releases/tag/2.0.1) | L10N widget |

## [1.1.0]
### Added
- XLIFF import/export support with [xliff-conv](https://github.com/t2ym/xliff-conv) converter
- Experimental [Polymer CLI pre-release 0.11.1](https://www.polymer-project.org/1.0/docs/tools/polymer-cli) support with [I18N task integration](https://github.com/t2ym/gulp-i18n-preprocess#integrate-with-polymer-cli-project-templates-highly-experimental), based on a private API
- [Selective I18N-target attribute](https://github.com/t2ym/i18n-behavior/issues/42) support via [`<i18n-attr-repo>` element](https://github.com/t2ym/i18n-behavior/issues/40)
- [Compound bindings](https://github.com/t2ym/i18n-behavior/issues/46) support for I18N-target attributes

### Changed
| Module        | Packager | Version | Description |
|:--------------|:---------|:--------|:------------|
| [i18n-behavior](https://github.com/t2ym/i18n-behavior) | bower | [1.1.0](https://github.com/t2ym/i18n-behavior/releases/tag/1.1.0) | Run-time I18N handler |
| [i18n-format](https://github.com/t2ym/i18n-format) | bower | [1.0.0](https://github.com/t2ym/i18n-format/releases/tag/1.0.0) | I18N text formatter |
| [i18n-number](https://github.com/t2ym/i18n-number) | bower | [1.0.1](https://github.com/t2ym/i18n-number/releases/tag/1.0.1) | I18N number formatter |
| [gulp-i18n-preprocess](https://github.com/t2ym/gulp-i18n-preprocess) | npm | [1.1.0](https://github.com/t2ym/gulp-i18n-preprocess/releases/tag/1.1.0) | Build-time I18N preprocessor |
| [gulp-i18n-leverage](https://github.com/t2ym/gulp-i18n-leverage) | npm | [1.0.13](https://github.com/t2ym/gulp-i18n-leverage/releases/tag/1.0.13) | L10N JSON updater |
| [gulp-i18n-add-locales](https://github.com/t2ym/gulp-i18n-add-locales) | npm | [0.1.0](https://github.com/t2ym/gulp-i18n-add-locales/releases/tag/0.1.0) | L10N JSON placeholder generator |
| [xliff-conv](https://github.com/t2ym/xliff-conv) | npm/bower | [1.0.1](https://github.com/t2ym/xliff-conv/releases/tag/1.0.1) | XLIFF/JSON converter |

### Removed

## [1.0.0]
### Added
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

### Changed
| Module        | Packager | Version | Description |
|:--------------|:---------|:--------|:------------|
| [i18n-behavior](https://github.com/t2ym/i18n-behavior) | bower | [1.0.0](https://github.com/t2ym/i18n-behavior/releases/tag/1.0.0) | Run-time I18N handler |
| [i18n-format](https://github.com/t2ym/i18n-format) | bower | [1.0.0](https://github.com/t2ym/i18n-format/releases/tag/1.0.0) | I18N text formatter |
| [i18n-number](https://github.com/t2ym/i18n-number) | bower | [1.0.0](https://github.com/t2ym/i18n-number/releases/tag/1.0.0) | I18N number formatter |
| [gulp-i18n-preprocess](https://github.com/t2ym/gulp-i18n-preprocess) | npm | [1.0.0](https://github.com/t2ym/gulp-i18n-preprocess/releases/tag/1.0.0) | Build-time I18N preprocessor |
| [gulp-i18n-leverage](https://github.com/t2ym/gulp-i18n-leverage) | npm | [1.0.0](https://github.com/t2ym/gulp-i18n-leverage/releases/tag/1.0.0) | L10N JSON updater |
| [gulp-i18n-add-locales](https://github.com/t2ym/gulp-i18n-add-locales) | npm | [0.1.0](https://github.com/t2ym/gulp-i18n-add-locales/releases/tag/0.1.0) | L10N JSON placeholder generator |
