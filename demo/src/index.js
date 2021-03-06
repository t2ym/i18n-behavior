/**
@license https://github.com/t2ym/i18n-behavior/blob/master/LICENSE.md
Copyright (c) 2016, Tetsuya Mori <t2y3141592@gmail.com>. All rights reserved.
*/
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import "@polymer/paper-styles/demo-pages.js";
import "@polymer/iron-demo-helpers/demo-snippet.js";
import "@polymer/iron-demo-helpers/demo-pages-shared-styles.js";
import "../../i18n-behavior.js";
import "./i18n-behavior-demo.js";

{
  const $_documentContainer = document.createElement('template');

  $_documentContainer.innerHTML = `<style is="custom-style" include="demo-pages-shared-styles">
        .vertical-section-container {
          max-width: 768px;
        }

        @media (max-width: 640px) {

          body {
            font-size: 14px;
            margin: 0;
            padding: 4px;
            background-color: var(--paper-grey-50);
          }

          .horizontal-section {
            background-color: white;
            padding: 8px;
            margin-right: 4px;
            min-width: 200px;

            @apply(--shadow-elevation-2dp);
          }

          .vertical-section {
            background-color: white;
            padding: 8px;
            margin: 0 4px 8px 4px;

            @apply(--shadow-elevation-2dp);
          }

        }
      </style>`;

  document.head.appendChild($_documentContainer.content);
}
{
  const $_documentContainer = document.createElement('template');

  $_documentContainer.innerHTML = `<style is="custom-style">
        --demo-snippet-code {
          @apply(--paper-font-code1);
        }

        ul {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
        }

        code {
          font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
          color: black;
        }

        pre {
          font-family: 'Roboto Mono', 'Consolas', 'Menlo', monospace;
          color: black;
        }

        #input {
          width: 200px;
        }

        .input {
          font-family: 'Roboto', sans-serif;
          font-size: 16px;
          border-width: 0px;
          outline-width: 0px;
        }

        .select {
          font-family: 'Roboto', sans-serif;
          font-size: 16px;
          outline-width: 0px;
          border-width: 0px;
          background-color: rgba(255,255,255,0.0);
        }

        option {
          position: relative;
          top: -1;
          color: black;
          outline-width: 0px;
          border-width: 0px;
        }

        .dropdown {
          --editable-dropdown-menu: {
            display: inline-block;
            margin-right: 8px;
            text-align: left;
            width: 180px;
          };
        }

        .demo-paper-dropdown-menu {
          font-family: 'Roboto', 'Noto', Helvetica, sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
          text-align: left;
          margin: auto;
          width: 180px;
        }

        @media (max-width: 640px) {

          body {
            font-size: 14px;
            margin: 0;
            padding: 4px;
            background-color: var(--paper-grey-50);
          }

          .horizontal-section {
            background-color: white;
            padding: 8px;
            margin-right: 4px;
            min-width: 200px;

            @apply(--shadow-elevation-2dp);
          }

          .vertical-section {
            background-color: white;
            padding: 8px;
            margin: 0 4px 8px 4px;

            @apply(--shadow-elevation-2dp);
          }

        }
      </style>`;

  document.head.appendChild($_documentContainer.content);
}
{
  const $_documentContainer = document.createElement('template');

  $_documentContainer.innerHTML = `<div class="vertical-section-container centered">

        <h1><code>i18n-behavior</code> Demo</h1>


        <div class="vertical-section-container">


          <h2><code>&lt;i18n-behavior-demo&gt;</code> Element</h2>
          <demo-snippet id="demo-snippet" class="left-aligned-demo">
            <template>
              <i18n-behavior-demo id="i18n-behavior-demo"></i18n-behavior-demo>
            </template>
          </demo-snippet>
        </div>`;

  /*
          <h2><code>i18n-dom-bind</code></h2>
          <demo-snippet id="i18n-dom-bind-demo" class="left-aligned-demo">
            <template>
              <i18n-dom-bind id="bind">
                <template>
                  <h2>{{is}}</h2>
                  <ul>
                    <li id="label">UI Text Label</li>
                    <li><input id="input" placeholder="Placeholder Label"></li>
                    <li>lang = {{effectiveLang}} (This item is automatically converted to <code>&lt;i18n-format&gt;</code>)</li>
                    <li><pre>text = {{serialize(text)}}</pre></li>
                    <li id="fallback"><i18n-format><json-data>{
                      "en": "The last 2 items are missing in non-{1} and fall back to English",
                      "other": "The last 2 items are missing in {1} and fall back to English" 
                    }</json-data><i>{{effectiveLang}}</i></i18n-format></li>
                  </ul>
                </template>
              </i18n-dom-bind>
            </template>
            <script type="text/markdown">
              <i18n-dom-bind id="bind" lang="en">
                <template>
                  <h2>{{is}}</h2>
                  <ul>
                    <li id="label">UI Text Label</li>
                    <li><input id="input" placeholder="Placeholder Label"></li>
                    <li>lang = {{effectiveLang}} (This item is automatically converted to <code>&lt;i18n-format&gt;</code>)</li>
                    <li><pre>text = {{serialize(text)}}</pre></li>
                    <li id="fallback"><i18n-format><json-data>{
                      "en": "The last 2 items are missing in non-{1} and fall back to English",
                      "other": "The last 2 items are missing in {1} and fall back to English" 
                    }</json-data><i>{{effectiveLang}}</i></i18n-format></li>
                  </ul>
                </template>
              </i18n-dom-bind>
              <﻿script>
                window.addEventListener('dom-change', function onDomChange (e) {
                  if (e.target === window.bind) {
                    bind.observeHtmlLang = false;
                    window.setInterval(function () {
                      this.lang = this.lang !== 'ja' ? 'ja' : 'en';
                    }.bind(bind), 1000);
                    bind.langUpdated = function (e) {
                      this.model = deepcopy(this.text.model);
                    };
                    bind.listen(bind, 'lang-updated', 'langUpdated');
                    window.removeEventListener('dom-change', onDomChange);
                  }
                });
              <﻿/script>

              Contents of locales/bind.ja.json
              {
                "model": {
                  "input": {
                    "placeholder": "プレースホルダー ラベル"
                  }
                },
                "label": "UI テキストラベル",
                "ul_1:li_2": [
                  "lang = {1} (この項目は自動的に {2} へ変換されます)",
                  "{{lang}}",
                  "<i18n-format>"
                ]
              }
            &lt;/script>
          </demo-snippet>
        </div>
      </div>`;
  */

  document.body.appendChild($_documentContainer.content);
}

var demoSnippets = document.querySelectorAll('demo-snippet');
Array.prototype.forEach.call(demoSnippets, function (demo) {
  var script = dom(demo).queryDistributedElements('script[type="text/markdown"]')[0];

  if (!script) {
    return;
  }

  var snippet = script.innerHTML;
  var match = snippet.match(/\n([ ]*)/);
  if (match && match[1]) {
    var lines = snippet.split(/\n/);
    snippet = 
      lines.map(function (line) {
        if (line.indexOf(match[1]) === 0) {
          line = line.slice(match[1].length);               
        }
        return line;
      }).join('\n');
  }

  snippet = '```\n' + snippet + '\n```';
  snippet = snippet.replace(/=""/g, '');

  demo._markdown = snippet;
});
var demoSnippet = document.querySelector('demo-snippet#demo-snippet');
demoSnippet.addEventListener('markdown-changed', function (e) {
  demoSnippet._markdown = e.detail.markdown;
});
