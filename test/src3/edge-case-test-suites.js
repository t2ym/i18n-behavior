/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import './test-runner.js';
suite('I18nElement with ' + 
  (window.location.href.indexOf('?dom=Shadow') >= 0 ? 'Shadow DOM' : 'Shady DOM') +
  (' in ' + syntax + ' syntax'), 
  function () {

  var lang0 = '';
  var lang1 = 'en';
  var lang2 = 'fr';
  var lang3 = 'ja';
  var lang4 = 'fr-CA';
  var lang5 = 'zh-Hans-CN';
  var lang6 = 'ru';
  var lang7 = 'zh-yue-Hans-CN';
  var lang8 = 'zh-CN';
  var lang9 = 'zh-TW';
  var lang10 = 'zh-Hans-CN-x-Linux';
  var text_complex_compound_binding = {
    'model': {},
    'item-update2:text': [
      'updated: {1}, by: ',
      '{{text.updated}}'
    ],
    'item-update2:text_2': ' xxx ',
    'item-update2:dom-if_3:template:span:b': 'IF CONTENT',
    'item-update2:b_4': 'abc',
    'item-update2:dom-if_5:template:text': 'IF CONTENT 2',
    'item-update2:text_6': ' hello ',
    'item-update:text': [
      'updated: {1}, by: ',
      '{{text.updated}}'
    ],
    'item-update:text_2': ' xxx ',
    'item-update:dom-if_3:template:b': 'IF CONTENT',
    'item-update:b_4': 'abc',
    'item-update:dom-if_5:template:text': 'IF CONTENT 2',
    'item-update:text_6': ' hello ',
    'item-update3:text': [
      'updated: {1}, by: ',
      '{{text.updated}}'
    ],
    'item-update3:text_2': ' xxx ',
    'item-update3:dom-if_3:template:b': 'IF',
    'item-update3:dom-if_3:template:b_1': 'CONTENT',
    'item-update3:b_4': 'abc',
    'item-update3:dom-if_5:template:text': 'IF CONTENT 2',
    'item-update3:text_6': ' hello ',
    'item-update4:text': [
      'updated: {1}, by: ',
      '{{text.updated}}'
    ],
    'item-update4:dom-repeat_1:template:text': [
      ' {1} = {2} ',
      '{{item.name}}',
      '{{text.updated}}'
    ],
    'item-update4:text_2': ' xxx ',
    'item-update4:dom-if_3:template:b': 'IF CONTENT',
    'item-update4:b_4': 'abc',
    'item-update4:dom-if_5:template:text': 'IF CONTENT 2',
    'item-update4:text_6': ' hello ',
    'paragraph:text': 'A paragraph with ',
    'paragraph:text_2': ' is converted to ',
    'paragraph:code_3': '<i18n-format>',
    'paragraph:text_4': '. ',
    'paragraph2:text': 'A paragraph with deep ',
    'paragraph2:text_2': ' is ',
    'paragraph2:b_3': 'not',
    'paragraph2:text_4': ' converted to ',
    'paragraph2:code_5': '<i18n-format>',
    'paragraph2:text_6': '. ',
    'authors': [
      {
        'name': 'Joe'
      },
      {
        'name': 'Alice'
      }
    ],
    'updated': 'Jan 1st, 2016',
    'parameters': [
      'parameter 1',
      'parameter 2'
    ]
  };
  var localDOM_complex_compound_binding = [
    { select: '[id="item-update"] i18n-format',
      'PolymerDom.childNodes.nonWS.0.textContent': text_complex_compound_binding['item-update:text'][0],
      'root.PolymerDom.effectiveChildNodes.nonWS.0.textContent': 'updated: ',
      'root.PolymerDom.effectiveChildNodes.nonWS.1.textContent.trim': text_complex_compound_binding.updated,
      'root.PolymerDom.effectiveChildNodes.nonWS.2.textContent.raw': ', by: '
    },
    { select: '[id="item-update"]',
      'PolymerDom.childNodes.nonWS.1.textContent.trim': text_complex_compound_binding.authors[0].name,
      'PolymerDom.childNodes.nonWS.2.textContent.trim': text_complex_compound_binding.authors[1].name,
      'PolymerDom.childNodes.nonWS.3.tagName': 'DOM-REPEAT',
      'PolymerDom.childNodes.nonWS.4.textContent': text_complex_compound_binding['item-update:text_2'],
      'PolymerDom.childNodes.nonWS.5.textContent.trim': text_complex_compound_binding['item-update:dom-if_3:template:b'],
      'PolymerDom.childNodes.nonWS.6.tagName': 'DOM-IF',
      'PolymerDom.childNodes.nonWS.7.textContent.trim': text_complex_compound_binding['item-update:b_4'],
      'PolymerDom.childNodes.nonWS.8.textContent.trim': text_complex_compound_binding['item-update:dom-if_5:template:text'],
      'PolymerDom.childNodes.nonWS.9.tagName': 'DOM-IF',
      'PolymerDom.childNodes.nonWS.10.textContent': text_complex_compound_binding['item-update:text_6']
    },
    { select: '[id="item-update2"] i18n-format',
      'PolymerDom.childNodes.nonWS.0.textContent': text_complex_compound_binding['item-update2:text'][0],
      'root.PolymerDom.effectiveChildNodes.nonWS.1.textContent.trim': text_complex_compound_binding.updated,
      'root.PolymerDom.effectiveChildNodes.nonWS.2.textContent.raw': ', by: '
    },
    { select: '[id="item-update2"]',
      'PolymerDom.childNodes.nonWS.1.data.trim': text_complex_compound_binding.authors[0].name,
      'PolymerDom.childNodes.nonWS.2.data.trim': text_complex_compound_binding.authors[1].name,
      'PolymerDom.childNodes.nonWS.3.tagName': 'DOM-REPEAT',
      'PolymerDom.childNodes.nonWS.4.textContent': text_complex_compound_binding['item-update2:text_2'],
      'PolymerDom.childNodes.nonWS.5.childNodes.nonWS.0.textContent.trim': text_complex_compound_binding['item-update2:dom-if_3:template:span:b'],
      'PolymerDom.childNodes.nonWS.6.tagName': 'DOM-IF',
      'PolymerDom.childNodes.nonWS.7.textContent.trim': text_complex_compound_binding['item-update2:b_4'],
      'PolymerDom.childNodes.nonWS.8.data': text_complex_compound_binding['item-update2:dom-if_5:template:text'],
      'PolymerDom.childNodes.nonWS.9.tagName': 'DOM-IF',
      'PolymerDom.childNodes.nonWS.10.data': ' hello '
    },
    { select: '[id="item-update3"]',
      'PolymerDom.childNodes.nonWS.1.data.trim': text_complex_compound_binding.authors[0].name,
      'PolymerDom.childNodes.nonWS.2.data.trim': text_complex_compound_binding.authors[1].name,
      'PolymerDom.childNodes.nonWS.3.tagName': 'DOM-REPEAT',
      'PolymerDom.childNodes.nonWS.4.textContent': text_complex_compound_binding['item-update3:text_2'],
      'PolymerDom.childNodes.nonWS.5.childNodes.nonWS.0.textContent.trim': text_complex_compound_binding['item-update3:dom-if_3:template:b'],
      'PolymerDom.childNodes.nonWS.6.childNodes.nonWS.0.textContent.trim': text_complex_compound_binding['item-update3:dom-if_3:template:b_1'],
      'PolymerDom.childNodes.nonWS.7.tagName': 'DOM-IF',
      'PolymerDom.childNodes.nonWS.8.textContent.trim': text_complex_compound_binding['item-update3:b_4'],
      'PolymerDom.childNodes.nonWS.9.data': text_complex_compound_binding['item-update3:dom-if_5:template:text'],
      'PolymerDom.childNodes.nonWS.10.tagName': 'DOM-IF',
      'PolymerDom.childNodes.nonWS.11.data': ' hello '
    },
    { select: '[id="item-update4"] i18n-format',
      'PolymerDom.childNodes.nonWS.0.textContent': text_complex_compound_binding['item-update4:text'][0],
      'root.PolymerDom.effectiveChildNodes.nonWS.1.textContent.trim': text_complex_compound_binding.updated,
      'root.PolymerDom.effectiveChildNodes.nonWS.2.textContent.raw': ', by: '
    },
    { select: '[id="item-update4"] i18n-format +i18n-format',
      'PolymerDom.childNodes.nonWS.0.textContent': text_complex_compound_binding['item-update4:dom-repeat_1:template:text'][0],
      'PolymerDom.childNodes.nonWS.1.textContent.trim': text_complex_compound_binding.authors[0].name,
      'PolymerDom.childNodes.nonWS.2.textContent.trim': text_complex_compound_binding.updated
    },
    { select: '[id="item-update4"] i18n-format +i18n-format +i18n-format',
      'PolymerDom.childNodes.nonWS.0.textContent': text_complex_compound_binding['item-update4:dom-repeat_1:template:text'][0],
      'PolymerDom.childNodes.nonWS.1.textContent.trim': text_complex_compound_binding.authors[1].name,
      'PolymerDom.childNodes.nonWS.2.textContent.trim': text_complex_compound_binding.updated
    },
    { select: '[id="item-update4"] dom-repeat',
      'tagName': [ 'DOM-REPEAT' ]
    },
    { select: '[id="item-update4"] dom-if',
      'tagName': [ 'DOM-IF', 'DOM-IF' ]
    },
    { select: '[id="item-update4"] dom-repeat',
      'nextTextSibling.data': text_complex_compound_binding['item-update4:text_2']
    },
    { select: '[id="item-update4"] b',
      'PolymerDom.textContent': [ text_complex_compound_binding['item-update4:dom-if_3:template:b'], text_complex_compound_binding['item-update4:b_4'] ]
    },
    { select: '[id="item-update4"]',
      'PolymerDom.childNodes.nonWS.8.data': text_complex_compound_binding['item-update4:dom-if_5:template:text'],
      'PolymerDom.childNodes.nonWS.10.data': ' hello '
    },
    { select: '[id="paragraph"]',
      'PolymerDom.childNodes.nonWS.0.textContent': text_complex_compound_binding['paragraph:text'],
      'PolymerDom.childNodes.nonWS.1.textContent.trim': text_complex_compound_binding.parameters[0],
      'PolymerDom.childNodes.nonWS.2.textContent.trim': text_complex_compound_binding.parameters[1],
    },
    { select: '[id="paragraph"] code',
      'tagName': 'CODE',
      'textContent': text_complex_compound_binding['paragraph:code_3']
    },
    { select: '[id="paragraph2"]',
      'PolymerDom.childNodes.nonWS.0.data': text_complex_compound_binding['paragraph2:text']
    },
    { select: '[id="paragraph2"] span i',
      'textContent': text_complex_compound_binding.parameters
    },
    { select: '[id="paragraph2"] b',
      'textContent': text_complex_compound_binding['paragraph2:b_3'],
      'previousTextSibling.data': text_complex_compound_binding['paragraph2:text_2'],
      'nextTextSibling.data': text_complex_compound_binding['paragraph2:text_4']
    },
    { select: '[id="paragraph2"] code',
      'textContent': text_complex_compound_binding['paragraph2:code_5'],
      'nextTextSibling.data': text_complex_compound_binding['paragraph2:text_6']
    },
  ];
  var text_advanced_binding = {
    'meta': {},
    'model': {
      'aria-attributes': {
        'title': 'tooltip text',
        'aria-label': 'aria label text',
        'aria-valuetext': 'aria value text'
      }
    },
    'annotated-format': [
      '{{tr(status,text.statusMessageFormats)}}',
      '{{parameter}}',
      'string parameter'
    ],
    'span_5': [
      '{1} {2}',
      '{{text.defaultValue}}',
      '{{text.defaultValue}}'
    ],
    'statusMessages': {
      'ok': 'healthy status',
      'busy': 'busy status',
      'error': 'error status',
      'default': 'unknown status'
    },
    'defaultValue': 'default value',
    'statusMessageFormats': {
      'ok': 'healthy status',
      'busy': 'busy status with {2}',
      'error': 'error status with {1} and {2}',
      'default': 'unknown status'
    },
    'nodefault': {
      'ok': 'ok status'
    }
  };
  var localDOM_advanced_binding_1 = [
    { select: '[id="status"]', textContent: 'healthy status' },
    { select: '[id="default"]', 'textContent.raw': 'initial value' },
    { select: '[id="annotated-format"]',
      'root.PolymerDom.textContent': 'healthy status' },
    { select: '[id="aria-attributes"]',
      'attributes.title.value.text': 'tooltip text',
      'attributes.aria-label.value.text': 'aria label text',
      'attributes.aria-valuetext.value.text': 'aria value text',
      'bindValue.raw': 'initial value' }
  ];
  var localDOM_advanced_binding_2 = [
    { select: '[id="status"]', textContent: 'busy status' },
    { select: '[id="default"]', textContent: 'default value' },
    { select: '[id="annotated-format"]',
      'root.PolymerDom.effectiveChildNodes.nonWS.0.textContent': 'busy status with ',
      'root.PolymerDom.effectiveChildNodes.nonWS.1.textContent': 'string parameter' },
    { select: '[id="aria-attributes"]',
      'attributes.title.value.text': 'tooltip text',
      'attributes.aria-label.value.text': 'aria label text',
      'attributes.aria-valuetext.value.text': 'aria value text',
      'bindValue.raw': '' }
  ];
  var localDOM_advanced_binding_3 = [
    { select: '[id="status"]', textContent: 'error status' },
    { select: '[id="default"]', textContent: 'default value' },
    { select: '[id="annotated-format"]',
      'root.PolymerDom.effectiveChildNodes.nonWS.0.textContent': 'error status with ',
      'root.PolymerDom.effectiveChildNodes.nonWS.1.textContent.raw': 'parameter text',
      'root.PolymerDom.effectiveChildNodes.nonWS.2.textContent.raw': ' and ',
      'root.PolymerDom.effectiveChildNodes.nonWS.3.textContent': 'string parameter' },
    { select: '[id="aria-attributes"]',
      'attributes.title.value.text': 'tooltip text',
      'attributes.aria-label.value.text': 'aria label text',
      'attributes.aria-valuetext.value.text': 'aria value text',
      'bindValue.raw': null }
  ];
  var localDOM_advanced_binding_4 = [
    { select: '[id="status"]', textContent: 'unknown status' },
    { select: '[id="default"]', textContent: 'default value' },
    { select: '[id="annotated-format"]',
      'root.PolymerDom.effectiveChildNodes.nonWS.0.textContent': 'unknown status' },
    { select: '[id="aria-attributes"]',
      'attributes.title.value.text': 'tooltip text',
      'attributes.aria-label.value.text': 'aria label text',
      'attributes.aria-valuetext.value.text': 'aria value text',
      'bindValue.raw': undefined }
  ];

  var suites = [
    s('empty element', null, {
      fixture: 'empty-element-fixture', 
      fixtureModel: undefined,
      assign: undefined,
      lang: lang1,
      effectiveLang: lang1,
      templateDefaultLang: lang1,
      observeHtmlLang: true,
      //text: { model: {} },
      model: {},
      localDOM: undefined,
      lightDOM: undefined
    }),
    s(lang2 + ' empty element', 'empty element', {
      fixture: 'bound-empty-element-fixture',
      fixtureModel: { observeHtmlLang: false, lang: lang1 },
      assign: { lang: lang2 },
      event: 'lang-updated',
      lang: lang2,
      effectiveLang: lang2,
      observeHtmlLang: false
    }),
    s('no template element', 'empty element', {
      fixture: 'no-template-element-fixture'
    }),
    s('complex compound binding element', 'empty element', {
      setup: true,
      fixture: 'complex-compound-binding-element-fixture',
      fixtureModel: { observeHtmlLang: false, lang: lang0 },
      assign: { lang: lang1 },
      event: 'local-dom-ready',
      lang: lang1,
      effectiveLang: lang1,
      observeHtmlLang: false,
      text: text_complex_compound_binding,
      localDOM: localDOM_complex_compound_binding
    }),
    s(lang2 + ' complex compound binding element', 'complex compound binding element', {
      assign: { lang: lang2 },
      lang: lang2,
      effectiveLang: lang2
    }),
    s('advanced binding element', 'empty element', {
      setup: true,
      fixture: 'advanced-binding-element-fixture',
      fixtureModel: {
        observeHtmlLang: false,
        lang: lang0,
        status: 'ok',
        value: 'initial value',
        parameter: 'parameter text'
      },
      assign: { lang: lang1 },
      event: 'local-dom-ready',
      lang: lang1,
      effectiveLang: lang1,
      observeHtmlLang: false,
      text: text_advanced_binding,
      model: text_advanced_binding.model,
      localDOM: localDOM_advanced_binding_1
    }),
    s('advanced binding element 2', 'advanced binding element', {
      fixtureModel: {
        observeHtmlLang: false,
        lang: lang0,
        status: 'busy',
        value: '',
        parameter: 'parameter text'
      },
      localDOM: localDOM_advanced_binding_2
    }),
    s('advanced binding element 3', 'advanced binding element', {
      fixtureModel: {
        observeHtmlLang: false,
        lang: lang0,
        status: 'error',
        value: null,
        parameter: 'parameter text'
      },
      localDOM: localDOM_advanced_binding_3
    }),
    s('advanced binding element 4', 'advanced binding element', {
      fixtureModel: {
        observeHtmlLang: false,
        lang: lang0,
        status: null,
        value: undefined,
        parameter: 'parameter text'
      },
      localDOM: localDOM_advanced_binding_4
    }),
    s(lang2 + ' advanced binding element', 'advanced binding element', {
      assign: { lang: lang2 },
      lang: lang2,
      effectiveLang: lang2
    }),
    s(lang2 + ' advanced binding element 2', 'advanced binding element 2', {
      assign: { lang: lang2 },
      lang: lang2,
      effectiveLang: lang2
    }),
    s(lang2 + ' advanced binding element 3', 'advanced binding element 3', {
      assign: { lang: lang2 },
      lang: lang2,
      effectiveLang: lang2
    }),
    s(lang2 + ' advanced binding element 4', 'advanced binding element 4', {
      assign: { lang: lang2 },
      lang: lang2,
      effectiveLang: lang2
    }),
    s(lang7 + ' fallback', 'advanced binding element 4', {
      timeout: 60000,
      assign: { lang: lang7 },
      lang: lang0,
      effectiveLang: lang0
    }),
    s(lang8 + ' fallback', lang7 + ' fallback', {
      assign: { lang: lang8 }
    }),
    s(lang9 + ' fallback', lang7 + ' fallback', {
      assign: { lang: lang9 }
    }),
    s(lang10 + ' fallback', lang7 + ' fallback', {
      assign: { lang: lang10 }
    }),
  ];

  suitesRunner(suites);

  suite('i18nFormat() unit tests', function () {
    test('formats', function (done) {
      [
        [ [''], '' ],
        [ ['abc'], 'abc' ],
        [ ['\'\''], '\'\'' ],
        [ ['\"\"'], '\"\"' ],
        [ ['``'], '``' ],
        [ ['\n\n'], '\n\n' ],
        [ ['\t\t'], '\t\t' ],
        [ ['\\\\'], '\\\\' ],
        [ ['$$'], '$$' ],
        [ ['${1}${2}', 'X', 'Y'], '$X$Y' ],
        [ [' '], ' ' ],
        [ ['abc{1}', 'X'], 'abcX' ],
        [ ['abc{1} {2}', 'X', 'Y'], 'abcX Y' ],
        [ ['{1}abc{2}', 'X', 'Y'], 'XabcY' ],
        [ ['{1}{2}', 'X', 'Y'], 'XY' ],
        [ ['d{3}a{1}b{2}c', 'X', 'Y', 'Z'], 'dZaXbYc' ],
        [ ['{3}{1}{2}', 'X', 'Y', 'Z'], 'ZXY' ],
        [ ['a{3}\nb\\<{2}$`{1}x', '\tX', 'Y\'', '\"Z'], 'a\"Z\nb\\<Y\'$`\tXx' ],
        [ ['a{0}\nb\\<{2}$`{1}x', '\tX', 'Y\'' ], 'a{0}\nb\\<Y\'$`\tXx' ],
        [ [''], '' ],
        [ ['abc'], 'abc' ],
        [ ['\'\''], '\'\'' ],
        [ ['\"\"'], '\"\"' ],
        [ ['``'], '``' ],
        [ ['\n\n'], '\n\n' ],
        [ ['\t\t'], '\t\t' ],
        [ ['\\\\'], '\\\\' ],
        [ ['$$'], '$$' ],
        [ ['${1}${2}', 'X', 'Y'], '$X$Y' ],
        [ [' '], ' ' ],
        [ ['abc{1}', 'X'], 'abcX' ],
        [ ['abc{1} {2}', 'X', 'Y'], 'abcX Y' ],
        [ ['{1}abc{2}', 'X', 'Y'], 'XabcY' ],
        [ ['{1}{2}', 'X', 'Y'], 'XY' ],
        [ ['d{3}a{1}b{2}c', 'X', 'Y', 'Z'], 'dZaXbYc' ],
        [ ['{3}{1}{2}', 'X', 'Y', 'Z'], 'ZXY' ],
        [ ['a{3}\nb\\<{2}$`{1}x', '\tX', 'Y\'', '\"Z'], 'a\"Z\nb\\<Y\'$`\tXx' ],
        [ ['a{0}\nb\\<{2}$`{1}x', '\tX', 'Y\'' ], 'a{0}\nb\\<Y\'$`\tXx' ],
        [ [''], '' ],
        [ ['abc'], 'abc' ],
        [ ['\'\''], '\'\'' ],
        [ ['\"\"'], '\"\"' ],
        [ ['``'], '``' ],
        [ ['\n\n'], '\n\n' ],
        [ ['\t\t'], '\t\t' ],
        [ ['\\\\'], '\\\\' ],
        [ ['$$'], '$$' ],
        [ ['${1}${2}', 'X', 'Y'], '$X$Y' ],
        [ [' '], ' ' ],
        [ ['abc{1}', 'X'], 'abcX' ],
        [ ['abc{1} {2}', 'X', 'Y'], 'abcX Y' ],
        [ ['{1}abc{2}', 'X', 'Y'], 'XabcY' ],
        [ ['{1}{2}', 'X', 'Y'], 'XY' ],
        [ ['d{3}a{1}b{2}c', 'X', 'Y', 'Z'], 'dZaXbYc' ],
        [ ['{3}{1}{2}', 'X', 'Y', 'Z'], 'ZXY' ],
        [ ['a{3}\nb\\<{2}$`{1}x', '\tX', 'Y\'', '\"Z'], 'a\"Z\nb\\<Y\'$`\tXx' ],
        [ ['a{0}\nb\\<{2}$`{1}x', '\tX', 'Y\'' ], 'a{0}\nb\\<Y\'$`\tXx' ],
      ].forEach((param) => {
        console.log('i18nFormat(): ' + JSON.stringify(param));
        assert.equal(BehaviorsStore._I18nBehavior.i18nFormat(...param[0]), param[1], 'i18nFormat(): ' + JSON.stringify(param));
      });
      done();
    });
  });

});
