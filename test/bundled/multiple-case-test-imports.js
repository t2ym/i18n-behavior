/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/'use strict';const nativeShadow=!(window['ShadyDOM']&&window['ShadyDOM']['inUse']);let nativeCssVariables_;/**
                          * @param {(ShadyCSSOptions | ShadyCSSInterface)=} settings
                          */function calcCssVariables(settings){if(settings&&settings['shimcssproperties']){nativeCssVariables_=false;}else{// chrome 49 has semi-working css vars, check if box-shadow works
// safari 9.1 has a recalc bug: https://bugs.webkit.org/show_bug.cgi?id=155782
// However, shim css custom properties are only supported with ShadyDOM enabled,
// so fall back on native if we do not detect ShadyDOM
// Edge 15: custom properties used in ::before and ::after will also be used in the parent element
// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12414257/
nativeCssVariables_=nativeShadow||Boolean(!navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/)&&window.CSS&&CSS.supports&&CSS.supports('box-shadow','0 0 0 var(--foo)'));}}/** @type {string | undefined} */let cssBuild;if(window.ShadyCSS&&window.ShadyCSS.cssBuild!==undefined){cssBuild=window.ShadyCSS.cssBuild;}if(window.ShadyCSS&&window.ShadyCSS.nativeCss!==undefined){nativeCssVariables_=window.ShadyCSS.nativeCss;}else if(window.ShadyCSS){calcCssVariables(window.ShadyCSS);// reset window variable to let ShadyCSS API take its place
window.ShadyCSS=undefined;}else{calcCssVariables(window['WebComponents']&&window['WebComponents']['flags']);}// Hack for type error under new type inference which doesn't like that
// nativeCssVariables is updated in a function and assigns the type
// `function(): ?` instead of `boolean`.
const nativeCssVariables=/** @type {boolean} */nativeCssVariables_;var styleSettings={nativeShadow:nativeShadow,get cssBuild(){return cssBuild;},nativeCssVariables:nativeCssVariables};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */ /*
      Extremely simple css parser. Intended to be not more than what we need
      and definitely not necessarily correct =).
      */'use strict';/** @unrestricted */class StyleNode{constructor(){/** @type {number} */this['start']=0;/** @type {number} */this['end']=0;/** @type {StyleNode} */this['previous']=null;/** @type {StyleNode} */this['parent']=null;/** @type {Array<StyleNode>} */this['rules']=null;/** @type {string} */this['parsedCssText']='';/** @type {string} */this['cssText']='';/** @type {boolean} */this['atRule']=false;/** @type {number} */this['type']=0;/** @type {string} */this['keyframesName']='';/** @type {string} */this['selector']='';/** @type {string} */this['parsedSelector']='';}}/**
   * @param {string} text
   * @return {StyleNode}
   */function parse(text){text=clean(text);return parseCss(lex(text),text);}// remove stuff we don't care about that may hinder parsing
/**
 * @param {string} cssText
 * @return {string}
 */function clean(cssText){return cssText.replace(RX.comments,'').replace(RX.port,'');}// super simple {...} lexer that returns a node tree
/**
 * @param {string} text
 * @return {StyleNode}
 */function lex(text){let root=new StyleNode();root['start']=0;root['end']=text.length;let n=root;for(let i=0,l=text.length;i<l;i++){if(text[i]===OPEN_BRACE){if(!n['rules']){n['rules']=[];}let p=n;let previous=p['rules'][p['rules'].length-1]||null;n=new StyleNode();n['start']=i+1;n['parent']=p;n['previous']=previous;p['rules'].push(n);}else if(text[i]===CLOSE_BRACE){n['end']=i+1;n=n['parent']||root;}}return root;}// add selectors/cssText to node tree
/**
 * @param {StyleNode} node
 * @param {string} text
 * @return {StyleNode}
 */function parseCss(node,text){let t=text.substring(node['start'],node['end']-1);node['parsedCssText']=node['cssText']=t.trim();if(node['parent']){let ss=node['previous']?node['previous']['end']:node['parent']['start'];t=text.substring(ss,node['start']-1);t=_expandUnicodeEscapes(t);t=t.replace(RX.multipleSpaces,' ');// TODO(sorvell): ad hoc; make selector include only after last ;
// helps with mixin syntax
t=t.substring(t.lastIndexOf(';')+1);let s=node['parsedSelector']=node['selector']=t.trim();node['atRule']=s.indexOf(AT_START)===0;// note, support a subset of rule types...
if(node['atRule']){if(s.indexOf(MEDIA_START)===0){node['type']=types.MEDIA_RULE;}else if(s.match(RX.keyframesRule)){node['type']=types.KEYFRAMES_RULE;node['keyframesName']=node['selector'].split(RX.multipleSpaces).pop();}}else{if(s.indexOf(VAR_START)===0){node['type']=types.MIXIN_RULE;}else{node['type']=types.STYLE_RULE;}}}let r$=node['rules'];if(r$){for(let i=0,l=r$.length,r;i<l&&(r=r$[i]);i++){parseCss(r,text);}}return node;}/**
   * conversion of sort unicode escapes with spaces like `\33 ` (and longer) into
   * expanded form that doesn't require trailing space `\000033`
   * @param {string} s
   * @return {string}
   */function _expandUnicodeEscapes(s){return s.replace(/\\([0-9a-f]{1,6})\s/gi,function(){let code=arguments[1],repeat=6-code.length;while(repeat--){code='0'+code;}return'\\'+code;});}/**
   * stringify parsed css.
   * @param {StyleNode} node
   * @param {boolean=} preserveProperties
   * @param {string=} text
   * @return {string}
   */function stringify(node,preserveProperties,text=''){// calc rule cssText
let cssText='';if(node['cssText']||node['rules']){let r$=node['rules'];if(r$&&!_hasMixinRules(r$)){for(let i=0,l=r$.length,r;i<l&&(r=r$[i]);i++){cssText=stringify(r,preserveProperties,cssText);}}else{cssText=preserveProperties?node['cssText']:removeCustomProps(node['cssText']);cssText=cssText.trim();if(cssText){cssText='  '+cssText+'\n';}}}// emit rule if there is cssText
if(cssText){if(node['selector']){text+=node['selector']+' '+OPEN_BRACE+'\n';}text+=cssText;if(node['selector']){text+=CLOSE_BRACE+'\n\n';}}return text;}/**
   * @param {Array<StyleNode>} rules
   * @return {boolean}
   */function _hasMixinRules(rules){let r=rules[0];return Boolean(r)&&Boolean(r['selector'])&&r['selector'].indexOf(VAR_START)===0;}/**
   * @param {string} cssText
   * @return {string}
   */function removeCustomProps(cssText){cssText=removeCustomPropAssignment(cssText);return removeCustomPropApply(cssText);}/**
   * @param {string} cssText
   * @return {string}
   */function removeCustomPropAssignment(cssText){return cssText.replace(RX.customProp,'').replace(RX.mixinProp,'');}/**
   * @param {string} cssText
   * @return {string}
   */function removeCustomPropApply(cssText){return cssText.replace(RX.mixinApply,'').replace(RX.varApply,'');}/** @enum {number} */const types={STYLE_RULE:1,KEYFRAMES_RULE:7,MEDIA_RULE:4,MIXIN_RULE:1000};const OPEN_BRACE='{';const CLOSE_BRACE='}';// helper regexp's
const RX={comments:/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,port:/@import[^;]*;/gim,customProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,mixinProp:/(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,mixinApply:/@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,varApply:/[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,keyframesRule:/^@[^\s]*keyframes/,multipleSpaces:/\s+/g};const VAR_START='--';const MEDIA_START='@media';const AT_START='@';var cssParse={StyleNode:StyleNode,parse:parse,stringify:stringify,removeCustomPropAssignment:removeCustomPropAssignment,types:types};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */const VAR_ASSIGN=/(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi;const MIXIN_MATCH=/(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi;const VAR_CONSUMED=/(--[\w-]+)\s*([:,;)]|$)/gi;const ANIMATION_MATCH=/(animation\s*:)|(animation-name\s*:)/;const MEDIA_MATCH=/@media\s(.*)/;const IS_VAR=/^--/;const BRACKETED=/\{[^}]*\}/g;const HOST_PREFIX='(?:^|[^.#[:])';const HOST_SUFFIX='($|[.:[\\s>+~])';var commonRegex={VAR_ASSIGN:VAR_ASSIGN,MIXIN_MATCH:MIXIN_MATCH,VAR_CONSUMED:VAR_CONSUMED,ANIMATION_MATCH:ANIMATION_MATCH,MEDIA_MATCH:MEDIA_MATCH,IS_VAR:IS_VAR,BRACKETED:BRACKETED,HOST_PREFIX:HOST_PREFIX,HOST_SUFFIX:HOST_SUFFIX};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';/** @type {!Set<string>} */const styleTextSet=new Set();const scopingAttribute='shady-unscoped';/**
                                                   * Add a specifically-marked style to the document directly, and only one copy of that style.
                                                   *
                                                   * @param {!HTMLStyleElement} style
                                                   * @return {undefined}
                                                   */function processUnscopedStyle(style){const text=style.textContent;if(!styleTextSet.has(text)){styleTextSet.add(text);const newStyle=style.cloneNode(true);document.head.appendChild(newStyle);}}/**
   * Check if a style is supposed to be unscoped
   * @param {!HTMLStyleElement} style
   * @return {boolean} true if the style has the unscoping attribute
   */function isUnscopedStyle(style){return style.hasAttribute(scopingAttribute);}var unscopedStyleHandler={scopingAttribute:scopingAttribute,processUnscopedStyle:processUnscopedStyle,isUnscopedStyle:isUnscopedStyle};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';function toCssText(rules,callback){if(!rules){return'';}if(typeof rules==='string'){rules=parse(rules);}if(callback){forEachRule(rules,callback);}return stringify(rules,nativeCssVariables);}/**
   * @param {HTMLStyleElement} style
   * @return {StyleNode}
   */function rulesForStyle(style){if(!style['__cssRules']&&style.textContent){style['__cssRules']=parse(style.textContent);}return style['__cssRules']||null;}// Tests if a rule is a keyframes selector, which looks almost exactly
// like a normal selector but is not (it has nothing to do with scoping
// for example).
/**
 * @param {StyleNode} rule
 * @return {boolean}
 */function isKeyframesSelector(rule){return Boolean(rule['parent'])&&rule['parent']['type']===types.KEYFRAMES_RULE;}/**
   * @param {StyleNode} node
   * @param {Function=} styleRuleCallback
   * @param {Function=} keyframesRuleCallback
   * @param {boolean=} onlyActiveRules
   */function forEachRule(node,styleRuleCallback,keyframesRuleCallback,onlyActiveRules){if(!node){return;}let skipRules=false;let type=node['type'];if(onlyActiveRules){if(type===types.MEDIA_RULE){let matchMedia=node['selector'].match(MEDIA_MATCH);if(matchMedia){// if rule is a non matching @media rule, skip subrules
if(!window.matchMedia(matchMedia[1]).matches){skipRules=true;}}}}if(type===types.STYLE_RULE){styleRuleCallback(node);}else if(keyframesRuleCallback&&type===types.KEYFRAMES_RULE){keyframesRuleCallback(node);}else if(type===types.MIXIN_RULE){skipRules=true;}let r$=node['rules'];if(r$&&!skipRules){for(let i=0,l=r$.length,r;i<l&&(r=r$[i]);i++){forEachRule(r,styleRuleCallback,keyframesRuleCallback,onlyActiveRules);}}}// add a string of cssText to the document.
/**
 * @param {string} cssText
 * @param {string} moniker
 * @param {Node} target
 * @param {Node} contextNode
 * @return {HTMLStyleElement}
 */function applyCss(cssText,moniker,target,contextNode){let style=createScopeStyle(cssText,moniker);applyStyle(style,target,contextNode);return style;}/**
   * @param {string} cssText
   * @param {string} moniker
   * @return {HTMLStyleElement}
   */function createScopeStyle(cssText,moniker){let style=/** @type {HTMLStyleElement} */document.createElement('style');if(moniker){style.setAttribute('scope',moniker);}style.textContent=cssText;return style;}/**
   * Track the position of the last added style for placing placeholders
   * @type {Node}
   */let lastHeadApplyNode=null;// insert a comment node as a styling position placeholder.
/**
 * @param {string} moniker
 * @return {!Comment}
 */function applyStylePlaceHolder(moniker){let placeHolder=document.createComment(' Shady DOM styles for '+moniker+' ');let after=lastHeadApplyNode?lastHeadApplyNode['nextSibling']:null;let scope=document.head;scope.insertBefore(placeHolder,after||scope.firstChild);lastHeadApplyNode=placeHolder;return placeHolder;}/**
   * @param {HTMLStyleElement} style
   * @param {?Node} target
   * @param {?Node} contextNode
   */function applyStyle(style,target,contextNode){target=target||document.head;let after=contextNode&&contextNode.nextSibling||target.firstChild;target.insertBefore(style,after);if(!lastHeadApplyNode){lastHeadApplyNode=style;}else{// only update lastHeadApplyNode if the new style is inserted after the old lastHeadApplyNode
let position=style.compareDocumentPosition(lastHeadApplyNode);if(position===Node.DOCUMENT_POSITION_PRECEDING){lastHeadApplyNode=style;}}}/**
   * @param {string} buildType
   * @return {boolean}
   */function isTargetedBuild(buildType){return nativeShadow?buildType==='shadow':buildType==='shady';}/**
   * Walk from text[start] matching parens and
   * returns position of the outer end paren
   * @param {string} text
   * @param {number} start
   * @return {number}
   */function findMatchingParen(text,start){let level=0;for(let i=start,l=text.length;i<l;i++){if(text[i]==='('){level++;}else if(text[i]===')'){if(--level===0){return i;}}}return-1;}/**
   * @param {string} str
   * @param {function(string, string, string, string)} callback
   */function processVariableAndFallback(str,callback){// find 'var('
let start=str.indexOf('var(');if(start===-1){// no var?, everything is prefix
return callback(str,'','','');}//${prefix}var(${inner})${suffix}
let end=findMatchingParen(str,start+3);let inner=str.substring(start+4,end);let prefix=str.substring(0,start);// suffix may have other variables
let suffix=processVariableAndFallback(str.substring(end+1),callback);let comma=inner.indexOf(',');// value and fallback args should be trimmed to match in property lookup
if(comma===-1){// variable, no fallback
return callback(prefix,inner.trim(),'',suffix);}// var(${value},${fallback})
let value=inner.substring(0,comma).trim();let fallback=inner.substring(comma+1).trim();return callback(prefix,value,fallback,suffix);}/**
   * @param {Element} element
   * @param {string} value
   */function setElementClassRaw(element,value){// use native setAttribute provided by ShadyDOM when setAttribute is patched
if(nativeShadow){element.setAttribute('class',value);}else{window['ShadyDOM']['nativeMethods']['setAttribute'].call(element,'class',value);}}/**
   * @type {function(*):*}
   */const wrap=window['ShadyDOM']&&window['ShadyDOM']['wrap']||(node=>node);/**
                                                                                         * @param {Element | {is: string, extends: string}} element
                                                                                         * @return {{is: string, typeExtension: string}}
                                                                                         */function getIsExtends(element){let localName=element['localName'];let is='',typeExtension='';/*
                          NOTE: technically, this can be wrong for certain svg elements
                          with `-` in the name like `<font-face>`
                          */if(localName){if(localName.indexOf('-')>-1){is=localName;}else{typeExtension=localName;is=element.getAttribute&&element.getAttribute('is')||'';}}else{is=/** @type {?} */element.is;typeExtension=/** @type {?} */element.extends;}return{is,typeExtension};}/**
   * @param {Element|DocumentFragment} element
   * @return {string}
   */function gatherStyleText(element){/** @type {!Array<string>} */const styleTextParts=[];const styles=/** @type {!NodeList<!HTMLStyleElement>} */element.querySelectorAll('style');for(let i=0;i<styles.length;i++){const style=styles[i];if(isUnscopedStyle(style)){if(!nativeShadow){processUnscopedStyle(style);style.parentNode.removeChild(style);}}else{styleTextParts.push(style.textContent);style.parentNode.removeChild(style);}}return styleTextParts.join('').trim();}/**
   * Split a selector separated by commas into an array in a smart way
   * @param {string} selector
   * @return {!Array<string>}
   */function splitSelectorList(selector){const parts=[];let part='';for(let i=0;i>=0&&i<selector.length;i++){// A selector with parentheses will be one complete part
if(selector[i]==='('){// find the matching paren
const end=findMatchingParen(selector,i);// push the paren block into the part
part+=selector.slice(i,end+1);// move the index to after the paren block
i=end;}else if(selector[i]===','){parts.push(part);part='';}else{part+=selector[i];}}// catch any pieces after the last comma
if(part){parts.push(part);}return parts;}const CSS_BUILD_ATTR='css-build';/**
                                     * Return the polymer-css-build "build type" applied to this element
                                     *
                                     * @param {!HTMLElement} element
                                     * @return {string} Can be "", "shady", or "shadow"
                                     */function getCssBuild(element){if(cssBuild!==undefined){return(/** @type {string} */cssBuild);}if(element.__cssBuild===undefined){// try attribute first, as it is the common case
const attrValue=element.getAttribute(CSS_BUILD_ATTR);if(attrValue){element.__cssBuild=attrValue;}else{const buildComment=getBuildComment(element);if(buildComment!==''){// remove build comment so it is not needlessly copied into every element instance
removeBuildComment(element);}element.__cssBuild=buildComment;}}return element.__cssBuild||'';}/**
   * Check if the given element, either a <template> or <style>, has been processed
   * by polymer-css-build.
   *
   * If so, then we can make a number of optimizations:
   * - polymer-css-build will decompose mixins into individual CSS Custom Properties,
   * so the ApplyShim can be skipped entirely.
   * - Under native ShadowDOM, the style text can just be copied into each instance
   * without modification
   * - If the build is "shady" and ShadyDOM is in use, the styling does not need
   * scoping beyond the shimming of CSS Custom Properties
   *
   * @param {!HTMLElement} element
   * @return {boolean}
   */function elementHasBuiltCss(element){return getCssBuild(element)!=='';}/**
   * For templates made with tagged template literals, polymer-css-build will
   * insert a comment of the form `<!--css-build:shadow-->`
   *
   * @param {!HTMLElement} element
   * @return {string}
   */function getBuildComment(element){const buildComment=element.localName==='template'?/** @type {!HTMLTemplateElement} */element.content.firstChild:element.firstChild;if(buildComment instanceof Comment){const commentParts=buildComment.textContent.trim().split(':');if(commentParts[0]===CSS_BUILD_ATTR){return commentParts[1];}}return'';}/**
   * Check if the css build status is optimal, and do no unneeded work.
   *
   * @param {string=} cssBuild CSS build status
   * @return {boolean} css build is optimal or not
   */function isOptimalCssBuild(cssBuild$$1=''){// CSS custom property shim always requires work
if(cssBuild$$1===''||!nativeCssVariables){return false;}return nativeShadow?cssBuild$$1==='shadow':cssBuild$$1==='shady';}/**
   * @param {!HTMLElement} element
   */function removeBuildComment(element){const buildComment=element.localName==='template'?/** @type {!HTMLTemplateElement} */element.content.firstChild:element.firstChild;buildComment.parentNode.removeChild(buildComment);}var styleUtil={toCssText:toCssText,rulesForStyle:rulesForStyle,isKeyframesSelector:isKeyframesSelector,forEachRule:forEachRule,applyCss:applyCss,createScopeStyle:createScopeStyle,applyStylePlaceHolder:applyStylePlaceHolder,applyStyle:applyStyle,isTargetedBuild:isTargetedBuild,findMatchingParen:findMatchingParen,processVariableAndFallback:processVariableAndFallback,setElementClassRaw:setElementClassRaw,wrap:wrap,getIsExtends:getIsExtends,gatherStyleText:gatherStyleText,splitSelectorList:splitSelectorList,getCssBuild:getCssBuild,elementHasBuiltCss:elementHasBuiltCss,getBuildComment:getBuildComment,isOptimalCssBuild:isOptimalCssBuild};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';function updateNativeProperties(element,properties){// remove previous properties
for(let p in properties){// NOTE: for bc with shim, don't apply null values.
if(p===null){element.style.removeProperty(p);}else{element.style.setProperty(p,properties[p]);}}}/**
   * @param {Element} element
   * @param {string} property
   * @return {string}
   */function getComputedStyleValue(element,property){/**
   * @const {string}
   */const value=window.getComputedStyle(element).getPropertyValue(property);if(!value){return'';}else{return value.trim();}}/**
   * return true if `cssText` contains a mixin definition or consumption
   * @param {string} cssText
   * @return {boolean}
   */function detectMixin(cssText){const has=MIXIN_MATCH.test(cssText)||VAR_ASSIGN.test(cssText);// reset state of the regexes
MIXIN_MATCH.lastIndex=0;VAR_ASSIGN.lastIndex=0;return has;}var commonUtils={updateNativeProperties:updateNativeProperties,getComputedStyleValue:getComputedStyleValue,detectMixin:detectMixin};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */ /*
       * The apply shim simulates the behavior of `@apply` proposed at
       * https://tabatkins.github.io/specs/css-apply-rule/.
       * The approach is to convert a property like this:
       *
       *    --foo: {color: red; background: blue;}
       *
       * to this:
       *
       *    --foo_-_color: red;
       *    --foo_-_background: blue;
       *
       * Then where `@apply --foo` is used, that is converted to:
       *
       *    color: var(--foo_-_color);
       *    background: var(--foo_-_background);
       *
       * This approach generally works but there are some issues and limitations.
       * Consider, for example, that somewhere *between* where `--foo` is set and used,
       * another element sets it to:
       *
       *    --foo: { border: 2px solid red; }
       *
       * We must now ensure that the color and background from the previous setting
       * do not apply. This is accomplished by changing the property set to this:
       *
       *    --foo_-_border: 2px solid red;
       *    --foo_-_color: initial;
       *    --foo_-_background: initial;
       *
       * This works but introduces one new issue.
       * Consider this setup at the point where the `@apply` is used:
       *
       *    background: orange;
       *    `@apply` --foo;
       *
       * In this case the background will be unset (initial) rather than the desired
       * `orange`. We address this by altering the property set to use a fallback
       * value like this:
       *
       *    color: var(--foo_-_color);
       *    background: var(--foo_-_background, orange);
       *    border: var(--foo_-_border);
       *
       * Note that the default is retained in the property set and the `background` is
       * the desired `orange`. This leads us to a limitation.
       *
       * Limitation 1:
      
       * Only properties in the rule where the `@apply`
       * is used are considered as default values.
       * If another rule matches the element and sets `background` with
       * less specificity than the rule in which `@apply` appears,
       * the `background` will not be set.
       *
       * Limitation 2:
       *
       * When using Polymer's `updateStyles` api, new properties may not be set for
       * `@apply` properties.
      
      */'use strict';const APPLY_NAME_CLEAN=/;\s*/m;const INITIAL_INHERIT=/^\s*(initial)|(inherit)\s*$/;const IMPORTANT=/\s*!important/;// separator used between mixin-name and mixin-property-name when producing properties
// NOTE: plain '-' may cause collisions in user styles
const MIXIN_VAR_SEP='_-_';/**
                              * @typedef {!Object<string, string>}
                              */let PropertyEntry;// eslint-disable-line no-unused-vars
/**
 * @typedef {!Object<string, boolean>}
 */let DependantsEntry;// eslint-disable-line no-unused-vars
/** @typedef {{
 *    properties: PropertyEntry,
 *    dependants: DependantsEntry
 * }}
 */let MixinMapEntry;// eslint-disable-line no-unused-vars
// map of mixin to property names
// --foo: {border: 2px} -> {properties: {(--foo, ['border'])}, dependants: {'element-name': proto}}
class MixinMap{constructor(){/** @type {!Object<string, !MixinMapEntry>} */this._map={};}/**
     * @param {string} name
     * @param {!PropertyEntry} props
     */set(name,props){name=name.trim();this._map[name]={properties:props,dependants:{}};}/**
     * @param {string} name
     * @return {MixinMapEntry}
     */get(name){name=name.trim();return this._map[name]||null;}}/**
   * Callback for when an element is marked invalid
   * @type {?function(string)}
   */let invalidCallback=null;/** @unrestricted */class ApplyShim{constructor(){/** @type {?string} */this._currentElement=null;/** @type {HTMLMetaElement} */this._measureElement=null;this._map=new MixinMap();}/**
     * return true if `cssText` contains a mixin definition or consumption
     * @param {string} cssText
     * @return {boolean}
     */detectMixin(cssText){return detectMixin(cssText);}/**
     * Gather styles into one style for easier processing
     * @param {!HTMLTemplateElement} template
     * @return {HTMLStyleElement}
     */gatherStyles(template){const styleText=gatherStyleText(template.content);if(styleText){const style=/** @type {!HTMLStyleElement} */document.createElement('style');style.textContent=styleText;template.content.insertBefore(style,template.content.firstChild);return style;}return null;}/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @return {StyleNode}
     */transformTemplate(template,elementName){if(template._gatheredStyle===undefined){template._gatheredStyle=this.gatherStyles(template);}/** @type {HTMLStyleElement} */const style=template._gatheredStyle;return style?this.transformStyle(style,elementName):null;}/**
     * @param {!HTMLStyleElement} style
     * @param {string} elementName
     * @return {StyleNode}
     */transformStyle(style,elementName=''){let ast=rulesForStyle(style);this.transformRules(ast,elementName);style.textContent=toCssText(ast);return ast;}/**
     * @param {!HTMLStyleElement} style
     * @return {StyleNode}
     */transformCustomStyle(style){let ast=rulesForStyle(style);forEachRule(ast,rule=>{if(rule['selector']===':root'){rule['selector']='html';}this.transformRule(rule);});style.textContent=toCssText(ast);return ast;}/**
     * @param {StyleNode} rules
     * @param {string} elementName
     */transformRules(rules,elementName){this._currentElement=elementName;forEachRule(rules,r=>{this.transformRule(r);});this._currentElement=null;}/**
     * @param {!StyleNode} rule
     */transformRule(rule){rule['cssText']=this.transformCssText(rule['parsedCssText'],rule);// :root was only used for variable assignment in property shim,
// but generates invalid selectors with real properties.
// replace with `:host > *`, which serves the same effect
if(rule['selector']===':root'){rule['selector']=':host > *';}}/**
     * @param {string} cssText
     * @param {!StyleNode} rule
     * @return {string}
     */transformCssText(cssText,rule){// produce variables
cssText=cssText.replace(VAR_ASSIGN,(matchText,propertyName,valueProperty,valueMixin)=>this._produceCssProperties(matchText,propertyName,valueProperty,valueMixin,rule));// consume mixins
return this._consumeCssProperties(cssText,rule);}/**
     * @param {string} property
     * @return {string}
     */_getInitialValueForProperty(property){if(!this._measureElement){this._measureElement=/** @type {HTMLMetaElement} */document.createElement('meta');this._measureElement.setAttribute('apply-shim-measure','');this._measureElement.style.all='initial';document.head.appendChild(this._measureElement);}return window.getComputedStyle(this._measureElement).getPropertyValue(property);}/**
     * Walk over all rules before this rule to find fallbacks for mixins
     *
     * @param {!StyleNode} startRule
     * @return {!Object}
     */_fallbacksFromPreviousRules(startRule){// find the "top" rule
let topRule=startRule;while(topRule['parent']){topRule=topRule['parent'];}const fallbacks={};let seenStartRule=false;forEachRule(topRule,r=>{// stop when we hit the input rule
seenStartRule=seenStartRule||r===startRule;if(seenStartRule){return;}// NOTE: Only matching selectors are "safe" for this fallback processing
// It would be prohibitive to run `matchesSelector()` on each selector,
// so we cheat and only check if the same selector string is used, which
// guarantees things like specificity matching
if(r['selector']===startRule['selector']){Object.assign(fallbacks,this._cssTextToMap(r['parsedCssText']));}});return fallbacks;}/**
     * replace mixin consumption with variable consumption
     * @param {string} text
     * @param {!StyleNode=} rule
     * @return {string}
     */_consumeCssProperties(text,rule){/** @type {Array} */let m=null;// loop over text until all mixins with defintions have been applied
while(m=MIXIN_MATCH.exec(text)){let matchText=m[0];let mixinName=m[1];let idx=m.index;// collect properties before apply to be "defaults" if mixin might override them
// match includes a "prefix", so find the start and end positions of @apply
let applyPos=idx+matchText.indexOf('@apply');let afterApplyPos=idx+matchText.length;// find props defined before this @apply
let textBeforeApply=text.slice(0,applyPos);let textAfterApply=text.slice(afterApplyPos);let defaults=rule?this._fallbacksFromPreviousRules(rule):{};Object.assign(defaults,this._cssTextToMap(textBeforeApply));let replacement=this._atApplyToCssProperties(mixinName,defaults);// use regex match position to replace mixin, keep linear processing time
text=`${textBeforeApply}${replacement}${textAfterApply}`;// move regex search to _after_ replacement
MIXIN_MATCH.lastIndex=idx+replacement.length;}return text;}/**
     * produce variable consumption at the site of mixin consumption
     * `@apply` --foo; -> for all props (${propname}: var(--foo_-_${propname}, ${fallback[propname]}}))
     * Example:
     *  border: var(--foo_-_border); padding: var(--foo_-_padding, 2px)
     *
     * @param {string} mixinName
     * @param {Object} fallbacks
     * @return {string}
     */_atApplyToCssProperties(mixinName,fallbacks){mixinName=mixinName.replace(APPLY_NAME_CLEAN,'');let vars=[];let mixinEntry=this._map.get(mixinName);// if we depend on a mixin before it is created
// make a sentinel entry in the map to add this element as a dependency for when it is defined.
if(!mixinEntry){this._map.set(mixinName,{});mixinEntry=this._map.get(mixinName);}if(mixinEntry){if(this._currentElement){mixinEntry.dependants[this._currentElement]=true;}let p,parts,f;const properties=mixinEntry.properties;for(p in properties){f=fallbacks&&fallbacks[p];parts=[p,': var(',mixinName,MIXIN_VAR_SEP,p];if(f){parts.push(',',f.replace(IMPORTANT,''));}parts.push(')');if(IMPORTANT.test(properties[p])){parts.push(' !important');}vars.push(parts.join(''));}}return vars.join('; ');}/**
     * @param {string} property
     * @param {string} value
     * @return {string}
     */_replaceInitialOrInherit(property,value){let match=INITIAL_INHERIT.exec(value);if(match){if(match[1]){// initial
// replace `initial` with the concrete initial value for this property
value=this._getInitialValueForProperty(property);}else{// inherit
// with this purposfully illegal value, the variable will be invalid at
// compute time (https://www.w3.org/TR/css-variables/#invalid-at-computed-value-time)
// and for inheriting values, will behave similarly
// we cannot support the same behavior for non inheriting values like 'border'
value='apply-shim-inherit';}}return value;}/**
     * "parse" a mixin definition into a map of properties and values
     * cssTextToMap('border: 2px solid black') -> ('border', '2px solid black')
     * @param {string} text
     * @param {boolean=} replaceInitialOrInherit
     * @return {!Object<string, string>}
     */_cssTextToMap(text,replaceInitialOrInherit=false){let props=text.split(';');let property,value;let out={};for(let i=0,p,sp;i<props.length;i++){p=props[i];if(p){sp=p.split(':');// ignore lines that aren't definitions like @media
if(sp.length>1){property=sp[0].trim();// some properties may have ':' in the value, like data urls
value=sp.slice(1).join(':');if(replaceInitialOrInherit){value=this._replaceInitialOrInherit(property,value);}out[property]=value;}}}return out;}/**
     * @param {MixinMapEntry} mixinEntry
     */_invalidateMixinEntry(mixinEntry){if(!invalidCallback){return;}for(let elementName in mixinEntry.dependants){if(elementName!==this._currentElement){invalidCallback(elementName);}}}/**
     * @param {string} matchText
     * @param {string} propertyName
     * @param {?string} valueProperty
     * @param {?string} valueMixin
     * @param {!StyleNode} rule
     * @return {string}
     */_produceCssProperties(matchText,propertyName,valueProperty,valueMixin,rule){// handle case where property value is a mixin
if(valueProperty){// form: --mixin2: var(--mixin1), where --mixin1 is in the map
processVariableAndFallback(valueProperty,(prefix,value)=>{if(value&&this._map.get(value)){valueMixin=`@apply ${value};`;}});}if(!valueMixin){return matchText;}let mixinAsProperties=this._consumeCssProperties(''+valueMixin,rule);let prefix=matchText.slice(0,matchText.indexOf('--'));// `initial` and `inherit` as properties in a map should be replaced because
// these keywords are eagerly evaluated when the mixin becomes CSS Custom Properties,
// and would set the variable value, rather than carry the keyword to the `var()` usage.
let mixinValues=this._cssTextToMap(mixinAsProperties,true);let combinedProps=mixinValues;let mixinEntry=this._map.get(propertyName);let oldProps=mixinEntry&&mixinEntry.properties;if(oldProps){// NOTE: since we use mixin, the map of properties is updated here
// and this is what we want.
combinedProps=Object.assign(Object.create(oldProps),mixinValues);}else{this._map.set(propertyName,combinedProps);}let out=[];let p,v;// set variables defined by current mixin
let needToInvalidate=false;for(p in combinedProps){v=mixinValues[p];// if property not defined by current mixin, set initial
if(v===undefined){v='initial';}if(oldProps&&!(p in oldProps)){needToInvalidate=true;}out.push(`${propertyName}${MIXIN_VAR_SEP}${p}: ${v}`);}if(needToInvalidate){this._invalidateMixinEntry(mixinEntry);}if(mixinEntry){mixinEntry.properties=combinedProps;}// because the mixinMap is global, the mixin might conflict with
// a different scope's simple variable definition:
// Example:
// some style somewhere:
// --mixin1:{ ... }
// --mixin2: var(--mixin1);
// some other element:
// --mixin1: 10px solid red;
// --foo: var(--mixin1);
// In this case, we leave the original variable definition in place.
if(valueProperty){prefix=`${matchText};${prefix}`;}return`${prefix}${out.join('; ')};`;}}/* exports */ /* eslint-disable no-self-assign */ApplyShim.prototype['detectMixin']=ApplyShim.prototype.detectMixin;ApplyShim.prototype['transformStyle']=ApplyShim.prototype.transformStyle;ApplyShim.prototype['transformCustomStyle']=ApplyShim.prototype.transformCustomStyle;ApplyShim.prototype['transformRules']=ApplyShim.prototype.transformRules;ApplyShim.prototype['transformRule']=ApplyShim.prototype.transformRule;ApplyShim.prototype['transformTemplate']=ApplyShim.prototype.transformTemplate;ApplyShim.prototype['_separator']=MIXIN_VAR_SEP;/* eslint-enable no-self-assign */Object.defineProperty(ApplyShim.prototype,'invalidCallback',{/** @return {?function(string)} */get(){return invalidCallback;},/** @param {?function(string)} cb */set(cb){invalidCallback=cb;}});var applyShim={default:ApplyShim};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';/**
               * @const {!Object<string, !HTMLTemplateElement>}
               */const templateMap={};var templateMap$1={default:templateMap};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';/*
               * Utilities for handling invalidating apply-shim mixins for a given template.
               *
               * The invalidation strategy involves keeping track of the "current" version of a template's mixins, and updating that count when a mixin is invalidated.
               * The template
               */ /** @const {string} */const CURRENT_VERSION='_applyShimCurrentVersion';/** @const {string} */const NEXT_VERSION='_applyShimNextVersion';/** @const {string} */const VALIDATING_VERSION='_applyShimValidatingVersion';/**
                                                           * @const {Promise<void>}
                                                           */const promise=Promise.resolve();/**
                                    * @param {string} elementName
                                    */function invalidate(elementName){let template=templateMap[elementName];if(template){invalidateTemplate(template);}}/**
   * This function can be called multiple times to mark a template invalid
   * and signal that the style inside must be regenerated.
   *
   * Use `startValidatingTemplate` to begin an asynchronous validation cycle.
   * During that cycle, call `templateIsValidating` to see if the template must
   * be revalidated
   * @param {HTMLTemplateElement} template
   */function invalidateTemplate(template){// default the current version to 0
template[CURRENT_VERSION]=template[CURRENT_VERSION]||0;// ensure the "validating for" flag exists
template[VALIDATING_VERSION]=template[VALIDATING_VERSION]||0;// increment the next version
template[NEXT_VERSION]=(template[NEXT_VERSION]||0)+1;}/**
   * @param {string} elementName
   * @return {boolean}
   */function isValid(elementName){let template=templateMap[elementName];if(template){return templateIsValid(template);}return true;}/**
   * @param {HTMLTemplateElement} template
   * @return {boolean}
   */function templateIsValid(template){return template[CURRENT_VERSION]===template[NEXT_VERSION];}/**
   * @param {string} elementName
   * @return {boolean}
   */function isValidating(elementName){let template=templateMap[elementName];if(template){return templateIsValidating(template);}return false;}/**
   * Returns true if the template is currently invalid and `startValidating` has been called since the last invalidation.
   * If false, the template must be validated.
   * @param {HTMLTemplateElement} template
   * @return {boolean}
   */function templateIsValidating(template){return!templateIsValid(template)&&template[VALIDATING_VERSION]===template[NEXT_VERSION];}/**
   * the template is marked as `validating` for one microtask so that all instances
   * found in the tree crawl of `applyStyle` will update themselves,
   * but the template will only be updated once.
   * @param {string} elementName
  */function startValidating(elementName){let template=templateMap[elementName];startValidatingTemplate(template);}/**
   * Begin an asynchronous invalidation cycle.
   * This should be called after every validation of a template
   *
   * After one microtask, the template will be marked as valid until the next call to `invalidateTemplate`
   * @param {HTMLTemplateElement} template
   */function startValidatingTemplate(template){// remember that the current "next version" is the reason for this validation cycle
template[VALIDATING_VERSION]=template[NEXT_VERSION];// however, there only needs to be one async task to clear the counters
if(!template._validating){template._validating=true;promise.then(function(){// sync the current version to let future invalidations cause a refresh cycle
template[CURRENT_VERSION]=template[NEXT_VERSION];template._validating=false;});}}/**
   * @return {boolean}
   */function elementsAreInvalid(){for(let elementName in templateMap){let template=templateMap[elementName];if(!templateIsValid(template)){return true;}}return false;}var applyShimUtils={invalidate:invalidate,invalidateTemplate:invalidateTemplate,isValid:isValid,templateIsValid:templateIsValid,isValidating:isValidating,templateIsValidating:templateIsValidating,startValidating:startValidating,startValidatingTemplate:startValidatingTemplate,elementsAreInvalid:elementsAreInvalid};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';/** @type {Promise<void>} */let readyPromise=null;/** @type {?function(?function())} */let whenReady=window['HTMLImports']&&window['HTMLImports']['whenReady']||null;/** @type {function()} */let resolveFn;/**
                * @param {?function()} callback
                */function documentWait(callback){requestAnimationFrame(function(){if(whenReady){whenReady(callback);}else{if(!readyPromise){readyPromise=new Promise(resolve=>{resolveFn=resolve;});if(document.readyState==='complete'){resolveFn();}else{document.addEventListener('readystatechange',()=>{if(document.readyState==='complete'){resolveFn();}});}}readyPromise.then(function(){callback&&callback();});}});}var documentWait$1={default:documentWait};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';let CustomStyleProvider;const SEEN_MARKER='__seenByShadyCSS';const CACHED_STYLE='__shadyCSSCachedStyle';/** @type {?function(!HTMLStyleElement)} */let transformFn=null;/** @type {?function()} */let validateFn=null;/**
                       This interface is provided to add document-level <style> elements to ShadyCSS for processing.
                       These styles must be processed by ShadyCSS to simulate ShadowRoot upper-bound encapsulation from outside styles
                       In addition, these styles may also need to be processed for @apply rules and CSS Custom Properties
                       
                       To add document-level styles to ShadyCSS, one can call `ShadyCSS.addDocumentStyle(styleElement)` or `ShadyCSS.addDocumentStyle({getStyle: () => styleElement})`
                       
                       In addition, if the process used to discover document-level styles can be synchronously flushed, one should set `ShadyCSS.documentStyleFlush`.
                       This function will be called when calculating styles.
                       
                       An example usage of the document-level styling api can be found in `examples/document-style-lib.js`
                       
                       @unrestricted
                       */class CustomStyleInterface{constructor(){/** @type {!Array<!CustomStyleProvider>} */this['customStyles']=[];this['enqueued']=false;// NOTE(dfreedm): use quotes here to prevent closure inlining to `function(){}`;
documentWait(()=>{if(window['ShadyCSS']['flushCustomStyles']){window['ShadyCSS']['flushCustomStyles']();}});}/**
     * Queue a validation for new custom styles to batch style recalculations
     */enqueueDocumentValidation(){if(this['enqueued']||!validateFn){return;}this['enqueued']=true;documentWait(validateFn);}/**
     * @param {!HTMLStyleElement} style
     */addCustomStyle(style){if(!style[SEEN_MARKER]){style[SEEN_MARKER]=true;this['customStyles'].push(style);this.enqueueDocumentValidation();}}/**
     * @param {!CustomStyleProvider} customStyle
     * @return {HTMLStyleElement}
     */getStyleForCustomStyle(customStyle){if(customStyle[CACHED_STYLE]){return customStyle[CACHED_STYLE];}let style;if(customStyle['getStyle']){style=customStyle['getStyle']();}else{style=customStyle;}return style;}/**
     * @return {!Array<!CustomStyleProvider>}
     */processStyles(){const cs=this['customStyles'];for(let i=0;i<cs.length;i++){const customStyle=cs[i];if(customStyle[CACHED_STYLE]){continue;}const style=this.getStyleForCustomStyle(customStyle);if(style){// HTMLImports polyfill may have cloned the style into the main document,
// which is referenced with __appliedElement.
const styleToTransform=/** @type {!HTMLStyleElement} */style['__appliedElement']||style;if(transformFn){transformFn(styleToTransform);}customStyle[CACHED_STYLE]=styleToTransform;}}return cs;}}/* eslint-disable no-self-assign */CustomStyleInterface.prototype['addCustomStyle']=CustomStyleInterface.prototype.addCustomStyle;CustomStyleInterface.prototype['getStyleForCustomStyle']=CustomStyleInterface.prototype.getStyleForCustomStyle;CustomStyleInterface.prototype['processStyles']=CustomStyleInterface.prototype.processStyles;/* eslint-enable no-self-assign */Object.defineProperties(CustomStyleInterface.prototype,{'transformCallback':{/** @return {?function(!HTMLStyleElement)} */get(){return transformFn;},/** @param {?function(!HTMLStyleElement)} fn */set(fn){transformFn=fn;}},'validateCallback':{/** @return {?function()} */get(){return validateFn;},/**
     * @param {?function()} fn
     * @this {CustomStyleInterface}
     */set(fn){let needsEnqueue=false;if(!validateFn){needsEnqueue=true;}validateFn=fn;if(needsEnqueue){this.enqueueDocumentValidation();}}}});/** @typedef {{
     * customStyles: !Array<!CustomStyleProvider>,
     * addCustomStyle: function(!CustomStyleProvider),
     * getStyleForCustomStyle: function(!CustomStyleProvider): HTMLStyleElement,
     * findStyles: function(),
     * transformCallback: ?function(!HTMLStyleElement),
     * validateCallback: ?function()
     * }}
     */const CustomStyleInterfaceInterface={};var customStyleInterface={CustomStyleProvider:CustomStyleProvider,default:CustomStyleInterface,CustomStyleInterfaceInterface:CustomStyleInterfaceInterface};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';const applyShim$1=new ApplyShim();class ApplyShimInterface{constructor(){/** @type {?CustomStyleInterfaceInterface} */this.customStyleInterface=null;applyShim$1['invalidCallback']=invalidate;}ensure(){if(this.customStyleInterface){return;}if(window.ShadyCSS.CustomStyleInterface){this.customStyleInterface=/** @type {!CustomStyleInterfaceInterface} */window.ShadyCSS.CustomStyleInterface;this.customStyleInterface['transformCallback']=style=>{applyShim$1.transformCustomStyle(style);};this.customStyleInterface['validateCallback']=()=>{requestAnimationFrame(()=>{if(this.customStyleInterface['enqueued']){this.flushCustomStyles();}});};}}/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */prepareTemplate(template,elementName){this.ensure();if(elementHasBuiltCss(template)){return;}templateMap[elementName]=template;let ast=applyShim$1.transformTemplate(template,elementName);// save original style ast to use for revalidating instances
template['_styleAst']=ast;}flushCustomStyles(){this.ensure();if(!this.customStyleInterface){return;}let styles=this.customStyleInterface['processStyles']();if(!this.customStyleInterface['enqueued']){return;}for(let i=0;i<styles.length;i++){let cs=styles[i];let style=this.customStyleInterface['getStyleForCustomStyle'](cs);if(style){applyShim$1.transformCustomStyle(style);}}this.customStyleInterface['enqueued']=false;}/**
     * @param {HTMLElement} element
     * @param {Object=} properties
     */styleSubtree(element,properties){this.ensure();if(properties){updateNativeProperties(element,properties);}if(element.shadowRoot){this.styleElement(element);let shadowChildren=/** @type {!ParentNode} */element.shadowRoot.children||element.shadowRoot.childNodes;for(let i=0;i<shadowChildren.length;i++){this.styleSubtree(/** @type {HTMLElement} */shadowChildren[i]);}}else{let children=element.children||element.childNodes;for(let i=0;i<children.length;i++){this.styleSubtree(/** @type {HTMLElement} */children[i]);}}}/**
     * @param {HTMLElement} element
     */styleElement(element){this.ensure();let{is}=getIsExtends(element);let template=templateMap[is];if(template&&elementHasBuiltCss(template)){return;}if(template&&!templateIsValid(template)){// only revalidate template once
if(!templateIsValidating(template)){this.prepareTemplate(template,is);startValidatingTemplate(template);}// update this element instance
let root=element.shadowRoot;if(root){let style=/** @type {HTMLStyleElement} */root.querySelector('style');if(style){// reuse the template's style ast, it has all the original css text
style['__cssRules']=template['_styleAst'];style.textContent=toCssText(template['_styleAst']);}}}}/**
     * @param {Object=} properties
     */styleDocument(properties){this.ensure();this.styleSubtree(document.body,properties);}}if(!window.ShadyCSS||!window.ShadyCSS.ScopingShim){const applyShimInterface=new ApplyShimInterface();let CustomStyleInterface$$1=window.ShadyCSS&&window.ShadyCSS.CustomStyleInterface;/** @suppress {duplicate} */window.ShadyCSS={/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */prepareTemplate(template,elementName,elementExtends){// eslint-disable-line no-unused-vars
applyShimInterface.flushCustomStyles();applyShimInterface.prepareTemplate(template,elementName);},/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */prepareTemplateStyles(template,elementName,elementExtends){window.ShadyCSS.prepareTemplate(template,elementName,elementExtends);},/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */prepareTemplateDom(template,elementName){},// eslint-disable-line no-unused-vars
/**
     * @param {!HTMLElement} element
     * @param {Object=} properties
     */styleSubtree(element,properties){applyShimInterface.flushCustomStyles();applyShimInterface.styleSubtree(element,properties);},/**
     * @param {!HTMLElement} element
     */styleElement(element){applyShimInterface.flushCustomStyles();applyShimInterface.styleElement(element);},/**
     * @param {Object=} properties
     */styleDocument(properties){applyShimInterface.flushCustomStyles();applyShimInterface.styleDocument(properties);},/**
     * @param {Element} element
     * @param {string} property
     * @return {string}
     */getComputedStyleValue(element,property){return getComputedStyleValue(element,property);},flushCustomStyles(){applyShimInterface.flushCustomStyles();},nativeCss:nativeCssVariables,nativeShadow:nativeShadow,cssBuild:cssBuild};if(CustomStyleInterface$$1){window.ShadyCSS.CustomStyleInterface=CustomStyleInterface$$1;}}window.ShadyCSS.ApplyShim=applyShim$1;/**
                                         @license
                                         Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
                                         This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
                                         The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
                                         The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
                                         Code distributed by Google as part of the polymer project is also
                                         subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
                                         */ /* eslint-disable no-unused-vars */ /**
                                                                                 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is replaced by the munged name for object[property]
                                                                                 * We cannot alias this function, so we have to use a small shim that has the same behavior when not compiling.
                                                                                 *
                                                                                 * @param {string} prop Property name
                                                                                 * @param {?Object} obj Reference object
                                                                                 * @return {string} Potentially renamed property name
                                                                                 */window.JSCompiler_renameProperty=function(prop,obj){return prop;};/* eslint-enable */let CSS_URL_RX=/(url\()([^)]*)(\))/g;let ABS_URL=/(^\/)|(^#)|(^[\w-\d]*:)/;let workingURL;let resolveDoc;/**
                 * Resolves the given URL against the provided `baseUri'.
                 *
                 * Note that this function performs no resolution for URLs that start
                 * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
                 * URL resolution, use `window.URL`.
                 *
                 * @param {string} url Input URL to resolve
                 * @param {?string=} baseURI Base URI to resolve the URL against
                 * @return {string} resolved URL
                 */function resolveUrl(url,baseURI){if(url&&ABS_URL.test(url)){return url;}// Lazy feature detection.
if(workingURL===undefined){workingURL=false;try{const u=new URL('b','http://a');u.pathname='c%20d';workingURL=u.href==='http://a/c%20d';}catch(e){// silently fail
}}if(!baseURI){baseURI=document.baseURI||window.location.href;}if(workingURL){return new URL(url,baseURI).href;}// Fallback to creating an anchor into a disconnected document.
if(!resolveDoc){resolveDoc=document.implementation.createHTMLDocument('temp');resolveDoc.base=resolveDoc.createElement('base');resolveDoc.head.appendChild(resolveDoc.base);resolveDoc.anchor=resolveDoc.createElement('a');resolveDoc.body.appendChild(resolveDoc.anchor);}resolveDoc.base.href=baseURI;resolveDoc.anchor.href=url;return resolveDoc.anchor.href||url;}/**
   * Resolves any relative URL's in the given CSS text against the provided
   * `ownerDocument`'s `baseURI`.
   *
   * @param {string} cssText CSS text to process
   * @param {string} baseURI Base URI to resolve the URL against
   * @return {string} Processed CSS text with resolved URL's
   */function resolveCss(cssText,baseURI){return cssText.replace(CSS_URL_RX,function(m,pre,url,post){return pre+'\''+resolveUrl(url.replace(/["']/g,''),baseURI)+'\''+post;});}/**
   * Returns a path from a given `url`. The path includes the trailing
   * `/` from the url.
   *
   * @param {string} url Input URL to transform
   * @return {string} resolved path
   */function pathFromUrl(url){return url.substring(0,url.lastIndexOf('/')+1);}var resolveUrl$1={resolveUrl:resolveUrl,resolveCss:resolveCss,pathFromUrl:pathFromUrl};const useShadow=!window.ShadyDOM;const useNativeCSSProperties=Boolean(!window.ShadyCSS||window.ShadyCSS.nativeCss);const useNativeCustomElements=!window.customElements.polyfillWrapFlushCallback;/**
                                                                                          * Globally settable property that is automatically assigned to
                                                                                          * `ElementMixin` instances, useful for binding in templates to
                                                                                          * make URL's relative to an application's root.  Defaults to the main
                                                                                          * document URL, but can be overridden by users.  It may be useful to set
                                                                                          * `rootPath` to provide a stable application mount path when
                                                                                          * using client side routing.
                                                                                          */let rootPath=undefined||pathFromUrl(document.baseURI||window.location.href);/**
                                                                                           * Sets the global rootPath property used by `ElementMixin` and
                                                                                           * available via `rootPath`.
                                                                                           *
                                                                                           * @param {string} path The new root path
                                                                                           * @return {void}
                                                                                           */const setRootPath=function(path){rootPath=path;};/**
    * A global callback used to sanitize any value before inserting it into the DOM.
    * The callback signature is:
    *
    *  function sanitizeDOMValue(value, name, type, node) { ... }
    *
    * Where:
    *
    * `value` is the value to sanitize.
    * `name` is the name of an attribute or property (for example, href).
    * `type` indicates where the value is being inserted: one of property, attribute, or text.
    * `node` is the node where the value is being inserted.
    *
    * @type {(function(*,string,string,Node):*)|undefined}
    */let sanitizeDOMValue=window.Polymer&&window.Polymer.sanitizeDOMValue||undefined;/**
                                                                                               * Sets the global sanitizeDOMValue available via this module's exported
                                                                                               * `sanitizeDOMValue` variable.
                                                                                               *
                                                                                               * @param {(function(*,string,string,Node):*)|undefined} newSanitizeDOMValue the global sanitizeDOMValue callback
                                                                                               * @return {void}
                                                                                               */const setSanitizeDOMValue=function(newSanitizeDOMValue){sanitizeDOMValue=newSanitizeDOMValue;};/**
    * Globally settable property to make Polymer Gestures use passive TouchEvent listeners when recognizing gestures.
    * When set to `true`, gestures made from touch will not be able to prevent scrolling, allowing for smoother
    * scrolling performance.
    * Defaults to `false` for backwards compatibility.
    */let passiveTouchGestures=false;/**
                                          * Sets `passiveTouchGestures` globally for all elements using Polymer Gestures.
                                          *
                                          * @param {boolean} usePassive enable or disable passive touch gestures globally
                                          * @return {void}
                                          */const setPassiveTouchGestures=function(usePassive){passiveTouchGestures=usePassive;};/**
    * Setting to ensure Polymer template evaluation only occurs based on tempates
    * defined in trusted script.  When true, `<dom-module>` re-registration is
    * disallowed, `<dom-bind>` is disabled, and `<dom-if>`/`<dom-repeat>`
    * templates will only evaluate in the context of a trusted element template.
    */let strictTemplatePolicy=false;/**
                                          * Sets `strictTemplatePolicy` globally for all elements
                                          *
                                          * @param {boolean} useStrictPolicy enable or disable strict template policy
                                          *   globally
                                          * @return {void}
                                          */const setStrictTemplatePolicy=function(useStrictPolicy){strictTemplatePolicy=useStrictPolicy;};/**
    * Setting to enable dom-module lookup from Polymer.Element.  By default,
    * templates must be defined in script using the `static get template()`
    * getter and the `html` tag function.  To enable legacy loading of templates
    * via dom-module, set this flag to true.
    */let allowTemplateFromDomModule=false;/**
                                                * Sets `lookupTemplateFromDomModule` globally for all elements
                                                *
                                                * @param {boolean} allowDomModule enable or disable template lookup 
                                                *   globally
                                                * @return {void}
                                                */const setAllowTemplateFromDomModule=function(allowDomModule){allowTemplateFromDomModule=allowDomModule;};var settings={useShadow:useShadow,useNativeCSSProperties:useNativeCSSProperties,useNativeCustomElements:useNativeCustomElements,get rootPath(){return rootPath;},setRootPath:setRootPath,get sanitizeDOMValue(){return sanitizeDOMValue;},setSanitizeDOMValue:setSanitizeDOMValue,get passiveTouchGestures(){return passiveTouchGestures;},setPassiveTouchGestures:setPassiveTouchGestures,get strictTemplatePolicy(){return strictTemplatePolicy;},setStrictTemplatePolicy:setStrictTemplatePolicy,get allowTemplateFromDomModule(){return allowTemplateFromDomModule;},setAllowTemplateFromDomModule:setAllowTemplateFromDomModule};let dedupeId=0;/**
                   * @constructor
                   * @extends {Function}
                   * @private
                   */function MixinFunction(){}/** @type {(WeakMap | undefined)} */MixinFunction.prototype.__mixinApplications;/** @type {(Object | undefined)} */MixinFunction.prototype.__mixinSet;/* eslint-disable valid-jsdoc */ /**
                                                                      * Wraps an ES6 class expression mixin such that the mixin is only applied
                                                                      * if it has not already been applied its base argument. Also memoizes mixin
                                                                      * applications.
                                                                      *
                                                                      * @template T
                                                                      * @param {T} mixin ES6 class expression mixin to wrap
                                                                      * @return {T}
                                                                      * @suppress {invalidCasts}
                                                                      */const dedupingMixin=function(mixin){let mixinApplications=/** @type {!MixinFunction} */mixin.__mixinApplications;if(!mixinApplications){mixinApplications=new WeakMap();/** @type {!MixinFunction} */mixin.__mixinApplications=mixinApplications;}// maintain a unique id for each mixin
let mixinDedupeId=dedupeId++;function dedupingMixin(base){let baseSet=/** @type {!MixinFunction} */base.__mixinSet;if(baseSet&&baseSet[mixinDedupeId]){return base;}let map=mixinApplications;let extended=map.get(base);if(!extended){extended=/** @type {!Function} */mixin(base);map.set(base,extended);}// copy inherited mixin set from the extended class, or the base class
// NOTE: we avoid use of Set here because some browser (IE11)
// cannot extend a base Set via the constructor.
let mixinSet=Object.create(/** @type {!MixinFunction} */extended.__mixinSet||baseSet||null);mixinSet[mixinDedupeId]=true;/** @type {!MixinFunction} */extended.__mixinSet=mixinSet;return extended;}return dedupingMixin;};/* eslint-enable valid-jsdoc */var mixin={dedupingMixin:dedupingMixin};let modules={};let lcModules={};/**
                     * Sets a dom-module into the global registry by id.
                     *
                     * @param {string} id dom-module id
                     * @param {DomModule} module dom-module instance
                     * @return {void}
                     */function setModule(id,module){// store id separate from lowercased id so that
// in all cases mixedCase id will stored distinctly
// and lowercase version is a fallback
modules[id]=lcModules[id.toLowerCase()]=module;}/**
   * Retrieves a dom-module from the global registry by id.
   *
   * @param {string} id dom-module id
   * @return {DomModule!} dom-module instance
   */function findModule(id){return modules[id]||lcModules[id.toLowerCase()];}function styleOutsideTemplateCheck(inst){if(inst.querySelector('style')){console.warn('dom-module %s has style outside template',inst.id);}}/**
   * The `dom-module` element registers the dom it contains to the name given
   * by the module's id attribute. It provides a unified database of dom
   * accessible via its static `import` API.
   *
   * A key use case of `dom-module` is for providing custom element `<template>`s
   * via HTML imports that are parsed by the native HTML parser, that can be
   * relocated during a bundling pass and still looked up by `id`.
   *
   * Example:
   *
   *     <dom-module id="foo">
   *       <img src="stuff.png">
   *     </dom-module>
   *
   * Then in code in some other location that cannot access the dom-module above
   *
   *     let img = customElements.get('dom-module').import('foo', 'img');
   *
   * @customElement
   * @extends HTMLElement
   * @summary Custom element that provides a registry of relocatable DOM content
   *   by `id` that is agnostic to bundling.
   * @unrestricted
   */class DomModule extends HTMLElement{static get observedAttributes(){return['id'];}/**
     * Retrieves the element specified by the css `selector` in the module
     * registered by `id`. For example, this.import('foo', 'img');
     * @param {string} id The id of the dom-module in which to search.
     * @param {string=} selector The css selector by which to find the element.
     * @return {Element} Returns the element which matches `selector` in the
     * module registered at the specified `id`.
     *
     * @export
     * @nocollapse Referred to indirectly in style-gather.js
     */static import(id,selector){if(id){let m=findModule(id);if(m&&selector){return m.querySelector(selector);}return m;}return null;}/* eslint-disable no-unused-vars */ /**
                                         * @param {string} name Name of attribute.
                                         * @param {?string} old Old value of attribute.
                                         * @param {?string} value Current value of attribute.
                                         * @param {?string} namespace Attribute namespace.
                                         * @return {void}
                                         * @override
                                         */attributeChangedCallback(name,old,value,namespace){if(old!==value){this.register();}}/* eslint-enable no-unused-args */ /**
                                        * The absolute URL of the original location of this `dom-module`.
                                        *
                                        * This value will differ from this element's `ownerDocument` in the
                                        * following ways:
                                        * - Takes into account any `assetpath` attribute added during bundling
                                        *   to indicate the original location relative to the bundled location
                                        * - Uses the HTMLImports polyfill's `importForElement` API to ensure
                                        *   the path is relative to the import document's location since
                                        *   `ownerDocument` is not currently polyfilled
                                        */get assetpath(){// Don't override existing assetpath.
if(!this.__assetpath){// note: assetpath set via an attribute must be relative to this
// element's location; accomodate polyfilled HTMLImports
const owner=window.HTMLImports&&HTMLImports.importForElement?HTMLImports.importForElement(this)||document:this.ownerDocument;const url=resolveUrl(this.getAttribute('assetpath')||'',owner.baseURI);this.__assetpath=pathFromUrl(url);}return this.__assetpath;}/**
     * Registers the dom-module at a given id. This method should only be called
     * when a dom-module is imperatively created. For
     * example, `document.createElement('dom-module').register('foo')`.
     * @param {string=} id The id at which to register the dom-module.
     * @return {void}
     */register(id){id=id||this.id;if(id){// Under strictTemplatePolicy, reject and null out any re-registered
// dom-module since it is ambiguous whether first-in or last-in is trusted
if(strictTemplatePolicy&&findModule(id)!==undefined){setModule(id,null);throw new Error(`strictTemplatePolicy: dom-module ${id} re-registered`);}this.id=id;setModule(id,this);styleOutsideTemplateCheck(this);}}}DomModule.prototype['modules']=modules;customElements.define('dom-module',DomModule);var domModule={DomModule:DomModule};const MODULE_STYLE_LINK_SELECTOR='link[rel=import][type~=css]';const INCLUDE_ATTR='include';const SHADY_UNSCOPED_ATTR='shady-unscoped';/**
                                               * @param {string} moduleId .
                                               * @return {?DomModule} .
                                               */function importModule(moduleId){return(/** @type {?DomModule} */DomModule.import(moduleId));}function styleForImport(importDoc){// NOTE: polyfill affordance.
// under the HTMLImports polyfill, there will be no 'body',
// but the import pseudo-doc can be used directly.
let container=importDoc.body?importDoc.body:importDoc;const importCss=resolveCss(container.textContent,importDoc.baseURI);const style=document.createElement('style');style.textContent=importCss;return style;}/** @typedef {{assetpath: string}} */let templateWithAssetPath;// eslint-disable-line no-unused-vars
/**
 * Returns a list of <style> elements in a space-separated list of `dom-module`s.
 *
 * @function
 * @param {string} moduleIds List of dom-module id's within which to
 * search for css.
 * @return {!Array<!HTMLStyleElement>} Array of contained <style> elements
 */function stylesFromModules(moduleIds){const modules=moduleIds.trim().split(/\s+/);const styles=[];for(let i=0;i<modules.length;i++){styles.push(...stylesFromModule(modules[i]));}return styles;}/**
   * Returns a list of <style> elements in a given `dom-module`.
   * Styles in a `dom-module` can come either from `<style>`s within the
   * first `<template>`, or else from one or more
   * `<link rel="import" type="css">` links outside the template.
   *
   * @param {string} moduleId dom-module id to gather styles from
   * @return {!Array<!HTMLStyleElement>} Array of contained styles.
   */function stylesFromModule(moduleId){const m=importModule(moduleId);if(!m){console.warn('Could not find style data in module named',moduleId);return[];}if(m._styles===undefined){const styles=[];// module imports: <link rel="import" type="css">
styles.push(..._stylesFromModuleImports(m));// include css from the first template in the module
const template=/** @type {?HTMLTemplateElement} */m.querySelector('template');if(template){styles.push(...stylesFromTemplate(template,/** @type {templateWithAssetPath} */m.assetpath));}m._styles=styles;}return m._styles;}/**
   * Returns the `<style>` elements within a given template.
   *
   * @param {!HTMLTemplateElement} template Template to gather styles from
   * @param {string} baseURI baseURI for style content
   * @return {!Array<!HTMLStyleElement>} Array of styles
   */function stylesFromTemplate(template,baseURI){if(!template._styles){const styles=[];// if element is a template, get content from its .content
const e$=template.content.querySelectorAll('style');for(let i=0;i<e$.length;i++){let e=e$[i];// support style sharing by allowing styles to "include"
// other dom-modules that contain styling
let include=e.getAttribute(INCLUDE_ATTR);if(include){styles.push(...stylesFromModules(include).filter(function(item,index,self){return self.indexOf(item)===index;}));}if(baseURI){e.textContent=resolveCss(e.textContent,baseURI);}styles.push(e);}template._styles=styles;}return template._styles;}/**
   * Returns a list of <style> elements  from stylesheets loaded via `<link rel="import" type="css">` links within the specified `dom-module`.
   *
   * @param {string} moduleId Id of `dom-module` to gather CSS from
   * @return {!Array<!HTMLStyleElement>} Array of contained styles.
   */function stylesFromModuleImports(moduleId){let m=importModule(moduleId);return m?_stylesFromModuleImports(m):[];}/**
   * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
   * @return {!Array<!HTMLStyleElement>} Array of contained styles
   */function _stylesFromModuleImports(module){const styles=[];const p$=module.querySelectorAll(MODULE_STYLE_LINK_SELECTOR);for(let i=0;i<p$.length;i++){let p=p$[i];if(p.import){const importDoc=p.import;const unscoped=p.hasAttribute(SHADY_UNSCOPED_ATTR);if(unscoped&&!importDoc._unscopedStyle){const style=styleForImport(importDoc);style.setAttribute(SHADY_UNSCOPED_ATTR,'');importDoc._unscopedStyle=style;}else if(!importDoc._style){importDoc._style=styleForImport(importDoc);}styles.push(unscoped?importDoc._unscopedStyle:importDoc._style);}}return styles;}/**
   *
   * Returns CSS text of styles in a space-separated list of `dom-module`s.
   * Note: This method is deprecated, use `stylesFromModules` instead.
   *
   * @deprecated
   * @param {string} moduleIds List of dom-module id's within which to
   * search for css.
   * @return {string} Concatenated CSS content from specified `dom-module`s
   */function cssFromModules(moduleIds){let modules=moduleIds.trim().split(/\s+/);let cssText='';for(let i=0;i<modules.length;i++){cssText+=cssFromModule(modules[i]);}return cssText;}/**
   * Returns CSS text of styles in a given `dom-module`.  CSS in a `dom-module`
   * can come either from `<style>`s within the first `<template>`, or else
   * from one or more `<link rel="import" type="css">` links outside the
   * template.
   *
   * Any `<styles>` processed are removed from their original location.
   * Note: This method is deprecated, use `styleFromModule` instead.
   *
   * @deprecated
   * @param {string} moduleId dom-module id to gather styles from
   * @return {string} Concatenated CSS content from specified `dom-module`
   */function cssFromModule(moduleId){let m=importModule(moduleId);if(m&&m._cssText===undefined){// module imports: <link rel="import" type="css">
let cssText=_cssFromModuleImports(m);// include css from the first template in the module
let t=/** @type {?HTMLTemplateElement} */m.querySelector('template');if(t){cssText+=cssFromTemplate(t,/** @type {templateWithAssetPath} */m.assetpath);}m._cssText=cssText||null;}if(!m){console.warn('Could not find style data in module named',moduleId);}return m&&m._cssText||'';}/**
   * Returns CSS text of `<styles>` within a given template.
   *
   * Any `<styles>` processed are removed from their original location.
   * Note: This method is deprecated, use `styleFromTemplate` instead.
   *
   * @deprecated
   * @param {!HTMLTemplateElement} template Template to gather styles from
   * @param {string} baseURI Base URI to resolve the URL against
   * @return {string} Concatenated CSS content from specified template
   */function cssFromTemplate(template,baseURI){let cssText='';const e$=stylesFromTemplate(template,baseURI);// if element is a template, get content from its .content
for(let i=0;i<e$.length;i++){let e=e$[i];if(e.parentNode){e.parentNode.removeChild(e);}cssText+=e.textContent;}return cssText;}/**
   * Returns CSS text from stylesheets loaded via `<link rel="import" type="css">`
   * links within the specified `dom-module`.
   *
   * Note: This method is deprecated, use `stylesFromModuleImports` instead.
   *
   * @deprecated
   *
   * @param {string} moduleId Id of `dom-module` to gather CSS from
   * @return {string} Concatenated CSS content from links in specified `dom-module`
   */function cssFromModuleImports(moduleId){let m=importModule(moduleId);return m?_cssFromModuleImports(m):'';}/**
   * @deprecated
   * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
   * @return {string} Concatenated CSS content from links in the dom-module
   */function _cssFromModuleImports(module){let cssText='';let styles=_stylesFromModuleImports(module);for(let i=0;i<styles.length;i++){cssText+=styles[i].textContent;}return cssText;}var styleGather={stylesFromModules:stylesFromModules,stylesFromModule:stylesFromModule,stylesFromTemplate:stylesFromTemplate,stylesFromModuleImports:stylesFromModuleImports,cssFromModules:cssFromModules,cssFromModule:cssFromModule,cssFromTemplate:cssFromTemplate,cssFromModuleImports:cssFromModuleImports};function isPath(path){return path.indexOf('.')>=0;}/**
   * Returns the root property name for the given path.
   *
   * Example:
   *
   * ```
   * root('foo.bar.baz') // 'foo'
   * root('foo')         // 'foo'
   * ```
   *
   * @param {string} path Path string
   * @return {string} Root property name
   */function root(path){let dotIndex=path.indexOf('.');if(dotIndex===-1){return path;}return path.slice(0,dotIndex);}/**
   * Given `base` is `foo.bar`, `foo` is an ancestor, `foo.bar` is not
   * Returns true if the given path is an ancestor of the base path.
   *
   * Example:
   *
   * ```
   * isAncestor('foo.bar', 'foo')         // true
   * isAncestor('foo.bar', 'foo.bar')     // false
   * isAncestor('foo.bar', 'foo.bar.baz') // false
   * ```
   *
   * @param {string} base Path string to test against.
   * @param {string} path Path string to test.
   * @return {boolean} True if `path` is an ancestor of `base`.
   */function isAncestor(base,path){//     base.startsWith(path + '.');
return base.indexOf(path+'.')===0;}/**
   * Given `base` is `foo.bar`, `foo.bar.baz` is an descendant
   *
   * Example:
   *
   * ```
   * isDescendant('foo.bar', 'foo.bar.baz') // true
   * isDescendant('foo.bar', 'foo.bar')     // false
   * isDescendant('foo.bar', 'foo')         // false
   * ```
   *
   * @param {string} base Path string to test against.
   * @param {string} path Path string to test.
   * @return {boolean} True if `path` is a descendant of `base`.
   */function isDescendant(base,path){//     path.startsWith(base + '.');
return path.indexOf(base+'.')===0;}/**
   * Replaces a previous base path with a new base path, preserving the
   * remainder of the path.
   *
   * User must ensure `path` has a prefix of `base`.
   *
   * Example:
   *
   * ```
   * translate('foo.bar', 'zot', 'foo.bar.baz') // 'zot.baz'
   * ```
   *
   * @param {string} base Current base string to remove
   * @param {string} newBase New base string to replace with
   * @param {string} path Path to translate
   * @return {string} Translated string
   */function translate$1(base,newBase,path){return newBase+path.slice(base.length);}/**
   * @param {string} base Path string to test against
   * @param {string} path Path string to test
   * @return {boolean} True if `path` is equal to `base`
   */function matches(base,path){return base===path||isAncestor(base,path)||isDescendant(base,path);}/**
   * Converts array-based paths to flattened path.  String-based paths
   * are returned as-is.
   *
   * Example:
   *
   * ```
   * normalize(['foo.bar', 0, 'baz'])  // 'foo.bar.0.baz'
   * normalize('foo.bar.0.baz')        // 'foo.bar.0.baz'
   * ```
   *
   * @param {string | !Array<string|number>} path Input path
   * @return {string} Flattened path
   */function normalize(path){if(Array.isArray(path)){let parts=[];for(let i=0;i<path.length;i++){let args=path[i].toString().split('.');for(let j=0;j<args.length;j++){parts.push(args[j]);}}return parts.join('.');}else{return path;}}/**
   * Splits a path into an array of property names. Accepts either arrays
   * of path parts or strings.
   *
   * Example:
   *
   * ```
   * split(['foo.bar', 0, 'baz'])  // ['foo', 'bar', '0', 'baz']
   * split('foo.bar.0.baz')        // ['foo', 'bar', '0', 'baz']
   * ```
   *
   * @param {string | !Array<string|number>} path Input path
   * @return {!Array<string>} Array of path parts
   * @suppress {checkTypes}
   */function split(path){if(Array.isArray(path)){return normalize(path).split('.');}return path.toString().split('.');}/**
   * Reads a value from a path.  If any sub-property in the path is `undefined`,
   * this method returns `undefined` (will never throw.
   *
   * @param {Object} root Object from which to dereference path from
   * @param {string | !Array<string|number>} path Path to read
   * @param {Object=} info If an object is provided to `info`, the normalized
   *  (flattened) path will be set to `info.path`.
   * @return {*} Value at path, or `undefined` if the path could not be
   *  fully dereferenced.
   */function get(root,path,info){let prop=root;let parts=split(path);// Loop over path parts[0..n-1] and dereference
for(let i=0;i<parts.length;i++){if(!prop){return;}let part=parts[i];prop=prop[part];}if(info){info.path=parts.join('.');}return prop;}/**
   * Sets a value to a path.  If any sub-property in the path is `undefined`,
   * this method will no-op.
   *
   * @param {Object} root Object from which to dereference path from
   * @param {string | !Array<string|number>} path Path to set
   * @param {*} value Value to set to path
   * @return {string | undefined} The normalized version of the input path
   */function set(root,path,value){let prop=root;let parts=split(path);let last=parts[parts.length-1];if(parts.length>1){// Loop over path parts[0..n-2] and dereference
for(let i=0;i<parts.length-1;i++){let part=parts[i];prop=prop[part];if(!prop){return;}}// Set value to object at end of path
prop[last]=value;}else{// Simple property set
prop[path]=value;}return parts.join('.');}/**
   * Returns true if the given string is a structured data path (has dots).
   *
   * This function is deprecated.  Use `isPath` instead.
   *
   * Example:
   *
   * ```
   * isDeep('foo.bar.baz') // true
   * isDeep('foo')         // false
   * ```
   *
   * @deprecated
   * @param {string} path Path string
   * @return {boolean} True if the string contained one or more dots
   */const isDeep=isPath;var path={isPath:isPath,root:root,isAncestor:isAncestor,isDescendant:isDescendant,translate:translate$1,matches:matches,normalize:normalize,split:split,get:get,set:set,isDeep:isDeep};const caseMap={};const DASH_TO_CAMEL=/-[a-z]/g;const CAMEL_TO_DASH=/([A-Z])/g;/**
                                   * @fileoverview Module with utilities for converting between "dash-case" and
                                   * "camelCase" identifiers.
                                   */ /**
                                       * Converts "dash-case" identifier (e.g. `foo-bar-baz`) to "camelCase"
                                       * (e.g. `fooBarBaz`).
                                       *
                                       * @param {string} dash Dash-case identifier
                                       * @return {string} Camel-case representation of the identifier
                                       */function dashToCamelCase(dash){return caseMap[dash]||(caseMap[dash]=dash.indexOf('-')<0?dash:dash.replace(DASH_TO_CAMEL,m=>m[1].toUpperCase()));}/**
   * Converts "camelCase" identifier (e.g. `fooBarBaz`) to "dash-case"
   * (e.g. `foo-bar-baz`).
   *
   * @param {string} camel Camel-case identifier
   * @return {string} Dash-case representation of the identifier
   */function camelToDashCase(camel){return caseMap[camel]||(caseMap[camel]=camel.replace(CAMEL_TO_DASH,'-$1').toLowerCase());}var caseMap$1={dashToCamelCase:dashToCamelCase,camelToDashCase:camelToDashCase};let microtaskCurrHandle=0;let microtaskLastHandle=0;let microtaskCallbacks=[];let microtaskNodeContent=0;let microtaskNode=document.createTextNode('');new window.MutationObserver(microtaskFlush).observe(microtaskNode,{characterData:true});function microtaskFlush(){const len=microtaskCallbacks.length;for(let i=0;i<len;i++){let cb=microtaskCallbacks[i];if(cb){try{cb();}catch(e){setTimeout(()=>{throw e;});}}}microtaskCallbacks.splice(0,len);microtaskLastHandle+=len;}/**
   * Async interface wrapper around `setTimeout`.
   *
   * @namespace
   * @summary Async interface wrapper around `setTimeout`.
   */const timeOut={/**
   * Returns a sub-module with the async interface providing the provided
   * delay.
   *
   * @memberof timeOut
   * @param {number=} delay Time to wait before calling callbacks in ms
   * @return {!AsyncInterface} An async timeout interface
   */after(delay){return{run(fn){return window.setTimeout(fn,delay);},cancel(handle){window.clearTimeout(handle);}};},/**
   * Enqueues a function called in the next task.
   *
   * @memberof timeOut
   * @param {!Function} fn Callback to run
   * @param {number=} delay Delay in milliseconds
   * @return {number} Handle used for canceling task
   */run(fn,delay){return window.setTimeout(fn,delay);},/**
   * Cancels a previously enqueued `timeOut` callback.
   *
   * @memberof timeOut
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */cancel(handle){window.clearTimeout(handle);}};const animationFrame={/**
   * Enqueues a function called at `requestAnimationFrame` timing.
   *
   * @memberof animationFrame
   * @param {function(number):void} fn Callback to run
   * @return {number} Handle used for canceling task
   */run(fn){return window.requestAnimationFrame(fn);},/**
   * Cancels a previously enqueued `animationFrame` callback.
   *
   * @memberof animationFrame
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */cancel(handle){window.cancelAnimationFrame(handle);}};const idlePeriod={/**
   * Enqueues a function called at `requestIdleCallback` timing.
   *
   * @memberof idlePeriod
   * @param {function(!IdleDeadline):void} fn Callback to run
   * @return {number} Handle used for canceling task
   */run(fn){return window.requestIdleCallback?window.requestIdleCallback(fn):window.setTimeout(fn,16);},/**
   * Cancels a previously enqueued `idlePeriod` callback.
   *
   * @memberof idlePeriod
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */cancel(handle){window.cancelIdleCallback?window.cancelIdleCallback(handle):window.clearTimeout(handle);}};const microTask={/**
   * Enqueues a function called at microtask timing.
   *
   * @memberof microTask
   * @param {!Function=} callback Callback to run
   * @return {number} Handle used for canceling task
   */run(callback){microtaskNode.textContent=microtaskNodeContent++;microtaskCallbacks.push(callback);return microtaskCurrHandle++;},/**
   * Cancels a previously enqueued `microTask` callback.
   *
   * @memberof microTask
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */cancel(handle){const idx=handle-microtaskLastHandle;if(idx>=0){if(!microtaskCallbacks[idx]){throw new Error('invalid async handle: '+handle);}microtaskCallbacks[idx]=null;}}};var async={timeOut:timeOut,animationFrame:animationFrame,idlePeriod:idlePeriod,microTask:microTask};const microtask=microTask;/**
                              * Element class mixin that provides basic meta-programming for creating one
                              * or more property accessors (getter/setter pair) that enqueue an async
                              * (batched) `_propertiesChanged` callback.
                              *
                              * For basic usage of this mixin, call `MyClass.createProperties(props)`
                              * once at class definition time to create property accessors for properties
                              * named in props, implement `_propertiesChanged` to react as desired to
                              * property changes, and implement `static get observedAttributes()` and
                              * include lowercase versions of any property names that should be set from
                              * attributes. Last, call `this._enableProperties()` in the element's
                              * `connectedCallback` to enable the accessors.
                              *
                              * @mixinFunction
                              * @polymer
                              * @summary Element class mixin for reacting to property changes from
                              *   generated property accessors.
                              */const PropertiesChanged=dedupingMixin(/**
                                                 * @template T
                                                 * @param {function(new:T)} superClass Class to apply mixin to.
                                                 * @return {function(new:T)} superClass with mixin applied.
                                                 */superClass=>{/**
   * @polymer
   * @mixinClass
   * @implements {Polymer_PropertiesChanged}
   * @unrestricted
   */class PropertiesChanged extends superClass{/**
     * Creates property accessors for the given property names.
     * @param {!Object} props Object whose keys are names of accessors.
     * @return {void}
     * @protected
     */static createProperties(props){const proto=this.prototype;for(let prop in props){// don't stomp an existing accessor
if(!(prop in proto)){proto._createPropertyAccessor(prop);}}}/**
       * Returns an attribute name that corresponds to the given property.
       * The attribute name is the lowercased property name. Override to
       * customize this mapping.
       * @param {string} property Property to convert
       * @return {string} Attribute name corresponding to the given property.
       *
       * @protected
       */static attributeNameForProperty(property){return property.toLowerCase();}/**
       * Override point to provide a type to which to deserialize a value to
       * a given property.
       * @param {string} name Name of property
       *
       * @protected
       */static typeForProperty(name){}//eslint-disable-line no-unused-vars
/**
     * Creates a setter/getter pair for the named property with its own
     * local storage.  The getter returns the value in the local storage,
     * and the setter calls `_setProperty`, which updates the local storage
     * for the property and enqueues a `_propertiesChanged` callback.
     *
     * This method may be called on a prototype or an instance.  Calling
     * this method may overwrite a property value that already exists on
     * the prototype/instance by creating the accessor.
     *
     * @param {string} property Name of the property
     * @param {boolean=} readOnly When true, no setter is created; the
     *   protected `_setProperty` function must be used to set the property
     * @return {void}
     * @protected
     * @override
     */_createPropertyAccessor(property,readOnly){this._addPropertyToAttributeMap(property);if(!this.hasOwnProperty('__dataHasAccessor')){this.__dataHasAccessor=Object.assign({},this.__dataHasAccessor);}if(!this.__dataHasAccessor[property]){this.__dataHasAccessor[property]=true;this._definePropertyAccessor(property,readOnly);}}/**
       * Adds the given `property` to a map matching attribute names
       * to property names, using `attributeNameForProperty`. This map is
       * used when deserializing attribute values to properties.
       *
       * @param {string} property Name of the property
       * @override
       */_addPropertyToAttributeMap(property){if(!this.hasOwnProperty('__dataAttributes')){this.__dataAttributes=Object.assign({},this.__dataAttributes);}if(!this.__dataAttributes[property]){const attr=this.constructor.attributeNameForProperty(property);this.__dataAttributes[attr]=property;}}/**
       * Defines a property accessor for the given property.
       * @param {string} property Name of the property
       * @param {boolean=} readOnly When true, no setter is created
       * @return {void}
       * @override
       */_definePropertyAccessor(property,readOnly){Object.defineProperty(this,property,{/* eslint-disable valid-jsdoc */ /** @this {PropertiesChanged} */get(){return this._getProperty(property);},/** @this {PropertiesChanged} */set:readOnly?function(){}:function(value){this._setProperty(property,value);}/* eslint-enable */});}constructor(){super();this.__dataEnabled=false;this.__dataReady=false;this.__dataInvalid=false;this.__data={};this.__dataPending=null;this.__dataOld=null;this.__dataInstanceProps=null;this.__serializing=false;this._initializeProperties();}/**
       * Lifecycle callback called when properties are enabled via
       * `_enableProperties`.
       *
       * Users may override this function to implement behavior that is
       * dependent on the element having its property data initialized, e.g.
       * from defaults (initialized from `constructor`, `_initializeProperties`),
       * `attributeChangedCallback`, or values propagated from host e.g. via
       * bindings.  `super.ready()` must be called to ensure the data system
       * becomes enabled.
       *
       * @return {void}
       * @public
       * @override
       */ready(){this.__dataReady=true;this._flushProperties();}/**
       * Initializes the local storage for property accessors.
       *
       * Provided as an override point for performing any setup work prior
       * to initializing the property accessor system.
       *
       * @return {void}
       * @protected
       * @override
       */_initializeProperties(){// Capture instance properties; these will be set into accessors
// during first flush. Don't set them here, since we want
// these to overwrite defaults/constructor assignments
for(let p in this.__dataHasAccessor){if(this.hasOwnProperty(p)){this.__dataInstanceProps=this.__dataInstanceProps||{};this.__dataInstanceProps[p]=this[p];delete this[p];}}}/**
       * Called at ready time with bag of instance properties that overwrote
       * accessors when the element upgraded.
       *
       * The default implementation sets these properties back into the
       * setter at ready time.  This method is provided as an override
       * point for customizing or providing more efficient initialization.
       *
       * @param {Object} props Bag of property values that were overwritten
       *   when creating property accessors.
       * @return {void}
       * @protected
       * @override
       */_initializeInstanceProperties(props){Object.assign(this,props);}/**
       * Updates the local storage for a property (via `_setPendingProperty`)
       * and enqueues a `_proeprtiesChanged` callback.
       *
       * @param {string} property Name of the property
       * @param {*} value Value to set
       * @return {void}
       * @protected
       * @override
       */_setProperty(property,value){if(this._setPendingProperty(property,value)){this._invalidateProperties();}}/**
       * Returns the value for the given property.
       * @param {string} property Name of property
       * @return {*} Value for the given property
       * @protected
       * @override
       */_getProperty(property){return this.__data[property];}/* eslint-disable no-unused-vars */ /**
                                           * Updates the local storage for a property, records the previous value,
                                           * and adds it to the set of "pending changes" that will be passed to the
                                           * `_propertiesChanged` callback.  This method does not enqueue the
                                           * `_propertiesChanged` callback.
                                           *
                                           * @param {string} property Name of the property
                                           * @param {*} value Value to set
                                           * @param {boolean=} ext Not used here; affordance for closure
                                           * @return {boolean} Returns true if the property changed
                                           * @protected
                                           * @override
                                           */_setPendingProperty(property,value,ext){let old=this.__data[property];let changed=this._shouldPropertyChange(property,value,old);if(changed){if(!this.__dataPending){this.__dataPending={};this.__dataOld={};}// Ensure old is captured from the last turn
if(this.__dataOld&&!(property in this.__dataOld)){this.__dataOld[property]=old;}this.__data[property]=value;this.__dataPending[property]=value;}return changed;}/* eslint-enable */ /**
                           * Marks the properties as invalid, and enqueues an async
                           * `_propertiesChanged` callback.
                           *
                           * @return {void}
                           * @protected
                           * @override
                           */_invalidateProperties(){if(!this.__dataInvalid&&this.__dataReady){this.__dataInvalid=true;microtask.run(()=>{if(this.__dataInvalid){this.__dataInvalid=false;this._flushProperties();}});}}/**
       * Call to enable property accessor processing. Before this method is
       * called accessor values will be set but side effects are
       * queued. When called, any pending side effects occur immediately.
       * For elements, generally `connectedCallback` is a normal spot to do so.
       * It is safe to call this method multiple times as it only turns on
       * property accessors once.
       *
       * @return {void}
       * @protected
       * @override
       */_enableProperties(){if(!this.__dataEnabled){this.__dataEnabled=true;if(this.__dataInstanceProps){this._initializeInstanceProperties(this.__dataInstanceProps);this.__dataInstanceProps=null;}this.ready();}}/**
       * Calls the `_propertiesChanged` callback with the current set of
       * pending changes (and old values recorded when pending changes were
       * set), and resets the pending set of changes. Generally, this method
       * should not be called in user code.
       *
       * @return {void}
       * @protected
       * @override
       */_flushProperties(){const props=this.__data;const changedProps=this.__dataPending;const old=this.__dataOld;if(this._shouldPropertiesChange(props,changedProps,old)){this.__dataPending=null;this.__dataOld=null;this._propertiesChanged(props,changedProps,old);}}/**
       * Called in `_flushProperties` to determine if `_propertiesChanged`
       * should be called. The default implementation returns true if
       * properties are pending. Override to customize when
       * `_propertiesChanged` is called.
       * @param {!Object} currentProps Bag of all current accessor values
       * @param {?Object} changedProps Bag of properties changed since the last
       *   call to `_propertiesChanged`
       * @param {?Object} oldProps Bag of previous values for each property
       *   in `changedProps`
       * @return {boolean} true if changedProps is truthy
       * @override
       */_shouldPropertiesChange(currentProps,changedProps,oldProps){// eslint-disable-line no-unused-vars
return Boolean(changedProps);}/**
       * Callback called when any properties with accessors created via
       * `_createPropertyAccessor` have been set.
       *
       * @param {!Object} currentProps Bag of all current accessor values
       * @param {?Object} changedProps Bag of properties changed since the last
       *   call to `_propertiesChanged`
       * @param {?Object} oldProps Bag of previous values for each property
       *   in `changedProps`
       * @return {void}
       * @protected
       * @override
       */_propertiesChanged(currentProps,changedProps,oldProps){}// eslint-disable-line no-unused-vars
/**
     * Method called to determine whether a property value should be
     * considered as a change and cause the `_propertiesChanged` callback
     * to be enqueued.
     *
     * The default implementation returns `true` if a strict equality
     * check fails. The method always returns false for `NaN`.
     *
     * Override this method to e.g. provide stricter checking for
     * Objects/Arrays when using immutable patterns.
     *
     * @param {string} property Property name
     * @param {*} value New property value
     * @param {*} old Previous property value
     * @return {boolean} Whether the property should be considered a change
     *   and enqueue a `_proeprtiesChanged` callback
     * @protected
     * @override
     */_shouldPropertyChange(property,value,old){return(// Strict equality check
old!==value&&(// This ensures (old==NaN, value==NaN) always returns false
old===old||value===value));}/**
       * Implements native Custom Elements `attributeChangedCallback` to
       * set an attribute value to a property via `_attributeToProperty`.
       *
       * @param {string} name Name of attribute that changed
       * @param {?string} old Old attribute value
       * @param {?string} value New attribute value
       * @param {?string} namespace Attribute namespace.
       * @return {void}
       * @suppress {missingProperties} Super may or may not implement the callback
       * @override
       */attributeChangedCallback(name,old,value,namespace){if(old!==value){this._attributeToProperty(name,value);}if(super.attributeChangedCallback){super.attributeChangedCallback(name,old,value,namespace);}}/**
       * Deserializes an attribute to its associated property.
       *
       * This method calls the `_deserializeValue` method to convert the string to
       * a typed value.
       *
       * @param {string} attribute Name of attribute to deserialize.
       * @param {?string} value of the attribute.
       * @param {*=} type type to deserialize to, defaults to the value
       * returned from `typeForProperty`
       * @return {void}
       * @override
       */_attributeToProperty(attribute,value,type){if(!this.__serializing){const map=this.__dataAttributes;const property=map&&map[attribute]||attribute;this[property]=this._deserializeValue(value,type||this.constructor.typeForProperty(property));}}/**
       * Serializes a property to its associated attribute.
       *
       * @suppress {invalidCasts} Closure can't figure out `this` is an element.
       *
       * @param {string} property Property name to reflect.
       * @param {string=} attribute Attribute name to reflect to.
       * @param {*=} value Property value to refect.
       * @return {void}
       * @override
       */_propertyToAttribute(property,attribute,value){this.__serializing=true;value=arguments.length<3?this[property]:value;this._valueToNodeAttribute(/** @type {!HTMLElement} */this,value,attribute||this.constructor.attributeNameForProperty(property));this.__serializing=false;}/**
       * Sets a typed value to an HTML attribute on a node.
       *
       * This method calls the `_serializeValue` method to convert the typed
       * value to a string.  If the `_serializeValue` method returns `undefined`,
       * the attribute will be removed (this is the default for boolean
       * type `false`).
       *
       * @param {Element} node Element to set attribute to.
       * @param {*} value Value to serialize.
       * @param {string} attribute Attribute name to serialize to.
       * @return {void}
       * @override
       */_valueToNodeAttribute(node,value,attribute){const str=this._serializeValue(value);if(str===undefined){node.removeAttribute(attribute);}else{node.setAttribute(attribute,str);}}/**
       * Converts a typed JavaScript value to a string.
       *
       * This method is called when setting JS property values to
       * HTML attributes.  Users may override this method to provide
       * serialization for custom types.
       *
       * @param {*} value Property value to serialize.
       * @return {string | undefined} String serialized from the provided
       * property  value.
       * @override
       */_serializeValue(value){switch(typeof value){case'boolean':return value?'':undefined;default:return value!=null?value.toString():undefined;}}/**
       * Converts a string to a typed JavaScript value.
       *
       * This method is called when reading HTML attribute values to
       * JS properties.  Users may override this method to provide
       * deserialization for custom `type`s. Types for `Boolean`, `String`,
       * and `Number` convert attributes to the expected types.
       *
       * @param {?string} value Value to deserialize.
       * @param {*=} type Type to deserialize the string to.
       * @return {*} Typed value deserialized from the provided string.
       * @override
       */_deserializeValue(value,type){switch(type){case Boolean:return value!==null;case Number:return Number(value);default:return value;}}}return PropertiesChanged;});var propertiesChanged={PropertiesChanged:PropertiesChanged};// that won't have their values "saved" by `saveAccessorValue`, since
// reading from an HTMLElement accessor from the context of a prototype throws
const nativeProperties={};let proto=HTMLElement.prototype;while(proto){let props=Object.getOwnPropertyNames(proto);for(let i=0;i<props.length;i++){nativeProperties[props[i]]=true;}proto=Object.getPrototypeOf(proto);}/**
   * Used to save the value of a property that will be overridden with
   * an accessor. If the `model` is a prototype, the values will be saved
   * in `__dataProto`, and it's up to the user (or downstream mixin) to
   * decide how/when to set these values back into the accessors.
   * If `model` is already an instance (it has a `__data` property), then
   * the value will be set as a pending property, meaning the user should
   * call `_invalidateProperties` or `_flushProperties` to take effect
   *
   * @param {Object} model Prototype or instance
   * @param {string} property Name of property
   * @return {void}
   * @private
   */function saveAccessorValue(model,property){// Don't read/store value for any native properties since they could throw
if(!nativeProperties[property]){let value=model[property];if(value!==undefined){if(model.__data){// Adding accessor to instance; update the property
// It is the user's responsibility to call _flushProperties
model._setPendingProperty(property,value);}else{// Adding accessor to proto; save proto's value for instance-time use
if(!model.__dataProto){model.__dataProto={};}else if(!model.hasOwnProperty(JSCompiler_renameProperty('__dataProto',model))){model.__dataProto=Object.create(model.__dataProto);}model.__dataProto[property]=value;}}}}/**
   * Element class mixin that provides basic meta-programming for creating one
   * or more property accessors (getter/setter pair) that enqueue an async
   * (batched) `_propertiesChanged` callback.
   *
   * For basic usage of this mixin:
   *
   * -   Declare attributes to observe via the standard `static get observedAttributes()`. Use
   *     `dash-case` attribute names to represent `camelCase` property names.
   * -   Implement the `_propertiesChanged` callback on the class.
   * -   Call `MyClass.createPropertiesForAttributes()` **once** on the class to generate
   *     property accessors for each observed attribute. This must be called before the first
   *     instance is created, for example, by calling it before calling `customElements.define`.
   *     It can also be called lazily from the element's `constructor`, as long as it's guarded so
   *     that the call is only made once, when the first instance is created.
   * -   Call `this._enableProperties()` in the element's `connectedCallback` to enable
   *     the accessors.
   *
   * Any `observedAttributes` will automatically be
   * deserialized via `attributeChangedCallback` and set to the associated
   * property using `dash-case`-to-`camelCase` convention.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertiesChanged
   * @summary Element class mixin for reacting to property changes from
   *   generated property accessors.
   */const PropertyAccessors=dedupingMixin(superClass=>{/**
   * @constructor
   * @extends {superClass}
   * @implements {Polymer_PropertiesChanged}
   * @unrestricted
   * @private
   */const base=PropertiesChanged(superClass);/**
                                                  * @polymer
                                                  * @mixinClass
                                                  * @implements {Polymer_PropertyAccessors}
                                                  * @extends {base}
                                                  * @unrestricted
                                                  */class PropertyAccessors extends base{/**
     * Generates property accessors for all attributes in the standard
     * static `observedAttributes` array.
     *
     * Attribute names are mapped to property names using the `dash-case` to
     * `camelCase` convention
     *
     * @return {void}
     */static createPropertiesForAttributes(){let a$=this.observedAttributes;for(let i=0;i<a$.length;i++){this.prototype._createPropertyAccessor(dashToCamelCase(a$[i]));}}/**
       * Returns an attribute name that corresponds to the given property.
       * By default, converts camel to dash case, e.g. `fooBar` to `foo-bar`.
       * @param {string} property Property to convert
       * @return {string} Attribute name corresponding to the given property.
       *
       * @protected
       */static attributeNameForProperty(property){return camelToDashCase(property);}/**
       * Overrides PropertiesChanged implementation to initialize values for
       * accessors created for values that already existed on the element
       * prototype.
       *
       * @return {void}
       * @protected
       */_initializeProperties(){if(this.__dataProto){this._initializeProtoProperties(this.__dataProto);this.__dataProto=null;}super._initializeProperties();}/**
       * Called at instance time with bag of properties that were overwritten
       * by accessors on the prototype when accessors were created.
       *
       * The default implementation sets these properties back into the
       * setter at instance time.  This method is provided as an override
       * point for customizing or providing more efficient initialization.
       *
       * @param {Object} props Bag of property values that were overwritten
       *   when creating property accessors.
       * @return {void}
       * @protected
       */_initializeProtoProperties(props){for(let p in props){this._setProperty(p,props[p]);}}/**
       * Ensures the element has the given attribute. If it does not,
       * assigns the given value to the attribute.
       *
       * @suppress {invalidCasts} Closure can't figure out `this` is infact an element
       *
       * @param {string} attribute Name of attribute to ensure is set.
       * @param {string} value of the attribute.
       * @return {void}
       */_ensureAttribute(attribute,value){const el=/** @type {!HTMLElement} */this;if(!el.hasAttribute(attribute)){this._valueToNodeAttribute(el,value,attribute);}}/**
       * Overrides PropertiesChanged implemention to serialize objects as JSON.
       *
       * @param {*} value Property value to serialize.
       * @return {string | undefined} String serialized from the provided property value.
       */_serializeValue(value){/* eslint-disable no-fallthrough */switch(typeof value){case'object':if(value instanceof Date){return value.toString();}else if(value){try{return JSON.stringify(value);}catch(x){return'';}}default:return super._serializeValue(value);}}/**
       * Converts a string to a typed JavaScript value.
       *
       * This method is called by Polymer when reading HTML attribute values to
       * JS properties.  Users may override this method on Polymer element
       * prototypes to provide deserialization for custom `type`s.  Note,
       * the `type` argument is the value of the `type` field provided in the
       * `properties` configuration object for a given property, and is
       * by convention the constructor for the type to deserialize.
       *
       *
       * @param {?string} value Attribute value to deserialize.
       * @param {*=} type Type to deserialize the string to.
       * @return {*} Typed value deserialized from the provided string.
       */_deserializeValue(value,type){/**
       * @type {*}
       */let outValue;switch(type){case Object:try{outValue=JSON.parse(/** @type {string} */value);}catch(x){// allow non-JSON literals like Strings and Numbers
outValue=value;}break;case Array:try{outValue=JSON.parse(/** @type {string} */value);}catch(x){outValue=null;console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${value}`);}break;case Date:outValue=isNaN(value)?String(value):Number(value);outValue=new Date(outValue);break;default:outValue=super._deserializeValue(value,type);break;}return outValue;}/* eslint-enable no-fallthrough */ /**
                                          * Overrides PropertiesChanged implementation to save existing prototype
                                          * property value so that it can be reset.
                                          * @param {string} property Name of the property
                                          * @param {boolean=} readOnly When true, no setter is created
                                          *
                                          * When calling on a prototype, any overwritten values are saved in
                                          * `__dataProto`, and it is up to the subclasser to decide how/when
                                          * to set those properties back into the accessor.  When calling on an
                                          * instance, the overwritten value is set via `_setPendingProperty`,
                                          * and the user should call `_invalidateProperties` or `_flushProperties`
                                          * for the values to take effect.
                                          * @protected
                                          * @return {void}
                                          */_definePropertyAccessor(property,readOnly){saveAccessorValue(this,property);super._definePropertyAccessor(property,readOnly);}/**
       * Returns true if this library created an accessor for the given property.
       *
       * @param {string} property Property name
       * @return {boolean} True if an accessor was created
       */_hasAccessor(property){return this.__dataHasAccessor&&this.__dataHasAccessor[property];}/**
       * Returns true if the specified property has a pending change.
       *
       * @param {string} prop Property name
       * @return {boolean} True if property has a pending change
       * @protected
       */_isPropertyPending(prop){return Boolean(this.__dataPending&&prop in this.__dataPending);}}return PropertyAccessors;});var propertyAccessors={PropertyAccessors:PropertyAccessors};// This is a clear layering violation and gives favored-nation status to
// dom-if and dom-repeat templates.  This is a conceit we're choosing to keep
// a.) to ease 1.x backwards-compatibility due to loss of `is`, and
// b.) to maintain if/repeat capability in parser-constrained elements
//     (e.g. table, select) in lieu of native CE type extensions without
//     massive new invention in this space (e.g. directive system)
const templateExtensions={'dom-if':true,'dom-repeat':true};function wrapTemplateExtension(node){let is=node.getAttribute('is');if(is&&templateExtensions[is]){let t=node;t.removeAttribute('is');node=t.ownerDocument.createElement(is);t.parentNode.replaceChild(node,t);node.appendChild(t);while(t.attributes.length){node.setAttribute(t.attributes[0].name,t.attributes[0].value);t.removeAttribute(t.attributes[0].name);}}return node;}function findTemplateNode(root,nodeInfo){// recursively ascend tree until we hit root
let parent=nodeInfo.parentInfo&&findTemplateNode(root,nodeInfo.parentInfo);// unwind the stack, returning the indexed node at each level
if(parent){// note: marginally faster than indexing via childNodes
// (http://jsperf.com/childnodes-lookup)
for(let n=parent.firstChild,i=0;n;n=n.nextSibling){if(nodeInfo.parentIndex===i++){return n;}}}else{return root;}}// construct `$` map (from id annotations)
function applyIdToMap(inst,map,node,nodeInfo){if(nodeInfo.id){map[nodeInfo.id]=node;}}// install event listeners (from event annotations)
function applyEventListener(inst,node,nodeInfo){if(nodeInfo.events&&nodeInfo.events.length){for(let j=0,e$=nodeInfo.events,e;j<e$.length&&(e=e$[j]);j++){inst._addMethodEventListenerToNode(node,e.name,e.value,inst);}}}// push configuration references at configure time
function applyTemplateContent(inst,node,nodeInfo){if(nodeInfo.templateInfo){node._templateInfo=nodeInfo.templateInfo;}}function createNodeEventHandler(context,eventName,methodName){// Instances can optionally have a _methodHost which allows redirecting where
// to find methods. Currently used by `templatize`.
context=context._methodHost||context;let handler=function(e){if(context[methodName]){context[methodName](e,e.detail);}else{console.warn('listener method `'+methodName+'` not defined');}};return handler;}/**
   * Element mixin that provides basic template parsing and stamping, including
   * the following template-related features for stamped templates:
   *
   * - Declarative event listeners (`on-eventname="listener"`)
   * - Map of node id's to stamped node instances (`this.$.id`)
   * - Nested template content caching/removal and re-installation (performance
   *   optimization)
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin that provides basic template parsing and stamping
   */const TemplateStamp=dedupingMixin(/**
                                             * @template T
                                             * @param {function(new:T)} superClass Class to apply mixin to.
                                             * @return {function(new:T)} superClass with mixin applied.
                                             */superClass=>{/**
   * @polymer
   * @mixinClass
   * @implements {Polymer_TemplateStamp}
   */class TemplateStamp extends superClass{/**
     * Scans a template to produce template metadata.
     *
     * Template-specific metadata are stored in the object returned, and node-
     * specific metadata are stored in objects in its flattened `nodeInfoList`
     * array.  Only nodes in the template that were parsed as nodes of
     * interest contain an object in `nodeInfoList`.  Each `nodeInfo` object
     * contains an `index` (`childNodes` index in parent) and optionally
     * `parent`, which points to node info of its parent (including its index).
     *
     * The template metadata object returned from this method has the following
     * structure (many fields optional):
     *
     * ```js
     *   {
     *     // Flattened list of node metadata (for nodes that generated metadata)
     *     nodeInfoList: [
     *       {
     *         // `id` attribute for any nodes with id's for generating `$` map
     *         id: {string},
     *         // `on-event="handler"` metadata
     *         events: [
     *           {
     *             name: {string},   // event name
     *             value: {string},  // handler method name
     *           }, ...
     *         ],
     *         // Notes when the template contained a `<slot>` for shady DOM
     *         // optimization purposes
     *         hasInsertionPoint: {boolean},
     *         // For nested `<template>`` nodes, nested template metadata
     *         templateInfo: {object}, // nested template metadata
     *         // Metadata to allow efficient retrieval of instanced node
     *         // corresponding to this metadata
     *         parentInfo: {number},   // reference to parent nodeInfo>
     *         parentIndex: {number},  // index in parent's `childNodes` collection
     *         infoIndex: {number},    // index of this `nodeInfo` in `templateInfo.nodeInfoList`
     *       },
     *       ...
     *     ],
     *     // When true, the template had the `strip-whitespace` attribute
     *     // or was nested in a template with that setting
     *     stripWhitespace: {boolean},
     *     // For nested templates, nested template content is moved into
     *     // a document fragment stored here; this is an optimization to
     *     // avoid the cost of nested template cloning
     *     content: {DocumentFragment}
     *   }
     * ```
     *
     * This method kicks off a recursive treewalk as follows:
     *
     * ```
     *    _parseTemplate <---------------------+
     *      _parseTemplateContent              |
     *        _parseTemplateNode  <------------|--+
     *          _parseTemplateNestedTemplate --+  |
     *          _parseTemplateChildNodes ---------+
     *          _parseTemplateNodeAttributes
     *            _parseTemplateNodeAttribute
     *
     * ```
     *
     * These methods may be overridden to add custom metadata about templates
     * to either `templateInfo` or `nodeInfo`.
     *
     * Note that this method may be destructive to the template, in that
     * e.g. event annotations may be removed after being noted in the
     * template metadata.
     *
     * @param {!HTMLTemplateElement} template Template to parse
     * @param {TemplateInfo=} outerTemplateInfo Template metadata from the outer
     *   template, for parsing nested templates
     * @return {!TemplateInfo} Parsed template metadata
     */static _parseTemplate(template,outerTemplateInfo){// since a template may be re-used, memo-ize metadata
if(!template._templateInfo){let templateInfo=template._templateInfo={};templateInfo.nodeInfoList=[];templateInfo.stripWhiteSpace=outerTemplateInfo&&outerTemplateInfo.stripWhiteSpace||template.hasAttribute('strip-whitespace');this._parseTemplateContent(template,templateInfo,{parent:null});}return template._templateInfo;}static _parseTemplateContent(template,templateInfo,nodeInfo){return this._parseTemplateNode(template.content,templateInfo,nodeInfo);}/**
       * Parses template node and adds template and node metadata based on
       * the current node, and its `childNodes` and `attributes`.
       *
       * This method may be overridden to add custom node or template specific
       * metadata based on this node.
       *
       * @param {Node} node Node to parse
       * @param {!TemplateInfo} templateInfo Template metadata for current template
       * @param {!NodeInfo} nodeInfo Node metadata for current template.
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       */static _parseTemplateNode(node,templateInfo,nodeInfo){let noted;let element=/** @type {Element} */node;if(element.localName=='template'&&!element.hasAttribute('preserve-content')){noted=this._parseTemplateNestedTemplate(element,templateInfo,nodeInfo)||noted;}else if(element.localName==='slot'){// For ShadyDom optimization, indicating there is an insertion point
templateInfo.hasInsertionPoint=true;}if(element.firstChild){noted=this._parseTemplateChildNodes(element,templateInfo,nodeInfo)||noted;}if(element.hasAttributes&&element.hasAttributes()){noted=this._parseTemplateNodeAttributes(element,templateInfo,nodeInfo)||noted;}return noted;}/**
       * Parses template child nodes for the given root node.
       *
       * This method also wraps whitelisted legacy template extensions
       * (`is="dom-if"` and `is="dom-repeat"`) with their equivalent element
       * wrappers, collapses text nodes, and strips whitespace from the template
       * if the `templateInfo.stripWhitespace` setting was provided.
       *
       * @param {Node} root Root node whose `childNodes` will be parsed
       * @param {!TemplateInfo} templateInfo Template metadata for current template
       * @param {!NodeInfo} nodeInfo Node metadata for current template.
       * @return {void}
       */static _parseTemplateChildNodes(root,templateInfo,nodeInfo){if(root.localName==='script'||root.localName==='style'){return;}for(let node=root.firstChild,parentIndex=0,next;node;node=next){// Wrap templates
if(node.localName=='template'){node=wrapTemplateExtension(node);}// collapse adjacent textNodes: fixes an IE issue that can cause
// text nodes to be inexplicably split =(
// note that root.normalize() should work but does not so we do this
// manually.
next=node.nextSibling;if(node.nodeType===Node.TEXT_NODE){let/** Node */n=next;while(n&&n.nodeType===Node.TEXT_NODE){node.textContent+=n.textContent;next=n.nextSibling;root.removeChild(n);n=next;}// optionally strip whitespace
if(templateInfo.stripWhiteSpace&&!node.textContent.trim()){root.removeChild(node);continue;}}let childInfo={parentIndex,parentInfo:nodeInfo};if(this._parseTemplateNode(node,templateInfo,childInfo)){childInfo.infoIndex=templateInfo.nodeInfoList.push(/** @type {!NodeInfo} */childInfo)-1;}// Increment if not removed
if(node.parentNode){parentIndex++;}}}/**
       * Parses template content for the given nested `<template>`.
       *
       * Nested template info is stored as `templateInfo` in the current node's
       * `nodeInfo`. `template.content` is removed and stored in `templateInfo`.
       * It will then be the responsibility of the host to set it back to the
       * template and for users stamping nested templates to use the
       * `_contentForTemplate` method to retrieve the content for this template
       * (an optimization to avoid the cost of cloning nested template content).
       *
       * @param {HTMLTemplateElement} node Node to parse (a <template>)
       * @param {TemplateInfo} outerTemplateInfo Template metadata for current template
       *   that includes the template `node`
       * @param {!NodeInfo} nodeInfo Node metadata for current template.
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       */static _parseTemplateNestedTemplate(node,outerTemplateInfo,nodeInfo){let templateInfo=this._parseTemplate(node,outerTemplateInfo);let content=templateInfo.content=node.content.ownerDocument.createDocumentFragment();content.appendChild(node.content);nodeInfo.templateInfo=templateInfo;return true;}/**
       * Parses template node attributes and adds node metadata to `nodeInfo`
       * for nodes of interest.
       *
       * @param {Element} node Node to parse
       * @param {TemplateInfo} templateInfo Template metadata for current template
       * @param {NodeInfo} nodeInfo Node metadata for current template.
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       */static _parseTemplateNodeAttributes(node,templateInfo,nodeInfo){// Make copy of original attribute list, since the order may change
// as attributes are added and removed
let noted=false;let attrs=Array.from(node.attributes);for(let i=attrs.length-1,a;a=attrs[i];i--){noted=this._parseTemplateNodeAttribute(node,templateInfo,nodeInfo,a.name,a.value)||noted;}return noted;}/**
       * Parses a single template node attribute and adds node metadata to
       * `nodeInfo` for attributes of interest.
       *
       * This implementation adds metadata for `on-event="handler"` attributes
       * and `id` attributes.
       *
       * @param {Element} node Node to parse
       * @param {!TemplateInfo} templateInfo Template metadata for current template
       * @param {!NodeInfo} nodeInfo Node metadata for current template.
       * @param {string} name Attribute name
       * @param {string} value Attribute value
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       */static _parseTemplateNodeAttribute(node,templateInfo,nodeInfo,name,value){// events (on-*)
if(name.slice(0,3)==='on-'){node.removeAttribute(name);nodeInfo.events=nodeInfo.events||[];nodeInfo.events.push({name:name.slice(3),value});return true;}// static id
else if(name==='id'){nodeInfo.id=value;return true;}return false;}/**
       * Returns the `content` document fragment for a given template.
       *
       * For nested templates, Polymer performs an optimization to cache nested
       * template content to avoid the cost of cloning deeply nested templates.
       * This method retrieves the cached content for a given template.
       *
       * @param {HTMLTemplateElement} template Template to retrieve `content` for
       * @return {DocumentFragment} Content fragment
       */static _contentForTemplate(template){let templateInfo=/** @type {HTMLTemplateElementWithInfo} */template._templateInfo;return templateInfo&&templateInfo.content||template.content;}/**
       * Clones the provided template content and returns a document fragment
       * containing the cloned dom.
       *
       * The template is parsed (once and memoized) using this library's
       * template parsing features, and provides the following value-added
       * features:
       * * Adds declarative event listeners for `on-event="handler"` attributes
       * * Generates an "id map" for all nodes with id's under `$` on returned
       *   document fragment
       * * Passes template info including `content` back to templates as
       *   `_templateInfo` (a performance optimization to avoid deep template
       *   cloning)
       *
       * Note that the memoized template parsing process is destructive to the
       * template: attributes for bindings and declarative event listeners are
       * removed after being noted in notes, and any nested `<template>.content`
       * is removed and stored in notes as well.
       *
       * @param {!HTMLTemplateElement} template Template to stamp
       * @return {!StampedTemplate} Cloned template content
       * @override
       */_stampTemplate(template){// Polyfill support: bootstrap the template if it has not already been
if(template&&!template.content&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate){HTMLTemplateElement.decorate(template);}let templateInfo=this.constructor._parseTemplate(template);let nodeInfo=templateInfo.nodeInfoList;let content=templateInfo.content||template.content;let dom=/** @type {DocumentFragment} */document.importNode(content,true);// NOTE: ShadyDom optimization indicating there is an insertion point
dom.__noInsertionPoint=!templateInfo.hasInsertionPoint;let nodes=dom.nodeList=new Array(nodeInfo.length);dom.$={};for(let i=0,l=nodeInfo.length,info;i<l&&(info=nodeInfo[i]);i++){let node=nodes[i]=findTemplateNode(dom,info);applyIdToMap(this,dom.$,node,info);applyTemplateContent(this,node,info);applyEventListener(this,node,info);}dom=/** @type {!StampedTemplate} */dom;// eslint-disable-line no-self-assign
return dom;}/**
       * Adds an event listener by method name for the event provided.
       *
       * This method generates a handler function that looks up the method
       * name at handling time.
       *
       * @param {!EventTarget} node Node to add listener on
       * @param {string} eventName Name of event
       * @param {string} methodName Name of method
       * @param {*=} context Context the method will be called on (defaults
       *   to `node`)
       * @return {Function} Generated handler function
       * @override
       */_addMethodEventListenerToNode(node,eventName,methodName,context){context=context||node;let handler=createNodeEventHandler(context,eventName,methodName);this._addEventListenerToNode(node,eventName,handler);return handler;}/**
       * Override point for adding custom or simulated event handling.
       *
       * @param {!EventTarget} node Node to add event listener to
       * @param {string} eventName Name of event
       * @param {function(!Event):void} handler Listener function to add
       * @return {void}
       * @override
       */_addEventListenerToNode(node,eventName,handler){node.addEventListener(eventName,handler);}/**
       * Override point for adding custom or simulated event handling.
       *
       * @param {!EventTarget} node Node to remove event listener from
       * @param {string} eventName Name of event
       * @param {function(!Event):void} handler Listener function to remove
       * @return {void}
       * @override
       */_removeEventListenerFromNode(node,eventName,handler){node.removeEventListener(eventName,handler);}}return TemplateStamp;});var templateStamp={TemplateStamp:TemplateStamp};// from multiple properties in the same turn
let dedupeId$1=0;/**
                    * Property effect types; effects are stored on the prototype using these keys
                    * @enum {string}
                    */const TYPES={COMPUTE:'__computeEffects',REFLECT:'__reflectEffects',NOTIFY:'__notifyEffects',PROPAGATE:'__propagateEffects',OBSERVE:'__observeEffects',READ_ONLY:'__readOnly'};/** @const {RegExp} */const capitalAttributeRegex=/[A-Z]/;/**
                                        * @typedef {{
                                        * name: (string | undefined),
                                        * structured: (boolean | undefined),
                                        * wildcard: (boolean | undefined)
                                        * }}
                                        */let DataTrigger;//eslint-disable-line no-unused-vars
/**
 * @typedef {{
 * info: ?,
 * trigger: (!DataTrigger | undefined),
 * fn: (!Function | undefined)
 * }}
 */let DataEffect;//eslint-disable-line no-unused-vars
let PropertyEffectsType;//eslint-disable-line no-unused-vars
/**
 * Ensures that the model has an own-property map of effects for the given type.
 * The model may be a prototype or an instance.
 *
 * Property effects are stored as arrays of effects by property in a map,
 * by named type on the model. e.g.
 *
 *   __computeEffects: {
 *     foo: [ ... ],
 *     bar: [ ... ]
 *   }
 *
 * If the model does not yet have an effect map for the type, one is created
 * and returned.  If it does, but it is not an own property (i.e. the
 * prototype had effects), the the map is deeply cloned and the copy is
 * set on the model and returned, ready for new effects to be added.
 *
 * @param {Object} model Prototype or instance
 * @param {string} type Property effect type
 * @return {Object} The own-property map of effects for the given type
 * @private
 */function ensureOwnEffectMap(model,type){let effects=model[type];if(!effects){effects=model[type]={};}else if(!model.hasOwnProperty(type)){effects=model[type]=Object.create(model[type]);for(let p in effects){let protoFx=effects[p];let instFx=effects[p]=Array(protoFx.length);for(let i=0;i<protoFx.length;i++){instFx[i]=protoFx[i];}}}return effects;}// -- effects ----------------------------------------------
/**
 * Runs all effects of a given type for the given set of property changes
 * on an instance.
 *
 * @param {!PropertyEffectsType} inst The instance with effects to run
 * @param {Object} effects Object map of property-to-Array of effects
 * @param {Object} props Bag of current property changes
 * @param {Object=} oldProps Bag of previous values for changed properties
 * @param {boolean=} hasPaths True with `props` contains one or more paths
 * @param {*=} extraArgs Additional metadata to pass to effect function
 * @return {boolean} True if an effect ran for this property
 * @private
 */function runEffects(inst,effects,props,oldProps,hasPaths,extraArgs){if(effects){let ran=false;let id=dedupeId$1++;for(let prop in props){if(runEffectsForProperty(inst,effects,id,prop,props,oldProps,hasPaths,extraArgs)){ran=true;}}return ran;}return false;}/**
   * Runs a list of effects for a given property.
   *
   * @param {!PropertyEffectsType} inst The instance with effects to run
   * @param {Object} effects Object map of property-to-Array of effects
   * @param {number} dedupeId Counter used for de-duping effects
   * @param {string} prop Name of changed property
   * @param {*} props Changed properties
   * @param {*} oldProps Old properties
   * @param {boolean=} hasPaths True with `props` contains one or more paths
   * @param {*=} extraArgs Additional metadata to pass to effect function
   * @return {boolean} True if an effect ran for this property
   * @private
   */function runEffectsForProperty(inst,effects,dedupeId,prop,props,oldProps,hasPaths,extraArgs){let ran=false;let rootProperty=hasPaths?root(prop):prop;let fxs=effects[rootProperty];if(fxs){for(let i=0,l=fxs.length,fx;i<l&&(fx=fxs[i]);i++){if((!fx.info||fx.info.lastRun!==dedupeId)&&(!hasPaths||pathMatchesTrigger(prop,fx.trigger))){if(fx.info){fx.info.lastRun=dedupeId;}fx.fn(inst,prop,props,oldProps,fx.info,hasPaths,extraArgs);ran=true;}}}return ran;}/**
   * Determines whether a property/path that has changed matches the trigger
   * criteria for an effect.  A trigger is a descriptor with the following
   * structure, which matches the descriptors returned from `parseArg`.
   * e.g. for `foo.bar.*`:
   * ```
   * trigger: {
   *   name: 'a.b',
   *   structured: true,
   *   wildcard: true
   * }
   * ```
   * If no trigger is given, the path is deemed to match.
   *
   * @param {string} path Path or property that changed
   * @param {DataTrigger} trigger Descriptor
   * @return {boolean} Whether the path matched the trigger
   */function pathMatchesTrigger(path,trigger){if(trigger){let triggerPath=trigger.name;return triggerPath==path||trigger.structured&&isAncestor(triggerPath,path)||trigger.wildcard&&isDescendant(triggerPath,path);}else{return true;}}/**
   * Implements the "observer" effect.
   *
   * Calls the method with `info.methodName` on the instance, passing the
   * new and old values.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {void}
   * @private
   */function runObserverEffect(inst,property,props,oldProps,info){let fn=typeof info.method==="string"?inst[info.method]:info.method;let changedProp=info.property;if(fn){fn.call(inst,inst.__data[changedProp],oldProps[changedProp]);}else if(!info.dynamicFn){console.warn('observer method `'+info.method+'` not defined');}}/**
   * Runs "notify" effects for a set of changed properties.
   *
   * This method differs from the generic `runEffects` method in that it
   * will dispatch path notification events in the case that the property
   * changed was a path and the root property for that path didn't have a
   * "notify" effect.  This is to maintain 1.0 behavior that did not require
   * `notify: true` to ensure object sub-property notifications were
   * sent.
   *
   * @param {!PropertyEffectsType} inst The instance with effects to run
   * @param {Object} notifyProps Bag of properties to notify
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @return {void}
   * @private
   */function runNotifyEffects(inst,notifyProps,props,oldProps,hasPaths){// Notify
let fxs=inst[TYPES.NOTIFY];let notified;let id=dedupeId$1++;// Try normal notify effects; if none, fall back to try path notification
for(let prop in notifyProps){if(notifyProps[prop]){if(fxs&&runEffectsForProperty(inst,fxs,id,prop,props,oldProps,hasPaths)){notified=true;}else if(hasPaths&&notifyPath(inst,prop,props)){notified=true;}}}// Flush host if we actually notified and host was batching
// And the host has already initialized clients; this prevents
// an issue with a host observing data changes before clients are ready.
let host;if(notified&&(host=inst.__dataHost)&&host._invalidateProperties){host._invalidateProperties();}}/**
   * Dispatches {property}-changed events with path information in the detail
   * object to indicate a sub-path of the property was changed.
   *
   * @param {!PropertyEffectsType} inst The element from which to fire the event
   * @param {string} path The path that was changed
   * @param {Object} props Bag of current property changes
   * @return {boolean} Returns true if the path was notified
   * @private
   */function notifyPath(inst,path,props){let rootProperty=root(path);if(rootProperty!==path){let eventName=camelToDashCase(rootProperty)+'-changed';dispatchNotifyEvent(inst,eventName,props[path],path);return true;}return false;}/**
   * Dispatches {property}-changed events to indicate a property (or path)
   * changed.
   *
   * @param {!PropertyEffectsType} inst The element from which to fire the event
   * @param {string} eventName The name of the event to send ('{property}-changed')
   * @param {*} value The value of the changed property
   * @param {string | null | undefined} path If a sub-path of this property changed, the path
   *   that changed (optional).
   * @return {void}
   * @private
   * @suppress {invalidCasts}
   */function dispatchNotifyEvent(inst,eventName,value,path){let detail={value:value,queueProperty:true};if(path){detail.path=path;}/** @type {!HTMLElement} */inst.dispatchEvent(new CustomEvent(eventName,{detail}));}/**
   * Implements the "notify" effect.
   *
   * Dispatches a non-bubbling event named `info.eventName` on the instance
   * with a detail object containing the new `value`.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @return {void}
   * @private
   */function runNotifyEffect(inst,property,props,oldProps,info,hasPaths){let rootProperty=hasPaths?root(property):property;let path=rootProperty!=property?property:null;let value=path?get(inst,path):inst.__data[property];if(path&&value===undefined){value=props[property];// specifically for .splices
}dispatchNotifyEvent(inst,info.eventName,value,path);}/**
   * Handler function for 2-way notification events. Receives context
   * information captured in the `addNotifyListener` closure from the
   * `__notifyListeners` metadata.
   *
   * Sets the value of the notified property to the host property or path.  If
   * the event contained path information, translate that path to the host
   * scope's name for that path first.
   *
   * @param {CustomEvent} event Notification event (e.g. '<property>-changed')
   * @param {!PropertyEffectsType} inst Host element instance handling the notification event
   * @param {string} fromProp Child element property that was bound
   * @param {string} toPath Host property/path that was bound
   * @param {boolean} negate Whether the binding was negated
   * @return {void}
   * @private
   */function handleNotification(event,inst,fromProp,toPath,negate){let value;let detail=/** @type {Object} */event.detail;let fromPath=detail&&detail.path;if(fromPath){toPath=translate$1(fromProp,toPath,fromPath);value=detail&&detail.value;}else{value=event.currentTarget[fromProp];}value=negate?!value:value;if(!inst[TYPES.READ_ONLY]||!inst[TYPES.READ_ONLY][toPath]){if(inst._setPendingPropertyOrPath(toPath,value,true,Boolean(fromPath))&&(!detail||!detail.queueProperty)){inst._invalidateProperties();}}}/**
   * Implements the "reflect" effect.
   *
   * Sets the attribute named `info.attrName` to the given property value.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {void}
   * @private
   */function runReflectEffect(inst,property,props,oldProps,info){let value=inst.__data[property];if(sanitizeDOMValue){value=sanitizeDOMValue(value,info.attrName,'attribute',/** @type {Node} */inst);}inst._propertyToAttribute(property,info.attrName,value);}/**
   * Runs "computed" effects for a set of changed properties.
   *
   * This method differs from the generic `runEffects` method in that it
   * continues to run computed effects based on the output of each pass until
   * there are no more newly computed properties.  This ensures that all
   * properties that will be computed by the initial set of changes are
   * computed before other effects (binding propagation, observers, and notify)
   * run.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {!Object} changedProps Bag of changed properties
   * @param {!Object} oldProps Bag of previous values for changed properties
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @return {void}
   * @private
   */function runComputedEffects(inst,changedProps,oldProps,hasPaths){let computeEffects=inst[TYPES.COMPUTE];if(computeEffects){let inputProps=changedProps;while(runEffects(inst,computeEffects,inputProps,oldProps,hasPaths)){Object.assign(oldProps,inst.__dataOld);Object.assign(changedProps,inst.__dataPending);inputProps=inst.__dataPending;inst.__dataPending=null;}}}/**
   * Implements the "computed property" effect by running the method with the
   * values of the arguments specified in the `info` object and setting the
   * return value to the computed property specified.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {void}
   * @private
   */function runComputedEffect(inst,property,props,oldProps,info){let result=runMethodEffect(inst,property,props,oldProps,info);let computedProp=info.methodInfo;if(inst.__dataHasAccessor&&inst.__dataHasAccessor[computedProp]){inst._setPendingProperty(computedProp,result,true);}else{inst[computedProp]=result;}}/**
   * Computes path changes based on path links set up using the `linkPaths`
   * API.
   *
   * @param {!PropertyEffectsType} inst The instance whose props are changing
   * @param {string | !Array<(string|number)>} path Path that has changed
   * @param {*} value Value of changed path
   * @return {void}
   * @private
   */function computeLinkedPaths(inst,path,value){let links=inst.__dataLinkedPaths;if(links){let link;for(let a in links){let b=links[a];if(isDescendant(a,path)){link=translate$1(a,b,path);inst._setPendingPropertyOrPath(link,value,true,true);}else if(isDescendant(b,path)){link=translate$1(b,a,path);inst._setPendingPropertyOrPath(link,value,true,true);}}}}// -- bindings ----------------------------------------------
/**
 * Adds binding metadata to the current `nodeInfo`, and binding effects
 * for all part dependencies to `templateInfo`.
 *
 * @param {Function} constructor Class that `_parseTemplate` is currently
 *   running on
 * @param {TemplateInfo} templateInfo Template metadata for current template
 * @param {NodeInfo} nodeInfo Node metadata for current template node
 * @param {string} kind Binding kind, either 'property', 'attribute', or 'text'
 * @param {string} target Target property name
 * @param {!Array<!BindingPart>} parts Array of binding part metadata
 * @param {string=} literal Literal text surrounding binding parts (specified
 *   only for 'property' bindings, since these must be initialized as part
 *   of boot-up)
 * @return {void}
 * @private
 */function addBinding(constructor,templateInfo,nodeInfo,kind,target,parts,literal){// Create binding metadata and add to nodeInfo
nodeInfo.bindings=nodeInfo.bindings||[];let/** Binding */binding={kind,target,parts,literal,isCompound:parts.length!==1};nodeInfo.bindings.push(binding);// Add listener info to binding metadata
if(shouldAddListener(binding)){let{event,negate}=binding.parts[0];binding.listenerEvent=event||camelToDashCase(target)+'-changed';binding.listenerNegate=negate;}// Add "propagate" property effects to templateInfo
let index=templateInfo.nodeInfoList.length;for(let i=0;i<binding.parts.length;i++){let part=binding.parts[i];part.compoundIndex=i;addEffectForBindingPart(constructor,templateInfo,binding,part,index);}}/**
   * Adds property effects to the given `templateInfo` for the given binding
   * part.
   *
   * @param {Function} constructor Class that `_parseTemplate` is currently
   *   running on
   * @param {TemplateInfo} templateInfo Template metadata for current template
   * @param {!Binding} binding Binding metadata
   * @param {!BindingPart} part Binding part metadata
   * @param {number} index Index into `nodeInfoList` for this node
   * @return {void}
   */function addEffectForBindingPart(constructor,templateInfo,binding,part,index){if(!part.literal){if(binding.kind==='attribute'&&binding.target[0]==='-'){console.warn('Cannot set attribute '+binding.target+' because "-" is not a valid attribute starting character');}else{let dependencies=part.dependencies;let info={index,binding,part,evaluator:constructor};for(let j=0;j<dependencies.length;j++){let trigger=dependencies[j];if(typeof trigger=='string'){trigger=parseArg(trigger);trigger.wildcard=true;}constructor._addTemplatePropertyEffect(templateInfo,trigger.rootProperty,{fn:runBindingEffect,info,trigger});}}}}/**
   * Implements the "binding" (property/path binding) effect.
   *
   * Note that binding syntax is overridable via `_parseBindings` and
   * `_evaluateBinding`.  This method will call `_evaluateBinding` for any
   * non-literal parts returned from `_parseBindings`.  However,
   * there is no support for _path_ bindings via custom binding parts,
   * as this is specific to Polymer's path binding syntax.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} path Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @param {boolean} hasPaths True with `props` contains one or more paths
   * @param {Array} nodeList List of nodes associated with `nodeInfoList` template
   *   metadata
   * @return {void}
   * @private
   */function runBindingEffect(inst,path,props,oldProps,info,hasPaths,nodeList){let node=nodeList[info.index];let binding=info.binding;let part=info.part;// Subpath notification: transform path and set to client
// e.g.: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo.prop'=obj.sub.prop
if(hasPaths&&part.source&&path.length>part.source.length&&binding.kind=='property'&&!binding.isCompound&&node.__isPropertyEffectsClient&&node.__dataHasAccessor&&node.__dataHasAccessor[binding.target]){let value=props[path];path=translate$1(part.source,binding.target,path);if(node._setPendingPropertyOrPath(path,value,false,true)){inst._enqueueClient(node);}}else{let value=info.evaluator._evaluateBinding(inst,part,path,props,oldProps,hasPaths);// Propagate value to child
applyBindingValue(inst,node,binding,part,value);}}/**
   * Sets the value for an "binding" (binding) effect to a node,
   * either as a property or attribute.
   *
   * @param {!PropertyEffectsType} inst The instance owning the binding effect
   * @param {Node} node Target node for binding
   * @param {!Binding} binding Binding metadata
   * @param {!BindingPart} part Binding part metadata
   * @param {*} value Value to set
   * @return {void}
   * @private
   */function applyBindingValue(inst,node,binding,part,value){value=computeBindingValue(node,value,binding,part);if(sanitizeDOMValue){value=sanitizeDOMValue(value,binding.target,binding.kind,node);}if(binding.kind=='attribute'){// Attribute binding
inst._valueToNodeAttribute(/** @type {Element} */node,value,binding.target);}else{// Property binding
let prop=binding.target;if(node.__isPropertyEffectsClient&&node.__dataHasAccessor&&node.__dataHasAccessor[prop]){if(!node[TYPES.READ_ONLY]||!node[TYPES.READ_ONLY][prop]){if(node._setPendingProperty(prop,value)){inst._enqueueClient(node);}}}else{inst._setUnmanagedPropertyToNode(node,prop,value);}}}/**
   * Transforms an "binding" effect value based on compound & negation
   * effect metadata, as well as handling for special-case properties
   *
   * @param {Node} node Node the value will be set to
   * @param {*} value Value to set
   * @param {!Binding} binding Binding metadata
   * @param {!BindingPart} part Binding part metadata
   * @return {*} Transformed value to set
   * @private
   */function computeBindingValue(node,value,binding,part){if(binding.isCompound){let storage=node.__dataCompoundStorage[binding.target];storage[part.compoundIndex]=value;value=storage.join('');}if(binding.kind!=='attribute'){// Some browsers serialize `undefined` to `"undefined"`
if(binding.target==='textContent'||binding.target==='value'&&(node.localName==='input'||node.localName==='textarea')){value=value==undefined?'':value;}}return value;}/**
   * Returns true if a binding's metadata meets all the requirements to allow
   * 2-way binding, and therefore a `<property>-changed` event listener should be
   * added:
   * - used curly braces
   * - is a property (not attribute) binding
   * - is not a textContent binding
   * - is not compound
   *
   * @param {!Binding} binding Binding metadata
   * @return {boolean} True if 2-way listener should be added
   * @private
   */function shouldAddListener(binding){return Boolean(binding.target)&&binding.kind!='attribute'&&binding.kind!='text'&&!binding.isCompound&&binding.parts[0].mode==='{';}/**
   * Setup compound binding storage structures, notify listeners, and dataHost
   * references onto the bound nodeList.
   *
   * @param {!PropertyEffectsType} inst Instance that bas been previously bound
   * @param {TemplateInfo} templateInfo Template metadata
   * @return {void}
   * @private
   */function setupBindings(inst,templateInfo){// Setup compound storage, dataHost, and notify listeners
let{nodeList,nodeInfoList}=templateInfo;if(nodeInfoList.length){for(let i=0;i<nodeInfoList.length;i++){let info=nodeInfoList[i];let node=nodeList[i];let bindings=info.bindings;if(bindings){for(let i=0;i<bindings.length;i++){let binding=bindings[i];setupCompoundStorage(node,binding);addNotifyListener(node,inst,binding);}}node.__dataHost=inst;}}}/**
   * Initializes `__dataCompoundStorage` local storage on a bound node with
   * initial literal data for compound bindings, and sets the joined
   * literal parts to the bound property.
   *
   * When changes to compound parts occur, they are first set into the compound
   * storage array for that property, and then the array is joined to result in
   * the final value set to the property/attribute.
   *
   * @param {Node} node Bound node to initialize
   * @param {Binding} binding Binding metadata
   * @return {void}
   * @private
   */function setupCompoundStorage(node,binding){if(binding.isCompound){// Create compound storage map
let storage=node.__dataCompoundStorage||(node.__dataCompoundStorage={});let parts=binding.parts;// Copy literals from parts into storage for this binding
let literals=new Array(parts.length);for(let j=0;j<parts.length;j++){literals[j]=parts[j].literal;}let target=binding.target;storage[target]=literals;// Configure properties with their literal parts
if(binding.literal&&binding.kind=='property'){node[target]=binding.literal;}}}/**
   * Adds a 2-way binding notification event listener to the node specified
   *
   * @param {Object} node Child element to add listener to
   * @param {!PropertyEffectsType} inst Host element instance to handle notification event
   * @param {Binding} binding Binding metadata
   * @return {void}
   * @private
   */function addNotifyListener(node,inst,binding){if(binding.listenerEvent){let part=binding.parts[0];node.addEventListener(binding.listenerEvent,function(e){handleNotification(e,inst,binding.target,part.source,part.negate);});}}// -- for method-based effects (complexObserver & computed) --------------
/**
 * Adds property effects for each argument in the method signature (and
 * optionally, for the method name if `dynamic` is true) that calls the
 * provided effect function.
 *
 * @param {Element | Object} model Prototype or instance
 * @param {!MethodSignature} sig Method signature metadata
 * @param {string} type Type of property effect to add
 * @param {Function} effectFn Function to run when arguments change
 * @param {*=} methodInfo Effect-specific information to be included in
 *   method effect metadata
 * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
 *   method names should be included as a dependency to the effect. Note,
 *   defaults to true if the signature is static (sig.static is true).
 * @return {void}
 * @private
 */function createMethodEffect(model,sig,type,effectFn,methodInfo,dynamicFn){dynamicFn=sig.static||dynamicFn&&(typeof dynamicFn!=='object'||dynamicFn[sig.methodName]);let info={methodName:sig.methodName,args:sig.args,methodInfo,dynamicFn};for(let i=0,arg;i<sig.args.length&&(arg=sig.args[i]);i++){if(!arg.literal){model._addPropertyEffect(arg.rootProperty,type,{fn:effectFn,info:info,trigger:arg});}}if(dynamicFn){model._addPropertyEffect(sig.methodName,type,{fn:effectFn,info:info});}}/**
   * Calls a method with arguments marshaled from properties on the instance
   * based on the method signature contained in the effect metadata.
   *
   * Multi-property observers, computed properties, and inline computing
   * functions call this function to invoke the method, then use the return
   * value accordingly.
   *
   * @param {!PropertyEffectsType} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @param {?} info Effect metadata
   * @return {*} Returns the return value from the method invocation
   * @private
   */function runMethodEffect(inst,property,props,oldProps,info){// Instances can optionally have a _methodHost which allows redirecting where
// to find methods. Currently used by `templatize`.
let context=inst._methodHost||inst;let fn=context[info.methodName];if(fn){let args=inst._marshalArgs(info.args,property,props);return fn.apply(context,args);}else if(!info.dynamicFn){console.warn('method `'+info.methodName+'` not defined');}}const emptyArray=[];// Regular expressions used for binding
const IDENT='(?:'+'[a-zA-Z_$][\\w.:$\\-*]*'+')';const NUMBER='(?:'+'[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?'+')';const SQUOTE_STRING='(?:'+'\'(?:[^\'\\\\]|\\\\.)*\''+')';const DQUOTE_STRING='(?:'+'"(?:[^"\\\\]|\\\\.)*"'+')';const STRING='(?:'+SQUOTE_STRING+'|'+DQUOTE_STRING+')';const ARGUMENT='(?:('+IDENT+'|'+NUMBER+'|'+STRING+')\\s*'+')';const ARGUMENTS='(?:'+ARGUMENT+'(?:,\\s*'+ARGUMENT+')*'+')';const ARGUMENT_LIST='(?:'+'\\(\\s*'+'(?:'+ARGUMENTS+'?'+')'+'\\)\\s*'+')';const BINDING='('+IDENT+'\\s*'+ARGUMENT_LIST+'?'+')';// Group 3
const OPEN_BRACKET='(\\[\\[|{{)'+'\\s*';const CLOSE_BRACKET='(?:]]|}})';const NEGATE='(?:(!)\\s*)?';// Group 2
const EXPRESSION=OPEN_BRACKET+NEGATE+BINDING+CLOSE_BRACKET;const bindingRegex=new RegExp(EXPRESSION,"g");/**
                                                   * Create a string from binding parts of all the literal parts
                                                   *
                                                   * @param {!Array<BindingPart>} parts All parts to stringify
                                                   * @return {string} String made from the literal parts
                                                   */function literalFromParts(parts){let s='';for(let i=0;i<parts.length;i++){let literal=parts[i].literal;s+=literal||'';}return s;}/**
   * Parses an expression string for a method signature, and returns a metadata
   * describing the method in terms of `methodName`, `static` (whether all the
   * arguments are literals), and an array of `args`
   *
   * @param {string} expression The expression to parse
   * @return {?MethodSignature} The method metadata object if a method expression was
   *   found, otherwise `undefined`
   * @private
   */function parseMethod(expression){// tries to match valid javascript property names
let m=expression.match(/([^\s]+?)\(([\s\S]*)\)/);if(m){let methodName=m[1];let sig={methodName,static:true,args:emptyArray};if(m[2].trim()){// replace escaped commas with comma entity, split on un-escaped commas
let args=m[2].replace(/\\,/g,'&comma;').split(',');return parseArgs(args,sig);}else{return sig;}}return null;}/**
   * Parses an array of arguments and sets the `args` property of the supplied
   * signature metadata object. Sets the `static` property to false if any
   * argument is a non-literal.
   *
   * @param {!Array<string>} argList Array of argument names
   * @param {!MethodSignature} sig Method signature metadata object
   * @return {!MethodSignature} The updated signature metadata object
   * @private
   */function parseArgs(argList,sig){sig.args=argList.map(function(rawArg){let arg=parseArg(rawArg);if(!arg.literal){sig.static=false;}return arg;},this);return sig;}/**
   * Parses an individual argument, and returns an argument metadata object
   * with the following fields:
   *
   *   {
   *     value: 'prop',        // property/path or literal value
   *     literal: false,       // whether argument is a literal
   *     structured: false,    // whether the property is a path
   *     rootProperty: 'prop', // the root property of the path
   *     wildcard: false       // whether the argument was a wildcard '.*' path
   *   }
   *
   * @param {string} rawArg The string value of the argument
   * @return {!MethodArg} Argument metadata object
   * @private
   */function parseArg(rawArg){// clean up whitespace
let arg=rawArg.trim()// replace comma entity with comma
.replace(/&comma;/g,',')// repair extra escape sequences; note only commas strictly need
// escaping, but we allow any other char to be escaped since its
// likely users will do this
.replace(/\\(.)/g,'\$1');// basic argument descriptor
let a={name:arg,value:'',literal:false};// detect literal value (must be String or Number)
let fc=arg[0];if(fc==='-'){fc=arg[1];}if(fc>='0'&&fc<='9'){fc='#';}switch(fc){case"'":case'"':a.value=arg.slice(1,-1);a.literal=true;break;case'#':a.value=Number(arg);a.literal=true;break;}// if not literal, look for structured path
if(!a.literal){a.rootProperty=root(arg);// detect structured path (has dots)
a.structured=isPath(arg);if(a.structured){a.wildcard=arg.slice(-2)=='.*';if(a.wildcard){a.name=arg.slice(0,-2);}}}return a;}// data api
/**
 * Sends array splice notifications (`.splices` and `.length`)
 *
 * Note: this implementation only accepts normalized paths
 *
 * @param {!PropertyEffectsType} inst Instance to send notifications to
 * @param {Array} array The array the mutations occurred on
 * @param {string} path The path to the array that was mutated
 * @param {Array} splices Array of splice records
 * @return {void}
 * @private
 */function notifySplices(inst,array,path,splices){let splicesPath=path+'.splices';inst.notifyPath(splicesPath,{indexSplices:splices});inst.notifyPath(path+'.length',array.length);// Null here to allow potentially large splice records to be GC'ed.
inst.__data[splicesPath]={indexSplices:null};}/**
   * Creates a splice record and sends an array splice notification for
   * the described mutation
   *
   * Note: this implementation only accepts normalized paths
   *
   * @param {!PropertyEffectsType} inst Instance to send notifications to
   * @param {Array} array The array the mutations occurred on
   * @param {string} path The path to the array that was mutated
   * @param {number} index Index at which the array mutation occurred
   * @param {number} addedCount Number of added items
   * @param {Array} removed Array of removed items
   * @return {void}
   * @private
   */function notifySplice(inst,array,path,index,addedCount,removed){notifySplices(inst,array,path,[{index:index,addedCount:addedCount,removed:removed,object:array,type:'splice'}]);}/**
   * Returns an upper-cased version of the string.
   *
   * @param {string} name String to uppercase
   * @return {string} Uppercased string
   * @private
   */function upper(name){return name[0].toUpperCase()+name.substring(1);}/**
   * Element class mixin that provides meta-programming for Polymer's template
   * binding and data observation (collectively, "property effects") system.
   *
   * This mixin uses provides the following key static methods for adding
   * property effects to an element class:
   * - `addPropertyEffect`
   * - `createPropertyObserver`
   * - `createMethodObserver`
   * - `createNotifyingProperty`
   * - `createReadOnlyProperty`
   * - `createReflectedProperty`
   * - `createComputedProperty`
   * - `bindTemplate`
   *
   * Each method creates one or more property accessors, along with metadata
   * used by this mixin's implementation of `_propertiesChanged` to perform
   * the property effects.
   *
   * Underscored versions of the above methods also exist on the element
   * prototype for adding property effects on instances at runtime.
   *
   * Note that this mixin overrides several `PropertyAccessors` methods, in
   * many cases to maintain guarantees provided by the Polymer 1.x features;
   * notably it changes property accessors to be synchronous by default
   * whereas the default when using `PropertyAccessors` standalone is to be
   * async by default.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin TemplateStamp
   * @appliesMixin PropertyAccessors
   * @summary Element class mixin that provides meta-programming for Polymer's
   * template binding and data observation system.
   */const PropertyEffects=dedupingMixin(superClass=>{/**
   * @constructor
   * @extends {superClass}
   * @implements {Polymer_PropertyAccessors}
   * @implements {Polymer_TemplateStamp}
   * @unrestricted
   * @private
   */const propertyEffectsBase=TemplateStamp(PropertyAccessors(superClass));/**
                                                                                * @polymer
                                                                                * @mixinClass
                                                                                * @implements {Polymer_PropertyEffects}
                                                                                * @extends {propertyEffectsBase}
                                                                                * @unrestricted
                                                                                */class PropertyEffects extends propertyEffectsBase{constructor(){super();/** @type {boolean} */ // Used to identify users of this mixin, ala instanceof
this.__isPropertyEffectsClient=true;/** @type {number} */ // NOTE: used to track re-entrant calls to `_flushProperties`
// path changes dirty check against `__dataTemp` only during one "turn"
// and are cleared when `__dataCounter` returns to 0.
this.__dataCounter=0;/** @type {boolean} */this.__dataClientsReady;/** @type {Array} */this.__dataPendingClients;/** @type {Object} */this.__dataToNotify;/** @type {Object} */this.__dataLinkedPaths;/** @type {boolean} */this.__dataHasPaths;/** @type {Object} */this.__dataCompoundStorage;/** @type {Polymer_PropertyEffects} */this.__dataHost;/** @type {!Object} */this.__dataTemp;/** @type {boolean} */this.__dataClientsInitialized;/** @type {!Object} */this.__data;/** @type {!Object} */this.__dataPending;/** @type {!Object} */this.__dataOld;/** @type {Object} */this.__computeEffects;/** @type {Object} */this.__reflectEffects;/** @type {Object} */this.__notifyEffects;/** @type {Object} */this.__propagateEffects;/** @type {Object} */this.__observeEffects;/** @type {Object} */this.__readOnly;/** @type {!TemplateInfo} */this.__templateInfo;}get PROPERTY_EFFECT_TYPES(){return TYPES;}/**
       * @return {void}
       */_initializeProperties(){super._initializeProperties();hostStack.registerHost(this);this.__dataClientsReady=false;this.__dataPendingClients=null;this.__dataToNotify=null;this.__dataLinkedPaths=null;this.__dataHasPaths=false;// May be set on instance prior to upgrade
this.__dataCompoundStorage=this.__dataCompoundStorage||null;this.__dataHost=this.__dataHost||null;this.__dataTemp={};this.__dataClientsInitialized=false;}/**
       * Overrides `PropertyAccessors` implementation to provide a
       * more efficient implementation of initializing properties from
       * the prototype on the instance.
       *
       * @override
       * @param {Object} props Properties to initialize on the prototype
       * @return {void}
       */_initializeProtoProperties(props){this.__data=Object.create(props);this.__dataPending=Object.create(props);this.__dataOld={};}/**
       * Overrides `PropertyAccessors` implementation to avoid setting
       * `_setProperty`'s `shouldNotify: true`.
       *
       * @override
       * @param {Object} props Properties to initialize on the instance
       * @return {void}
       */_initializeInstanceProperties(props){let readOnly=this[TYPES.READ_ONLY];for(let prop in props){if(!readOnly||!readOnly[prop]){this.__dataPending=this.__dataPending||{};this.__dataOld=this.__dataOld||{};this.__data[prop]=this.__dataPending[prop]=props[prop];}}}// Prototype setup ----------------------------------------
/**
     * Equivalent to static `addPropertyEffect` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @param {string} property Property that should trigger the effect
     * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
     * @param {Object=} effect Effect metadata object
     * @return {void}
     * @protected
     */_addPropertyEffect(property,type,effect){this._createPropertyAccessor(property,type==TYPES.READ_ONLY);// effects are accumulated into arrays per property based on type
let effects=ensureOwnEffectMap(this,type)[property];if(!effects){effects=this[type][property]=[];}effects.push(effect);}/**
       * Removes the given property effect.
       *
       * @param {string} property Property the effect was associated with
       * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
       * @param {Object=} effect Effect metadata object to remove
       * @return {void}
       */_removePropertyEffect(property,type,effect){let effects=ensureOwnEffectMap(this,type)[property];let idx=effects.indexOf(effect);if(idx>=0){effects.splice(idx,1);}}/**
       * Returns whether the current prototype/instance has a property effect
       * of a certain type.
       *
       * @param {string} property Property name
       * @param {string=} type Effect type, from this.PROPERTY_EFFECT_TYPES
       * @return {boolean} True if the prototype/instance has an effect of this type
       * @protected
       */_hasPropertyEffect(property,type){let effects=this[type];return Boolean(effects&&effects[property]);}/**
       * Returns whether the current prototype/instance has a "read only"
       * accessor for the given property.
       *
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this type
       * @protected
       */_hasReadOnlyEffect(property){return this._hasPropertyEffect(property,TYPES.READ_ONLY);}/**
       * Returns whether the current prototype/instance has a "notify"
       * property effect for the given property.
       *
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this type
       * @protected
       */_hasNotifyEffect(property){return this._hasPropertyEffect(property,TYPES.NOTIFY);}/**
       * Returns whether the current prototype/instance has a "reflect to attribute"
       * property effect for the given property.
       *
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this type
       * @protected
       */_hasReflectEffect(property){return this._hasPropertyEffect(property,TYPES.REFLECT);}/**
       * Returns whether the current prototype/instance has a "computed"
       * property effect for the given property.
       *
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this type
       * @protected
       */_hasComputedEffect(property){return this._hasPropertyEffect(property,TYPES.COMPUTE);}// Runtime ----------------------------------------
/**
     * Sets a pending property or path.  If the root property of the path in
     * question had no accessor, the path is set, otherwise it is enqueued
     * via `_setPendingProperty`.
     *
     * This function isolates relatively expensive functionality necessary
     * for the public API (`set`, `setProperties`, `notifyPath`, and property
     * change listeners via {{...}} bindings), such that it is only done
     * when paths enter the system, and not at every propagation step.  It
     * also sets a `__dataHasPaths` flag on the instance which is used to
     * fast-path slower path-matching code in the property effects host paths.
     *
     * `path` can be a path string or array of path parts as accepted by the
     * public API.
     *
     * @param {string | !Array<number|string>} path Path to set
     * @param {*} value Value to set
     * @param {boolean=} shouldNotify Set to true if this change should
     *  cause a property notification event dispatch
     * @param {boolean=} isPathNotification If the path being set is a path
     *   notification of an already changed value, as opposed to a request
     *   to set and notify the change.  In the latter `false` case, a dirty
     *   check is performed and then the value is set to the path before
     *   enqueuing the pending property change.
     * @return {boolean} Returns true if the property/path was enqueued in
     *   the pending changes bag.
     * @protected
     */_setPendingPropertyOrPath(path,value,shouldNotify,isPathNotification){if(isPathNotification||root(Array.isArray(path)?path[0]:path)!==path){// Dirty check changes being set to a path against the actual object,
// since this is the entry point for paths into the system; from here
// the only dirty checks are against the `__dataTemp` cache to prevent
// duplicate work in the same turn only. Note, if this was a notification
// of a change already set to a path (isPathNotification: true),
// we always let the change through and skip the `set` since it was
// already dirty checked at the point of entry and the underlying
// object has already been updated
if(!isPathNotification){let old=get(this,path);path=/** @type {string} */set(this,path,value);// Use property-accessor's simpler dirty check
if(!path||!super._shouldPropertyChange(path,value,old)){return false;}}this.__dataHasPaths=true;if(this._setPendingProperty(/**@type{string}*/path,value,shouldNotify)){computeLinkedPaths(this,path,value);return true;}}else{if(this.__dataHasAccessor&&this.__dataHasAccessor[path]){return this._setPendingProperty(/**@type{string}*/path,value,shouldNotify);}else{this[path]=value;}}return false;}/**
       * Applies a value to a non-Polymer element/node's property.
       *
       * The implementation makes a best-effort at binding interop:
       * Some native element properties have side-effects when
       * re-setting the same value (e.g. setting `<input>.value` resets the
       * cursor position), so we do a dirty-check before setting the value.
       * However, for better interop with non-Polymer custom elements that
       * accept objects, we explicitly re-set object changes coming from the
       * Polymer world (which may include deep object changes without the
       * top reference changing), erring on the side of providing more
       * information.
       *
       * Users may override this method to provide alternate approaches.
       *
       * @param {!Node} node The node to set a property on
       * @param {string} prop The property to set
       * @param {*} value The value to set
       * @return {void}
       * @protected
       */_setUnmanagedPropertyToNode(node,prop,value){// It is a judgment call that resetting primitives is
// "bad" and resettings objects is also "good"; alternatively we could
// implement a whitelist of tag & property values that should never
// be reset (e.g. <input>.value && <select>.value)
if(value!==node[prop]||typeof value=='object'){node[prop]=value;}}/**
       * Overrides the `PropertiesChanged` implementation to introduce special
       * dirty check logic depending on the property & value being set:
       *
       * 1. Any value set to a path (e.g. 'obj.prop': 42 or 'obj.prop': {...})
       *    Stored in `__dataTemp`, dirty checked against `__dataTemp`
       * 2. Object set to simple property (e.g. 'prop': {...})
       *    Stored in `__dataTemp` and `__data`, dirty checked against
       *    `__dataTemp` by default implementation of `_shouldPropertyChange`
       * 3. Primitive value set to simple property (e.g. 'prop': 42)
       *    Stored in `__data`, dirty checked against `__data`
       *
       * The dirty-check is important to prevent cycles due to two-way
       * notification, but paths and objects are only dirty checked against any
       * previous value set during this turn via a "temporary cache" that is
       * cleared when the last `_propertiesChanged` exits. This is so:
       * a. any cached array paths (e.g. 'array.3.prop') may be invalidated
       *    due to array mutations like shift/unshift/splice; this is fine
       *    since path changes are dirty-checked at user entry points like `set`
       * b. dirty-checking for objects only lasts one turn to allow the user
       *    to mutate the object in-place and re-set it with the same identity
       *    and have all sub-properties re-propagated in a subsequent turn.
       *
       * The temp cache is not necessarily sufficient to prevent invalid array
       * paths, since a splice can happen during the same turn (with pathological
       * user code); we could introduce a "fixup" for temporarily cached array
       * paths if needed: https://github.com/Polymer/polymer/issues/4227
       *
       * @override
       * @param {string} property Name of the property
       * @param {*} value Value to set
       * @param {boolean=} shouldNotify True if property should fire notification
       *   event (applies only for `notify: true` properties)
       * @return {boolean} Returns true if the property changed
       */_setPendingProperty(property,value,shouldNotify){let propIsPath=this.__dataHasPaths&&isPath(property);let prevProps=propIsPath?this.__dataTemp:this.__data;if(this._shouldPropertyChange(property,value,prevProps[property])){if(!this.__dataPending){this.__dataPending={};this.__dataOld={};}// Ensure old is captured from the last turn
if(!(property in this.__dataOld)){this.__dataOld[property]=this.__data[property];}// Paths are stored in temporary cache (cleared at end of turn),
// which is used for dirty-checking, all others stored in __data
if(propIsPath){this.__dataTemp[property]=value;}else{this.__data[property]=value;}// All changes go into pending property bag, passed to _propertiesChanged
this.__dataPending[property]=value;// Track properties that should notify separately
if(propIsPath||this[TYPES.NOTIFY]&&this[TYPES.NOTIFY][property]){this.__dataToNotify=this.__dataToNotify||{};this.__dataToNotify[property]=shouldNotify;}return true;}return false;}/**
       * Overrides base implementation to ensure all accessors set `shouldNotify`
       * to true, for per-property notification tracking.
       *
       * @override
       * @param {string} property Name of the property
       * @param {*} value Value to set
       * @return {void}
       */_setProperty(property,value){if(this._setPendingProperty(property,value,true)){this._invalidateProperties();}}/**
       * Overrides `PropertyAccessor`'s default async queuing of
       * `_propertiesChanged`: if `__dataReady` is false (has not yet been
       * manually flushed), the function no-ops; otherwise flushes
       * `_propertiesChanged` synchronously.
       *
       * @override
       * @return {void}
       */_invalidateProperties(){if(this.__dataReady){this._flushProperties();}}/**
       * Enqueues the given client on a list of pending clients, whose
       * pending property changes can later be flushed via a call to
       * `_flushClients`.
       *
       * @param {Object} client PropertyEffects client to enqueue
       * @return {void}
       * @protected
       */_enqueueClient(client){this.__dataPendingClients=this.__dataPendingClients||[];if(client!==this){this.__dataPendingClients.push(client);}}/**
       * Overrides superclass implementation.
       *
       * @return {void}
       * @protected
       */_flushProperties(){this.__dataCounter++;super._flushProperties();this.__dataCounter--;}/**
       * Flushes any clients previously enqueued via `_enqueueClient`, causing
       * their `_flushProperties` method to run.
       *
       * @return {void}
       * @protected
       */_flushClients(){if(!this.__dataClientsReady){this.__dataClientsReady=true;this._readyClients();// Override point where accessors are turned on; importantly,
// this is after clients have fully readied, providing a guarantee
// that any property effects occur only after all clients are ready.
this.__dataReady=true;}else{this.__enableOrFlushClients();}}// NOTE: We ensure clients either enable or flush as appropriate. This
// handles two corner cases:
// (1) clients flush properly when connected/enabled before the host
// enables; e.g.
//   (a) Templatize stamps with no properties and does not flush and
//   (b) the instance is inserted into dom and
//   (c) then the instance flushes.
// (2) clients enable properly when not connected/enabled when the host
// flushes; e.g.
//   (a) a template is runtime stamped and not yet connected/enabled
//   (b) a host sets a property, causing stamped dom to flush
//   (c) the stamped dom enables.
__enableOrFlushClients(){let clients=this.__dataPendingClients;if(clients){this.__dataPendingClients=null;for(let i=0;i<clients.length;i++){let client=clients[i];if(!client.__dataEnabled){client._enableProperties();}else if(client.__dataPending){client._flushProperties();}}}}/**
       * Perform any initial setup on client dom. Called before the first
       * `_flushProperties` call on client dom and before any element
       * observers are called.
       *
       * @return {void}
       * @protected
       */_readyClients(){this.__enableOrFlushClients();}/**
       * Sets a bag of property changes to this instance, and
       * synchronously processes all effects of the properties as a batch.
       *
       * Property names must be simple properties, not paths.  Batched
       * path propagation is not supported.
       *
       * @param {Object} props Bag of one or more key-value pairs whose key is
       *   a property and value is the new value to set for that property.
       * @param {boolean=} setReadOnly When true, any private values set in
       *   `props` will be set. By default, `setProperties` will not set
       *   `readOnly: true` root properties.
       * @return {void}
       * @public
       */setProperties(props,setReadOnly){for(let path in props){if(setReadOnly||!this[TYPES.READ_ONLY]||!this[TYPES.READ_ONLY][path]){//TODO(kschaaf): explicitly disallow paths in setProperty?
// wildcard observers currently only pass the first changed path
// in the `info` object, and you could do some odd things batching
// paths, e.g. {'foo.bar': {...}, 'foo': null}
this._setPendingPropertyOrPath(path,props[path],true);}}this._invalidateProperties();}/**
       * Overrides `PropertyAccessors` so that property accessor
       * side effects are not enabled until after client dom is fully ready.
       * Also calls `_flushClients` callback to ensure client dom is enabled
       * that was not enabled as a result of flushing properties.
       *
       * @override
       * @return {void}
       */ready(){// It is important that `super.ready()` is not called here as it
// immediately turns on accessors. Instead, we wait until `readyClients`
// to enable accessors to provide a guarantee that clients are ready
// before processing any accessors side effects.
this._flushProperties();// If no data was pending, `_flushProperties` will not `flushClients`
// so ensure this is done.
if(!this.__dataClientsReady){this._flushClients();}// Before ready, client notifications do not trigger _flushProperties.
// Therefore a flush is necessary here if data has been set.
if(this.__dataPending){this._flushProperties();}}/**
       * Implements `PropertyAccessors`'s properties changed callback.
       *
       * Runs each class of effects for the batch of changed properties in
       * a specific order (compute, propagate, reflect, observe, notify).
       *
       * @param {!Object} currentProps Bag of all current accessor values
       * @param {?Object} changedProps Bag of properties changed since the last
       *   call to `_propertiesChanged`
       * @param {?Object} oldProps Bag of previous values for each property
       *   in `changedProps`
       * @return {void}
       */_propertiesChanged(currentProps,changedProps,oldProps){// ----------------------------
// let c = Object.getOwnPropertyNames(changedProps || {});
// window.debug && console.group(this.localName + '#' + this.id + ': ' + c);
// if (window.debug) { debugger; }
// ----------------------------
let hasPaths=this.__dataHasPaths;this.__dataHasPaths=false;// Compute properties
runComputedEffects(this,changedProps,oldProps,hasPaths);// Clear notify properties prior to possible reentry (propagate, observe),
// but after computing effects have a chance to add to them
let notifyProps=this.__dataToNotify;this.__dataToNotify=null;// Propagate properties to clients
this._propagatePropertyChanges(changedProps,oldProps,hasPaths);// Flush clients
this._flushClients();// Reflect properties
runEffects(this,this[TYPES.REFLECT],changedProps,oldProps,hasPaths);// Observe properties
runEffects(this,this[TYPES.OBSERVE],changedProps,oldProps,hasPaths);// Notify properties to host
if(notifyProps){runNotifyEffects(this,notifyProps,changedProps,oldProps,hasPaths);}// Clear temporary cache at end of turn
if(this.__dataCounter==1){this.__dataTemp={};}// ----------------------------
// window.debug && console.groupEnd(this.localName + '#' + this.id + ': ' + c);
// ----------------------------
}/**
       * Called to propagate any property changes to stamped template nodes
       * managed by this element.
       *
       * @param {Object} changedProps Bag of changed properties
       * @param {Object} oldProps Bag of previous values for changed properties
       * @param {boolean} hasPaths True with `props` contains one or more paths
       * @return {void}
       * @protected
       */_propagatePropertyChanges(changedProps,oldProps,hasPaths){if(this[TYPES.PROPAGATE]){runEffects(this,this[TYPES.PROPAGATE],changedProps,oldProps,hasPaths);}let templateInfo=this.__templateInfo;while(templateInfo){runEffects(this,templateInfo.propertyEffects,changedProps,oldProps,hasPaths,templateInfo.nodeList);templateInfo=templateInfo.nextTemplateInfo;}}/**
       * Aliases one data path as another, such that path notifications from one
       * are routed to the other.
       *
       * @param {string | !Array<string|number>} to Target path to link.
       * @param {string | !Array<string|number>} from Source path to link.
       * @return {void}
       * @public
       */linkPaths(to,from){to=normalize(to);from=normalize(from);this.__dataLinkedPaths=this.__dataLinkedPaths||{};this.__dataLinkedPaths[to]=from;}/**
       * Removes a data path alias previously established with `_linkPaths`.
       *
       * Note, the path to unlink should be the target (`to`) used when
       * linking the paths.
       *
       * @param {string | !Array<string|number>} path Target path to unlink.
       * @return {void}
       * @public
       */unlinkPaths(path){path=normalize(path);if(this.__dataLinkedPaths){delete this.__dataLinkedPaths[path];}}/**
       * Notify that an array has changed.
       *
       * Example:
       *
       *     this.items = [ {name: 'Jim'}, {name: 'Todd'}, {name: 'Bill'} ];
       *     ...
       *     this.items.splice(1, 1, {name: 'Sam'});
       *     this.items.push({name: 'Bob'});
       *     this.notifySplices('items', [
       *       { index: 1, removed: [{name: 'Todd'}], addedCount: 1, object: this.items, type: 'splice' },
       *       { index: 3, removed: [], addedCount: 1, object: this.items, type: 'splice'}
       *     ]);
       *
       * @param {string} path Path that should be notified.
       * @param {Array} splices Array of splice records indicating ordered
       *   changes that occurred to the array. Each record should have the
       *   following fields:
       *    * index: index at which the change occurred
       *    * removed: array of items that were removed from this index
       *    * addedCount: number of new items added at this index
       *    * object: a reference to the array in question
       *    * type: the string literal 'splice'
       *
       *   Note that splice records _must_ be normalized such that they are
       *   reported in index order (raw results from `Object.observe` are not
       *   ordered and must be normalized/merged before notifying).
       * @return {void}
       * @public
      */notifySplices(path,splices){let info={path:''};let array=/** @type {Array} */get(this,path,info);notifySplices(this,array,info.path,splices);}/**
       * Convenience method for reading a value from a path.
       *
       * Note, if any part in the path is undefined, this method returns
       * `undefined` (this method does not throw when dereferencing undefined
       * paths).
       *
       * @param {(string|!Array<(string|number)>)} path Path to the value
       *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
       *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
       *   bracketed expressions are not supported; string-based path parts
       *   *must* be separated by dots.  Note that when dereferencing array
       *   indices, the index may be used as a dotted part directly
       *   (e.g. `users.12.name` or `['users', 12, 'name']`).
       * @param {Object=} root Root object from which the path is evaluated.
       * @return {*} Value at the path, or `undefined` if any part of the path
       *   is undefined.
       * @public
       */get(path,root$$1){return get(root$$1||this,path);}/**
       * Convenience method for setting a value to a path and notifying any
       * elements bound to the same path.
       *
       * Note, if any part in the path except for the last is undefined,
       * this method does nothing (this method does not throw when
       * dereferencing undefined paths).
       *
       * @param {(string|!Array<(string|number)>)} path Path to the value
       *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
       *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
       *   bracketed expressions are not supported; string-based path parts
       *   *must* be separated by dots.  Note that when dereferencing array
       *   indices, the index may be used as a dotted part directly
       *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
       * @param {*} value Value to set at the specified path.
       * @param {Object=} root Root object from which the path is evaluated.
       *   When specified, no notification will occur.
       * @return {void}
       * @public
      */set(path,value,root$$1){if(root$$1){set(root$$1,path,value);}else{if(!this[TYPES.READ_ONLY]||!this[TYPES.READ_ONLY][/** @type {string} */path]){if(this._setPendingPropertyOrPath(path,value,true)){this._invalidateProperties();}}}}/**
       * Adds items onto the end of the array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.push`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @param {string | !Array<string|number>} path Path to array.
       * @param {...*} items Items to push onto array
       * @return {number} New length of the array.
       * @public
       */push(path,...items){let info={path:''};let array=/** @type {Array}*/get(this,path,info);let len=array.length;let ret=array.push(...items);if(items.length){notifySplice(this,array,info.path,len,items.length,[]);}return ret;}/**
       * Removes an item from the end of array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.pop`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @param {string | !Array<string|number>} path Path to array.
       * @return {*} Item that was removed.
       * @public
       */pop(path){let info={path:''};let array=/** @type {Array} */get(this,path,info);let hadLength=Boolean(array.length);let ret=array.pop();if(hadLength){notifySplice(this,array,info.path,array.length,0,[ret]);}return ret;}/**
       * Starting from the start index specified, removes 0 or more items
       * from the array and inserts 0 or more new items in their place.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.splice`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @param {string | !Array<string|number>} path Path to array.
       * @param {number} start Index from which to start removing/inserting.
       * @param {number=} deleteCount Number of items to remove.
       * @param {...*} items Items to insert into array.
       * @return {Array} Array of removed items.
       * @public
       */splice(path,start,deleteCount,...items){let info={path:''};let array=/** @type {Array} */get(this,path,info);// Normalize fancy native splice handling of crazy start values
if(start<0){start=array.length-Math.floor(-start);}else if(start){start=Math.floor(start);}// array.splice does different things based on the number of arguments
// you pass in. Therefore, array.splice(0) and array.splice(0, undefined)
// do different things. In the former, the whole array is cleared. In the
// latter, no items are removed.
// This means that we need to detect whether 1. one of the arguments
// is actually passed in and then 2. determine how many arguments
// we should pass on to the native array.splice
//
let ret;// Omit any additional arguments if they were not passed in
if(arguments.length===2){ret=array.splice(start);// Either start was undefined and the others were defined, but in this
// case we can safely pass on all arguments
//
// Note: this includes the case where none of the arguments were passed in,
// e.g. this.splice('array'). However, if both start and deleteCount
// are undefined, array.splice will not modify the array (as expected)
}else{ret=array.splice(start,deleteCount,...items);}// At the end, check whether any items were passed in (e.g. insertions)
// or if the return array contains items (e.g. deletions).
// Only notify if items were added or deleted.
if(items.length||ret.length){notifySplice(this,array,info.path,start,items.length,ret);}return ret;}/**
       * Removes an item from the beginning of array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.pop`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @param {string | !Array<string|number>} path Path to array.
       * @return {*} Item that was removed.
       * @public
       */shift(path){let info={path:''};let array=/** @type {Array} */get(this,path,info);let hadLength=Boolean(array.length);let ret=array.shift();if(hadLength){notifySplice(this,array,info.path,0,0,[ret]);}return ret;}/**
       * Adds items onto the beginning of the array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.push`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @param {string | !Array<string|number>} path Path to array.
       * @param {...*} items Items to insert info array
       * @return {number} New length of the array.
       * @public
       */unshift(path,...items){let info={path:''};let array=/** @type {Array} */get(this,path,info);let ret=array.unshift(...items);if(items.length){notifySplice(this,array,info.path,0,items.length,[]);}return ret;}/**
       * Notify that a path has changed.
       *
       * Example:
       *
       *     this.item.user.name = 'Bob';
       *     this.notifyPath('item.user.name');
       *
       * @param {string} path Path that should be notified.
       * @param {*=} value Value at the path (optional).
       * @return {void}
       * @public
      */notifyPath(path,value){/** @type {string} */let propPath;if(arguments.length==1){// Get value if not supplied
let info={path:''};value=get(this,path,info);propPath=info.path;}else if(Array.isArray(path)){// Normalize path if needed
propPath=normalize(path);}else{propPath=/** @type{string} */path;}if(this._setPendingPropertyOrPath(propPath,value,true,true)){this._invalidateProperties();}}/**
       * Equivalent to static `createReadOnlyProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @param {string} property Property name
       * @param {boolean=} protectedSetter Creates a custom protected setter
       *   when `true`.
       * @return {void}
       * @protected
       */_createReadOnlyProperty(property,protectedSetter){this._addPropertyEffect(property,TYPES.READ_ONLY);if(protectedSetter){this['_set'+upper(property)]=/** @this {PropertyEffects} */function(value){this._setProperty(property,value);};}}/**
       * Equivalent to static `createPropertyObserver` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @param {string} property Property name
       * @param {string|function(*,*)} method Function or name of observer method to call
       * @param {boolean=} dynamicFn Whether the method name should be included as
       *   a dependency to the effect.
       * @return {void}
       * @protected
       */_createPropertyObserver(property,method,dynamicFn){let info={property,method,dynamicFn:Boolean(dynamicFn)};this._addPropertyEffect(property,TYPES.OBSERVE,{fn:runObserverEffect,info,trigger:{name:property}});if(dynamicFn){this._addPropertyEffect(/** @type {string} */method,TYPES.OBSERVE,{fn:runObserverEffect,info,trigger:{name:method}});}}/**
       * Equivalent to static `createMethodObserver` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating
       *   whether method names should be included as a dependency to the effect.
       * @return {void}
       * @protected
       */_createMethodObserver(expression,dynamicFn){let sig=parseMethod(expression);if(!sig){throw new Error("Malformed observer expression '"+expression+"'");}createMethodEffect(this,sig,TYPES.OBSERVE,runMethodEffect,null,dynamicFn);}/**
       * Equivalent to static `createNotifyingProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @param {string} property Property name
       * @return {void}
       * @protected
       */_createNotifyingProperty(property){this._addPropertyEffect(property,TYPES.NOTIFY,{fn:runNotifyEffect,info:{eventName:camelToDashCase(property)+'-changed',property:property}});}/**
       * Equivalent to static `createReflectedProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @param {string} property Property name
       * @return {void}
       * @protected
       */_createReflectedProperty(property){let attr=this.constructor.attributeNameForProperty(property);if(attr[0]==='-'){console.warn('Property '+property+' cannot be reflected to attribute '+attr+' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.');}else{this._addPropertyEffect(property,TYPES.REFLECT,{fn:runReflectEffect,info:{attrName:attr}});}}/**
       * Equivalent to static `createComputedProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @param {string} property Name of computed property to set
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating
       *   whether method names should be included as a dependency to the effect.
       * @return {void}
       * @protected
       */_createComputedProperty(property,expression,dynamicFn){let sig=parseMethod(expression);if(!sig){throw new Error("Malformed computed expression '"+expression+"'");}createMethodEffect(this,sig,TYPES.COMPUTE,runComputedEffect,property,dynamicFn);}/**
       * Gather the argument values for a method specified in the provided array
       * of argument metadata.
       *
       * The `path` and `value` arguments are used to fill in wildcard descriptor
       * when the method is being called as a result of a path notification.
       *
       * @param {!Array<!MethodArg>} args Array of argument metadata
       * @param {string} path Property/path name that triggered the method effect
       * @param {Object} props Bag of current property changes
       * @return {Array<*>} Array of argument values
       * @private
       */_marshalArgs(args,path,props){const data=this.__data;let values=[];for(let i=0,l=args.length;i<l;i++){let arg=args[i];let name=arg.name;let v;if(arg.literal){v=arg.value;}else{if(arg.structured){v=get(data,name);// when data is not stored e.g. `splices`
if(v===undefined){v=props[name];}}else{v=data[name];}}if(arg.wildcard){// Only send the actual path changed info if the change that
// caused the observer to run matched the wildcard
let baseChanged=name.indexOf(path+'.')===0;let matches$$1=path.indexOf(name)===0&&!baseChanged;values[i]={path:matches$$1?path:name,value:matches$$1?props[path]:v,base:v};}else{values[i]=v;}}return values;}// -- static class methods ------------
/**
     * Ensures an accessor exists for the specified property, and adds
     * to a list of "property effects" that will run when the accessor for
     * the specified property is set.  Effects are grouped by "type", which
     * roughly corresponds to a phase in effect processing.  The effect
     * metadata should be in the following form:
     *
     *     {
     *       fn: effectFunction, // Reference to function to call to perform effect
     *       info: { ... }       // Effect metadata passed to function
     *       trigger: {          // Optional triggering metadata; if not provided
     *         name: string      // the property is treated as a wildcard
     *         structured: boolean
     *         wildcard: boolean
     *       }
     *     }
     *
     * Effects are called from `_propertiesChanged` in the following order by
     * type:
     *
     * 1. COMPUTE
     * 2. PROPAGATE
     * 3. REFLECT
     * 4. OBSERVE
     * 5. NOTIFY
     *
     * Effect functions are called with the following signature:
     *
     *     effectFunction(inst, path, props, oldProps, info, hasPaths)
     *
     * @param {string} property Property that should trigger the effect
     * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
     * @param {Object=} effect Effect metadata object
     * @return {void}
     * @protected
     */static addPropertyEffect(property,type,effect){this.prototype._addPropertyEffect(property,type,effect);}/**
       * Creates a single-property observer for the given property.
       *
       * @param {string} property Property name
       * @param {string|function(*,*)} method Function or name of observer method to call
       * @param {boolean=} dynamicFn Whether the method name should be included as
       *   a dependency to the effect.
       * @return {void}
       * @protected
       */static createPropertyObserver(property,method,dynamicFn){this.prototype._createPropertyObserver(property,method,dynamicFn);}/**
       * Creates a multi-property "method observer" based on the provided
       * expression, which should be a string in the form of a normal JavaScript
       * function signature: `'methodName(arg1, [..., argn])'`.  Each argument
       * should correspond to a property or path in the context of this
       * prototype (or instance), or may be a literal string or number.
       *
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating
       * @return {void}
       *   whether method names should be included as a dependency to the effect.
       * @protected
       */static createMethodObserver(expression,dynamicFn){this.prototype._createMethodObserver(expression,dynamicFn);}/**
       * Causes the setter for the given property to dispatch `<property>-changed`
       * events to notify of changes to the property.
       *
       * @param {string} property Property name
       * @return {void}
       * @protected
       */static createNotifyingProperty(property){this.prototype._createNotifyingProperty(property);}/**
       * Creates a read-only accessor for the given property.
       *
       * To set the property, use the protected `_setProperty` API.
       * To create a custom protected setter (e.g. `_setMyProp()` for
       * property `myProp`), pass `true` for `protectedSetter`.
       *
       * Note, if the property will have other property effects, this method
       * should be called first, before adding other effects.
       *
       * @param {string} property Property name
       * @param {boolean=} protectedSetter Creates a custom protected setter
       *   when `true`.
       * @return {void}
       * @protected
       */static createReadOnlyProperty(property,protectedSetter){this.prototype._createReadOnlyProperty(property,protectedSetter);}/**
       * Causes the setter for the given property to reflect the property value
       * to a (dash-cased) attribute of the same name.
       *
       * @param {string} property Property name
       * @return {void}
       * @protected
       */static createReflectedProperty(property){this.prototype._createReflectedProperty(property);}/**
       * Creates a computed property whose value is set to the result of the
       * method described by the given `expression` each time one or more
       * arguments to the method changes.  The expression should be a string
       * in the form of a normal JavaScript function signature:
       * `'methodName(arg1, [..., argn])'`
       *
       * @param {string} property Name of computed property to set
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
       *   method names should be included as a dependency to the effect.
       * @return {void}
       * @protected
       */static createComputedProperty(property,expression,dynamicFn){this.prototype._createComputedProperty(property,expression,dynamicFn);}/**
       * Parses the provided template to ensure binding effects are created
       * for them, and then ensures property accessors are created for any
       * dependent properties in the template.  Binding effects for bound
       * templates are stored in a linked list on the instance so that
       * templates can be efficiently stamped and unstamped.
       *
       * @param {!HTMLTemplateElement} template Template containing binding
       *   bindings
       * @return {!TemplateInfo} Template metadata object
       * @protected
       */static bindTemplate(template){return this.prototype._bindTemplate(template);}// -- binding ----------------------------------------------
/**
     * Equivalent to static `bindTemplate` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * This method may be called on the prototype (for prototypical template
     * binding, to avoid creating accessors every instance) once per prototype,
     * and will be called with `runtimeBinding: true` by `_stampTemplate` to
     * create and link an instance of the template metadata associated with a
     * particular stamping.
     *
     * @param {!HTMLTemplateElement} template Template containing binding
     *   bindings
     * @param {boolean=} instanceBinding When false (default), performs
     *   "prototypical" binding of the template and overwrites any previously
     *   bound template for the class. When true (as passed from
     *   `_stampTemplate`), the template info is instanced and linked into
     *   the list of bound templates.
     * @return {!TemplateInfo} Template metadata object; for `runtimeBinding`,
     *   this is an instance of the prototypical template info
     * @protected
     */_bindTemplate(template,instanceBinding){let templateInfo=this.constructor._parseTemplate(template);let wasPreBound=this.__templateInfo==templateInfo;// Optimization: since this is called twice for proto-bound templates,
// don't attempt to recreate accessors if this template was pre-bound
if(!wasPreBound){for(let prop in templateInfo.propertyEffects){this._createPropertyAccessor(prop);}}if(instanceBinding){// For instance-time binding, create instance of template metadata
// and link into list of templates if necessary
templateInfo=/** @type {!TemplateInfo} */Object.create(templateInfo);templateInfo.wasPreBound=wasPreBound;if(!wasPreBound&&this.__templateInfo){let last=this.__templateInfoLast||this.__templateInfo;this.__templateInfoLast=last.nextTemplateInfo=templateInfo;templateInfo.previousTemplateInfo=last;return templateInfo;}}return this.__templateInfo=templateInfo;}/**
       * Adds a property effect to the given template metadata, which is run
       * at the "propagate" stage of `_propertiesChanged` when the template
       * has been bound to the element via `_bindTemplate`.
       *
       * The `effect` object should match the format in `_addPropertyEffect`.
       *
       * @param {Object} templateInfo Template metadata to add effect to
       * @param {string} prop Property that should trigger the effect
       * @param {Object=} effect Effect metadata object
       * @return {void}
       * @protected
       */static _addTemplatePropertyEffect(templateInfo,prop,effect){let hostProps=templateInfo.hostProps=templateInfo.hostProps||{};hostProps[prop]=true;let effects=templateInfo.propertyEffects=templateInfo.propertyEffects||{};let propEffects=effects[prop]=effects[prop]||[];propEffects.push(effect);}/**
       * Stamps the provided template and performs instance-time setup for
       * Polymer template features, including data bindings, declarative event
       * listeners, and the `this.$` map of `id`'s to nodes.  A document fragment
       * is returned containing the stamped DOM, ready for insertion into the
       * DOM.
       *
       * This method may be called more than once; however note that due to
       * `shadycss` polyfill limitations, only styles from templates prepared
       * using `ShadyCSS.prepareTemplate` will be correctly polyfilled (scoped
       * to the shadow root and support CSS custom properties), and note that
       * `ShadyCSS.prepareTemplate` may only be called once per element. As such,
       * any styles required by in runtime-stamped templates must be included
       * in the main element template.
       *
       * @param {!HTMLTemplateElement} template Template to stamp
       * @return {!StampedTemplate} Cloned template content
       * @override
       * @protected
       */_stampTemplate(template){// Ensures that created dom is `_enqueueClient`'d to this element so
// that it can be flushed on next call to `_flushProperties`
hostStack.beginHosting(this);let dom=super._stampTemplate(template);hostStack.endHosting(this);let templateInfo=/** @type {!TemplateInfo} */this._bindTemplate(template,true);// Add template-instance-specific data to instanced templateInfo
templateInfo.nodeList=dom.nodeList;// Capture child nodes to allow unstamping of non-prototypical templates
if(!templateInfo.wasPreBound){let nodes=templateInfo.childNodes=[];for(let n=dom.firstChild;n;n=n.nextSibling){nodes.push(n);}}dom.templateInfo=templateInfo;// Setup compound storage, 2-way listeners, and dataHost for bindings
setupBindings(this,templateInfo);// Flush properties into template nodes if already booted
if(this.__dataReady){runEffects(this,templateInfo.propertyEffects,this.__data,null,false,templateInfo.nodeList);}return dom;}/**
       * Removes and unbinds the nodes previously contained in the provided
       * DocumentFragment returned from `_stampTemplate`.
       *
       * @param {!StampedTemplate} dom DocumentFragment previously returned
       *   from `_stampTemplate` associated with the nodes to be removed
       * @return {void}
       * @protected
       */_removeBoundDom(dom){// Unlink template info
let templateInfo=dom.templateInfo;if(templateInfo.previousTemplateInfo){templateInfo.previousTemplateInfo.nextTemplateInfo=templateInfo.nextTemplateInfo;}if(templateInfo.nextTemplateInfo){templateInfo.nextTemplateInfo.previousTemplateInfo=templateInfo.previousTemplateInfo;}if(this.__templateInfoLast==templateInfo){this.__templateInfoLast=templateInfo.previousTemplateInfo;}templateInfo.previousTemplateInfo=templateInfo.nextTemplateInfo=null;// Remove stamped nodes
let nodes=templateInfo.childNodes;for(let i=0;i<nodes.length;i++){let node=nodes[i];node.parentNode.removeChild(node);}}/**
       * Overrides default `TemplateStamp` implementation to add support for
       * parsing bindings from `TextNode`'s' `textContent`.  A `bindings`
       * array is added to `nodeInfo` and populated with binding metadata
       * with information capturing the binding target, and a `parts` array
       * with one or more metadata objects capturing the source(s) of the
       * binding.
       *
       * @override
       * @param {Node} node Node to parse
       * @param {TemplateInfo} templateInfo Template metadata for current template
       * @param {NodeInfo} nodeInfo Node metadata for current template node
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       */static _parseTemplateNode(node,templateInfo,nodeInfo){let noted=super._parseTemplateNode(node,templateInfo,nodeInfo);if(node.nodeType===Node.TEXT_NODE){let parts=this._parseBindings(node.textContent,templateInfo);if(parts){// Initialize the textContent with any literal parts
// NOTE: default to a space here so the textNode remains; some browsers
// (IE) omit an empty textNode following cloneNode/importNode.
node.textContent=literalFromParts(parts)||' ';addBinding(this,templateInfo,nodeInfo,'text','textContent',parts);noted=true;}}return noted;}/**
       * Overrides default `TemplateStamp` implementation to add support for
       * parsing bindings from attributes.  A `bindings`
       * array is added to `nodeInfo` and populated with binding metadata
       * with information capturing the binding target, and a `parts` array
       * with one or more metadata objects capturing the source(s) of the
       * binding.
       *
       * @override
       * @param {Element} node Node to parse
       * @param {TemplateInfo} templateInfo Template metadata for current template
       * @param {NodeInfo} nodeInfo Node metadata for current template node
       * @param {string} name Attribute name
       * @param {string} value Attribute value
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       */static _parseTemplateNodeAttribute(node,templateInfo,nodeInfo,name,value){let parts=this._parseBindings(value,templateInfo);if(parts){// Attribute or property
let origName=name;let kind='property';// The only way we see a capital letter here is if the attr has
// a capital letter in it per spec. In this case, to make sure
// this binding works, we go ahead and make the binding to the attribute.
if(capitalAttributeRegex.test(name)){kind='attribute';}else if(name[name.length-1]=='$'){name=name.slice(0,-1);kind='attribute';}// Initialize attribute bindings with any literal parts
let literal=literalFromParts(parts);if(literal&&kind=='attribute'){node.setAttribute(name,literal);}// Clear attribute before removing, since IE won't allow removing
// `value` attribute if it previously had a value (can't
// unconditionally set '' before removing since attributes with `$`
// can't be set using setAttribute)
if(node.localName==='input'&&origName==='value'){node.setAttribute(origName,'');}// Remove annotation
node.removeAttribute(origName);// Case hackery: attributes are lower-case, but bind targets
// (properties) are case sensitive. Gambit is to map dash-case to
// camel-case: `foo-bar` becomes `fooBar`.
// Attribute bindings are excepted.
if(kind==='property'){name=dashToCamelCase(name);}addBinding(this,templateInfo,nodeInfo,kind,name,parts,literal);return true;}else{return super._parseTemplateNodeAttribute(node,templateInfo,nodeInfo,name,value);}}/**
       * Overrides default `TemplateStamp` implementation to add support for
       * binding the properties that a nested template depends on to the template
       * as `_host_<property>`.
       *
       * @override
       * @param {Node} node Node to parse
       * @param {TemplateInfo} templateInfo Template metadata for current template
       * @param {NodeInfo} nodeInfo Node metadata for current template node
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       */static _parseTemplateNestedTemplate(node,templateInfo,nodeInfo){let noted=super._parseTemplateNestedTemplate(node,templateInfo,nodeInfo);// Merge host props into outer template and add bindings
let hostProps=nodeInfo.templateInfo.hostProps;let mode='{';for(let source in hostProps){let parts=[{mode,source,dependencies:[source]}];addBinding(this,templateInfo,nodeInfo,'property','_host_'+source,parts);}return noted;}/**
       * Called to parse text in a template (either attribute values or
       * textContent) into binding metadata.
       *
       * Any overrides of this method should return an array of binding part
       * metadata  representing one or more bindings found in the provided text
       * and any "literal" text in between.  Any non-literal parts will be passed
       * to `_evaluateBinding` when any dependencies change.  The only required
       * fields of each "part" in the returned array are as follows:
       *
       * - `dependencies` - Array containing trigger metadata for each property
       *   that should trigger the binding to update
       * - `literal` - String containing text if the part represents a literal;
       *   in this case no `dependencies` are needed
       *
       * Additional metadata for use by `_evaluateBinding` may be provided in
       * each part object as needed.
       *
       * The default implementation handles the following types of bindings
       * (one or more may be intermixed with literal strings):
       * - Property binding: `[[prop]]`
       * - Path binding: `[[object.prop]]`
       * - Negated property or path bindings: `[[!prop]]` or `[[!object.prop]]`
       * - Two-way property or path bindings (supports negation):
       *   `{{prop}}`, `{{object.prop}}`, `{{!prop}}` or `{{!object.prop}}`
       * - Inline computed method (supports negation):
       *   `[[compute(a, 'literal', b)]]`, `[[!compute(a, 'literal', b)]]`
       *
       * The default implementation uses a regular expression for best
       * performance. However, the regular expression uses a white-list of
       * allowed characters in a data-binding, which causes problems for
       * data-bindings that do use characters not in this white-list.
       *
       * Instead of updating the white-list with all allowed characters,
       * there is a StrictBindingParser (see lib/mixins/strict-binding-parser)
       * that uses a state machine instead. This state machine is able to handle
       * all characters. However, it is slightly less performant, therefore we
       * extracted it into a separate optional mixin.
       *
       * @param {string} text Text to parse from attribute or textContent
       * @param {Object} templateInfo Current template metadata
       * @return {Array<!BindingPart>} Array of binding part metadata
       * @protected
       */static _parseBindings(text,templateInfo){let parts=[];let lastIndex=0;let m;// Example: "literal1{{prop}}literal2[[!compute(foo,bar)]]final"
// Regex matches:
//        Iteration 1:  Iteration 2:
// m[1]: '{{'          '[['
// m[2]: ''            '!'
// m[3]: 'prop'        'compute(foo,bar)'
while((m=bindingRegex.exec(text))!==null){// Add literal part
if(m.index>lastIndex){parts.push({literal:text.slice(lastIndex,m.index)});}// Add binding part
let mode=m[1][0];let negate=Boolean(m[2]);let source=m[3].trim();let customEvent=false,notifyEvent='',colon=-1;if(mode=='{'&&(colon=source.indexOf('::'))>0){notifyEvent=source.substring(colon+2);source=source.substring(0,colon);customEvent=true;}let signature=parseMethod(source);let dependencies=[];if(signature){// Inline computed function
let{args,methodName}=signature;for(let i=0;i<args.length;i++){let arg=args[i];if(!arg.literal){dependencies.push(arg);}}let dynamicFns=templateInfo.dynamicFns;if(dynamicFns&&dynamicFns[methodName]||signature.static){dependencies.push(methodName);signature.dynamicFn=true;}}else{// Property or path
dependencies.push(source);}parts.push({source,mode,negate,customEvent,signature,dependencies,event:notifyEvent});lastIndex=bindingRegex.lastIndex;}// Add a final literal part
if(lastIndex&&lastIndex<text.length){let literal=text.substring(lastIndex);if(literal){parts.push({literal:literal});}}if(parts.length){return parts;}else{return null;}}/**
       * Called to evaluate a previously parsed binding part based on a set of
       * one or more changed dependencies.
       *
       * @param {this} inst Element that should be used as scope for
       *   binding dependencies
       * @param {BindingPart} part Binding part metadata
       * @param {string} path Property/path that triggered this effect
       * @param {Object} props Bag of current property changes
       * @param {Object} oldProps Bag of previous values for changed properties
       * @param {boolean} hasPaths True with `props` contains one or more paths
       * @return {*} Value the binding part evaluated to
       * @protected
       */static _evaluateBinding(inst,part,path,props,oldProps,hasPaths){let value;if(part.signature){value=runMethodEffect(inst,path,props,oldProps,part.signature);}else if(path!=part.source){value=get(inst,part.source);}else{if(hasPaths&&isPath(path)){value=get(inst,path);}else{value=inst.__data[path];}}if(part.negate){value=!value;}return value;}}// make a typing for closure :P
PropertyEffectsType=PropertyEffects;return PropertyEffects;});/**
     * Helper api for enqueuing client dom created by a host element.
     *
     * By default elements are flushed via `_flushProperties` when
     * `connectedCallback` is called. Elements attach their client dom to
     * themselves at `ready` time which results from this first flush.
     * This provides an ordering guarantee that the client dom an element
     * creates is flushed before the element itself (i.e. client `ready`
     * fires before host `ready`).
     *
     * However, if `_flushProperties` is called *before* an element is connected,
     * as for example `Templatize` does, this ordering guarantee cannot be
     * satisfied because no elements are connected. (Note: Bound elements that
     * receive data do become enqueued clients and are properly ordered but
     * unbound elements are not.)
     *
     * To maintain the desired "client before host" ordering guarantee for this
     * case we rely on the "host stack. Client nodes registers themselves with
     * the creating host element when created. This ensures that all client dom
     * is readied in the proper order, maintaining the desired guarantee.
     *
     * @private
     */class HostStack{constructor(){this.stack=[];}/**
     * @param {*} inst Instance to add to hostStack
     * @return {void}
     */registerHost(inst){if(this.stack.length){let host=this.stack[this.stack.length-1];host._enqueueClient(inst);}}/**
     * @param {*} inst Instance to begin hosting
     * @return {void}
     */beginHosting(inst){this.stack.push(inst);}/**
     * @param {*} inst Instance to end hosting
     * @return {void}
     */endHosting(inst){let stackLen=this.stack.length;if(stackLen&&this.stack[stackLen-1]==inst){this.stack.pop();}}}const hostStack=new HostStack();var propertyEffects={PropertyEffects:PropertyEffects};function normalizeProperties(props){const output={};for(let p in props){const o=props[p];output[p]=typeof o==='function'?{type:o}:o;}return output;}/**
   * Mixin that provides a minimal starting point to using the PropertiesChanged
   * mixin by providing a mechanism to declare properties in a static
   * getter (e.g. static get properties() { return { foo: String } }). Changes
   * are reported via the `_propertiesChanged` method.
   *
   * This mixin provides no specific support for rendering. Users are expected
   * to create a ShadowRoot and put content into it and update it in whatever
   * way makes sense. This can be done in reaction to properties changing by
   * implementing `_propertiesChanged`.
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertiesChanged
   * @summary Mixin that provides a minimal starting point for using
   * the PropertiesChanged mixin by providing a declarative `properties` object.
   */const PropertiesMixin=dedupingMixin(superClass=>{/**
   * @constructor
   * @implements {Polymer_PropertiesChanged}
   * @private
   */const base=PropertiesChanged(superClass);/**
                                                  * Returns the super class constructor for the given class, if it is an
                                                  * instance of the PropertiesMixin.
                                                  *
                                                  * @param {!PropertiesMixinConstructor} constructor PropertiesMixin constructor
                                                  * @return {?PropertiesMixinConstructor} Super class constructor
                                                  */function superPropertiesClass(constructor){const superCtor=Object.getPrototypeOf(constructor);// Note, the `PropertiesMixin` class below only refers to the class
// generated by this call to the mixin; the instanceof test only works
// because the mixin is deduped and guaranteed only to apply once, hence
// all constructors in a proto chain will see the same `PropertiesMixin`
return superCtor.prototype instanceof PropertiesMixin?/** @type {!PropertiesMixinConstructor} */superCtor:null;}/**
     * Returns a memoized version of the `properties` object for the
     * given class. Properties not in object format are converted to at
     * least {type}.
     *
     * @param {PropertiesMixinConstructor} constructor PropertiesMixin constructor
     * @return {Object} Memoized properties object
     */function ownProperties(constructor){if(!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownProperties',constructor))){let props=null;if(constructor.hasOwnProperty(JSCompiler_renameProperty('properties',constructor))){const properties=constructor.properties;if(properties){props=normalizeProperties(properties);}}constructor.__ownProperties=props;}return constructor.__ownProperties;}/**
     * @polymer
     * @mixinClass
     * @extends {base}
     * @implements {Polymer_PropertiesMixin}
     * @unrestricted
     */class PropertiesMixin extends base{/**
     * Implements standard custom elements getter to observes the attributes
     * listed in `properties`.
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     */static get observedAttributes(){const props=this._properties;return props?Object.keys(props).map(p=>this.attributeNameForProperty(p)):[];}/**
       * Finalizes an element definition, including ensuring any super classes
       * are also finalized. This includes ensuring property
       * accessors exist on the element prototype. This method calls
       * `_finalizeClass` to finalize each constructor in the prototype chain.
       * @return {void}
       */static finalize(){if(!this.hasOwnProperty(JSCompiler_renameProperty('__finalized',this))){const superCtor=superPropertiesClass(/** @type {!PropertiesMixinConstructor} */this);if(superCtor){superCtor.finalize();}this.__finalized=true;this._finalizeClass();}}/**
       * Finalize an element class. This includes ensuring property
       * accessors exist on the element prototype. This method is called by
       * `finalize` and finalizes the class constructor.
       *
       * @protected
       */static _finalizeClass(){const props=ownProperties(/** @type {!PropertiesMixinConstructor} */this);if(props){this.createProperties(props);}}/**
       * Returns a memoized version of all properties, including those inherited
       * from super classes. Properties not in object format are converted to
       * at least {type}.
       *
       * @return {Object} Object containing properties for this class
       * @protected
       */static get _properties(){if(!this.hasOwnProperty(JSCompiler_renameProperty('__properties',this))){const superCtor=superPropertiesClass(/** @type {!PropertiesMixinConstructor} */this);this.__properties=Object.assign({},superCtor&&superCtor._properties,ownProperties(/** @type {PropertiesMixinConstructor} */this));}return this.__properties;}/**
       * Overrides `PropertiesChanged` method to return type specified in the
       * static `properties` object for the given property.
       * @param {string} name Name of property
       * @return {*} Type to which to deserialize attribute
       *
       * @protected
       */static typeForProperty(name){const info=this._properties[name];return info&&info.type;}/**
       * Overrides `PropertiesChanged` method and adds a call to
       * `finalize` which lazily configures the element's property accessors.
       * @override
       * @return {void}
       */_initializeProperties(){this.constructor.finalize();super._initializeProperties();}/**
       * Called when the element is added to a document.
       * Calls `_enableProperties` to turn on property system from
       * `PropertiesChanged`.
       * @suppress {missingProperties} Super may or may not implement the callback
       * @return {void}
       * @override
       */connectedCallback(){if(super.connectedCallback){super.connectedCallback();}this._enableProperties();}/**
       * Called when the element is removed from a document
       * @suppress {missingProperties} Super may or may not implement the callback
       * @return {void}
       * @override
       */disconnectedCallback(){if(super.disconnectedCallback){super.disconnectedCallback();}}}return PropertiesMixin;});var propertiesMixin={PropertiesMixin:PropertiesMixin};const bundledImportMeta={...import.meta,url:new URL('../../node_modules/%40polymer/polymer/lib/mixins/element-mixin.js',import.meta.url).href};const version='3.0.5';/**
                                 * Element class mixin that provides the core API for Polymer's meta-programming
                                 * features including template stamping, data-binding, attribute deserialization,
                                 * and property change observation.
                                 *
                                 * Subclassers may provide the following static getters to return metadata
                                 * used to configure Polymer's features for the class:
                                 *
                                 * - `static get is()`: When the template is provided via a `dom-module`,
                                 *   users should return the `dom-module` id from a static `is` getter.  If
                                 *   no template is needed or the template is provided directly via the
                                 *   `template` getter, there is no need to define `is` for the element.
                                 *
                                 * - `static get template()`: Users may provide the template directly (as
                                 *   opposed to via `dom-module`) by implementing a static `template` getter.
                                 *   The getter must return an `HTMLTemplateElement`.
                                 *
                                 * - `static get properties()`: Should return an object describing
                                 *   property-related metadata used by Polymer features (key: property name
                                 *   value: object containing property metadata). Valid keys in per-property
                                 *   metadata include:
                                 *   - `type` (String|Number|Object|Array|...): Used by
                                 *     `attributeChangedCallback` to determine how string-based attributes
                                 *     are deserialized to JavaScript property values.
                                 *   - `notify` (boolean): Causes a change in the property to fire a
                                 *     non-bubbling event called `<property>-changed`. Elements that have
                                 *     enabled two-way binding to the property use this event to observe changes.
                                 *   - `readOnly` (boolean): Creates a getter for the property, but no setter.
                                 *     To set a read-only property, use the private setter method
                                 *     `_setProperty(property, value)`.
                                 *   - `observer` (string): Observer method name that will be called when
                                 *     the property changes. The arguments of the method are
                                 *     `(value, previousValue)`.
                                 *   - `computed` (string): String describing method and dependent properties
                                 *     for computing the value of this property (e.g. `'computeFoo(bar, zot)'`).
                                 *     Computed properties are read-only by default and can only be changed
                                 *     via the return value of the computing method.
                                 *
                                 * - `static get observers()`: Array of strings describing multi-property
                                 *   observer methods and their dependent properties (e.g.
                                 *   `'observeABC(a, b, c)'`).
                                 *
                                 * The base class provides default implementations for the following standard
                                 * custom element lifecycle callbacks; users may override these, but should
                                 * call the super method to ensure
                                 * - `constructor`: Run when the element is created or upgraded
                                 * - `connectedCallback`: Run each time the element is connected to the
                                 *   document
                                 * - `disconnectedCallback`: Run each time the element is disconnected from
                                 *   the document
                                 * - `attributeChangedCallback`: Run each time an attribute in
                                 *   `observedAttributes` is set or removed (note: this element's default
                                 *   `observedAttributes` implementation will automatically return an array
                                 *   of dash-cased attributes based on `properties`)
                                 *
                                 * @mixinFunction
                                 * @polymer
                                 * @appliesMixin PropertyEffects
                                 * @appliesMixin PropertiesMixin
                                 * @property rootPath {string} Set to the value of `rootPath`,
                                 *   which defaults to the main document path
                                 * @property importPath {string} Set to the value of the class's static
                                 *   `importPath` property, which defaults to the path of this element's
                                 *   `dom-module` (when `is` is used), but can be overridden for other
                                 *   import strategies.
                                 * @summary Element class mixin that provides the core API for Polymer's
                                 * meta-programming features.
                                 */const ElementMixin=dedupingMixin(base=>{/**
   * @constructor
   * @extends {base}
   * @implements {Polymer_PropertyEffects}
   * @implements {Polymer_PropertiesMixin}
   * @private
   */const polymerElementBase=PropertiesMixin(PropertyEffects(base));/**
                                                                         * Returns a list of properties with default values.
                                                                         * This list is created as an optimization since it is a subset of
                                                                         * the list returned from `_properties`.
                                                                         * This list is used in `_initializeProperties` to set property defaults.
                                                                         *
                                                                         * @param {PolymerElementConstructor} constructor Element class
                                                                         * @return {PolymerElementProperties} Flattened properties for this class
                                                                         *   that have default values
                                                                         * @private
                                                                         */function propertyDefaults(constructor){if(!constructor.hasOwnProperty(JSCompiler_renameProperty('__propertyDefaults',constructor))){constructor.__propertyDefaults=null;let props=constructor._properties;for(let p in props){let info=props[p];if('value'in info){constructor.__propertyDefaults=constructor.__propertyDefaults||{};constructor.__propertyDefaults[p]=info;}}}return constructor.__propertyDefaults;}/**
     * Returns a memoized version of the `observers` array.
     * @param {PolymerElementConstructor} constructor Element class
     * @return {Array} Array containing own observers for the given class
     * @protected
     */function ownObservers(constructor){if(!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownObservers',constructor))){constructor.__ownObservers=constructor.hasOwnProperty(JSCompiler_renameProperty('observers',constructor))?/** @type {PolymerElementConstructor} */constructor.observers:null;}return constructor.__ownObservers;}/**
     * Creates effects for a property.
     *
     * Note, once a property has been set to
     * `readOnly`, `computed`, `reflectToAttribute`, or `notify`
     * these values may not be changed. For example, a subclass cannot
     * alter these settings. However, additional `observers` may be added
     * by subclasses.
     *
     * The info object should contain property metadata as follows:
     *
     * * `type`: {function} type to which an attribute matching the property
     * is deserialized. Note the property is camel-cased from a dash-cased
     * attribute. For example, 'foo-bar' attribute is deserialized to a
     * property named 'fooBar'.
     *
     * * `readOnly`: {boolean} creates a readOnly property and
     * makes a private setter for the private of the form '_setFoo' for a
     * property 'foo',
     *
     * * `computed`: {string} creates a computed property. A computed property
     * is also automatically set to `readOnly: true`. The value is calculated
     * by running a method and arguments parsed from the given string. For
     * example 'compute(foo)' will compute a given property when the
     * 'foo' property changes by executing the 'compute' method. This method
     * must return the computed value.
     *
     * * `reflectToAttribute`: {boolean} If true, the property value is reflected
     * to an attribute of the same name. Note, the attribute is dash-cased
     * so a property named 'fooBar' is reflected as 'foo-bar'.
     *
     * * `notify`: {boolean} sends a non-bubbling notification event when
     * the property changes. For example, a property named 'foo' sends an
     * event named 'foo-changed' with `event.detail` set to the value of
     * the property.
     *
     * * observer: {string} name of a method that runs when the property
     * changes. The arguments of the method are (value, previousValue).
     *
     * Note: Users may want control over modifying property
     * effects via subclassing. For example, a user might want to make a
     * reflectToAttribute property not do so in a subclass. We've chosen to
     * disable this because it leads to additional complication.
     * For example, a readOnly effect generates a special setter. If a subclass
     * disables the effect, the setter would fail unexpectedly.
     * Based on feedback, we may want to try to make effects more malleable
     * and/or provide an advanced api for manipulating them.
     * Also consider adding warnings when an effect cannot be changed.
     *
     * @param {!PolymerElement} proto Element class prototype to add accessors
     *   and effects to
     * @param {string} name Name of the property.
     * @param {Object} info Info object from which to create property effects.
     * Supported keys:
     * @param {Object} allProps Flattened map of all properties defined in this
     *   element (including inherited properties)
     * @return {void}
     * @private
     */function createPropertyFromConfig(proto,name,info,allProps){// computed forces readOnly...
if(info.computed){info.readOnly=true;}// Note, since all computed properties are readOnly, this prevents
// adding additional computed property effects (which leads to a confusing
// setup where multiple triggers for setting a property)
// While we do have `hasComputedEffect` this is set on the property's
// dependencies rather than itself.
if(info.computed&&!proto._hasReadOnlyEffect(name)){proto._createComputedProperty(name,info.computed,allProps);}if(info.readOnly&&!proto._hasReadOnlyEffect(name)){proto._createReadOnlyProperty(name,!info.computed);}if(info.reflectToAttribute&&!proto._hasReflectEffect(name)){proto._createReflectedProperty(name);}if(info.notify&&!proto._hasNotifyEffect(name)){proto._createNotifyingProperty(name);}// always add observer
if(info.observer){proto._createPropertyObserver(name,info.observer,allProps[info.observer]);}// always create the mapping from attribute back to property for deserialization.
proto._addPropertyToAttributeMap(name);}/**
     * Process all style elements in the element template. Styles with the
     * `include` attribute are processed such that any styles in
     * the associated "style modules" are included in the element template.
     * @param {PolymerElementConstructor} klass Element class
     * @param {!HTMLTemplateElement} template Template to process
     * @param {string} is Name of element
     * @param {string} baseURI Base URI for element
     * @private
     */function processElementStyles(klass,template,is,baseURI){const templateStyles=template.content.querySelectorAll('style');const stylesWithImports=stylesFromTemplate(template);// insert styles from <link rel="import" type="css"> at the top of the template
const linkedStyles=stylesFromModuleImports(is);const firstTemplateChild=template.content.firstElementChild;for(let idx=0;idx<linkedStyles.length;idx++){let s=linkedStyles[idx];s.textContent=klass._processStyleText(s.textContent,baseURI);template.content.insertBefore(s,firstTemplateChild);}// keep track of the last "concrete" style in the template we have encountered
let templateStyleIndex=0;// ensure all gathered styles are actually in this template.
for(let i=0;i<stylesWithImports.length;i++){let s=stylesWithImports[i];let templateStyle=templateStyles[templateStyleIndex];// if the style is not in this template, it's been "included" and
// we put a clone of it in the template before the style that included it
if(templateStyle!==s){s=s.cloneNode(true);templateStyle.parentNode.insertBefore(s,templateStyle);}else{templateStyleIndex++;}s.textContent=klass._processStyleText(s.textContent,baseURI);}if(window.ShadyCSS){window.ShadyCSS.prepareTemplate(template,is);}}/**
     * Look up template from dom-module for element
     *
     * @param {!string} is Element name to look up
     * @return {!HTMLTemplateElement} Template found in dom module, or
     *   undefined if not found
     * @protected
     */function getTemplateFromDomModule(is){let template=null;// Under strictTemplatePolicy in 3.x+, dom-module lookup is only allowed
// when opted-in via allowTemplateFromDomModule
if(is&&(!strictTemplatePolicy||allowTemplateFromDomModule)){template=DomModule.import(is,'template');// Under strictTemplatePolicy, require any element with an `is`
// specified to have a dom-module
if(strictTemplatePolicy&&!template){throw new Error(`strictTemplatePolicy: expecting dom-module or null template for ${is}`);}}return template;}/**
     * @polymer
     * @mixinClass
     * @unrestricted
     * @implements {Polymer_ElementMixin}
     */class PolymerElement extends polymerElementBase{/**
     * Current Polymer version in Semver notation.
     * @type {string} Semver notation of the current version of Polymer.
     */static get polymerElementVersion(){return version;}/**
       * Override of PropertiesMixin _finalizeClass to create observers and
       * find the template.
       * @return {void}
       * @protected
       * @override
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       */static _finalizeClass(){super._finalizeClass();if(this.hasOwnProperty(JSCompiler_renameProperty('is',this))&&this.is){register(this.prototype);}const observers=ownObservers(this);if(observers){this.createObservers(observers,this._properties);}// note: create "working" template that is finalized at instance time
let template=/** @type {PolymerElementConstructor} */this.template;if(template){if(typeof template==='string'){console.error('template getter must return HTMLTemplateElement');template=null;}else{template=template.cloneNode(true);}}this.prototype._template=template;}/**
       * Override of PropertiesChanged createProperties to create accessors
       * and property effects for all of the properties.
       * @return {void}
       * @protected
       * @override
       */static createProperties(props){for(let p in props){createPropertyFromConfig(this.prototype,p,props[p],props);}}/**
       * Creates observers for the given `observers` array.
       * Leverages `PropertyEffects` to create observers.
       * @param {Object} observers Array of observer descriptors for
       *   this class
       * @param {Object} dynamicFns Object containing keys for any properties
       *   that are functions and should trigger the effect when the function
       *   reference is changed
       * @return {void}
       * @protected
       */static createObservers(observers,dynamicFns){const proto=this.prototype;for(let i=0;i<observers.length;i++){proto._createMethodObserver(observers[i],dynamicFns);}}/**
       * Returns the template that will be stamped into this element's shadow root.
       *
       * If a `static get is()` getter is defined, the default implementation
       * will return the first `<template>` in a `dom-module` whose `id`
       * matches this element's `is`.
       *
       * Users may override this getter to return an arbitrary template
       * (in which case the `is` getter is unnecessary). The template returned
       * must be an `HTMLTemplateElement`.
       *
       * Note that when subclassing, if the super class overrode the default
       * implementation and the subclass would like to provide an alternate
       * template via a `dom-module`, it should override this getter and
       * return `DomModule.import(this.is, 'template')`.
       *
       * If a subclass would like to modify the super class template, it should
       * clone it rather than modify it in place.  If the getter does expensive
       * work such as cloning/modifying a template, it should memoize the
       * template for maximum performance:
       *
       *   let memoizedTemplate;
       *   class MySubClass extends MySuperClass {
       *     static get template() {
       *       if (!memoizedTemplate) {
       *         memoizedTemplate = super.template.cloneNode(true);
       *         let subContent = document.createElement('div');
       *         subContent.textContent = 'This came from MySubClass';
       *         memoizedTemplate.content.appendChild(subContent);
       *       }
       *       return memoizedTemplate;
       *     }
       *   }
       *
       * @return {!HTMLTemplateElement|string} Template to be stamped
       */static get template(){// Explanation of template-related properties:
// - constructor.template (this getter): the template for the class.
//     This can come from the prototype (for legacy elements), from a
//     dom-module, or from the super class's template (or can be overridden
//     altogether by the user)
// - constructor._template: memoized version of constructor.template
// - prototype._template: working template for the element, which will be
//     parsed and modified in place. It is a cloned version of
//     constructor.template, saved in _finalizeClass(). Note that before
//     this getter is called, for legacy elements this could be from a
//     _template field on the info object passed to Polymer(), a behavior,
//     or set in registered(); once the static getter runs, a clone of it
//     will overwrite it on the prototype as the working template.
if(!this.hasOwnProperty(JSCompiler_renameProperty('_template',this))){this._template=// If user has put template on prototype (e.g. in legacy via registered
// callback or info object), prefer that first
this.prototype.hasOwnProperty(JSCompiler_renameProperty('_template',this.prototype))?this.prototype._template:// Look in dom-module associated with this element's is
getTemplateFromDomModule(/** @type {PolymerElementConstructor}*/this.is)||// Next look for superclass template (call the super impl this
// way so that `this` points to the superclass)
Object.getPrototypeOf(/** @type {PolymerElementConstructor}*/this.prototype).constructor.template;}return this._template;}/**
       * Set the template.
       *
       * @param {!HTMLTemplateElement|string} value Template to set.
       */static set template(value){this._template=value;}/**
       * Path matching the url from which the element was imported.
       *
       * This path is used to resolve url's in template style cssText.
       * The `importPath` property is also set on element instances and can be
       * used to create bindings relative to the import path.
       *
       * For elements defined in ES modules, users should implement
       * `static get importMeta() { return import.meta; }`, and the default
       * implementation of `importPath` will  return `import.meta.url`'s path.
       * For elements defined in HTML imports, this getter will return the path
       * to the document containing a `dom-module` element matching this
       * element's static `is` property.
       *
       * Note, this path should contain a trailing `/`.
       *
       * @return {string} The import path for this element class
       * @suppress {missingProperties}
       */static get importPath(){if(!this.hasOwnProperty(JSCompiler_renameProperty('_importPath',this))){const meta=this.importMeta;if(meta){this._importPath=pathFromUrl(meta.url);}else{const module=DomModule.import(/** @type {PolymerElementConstructor} */this.is);this._importPath=module&&module.assetpath||Object.getPrototypeOf(/** @type {PolymerElementConstructor}*/this.prototype).constructor.importPath;}}return this._importPath;}constructor(){super();/** @type {HTMLTemplateElement} */this._template;/** @type {string} */this._importPath;/** @type {string} */this.rootPath;/** @type {string} */this.importPath;/** @type {StampedTemplate | HTMLElement | ShadowRoot} */this.root;/** @type {!Object<string, !Element>} */this.$;}/**
       * Overrides the default `PropertyAccessors` to ensure class
       * metaprogramming related to property accessors and effects has
       * completed (calls `finalize`).
       *
       * It also initializes any property defaults provided via `value` in
       * `properties` metadata.
       *
       * @return {void}
       * @override
       * @suppress {invalidCasts}
       */_initializeProperties(){instanceCount++;this.constructor.finalize();// note: finalize template when we have access to `localName` to
// avoid dependence on `is` for polyfilling styling.
this.constructor._finalizeTemplate(/** @type {!HTMLElement} */this.localName);super._initializeProperties();// set path defaults
this.rootPath=rootPath;this.importPath=this.constructor.importPath;// apply property defaults...
let p$=propertyDefaults(this.constructor);if(!p$){return;}for(let p in p$){let info=p$[p];// Don't set default value if there is already an own property, which
// happens when a `properties` property with default but no effects had
// a property set (e.g. bound) by its host before upgrade
if(!this.hasOwnProperty(p)){let value=typeof info.value=='function'?info.value.call(this):info.value;// Set via `_setProperty` if there is an accessor, to enable
// initializing readOnly property defaults
if(this._hasAccessor(p)){this._setPendingProperty(p,value,true);}else{this[p]=value;}}}}/**
       * Gather style text for a style element in the template.
       *
       * @param {string} cssText Text containing styling to process
       * @param {string} baseURI Base URI to rebase CSS paths against
       * @return {string} The processed CSS text
       * @protected
       */static _processStyleText(cssText,baseURI){return resolveCss(cssText,baseURI);}/**
      * Configures an element `proto` to function with a given `template`.
      * The element name `is` and extends `ext` must be specified for ShadyCSS
      * style scoping.
      *
      * @param {string} is Tag name (or type extension name) for this element
      * @return {void}
      * @protected
      */static _finalizeTemplate(is){/** @const {HTMLTemplateElement} */const template=this.prototype._template;if(template&&!template.__polymerFinalized){template.__polymerFinalized=true;const importPath=this.importPath;const baseURI=importPath?resolveUrl(importPath):'';// e.g. support `include="module-name"`, and ShadyCSS
processElementStyles(this,template,is,baseURI);this.prototype._bindTemplate(template);}}/**
       * Provides a default implementation of the standard Custom Elements
       * `connectedCallback`.
       *
       * The default implementation enables the property effects system and
       * flushes any pending properties, and updates shimmed CSS properties
       * when using the ShadyCSS scoping/custom properties polyfill.
       *
       * @suppress {missingProperties, invalidCasts} Super may or may not implement the callback
       * @return {void}
       */connectedCallback(){if(window.ShadyCSS&&this._template){window.ShadyCSS.styleElement(/** @type {!HTMLElement} */this);}super.connectedCallback();}/**
       * Stamps the element template.
       *
       * @return {void}
       * @override
       */ready(){if(this._template){this.root=this._stampTemplate(this._template);this.$=this.root.$;}super.ready();}/**
       * Implements `PropertyEffects`'s `_readyClients` call. Attaches
       * element dom by calling `_attachDom` with the dom stamped from the
       * element's template via `_stampTemplate`. Note that this allows
       * client dom to be attached to the element prior to any observers
       * running.
       *
       * @return {void}
       * @override
       */_readyClients(){if(this._template){this.root=this._attachDom(/** @type {StampedTemplate} */this.root);}// The super._readyClients here sets the clients initialized flag.
// We must wait to do this until after client dom is created/attached
// so that this flag can be checked to prevent notifications fired
// during this process from being handled before clients are ready.
super._readyClients();}/**
       * Attaches an element's stamped dom to itself. By default,
       * this method creates a `shadowRoot` and adds the dom to it.
       * However, this method may be overridden to allow an element
       * to put its dom in another location.
       *
       * @throws {Error}
       * @suppress {missingReturn}
       * @param {StampedTemplate} dom to attach to the element.
       * @return {ShadowRoot} node to which the dom has been attached.
       */_attachDom(dom){if(this.attachShadow){if(dom){if(!this.shadowRoot){this.attachShadow({mode:'open'});}this.shadowRoot.appendChild(dom);return this.shadowRoot;}return null;}else{throw new Error('ShadowDOM not available. '+// TODO(sorvell): move to compile-time conditional when supported
'PolymerElement can create dom as children instead of in '+'ShadowDOM by setting `this.root = this;\` before \`ready\`.');}}/**
       * When using the ShadyCSS scoping and custom property shim, causes all
       * shimmed styles in this element (and its subtree) to be updated
       * based on current custom property values.
       *
       * The optional parameter overrides inline custom property styles with an
       * object of properties where the keys are CSS properties, and the values
       * are strings.
       *
       * Example: `this.updateStyles({'--color': 'blue'})`
       *
       * These properties are retained unless a value of `null` is set.
       *
       * Note: This function does not support updating CSS mixins.
       * You can not dynamically change the value of an `@apply`.
       *
       * @param {Object=} properties Bag of custom property key/values to
       *   apply to this element.
       * @return {void}
       * @suppress {invalidCasts}
       */updateStyles(properties){if(window.ShadyCSS){window.ShadyCSS.styleSubtree(/** @type {!HTMLElement} */this,properties);}}/**
       * Rewrites a given URL relative to a base URL. The base URL defaults to
       * the original location of the document containing the `dom-module` for
       * this element. This method will return the same URL before and after
       * bundling.
       *
       * Note that this function performs no resolution for URLs that start
       * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
       * URL resolution, use `window.URL`.
       *
       * @param {string} url URL to resolve.
       * @param {string=} base Optional base URL to resolve against, defaults
       * to the element's `importPath`
       * @return {string} Rewritten URL relative to base
       */resolveUrl(url,base){if(!base&&this.importPath){base=resolveUrl(this.importPath);}return resolveUrl(url,base);}/**
       * Overrides `PropertyAccessors` to add map of dynamic functions on
       * template info, for consumption by `PropertyEffects` template binding
       * code. This map determines which method templates should have accessors
       * created for them.
       *
       * @override
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       */static _parseTemplateContent(template,templateInfo,nodeInfo){templateInfo.dynamicFns=templateInfo.dynamicFns||this._properties;return super._parseTemplateContent(template,templateInfo,nodeInfo);}}return PolymerElement;});/**
     * Total number of Polymer element instances created.
     * @type {number}
     */let instanceCount=0;/**
                               * Array of Polymer element classes that have been finalized.
                               * @type {Array<PolymerElement>}
                               */const registrations=[];/**
                                  * @param {!PolymerElementConstructor} prototype Element prototype to log
                                  * @this {this}
                                  * @private
                                  */function _regLog(prototype){console.log('['+prototype.is+']: registered');}/**
   * Registers a class prototype for telemetry purposes.
   * @param {HTMLElement} prototype Element prototype to register
   * @this {this}
   * @protected
   */function register(prototype){registrations.push(prototype);}/**
   * Logs all elements registered with an `is` to the console.
   * @public
   * @this {this}
   */function dumpRegistrations(){registrations.forEach(_regLog);}/**
   * When using the ShadyCSS scoping and custom property shim, causes all
   * shimmed `styles` (via `custom-style`) in the document (and its subtree)
   * to be updated based on current custom property values.
   *
   * The optional parameter overrides inline custom property styles with an
   * object of properties where the keys are CSS properties, and the values
   * are strings.
   *
   * Example: `updateStyles({'--color': 'blue'})`
   *
   * These properties are retained unless a value of `null` is set.
   *
   * @param {Object=} props Bag of custom property key/values to
   *   apply to the document.
   * @return {void}
   */const updateStyles=function(props){if(window.ShadyCSS){window.ShadyCSS.styleDocument(props);}};var elementMixin={version:version,ElementMixin:ElementMixin,get instanceCount(){return instanceCount;},registrations:registrations,register:register,dumpRegistrations:dumpRegistrations,updateStyles:updateStyles};class Debouncer{constructor(){this._asyncModule=null;this._callback=null;this._timer=null;}/**
     * Sets the scheduler; that is, a module with the Async interface,
     * a callback and optional arguments to be passed to the run function
     * from the async module.
     *
     * @param {!AsyncInterface} asyncModule Object with Async interface.
     * @param {function()} callback Callback to run.
     * @return {void}
     */setConfig(asyncModule,callback){this._asyncModule=asyncModule;this._callback=callback;this._timer=this._asyncModule.run(()=>{this._timer=null;this._callback();});}/**
     * Cancels an active debouncer and returns a reference to itself.
     *
     * @return {void}
     */cancel(){if(this.isActive()){this._asyncModule.cancel(/** @type {number} */this._timer);this._timer=null;}}/**
     * Flushes an active debouncer and returns a reference to itself.
     *
     * @return {void}
     */flush(){if(this.isActive()){this.cancel();this._callback();}}/**
     * Returns true if the debouncer is active.
     *
     * @return {boolean} True if active.
     */isActive(){return this._timer!=null;}/**
     * Creates a debouncer if no debouncer is passed as a parameter
     * or it cancels an active debouncer otherwise. The following
     * example shows how a debouncer can be called multiple times within a
     * microtask and "debounced" such that the provided callback function is
     * called once. Add this method to a custom element:
     *
     * ```js
     * import {microTask} from '@polymer/polymer/lib/utils/async.js';
     * import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
     * // ...
     *
     * _debounceWork() {
     *   this._debounceJob = Debouncer.debounce(this._debounceJob,
     *       microTask, () => this._doWork());
     * }
     * ```
     *
     * If the `_debounceWork` method is called multiple times within the same
     * microtask, the `_doWork` function will be called only once at the next
     * microtask checkpoint.
     *
     * Note: In testing it is often convenient to avoid asynchrony. To accomplish
     * this with a debouncer, you can use `enqueueDebouncer` and
     * `flush`. For example, extend the above example by adding
     * `enqueueDebouncer(this._debounceJob)` at the end of the
     * `_debounceWork` method. Then in a test, call `flush` to ensure
     * the debouncer has completed.
     *
     * @param {Debouncer?} debouncer Debouncer object.
     * @param {!AsyncInterface} asyncModule Object with Async interface
     * @param {function()} callback Callback to run.
     * @return {!Debouncer} Returns a debouncer object.
     */static debounce(debouncer,asyncModule,callback){if(debouncer instanceof Debouncer){debouncer.cancel();}else{debouncer=new Debouncer();}debouncer.setConfig(asyncModule,callback);return debouncer;}}var debounce={Debouncer:Debouncer};let HAS_NATIVE_TA=typeof document.head.style.touchAction==='string';let GESTURE_KEY='__polymerGestures';let HANDLED_OBJ='__polymerGesturesHandled';let TOUCH_ACTION='__polymerGesturesTouchAction';// radius for tap and track
let TAP_DISTANCE=25;let TRACK_DISTANCE=5;// number of last N track positions to keep
let TRACK_LENGTH=2;// Disabling "mouse" handlers for 2500ms is enough
let MOUSE_TIMEOUT=2500;let MOUSE_EVENTS=['mousedown','mousemove','mouseup','click'];// an array of bitmask values for mapping MouseEvent.which to MouseEvent.buttons
let MOUSE_WHICH_TO_BUTTONS=[0,1,4,2];let MOUSE_HAS_BUTTONS=function(){try{return new MouseEvent('test',{buttons:1}).buttons===1;}catch(e){return false;}}();/**
      * @param {string} name Possible mouse event name
      * @return {boolean} true if mouse event, false if not
      */function isMouseEvent(name){return MOUSE_EVENTS.indexOf(name)>-1;}/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */ // check for passive event listeners
let SUPPORTS_PASSIVE=false;(function(){try{let opts=Object.defineProperty({},'passive',{get(){SUPPORTS_PASSIVE=true;}});window.addEventListener('test',null,opts);window.removeEventListener('test',null,opts);}catch(e){}})();/**
       * Generate settings for event listeners, dependant on `passiveTouchGestures`
       *
       * @param {string} eventName Event name to determine if `{passive}` option is
       *   needed
       * @return {{passive: boolean} | undefined} Options to use for addEventListener
       *   and removeEventListener
       */function PASSIVE_TOUCH(eventName){if(isMouseEvent(eventName)||eventName==='touchend'){return;}if(HAS_NATIVE_TA&&SUPPORTS_PASSIVE&&passiveTouchGestures){return{passive:true};}else{return;}}// Check for touch-only devices
let IS_TOUCH_ONLY=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);// keep track of any labels hit by the mouseCanceller
/** @type {!Array<!HTMLLabelElement>} */const clickedLabels=[];/** @type {!Object<boolean>} */const labellable={'button':true,'input':true,'keygen':true,'meter':true,'output':true,'textarea':true,'progress':true,'select':true};// Defined at https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute
/** @type {!Object<boolean>} */const canBeDisabled={'button':true,'command':true,'fieldset':true,'input':true,'keygen':true,'optgroup':true,'option':true,'select':true,'textarea':true};/**
    * @param {HTMLElement} el Element to check labelling status
    * @return {boolean} element can have labels
    */function canBeLabelled(el){return labellable[el.localName]||false;}/**
   * @param {HTMLElement} el Element that may be labelled.
   * @return {!Array<!HTMLLabelElement>} Relevant label for `el`
   */function matchingLabels(el){let labels=Array.prototype.slice.call(/** @type {HTMLInputElement} */el.labels||[]);// IE doesn't have `labels` and Safari doesn't populate `labels`
// if element is in a shadowroot.
// In this instance, finding the non-ancestor labels is enough,
// as the mouseCancellor code will handle ancstor labels
if(!labels.length){labels=[];let root=el.getRootNode();// if there is an id on `el`, check for all labels with a matching `for` attribute
if(el.id){let matching=root.querySelectorAll(`label[for = ${el.id}]`);for(let i=0;i<matching.length;i++){labels.push(/** @type {!HTMLLabelElement} */matching[i]);}}}return labels;}// touch will make synthetic mouse events
// `preventDefault` on touchend will cancel them,
// but this breaks `<input>` focus and link clicks
// disable mouse handlers for MOUSE_TIMEOUT ms after
// a touchend to ignore synthetic mouse events
let mouseCanceller=function(mouseEvent){// Check for sourceCapabilities, used to distinguish synthetic events
// if mouseEvent did not come from a device that fires touch events,
// it was made by a real mouse and should be counted
// http://wicg.github.io/InputDeviceCapabilities/#dom-inputdevicecapabilities-firestouchevents
let sc=mouseEvent.sourceCapabilities;if(sc&&!sc.firesTouchEvents){return;}// skip synthetic mouse events
mouseEvent[HANDLED_OBJ]={skip:true};// disable "ghost clicks"
if(mouseEvent.type==='click'){let clickFromLabel=false;let path=mouseEvent.composedPath&&mouseEvent.composedPath();if(path){for(let i=0;i<path.length;i++){if(path[i].nodeType===Node.ELEMENT_NODE){if(path[i].localName==='label'){clickedLabels.push(path[i]);}else if(canBeLabelled(path[i])){let ownerLabels=matchingLabels(path[i]);// check if one of the clicked labels is labelling this element
for(let j=0;j<ownerLabels.length;j++){clickFromLabel=clickFromLabel||clickedLabels.indexOf(ownerLabels[j])>-1;}}}if(path[i]===POINTERSTATE.mouse.target){return;}}}// if one of the clicked labels was labelling the target element,
// this is not a ghost click
if(clickFromLabel){return;}mouseEvent.preventDefault();mouseEvent.stopPropagation();}};/**
    * @param {boolean=} setup True to add, false to remove.
    * @return {void}
    */function setupTeardownMouseCanceller(setup){let events=IS_TOUCH_ONLY?['click']:MOUSE_EVENTS;for(let i=0,en;i<events.length;i++){en=events[i];if(setup){// reset clickLabels array
clickedLabels.length=0;document.addEventListener(en,mouseCanceller,true);}else{document.removeEventListener(en,mouseCanceller,true);}}}function ignoreMouse(e){if(!POINTERSTATE.mouse.mouseIgnoreJob){setupTeardownMouseCanceller(true);}let unset=function(){setupTeardownMouseCanceller();POINTERSTATE.mouse.target=null;POINTERSTATE.mouse.mouseIgnoreJob=null;};POINTERSTATE.mouse.target=e.composedPath()[0];POINTERSTATE.mouse.mouseIgnoreJob=Debouncer.debounce(POINTERSTATE.mouse.mouseIgnoreJob,timeOut.after(MOUSE_TIMEOUT),unset);}/**
   * @param {MouseEvent} ev event to test for left mouse button down
   * @return {boolean} has left mouse button down
   */function hasLeftMouseButton(ev){let type=ev.type;// exit early if the event is not a mouse event
if(!isMouseEvent(type)){return false;}// ev.button is not reliable for mousemove (0 is overloaded as both left button and no buttons)
// instead we use ev.buttons (bitmask of buttons) or fall back to ev.which (deprecated, 0 for no buttons, 1 for left button)
if(type==='mousemove'){// allow undefined for testing events
let buttons=ev.buttons===undefined?1:ev.buttons;if(ev instanceof window.MouseEvent&&!MOUSE_HAS_BUTTONS){buttons=MOUSE_WHICH_TO_BUTTONS[ev.which]||0;}// buttons is a bitmask, check that the left button bit is set (1)
return Boolean(buttons&1);}else{// allow undefined for testing events
let button=ev.button===undefined?0:ev.button;// ev.button is 0 in mousedown/mouseup/click for left button activation
return button===0;}}function isSyntheticClick(ev){if(ev.type==='click'){// ev.detail is 0 for HTMLElement.click in most browsers
if(ev.detail===0){return true;}// in the worst case, check that the x/y position of the click is within
// the bounding box of the target of the event
// Thanks IE 10 >:(
let t=_findOriginalTarget(ev);// make sure the target of the event is an element so we can use getBoundingClientRect,
// if not, just assume it is a synthetic click
if(!t.nodeType||/** @type {Element} */t.nodeType!==Node.ELEMENT_NODE){return true;}let bcr=/** @type {Element} */t.getBoundingClientRect();// use page x/y to account for scrolling
let x=ev.pageX,y=ev.pageY;// ev is a synthetic click if the position is outside the bounding box of the target
return!(x>=bcr.left&&x<=bcr.right&&y>=bcr.top&&y<=bcr.bottom);}return false;}let POINTERSTATE={mouse:{target:null,mouseIgnoreJob:null},touch:{x:0,y:0,id:-1,scrollDecided:false}};function firstTouchAction(ev){let ta='auto';let path=ev.composedPath&&ev.composedPath();if(path){for(let i=0,n;i<path.length;i++){n=path[i];if(n[TOUCH_ACTION]){ta=n[TOUCH_ACTION];break;}}}return ta;}function trackDocument(stateObj,movefn,upfn){stateObj.movefn=movefn;stateObj.upfn=upfn;document.addEventListener('mousemove',movefn);document.addEventListener('mouseup',upfn);}function untrackDocument(stateObj){document.removeEventListener('mousemove',stateObj.movefn);document.removeEventListener('mouseup',stateObj.upfn);stateObj.movefn=null;stateObj.upfn=null;}// use a document-wide touchend listener to start the ghost-click prevention mechanism
// Use passive event listeners, if supported, to not affect scrolling performance
document.addEventListener('touchend',ignoreMouse,SUPPORTS_PASSIVE?{passive:true}:false);/** @type {!Object<string, !GestureRecognizer>} */const gestures={};/** @type {!Array<!GestureRecognizer>} */const recognizers=[];/**
                                * Finds the element rendered on the screen at the provided coordinates.
                                *
                                * Similar to `document.elementFromPoint`, but pierces through
                                * shadow roots.
                                *
                                * @param {number} x Horizontal pixel coordinate
                                * @param {number} y Vertical pixel coordinate
                                * @return {Element} Returns the deepest shadowRoot inclusive element
                                * found at the screen position given.
                                */function deepTargetFind(x,y){let node=document.elementFromPoint(x,y);let next=node;// this code path is only taken when native ShadowDOM is used
// if there is a shadowroot, it may have a node at x/y
// if there is not a shadowroot, exit the loop
while(next&&next.shadowRoot&&!window.ShadyDOM){// if there is a node at x/y in the shadowroot, look deeper
let oldNext=next;next=next.shadowRoot.elementFromPoint(x,y);// on Safari, elementFromPoint may return the shadowRoot host
if(oldNext===next){break;}if(next){node=next;}}return node;}/**
   * a cheaper check than ev.composedPath()[0];
   *
   * @private
   * @param {Event|Touch} ev Event.
   * @return {EventTarget} Returns the event target.
   */function _findOriginalTarget(ev){// shadowdom
if(ev.composedPath){const targets=/** @type {!Array<!EventTarget>} */ev.composedPath();// It shouldn't be, but sometimes targets is empty (window on Safari).
return targets.length>0?targets[0]:ev.target;}// shadydom
return ev.target;}/**
   * @private
   * @param {Event} ev Event.
   * @return {void}
   */function _handleNative(ev){let handled;let type=ev.type;let node=ev.currentTarget;let gobj=node[GESTURE_KEY];if(!gobj){return;}let gs=gobj[type];if(!gs){return;}if(!ev[HANDLED_OBJ]){ev[HANDLED_OBJ]={};if(type.slice(0,5)==='touch'){ev=/** @type {TouchEvent} */ev;// eslint-disable-line no-self-assign
let t=ev.changedTouches[0];if(type==='touchstart'){// only handle the first finger
if(ev.touches.length===1){POINTERSTATE.touch.id=t.identifier;}}if(POINTERSTATE.touch.id!==t.identifier){return;}if(!HAS_NATIVE_TA){if(type==='touchstart'||type==='touchmove'){_handleTouchAction(ev);}}}}handled=ev[HANDLED_OBJ];// used to ignore synthetic mouse events
if(handled.skip){return;}// reset recognizer state
for(let i=0,r;i<recognizers.length;i++){r=recognizers[i];if(gs[r.name]&&!handled[r.name]){if(r.flow&&r.flow.start.indexOf(ev.type)>-1&&r.reset){r.reset();}}}// enforce gesture recognizer order
for(let i=0,r;i<recognizers.length;i++){r=recognizers[i];if(gs[r.name]&&!handled[r.name]){handled[r.name]=true;r[type](ev);}}}/**
   * @private
   * @param {TouchEvent} ev Event.
   * @return {void}
   */function _handleTouchAction(ev){let t=ev.changedTouches[0];let type=ev.type;if(type==='touchstart'){POINTERSTATE.touch.x=t.clientX;POINTERSTATE.touch.y=t.clientY;POINTERSTATE.touch.scrollDecided=false;}else if(type==='touchmove'){if(POINTERSTATE.touch.scrollDecided){return;}POINTERSTATE.touch.scrollDecided=true;let ta=firstTouchAction(ev);let shouldPrevent=false;let dx=Math.abs(POINTERSTATE.touch.x-t.clientX);let dy=Math.abs(POINTERSTATE.touch.y-t.clientY);if(!ev.cancelable){// scrolling is happening
}else if(ta==='none'){shouldPrevent=true;}else if(ta==='pan-x'){shouldPrevent=dy>dx;}else if(ta==='pan-y'){shouldPrevent=dx>dy;}if(shouldPrevent){ev.preventDefault();}else{prevent('track');}}}/**
   * Adds an event listener to a node for the given gesture type.
   *
   * @param {!EventTarget} node Node to add listener on
   * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
   * @param {!function(!Event):void} handler Event listener function to call
   * @return {boolean} Returns true if a gesture event listener was added.
   */function addListener(node,evType,handler){if(gestures[evType]){_add(node,evType,handler);return true;}return false;}/**
   * Removes an event listener from a node for the given gesture type.
   *
   * @param {!EventTarget} node Node to remove listener from
   * @param {string} evType Gesture type: `down`, `up`, `track`, or `tap`
   * @param {!function(!Event):void} handler Event listener function previously passed to
   *  `addListener`.
   * @return {boolean} Returns true if a gesture event listener was removed.
   */function removeListener(node,evType,handler){if(gestures[evType]){_remove(node,evType,handler);return true;}return false;}/**
   * automate the event listeners for the native events
   *
   * @private
   * @param {!EventTarget} node Node on which to add the event.
   * @param {string} evType Event type to add.
   * @param {function(!Event)} handler Event handler function.
   * @return {void}
   */function _add(node,evType,handler){let recognizer=gestures[evType];let deps=recognizer.deps;let name=recognizer.name;let gobj=node[GESTURE_KEY];if(!gobj){node[GESTURE_KEY]=gobj={};}for(let i=0,dep,gd;i<deps.length;i++){dep=deps[i];// don't add mouse handlers on iOS because they cause gray selection overlays
if(IS_TOUCH_ONLY&&isMouseEvent(dep)&&dep!=='click'){continue;}gd=gobj[dep];if(!gd){gobj[dep]=gd={_count:0};}if(gd._count===0){node.addEventListener(dep,_handleNative,PASSIVE_TOUCH(dep));}gd[name]=(gd[name]||0)+1;gd._count=(gd._count||0)+1;}node.addEventListener(evType,handler);if(recognizer.touchAction){setTouchAction(node,recognizer.touchAction);}}/**
   * automate event listener removal for native events
   *
   * @private
   * @param {!EventTarget} node Node on which to remove the event.
   * @param {string} evType Event type to remove.
   * @param {function(!Event): void} handler Event handler function.
   * @return {void}
   */function _remove(node,evType,handler){let recognizer=gestures[evType];let deps=recognizer.deps;let name=recognizer.name;let gobj=node[GESTURE_KEY];if(gobj){for(let i=0,dep,gd;i<deps.length;i++){dep=deps[i];gd=gobj[dep];if(gd&&gd[name]){gd[name]=(gd[name]||1)-1;gd._count=(gd._count||1)-1;if(gd._count===0){node.removeEventListener(dep,_handleNative,PASSIVE_TOUCH(dep));}}}}node.removeEventListener(evType,handler);}/**
   * Registers a new gesture event recognizer for adding new custom
   * gesture event types.
   *
   * @param {!GestureRecognizer} recog Gesture recognizer descriptor
   * @return {void}
   */function register$1(recog){recognizers.push(recog);for(let i=0;i<recog.emits.length;i++){gestures[recog.emits[i]]=recog;}}/**
   * @private
   * @param {string} evName Event name.
   * @return {Object} Returns the gesture for the given event name.
   */function _findRecognizerByEvent(evName){for(let i=0,r;i<recognizers.length;i++){r=recognizers[i];for(let j=0,n;j<r.emits.length;j++){n=r.emits[j];if(n===evName){return r;}}}return null;}/**
   * Sets scrolling direction on node.
   *
   * This value is checked on first move, thus it should be called prior to
   * adding event listeners.
   *
   * @param {!EventTarget} node Node to set touch action setting on
   * @param {string} value Touch action value
   * @return {void}
   */function setTouchAction(node,value){if(HAS_NATIVE_TA&&node instanceof HTMLElement){// NOTE: add touchAction async so that events can be added in
// custom element constructors. Otherwise we run afoul of custom
// elements restriction against settings attributes (style) in the
// constructor.
microTask.run(()=>{node.style.touchAction=value;});}node[TOUCH_ACTION]=value;}/**
   * Dispatches an event on the `target` element of `type` with the given
   * `detail`.
   * @private
   * @param {!EventTarget} target The element on which to fire an event.
   * @param {string} type The type of event to fire.
   * @param {!Object=} detail The detail object to populate on the event.
   * @return {void}
   */function _fire(target,type,detail){let ev=new Event(type,{bubbles:true,cancelable:true,composed:true});ev.detail=detail;target.dispatchEvent(ev);// forward `preventDefault` in a clean way
if(ev.defaultPrevented){let preventer=detail.preventer||detail.sourceEvent;if(preventer&&preventer.preventDefault){preventer.preventDefault();}}}/**
   * Prevents the dispatch and default action of the given event name.
   *
   * @param {string} evName Event name.
   * @return {void}
   */function prevent(evName){let recognizer=_findRecognizerByEvent(evName);if(recognizer.info){recognizer.info.prevent=true;}}/**
   * Reset the 2500ms timeout on processing mouse input after detecting touch input.
   *
   * Touch inputs create synthesized mouse inputs anywhere from 0 to 2000ms after the touch.
   * This method should only be called during testing with simulated touch inputs.
   * Calling this method in production may cause duplicate taps or other Gestures.
   *
   * @return {void}
   */function resetMouseCanceller(){if(POINTERSTATE.mouse.mouseIgnoreJob){POINTERSTATE.mouse.mouseIgnoreJob.flush();}}/* eslint-disable valid-jsdoc */register$1({name:'downup',deps:['mousedown','touchstart','touchend'],flow:{start:['mousedown','touchstart'],end:['mouseup','touchend']},emits:['down','up'],info:{movefn:null,upfn:null},/**
   * @this {GestureRecognizer}
   * @return {void}
   */reset:function(){untrackDocument(this.info);},/**
   * @this {GestureRecognizer}
   * @param {MouseEvent} e
   * @return {void}
   */mousedown:function(e){if(!hasLeftMouseButton(e)){return;}let t=_findOriginalTarget(e);let self=this;let movefn=function movefn(e){if(!hasLeftMouseButton(e)){downupFire('up',t,e);untrackDocument(self.info);}};let upfn=function upfn(e){if(hasLeftMouseButton(e)){downupFire('up',t,e);}untrackDocument(self.info);};trackDocument(this.info,movefn,upfn);downupFire('down',t,e);},/**
   * @this {GestureRecognizer}
   * @param {TouchEvent} e
   * @return {void}
   */touchstart:function(e){downupFire('down',_findOriginalTarget(e),e.changedTouches[0],e);},/**
   * @this {GestureRecognizer}
   * @param {TouchEvent} e
   * @return {void}
   */touchend:function(e){downupFire('up',_findOriginalTarget(e),e.changedTouches[0],e);}});/**
     * @param {string} type
     * @param {EventTarget} target
     * @param {Event|Touch} event
     * @param {Event=} preventer
     * @return {void}
     */function downupFire(type,target,event,preventer){if(!target){return;}_fire(target,type,{x:event.clientX,y:event.clientY,sourceEvent:event,preventer:preventer,prevent:function(e){return prevent(e);}});}register$1({name:'track',touchAction:'none',deps:['mousedown','touchstart','touchmove','touchend'],flow:{start:['mousedown','touchstart'],end:['mouseup','touchend']},emits:['track'],info:{x:0,y:0,state:'start',started:false,moves:[],/** @this {GestureInfo} */addMove:function(move){if(this.moves.length>TRACK_LENGTH){this.moves.shift();}this.moves.push(move);},movefn:null,upfn:null,prevent:false},/**
   * @this {GestureRecognizer}
   * @return {void}
   */reset:function(){this.info.state='start';this.info.started=false;this.info.moves=[];this.info.x=0;this.info.y=0;this.info.prevent=false;untrackDocument(this.info);},/**
   * @this {GestureRecognizer}
   * @param {MouseEvent} e
   * @return {void}
   */mousedown:function(e){if(!hasLeftMouseButton(e)){return;}let t=_findOriginalTarget(e);let self=this;let movefn=function movefn(e){let x=e.clientX,y=e.clientY;if(trackHasMovedEnough(self.info,x,y)){// first move is 'start', subsequent moves are 'move', mouseup is 'end'
self.info.state=self.info.started?e.type==='mouseup'?'end':'track':'start';if(self.info.state==='start'){// if and only if tracking, always prevent tap
prevent('tap');}self.info.addMove({x:x,y:y});if(!hasLeftMouseButton(e)){// always fire "end"
self.info.state='end';untrackDocument(self.info);}if(t){trackFire(self.info,t,e);}self.info.started=true;}};let upfn=function upfn(e){if(self.info.started){movefn(e);}// remove the temporary listeners
untrackDocument(self.info);};// add temporary document listeners as mouse retargets
trackDocument(this.info,movefn,upfn);this.info.x=e.clientX;this.info.y=e.clientY;},/**
   * @this {GestureRecognizer}
   * @param {TouchEvent} e
   * @return {void}
   */touchstart:function(e){let ct=e.changedTouches[0];this.info.x=ct.clientX;this.info.y=ct.clientY;},/**
   * @this {GestureRecognizer}
   * @param {TouchEvent} e
   * @return {void}
   */touchmove:function(e){let t=_findOriginalTarget(e);let ct=e.changedTouches[0];let x=ct.clientX,y=ct.clientY;if(trackHasMovedEnough(this.info,x,y)){if(this.info.state==='start'){// if and only if tracking, always prevent tap
prevent('tap');}this.info.addMove({x:x,y:y});trackFire(this.info,t,ct);this.info.state='track';this.info.started=true;}},/**
   * @this {GestureRecognizer}
   * @param {TouchEvent} e
   * @return {void}
   */touchend:function(e){let t=_findOriginalTarget(e);let ct=e.changedTouches[0];// only trackend if track was started and not aborted
if(this.info.started){// reset started state on up
this.info.state='end';this.info.addMove({x:ct.clientX,y:ct.clientY});trackFire(this.info,t,ct);}}});/**
     * @param {!GestureInfo} info
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */function trackHasMovedEnough(info,x,y){if(info.prevent){return false;}if(info.started){return true;}let dx=Math.abs(info.x-x);let dy=Math.abs(info.y-y);return dx>=TRACK_DISTANCE||dy>=TRACK_DISTANCE;}/**
   * @param {!GestureInfo} info
   * @param {?EventTarget} target
   * @param {Touch} touch
   * @return {void}
   */function trackFire(info,target,touch){if(!target){return;}let secondlast=info.moves[info.moves.length-2];let lastmove=info.moves[info.moves.length-1];let dx=lastmove.x-info.x;let dy=lastmove.y-info.y;let ddx,ddy=0;if(secondlast){ddx=lastmove.x-secondlast.x;ddy=lastmove.y-secondlast.y;}_fire(target,'track',{state:info.state,x:touch.clientX,y:touch.clientY,dx:dx,dy:dy,ddx:ddx,ddy:ddy,sourceEvent:touch,hover:function(){return deepTargetFind(touch.clientX,touch.clientY);}});}register$1({name:'tap',deps:['mousedown','click','touchstart','touchend'],flow:{start:['mousedown','touchstart'],end:['click','touchend']},emits:['tap'],info:{x:NaN,y:NaN,prevent:false},/**
   * @this {GestureRecognizer}
   * @return {void}
   */reset:function(){this.info.x=NaN;this.info.y=NaN;this.info.prevent=false;},/**
   * @this {GestureRecognizer}
   * @param {MouseEvent} e
   * @return {void}
   */mousedown:function(e){if(hasLeftMouseButton(e)){this.info.x=e.clientX;this.info.y=e.clientY;}},/**
   * @this {GestureRecognizer}
   * @param {MouseEvent} e
   * @return {void}
   */click:function(e){if(hasLeftMouseButton(e)){trackForward(this.info,e);}},/**
   * @this {GestureRecognizer}
   * @param {TouchEvent} e
   * @return {void}
   */touchstart:function(e){const touch=e.changedTouches[0];this.info.x=touch.clientX;this.info.y=touch.clientY;},/**
   * @this {GestureRecognizer}
   * @param {TouchEvent} e
   * @return {void}
   */touchend:function(e){trackForward(this.info,e.changedTouches[0],e);}});/**
     * @param {!GestureInfo} info
     * @param {Event | Touch} e
     * @param {Event=} preventer
     * @return {void}
     */function trackForward(info,e,preventer){let dx=Math.abs(e.clientX-info.x);let dy=Math.abs(e.clientY-info.y);// find original target from `preventer` for TouchEvents, or `e` for MouseEvents
let t=_findOriginalTarget(preventer||e);if(!t||canBeDisabled[/** @type {!HTMLElement} */t.localName]&&t.hasAttribute('disabled')){return;}// dx,dy can be NaN if `click` has been simulated and there was no `down` for `start`
if(isNaN(dx)||isNaN(dy)||dx<=TAP_DISTANCE&&dy<=TAP_DISTANCE||isSyntheticClick(e)){// prevent taps from being generated if an event has canceled them
if(!info.prevent){_fire(t,'tap',{x:e.clientX,y:e.clientY,sourceEvent:e,preventer:preventer});}}}/* eslint-enable valid-jsdoc */ /** @deprecated */const findOriginalTarget=_findOriginalTarget;/** @deprecated */const add=addListener;/** @deprecated */const remove=removeListener;var gestures$1={gestures:gestures,recognizers:recognizers,deepTargetFind:deepTargetFind,addListener:addListener,removeListener:removeListener,register:register$1,setTouchAction:setTouchAction,prevent:prevent,resetMouseCanceller:resetMouseCanceller,findOriginalTarget:findOriginalTarget,add:add,remove:remove};const GestureEventListeners=dedupingMixin(/**
                                                     * @template T
                                                     * @param {function(new:T)} superClass Class to apply mixin to.
                                                     * @return {function(new:T)} superClass with mixin applied.
                                                     */superClass=>{/**
   * @polymer
   * @mixinClass
   * @implements {Polymer_GestureEventListeners}
   */class GestureEventListeners extends superClass{/**
     * Add the event listener to the node if it is a gestures event.
     *
     * @param {!EventTarget} node Node to add event listener to
     * @param {string} eventName Name of event
     * @param {function(!Event):void} handler Listener function to add
     * @return {void}
     * @override
     */_addEventListenerToNode(node,eventName,handler){if(!addListener(node,eventName,handler)){super._addEventListenerToNode(node,eventName,handler);}}/**
       * Remove the event listener to the node if it is a gestures event.
       *
       * @param {!EventTarget} node Node to remove event listener from
       * @param {string} eventName Name of event
       * @param {function(!Event):void} handler Listener function to remove
       * @return {void}
       * @override
       */_removeEventListenerFromNode(node,eventName,handler){if(!removeListener(node,eventName,handler)){super._removeEventListenerFromNode(node,eventName,handler);}}}return GestureEventListeners;});var gestureEventListeners={GestureEventListeners:GestureEventListeners};const HOST_DIR=/:host\(:dir\((ltr|rtl)\)\)/g;const HOST_DIR_REPLACMENT=':host([dir="$1"])';const EL_DIR=/([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g;const EL_DIR_REPLACMENT=':host([dir="$2"]) $1';/**
                                                   * @type {!Array<!Polymer_DirMixin>}
                                                   */const DIR_INSTANCES=[];/** @type {MutationObserver} */let observer=null;let DOCUMENT_DIR='';function getRTL(){DOCUMENT_DIR=document.documentElement.getAttribute('dir');}/**
   * @param {!Polymer_DirMixin} instance Instance to set RTL status on
   */function setRTL(instance){if(!instance.__autoDirOptOut){const el=/** @type {!HTMLElement} */instance;el.setAttribute('dir',DOCUMENT_DIR);}}function updateDirection(){getRTL();DOCUMENT_DIR=document.documentElement.getAttribute('dir');for(let i=0;i<DIR_INSTANCES.length;i++){setRTL(DIR_INSTANCES[i]);}}function takeRecords(){if(observer&&observer.takeRecords().length){updateDirection();}}/**
   * Element class mixin that allows elements to use the `:dir` CSS Selector to
   * have text direction specific styling.
   *
   * With this mixin, any stylesheet provided in the template will transform
   * `:dir` into `:host([dir])` and sync direction with the page via the
   * element's `dir` attribute.
   *
   * Elements can opt out of the global page text direction by setting the `dir`
   * attribute directly in `ready()` or in HTML.
   *
   * Caveats:
   * - Applications must set `<html dir="ltr">` or `<html dir="rtl">` to sync
   *   direction
   * - Automatic left-to-right or right-to-left styling is sync'd with the
   *   `<html>` element only.
   * - Changing `dir` at runtime is supported.
   * - Opting out of the global direction styling is permanent
   *
   * @mixinFunction
   * @polymer
   * @appliesMixin PropertyAccessors
   */const DirMixin=dedupingMixin(base=>{if(!observer){getRTL();observer=new MutationObserver(updateDirection);observer.observe(document.documentElement,{attributes:true,attributeFilter:['dir']});}/**
     * @constructor
     * @extends {base}
     * @implements {Polymer_PropertyAccessors}
     * @private
     */const elementBase=PropertyAccessors(base);/**
                                                * @polymer
                                                * @mixinClass
                                                * @implements {Polymer_DirMixin}
                                                */class Dir extends elementBase{/**
     * @override
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     */static _processStyleText(cssText,baseURI){cssText=super._processStyleText(cssText,baseURI);cssText=this._replaceDirInCssText(cssText);return cssText;}/**
       * Replace `:dir` in the given CSS text
       *
       * @param {string} text CSS text to replace DIR
       * @return {string} Modified CSS
       */static _replaceDirInCssText(text){let replacedText=text;replacedText=replacedText.replace(HOST_DIR,HOST_DIR_REPLACMENT);replacedText=replacedText.replace(EL_DIR,EL_DIR_REPLACMENT);if(text!==replacedText){this.__activateDir=true;}return replacedText;}constructor(){super();/** @type {boolean} */this.__autoDirOptOut=false;}/**
       * @suppress {invalidCasts} Closure doesn't understand that `this` is an HTMLElement
       * @return {void}
       */ready(){super.ready();this.__autoDirOptOut=/** @type {!HTMLElement} */this.hasAttribute('dir');}/**
       * @suppress {missingProperties} If it exists on elementBase, it can be super'd
       * @return {void}
       */connectedCallback(){if(elementBase.prototype.connectedCallback){super.connectedCallback();}if(this.constructor.__activateDir){takeRecords();DIR_INSTANCES.push(this);setRTL(this);}}/**
       * @suppress {missingProperties} If it exists on elementBase, it can be super'd
       * @return {void}
       */disconnectedCallback(){if(elementBase.prototype.disconnectedCallback){super.disconnectedCallback();}if(this.constructor.__activateDir){const idx=DIR_INSTANCES.indexOf(this);if(idx>-1){DIR_INSTANCES.splice(idx,1);}}}}Dir.__activateDir=false;return Dir;});var dirMixin={DirMixin:DirMixin};let scheduled=false;let beforeRenderQueue=[];let afterRenderQueue=[];function schedule(){scheduled=true;// before next render
requestAnimationFrame(function(){scheduled=false;flushQueue(beforeRenderQueue);// after the render
setTimeout(function(){runQueue(afterRenderQueue);});});}function flushQueue(queue){while(queue.length){callMethod(queue.shift());}}function runQueue(queue){for(let i=0,l=queue.length;i<l;i++){callMethod(queue.shift());}}function callMethod(info){const context=info[0];const callback=info[1];const args=info[2];try{callback.apply(context,args);}catch(e){setTimeout(()=>{throw e;});}}/**
   * Flushes all `beforeNextRender` tasks, followed by all `afterNextRender`
   * tasks.
   *
   * @return {void}
   */function flush(){while(beforeRenderQueue.length||afterRenderQueue.length){flushQueue(beforeRenderQueue);flushQueue(afterRenderQueue);}scheduled=false;}/**
   * Enqueues a callback which will be run before the next render, at
   * `requestAnimationFrame` timing.
   *
   * This method is useful for enqueuing work that requires DOM measurement,
   * since measurement may not be reliable in custom element callbacks before
   * the first render, as well as for batching measurement tasks in general.
   *
   * Tasks in this queue may be flushed by calling `flush()`.
   *
   * @param {*} context Context object the callback function will be bound to
   * @param {function(...*):void} callback Callback function
   * @param {!Array=} args An array of arguments to call the callback function with
   * @return {void}
   */function beforeNextRender(context,callback,args){if(!scheduled){schedule();}beforeRenderQueue.push([context,callback,args]);}/**
   * Enqueues a callback which will be run after the next render, equivalent
   * to one task (`setTimeout`) after the next `requestAnimationFrame`.
   *
   * This method is useful for tuning the first-render performance of an
   * element or application by deferring non-critical work until after the
   * first paint.  Typical non-render-critical work may include adding UI
   * event listeners and aria attributes.
   *
   * @param {*} context Context object the callback function will be bound to
   * @param {function(...*):void} callback Callback function
   * @param {!Array=} args An array of arguments to call the callback function with
   * @return {void}
   */function afterNextRender(context,callback,args){if(!scheduled){schedule();}afterRenderQueue.push([context,callback,args]);}var renderStatus={flush:flush,beforeNextRender:beforeNextRender,afterNextRender:afterNextRender};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */function resolve(){document.body.removeAttribute('unresolved');}if(document.readyState==='interactive'||document.readyState==='complete'){resolve();}else{window.addEventListener('DOMContentLoaded',resolve);}function newSplice(index,removed,addedCount){return{index:index,removed:removed,addedCount:addedCount};}const EDIT_LEAVE=0;const EDIT_UPDATE=1;const EDIT_ADD=2;const EDIT_DELETE=3;// Note: This function is *based* on the computation of the Levenshtein
// "edit" distance. The one change is that "updates" are treated as two
// edits - not one. With Array splices, an update is really a delete
// followed by an add. By retaining this, we optimize for "keeping" the
// maximum array items in the original array. For example:
//
//   'xxxx123' -> '123yyyy'
//
// With 1-edit updates, the shortest path would be just to update all seven
// characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
// leaves the substring '123' intact.
function calcEditDistances(current,currentStart,currentEnd,old,oldStart,oldEnd){// "Deletion" columns
let rowCount=oldEnd-oldStart+1;let columnCount=currentEnd-currentStart+1;let distances=new Array(rowCount);// "Addition" rows. Initialize null column.
for(let i=0;i<rowCount;i++){distances[i]=new Array(columnCount);distances[i][0]=i;}// Initialize null row
for(let j=0;j<columnCount;j++)distances[0][j]=j;for(let i=1;i<rowCount;i++){for(let j=1;j<columnCount;j++){if(equals(current[currentStart+j-1],old[oldStart+i-1]))distances[i][j]=distances[i-1][j-1];else{let north=distances[i-1][j]+1;let west=distances[i][j-1]+1;distances[i][j]=north<west?north:west;}}}return distances;}// This starts at the final weight, and walks "backward" by finding
// the minimum previous weight recursively until the origin of the weight
// matrix.
function spliceOperationsFromEditDistances(distances){let i=distances.length-1;let j=distances[0].length-1;let current=distances[i][j];let edits=[];while(i>0||j>0){if(i==0){edits.push(EDIT_ADD);j--;continue;}if(j==0){edits.push(EDIT_DELETE);i--;continue;}let northWest=distances[i-1][j-1];let west=distances[i-1][j];let north=distances[i][j-1];let min;if(west<north)min=west<northWest?west:northWest;else min=north<northWest?north:northWest;if(min==northWest){if(northWest==current){edits.push(EDIT_LEAVE);}else{edits.push(EDIT_UPDATE);current=northWest;}i--;j--;}else if(min==west){edits.push(EDIT_DELETE);i--;current=west;}else{edits.push(EDIT_ADD);j--;current=north;}}edits.reverse();return edits;}/**
   * Splice Projection functions:
   *
   * A splice map is a representation of how a previous array of items
   * was transformed into a new array of items. Conceptually it is a list of
   * tuples of
   *
   *   <index, removed, addedCount>
   *
   * which are kept in ascending index order of. The tuple represents that at
   * the |index|, |removed| sequence of items were removed, and counting forward
   * from |index|, |addedCount| items were added.
   */ /**
       * Lacking individual splice mutation information, the minimal set of
       * splices can be synthesized given the previous state and final state of an
       * array. The basic approach is to calculate the edit distance matrix and
       * choose the shortest path through it.
       *
       * Complexity: O(l * p)
       *   l: The length of the current array
       *   p: The length of the old array
       *
       * @param {!Array} current The current "changed" array for which to
       * calculate splices.
       * @param {number} currentStart Starting index in the `current` array for
       * which splices are calculated.
       * @param {number} currentEnd Ending index in the `current` array for
       * which splices are calculated.
       * @param {!Array} old The original "unchanged" array to compare `current`
       * against to determine splices.
       * @param {number} oldStart Starting index in the `old` array for
       * which splices are calculated.
       * @param {number} oldEnd Ending index in the `old` array for
       * which splices are calculated.
       * @return {!Array} Returns an array of splice record objects. Each of these
       * contains: `index` the location where the splice occurred; `removed`
       * the array of removed items from this location; `addedCount` the number
       * of items added at this location.
       */function calcSplices(current,currentStart,currentEnd,old,oldStart,oldEnd){let prefixCount=0;let suffixCount=0;let splice;let minLength=Math.min(currentEnd-currentStart,oldEnd-oldStart);if(currentStart==0&&oldStart==0)prefixCount=sharedPrefix(current,old,minLength);if(currentEnd==current.length&&oldEnd==old.length)suffixCount=sharedSuffix(current,old,minLength-prefixCount);currentStart+=prefixCount;oldStart+=prefixCount;currentEnd-=suffixCount;oldEnd-=suffixCount;if(currentEnd-currentStart==0&&oldEnd-oldStart==0)return[];if(currentStart==currentEnd){splice=newSplice(currentStart,[],0);while(oldStart<oldEnd)splice.removed.push(old[oldStart++]);return[splice];}else if(oldStart==oldEnd)return[newSplice(currentStart,[],currentEnd-currentStart)];let ops=spliceOperationsFromEditDistances(calcEditDistances(current,currentStart,currentEnd,old,oldStart,oldEnd));splice=undefined;let splices=[];let index=currentStart;let oldIndex=oldStart;for(let i=0;i<ops.length;i++){switch(ops[i]){case EDIT_LEAVE:if(splice){splices.push(splice);splice=undefined;}index++;oldIndex++;break;case EDIT_UPDATE:if(!splice)splice=newSplice(index,[],0);splice.addedCount++;index++;splice.removed.push(old[oldIndex]);oldIndex++;break;case EDIT_ADD:if(!splice)splice=newSplice(index,[],0);splice.addedCount++;index++;break;case EDIT_DELETE:if(!splice)splice=newSplice(index,[],0);splice.removed.push(old[oldIndex]);oldIndex++;break;}}if(splice){splices.push(splice);}return splices;}function sharedPrefix(current,old,searchLength){for(let i=0;i<searchLength;i++)if(!equals(current[i],old[i]))return i;return searchLength;}function sharedSuffix(current,old,searchLength){let index1=current.length;let index2=old.length;let count=0;while(count<searchLength&&equals(current[--index1],old[--index2]))count++;return count;}/**
   * Returns an array of splice records indicating the minimum edits required
   * to transform the `previous` array into the `current` array.
   *
   * Splice records are ordered by index and contain the following fields:
   * - `index`: index where edit started
   * - `removed`: array of removed items from this index
   * - `addedCount`: number of items added at this index
   *
   * This function is based on the Levenshtein "minimum edit distance"
   * algorithm. Note that updates are treated as removal followed by addition.
   *
   * The worst-case time complexity of this algorithm is `O(l * p)`
   *   l: The length of the current array
   *   p: The length of the previous array
   *
   * However, the worst-case complexity is reduced by an `O(n)` optimization
   * to detect any shared prefix & suffix between the two arrays and only
   * perform the more expensive minimum edit distance calculation over the
   * non-shared portions of the arrays.
   *
   * @function
   * @param {!Array} current The "changed" array for which splices will be
   * calculated.
   * @param {!Array} previous The "unchanged" original array to compare
   * `current` against to determine the splices.
   * @return {!Array} Returns an array of splice record objects. Each of these
   * contains: `index` the location where the splice occurred; `removed`
   * the array of removed items from this location; `addedCount` the number
   * of items added at this location.
   */function calculateSplices(current,previous){return calcSplices(current,0,current.length,previous,0,previous.length);}function equals(currentValue,previousValue){return currentValue===previousValue;}var arraySplice={calculateSplices:calculateSplices};function isSlot(node){return node.localName==='slot';}/**
   * Class that listens for changes (additions or removals) to
   * "flattened nodes" on a given `node`. The list of flattened nodes consists
   * of a node's children and, for any children that are `<slot>` elements,
   * the expanded flattened list of `assignedNodes`.
   * For example, if the observed node has children `<a></a><slot></slot><b></b>`
   * and the `<slot>` has one `<div>` assigned to it, then the flattened
   * nodes list is `<a></a><div></div><b></b>`. If the `<slot>` has other
   * `<slot>` elements assigned to it, these are flattened as well.
   *
   * The provided `callback` is called whenever any change to this list
   * of flattened nodes occurs, where an addition or removal of a node is
   * considered a change. The `callback` is called with one argument, an object
   * containing an array of any `addedNodes` and `removedNodes`.
   *
   * Note: the callback is called asynchronous to any changes
   * at a microtask checkpoint. This is because observation is performed using
   * `MutationObserver` and the `<slot>` element's `slotchange` event which
   * are asynchronous.
   *
   * An example:
   * ```js
   * class TestSelfObserve extends PolymerElement {
   *   static get is() { return 'test-self-observe';}
   *   connectedCallback() {
   *     super.connectedCallback();
   *     this._observer = new FlattenedNodesObserver(this, (info) => {
   *       this.info = info;
   *     });
   *   }
   *   disconnectedCallback() {
   *     super.disconnectedCallback();
   *     this._observer.disconnect();
   *   }
   * }
   * customElements.define(TestSelfObserve.is, TestSelfObserve);
   * ```
   *
   * @summary Class that listens for changes (additions or removals) to
   * "flattened nodes" on a given `node`.
   */class FlattenedNodesObserver{/**
   * Returns the list of flattened nodes for the given `node`.
   * This list consists of a node's children and, for any children
   * that are `<slot>` elements, the expanded flattened list of `assignedNodes`.
   * For example, if the observed node has children `<a></a><slot></slot><b></b>`
   * and the `<slot>` has one `<div>` assigned to it, then the flattened
   * nodes list is `<a></a><div></div><b></b>`. If the `<slot>` has other
   * `<slot>` elements assigned to it, these are flattened as well.
   *
   * @param {!HTMLElement|!HTMLSlotElement} node The node for which to
   *      return the list of flattened nodes.
   * @return {!Array<!Node>} The list of flattened nodes for the given `node`.
   * @nocollapse See https://github.com/google/closure-compiler/issues/2763
   */static getFlattenedNodes(node){if(isSlot(node)){node=/** @type {!HTMLSlotElement} */node;// eslint-disable-line no-self-assign
return node.assignedNodes({flatten:true});}else{return Array.from(node.childNodes).map(node=>{if(isSlot(node)){node=/** @type {!HTMLSlotElement} */node;// eslint-disable-line no-self-assign
return node.assignedNodes({flatten:true});}else{return[node];}}).reduce((a,b)=>a.concat(b),[]);}}/**
     * @param {!HTMLElement} target Node on which to listen for changes.
     * @param {?function(this: Element, { target: !HTMLElement, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Function called when there are additions
     * or removals from the target's list of flattened nodes.
     */constructor(target,callback){/**
     * @type {MutationObserver}
     * @private
     */this._shadyChildrenObserver=null;/**
                                            * @type {MutationObserver}
                                            * @private
                                            */this._nativeChildrenObserver=null;this._connected=false;/**
                              * @type {!HTMLElement}
                              * @private
                              */this._target=target;this.callback=callback;this._effectiveNodes=[];this._observer=null;this._scheduled=false;/**
                              * @type {function()}
                              * @private
                              */this._boundSchedule=()=>{this._schedule();};this.connect();this._schedule();}/**
     * Activates an observer. This method is automatically called when
     * a `FlattenedNodesObserver` is created. It should only be called to
     * re-activate an observer that has been deactivated via the `disconnect` method.
     *
     * @return {void}
     */connect(){if(isSlot(this._target)){this._listenSlots([this._target]);}else if(this._target.children){this._listenSlots(/** @type {!NodeList<!Node>} */this._target.children);if(window.ShadyDOM){this._shadyChildrenObserver=ShadyDOM.observeChildren(this._target,mutations=>{this._processMutations(mutations);});}else{this._nativeChildrenObserver=new MutationObserver(mutations=>{this._processMutations(mutations);});this._nativeChildrenObserver.observe(this._target,{childList:true});}}this._connected=true;}/**
     * Deactivates the flattened nodes observer. After calling this method
     * the observer callback will not be called when changes to flattened nodes
     * occur. The `connect` method may be subsequently called to reactivate
     * the observer.
     *
     * @return {void}
     */disconnect(){if(isSlot(this._target)){this._unlistenSlots([this._target]);}else if(this._target.children){this._unlistenSlots(/** @type {!NodeList<!Node>} */this._target.children);if(window.ShadyDOM&&this._shadyChildrenObserver){ShadyDOM.unobserveChildren(this._shadyChildrenObserver);this._shadyChildrenObserver=null;}else if(this._nativeChildrenObserver){this._nativeChildrenObserver.disconnect();this._nativeChildrenObserver=null;}}this._connected=false;}/**
     * @return {void}
     * @private
     */_schedule(){if(!this._scheduled){this._scheduled=true;microTask.run(()=>this.flush());}}/**
     * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
     * @return {void}
     * @private
     */_processMutations(mutations){this._processSlotMutations(mutations);this.flush();}/**
     * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
     * @return {void}
     * @private
     */_processSlotMutations(mutations){if(mutations){for(let i=0;i<mutations.length;i++){let mutation=mutations[i];if(mutation.addedNodes){this._listenSlots(mutation.addedNodes);}if(mutation.removedNodes){this._unlistenSlots(mutation.removedNodes);}}}}/**
     * Flushes the observer causing any pending changes to be immediately
     * delivered the observer callback. By default these changes are delivered
     * asynchronously at the next microtask checkpoint.
     *
     * @return {boolean} Returns true if any pending changes caused the observer
     * callback to run.
     */flush(){if(!this._connected){return false;}if(window.ShadyDOM){ShadyDOM.flush();}if(this._nativeChildrenObserver){this._processSlotMutations(this._nativeChildrenObserver.takeRecords());}else if(this._shadyChildrenObserver){this._processSlotMutations(this._shadyChildrenObserver.takeRecords());}this._scheduled=false;let info={target:this._target,addedNodes:[],removedNodes:[]};let newNodes=this.constructor.getFlattenedNodes(this._target);let splices=calculateSplices(newNodes,this._effectiveNodes);// process removals
for(let i=0,s;i<splices.length&&(s=splices[i]);i++){for(let j=0,n;j<s.removed.length&&(n=s.removed[j]);j++){info.removedNodes.push(n);}}// process adds
for(let i=0,s;i<splices.length&&(s=splices[i]);i++){for(let j=s.index;j<s.index+s.addedCount;j++){info.addedNodes.push(newNodes[j]);}}// update cache
this._effectiveNodes=newNodes;let didFlush=false;if(info.addedNodes.length||info.removedNodes.length){didFlush=true;this.callback.call(this._target,info);}return didFlush;}/**
     * @param {!Array<!Node>|!NodeList<!Node>} nodeList Nodes that could change
     * @return {void}
     * @private
     */_listenSlots(nodeList){for(let i=0;i<nodeList.length;i++){let n=nodeList[i];if(isSlot(n)){n.addEventListener('slotchange',this._boundSchedule);}}}/**
     * @param {!Array<!Node>|!NodeList<!Node>} nodeList Nodes that could change
     * @return {void}
     * @private
     */_unlistenSlots(nodeList){for(let i=0;i<nodeList.length;i++){let n=nodeList[i];if(isSlot(n)){n.removeEventListener('slotchange',this._boundSchedule);}}}}var flattenedNodesObserver={FlattenedNodesObserver:FlattenedNodesObserver};/* eslint-enable no-unused-vars */let debouncerQueue=[];/**
                          * Adds a `Debouncer` to a list of globally flushable tasks.
                          *
                          * @param {!Debouncer} debouncer Debouncer to enqueue
                          * @return {void}
                          */const enqueueDebouncer=function(debouncer){debouncerQueue.push(debouncer);};function flushDebouncers(){const didFlush=Boolean(debouncerQueue.length);while(debouncerQueue.length){try{debouncerQueue.shift().flush();}catch(e){setTimeout(()=>{throw e;});}}return didFlush;}/**
   * Forces several classes of asynchronously queued tasks to flush:
   * - Debouncers added via `enqueueDebouncer`
   * - ShadyDOM distribution
   *
   * @return {void}
   */const flush$1=function(){let shadyDOM,debouncers;do{shadyDOM=window.ShadyDOM&&ShadyDOM.flush();if(window.ShadyCSS&&window.ShadyCSS.ScopingShim){window.ShadyCSS.ScopingShim.flush();}debouncers=flushDebouncers();}while(shadyDOM||debouncers);};var flush$2={enqueueDebouncer:enqueueDebouncer,flush:flush$1};/* eslint-enable no-unused-vars */const p$1=Element.prototype;/**
                               * @const {function(this:Node, string): boolean}
                               */const normalizedMatchesSelector=p$1.matches||p$1.matchesSelector||p$1.mozMatchesSelector||p$1.msMatchesSelector||p$1.oMatchesSelector||p$1.webkitMatchesSelector;/**
                                                                                                                                                                              * Cross-platform `element.matches` shim.
                                                                                                                                                                              *
                                                                                                                                                                              * @function matchesSelector
                                                                                                                                                                              * @param {!Node} node Node to check selector against
                                                                                                                                                                              * @param {string} selector Selector to match
                                                                                                                                                                              * @return {boolean} True if node matched selector
                                                                                                                                                                              */const matchesSelector=function(node,selector){return normalizedMatchesSelector.call(node,selector);};/**
    * Node API wrapper class returned from `Polymer.dom.(target)` when
    * `target` is a `Node`.
    *
    */class DomApi{/**
   * @param {Node} node Node for which to create a Polymer.dom helper object.
   */constructor(node){this.node=node;}/**
     * Returns an instance of `FlattenedNodesObserver` that
     * listens for node changes on this element.
     *
     * @param {function(this:HTMLElement, { target: !HTMLElement, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Called when direct or distributed children
     *   of this element changes
     * @return {!FlattenedNodesObserver} Observer instance
     */observeNodes(callback){return new FlattenedNodesObserver(/** @type {!HTMLElement} */this.node,callback);}/**
     * Disconnects an observer previously created via `observeNodes`
     *
     * @param {!FlattenedNodesObserver} observerHandle Observer instance
     *   to disconnect.
     * @return {void}
     */unobserveNodes(observerHandle){observerHandle.disconnect();}/**
     * Provided as a backwards-compatible API only.  This method does nothing.
     * @return {void}
     */notifyObserver(){}/**
                       * Returns true if the provided node is contained with this element's
                       * light-DOM children or shadow root, including any nested shadow roots
                       * of children therein.
                       *
                       * @param {Node} node Node to test
                       * @return {boolean} Returns true if the given `node` is contained within
                       *   this element's light or shadow DOM.
                       */deepContains(node){if(this.node.contains(node)){return true;}let n=node;let doc=node.ownerDocument;// walk from node to `this` or `document`
while(n&&n!==doc&&n!==this.node){// use logical parentnode, or native ShadowRoot host
n=n.parentNode||n.host;}return n===this.node;}/**
     * Returns the root node of this node.  Equivalent to `getRootNode()`.
     *
     * @return {Node} Top most element in the dom tree in which the node
     * exists. If the node is connected to a document this is either a
     * shadowRoot or the document; otherwise, it may be the node
     * itself or a node or document fragment containing it.
     */getOwnerRoot(){return this.node.getRootNode();}/**
     * For slot elements, returns the nodes assigned to the slot; otherwise
     * an empty array. It is equivalent to `<slot>.addignedNodes({flatten:true})`.
     *
     * @return {!Array<!Node>} Array of assigned nodes
     */getDistributedNodes(){return this.node.localName==='slot'?this.node.assignedNodes({flatten:true}):[];}/**
     * Returns an array of all slots this element was distributed to.
     *
     * @return {!Array<!HTMLSlotElement>} Description
     */getDestinationInsertionPoints(){let ip$=[];let n=this.node.assignedSlot;while(n){ip$.push(n);n=n.assignedSlot;}return ip$;}/**
     * Calls `importNode` on the `ownerDocument` for this node.
     *
     * @param {!Node} node Node to import
     * @param {boolean} deep True if the node should be cloned deeply during
     *   import
     * @return {Node} Clone of given node imported to this owner document
     */importNode(node,deep){let doc=this.node instanceof Document?this.node:this.node.ownerDocument;return doc.importNode(node,deep);}/**
     * @return {!Array<!Node>} Returns a flattened list of all child nodes and
     * nodes assigned to child slots.
     */getEffectiveChildNodes(){return FlattenedNodesObserver.getFlattenedNodes(/** @type {!HTMLElement} */this.node);}/**
     * Returns a filtered list of flattened child elements for this element based
     * on the given selector.
     *
     * @param {string} selector Selector to filter nodes against
     * @return {!Array<!HTMLElement>} List of flattened child elements
     */queryDistributedElements(selector){let c$=this.getEffectiveChildNodes();let list=[];for(let i=0,l=c$.length,c;i<l&&(c=c$[i]);i++){if(c.nodeType===Node.ELEMENT_NODE&&matchesSelector(c,selector)){list.push(c);}}return list;}/**
     * For shadow roots, returns the currently focused element within this
     * shadow root.
     *
     * @return {Node|undefined} Currently focused element
     */get activeElement(){let node=this.node;return node._activeElement!==undefined?node._activeElement:node.activeElement;}}function forwardMethods(proto,methods){for(let i=0;i<methods.length;i++){let method=methods[i];/* eslint-disable valid-jsdoc */proto[method]=/** @this {DomApi} */function(){return this.node[method].apply(this.node,arguments);};/* eslint-enable */}}function forwardReadOnlyProperties(proto,properties){for(let i=0;i<properties.length;i++){let name=properties[i];Object.defineProperty(proto,name,{get:function(){const domApi=/** @type {DomApi} */this;return domApi.node[name];},configurable:true});}}function forwardProperties(proto,properties){for(let i=0;i<properties.length;i++){let name=properties[i];Object.defineProperty(proto,name,{/**
       * @this {DomApi}
       * @return {*} .
       */get:function(){return this.node[name];},/**
       * @this {DomApi}
       * @param {*} value .
       */set:function(value){this.node[name]=value;},configurable:true});}}/**
   * Event API wrapper class returned from `dom.(target)` when
   * `target` is an `Event`.
   */class EventApi{constructor(event){this.event=event;}/**
     * Returns the first node on the `composedPath` of this event.
     *
     * @return {!EventTarget} The node this event was dispatched to
     */get rootTarget(){return this.event.composedPath()[0];}/**
     * Returns the local (re-targeted) target for this event.
     *
     * @return {!EventTarget} The local (re-targeted) target for this event.
     */get localTarget(){return this.event.target;}/**
     * Returns the `composedPath` for this event.
     * @return {!Array<!EventTarget>} The nodes this event propagated through
     */get path(){return this.event.composedPath();}}/**
   * @function
   * @param {boolean=} deep
   * @return {!Node}
   */DomApi.prototype.cloneNode;/**
                             * @function
                             * @param {!Node} node
                             * @return {!Node}
                             */DomApi.prototype.appendChild;/**
                               * @function
                               * @param {!Node} newChild
                               * @param {Node} refChild
                               * @return {!Node}
                               */DomApi.prototype.insertBefore;/**
                                * @function
                                * @param {!Node} node
                                * @return {!Node}
                                */DomApi.prototype.removeChild;/**
                               * @function
                               * @param {!Node} oldChild
                               * @param {!Node} newChild
                               * @return {!Node}
                               */DomApi.prototype.replaceChild;/**
                                * @function
                                * @param {string} name
                                * @param {string} value
                                * @return {void}
                                */DomApi.prototype.setAttribute;/**
                                * @function
                                * @param {string} name
                                * @return {void}
                                */DomApi.prototype.removeAttribute;/**
                                   * @function
                                   * @param {string} selector
                                   * @return {?Element}
                                   */DomApi.prototype.querySelector;/**
                                 * @function
                                 * @param {string} selector
                                 * @return {!NodeList<!Element>}
                                 */DomApi.prototype.querySelectorAll;/** @type {?Node} */DomApi.prototype.parentNode;/** @type {?Node} */DomApi.prototype.firstChild;/** @type {?Node} */DomApi.prototype.lastChild;/** @type {?Node} */DomApi.prototype.nextSibling;/** @type {?Node} */DomApi.prototype.previousSibling;/** @type {?HTMLElement} */DomApi.prototype.firstElementChild;/** @type {?HTMLElement} */DomApi.prototype.lastElementChild;/** @type {?HTMLElement} */DomApi.prototype.nextElementSibling;/** @type {?HTMLElement} */DomApi.prototype.previousElementSibling;/** @type {!Array<!Node>} */DomApi.prototype.childNodes;/** @type {!Array<!HTMLElement>} */DomApi.prototype.children;/** @type {?DOMTokenList} */DomApi.prototype.classList;/** @type {string} */DomApi.prototype.textContent;/** @type {string} */DomApi.prototype.innerHTML;forwardMethods(DomApi.prototype,['cloneNode','appendChild','insertBefore','removeChild','replaceChild','setAttribute','removeAttribute','querySelector','querySelectorAll']);forwardReadOnlyProperties(DomApi.prototype,['parentNode','firstChild','lastChild','nextSibling','previousSibling','firstElementChild','lastElementChild','nextElementSibling','previousElementSibling','childNodes','children','classList']);forwardProperties(DomApi.prototype,['textContent','innerHTML']);/**
                                                                    * Legacy DOM and Event manipulation API wrapper factory used to abstract
                                                                    * differences between native Shadow DOM and "Shady DOM" when polyfilling on
                                                                    * older browsers.
                                                                    *
                                                                    * Note that in Polymer 2.x use of `Polymer.dom` is no longer required and
                                                                    * in the majority of cases simply facades directly to the standard native
                                                                    * API.
                                                                    *
                                                                    * @summary Legacy DOM and Event manipulation API wrapper factory used to
                                                                    * abstract differences between native Shadow DOM and "Shady DOM."
                                                                    * @param {(Node|Event)=} obj Node or event to operate on
                                                                    * @return {!DomApi|!EventApi} Wrapper providing either node API or event API
                                                                    */const dom=function(obj){obj=obj||document;if(!obj.__domApi){let helper;if(obj instanceof Event){helper=new EventApi(obj);}else{helper=new DomApi(obj);}obj.__domApi=helper;}return obj.__domApi;};var polymer_dom={matchesSelector:matchesSelector,DomApi:DomApi,EventApi:EventApi,dom:dom,flush:flush$1,addDebouncer:enqueueDebouncer};const bundledImportMeta$1={...import.meta,url:new URL('../../node_modules/%40polymer/polymer/lib/legacy/legacy-element-mixin.js',import.meta.url).href};let styleInterface=window.ShadyCSS;/**
                                       * Element class mixin that provides Polymer's "legacy" API intended to be
                                       * backward-compatible to the greatest extent possible with the API
                                       * found on the Polymer 1.x `Polymer.Base` prototype applied to all elements
                                       * defined using the `Polymer({...})` function.
                                       *
                                       * @mixinFunction
                                       * @polymer
                                       * @appliesMixin ElementMixin
                                       * @appliesMixin GestureEventListeners
                                       * @property isAttached {boolean} Set to `true` in this element's
                                       *   `connectedCallback` and `false` in `disconnectedCallback`
                                       * @summary Element class mixin that provides Polymer's "legacy" API
                                       */const LegacyElementMixin=dedupingMixin(base=>{/**
   * @constructor
   * @extends {base}
   * @implements {Polymer_ElementMixin}
   * @implements {Polymer_GestureEventListeners}
   * @implements {Polymer_DirMixin}
   * @private
   */const legacyElementBase=DirMixin(GestureEventListeners(ElementMixin(base)));/**
                                                                                     * Map of simple names to touch action names
                                                                                     * @dict
                                                                                     */const DIRECTION_MAP={'x':'pan-x','y':'pan-y','none':'none','all':'auto'};/**
      * @polymer
      * @mixinClass
      * @extends {legacyElementBase}
      * @implements {Polymer_LegacyElementMixin}
      * @unrestricted
      */class LegacyElement extends legacyElementBase{constructor(){super();/** @type {boolean} */this.isAttached;/** @type {WeakMap<!Element, !Object<string, !Function>>} */this.__boundListeners;/** @type {Object<string, Function>} */this._debouncers;// Ensure listeners are applied immediately so that they are
// added before declarative event listeners. This allows an element to
// decorate itself via an event prior to any declarative listeners
// seeing the event. Note, this ensures compatibility with 1.x ordering.
this._applyListeners();}/**
       * Forwards `importMeta` from the prototype (i.e. from the info object
       * passed to `Polymer({...})`) to the static API.
       *
       * @return {!Object} The `import.meta` object set on the prototype
       * @suppress {missingProperties} `this` is always in the instance in
       *  closure for some reason even in a static method, rather than the class
       */static get importMeta(){return this.prototype.importMeta;}/**
       * Legacy callback called during the `constructor`, for overriding
       * by the user.
       * @return {void}
       */created(){}/**
                  * Provides an implementation of `connectedCallback`
                  * which adds Polymer legacy API's `attached` method.
                  * @return {void}
                  * @override
                  */connectedCallback(){super.connectedCallback();this.isAttached=true;this.attached();}/**
       * Legacy callback called during `connectedCallback`, for overriding
       * by the user.
       * @return {void}
       */attached(){}/**
                   * Provides an implementation of `disconnectedCallback`
                   * which adds Polymer legacy API's `detached` method.
                   * @return {void}
                   * @override
                   */disconnectedCallback(){super.disconnectedCallback();this.isAttached=false;this.detached();}/**
       * Legacy callback called during `disconnectedCallback`, for overriding
       * by the user.
       * @return {void}
       */detached(){}/**
                   * Provides an override implementation of `attributeChangedCallback`
                   * which adds the Polymer legacy API's `attributeChanged` method.
                   * @param {string} name Name of attribute.
                   * @param {?string} old Old value of attribute.
                   * @param {?string} value Current value of attribute.
                   * @param {?string} namespace Attribute namespace.
                   * @return {void}
                   * @override
                   */attributeChangedCallback(name,old,value,namespace){if(old!==value){super.attributeChangedCallback(name,old,value,namespace);this.attributeChanged(name,old,value);}}/**
       * Legacy callback called during `attributeChangedChallback`, for overriding
       * by the user.
       * @param {string} name Name of attribute.
       * @param {?string} old Old value of attribute.
       * @param {?string} value Current value of attribute.
       * @return {void}
       */attributeChanged(name,old,value){}// eslint-disable-line no-unused-vars
/**
     * Overrides the default `Polymer.PropertyEffects` implementation to
     * add support for class initialization via the `_registered` callback.
     * This is called only when the first instance of the element is created.
     *
     * @return {void}
     * @override
     * @suppress {invalidCasts}
     */_initializeProperties(){let proto=Object.getPrototypeOf(this);if(!proto.hasOwnProperty('__hasRegisterFinished')){proto.__hasRegisterFinished=true;this._registered();}super._initializeProperties();this.root=/** @type {HTMLElement} */this;this.created();}/**
       * Called automatically when an element is initializing.
       * Users may override this method to perform class registration time
       * work. The implementation should ensure the work is performed
       * only once for the class.
       * @protected
       * @return {void}
       */_registered(){}/**
                      * Overrides the default `Polymer.PropertyEffects` implementation to
                      * add support for installing `hostAttributes` and `listeners`.
                      *
                      * @return {void}
                      * @override
                      */ready(){this._ensureAttributes();super.ready();}/**
       * Ensures an element has required attributes. Called when the element
       * is being readied via `ready`. Users should override to set the
       * element's required attributes. The implementation should be sure
       * to check and not override existing attributes added by
       * the user of the element. Typically, setting attributes should be left
       * to the element user and not done here; reasonable exceptions include
       * setting aria roles and focusability.
       * @protected
       * @return {void}
       */_ensureAttributes(){}/**
                            * Adds element event listeners. Called when the element
                            * is being readied via `ready`. Users should override to
                            * add any required element event listeners.
                            * In performance critical elements, the work done here should be kept
                            * to a minimum since it is done before the element is rendered. In
                            * these elements, consider adding listeners asynchronously so as not to
                            * block render.
                            * @protected
                            * @return {void}
                            */_applyListeners(){}/**
                          * Converts a typed JavaScript value to a string.
                          *
                          * Note this method is provided as backward-compatible legacy API
                          * only.  It is not directly called by any Polymer features. To customize
                          * how properties are serialized to attributes for attribute bindings and
                          * `reflectToAttribute: true` properties as well as this method, override
                          * the `_serializeValue` method provided by `Polymer.PropertyAccessors`.
                          *
                          * @param {*} value Value to deserialize
                          * @return {string | undefined} Serialized value
                          */serialize(value){return this._serializeValue(value);}/**
       * Converts a string to a typed JavaScript value.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.  To customize
       * how attributes are deserialized to properties for in
       * `attributeChangedCallback`, override `_deserializeValue` method
       * provided by `Polymer.PropertyAccessors`.
       *
       * @param {string} value String to deserialize
       * @param {*} type Type to deserialize the string to
       * @return {*} Returns the deserialized value in the `type` given.
       */deserialize(value,type){return this._deserializeValue(value,type);}/**
       * Serializes a property to its associated attribute.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.
       *
       * @param {string} property Property name to reflect.
       * @param {string=} attribute Attribute name to reflect.
       * @param {*=} value Property value to reflect.
       * @return {void}
       */reflectPropertyToAttribute(property,attribute,value){this._propertyToAttribute(property,attribute,value);}/**
       * Sets a typed value to an HTML attribute on a node.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.
       *
       * @param {*} value Value to serialize.
       * @param {string} attribute Attribute name to serialize to.
       * @param {Element} node Element to set attribute to.
       * @return {void}
       */serializeValueToAttribute(value,attribute,node){this._valueToNodeAttribute(/** @type {Element} */node||this,value,attribute);}/**
       * Copies own properties (including accessor descriptors) from a source
       * object to a target object.
       *
       * @param {Object} prototype Target object to copy properties to.
       * @param {Object} api Source object to copy properties from.
       * @return {Object} prototype object that was passed as first argument.
       */extend(prototype,api){if(!(prototype&&api)){return prototype||api;}let n$=Object.getOwnPropertyNames(api);for(let i=0,n;i<n$.length&&(n=n$[i]);i++){let pd=Object.getOwnPropertyDescriptor(api,n);if(pd){Object.defineProperty(prototype,n,pd);}}return prototype;}/**
       * Copies props from a source object to a target object.
       *
       * Note, this method uses a simple `for...in` strategy for enumerating
       * properties.  To ensure only `ownProperties` are copied from source
       * to target and that accessor implementations are copied, use `extend`.
       *
       * @param {!Object} target Target object to copy properties to.
       * @param {!Object} source Source object to copy properties from.
       * @return {!Object} Target object that was passed as first argument.
       */mixin(target,source){for(let i in source){target[i]=source[i];}return target;}/**
       * Sets the prototype of an object.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.
       * @param {Object} object The object on which to set the prototype.
       * @param {Object} prototype The prototype that will be set on the given
       * `object`.
       * @return {Object} Returns the given `object` with its prototype set
       * to the given `prototype` object.
       */chainObject(object,prototype){if(object&&prototype&&object!==prototype){object.__proto__=prototype;}return object;}/* **** Begin Template **** */ /**
                                      * Calls `importNode` on the `content` of the `template` specified and
                                      * returns a document fragment containing the imported content.
                                      *
                                      * @param {HTMLTemplateElement} template HTML template element to instance.
                                      * @return {!DocumentFragment} Document fragment containing the imported
                                      *   template content.
                                     */instanceTemplate(template){let content=this.constructor._contentForTemplate(template);let dom$$1=/** @type {!DocumentFragment} */document.importNode(content,true);return dom$$1;}/* **** Begin Events **** */ /**
                                    * Dispatches a custom event with an optional detail value.
                                    *
                                    * @param {string} type Name of event type.
                                    * @param {*=} detail Detail value containing event-specific
                                    *   payload.
                                    * @param {{ bubbles: (boolean|undefined), cancelable: (boolean|undefined), composed: (boolean|undefined) }=}
                                    *  options Object specifying options.  These may include:
                                    *  `bubbles` (boolean, defaults to `true`),
                                    *  `cancelable` (boolean, defaults to false), and
                                    *  `node` on which to fire the event (HTMLElement, defaults to `this`).
                                    * @return {!Event} The new event that was fired.
                                    */fire(type,detail,options){options=options||{};detail=detail===null||detail===undefined?{}:detail;let event=new Event(type,{bubbles:options.bubbles===undefined?true:options.bubbles,cancelable:Boolean(options.cancelable),composed:options.composed===undefined?true:options.composed});event.detail=detail;let node=options.node||this;node.dispatchEvent(event);return event;}/**
       * Convenience method to add an event listener on a given element,
       * late bound to a named method on this element.
       *
       * @param {?EventTarget} node Element to add event listener to.
       * @param {string} eventName Name of event to listen for.
       * @param {string} methodName Name of handler method on `this` to call.
       * @return {void}
       */listen(node,eventName,methodName){node=/** @type {!EventTarget} */node||this;let hbl=this.__boundListeners||(this.__boundListeners=new WeakMap());let bl=hbl.get(node);if(!bl){bl={};hbl.set(node,bl);}let key=eventName+methodName;if(!bl[key]){bl[key]=this._addMethodEventListenerToNode(node,eventName,methodName,this);}}/**
       * Convenience method to remove an event listener from a given element,
       * late bound to a named method on this element.
       *
       * @param {?EventTarget} node Element to remove event listener from.
       * @param {string} eventName Name of event to stop listening to.
       * @param {string} methodName Name of handler method on `this` to not call
       anymore.
       * @return {void}
       */unlisten(node,eventName,methodName){node=/** @type {!EventTarget} */node||this;let bl=this.__boundListeners&&this.__boundListeners.get(node);let key=eventName+methodName;let handler=bl&&bl[key];if(handler){this._removeEventListenerFromNode(node,eventName,handler);bl[key]=null;}}/**
       * Override scrolling behavior to all direction, one direction, or none.
       *
       * Valid scroll directions:
       *   - 'all': scroll in any direction
       *   - 'x': scroll only in the 'x' direction
       *   - 'y': scroll only in the 'y' direction
       *   - 'none': disable scrolling for this node
       *
       * @param {string=} direction Direction to allow scrolling
       * Defaults to `all`.
       * @param {Element=} node Element to apply scroll direction setting.
       * Defaults to `this`.
       * @return {void}
       */setScrollDirection(direction,node){setTouchAction(/** @type {Element} */node||this,DIRECTION_MAP[direction]||'auto');}/* **** End Events **** */ /**
                                  * Convenience method to run `querySelector` on this local DOM scope.
                                  *
                                  * This function calls `Polymer.dom(this.root).querySelector(slctr)`.
                                  *
                                  * @param {string} slctr Selector to run on this local DOM scope
                                  * @return {Element} Element found by the selector, or null if not found.
                                  */$$(slctr){return this.root.querySelector(slctr);}/**
       * Return the element whose local dom within which this element
       * is contained. This is a shorthand for
       * `this.getRootNode().host`.
       * @this {Element}
       */get domHost(){let root$$1=this.getRootNode();return root$$1 instanceof DocumentFragment?/** @type {ShadowRoot} */root$$1.host:root$$1;}/**
       * Force this element to distribute its children to its local dom.
       * This should not be necessary as of Polymer 2.0.2 and is provided only
       * for backwards compatibility.
       * @return {void}
       */distributeContent(){if(window.ShadyDOM&&this.shadowRoot){ShadyDOM.flush();}}/**
       * Returns a list of nodes that are the effective childNodes. The effective
       * childNodes list is the same as the element's childNodes except that
       * any `<content>` elements are replaced with the list of nodes distributed
       * to the `<content>`, the result of its `getDistributedNodes` method.
       * @return {!Array<!Node>} List of effective child nodes.
       * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
       */getEffectiveChildNodes(){const thisEl=/** @type {Element} */this;const domApi=/** @type {DomApi} */dom(thisEl);return domApi.getEffectiveChildNodes();}/**
       * Returns a list of nodes distributed within this element that match
       * `selector`. These can be dom children or elements distributed to
       * children that are insertion points.
       * @param {string} selector Selector to run.
       * @return {!Array<!Node>} List of distributed elements that match selector.
       * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
       */queryDistributedElements(selector){const thisEl=/** @type {Element} */this;const domApi=/** @type {DomApi} */dom(thisEl);return domApi.queryDistributedElements(selector);}/**
       * Returns a list of elements that are the effective children. The effective
       * children list is the same as the element's children except that
       * any `<content>` elements are replaced with the list of elements
       * distributed to the `<content>`.
       *
       * @return {!Array<!Node>} List of effective children.
       */getEffectiveChildren(){let list=this.getEffectiveChildNodes();return list.filter(function(/** @type {!Node} */n){return n.nodeType===Node.ELEMENT_NODE;});}/**
       * Returns a string of text content that is the concatenation of the
       * text content's of the element's effective childNodes (the elements
       * returned by <a href="#getEffectiveChildNodes>getEffectiveChildNodes</a>.
       *
       * @return {string} List of effective children.
       */getEffectiveTextContent(){let cn=this.getEffectiveChildNodes();let tc=[];for(let i=0,c;c=cn[i];i++){if(c.nodeType!==Node.COMMENT_NODE){tc.push(c.textContent);}}return tc.join('');}/**
       * Returns the first effective childNode within this element that
       * match `selector`. These can be dom child nodes or elements distributed
       * to children that are insertion points.
       * @param {string} selector Selector to run.
       * @return {Node} First effective child node that matches selector.
       */queryEffectiveChildren(selector){let e$=this.queryDistributedElements(selector);return e$&&e$[0];}/**
       * Returns a list of effective childNodes within this element that
       * match `selector`. These can be dom child nodes or elements distributed
       * to children that are insertion points.
       * @param {string} selector Selector to run.
       * @return {!Array<!Node>} List of effective child nodes that match selector.
       */queryAllEffectiveChildren(selector){return this.queryDistributedElements(selector);}/**
       * Returns a list of nodes distributed to this element's `<slot>`.
       *
       * If this element contains more than one `<slot>` in its local DOM,
       * an optional selector may be passed to choose the desired content.
       *
       * @param {string=} slctr CSS selector to choose the desired
       *   `<slot>`.  Defaults to `content`.
       * @return {!Array<!Node>} List of distributed nodes for the `<slot>`.
       */getContentChildNodes(slctr){let content=this.root.querySelector(slctr||'slot');return content?/** @type {DomApi} */dom(content).getDistributedNodes():[];}/**
       * Returns a list of element children distributed to this element's
       * `<slot>`.
       *
       * If this element contains more than one `<slot>` in its
       * local DOM, an optional selector may be passed to choose the desired
       * content.  This method differs from `getContentChildNodes` in that only
       * elements are returned.
       *
       * @param {string=} slctr CSS selector to choose the desired
       *   `<content>`.  Defaults to `content`.
       * @return {!Array<!HTMLElement>} List of distributed nodes for the
       *   `<slot>`.
       * @suppress {invalidCasts}
       */getContentChildren(slctr){let children=/** @type {!Array<!HTMLElement>} */this.getContentChildNodes(slctr).filter(function(n){return n.nodeType===Node.ELEMENT_NODE;});return children;}/**
       * Checks whether an element is in this element's light DOM tree.
       *
       * @param {?Node} node The element to be checked.
       * @return {boolean} true if node is in this element's light DOM tree.
       * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
       */isLightDescendant(node){const thisNode=/** @type {Node} */this;return thisNode!==node&&thisNode.contains(node)&&thisNode.getRootNode()===node.getRootNode();}/**
       * Checks whether an element is in this element's local DOM tree.
       *
       * @param {!Element} node The element to be checked.
       * @return {boolean} true if node is in this element's local DOM tree.
       */isLocalDescendant(node){return this.root===node.getRootNode();}/**
       * No-op for backwards compatibility. This should now be handled by
       * ShadyCss library.
       * @param  {*} container Unused
       * @param  {*} shouldObserve Unused
       * @return {void}
       */scopeSubtree(container,shouldObserve){}// eslint-disable-line no-unused-vars
/**
     * Returns the computed style value for the given property.
     * @param {string} property The css property name.
     * @return {string} Returns the computed css property value for the given
     * `property`.
     * @suppress {invalidCasts} LegacyElementMixin must be applied to an HTMLElement
     */getComputedStyleValue(property){return styleInterface.getComputedStyleValue(/** @type {!Element} */this,property);}// debounce
/**
     * Call `debounce` to collapse multiple requests for a named task into
     * one invocation which is made after the wait time has elapsed with
     * no new request.  If no wait time is given, the callback will be called
     * at microtask timing (guaranteed before paint).
     *
     *     debouncedClickAction(e) {
     *       // will not call `processClick` more than once per 100ms
     *       this.debounce('click', function() {
     *        this.processClick();
     *       } 100);
     *     }
     *
     * @param {string} jobName String to identify the debounce job.
     * @param {function():void} callback Function that is called (with `this`
     *   context) when the wait time elapses.
     * @param {number} wait Optional wait time in milliseconds (ms) after the
     *   last signal that must elapse before invoking `callback`
     * @return {!Object} Returns a debouncer object on which exists the
     * following methods: `isActive()` returns true if the debouncer is
     * active; `cancel()` cancels the debouncer if it is active;
     * `flush()` immediately invokes the debounced callback if the debouncer
     * is active.
     */debounce(jobName,callback,wait){this._debouncers=this._debouncers||{};return this._debouncers[jobName]=Debouncer.debounce(this._debouncers[jobName],wait>0?timeOut.after(wait):microTask,callback.bind(this));}/**
       * Returns whether a named debouncer is active.
       *
       * @param {string} jobName The name of the debouncer started with `debounce`
       * @return {boolean} Whether the debouncer is active (has not yet fired).
       */isDebouncerActive(jobName){this._debouncers=this._debouncers||{};let debouncer=this._debouncers[jobName];return!!(debouncer&&debouncer.isActive());}/**
       * Immediately calls the debouncer `callback` and inactivates it.
       *
       * @param {string} jobName The name of the debouncer started with `debounce`
       * @return {void}
       */flushDebouncer(jobName){this._debouncers=this._debouncers||{};let debouncer=this._debouncers[jobName];if(debouncer){debouncer.flush();}}/**
       * Cancels an active debouncer.  The `callback` will not be called.
       *
       * @param {string} jobName The name of the debouncer started with `debounce`
       * @return {void}
       */cancelDebouncer(jobName){this._debouncers=this._debouncers||{};let debouncer=this._debouncers[jobName];if(debouncer){debouncer.cancel();}}/**
       * Runs a callback function asynchronously.
       *
       * By default (if no waitTime is specified), async callbacks are run at
       * microtask timing, which will occur before paint.
       *
       * @param {!Function} callback The callback function to run, bound to `this`.
       * @param {number=} waitTime Time to wait before calling the
       *   `callback`.  If unspecified or 0, the callback will be run at microtask
       *   timing (before paint).
       * @return {number} Handle that may be used to cancel the async job.
       */async(callback,waitTime){return waitTime>0?timeOut.run(callback.bind(this),waitTime):~microTask.run(callback.bind(this));}/**
       * Cancels an async operation started with `async`.
       *
       * @param {number} handle Handle returned from original `async` call to
       *   cancel.
       * @return {void}
       */cancelAsync(handle){handle<0?microTask.cancel(~handle):timeOut.cancel(handle);}// other
/**
     * Convenience method for creating an element and configuring it.
     *
     * @param {string} tag HTML element tag to create.
     * @param {Object=} props Object of properties to configure on the
     *    instance.
     * @return {!Element} Newly created and configured element.
     */create(tag,props){let elt=document.createElement(tag);if(props){if(elt.setProperties){elt.setProperties(props);}else{for(let n in props){elt[n]=props[n];}}}return elt;}/**
       * Polyfill for Element.prototype.matches, which is sometimes still
       * prefixed.
       *
       * @param {string} selector Selector to test.
       * @param {!Element=} node Element to test the selector against.
       * @return {boolean} Whether the element matches the selector.
       */elementMatches(selector,node){return matchesSelector(node||this,selector);}/**
       * Toggles an HTML attribute on or off.
       *
       * @param {string} name HTML attribute name
       * @param {boolean=} bool Boolean to force the attribute on or off.
       *    When unspecified, the state of the attribute will be reversed.
       * @return {boolean} true if the attribute now exists
       */toggleAttribute(name,bool){let node=/** @type {Element} */this;if(arguments.length===3){node=/** @type {Element} */arguments[2];}if(arguments.length==1){bool=!node.hasAttribute(name);}if(bool){node.setAttribute(name,'');return true;}else{node.removeAttribute(name);return false;}}/**
       * Toggles a CSS class on or off.
       *
       * @param {string} name CSS class name
       * @param {boolean=} bool Boolean to force the class on or off.
       *    When unspecified, the state of the class will be reversed.
       * @param {Element=} node Node to target.  Defaults to `this`.
       * @return {void}
       */toggleClass(name,bool,node){node=/** @type {Element} */node||this;if(arguments.length==1){bool=!node.classList.contains(name);}if(bool){node.classList.add(name);}else{node.classList.remove(name);}}/**
       * Cross-platform helper for setting an element's CSS `transform` property.
       *
       * @param {string} transformText Transform setting.
       * @param {Element=} node Element to apply the transform to.
       * Defaults to `this`
       * @return {void}
       */transform(transformText,node){node=/** @type {Element} */node||this;node.style.webkitTransform=transformText;node.style.transform=transformText;}/**
       * Cross-platform helper for setting an element's CSS `translate3d`
       * property.
       *
       * @param {number} x X offset.
       * @param {number} y Y offset.
       * @param {number} z Z offset.
       * @param {Element=} node Element to apply the transform to.
       * Defaults to `this`.
       * @return {void}
       */translate3d(x,y,z,node){node=/** @type {Element} */node||this;this.transform('translate3d('+x+','+y+','+z+')',node);}/**
       * Removes an item from an array, if it exists.
       *
       * If the array is specified by path, a change notification is
       * generated, so that observers, data bindings and computed
       * properties watching that path can update.
       *
       * If the array is passed directly, **no change
       * notification is generated**.
       *
       * @param {string | !Array<number|string>} arrayOrPath Path to array from which to remove the item
       *   (or the array itself).
       * @param {*} item Item to remove.
       * @return {Array} Array containing item removed.
       */arrayDelete(arrayOrPath,item){let index;if(Array.isArray(arrayOrPath)){index=arrayOrPath.indexOf(item);if(index>=0){return arrayOrPath.splice(index,1);}}else{let arr=get(this,arrayOrPath);index=arr.indexOf(item);if(index>=0){return this.splice(arrayOrPath,index,1);}}return null;}// logging
/**
     * Facades `console.log`/`warn`/`error` as override point.
     *
     * @param {string} level One of 'log', 'warn', 'error'
     * @param {Array} args Array of strings or objects to log
     * @return {void}
     */_logger(level,args){// accept ['foo', 'bar'] and [['foo', 'bar']]
if(Array.isArray(args)&&args.length===1&&Array.isArray(args[0])){args=args[0];}switch(level){case'log':case'warn':case'error':console[level](...args);}}/**
       * Facades `console.log` as an override point.
       *
       * @param {...*} args Array of strings or objects to log
       * @return {void}
       */_log(...args){this._logger('log',args);}/**
       * Facades `console.warn` as an override point.
       *
       * @param {...*} args Array of strings or objects to log
       * @return {void}
       */_warn(...args){this._logger('warn',args);}/**
       * Facades `console.error` as an override point.
       *
       * @param {...*} args Array of strings or objects to log
       * @return {void}
       */_error(...args){this._logger('error',args);}/**
       * Formats a message using the element type an a method name.
       *
       * @param {string} methodName Method name to associate with message
       * @param {...*} args Array of strings or objects to log
       * @return {Array} Array with formatting information for `console`
       *   logging.
       */_logf(methodName,...args){return['[%s::%s]',this.is,methodName,...args];}}LegacyElement.prototype.is='';return LegacyElement;});var legacyElementMixin={LegacyElementMixin:LegacyElementMixin};let metaProps={attached:true,detached:true,ready:true,created:true,beforeRegister:true,registered:true,attributeChanged:true,// meta objects
behaviors:true};/**
    * Applies a "legacy" behavior or array of behaviors to the provided class.
    *
    * Note: this method will automatically also apply the `LegacyElementMixin`
    * to ensure that any legacy behaviors can rely on legacy Polymer API on
    * the underlying element.
    *
    * @function
    * @template T
    * @param {!Object|!Array<!Object>} behaviors Behavior object or array of behaviors.
    * @param {function(new:T)} klass Element class.
    * @return {?} Returns a new Element class extended by the
    * passed in `behaviors` and also by `LegacyElementMixin`.
    * @suppress {invalidCasts, checkTypes}
    */function mixinBehaviors(behaviors,klass){if(!behaviors){klass=/** @type {HTMLElement} */klass;// eslint-disable-line no-self-assign
return klass;}// NOTE: ensure the behavior is extending a class with
// legacy element api. This is necessary since behaviors expect to be able
// to access 1.x legacy api.
klass=LegacyElementMixin(klass);if(!Array.isArray(behaviors)){behaviors=[behaviors];}let superBehaviors=klass.prototype.behaviors;// get flattened, deduped list of behaviors *not* already on super class
behaviors=flattenBehaviors(behaviors,null,superBehaviors);// mixin new behaviors
klass=_mixinBehaviors(behaviors,klass);if(superBehaviors){behaviors=superBehaviors.concat(behaviors);}// Set behaviors on prototype for BC...
klass.prototype.behaviors=behaviors;return klass;}// NOTE:
// 1.x
// Behaviors were mixed in *in reverse order* and de-duped on the fly.
// The rule was that behavior properties were copied onto the element
// prototype if and only if the property did not already exist.
// Given: Polymer{ behaviors: [A, B, C, A, B]}, property copy order was:
// (1), B, (2), A, (3) C. This means prototype properties win over
// B properties win over A win over C. This mirrors what would happen
// with inheritance if element extended B extended A extended C.
//
// Again given, Polymer{ behaviors: [A, B, C, A, B]}, the resulting
// `behaviors` array was [C, A, B].
// Behavior lifecycle methods were called in behavior array order
// followed by the element, e.g. (1) C.created, (2) A.created,
// (3) B.created, (4) element.created. There was no support for
// super, and "super-behavior" methods were callable only by name).
//
// 2.x
// Behaviors are made into proper mixins which live in the
// element's prototype chain. Behaviors are placed in the element prototype
// eldest to youngest and de-duped youngest to oldest:
// So, first [A, B, C, A, B] becomes [C, A, B] then,
// the element prototype becomes (oldest) (1) PolymerElement, (2) class(C),
// (3) class(A), (4) class(B), (5) class(Polymer({...})).
// Result:
// This means element properties win over B properties win over A win
// over C. (same as 1.x)
// If lifecycle is called (super then me), order is
// (1) C.created, (2) A.created, (3) B.created, (4) element.created
// (again same as 1.x)
function _mixinBehaviors(behaviors,klass){for(let i=0;i<behaviors.length;i++){let b=behaviors[i];if(b){klass=Array.isArray(b)?_mixinBehaviors(b,klass):GenerateClassFromInfo(b,klass);}}return klass;}/**
   * @param {Array} behaviors List of behaviors to flatten.
   * @param {Array=} list Target list to flatten behaviors into.
   * @param {Array=} exclude List of behaviors to exclude from the list.
   * @return {!Array} Returns the list of flattened behaviors.
   */function flattenBehaviors(behaviors,list,exclude){list=list||[];for(let i=behaviors.length-1;i>=0;i--){let b=behaviors[i];if(b){if(Array.isArray(b)){flattenBehaviors(b,list);}else{// dedup
if(list.indexOf(b)<0&&(!exclude||exclude.indexOf(b)<0)){list.unshift(b);}}}else{console.warn('behavior is null, check for missing or 404 import');}}return list;}/**
   * @param {!PolymerInit} info Polymer info object
   * @param {function(new:HTMLElement)} Base base class to extend with info object
   * @return {function(new:HTMLElement)} Generated class
   * @suppress {checkTypes}
   * @private
   */function GenerateClassFromInfo(info,Base){/** @private */class PolymerGenerated extends Base{static get properties(){return info.properties;}static get observers(){return info.observers;}/**
       * @return {void}
       */created(){super.created();if(info.created){info.created.call(this);}}/**
       * @return {void}
       */_registered(){super._registered();/* NOTE: `beforeRegister` is called here for bc, but the behavior
                            is different than in 1.x. In 1.0, the method was called *after*
                            mixing prototypes together but *before* processing of meta-objects.
                            However, dynamic effects can still be set here and can be done either
                            in `beforeRegister` or `registered`. It is no longer possible to set
                            `is` in `beforeRegister` as you could in 1.x.
                           */if(info.beforeRegister){info.beforeRegister.call(Object.getPrototypeOf(this));}if(info.registered){info.registered.call(Object.getPrototypeOf(this));}}/**
       * @return {void}
       */_applyListeners(){super._applyListeners();if(info.listeners){for(let l in info.listeners){this._addMethodEventListenerToNode(this,l,info.listeners[l]);}}}// note: exception to "super then me" rule;
// do work before calling super so that super attributes
// only apply if not already set.
/**
     * @return {void}
     */_ensureAttributes(){if(info.hostAttributes){for(let a in info.hostAttributes){this._ensureAttribute(a,info.hostAttributes[a]);}}super._ensureAttributes();}/**
       * @return {void}
       */ready(){super.ready();if(info.ready){info.ready.call(this);}}/**
       * @return {void}
       */attached(){super.attached();if(info.attached){info.attached.call(this);}}/**
       * @return {void}
       */detached(){super.detached();if(info.detached){info.detached.call(this);}}/**
       * Implements native Custom Elements `attributeChangedCallback` to
       * set an attribute value to a property via `_attributeToProperty`.
       *
       * @param {string} name Name of attribute that changed
       * @param {?string} old Old attribute value
       * @param {?string} value New attribute value
       * @return {void}
       */attributeChanged(name,old,value){super.attributeChanged(name,old,value);if(info.attributeChanged){info.attributeChanged.call(this,name,old,value);}}}PolymerGenerated.generatedFrom=info;for(let p in info){// NOTE: cannot copy `metaProps` methods onto prototype at least because
// `super.ready` must be called and is not included in the user fn.
if(!(p in metaProps)){let pd=Object.getOwnPropertyDescriptor(info,p);if(pd){Object.defineProperty(PolymerGenerated.prototype,p,pd);}}}return PolymerGenerated;}/**
   * Generates a class that extends `LegacyElement` based on the
   * provided info object.  Metadata objects on the `info` object
   * (`properties`, `observers`, `listeners`, `behaviors`, `is`) are used
   * for Polymer's meta-programming systems, and any functions are copied
   * to the generated class.
   *
   * Valid "metadata" values are as follows:
   *
   * `is`: String providing the tag name to register the element under. In
   * addition, if a `dom-module` with the same id exists, the first template
   * in that `dom-module` will be stamped into the shadow root of this element,
   * with support for declarative event listeners (`on-...`), Polymer data
   * bindings (`[[...]]` and `{{...}}`), and id-based node finding into
   * `this.$`.
   *
   * `properties`: Object describing property-related metadata used by Polymer
   * features (key: property names, value: object containing property metadata).
   * Valid keys in per-property metadata include:
   * - `type` (String|Number|Object|Array|...): Used by
   *   `attributeChangedCallback` to determine how string-based attributes
   *   are deserialized to JavaScript property values.
   * - `notify` (boolean): Causes a change in the property to fire a
   *   non-bubbling event called `<property>-changed`. Elements that have
   *   enabled two-way binding to the property use this event to observe changes.
   * - `readOnly` (boolean): Creates a getter for the property, but no setter.
   *   To set a read-only property, use the private setter method
   *   `_setProperty(property, value)`.
   * - `observer` (string): Observer method name that will be called when
   *   the property changes. The arguments of the method are
   *   `(value, previousValue)`.
   * - `computed` (string): String describing method and dependent properties
   *   for computing the value of this property (e.g. `'computeFoo(bar, zot)'`).
   *   Computed properties are read-only by default and can only be changed
   *   via the return value of the computing method.
   *
   * `observers`: Array of strings describing multi-property observer methods
   *  and their dependent properties (e.g. `'observeABC(a, b, c)'`).
   *
   * `listeners`: Object describing event listeners to be added to each
   *  instance of this element (key: event name, value: method name).
   *
   * `behaviors`: Array of additional `info` objects containing metadata
   * and callbacks in the same format as the `info` object here which are
   * merged into this element.
   *
   * `hostAttributes`: Object listing attributes to be applied to the host
   *  once created (key: attribute name, value: attribute value).  Values
   *  are serialized based on the type of the value.  Host attributes should
   *  generally be limited to attributes such as `tabIndex` and `aria-...`.
   *  Attributes in `hostAttributes` are only applied if a user-supplied
   *  attribute is not already present (attributes in markup override
   *  `hostAttributes`).
   *
   * In addition, the following Polymer-specific callbacks may be provided:
   * - `registered`: called after first instance of this element,
   * - `created`: called during `constructor`
   * - `attached`: called during `connectedCallback`
   * - `detached`: called during `disconnectedCallback`
   * - `ready`: called before first `attached`, after all properties of
   *   this element have been propagated to its template and all observers
   *   have run
   *
   * @param {!PolymerInit} info Object containing Polymer metadata and functions
   *   to become class methods.
   * @template T
   * @param {function(T):T} mixin Optional mixin to apply to legacy base class
   *   before extending with Polymer metaprogramming.
   * @return {function(new:HTMLElement)} Generated class
   */const Class=function(info,mixin){if(!info){console.warn(`Polymer's Class function requires \`info\` argument`);}const baseWithBehaviors=info.behaviors?// note: mixinBehaviors ensures `LegacyElementMixin`.
mixinBehaviors(info.behaviors,HTMLElement):LegacyElementMixin(HTMLElement);const baseWithMixin=mixin?mixin(baseWithBehaviors):baseWithBehaviors;const klass=GenerateClassFromInfo(info,baseWithMixin);// decorate klass with registration info
klass.is=info.is;return klass;};var _class={mixinBehaviors:mixinBehaviors,Class:Class};const Polymer$1=function(info){// if input is a `class` (aka a function with a prototype), use the prototype
// remember that the `constructor` will never be called
let klass;if(typeof info==='function'){klass=info;}else{klass=Polymer$1.Class(info);}customElements.define(klass.is,/** @type {!HTMLElement} */klass);return klass;};Polymer$1.Class=Class;var polymerFn={Polymer:Polymer$1};const bundledImportMeta$2={...import.meta,url:new URL('../../i18n-attr-repo.js',import.meta.url).href};const $_documentContainer=document.createElement('template');$_documentContainer.innerHTML=`<template id="i18n-attr-repo">
    <template id="standard">
      <!-- Standard HTML5 -->
      <input placeholder="" value="type=button|submit">
      <any-elements title="" aria-label="\$" aria-valuetext="\$"></any-elements>

      <!-- Standard Polymer Elements -->
      <paper-input label="" error-message="" placeholder=""></paper-input>
      <paper-textarea label="" error-message="" placeholder=""></paper-textarea>
      <paper-dropdown-menu label=""></paper-dropdown-menu>
      <paper-toast text=""></paper-toast>
      <paper-badge label=""></paper-badge>
      <google-chart options="" cols="" rows="" data=""></google-chart>
      <google-signin label-signin="" label-signout="" label-additional=""></google-signin>
      <platinum-push-messaging title="" message=""></platinum-push-messaging>

      <!-- Specific to i18n-behavior -->
      <json-data any-attributes=""></json-data>
    </template>
</template>`;// shared data
var sharedData={};// imperative synchronous registration of the template for Polymer 2.x
var template=$_documentContainer.content.querySelector('template#i18n-attr-repo');var domModule$1=document.createElement('dom-module');domModule$1.appendChild(template);domModule$1.register('i18n-attr-repo');window.BehaviorsStore=window.BehaviorsStore||{};// Polymer function for iron-component-page documentation
var Polymer$2=function(proto){BehaviorsStore._I18nAttrRepo=proto;BehaviorsStore._I18nAttrRepo._created();return Polymer$1(proto);};/*
   `<i18n-attr-repo>` maintains a list of attributes targeted for UI localization.  
   It judges whether a specific attribute of an element requires localization or not. 
   
       var attrRepository = 
         document.createElement('i18n-attr-repo');
   
       attrRepository.registerLocalizableAttributes(
         'custom-element',
         Polymer.DomModule.import('custom-element', 'template')
       );
       attrRepository.isLocalizableAttribute(inputElement, 'placeholder');
   
   ### Interactions with `BehaviorsStore.I18nBehavior`
   
   The element is not meant for DOM attachment. The object is
   a singleton object dedicated for `BehaviorsStore.I18nBehavior`.
   `I18nBehavior` interacts with the localizable attributes repository in these 3 ways.
   
   ### 1) Construct the repository for the standard elements from its own static template at the object creation.
   
   ```
       // i18n-behavior.html
       var attrRepository = 
         document.createElement('i18n-attr-repo');
   ```
   
   Pre-defined I18N-target attributes in the static template of `i18n-attr-repo`:
   
   ```
       <dom-module id="i18n-attr-repo">
         <template>
           <template id="standard">
             <input placeholder>
             <any-elements title aria-label="$" aria-valuetext="$"></any-elements>
   
             <paper-input label error-message placeholder></paper-input>
             <paper-textarea label error-message placeholder></paper-textarea>
             <paper-dropdown-menu label></paper-dropdown-menu>
             <paper-toast text></paper-toast>
             <google-chart options cols rows data></google-chart>
             <google-signin label-signin label-signout label-additional></google-signin>
             <platinum-push-messaging title message></platinum-push-messaging>
   
             <json-data any-attributes></json-data>
           </template>
         </template>
       </dom-module>
   ```
   
   This static list is also referenced by [`gulp-i18n-preprocess`](https://github.com/t2ym/gulp-i18n-preprocess) filter for
   build-time automatic I18N of hard-coded string attributes.
   
   ### 2) Register I18N-target attributes of custom elements from a template with id="custom" in its light DOM.
   
   I18N-target attributes for custom elements without I18nBehavior can be registered to the respository by this method. 
   
   Example I18N-target attributes in a static template in the light DOM of `i18n-attr-repo`:
   
   ```
       <i18n-attr-repo>
         <template id="custom">
           <shop-md-decorator error-message="$"></shop-md-decorator>
           <input value="type=submit|button">
           <my-element i18n-target-attr="attr=value,boolean-attr,!boolean-attr"></my-element>
           <my-element i18n-target-attr="attr1=value1,attr2=value2,type-name"></my-element>
           <my-element i18n-target-attr="boolean-attr="></my-element>
           <my-element i18n-target-attr="type-name2"></my-element>
         </template>
       </i18n-attr-repo>
   ```
   
   This list is also referenced by [`gulp-i18n-preprocess`](https://github.com/t2ym/gulp-i18n-preprocess) filter for
   build-time automatic I18N of hard-coded string attributes.
   
   Note: Type name feature is currently ineffective and reserved for further expansion of the attribute I18N features.
   
   ### 3) Register localizable attributes of the newly registered elements from the `text-attr` attribute of the element's template.
   
   ```
       // i18n-behavior.html, scanning custom-element template
       var id = 'custom-element';
       attrRepository.registerLocalizableAttributes(
         id, 
         Polymer.DomModule.import(id, 'template')
       );
   ```
   ```
       // custom-element.html
       <dom-module id="custom-element">
         <template text-attr="localizable-attr1 localizable-attr2">
           <span>{{localizableAttr1}}</span>
           <span>{{localizableAttr2}}</span>
         </template>
         <script>
           Polymer({
             is: 'custom-element',
             behaviors: [ BehaviorsStore.I18nBehavior ],
             properties: {
               localizableAttr1: {
                 type: String
               },
               localizableAttr2: {
                 type: String
               }
             }
           });
         </ script>
       </dom-module>
   ```
   
   `text-attr` attributes are also traversed for build-time automatic I18N of 
   hard-coded UI string attributes by [`gulp-i18n-preprocess`](https://github.com/t2ym/gulp-i18n-preprocess) filter.
   
   ### 4) Judge localizability of attributes for the local DOM elements of the newly registered element.
   
   ```
       // i18n-behavior.html, scanning custom-element-user template
       var element; // target element
       var attr;
       if (attrRepository.isLocalizableAttribute(element, attr.name)) {
         // make localizalbe-attr1 localizable
       }
   ```
   ```
       // custom-element-user.html
       <dom-module id="custom-element-user">
         <template>
           <custom-element id="custom"
                           localizable-attr1="UI Text Label 1"
                           localizable-attr2="UI Text Label 2">
           </custom-element>
         </template>
         <script>
           Polymer({
             is: 'custom-element-user',
             behaviors: [ BehaviorsStore.I18nBehavior ]
           });
         </ script>
       </dom-module>
   ```
   ```
       // template for custom-element-user after localization binding
       <template>
         <custom-element id="custom"
                         localizable-attr1="{{model.custom.localizable-attr1}}"
                         localizable-attr2="{{model.custom.localizable-attr2}}">
         </custom-element>
       </template>
   ```
   ```
       // extracted localizable texts in custom-element-user element
       this.model = {
         "custom": {
           "localizable-attr1": "UI Text Label 1",
           "localizable-attr2": "UI Text Label 2"
         }
       }
   ```
   
   Since dependent elements should be registered prior to a custom element being registered,
   the repository can always maintain the complete list of localizable attributes for registered custom elements.
   
   - - -
   
   ### Note
   
   The described processes above are for debug builds with runtime localization traversal of templates
   by `I18nBehavior`.
   
   For production builds, the build system can perform the same processes at build time so that 
   `I18nBehavior` at clients can skip runtime traversal of templates.
   
   - - -
   
   ### TODO
   
   Handle and judge JSON object attributes.
   
   @group I18nBehavior
   @element i18n-attr-repo
   @hero hero.svg
   */Polymer$2({importMeta:bundledImportMeta$2,is:'i18n-attr-repo',created:function(){this.data=sharedData;var customAttributes=this.querySelector('template#custom');// traverse custom attributes repository
if(customAttributes&&!this.hasAttribute('processed')){this._traverseTemplateTree(customAttributes._content||customAttributes.content);this.setAttribute('processed','');}this._created();},_created:function(){this.data=sharedData;if(this.data.__ready__){return;// traverse standard attributes only once
}this.data.__ready__=true;var standardTemplate;if(!this.$){var t=DomModule.import(this.is,'template');standardTemplate=(t._content||t.content).querySelector('template#standard');}else{standardTemplate=this.$.standard;}this._traverseTemplateTree(standardTemplate._content||standardTemplate.content);},/**
   * Judge if a specific attribute of an element requires localization.
   *
   * @param {HTMLElement} element Target element.
   * @param {string} attr Target attribute name.
   * @return {string or boolean} true - property, '$' - attribute, false - not targeted, 'type-name' - type name
   */isLocalizableAttribute:function(element,attr){var tagName=element.tagName.toLowerCase();if(!this.data){this._created();this.data=sharedData;}attr=attr.replace(/\$$/,'');if(this.data['any-elements']&&this.data['any-elements'][attr]){return this.data['any-elements'][attr];}else if(this.data[tagName]){return this.data[tagName]['any-attributes']||this._getType(element,this.data[tagName][attr]);}else{return false;}},/**
   * Get the type name or '$' for a specific attribute of an element from the attributes repository
   *
   * @param {HTMLElement} element Target element.
   * @param {object} value this.data[tagName][attr]
   * @return {string or boolean} true - property, '$' - attribute, false - not targeted, 'type-name' - type name
   */_getType:function(element,value){var selector;var result;if(typeof value==='object'){for(selector in value){if(selector){if(this._matchAttribute(element,selector)){result=this._getType(element,value[selector]);if(result){return result;}}}}if(value['']){if(this._matchAttribute(element,'')){result=this._getType(element,value['']);if(result){return result;}}}return false;}else{return value;}},/**
   * Get the type name or '$' for a specific attribute of an element from the attributes repository
   *
   * Format for selectors:
   *  - `attr=value` - Value of `attr` matches Regex `^value$`
   *  - `!boolean-attr` - Boolean attribute does not exist
   *  - `boolean-attr` - Boolean attribute exists with empty value
   *  - empty string `''` - Always matches
   *
   * @param {HTMLElement} element Target element.
   * @param {string} selector Matching condition for target attribute.
   * @return {boolean} true - matching, false - not matching
   */_matchAttribute:function(element,selector){var value;var match;// default ''
if(selector===''){return true;}// attr=value Regex ^value$
match=selector.match(/^([^!=]*)=(.*)$/);if(match){if(element.hasAttribute(match[1])){value=element.getAttribute(match[1]);return!!value.match(new RegExp('^'+match[2]+'$'));}else{return false;}}// !boolean-attr
match=selector.match(/^!([^!=]*)$/);if(match){return!element.hasAttribute(match[1]);}// boolean-attr or empty-attr
match=selector.match(/^([^!=]*)$/);if(match){if(element.hasAttribute(match[1])){value=element.getAttribute(match[1]);return!value;}else{return false;}}// no matching
return false;},/**
   * Comparator for attribute selectors
   *
   * @param {string} s1 selector 1
   * @param {string} s2 selector 2
   * @return {number} comparison result as -1, 0, or 1
   */_compareSelectors:function(s1,s2){var name1=s1.replace(/^!/,'').replace(/=.*$/,'').toLowerCase();var name2=s2.replace(/^!/,'').replace(/=.*$/,'').toLowerCase();return name1.localeCompare(name2);},/**
   * Add a new localizable attribute of an element to the repository.
   *
   * Format for selector values for defining I18N-target attributes:
   *   - `attr1=value1,attr2=value2,boolean-attr,!boolean-attr` - Attribute value matching condition for property
   *   - `attr1=value1,attr2=value2,$` - Attribute value matching condition for attribute
   *   - `boolean-attr=` - Boolean attribute condition
   *   - `attr1=value1,type` - Attribute value condition with type name (type is currently ineffective)
   *
   * @param {string} element Target element name.
   * @param {string} attr Target attribute name.
   * @param {?*} value Selector value
   */setLocalizableAttribute:function(element,attr,value){this.data[element]=this.data[element]||{};var cursor=this.data[element];var prev=attr;var type=true;var selectors=[];if(typeof value==='string'&&value){selectors=value.split(',');if(selectors[selectors.length-1].match(/^[^!=][^=]*$/)){type=selectors.pop();}selectors=selectors.map(function(selector){return selector.replace(/=$/,'');});selectors.sort(this._compareSelectors);while(selectors[0]===''){selectors.shift();}}selectors.forEach(function(selector,index){if(typeof cursor[prev]!=='object'){cursor[prev]=cursor[prev]?{'':cursor[prev]}:{};}cursor[prev][selector]=cursor[prev][selector]||{};cursor=cursor[prev];prev=selector;});if(typeof cursor[prev]==='object'&&cursor[prev]&&Object.keys(cursor[prev]).length){cursor=cursor[prev];prev='';}cursor[prev]=type;},/**
   * Pick up localizable attributes description for a custom element 
   * from `text-attr` attribute and register them to the repository.
   * The `text-attr` attribute is used in the template of a custom
   * element to declare localizable attributes of its own element.
   *
   * Format:
   *
   *  Type 1: `<template text-attr="localizable-attr1 attr2">`
   *
   *  Type 2: `<template text-attr localizable-attr1 attr2="value2">`
   *
   * @param {string} element Target element name.
   * @param {HTMLTemplateElement} template Template of the element.
   */registerLocalizableAttributes:function(element,template){if(!this.data){this._created();this.data=sharedData;}if(!element){element=template.getAttribute('id');}if(element){var attrs=(template.getAttribute('text-attr')||'').split(' ');var textAttr=false;attrs.forEach(function(attr){if(attr){this.setLocalizableAttribute(element,attr,true);}},this);Array.prototype.forEach.call(template.attributes,function(attr){switch(attr.name){case'id':case'lang':case'localizable-text':case'assetpath':break;case'text-attr':textAttr=true;break;default:if(textAttr){this.setLocalizableAttribute(element,attr.name,attr.value);}break;}}.bind(this));}},/**
   * Traverse the template of `i18n-attr-repo` in the ready() callback
   * and construct the localizable attributes repository object. The method calls itself
   * recursively for traversal.
   *
   * @param {HTMLElement} node The target HTML node for traversing.
   */_traverseTemplateTree:function(node){var name;if(node.nodeType===node.ELEMENT_NODE){name=node.nodeName.toLowerCase();Array.prototype.forEach.call(node.attributes,function(attribute){this.data[name]=this.data[name]||{};this.setLocalizableAttribute(name,attribute.name,attribute.value);},this);}if(node.childNodes.length>0){for(var i=0;i<node.childNodes.length;i++){this._traverseTemplateTree(node.childNodes[i]);}}}});function mutablePropertyChange(inst,property,value,old,mutableData){let isObject;if(mutableData){isObject=typeof value==='object'&&value!==null;// Pull `old` for Objects from temp cache, but treat `null` as a primitive
if(isObject){old=inst.__dataTemp[property];}}// Strict equality check, but return false for NaN===NaN
let shouldChange=old!==value&&(old===old||value===value);// Objects are stored in temporary cache (cleared at end of
// turn), which is used for dirty-checking
if(isObject&&shouldChange){inst.__dataTemp[property]=value;}return shouldChange;}/**
   * Element class mixin to skip strict dirty-checking for objects and arrays
   * (always consider them to be "dirty"), for use on elements utilizing
   * `PropertyEffects`
   *
   * By default, `PropertyEffects` performs strict dirty checking on
   * objects, which means that any deep modifications to an object or array will
   * not be propagated unless "immutable" data patterns are used (i.e. all object
   * references from the root to the mutation were changed).
   *
   * Polymer also provides a proprietary data mutation and path notification API
   * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
   * mutation and notification of deep changes in an object graph to all elements
   * bound to the same object graph.
   *
   * In cases where neither immutable patterns nor the data mutation API can be
   * used, applying this mixin will cause Polymer to skip dirty checking for
   * objects and arrays (always consider them to be "dirty").  This allows a
   * user to make a deep modification to a bound object graph, and then either
   * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
   * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
   * elements that wish to be updated based on deep mutations must apply this
   * mixin or otherwise skip strict dirty checking for objects/arrays.
   * Specifically, any elements in the binding tree between the source of a
   * mutation and the consumption of it must apply this mixin or enable the
   * `OptionalMutableData` mixin.
   *
   * In order to make the dirty check strategy configurable, see
   * `OptionalMutableData`.
   *
   * Note, the performance characteristics of propagating large object graphs
   * will be worse as opposed to using strict dirty checking with immutable
   * patterns or Polymer's path notification API.
   *
   * @mixinFunction
   * @polymer
   * @summary Element class mixin to skip strict dirty-checking for objects
   *   and arrays
   */const MutableData=dedupingMixin(superClass=>{/**
   * @polymer
   * @mixinClass
   * @implements {Polymer_MutableData}
   */class MutableData extends superClass{/**
     * Overrides `PropertyEffects` to provide option for skipping
     * strict equality checking for Objects and Arrays.
     *
     * This method pulls the value to dirty check against from the `__dataTemp`
     * cache (rather than the normal `__data` cache) for Objects.  Since the temp
     * cache is cleared at the end of a turn, this implementation allows
     * side-effects of deep object changes to be processed by re-setting the
     * same object (using the temp cache as an in-turn backstop to prevent
     * cycles due to 2-way notification).
     *
     * @param {string} property Property name
     * @param {*} value New property value
     * @param {*} old Previous property value
     * @return {boolean} Whether the property should be considered a change
     * @protected
     */_shouldPropertyChange(property,value,old){return mutablePropertyChange(this,property,value,old,true);}}return MutableData;});/**
     * Element class mixin to add the optional ability to skip strict
     * dirty-checking for objects and arrays (always consider them to be
     * "dirty") by setting a `mutable-data` attribute on an element instance.
     *
     * By default, `PropertyEffects` performs strict dirty checking on
     * objects, which means that any deep modifications to an object or array will
     * not be propagated unless "immutable" data patterns are used (i.e. all object
     * references from the root to the mutation were changed).
     *
     * Polymer also provides a proprietary data mutation and path notification API
     * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
     * mutation and notification of deep changes in an object graph to all elements
     * bound to the same object graph.
     *
     * In cases where neither immutable patterns nor the data mutation API can be
     * used, applying this mixin will allow Polymer to skip dirty checking for
     * objects and arrays (always consider them to be "dirty").  This allows a
     * user to make a deep modification to a bound object graph, and then either
     * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
     * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
     * elements that wish to be updated based on deep mutations must apply this
     * mixin or otherwise skip strict dirty checking for objects/arrays.
     * Specifically, any elements in the binding tree between the source of a
     * mutation and the consumption of it must enable this mixin or apply the
     * `MutableData` mixin.
     *
     * While this mixin adds the ability to forgo Object/Array dirty checking,
     * the `mutableData` flag defaults to false and must be set on the instance.
     *
     * Note, the performance characteristics of propagating large object graphs
     * will be worse by relying on `mutableData: true` as opposed to using
     * strict dirty checking with immutable patterns or Polymer's path notification
     * API.
     *
     * @mixinFunction
     * @polymer
     * @summary Element class mixin to optionally skip strict dirty-checking
     *   for objects and arrays
     */const OptionalMutableData=dedupingMixin(superClass=>{/**
   * @mixinClass
   * @polymer
   * @implements {Polymer_OptionalMutableData}
   */class OptionalMutableData extends superClass{static get properties(){return{/**
         * Instance-level flag for configuring the dirty-checking strategy
         * for this element.  When true, Objects and Arrays will skip dirty
         * checking, otherwise strict equality checking will be used.
         */mutableData:Boolean};}/**
       * Overrides `PropertyEffects` to provide option for skipping
       * strict equality checking for Objects and Arrays.
       *
       * When `this.mutableData` is true on this instance, this method
       * pulls the value to dirty check against from the `__dataTemp` cache
       * (rather than the normal `__data` cache) for Objects.  Since the temp
       * cache is cleared at the end of a turn, this implementation allows
       * side-effects of deep object changes to be processed by re-setting the
       * same object (using the temp cache as an in-turn backstop to prevent
       * cycles due to 2-way notification).
       *
       * @param {string} property Property name
       * @param {*} value New property value
       * @param {*} old Previous property value
       * @return {boolean} Whether the property should be considered a change
       * @protected
       */_shouldPropertyChange(property,value,old){return mutablePropertyChange(this,property,value,old,this.mutableData);}}return OptionalMutableData;});// Export for use by legacy behavior
MutableData._mutablePropertyChange=mutablePropertyChange;var mutableData={MutableData:MutableData,OptionalMutableData:OptionalMutableData};// machinery for propagating host properties to children. This is an ES5
// class only because Babel (incorrectly) requires super() in the class
// constructor even though no `this` is used and it returns an instance.
let newInstance=null;/**
                         * @constructor
                         * @extends {HTMLTemplateElement}
                         * @private
                         */function HTMLTemplateElementExtension(){return newInstance;}HTMLTemplateElementExtension.prototype=Object.create(HTMLTemplateElement.prototype,{constructor:{value:HTMLTemplateElementExtension,writable:true}});/**
     * @constructor
     * @implements {Polymer_PropertyEffects}
     * @extends {HTMLTemplateElementExtension}
     * @private
     */const DataTemplate=PropertyEffects(HTMLTemplateElementExtension);/**
                                                                     * @constructor
                                                                     * @implements {Polymer_MutableData}
                                                                     * @extends {DataTemplate}
                                                                     * @private
                                                                     */const MutableDataTemplate=MutableData(DataTemplate);// Applies a DataTemplate subclass to a <template> instance
function upgradeTemplate(template,constructor){newInstance=template;Object.setPrototypeOf(template,constructor.prototype);new constructor();newInstance=null;}/**
   * Base class for TemplateInstance.
   * @constructor
   * @implements {Polymer_PropertyEffects}
   * @private
   */const base=PropertyEffects(class{});/**
                                         * @polymer
                                         * @customElement
                                         * @appliesMixin PropertyEffects
                                         * @unrestricted
                                         */class TemplateInstanceBase extends base{constructor(props){super();this._configureProperties(props);this.root=this._stampTemplate(this.__dataHost);// Save list of stamped children
let children=this.children=[];for(let n=this.root.firstChild;n;n=n.nextSibling){children.push(n);n.__templatizeInstance=this;}if(this.__templatizeOwner&&this.__templatizeOwner.__hideTemplateChildren__){this._showHideChildren(true);}// Flush props only when props are passed if instance props exist
// or when there isn't instance props.
let options=this.__templatizeOptions;if(props&&options.instanceProps||!options.instanceProps){this._enableProperties();}}/**
     * Configure the given `props` by calling `_setPendingProperty`. Also
     * sets any properties stored in `__hostProps`.
     * @private
     * @param {Object} props Object of property name-value pairs to set.
     * @return {void}
     */_configureProperties(props){let options=this.__templatizeOptions;if(options.forwardHostProp){for(let hprop in this.__hostProps){this._setPendingProperty(hprop,this.__dataHost['_host_'+hprop]);}}// Any instance props passed in the constructor will overwrite host props;
// normally this would be a user error but we don't specifically filter them
for(let iprop in props){this._setPendingProperty(iprop,props[iprop]);}}/**
     * Forwards a host property to this instance.  This method should be
     * called on instances from the `options.forwardHostProp` callback
     * to propagate changes of host properties to each instance.
     *
     * Note this method enqueues the change, which are flushed as a batch.
     *
     * @param {string} prop Property or path name
     * @param {*} value Value of the property to forward
     * @return {void}
     */forwardHostProp(prop,value){if(this._setPendingPropertyOrPath(prop,value,false,true)){this.__dataHost._enqueueClient(this);}}/**
     * Override point for adding custom or simulated event handling.
     *
     * @override
     * @param {!Node} node Node to add event listener to
     * @param {string} eventName Name of event
     * @param {function(!Event):void} handler Listener function to add
     * @return {void}
     */_addEventListenerToNode(node,eventName,handler){if(this._methodHost&&this.__templatizeOptions.parentModel){// If this instance should be considered a parent model, decorate
// events this template instance as `model`
this._methodHost._addEventListenerToNode(node,eventName,e=>{e.model=this;handler(e);});}else{// Otherwise delegate to the template's host (which could be)
// another template instance
let templateHost=this.__dataHost.__dataHost;if(templateHost){templateHost._addEventListenerToNode(node,eventName,handler);}}}/**
     * Shows or hides the template instance top level child elements. For
     * text nodes, `textContent` is removed while "hidden" and replaced when
     * "shown."
     * @param {boolean} hide Set to true to hide the children;
     * set to false to show them.
     * @return {void}
     * @protected
     */_showHideChildren(hide){let c=this.children;for(let i=0;i<c.length;i++){let n=c[i];// Ignore non-changes
if(Boolean(hide)!=Boolean(n.__hideTemplateChildren__)){if(n.nodeType===Node.TEXT_NODE){if(hide){n.__polymerTextContent__=n.textContent;n.textContent='';}else{n.textContent=n.__polymerTextContent__;}// remove and replace slot
}else if(n.localName==='slot'){if(hide){n.__polymerReplaced__=document.createComment('hidden-slot');n.parentNode.replaceChild(n.__polymerReplaced__,n);}else{const replace=n.__polymerReplaced__;if(replace){replace.parentNode.replaceChild(n,replace);}}}else if(n.style){if(hide){n.__polymerDisplay__=n.style.display;n.style.display='none';}else{n.style.display=n.__polymerDisplay__;}}}n.__hideTemplateChildren__=hide;if(n._showHideChildren){n._showHideChildren(hide);}}}/**
     * Overrides default property-effects implementation to intercept
     * textContent bindings while children are "hidden" and cache in
     * private storage for later retrieval.
     *
     * @override
     * @param {!Node} node The node to set a property on
     * @param {string} prop The property to set
     * @param {*} value The value to set
     * @return {void}
     * @protected
     */_setUnmanagedPropertyToNode(node,prop,value){if(node.__hideTemplateChildren__&&node.nodeType==Node.TEXT_NODE&&prop=='textContent'){node.__polymerTextContent__=value;}else{super._setUnmanagedPropertyToNode(node,prop,value);}}/**
     * Find the parent model of this template instance.  The parent model
     * is either another templatize instance that had option `parentModel: true`,
     * or else the host element.
     *
     * @return {!Polymer_PropertyEffects} The parent model of this instance
     */get parentModel(){let model=this.__parentModel;if(!model){let options;model=this;do{// A template instance's `__dataHost` is a <template>
// `model.__dataHost.__dataHost` is the template's host
model=model.__dataHost.__dataHost;}while((options=model.__templatizeOptions)&&!options.parentModel);this.__parentModel=model;}return model;}/**
     * Stub of HTMLElement's `dispatchEvent`, so that effects that may
     * dispatch events safely no-op.
     *
     * @param {Event} event Event to dispatch
     * @return {boolean} Always true.
     */dispatchEvent(event){// eslint-disable-line no-unused-vars
return true;}}/** @type {!DataTemplate} */TemplateInstanceBase.prototype.__dataHost;/** @type {!TemplatizeOptions} */TemplateInstanceBase.prototype.__templatizeOptions;/** @type {!Polymer_PropertyEffects} */TemplateInstanceBase.prototype._methodHost;/** @type {!Object} */TemplateInstanceBase.prototype.__templatizeOwner;/** @type {!Object} */TemplateInstanceBase.prototype.__hostProps;/**
                                             * @constructor
                                             * @extends {TemplateInstanceBase}
                                             * @implements {Polymer_MutableData}
                                             * @private
                                             */const MutableTemplateInstanceBase=MutableData(TemplateInstanceBase);function findMethodHost(template){// Technically this should be the owner of the outermost template.
// In shadow dom, this is always getRootNode().host, but we can
// approximate this via cooperation with our dataHost always setting
// `_methodHost` as long as there were bindings (or id's) on this
// instance causing it to get a dataHost.
let templateHost=template.__dataHost;return templateHost&&templateHost._methodHost||templateHost;}/* eslint-disable valid-jsdoc */ /**
                                    * @suppress {missingProperties} class.prototype is not defined for some reason
                                    */function createTemplatizerClass(template,templateInfo,options){// Anonymous class created by the templatize
let base=options.mutableData?MutableTemplateInstanceBase:TemplateInstanceBase;/**
                                                                                        * @constructor
                                                                                        * @extends {base}
                                                                                        * @private
                                                                                        */let klass=class extends base{};klass.prototype.__templatizeOptions=options;klass.prototype._bindTemplate(template);addNotifyEffects(klass,template,templateInfo,options);return klass;}/**
   * @suppress {missingProperties} class.prototype is not defined for some reason
   */function addPropagateEffects(template,templateInfo,options){let userForwardHostProp=options.forwardHostProp;if(userForwardHostProp){// Provide data API and property effects on memoized template class
let klass=templateInfo.templatizeTemplateClass;if(!klass){let base=options.mutableData?MutableDataTemplate:DataTemplate;/** @private */klass=templateInfo.templatizeTemplateClass=class TemplatizedTemplate extends base{};// Add template - >instances effects
// and host <- template effects
let hostProps=templateInfo.hostProps;for(let prop in hostProps){klass.prototype._addPropertyEffect('_host_'+prop,klass.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE,{fn:createForwardHostPropEffect(prop,userForwardHostProp)});klass.prototype._createNotifyingProperty('_host_'+prop);}}upgradeTemplate(template,klass);// Mix any pre-bound data into __data; no need to flush this to
// instances since they pull from the template at instance-time
if(template.__dataProto){// Note, generally `__dataProto` could be chained, but it's guaranteed
// to not be since this is a vanilla template we just added effects to
Object.assign(template.__data,template.__dataProto);}// Clear any pending data for performance
template.__dataTemp={};template.__dataPending=null;template.__dataOld=null;template._enableProperties();}}/* eslint-enable valid-jsdoc */function createForwardHostPropEffect(hostProp,userForwardHostProp){return function forwardHostProp(template,prop,props){userForwardHostProp.call(template.__templatizeOwner,prop.substring('_host_'.length),props[prop]);};}function addNotifyEffects(klass,template,templateInfo,options){let hostProps=templateInfo.hostProps||{};for(let iprop in options.instanceProps){delete hostProps[iprop];let userNotifyInstanceProp=options.notifyInstanceProp;if(userNotifyInstanceProp){klass.prototype._addPropertyEffect(iprop,klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:createNotifyInstancePropEffect(iprop,userNotifyInstanceProp)});}}if(options.forwardHostProp&&template.__dataHost){for(let hprop in hostProps){klass.prototype._addPropertyEffect(hprop,klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:createNotifyHostPropEffect()});}}}function createNotifyInstancePropEffect(instProp,userNotifyInstanceProp){return function notifyInstanceProp(inst,prop,props){userNotifyInstanceProp.call(inst.__templatizeOwner,inst,prop,props[prop]);};}function createNotifyHostPropEffect(){return function notifyHostProp(inst,prop,props){inst.__dataHost._setPendingPropertyOrPath('_host_'+prop,props[prop],true,true);};}/**
   * Returns an anonymous `PropertyEffects` class bound to the
   * `<template>` provided.  Instancing the class will result in the
   * template being stamped into a document fragment stored as the instance's
   * `root` property, after which it can be appended to the DOM.
   *
   * Templates may utilize all Polymer data-binding features as well as
   * declarative event listeners.  Event listeners and inline computing
   * functions in the template will be called on the host of the template.
   *
   * The constructor returned takes a single argument dictionary of initial
   * property values to propagate into template bindings.  Additionally
   * host properties can be forwarded in, and instance properties can be
   * notified out by providing optional callbacks in the `options` dictionary.
   *
   * Valid configuration in `options` are as follows:
   *
   * - `forwardHostProp(property, value)`: Called when a property referenced
   *   in the template changed on the template's host. As this library does
   *   not retain references to templates instanced by the user, it is the
   *   templatize owner's responsibility to forward host property changes into
   *   user-stamped instances.  The `instance.forwardHostProp(property, value)`
   *    method on the generated class should be called to forward host
   *   properties into the template to prevent unnecessary property-changed
   *   notifications. Any properties referenced in the template that are not
   *   defined in `instanceProps` will be notified up to the template's host
   *   automatically.
   * - `instanceProps`: Dictionary of property names that will be added
   *   to the instance by the templatize owner.  These properties shadow any
   *   host properties, and changes within the template to these properties
   *   will result in `notifyInstanceProp` being called.
   * - `mutableData`: When `true`, the generated class will skip strict
   *   dirty-checking for objects and arrays (always consider them to be
   *   "dirty").
   * - `notifyInstanceProp(instance, property, value)`: Called when
   *   an instance property changes.  Users may choose to call `notifyPath`
   *   on e.g. the owner to notify the change.
   * - `parentModel`: When `true`, events handled by declarative event listeners
   *   (`on-event="handler"`) will be decorated with a `model` property pointing
   *   to the template instance that stamped it.  It will also be returned
   *   from `instance.parentModel` in cases where template instance nesting
   *   causes an inner model to shadow an outer model.
   *
   * All callbacks are called bound to the `owner`. Any context
   * needed for the callbacks (such as references to `instances` stamped)
   * should be stored on the `owner` such that they can be retrieved via
   * `this`.
   *
   * When `options.forwardHostProp` is declared as an option, any properties
   * referenced in the template will be automatically forwarded from the host of
   * the `<template>` to instances, with the exception of any properties listed in
   * the `options.instanceProps` object.  `instanceProps` are assumed to be
   * managed by the owner of the instances, either passed into the constructor
   * or set after the fact.  Note, any properties passed into the constructor will
   * always be set to the instance (regardless of whether they would normally
   * be forwarded from the host).
   *
   * Note that `templatize()` can be run only once for a given `<template>`.
   * Further calls will result in an error. Also, there is a special
   * behavior if the template was duplicated through a mechanism such as
   * `<dom-repeat>` or `<test-fixture>`. In this case, all calls to
   * `templatize()` return the same class for all duplicates of a template.
   * The class returned from `templatize()` is generated only once using
   * the `options` from the first call. This means that any `options`
   * provided to subsequent calls will be ignored. Therefore, it is very
   * important not to close over any variables inside the callbacks. Also,
   * arrow functions must be avoided because they bind the outer `this`.
   * Inside the callbacks, any contextual information can be accessed
   * through `this`, which points to the `owner`.
   *
   * @param {!HTMLTemplateElement} template Template to templatize
   * @param {Polymer_PropertyEffects=} owner Owner of the template instances;
   *   any optional callbacks will be bound to this owner.
   * @param {Object=} options Options dictionary (see summary for details)
   * @return {function(new:TemplateInstanceBase)} Generated class bound to the template
   *   provided
   * @suppress {invalidCasts}
   */function templatize(template,owner,options){// Under strictTemplatePolicy, the templatized element must be owned
// by a (trusted) Polymer element, indicated by existence of _methodHost;
// e.g. for dom-if & dom-repeat in main document, _methodHost is null
if(strictTemplatePolicy&&!findMethodHost(template)){throw new Error('strictTemplatePolicy: template owner not trusted');}options=/** @type {!TemplatizeOptions} */options||{};if(template.__templatizeOwner){throw new Error('A <template> can only be templatized once');}template.__templatizeOwner=owner;const ctor=owner?owner.constructor:TemplateInstanceBase;let templateInfo=ctor._parseTemplate(template);// Get memoized base class for the prototypical template, which
// includes property effects for binding template & forwarding
let baseClass=templateInfo.templatizeInstanceClass;if(!baseClass){baseClass=createTemplatizerClass(template,templateInfo,options);templateInfo.templatizeInstanceClass=baseClass;}// Host property forwarding must be installed onto template instance
addPropagateEffects(template,templateInfo,options);// Subclass base class and add reference for this specific template
/** @private */let klass=class TemplateInstance extends baseClass{};klass.prototype._methodHost=findMethodHost(template);klass.prototype.__dataHost=template;klass.prototype.__templatizeOwner=owner;klass.prototype.__hostProps=templateInfo.hostProps;klass=/** @type {function(new:TemplateInstanceBase)} */klass;//eslint-disable-line no-self-assign
return klass;}/**
   * Returns the template "model" associated with a given element, which
   * serves as the binding scope for the template instance the element is
   * contained in. A template model is an instance of
   * `TemplateInstanceBase`, and should be used to manipulate data
   * associated with this template instance.
   *
   * Example:
   *
   *   let model = modelForElement(el);
   *   if (model.index < 10) {
   *     model.set('item.checked', true);
   *   }
   *
   * @param {HTMLTemplateElement} template The model will be returned for
   *   elements stamped from this template
   * @param {Node=} node Node for which to return a template model.
   * @return {TemplateInstanceBase} Template instance representing the
   *   binding scope for the element
   */function modelForElement(template,node){let model;while(node){// An element with a __templatizeInstance marks the top boundary
// of a scope; walk up until we find one, and then ensure that
// its __dataHost matches `this`, meaning this dom-repeat stamped it
if(model=node.__templatizeInstance){// Found an element stamped by another template; keep walking up
// from its __dataHost
if(model.__dataHost!=template){node=model.__dataHost;}else{return model;}}else{// Still in a template scope, keep going up until
// a __templatizeInstance is found
node=node.parentNode;}}return null;}var templatize$1={templatize:templatize,modelForElement:modelForElement,TemplateInstanceBase:TemplateInstanceBase};/**
    * @typedef {{
    *   _templatizerTemplate: HTMLTemplateElement,
    *   _parentModel: boolean,
    *   _instanceProps: Object,
    *   _forwardHostPropV2: Function,
    *   _notifyInstancePropV2: Function,
    *   ctor: TemplateInstanceBase
    * }}
    */let TemplatizerUser;// eslint-disable-line
/**
 * The `Templatizer` behavior adds methods to generate instances of
 * templates that are each managed by an anonymous `PropertyEffects`
 * instance where data-bindings in the stamped template content are bound to
 * accessors on itself.
 *
 * This behavior is provided in Polymer 2.x-3.x as a hybrid-element convenience
 * only.  For non-hybrid usage, the `Templatize` library
 * should be used instead.
 *
 * Example:
 *
 *     import {dom} from '@polymer/polymer/lib/legacy/polymer.dom.js';
 *     // Get a template from somewhere, e.g. light DOM
 *     let template = this.querySelector('template');
 *     // Prepare the template
 *     this.templatize(template);
 *     // Instance the template with an initial data model
 *     let instance = this.stamp({myProp: 'initial'});
 *     // Insert the instance's DOM somewhere, e.g. light DOM
 *     dom(this).appendChild(instance.root);
 *     // Changing a property on the instance will propagate to bindings
 *     // in the template
 *     instance.myProp = 'new value';
 *
 * Users of `Templatizer` may need to implement the following abstract
 * API's to determine how properties and paths from the host should be
 * forwarded into to instances:
 *
 *     _forwardHostPropV2: function(prop, value)
 *
 * Likewise, users may implement these additional abstract API's to determine
 * how instance-specific properties that change on the instance should be
 * forwarded out to the host, if necessary.
 *
 *     _notifyInstancePropV2: function(inst, prop, value)
 *
 * In order to determine which properties are instance-specific and require
 * custom notification via `_notifyInstanceProp`, define an `_instanceProps`
 * object containing keys for each instance prop, for example:
 *
 *     _instanceProps: {
 *       item: true,
 *       index: true
 *     }
 *
 * Any properties used in the template that are not defined in _instanceProp
 * will be forwarded out to the Templatize `owner` automatically.
 *
 * Users may also implement the following abstract function to show or
 * hide any DOM generated using `stamp`:
 *
 *     _showHideChildren: function(shouldHide)
 *
 * Note that some callbacks are suffixed with `V2` in the Polymer 2.x behavior
 * as the implementations will need to differ from the callbacks required
 * by the 1.x Templatizer API due to changes in the `TemplateInstance` API
 * between versions 1.x and 2.x.
 *
 * @polymerBehavior
 */const Templatizer={/**
   * Generates an anonymous `TemplateInstance` class (stored as `this.ctor`)
   * for the provided template.  This method should be called once per
   * template to prepare an element for stamping the template, followed
   * by `stamp` to create new instances of the template.
   *
   * @param {!HTMLTemplateElement} template Template to prepare
   * @param {boolean=} mutableData When `true`, the generated class will skip
   *   strict dirty-checking for objects and arrays (always consider them to
   *   be "dirty"). Defaults to false.
   * @return {void}
   * @this {TemplatizerUser}
   */templatize(template,mutableData){this._templatizerTemplate=template;this.ctor=templatize(template,this,{mutableData:Boolean(mutableData),parentModel:this._parentModel,instanceProps:this._instanceProps,forwardHostProp:this._forwardHostPropV2,notifyInstanceProp:this._notifyInstancePropV2});},/**
   * Creates an instance of the template prepared by `templatize`.  The object
   * returned is an instance of the anonymous class generated by `templatize`
   * whose `root` property is a document fragment containing newly cloned
   * template content, and which has property accessors corresponding to
   * properties referenced in template bindings.
   *
   * @param {Object=} model Object containing initial property values to
   *   populate into the template bindings.
   * @return {TemplateInstanceBase} Returns the created instance of
   * the template prepared by `templatize`.
   * @this {TemplatizerUser}
   */stamp(model){return new this.ctor(model);},/**
   * Returns the template "model" (`TemplateInstance`) associated with
   * a given element, which serves as the binding scope for the template
   * instance the element is contained in.  A template model should be used
   * to manipulate data associated with this template instance.
   *
   * @param {HTMLElement} el Element for which to return a template model.
   * @return {TemplateInstanceBase} Model representing the binding scope for
   *   the element.
   * @this {TemplatizerUser}
   */modelForElement(el){return modelForElement(this._templatizerTemplate,el);}};var templatizerBehavior={Templatizer:Templatizer};const domBindBase=GestureEventListeners(OptionalMutableData(PropertyEffects(HTMLElement)));/**
                                                                                               * Custom element to allow using Polymer's template features (data binding,
                                                                                               * declarative event listeners, etc.) in the main document without defining
                                                                                               * a new custom element.
                                                                                               *
                                                                                               * `<template>` tags utilizing bindings may be wrapped with the `<dom-bind>`
                                                                                               * element, which will immediately stamp the wrapped template into the main
                                                                                               * document and bind elements to the `dom-bind` element itself as the
                                                                                               * binding scope.
                                                                                               *
                                                                                               * @polymer
                                                                                               * @customElement
                                                                                               * @appliesMixin PropertyEffects
                                                                                               * @appliesMixin OptionalMutableData
                                                                                               * @appliesMixin GestureEventListeners
                                                                                               * @extends {domBindBase}
                                                                                               * @summary Custom element to allow using Polymer's template features (data
                                                                                               *   binding, declarative event listeners, etc.) in the main document.
                                                                                               */class DomBind extends domBindBase{static get observedAttributes(){return['mutable-data'];}constructor(){super();if(strictTemplatePolicy){throw new Error(`strictTemplatePolicy: dom-bind not allowed`);}this.root=null;this.$=null;this.__children=null;}/**
     * @override
     * @return {void}
     */attributeChangedCallback(){// assumes only one observed attribute
this.mutableData=true;}/**
     * @override
     * @return {void}
     */connectedCallback(){this.style.display='none';this.render();}/**
     * @override
     * @return {void}
     */disconnectedCallback(){this.__removeChildren();}__insertChildren(){this.parentNode.insertBefore(this.root,this);}__removeChildren(){if(this.__children){for(let i=0;i<this.__children.length;i++){this.root.appendChild(this.__children[i]);}}}/**
     * Forces the element to render its content. This is typically only
     * necessary to call if HTMLImports with the async attribute are used.
     * @return {void}
     */render(){let template;if(!this.__children){template=/** @type {HTMLTemplateElement} */template||this.querySelector('template');if(!template){// Wait until childList changes and template should be there by then
let observer=new MutationObserver(()=>{template=/** @type {HTMLTemplateElement} */this.querySelector('template');if(template){observer.disconnect();this.render();}else{throw new Error('dom-bind requires a <template> child');}});observer.observe(this,{childList:true});return;}this.root=this._stampTemplate(/** @type {!HTMLTemplateElement} */template);this.$=this.root.$;this.__children=[];for(let n=this.root.firstChild;n;n=n.nextSibling){this.__children[this.__children.length]=n;}this._enableProperties();}this.__insertChildren();this.dispatchEvent(new CustomEvent('dom-change',{bubbles:true,composed:true}));}}customElements.define('dom-bind',DomBind);var domBind={DomBind:DomBind};class LiteralString{constructor(string){/** @type {string} */this.value=string.toString();}/**
     * @return {string} LiteralString string value
     * @override
     */toString(){return this.value;}}/**
   * @param {*} value Object to stringify into HTML
   * @return {string} HTML stringified form of `obj`
   */function literalValue(value){if(value instanceof LiteralString){return(/** @type {!LiteralString} */value.value);}else{throw new Error(`non-literal value passed to Polymer's htmlLiteral function: ${value}`);}}/**
   * @param {*} value Object to stringify into HTML
   * @return {string} HTML stringified form of `obj`
   */function htmlValue(value){if(value instanceof HTMLTemplateElement){return(/** @type {!HTMLTemplateElement } */value.innerHTML);}else if(value instanceof LiteralString){return literalValue(value);}else{throw new Error(`non-template value passed to Polymer's html function: ${value}`);}}/**
   * A template literal tag that creates an HTML <template> element from the
   * contents of the string.
   *
   * This allows you to write a Polymer Template in JavaScript.
   *
   * Templates can be composed by interpolating `HTMLTemplateElement`s in
   * expressions in the JavaScript template literal. The nested template's
   * `innerHTML` is included in the containing template.  The only other
   * values allowed in expressions are those returned from `htmlLiteral`
   * which ensures only literal values from JS source ever reach the HTML, to
   * guard against XSS risks.
   *
   * All other values are disallowed in expressions to help prevent XSS
   * attacks; however, `htmlLiteral` can be used to compose static
   * string values into templates. This is useful to compose strings into
   * places that do not accept html, like the css text of a `style`
   * element.
   *
   * Example:
   *
   *     static get template() {
   *       return html`
   *         <style>:host{ content:"..." }</style>
   *         <div class="shadowed">${this.partialTemplate}</div>
   *         ${super.template}
   *       `;
   *     }
   *     static get partialTemplate() { return html`<span>Partial!</span>`; }
   *
   * @param {!ITemplateArray} strings Constant parts of tagged template literal
   * @param {...*} values Variable parts of tagged template literal
   * @return {!HTMLTemplateElement} Constructed HTMLTemplateElement
   */const html=function html(strings,...values){const template=/** @type {!HTMLTemplateElement} */document.createElement('template');template.innerHTML=values.reduce((acc,v,idx)=>acc+htmlValue(v)+strings[idx+1],strings[0]);return template;};/**
    * An html literal tag that can be used with `html` to compose.
    * a literal string.
    *
    * Example:
    *
    *     static get template() {
    *       return html`
    *         <style>
    *           :host { display: block; }
    *           ${this.styleTemplate()}
    *         </style>
    *         <div class="shadowed">${staticValue}</div>
    *         ${super.template}
    *       `;
    *     }
    *     static get styleTemplate() {
    *        return htmlLiteral`.shadowed { background: gray; }`;
    *     }
    *
    * @param {!ITemplateArray} strings Constant parts of tagged template literal
    * @param {...*} values Variable parts of tagged template literal
    * @return {!LiteralString} Constructed literal string
    */const htmlLiteral=function(strings,...values){return new LiteralString(values.reduce((acc,v,idx)=>acc+literalValue(v)+strings[idx+1],strings[0]));};var htmlTag={html:html,htmlLiteral:htmlLiteral};const PolymerElement=ElementMixin(HTMLElement);var polymerElement={version:version,PolymerElement:PolymerElement,html:html};const domRepeatBase=OptionalMutableData(PolymerElement);/**
                                                            * The `<dom-repeat>` element will automatically stamp and binds one instance
                                                            * of template content to each object in a user-provided array.
                                                            * `dom-repeat` accepts an `items` property, and one instance of the template
                                                            * is stamped for each item into the DOM at the location of the `dom-repeat`
                                                            * element.  The `item` property will be set on each instance's binding
                                                            * scope, thus templates should bind to sub-properties of `item`.
                                                            *
                                                            * Example:
                                                            *
                                                            * ```html
                                                            * <dom-module id="employee-list">
                                                            *
                                                            *   <template>
                                                            *
                                                            *     <div> Employee list: </div>
                                                            *     <dom-repeat items="{{employees}}">
                                                            *       <template>
                                                            *         <div>First name: <span>{{item.first}}</span></div>
                                                            *         <div>Last name: <span>{{item.last}}</span></div>
                                                            *       </template>
                                                            *     </dom-repeat>
                                                            *
                                                            *   </template>
                                                            *
                                                            * </dom-module>
                                                            * ```
                                                            *
                                                            * With the following custom element definition:
                                                            *
                                                            * ```js
                                                            * class EmployeeList extends PolymerElement {
                                                            *   static get is() { return 'employee-list'; }
                                                            *   static get properties() {
                                                            *     return {
                                                            *       employees: {
                                                            *         value() {
                                                            *           return [
                                                            *             {first: 'Bob', last: 'Smith'},
                                                            *             {first: 'Sally', last: 'Johnson'},
                                                            *             ...
                                                            *           ];
                                                            *         }
                                                            *       }
                                                            *     };
                                                            *   }
                                                            * }
                                                            * ```
                                                            *
                                                            * Notifications for changes to items sub-properties will be forwarded to template
                                                            * instances, which will update via the normal structured data notification system.
                                                            *
                                                            * Mutations to the `items` array itself should be made using the Array
                                                            * mutation API's on the PropertyEffects mixin (`push`, `pop`, `splice`,
                                                            * `shift`, `unshift`), and template instances will be kept in sync with the
                                                            * data in the array.
                                                            *
                                                            * Events caught by event handlers within the `dom-repeat` template will be
                                                            * decorated with a `model` property, which represents the binding scope for
                                                            * each template instance.  The model should be used to manipulate data on the
                                                            * instance, for example `event.model.set('item.checked', true);`.
                                                            *
                                                            * Alternatively, the model for a template instance for an element stamped by
                                                            * a `dom-repeat` can be obtained using the `modelForElement` API on the
                                                            * `dom-repeat` that stamped it, for example
                                                            * `this.$.domRepeat.modelForElement(event.target).set('item.checked', true);`.
                                                            * This may be useful for manipulating instance data of event targets obtained
                                                            * by event handlers on parents of the `dom-repeat` (event delegation).
                                                            *
                                                            * A view-specific filter/sort may be applied to each `dom-repeat` by supplying a
                                                            * `filter` and/or `sort` property.  This may be a string that names a function on
                                                            * the host, or a function may be assigned to the property directly.  The functions
                                                            * should implemented following the standard `Array` filter/sort API.
                                                            *
                                                            * In order to re-run the filter or sort functions based on changes to sub-fields
                                                            * of `items`, the `observe` property may be set as a space-separated list of
                                                            * `item` sub-fields that should cause a re-filter/sort when modified.  If
                                                            * the filter or sort function depends on properties not contained in `items`,
                                                            * the user should observe changes to those properties and call `render` to update
                                                            * the view based on the dependency change.
                                                            *
                                                            * For example, for an `dom-repeat` with a filter of the following:
                                                            *
                                                            * ```js
                                                            * isEngineer(item) {
                                                            *   return item.type == 'engineer' || item.manager.type == 'engineer';
                                                            * }
                                                            * ```
                                                            *
                                                            * Then the `observe` property should be configured as follows:
                                                            *
                                                            * ```html
                                                            * <dom-repeat items="{{employees}}" filter="isEngineer" observe="type manager.type">
                                                            * ```
                                                            *
                                                            * @customElement
                                                            * @polymer
                                                            * @extends {domRepeatBase}
                                                            * @appliesMixin OptionalMutableData
                                                            * @summary Custom element for stamping instance of a template bound to
                                                            *   items in an array.
                                                            */class DomRepeat extends domRepeatBase{// Not needed to find template; can be removed once the analyzer
// can find the tag name from customElements.define call
static get is(){return'dom-repeat';}static get template(){return null;}static get properties(){/**
     * Fired whenever DOM is added or removed by this template (by
     * default, rendering occurs lazily).  To force immediate rendering, call
     * `render`.
     *
     * @event dom-change
     */return{/**
       * An array containing items determining how many instances of the template
       * to stamp and that that each template instance should bind to.
       */items:{type:Array},/**
       * The name of the variable to add to the binding scope for the array
       * element associated with a given template instance.
       */as:{type:String,value:'item'},/**
       * The name of the variable to add to the binding scope with the index
       * of the instance in the sorted and filtered list of rendered items.
       * Note, for the index in the `this.items` array, use the value of the
       * `itemsIndexAs` property.
       */indexAs:{type:String,value:'index'},/**
       * The name of the variable to add to the binding scope with the index
       * of the instance in the `this.items` array. Note, for the index of
       * this instance in the sorted and filtered list of rendered items,
       * use the value of the `indexAs` property.
       */itemsIndexAs:{type:String,value:'itemsIndex'},/**
       * A function that should determine the sort order of the items.  This
       * property should either be provided as a string, indicating a method
       * name on the element's host, or else be an actual function.  The
       * function should match the sort function passed to `Array.sort`.
       * Using a sort function has no effect on the underlying `items` array.
       */sort:{type:Function,observer:'__sortChanged'},/**
       * A function that can be used to filter items out of the view.  This
       * property should either be provided as a string, indicating a method
       * name on the element's host, or else be an actual function.  The
       * function should match the sort function passed to `Array.filter`.
       * Using a filter function has no effect on the underlying `items` array.
       */filter:{type:Function,observer:'__filterChanged'},/**
       * When using a `filter` or `sort` function, the `observe` property
       * should be set to a space-separated list of the names of item
       * sub-fields that should trigger a re-sort or re-filter when changed.
       * These should generally be fields of `item` that the sort or filter
       * function depends on.
       */observe:{type:String,observer:'__observeChanged'},/**
       * When using a `filter` or `sort` function, the `delay` property
       * determines a debounce time in ms after a change to observed item
       * properties that must pass before the filter or sort is re-run.
       * This is useful in rate-limiting shuffling of the view when
       * item changes may be frequent.
       */delay:Number,/**
       * Count of currently rendered items after `filter` (if any) has been applied.
       * If "chunking mode" is enabled, `renderedItemCount` is updated each time a
       * set of template instances is rendered.
       *
       */renderedItemCount:{type:Number,notify:true,readOnly:true},/**
       * Defines an initial count of template instances to render after setting
       * the `items` array, before the next paint, and puts the `dom-repeat`
       * into "chunking mode".  The remaining items will be created and rendered
       * incrementally at each animation frame therof until all instances have
       * been rendered.
       */initialCount:{type:Number,observer:'__initializeChunking'},/**
       * When `initialCount` is used, this property defines a frame rate (in
       * fps) to target by throttling the number of instances rendered each
       * frame to not exceed the budget for the target frame rate.  The
       * framerate is effectively the number of `requestAnimationFrame`s that
       * it tries to allow to actually fire in a given second. It does this
       * by measuring the time between `rAF`s and continuously adjusting the
       * number of items created each `rAF` to maintain the target framerate.
       * Setting this to a higher number allows lower latency and higher
       * throughput for event handlers and other tasks, but results in a
       * longer time for the remaining items to complete rendering.
       */targetFramerate:{type:Number,value:20},_targetFrameTime:{type:Number,computed:'__computeFrameTime(targetFramerate)'}};}static get observers(){return['__itemsChanged(items.*)'];}constructor(){super();this.__instances=[];this.__limit=Infinity;this.__pool=[];this.__renderDebouncer=null;this.__itemsIdxToInstIdx={};this.__chunkCount=null;this.__lastChunkTime=null;this.__sortFn=null;this.__filterFn=null;this.__observePaths=null;/** @type {?function(new:Polymer.TemplateInstanceBase, *)} */this.__ctor=null;this.__isDetached=true;this.template=null;}/**
     * @override
     * @return {void}
     */disconnectedCallback(){super.disconnectedCallback();this.__isDetached=true;for(let i=0;i<this.__instances.length;i++){this.__detachInstance(i);}}/**
     * @override
     * @return {void}
     */connectedCallback(){super.connectedCallback();this.style.display='none';// only perform attachment if the element was previously detached.
if(this.__isDetached){this.__isDetached=false;let parent=this.parentNode;for(let i=0;i<this.__instances.length;i++){this.__attachInstance(i,parent);}}}__ensureTemplatized(){// Templatizing (generating the instance constructor) needs to wait
// until ready, since won't have its template content handed back to
// it until then
if(!this.__ctor){let template=this.template=/** @type {HTMLTemplateElement} */this.querySelector('template');if(!template){// // Wait until childList changes and template should be there by then
let observer=new MutationObserver(()=>{if(this.querySelector('template')){observer.disconnect();this.__render();}else{throw new Error('dom-repeat requires a <template> child');}});observer.observe(this,{childList:true});return false;}// Template instance props that should be excluded from forwarding
let instanceProps={};instanceProps[this.as]=true;instanceProps[this.indexAs]=true;instanceProps[this.itemsIndexAs]=true;this.__ctor=templatize(template,this,{mutableData:this.mutableData,parentModel:true,instanceProps:instanceProps,/**
         * @this {DomRepeat}
         * @param {string} prop Property to set
         * @param {*} value Value to set property to
         */forwardHostProp:function(prop,value){let i$=this.__instances;for(let i=0,inst;i<i$.length&&(inst=i$[i]);i++){inst.forwardHostProp(prop,value);}},/**
         * @this {DomRepeat}
         * @param {Object} inst Instance to notify
         * @param {string} prop Property to notify
         * @param {*} value Value to notify
         */notifyInstanceProp:function(inst,prop,value){if(matches(this.as,prop)){let idx=inst[this.itemsIndexAs];if(prop==this.as){this.items[idx]=value;}let path=translate$1(this.as,'items.'+idx,prop);this.notifyPath(path,value);}}});}return true;}__getMethodHost(){// Technically this should be the owner of the outermost template.
// In shadow dom, this is always getRootNode().host, but we can
// approximate this via cooperation with our dataHost always setting
// `_methodHost` as long as there were bindings (or id's) on this
// instance causing it to get a dataHost.
return this.__dataHost._methodHost||this.__dataHost;}__functionFromPropertyValue(functionOrMethodName){if(typeof functionOrMethodName==='string'){let methodName=functionOrMethodName;let obj=this.__getMethodHost();return function(){return obj[methodName].apply(obj,arguments);};}return functionOrMethodName;}__sortChanged(sort){this.__sortFn=this.__functionFromPropertyValue(sort);if(this.items){this.__debounceRender(this.__render);}}__filterChanged(filter){this.__filterFn=this.__functionFromPropertyValue(filter);if(this.items){this.__debounceRender(this.__render);}}__computeFrameTime(rate){return Math.ceil(1000/rate);}__initializeChunking(){if(this.initialCount){this.__limit=this.initialCount;this.__chunkCount=this.initialCount;this.__lastChunkTime=performance.now();}}__tryRenderChunk(){// Debounced so that multiple calls through `_render` between animation
// frames only queue one new rAF (e.g. array mutation & chunked render)
if(this.items&&this.__limit<this.items.length){this.__debounceRender(this.__requestRenderChunk);}}__requestRenderChunk(){requestAnimationFrame(()=>this.__renderChunk());}__renderChunk(){// Simple auto chunkSize throttling algorithm based on feedback loop:
// measure actual time between frames and scale chunk count by ratio
// of target/actual frame time
let currChunkTime=performance.now();let ratio=this._targetFrameTime/(currChunkTime-this.__lastChunkTime);this.__chunkCount=Math.round(this.__chunkCount*ratio)||1;this.__limit+=this.__chunkCount;this.__lastChunkTime=currChunkTime;this.__debounceRender(this.__render);}__observeChanged(){this.__observePaths=this.observe&&this.observe.replace('.*','.').split(' ');}__itemsChanged(change){if(this.items&&!Array.isArray(this.items)){console.warn('dom-repeat expected array for `items`, found',this.items);}// If path was to an item (e.g. 'items.3' or 'items.3.foo'), forward the
// path to that instance synchronously (returns false for non-item paths)
if(!this.__handleItemPath(change.path,change.value)){// Otherwise, the array was reset ('items') or spliced ('items.splices'),
// so queue a full refresh
this.__initializeChunking();this.__debounceRender(this.__render);}}__handleObservedPaths(path){// Handle cases where path changes should cause a re-sort/filter
if(this.__sortFn||this.__filterFn){if(!path){// Always re-render if the item itself changed
this.__debounceRender(this.__render,this.delay);}else if(this.__observePaths){// Otherwise, re-render if the path changed matches an observed path
let paths=this.__observePaths;for(let i=0;i<paths.length;i++){if(path.indexOf(paths[i])===0){this.__debounceRender(this.__render,this.delay);}}}}}/**
     * @param {function(this:DomRepeat)} fn Function to debounce.
     * @param {number=} delay Delay in ms to debounce by.
     */__debounceRender(fn,delay=0){this.__renderDebouncer=Debouncer.debounce(this.__renderDebouncer,delay>0?timeOut.after(delay):microTask,fn.bind(this));enqueueDebouncer(this.__renderDebouncer);}/**
     * Forces the element to render its content. Normally rendering is
     * asynchronous to a provoking change. This is done for efficiency so
     * that multiple changes trigger only a single render. The render method
     * should be called if, for example, template rendering is required to
     * validate application state.
     * @return {void}
     */render(){// Queue this repeater, then flush all in order
this.__debounceRender(this.__render);flush$1();}__render(){if(!this.__ensureTemplatized()){// No template found yet
return;}this.__applyFullRefresh();// Reset the pool
// TODO(kschaaf): Reuse pool across turns and nested templates
// Now that objects/arrays are re-evaluated when set, we can safely
// reuse pooled instances across turns, however we still need to decide
// semantics regarding how long to hold, how many to hold, etc.
this.__pool.length=0;// Set rendered item count
this._setRenderedItemCount(this.__instances.length);// Notify users
this.dispatchEvent(new CustomEvent('dom-change',{bubbles:true,composed:true}));// Check to see if we need to render more items
this.__tryRenderChunk();}__applyFullRefresh(){let items=this.items||[];let isntIdxToItemsIdx=new Array(items.length);for(let i=0;i<items.length;i++){isntIdxToItemsIdx[i]=i;}// Apply user filter
if(this.__filterFn){isntIdxToItemsIdx=isntIdxToItemsIdx.filter((i,idx,array)=>this.__filterFn(items[i],idx,array));}// Apply user sort
if(this.__sortFn){isntIdxToItemsIdx.sort((a,b)=>this.__sortFn(items[a],items[b]));}// items->inst map kept for item path forwarding
const itemsIdxToInstIdx=this.__itemsIdxToInstIdx={};let instIdx=0;// Generate instances and assign items
const limit=Math.min(isntIdxToItemsIdx.length,this.__limit);for(;instIdx<limit;instIdx++){let inst=this.__instances[instIdx];let itemIdx=isntIdxToItemsIdx[instIdx];let item=items[itemIdx];itemsIdxToInstIdx[itemIdx]=instIdx;if(inst){inst._setPendingProperty(this.as,item);inst._setPendingProperty(this.indexAs,instIdx);inst._setPendingProperty(this.itemsIndexAs,itemIdx);inst._flushProperties();}else{this.__insertInstance(item,instIdx,itemIdx);}}// Remove any extra instances from previous state
for(let i=this.__instances.length-1;i>=instIdx;i--){this.__detachAndRemoveInstance(i);}}__detachInstance(idx){let inst=this.__instances[idx];for(let i=0;i<inst.children.length;i++){let el=inst.children[i];inst.root.appendChild(el);}return inst;}__attachInstance(idx,parent){let inst=this.__instances[idx];parent.insertBefore(inst.root,this);}__detachAndRemoveInstance(idx){let inst=this.__detachInstance(idx);if(inst){this.__pool.push(inst);}this.__instances.splice(idx,1);}__stampInstance(item,instIdx,itemIdx){let model={};model[this.as]=item;model[this.indexAs]=instIdx;model[this.itemsIndexAs]=itemIdx;return new this.__ctor(model);}__insertInstance(item,instIdx,itemIdx){let inst=this.__pool.pop();if(inst){// TODO(kschaaf): If the pool is shared across turns, hostProps
// need to be re-set to reused instances in addition to item
inst._setPendingProperty(this.as,item);inst._setPendingProperty(this.indexAs,instIdx);inst._setPendingProperty(this.itemsIndexAs,itemIdx);inst._flushProperties();}else{inst=this.__stampInstance(item,instIdx,itemIdx);}let beforeRow=this.__instances[instIdx+1];let beforeNode=beforeRow?beforeRow.children[0]:this;this.parentNode.insertBefore(inst.root,beforeNode);this.__instances[instIdx]=inst;return inst;}// Implements extension point from Templatize mixin
/**
   * Shows or hides the template instance top level child elements. For
   * text nodes, `textContent` is removed while "hidden" and replaced when
   * "shown."
   * @param {boolean} hidden Set to true to hide the children;
   * set to false to show them.
   * @return {void}
   * @protected
   */_showHideChildren(hidden){for(let i=0;i<this.__instances.length;i++){this.__instances[i]._showHideChildren(hidden);}}// Called as a side effect of a host items.<key>.<path> path change,
// responsible for notifying item.<path> changes to inst for key
__handleItemPath(path,value){let itemsPath=path.slice(6);// 'items.'.length == 6
let dot=itemsPath.indexOf('.');let itemsIdx=dot<0?itemsPath:itemsPath.substring(0,dot);// If path was index into array...
if(itemsIdx==parseInt(itemsIdx,10)){let itemSubPath=dot<0?'':itemsPath.substring(dot+1);// If the path is observed, it will trigger a full refresh
this.__handleObservedPaths(itemSubPath);// Note, even if a rull refresh is triggered, always do the path
// notification because unless mutableData is used for dom-repeat
// and all elements in the instance subtree, a full refresh may
// not trigger the proper update.
let instIdx=this.__itemsIdxToInstIdx[itemsIdx];let inst=this.__instances[instIdx];if(inst){let itemPath=this.as+(itemSubPath?'.'+itemSubPath:'');// This is effectively `notifyPath`, but avoids some of the overhead
// of the public API
inst._setPendingPropertyOrPath(itemPath,value,false,true);inst._flushProperties();}return true;}}/**
     * Returns the item associated with a given element stamped by
     * this `dom-repeat`.
     *
     * Note, to modify sub-properties of the item,
     * `modelForElement(el).set('item.<sub-prop>', value)`
     * should be used.
     *
     * @param {!HTMLElement} el Element for which to return the item.
     * @return {*} Item associated with the element.
     */itemForElement(el){let instance=this.modelForElement(el);return instance&&instance[this.as];}/**
     * Returns the inst index for a given element stamped by this `dom-repeat`.
     * If `sort` is provided, the index will reflect the sorted order (rather
     * than the original array order).
     *
     * @param {!HTMLElement} el Element for which to return the index.
     * @return {?number} Row index associated with the element (note this may
     *   not correspond to the array index if a user `sort` is applied).
     */indexForElement(el){let instance=this.modelForElement(el);return instance&&instance[this.indexAs];}/**
     * Returns the template "model" associated with a given element, which
     * serves as the binding scope for the template instance the element is
     * contained in. A template model
     * should be used to manipulate data associated with this template instance.
     *
     * Example:
     *
     *   let model = modelForElement(el);
     *   if (model.index < 10) {
     *     model.set('item.checked', true);
     *   }
     *
     * @param {!HTMLElement} el Element for which to return a template model.
     * @return {TemplateInstanceBase} Model representing the binding scope for
     *   the element.
     */modelForElement(el){return modelForElement(this.template,el);}}customElements.define(DomRepeat.is,DomRepeat);var domRepeat={DomRepeat:DomRepeat};class DomIf extends PolymerElement{// Not needed to find template; can be removed once the analyzer
// can find the tag name from customElements.define call
static get is(){return'dom-if';}static get template(){return null;}static get properties(){return{/**
       * Fired whenever DOM is added or removed/hidden by this template (by
       * default, rendering occurs lazily).  To force immediate rendering, call
       * `render`.
       *
       * @event dom-change
       */ /**
           * A boolean indicating whether this template should stamp.
           */if:{type:Boolean,observer:'__debounceRender'},/**
       * When true, elements will be removed from DOM and discarded when `if`
       * becomes false and re-created and added back to the DOM when `if`
       * becomes true.  By default, stamped elements will be hidden but left
       * in the DOM when `if` becomes false, which is generally results
       * in better performance.
       */restamp:{type:Boolean,observer:'__debounceRender'}};}constructor(){super();this.__renderDebouncer=null;this.__invalidProps=null;this.__instance=null;this._lastIf=false;this.__ctor=null;this.__hideTemplateChildren__=false;}__debounceRender(){// Render is async for 2 reasons:
// 1. To eliminate dom creation trashing if user code thrashes `if` in the
//    same turn. This was more common in 1.x where a compound computed
//    property could result in the result changing multiple times, but is
//    mitigated to a large extent by batched property processing in 2.x.
// 2. To avoid double object propagation when a bag including values bound
//    to the `if` property as well as one or more hostProps could enqueue
//    the <dom-if> to flush before the <template>'s host property
//    forwarding. In that scenario creating an instance would result in
//    the host props being set once, and then the enqueued changes on the
//    template would set properties a second time, potentially causing an
//    object to be set to an instance more than once.  Creating the
//    instance async from flushing data ensures this doesn't happen. If
//    we wanted a sync option in the future, simply having <dom-if> flush
//    (or clear) its template's pending host properties before creating
//    the instance would also avoid the problem.
this.__renderDebouncer=Debouncer.debounce(this.__renderDebouncer,microTask,()=>this.__render());enqueueDebouncer(this.__renderDebouncer);}/**
     * @override
     * @return {void}
     */disconnectedCallback(){super.disconnectedCallback();if(!this.parentNode||this.parentNode.nodeType==Node.DOCUMENT_FRAGMENT_NODE&&!this.parentNode.host){this.__teardownInstance();}}/**
     * @override
     * @return {void}
     */connectedCallback(){super.connectedCallback();this.style.display='none';if(this.if){this.__debounceRender();}}/**
     * Forces the element to render its content. Normally rendering is
     * asynchronous to a provoking change. This is done for efficiency so
     * that multiple changes trigger only a single render. The render method
     * should be called if, for example, template rendering is required to
     * validate application state.
     * @return {void}
     */render(){flush$1();}__render(){if(this.if){if(!this.__ensureInstance()){// No template found yet
return;}this._showHideChildren();}else if(this.restamp){this.__teardownInstance();}if(!this.restamp&&this.__instance){this._showHideChildren();}if(this.if!=this._lastIf){this.dispatchEvent(new CustomEvent('dom-change',{bubbles:true,composed:true}));this._lastIf=this.if;}}__ensureInstance(){let parentNode=this.parentNode;// Guard against element being detached while render was queued
if(parentNode){if(!this.__ctor){let template=/** @type {HTMLTemplateElement} */this.querySelector('template');if(!template){// Wait until childList changes and template should be there by then
let observer=new MutationObserver(()=>{if(this.querySelector('template')){observer.disconnect();this.__render();}else{throw new Error('dom-if requires a <template> child');}});observer.observe(this,{childList:true});return false;}this.__ctor=templatize(template,this,{// dom-if templatizer instances require `mutable: true`, as
// `__syncHostProperties` relies on that behavior to sync objects
mutableData:true,/**
           * @param {string} prop Property to forward
           * @param {*} value Value of property
           * @this {DomIf}
           */forwardHostProp:function(prop,value){if(this.__instance){if(this.if){this.__instance.forwardHostProp(prop,value);}else{// If we have an instance but are squelching host property
// forwarding due to if being false, note the invalidated
// properties so `__syncHostProperties` can sync them the next
// time `if` becomes true
this.__invalidProps=this.__invalidProps||Object.create(null);this.__invalidProps[root(prop)]=true;}}}});}if(!this.__instance){this.__instance=new this.__ctor();parentNode.insertBefore(this.__instance.root,this);}else{this.__syncHostProperties();let c$=this.__instance.children;if(c$&&c$.length){// Detect case where dom-if was re-attached in new position
let lastChild=this.previousSibling;if(lastChild!==c$[c$.length-1]){for(let i=0,n;i<c$.length&&(n=c$[i]);i++){parentNode.insertBefore(n,this);}}}}}return true;}__syncHostProperties(){let props=this.__invalidProps;if(props){for(let prop in props){this.__instance._setPendingProperty(prop,this.__dataHost[prop]);}this.__invalidProps=null;this.__instance._flushProperties();}}__teardownInstance(){if(this.__instance){let c$=this.__instance.children;if(c$&&c$.length){// use first child parent, for case when dom-if may have been detached
let parent=c$[0].parentNode;// Instance children may be disconnected from parents when dom-if
// detaches if a tree was innerHTML'ed
if(parent){for(let i=0,n;i<c$.length&&(n=c$[i]);i++){parent.removeChild(n);}}}this.__instance=null;this.__invalidProps=null;}}/**
     * Shows or hides the template instance top level child elements. For
     * text nodes, `textContent` is removed while "hidden" and replaced when
     * "shown."
     * @return {void}
     * @protected
     * @suppress {visibility}
     */_showHideChildren(){let hidden=this.__hideTemplateChildren__||!this.if;if(this.__instance){this.__instance._showHideChildren(hidden);}}}customElements.define(DomIf.is,DomIf);var domIf={DomIf:DomIf};let ArraySelectorMixin=dedupingMixin(superClass=>{/**
   * @constructor
   * @extends {superClass}
   * @implements {Polymer_ElementMixin}
   * @private
   */let elementBase=ElementMixin(superClass);/**
                                                  * @polymer
                                                  * @mixinClass
                                                  * @implements {Polymer_ArraySelectorMixin}
                                                  * @unrestricted
                                                  */class ArraySelectorMixin extends elementBase{static get properties(){return{/**
         * An array containing items from which selection will be made.
         */items:{type:Array},/**
         * When `true`, multiple items may be selected at once (in this case,
         * `selected` is an array of currently selected items).  When `false`,
         * only one item may be selected at a time.
         */multi:{type:Boolean,value:false},/**
         * When `multi` is true, this is an array that contains any selected.
         * When `multi` is false, this is the currently selected item, or `null`
         * if no item is selected.
         * @type {?(Object|Array<!Object>)}
         */selected:{type:Object,notify:true},/**
         * When `multi` is false, this is the currently selected item, or `null`
         * if no item is selected.
         * @type {?Object}
         */selectedItem:{type:Object,notify:true},/**
         * When `true`, calling `select` on an item that is already selected
         * will deselect the item.
         */toggle:{type:Boolean,value:false}};}static get observers(){return['__updateSelection(multi, items.*)'];}constructor(){super();this.__lastItems=null;this.__lastMulti=null;this.__selectedMap=null;}__updateSelection(multi,itemsInfo){let path=itemsInfo.path;if(path=='items'){// Case 1 - items array changed, so diff against previous array and
// deselect any removed items and adjust selected indices
let newItems=itemsInfo.base||[];let lastItems=this.__lastItems;let lastMulti=this.__lastMulti;if(multi!==lastMulti){this.clearSelection();}if(lastItems){let splices=calculateSplices(newItems,lastItems);this.__applySplices(splices);}this.__lastItems=newItems;this.__lastMulti=multi;}else if(itemsInfo.path=='items.splices'){// Case 2 - got specific splice information describing the array mutation:
// deselect any removed items and adjust selected indices
this.__applySplices(itemsInfo.value.indexSplices);}else{// Case 3 - an array element was changed, so deselect the previous
// item for that index if it was previously selected
let part=path.slice('items.'.length);let idx=parseInt(part,10);if(part.indexOf('.')<0&&part==idx){this.__deselectChangedIdx(idx);}}}__applySplices(splices){let selected=this.__selectedMap;// Adjust selected indices and mark removals
for(let i=0;i<splices.length;i++){let s=splices[i];selected.forEach((idx,item)=>{if(idx<s.index){// no change
}else if(idx>=s.index+s.removed.length){// adjust index
selected.set(item,idx+s.addedCount-s.removed.length);}else{// remove index
selected.set(item,-1);}});for(let j=0;j<s.addedCount;j++){let idx=s.index+j;if(selected.has(this.items[idx])){selected.set(this.items[idx],idx);}}}// Update linked paths
this.__updateLinks();// Remove selected items that were removed from the items array
let sidx=0;selected.forEach((idx,item)=>{if(idx<0){if(this.multi){this.splice('selected',sidx,1);}else{this.selected=this.selectedItem=null;}selected.delete(item);}else{sidx++;}});}__updateLinks(){this.__dataLinkedPaths={};if(this.multi){let sidx=0;this.__selectedMap.forEach(idx=>{if(idx>=0){this.linkPaths('items.'+idx,'selected.'+sidx++);}});}else{this.__selectedMap.forEach(idx=>{this.linkPaths('selected','items.'+idx);this.linkPaths('selectedItem','items.'+idx);});}}/**
       * Clears the selection state.
       * @return {void}
       */clearSelection(){// Unbind previous selection
this.__dataLinkedPaths={};// The selected map stores 3 pieces of information:
// key: items array object
// value: items array index
// order: selected array index
this.__selectedMap=new Map();// Initialize selection
this.selected=this.multi?[]:null;this.selectedItem=null;}/**
       * Returns whether the item is currently selected.
       *
       * @param {*} item Item from `items` array to test
       * @return {boolean} Whether the item is selected
       */isSelected(item){return this.__selectedMap.has(item);}/**
       * Returns whether the item is currently selected.
       *
       * @param {number} idx Index from `items` array to test
       * @return {boolean} Whether the item is selected
       */isIndexSelected(idx){return this.isSelected(this.items[idx]);}__deselectChangedIdx(idx){let sidx=this.__selectedIndexForItemIndex(idx);if(sidx>=0){let i=0;this.__selectedMap.forEach((idx,item)=>{if(sidx==i++){this.deselect(item);}});}}__selectedIndexForItemIndex(idx){let selected=this.__dataLinkedPaths['items.'+idx];if(selected){return parseInt(selected.slice('selected.'.length),10);}}/**
       * Deselects the given item if it is already selected.
       *
       * @param {*} item Item from `items` array to deselect
       * @return {void}
       */deselect(item){let idx=this.__selectedMap.get(item);if(idx>=0){this.__selectedMap.delete(item);let sidx;if(this.multi){sidx=this.__selectedIndexForItemIndex(idx);}this.__updateLinks();if(this.multi){this.splice('selected',sidx,1);}else{this.selected=this.selectedItem=null;}}}/**
       * Deselects the given index if it is already selected.
       *
       * @param {number} idx Index from `items` array to deselect
       * @return {void}
       */deselectIndex(idx){this.deselect(this.items[idx]);}/**
       * Selects the given item.  When `toggle` is true, this will automatically
       * deselect the item if already selected.
       *
       * @param {*} item Item from `items` array to select
       * @return {void}
       */select(item){this.selectIndex(this.items.indexOf(item));}/**
       * Selects the given index.  When `toggle` is true, this will automatically
       * deselect the item if already selected.
       *
       * @param {number} idx Index from `items` array to select
       * @return {void}
       */selectIndex(idx){let item=this.items[idx];if(!this.isSelected(item)){if(!this.multi){this.__selectedMap.clear();}this.__selectedMap.set(item,idx);this.__updateLinks();if(this.multi){this.push('selected',item);}else{this.selected=this.selectedItem=item;}}else if(this.toggle){this.deselectIndex(idx);}}}return ArraySelectorMixin;});// export mixin
let baseArraySelector=ArraySelectorMixin(PolymerElement);/**
                                                             * Element implementing the `ArraySelector` mixin, which records
                                                             * dynamic associations between item paths in a master `items` array and a
                                                             * `selected` array such that path changes to the master array (at the host)
                                                             * element or elsewhere via data-binding) are correctly propagated to items
                                                             * in the selected array and vice-versa.
                                                             *
                                                             * The `items` property accepts an array of user data, and via the
                                                             * `select(item)` and `deselect(item)` API, updates the `selected` property
                                                             * which may be bound to other parts of the application, and any changes to
                                                             * sub-fields of `selected` item(s) will be kept in sync with items in the
                                                             * `items` array.  When `multi` is false, `selected` is a property
                                                             * representing the last selected item.  When `multi` is true, `selected`
                                                             * is an array of multiply selected items.
                                                             *
                                                             * Example:
                                                             *
                                                             * ```js
                                                             * import {PolymerElement} from '@polymer/polymer';
                                                             * import '@polymer/polymer/lib/elements/array-selector.js';
                                                             *
                                                             * class EmployeeList extends PolymerElement {
                                                             *   static get _template() {
                                                             *     return html`
                                                             *         <div> Employee list: </div>
                                                             *         <dom-repeat id="employeeList" items="{{employees}}">
                                                             *           <template>
                                                             *             <div>First name: <span>{{item.first}}</span></div>
                                                             *               <div>Last name: <span>{{item.last}}</span></div>
                                                             *               <button on-click="toggleSelection">Select</button>
                                                             *           </template>
                                                             *         </dom-repeat>
                                                             *
                                                             *         <array-selector id="selector"
                                                             *                         items="{{employees}}"
                                                             *                         selected="{{selected}}"
                                                             *                         multi toggle></array-selector>
                                                             *
                                                             *         <div> Selected employees: </div>
                                                             *         <dom-repeat items="{{selected}}">
                                                             *           <template>
                                                             *             <div>First name: <span>{{item.first}}</span></div>
                                                             *             <div>Last name: <span>{{item.last}}</span></div>
                                                             *           </template>
                                                             *         </dom-repeat>`;
                                                             *   }
                                                             *   static get is() { return 'employee-list'; }
                                                             *   static get properties() {
                                                             *     return {
                                                             *       employees: {
                                                             *         value() {
                                                             *           return [
                                                             *             {first: 'Bob', last: 'Smith'},
                                                             *             {first: 'Sally', last: 'Johnson'},
                                                             *             ...
                                                             *           ];
                                                             *         }
                                                             *       }
                                                             *     };
                                                             *   }
                                                             *   toggleSelection(e) {
                                                             *     const item = this.$.employeeList.itemForElement(e.target);
                                                             *     this.$.selector.select(item);
                                                             *   }
                                                             * }
                                                             * ```
                                                             *
                                                             * @polymer
                                                             * @customElement
                                                             * @extends {baseArraySelector}
                                                             * @appliesMixin ArraySelectorMixin
                                                             * @summary Custom element that links paths between an input `items` array and
                                                             *   an output `selected` item or array based on calls to its selection API.
                                                             */class ArraySelector extends baseArraySelector{// Not needed to find template; can be removed once the analyzer
// can find the tag name from customElements.define call
static get is(){return'array-selector';}}customElements.define(ArraySelector.is,ArraySelector);var arraySelector={ArraySelectorMixin:ArraySelectorMixin,ArraySelector:ArraySelector};/**
   @license
   Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
   The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
   The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
   Code distributed by Google as part of the polymer project is also
   subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
   */'use strict';const customStyleInterface$1=new CustomStyleInterface();if(!window.ShadyCSS){window.ShadyCSS={/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */prepareTemplate(template,elementName,elementExtends){},// eslint-disable-line no-unused-vars
/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */prepareTemplateDom(template,elementName){},// eslint-disable-line no-unused-vars
/**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @param {string=} elementExtends
     */prepareTemplateStyles(template,elementName,elementExtends){},// eslint-disable-line no-unused-vars
/**
     * @param {Element} element
     * @param {Object=} properties
     */styleSubtree(element,properties){customStyleInterface$1.processStyles();updateNativeProperties(element,properties);},/**
     * @param {Element} element
     */styleElement(element){// eslint-disable-line no-unused-vars
customStyleInterface$1.processStyles();},/**
     * @param {Object=} properties
     */styleDocument(properties){customStyleInterface$1.processStyles();updateNativeProperties(document.body,properties);},/**
     * @param {Element} element
     * @param {string} property
     * @return {string}
     */getComputedStyleValue(element,property){return getComputedStyleValue(element,property);},flushCustomStyles(){},nativeCss:nativeCssVariables,nativeShadow:nativeShadow,cssBuild:cssBuild};}window.ShadyCSS.CustomStyleInterface=customStyleInterface$1;const attr='include';const CustomStyleInterface$1=window.ShadyCSS.CustomStyleInterface;/**
                                                                     * Custom element for defining styles in the main document that can take
                                                                     * advantage of [shady DOM](https://github.com/webcomponents/shadycss) shims
                                                                     * for style encapsulation, custom properties, and custom mixins.
                                                                     *
                                                                     * - Document styles defined in a `<custom-style>` are shimmed to ensure they
                                                                     *   do not leak into local DOM when running on browsers without native
                                                                     *   Shadow DOM.
                                                                     * - Custom properties can be defined in a `<custom-style>`. Use the `html` selector
                                                                     *   to define custom properties that apply to all custom elements.
                                                                     * - Custom mixins can be defined in a `<custom-style>`, if you import the optional
                                                                     *   [apply shim](https://github.com/webcomponents/shadycss#about-applyshim)
                                                                     *   (`shadycss/apply-shim.html`).
                                                                     *
                                                                     * To use:
                                                                     *
                                                                     * - Import `custom-style.html`.
                                                                     * - Place a `<custom-style>` element in the main document, wrapping an inline `<style>` tag that
                                                                     *   contains the CSS rules you want to shim.
                                                                     *
                                                                     * For example:
                                                                     *
                                                                     * ```html
                                                                     * <!-- import apply shim--only required if using mixins -->
                                                                     * <link rel="import" href="bower_components/shadycss/apply-shim.html">
                                                                     * <!-- import custom-style element -->
                                                                     * <link rel="import" href="bower_components/polymer/lib/elements/custom-style.html">
                                                                     *
                                                                     * <custom-style>
                                                                     *   <style>
                                                                     *     html {
                                                                     *       --custom-color: blue;
                                                                     *       --custom-mixin: {
                                                                     *         font-weight: bold;
                                                                     *         color: red;
                                                                     *       };
                                                                     *     }
                                                                     *   </style>
                                                                     * </custom-style>
                                                                     * ```
                                                                     *
                                                                     * @customElement
                                                                     * @extends HTMLElement
                                                                     * @summary Custom element for defining styles in the main document that can
                                                                     *   take advantage of Polymer's style scoping and custom properties shims.
                                                                     */class CustomStyle extends HTMLElement{constructor(){super();this._style=null;CustomStyleInterface$1.addCustomStyle(this);}/**
     * Returns the light-DOM `<style>` child this element wraps.  Upon first
     * call any style modules referenced via the `include` attribute will be
     * concatenated to this element's `<style>`.
     *
     * @export
     * @return {HTMLStyleElement} This element's light-DOM `<style>`
     */getStyle(){if(this._style){return this._style;}const style=/** @type {HTMLStyleElement} */this.querySelector('style');if(!style){return null;}this._style=style;const include=style.getAttribute(attr);if(include){style.removeAttribute(attr);style.textContent=cssFromModules(include)+style.textContent;}/*
      HTML Imports styling the main document are deprecated in Chrome
      https://crbug.com/523952
       If this element is not in the main document, then it must be in an HTML Import document.
      In that case, move the custom style to the main document.
       The ordering of `<custom-style>` should stay the same as when loaded by HTML Imports, but there may be odd
      cases of ordering w.r.t the main document styles.
      */if(this.ownerDocument!==window.document){window.document.head.appendChild(this);}return this._style;}}window.customElements.define('custom-style',CustomStyle);var customStyle={CustomStyle:CustomStyle};let mutablePropertyChange$1;/** @suppress {missingProperties} */(()=>{mutablePropertyChange$1=MutableData._mutablePropertyChange;})();/**
       * Legacy element behavior to skip strict dirty-checking for objects and arrays,
       * (always consider them to be "dirty") for use on legacy API Polymer elements.
       *
       * By default, `Polymer.PropertyEffects` performs strict dirty checking on
       * objects, which means that any deep modifications to an object or array will
       * not be propagated unless "immutable" data patterns are used (i.e. all object
       * references from the root to the mutation were changed).
       *
       * Polymer also provides a proprietary data mutation and path notification API
       * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
       * mutation and notification of deep changes in an object graph to all elements
       * bound to the same object graph.
       *
       * In cases where neither immutable patterns nor the data mutation API can be
       * used, applying this mixin will cause Polymer to skip dirty checking for
       * objects and arrays (always consider them to be "dirty").  This allows a
       * user to make a deep modification to a bound object graph, and then either
       * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
       * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
       * elements that wish to be updated based on deep mutations must apply this
       * mixin or otherwise skip strict dirty checking for objects/arrays.
       * Specifically, any elements in the binding tree between the source of a
       * mutation and the consumption of it must apply this behavior or enable the
       * `Polymer.OptionalMutableDataBehavior`.
       *
       * In order to make the dirty check strategy configurable, see
       * `Polymer.OptionalMutableDataBehavior`.
       *
       * Note, the performance characteristics of propagating large object graphs
       * will be worse as opposed to using strict dirty checking with immutable
       * patterns or Polymer's path notification API.
       *
       * @polymerBehavior
       * @summary Behavior to skip strict dirty-checking for objects and
       *   arrays
       */const MutableDataBehavior={/**
   * Overrides `Polymer.PropertyEffects` to provide option for skipping
   * strict equality checking for Objects and Arrays.
   *
   * This method pulls the value to dirty check against from the `__dataTemp`
   * cache (rather than the normal `__data` cache) for Objects.  Since the temp
   * cache is cleared at the end of a turn, this implementation allows
   * side-effects of deep object changes to be processed by re-setting the
   * same object (using the temp cache as an in-turn backstop to prevent
   * cycles due to 2-way notification).
   *
   * @param {string} property Property name
   * @param {*} value New property value
   * @param {*} old Previous property value
   * @return {boolean} Whether the property should be considered a change
   * @protected
   */_shouldPropertyChange(property,value,old){return mutablePropertyChange$1(this,property,value,old,true);}};/**
    * Legacy element behavior to add the optional ability to skip strict
    * dirty-checking for objects and arrays (always consider them to be
    * "dirty") by setting a `mutable-data` attribute on an element instance.
    *
    * By default, `Polymer.PropertyEffects` performs strict dirty checking on
    * objects, which means that any deep modifications to an object or array will
    * not be propagated unless "immutable" data patterns are used (i.e. all object
    * references from the root to the mutation were changed).
    *
    * Polymer also provides a proprietary data mutation and path notification API
    * (e.g. `notifyPath`, `set`, and array mutation API's) that allow efficient
    * mutation and notification of deep changes in an object graph to all elements
    * bound to the same object graph.
    *
    * In cases where neither immutable patterns nor the data mutation API can be
    * used, applying this mixin will allow Polymer to skip dirty checking for
    * objects and arrays (always consider them to be "dirty").  This allows a
    * user to make a deep modification to a bound object graph, and then either
    * simply re-set the object (e.g. `this.items = this.items`) or call `notifyPath`
    * (e.g. `this.notifyPath('items')`) to update the tree.  Note that all
    * elements that wish to be updated based on deep mutations must apply this
    * mixin or otherwise skip strict dirty checking for objects/arrays.
    * Specifically, any elements in the binding tree between the source of a
    * mutation and the consumption of it must enable this behavior or apply the
    * `Polymer.OptionalMutableDataBehavior`.
    *
    * While this behavior adds the ability to forgo Object/Array dirty checking,
    * the `mutableData` flag defaults to false and must be set on the instance.
    *
    * Note, the performance characteristics of propagating large object graphs
    * will be worse by relying on `mutableData: true` as opposed to using
    * strict dirty checking with immutable patterns or Polymer's path notification
    * API.
    *
    * @polymerBehavior
    * @summary Behavior to optionally skip strict dirty-checking for objects and
    *   arrays
    */const OptionalMutableDataBehavior={properties:{/**
     * Instance-level flag for configuring the dirty-checking strategy
     * for this element.  When true, Objects and Arrays will skip dirty
     * checking, otherwise strict equality checking will be used.
     */mutableData:Boolean},/**
   * Overrides `Polymer.PropertyEffects` to skip strict equality checking
   * for Objects and Arrays.
   *
   * Pulls the value to dirty check against from the `__dataTemp` cache
   * (rather than the normal `__data` cache) for Objects.  Since the temp
   * cache is cleared at the end of a turn, this implementation allows
   * side-effects of deep object changes to be processed by re-setting the
   * same object (using the temp cache as an in-turn backstop to prevent
   * cycles due to 2-way notification).
   *
   * @param {string} property Property name
   * @param {*} value New property value
   * @param {*} old Previous property value
   * @return {boolean} Whether the property should be considered a change
   * @this {this}
   * @protected
   */_shouldPropertyChange(property,value,old){return mutablePropertyChange$1(this,property,value,old,this.mutableData);}};var mutableDataBehavior={MutableDataBehavior:MutableDataBehavior,OptionalMutableDataBehavior:OptionalMutableDataBehavior};const Base=LegacyElementMixin(HTMLElement).prototype;var polymerLegacy={Base:Base,Polymer:Polymer$1,html:html};Polymer$1({is:'iron-request',hostAttributes:{hidden:true},properties:{/**
     * A reference to the XMLHttpRequest instance used to generate the
     * network request.
     *
     * @type {XMLHttpRequest}
     */xhr:{type:Object,notify:true,readOnly:true,value:function(){return new XMLHttpRequest();}},/**
     * A reference to the parsed response body, if the `xhr` has completely
     * resolved.
     *
     * @type {*}
     * @default null
     */response:{type:Object,notify:true,readOnly:true,value:function(){return null;}},/**
     * A reference to the status code, if the `xhr` has completely resolved.
     */status:{type:Number,notify:true,readOnly:true,value:0},/**
     * A reference to the status text, if the `xhr` has completely resolved.
     */statusText:{type:String,notify:true,readOnly:true,value:''},/**
     * A promise that resolves when the `xhr` response comes back, or rejects
     * if there is an error before the `xhr` completes.
     * The resolve callback is called with the original request as an argument.
     * By default, the reject callback is called with an `Error` as an argument.
     * If `rejectWithRequest` is true, the reject callback is called with an
     * object with two keys: `request`, the original request, and `error`, the
     * error object.
     *
     * @type {Promise}
     */completes:{type:Object,readOnly:true,notify:true,value:function(){return new Promise(function(resolve,reject){this.resolveCompletes=resolve;this.rejectCompletes=reject;}.bind(this));}},/**
     * An object that contains progress information emitted by the XHR if
     * available.
     *
     * @default {}
     */progress:{type:Object,notify:true,readOnly:true,value:function(){return{};}},/**
     * Aborted will be true if an abort of the request is attempted.
     */aborted:{type:Boolean,notify:true,readOnly:true,value:false},/**
     * Errored will be true if the browser fired an error event from the
     * XHR object (mainly network errors).
     */errored:{type:Boolean,notify:true,readOnly:true,value:false},/**
     * TimedOut will be true if the XHR threw a timeout event.
     */timedOut:{type:Boolean,notify:true,readOnly:true,value:false}},/**
   * Succeeded is true if the request succeeded. The request succeeded if it
   * loaded without error, wasn't aborted, and the status code is ≥ 200, and
   * < 300, or if the status code is 0.
   *
   * The status code 0 is accepted as a success because some schemes - e.g.
   * file:// - don't provide status codes.
   *
   * @return {boolean}
   */get succeeded(){if(this.errored||this.aborted||this.timedOut){return false;}var status=this.xhr.status||0;// Note: if we are using the file:// protocol, the status code will be 0
// for all outcomes (successful or otherwise).
return status===0||status>=200&&status<300;},/**
   * Sends an HTTP request to the server and returns a promise (see the
   * `completes` property for details).
   *
   * The handling of the `body` parameter will vary based on the Content-Type
   * header. See the docs for iron-ajax's `body` property for details.
   *
   * @param {{
   *   url: string,
   *   method: (string|undefined),
   *   async: (boolean|undefined),
   *   body:
   * (ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object),
   *   headers: (Object|undefined),
   *   handleAs: (string|undefined),
   *   jsonPrefix: (string|undefined),
   *   withCredentials: (boolean|undefined),
   *   timeout: (number|undefined),
   *   rejectWithRequest: (boolean|undefined)}} options -
   *   - url The url to which the request is sent.
   *   - method The HTTP method to use, default is GET.
   *   - async By default, all requests are sent asynchronously. To send
   * synchronous requests, set to false.
   *   -  body The content for the request body for POST method.
   *   -  headers HTTP request headers.
   *   -  handleAs The response type. Default is 'text'.
   *   -  withCredentials Whether or not to send credentials on the request.
   * Default is false.
   *   -  timeout - Timeout for request, in milliseconds.
   *   -  rejectWithRequest Set to true to include the request object with
   * promise rejections.
   * @return {Promise}
   */send:function(options){var xhr=this.xhr;if(xhr.readyState>0){return null;}xhr.addEventListener('progress',function(progress){this._setProgress({lengthComputable:progress.lengthComputable,loaded:progress.loaded,total:progress.total});// Webcomponents v1 spec does not fire *-changed events when not connected
this.fire('iron-request-progress-changed',{value:this.progress});}.bind(this));xhr.addEventListener('error',function(error){this._setErrored(true);this._updateStatus();var response=options.rejectWithRequest?{error:error,request:this}:error;this.rejectCompletes(response);}.bind(this));xhr.addEventListener('timeout',function(error){this._setTimedOut(true);this._updateStatus();var response=options.rejectWithRequest?{error:error,request:this}:error;this.rejectCompletes(response);}.bind(this));xhr.addEventListener('abort',function(){this._setAborted(true);this._updateStatus();var error=new Error('Request aborted.');var response=options.rejectWithRequest?{error:error,request:this}:error;this.rejectCompletes(response);}.bind(this));// Called after all of the above.
xhr.addEventListener('loadend',function(){this._updateStatus();this._setResponse(this.parseResponse());if(!this.succeeded){var error=new Error('The request failed with status code: '+this.xhr.status);var response=options.rejectWithRequest?{error:error,request:this}:error;this.rejectCompletes(response);return;}this.resolveCompletes(this);}.bind(this));this.url=options.url;var isXHRAsync=options.async!==false;xhr.open(options.method||'GET',options.url,isXHRAsync);var acceptType={'json':'application/json','text':'text/plain','html':'text/html','xml':'application/xml','arraybuffer':'application/octet-stream'}[options.handleAs];var headers=options.headers||Object.create(null);var newHeaders=Object.create(null);for(var key in headers){newHeaders[key.toLowerCase()]=headers[key];}headers=newHeaders;if(acceptType&&!headers['accept']){headers['accept']=acceptType;}Object.keys(headers).forEach(function(requestHeader){if(/[A-Z]/.test(requestHeader)){Base._error('Headers must be lower case, got',requestHeader);}xhr.setRequestHeader(requestHeader,headers[requestHeader]);},this);if(isXHRAsync){xhr.timeout=options.timeout;var handleAs=options.handleAs;// If a JSON prefix is present, the responseType must be 'text' or the
// browser won’t be able to parse the response.
if(!!options.jsonPrefix||!handleAs){handleAs='text';}// In IE, `xhr.responseType` is an empty string when the response
// returns. Hence, caching it as `xhr._responseType`.
xhr.responseType=xhr._responseType=handleAs;// Cache the JSON prefix, if it exists.
if(!!options.jsonPrefix){xhr._jsonPrefix=options.jsonPrefix;}}xhr.withCredentials=!!options.withCredentials;var body=this._encodeBodyObject(options.body,headers['content-type']);xhr.send(/**
                 @type {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|
                         null|string|undefined}
               */body);return this.completes;},/**
   * Attempts to parse the response body of the XHR. If parsing succeeds,
   * the value returned will be deserialized based on the `responseType`
   * set on the XHR.
   *
   * @return {*} The parsed response,
   * or undefined if there was an empty response or parsing failed.
   */parseResponse:function(){var xhr=this.xhr;var responseType=xhr.responseType||xhr._responseType;var preferResponseText=!this.xhr.responseType;var prefixLen=xhr._jsonPrefix&&xhr._jsonPrefix.length||0;try{switch(responseType){case'json':// If the xhr object doesn't have a natural `xhr.responseType`,
// we can assume that the browser hasn't parsed the response for us,
// and so parsing is our responsibility. Likewise if response is
// undefined, as there's no way to encode undefined in JSON.
if(preferResponseText||xhr.response===undefined){// Try to emulate the JSON section of the response body section of
// the spec: https://xhr.spec.whatwg.org/#response-body
// That is to say, we try to parse as JSON, but if anything goes
// wrong return null.
try{return JSON.parse(xhr.responseText);}catch(_){console.warn('Failed to parse JSON sent from '+xhr.responseURL);return null;}}return xhr.response;case'xml':return xhr.responseXML;case'blob':case'document':case'arraybuffer':return xhr.response;case'text':default:{// If `prefixLen` is set, it implies the response should be parsed
// as JSON once the prefix of length `prefixLen` is stripped from
// it. Emulate the behavior above where null is returned on failure
// to parse.
if(prefixLen){try{return JSON.parse(xhr.responseText.substring(prefixLen));}catch(_){console.warn('Failed to parse JSON sent from '+xhr.responseURL);return null;}}return xhr.responseText;}}}catch(e){this.rejectCompletes(new Error('Could not parse response. '+e.message));}},/**
   * Aborts the request.
   */abort:function(){this._setAborted(true);this.xhr.abort();},/**
   * @param {*} body The given body of the request to try and encode.
   * @param {?string} contentType The given content type, to infer an encoding
   *     from.
   * @return {*} Either the encoded body as a string, if successful,
   *     or the unaltered body object if no encoding could be inferred.
   */_encodeBodyObject:function(body,contentType){if(typeof body=='string'){return body;// Already encoded.
}var bodyObj=/** @type {Object} */body;switch(contentType){case'application/json':return JSON.stringify(bodyObj);case'application/x-www-form-urlencoded':return this._wwwFormUrlEncode(bodyObj);}return body;},/**
   * @param {Object} object The object to encode as x-www-form-urlencoded.
   * @return {string} .
   */_wwwFormUrlEncode:function(object){if(!object){return'';}var pieces=[];Object.keys(object).forEach(function(key){// TODO(rictic): handle array values here, in a consistent way with
//   iron-ajax params.
pieces.push(this._wwwFormUrlEncodePiece(key)+'='+this._wwwFormUrlEncodePiece(object[key]));},this);return pieces.join('&');},/**
   * @param {*} str A key or value to encode as x-www-form-urlencoded.
   * @return {string} .
   */_wwwFormUrlEncodePiece:function(str){// Spec says to normalize newlines to \r\n and replace %20 spaces with +.
// jQuery does this as well, so this is likely to be widely compatible.
if(str===null||str===undefined||!str.toString){return'';}return encodeURIComponent(str.toString().replace(/\r?\n/g,'\r\n')).replace(/%20/g,'+');},/**
   * Updates the status code and status text.
   */_updateStatus:function(){this._setStatus(this.xhr.status);this._setStatusText(this.xhr.statusText===undefined?'':this.xhr.statusText);}});Polymer$1({is:'iron-ajax',/**
   * Fired before a request is sent.
   *
   * @event iron-ajax-presend
   */ /**
       * Fired when a request is sent.
       *
       * @event request
       */ /**
           * Fired when a request is sent.
           *
           * @event iron-ajax-request
           */ /**
               * Fired when a response is received.
               *
               * @event response
               */ /**
                   * Fired when a response is received.
                   *
                   * @event iron-ajax-response
                   */ /**
                       * Fired when an error is received.
                       *
                       * @event error
                       */ /**
                           * Fired when an error is received.
                           *
                           * @event iron-ajax-error
                           */hostAttributes:{hidden:true},properties:{/**
     * The URL target of the request.
     */url:{type:String},/**
     * An object that contains query parameters to be appended to the
     * specified `url` when generating a request. If you wish to set the body
     * content when making a POST request, you should use the `body` property
     * instead.
     */params:{type:Object,value:function(){return{};}},/**
     * The HTTP method to use such as 'GET', 'POST', 'PUT', or 'DELETE'.
     * Default is 'GET'.
     */method:{type:String,value:'GET'},/**
     * HTTP request headers to send.
     *
     * Example:
     *
     *     <iron-ajax
     *         auto
     *         url="http://somesite.com"
     *         headers='{"X-Requested-With": "XMLHttpRequest"}'
     *         handle-as="json"></iron-ajax>
     *
     * Note: setting a `Content-Type` header here will override the value
     * specified by the `contentType` property of this element.
     */headers:{type:Object,value:function(){return{};}},/**
     * Content type to use when sending data. If the `contentType` property
     * is set and a `Content-Type` header is specified in the `headers`
     * property, the `headers` property value will take precedence.
     *
     * Varies the handling of the `body` param.
     */contentType:{type:String,value:null},/**
     * Body content to send with the request, typically used with "POST"
     * requests.
     *
     * If body is a string it will be sent unmodified.
     *
     * If Content-Type is set to a value listed below, then
     * the body will be encoded accordingly.
     *
     *    * `content-type="application/json"`
     *      * body is encoded like `{"foo":"bar baz","x":1}`
     *    * `content-type="application/x-www-form-urlencoded"`
     *      * body is encoded like `foo=bar+baz&x=1`
     *
     * Otherwise the body will be passed to the browser unmodified, and it
     * will handle any encoding (e.g. for FormData, Blob, ArrayBuffer).
     *
     * @type
     * (ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object)
     */body:{type:Object,value:null},/**
     * Toggle whether XHR is synchronous or asynchronous. Don't change this
     * to true unless You Know What You Are Doing™.
     */sync:{type:Boolean,value:false},/**
     * Specifies what data to store in the `response` property, and
     * to deliver as `event.detail.response` in `response` events.
     *
     * One of:
     *
     *    `text`: uses `XHR.responseText`.
     *
     *    `xml`: uses `XHR.responseXML`.
     *
     *    `json`: uses `XHR.responseText` parsed as JSON.
     *
     *    `arraybuffer`: uses `XHR.response`.
     *
     *    `blob`: uses `XHR.response`.
     *
     *    `document`: uses `XHR.response`.
     */handleAs:{type:String,value:'json'},/**
     * Set the withCredentials flag on the request.
     */withCredentials:{type:Boolean,value:false},/**
     * Set the timeout flag on the request.
     */timeout:{type:Number,value:0},/**
     * If true, automatically performs an Ajax request when either `url` or
     * `params` changes.
     */auto:{type:Boolean,value:false},/**
     * If true, error messages will automatically be logged to the console.
     */verbose:{type:Boolean,value:false},/**
     * The most recent request made by this iron-ajax element.
     *
     * @type {Object|undefined}
     */lastRequest:{type:Object,notify:true,readOnly:true},/**
     * The `progress` property of this element's `lastRequest`.
     *
     * @type {Object|undefined}
     */lastProgress:{type:Object,notify:true,readOnly:true},/**
     * True while lastRequest is in flight.
     */loading:{type:Boolean,notify:true,readOnly:true},/**
     * lastRequest's response.
     *
     * Note that lastResponse and lastError are set when lastRequest finishes,
     * so if loading is true, then lastResponse and lastError will correspond
     * to the result of the previous request.
     *
     * The type of the response is determined by the value of `handleAs` at
     * the time that the request was generated.
     *
     * @type {Object}
     */lastResponse:{type:Object,notify:true,readOnly:true},/**
     * lastRequest's error, if any.
     *
     * @type {Object}
     */lastError:{type:Object,notify:true,readOnly:true},/**
     * An Array of all in-flight requests originating from this iron-ajax
     * element.
     */activeRequests:{type:Array,notify:true,readOnly:true,value:function(){return[];}},/**
     * Length of time in milliseconds to debounce multiple automatically
     * generated requests.
     */debounceDuration:{type:Number,value:0,notify:true},/**
     * Prefix to be stripped from a JSON response before parsing it.
     *
     * In order to prevent an attack using CSRF with Array responses
     * (http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx/)
     * many backends will mitigate this by prefixing all JSON response bodies
     * with a string that would be nonsensical to a JavaScript parser.
     *
     */jsonPrefix:{type:String,value:''},/**
     * By default, iron-ajax's events do not bubble. Setting this attribute will
     * cause its request and response events as well as its iron-ajax-request,
     * -response,  and -error events to bubble to the window object. The vanilla
     * error event never bubbles when using shadow dom even if this.bubbles is
     * true because a scoped flag is not passed with it (first link) and because
     * the shadow dom spec did not used to allow certain events, including
     * events named error, to leak outside of shadow trees (second link).
     * https://www.w3.org/TR/shadow-dom/#scoped-flag
     * https://www.w3.org/TR/2015/WD-shadow-dom-20151215/#events-that-are-not-leaked-into-ancestor-trees
     */bubbles:{type:Boolean,value:false},/**
     * Changes the [`completes`](iron-request#property-completes) promise chain
     * from `generateRequest` to reject with an object
     * containing the original request, as well an error message.
     * If false (default), the promise rejects with an error message only.
     */rejectWithRequest:{type:Boolean,value:false},_boundHandleResponse:{type:Function,value:function(){return this._handleResponse.bind(this);}}},observers:['_requestOptionsChanged(url, method, params.*, headers, contentType, '+'body, sync, handleAs, jsonPrefix, withCredentials, timeout, auto)'],created:function(){this._boundOnProgressChanged=this._onProgressChanged.bind(this);},/**
   * The query string that should be appended to the `url`, serialized from
   * the current value of `params`.
   *
   * @return {string}
   */get queryString(){var queryParts=[];var param;var value;for(param in this.params){value=this.params[param];param=window.encodeURIComponent(param);if(Array.isArray(value)){for(var i=0;i<value.length;i++){queryParts.push(param+'='+window.encodeURIComponent(value[i]));}}else if(value!==null){queryParts.push(param+'='+window.encodeURIComponent(value));}else{queryParts.push(param);}}return queryParts.join('&');},/**
   * The `url` with query string (if `params` are specified), suitable for
   * providing to an `iron-request` instance.
   *
   * @return {string}
   */get requestUrl(){var queryString=this.queryString;var url=this.url||'';if(queryString){var bindingChar=url.indexOf('?')>=0?'&':'?';return url+bindingChar+queryString;}return url;},/**
   * An object that maps header names to header values, first applying the
   * the value of `Content-Type` and then overlaying the headers specified
   * in the `headers` property.
   *
   * @return {Object}
   */get requestHeaders(){var headers={};var contentType=this.contentType;if(contentType==null&&typeof this.body==='string'){contentType='application/x-www-form-urlencoded';}if(contentType){headers['content-type']=contentType;}var header;if(typeof this.headers==='object'){for(header in this.headers){headers[header]=this.headers[header].toString();}}return headers;},_onProgressChanged:function(event){this._setLastProgress(event.detail.value);},/**
   * Request options suitable for generating an `iron-request` instance based
   * on the current state of the `iron-ajax` instance's properties.
   *
   * @return {{
   *   url: string,
   *   method: (string|undefined),
   *   async: (boolean|undefined),
   *   body:
   * (ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object),
   *   headers: (Object|undefined),
   *   handleAs: (string|undefined),
   *   jsonPrefix: (string|undefined),
   *   withCredentials: (boolean|undefined)}}
   */toRequestOptions:function(){return{url:this.requestUrl||'',method:this.method,headers:this.requestHeaders,body:this.body,async:!this.sync,handleAs:this.handleAs,jsonPrefix:this.jsonPrefix,withCredentials:this.withCredentials,timeout:this.timeout,rejectWithRequest:this.rejectWithRequest};},/**
   * Performs an AJAX request to the specified URL.
   *
   * @return {!IronRequestElement}
   */generateRequest:function(){var request=/** @type {!IronRequestElement} */document.createElement('iron-request');var requestOptions=this.toRequestOptions();this.push('activeRequests',request);request.completes.then(this._boundHandleResponse).catch(this._handleError.bind(this,request)).then(this._discardRequest.bind(this,request));var evt=this.fire('iron-ajax-presend',{request:request,options:requestOptions},{bubbles:this.bubbles,cancelable:true});if(evt.defaultPrevented){request.abort();request.rejectCompletes(request);return request;}if(this.lastRequest){this.lastRequest.removeEventListener('iron-request-progress-changed',this._boundOnProgressChanged);}request.addEventListener('iron-request-progress-changed',this._boundOnProgressChanged);request.send(requestOptions);this._setLastProgress(null);this._setLastRequest(request);this._setLoading(true);this.fire('request',{request:request,options:requestOptions},{bubbles:this.bubbles,composed:true});this.fire('iron-ajax-request',{request:request,options:requestOptions},{bubbles:this.bubbles,composed:true});return request;},_handleResponse:function(request){if(request===this.lastRequest){this._setLastResponse(request.response);this._setLastError(null);this._setLoading(false);}this.fire('response',request,{bubbles:this.bubbles,composed:true});this.fire('iron-ajax-response',request,{bubbles:this.bubbles,composed:true});},_handleError:function(request,error){if(this.verbose){Base._error(error);}if(request===this.lastRequest){this._setLastError({request:request,error:error,status:request.xhr.status,statusText:request.xhr.statusText,response:request.xhr.response});this._setLastResponse(null);this._setLoading(false);}// Tests fail if this goes after the normal this.fire('error', ...)
this.fire('iron-ajax-error',{request:request,error:error},{bubbles:this.bubbles,composed:true});this.fire('error',{request:request,error:error},{bubbles:this.bubbles,composed:true});},_discardRequest:function(request){var requestIndex=this.activeRequests.indexOf(request);if(requestIndex>-1){this.splice('activeRequests',requestIndex,1);}},_requestOptionsChanged:function(){this.debounce('generate-request',function(){if(this.url==null){return;}if(this.auto){this.generateRequest();}},this.debounceDuration);}});const bundledImportMeta$3={...import.meta,url:new URL('../../node_modules/i18n-number/i18n-number.js',import.meta.url).href};var intlLibraryScript;var intlLibraryLoadingStatus='initializing';var _setupIntlPolyfillCalled=false;var formatCache=new Map();/**
                              * Set up Intl polyfill if required
                              */function _setupIntlPolyfill(){// Polyfill Intl if required
var intlLibraryUrl=this.resolveUrl('../intl/dist/Intl.min.js',this.importMeta.url);if(window.Intl){if(window.IntlPolyfill&&window.Intl===window.IntlPolyfill){intlLibraryLoadingStatus='loaded';}else{intlLibraryLoadingStatus='native';}}else{intlLibraryLoadingStatus='loading';intlLibraryScript=document.createElement('script');intlLibraryScript.setAttribute('src',intlLibraryUrl);intlLibraryScript.setAttribute('id','intl-js-library');intlLibraryScript.addEventListener('load',function intlLibraryLoaded(e){intlLibraryLoadingStatus='loaded';e.target.removeEventListener('load',intlLibraryLoaded);return false;});var s=document.querySelector('script')||document.body;s.parentNode.insertBefore(intlLibraryScript,s);}}/**
   * Set up polyfill locale of Intl if required
   *
   * @param {String} locale Target locale to polyfill
   * @param {Function} callback Callback function to handle locale load
   * @return {Boolean} true if supported; false if callback will be called
   */function _setupIntlPolyfillLocale(locale,callback){if(!window.IntlPolyfill){switch(intlLibraryLoadingStatus){case'loading':/* istanbul ignore else: intlLibraryScript is always set when the status is 'loading' */if(intlLibraryScript){var libraryLoadedBindThis=function(e){_setupIntlPolyfillLocale.call(this,locale,callback);e.target.removeEventListener('load',libraryLoadedBindThis);}.bind(this);intlLibraryScript.addEventListener('load',libraryLoadedBindThis);return false;}else{console.error('Intl.js is not being loaded');}/* istanbul ignore next: intlLibraryScript is always set when the status is 'loading' */break;// impossible cases
case'initializing':case'loaded':case'native':default:/* istanbul ignore next: these cases are impossible */break;}}else{if(intlLibraryLoadingStatus!=='native'){var supported=Intl.NumberFormat.supportedLocalesOf(locale,{localeMatcher:'lookup'});var script;var intlScript;if(supported.length===0){// load the locale
var fallbackLanguages=_enumerateFallbackLanguages(locale);locale=fallbackLanguages.shift();script=document.querySelector('script#intl-js-locale-'+locale);if(!script){script=document.createElement('script');script.setAttribute('id','intl-js-locale-'+locale);script.setAttribute('src',this.resolveUrl('../intl/locale-data/jsonp/'+locale+'.js',this.importMeta.url));var intlLocaleLoadedBindThis=function(e){if(e.target===script){e.target.removeEventListener('load',intlLocaleLoadedBindThis);callback.call(this,locale);}return false;}.bind(this);var intlLocaleLoadErrorBindThis=function(e){if(e.target===script){e.target.removeEventListener('error',intlLocaleLoadErrorBindThis);script.setAttribute('loaderror','');locale=fallbackLanguages.shift();if(!locale){locale=this.DEFAULT_LANG;}var fallbackSupport=Intl.NumberFormat.supportedLocalesOf(locale,{localeMatcher:'lookup'});if(fallbackSupport.length>0){callback.call(this,locale);}else{_setupIntlPolyfillLocale.call(this,locale,callback);}return false;}}.bind(this);script.addEventListener('load',intlLocaleLoadedBindThis);script.addEventListener('error',intlLocaleLoadErrorBindThis);intlScript=document.querySelector('script#intl-js-library')||document.body;intlScript.parentNode.insertBefore(script,intlScript.nextSibling);}else if(!script.hasAttribute('loaderror')){// already loading
var anotherIntlLocaleLoadedBindThis=function(e){if(e.target===script){callback.call(this,locale);e.target.removeEventListener('load',anotherIntlLocaleLoadedBindThis);return false;}}.bind(this);var anotherIntlLocaleLoadErrorBindThis=function(e){if(e.target===script){e.target.removeEventListener('error',anotherIntlLocaleLoadErrorBindThis);locale=fallbackLanguages.shift();if(!locale){locale=this.DEFAULT_LANG;}var fallbackSupport=Intl.NumberFormat.supportedLocalesOf(locale,{localeMatcher:'lookup'});if(fallbackSupport.length>0){callback.call(this,locale);}else{_setupIntlPolyfillLocale.call(this,locale,callback);}return false;}}.bind(this);script.addEventListener('load',anotherIntlLocaleLoadedBindThis);script.addEventListener('error',anotherIntlLocaleLoadErrorBindThis);}else{var enSupport=Intl.NumberFormat.supportedLocalesOf(this.DEFAULT_LANG,{localeMatcher:'lookup'});if(enSupport.length>0){callback.call(this,this.DEFAULT_LANG);}else{_setupIntlPolyfillLocale.call(this,this.DEFAULT_LANG,callback);}}return false;}}}return true;}/**
   * Enumerate fallback locales for the target locale.
   * 
   * Subset implementation of BCP47 (https://tools.ietf.org/html/bcp47).
   *
   * ### Examples:
   *
   *| Target Locale | Fallback 1 | Fallback 2 | Fallback 3 |
   *|:--------------|:-----------|:-----------|:-----------|
   *| ru            | N/A        | N/A        | N/A        |
   *| en-GB         | en         | N/A        | N/A        |
   *| en-Latn-GB    | en-GB      | en-Latn    | en         |
   *| fr-CA         | fr         | N/A        | N/A        |
   *| zh-Hans-CN    | zh-Hans    | zh         | N/A        |
   *| zh-CN         | zh-Hans    | zh         | N/A        |
   *| zh-TW         | zh-Hant    | zh         | N/A        |
   *
   * #### Note:
   *
   * For zh language, the script Hans or Hant is supplied as its default script when a country/region code is supplied.
   *
   * @param {string} lang Target locale.
   * @return {Array} List of fallback locales including the target locale at the index 0.
   */function _enumerateFallbackLanguages(lang){var result=[];var parts;var match;var isExtLangCode=0;var extLangCode;var isScriptCode=0;var scriptCode;var isCountryCode=0;var countryCode;var n;/* istanbul ignore if: lang is always a non-null string */if(!lang||lang.length===0){result.push('');}else{parts=lang.split(/[-_]/);// normalize ISO-639-1 language codes
if(parts.length>0&&parts[0].match(/^[A-Za-z]{2,3}$/)){// language codes have to be lowercased
// e.g. JA -> ja, FR -> fr
// TODO: normalize 3-letter codes to 2-letter codes
parts[0]=parts[0].toLowerCase();}// normalize ISO-639-3 extension language codes
if(parts.length>=2&&parts[1].match(/^[A-Za-z]{3}$/)&&!parts[1].match(/^[Cc][Hh][SsTt]$/)){// exclude CHS,CHT
// extension language codes have to be lowercased
// e.g. YUE -> yue
isExtLangCode=1;extLangCode=parts[1]=parts[1].toLowerCase();}// normalize ISO-15924 script codes
if(parts.length>=isExtLangCode+2&&(match=parts[isExtLangCode+1].match(/^([A-Za-z])([A-Za-z]{3})$/))){// script codes have to be capitalized only at the first character
// e.g. HANs -> Hans, lAtN -> Latn
isScriptCode=1;scriptCode=parts[isExtLangCode+1]=match[1].toUpperCase()+match[2].toLowerCase();}// normalize ISO-3166-1 country/region codes
if(parts.length>=isExtLangCode+isScriptCode+2&&(match=parts[isExtLangCode+isScriptCode+1].match(/^[A-Za-z0-9]{2,3}$/))){// country/region codes have to be capitalized
// e.g. cn -> CN, jP -> JP
isCountryCode=1;countryCode=parts[isExtLangCode+isScriptCode+1]=match[0].toUpperCase();}// extensions have to be in lowercases
// e.g. U-cA-Buddhist -> u-ca-buddhist, X-LiNux -> x-linux
if(parts.length>=isExtLangCode+isScriptCode+isCountryCode+2){for(n=isExtLangCode+isScriptCode+isCountryCode+1;n<parts.length;n++){parts[n]=parts[n].toLowerCase();}}// enumerate fallback languages
while(parts.length>0){// normalize delimiters as -
// e.g. ja_JP -> ja-JP
if(!parts[parts.length-1].match(/^[xu]$/)){result.push(parts.join('-'));}if(isScriptCode&&isCountryCode&&parts.length==isExtLangCode+isScriptCode+2){// script code can be omitted to default
// e.g. en-Latn-GB -> en-GB, zh-Hans-CN -> zh-CN
parts.splice(isExtLangCode+isScriptCode,1);result.push(parts.join('-'));parts.splice(isExtLangCode+isScriptCode,0,scriptCode);}if(isExtLangCode&&isCountryCode&&parts.length==isExtLangCode+isScriptCode+2){// ext lang code can be omitted to default
// e.g. zh-yue-Hans-CN -> zh-Hans-CN
parts.splice(isExtLangCode,1);result.push(parts.join('-'));parts.splice(isExtLangCode,0,extLangCode);}if(isExtLangCode&&isScriptCode&&parts.length==isExtLangCode+isScriptCode+1){// ext lang code can be omitted to default
// e.g. zh-yue-Hans -> zh-Hans
parts.splice(isExtLangCode,1);result.push(parts.join('-'));parts.splice(isExtLangCode,0,extLangCode);}if(!isScriptCode&&!isExtLangCode&&isCountryCode&&parts.length==2){// default script code can be added in certain cases with country codes
// e.g. zh-CN -> zh-Hans-CN, zh-TW -> zh-Hant-TW
switch(result[result.length-1]){case'zh-CN':case'zh-CHS':result.push('zh-Hans');break;case'zh-TW':case'zh-SG':case'zh-HK':case'zh-CHT':result.push('zh-Hant');break;default:break;}}parts.pop();}}return result;}Polymer$1({importMeta:bundledImportMeta$3,is:'i18n-number',_template:(t=>{t.setAttribute('strip-whitespace','');return t;})(html`<span id="number"></span>`),/**
   * Fired whenever the formatted text is rendered.
   *
   * @event rendered
   */properties:{/**
     * The locale for the formatted number.
     * The typical value is bound to `{{effectiveLang}}` when the containing element has
     * `BehaviorsStore.I18nBehavior`.
     */_lang:{type:String,value:'en',observer:'_langChanged',reflectToAttribute:false},/**
     * Options object for Intl.NumberFormat 
     * (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)
     */options:{type:Object,observer:'_optionsChanged',notify:true},/**
     * Raw string synchronized with textContent
     */raw:{type:String,observer:'_rawChanged'},/**
     * Offset for number
     *
     * Note: number = rawNumber - offset 
     */offset:{type:Number,value:0,observer:'_offsetChanged'},/**
     * Raw number parsed from raw
     */rawNumber:{type:Number,notify:true},/**
     * Number calculated from rawNumber and offset
     */number:{type:Number,notify:true},/**
     * Formatted string rendered for UI
     *
     * Note:
     *   - While Intl.js Polyfill locale module is being loaded, the value is set as `undefined` until load completion.
     */formatted:{type:String,notify:true}},observers:['_onOptionsPropertyChanged(options.*)'],/**
   * Default locale constant 'en'
   */DEFAULT_LANG:'en',/**
   * Start loading Intl polyfill only once
   */registered:function(){if(!_setupIntlPolyfillCalled){_setupIntlPolyfillCalled=true;_setupIntlPolyfill.call(this);}},ready:function(){this._setupObservers();this.raw=this.textNode.data;if(!this.lang){// Polyfill non-functional default value for lang property in Safari 7
this.lang=this.DEFAULT_LANG;}},attached:function(){this.raw=this.textNode.data;},/**
   * Set up observers of textContent mutations
   */_setupObservers:function(){let i=0;do{this.textNode=dom(this).childNodes[i++];if(!this.textNode){this.textNode=dom(this).childNodes[0];break;}}while(this.textNode.nodeType!==this.textNode.TEXT_NODE);if(!this.textNode){dom(this).appendChild(document.createTextNode(''));this.textNode=dom(this).childNodes[0];}this.observer=new MutationObserver(this._textMutated.bind(this));this.observer.observe(this.textNode,{characterData:true});this.observer.observe(this,{attributes:true,attributeFilter:['lang']});this.nodeObserver=dom(this).observeNodes(function(info){let i=0;do{if(info.addedNodes[i]&&info.addedNodes[i].nodeType===info.addedNodes[i].TEXT_NODE){this.textNode=info.addedNodes[i];this.raw=this.textNode.data;//console.log('i18n-number: text node added with ' + this.raw);
this.observer.observe(this.textNode,{characterData:true});break;}i++;}while(i<info.addedNodes.length);}.bind(this));},/**
   * MutationObserver callback of the child text node to re-render on text mutations.
   *
   * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
   */_textMutated:function(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'characterData'://console.log('i18n-number: _textMutated: raw = ' + mutation.target.data);
if(this.raw!==mutation.target.data){this.raw=mutation.target.data;}break;case'attributes':if(mutation.attributeName==='lang'){this._lang=this.lang;}break;default:/* istanbul ignore next: mutation.type is characterData or attributes */break;}},this);},/**
   * Observer of `raw` property to re-render the formatted number.
   *
   * @param {string} raw New raw number string.
   */_rawChanged:function(raw){if(this.textNode){if(raw!==this.textNode.data){this.textNode.data=raw;}//console.log('i18n-number: _rawChanged: raw = ' + raw);
this._render(this.lang,this.options,raw,this.offset);}},/**
   * Observer of `lang` property to re-render the formatted number.
   *
   * @param {string} lang New locale.
   */_langChanged:function(lang){if(!lang){this.lang=this.DEFAULT_LANG;lang=this.lang;}if(this.textNode){//console.log('i18n-number: _langChanged: lang = ' + lang);
this._render(lang,this.options,this.raw,this.offset);}},/**
   * Observer of `options` property to re-render the formatted number.
   *
   * @param {Object} options New options for Intl.NumberFormat.
   */_optionsChanged:function(options){if(this.textNode){//console.log('i18n-number: _optionsChanged: options = ' + JSON.stringify(options));
this._render(this.lang,options,this.raw,this.offset);}},/**
   * Observer of `options` sub-properties to re-render the formatted number.
   */_onOptionsPropertyChanged:function()/* changeRecord */{if(this.textNode){//console.log('_onOptionsPropertyChanged: path = ' + changeRecord.path + ' value = ' + JSON.stringify(changeRecord.value));
this._render(this.lang,this.options,this.raw,this.offset);}},/**
   * Observer of `offset` property to re-render the formatted number.
   *
   * @param {number} offset New offset.
   */_offsetChanged:function(offset){if(this.textNode){//console.log('i18n-number: _offsetChanged: offset = ' + offset);
this._render(this.lang,this.options,this.raw,offset);}},/**
   * Get a cached Intl.NumberFormat object
   *
   * @param {string} lang Locale for formatting.
   * @param {Object} options Options for Intl.NumberFormat.
   * @return {Object} Intl.NumberFormat object.
   */_getNumberFormatObject(lang,options){let formatId=lang+JSON.stringify(options);let formatObject=formatCache.get(formatId);if(!formatObject){formatObject=new Intl.NumberFormat(lang,options);formatCache.set(formatId,formatObject);}return formatObject;},/**
   * Formats the number
   *
   * @param {string} lang Locale for formatting.
   * @param {Object} options Options for Intl.NumberFormat.
   * @param {number} number Number to format.
   * @return {string} Formatted number string.
   */_formatNumber:function(lang,options,number){if(!lang){lang=this.DEFAULT_LANG;}switch(intlLibraryLoadingStatus){case'loaded':case'loading':default:try{if(_setupIntlPolyfillLocale.call(this,lang,function(locale){this.effectiveLang=locale;this._render.call(this,locale,this.options,this.raw,this.offset);}.bind(this))){return this._getNumberFormatObject(lang,options).format(number);}else{// waiting for callback
return undefined;}}catch(e){return number.toString();}/* istanbul ignore next: unreachable code due to returns in the same case */break;case'native':// native
try{return this._getNumberFormatObject(lang,options).format(number);}catch(e){return number.toString();}/* istanbul ignore next: unreachable code due to returns in the same case */break;}},/**
   * Renders the formatted number
   *
   * @param {string} lang Locale for formatting.
   * @param {Object} options Options for Intl.NumberFormat.
   * @param {string} raw Raw number string.
   * @param {number} offset Offset for number.
   */_render:function(lang,options,raw,offset){// TODO: rendering may be done redundantly on property initializations
raw=raw.trim();if(!raw&&!this.formatted){//console.log('i18n-number: skipping _render as raw is null');
return;}if(raw){this.rawNumber=Number(raw);this.number=this.rawNumber-offset;this.formatted=this._formatNumber(lang,options,this.number);}else{this.rawNumber=undefined;this.number=undefined;this.formatted='';}this.$.number.textContent=this.formatted?this.formatted:'';//console.log('i18n-number: _render ' + this.formatted);
if(typeof this.formatted!=='undefined'){this.fire('rendered');}},/**
   * Renders the formatted number with the current parameters
   *
   * Note: (As of Polymer 1.2.3)
   *   Explicit render() call is needed whenever the observer 
   *   `_onOptionsPropertyChanged(options.*)` is NOT invoked 
   *   after a property of `options` is changed.  An explicit call 
   *   `this.notifyPath('options', this.options, true)` can also 
   *   trigger re-rendering.
   *
   *   If the changed property of `options` is bound in an annotation
   *   like `{{options.currency}}`, the observer `_onOptionsPropertyChanged(options.*)`
   *   is automatically called whenever the property value is changed
   *   and thus no explicit call of `render()` or `notifyPath()` is
   *   required.
   */render:function(){this._render(this.lang,this.options,this.raw,this.offset);}});const _cp=[function(n,ord){if(ord)return'other';return'other';},function(n,ord){if(ord)return'other';return n==1?'one':'other';},function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';}];var plurals={af:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ak:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},am:function(n,ord){if(ord)return'other';return n>=0&&n<=1?'one':'other';},ar:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return'other';return n==0?'zero':n==1?'one':n==2?'two':n100>=3&&n100<=10?'few':n100>=11&&n100<=99?'many':'other';},ars:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return'other';return n==0?'zero':n==1?'one':n==2?'two':n100>=3&&n100<=10?'few':n100>=11&&n100<=99?'many':'other';},as:function(n,ord){if(ord)return n==1||n==5||n==7||n==8||n==9||n==10?'one':n==2||n==3?'two':n==4?'few':n==6?'many':'other';return n>=0&&n<=1?'one':'other';},asa:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ast:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},az:function(n,ord){var s=String(n).split('.'),i=s[0],i10=i.slice(-1),i100=i.slice(-2),i1000=i.slice(-3);if(ord)return i10==1||i10==2||i10==5||i10==7||i10==8||i100==20||i100==50||i100==70||i100==80?'one':i10==3||i10==4||i1000==100||i1000==200||i1000==300||i1000==400||i1000==500||i1000==600||i1000==700||i1000==800||i1000==900?'few':i==0||i10==6||i100==40||i100==60||i100==90?'many':'other';return n==1?'one':'other';},be:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return(n10==2||n10==3)&&n100!=12&&n100!=13?'few':'other';return n10==1&&n100!=11?'one':n10>=2&&n10<=4&&(n100<12||n100>14)?'few':t0&&n10==0||n10>=5&&n10<=9||n100>=11&&n100<=14?'many':'other';},bem:function(n,ord){if(ord)return'other';return n==1?'one':'other';},bez:function(n,ord){if(ord)return'other';return n==1?'one':'other';},bg:function(n,ord){if(ord)return'other';return n==1?'one':'other';},bh:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},bm:function(n,ord){if(ord)return'other';return'other';},bn:function(n,ord){if(ord)return n==1||n==5||n==7||n==8||n==9||n==10?'one':n==2||n==3?'two':n==4?'few':n==6?'many':'other';return n>=0&&n<=1?'one':'other';},bo:function(n,ord){if(ord)return'other';return'other';},br:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),n1000000=t0&&s[0].slice(-6);if(ord)return'other';return n10==1&&n100!=11&&n100!=71&&n100!=91?'one':n10==2&&n100!=12&&n100!=72&&n100!=92?'two':(n10==3||n10==4||n10==9)&&(n100<10||n100>19)&&(n100<70||n100>79)&&(n100<90||n100>99)?'few':n!=0&&t0&&n1000000==0?'many':'other';},brx:function(n,ord){if(ord)return'other';return n==1?'one':'other';},bs:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return'other';return v0&&i10==1&&i100!=11||f10==1&&f100!=11?'one':v0&&i10>=2&&i10<=4&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?'few':'other';},ca:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return n==1||n==3?'one':n==2?'two':n==4?'few':'other';return n==1&&v0?'one':'other';},ce:function(n,ord){if(ord)return'other';return n==1?'one':'other';},cgg:function(n,ord){if(ord)return'other';return n==1?'one':'other';},chr:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ckb:function(n,ord){if(ord)return'other';return n==1?'one':'other';},cs:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1];if(ord)return'other';return n==1&&v0?'one':i>=2&&i<=4&&v0?'few':!v0?'many':'other';},cy:function(n,ord){if(ord)return n==0||n==7||n==8||n==9?'zero':n==1?'one':n==2?'two':n==3||n==4?'few':n==5||n==6?'many':'other';return n==0?'zero':n==1?'one':n==2?'two':n==3?'few':n==6?'many':'other';},da:function(n,ord){var s=String(n).split('.'),i=s[0],t0=Number(s[0])==n;if(ord)return'other';return n==1||!t0&&(i==0||i==1)?'one':'other';},de:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},dsb:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i100=i.slice(-2),f100=f.slice(-2);if(ord)return'other';return v0&&i100==1||f100==1?'one':v0&&i100==2||f100==2?'two':v0&&(i100==3||i100==4)||f100==3||f100==4?'few':'other';},dv:function(n,ord){if(ord)return'other';return n==1?'one':'other';},dz:function(n,ord){if(ord)return'other';return'other';},ee:function(n,ord){if(ord)return'other';return n==1?'one':'other';},el:function(n,ord){if(ord)return'other';return n==1?'one':'other';},en:function(n,ord){var s=String(n).split('.'),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?'one':n10==2&&n100!=12?'two':n10==3&&n100!=13?'few':'other';return n==1&&v0?'one':'other';},eo:function(n,ord){if(ord)return'other';return n==1?'one':'other';},es:function(n,ord){if(ord)return'other';return n==1?'one':'other';},et:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},eu:function(n,ord){if(ord)return'other';return n==1?'one':'other';},fa:function(n,ord){if(ord)return'other';return n>=0&&n<=1?'one':'other';},ff:function(n,ord){if(ord)return'other';return n>=0&&n<2?'one':'other';},fi:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},fil:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i10=i.slice(-1),f10=f.slice(-1);if(ord)return n==1?'one':'other';return v0&&(i==1||i==2||i==3)||v0&&i10!=4&&i10!=6&&i10!=9||!v0&&f10!=4&&f10!=6&&f10!=9?'one':'other';},fo:function(n,ord){if(ord)return'other';return n==1?'one':'other';},fr:function(n,ord){if(ord)return n==1?'one':'other';return n>=0&&n<2?'one':'other';},fur:function(n,ord){if(ord)return'other';return n==1?'one':'other';},fy:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},ga:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n;if(ord)return n==1?'one':'other';return n==1?'one':n==2?'two':t0&&n>=3&&n<=6?'few':t0&&n>=7&&n<=10?'many':'other';},gd:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n;if(ord)return n==1||n==11?'one':n==2||n==12?'two':n==3||n==13?'few':'other';return n==1||n==11?'one':n==2||n==12?'two':t0&&n>=3&&n<=10||t0&&n>=13&&n<=19?'few':'other';},gl:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},gsw:function(n,ord){if(ord)return'other';return n==1?'one':'other';},gu:function(n,ord){if(ord)return n==1?'one':n==2||n==3?'two':n==4?'few':n==6?'many':'other';return n>=0&&n<=1?'one':'other';},guw:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},gv:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1],i10=i.slice(-1),i100=i.slice(-2);if(ord)return'other';return v0&&i10==1?'one':v0&&i10==2?'two':v0&&(i100==0||i100==20||i100==40||i100==60||i100==80)?'few':!v0?'many':'other';},ha:function(n,ord){if(ord)return'other';return n==1?'one':'other';},haw:function(n,ord){if(ord)return'other';return n==1?'one':'other';},he:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return'other';return n==1&&v0?'one':i==2&&v0?'two':v0&&(n<0||n>10)&&t0&&n10==0?'many':'other';},hi:function(n,ord){if(ord)return n==1?'one':n==2||n==3?'two':n==4?'few':n==6?'many':'other';return n>=0&&n<=1?'one':'other';},hr:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return'other';return v0&&i10==1&&i100!=11||f10==1&&f100!=11?'one':v0&&i10>=2&&i10<=4&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?'few':'other';},hsb:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i100=i.slice(-2),f100=f.slice(-2);if(ord)return'other';return v0&&i100==1||f100==1?'one':v0&&i100==2||f100==2?'two':v0&&(i100==3||i100==4)||f100==3||f100==4?'few':'other';},hu:function(n,ord){if(ord)return n==1||n==5?'one':'other';return n==1?'one':'other';},hy:function(n,ord){if(ord)return n==1?'one':'other';return n>=0&&n<2?'one':'other';},ia:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},id:function(n,ord){if(ord)return'other';return'other';},ig:function(n,ord){if(ord)return'other';return'other';},ii:function(n,ord){if(ord)return'other';return'other';},"in":function(n,ord){if(ord)return'other';return'other';},io:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},is:function(n,ord){var s=String(n).split('.'),i=s[0],t0=Number(s[0])==n,i10=i.slice(-1),i100=i.slice(-2);if(ord)return'other';return t0&&i10==1&&i100!=11||!t0?'one':'other';},it:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return n==11||n==8||n==80||n==800?'many':'other';return n==1&&v0?'one':'other';},iu:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},iw:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return'other';return n==1&&v0?'one':i==2&&v0?'two':v0&&(n<0||n>10)&&t0&&n10==0?'many':'other';},ja:function(n,ord){if(ord)return'other';return'other';},jbo:function(n,ord){if(ord)return'other';return'other';},jgo:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ji:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},jmc:function(n,ord){if(ord)return'other';return n==1?'one':'other';},jv:function(n,ord){if(ord)return'other';return'other';},jw:function(n,ord){if(ord)return'other';return'other';},ka:function(n,ord){var s=String(n).split('.'),i=s[0],i100=i.slice(-2);if(ord)return i==1?'one':i==0||i100>=2&&i100<=20||i100==40||i100==60||i100==80?'many':'other';return n==1?'one':'other';},kab:function(n,ord){if(ord)return'other';return n>=0&&n<2?'one':'other';},kaj:function(n,ord){if(ord)return'other';return n==1?'one':'other';},kcg:function(n,ord){if(ord)return'other';return n==1?'one':'other';},kde:function(n,ord){if(ord)return'other';return'other';},kea:function(n,ord){if(ord)return'other';return'other';},kk:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return n10==6||n10==9||t0&&n10==0&&n!=0?'many':'other';return n==1?'one':'other';},kkj:function(n,ord){if(ord)return'other';return n==1?'one':'other';},kl:function(n,ord){if(ord)return'other';return n==1?'one':'other';},km:function(n,ord){if(ord)return'other';return'other';},kn:function(n,ord){if(ord)return'other';return n>=0&&n<=1?'one':'other';},ko:function(n,ord){if(ord)return'other';return'other';},ks:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ksb:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ksh:function(n,ord){if(ord)return'other';return n==0?'zero':n==1?'one':'other';},ku:function(n,ord){if(ord)return'other';return n==1?'one':'other';},kw:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},ky:function(n,ord){if(ord)return'other';return n==1?'one':'other';},lag:function(n,ord){var s=String(n).split('.'),i=s[0];if(ord)return'other';return n==0?'zero':(i==0||i==1)&&n!=0?'one':'other';},lb:function(n,ord){if(ord)return'other';return n==1?'one':'other';},lg:function(n,ord){if(ord)return'other';return n==1?'one':'other';},lkt:function(n,ord){if(ord)return'other';return'other';},ln:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},lo:function(n,ord){if(ord)return n==1?'one':'other';return'other';},lt:function(n,ord){var s=String(n).split('.'),f=s[1]||'',t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return'other';return n10==1&&(n100<11||n100>19)?'one':n10>=2&&n10<=9&&(n100<11||n100>19)?'few':f!=0?'many':'other';},lv:function(n,ord){var s=String(n).split('.'),f=s[1]||'',v=f.length,t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),f100=f.slice(-2),f10=f.slice(-1);if(ord)return'other';return t0&&n10==0||n100>=11&&n100<=19||v==2&&f100>=11&&f100<=19?'zero':n10==1&&n100!=11||v==2&&f10==1&&f100!=11||v!=2&&f10==1?'one':'other';},mas:function(n,ord){if(ord)return'other';return n==1?'one':'other';},mg:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},mgo:function(n,ord){if(ord)return'other';return n==1?'one':'other';},mk:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return i10==1&&i100!=11?'one':i10==2&&i100!=12?'two':(i10==7||i10==8)&&i100!=17&&i100!=18?'many':'other';return v0&&i10==1&&i100!=11||f10==1&&f100!=11?'one':'other';},ml:function(n,ord){if(ord)return'other';return n==1?'one':'other';},mn:function(n,ord){if(ord)return'other';return n==1?'one':'other';},mo:function(n,ord){var s=String(n).split('.'),v0=!s[1],t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return n==1?'one':'other';return n==1&&v0?'one':!v0||n==0||n!=1&&n100>=1&&n100<=19?'few':'other';},mr:function(n,ord){if(ord)return n==1?'one':n==2||n==3?'two':n==4?'few':'other';return n>=0&&n<=1?'one':'other';},ms:function(n,ord){if(ord)return n==1?'one':'other';return'other';},mt:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return'other';return n==1?'one':n==0||n100>=2&&n100<=10?'few':n100>=11&&n100<=19?'many':'other';},my:function(n,ord){if(ord)return'other';return'other';},nah:function(n,ord){if(ord)return'other';return n==1?'one':'other';},naq:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},nb:function(n,ord){if(ord)return'other';return n==1?'one':'other';},nd:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ne:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n;if(ord)return t0&&n>=1&&n<=4?'one':'other';return n==1?'one':'other';},nl:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},nn:function(n,ord){if(ord)return'other';return n==1?'one':'other';},nnh:function(n,ord){if(ord)return'other';return n==1?'one':'other';},no:function(n,ord){if(ord)return'other';return n==1?'one':'other';},nqo:function(n,ord){if(ord)return'other';return'other';},nr:function(n,ord){if(ord)return'other';return n==1?'one':'other';},nso:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},ny:function(n,ord){if(ord)return'other';return n==1?'one':'other';},nyn:function(n,ord){if(ord)return'other';return n==1?'one':'other';},om:function(n,ord){if(ord)return'other';return n==1?'one':'other';},or:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n;if(ord)return n==1||n==5||t0&&n>=7&&n<=9?'one':n==2||n==3?'two':n==4?'few':n==6?'many':'other';return n==1?'one':'other';},os:function(n,ord){if(ord)return'other';return n==1?'one':'other';},pa:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},pap:function(n,ord){if(ord)return'other';return n==1?'one':'other';},pl:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1],i10=i.slice(-1),i100=i.slice(-2);if(ord)return'other';return n==1&&v0?'one':v0&&i10>=2&&i10<=4&&(i100<12||i100>14)?'few':v0&&i!=1&&(i10==0||i10==1)||v0&&i10>=5&&i10<=9||v0&&i100>=12&&i100<=14?'many':'other';},prg:function(n,ord){var s=String(n).split('.'),f=s[1]||'',v=f.length,t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),f100=f.slice(-2),f10=f.slice(-1);if(ord)return'other';return t0&&n10==0||n100>=11&&n100<=19||v==2&&f100>=11&&f100<=19?'zero':n10==1&&n100!=11||v==2&&f10==1&&f100!=11||v!=2&&f10==1?'one':'other';},ps:function(n,ord){if(ord)return'other';return n==1?'one':'other';},pt:function(n,ord){var s=String(n).split('.'),i=s[0];if(ord)return'other';return i==0||i==1?'one':'other';},"pt-PT":function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},rm:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ro:function(n,ord){var s=String(n).split('.'),v0=!s[1],t0=Number(s[0])==n,n100=t0&&s[0].slice(-2);if(ord)return n==1?'one':'other';return n==1&&v0?'one':!v0||n==0||n!=1&&n100>=1&&n100<=19?'few':'other';},rof:function(n,ord){if(ord)return'other';return n==1?'one':'other';},root:function(n,ord){if(ord)return'other';return'other';},ru:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1],i10=i.slice(-1),i100=i.slice(-2);if(ord)return'other';return v0&&i10==1&&i100!=11?'one':v0&&i10>=2&&i10<=4&&(i100<12||i100>14)?'few':v0&&i10==0||v0&&i10>=5&&i10<=9||v0&&i100>=11&&i100<=14?'many':'other';},rwk:function(n,ord){if(ord)return'other';return n==1?'one':'other';},sah:function(n,ord){if(ord)return'other';return'other';},saq:function(n,ord){if(ord)return'other';return n==1?'one':'other';},sc:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return n==11||n==8||n==80||n==800?'many':'other';return n==1&&v0?'one':'other';},scn:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return n==11||n==8||n==80||n==800?'many':'other';return n==1&&v0?'one':'other';},sd:function(n,ord){if(ord)return'other';return n==1?'one':'other';},sdh:function(n,ord){if(ord)return'other';return n==1?'one':'other';},se:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},seh:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ses:function(n,ord){if(ord)return'other';return'other';},sg:function(n,ord){if(ord)return'other';return'other';},sh:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return'other';return v0&&i10==1&&i100!=11||f10==1&&f100!=11?'one':v0&&i10>=2&&i10<=4&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?'few':'other';},shi:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n;if(ord)return'other';return n>=0&&n<=1?'one':t0&&n>=2&&n<=10?'few':'other';},si:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'';if(ord)return'other';return n==0||n==1||i==0&&f==1?'one':'other';},sk:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1];if(ord)return'other';return n==1&&v0?'one':i>=2&&i<=4&&v0?'few':!v0?'many':'other';},sl:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1],i100=i.slice(-2);if(ord)return'other';return v0&&i100==1?'one':v0&&i100==2?'two':v0&&(i100==3||i100==4)||!v0?'few':'other';},sma:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},smi:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},smj:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},smn:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},sms:function(n,ord){if(ord)return'other';return n==1?'one':n==2?'two':'other';},sn:function(n,ord){if(ord)return'other';return n==1?'one':'other';},so:function(n,ord){if(ord)return'other';return n==1?'one':'other';},sq:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n==1?'one':n10==4&&n100!=14?'many':'other';return n==1?'one':'other';},sr:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return'other';return v0&&i10==1&&i100!=11||f10==1&&f100!=11?'one':v0&&i10>=2&&i10<=4&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?'few':'other';},ss:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ssy:function(n,ord){if(ord)return'other';return n==1?'one':'other';},st:function(n,ord){if(ord)return'other';return n==1?'one':'other';},sv:function(n,ord){var s=String(n).split('.'),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return(n10==1||n10==2)&&n100!=11&&n100!=12?'one':'other';return n==1&&v0?'one':'other';},sw:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},syr:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ta:function(n,ord){if(ord)return'other';return n==1?'one':'other';},te:function(n,ord){if(ord)return'other';return n==1?'one':'other';},teo:function(n,ord){if(ord)return'other';return n==1?'one':'other';},th:function(n,ord){if(ord)return'other';return'other';},ti:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},tig:function(n,ord){if(ord)return'other';return n==1?'one':'other';},tk:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n,n10=t0&&s[0].slice(-1);if(ord)return n10==6||n10==9||n==10?'few':'other';return n==1?'one':'other';},tl:function(n,ord){var s=String(n).split('.'),i=s[0],f=s[1]||'',v0=!s[1],i10=i.slice(-1),f10=f.slice(-1);if(ord)return n==1?'one':'other';return v0&&(i==1||i==2||i==3)||v0&&i10!=4&&i10!=6&&i10!=9||!v0&&f10!=4&&f10!=6&&f10!=9?'one':'other';},tn:function(n,ord){if(ord)return'other';return n==1?'one':'other';},to:function(n,ord){if(ord)return'other';return'other';},tr:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ts:function(n,ord){if(ord)return'other';return n==1?'one':'other';},tzm:function(n,ord){var s=String(n).split('.'),t0=Number(s[0])==n;if(ord)return'other';return n==0||n==1||t0&&n>=11&&n<=99?'one':'other';},ug:function(n,ord){if(ord)return'other';return n==1?'one':'other';},uk:function(n,ord){var s=String(n).split('.'),i=s[0],v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2),i10=i.slice(-1),i100=i.slice(-2);if(ord)return n10==3&&n100!=13?'few':'other';return v0&&i10==1&&i100!=11?'one':v0&&i10>=2&&i10<=4&&(i100<12||i100>14)?'few':v0&&i10==0||v0&&i10>=5&&i10<=9||v0&&i100>=11&&i100<=14?'many':'other';},ur:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},uz:function(n,ord){if(ord)return'other';return n==1?'one':'other';},ve:function(n,ord){if(ord)return'other';return n==1?'one':'other';},vi:function(n,ord){if(ord)return n==1?'one':'other';return'other';},vo:function(n,ord){if(ord)return'other';return n==1?'one':'other';},vun:function(n,ord){if(ord)return'other';return n==1?'one':'other';},wa:function(n,ord){if(ord)return'other';return n==0||n==1?'one':'other';},wae:function(n,ord){if(ord)return'other';return n==1?'one':'other';},wo:function(n,ord){if(ord)return'other';return'other';},xh:function(n,ord){if(ord)return'other';return n==1?'one':'other';},xog:function(n,ord){if(ord)return'other';return n==1?'one':'other';},yi:function(n,ord){var s=String(n).split('.'),v0=!s[1];if(ord)return'other';return n==1&&v0?'one':'other';},yo:function(n,ord){if(ord)return'other';return'other';},yue:function(n,ord){if(ord)return'other';return'other';},zh:function(n,ord){if(ord)return'other';return'other';},zu:function(n,ord){if(ord)return'other';return n>=0&&n<=1?'one':'other';}};var plurals$1={default:plurals};const bundledImportMeta$4={...import.meta,url:new URL('../../node_modules/i18n-format/i18n-format.js',import.meta.url).href};Polymer$1({importMeta:bundledImportMeta$4,_template:html` `,is:'i18n-format',/**
   * Fired whenever the formatted text is rendered.
   *
   * @event rendered
   */properties:{/**
     * The locale for the template text.
     * The typical value is bound to `{{effectiveLang}}` when the containing element has
     * `BehaviorsStore.I18nBehavior`.
     */_lang:{type:String,value:'en',reflectToAttribute:false,observer:'_langChanged'},/**
     * The parameter attribute name to identify parameters.
     * No need to change in a normal usage.
     */paramAttribute:{type:String,value:'slot'},/**
     * The parameter format in the template text.
     * The `'n'` in the format means n-th parameter.
     * No need to change in a normal usage.
     */paramFormat:{type:String,value:'{n}',observer:'_paramFormatChanged'},/**
     * When the boolean attribute `observe-params` is specified, 
     * the template is re-rendered on every parameter mutation.
     * If not specified, the template is re-rendered only on `lang` changes and template text changes.
     *
     * Note: If true, re-rendering may be performed muiltiple times redundantly on a locale change.
     */observeParams:{type:Boolean,value:true// TODO: optimize re-rendering
}},/**
   * Default locale constant 'en'
   */DEFAULT_LANG:'en',ready:function(){this._setupParams();/*
                         if (this.root === this) {
                           this.attachShadow({ mode: 'open' });
                           this.root = this.shadowRoot;
                           this.render();
                         }
                         */if(!this.lang){// Polyfill non-functional default value for lang property in Safari 7
this.lang=this.DEFAULT_LANG;}},attached:function(){this.render();},/**
   * Traverse the local DOM and set up parameters and observers.
   */_setupParams:function(){var n;this.elements=Array.prototype.filter.call(dom(this).childNodes,function(node){return node.nodeType===node.ELEMENT_NODE;});var needParamObservation=this.observeParams&&this.elements.length>0&&this.elements[0].tagName.toLowerCase()==='json-data';this.observer=new MutationObserver(this._templateMutated.bind(this));this.observer.observe(this,{attributes:true,attributeFilter:['lang']});for(n=0;n<this.elements.length;n++){if(n===0){this.templateElement=this.elements[n];let i=0;do{this.templateTextNode=dom(this.templateElement).childNodes[i++];if(!this.templateTextNode){this.templateTextNode=dom(this.templateElement).childNodes[0];break;}}while(this.templateTextNode.nodeType!==this.templateTextNode.TEXT_NODE);this.observer.observe(this.templateTextNode,{characterData:true});}else{if(!this.elements[n].hasAttribute(this.paramAttribute)){this.elements[n].setAttribute(this.paramAttribute,''+n);}if(needParamObservation){// TODO: childNodes[0] may not be a text node
this.observer.observe(dom(this.elements[n]).childNodes[0],{characterData:true});if(this.elements[n].tagName.toLowerCase()==='i18n-number'){this.listen(this.elements[n],'rendered','render');}}}}//console.log('i18n-format: _setupParams: elements = ' + this.elements);
},/**
   * MutationObserver callback of child text nodes to re-render on template text or parameter mutations.
   *
   * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
   */_templateMutated:function(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'characterData'://console.log('i18n-format: ' + this.id + '._templateMutated(): characterData: tag = ' + 
//            Polymer.dom(mutation.target).parentNode.tagName.toLowerCase() + 
//            ' data = ' + mutation.target.data);
if(mutation.target.parentNode.tagName.toLowerCase()!=='i18n-number'||typeof mutation.target.parentNode.formatted!=='undefined'){this.render();}break;case'attributes':if(mutation.attributeName==='lang'){this._lang=this.lang;}break;default:/* istanbul ignore next: mutation.type is always characterData or attributes */break;}},this);},/**
   * Observer of `lang` property to re-render the template text.
   *
   * @param {string} lang New locale.
   */_langChanged:function(lang/*, oldLang */){//console.log('i18n-format: ' + this.id + '._langChanged() lang = ' + lang + ' oldLang = ' + oldLang);
if(this.elements&&lang!==undefined&&lang!==null&&!lang.match(/^{{.*}}$/)&&!lang.match(/^\[\[.*\]\]$/)){this.render();}//else {
//  console.log('i18n-format: skipping render()');
//}
},/**
   * Observer of `paramFormat` property to re-render the template text.
   *
   * @param {string} paramFormat New paramFormat.
   * @param {string} oldParamFormat Old paramFormat.
   */_paramFormatChanged:function(paramFormat,oldParamFormat){//console.log('i18n-format: ' + this.id + '._paramFormatChanged() new = ' + paramFormat + ' old = ' + oldParamFormat);
if(this.elements&&oldParamFormat!==undefined&&paramFormat&&this.lang!==undefined&&this.lang!==null&&!this.lang.match(/^{{.*}}$/)&&!this.lang.match(/^\[\[.*\]\]$/)){this.lastTemplateText=undefined;this.render();}},/**
   * Observer of `paramAttribute` property to reset parameter attributes.
   *
   * @param {string} paramAttribute New paramAttribute.
   * @param {string} oldParamAttribute Old paramAttribute.
   */ /* only for Polymer 1.x with ShadowDOM v0
      _paramAttributeChanged: function (paramAttribute, oldParamAttribute) {
        //console.log('i18n-format: ' + this.id + '._paramAttributeChanged() new = ' + paramAttribute + ' old = ' + oldParamAttribute);
        var n;
        if (this.elements &&
            oldParamAttribute !== undefined &&
            paramAttribute &&
            this.lang !== undefined &&
            this.lang !== null &&
            !this.lang.match(/^{{.*}}$/) &&
            !this.lang.match(/^\[\[.*\]\]$/)) {
          for (n = 1; n < this.elements.length; n++) {
            this.elements[n].removeAttribute(oldParamAttribute);
            if (!this.elements[n].hasAttribute(paramAttribute)) {
              this.elements[n].setAttribute(paramAttribute, '' + n);
            }
          }
          this.lastTemplateText = undefined;
          this.render();
        }
      },
      */ /**
          * Detect the CLDR plural category of a number 
          * with [`make-plural` library](https://github.com/eemeli/make-plural.js).
          *
          * @param {number} n The number to get the plural category for.
          * @return {string} Plural category of the number. 
          */_getPluralCategory:function(n){var category='other';var lang=this.lang||this.DEFAULT_LANG;lang=lang.split(/[-_]/)[0];if(plurals[lang]){category=plurals[lang](n);}else{category=plurals.en(n);}//console.log('i18n-format: _getPluralCategory(' + n + ') = ' + category);
return category;},/**
   * Select a template text by parameters.
   *
   * @return {string} Selected template text. 
   */_selectTemplateText:function(){var templateText='';if(!this.templateElement){return templateText;}else if(this.templateElement.tagName.toLowerCase()==='json-data'){var templateObject;try{templateObject=JSON.parse(this.templateTextNode.data);}catch(ex){if(this.templateTextNode.data){console.warn('i18n-format: parse error in json-data');}return templateText;}var n;for(n=1;typeof templateObject==='object'&&n<this.elements.length;n++){var param=this.elements[n];if(param.tagName.toLowerCase()==='i18n-number'){// plural selector
var category=this._getPluralCategory(param.number);if(typeof param.number==='undefined'||typeof param.formatted==='undefined'){// i18n-number is not ready
//console.log('i18n-format: i18n-number is not ready');
templateObject=undefined;}else if(templateObject[param.rawNumber]){templateObject=templateObject[param.rawNumber];}else if(templateObject[category]){// plural category matched
templateObject=templateObject[category];}else if(templateObject.other){// other
templateObject=templateObject.other;}else{// default
templateObject='';console.warn('i18n-format: cannot find a template');}}else{// string selector
if(templateObject[param.textContent]){// template found
templateObject=templateObject[param.textContent];}else if(templateObject.other){// other
templateObject=templateObject.other;}else{// default
templateObject='';console.warn('i18n-format: cannot find a template');}}}if(typeof templateObject==='string'){templateText=templateObject;}else if(typeof templateObject==='undefined'){templateText=undefined;}else{templateText='';console.warn('i18n-format: cannot find a template');}}else{templateText=this.templateTextNode.data;}return templateText;},/**
   * Render the template text.
   */render:function(){var templateText=this._selectTemplateText();var tmpNode=document.createElement('span');var paramPlaceholder;var childNodes=[];var i;var shadyDomV1=!!window.ShadyDOM;if(templateText===this.lastTemplateText){//console.log('i18n-format: skipping rendering as the templateText has not changed');
return;}else if(typeof templateText==='undefined'){return;}else{this.lastTemplateText=templateText;//console.log('i18n-format: ' + this.id + '.render() templateText = ' + templateText);
}templateText=templateText.replace(/</g,'&lt;');i=1;while(this.elements&&i<this.elements.length){paramPlaceholder=this.paramFormat.replace('n',i);templateText=templateText.replace(paramPlaceholder,'<slot name="'+i+'"></slot>');i++;}tmpNode.innerHTML=templateText;/*
                                      if (this.root === this) {
                                        this.attachShadow({ mode: 'open' });
                                        this.root = this.shadowRoot;
                                      }
                                      */this.root.innerHTML='';// References of childNodes have to be copied for Shady DOM compatibility
for(i=0;i<tmpNode.childNodes.length;i++){childNodes[i]=tmpNode.childNodes[i];}for(i=0;i<childNodes.length;i++){// each node has to be appended via Polymer.dom()
dom(this.root).appendChild(childNodes[i]);}if(shadyDomV1){ShadyDOM.flush();}this.fire('rendered');}});/*
    
    Simple Template Format:
    
      Raw HTML:
        <p id="simpleChartDesc">A simple <code>google-chart</code> with <a href="link">google-advanced-chart</a> looks like <a href="link2">this</a>:</p>
    
      Light DOM when rendered:
        <p id="simpleChartDesc">
          <i18n-format>
            <span>A simple {1} with {2} looks like {3}:</span>
            <code param="1">google-chart</code>
            <a param="2" href="link">google-advanced-chart</a>
            <a param="3" href="link2">this</a>
          </i18n-format>
        </p>
    
      Externalized HTML by i18n-behavior: 
        <p id="simpleChartDesc">
          <i18n-format>
            <span>{{text.simpleChartDesc.0}}</span>
            <code param="1">{{text.simpleChartDesc.1}}</code>
            <a param="2" href="link">{{text.simpleChartDesc.2}}</a>
            <a param="3" href="link2">{{text.simpleChartDesc.3}}</a>
          </i18n-format>
        </p>
    
      Shadow DOM when rendered:
        <p id="simpleChartDesc">
          #shadow
            A simple <code>google-chart</code> with <a href="link">google-advanced-chart</a> looks like <a href="link2">this</a>:
          <i18n-format>
            <span>{{text.simpleChartDesc.0}}</span>
            <code param="1">{{text.simpleChartDesc.1}}</code>
            <a param="2" href="link">{{text.simpleChartDesc.2}}</a>
            <a param="3" href="link2">{{text.simpleChartDesc.3}}</a>
          </i18n-format>
        </p>
    
      Externalized JSON
        In en:
          {
            "simpleChartDesc": [
              "A simple {1} with {2} looks like {3}:",
              "google-chart",
              "google-advanced-chart",
              "this"
            ]
          }
    
        In ja: (different parameter order)
          {
            "simpleChartDesc": [
              "{2} とともにシンプルな {1} を用いると、{3}ようになります:",
              "google-chart",
              "google-advanced-chart",
              "この"
            ]
          }
    
    Compound Template Format:
    
      Raw HTML Template:
        <i18n-format lang="{{effectiveLang}}" observe-params text-id="sentence-with-plurals1">
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
          <i18n-number lang="{{effectiveLang}}" offset="1" options="{}">{{text.recipients.length}}</i18n-number>
          <span>{{text.recipients.0.gender}}</span>
          <span>{{text.sender.name}}</span>
          <span>{{text.recipients.0.name}}</span>
          <span>a gift</span>
        </i18n-format>
    
      Externalized HTML Template:
    
        <i18n-format lang="{{effectiveLang}}" text-id="sentence-with-plurals">
          <json-data>{{serialize(text.sentence-with-plurals.0)}}</json-data>
          <i18n-number lang="{{effectiveLang}}" offset="1" options="{}">{{text.recipients.length}}</i18n-number>
          <span>{{text.recipients.0.gender}}</span>
          <span>{{text.sender.name}}</span>
          <span>{{text.recipients.0.name}}</span>
          <span>{{text.sentence-with-plurals.5}}</span>
        </i18n-format>
    
      Externalized JSON:
        <template>
          <json-data text-id="sentence-with-plurals">[
            {
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
            },
            "{{text.recipients.length - 1}}",
            "{{text.recipients.0.gender}}",
            "{{text.sender.name}}",
            "{{text.recipients.0.name}}",
            "a gift"
          ]</json-data>
        </template>
    
    */Polymer$1({is:'iron-localstorage',properties:{/**
     * localStorage item key
     */name:{type:String,value:''},/**
     * The data associated with this storage.
     * If set to null item will be deleted.
     * @type {*}
     */value:{type:Object,notify:true},/**
     * If true: do not convert value to JSON on save/load
     */useRaw:{type:Boolean,value:false},/**
     * Value will not be saved automatically if true. You'll have to do it
     * manually with `save()`
     */autoSaveDisabled:{type:Boolean,value:false},/**
     * Last error encountered while saving/loading items
     */errorMessage:{type:String,notify:true},/** True if value has been loaded */_loaded:{type:Boolean,value:false}},observers:['_debounceReload(name,useRaw)','_trySaveValue(autoSaveDisabled)','_trySaveValue(value.*)'],ready:function(){this._boundHandleStorage=this._handleStorage.bind(this);},attached:function(){window.addEventListener('storage',this._boundHandleStorage);},detached:function(){window.removeEventListener('storage',this._boundHandleStorage);},_handleStorage:function(ev){if(ev.key==this.name){this._load(true);}},_trySaveValue:function(){if(this.autoSaveDisabled===undefined||this._doNotSave){return;}if(this._loaded&&!this.autoSaveDisabled){this.debounce('save',this.save);}},_debounceReload:function(){if(this.name!==undefined&&this.useRaw!==undefined){this.debounce('reload',this.reload);}},/**
   * Loads the value again. Use if you modify
   * localStorage using DOM calls, and want to
   * keep this element in sync.
   */reload:function(){this._loaded=false;this._load();},/**
   * loads value from local storage
   * @param {boolean=} externalChange true if loading changes from a different window
   */_load:function(externalChange){try{var v=window.localStorage.getItem(this.name);}catch(ex){this.errorMessage=ex.message;this._error('Could not save to localStorage.  Try enabling cookies for this page.',ex);}if(v===null){this._loaded=true;this._doNotSave=true;// guard for save watchers
this.value=null;this._doNotSave=false;this.fire('iron-localstorage-load-empty',{externalChange:externalChange},{composed:true});}else{if(!this.useRaw){try{// parse value as JSON
v=JSON.parse(v);}catch(x){this.errorMessage='Could not parse local storage value';Base._error('could not parse local storage value',v);v=null;}}this._loaded=true;this._doNotSave=true;this.value=v;this._doNotSave=false;this.fire('iron-localstorage-load',{externalChange:externalChange},{composed:true});}},/**
   * Saves the value to localStorage. Call to save if autoSaveDisabled is set.
   * If `value` is null or undefined, deletes localStorage.
   */save:function(){var v=this.useRaw?this.value:JSON.stringify(this.value);try{if(this.value===null||this.value===undefined){window.localStorage.removeItem(this.name);}else{window.localStorage.setItem(this.name,/** @type {string} */v);}}catch(ex){// Happens in Safari incognito mode,
this.errorMessage=ex.message;Base._error('Could not save to localStorage. Incognito mode may be blocking this action',ex);}}/**
     * Fired when value loads from localStorage.
     *
     * @event iron-localstorage-load
     * @param {{externalChange:boolean}} detail -
     *     externalChange: true if change occured in different window.
     */ /**
         * Fired when loaded value does not exist.
         * Event handler can be used to initialize default value.
         *
         * @event iron-localstorage-load-empty
         * @param {{externalChange:boolean}} detail -
         *     externalChange: true if change occured in different window.
         */});const bundledImportMeta$5={...import.meta,url:new URL('../../i18n-preference.js',import.meta.url).href};const $_documentContainer$1=document.createElement('template');$_documentContainer$1.innerHTML=`<template id="i18n-preference">
  <iron-localstorage id="storage" name="i18n-behavior-preference" on-iron-localstorage-load-empty="_onLoadEmptyStorage" on-iron-localstorage-load="_onLoadStorage" on-value-changed="_onStorageValueChange">
  </iron-localstorage>
</template><div id="dom-module-placeholder"></div>`;// html element of this document
var html$1=document.querySelector('html');// app global default language
var defaultLang=html$1.hasAttribute('lang')?html$1.getAttribute('lang'):'';// imperative synchronous registration of the template for Polymer 2.x
var template$1=$_documentContainer$1.content.querySelector('template#i18n-preference');var domModule$2=document.createElement('dom-module');domModule$2.appendChild(template$1);domModule$2.register('i18n-preference');Polymer$1({importMeta:bundledImportMeta$5,is:'i18n-preference',properties:{/**
     * Persistence of preference 
     */persist:{type:Boolean,value:false,reflectToAttribute:true,notify:true,observer:'_onPersistChange'}},/**
   * Ready callback to initialize this.lang
   */ready:function(){if(this.persist){// delay this.lang update
}else{//this.$.storage.value = undefined;
}this.isReady=true;},/**
   * Attached callback to initialize html.lang and its observation
   */attached:function(){this._observe();if(this.persist){// delay html.lang update
}else{if(!html$1.hasAttribute('preferred')){html$1.setAttribute('lang',navigator.language||navigator.browserLanguage);}}},/**
   * Detached callback to diconnect html.lang observation
   */detached:function(){this._disconnect();},/**
   * Initialize an empty localstorage
   */_onLoadEmptyStorage:function(){if(this.isReady){if(this.persist){if(this.isInitialized){// store html.lang value
this.$.storage.value=html$1.getAttribute('lang');}else{if(html$1.hasAttribute('preferred')){this.$.storage.value=html$1.getAttribute('lang');}else{this.$.storage.value=navigator.language||navigator.browserLanguage;if(html$1.getAttribute('lang')!==this.$.storage.value){html$1.setAttribute('lang',this.$.storage.value);}}this.isInitialized=true;}}else{// leave the empty storage as it is
}}},/**
   * Handle the loaded storage value
   */_onLoadStorage:function(){if(this.isReady){if(this.persist){// preferred attribute in html to put higher priority
// in the default html language than navigator.language
if(html$1.hasAttribute('preferred')){if(this.$.storage.value!==defaultLang){// overwrite the storage by the app default language
this.$.storage.value=defaultLang;}}else{// load the value from the storage
html$1.setAttribute('lang',this.$.storage.value);}}else{// empty the storage
this.$.storage.value=undefined;}}},/**
   * Handle persist changes
   *
   * @param {Boolean} value new this.persist value
   */_onPersistChange:function(value){if(this.isReady){if(value){if(this.$.storage.value!==html$1.getAttribute('lang')){// save to the storage
this.$.storage.value=html$1.getAttribute('lang');}}else{// empty the storage
this.$.storage.value=undefined;}}},/**
   * Handle storage value changes
   *
   * @param {Event} e value-changed event on the storage
   */_onStorageValueChange:function(e){var value=e.detail.value;if(this.isReady){if(this.persist){if(value){if(value!==html$1.getAttribute('lang')){// save to the lang
html$1.setAttribute('lang',value);}}else{// update the storage
this.$.storage.value=html$1.getAttribute('lang');}}else{if(value){// empty the storage
this.$.storage.value=undefined;}}}},/**
   * Handle value changes on localstorage
   *
   * @param {MutationRecord[]} mutations Array of MutationRecords for html.lang
   *
   * Note: 
   *   - Bound to this element
   */_htmlLangMutationObserverCallback:function(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'attributes':if(mutation.attributeName==='lang'){if(this.$.storage.value!==mutation.target.getAttribute('lang')){this.$.storage.value=mutation.target.getAttribute('lang');}}break;default:break;}}.bind(this));},/**
   * Set up html.lang mutation observer
   */_observe:function(){// observe html lang mutations
if(!this._htmlLangMutationObserver){this._htmlLangMutationObserverCallbackBindThis=this._htmlLangMutationObserverCallback.bind(this);this._htmlLangMutationObserver=new MutationObserver(this._htmlLangMutationObserverCallbackBindThis);}this._htmlLangMutationObserver.observe(html$1,{attributes:true});},/**
   * Disconnect html.lang mutation observer
   */_disconnect:function(){if(this._htmlLangMutationObserver){this._htmlLangMutationObserver.disconnect();}}});/*!
     * @license deepcopy.js Copyright(c) 2013 sasa+1
     * https://github.com/sasaplus1/deepcopy.js
     * Released under the MIT license.
     */var deepcopy=function(){return(/******/function(modules){// webpackBootstrap
/******/ // The module cache
/******/var installedModules={};/******/ // The require function
/******/function __webpack_require__(moduleId){/******/ // Check if module is in cache
/******/if(installedModules[moduleId])/******/return installedModules[moduleId].exports;/******/ // Create a new module (and put it into the cache)
/******/var module=installedModules[moduleId]={/******/exports:{},/******/id:moduleId,/******/loaded:false/******/};/******/ // Execute the module function
/******/modules[moduleId].call(module.exports,module,module.exports,__webpack_require__);/******/ // Flag the module as loaded
/******/module.loaded=true;/******/ // Return the exports of the module
/******/return module.exports;/******/}/******/ // expose the modules object (__webpack_modules__)
/******/__webpack_require__.m=modules;/******/ // expose the module cache
/******/__webpack_require__.c=installedModules;/******/ // __webpack_public_path__
/******/__webpack_require__.p="";/******/ // Load entry module and return exports
/******/return __webpack_require__(0);/******/}(/************************************************************************/ /******/[/* 0 */ /***/function(module,exports,__webpack_require__){'use strict';module.exports=__webpack_require__(3);/***/},/* 1 */ /***/function(module,exports){'use strict';exports.__esModule=true;var toString=Object.prototype.toString;var isBuffer=typeof Buffer!=='undefined'?function isBuffer(obj){return Buffer.isBuffer(obj);}:function isBuffer(){// always return false in browsers
return false;};var getKeys=typeof Object.keys==='function'?function getKeys(obj){return Object.keys(obj);}:function getKeys(obj){var objType=typeof obj;if(obj===null||objType!=='function'&&objType!=='object'){throw new TypeError('obj must be an Object');}var resultKeys=[],key=void 0;for(key in obj){Object.prototype.hasOwnProperty.call(obj,key)&&resultKeys.push(key);}return resultKeys;};var getSymbols=typeof Symbol==='function'?function getSymbols(obj){return Object.getOwnPropertySymbols(obj);}:function getSymbols(){// always return empty Array when Symbol is not supported
return[];};// NOTE:
//
//   Array.prototype.indexOf is cannot find NaN (in Chrome)
//   Array.prototype.includes is can find NaN (in Chrome)
//
//   this function can find NaN, because use SameValue algorithm
function indexOf(array,s){if(toString.call(array)!=='[object Array]'){throw new TypeError('array must be an Array');}var i=void 0,len=void 0,value=void 0;for(i=0,len=array.length;i<len;++i){value=array[i];// NOTE:
//
//   it is SameValue algorithm
//   http://stackoverflow.com/questions/27144277/comparing-a-variable-with-itself
//
// eslint-disable-next-line no-self-compare
if(value===s||value!==value&&s!==s){return i;}}return-1;}exports.getKeys=getKeys;exports.getSymbols=getSymbols;exports.indexOf=indexOf;exports.isBuffer=isBuffer;/***/},/* 2 */ /***/function(module,exports,__webpack_require__){'use strict';exports.__esModule=true;exports.copyValue=exports.copyCollection=exports.copy=void 0;var _polyfill=__webpack_require__(1);var toString=Object.prototype.toString;function copy(target,customizer){var resultValue=copyValue(target);if(resultValue!==null){return resultValue;}return copyCollection(target,customizer);}function copyCollection(target,customizer){if(typeof customizer!=='function'){throw new TypeError('customizer is must be a Function');}if(typeof target==='function'){var source=String(target);// NOTE:
//
//   https://gist.github.com/jdalton/5e34d890105aca44399f
//
//   - https://gist.github.com/jdalton/5e34d890105aca44399f#gistcomment-1283831
//   - http://es5.github.io/#x15
//
//   native functions does not have prototype:
//
//       Object.toString.prototype  // => undefined
//       (function() {}).prototype  // => {}
//
//   but cannot detect native constructor:
//
//       typeof Object     // => 'function'
//       Object.prototype  // => {}
//
//   and cannot detect null binded function:
//
//       String(Math.abs)
//         // => 'function abs() { [native code] }'
//
//     Firefox, Safari:
//       String((function abs() {}).bind(null))
//         // => 'function abs() { [native code] }'
//
//     Chrome:
//       String((function abs() {}).bind(null))
//         // => 'function () { [native code] }'
if(/^\s*function\s*\S*\([^\)]*\)\s*{\s*\[native code\]\s*}/.test(source)){// native function
return target;}else{// user defined function
return new Function('return '+String(source))();}}var targetClass=toString.call(target);if(targetClass==='[object Array]'){return[];}if(targetClass==='[object Object]'&&target.constructor===Object){return{};}if(targetClass==='[object Date]'){// NOTE:
//
//   Firefox need to convert
//
//   Firefox:
//     var date = new Date;
//     +date;            // 1420909365967
//     +new Date(date);  // 1420909365000
//     +new Date(+date); // 1420909365967
//
//   Chrome:
//     var date = new Date;
//     +date;            // 1420909757913
//     +new Date(date);  // 1420909757913
//     +new Date(+date); // 1420909757913
return new Date(target.getTime());}if(targetClass==='[object RegExp]'){// NOTE:
//
//   Chrome, Safari:
//     (new RegExp).source => "(?:)"
//
//   Firefox:
//     (new RegExp).source => ""
//
//   Chrome, Safari, Firefox:
//     String(new RegExp) => "/(?:)/"
var regexpText=String(target),slashIndex=regexpText.lastIndexOf('/');return new RegExp(regexpText.slice(1,slashIndex),regexpText.slice(slashIndex+1));}if((0,_polyfill.isBuffer)(target)){var buffer=new Buffer(target.length);target.copy(buffer);return buffer;}var customizerResult=customizer(target);if(customizerResult!==void 0){return customizerResult;}return null;}function copyValue(target){var targetType=typeof target;// copy String, Number, Boolean, undefined and Symbol
// without null and Function
if(target!==null&&targetType!=='object'&&targetType!=='function'){return target;}return null;}exports.copy=copy;exports.copyCollection=copyCollection;exports.copyValue=copyValue;/***/},/* 3 */ /***/function(module,exports,__webpack_require__){'use strict';exports.__esModule=true;var _copy=__webpack_require__(2);var _polyfill=__webpack_require__(1);function defaultCustomizer(target){return void 0;}function deepcopy(target){var customizer=arguments.length>1&&arguments[1]!==void 0?arguments[1]:defaultCustomizer;if(target===null){// copy null
return null;}var resultValue=(0,_copy.copyValue)(target);if(resultValue!==null){// copy some primitive types
return resultValue;}var resultCollection=(0,_copy.copyCollection)(target,customizer),clone=resultCollection!==null?resultCollection:target;var visited=[target],reference=[clone];// recursively copy from collection
return recursiveCopy(target,customizer,clone,visited,reference);}function recursiveCopy(target,customizer,clone,visited,reference){if(target===null){// copy null
return null;}var resultValue=(0,_copy.copyValue)(target);if(resultValue!==null){// copy some primitive types
return resultValue;}var keys=(0,_polyfill.getKeys)(target).concat((0,_polyfill.getSymbols)(target));var i=void 0,len=void 0;var key=void 0,value=void 0,index=void 0,resultCopy=void 0,result=void 0,ref=void 0;for(i=0,len=keys.length;i<len;++i){key=keys[i];value=target[key];index=(0,_polyfill.indexOf)(visited,value);resultCopy=void 0;result=void 0;ref=void 0;if(index===-1){resultCopy=(0,_copy.copy)(value,customizer);result=resultCopy!==null?resultCopy:value;if(value!==null&&/^(?:function|object)$/.test(typeof value)){visited.push(value);reference.push(result);}}else{// circular reference
ref=reference[index];}clone[key]=ref||recursiveCopy(value,customizer,result,visited,reference);}return clone;}exports['default']=deepcopy;module.exports=exports['default'];/***/}]/******/));}();var deepcopy$1={default:deepcopy};var html$2=document.querySelector('html');// app global bundle storage
var bundles={'':{}};// with an empty default bundle
// app global default language
var defaultLang$1=html$2.hasAttribute('lang')?html$2.getAttribute('lang'):'';// shared fetching instances for bundles
var bundleFetchingInstances={};// path for start URL
var startUrl=function(){var path=window.location.pathname;if(document.querySelector('meta[name=app-root]')&&document.querySelector('meta[name=app-root]').getAttribute('content')){// <meta name="app-root" content="/"> to customize application root
path=document.querySelector('meta[name=app-root]').getAttribute('content');}else if(document.querySelector('link[rel=manifest]')&&document.querySelector('link[rel=manifest]').getAttribute('href')&&document.querySelector('link[rel=manifest]').getAttribute('href').match(/^\//)){// assume manifest is located at the application root folder
path=document.querySelector('link[rel=manifest]').getAttribute('href');}return path.replace(/\/[^\/]*$/,'/');}();// path for locales from <html locales-path="locales">
var localesPath=html$2.hasAttribute('locales-path')?html$2.getAttribute('locales-path'):'locales';// Support ShadowDOM V1
var paramAttribute='slot';var attributesRepository=document.createElement('i18n-attr-repo');// set up userPreference
var userPreference=document.querySelector('i18n-preference');if(!userPreference){userPreference=document.createElement('i18n-preference');// append to body
addEventListener('load',function(event){if(!document.querySelector('i18n-preference')){document.querySelector('body').appendChild(userPreference);}});setTimeout(function(){if(!document.querySelector('i18n-preference')){document.querySelector('body').appendChild(userPreference);}},0);}// debug log when <html debug> attribute exists
var debuglog=html$2.hasAttribute('debug')?function(arg){console.log(arg);}:function(){};window.BehaviorsStore=window.BehaviorsStore||{};/**
                                                      * @namespace BehaviorsStore
                                                      */const BehaviorsStore$1=window.BehaviorsStore;/**
                                                      * Apply `BehaviorsStore.I18nControllerBehavior` to manipulate internal variables for I18N
                                                      *
                                                      * Note: This behavior is not for normal custom elements to apply I18N. UI is not expected.
                                                      *
                                                      * @polymerBehavior I18nControllerBehavior
                                                      * @memberof BehaviorsStore
                                                      */const I18nControllerBehavior={properties:{/**
     * Flag for detection of `I18nControllerBehavior`
     *
     * `true` if I18nControllerBehavior is applied
     *
     * Note: Module-specific JSON resources are NOT fetched for `I18nControllerBehavior`
     */isI18nController:{type:Boolean,value:true,readOnly:true},/**
     * HTML element object for the current document
     */html:{type:Object,value:html$2},/**
     * Master bundles object for storing all the localized and default resources
     */masterBundles:{type:Object,value:bundles},/**
     * Default lang for the document, i.e., the initial value of `<html lang>` attribute
     */defaultLang:{type:String,value:defaultLang$1,readOnly:true},/**
     * List of elements which are fetching bundles
     */bundleFetchingInstances:{type:Object,value:bundleFetchingInstances},/**
     * Root URL path of the application ends with '/' to fetch bundles
     */startUrl:{type:String,value:startUrl,readOnly:true},/**
     * Path for locales
     *
     * Default value is `'locales'`
     */localesPath:{type:String,value:localesPath,readOnly:true},/**
     * <i18n-attr-repo> element to store attributes repository
     */attributesRepository:{type:Object,value:attributesRepository,readOnly:true},/**
     * <i18n-preference> element
     */userPreference:{type:Object,value:userPreference,readOnly:true}}};BehaviorsStore$1.I18nControllerBehavior=I18nControllerBehavior;/**
                                                                  * Apply `BehaviorsStore.I18nBehavior` to implement localizable elements.
                                                                  *
                                                                  *     <dom-module id="custom-element">
                                                                  *       <template>
                                                                  *         <span>Hard-coded UI texts are automatically made localizable</span>
                                                                  *       </template>
                                                                  *       <﻿﻿script﻿﻿>
                                                                  *         Polymer({
                                                                  *           is: 'custom-element',
                                                                  *           behaviors: [ 
                                                                  *             BehaviorsStore.I18nBehavior  // Add this behavior
                                                                  *           ]
                                                                  *         });
                                                                  *       <﻿﻿/script﻿﻿>
                                                                  *     </dom-module>
                                                                  *
                                                                  * `I18nBehavior` automatically extracts UI texts from `template` and 
                                                                  * binds them to localizable variables in `this.text` object.
                                                                  *
                                                                  * According to the `lang` attribute value, `this.text`, and thus the bound UI texts,
                                                                  * dynamically mutates by loading localized values from a JSON file in the `locales` directory.
                                                                  * By default, `lang` attribute values of all the localizable elements with `I18nBehavior` are
                                                                  * automatically updated according to `<html lang>` attribute value.
                                                                  *
                                                                  * The UI text externalization can be processed at build time as well by `gulp-*` task
                                                                  * so that `I18nBehavior` can immediately recognize the extracted texts in JSON and 
                                                                  * skip run-time externalization.
                                                                  *
                                                                  * Run-time externalization is suitable for development and debugging 
                                                                  * since the code changes are immediately reflected at reloading without build-time preprocesses.
                                                                  * In contrast, build-time externalization is suitable for production builds 
                                                                  * since it eliminates run-time externalization overheads.
                                                                  * 
                                                                  * ### Steps to localize a custom element
                                                                  *
                                                                  * 1. [JavaScript] Add `BehaviorsStore.I18nBehavior` to `behaviors`
                                                                  * 1. [gulp] Add `gulp-*` filter for `custom-element.html` and generate `custom-element.json`
                                                                  * 1. [locales] Put `custom-element.lang.json` in `locales` directory
                                                                  * 1. [translation] Translate `locales/custom-element.lang.json`
                                                                  *
                                                                  * - - -
                                                                  *
                                                                  * ### Directory structure of bundle files
                                                                  *
                                                                  * Normal bundles (`/element-root/locales/element-name.*.json`) for elements
                                                                  * are stored under their root directories.
                                                                  *
                                                                  * Shared bundles (`/locales/bundle.*.json`) are generated at build time 
                                                                  * by merging all the targeted bundles of the localizable elements. 
                                                                  *
                                                                  * Once the shared bundles are loaded, there should be no need to search for 
                                                                  * normal bundles per element unless the element is intentionally excluded 
                                                                  * from the shared bundles.
                                                                  *
                                                                  * ```
                                                                  *      /bundle.json 
                                                                  *      /locales/bundle.ja.json
                                                                  *              /bundle.fr.json
                                                                  *              /bundle.zh-Hans.json
                                                                  *
                                                                  *      /elements/my-list/my-list.json
                                                                  *                       /locales/my-list.ja.json
                                                                  *                               /my-list.zh-Hans.json
                                                                  *
                                                                  *               /google-chart-demo/google-chart-demo.json
                                                                  *                                 /locales/google-chart-demo.ja.json
                                                                  *                                         /google-chart-demo.fr.json
                                                                  * ```
                                                                  *
                                                                  * - - -
                                                                  *
                                                                  * ### Localizable `<template is="i18n-dom-bind" id="app">` element
                                                                  *
                                                                  * `<template is="i18n-dom-bind">` template element extends 
                                                                  * `<template is="dom-bind">` template element with all the capabilities of 
                                                                  * `I18nBehavior`.  
                                                                  *
                                                                  * The `id` attribute value is used for naming bundle files instead of the element name.
                                                                  * 
                                                                  * The bundle files are stored at the locales directory under the application root. 
                                                                  *
                                                                  * ```
                                                                  *      /app.json
                                                                  *      /locales/app.ja.json
                                                                  *              /app.fr.json
                                                                  *              /app.zh-Hans.json
                                                                  * ```
                                                                  *
                                                                  * - - -
                                                                  *
                                                                  * ### TODOs
                                                                  *
                                                                  * - Support user locale preference per user
                                                                  *
                                                                  * @polymerBehavior I18nBehavior
                                                                  * @memberof BehaviorsStore
                                                                  */let I18nBehavior={/**
   * Fired when the text message bundle object (`this.text`) is updated after `this.lang` is changed.
   *
   * @event lang-updated
   */ /**
       * Fired when a shared bundle is fetched.
       *
       * @event bundle-fetched
       */ /**
           * The locale of the element.
           * The default value is copied from `<html lang>` attribute of the current page.
           * If `<html lang>` is not specified, `''` is set to use the template default language.
           *
           * The value is synchronized with `<html lang>` attribute of the current page by default.
           *
           * ### Note:
           *  - The value may not reflect the current UI locale until the localized texts are loaded.
           */hostAttributes:{'lang':defaultLang$1},properties:{/**
     * Mirrored property for this.lang
     */_lang:{type:String,value:defaultLang$1,reflectToAttribute:false,observer:'_langChanged'},/**
     * Text message bundle object for the current locale.
     * The object is shared among all the instances of the same element.
     * The value is updated when `lang-updated` event is fired.
     */text:{type:Object,computed:'_getBundle(_lang)'},/**
     * Data model bundle object for the current locale.
     * The data are bound to localizable attribute values in the element template.
     * The object is cloned from `this.text.model` per instance.
     * The value is NOT automatically updated in sync with `this.text`.
     * 
     * How to manually update the model object when `lang-updated` event is fired:
     * ```
     *     this.model = deepcopy(this.text.model);
     * ```
     */model:{type:Object,notify:true},/**
     * The locale of the hard-coded texts in the element's template.
     * The read-only value can be specified by the `lang` attribute of the element's `template`.
     * The default value is 'en' if not specified in the `template` element.
     *
     * ```
     *  <dom-module id="custom-element">
     *    <template lang="en">
     *      <span>Hard-coded text in English</span>
     *    </template>
     *  <dom-module>
     * ```
     */templateDefaultLang:{type:String,value:'en'},/**
     * The effective locale of the element.
     * The value is updated when the localized texts are loaded and `lang-updated` event is fired.
     */effectiveLang:{type:String},/**
     * Boolean flag to synchronize with the value of  `<html lang>` attribute.
     */observeHtmlLang:{type:Boolean,value:true,observer:'_observeHtmlLangChanged'}},listeners:{'lang-updated':'_updateEffectiveLang'},/* 
     bundles = 
     {
      "": {},
      "en": {
        "my-list": {
          "p_2": "You now have:",
          "model": {
            "list": {
              "items": [
                "item 1", "item 2"
              ]
            }
          }
        },
        "google-chart-demo": {
          "simple-chart-desc": [
            "template {1} string", "param 1"
          ]
          "model": {
            "simple-chart": {
              "options": { "title": "Simple Chart" },
              "rows": []
            }
          }
        }
      },
      "ja": {
        "my-list": {},
        "google-chart-demo": {}
      }
    }
     bundles[lang]
    /bundle.json - fallback
    /locales/bundle.en.json
            /bundle.ja.json
            /bundle.fr.json
            /bundle.zh-Hans.json
     bundles[lang][is]
    /elements/my-list/my-list.json - fallback
                     /locales/my-list.en.json
                             /my-list.ja.json
                             /my-list.zh-Hans.json
              /google-chart-demo/google-chart-demo.json - fallback
                               /locales/google-chart-demo.en.json
                                       /google-chart-demo.ja.json
                                       /google-chart-demo.zh-Hans.json
     app/elements/my-list/my-list.json
                        /locales/my-list.fr.json
                                /my-list.ja.json
                                /my-list.zh-Hans.json
     dist/elements/my-list/my-list.json
                         /locales/my-list.fr.json
                                 /my-list.ja.json
                                 /my-list.zh-Hans.json
   */ /**
       * The backend logic for `this.text` object.
       *
       * @param {string} lang Locale for the text message bundle.
       * @return {Object} Text message bundle for the locale.
       */_getBundle:function(lang){//console.log('_getBundle called for ' + this.is + ' with lang = ' + lang);
var resolved;var id=this.is==='i18n-dom-bind'||this.constructor.is==='i18n-dom-bind'?this.id:this.is;if(lang&&lang.length>0){var fallbackLanguageList=this._enumerateFallbackLanguages(lang);var tryLang;while(tryLang=fallbackLanguageList.shift()){if(!bundles[tryLang]){// set up an empty bundle for the language if missing
bundles[tryLang]={};}if(bundles[tryLang][id]){// bundle found
resolved=bundles[tryLang][id];break;}}}else{// lang is not specified
lang='';resolved=bundles[lang][id];}// Fallback priorities: last > app default > element default > fallback > {}
// TODO: need more research on fallback priorities
if(!resolved){if(this._fetchStatus&&bundles[this._fetchStatus.lastLang]&&bundles[this._fetchStatus.lastLang][id]){// old bundle for now (no changes should be shown)
resolved=bundles[this._fetchStatus.lastLang][id];}else if(defaultLang$1&&defaultLang$1.length>0&&bundles[defaultLang$1]&&bundles[defaultLang$1][id]){// app default language for now
resolved=bundles[defaultLang$1][id];}else if(this.templateDefaultLang&&this.templateDefaultLang.length>0&&bundles[this.templateDefaultLang]&&bundles[this.templateDefaultLang][id]){// element default language for now
resolved=bundles[this.templateDefaultLang][id];}/* no more fallback should happen */ /* istanbul ignore else */else if(bundles[''][id]){// fallback language for now (this should be the same as element default)
resolved=bundles[''][id];}else{// give up providing a bundle (this should not happen)
resolved={};}}return resolved;},/**
   * Enumerate fallback locales for the target locale.
   * 
   * Subset implementation of BCP47 (https://tools.ietf.org/html/bcp47).
   *
   * ### Examples:
   *
   *| Target Locale | Fallback 1 | Fallback 2 | Fallback 3 |
   *|:--------------|:-----------|:-----------|:-----------|
   *| ru            | N/A        | N/A        | N/A        |
   *| en-GB         | en         | N/A        | N/A        |
   *| en-Latn-GB    | en-GB      | en-Latn    | en         |
   *| fr-CA         | fr         | N/A        | N/A        |
   *| zh-Hans-CN    | zh-Hans    | zh         | N/A        |
   *| zh-CN         | zh-Hans    | zh         | N/A        |
   *| zh-TW         | zh-Hant    | zh         | N/A        |
   *
   * #### Note:
   *
   * For zh language, the script Hans or Hant is supplied as its default script when a country/region code is supplied.
   *
   * @param {string} lang Target locale.
   * @return {Array} List of fallback locales including the target locale at the index 0.
   */_enumerateFallbackLanguages:function(lang){var result=[];var parts;var match;var isExtLangCode=0;var extLangCode;var isScriptCode=0;var scriptCode;var isCountryCode=0;var countryCode;var n;if(!lang||lang.length===0){result.push('');}else{parts=lang.split(/[-_]/);// normalize ISO-639-1 language codes
if(parts.length>0&&parts[0].match(/^[A-Za-z]{2,3}$/)){// language codes have to be lowercased
// e.g. JA -> ja, FR -> fr
// TODO: normalize 3-letter codes to 2-letter codes
parts[0]=parts[0].toLowerCase();}// normalize ISO-639-3 extension language codes
if(parts.length>=2&&parts[1].match(/^[A-Za-z]{3}$/)&&!parts[1].match(/^[Cc][Hh][SsTt]$/)){// exclude CHS,CHT
// extension language codes have to be lowercased
// e.g. YUE -> yue
isExtLangCode=1;extLangCode=parts[1]=parts[1].toLowerCase();}// normalize ISO-15924 script codes
if(parts.length>=isExtLangCode+2&&(match=parts[isExtLangCode+1].match(/^([A-Za-z])([A-Za-z]{3})$/))){// script codes have to be capitalized only at the first character
// e.g. HANs -> Hans, lAtN -> Latn
isScriptCode=1;scriptCode=parts[isExtLangCode+1]=match[1].toUpperCase()+match[2].toLowerCase();}// normalize ISO-3166-1 country/region codes
if(parts.length>=isExtLangCode+isScriptCode+2&&(match=parts[isExtLangCode+isScriptCode+1].match(/^[A-Za-z0-9]{2,3}$/))){// country/region codes have to be capitalized
// e.g. cn -> CN, jP -> JP
isCountryCode=1;countryCode=parts[isExtLangCode+isScriptCode+1]=match[0].toUpperCase();}// extensions have to be in lowercases
// e.g. U-cA-Buddhist -> u-ca-buddhist, X-LiNux -> x-linux
if(parts.length>=isExtLangCode+isScriptCode+isCountryCode+2){for(n=isExtLangCode+isScriptCode+isCountryCode+1;n<parts.length;n++){parts[n]=parts[n].toLowerCase();}}// enumerate fallback languages
while(parts.length>0){// normalize delimiters as -
// e.g. ja_JP -> ja-JP
result.push(parts.join('-'));if(isScriptCode&&isCountryCode&&parts.length==isExtLangCode+isScriptCode+2){// script code can be omitted to default
// e.g. en-Latn-GB -> en-GB, zh-Hans-CN -> zh-CN
parts.splice(isExtLangCode+isScriptCode,1);result.push(parts.join('-'));parts.splice(isExtLangCode+isScriptCode,0,scriptCode);}if(isExtLangCode&&isCountryCode&&parts.length==isExtLangCode+isScriptCode+2){// ext lang code can be omitted to default
// e.g. zh-yue-Hans-CN -> zh-Hans-CN
parts.splice(isExtLangCode,1);result.push(parts.join('-'));parts.splice(isExtLangCode,0,extLangCode);}if(isExtLangCode&&isScriptCode&&parts.length==isExtLangCode+isScriptCode+1){// ext lang code can be omitted to default
// e.g. zh-yue-Hans -> zh-Hans
parts.splice(isExtLangCode,1);result.push(parts.join('-'));parts.splice(isExtLangCode,0,extLangCode);}if(!isScriptCode&&!isExtLangCode&&isCountryCode&&parts.length==2){// default script code can be added in certain cases with country codes
// e.g. zh-CN -> zh-Hans-CN, zh-TW -> zh-Hant-TW
switch(result[result.length-1]){case'zh-CN':case'zh-CHS':result.push('zh-Hans');break;case'zh-TW':case'zh-SG':case'zh-HK':case'zh-CHT':result.push('zh-Hant');break;default:break;}}parts.pop();}}return result;},/**
   * MutationObserver callback of `lang` attribute for Safari 7
   *
   * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
   */_handleLangAttributeChange:function(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'attributes':if(mutation.attributeName==='lang'){//console.log('_handleLangAttributeChange lang = ' + this.lang + ' oldValue = ' + mutation.oldValue +
//            ' typeof oldValue = ' + typeof mutation.oldValue);
if(!(typeof mutation.oldValue==='object'&&!mutation.oldValue)&&mutation.oldValue!==this.lang){if(this._lang!==mutation.oldValue){//console.log('assigning this._lang = ' + mutation.oldValue + ' from old value');
this._lang=mutation.oldValue;}//console.log('assigning this._lang = ' + this.lang);
this._lang=this.lang;}else if(mutation.oldValue!=this.lang&&this._lang!==this.lang){//console.log('assigning this._lang = ' + this.lang);
this._lang=this.lang;}}break;default:/* istanbul ignore next: mutation.type is always attributes */break;}},this);},/**
   * Observer of `this.lang` changes.
   *
   * Update `this.text` object if the text message bundle of the new `lang` is locally available.
   *
   * Trigger fetching of the text message bundle of the new `lang` if the bundle is not locally available.
   *
   * @param {string} lang New value of `lang`.
   * @param {string} oldLang Old value of `lang`.
   */_langChanged:function(lang,oldLang){//console.log(this.id + ':_langChanged lang = ' + lang + ' oldLang = ' + oldLang);
var id=(this.is||this.getAttribute('is'))==='i18n-dom-bind'?this.id:this.is;lang=lang||'';// undefined and null are treated as default ''
oldLang=oldLang||'';if(lang!==oldLang&&bundles[oldLang]&&bundles[oldLang][id]){this._fetchStatus.lastLang=oldLang;}if(bundles[lang]&&bundles[lang][id]){// bundle available for the new language
if(this._fetchStatus&&lang!==this._fetchStatus.ajaxLang){// reset error status
this._fetchStatus.error=null;}if(this.__data){this.notifyPath('text',this._getBundle(this.lang));}this.effectiveLang=lang;this.fire('lang-updated',{lang:this.lang,oldLang:oldLang,lastLang:this._fetchStatus.lastLang});}else{// fetch the missing bundle
this._fetchLanguage(lang);}},/**
   * Called on `lang-updated` events and update `this.effectiveLang` with the value of `this.lang`.
   */_updateEffectiveLang:function(event){if(event.composedPath()[0]===this){//console.log('lang-updated: _updateEffectiveLang: assigning effectiveLang = ' + this._lang);
this.effectiveLang=this._lang;}},/**
   * Trigger fetching of the appropriate text message bundle of the target locale.
   *
   * ### Two Layers of Fallbacks:
   *
   * 1. Missing bundles fall back to those of their fallback locales.
   * 1. Missing texts in the non-default bundles fall back to those in the default bundle. 
   *
   * ### Fallback Examples:
   *
   *| Locale      | Bundle Status                    |
   *|:------------|:---------------------------------|
   *| fr-CA       | existent with sparse texts       |
   *| fr          | existent with full texts         |
   *| ja          | existent with some missing texts |
   *| zh-Hans-CN  | missing                          |
   *| zh-Hans     | existent with some missing texts |
   *| zh          | missing                          |
   *| en          | existent with full texts         |
   *| ''(default) | existent with full texts         |
   *
   *| Target      | Fallback bundle       | Resolved locale |
   *|:------------|:----------------------|:----------------|
   *| en          | en                    | en              |
   *| ja          | ja + ''(default)      | ja              |
   *| fr-CA       | fr-CA + fr            | fr-CA           |
   *| zh-Hans-CN  | zh-Hans + ''(default) | zh-Hans         |
   *
   * @param {string} lang Target locale.
   */_fetchLanguage:function(lang){if(this._fetchStatus){this._fetchStatus.fallbackLanguageList=this._enumerateFallbackLanguages(lang);this._fetchStatus.fallbackLanguageList.push('');this._fetchStatus.targetLang=this._fetchStatus.fallbackLanguageList.shift();this._fetchBundle(this._fetchStatus.targetLang);}},/**
   * Fetch the text message bundle of the target locale 
   * cooperatively with other instances.
   *
   * @param {string} lang Target locale.
   */_fetchBundle:function(lang){//console.log('_fetchBundle lang = ' + lang);
if(!lang||lang.length===0){// handle empty cases
if(defaultLang$1&&defaultLang$1.length>0){lang=defaultLang$1;// app default language
}else if(this.templateDefaultLang&&this.templateDefaultLang.length>0){lang=this.templateDefaultLang;// element default language
}else{lang='';// fallback default language
}}// set up an empty bundle if inexistent
bundles[lang]=bundles[lang]||{};var id=this.is==='i18n-dom-bind'||this.constructor.is==='i18n-dom-bind'?this.id:this.is;if(bundles[lang][id]){// bundle is available; no need to fetch
if(this._fetchStatus.targetLang===lang){// reset error status
this._fetchStatus.error=null;if(this.lang===lang){this.notifyPath('text',this._getBundle(this.lang));this.fire('lang-updated',{lang:this.lang,lastLang:this._fetchStatus.lastLang});}else{this.lang=lang;// trigger lang-updated event
}}else{var nextFallbackLanguage=this._fetchStatus.fallbackLanguageList.shift();// bundle is available; no need to fetch
this._fetchStatus.fetchingInstance=null;if(nextFallbackLanguage){this._fetchBundle(nextFallbackLanguage);}else{this._constructBundle(this._fetchStatus.targetLang);// reset error status
this._fetchStatus.error=null;if(this.lang===this._fetchStatus.targetLang){this.notifyPath('text',this._getBundle(this.lang));this.fire('lang-updated',{lang:this.lang,lastLang:this._fetchStatus.lastLang});}else{this.lang=this._fetchStatus.targetLang;// trigger lang-updated event
}}}}else if(this._fetchStatus.fetchingInstance){if(this._fetchStatus.fetchingInstance!==this){// fetching in progress by another instance
// TODO: redundant addEventListener multiple times
this._forwardLangEventBindThis=this._forwardLangEventBindThis||this._forwardLangEvent.bind(this);this._fetchStatus.fetchingInstance.addEventListener('lang-updated',this._forwardLangEventBindThis);}}else if(bundleFetchingInstances[lang]){// fetching bundle.lang.json in progress by an instance of another element
this._fetchStatus.fetchingInstance=this;this._fetchStatus.ajaxLang=lang;this._handleBundleFetchedBindThis=this._handleBundleFetchedBindThis||this._handleBundleFetched.bind(this);bundleFetchingInstances[lang].addEventListener('bundle-fetched',this._handleBundleFetchedBindThis);//console.log(this.is + ' addEventListener bundle-fetched');
}else{// proceed to fetch
this._fetchStatus.fetchingInstance=this;if(!this._fetchStatus.ajax){// set up ajax client
this._fetchStatus.ajax=document.createElement('iron-ajax');this._fetchStatus.ajax.handleAs='json';this._fetchStatus._handleResponseBindFetchingInstance=this._handleResponse.bind(this);this._fetchStatus._handleErrorBindFetchingInstance=this._handleError.bind(this);this._fetchStatus.ajax.addEventListener('response',this._fetchStatus._handleResponseBindFetchingInstance);this._fetchStatus.ajax.addEventListener('error',this._fetchStatus._handleErrorBindFetchingInstance);}else{if(this._fetchStatus._handleResponseBindFetchingInstance){this._fetchStatus.ajax.removeEventListener('response',this._fetchStatus._handleResponseBindFetchingInstance);}if(this._fetchStatus._handleErrorBindFetchingInstance){this._fetchStatus.ajax.removeEventListener('error',this._fetchStatus._handleErrorBindFetchingInstance);}this._fetchStatus._handleResponseBindFetchingInstance=this._handleResponse.bind(this);this._fetchStatus._handleErrorBindFetchingInstance=this._handleError.bind(this);this._fetchStatus.ajax.addEventListener('response',this._fetchStatus._handleResponseBindFetchingInstance);this._fetchStatus.ajax.addEventListener('error',this._fetchStatus._handleErrorBindFetchingInstance);}// TODO: app global bundles have to be handled
var url;var skipFetching=false;var importBaseURI=this.constructor.importMeta?this.constructor.importMeta.url:location.href;if(lang===''){url=this.resolveUrl(id+'.json',importBaseURI);}else{if(bundles[lang]&&bundles[lang].bundle){// missing in the bundle
url=this.resolveUrl(localesPath+'/'+id+'.'+lang+'.json',importBaseURI);skipFetching=!!this.isI18nController;}else{// fetch the bundle
bundleFetchingInstances[lang]=this;url=this.resolveUrl(startUrl+localesPath+'/bundle.'+lang+'.json',importBaseURI);}}this._fetchStatus.ajax.url=url;this._fetchStatus.ajaxLang=lang;try{this._fetchStatus.error=null;if(skipFetching){this._handleError({detail:{error:'skip fetching for I18nController'}});}else{this._fetchStatus.ajax.generateRequest();}}catch(e){// TODO: extract error message from the exception e
this._handleError({detail:{error:'ajax request failed: '+e}});}}},/**
   * Handle Ajax success response for a bundle.
   *
   * @param {Object} event `iron-ajax` success event.
   */_handleResponse:function(event){//console.log('_handleResponse ajaxLang = ' + this._fetchStatus.ajaxLang);
if(this._fetchStatus.ajax.url.indexOf('/'+localesPath+'/bundle.')>=0){bundles[this._fetchStatus.ajaxLang]=bundles[this._fetchStatus.ajaxLang]||{};this._deepMap(bundles[this._fetchStatus.ajaxLang],event.detail.response,function(text){return text;});bundles[this._fetchStatus.ajaxLang].bundle=true;bundleFetchingInstances[this._fetchStatus.ajaxLang]=null;//console.log('bundle-fetched ' + this.is + ' ' + this._fetchStatus.ajaxLang);
this.fire('bundle-fetched',{success:true,lang:this._fetchStatus.ajaxLang});var id=this.is==='i18n-dom-bind'?this.id:this.is;if(bundles[this._fetchStatus.ajaxLang][id]){this._fetchStatus.lastResponse=bundles[this._fetchStatus.ajaxLang][id];}else{// bundle does not contain text for this.is
this._fetchStatus.fetchingInstance=null;this._fetchBundle(this._fetchStatus.ajaxLang);return;}}else{this._fetchStatus.lastResponse=event.detail.response;}if(this._fetchStatus.lastResponse){var nextFallbackLanguage=this._fetchStatus.fallbackLanguageList.shift();// store the raw response
this._fetchStatus.rawResponses[this._fetchStatus.ajaxLang]=this._fetchStatus.lastResponse;this._fetchStatus.fetchingInstance=null;if(nextFallbackLanguage){this._fetchBundle(nextFallbackLanguage);}else{this._fetchBundle('');}}else{event.detail.error='empty response for '+this._fetchStatus.ajax.url;this._handleError(event);}},/**
   * Handle Ajax error response for a bundle.
   *
   * @param {Object} event `iron-ajax` error event.
   */_handleError:function(event){var nextFallbackLanguage;this._fetchStatus.fetchingInstance=null;if(this._fetchStatus.ajax.url.indexOf('/'+localesPath+'/bundle.')>=0){bundles[this._fetchStatus.ajaxLang]=bundles[this._fetchStatus.ajaxLang]||{};bundles[this._fetchStatus.ajaxLang].bundle=true;bundleFetchingInstances[this._fetchStatus.ajaxLang]=null;// falls back to its element-specific bundle
this._fetchBundle(this._fetchStatus.ajaxLang);//console.log('bundle-fetched ' + this.is + ' ' + this._fetchStatus.ajaxLang);
this.fire('bundle-fetched',{success:false,lang:this._fetchStatus.ajaxLang});return;}nextFallbackLanguage=this._fetchStatus.fallbackLanguageList.shift();if(this._fetchStatus.ajaxLang===this._fetchStatus.targetLang){if(nextFallbackLanguage){//console.log(this.is + ': ' + this._fetchStatus.ajaxLang +
//            ' falls back to ' + nextFallbackLanguage);
this._fetchStatus.targetLang=nextFallbackLanguage;this._fetchBundle(nextFallbackLanguage);}else{this._fetchStatus.error=event.detail.error;//console.log(this._fetchStatus.error);
// falls back to default
this.lang='';}}else{// fetching dependent fallback languages
if(nextFallbackLanguage){//console.log(this.is + ': ' + this._fetchStatus.ajaxLang +
//            ' is missing and skipped');
//console.log(this.is + ': step to the next dependent fallback ' +
//            nextFallbackLanguage);
this._fetchBundle(nextFallbackLanguage);}else{this._fetchBundle('');}}},/**
   * Forward `lang-updated` event to other instances of the same element.
   *
   * @param {Object} event `lang-updated` event object.
   */_forwardLangEvent:function(event){//console.log('_forwardLangEvent ' + this.is + ' ' + event.detail.lang);
event.target.removeEventListener(event.type,this._forwardLangEventBindThis);if(this.lang===event.detail.lang){this.notifyPath('text',this._getBundle(this.lang));this.fire(event.type,event.detail);}else{this.lang=event.detail.lang;this.notifyPath('text',this._getBundle(this.lang));}},/**
   * Handle `bundle-fetched` event.
   *
   * @param {Object} event `bundle-fetched` event object.
   */_handleBundleFetched:function(event){var detail=event.detail;//console.log('_handleBundleFetched ' + this.is + ' ' + detail.lang);
event.target.removeEventListener(event.type,this._handleBundleFetchedBindThis);if(this._fetchStatus.ajaxLang===detail.lang){this._fetchStatus.fetchingInstance=null;this._fetchBundle(this._fetchStatus.ajaxLang);}},/**
   * Handle changes of `observeHtmlLang` property.
   *
   * @param {Boolean} value Value of `observeHtmlLang`
   */_observeHtmlLangChanged:function(value){if(value){this._htmlLangObserver=this._htmlLangObserver||new MutationObserver(this._handleHtmlLangChange.bind(this));this._htmlLangObserver.observe(html$2,{attributes:true});}else{if(this._htmlLangObserver){this._htmlLangObserver.disconnect();}}},/**
   * MutationObserver callback of `<html lang>` attribute.
   *
   * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
   */_handleHtmlLangChange:function(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'attributes':if(mutation.attributeName==='lang'){this.lang=html$2.lang;}break;default:break;}},this);},/**
   * Construct the text message bundle of the target locale with fallback of missing texts.
   *
   * @param {strings} lang Target locale.
   */_constructBundle:function(lang){var fallbackLanguageList=this._enumerateFallbackLanguages(lang);var bundle={};var raw;var baseLang;var id=this.is==='i18n-dom-bind'?this.id:this.is;var i;fallbackLanguageList.push('');for(i=0;i<fallbackLanguageList.length;i++){if(bundles[fallbackLanguageList[i]]&&bundles[fallbackLanguageList[i]][id]){break;}}fallbackLanguageList.splice(i+1,fallbackLanguageList.length);while((baseLang=fallbackLanguageList.pop())!==undefined){if(bundles[baseLang][id]){bundle=deepcopy(bundles[baseLang][id]);}else{raw=this._fetchStatus.rawResponses[baseLang];if(raw){this._deepMap(bundle,raw,function(text){return text;});}}}// store the constructed bundle
if(!bundles[lang]){bundles[lang]={};}bundles[lang][id]=bundle;},/**
   * Recursively map the source object onto the target object with the specified map function.
   * 
   * The method is used to merge a bundle into its fallback bundle.
   *
   * @param {Object} target Target object.
   * @param {Object} source Source object.
   * @param {Function} map Mapping function.
   */_deepMap:function(target,source,map){var value;for(var prop in source){value=source[prop];switch(typeof value){case'string':case'number':case'boolean':if(typeof target==='object'){target[prop]=map(value,prop);}break;case'object':if(typeof target==='object'){if(Array.isArray(value)){// TODO: cannot handle deep objects properly
target[prop]=target[prop]||[];this._deepMap(target[prop],value,map);}else{target[prop]=target[prop]||{};this._deepMap(target[prop],value,map);}}break;default:if(typeof target==='object'){target[prop]=value;}break;}}},/**
   * Construct the default bundle from the element's template.
   *
   * Extract the default bundle from the template if it is embedded as JSON at build time.
   *
   * ### Hard-coded UI text example:
   * ```
   *   <dom-module id="custom-element">
   *     <template>
   *       <span id="label">UI Text Label:</span>
   *       <input id="input-el"
   *              value="{{keyword}}"
   *              placeholder="Keyword">
   *     </template>
   *   </dom-module>
   * ```
   *
   * ### Constructed default bundle for the above example:
   * ```
   *   {
   *     "model" : {
   *       "input-el": {
   *         "placeholder": "Keyword"
   *       }
   *     },
   *     "label": "UI Text Label:"
   *   }
   * ```
   *
   * ### Processed template with bound annotations for the above example:
   * ```
   *   <dom-module id="custom-element">
   *     <template localizable-text="embedded">
   *       <span id="label">{{text.label}}</span>
   *       <input id="input-el"
   *         value="{{keyword}}"
   *         placeholder="{{model.input-el.placeholder}}">
   *     </template>
   *   </dom-module>
   * ```
   *
   * ### Embedded JSON bundle format for the above example:
   * ```
   *   <dom-module id="custom-element">
   *     <template localizable-text="embedded">
   *       <span id="label">{{text.label}}</span>
   *       <input id="input-el"
   *         value="{{keyword}}"
   *         placeholder="{{model.input-el.placeholder}}">
   *       <template id="localizable-text">
   *         <json-data>{
   *           "model" : {
   *             "input-el": {
   *               "placeholder": "Keyword"
   *             }
   *           },
   *           "label": "UI Text Label:"
   *         }</json-data>
   *       </template>
   *     </template>
   *   </dom-module>
   * ```
   */_constructDefaultBundle:function(_template,_id){var template;var id=_id||this.is;if(this.is==='i18n-dom-bind'){template=_template||this;id=this.id;/* istanbul ignore if */if(template.content&&template.content.childNodes.length===0){// Find the real template in Internet Explorer 11 when i18n-dom-bind is concealed in a parent template
// This does not happen on Polymer 1.3.1 or later.  So ignore this 'if' statement in code coverage.
template=Array.prototype.map.call(document.querySelectorAll('template'),function(parentTemplate){return parentTemplate.content.querySelector('template#'+id+'[is="i18n-dom-bind"]');}).reduce(function(prev,current){return prev||current;});// Patch this.content with the real one
if(template){this.content=template.content;}}}else{template=_template;}if(template){this.templateDefaultLang=template.hasAttribute('lang')?template.lang:'en';}else{this.templateDefaultLang='en';}var bundle={model:{}};var path=[];var templateDefaultLang=this.templateDefaultLang;var localizableText,jsonData;if(template){// register localizable attributes of the element itself
if(attributesRepository.registerLocalizableAttributes){attributesRepository.registerLocalizableAttributes(id,template);}else{BehaviorsStore$1._I18nAttrRepo._created();BehaviorsStore$1._I18nAttrRepo.registerLocalizableAttributes(id,template);}if(template.getAttribute('localizable-text')==='embedded'){// pick up embedded JSON from the template
localizableText=template.content.querySelector('#localizable-text');if(localizableText){jsonData=localizableText.content.querySelector('json-data');if(jsonData){bundle=JSON.parse(jsonData.textContent);}else{console.error('<json-data> not found in <template id=\"localizable-text\">');}}else{console.error('<template id=\"localizable-text\"> not found');}}else{// traverse template to generate bundle
this._traverseTemplateTree(template.content,path,bundle,0);}}bundles[''][id]=bundle;bundles[templateDefaultLang]=bundles[templateDefaultLang]||{};bundles[templateDefaultLang][id]=bundle;//console.log('text = ');
//console.log(JSON.stringify(bundle, null, 2));
return true;},/**
   * Traverse localizable attributes of the target element node and 
   * add them to the target bundle under the `model` object.
   * 
   * The `<i18n-attr-repo>` object is used 
   * to judge if the target attributes are localizable.
   *
   * @param {Object} node Target element node.
   * @param {string} path Path to the target node.
   * @param {Object} bundle Default bundle.
   */_traverseAttributes:function(node,path,bundle){var name=node.nodeName.toLowerCase();var id=node.getAttribute?node.getAttribute('text-id')||node.getAttribute('id'):null;var text;var messageId;var attrId;var isLocalizable;var dummy;var renamedAttributes=[];// pick up element attributes
Array.prototype.forEach.call(node.attributes,function(attribute){text=attribute.value;switch(attribute.name){case'id':case'text-id':case'is':case'lang':case'class':// verification required before removing these attributes
case'href':case'src':case'style':case'url':case'selected':break;default:if(!(isLocalizable=BehaviorsStore$1._I18nAttrRepo.isLocalizableAttribute(node,attribute.name))){break;}if(text.length===0){// skip empty value attribute
}else if(text.match(/^{{[^{}]*}}$/)||text.match(/^\[\[[^\[\]]*\]\]$/)){// skip annotation attribute
}else if(text.replace(/\n/g,' ').match(/^{.*}|\[.*\]$/g)&&!text.match(/^{{[^{}]*}}|\[\[[^\[\]]*\]\]/)&&!text.match(/{{[^{}]*}}|\[\[[^\[\]]*\]\]$/)){// generate message id
messageId=this._generateMessageId(path,id);try{//console.log(messageId + ' parsing attribute ' + attribute.name + ' = ' + text);
var value=JSON.parse(text.replace(/\n/g,' '));//console.log('parsed JSON object = ');
//console.log(value);
switch(typeof value){case'string':case'number':case'object':// put into model
attrId=['model',messageId,attribute.name].join('.');debuglog(attrId+' = '+text);this._setBundleValue(bundle,attrId,value);attribute.value='{{'+attrId+'}}';break;default:// skip other types
break;}}catch(e){// invalid JSON
console.warn(e,'Invalid JSON at <'+name+' '+attribute.name+'> with value = '+text);}}else if(text.match(/{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]/)){// compound binding attribute
// Parameterized:
//   e.g., attr="Compound binding attribute has [[bound.value]] {{parameters}} in the value string"
//   replaced as "{{i18nFormat(attrId.0,bound.value,parameters)}}"
//   extracted as [ "Compound binding attribute has {1} {2} in the value string", "[[bound.value]]", "{{parameters}}" ]
// Concatenated: (Parameters with functions cannot be reordered in translation)
//   e.g., attr2="Compound binding attribute has [[f1(bound.value)]] {{f2(parameters)}} in the value string"
//   replaced as "{{attrId.0}}[[f1(bound.value)]]{{attrId.2}}{{f2(parameters)}}{{attrId.4}}"
//   extracted as [ "Compound binding attribute has ", "[[f1(bound.value)]]", " ", "{{f2(parameters)}}", " in the value string" ]
var parsed=text.match(/([^{}\[\]]{1,})|({{[^{}]{1,}}})|(\[\[[^\[\]]{1,}\]\])/g);var parameterized;var processed;var n;messageId=this._generateMessageId(path,id);attrId=['model',messageId,attribute.name.replace(/\$$/,'')].join('.');if(text.match(/\)}}|\)\]\]/)){// check for function parameter
// Concatenate
debuglog(attrId+' = '+JSON.stringify(parsed));this._setBundleValue(bundle,attrId,parsed);processed='';for(n=0;n<parsed.length;n++){if(parsed[n].match(/^{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]$/)){processed+=parsed[n];}else{processed+='{{'+attrId+'.'+n+'}}';}}if(isLocalizable==='$'&&!attribute.name.match(/\$$/)){dummy=document.createElement('span');dummy.innerHTML='<span '+attribute.name+'$="'+processed+'"></span>';node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());renamedAttributes.push(attribute.name);}else{attribute.value=processed;}}else{// Parameterize
parameterized=[''];while(parsed.length){if(parsed[0].match(/^{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]$/)){parameterized.push(parsed[0]);parameterized[0]+='{'+(parameterized.length-1)+'}';}else{parameterized[0]+=parsed[0];}parsed.shift();}debuglog(attrId+' = '+JSON.stringify(parameterized));this._setBundleValue(bundle,attrId,parameterized);processed='{{i18nFormat('+attrId+'.0';for(n=1;n<parameterized.length;n++){processed+=','+parameterized[n].replace(/^[{\[][{\[](.*)[}\]][}\]]$/,'$1');}processed+=')}}';if(isLocalizable==='$'&&!attribute.name.match(/\$$/)){dummy=document.createElement('span');dummy.innerHTML='<span '+attribute.name+'$="'+processed+'"></span>';node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());renamedAttributes.push(attribute.name);}else{attribute.value=processed;}}}else{// string attribute
messageId=this._generateMessageId(path,id);attrId=['model',messageId,attribute.name].join('.');debuglog(attrId+' = '+text);this._setBundleValue(bundle,attrId,text);if(isLocalizable==='$'&&!attribute.name.match(/\$$/)){dummy=document.createElement('span');dummy.innerHTML='<span '+attribute.name+'$='+'"{{'+attrId+'}}"'+'></span>';node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());renamedAttributes.push(attribute.name);}else{attribute.value='{{'+attrId+'}}';}}break;}},this);renamedAttributes.forEach(name=>node.removeAttribute(name));},/**
   * Recursively traverse text contents of the target element node
   * and add them to the target bundle object.
   *
   * Traversed text contents are replaced with annotations 
   * for the corresponding text in the bundle.
   *
   * - - -
   *
   * There are some special treatments in the following cases.
   *
   * ### Sentence with parameterized child parameter-like elements:
   *
   * As the order of the parameters can change in different languages,
   * `<i18n-format>` element is used to make the sentence localizable.
   *
   * ### Before processing
   *
   * ```
   *   <p id="p"><code>i18n-format</code> is 
   *     used for  
   *     <a href="https://www.google.com">parameterized</a> 
   *     sentences.</p>
   * ```
   *
   * ### After processing
   *
   * ```
   *   <p id="p">
   *     <i18n-format lang="{{effectiveLang}}">
   *       <span>{{text.p.0}}</span>
   *       <code>{{text.p.1}}</code>
   *       <a href="https://www.google.com">{{text.p.2}}</a>
   *     </i18n-format>
   *   </p>
   * ```
   *
   * ### Constructed bundle data: Texts are stored in an Array of strings.
   *
   * ```
   *   {
   *     "p" : [
   *       "{1} is\n used for\n {2}\n sentences.",
   *       "i18n-format",
   *       "parameterized"
   *     ]
   *   }
   * ```
   *
   * - - -
   *
   * ### `<i18n-format>` element with compound templates:
   *
   * Texts with compound templates for `<i18n-format>` element are
   * processed as below.
   *
   * `lang="{{effectiveLang}}"` attribute is added to `<i18n-format>` node
   * as well as `<i18n-number>` node.
   *
   * ### Before processing
   *
   * ```
   * <i18n-format id="sentence">
   *   <json-data>{
   *     "0": "You ({3}) gave no gifts.",
   *     "1": {
   *       "male": "You ({3}) gave him ({4}) {5}.",
   *       "female": "You ({3}) gave her ({4}) {5}.",
   *       "other": "You ({3}) gave them ({4}) {5}."
   *     },
   *     "one": {
   *       "male": 
   *         "You ({3}) gave him ({4}) and one other {5}.",
   *       "female": 
   *         "You ({3}) gave her ({4}) and one other {5}.",
   *       "other": 
   *         "You ({3}) gave them ({4}) and one other {5}."
   *     },
   *     "other": 
   *       "You ({3}) gave them ({4}) and {1} others gifts."
   *   }</json-data>
   *   <i18n-number 
   *     offset="1"
   *     >{{recipients.length}}</i18n-number>
   *   <span>{{recipients.0.gender}}</span>
   *   <span>{{sender.name}}</span>
   *   <span>{{recipients.0.name}}</span>
   *   <span>a gift</span>
   * </i18n-format>
   * ```
   *
   * ### After processing
   *
   * ```
   * <i18n-format id="sentence" 
   *              lang="{{effectiveLang}}">
   *   <json-data>{{serialize(text.sentence.0)}}</json-data>
   *   <i18n-number 
   *     offset="1"
   *     lang="{{effectiveLang}}"
   *     >{{recipients.length}}</i18n-number>
   *   <span>{{recipients.0.gender}}</span>
   *   <span>{{sender.name}}</span>
   *   <span>{{recipients.0.name}}</span>
   *   <span>{{text.sentence.5}}</span>
   * </i18n-format>
   * ```
   *
   * ### Constructed bundle data:
   *
   * ```
   * {
   *   "sentence" : [
   *     {
   *       "0": "You ({3}) gave no gifts.",
   *       "1": {
   *         "male": "You ({3}) gave him ({4}) {5}.",
   *         "female": "You ({3}) gave her ({4}) {5}.",
   *         "other": "You ({3}) gave them ({4}) {5}."
   *       },
   *       "one": {
   *         "male": 
   *         "You ({3}) gave him ({4}) and one other {5}.",
   *         "female": 
   *         "You ({3}) gave her ({4}) and one other {5}.",
   *         "other": 
   *         "You ({3}) gave them ({4}) and one other {5}."
   *       },
   *       "other": 
   *       "You ({3}) gave them ({4}) and {1} others gifts."
   *     },
   *     "{{recipients.length - 1}}",
   *     "{{recipients.0.gender}}",
   *     "{{sender.name}}",
   *     "{{recipients.0.name}}",
   *     "a gift"
   *   ]
   * }
   * ```
   *
   * @param {Object} node Target element node.
   * @param {string} path Path to the target node.
   * @param {Object} bundle Default bundle.
   * @param {Number} index Index in the siblings of the target node excluding whitespace nodes.
   */_traverseTemplateTree:function(node,path,bundle,index){var i;var whiteSpaceElements=0;var isWhiteSpace=false;var isCompoundAnnotatedNode=false;var text;var span;var name=node.nodeName.toLowerCase();var id=node.getAttribute?node.getAttribute('text-id')||node.getAttribute('id'):null;var messageId;var n;var templateText;var templateTextParams;path.push(id?'#'+id:name+(index>0?'_'+index:''));//console.log(path.join(':'));
switch(node.nodeType){case node.ELEMENT_NODE:switch(name){case'style':case'script':case'meta':// skip
break;case'i18n-format':// pick up element attributes
this._traverseAttributes(node,path,bundle);// generate message id
messageId=this._generateMessageId(path,id);if(!node.hasAttribute('lang')){node.setAttribute('lang','{{effectiveLang}}');}text=Array.prototype.filter.call(node.childNodes,function(child){return child.nodeType===child.ELEMENT_NODE;}).map(function(param,n){var value=param.textContent;var parsedValue=value.match(/^({{)(.*)(}})$/)||value.match(/^(\[\[)(.*)(\]\])$/);if(n===0){// template element
if(param.tagName.toLowerCase()==='json-data'){if(parsedValue){var parsedValue2=value.match(/^({{)(serialize\(.*\))(}})$/)||value.match(/^(\[\[)(serialize\(.*\))(\]\])$/);if(!parsedValue2){// convert to {{serialize(id)}}
parsedValue.shift();parsedValue.splice(1,0,'serialize(');parsedValue.splice(3,0,')');param.textContent=parsedValue.join('');}}else{value=JSON.parse(value);param.textContent='{{serialize(text.'+messageId+'.'+n+')}}';}}else{if(!parsedValue){param.textContent='{{text.'+messageId+'.'+n+'}}';}}}else{// param element
// TODO: handle localization of param nodes and attributes
if(!param.hasAttribute(paramAttribute)){param.setAttribute(paramAttribute,n);}if(param.tagName.toLowerCase()==='i18n-number'){if(!param.hasAttribute('lang')){param.setAttribute('lang','{{effectiveLang}}');}var offset=param.getAttribute('offset');if(offset){offset=' - '+offset;}else{offset='';}if(parsedValue){// convert to {{path - offset}}
parsedValue.shift();parsedValue.splice(2,0,offset);value=parsedValue.join('');}else{param.textContent='{{text.'+messageId+'.'+n+'}}';}}else{if(!parsedValue){param.textContent='{{text.'+messageId+'.'+n+'}}';}}}return value;},this);debuglog(messageId+' = '+text);this._setBundleValue(bundle,messageId,text);break;case'template':// traverse into its content
//console.log(path.join(':') + ':' + node.content.nodeName + ':' + 0);
this._traverseTemplateTree(node.content,path,bundle,0);break;default:// element node
if(name==='i18n-number'||name==='i18n-datetime'){if(!node.hasAttribute('lang')){node.setAttribute('lang','{{effectiveLang}}');}}// pick up element attributes
this._traverseAttributes(node,path,bundle);// check annonated node
isCompoundAnnotatedNode=false;if(node.childElementCount===0){if(node.textContent){isCompoundAnnotatedNode=this._isCompoundAnnotatedText(node.textContent);}}if(node.childElementCount===0&&!isCompoundAnnotatedNode){if(node.textContent){// use textContent for Firefox compatibility
text=node.textContent;if(text.length===0||text.match(/^\s*$/g)){// skip empty or whitespace node
}else if(text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)){// skip annotation node
// TODO: compound bindings support
}else{// a text message found
// generate message id
messageId=this._generateMessageId(path,id);// store the text message
text=text.replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' ');if(name==='json-data'){this._setBundleValue(bundle,messageId,JSON.parse(text));}else{this._setBundleValue(bundle,messageId,text);}// replace textContent with annotation
node.textContent='{{text.'+messageId+'}}';if(!id){//node.id = messageId;
//console.warn('add missing node id as ' + messageId + ' for ' + text);
}debuglog(messageId+' = '+text);}}else{// skip
}}else{// has children or compound annotation
// check if i18n-format is applicable
var childStatus=Array.prototype.map.call(node.childNodes,function(child){var result;if(child.nodeType===child.ELEMENT_NODE&&child.tagName==='TEMPLATE'){var templateNonCommentChildNodes=Array.prototype.filter.call(child.content.childNodes,function(templateChild){switch(templateChild.nodeType){case templateChild.COMMENT_NODE:return false;case templateChild.TEXT_NODE:return!templateChild.textContent.match(/^\s*$/g);default:case templateChild.ELEMENT_NODE:return true;}});var firstChild=templateNonCommentChildNodes.shift();// Examples:
// hasText: <template>text</template>
// hasCompoundAnnotatedText: <template>{{item.name}} text</template>
// hasTextChild: <template><b>text</b></template> or <template><br></template>
// hasCompoundAnnotatedChildNode: <template><b>{{item.name}} text</b></template>
// hasGrandChildren: <template><span><b>text</b></span></template> or 
//                   <template><b>A</b><i>B</i></template> or
//                   hasCompoundAnnotatedText
result={hasText:templateNonCommentChildNodes.length===0&&firstChild&&firstChild.nodeType===firstChild.TEXT_NODE&&firstChild.textContent.length>0&&!firstChild.textContent.match(/^\s*$/g),hasCompoundAnnotatedText:firstChild&&firstChild.nodeType===firstChild.TEXT_NODE&&this._isCompoundAnnotatedText(firstChild.textContent),hasTextChild:templateNonCommentChildNodes.length===0&&firstChild&&firstChild.nodeType===child.ELEMENT_NODE&&firstChild.childElementCount===0,// including <br>
hasCompoundAnnotatedChildNode:firstChild&&firstChild.nodeType===firstChild.ELEMENT_NODE&&firstChild.childElementCount===0&&this._isCompoundAnnotatedText(firstChild.textContent),hasGrandChildren:templateNonCommentChildNodes.length>0||firstChild&&firstChild.nodeType===firstChild.ELEMENT_NODE&&Array.prototype.map.call(firstChild.childNodes,function(grandChild){return grandChild.nodeType!==grandChild.TEXT_NODE;}).reduce(function(prev,current){return prev||current;},false)||firstChild&&firstChild.nodeType===firstChild.TEXT_NODE&&this._isCompoundAnnotatedText(firstChild.textContent)};}else{result={hasText:child.nodeType===child.TEXT_NODE&&child.textContent.length>0&&!child.textContent.match(/^\s*$/g),hasCompoundAnnotatedText:child.nodeType===child.TEXT_NODE&&this._isCompoundAnnotatedText(child.textContent),hasTextChild:child.nodeType===child.ELEMENT_NODE&&child.childElementCount===0,// including <br>
hasCompoundAnnotatedChildNode:child.nodeType===child.ELEMENT_NODE&&child.childElementCount===0&&this._isCompoundAnnotatedText(child.textContent),hasGrandChildren:child.nodeType===child.ELEMENT_NODE&&Array.prototype.map.call(child.childNodes,function(grandChild){return grandChild.nodeType!==grandChild.TEXT_NODE;}).reduce(function(prev,current){return prev||current;},false)};}return result;}.bind(this)).reduce(function(prev,current){return{hasText:prev.hasText||current.hasText,hasCompoundAnnotatedText:prev.hasCompoundAnnotatedText||current.hasCompoundAnnotatedText,hasTextChild:prev.hasTextChild||current.hasTextChild,hasCompoundAnnotatedChildNode:prev.hasCompoundAnnotatedChildNode||current.hasCompoundAnnotatedChildNode,hasGrandChildren:prev.hasGrandChildren||current.hasGrandChildren};},{hasText:false,hasCompoundAnnotatedText:false,hasTextChild:false,hasCompoundAnnotatedChildNode:false,hasGrandChildren:false});if((childStatus.hasText||node.hasAttribute('text-id'))&&(childStatus.hasTextChild||childStatus.hasCompoundAnnotatedText)&&!childStatus.hasGrandChildren&&!childStatus.hasCompoundAnnotatedChildNode){// apply i18n-format
/*
                      <i18n-format>
                        <span>{{text.simpleChartDesc.0}}</span>
                        <code param="1">{{text.simpleChartDesc.1}}</code>
                        <a param="2" href="link">{{text.simpleChartDesc.2}}</a>
                        <a param="3" href="link2">{{text.simpleChartDesc.3}}</a>
                      </i18n-format>
                */n=0;messageId=this._generateMessageId(path,id);templateTextParams=Array.prototype.map.call(node.childNodes,function(child){var firstChild;if(child.nodeType===child.TEXT_NODE&&this._hasAnnotatedText(child.textContent)){return this._compoundAnnotationToSpan(child).map(function(_child){return{node:_child,templateNode:null,type:_child.nodeType,text:_child.nodeType===_child.TEXT_NODE?_child.textContent:null,childTextNode:_child.nodeType===_child.ELEMENT_NODE&&_child.childNodes.length>0};});}else if(child.nodeType===child.ELEMENT_NODE&&child.tagName==='TEMPLATE'){firstChild=Array.prototype.filter.call(child.content.childNodes,function(templateChild){switch(templateChild.nodeType){case templateChild.COMMENT_NODE:return false;case templateChild.TEXT_NODE:return!templateChild.textContent.match(/^\s*$/g);default:case templateChild.ELEMENT_NODE:return true;}}).shift();if(!firstChild){firstChild=Array.prototype.filter.call(child.content.childNodes,function(templateChild){switch(templateChild.nodeType){case templateChild.COMMENT_NODE:return false;default:return true;}}).shift();}if(firstChild){return[{node:firstChild,templateNode:child,type:firstChild.nodeType,text:null,childTextNode:true}];}else{return[];}}else{return[{node:child,templateNode:null,type:child.nodeType,text:child.nodeType===child.TEXT_NODE?child.textContent:null,childTextNode:child.nodeType===child.ELEMENT_NODE&&child.childNodes.length>0}];}}.bind(this)).reduce(function(prev,currentList){var current;var textContent;for(var i=0;i<currentList.length;i++){current=currentList[i];if(current.text){prev.text[0]+=current.text;}if(current.type===current.node.ELEMENT_NODE){n++;prev.text[0]+='{'+n+'}';path.push(n);this._traverseAttributes(current.node,path,bundle);path.pop();if(current.childTextNode){textContent=current.node.textContent;if(textContent.length===0){// tag without textContent
prev.text.push('<'+current.node.nodeName.toLowerCase()+'>');current.node.textContent='';}else if(textContent.match(/^\s*$/g)){// tag with whitespace textContent
prev.text.push('<'+current.node.nodeName.toLowerCase()+'>');current.node.textContent=' ';}else if(textContent.match(/^[\s]*({{.*}}|\[\[.*\]\])[\s]*$/)){// tag with annotation
prev.text.push(textContent);// textContent is untouched
}else{prev.text.push(current.node.textContent.replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' '));current.node.textContent='{{text.'+messageId+'.'+n+'}}';}}else{prev.text.push('<'+current.node.nodeName.toLowerCase()+'>');}current.node.setAttribute(paramAttribute,n.toString());prev.params.push(current.templateNode||current.node);}else if(current.type===current.node.TEXT_NODE&&current.childTextNode){// in template node
n++;prev.text[0]+='{'+n+'}';textContent=current.node.textContent;if(textContent.length===0){// template without textContent
prev.text.push('<template>');current.node.textContent='';}else if(textContent.match(/^\s*$/g)){// template with whitespace textContent
prev.text.push('<template>');current.node.textContent=' ';}else if(textContent.match(/^[\s]*({{.*}}|\[\[.*\]\])[\s]*$/)){// tag with annotation
prev.text.push(textContent);// textContent is untouched
}else{prev.text.push(textContent.replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' '));current.node.textContent='{{text.'+messageId+'.'+n+'}}';}span=document.createElement('span');span.setAttribute(paramAttribute,n.toString());current.templateNode.content.removeChild(current.node);span.appendChild(current.node);current.templateNode.content.appendChild(span);prev.params.push(current.templateNode);}}return prev;}.bind(this),{text:[''],params:['{{text.'+messageId+'.0}}']});// clear original childNodes before implicit removals by appendChild to i18n-format for ShadyDOM compatibility
node.innerHTML='';templateText=document.createElement('i18n-format');templateText.setAttribute('lang','{{effectiveLang}}');// insert i18n-format
node.appendChild(templateText);span=document.createElement('span');// span.innerText does not set an effective value in Firefox
span.textContent=templateTextParams.params.shift();templateText.appendChild(span);Array.prototype.forEach.call(templateTextParams.params,function(param){templateText.appendChild(param);});// store the text message
templateTextParams.text[0]=templateTextParams.text[0].replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' ');this._setBundleValue(bundle,messageId,templateTextParams.text);if(!id){//node.id = messageId;
//console.warn('add missing node id as ' + messageId + ' for ' + templateTextParams.text[0]);
}debuglog(messageId+' = '+templateTextParams.text);}else{// traverse childNodes
for(i=0;i<node.childNodes.length;i++){//console.log(path.join(':') + ':' + node.childNodes[i].nodeName + ':' + (i - whiteSpaceElements) + ' i = ' + i + ' whiteSpaceElements = ' + whiteSpaceElements);
if(this._traverseTemplateTree(node.childNodes[i],path,bundle,i-whiteSpaceElements)){whiteSpaceElements++;}}}}break;}break;case node.TEXT_NODE:// text node
text=node.textContent;if(text.length===0||text.match(/^\s*$/g)){// skip empty or whitespace node
isWhiteSpace=true;}else if(text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)){// skip annotation node
}else{var parent=node.parentNode;if(this._isCompoundAnnotatedText(text)){// apply i18n-format
n=0;messageId=this._generateMessageId(path,id);templateTextParams=Array.prototype.map.call([node],function(child){return this._compoundAnnotationToSpan(child).map(function(_child){return{node:_child,type:_child.nodeType,text:_child.nodeType===_child.TEXT_NODE?_child.textContent:null,childTextNode:_child.nodeType===_child.ELEMENT_NODE&&_child.childNodes.length>0};});}.bind(this)).reduce(function(prev,currentList){var current;for(var i=0;i<currentList.length;i++){current=currentList[i];if(current.text){prev.text[0]+=current.text;}if(current.type===current.node.ELEMENT_NODE){n++;prev.text[0]+='{'+n+'}';path.push(n);this._traverseAttributes(current.node,path,bundle);path.pop();/* current.childTextNode is always true since current.node is <span>{{annotation}}</span> */prev.text.push(current.node.textContent);current.node.setAttribute(paramAttribute,n.toString());prev.params.push(current.node);}}return prev;}.bind(this),{text:[''],params:['{{text.'+messageId+'.0}}']});templateText=document.createElement('i18n-format');templateText.setAttribute('lang','{{effectiveLang}}');// insert i18n-format
parent.insertBefore(templateText,node);parent.removeChild(node);span=document.createElement('span');// span.innerText does not set an effective value in Firefox
span.textContent=templateTextParams.params.shift();templateText.appendChild(span);Array.prototype.forEach.call(templateTextParams.params,function(param){templateText.appendChild(param);});// store the text message
templateTextParams.text[0]=templateTextParams.text[0].replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' ');this._setBundleValue(bundle,messageId,templateTextParams.text);debuglog(messageId+' = '+templateTextParams.text);}else{// generate message id
messageId=this._generateMessageId(path,id);// store the text message
text=text.replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' ');this._setBundleValue(bundle,messageId,text);// replace textContent with annotation
node.textContent='{{text.'+messageId+'}}';if(!id){//span.id = messageId;
//console.warn('add missing span with id as ' + messageId + ' for ' + text);
}debuglog(messageId+' = '+text);}}break;case node.DOCUMENT_NODE:case node.DOCUMENT_FRAGMENT_NODE:// traverse childNodes
for(i=0;i<node.childNodes.length;i++){//console.log(path.join(':') + ':' + node.childNodes[i].nodeName + ':' + (i - whiteSpaceElements) + ' i = ' + i + ' whiteSpaceElements = ' + whiteSpaceElements);
if(this._traverseTemplateTree(node.childNodes[i],path,bundle,i-whiteSpaceElements)){whiteSpaceElements++;}}break;default:isWhiteSpace=true;// comment node, etc.
break;}path.pop();return isWhiteSpace;},/**
   * Check if the text has compound annotation 
   * 
   * @param {string} text target text to check compound annotation
   * @return {Boolean} true if the text contains compound annotation
   */_isCompoundAnnotatedText:function(text){return!text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)&&!!text.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/);},/**
   * Check if the text has annotation 
   * 
   * @param {string} text target text to check annotation
   * @return {Boolean} true if the text contains annotation
   */_hasAnnotatedText:function(text){return!!text.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/);},/**
   * Convert compound annotations to span elements
   * 
   * @param {Text} node target text node to convert compound annotations
   * @return {Object[]} Array of Text or span elements
   */_compoundAnnotationToSpan:function(node){var result;/* istanbul ignore else: node is prechecked to contain annotation(s) */if(node.textContent.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/)){result=node.textContent.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\]|[^{}\[\]]{1,}|[{}\[\]]{1,})/g).reduce(function(prev,current){if(current.match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)){prev.push(current);prev.push('');}else{if(prev.length===0){prev.push(current);}else{prev[prev.length-1]+=current;}}return prev;}.bind(this),[]).map(function(item){var childNode;if(item.match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)){childNode=document.createElement('span');childNode.textContent=item;}else if(item){childNode=document.createTextNode(item);}else{childNode=null;}return childNode;});if(result.length>0){if(!result[result.length-1]){result.pop();// pop null node for ''
}}}else{// no compound annotation
result=[node];}return result;},/**
   * Add the value to the target default bundle with the specified message Id 
   * 
   * @param {Object} bundle Default bundle.
   * @param {string} messageId ID string of the value.
   * @param {Object} value Value of the text message. Normally a string.
   */_setBundleValue:function(bundle,messageId,value){var messageIdPath=messageId.split('.');bundle.model=bundle.model||{};if(messageIdPath.length===1){bundle[messageId]=value;}else{var cursor=bundle;for(var i=0;i<messageIdPath.length;i++){if(i<messageIdPath.length-1){cursor[messageIdPath[i]]=cursor[messageIdPath[i]]||{};cursor=cursor[messageIdPath[i]];}else{cursor[messageIdPath[i]]=value;}}}},/**
   * Generate a message ID from the specified path and id.
   * 
   * ### TODO: 
   *
   * - Shorten or optimize ids
   *
   * @param {Array} path List of ascestor elements of the current node in traversal.
   * @param {id} id Value of `id` or `text-id` attribute of the current node.
   */_generateMessageId:function(path,id){var messageId;if(!id||id.length===0){for(var i=1;i<path.length;i++){if(path[i][0]==='#'){if(path[i]!=='#document-fragment'){if(messageId&&path[i].substr(0,5)==='#text'){messageId+=':'+path[i].substr(1);}else{messageId=path[i].substr(1);}}}else{if(messageId){messageId+=':'+path[i];}else{messageId=path[i];}}}}else{messageId=id;}return messageId;},/**
   * Return the first non-null argument.
   *
   * Utility method for use in annotations.
   *
   * ### Example Usage:
   * ```
   *   <input is="iron-input" class="flex"
   *     type="search" id="query" bind-value="{{query}}"
   *     autocomplete="off"
   *     placeholder="{{or(placeholder,text.search)}}">
   * ```
   *
   * @param {*} arguments List of arguments.
   */or:function(){var result=arguments[0];var i=1;while(!result&&i<arguments.length){result=arguments[i++];}return result;},/**
   * Translate a string by a message table.
   *
   * Utility method for use in annotations.
   *
   * ### Example Usage:
   * ```
   *   <span>{{tr(status,text.statusMsgs)}}</span>
   *   <span>{{tr(errorId,text)}}</span>
   *   <template>
   *     <json-data text-id="statusMsgs">{
   *       "signed-in": "Authenticated",
   *       "signed-out": "Not Authenticated",
   *       "error": "Error in Authentication",
   *       "default": "Unknown Status in Authentication"
   *     }</json-data>
   *     <span text-id="http-404">File Not Found</span>
   *     <span text-id="http-301">Moved Permanently</span>
   *   </template>
   * ```
   *
   * Note: The second `table` parameter should always be specified in order
   * to trigger automatic updates on `this.text` mutations, i.e., updates of `this.effectiveLang`.
   *
   * @param {string} key Key of the message.
   * @param {Object} table The message table object or this.text itself if omitted
   * @return {string} Translated string, `table.default` if `table[key]` is undefined, or key string if table.default is undefined.
   */tr:function(key,table){if(table){if(typeof table==='object'){if(typeof table[key]!=='undefined'){return table[key];}else if(typeof table['default']!=='undefined'){return table['default'];}else{return key;}}else{return key;}}else{return typeof this.text==='object'&&typeof key!=='undefined'&&typeof this.text[key]!=='undefined'?this.text[key]:key;}},/**
   * Format a parameterized string.
   *
   * Utility method for use in annotations.
   *
   * ### Example Usage:
   * ```
   *   <span attr="{{i18nFormat(text.param.0,text.textparam1,text.textparam2)}}"></span>
   *   <template>
   *     <json-data text-id="param">[
   *       "String with {1} and {2} are formetted",
   *       "[[text.textparam1]]",
   *       "[[text.textparam2]]"
   *     ]</json-data>
   *     <span text-id="textparam1">Parameter 1</span>
   *     <span text-id="textparam2">Parameter 2</span>
   *   </template>
   * ```
   *
   * Note: Compound bindings in attributes are automatically converted to {{i18nFormat()}} in preprocessing.
   *
   * @param {*} arguments List of arguments.
   * @return {string} Formatted string
   */i18nFormat:function(){if(arguments.length>0){var formatted=arguments[0]||'';for(var n=1;n<arguments.length;n++){formatted=formatted.replace('{'+n+'}',arguments[n]);}}return formatted;},// Lifecycle callbacks
/**
   * Lifecycle callback at registration of the custom element.
   *
   * this._fetchStatus is initialized per registration.
   */registered:function(){if(this.is!=='i18n-dom-bind'){var template=this._template||DomModule.import(this.is,'template');if(!template){var id=this.is;template=document.querySelector('template[id='+id+']');if(!template){template=document.createElement('template');template.setAttribute('id',id);}if(template){var domModule=document.createElement('dom-module');var _noTemplateDomModule=DomModule.import(this.is);var assetpath=_noTemplateDomModule?_noTemplateDomModule.assetpath:new URL(document.baseURI).pathname;domModule.appendChild(template);domModule.setAttribute('assetpath',template.hasAttribute('basepath')?template.getAttribute('basepath'):template.hasAttribute('assetpath')?template.getAttribute('assetpath'):assetpath);domModule.register(id);this._template=template;}var bundle={model:{}};bundles[''][id]=bundle;bundles[defaultLang$1]=bundles[defaultLang$1]||{};bundles[defaultLang$1][id]=bundle;console.warn('I18nBehavior.registered: '+id+' has no template. Supplying an empty template');}this._fetchStatus=deepcopy({// per custom element
fetchingInstance:null,ajax:null,ajaxLang:null,lastLang:null,fallbackLanguageList:null,targetLang:null,lastResponse:{},rawResponses:{}});}},/**
   * Lifecycle callback on instance creation
   */created:function(){// Fix #34. [Polymer 1.4.0] _propertyEffects have to be maintained per instance
if(this.is==='i18n-dom-bind'){this._propertyEffects=deepcopy(this._propertyEffects);}else{var template=DomModule.import(this.is,'template');if(template&&template.hasAttribute('lang')){this.templateDefaultLang=template.getAttribute('lang')||'';}}// Fix #36. Emulate lang's observer since Safari 7 predefines non-configurable lang property
this.observer=new MutationObserver(this._handleLangAttributeChange.bind(this));this.observer.observe(this,{attributes:true,attributeFilter:['lang'],attributeOldValue:true});},/**
   * Lifecycle callback when the template children are ready.
   */ready:function(){if(this.is==='i18n-dom-bind'){this._onDomChangeBindThis=this._onDomChange.bind(this);this.addEventListener('dom-change',this._onDomChangeBindThis);}else{this._langChanged(this.getAttribute('lang'),undefined);// model per instance
if(this.text){this.model=deepcopy(this.text.model);}}},/**
   * attached lifecycle callback.
   */attached:function(){if(this.observeHtmlLang){this.lang=html$2.lang;// TODO: this call is redundant
this._observeHtmlLangChanged(true);}},/**
   * Handle `dom-change` event for `i18n-dom-bind`
   */_onDomChange:function(){this.removeEventListener('dom-change',this._onDomChangeBindThis);if(this.text&&this.text.model){this.model=deepcopy(this.text.model);}if(this.observeHtmlLang){this.lang=html$2.lang;this._observeHtmlLangChanged(true);}},/**
   * detached lifecycle callback
   */detached:function(){if(this.observeHtmlLang){this._observeHtmlLangChanged(false);}}};const _I18nBehavior=BehaviorsStore$1._I18nBehavior=I18nBehavior;BehaviorsStore$1.I18nBehavior=[BehaviorsStore$1._I18nBehavior];BehaviorsStore$1.I18nBehavior.push({get _template(){if(this.__template){return this.__template;}if(this instanceof HTMLElement&&(this.constructor.name||/* name is undefined in IE11 */this.constructor.toString().replace(/^function ([^ \(]*)((.*|[\n]*)*)$/,'$1'))==='PolymerGenerated'&&!this.constructor.__finalizeClass){this.constructor.__finalizeClass=this.constructor._finalizeClass;let This=this;this.constructor._finalizeClass=function _finalizeClass(){let info=this.generatedFrom;if(!this._templateLocalizable){let template=DomModule.import(info.is,'template');if(info._template){if(!template){let m=document.createElement('dom-module');m.appendChild(info._template);m.register(info.is);}this._templateLocalizable=BehaviorsStore$1._I18nBehavior._constructDefaultBundle(This.__template=info._template,info.is);}else{if(template){this._templateLocalizable=BehaviorsStore$1._I18nBehavior._constructDefaultBundle(This.__template=template,info.is);}}}return this.__finalizeClass();};}return this.__template;},set _template(value){this.__template=value;}});if(!function F(){}.name){// IE11
// Note: In IE11, changes in this.text object do not propagate automatically and require MutableDataBehavior to propagate
BehaviorsStore$1.I18nBehavior.push(MutableDataBehavior);}Object.defineProperty(BehaviorsStore$1.I18nBehavior,'0',{get:function(){var ownerDocument=document;var i18nAttrRepos=ownerDocument.querySelectorAll('i18n-attr-repo:not([processed])');var domModules=ownerDocument.querySelectorAll('dom-module[legacy]');if(domModules.length===0){domModules=ownerDocument.querySelectorAll('dom-module');if(domModules.length!==1){domModules=[];}}BehaviorsStore$1._I18nAttrRepo._created();Array.prototype.forEach.call(i18nAttrRepos,function(repo){if(!repo.hasAttribute('processed')){var customAttributes=repo.querySelector('template#custom');if(customAttributes){BehaviorsStore$1._I18nAttrRepo._traverseTemplateTree(customAttributes.content||customAttributes._content);}repo.setAttribute('processed','');}});Array.prototype.forEach.call(domModules,function(domModule){if(domModule&&domModule.id){var template=domModule.querySelector('template');if(template){BehaviorsStore$1._I18nBehavior._constructDefaultBundle(template,domModule.id);domModule.removeAttribute('legacy');}}});return BehaviorsStore$1._I18nBehavior;}});I18nBehavior=BehaviorsStore$1.I18nBehavior;var i18nBehavior={BehaviorsStore:BehaviorsStore$1,I18nControllerBehavior:I18nControllerBehavior,_I18nBehavior:_I18nBehavior,get I18nBehavior(){return I18nBehavior;}};"use strict";var fakeServerContents$1={"/commented-simple-text-element/commented-simple-text-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" outermost text at the beginning \",\n  \"h1_3\": \"outermost header 1\",\n  \"text_4\": \" outermost text in the middle \",\n  \"span_5\": \"simple text without id\",\n  \"span_6\": \"simple text without id 2\",\n  \"label-1\": \"simple text with id\",\n  \"label-2\": \"simple text with id 2\",\n  \"div_9:span\": \"simple text within div\",\n  \"div_9:span_1\": \"simple text within div 2\",\n  \"div_9:div_2:div\": \"great grandchild text within div\",\n  \"div_10:text\": \" simple text as the first element in div \",\n  \"div_10:span_1\": \"simple text within div\",\n  \"div_10:text_2\": \" simple text in the middle of div \",\n  \"div_10:span_3\": \"simple text within div 2\",\n  \"div_10:div_4:div\": \"great grandchild text within div\",\n  \"div_10:text_5\": \" simple text at the last element in div \",\n  \"toplevel-div:span\": \"simple text within div\",\n  \"toplevel-div:span_1\": \"simple text within div 2\",\n  \"third-level-div\": \"great grandchild text within div\",\n  \"second-level-div:div_1\": \"great grandchild text within div without id\",\n  \"div_12:ul:li\": \"line item without id 1\",\n  \"div_12:ul:li_1\": \"line item without id 2\",\n  \"div_12:ul:li_2\": \"line item without id 3\",\n  \"line-items:li\": \"line item with id 1\",\n  \"line-items:li_1\": \"line item with id 2\",\n  \"line-items:li_2\": \"line item with id 3\",\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"parameters\",\n    \"<i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"id\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": \" outermost text at the end \"\n}","/commented-simple-text-element/locales/commented-simple-text-element.fr.json":"{\n  \"model\": {},\n  \"text\": \" fr outermost text at the beginning \",\n  \"h1_3\": \"fr outermost header 1\",\n  \"text_4\": \" fr outermost text in the middle \",\n  \"span_5\": \"fr simple text without id\",\n  \"span_6\": \"fr simple text without id 2\",\n  \"label-1\": \"fr simple text with id\",\n  \"label-2\": \"fr simple text with id 2\",\n  \"div_9:span\": \"fr simple text within div\",\n  \"div_9:span_1\": \"fr simple text within div 2\",\n  \"div_9:div_2:div\": \"fr great grandchild text within div\",\n  \"div_10:text\": \" fr simple text as the first element in div \",\n  \"div_10:span_1\": \"fr simple text within div\",\n  \"div_10:text_2\": \" fr simple text in the middle of div \",\n  \"div_10:span_3\": \"fr simple text within div 2\",\n  \"div_10:div_4:div\": \"fr great grandchild text within div\",\n  \"div_10:text_5\": \" fr simple text at the last element in div \",\n  \"toplevel-div:span\": \"fr simple text within div\",\n  \"toplevel-div:span_1\": \"fr simple text within div 2\",\n  \"third-level-div\": \"fr great grandchild text within div\",\n  \"second-level-div:div_1\": \"fr great grandchild text within div without id\",\n  \"div_12:ul:li\": \"fr line item without id 1\",\n  \"div_12:ul:li_1\": \"fr line item without id 2\",\n  \"div_12:ul:li_2\": \"fr line item without id 3\",\n  \"line-items:li\": \"fr line item with id 1\",\n  \"line-items:li_1\": \"fr line item with id 2\",\n  \"line-items:li_2\": \"fr line item with id 3\",\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr parameters\",\n    \"fr <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr id\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": \" fr outermost text at the end \"\n}\n","/compound-binding-dom-bind.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": [\n    \" outermost text at the beginning with compound {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"h1_3\": [\n    \"outermost header 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"text_4\": [\n    \" outermost text in the middle with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_5\": [\n    \"simple text without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_6\": [\n    \"simple text without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-1\": [\n    \"simple text with id and {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-2\": [\n    \"simple text with id and {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span\": [\n    \"simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span_1\": [\n    \"simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:div_2:div\": [\n    \"great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text\": [\n    \" simple text as the first element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_1\": [\n    \"simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_2\": [\n    \" simple text in the middle of div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_3\": [\n    \"simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:div_4:div\": [\n    \"great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_5\": [\n    \" simple text at the last element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span\": [\n    \"simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span_1\": [\n    \"simple text within div 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"third-level-div\": [\n    \"great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"second-level-div:div_1\": [\n    \"great grandchild text within div without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li\": [\n    \"line item without id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_1\": [\n    \"line item without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_2\": [\n    \"line item without id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li\": [\n    \"line item with id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_1\": [\n    \"line item with id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_2\": [\n    \"line item with id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1}, {2}, and {3} is converted to {4}.\",\n    \"id\",\n    \"{{param1}}\",\n    \"{{param2}}\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": [\n    \" outermost text at the end with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ]\n}","/compound-binding-element/compound-binding-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": [\n    \" outermost text at the beginning with compound {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"h1_3\": [\n    \"outermost header 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"text_4\": [\n    \" outermost text in the middle with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_5\": [\n    \"simple text without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_6\": [\n    \"simple text without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-1\": [\n    \"simple text with id and {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-2\": [\n    \"simple text with id and {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span\": [\n    \"simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span_1\": [\n    \"simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:div_2:div\": [\n    \"great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text\": [\n    \" simple text as the first element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_1\": [\n    \"simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_2\": [\n    \" simple text in the middle of div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_3\": [\n    \"simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:div_4:div\": [\n    \"great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_5\": [\n    \" simple text at the last element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span\": [\n    \"simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span_1\": [\n    \"simple text within div 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"third-level-div\": [\n    \"great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"second-level-div:div_1\": [\n    \"great grandchild text within div without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li\": [\n    \"line item without id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_1\": [\n    \"line item without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_2\": [\n    \"line item without id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li\": [\n    \"line item with id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_1\": [\n    \"line item with id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_2\": [\n    \"line item with id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1}, {2}, and {3} is converted to {4}.\",\n    \"id\",\n    \"{{param1}}\",\n    \"{{param2}}\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": [\n    \" outermost text at the end with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ]\n}","/compound-binding-element/locales/compound-binding-element.fr.json":"{\n  \"model\": {},\n  \"text\": [\n    \" fr outermost text at the beginning with compound {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"h1_3\": [\n    \"fr outermost header 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"text_4\": [\n    \" fr outermost text in the middle with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_5\": [\n    \"fr simple text without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_6\": [\n    \"fr simple text without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-1\": [\n    \"fr simple text with id and {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-2\": [\n    \"fr simple text with id and {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span\": [\n    \"fr simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span_1\": [\n    \"fr simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:div_2:div\": [\n    \"fr great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text\": [\n    \" fr simple text as the first element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_1\": [\n    \"fr simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_2\": [\n    \" fr simple text in the middle of div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_3\": [\n    \"fr simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:div_4:div\": [\n    \"fr great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_5\": [\n    \" fr simple text at the last element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span\": [\n    \"fr simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span_1\": [\n    \"fr simple text within div 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"third-level-div\": [\n    \"fr great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"second-level-div:div_1\": [\n    \"fr great grandchild text within div without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li\": [\n    \"fr line item without id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_1\": [\n    \"fr line item without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_2\": [\n    \"fr line item without id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li\": [\n    \"fr line item with id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_1\": [\n    \"fr line item with id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_2\": [\n    \"fr line item with id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1}, {2}, and {3} is converted to {4}.\",\n    \"fr id\",\n    \"{{param1}}\",\n    \"{{param2}}\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": [\n    \" fr outermost text at the end with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ]\n}\n","/edge-case-dom-bind.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": [\n    \" name = {1} \",\n    \"{{text.name}}\"\n  ],\n  \"i18n-number_1\": \"1\",\n  \"i18n-format_2\": [\n    \"{{text.format}}\",\n    \"1\"\n  ],\n  \"i18n-format_3\": [\n    \"format\",\n    \"\"\n  ],\n  \"p_8\": [\n    \"hello {1}{2} {3} world\",\n    \"<br>\",\n    \"<span>\",\n    \"<span>\"\n  ],\n  \"p_9\": [\n    \"hello{1}world\",\n    \"<br>\"\n  ],\n  \"text_10\": \" hello \",\n  \"text_14\": \" world \"\n}","/edge-case/advanced-binding-element.json":"{\n  \"meta\": {},\n  \"model\": {\n    \"aria-attributes\": {\n      \"title\": \"tooltip text\",\n      \"aria-label\": \"aria label text\",\n      \"aria-valuetext\": \"aria value text\"\n    }\n  },\n  \"annotated-format\": [\n    \"{{tr(status,text.statusMessageFormats)}}\",\n    \"{{parameter}}\",\n    \"string parameter\"\n  ],\n  \"span_5\": [\n    \"{1} {2}\",\n    \"{{text.defaultValue}}\",\n    \"{{text.defaultValue}}\"\n  ],\n  \"statusMessages\": {\n    \"ok\": \"healthy status\",\n    \"busy\": \"busy status\",\n    \"error\": \"error status\",\n    \"default\": \"unknown status\"\n  },\n  \"defaultValue\": \"default value\",\n  \"statusMessageFormats\": {\n    \"ok\": \"healthy status\",\n    \"busy\": \"busy status with {2}\",\n    \"error\": \"error status with {1} and {2}\",\n    \"default\": \"unknown status\"\n  },\n  \"nodefault\": {\n    \"ok\": \"ok status\"\n  }\n}","/edge-case/complex-compound-binding-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"item-update2:text\": [\n    \"updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update2:text_2\": \" xxx \",\n  \"item-update2:dom-if_3:template:span:b\": \"IF CONTENT\",\n  \"item-update2:b_4\": \"abc\",\n  \"item-update2:dom-if_5:template:text\": \"IF CONTENT 2\",\n  \"item-update2:text_6\": \" hello \",\n  \"item-update:text\": [\n    \"updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update:text_2\": \" xxx \",\n  \"item-update:dom-if_3:template:b\": \"IF CONTENT\",\n  \"item-update:b_4\": \"abc\",\n  \"item-update:dom-if_5:template:text\": \"IF CONTENT 2\",\n  \"item-update:text_6\": \" hello \",\n  \"item-update3:text\": [\n    \"updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update3:text_2\": \" xxx \",\n  \"item-update3:dom-if_3:template:b\": \"IF\",\n  \"item-update3:dom-if_3:template:b_1\": \"CONTENT\",\n  \"item-update3:b_4\": \"abc\",\n  \"item-update3:dom-if_5:template:text\": \"IF CONTENT 2\",\n  \"item-update3:text_6\": \" hello \",\n  \"item-update4:text\": [\n    \"updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update4:dom-repeat_1:template:text\": [\n    \" {1} = {2} \",\n    \"{{item.name}}\",\n    \"{{text.updated}}\"\n  ],\n  \"item-update4:text_2\": \" xxx \",\n  \"item-update4:dom-if_3:template:b\": \"IF CONTENT\",\n  \"item-update4:b_4\": \"abc\",\n  \"item-update4:dom-if_5:template:text\": \"IF CONTENT 2\",\n  \"item-update4:text_6\": \" hello \",\n  \"paragraph:text\": \"A paragraph with \",\n  \"paragraph:text_2\": \" is converted to \",\n  \"paragraph:code_3\": \"<i18n-format>\",\n  \"paragraph:text_4\": \". \",\n  \"paragraph2:text\": \"A paragraph with deep \",\n  \"paragraph2:text_2\": \" is \",\n  \"paragraph2:b_3\": \"not\",\n  \"paragraph2:text_4\": \" converted to \",\n  \"paragraph2:code_5\": \"<i18n-format>\",\n  \"paragraph2:text_6\": \". \",\n  \"authors\": [\n    {\n      \"name\": \"Joe\"\n    },\n    {\n      \"name\": \"Alice\"\n    }\n  ],\n  \"updated\": \"Jan 1st, 2016\",\n  \"parameters\": [\n    \"parameter 1\",\n    \"parameter 2\"\n  ]\n}","/edge-case/empty-element.json":"{}","/edge-case/locales/advanced-binding-element.fr.json":"{\n  \"meta\": {},\n  \"model\": {\n    \"aria-attributes\": {\n      \"title\": \"fr tooltip text\",\n      \"aria-label\": \"fr aria label text\",\n      \"aria-valuetext\": \"fr aria value text\"\n    }\n  },\n  \"annotated-format\": [\n    \"{{tr(status,text.statusMessageFormats)}}\",\n    \"{{parameter}}\",\n    \"fr string parameter\"\n  ],\n  \"span_5\": [\n    \"fr {1} {2}\",\n    \"{{text.defaultValue}}\",\n    \"{{text.defaultValue}}\"\n  ],\n  \"statusMessages\": {\n    \"ok\": \"fr healthy status\",\n    \"busy\": \"fr busy status\",\n    \"error\": \"fr error status\",\n    \"default\": \"fr unknown status\"\n  },\n  \"defaultValue\": \"fr default value\",\n  \"statusMessageFormats\": {\n    \"ok\": \"fr healthy status\",\n    \"busy\": \"fr busy status with {2}\",\n    \"error\": \"fr error status with {1} and {2}\",\n    \"default\": \"fr unknown status\"\n  },\n  \"nodefault\": {\n    \"ok\": \"fr ok status\"\n  }\n}","/edge-case/locales/complex-compound-binding-element.fr.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"item-update2:text\": [\n    \"fr updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update2:text_2\": \" fr xxx \",\n  \"item-update2:dom-if_3:template:span:b\": \"fr IF CONTENT\",\n  \"item-update2:b_4\": \"fr abc\",\n  \"item-update2:dom-if_5:template:text\": \"fr IF CONTENT 2\",\n  \"item-update2:text_6\": \" fr hello \",\n  \"item-update:text\": [\n    \"fr updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update:text_2\": \" fr xxx \",\n  \"item-update:dom-if_3:template:b\": \"fr IF CONTENT\",\n  \"item-update:b_4\": \"fr abc\",\n  \"item-update:dom-if_5:template:text\": \"fr IF CONTENT 2\",\n  \"item-update:text_6\": \" fr hello \",\n  \"item-update3:text\": [\n    \"fr updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update3:text_2\": \" fr xxx \",\n  \"item-update3:dom-if_3:template:b\": \"fr IF\",\n  \"item-update3:dom-if_3:template:b_1\": \"fr CONTENT\",\n  \"item-update3:b_4\": \"fr abc\",\n  \"item-update3:dom-if_5:template:text\": \"fr IF CONTENT 2\",\n  \"item-update3:text_6\": \" fr hello \",\n  \"item-update4:text\": [\n    \"fr updated: {1}, by: \",\n    \"{{text.updated}}\"\n  ],\n  \"item-update4:dom-repeat_1:template:text\": [\n    \" fr {1} = {2} \",\n    \"{{item.name}}\",\n    \"{{text.updated}}\"\n  ],\n  \"item-update4:text_2\": \" fr xxx \",\n  \"item-update4:dom-if_3:template:b\": \"fr IF CONTENT\",\n  \"item-update4:b_4\": \"fr abc\",\n  \"item-update4:dom-if_5:template:text\": \"fr IF CONTENT 2\",\n  \"item-update4:text_6\": \" fr hello \",\n  \"paragraph:text\": \"fr A paragraph with \",\n  \"paragraph:text_2\": \" fr is converted to \",\n  \"paragraph:code_3\": \"fr <i18n-format>\",\n  \"paragraph:text_4\": \"fr . \",\n  \"paragraph2:text\": \"fr A paragraph with deep \",\n  \"paragraph2:text_2\": \" fr is \",\n  \"paragraph2:b_3\": \"fr not\",\n  \"paragraph2:text_4\": \" fr converted to \",\n  \"paragraph2:code_5\": \"fr <i18n-format>\",\n  \"paragraph2:text_6\": \"fr . \",\n  \"authors\": [\n    {\n      \"name\": \"fr Joe\"\n    },\n    {\n      \"name\": \"fr Alice\"\n    }\n  ],\n  \"updated\": \"fr Jan 1st, 2016\",\n  \"parameters\": [\n    \"fr parameter 1\",\n    \"fr parameter 2\"\n  ]\n}","/edge-case/locales/empty-element.fr.json":"{}","/fallback-text-element/fallback-text-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" outermost text at the beginning \",\n  \"h1_3\": \"outermost header 1\",\n  \"text_4\": \" outermost text in the middle \",\n  \"span_5\": \"simple text without id\",\n  \"span_6\": \"simple text without id 2\",\n  \"label-1\": \"simple text with id\",\n  \"label-2\": \"simple text with id 2\",\n  \"div_9:span\": \"simple text within div\",\n  \"div_9:span_1\": \"simple text within div 2\",\n  \"div_9:div_2:div\": \"great grandchild text within div\",\n  \"div_10:text\": \" simple text as the first element in div \",\n  \"div_10:span_1\": \"simple text within div\",\n  \"div_10:text_2\": \" simple text in the middle of div \",\n  \"div_10:span_3\": \"simple text within div 2\",\n  \"div_10:div_4:div\": \"great grandchild text within div\",\n  \"div_10:text_5\": \" simple text at the last element in div \",\n  \"toplevel-div:span\": \"simple text within div\",\n  \"toplevel-div:span_1\": \"simple text within div 2\",\n  \"third-level-div\": \"great grandchild text within div\",\n  \"second-level-div:div_1\": \"great grandchild text within div without id\",\n  \"div_12:ul:li\": \"line item without id 1\",\n  \"div_12:ul:li_1\": \"line item without id 2\",\n  \"div_12:ul:li_2\": \"line item without id 3\",\n  \"line-items:li\": \"line item with id 1\",\n  \"line-items:li_1\": \"line item with id 2\",\n  \"line-items:li_2\": \"line item with id 3\",\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"parameters\",\n    \"<i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"id\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": \" outermost text at the end \"\n}","/fallback-text-element/locales/fallback-text-element.fr-CA.json":"{\n  \"model\": {},\n  \"text\": \"fr-CA  outermost text at the beginning \",\n  \"h1_3\": \"fr-CA outermost header 1\",\n  \"text_4\": \"fr-CA  outermost text in the middle \",\n  \"span_5\": \"fr-CA simple text without id\",\n  \"span_6\": \"fr-CA simple text without id 2\",\n  \"label-1\": \"fr-CA simple text with id\",\n  \"label-2\": \"fr-CA simple text with id 2\",\n  \"div_10:span_1\": \"fr-CA simple text within div\",\n  \"toplevel-div:span\": \"fr-CA simple text within div\",\n  \"toplevel-div:span_1\": \"fr-CA simple text within div 2\",\n  \"third-level-div\": \"fr-CA great grandchild text within div\",\n  \"second-level-div:div_1\": \"fr-CA great grandchild text within div without id\",\n  \"p_13\": [\n    \"fr-CA A paragraph with {1} is converted to {2}.\",\n    \"fr-CA parameters\",\n    \"fr-CA <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"fr-CA A paragraph with {1} is converted to {2}.\",\n    \"fr-CA id\",\n    \"fr-CA <i18n-format>\"\n  ],\n  \"text_15\": \"fr-CA  outermost text at the end \"\n}\n","/fallback-text-element/locales/fallback-text-element.fr.json":"{\n  \"model\": {},\n  \"text\": \"fr  outermost text at the beginning \",\n  \"h1_3\": \"fr outermost header 1\",\n  \"text_4\": \"fr  outermost text in the middle \",\n  \"span_5\": \"fr simple text without id\",\n  \"span_6\": \"fr simple text without id 2\",\n  \"label-1\": \"fr simple text with id\",\n  \"label-2\": \"fr simple text with id 2\",\n  \"toplevel-div:span\": \"fr simple text within div\",\n  \"toplevel-div:span_1\": \"fr simple text within div 2\",\n  \"third-level-div\": \"fr great grandchild text within div\",\n  \"second-level-div:div_1\": \"fr great grandchild text within div without id\",\n  \"div_12:ul:li\": \"fr line item without id 1\",\n  \"div_12:ul:li_1\": \"fr line item without id 2\",\n  \"div_12:ul:li_2\": \"fr line item without id 3\",\n  \"line-items:li\": \"fr line item with id 1\",\n  \"line-items:li_1\": \"fr line item with id 2\",\n  \"line-items:li_2\": \"fr line item with id 3\",\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr parameters\",\n    \"fr <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr id\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": \"fr  outermost text at the end \"\n}\n","/locales/compound-binding-dom-bind.fr.json":"{\n  \"model\": {},\n  \"text\": [\n    \" fr outermost text at the beginning with compound {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"h1_3\": [\n    \"fr outermost header 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"text_4\": [\n    \" fr outermost text in the middle with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_5\": [\n    \"fr simple text without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"span_6\": [\n    \"fr simple text without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-1\": [\n    \"fr simple text with id and {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"label-2\": [\n    \"fr simple text with id and {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span\": [\n    \"fr simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:span_1\": [\n    \"fr simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_9:div_2:div\": [\n    \"fr great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text\": [\n    \" fr simple text as the first element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_1\": [\n    \"fr simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_2\": [\n    \" fr simple text in the middle of div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:span_3\": [\n    \"fr simple text within div with {1} and {2} variables 2\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:div_4:div\": [\n    \"fr great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_10:text_5\": [\n    \" fr simple text at the last element in div with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span\": [\n    \"fr simple text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"toplevel-div:span_1\": [\n    \"fr simple text within div 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"third-level-div\": [\n    \"fr great grandchild text within div with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"second-level-div:div_1\": [\n    \"fr great grandchild text within div without id with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li\": [\n    \"fr line item without id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_1\": [\n    \"fr line item without id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"div_12:ul:li_2\": [\n    \"fr line item without id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li\": [\n    \"fr line item with id 1 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_1\": [\n    \"fr line item with id 2 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"line-items:li_2\": [\n    \"fr line item with id 3 with {1} and {2} variables\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1}, {2}, and {3} is converted to {4}.\",\n    \"fr id\",\n    \"{{param1}}\",\n    \"{{param2}}\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": [\n    \" fr outermost text at the end with {1} and {2} variables \",\n    \"{{param1}}\",\n    \"{{param2}}\"\n  ]\n}\n","/locales/simple-attribute-dom-bind.fr.json":"{\n  \"model\": {\n    \"standard-input\": {\n      \"placeholder\": \"fr standard HTML5 attribute\"\n    },\n    \"outer-div:input_2\": {\n      \"placeholder\": \"fr standard HTML5 attribute without id\"\n    },\n    \"paper-input-element\": {\n      \"label\": \"fr paper-input label\",\n      \"error-message\": \"fr paper-input error message\",\n      \"placeholder\": \"fr paper-input placeholder\"\n    },\n    \"outer-div:paper-input_4\": {\n      \"label\": \"fr paper-input label without id\",\n      \"error-message\": \"fr paper-input error message without id\",\n      \"placeholder\": \"fr paper-input placeholder without id\"\n    },\n    \"pie-chart\": {\n      \"options\": {\n        \"title\": \"fr Distribution of days in 2001H1\"\n      },\n      \"cols\": [\n        {\n          \"label\": \"fr Month\",\n          \"type\": \"string\"\n        },\n        {\n          \"label\": \"fr Days\",\n          \"type\": \"number\"\n        }\n      ],\n      \"rows\": [\n        [\n          \"fr Jan\",\n          31\n        ],\n        [\n          \"fr Feb\",\n          28\n        ],\n        [\n          \"fr Mar\",\n          31\n        ],\n        [\n          \"fr Apr\",\n          30\n        ],\n        [\n          \"fr May\",\n          31\n        ],\n        [\n          \"fr Jun\",\n          30\n        ]\n      ]\n    },\n    \"column-chart\": {\n      \"options\": {\n        \"title\": \"fr Inventory\"\n      },\n      \"data\": [\n        [\n          \"fr Year\",\n          \"fr Things\",\n          \"fr Stuff\"\n        ],\n        [\n          \"2004\",\n          1000,\n          400\n        ],\n        [\n          \"2005\",\n          1170,\n          460\n        ],\n        [\n          \"2006\",\n          660,\n          1120\n        ],\n        [\n          \"2007\",\n          1030,\n          540\n        ]\n      ]\n    },\n    \"custom-attr\": {\n      \"custom-text-attr1\": \"fr custom text attribute 1\",\n      \"custom-text-attr2\": \"fr custom text attribute 2\",\n      \"custom-text-attr3\": \"fr custom text attribute 3\"\n    },\n    \"selective-attr\": {\n      \"custom-text-attr4\": [\n        \"fr {1} custom-text-attr4 attribute with param {2} and param {3} {4}\",\n        \"{{text.ordinary-div}}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\",\n        \"{{text.ordinary-div}}\"\n      ],\n      \"custom-text-attr5\": [\n        \"[[text.ordinary-div]]\",\n        \" fr custom-text-attr5 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" fr and param \",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target\": [\n        \"fr i18n-target attribute with param {1} and param {2}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target2\": [\n        \"fr i18n-target2 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" fr and param \",\n        \"[[text.ordinary-div]]\"\n      ]\n    },\n    \"selective-attr2\": {\n      \"i18n-target\": \"fr i18n-target attribute 2\"\n    },\n    \"selective-attr3\": {\n      \"i18n-target6\": \"fr i18n-target6 attribute 2\"\n    },\n    \"selective-attr4\": {\n      \"i18n-target6\": \"fr i18n-target6 attribute 3\"\n    },\n    \"json-data-id\": {\n      \"attr1\": \"fr this attr1 is extracted\",\n      \"i18n-target-attr\": \"fr this attribute is also extracted\"\n    },\n    \"template_2:json-data_1\": {\n      \"attr1\": \"fr this attr1 without id is extracted\",\n      \"i18n-target-attr\": \"fr this attribute without id is also extracted\"\n    }\n  },\n  \"ordinary-div\": \"fr text 1\"\n}\n","/locales/simple-text-dom-bind.fr.json":"{\n  \"model\": {},\n  \"text\": \" fr outermost text at the beginning \",\n  \"h1_3\": \"fr outermost header 1\",\n  \"text_4\": \" fr outermost text in the middle \",\n  \"span_5\": \"fr simple text without id\",\n  \"span_6\": \"fr simple text without id 2\",\n  \"label-1\": \"fr simple text with id\",\n  \"label-2\": \"fr simple text with id 2\",\n  \"div_9:span\": \"fr simple text within div\",\n  \"div_9:span_1\": \"fr simple text within div 2\",\n  \"div_9:div_2:div\": \"fr great grandchild text within div\",\n  \"div_10:text\": \" fr simple text as the first element in div \",\n  \"div_10:span_1\": \"fr simple text within div\",\n  \"div_10:text_2\": \" fr simple text in the middle of div \",\n  \"div_10:span_3\": \"fr simple text within div 2\",\n  \"div_10:div_4:div\": \"fr great grandchild text within div\",\n  \"div_10:text_5\": \" fr simple text at the last element in div \",\n  \"toplevel-div:span\": \"fr simple text within div\",\n  \"toplevel-div:span_1\": \"fr simple text within div 2\",\n  \"third-level-div\": \"fr great grandchild text within div\",\n  \"second-level-div:div_1\": \"fr great grandchild text within div without id\",\n  \"div_12:ul:li\": \"fr line item without id 1\",\n  \"div_12:ul:li_1\": \"fr line item without id 2\",\n  \"div_12:ul:li_2\": \"fr line item without id 3\",\n  \"line-items:li\": \"fr line item with id 1\",\n  \"line-items:li_1\": \"fr line item with id 2\",\n  \"line-items:li_2\": \"fr line item with id 3\",\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr parameters\",\n    \"fr <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr id\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": \" fr outermost text at the end \"\n}\n","/multiple-case/item-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"label\": \"A\"\n}","/multiple-case/locales/item-element.fr.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"label\": \"fr A\"\n}","/multiple-case/locales/multiple-element.fr.json":"{\n  \"meta\": {},\n  \"model\": {}\n}","/multiple-case/multiple-element.json":"{\n  \"meta\": {},\n  \"model\": {}\n}","/plural-gender-element/locales/plural-gender-element.fr.json":"{\n  \"model\": {},\n  \"compound-format-text\": [\n    {\n      \"0\": \"fr You ({3}) gave no gifts.\",\n      \"1\": {\n        \"male\": \"fr You ({3}) gave him ({4}) {5}.\",\n        \"female\": \"fr You ({3}) gave her ({4}) {5}.\",\n        \"other\": \"fr You ({3}) gave them ({4}) {5}.\"\n      },\n      \"one\": {\n        \"male\": \"fr You ({3}) gave him ({4}) and one other person {5}.\",\n        \"female\": \"fr You ({3}) gave her ({4}) and one other person {5}.\",\n        \"other\": \"fr You ({3}) gave them ({4}) and one other person {5}.\"\n      },\n      \"other\": \"fr You ({3}) gave them ({4}) and {1} other people gifts.\"\n    },\n    \"{{recipients.length - 1}}\",\n    \"{{recipients.0.gender}}\",\n    \"{{sender.name}}\",\n    \"{{recipients.0.name}}\",\n    \"fr a gift\"\n  ]\n}\n","/plural-gender-element/plural-gender-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"compound-format-text\": [\n    {\n      \"0\": \"You ({3}) gave no gifts.\",\n      \"1\": {\n        \"male\": \"You ({3}) gave him ({4}) {5}.\",\n        \"female\": \"You ({3}) gave her ({4}) {5}.\",\n        \"other\": \"You ({3}) gave them ({4}) {5}.\"\n      },\n      \"one\": {\n        \"male\": \"You ({3}) gave him ({4}) and one other person {5}.\",\n        \"female\": \"You ({3}) gave her ({4}) and one other person {5}.\",\n        \"other\": \"You ({3}) gave them ({4}) and one other person {5}.\"\n      },\n      \"other\": \"You ({3}) gave them ({4}) and {1} other people gifts.\"\n    },\n    \"{{recipients.length - 1}}\",\n    \"{{recipients.0.gender}}\",\n    \"{{sender.name}}\",\n    \"{{recipients.0.name}}\",\n    \"a gift\"\n  ]\n}","/preference/preference-element.json":"{\n  \"meta\": {},\n  \"model\": {}\n}","/simple-attribute-dom-bind.json":"{\n  \"meta\": {},\n  \"model\": {\n    \"standard-input\": {\n      \"placeholder\": \"standard HTML5 attribute\"\n    },\n    \"outer-div:input_2\": {\n      \"placeholder\": \"standard HTML5 attribute without id\"\n    },\n    \"paper-input-element\": {\n      \"label\": \"paper-input label\",\n      \"error-message\": \"paper-input error message\",\n      \"placeholder\": \"paper-input placeholder\"\n    },\n    \"outer-div:paper-input_4\": {\n      \"label\": \"paper-input label without id\",\n      \"error-message\": \"paper-input error message without id\",\n      \"placeholder\": \"paper-input placeholder without id\"\n    },\n    \"pie-chart\": {\n      \"options\": {\n        \"title\": \"Distribution of days in 2001H1\"\n      },\n      \"cols\": [\n        {\n          \"label\": \"Month\",\n          \"type\": \"string\"\n        },\n        {\n          \"label\": \"Days\",\n          \"type\": \"number\"\n        }\n      ],\n      \"rows\": [\n        [\n          \"Jan\",\n          31\n        ],\n        [\n          \"Feb\",\n          28\n        ],\n        [\n          \"Mar\",\n          31\n        ],\n        [\n          \"Apr\",\n          30\n        ],\n        [\n          \"May\",\n          31\n        ],\n        [\n          \"Jun\",\n          30\n        ]\n      ]\n    },\n    \"column-chart\": {\n      \"options\": {\n        \"title\": \"Inventory\"\n      },\n      \"data\": [\n        [\n          \"Year\",\n          \"Things\",\n          \"Stuff\"\n        ],\n        [\n          \"2004\",\n          1000,\n          400\n        ],\n        [\n          \"2005\",\n          1170,\n          460\n        ],\n        [\n          \"2006\",\n          660,\n          1120\n        ],\n        [\n          \"2007\",\n          1030,\n          540\n        ]\n      ]\n    },\n    \"custom-attr\": {\n      \"custom-text-attr1\": \"custom text attribute 1\",\n      \"custom-text-attr2\": \"custom text attribute 2\",\n      \"custom-text-attr3\": \"custom text attribute 3\"\n    },\n    \"selective-attr\": {\n      \"custom-text-attr4\": [\n        \"{1} custom-text-attr4 attribute with param {2} and param {3} {4}\",\n        \"{{text.ordinary-div}}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\",\n        \"{{text.ordinary-div}}\"\n      ],\n      \"custom-text-attr5\": [\n        \"[[text.ordinary-div]]\",\n        \" custom-text-attr5 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" and param \",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target\": [\n        \"i18n-target attribute with param {1} and param {2}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target2\": [\n        \"i18n-target2 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" and param \",\n        \"[[text.ordinary-div]]\"\n      ]\n    },\n    \"selective-attr2\": {\n      \"i18n-target\": \"i18n-target attribute 2\"\n    },\n    \"selective-attr3\": {\n      \"i18n-target6\": \"i18n-target6 attribute 2\"\n    },\n    \"selective-attr4\": {\n      \"i18n-target6\": \"i18n-target6 attribute 3\"\n    },\n    \"json-data-id\": {\n      \"attr1\": \"this attr1 is extracted\",\n      \"i18n-target-attr\": \"this attribute is also extracted\"\n    },\n    \"template_2:json-data_1\": {\n      \"attr1\": \"this attr1 without id is extracted\",\n      \"i18n-target-attr\": \"this attribute without id is also extracted\"\n    }\n  },\n  \"ordinary-div\": \"text 1\"\n}","/simple-attribute-element/locales/simple-attribute-element.fr.json":"{\n  \"model\": {\n    \"standard-input\": {\n      \"placeholder\": \"fr standard HTML5 attribute\"\n    },\n    \"outer-div:input_2\": {\n      \"placeholder\": \"fr standard HTML5 attribute without id\"\n    },\n    \"paper-input-element\": {\n      \"label\": \"fr paper-input label\",\n      \"error-message\": \"fr paper-input error message\",\n      \"placeholder\": \"fr paper-input placeholder\"\n    },\n    \"outer-div:paper-input_4\": {\n      \"label\": \"fr paper-input label without id\",\n      \"error-message\": \"fr paper-input error message without id\",\n      \"placeholder\": \"fr paper-input placeholder without id\"\n    },\n    \"pie-chart\": {\n      \"options\": {\n        \"title\": \"fr Distribution of days in 2001H1\"\n      },\n      \"cols\": [\n        {\n          \"label\": \"fr Month\",\n          \"type\": \"string\"\n        },\n        {\n          \"label\": \"fr Days\",\n          \"type\": \"number\"\n        }\n      ],\n      \"rows\": [\n        [\n          \"fr Jan\",\n          31\n        ],\n        [\n          \"fr Feb\",\n          28\n        ],\n        [\n          \"fr Mar\",\n          31\n        ],\n        [\n          \"fr Apr\",\n          30\n        ],\n        [\n          \"fr May\",\n          31\n        ],\n        [\n          \"fr Jun\",\n          30\n        ]\n      ]\n    },\n    \"column-chart\": {\n      \"options\": {\n        \"title\": \"fr Inventory\"\n      },\n      \"data\": [\n        [\n          \"fr Year\",\n          \"fr Things\",\n          \"fr Stuff\"\n        ],\n        [\n          \"2004\",\n          1000,\n          400\n        ],\n        [\n          \"2005\",\n          1170,\n          460\n        ],\n        [\n          \"2006\",\n          660,\n          1120\n        ],\n        [\n          \"2007\",\n          1030,\n          540\n        ]\n      ]\n    },\n    \"custom-attr\": {\n      \"custom-text-attr1\": \"fr custom text attribute 1\",\n      \"custom-text-attr2\": \"fr custom text attribute 2\",\n      \"custom-text-attr3\": \"fr custom text attribute 3\"\n    },\n    \"selective-attr\": {\n      \"custom-text-attr4\": [\n        \"fr {1} custom-text-attr4 attribute with param {2} and param {3} {4}\",\n        \"{{text.ordinary-div}}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\",\n        \"{{text.ordinary-div}}\"\n      ],\n      \"custom-text-attr5\": [\n        \"[[text.ordinary-div]]\",\n        \" fr custom-text-attr5 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" fr and param \",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target\": [\n        \"fr i18n-target attribute with param {1} and param {2}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target2\": [\n        \"fr i18n-target2 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" fr and param \",\n        \"[[text.ordinary-div]]\"\n      ]\n    },\n    \"selective-attr2\": {\n      \"i18n-target\": \"fr i18n-target attribute 2\"\n    },\n    \"selective-attr3\": {\n      \"i18n-target6\": \"fr i18n-target6 attribute 2\"\n    },\n    \"selective-attr4\": {\n      \"i18n-target6\": \"fr i18n-target6 attribute 3\"\n    },\n    \"json-data-id\": {\n      \"attr1\": \"fr this attr1 is extracted\",\n      \"i18n-target-attr\": \"fr this attribute is also extracted\"\n    },\n    \"template_2:json-data_1\": {\n      \"attr1\": \"fr this attr1 without id is extracted\",\n      \"i18n-target-attr\": \"fr this attribute without id is also extracted\"\n    }\n  },\n  \"ordinary-div\": \"fr text 1\"\n}\n","/simple-attribute-element/locales/text-attribute-element.fr.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"span_4\": \"fr text\"\n}\n","/simple-attribute-element/simple-attribute-element.json":"{\n  \"meta\": {},\n  \"model\": {\n    \"standard-input\": {\n      \"placeholder\": \"standard HTML5 attribute\"\n    },\n    \"outer-div:input_2\": {\n      \"placeholder\": \"standard HTML5 attribute without id\"\n    },\n    \"paper-input-element\": {\n      \"label\": \"paper-input label\",\n      \"error-message\": \"paper-input error message\",\n      \"placeholder\": \"paper-input placeholder\"\n    },\n    \"outer-div:paper-input_4\": {\n      \"label\": \"paper-input label without id\",\n      \"error-message\": \"paper-input error message without id\",\n      \"placeholder\": \"paper-input placeholder without id\"\n    },\n    \"pie-chart\": {\n      \"options\": {\n        \"title\": \"Distribution of days in 2001H1\"\n      },\n      \"cols\": [\n        {\n          \"label\": \"Month\",\n          \"type\": \"string\"\n        },\n        {\n          \"label\": \"Days\",\n          \"type\": \"number\"\n        }\n      ],\n      \"rows\": [\n        [\n          \"Jan\",\n          31\n        ],\n        [\n          \"Feb\",\n          28\n        ],\n        [\n          \"Mar\",\n          31\n        ],\n        [\n          \"Apr\",\n          30\n        ],\n        [\n          \"May\",\n          31\n        ],\n        [\n          \"Jun\",\n          30\n        ]\n      ]\n    },\n    \"column-chart\": {\n      \"options\": {\n        \"title\": \"Inventory\"\n      },\n      \"data\": [\n        [\n          \"Year\",\n          \"Things\",\n          \"Stuff\"\n        ],\n        [\n          \"2004\",\n          1000,\n          400\n        ],\n        [\n          \"2005\",\n          1170,\n          460\n        ],\n        [\n          \"2006\",\n          660,\n          1120\n        ],\n        [\n          \"2007\",\n          1030,\n          540\n        ]\n      ]\n    },\n    \"custom-attr\": {\n      \"custom-text-attr1\": \"custom text attribute 1\",\n      \"custom-text-attr2\": \"custom text attribute 2\",\n      \"custom-text-attr3\": \"custom text attribute 3\"\n    },\n    \"selective-attr\": {\n      \"custom-text-attr4\": [\n        \"{1} custom-text-attr4 attribute with param {2} and param {3} {4}\",\n        \"{{text.ordinary-div}}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\",\n        \"{{text.ordinary-div}}\"\n      ],\n      \"custom-text-attr5\": [\n        \"[[text.ordinary-div]]\",\n        \" custom-text-attr5 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" and param \",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target\": [\n        \"i18n-target attribute with param {1} and param {2}\",\n        \"{{text.ordinary-div}}\",\n        \"[[text.ordinary-div]]\"\n      ],\n      \"i18n-target2\": [\n        \"i18n-target2 attribute with param \",\n        \"{{or('',text.ordinary-div)}}\",\n        \" and param \",\n        \"[[text.ordinary-div]]\"\n      ]\n    },\n    \"selective-attr2\": {\n      \"i18n-target\": \"i18n-target attribute 2\"\n    },\n    \"selective-attr3\": {\n      \"i18n-target6\": \"i18n-target6 attribute 2\"\n    },\n    \"selective-attr4\": {\n      \"i18n-target6\": \"i18n-target6 attribute 3\"\n    },\n    \"json-data-id\": {\n      \"attr1\": \"this attr1 is extracted\",\n      \"i18n-target-attr\": \"this attribute is also extracted\"\n    },\n    \"template_2:json-data_1\": {\n      \"attr1\": \"this attr1 without id is extracted\",\n      \"i18n-target-attr\": \"this attribute without id is also extracted\"\n    }\n  },\n  \"ordinary-div\": \"text 1\"\n}","/simple-attribute-element/text-attribute-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"span_4\": \"text\"\n}","/simple-text-dom-bind.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" outermost text at the beginning \",\n  \"h1_3\": \"outermost header 1\",\n  \"text_4\": \" outermost text in the middle \",\n  \"span_5\": \"simple text without id\",\n  \"span_6\": \"simple text without id 2\",\n  \"label-1\": \"simple text with id\",\n  \"label-2\": \"simple text with id 2\",\n  \"div_9:span\": \"simple text within div\",\n  \"div_9:span_1\": \"simple text within div 2\",\n  \"div_9:div_2:div\": \"great grandchild text within div\",\n  \"div_10:text\": \" simple text as the first element in div \",\n  \"div_10:span_1\": \"simple text within div\",\n  \"div_10:text_2\": \" simple text in the middle of div \",\n  \"div_10:span_3\": \"simple text within div 2\",\n  \"div_10:div_4:div\": \"great grandchild text within div\",\n  \"div_10:text_5\": \" simple text at the last element in div \",\n  \"toplevel-div:span\": \"simple text within div\",\n  \"toplevel-div:span_1\": \"simple text within div 2\",\n  \"third-level-div\": \"great grandchild text within div\",\n  \"second-level-div:div_1\": \"great grandchild text within div without id\",\n  \"div_12:ul:li\": \"line item without id 1\",\n  \"div_12:ul:li_1\": \"line item without id 2\",\n  \"div_12:ul:li_2\": \"line item without id 3\",\n  \"line-items:li\": \"line item with id 1\",\n  \"line-items:li_1\": \"line item with id 2\",\n  \"line-items:li_2\": \"line item with id 3\",\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"parameters\",\n    \"<i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"id\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": \" outermost text at the end \"\n}","/simple-text-element/locales/simple-text-element.fr.json":"{\n  \"model\": {},\n  \"text\": \" fr outermost text at the beginning \",\n  \"h1_3\": \"fr outermost header 1\",\n  \"text_4\": \" fr outermost text in the middle \",\n  \"span_5\": \"fr simple text without id\",\n  \"span_6\": \"fr simple text without id 2\",\n  \"label-1\": \"fr simple text with id\",\n  \"label-2\": \"fr simple text with id 2\",\n  \"div_9:span\": \"fr simple text within div\",\n  \"div_9:span_1\": \"fr simple text within div 2\",\n  \"div_9:div_2:div\": \"fr great grandchild text within div\",\n  \"div_10:text\": \" fr simple text as the first element in div \",\n  \"div_10:span_1\": \"fr simple text within div\",\n  \"div_10:text_2\": \" fr simple text in the middle of div \",\n  \"div_10:span_3\": \"fr simple text within div 2\",\n  \"div_10:div_4:div\": \"fr great grandchild text within div\",\n  \"div_10:text_5\": \" fr simple text at the last element in div \",\n  \"toplevel-div:span\": \"fr simple text within div\",\n  \"toplevel-div:span_1\": \"fr simple text within div 2\",\n  \"third-level-div\": \"fr great grandchild text within div\",\n  \"second-level-div:div_1\": \"fr great grandchild text within div without id\",\n  \"div_12:ul:li\": \"fr line item without id 1\",\n  \"div_12:ul:li_1\": \"fr line item without id 2\",\n  \"div_12:ul:li_2\": \"fr line item without id 3\",\n  \"line-items:li\": \"fr line item with id 1\",\n  \"line-items:li_1\": \"fr line item with id 2\",\n  \"line-items:li_2\": \"fr line item with id 3\",\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr parameters\",\n    \"fr <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr id\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": \" fr outermost text at the end \"\n}\n","/simple-text-element/locales/simple-text-element.ru.json":"{\n  \"model\": {},\n  \"text\": \" ru outermost text at the beginning \",\n  \"h1_3\": \"ru outermost header 1\",\n  \"text_4\": \" ru outermost text in the middle \",\n  \"span_5\": \"ru simple text without id\",\n  \"span_6\": \"ru simple text without id 2\",\n  \"label-1\": \"ru simple text with id\",\n  \"label-2\": \"ru simple text with id 2\",\n  \"div_9:span\": \"ru simple text within div\",\n  \"div_9:span_1\": \"ru simple text within div 2\",\n  \"div_9:div_2:div\": \"ru great grandchild text within div\",\n  \"div_10:text\": \" ru simple text as the first element in div \",\n  \"div_10:span_1\": \"ru simple text within div\",\n  \"div_10:text_2\": \" ru simple text in the middle of div \",\n  \"div_10:span_3\": \"ru simple text within div 2\",\n  \"div_10:div_4:div\": \"ru great grandchild text within div\",\n  \"div_10:text_5\": \" ru simple text at the last element in div \",\n  \"toplevel-div:span\": \"ru simple text within div\",\n  \"toplevel-div:span_1\": \"ru simple text within div 2\",\n  \"third-level-div\": \"ru great grandchild text within div\",\n  \"second-level-div:div_1\": \"ru great grandchild text within div without id\",\n  \"div_12:ul:li\": \"ru line item without id 1\",\n  \"div_12:ul:li_1\": \"ru line item without id 2\",\n  \"div_12:ul:li_2\": \"ru line item without id 3\",\n  \"line-items:li\": \"ru line item with id 1\",\n  \"line-items:li_1\": \"ru line item with id 2\",\n  \"line-items:li_2\": \"ru line item with id 3\",\n  \"p_13\": [\n    \"ru A paragraph with {1} is converted to {2}.\",\n    \"ru parameters\",\n    \"ru <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"ru A paragraph with {1} is converted to {2}.\",\n    \"ru id\",\n    \"ru <i18n-format>\"\n  ],\n  \"text_15\": \" ru outermost text at the end \"\n}\n","/simple-text-element/simple-text-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" outermost text at the beginning \",\n  \"h1_3\": \"outermost header 1\",\n  \"text_4\": \" outermost text in the middle \",\n  \"span_5\": \"simple text without id\",\n  \"span_6\": \"simple text without id 2\",\n  \"label-1\": \"simple text with id\",\n  \"label-2\": \"simple text with id 2\",\n  \"div_9:span\": \"simple text within div\",\n  \"div_9:span_1\": \"simple text within div 2\",\n  \"div_9:div_2:div\": \"great grandchild text within div\",\n  \"div_10:text\": \" simple text as the first element in div \",\n  \"div_10:span_1\": \"simple text within div\",\n  \"div_10:text_2\": \" simple text in the middle of div \",\n  \"div_10:span_3\": \"simple text within div 2\",\n  \"div_10:div_4:div\": \"great grandchild text within div\",\n  \"div_10:text_5\": \" simple text at the last element in div \",\n  \"toplevel-div:span\": \"simple text within div\",\n  \"toplevel-div:span_1\": \"simple text within div 2\",\n  \"third-level-div\": \"great grandchild text within div\",\n  \"second-level-div:div_1\": \"great grandchild text within div without id\",\n  \"div_12:ul:li\": \"line item without id 1\",\n  \"div_12:ul:li_1\": \"line item without id 2\",\n  \"div_12:ul:li_2\": \"line item without id 3\",\n  \"line-items:li\": \"line item with id 1\",\n  \"line-items:li_1\": \"line item with id 2\",\n  \"line-items:li_2\": \"line item with id 3\",\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"parameters\",\n    \"<i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"id\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": \" outermost text at the end \"\n}","/simple-text-id-element/locales/simple-text-id-element.fr.json":"{\n  \"model\": {},\n  \"text\": \" fr outermost text at the beginning \",\n  \"h1_3\": \"fr outermost header 1\",\n  \"text_4\": \" fr outermost text in the middle \",\n  \"span_5\": \"fr simple text without id\",\n  \"span_6\": \"fr simple text without id 2\",\n  \"label-1\": \"fr simple text with id\",\n  \"label-2\": \"fr simple text with id 2\",\n  \"div_9:span\": \"fr simple text within div\",\n  \"div_9:span_1\": \"fr simple text within div 2\",\n  \"div_9:div_2:div\": \"fr great grandchild text within div\",\n  \"div_10:text\": \" fr simple text as the first element in div \",\n  \"div_10:span_1\": \"fr simple text within div\",\n  \"div_10:text_2\": \" fr simple text in the middle of div \",\n  \"div_10:span_3\": \"fr simple text within div 2\",\n  \"div_10:div_4:div\": \"fr great grandchild text within div\",\n  \"div_10:text_5\": \" fr simple text at the last element in div \",\n  \"toplevel-div:span\": \"fr simple text within div\",\n  \"toplevel-div:span_1\": \"fr simple text within div 2\",\n  \"second-level-div\": [\n    \" fr {1}\\n        {2} \",\n    \"fr great grandchild text within div\",\n    \"fr great grandchild text within div without id\"\n  ],\n  \"div_12:ul:li\": \"fr line item without id 1\",\n  \"div_12:ul:li_1\": \"fr line item without id 2\",\n  \"div_12:ul:li_2\": \"fr line item without id 3\",\n  \"line-items\": [\n    \" fr {1}\\n        {2}\\n        {3} \",\n    \"fr line item with id 1\",\n    \"fr line item with id 2\",\n    \"fr line item with id 3\"\n  ],\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr parameters\",\n    \"fr <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr id\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": \" fr outermost text at the end \"\n}\n","/simple-text-id-element/simple-text-id-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" outermost text at the beginning \",\n  \"h1_3\": \"outermost header 1\",\n  \"text_4\": \" outermost text in the middle \",\n  \"span_5\": \"simple text without id\",\n  \"span_6\": \"simple text without id 2\",\n  \"label-1\": \"simple text with id\",\n  \"label-2\": \"simple text with id 2\",\n  \"div_9:span\": \"simple text within div\",\n  \"div_9:span_1\": \"simple text within div 2\",\n  \"div_9:div_2:div\": \"great grandchild text within div\",\n  \"div_10:text\": \" simple text as the first element in div \",\n  \"div_10:span_1\": \"simple text within div\",\n  \"div_10:text_2\": \" simple text in the middle of div \",\n  \"div_10:span_3\": \"simple text within div 2\",\n  \"div_10:div_4:div\": \"great grandchild text within div\",\n  \"div_10:text_5\": \" simple text at the last element in div \",\n  \"toplevel-div:span\": \"simple text within div\",\n  \"toplevel-div:span_1\": \"simple text within div 2\",\n  \"second-level-div\": [\n    \" {1}\\n        {2} \",\n    \"great grandchild text within div\",\n    \"great grandchild text within div without id\"\n  ],\n  \"div_12:ul:li\": \"line item without id 1\",\n  \"div_12:ul:li_1\": \"line item without id 2\",\n  \"div_12:ul:li_2\": \"line item without id 3\",\n  \"line-items\": [\n    \" {1}\\n        {2}\\n        {3} \",\n    \"line item with id 1\",\n    \"line item with id 2\",\n    \"line item with id 3\"\n  ],\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"parameters\",\n    \"<i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"id\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": \" outermost text at the end \"\n}","/template-default-lang/locales/null-template-default-lang-element.ja.json":"","/template-default-lang/locales/null-template-default-lang-element.zh-Hans-CN.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" zh-Hans-CN outermost text at the beginning \",\n  \"h1_3\": \"zh-Hans-CN outermost header 1\",\n  \"text_4\": \" zh-Hans-CN outermost text in the middle \",\n  \"span_5\": \"zh-Hans-CN simple text without id\",\n  \"span_6\": \"zh-Hans-CN simple text without id 2\",\n  \"label-1\": \"zh-Hans-CN simple text with id\",\n  \"label-2\": \"zh-Hans-CN simple text with id 2\",\n  \"div_9:span\": \"zh-Hans-CN simple text within div\",\n  \"div_9:span_1\": \"zh-Hans-CN simple text within div 2\",\n  \"div_9:div_2:div\": \"zh-Hans-CN great grandchild text within div\",\n  \"div_10:text\": \" zh-Hans-CN simple text as the first element in div \",\n  \"div_10:span_1\": \"zh-Hans-CN simple text within div\",\n  \"div_10:text_2\": \" zh-Hans-CN simple text in the middle of div \",\n  \"div_10:span_3\": \"zh-Hans-CN simple text within div 2\",\n  \"div_10:div_4:div\": \"zh-Hans-CN great grandchild text within div\",\n  \"div_10:text_5\": \" zh-Hans-CN simple text at the last element in div \",\n  \"toplevel-div:span\": \"zh-Hans-CN simple text within div\",\n  \"toplevel-div:span_1\": \"zh-Hans-CN simple text within div 2\",\n  \"third-level-div\": \"zh-Hans-CN great grandchild text within div\",\n  \"second-level-div:div_1\": \"zh-Hans-CN great grandchild text within div without id\",\n  \"div_12:ul:li\": \"zh-Hans-CN line item without id 1\",\n  \"div_12:ul:li_1\": \"zh-Hans-CN line item without id 2\",\n  \"div_12:ul:li_2\": \"zh-Hans-CN line item without id 3\",\n  \"line-items:li\": \"zh-Hans-CN line item with id 1\",\n  \"line-items:li_1\": \"zh-Hans-CN line item with id 2\",\n  \"line-items:li_2\": \"zh-Hans-CN line item with id 3\",\n  \"p_13\": [\n    \"zh-Hans-CN A paragraph with {1} is converted to {2}.\",\n    \"zh-Hans-CN parameters\",\n    \"zh-Hans-CN <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"zh-Hans-CN A paragraph with {1} is converted to {2}.\",\n    \"zh-Hans-CN id\",\n    \"zh-Hans-CN <i18n-format>\"\n  ],\n  \"text_15\": \" zh-Hans-CN outermost text at the end \"\n}","/template-default-lang/locales/template-default-lang-element.zh-Hans-CN.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" zh-Hans-CN outermost text at the beginning \",\n  \"h1_3\": \"zh-Hans-CN outermost header 1\",\n  \"text_4\": \" zh-Hans-CN outermost text in the middle \",\n  \"span_5\": \"zh-Hans-CN simple text without id\",\n  \"span_6\": \"zh-Hans-CN simple text without id 2\",\n  \"label-1\": \"zh-Hans-CN simple text with id\",\n  \"label-2\": \"zh-Hans-CN simple text with id 2\",\n  \"div_9:span\": \"zh-Hans-CN simple text within div\",\n  \"div_9:span_1\": \"zh-Hans-CN simple text within div 2\",\n  \"div_9:div_2:div\": \"zh-Hans-CN great grandchild text within div\",\n  \"div_10:text\": \" zh-Hans-CN simple text as the first element in div \",\n  \"div_10:span_1\": \"zh-Hans-CN simple text within div\",\n  \"div_10:text_2\": \" zh-Hans-CN simple text in the middle of div \",\n  \"div_10:span_3\": \"zh-Hans-CN simple text within div 2\",\n  \"div_10:div_4:div\": \"zh-Hans-CN great grandchild text within div\",\n  \"div_10:text_5\": \" zh-Hans-CN simple text at the last element in div \",\n  \"toplevel-div:span\": \"zh-Hans-CN simple text within div\",\n  \"toplevel-div:span_1\": \"zh-Hans-CN simple text within div 2\",\n  \"third-level-div\": \"zh-Hans-CN great grandchild text within div\",\n  \"second-level-div:div_1\": \"zh-Hans-CN great grandchild text within div without id\",\n  \"div_12:ul:li\": \"zh-Hans-CN line item without id 1\",\n  \"div_12:ul:li_1\": \"zh-Hans-CN line item without id 2\",\n  \"div_12:ul:li_2\": \"zh-Hans-CN line item without id 3\",\n  \"line-items:li\": \"zh-Hans-CN line item with id 1\",\n  \"line-items:li_1\": \"zh-Hans-CN line item with id 2\",\n  \"line-items:li_2\": \"zh-Hans-CN line item with id 3\",\n  \"p_13\": [\n    \"zh-Hans-CN A paragraph with {1} is converted to {2}.\",\n    \"zh-Hans-CN parameters\",\n    \"zh-Hans-CN <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"zh-Hans-CN A paragraph with {1} is converted to {2}.\",\n    \"zh-Hans-CN id\",\n    \"zh-Hans-CN <i18n-format>\"\n  ],\n  \"text_15\": \" zh-Hans-CN outermost text at the end \"\n}","/template-default-lang/null-template-default-lang-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" outermost text at the beginning \",\n  \"h1_3\": \"outermost header 1\",\n  \"text_4\": \" outermost text in the middle \",\n  \"span_5\": \"simple text without id\",\n  \"span_6\": \"simple text without id 2\",\n  \"label-1\": \"simple text with id\",\n  \"label-2\": \"simple text with id 2\",\n  \"div_9:span\": \"simple text within div\",\n  \"div_9:span_1\": \"simple text within div 2\",\n  \"div_9:div_2:div\": \"great grandchild text within div\",\n  \"div_10:text\": \" simple text as the first element in div \",\n  \"div_10:span_1\": \"simple text within div\",\n  \"div_10:text_2\": \" simple text in the middle of div \",\n  \"div_10:span_3\": \"simple text within div 2\",\n  \"div_10:div_4:div\": \"great grandchild text within div\",\n  \"div_10:text_5\": \" simple text at the last element in div \",\n  \"toplevel-div:span\": \"simple text within div\",\n  \"toplevel-div:span_1\": \"simple text within div 2\",\n  \"third-level-div\": \"great grandchild text within div\",\n  \"second-level-div:div_1\": \"great grandchild text within div without id\",\n  \"div_12:ul:li\": \"line item without id 1\",\n  \"div_12:ul:li_1\": \"line item without id 2\",\n  \"div_12:ul:li_2\": \"line item without id 3\",\n  \"line-items:li\": \"line item with id 1\",\n  \"line-items:li_1\": \"line item with id 2\",\n  \"line-items:li_2\": \"line item with id 3\",\n  \"p_13\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"parameters\",\n    \"<i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"A paragraph with {1} is converted to {2}.\",\n    \"id\",\n    \"<i18n-format>\"\n  ],\n  \"text_15\": \" outermost text at the end \"\n}","/template-default-lang/template-default-lang-element.json":"{\n  \"meta\": {},\n  \"model\": {},\n  \"text\": \" fr outermost text at the beginning \",\n  \"h1_3\": \"fr outermost header 1\",\n  \"text_4\": \" fr outermost text in the middle \",\n  \"span_5\": \"fr simple text without id\",\n  \"span_6\": \"fr simple text without id 2\",\n  \"label-1\": \"fr simple text with id\",\n  \"label-2\": \"fr simple text with id 2\",\n  \"div_9:span\": \"fr simple text within div\",\n  \"div_9:span_1\": \"fr simple text within div 2\",\n  \"div_9:div_2:div\": \"fr great grandchild text within div\",\n  \"div_10:text\": \" fr simple text as the first element in div \",\n  \"div_10:span_1\": \"fr simple text within div\",\n  \"div_10:text_2\": \" fr simple text in the middle of div \",\n  \"div_10:span_3\": \"fr simple text within div 2\",\n  \"div_10:div_4:div\": \"fr great grandchild text within div\",\n  \"div_10:text_5\": \" fr simple text at the last element in div \",\n  \"toplevel-div:span\": \"fr simple text within div\",\n  \"toplevel-div:span_1\": \"fr simple text within div 2\",\n  \"third-level-div\": \"fr great grandchild text within div\",\n  \"second-level-div:div_1\": \"fr great grandchild text within div without id\",\n  \"div_12:ul:li\": \"fr line item without id 1\",\n  \"div_12:ul:li_1\": \"fr line item without id 2\",\n  \"div_12:ul:li_2\": \"fr line item without id 3\",\n  \"line-items:li\": \"fr line item with id 1\",\n  \"line-items:li_1\": \"fr line item with id 2\",\n  \"line-items:li_2\": \"fr line item with id 3\",\n  \"p_13\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr parameters\",\n    \"fr <i18n-format>\"\n  ],\n  \"paragraph\": [\n    \"fr A paragraph with {1} is converted to {2}.\",\n    \"fr id\",\n    \"fr <i18n-format>\"\n  ],\n  \"text_15\": \" fr outermost text at the end \"\n}"};window.deepcopy=deepcopy;if(!Number.isNaN){// polyfill Number.isNaN for IE11
Number.isNaN=function(value){return typeof value==='number'&&isNaN(value);};}// Inheritance of test parameters
window.p=Object.setPrototypeOf||function(target,base){var obj=Object.create(base);for(var p in target){obj[p]=target[p];}return obj;};window.g=Object.getPrototypeOf;window._name='suite';window.suiteMap={null:{}};window.s=function(name,baseName,extension){if(suiteMap[name]){throw new Error('duplicate suite name '+name);}if(!suiteMap[baseName]){throw new Error('inexistent base suite name '+baseName);}extension[_name]=name;extension=p(extension,suiteMap[baseName]);suiteMap[name]=extension;return extension;};// Utility functions
window.updateProperty=function updateProperty(element,properties){for(var name in properties){var path=name.split(/[.]/);if(path.length===1){element[name]=properties[name];}else{var cursor=element;var p=path.shift();while(p){if(path.length<1){cursor[p]=properties[name];element.notifyPath(name,properties[name],true);break;}else if(p==='PolymerDom'){cursor=dom(cursor);}else if(p==='html'){cursor=document.querySelector('html');}else{cursor=cursor[p];}p=path.shift();}}}};window.getProperty=function getProperty(target,name){var path=name.split(/[.]/);if(path.length===1){switch(name){case'textContent':return Array.prototype.map.call(target.childNodes,function(n){return n.nodeType===n.TEXT_NODE?n.textContent:'';}).join('');default:return target[name];break;}}else{var cursor=target;var p=path.shift();while(p){//console.log(p, cursor);
if(path.length<1){if(p==='raw'||p==='text'){return cursor;}else if(p==='trim'){return cursor.trim();}if(p==='data'){cursor=cursor[p];cursor=cursor.replace(/^[\s]{1,}/g,' ').replace(/[\s]{1,}$/g,' ');return cursor;}else{return cursor[p];}}else if(p==='PolymerDom'){cursor=dom(cursor);}else if(p==='previousTextSibling'){do{cursor=cursor.previousSibling;}while(cursor.nodeType===cursor.COMMENT_NODE||cursor.nodeType===cursor.TEXT_NODE&&cursor.data.match(/^[\s]*$/));}else if(p==='nextTextSibling'){do{cursor=cursor.nextSibling;}while(cursor.nodeType===cursor.COMMENT_NODE||cursor.nodeType===cursor.TEXT_NODE&&cursor.data.match(/^[\s]*$/));}else if(p==='effectiveChildNodes'){cursor=cursor.getEffectiveChildNodes();}else if(p==='nonWS'){cursor=Array.prototype.filter.call(cursor,function(item){return item.nodeType!==item.TEXT_NODE&&item.nodeType!==item.COMMENT_NODE||item.nodeType===item.TEXT_NODE&&!item.data.match(/^[\s]*$/);});}else{cursor=cursor[p];}p=path.shift();}}};window.deepMap=function deepMap(target,source,map){var value;for(var prop in source){value=source[prop];switch(typeof value){case'string':case'number':case'boolean':if(typeof target==='object'){target[prop]=map(value,prop);}break;case'object':if(typeof target==='object'){if(Array.isArray(value)){target[prop]=target[prop]||[];deepMap(target[prop],value,map);}else{target[prop]=target[prop]||{};deepMap(target[prop],value,map);}}break;case'function':case'symbol':case'undefined':if(typeof target==='object'){target[prop]=value;}break;default:if(typeof target==='object'){target[prop]=value;}break;}}return target;};window.translate=function translate(lang,path,text){var result;switch(lang){case'':case'en':case null:case undefined:result=text;break;default:if(!path||path.match(/(textContent|[.]data|[.]text|[.]trim)$/)){result={};deepMap(result,{text:text},function(value,prop){if(typeof value==='string'&&!value.match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)&&!value.match(/^[0-9]{1,}$/)&&prop!=='type'){if(path&&path.match(/[.]trim$/)){return minifyText((lang+' '+value).trim());}else{if(value.match(/^ /)){return minifyText(' '+lang+' '+value);}else{return minifyText(lang+' '+value);}}}return minifyText(value);});result=result.text;}else{result=text;}}//console.log('translate (' + lang + ', ' + path + ', ' + JSON.stringify(text, null, 2) + ') = ' + JSON.stringify(result, null, 2));
return result;};window.minifyText=function minifyText(text){if(text&&typeof text==='string'){text=text.replace(/[\s]{1,}/g,' ');}return text;};window.isFakeServer=typeof window==='object'&&typeof window.location.href==='string'&&window.location.href.indexOf('xhr=fake')>0&&typeof window.fakeServerContents==='object';window.isSuppressingSuiteParams=typeof window==='object'&&typeof window.location.href==='string'&&window.location.href.indexOf('suppress=true')>0;window.syntax='mixin';(function(){var href=typeof window==='object'&&typeof window.location.href==='string'?window.location.href:'';if(href){['mixin','base-element','thin','legacy','modified-legacy'].forEach(function(_syntax){if(href.indexOf('syntax='+_syntax)>0){syntax=_syntax;}});}})();window.setupFakeServer=function setupFakeServer(e){if(isFakeServer){e.server=sinon.fakeServer.create();e.server.autoRespond=true;//e.server.autoRespondAfter = 100;
e.server.respondImmediately=true;e.server.respondWith(/\/test\/[-\w]+(\/.*[.]json)$/,function(xhr,urlPath){if(fakeServerContents.hasOwnProperty(urlPath)){//console.log('fake-server: 200 ' + urlPath);
xhr.respond(200,{'Content-Type':'application/json'},fakeServerContents[urlPath]);}else{//console.log('fake-server: 404 ' + urlPath);
xhr.respond(404,{},'');}});}};window.teardownFakeServer=function teardownFakeServer(e){if(isFakeServer){e.server.restore();}};window.setupFixture=function setupFixture(params,fixtureModel){var fixtureName=params.fixture;var e=document.querySelector('#'+fixtureName);var runningTest=document.querySelectorAll('.running-test');var title=document.querySelector('#test-name');var currentPath=window.location.pathname.split('/');if(!e){throw new Error('Fixture element with id = '+fixtureName+' not found');}if(title){title.textContent=(currentPath.length>=2?currentPath[currentPath.length-2]:'')+(currentPath.length>=1?'/'+currentPath[currentPath.length-1].replace(/-test[.]html$/,'')+'/':'')+params.suite;}//console.log('setupFixture: suite = ' + params.suite);
if(e.is==='i18n-dom-bind'){e.parentElement.classList.add('running-test');Array.prototype.forEach.call(runningTest,function(node){if(node!==e.parentElement){node.classList.remove('running-test');}});return new Promise(function(resolve,reject){e.addEventListener('dom-change',function setupFixtureDomChange(ev){if(dom(ev).rootTarget===e){//console.log('setupFixture dom-change');
e.removeEventListener('dom-change',setupFixtureDomChange);try{if(fixtureModel&&typeof fixtureModel.lang==='string'&&fixtureModel.lang!=='en'){//console.log('setupFixture: waiting for lang-updated');
e.addEventListener('lang-updated',function setupFixtureLangDomChange(event){//console.log('setupFixtureLangDomChange');
if(event.target===e&&e.effectiveLang===fixtureModel.lang){//console.log('setupFixtureLangDomChange lang = ' + event.detail.lang + ' effectiveLang = ' + e.effectiveLang);
e.removeEventListener('lang-updated',setupFixtureLangDomChange);e.render();resolve(e);}});for(var p in fixtureModel){e[p]=fixtureModel[p];}e.params=params;}else{for(var p in fixtureModel){e[p]=fixtureModel[p];}e.params=params;//console.log('setupFixture: resolving');
e.render();resolve(e);}}catch(ex){reject(ex);}}});if(e._children){e.render();}});}else{e.classList.add('running-test');Array.prototype.forEach.call(runningTest,function(node){if(node!==e){node.classList.remove('running-test');}});setupFakeServer(e);return new Promise(function(resolve,reject){//console.log('setupFixture: name = ' + fixtureName + ' model = ' + JSON.stringify(fixtureModel, null, 2));
if(!window.FixtureWrapper){window.FixtureWrapper=class FixtureWrapper extends PolymerElement{};customElements.define('fixture-wrapper',FixtureWrapper);}if(fixtureModel){var f=document.querySelector('test-fixture[id='+fixtureName+']');var t=f.querySelector('template[is=dom-template]');if(t){var instanceProps={};var p;for(p in fixtureModel){instanceProps[p]=true;}var self=new FixtureWrapper();t.__templatizeOwner=undefined;t._ctor=templatize(t,self,{instanceProps:instanceProps,forwardHostProp:function(prop,value){if(self._instance){self._instance.forwardHostProp(prop,value);}}});t.stamp=function(model){var _instance=new this._ctor(model);return _instance.root;}.bind(t);}}var element=fixture(fixtureName,fixtureModel);//console.log('setupFixture: name = ' + fixtureName +
//            ' element.lang = ' + element.lang +
//            ' getAttribute("lang") = ' + element.getAttribute('lang') +
//            ' element._lang = ' + element._lang);
if(element){if(fixtureModel&&typeof fixtureModel.lang==='string'&&fixtureModel.lang!=='en'&&fixtureModel.lang!==element.effectiveLang&&element.effectiveLang!=='en'){//console.log('setupFixture: waiting for lang-updated');
element.addEventListener('lang-updated',function setupFixtureLangUpdated(event){//console.log('setupFixtureLangUpdated');
if(event.target===element&&element.effectiveLang===fixtureModel.lang){//console.log('setupFixtureLangUpdated lang = ' + event.detail.lang + ' effectiveLang = ' + element.effectiveLang);
element.removeEventListener('lang-updated',setupFixtureLangUpdated);resolve(element);}});}else{//console.log('setupFixture: element ready without lang-updated');
setTimeout(function(){if(params.lang===''||params.lang==='en'){element.fire('lang-updated');}},500);resolve(element);}}else{reject(new Error('setupFixture returns null for '+fixtureName+' '+JSON.stringify(fixtureModel,null,2)));}});}};window.restoreFixture=function restoreFixture(fixtureName){var e=document.querySelector('#'+fixtureName);if(!e){throw new Error('Fixture element with id = '+fixtureName+' not found');}if(e.is==='i18n-dom-bind'){if(e._intervalId){clearInterval(e._intervalId);}Array.prototype.forEach.call(document.querySelectorAll('i18n-dom-bind'),function(node){node.observeHtmlLang=true;});}else{teardownFakeServer(e);e.restore();}};window.getLocalDomRoot=function getLocalDomRoot(e){if(e.is==='i18n-dom-bind'){return e.parentElement;}else if(e){return e.root;}else{return null;}};window.suitesRunner=function suitesRunner(suites,_wait){suites.forEach(function(params){suite(params.suite,function(){var el;var p;var n;var i,j;var expected;var results;var node;var rawValue=params.rawValue;var fixtureElement;var noProperties;var lang=params.assign&&params.assign.lang?params.assign.lang:'en';var event=params.event?params.event:'lang-updated';var defTimeout=300000;var timeout=params.timeout?params.timeout<defTimeout?defTimeout:params.timeout:defTimeout;this.timeout(timeout);(params.setup?setup:suiteSetup)(function(){return(_wait?new Promise(resolve=>{setTimeout(()=>{resolve();},_wait);}):Promise.resolve()).then(()=>setupFixture(params,params.fixtureModel)).then(function(element){el=element;//console.log('setup: element.lang = ' + element.lang);
return new Promise(function(resolve,reject){//console.log(params.suite, 'waiting for ' + event);
if(params&&(params.event||params.assign&&(params.assign.lang||params.assign['html.lang']))){el.addEventListener(event,function fixtureSetup(e){if(el===dom(e).rootTarget&&el.lang===params.lang&&el.effectiveLang===params.effectiveLang){el.removeEventListener(event,fixtureSetup);//console.log('setup: updateProperty resolving on ' + event);
resolve(el);}else{console.log(params.suite+' skipping uninteresting event '+event+' "'+el.lang+'" "'+params.lang+'" "'+el.effectiveLang+'" "'+params.effectiveLang+'"');}});//console.log('setup: updateProperty ' + JSON.stringify(params.assign, null, 2));
updateProperty(el,params.assign);}else{//console.log('setup: updateProperty ' + JSON.stringify(params.assign, null, 2));
//console.log('setup: updateProperty resolving without ' + event);
updateProperty(el,params.assign);resolve(el);}});},function(error){throw new Error(error);}).then(result=>{if(_wait){return new Promise(resolve=>{setTimeout(()=>resolve(result),_wait);});}else{return result;}});});test('{lang, effectiveLang, templateDefaultLang, observeHtmlLang'+(params.text?', text':'')+(params.model?', model':'')+(params.localDOM?', local DOM':'')+'} properties are set as {'+(isSuppressingSuiteParams?'':[params.lang,params.effectiveLang,params.templateDefaultLang,params.observeHtmlLang].join(', ')+(params.text?', '+JSON.stringify(params.text,null,2):'')+(params.model?', '+JSON.stringify(params.model,null,2):'')+(!params.setup&&params.localDOM?', '+JSON.stringify(params.localDOM,null,2):''))+'}'+(params.assign&&params.assign.lang?' for '+params.assign.lang:''),function(){assert.isString(el.lang,'lang property is a string');assert.equal(el.lang,params.lang,'lang property is set');assert.isString(el.effectiveLang,'effectiveLang property is a string');assert.equal(el.effectiveLang,params.effectiveLang,'effectiveLang property is set');assert.isString(el.templateDefaultLang,'templateDefaultLang property is a string');assert.equal(el.templateDefaultLang,params.templateDefaultLang,'templateDefaultLang property is set');assert.isBoolean(el.observeHtmlLang,'observeHtmlLang property is a Boolean');assert.equal(el.observeHtmlLang,params.observeHtmlLang,'observeHtmlLang property is set');if(params.text){var actual;expected=deepMap(deepcopy(params.text),params.text,minifyText);actual=deepMap(deepcopy(el.text),el.text,minifyText);noProperties=true;assert.isObject(el.text,'text property is an object');//console.log(JSON.stringify(e.detail, null, 2));
//console.log(JSON.stringify(el.text, null, 2));
for(p in expected){if(p==='meta'){continue;}noProperties=false;assert.deepEqual(actual[p],params.rawText?expected[p]:translate(params.effectiveLang,null,expected[p]),'text.'+p+' property is set for '+params.effectiveLang);}if(noProperties){assert.deepEqual(deepMap(deepcopy(el.text),el.text,minifyText),expected,'text property is set');}}if(params.model){noProperties=true;assert.isObject(el.model,'model property is an object');for(p in expected){noProperties=false;//console.log('model.' + p + ' = ' + JSON.stringify(el.model[p]));
//console.log('expected model.' + p + ' = ' + JSON.stringify(translate(el.effectiveLang, null, params.model[p])));
assert.deepEqual(minifyText(el.model[p]),params.rawText?params.model[p]:translate(params.effectiveLang,null,params.model[p]),'model.'+p+' property is set for '+params.effectiveLang);}if(noProperties){assert.deepEqual(el.model,params.model,'model property is set');}}if(!params.setup&&params.localDOM){params.localDOM.forEach(function(childPath){var completeStatus;var nodes=dom(getLocalDomRoot(el)).querySelectorAll(childPath.select);assert.ok(nodes.length>0,childPath.select+' is defined');for(var p in childPath){if(p==='select'){continue;}//console.log(p + ' is set as ' + childPath[p]);
if(Array.isArray(childPath[p])){//console.log(nodes);
Array.prototype.forEach.call(childPath[p],function(path,i,a){assert.equal(minifyText(getProperty(nodes[i],p)),minifyText(params.rawText?path:translate(params.effectiveLang,p,path)),p+' is set as '+minifyText(params.rawText?path:translate(params.effectiveLang,p,path)));});}else{//console.log(nodes[0]);
assert.equal(minifyText(getProperty(nodes[0],p)),minifyText(params.rawText?childPath[p]:translate(params.effectiveLang,p,childPath[p])),p+' is set as '+translate(params.rawText?childPath[p]:params.effectiveLang,p,childPath[p]));}}//console.log(childPath);
});}});/*
                if (params.text) {
                  test('text' + ' property is set as ' + JSON.stringify(params.text,null,2) + 
                    (params.assign && params.assign.lang ? ' for ' + params.assign.lang : ''), function () {
                    expected = deepMap(deepcopy(params.text), params.text, minifyText);
                    noProperties = true;
                    assert.isObject(el.text, 'text property is an object');
                    //console.log(JSON.stringify(e.detail, null, 2));
                    //console.log(JSON.stringify(el.text, null, 2));
                    for (p in expected) {
                      noProperties = false;
                      assert.deepEqual(deepMap(deepcopy(el.text[p]), el.text[p], minifyText),
                        params.rawText ? expected[p] : translate(params.effectiveLang, null, expected[p]),
                        'text.' + p + ' property is set for ' + params.effectiveLang);
                    }
                    if (noProperties) {
                      assert.deepEqual(deepMap(deepcopy(el.text), el.text, minifyText),
                        expected,
                        'text property is set');
                    }
                  });
                }
          
                if (params.model) {
                  test('model' + ' property is set as ' + JSON.stringify(params.model,null,2) + 
                    (params.assign && params.assign.lang ? ' for ' + params.assign.lang : ''), function () {
                    noProperties = true;
                    assert.isObject(el.model, 'model property is an object');
                    for (p in params.model) {
                      noProperties = false;
                      //console.log('model.' + p + ' = ' + JSON.stringify(el.model[p]));
                      //console.log('expected model.' + p + ' = ' + JSON.stringify(translate(el.effectiveLang, null, params.model[p])));
                      assert.deepEqual(el.model[p],
                        params.rawText ? params.model[p] : translate(params.effectiveLang, null, params.model[p]),
                        'model.' + p + ' property is set for ' + params.effectiveLang);
                    }
                    if (noProperties) {
                      assert.deepEqual(el.model, params.model, 'model property is set');
                    }
                  });
                }
          */if(params.setup&&params.localDOM){test('local DOM '+(isSuppressingSuiteParams?'{}':JSON.stringify(params.localDOM,null,2))+' is set'+(params.assign&&params.assign.lang?' for '+params.assign.lang:''),function(){params.localDOM.forEach(function(childPath){var completeStatus;var nodes=dom(getLocalDomRoot(el)).querySelectorAll(childPath.select);assert.ok(nodes.length>0,childPath.select+' is defined');for(var p in childPath){if(p==='select'){continue;}//console.log(p + ' is set as ' + childPath[p]);
if(Array.isArray(childPath[p])){//console.log(nodes);
Array.prototype.forEach.call(childPath[p],function(path,i,a){assert.equal(minifyText(getProperty(nodes[i],p)),minifyText(params.rawText?path:translate(params.effectiveLang,p,path)),p+' is set as '+minifyText(params.rawText?path:translate(params.effectiveLang,p,path)));});}else{//console.log(nodes[0]);
assert.equal(minifyText(getProperty(nodes[0],p)),minifyText(params.rawText?childPath[p]:translate(params.effectiveLang,p,childPath[p])),p+' is set as '+translate(params.rawText?childPath[p]:params.effectiveLang,p,childPath[p]));}}//console.log(childPath);
});});}if(params.lightDOM){test('light DOM '+(isSuppressingSuiteParams?'{}':JSON.stringify(params.lightDOM,null,2))+' is set'+(params.assign&&params.assign.lang?' for '+params.assign.lang:''),function(){params.lightDOM.forEach(function(childPath){var completeStatus;var nodes=dom(el).querySelectorAll(childPath.select);assert.ok(nodes.length>0,childPath.select+' is defined');for(var p in childPath){if(p==='select'){continue;}//console.log(p + ' is set as ' + childPath[p]);
if(Array.isArray(childPath[p])){//console.log(nodes);
Array.prototype.forEach.call(childPath[p],function(path,i,a){assert.equal(getProperty(nodes[i],p),translate(params.effectiveLang,p,path),p+' is set as '+translate(params.effectiveLang,p,path));});}else{//console.log(nodes[0]);
assert.equal(getProperty(nodes[0],p),translate(params.effectiveLang,p,childPath[p]),p+' is set as '+translate(params.effectiveLang,p,childPath[p]));}}//console.log(childPath);
});});}(params.setup?teardown:suiteTeardown)(function(){restoreFixture(params.fixture);});});});};const bundledImportMeta$6={...import.meta,url:new URL('./multiple-case/item-element.js',import.meta.url).href};const $_documentContainer$2=document.createElement('template');$_documentContainer$2.innerHTML=`<template id="item-element">
    <span id="label">A</span>
  </template>`;document.head.appendChild($_documentContainer$2.content);switch(syntax){default:case'mixin':{class ItemElement extends Mixins.Localizable(Polymer.LegacyElement){static get importMeta(){return bundledImportMeta$6;}static get template(){return(t=>{t.setAttribute("localizable-text","embedded");return t;})(html`
    <span id="label">{{text.label}}</span>
<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "label": "A"
}
</json-data>
</template>
`);}static get is(){return'item-element';}}customElements.define(ItemElement.is,ItemElement);}break;case'base-element':{class ItemElement extends BaseElements.I18nElement{static get importMeta(){return bundledImportMeta$6;}static get template(){return(t=>{t.setAttribute("localizable-text","embedded");return t;})(html`
    <span id="label">{{text.label}}</span>
<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "label": "A"
}
</json-data>
</template>
`);}static get is(){return'item-element';}}customElements.define(ItemElement.is,ItemElement);}break;case'thin':{Define=class ItemElement extends BaseElements.I18nElement{};}break;case'legacy':{Polymer$1({importMeta:bundledImportMeta$6,_template:(t=>{t.setAttribute("localizable-text","embedded");return t;})(html`
    <span id="label">{{text.label}}</span>
<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {},
  "label": "A"
}
</json-data>
</template>
`),is:'item-element',behaviors:[BehaviorsStore.I18nBehavior]});}break;}const bundledImportMeta$7={...import.meta,url:new URL('./multiple-case/multiple-element.js',import.meta.url).href};const $_documentContainer$3=document.createElement('template');$_documentContainer$3.innerHTML=`<template id="multiple-element">
    <div id="base">
      <dom-repeat id="items" items="{{getArray(count)}}" on-dom-change="domChanged"><template>
        <span>
          <item-element lang="{{effectiveLang}}" observe-html-lang="{{observeHtmlLang}}"></item-element>
        </span>
      </template></dom-repeat>
    </div>
    <div id="save"></div>
  </template>`;document.head.appendChild($_documentContainer$3.content);switch(syntax){default:case'mixin':{class MultipleElement extends Mixins.Localizable(Polymer.LegacyElement){static get importMeta(){return bundledImportMeta$7;}static get template(){return(t=>{t.setAttribute("localizable-text","embedded");return t;})(html`
    <div id="base">
      <dom-repeat id="items" items="{{getArray(count)}}" on-dom-change="domChanged"><template>
        <span>
          <item-element lang="{{effectiveLang}}" observe-html-lang="{{observeHtmlLang}}"></item-element>
        </span>
      </template></dom-repeat>
    </div>
    <div id="save"></div>
<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {}
}
</json-data>
</template>
`);}static get is(){return'multiple-element';}static get config(){return{properties:{count:{type:Number,value:100}},listeners:{'lang-updated':'langUpdated'}};}getArray(count){var a=[];for(var i=0;i<count;i++){a.push(i);}return a;}domChanged(e){var nodes=dom(this.root).querySelectorAll('item-element');if(this.lang==='en'&&this.effectiveLang===''){this.effectiveLang='en';}//console.log('multiple-element: dom-change count = ' + nodes.length + ' lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
if(nodes.length===this.count&&(this.lang===this.effectiveLang||this.effectiveLang===''&&this.lang==='en')){Array.prototype.forEach.call(nodes,function(node){this.$.save.appendChild(node);}.bind(this));//console.log('multiple-element: local-dom-ready');
this.async(function(){this.fire('local-dom-ready');},500);}}langUpdated(e){var target=e.composedPath()[0];var lang=target.lang===''?'en':target.lang;this.itemLang=this.itemLang||{};if(target.tagName.toLowerCase()==='item-element'){//console.log('item-element: lang-updated lang = ' + target.lang);
this.itemLang[lang]=this.itemLang[lang]||0;this.itemLang[lang]++;}//console.log('multiple-element: ' + target.is + ' ' + 
//            'lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang +
//            ' itemLang[' + this.lang + '] = ' + this.itemLang[this.lang]);
if(this.itemLang[this.lang]===this.count){//console.log('count reached for ' + this.lang);
this.$.items.render();}return false;}}customElements.define(MultipleElement.is,MultipleElement);}break;case'base-element':{class MultipleElement extends BaseElements.I18nElement{static get importMeta(){return bundledImportMeta$7;}static get template(){return(t=>{t.setAttribute("localizable-text","embedded");return t;})(html`
    <div id="base">
      <dom-repeat id="items" items="{{getArray(count)}}" on-dom-change="domChanged"><template>
        <span>
          <item-element lang="{{effectiveLang}}" observe-html-lang="{{observeHtmlLang}}"></item-element>
        </span>
      </template></dom-repeat>
    </div>
    <div id="save"></div>
<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {}
}
</json-data>
</template>
`);}static get is(){return'multiple-element';}static get config(){return{properties:{count:{type:Number,value:100}},listeners:{'lang-updated':'langUpdated'}};}getArray(count){var a=[];for(var i=0;i<count;i++){a.push(i);}return a;}domChanged(e){var nodes=dom(this.root).querySelectorAll('item-element');if(this.lang==='en'&&this.effectiveLang===''){this.effectiveLang='en';}//console.log('multiple-element: dom-change count = ' + nodes.length + ' lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
if(nodes.length===this.count&&(this.lang===this.effectiveLang||this.effectiveLang===''&&this.lang==='en')){Array.prototype.forEach.call(nodes,function(node){this.$.save.appendChild(node);}.bind(this));//console.log('multiple-element: local-dom-ready');
this.async(function(){this.fire('local-dom-ready');},500);}}langUpdated(e){var target=e.composedPath()[0];var lang=target.lang===''?'en':target.lang;this.itemLang=this.itemLang||{};if(target.tagName.toLowerCase()==='item-element'){//console.log('item-element: lang-updated lang = ' + target.lang);
this.itemLang[lang]=this.itemLang[lang]||0;this.itemLang[lang]++;}//console.log('multiple-element: ' + target.is + ' ' + 
//            'lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang +
//            ' itemLang[' + this.lang + '] = ' + this.itemLang[this.lang]);
if(this.itemLang[this.lang]===this.count){//console.log('count reached for ' + this.lang);
this.$.items.render();}return false;}}customElements.define(MultipleElement.is,MultipleElement);}break;case'thin':{Define=class MultipleElement extends BaseElements.I18nElement{static get config(){return{properties:{count:{type:Number,value:100}},listeners:{'lang-updated':'langUpdated'}};}getArray(count){var a=[];for(var i=0;i<count;i++){a.push(i);}return a;}domChanged(e){var nodes=dom(this.root).querySelectorAll('item-element');if(this.lang==='en'&&this.effectiveLang===''){this.effectiveLang='en';}//console.log('multiple-element: dom-change count = ' + nodes.length + ' lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
if(nodes.length===this.count&&(this.lang===this.effectiveLang||this.effectiveLang===''&&this.lang==='en')){Array.prototype.forEach.call(nodes,function(node){this.$.save.appendChild(node);}.bind(this));//console.log('multiple-element: local-dom-ready');
this.async(function(){this.fire('local-dom-ready');},500);}}langUpdated(e){var target=e.composedPath()[0];var lang=target.lang===''?'en':target.lang;this.itemLang=this.itemLang||{};if(target.tagName.toLowerCase()==='item-element'){//console.log('item-element: lang-updated lang = ' + target.lang);
this.itemLang[lang]=this.itemLang[lang]||0;this.itemLang[lang]++;}//console.log('multiple-element: ' + target.is + ' ' + 
//            'lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang +
//            ' itemLang[' + this.lang + '] = ' + this.itemLang[this.lang]);
if(this.itemLang[this.lang]===this.count){//console.log('count reached for ' + this.lang);
this.$.items.render();}return false;}};}break;case'legacy':{Polymer$1({importMeta:bundledImportMeta$7,_template:(t=>{t.setAttribute("localizable-text","embedded");return t;})(html`
    <div id="base">
      <dom-repeat id="items" items="{{getArray(count)}}" on-dom-change="domChanged"><template>
        <span>
          <item-element lang="{{effectiveLang}}" observe-html-lang="{{observeHtmlLang}}"></item-element>
        </span>
      </template></dom-repeat>
    </div>
    <div id="save"></div>
<template id="localizable-text">
<json-data>
{
  "meta": {},
  "model": {}
}
</json-data>
</template>
`),is:'multiple-element',behaviors:[BehaviorsStore.I18nBehavior],properties:{count:{type:Number,value:100}},listeners:{'lang-updated':'langUpdated'},getArray:function(count){var a=[];for(var i=0;i<count;i++){a.push(i);}return a;},domChanged:function(e){var nodes=dom(this.root).querySelectorAll('item-element');if(this.lang==='en'&&this.effectiveLang===''){this.effectiveLang='en';}//console.log('multiple-element: dom-change count = ' + nodes.length + ' lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang);
if(nodes.length===this.count&&(this.lang===this.effectiveLang||this.effectiveLang===''&&this.lang==='en')){Array.prototype.forEach.call(nodes,function(node){this.$.save.appendChild(node);}.bind(this));//console.log('multiple-element: local-dom-ready');
this.async(function(){this.fire('local-dom-ready');},500);}},langUpdated:function(e){var target=dom(e).rootTarget;var lang=target.lang===''?'en':target.lang;this.itemLang=this.itemLang||{};if(target.tagName.toLowerCase()==='item-element'){//console.log('item-element: lang-updated lang = ' + target.lang);
this.itemLang[lang]=this.itemLang[lang]||0;this.itemLang[lang]++;}//console.log('multiple-element: ' + target.is + ' ' + 
//            'lang-updated lang = ' + this.lang + ' effectiveLang = ' + this.effectiveLang +
//            ' itemLang[' + this.lang + '] = ' + this.itemLang[this.lang]);
if(this.itemLang[this.lang]===this.count){//console.log('count reached for ' + this.lang);
this.$.items.render();}return false;}});}break;}suite('I18nElement with '+(window.location.href.indexOf('?dom=Shadow')>=0?'Shadow DOM':'Shady DOM')+(' in '+syntax+' syntax'),function(){var lang0='';var lang1='en';var lang2='fr';var lang3='ja';var lang4='fr-CA';var lang5='zh-Hans-CN';var count1=100;var localDOM_multiple_element=[{select:'div item-element','$.label.textContent':'A'}];var suites=[s('multiple element',null,{fixture:'multiple-element-fixture',fixtureModel:{observeHtmlLang:false,lang:lang0,count:count1},assign:{lang:lang1},lang:lang1,effectiveLang:lang1,templateDefaultLang:lang1,observeHtmlLang:false,event:'local-dom-ready',text:{model:{}},model:{},localDOM:localDOM_multiple_element,lightDOM:undefined}),s(lang2+' multiple element','multiple element',{assign:{lang:lang2},lang:lang2,effectiveLang:lang2})];suitesRunner(suites,3000);});export{i18nBehavior as $i18nBehavior,arraySelector as $arraySelector,customStyle as $customStyle,domBind as $domBind,domIf as $domIf,domModule as $domModule,domRepeat as $domRepeat,_class as $class,legacyElementMixin as $legacyElementMixin,mutableDataBehavior as $mutableDataBehavior,polymerFn as $polymerFn,polymer_dom as $polymerDom,templatizerBehavior as $templatizerBehavior,dirMixin as $dirMixin,elementMixin as $elementMixin,gestureEventListeners as $gestureEventListeners,mutableData as $mutableData,propertiesChanged as $propertiesChanged,propertiesMixin as $propertiesMixin,propertyAccessors as $propertyAccessors,propertyEffects as $propertyEffects,templateStamp as $templateStamp,arraySplice as $arraySplice,async as $async,caseMap$1 as $caseMap,debounce as $debounce,flattenedNodesObserver as $flattenedNodesObserver,flush$2 as $flush,gestures$1 as $gestures,htmlTag as $htmlTag,mixin as $mixin,path as $path,renderStatus as $renderStatus,resolveUrl$1 as $resolveUrl,settings as $settings,styleGather as $styleGather,templatize$1 as $templatize,polymerElement as $polymerElement,polymerLegacy as $polymerLegacy,applyShimUtils as $applyShimUtils,applyShim as $applyShim$1,commonRegex as $commonRegex,commonUtils as $commonUtils,cssParse as $cssParse,customStyleInterface as $customStyleInterface$1,documentWait$1 as $documentWait,styleSettings as $styleSettings,styleUtil as $styleUtil,templateMap$1 as $templateMap,unscopedStyleHandler as $unscopedStyleHandler,deepcopy$1 as $deepcopy,plurals$1 as $plurals,BehaviorsStore$1 as BehaviorsStore,I18nControllerBehavior,_I18nBehavior,I18nBehavior,ArraySelectorMixin,ArraySelector,CustomStyle,DomBind,DomIf,DomModule,DomRepeat,mixinBehaviors,Class,LegacyElementMixin,MutableDataBehavior,OptionalMutableDataBehavior,Polymer$1 as Polymer,flush$1 as flush,enqueueDebouncer as addDebouncer,matchesSelector,DomApi,EventApi,dom,Templatizer,DirMixin,version,ElementMixin,instanceCount,registrations,register,dumpRegistrations,updateStyles,GestureEventListeners,MutableData,OptionalMutableData,PropertiesChanged,PropertiesMixin,PropertyAccessors,PropertyEffects,TemplateStamp,calculateSplices,timeOut,animationFrame,idlePeriod,microTask,dashToCamelCase,camelToDashCase,Debouncer,FlattenedNodesObserver,enqueueDebouncer,flush$1,gestures,recognizers,deepTargetFind,addListener,removeListener,register$1,setTouchAction,prevent,resetMouseCanceller,findOriginalTarget,add,remove,html,htmlLiteral,dedupingMixin,isPath,root,isAncestor,isDescendant,translate$1 as translate,matches,normalize,split,get,set,isDeep,flush as flush$2,beforeNextRender,afterNextRender,resolveUrl,resolveCss,pathFromUrl,useShadow,useNativeCSSProperties,useNativeCustomElements,rootPath,setRootPath,sanitizeDOMValue,setSanitizeDOMValue,passiveTouchGestures,setPassiveTouchGestures,strictTemplatePolicy,setStrictTemplatePolicy,allowTemplateFromDomModule,setAllowTemplateFromDomModule,stylesFromModules,stylesFromModule,stylesFromTemplate,stylesFromModuleImports,cssFromModules,cssFromModule,cssFromTemplate,cssFromModuleImports,templatize,modelForElement,TemplateInstanceBase,html as html$1,version as version$1,PolymerElement,Polymer$1,html as html$2,Base,invalidate,invalidateTemplate,isValid,templateIsValid,isValidating,templateIsValidating,startValidating,startValidatingTemplate,elementsAreInvalid,ApplyShim as $applyShimDefault,VAR_ASSIGN,MIXIN_MATCH,VAR_CONSUMED,ANIMATION_MATCH,MEDIA_MATCH,IS_VAR,BRACKETED,HOST_PREFIX,HOST_SUFFIX,updateNativeProperties,getComputedStyleValue,detectMixin,StyleNode,parse,stringify,removeCustomPropAssignment,types,CustomStyleProvider,CustomStyleInterface as $customStyleInterfaceDefault,CustomStyleInterfaceInterface,documentWait as $documentWaitDefault,nativeShadow,cssBuild,nativeCssVariables,toCssText,rulesForStyle,isKeyframesSelector,forEachRule,applyCss,createScopeStyle,applyStylePlaceHolder,applyStyle,isTargetedBuild,findMatchingParen,processVariableAndFallback,setElementClassRaw,wrap,getIsExtends,gatherStyleText,splitSelectorList,getCssBuild,elementHasBuiltCss,getBuildComment,isOptimalCssBuild,templateMap as $templateMapDefault,scopingAttribute,processUnscopedStyle,isUnscopedStyle,deepcopy as $deepcopyDefault,plurals as $pluralsDefault};