'use strict';var _get=function get(object,property,receiver){if(object===null)object=Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc===undefined){var parent=Object.getPrototypeOf(object);if(parent===null){return undefined;}else{return get(parent,property,receiver);}}else if("value"in desc){return desc.value;}else{var getter=desc.get;if(getter===undefined){return undefined;}return getter.call(receiver);}};var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}window.Polymer=window.Polymer||{};(function(){var modules={};var lcModules={};var findModule=function findModule(id){return modules[id]||lcModules[id.toLowerCase()];};/**
   * The `dom-module` element registers the dom it contains to the name given
   * by the module's id attribute. It provides a unified database of dom
   * accessible via any dom-module element. Use the `import(id, selector)`
   * method to locate dom within this database. For example,
   *
   * <dom-module id="foo">
   *   <img src="stuff.png">
   * </dom-module>
   *
   * Then in code in some other location that cannot access the dom-module above
   *
   * var img = document.createElement('dom-module').import('foo', 'img');
   *
   */var DomModule=function(_HTMLElement){_inherits(DomModule,_HTMLElement);function DomModule(){_classCallCheck(this,DomModule);return _possibleConstructorReturn(this,(DomModule.__proto__||Object.getPrototypeOf(DomModule)).apply(this,arguments));}_createClass(DomModule,[{key:'attributeChangedCallback',value:function attributeChangedCallback(){this.register();}},{key:'_styleOutsideTemplateCheck',value:function _styleOutsideTemplateCheck(){if(this.querySelector('style')){console.warn('dom-module %s has style outside template',this.id);}}/**
     * Registers the dom-module at a given id. This method should only be called
     * when a dom-module is imperatively created. For
     * example, `document.createElement('dom-module').register('foo')`.
     * @method register
     * @param {String} id The id at which to register the dom-module.
     */},{key:'register',value:function register(id){id=id||this.id;if(id){this.id=id;// store id separate from lowercased id so that
// in all cases mixedCase id will stored distinctly
// and lowercase version is a fallback
modules[id]=this;lcModules[id.toLowerCase()]=this;this._styleOutsideTemplateCheck();}}/**
     * Retrieves the dom specified by `selector` in the module specified by
     * `id`. For example, this.import('foo', 'img');
     * @method register
     * @param {String} id
     * @param {String} selector
     * @return {Object} Returns the dom which matches `selector` in the module
     * at the specified `id`.
     */},{key:'import',value:function _import(id,selector){if(id){var m=findModule(id);if(m&&selector){return m.querySelector(selector);}return m;}}}],[{key:'observedAttributes',get:function get(){return['id'];}}]);return DomModule;}(HTMLElement);customElements.define('dom-module',DomModule);// export
Polymer.DomModule=new DomModule();Polymer.DomModule.modules=modules;})();(function(){'use strict';var p=Element.prototype;var _matchesSelector=p.matches||p.matchesSelector||p.mozMatchesSelector||p.msMatchesSelector||p.oMatchesSelector||p.webkitMatchesSelector;Polymer.Utils={/**
     * Copies props from a source object to a target object.
     *
     * Note, this method uses a simple `for...in` strategy for enumerating
     * properties.  To ensure only `ownProperties` are copied from source
     * to target and that accessor implementations are copied, use `extend`.
     *
     * @method mixin
     * @param {Object} target Target object to copy properties to.
     * @param {Object} source Source object to copy properties from.
     * @return {Object} Target object that was passed as first argument.
     */mixin:function mixin(target,source){for(var i in source){target[i]=source[i];}return target;},/**
     * Copies own properties (including accessor descriptors) from a source
     * object to a target object.
     *
     * @method extend
     * @param {Object} prototype Target object to copy properties to.
     * @param {Object} api Source object to copy properties from.
     * @return {Object} prototype object that was passed as first argument.
     */extend:function extend(prototype,api){if(prototype&&api){var n$=Object.getOwnPropertyNames(api);for(var i=0,n;i<n$.length&&(n=n$[i]);i++){this.copyOwnProperty(n,api,prototype);}}return prototype||api;},copyOwnProperty:function copyOwnProperty(name,source,target){var pd=Object.getOwnPropertyDescriptor(source,name);if(pd){Object.defineProperty(target,name,pd);}},// only needed for v0 native ShadowDOM support
getRootNode:function getRootNode(node){if(node.getRootNode){return node.getRootNode();}if(!node){return null;}while(node&&node.parentNode){node=node.parentNode;}return node;},matchesSelector:function matchesSelector(node,selector){return _matchesSelector.call(node,selector);},cachingMixin:function cachingMixin(mixin){return function(base){if(!mixin.__mixinApplications){mixin.__mixinApplications=new WeakMap();}var application=mixin.__mixinApplications.get(base);if(!application){application=mixin(base);mixin.__mixinApplications.set(base,application);}return application;};},dedupingMixin:function dedupingMixin(mixin){mixin=this.cachingMixin(mixin);return function(base){var baseMap=base.__mixinMap;if(baseMap&&baseMap.get(mixin)){return base;}else{var extended=mixin(base);extended.__mixinMap=new Map(baseMap);extended.__mixinMap.set(mixin,true);return extended;}};}};})();Polymer.CaseMap={_caseMap:{},_rx:{dashToCamel:/-[a-z]/g,camelToDash:/([A-Z])/g},dashToCamelCase:function dashToCamelCase(dash){return this._caseMap[dash]||(this._caseMap[dash]=dash.indexOf('-')<0?dash:dash.replace(this._rx.dashToCamel,function(m){return m[1].toUpperCase();}));},camelToDashCase:function camelToDashCase(camel){return this._caseMap[camel]||(this._caseMap[camel]=camel.replace(this._rx.camelToDash,'-$1').toLowerCase());}};(function(){'use strict';function createNodeEventHandler(context,eventName,methodName){context=context._rootDataHost||context;var handler=function handler(e){if(context[methodName]){context[methodName](e,e.detail);}else{console.warn('listener method `'+methodName+'` not defined');}};return handler;}Polymer.EventListeners=Polymer.Utils.dedupingMixin(function(superClass){return function(_superClass){_inherits(EventListeners,_superClass);function EventListeners(){_classCallCheck(this,EventListeners);return _possibleConstructorReturn(this,(EventListeners.__proto__||Object.getPrototypeOf(EventListeners)).apply(this,arguments));}_createClass(EventListeners,[{key:'_addMethodEventListenerToNode',value:function _addMethodEventListenerToNode(node,eventName,methodName,context){context=context||node;var handler=createNodeEventHandler(context,eventName,methodName);this._addEventListenerToNode(node,eventName,handler);return handler;}},{key:'_addEventListenerToNode',value:function _addEventListenerToNode(node,eventName,handler){node.addEventListener(eventName,handler);}},{key:'_removeEventListenerFromNode',value:function _removeEventListenerFromNode(node,eventName,handler){node.removeEventListener(eventName,handler);}}]);return EventListeners;}(superClass);});})();(function(){// path fixup for urls in cssText that's expected to
// come from a given ownerDocument
function resolveCss(cssText,ownerDocument){return cssText.replace(CSS_URL_RX,function(m,pre,url,post){return pre+'\''+resolve(url.replace(/["']/g,''),ownerDocument)+'\''+post;});}// url fixup for urls in an element's attributes made relative to
// ownerDoc's base url
function resolveAttrs(element,ownerDocument){for(var name in URL_ATTRS){var a$=URL_ATTRS[name];for(var i=0,l=a$.length,a,at,v;i<l&&(a=a$[i]);i++){if(name==='*'||element.localName===name){at=element.attributes[a];v=at&&at.value;if(v&&v.search(BINDING_RX)<0){at.value=a==='style'?resolveCss(v,ownerDocument):resolve(v,ownerDocument);}}}}}function resolve(url,ownerDocument){// do not resolve '#' links, they are used for routing
if(url&&ABS_URL.test(url)){return url;}var resolver=getUrlResolver(ownerDocument);resolver.href=url;return resolver.href||url;}var tempDoc;var tempDocBase;function resolveUrl(url,baseUri){if(!tempDoc){tempDoc=document.implementation.createHTMLDocument('temp');tempDocBase=tempDoc.createElement('base');tempDoc.head.appendChild(tempDocBase);}tempDocBase.href=baseUri;return resolve(url,tempDoc);}function getUrlResolver(ownerDocument){return ownerDocument.__urlResolver||(ownerDocument.__urlResolver=ownerDocument.createElement('a'));}var CSS_URL_RX=/(url\()([^)]*)(\))/g;var URL_ATTRS={'*':['href','src','style','url'],form:['action']};var ABS_URL=/(^\/)|(^#)|(^[\w-\d]*:)/;var BINDING_RX=/\{\{|\[\[/;// exports
Polymer.ResolveUrl={resolveCss:resolveCss,resolveAttrs:resolveAttrs,resolveUrl:resolveUrl};})();/**
 * Scans a template to produce an annotation list that that associates
 * metadata culled from markup with tree locations
 * metadata and information to associate the metadata with nodes in an instance.
 *
 * Supported expressions include:
 *
 * Double-mustache annotations in text content. The annotation must be the only
 * content in the tag, compound expressions are not supported.
 *
 *     <[tag]>{{annotation}}<[tag]>
 *
 * Double-escaped annotations in an attribute, either {{}} or [[]].
 *
 *     <[tag] someAttribute="{{annotation}}" another="[[annotation]]"><[tag]>
 *
 * `on-` style event declarations.
 *
 *     <[tag] on-<event-name>="annotation"><[tag]>
 *
 * Note that the `annotations` feature does not implement any behaviors
 * associated with these expressions, it only captures the data.
 *
 * Generated data-structure:
 *
 *     [
 *       {
 *         id: '<id>',
 *         events: [
 *           {
 *             name: '<name>'
 *             value: '<annotation>'
 *           }, ...
 *         ],
 *         bindings: [
 *           {
 *             kind: ['text'|'attribute'],
 *             mode: ['{'|'['],
 *             name: '<name>'
 *             value: '<annotation>'
 *           }, ...
 *         ],
 *         // TODO(sjmiles): this is annotation-parent, not node-parent
 *         parent: <reference to parent annotation object>,
 *         index: <integer index in parent's childNodes collection>
 *       },
 *       ...
 *     ]
 *
 * @class Annotations feature
 */(function(){'use strict';// null-array (shared empty array to avoid null-checks)
var emptyArray=[];var bindingRegex=function(){var IDENT='(?:'+'[a-zA-Z_$][\\w.:$\\-*]*'+')';var NUMBER='(?:'+'[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?'+')';var SQUOTE_STRING='(?:'+'\'(?:[^\'\\\\]|\\\\.)*\''+')';var DQUOTE_STRING='(?:'+'"(?:[^"\\\\]|\\\\.)*"'+')';var STRING='(?:'+SQUOTE_STRING+'|'+DQUOTE_STRING+')';var ARGUMENT='(?:'+IDENT+'|'+NUMBER+'|'+STRING+'\\s*'+')';var ARGUMENTS='(?:'+ARGUMENT+'(?:,\\s*'+ARGUMENT+')*'+')';var ARGUMENT_LIST='(?:'+'\\(\\s*'+'(?:'+ARGUMENTS+'?'+')'+'\\)\\s*'+')';var BINDING='('+IDENT+'\\s*'+ARGUMENT_LIST+'?'+')';// Group 3
var OPEN_BRACKET='(\\[\\[|{{)'+'\\s*';var CLOSE_BRACKET='(?:]]|}})';var NEGATE='(?:(!)\\s*)?';// Group 2
var EXPRESSION=OPEN_BRACKET+NEGATE+BINDING+CLOSE_BRACKET;return new RegExp(EXPRESSION,"g");}();var insertionPointTag='slot';var currentTemplate=void 0;function parseTemplateAnnotations(template){// TODO(kschaaf): File issue and/or remove when fixed
// hold a reference to content as _content to prevent odd Chrome gc issue
// nested templates also may receive their content as _content
var content=template._content=template._content||template.content;// since a template may be re-used, memo-ize notes.
if(!content._notes){console.log('parseTemplateAnnotations started at ',new Error().stack,' for ',template.innerHTML);content._notes=[];// TODO(sorvell): whitespace and processAnnotations need to be factored
// into plugins
// TODO(kschaaf): template should be threaded through rather than implied state
currentTemplate=currentTemplate||template;parseNodeAnnotations(content,content._notes,template.hasAttribute('strip-whitespace'));console.log('parseTemplateAnnotations',content._notes.length,content._notes,template.innerHTML);}else{console.log('parseTemplateAnnotations does nothing ',content._notes.length,content._notes,template);}return content._notes;}// add annotations gleaned from subtree at `node` to `list`
function parseNodeAnnotations(node,list,stripWhiteSpace){return node.nodeType===Node.TEXT_NODE?parseTextNodeAnnotation(node,list):// TODO(sjmiles): are there other nodes we may encounter
// that are not TEXT_NODE but also not ELEMENT?
parseElementAnnotations(node,list,stripWhiteSpace);}// TODO(kschaaf): We could modify this to allow an escape mechanism by
// looking for the escape sequence in each of the matches and converting
// the part back to a literal type, and then bailing if only literals
// were found
function parseBindings(text){var parts=[];var lastIndex=0;var m=void 0;// Example: "literal1{{prop}}literal2[[!compute(foo,bar)]]final"
// Regex matches:
//        Iteration 1:  Iteration 2:
// m[1]: '{{'          '[['
// m[2]: ''            '!'
// m[3]: 'prop'        'compute(foo,bar)'
while((m=bindingRegex.exec(text))!==null){// Add literal part
if(m.index>lastIndex){parts.push({literal:text.slice(lastIndex,m.index)});}// Add binding part
// Mode (one-way or two)
var mode=m[1][0];var negate=Boolean(m[2]);var value=m[3].trim();var customEvent=void 0,notifyEvent=void 0,colon=void 0;if(mode=='{'&&(colon=value.indexOf('::'))>0){notifyEvent=value.substring(colon+2);value=value.substring(0,colon);customEvent=true;}parts.push({compoundIndex:parts.length,value:value,mode:mode,negate:negate,event:notifyEvent,customEvent:customEvent});lastIndex=bindingRegex.lastIndex;}// Add a final literal part
if(lastIndex&&lastIndex<text.length){var literal=text.substring(lastIndex);if(literal){parts.push({literal:literal});}}if(parts.length){return parts;}}function literalFromParts(parts){var s='';for(var i=0;i<parts.length;i++){var literal=parts[i].literal;s+=literal||'';}return s;}// add annotations gleaned from TextNode `node` to `list`
function parseTextNodeAnnotation(node,list){var parts=parseBindings(node.textContent);//console.log('parseTextNodeAnnotation', node, node.textContent);
if(parts){// Initialize the textContent with any literal parts
// NOTE: default to a space here so the textNode remains; some browsers
// (IE) evacipate an empty textNode following cloneNode/importNode.
node.textContent=literalFromParts(parts)||' ';var note={bindings:[{kind:'text',name:'textContent',parts:parts,isCompound:parts.length!==1}]};list.push(note);//console.log('list[' + (list.length - 1) + ']', note, 'parseTextNodeAnnotation');
return note;}}// add annotations gleaned from Element `node` to `list`
function parseElementAnnotations(element,list,stripWhiteSpace){var note={bindings:[],events:[]};if(element.localName===insertionPointTag){list._hasInsertionPoint=true;}parseChildNodesAnnotations(element,note,list,stripWhiteSpace);// TODO(sjmiles): is this for non-ELEMENT nodes? If so, we should
// change the contract of this method, or filter these out above.
if(element.attributes){parseNodeAttributeAnnotations(element,note,list);// TODO(sorvell): ad hoc callback for doing work on elements while
// leveraging annotator's tree walk.
// Consider adding an node callback registry and moving specific
// processing out of this module.
prepElement(element);}if(note.bindings.length||note.events.length||note.id){list.push(note);//console.log('list[' + (list.length - 1) + ']', note, 'parseElementAnnotations');
}return note;}// add annotations gleaned from children of `root` to `list`, `root`'s
// `note` is supplied as it is the note.parent of added annotations
function parseChildNodesAnnotations(root,note,list,stripWhiteSpace){if(root.firstChild){var node=root.firstChild;var i=0;while(node){// BREAKME(kschaaf): pseudo-bc auto-wrapper for template type extensions
if(node.localName==='template'){var t=node;var is=t.getAttribute('is');if(is){t.removeAttribute('is');node=t.ownerDocument.createElement(is);root.replaceChild(node,t);node.appendChild(t);while(t.attributes.length){node.setAttribute(t.attributes[0].name,t.attributes[0].value);t.removeAttribute(t.attributes[0].name);}}}if(node.localName==='template'&&!node.hasAttribute('preserve-content')){parseTemplate(node,i,list,note);}// collapse adjacent textNodes: fixes an IE issue that can cause
// text nodes to be inexplicably split =(
// note that root.normalize() should work but does not so we do this
// manually.
var next=node.nextSibling;if(node.nodeType===Node.TEXT_NODE){var n=next;while(n&&n.nodeType===Node.TEXT_NODE){node.textContent+=n.textContent;next=n.nextSibling;root.removeChild(n);n=next;}// optionally strip whitespace
if(stripWhiteSpace&&!node.textContent.trim()){root.removeChild(node);// decrement index since node is removed
i--;}}// if this node didn't get evacipated, parse it.
if(node.parentNode){var childAnnotation=parseNodeAnnotations(node,list,stripWhiteSpace);if(childAnnotation){childAnnotation.parent=note;childAnnotation.index=i;}}node=next;i++;}}}// 1. Parse annotations from the template and memoize them on
//    content._notes (recurses into nested templates)
// 2. Remove template.content and store it in annotation list, where it
//    will be the responsibility of the host to set it back to the template
//    (this is both an optimization to avoid re-stamping nested template
//    children and avoids a bug in Chrome where nested template children
//    upgrade)
function parseTemplate(node,index,list,parent){var content=document.createDocumentFragment();content._notes=parseTemplateAnnotations(node);content.appendChild(node.content);list.push({bindings:emptyArray,events:emptyArray,templateContent:content,parent:parent,index:index});//console.log('list[' + (list.length - 1) + ']', list[list.length - 1], 'parseTemplate');
}// add annotation data from attributes to the `annotation` for node `node`
// TODO(sjmiles): the distinction between an `annotation` and
// `annotation data` is not as clear as it could be
function parseNodeAttributeAnnotations(node,annotation){// Make copy of original attribute list, since the order may change
// as attributes are added and removed
var attrs=Array.prototype.slice.call(node.attributes);for(var i=attrs.length-1,a;a=attrs[i];i--){var n=a.name;var v=a.value;var b=void 0;// events (on-*)
if(n.slice(0,3)==='on-'){node.removeAttribute(n);annotation.events.push({name:n.slice(3),value:v});}// bindings (other attributes)
else if(b=parseNodeAttributeAnnotation(node,n,v)){annotation.bindings.push(b);}// static id
else if(n==='id'){annotation.id=v;}}}// construct annotation data from a generic attribute, or undefined
function parseNodeAttributeAnnotation(node,name,value){var parts=parseBindings(value);if(parts){// Attribute or property
var origName=name;var kind='property';if(name[name.length-1]=='$'){name=name.slice(0,-1);kind='attribute';}// Initialize attribute bindings with any literal parts
var literal=literalFromParts(parts);if(literal&&kind=='attribute'){node.setAttribute(name,literal);}// Clear attribute before removing, since IE won't allow removing
// `value` attribute if it previously had a value (can't
// unconditionally set '' before removing since attributes with `$`
// can't be set using setAttribute)
if(node.localName==='input'&&origName==='value'){node.setAttribute(origName,'');}// Remove annotation
node.removeAttribute(origName);// Case hackery: attributes are lower-case, but bind targets
// (properties) are case sensitive. Gambit is to map dash-case to
// camel-case: `foo-bar` becomes `fooBar`.
// Attribute bindings are excepted.
var propertyName=Polymer.CaseMap.dashToCamelCase(name);if(kind==='property'){name=propertyName;}//console.log('parseNodeAttributeAnnotation', parts.map(function(i) { return i.value; }).join(';'));
return{kind:kind,name:name,propertyName:propertyName,parts:parts,literal:literal,isCompound:parts.length!==1};}}// TODO(sorvell): this should be factored into a plugin
function prepElement(element){Polymer.ResolveUrl.resolveAttrs(element,currentTemplate.ownerDocument);}Polymer.Annotations=Polymer.Utils.dedupingMixin(function(superClass){return function(_superClass2){_inherits(Annotations,_superClass2);function Annotations(){_classCallCheck(this,Annotations);return _possibleConstructorReturn(this,(Annotations.__proto__||Object.getPrototypeOf(Annotations)).apply(this,arguments));}_createClass(Annotations,[{key:'_parseTemplateAnnotations',// preprocess-time
// construct and return a list of annotation records
// by scanning `template`'s content
//
// TODO(sorvell): This should just crawl over a template and call
// a supplied list of callbacks.
value:function _parseTemplateAnnotations(template){return parseTemplateAnnotations(template);}// instance-time
// TODO(sorvell): consider trying to use QS instead of this proprietary
// search. This would require some unique way to identify a node, a guid.
// Is this faster? simpler? Is that worth polluting the node?
},{key:'_findTemplateAnnotatedNode',value:function _findTemplateAnnotatedNode(root,note){// recursively ascend tree until we hit root
var parent=note.parent&&this._findTemplateAnnotatedNode(root,note.parent);// unwind the stack, returning the indexed node at each level
if(parent){// note: marginally faster than indexing via childNodes
// (http://jsperf.com/childnodes-lookup)
for(var n=parent.firstChild,i=0;n;n=n.nextSibling){if(note.index===i++){return n;}}}else{return root;}}}]);return Annotations;}(superClass);});})();(function(){'use strict';/**
   * Scans a template to produce an annotation object that stores expression
   * metadata along with information to associate the metadata with nodes in an
   * instance.
   *
   * Elements with `id` in the template are noted and marshaled into an
   * the `$` hash in an instance.
   *
   * Example
   *
   *     &lt;template>
   *       &lt;div id="foo">&lt;/div>
   *     &lt;/template>
   *     &lt;script>
   *      Polymer({
   *        task: function() {
   *          this.$.foo.style.color = 'red';
   *        }
   *      });
   *     &lt;/script>
   *
   * Other expressions that are noted include:
   *
   * Double-mustache annotations in text content. The annotation must be the only
   * content in the tag, compound expressions are not (currently) supported.
   *
   *     <[tag]>{{path.to.host.property}}<[tag]>
   *
   * Double-mustache annotations in an attribute.
   *
   *     <[tag] someAttribute="{{path.to.host.property}}"><[tag]>
   *
   * Only immediate host properties can automatically trigger side-effects.
   * Setting `host.path` in the example above triggers the binding, setting
   * `host.path.to.host.property` does not.
   *
   * `on-` style event declarations.
   *
   *     <[tag] on-<event-name>="{{hostMethodName}}"><[tag]>
   *
   * Note: **the `annotations` feature does not actually implement the behaviors
   * associated with these expressions, it only captures the data**.
   *
   * Other optional features contain actual data implementations.
   *
   * @class standard feature: annotations
   *//*

  Scans a template to produce an annotation map that stores expression metadata
  and information that associates the metadata to nodes in a template instance.

  Supported annotations are:

    * id attributes
    * binding annotations in text nodes
      * double-mustache expressions: {{expression}}
      * double-bracket expressions: [[expression]]
    * binding annotations in attributes
      * attribute-bind expressions: name="{{expression}} || [[expression]]"
      * property-bind expressions: name*="{{expression}} || [[expression]]"
      * property-bind expressions: name:="expression"
    * event annotations
      * event delegation directives: on-<eventName>="expression"

  Generated data-structure:

    [
      {
        id: '<id>',
        events: [
          {
            mode: ['auto'|''],
            name: '<name>'
            value: '<expression>'
          }, ...
        ],
        bindings: [
          {
            kind: ['text'|'attribute'|'property'],
            mode: ['auto'|''],
            name: '<name>'
            value: '<expression>'
          }, ...
        ],
        // TODO(sjmiles): confusingly, this is annotation-parent, not node-parent
        parent: <reference to parent annotation>,
        index: <integer index in parent's childNodes collection>
      },
      ...
    ]

  TODO(sjmiles): this module should produce either syntactic metadata
  (e.g. double-mustache, double-bracket, star-attr), or semantic metadata
  (e.g. manual-bind, auto-bind, property-bind). Right now it's half and half.

  */// construct `$` map (from id annotations)
function applyIdToMap(inst,map,dom,note){if(note.id){map[note.id]=inst._findTemplateAnnotatedNode(dom,note);}}// install event listeners (from event annotations)
function applyEventListener(inst,dom,note,host){if(note.events&&note.events.length){var node=inst._findTemplateAnnotatedNode(dom,note);for(var j=0,e$=note.events,e;j<e$.length&&(e=e$[j]);j++){inst._addMethodEventListenerToNode(node,e.name,e.value,host);}}}// push configuration references at configure time
function applyTemplateContent(inst,dom,note){if(note.templateContent){var node=inst._findTemplateAnnotatedNode(dom,note);node._content=note.templateContent;}}Polymer.TemplateStamp=Polymer.Utils.dedupingMixin(function(superClass){return function(_Polymer$Annotations){_inherits(TemplateStamp,_Polymer$Annotations);function TemplateStamp(){_classCallCheck(this,TemplateStamp);var _this4=_possibleConstructorReturn(this,(TemplateStamp.__proto__||Object.getPrototypeOf(TemplateStamp)).call(this));_this4.$=null;return _this4;}_createClass(TemplateStamp,[{key:'_stampTemplate',value:function _stampTemplate(template){// Polyfill support: bootstrap the template if it has not already been
if(template&&!template.content&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate){HTMLTemplateElement.decorate(template);}var notes=this._parseTemplateAnnotations(template);var dom=document.importNode(template._content||template.content,true);// NOTE: ShadyDom optimization indicating there is an insertion point
dom.__noInsertionPoint=!notes._hasInsertionPoint;this.$={};for(var i=0,l=notes.length,note;i<l&&(note=notes[i]);i++){applyIdToMap(this,this.$,dom,note);applyTemplateContent(this,dom,note);applyEventListener(this,dom,note,this);}return dom;}}]);return TemplateStamp;}(Polymer.Annotations(Polymer.EventListeners(superClass)));});})();Polymer.Path={root:function root(path){var dotIndex=path.indexOf('.');if(dotIndex===-1){return path;}return path.slice(0,dotIndex);},isDeep:function isDeep(path){return path.indexOf('.')!==-1;},// Given `base` is `foo.bar`, `foo` is an ancestor, `foo.bar` is not
isAncestor:function isAncestor(base,path){//     base.startsWith(path + '.');
return base.indexOf(path+'.')===0;},// Given `base` is `foo.bar`, `foo.bar.baz` is an descendant
isDescendant:function isDescendant(base,path){//     path.startsWith(base + '.');
return path.indexOf(base+'.')===0;},// can be read as:  from  to       path
translate:function translate(base,newBase,path){// Defense?
return newBase+path.slice(base.length);},matches:function matches(base,path){return base===path||this.isAncestor(base,path)||this.isDescendant(base,path);},// Converts array-based paths to flattened path, optionally split into array
normalize:function normalize(path,split){if(Array.isArray(path)){var parts=[];for(var i=0;i<path.length;i++){var args=path[i].toString().split('.');for(var j=0;j<args.length;j++){parts.push(args[j]);}}return split?parts:parts.join('.');}else{return split?path.toString().split('.'):path;}},get:function get(root,path,info){var prop=root;var parts=this.normalize(path,true);// Loop over path parts[0..n-1] and dereference
for(var i=0;i<parts.length;i++){if(!prop){return;}var part=parts[i];prop=prop[part];}if(info){info.path=parts.join('.');}return prop;},set:function set(root,path,value){var prop=root;var parts=this.normalize(path,true);var last=parts[parts.length-1];if(parts.length>1){// Loop over path parts[0..n-2] and dereference
for(var i=0;i<parts.length-1;i++){var part=parts[i];prop=prop[part];if(!prop){return;}}// Set value to object at end of path
prop[last]=value;}else{// Simple property set
prop[path]=value;}return parts.join('.');}};(function(){'use strict';// Save map of native properties
var nativeProperties={};var proto=HTMLElement.prototype;while(proto){var props=Object.getOwnPropertyNames(proto);for(var i=0;i<props.length;i++){nativeProperties[props[i]]=true;}proto=Object.getPrototypeOf(proto);}function saveAccessorValue(model,property){// Don't read/store value for any native properties since they could throw
if(!nativeProperties[property]){var value=model[property];if(value!==undefined){if(!model.__dataProto){model.__dataProto={};}else if(!model.hasOwnProperty('__dataProto')){model.__dataProto=Object.create(model.__dataProto);}model.__dataProto[property]=value;}}}Polymer.PropertyAccessors=Polymer.Utils.dedupingMixin(function(superClass){return function(_superClass3){_inherits(PropertyAccessors,_superClass3);function PropertyAccessors(){_classCallCheck(this,PropertyAccessors);var _this5=_possibleConstructorReturn(this,(PropertyAccessors.__proto__||Object.getPrototypeOf(PropertyAccessors)).call(this));_this5._initializeProperties();return _this5;}_createClass(PropertyAccessors,[{key:'_initializeProperties',value:function _initializeProperties(){this.__data={};this.__dataPending=null;this.__dataOld=null;this.__dataInvalid=false;}},{key:'_createPropertyAccessor',value:function _createPropertyAccessor(property,readOnly){saveAccessorValue(this,property);Object.defineProperty(this,property,{get:function get(){return this.__data&&this.__data[property];},set:readOnly?function(){}:function(value){this._setProperty(property,value);}});}},{key:'_setProperty',value:function _setProperty(property,value){if(this._setPendingProperty(property,value)){this._invalidateProperties();}}},{key:'_setPendingProperty',value:function _setPendingProperty(property,value){var old=this.__data[property];if(this._shouldPropChange(value,old)){if(!this.__dataPending){this.__dataPending={};this.__dataOld={};}// Ensure old is captured from the last turn
if(!(property in this.__dataOld)){this.__dataOld[property]=old;}this.__data[property]=value;this.__dataPending[property]=value;return true;}}},{key:'_invalidateProperties',value:function _invalidateProperties(){var _this6=this;if(!this.__dataInvalid){this.__dataInvalid=true;Promise.resolve().then(function(){if(_this6.__dataInvalid){_this6.__dataInvalid=false;_this6._flushProperties();}});}}},{key:'_flushProperties',value:function _flushProperties(){var oldProps=this.__dataOld;var changedProps=this.__dataPending;this.__dataPending=null;this._propertiesChanged(this.__data,changedProps,oldProps);}},{key:'_propertiesChanged',value:function _propertiesChanged(inst,currentProps,changedProps,oldProps){// eslint-disable-line no-unused-vars
}},{key:'_shouldPropChange',value:function _shouldPropChange(value,old){return old!==value&&(old===old||value===value)||(typeof value==='undefined'?'undefined':_typeof(value))=='object';}}]);return PropertyAccessors;}(superClass);});})();(function(){'use strict';var caseMap=Polymer.CaseMap;Polymer.Attributes=Polymer.Utils.dedupingMixin(function(superClass){return function(_superClass4){_inherits(Attributes,_superClass4);function Attributes(){_classCallCheck(this,Attributes);var _this7=_possibleConstructorReturn(this,(Attributes.__proto__||Object.getPrototypeOf(Attributes)).call(this));_this7.__serializing=false;return _this7;}/**
       * Ensures the element has the given attribute. If it does not,
       * assigns the given value to the attribute.
       *
       *
       * @method _ensureAttribute
       * @param {string} attribute Name of attribute to ensure is set.
       * @param {string} value of the attribute.
       */_createClass(Attributes,[{key:'_ensureAttribute',value:function _ensureAttribute(attribute,value){if(!this.hasAttribute(attribute)){this._valueToNodeAttribute(this,value,attribute);}}/**
       * Deserializes an attribute to its associated property.
       *
       * This method calls the `_deserializeAttribute` method to convert the string to
       * a typed value.
       *
       * @method _attributeToProperty
       * @param {string} attribute Name of attribute to deserialize.
       * @param {string} value of the attribute.
       * @param {*} type type to deserialize to.
       */},{key:'_attributeToProperty',value:function _attributeToProperty(attribute,value,type){// Don't deserialize back to property if currently reflecting
if(!this.__serializing){var property=caseMap.dashToCamelCase(attribute);this[property]=this._deserializeAttribute(value,type);}}/**
       * Serializes a property to its associated attribute.
       *
       * @method _propertyToAttribute
       * @param {string} property Property name to reflect.
       * @param {*=} attribute Attribute name to reflect.
       * @param {*=} value Property value to refect.
       */},{key:'_propertyToAttribute',value:function _propertyToAttribute(property,attribute,value){this.__serializing=true;value=value===undefined?this[property]:value;this._valueToNodeAttribute(this,value,attribute||caseMap.camelToDashCase(property));this.__serializing=false;}/**
       * Sets a typed value to an HTML attribute on a node.
       *
       * This method calls the `_serializeAttribute` method to convert the typed
       * value to a string.  If the `_serializeAttribute` method returns `undefined`,
       * the attribute will be removed (this is the default for boolean
       * type `false`).
       *
       * @method _valueToAttribute
       * @param {Element=} node Element to set attribute to.
       * @param {*} value Value to serialize.
       * @param {string} attribute Attribute name to serialize to.

       */},{key:'_valueToNodeAttribute',value:function _valueToNodeAttribute(node,value,attribute){var str=this._serializeAttribute(value);if(str===undefined){node.removeAttribute(attribute);}else{node.setAttribute(attribute,str);}}/**
       * Converts a typed value to a string.
       *
       * This method is called by Polymer when setting JS property values to
       * HTML attributes.  Users may override this method on Polymer element
       * prototypes to provide serialization for custom types.
       *
       * @method _serializeAttribute
       * @param {*} value Property value to serialize.
       * @return {string} String serialized from the provided property value.
       */},{key:'_serializeAttribute',value:function _serializeAttribute(value){/* eslint-disable no-fallthrough */switch(typeof value==='undefined'?'undefined':_typeof(value)){case'boolean':return value?'':undefined;case'object':if(value instanceof Date){return value;}else if(value){try{return JSON.stringify(value);}catch(x){return'';}}default:return value!=null?value:undefined;}}/**
       * Converts a string to a typed value.
       *
       * This method is called by Polymer when reading HTML attribute values to
       * JS properties.  Users may override this method on Polymer element
       * prototypes to provide deserialization for custom `type`s.  Note,
       * the `type` argument is the value of the `type` field provided in the
       * `properties` configuration object for a given property, and is
       * by convention the constructor for the type to deserialize.
       *
       * Note: The return value of `undefined` is used as a sentinel value to
       * indicate the attribute should be removed.
       *
       * @method _deserializeAttribute
       * @param {string} value Attribute value to deserialize.
       * @param {*} type Type to deserialize the string to.
       * @return {*} Typed value deserialized from the provided string.
       */},{key:'_deserializeAttribute',value:function _deserializeAttribute(value,type){switch(type){case Number:value=Number(value);break;case Boolean:value=value!==null;break;case Object:try{value=JSON.parse(value);}catch(x){// allow non-JSON literals like Strings and Numbers
}break;case Array:try{value=JSON.parse(value);}catch(x){value=null;console.warn('Polymer::Attributes: couldn`t decode Array as JSON');}break;case Date:value=new Date(value);break;case String:default:break;}return value;}/* eslint-enable no-fallthrough */}]);return Attributes;}(superClass);});})();(function(){'use strict';var CaseMap=Polymer.CaseMap;var TYPES={ANY:'__propertyEffects',COMPUTE:'__computeEffects',REFLECT:'__reflectEffects',NOTIFY:'__notifyEffects',PROPAGATE:'__propagateEffects',OBSERVE:'__observeEffects',READ_ONLY:'__readOnly'};function ensureOwnMappedArray(model,type){var effects=model[type];if(!effects){effects=model[type]={};}else if(!model.hasOwnProperty(type)){effects=model[type]=Object.create(model[type]);for(var p in effects){// TODO(kschaaf): replace with fast array copy #!%&$!
effects[p]=effects[p].slice();}}return effects;}// -- effects ----------------------------------------------
function runEffects(inst,property,value,old,effects){for(var i=0,l=effects.length,fx;i<l&&(fx=effects[i]);i++){if(Polymer.Path.matches(fx.path,property)){fx.fn(inst,property,inst.__data[property],old,fx.info);}}}function runObserverEffect(inst,property,value,old,info){var fn=(info.context||inst)[info.methodName];if(fn){fn.call(inst,value,old);}else{console.warn('observer method `'+info.methodName+'` not defined');}}function runNotifyEffect(inst,path,value,old,info){var detail={value:value};if(info.property!==path){detail.path=path;}inst._dispatchNotifyingEvent(new CustomEvent(info.eventName,{detail:detail}));}function runReflectEffect(inst,property,value,old,info){inst._propertyToAttribute(property,info.attrName);}function runMultiObserverEffect(inst,property,value,old,info){runMethodEffect(inst,property,value,old,info);}function runComputedEffect(inst,property,value,old,info){var result=runMethodEffect(inst,property,value,old,info);var computedProp=info.methodInfo;inst._setPropertyFromComputation(computedProp,result);}// -- bindings / annotations ----------------------------------------------
function bindTemplate(inst,template){var notes=inst._parseTemplateAnnotations(template);processAnnotations(notes);for(var i=0,note;i<notes.length&&(note=notes[i]);i++){// where to find the node in the concretized list
var b$=note.bindings;for(var j=0,binding;j<b$.length&&(binding=b$[j]);j++){if(shouldAddListener(binding)){addAnnotatedListener(inst,i,binding.name,binding.parts[0].value,binding.parts[0].event,binding.parts[0].negate);}addAnnotationEffect(inst,binding,i);}}}function addAnnotationEffect(inst,note,index){for(var i=0;i<note.parts.length;i++){var part=note.parts[i];if(part.signature){addAnnotationMethodEffect(inst,note,part,index);}else if(!part.literal){if(note.kind==='attribute'&&note.name[0]==='-'){console.warn('Cannot set attribute '+note.name+' because "-" is not a valid attribute starting character');}else{inst._addPropertyEffect(part.value,TYPES.PROPAGATE,{fn:runAnnotationEffect,info:{kind:note.kind,index:index,name:note.name,propertyName:note.propertyName,value:part.value,isCompound:note.isCompound,compoundIndex:part.compoundIndex,event:part.event,customEvent:part.customEvent,negate:part.negate}});}}}}function runAnnotationEffect(inst,path,value,old,info){var node=inst._nodes[info.index];// Subpath notification: transform path and set to client
// e.g.: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo.prop'=obj.sub.prop
if(path.length>info.value.length&&info.kind=='property'&&!info.isCompound&&node._hasPropertyEffect&&node._hasPropertyEffect(info.name)){path=Polymer.Path.translate(info.value,info.name,path);inst._setPropertyToNodeFromAnnotation(node,path,value);}else{// Root or deeper path was set; extract bound path value
// e.g.: foo="{{obj.sub}}", path: 'obj', set 'foo'=obj.sub
//   or: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo'=obj.sub
if(path!=info.value){value=Polymer.Path.get(inst,info.value);inst.__data[info.value]=value;}// Propagate value to child
applyAnnotationValue(inst,info,value);}}function applyAnnotationValue(inst,info,value){var node=inst._nodes[info.index];var property=info.name;value=computeAnnotationValue(node,property,value,info);if(info.kind=='attribute'){inst._valueToNodeAttribute(node,value,property);}else{if(node._hasPropertyEffect&&node._hasPropertyEffect(property)){inst._setPropertyToNodeFromAnnotation(node,property,value);}else if(inst._shouldPropChange(node[property],value)){node[property]=value;}}}// Process compound, negate, special case properties
function computeAnnotationValue(node,property,value,info){if(info.negate){value=!value;}if(info.isCompound){var storage=node.__dataCompoundStorage[property];storage[info.compoundIndex]=value;value=storage.join('');}if(info.kind!=='attribute'){// TODO(sorvell): preserve scoping during changes to class
// if (property === 'className') {
//   value = this._scopeElementClass(node, value);
// }
// Some browsers serialize `undefined` to `"undefined"`
if(property==='textContent'||node.localName=='input'&&property=='value'){value=value==undefined?'':value;}}return value;}function addAnnotationMethodEffect(inst,note,part,index){//console.log('addAnnotationMethodEffect', inst, note, part, index);
createMethodEffect(inst,part.signature,TYPES.PROPAGATE,runAnnotationMethodEffect,{index:index,isCompound:note.isCompound,compoundIndex:part.compoundIndex,kind:note.kind,name:note.name,negate:part.negate,part:part},true);}function runAnnotationMethodEffect(inst,property,value,old,info){var val=runMethodEffect(inst,property,value,old,info);applyAnnotationValue(inst,info.methodInfo,val);}function processAnnotations(notes){if(!notes._processed){for(var i=0;i<notes.length;i++){var note=notes[i];// Parse bindings for methods & path roots (models)
for(var j=0;j<note.bindings.length;j++){var b=note.bindings[j];for(var k=0;k<b.parts.length;k++){var p=b.parts[k];if(!p.literal){p.signature=parseMethod(p.value);if(!p.signature){p.rootProperty=Polymer.Path.root(p.value);}}}}// Recurse into nested templates & bind parent props
if(note.templateContent){processAnnotations(note.templateContent._notes);var pp=note.templateContent._hostProps=discoverTemplateHostProps(note.templateContent._notes);var bindings=[];for(var prop in pp){bindings.push({index:note.index,kind:'property',name:'_host_'+prop,parts:[{mode:'{',rootProperty:prop,value:prop}]});}note.bindings=note.bindings.concat(bindings);}}notes._processed=true;}}// Finds all bindings in template content and stores the path roots in
// the path members in content._hostProps. Each outer template merges
// inner _hostProps to propagate inner parent property needs to outer
// templates.
function discoverTemplateHostProps(notes){var pp={};for(var i=0,n;i<notes.length&&(n=notes[i]);i++){// Find all bindings to parent.* and spread them into _parentPropChain
for(var j=0,b$=n.bindings,b;j<b$.length&&(b=b$[j]);j++){for(var k=0,p$=b.parts,p;k<p$.length&&(p=p$[k]);k++){if(p.signature){var args=p.signature.args;for(var kk=0;kk<args.length;kk++){var rootProperty=args[kk].rootProperty;if(rootProperty){pp[rootProperty]=true;}}pp[p.signature.methodName]=true;}else{if(p.rootProperty){pp[p.rootProperty]=true;}}}}// Merge child _hostProps into this _hostProps
if(n.templateContent){var tpp=n.templateContent._hostProps;Polymer.Base.mixin(pp,tpp);}}return pp;}function shouldAddListener(effect){return effect.name&&effect.kind!='attribute'&&effect.kind!='text'&&!effect.isCompound&&effect.parts[0].mode==='{';}function addAnnotatedListener(inst,index,property,path,event,negate){if(!inst._bindListeners){inst._bindListeners=[];}var eventName=event||CaseMap.camelToDashCase(property)+'-changed';inst._bindListeners.push({index:index,property:property,path:path,event:eventName,negate:negate});}function setupBindListeners(inst){var b$=inst._bindListeners;for(var i=0,l=b$.length,info;i<l&&(info=b$[i]);i++){var node=inst._nodes[info.index];addNotifyListener(node,inst,info);}}function addNotifyListener(node,inst,info){var rootProperty=Polymer.Path.root(info.path);node.addEventListener(info.event,function(e){handleNotification(e,inst,info.property,info.path,rootProperty,info.negate);});}function handleNotification(e,inst,property,path,rootProperty,negate){var value=void 0;var targetPath=e.detail&&e.detail.path;if(targetPath){path=Polymer.Path.translate(property,path,e.detail.path);value=e.detail&&e.detail.value;}else{value=e.target[property];}value=negate?!value:value;inst._setPropertyFromNotification(path,value,e);}// -- for method-based effects (complexObserver & computed) --------------
function createMethodEffect(inst,sig,type,effectFn,methodInfo,dynamic){var info={methodName:sig.methodName,args:sig.args,methodInfo:methodInfo,dynamicFn:dynamic};// TODO(sorvell): why still here?
if(sig.static){inst._addPropertyEffect('__static__',type,{fn:effectFn,info:info});}else{for(var i=0,arg;i<sig.args.length&&(arg=sig.args[i]);i++){if(!arg.literal){inst._addPropertyEffect(arg.name,type,{fn:effectFn,info:info});}}}if(dynamic){inst._addPropertyEffect(sig.methodName,type,{fn:effectFn,info:info});}}function runMethodEffect(inst,property,value,old,info){// TODO(kschaaf): ideally rootDataHost would be a detail of Templatizer only
var context=inst._rootDataHost||inst;var fn=context[info.methodName];if(fn){var args=marshalArgs(inst.__data,info,property,value);return fn.apply(context,args);}else if(!info.dynamicFn){console.warn('method `'+info.methodName+'` not defined');}}var emptyArray=[];function parseMethod(expression){// tries to match valid javascript property names
var m=expression.match(/([^\s]+?)\(([\s\S]*)\)/);if(m){var sig={methodName:m[1],static:true};if(m[2].trim()){// replace escaped commas with comma entity, split on un-escaped commas
var args=m[2].replace(/\\,/g,'&comma;').split(',');return parseArgs(args,sig);}else{sig.args=emptyArray;return sig;}}}function parseArgs(argList,sig){sig.args=argList.map(function(rawArg){var arg=parseArg(rawArg);if(!arg.literal){sig.static=false;}return arg;},this);return sig;}function parseArg(rawArg){// clean up whitespace
var arg=rawArg.trim()// replace comma entity with comma
.replace(/&comma;/g,',')// repair extra escape sequences; note only commas strictly need
// escaping, but we allow any other char to be escaped since its
// likely users will do this
.replace(/\\(.)/g,'\$1');// basic argument descriptor
var a={name:arg};// detect literal value (must be String or Number)
var fc=arg[0];if(fc==='-'){fc=arg[1];}if(fc>='0'&&fc<='9'){fc='#';}switch(fc){case"'":case'"':a.value=arg.slice(1,-1);a.literal=true;break;case'#':a.value=Number(arg);a.literal=true;break;}// if not literal, look for structured path
if(!a.literal){a.rootProperty=Polymer.Path.root(arg);// detect structured path (has dots)
a.structured=Polymer.Path.isDeep(arg);if(a.structured){a.wildcard=arg.slice(-2)=='.*';if(a.wildcard){a.name=arg.slice(0,-2);}}}return a;}// path & value are used to fill in wildcard descriptor when effect is
// being called as a result of a path notification
function marshalArgs(data,info,path,value){var values=[];var args=info.args;for(var i=0,l=args.length;i<l;i++){var arg=args[i];var name=arg.name;var v=void 0;if(arg.literal){v=arg.value;}else if(path==name){v=value;}else{// TODO(kschaaf): confirm design of this
v=data[name];if(v===undefined&&arg.structured){v=Polymer.Path.get(data,name);}}if(arg.wildcard){// Only send the actual path changed info if the change that
// caused the observer to run matched the wildcard
var baseChanged=name.indexOf(path+'.')===0;var matches=path.indexOf(name)===0&&!baseChanged;values[i]={path:matches?path:name,value:matches?value:v,base:v};}else{values[i]=v;}}return values;}function setupBindings(inst,dom,notes){if(notes.length){var nodes=new Array(notes.length);for(var i=0;i<notes.length;i++){var note=notes[i];var node=nodes[i]=inst._findTemplateAnnotatedNode(dom,note);node.__dataHost=inst;if(note.bindings){setupCompoundBinding(note,node);}}inst._nodes=nodes;}if(inst._bindListeners){setupBindListeners(inst);}}function setupCompoundBinding(note,node){var bindings=note.bindings;for(var i=0;i<bindings.length;i++){var binding=bindings[i];if(binding.isCompound){// Create compound storage map
var storage=node.__dataCompoundStorage||(node.__dataCompoundStorage={});var parts=binding.parts;// Copy literals from parts into storage for this binding
var literals=new Array(parts.length);for(var j=0;j<parts.length;j++){literals[j]=parts[j].literal;}var name=binding.name;storage[name]=literals;// Configure properties with their literal parts
if(binding.literal&&binding.kind=='property'){// TODO(kschaaf) config integration
// if (node._configValue) {
//   node._configValue(name, binding.literal);
// } else {
node[name]=binding.literal;// }
}}}}// data api
// Note: this implemetation only accepts normalized paths
function _notifySplices(inst,array,path,splices){var change={indexSplices:splices};var splicesPath=path+'.splices';inst._setProperty(splicesPath,change);inst._setProperty(path+'.length',array.length);// All path notification values are cached on `this.__data__`.
// Null here to allow potentially large splice records to be GC'ed.
inst.__data[splicesPath]={indexSplices:null};}function notifySplice(inst,array,path,index,added,removed){_notifySplices(inst,array,path,[{index:index,addedCount:added,removed:removed,object:array,type:'splice'}]);}function upper(name){return name[0].toUpperCase()+name.substring(1);}Polymer.PropertyEffects=Polymer.Utils.dedupingMixin(function(superClass){return function(_Polymer$TemplateStam){_inherits(PropertyEffects,_Polymer$TemplateStam);_createClass(PropertyEffects,[{key:'PROPERTY_EFFECT_TYPES',get:function get(){return TYPES;}}]);function PropertyEffects(){_classCallCheck(this,PropertyEffects);var _this8=_possibleConstructorReturn(this,(PropertyEffects.__proto__||Object.getPrototypeOf(PropertyEffects)).call(this));_this8._asyncEffects=false;_this8.__dataInitialized=false;_this8.__dataPendingClients=null;_this8.__dataFromAbove=false;_this8.__dataLinkedPaths=null;_this8._nodes=null;// May be set on instance prior to upgrade
_this8.__dataCompoundStorage=_this8.__dataCompoundStorage||null;_this8.__dataHost=_this8.__dataHost||null;return _this8;}_createClass(PropertyEffects,[{key:'_initializeProperties',value:function _initializeProperties(){_get(PropertyEffects.prototype.__proto__||Object.getPrototypeOf(PropertyEffects.prototype),'_initializeProperties',this).call(this);// initialize data with prototype values saved when creating accessors
if(this.__dataProto){this.__data=Object.create(this.__dataProto);this.__dataPending=Object.create(this.__dataProto);this.__dataOld={};}else{this.__dataPending=null;}// update instance properties
for(var p in this.__propertyEffects){if(this.hasOwnProperty(p)){var value=this[p];delete this[p];this[p]=value;}}}},{key:'_isPropertyPending',value:function _isPropertyPending(prop){return this.__dataPending&&prop in this.__dataPending;}// Prototype setup ----------------------------------------
},{key:'_addPropertyEffect',value:function _addPropertyEffect(path,type,effect){var property=Polymer.Path.root(path);// __propertyEffects only used to track whether an accessor has been created or not
var effects=ensureOwnMappedArray(this,TYPES.ANY)[property];var val=void 0;if(!effects){effects=this.__propertyEffects[property]=[];val=this._createPropertyAccessor(property,type==TYPES.READ_ONLY);}// effects are accumulated into arrays per property based on type
if(effect){effect.path=path;effects.push(effect);}effects=ensureOwnMappedArray(this,type)[property];if(!effects){effects=this[type][property]=[];}effects.push(effect);//console.log('_addPropertyEffect', path, type, effect);
return val;}},{key:'_hasPropertyEffect',value:function _hasPropertyEffect(property,type){var effects=this[type||TYPES.ANY];return Boolean(effects&&effects[property]);}},{key:'_hasReadOnlyEffect',value:function _hasReadOnlyEffect(property){return this._hasPropertyEffect(property,TYPES.READ_ONLY);}},{key:'_hasNotifyEffect',value:function _hasNotifyEffect(property){return this._hasPropertyEffect(property,TYPES.NOTIFY);}},{key:'_hasReflectEffect',value:function _hasReflectEffect(property){return this._hasPropertyEffect(property,TYPES.REFLECT);}},{key:'_hasComputedEffect',value:function _hasComputedEffect(property){return this._hasPropertyEffect(property,TYPES.COMPUTE);}// Runtime ----------------------------------------
// This function isolates relatively expensive functionality necessary
// for the public API, such that it is only done when paths enter the
// system, and not in every step of the hot path.
// If `path` is an unmanaged property (property without an accessor)
// or a path, sets the value at that path.  If the root of the path
// is a managed property, returns a normalized string path
// sutable for setting into the system via setProperty/setPendingProperty
// `path` can be a user-facing path string or array of path parts.
},{key:'_setPathOrUnmanagedProperty',value:function _setPathOrUnmanagedProperty(path,value){var rootProperty=Polymer.Path.root(Array.isArray(path)?path[0]:path);var hasEffect=this._hasPropertyEffect(rootProperty);var isPath=rootProperty!==path;if(!hasEffect||isPath){path=Polymer.Path.set(this,path,value);}if(hasEffect){return path;}}},{key:'_invalidateProperties',value:function _invalidateProperties(){if(this.__dataInitialized){if(this._asyncEffects){_get(PropertyEffects.prototype.__proto__||Object.getPrototypeOf(PropertyEffects.prototype),'_invalidateProperties',this).call(this);}else{this._flushProperties();}}}},{key:'_flushProperties',value:function _flushProperties(fromAbove){if(!this.__dataInitialized){this.ready();}if(this.__dataPending||this.__dataPendingClients){this.__dataFromAbove=fromAbove;_get(PropertyEffects.prototype.__proto__||Object.getPrototypeOf(PropertyEffects.prototype),'_flushProperties',this).call(this);this.__dataFromAbove=false;}}},{key:'ready',value:function ready(){this.__dataInitialized=true;}},{key:'_stampTemplate',value:function _stampTemplate(template){var dom=_get(PropertyEffects.prototype.__proto__||Object.getPrototypeOf(PropertyEffects.prototype),'_stampTemplate',this).call(this,template);var notes=(template._content||template.content)._notes;this._setupBindings(dom,notes);return dom;}},{key:'_propertiesChanged',value:function _propertiesChanged(currentProps,changedProps,oldProps){for(var p in changedProps){var effects=this.__propertyEffects[p];runEffects(this,p,changedProps[p],oldProps[p],effects);}}/**
       * Aliases one data path as another, such that path notifications from one
       * are routed to the other.
       *
       * @method linkPaths
       * @param {string} to Target path to link.
       * @param {string} from Source path to link.
       */},{key:'linkPaths',value:function linkPaths(to,from){to=Polymer.Path.normalize(to);from=Polymer.Path.normalize(from);this.__dataLinkedPaths=this.__dataLinkedPaths||{};if(from){this.__dataLinkedPaths[to]=from;}else{this.__dataLinkedPaths(to);}}/**
       * Removes a data path alias previously established with `_linkPaths`.
       *
       * Note, the path to unlink should be the target (`to`) used when
       * linking the paths.
       *
       * @method unlinkPaths
       * @param {string} path Target path to unlink.
       */},{key:'unlinkPaths',value:function unlinkPaths(path){path=Polymer.Path.normalize(path);if(this.__dataLinkedPaths){delete this.__dataLinkedPaths[path];}}/**
       * Notify that an array has changed.
       *
       * Example:
       *
       *     this.items = [ {name: 'Jim'}, {name: 'Todd'}, {name: 'Bill'} ];
       *     ...
       *     this.items.splice(1, 1, {name: 'Sam'});
       *     this.items.push({name: 'Bob'});
       *     this.notifySplices('items', [
       *       { index: 1, removed: [{name: 'Todd'}], addedCount: 1, obect: this.items, type: 'splice' },
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
      */},{key:'notifySplices',value:function notifySplices(path,splices){var info={};var array=Polymer.Path.get(this,path,info);_notifySplices(this,array,info.path,splices);}/**
       * Convienence method for reading a value from a path.
       *
       * Note, if any part in the path is undefined, this method returns
       * `undefined` (this method does not throw when dereferencing undefined
       * paths).
       *
       * @method get
       * @param {(string|Array<(string|number)>)} path Path to the value
       *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
       *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
       *   bracketed expressions are not supported; string-based path parts
       *   *must* be separated by dots.  Note that when dereferencing array
       *   indices, the index may be used as a dotted part directly
       *   (e.g. `users.12.name` or `['users', 12, 'name']`).
       * @param {Object=} root Root object from which the path is evaluated.
       * @return {*} Value at the path, or `undefined` if any part of the path
       *   is undefined.
       */},{key:'get',value:function get(path,root){return Polymer.Path.get(root||this,path);}/**
       * Convienence method for setting a value to a path and notifying any
       * elements bound to the same path.
       *
       * Note, if any part in the path except for the last is undefined,
       * this method does nothing (this method does not throw when
       * dereferencing undefined paths).
       *
       * @method set
       * @param {(string|Array<(string|number)>)} path Path to the value
       *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
       *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
       *   bracketed expressions are not supported; string-based path parts
       *   *must* be separated by dots.  Note that when dereferencing array
       *   indices, the index may be used as a dotted part directly
       *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
       * @param {*} value Value to set at the specified path.
       * @param {Object=} root Root object from which the path is evaluated.
       *   When specified, no notification will occur.
      */},{key:'set',value:function set(path,value,root){if(root){Polymer.Path.set(root,path,value);}else{if(!this._hasReadOnlyEffect(path)){if(path=this._setPathOrUnmanagedProperty(path,value)){this._setProperty(path,value);}}}}},{key:'_setPropertyFromNotification',value:function _setPropertyFromNotification(path,value){this.set(path,value);}},{key:'_dispatchNotifyingEvent',value:function _dispatchNotifyingEvent(event){this.dispatchEvent(event);}},{key:'_setPropertyToNodeFromAnnotation',value:function _setPropertyToNodeFromAnnotation(node,prop,value){// TODO(sorvell): how do we know node has this api?
if(!node._hasReadOnlyEffect(prop)){node._setProperty(prop,value);}}},{key:'_setPropertyFromComputation',value:function _setPropertyFromComputation(prop,value){this[prop]=value;}/**
       * Adds items onto the end of the array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.push`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @method push
       * @param {String} path Path to array.
       * @param {...any} var_args Items to push onto array
       * @return {number} New length of the array.
       */},{key:'push',value:function push(path){var info={};var array=Polymer.Path.get(this,path,info);var len=array.length;for(var _len=arguments.length,items=Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){items[_key-1]=arguments[_key];}var ret=array.push.apply(array,items);if(items.length){notifySplice(this,array,info.path,len,items.length,[]);}return ret;}/**
       * Removes an item from the end of array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.pop`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @method pop
       * @param {String} path Path to array.
       * @return {any} Item that was removed.
       */},{key:'pop',value:function pop(path){var info={};var array=Polymer.Path.get(this,path,info);var hadLength=Boolean(array.length);var ret=array.pop();if(hadLength){notifySplice(this,array,info.path,array.length,0,[ret]);}return ret;}/**
       * Starting from the start index specified, removes 0 or more items
       * from the array and inserts 0 or more new itms in their place.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.splice`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @method splice
       * @param {String} path Path to array.
       * @param {number} start Index from which to start removing/inserting.
       * @param {number} deleteCount Number of items to remove.
       * @param {...any} var_args Items to insert into array.
       * @return {Array} Array of removed items.
       */},{key:'splice',value:function splice(path,start,deleteCount){var info={};var array=Polymer.Path.get(this,path,info);// Normalize fancy native splice handling of crazy start values
if(start<0){start=array.length-Math.floor(-start);}else{start=Math.floor(start);}if(!start){start=0;}for(var _len2=arguments.length,items=Array(_len2>3?_len2-3:0),_key2=3;_key2<_len2;_key2++){items[_key2-3]=arguments[_key2];}var ret=array.splice.apply(array,[start,deleteCount].concat(items));if(items.length||ret.length){notifySplice(this,array,info.path,start,items.length,ret);}return ret;}/**
       * Removes an item from the beginning of array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.pop`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @method shift
       * @param {String} path Path to array.
       * @return {any} Item that was removed.
       */},{key:'shift',value:function shift(path){var info={};var array=Polymer.Path.get(this,path,info);var hadLength=Boolean(array.length);var ret=array.shift();if(hadLength){notifySplice(this,array,info.path,0,0,[ret]);}return ret;}/**
       * Adds items onto the beginning of the array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.push`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @method unshift
       * @param {String} path Path to array.
       * @param {...any} var_args Items to insert info array
       * @return {number} New length of the array.
       */},{key:'unshift',value:function unshift(path){var info={};var array=Polymer.Path.get(this,path,info);for(var _len3=arguments.length,items=Array(_len3>1?_len3-1:0),_key3=1;_key3<_len3;_key3++){items[_key3-1]=arguments[_key3];}var ret=array.unshift.apply(array,items);if(items.length){notifySplice(this,array,info.path,0,items.length,[]);}return ret;}/**
       * Notify that a path has changed.
       *
       * Example:
       *
       *     this.item.user.name = 'Bob';
       *     this.notifyPath('item.user.name');
       *
       * @param {string} path Path that should be notified.
       * @param {*=} value Value at the path (optional).
      */},{key:'notifyPath',value:function notifyPath(path,value){if(arguments.length==1){// Get value if not supplied
var info={};value=Polymer.Path.get(this,path,info);path=info.path;}else if(Array.isArray(path)){// Normalize path if needed
path=Polymer.Path.normalize(path);}this._setProperty(path,value);}// -- readOnly ----------------------------------------------
},{key:'_createReadOnlyProperty',value:function _createReadOnlyProperty(property,privateSetter){this._addPropertyEffect(property,TYPES.READ_ONLY);if(privateSetter){this['_set'+upper(property)]=function(value){this._setProperty(property,value);};}}// -- observer ----------------------------------------------
},{key:'_createObservedProperty',value:function _createObservedProperty(property,methodName,context){this._addPropertyEffect(property,TYPES.OBSERVE,{fn:runObserverEffect,info:{methodName:methodName,context:context?this:null}});}// -- notify ----------------------------------------------
},{key:'_createNotifyingProperty',value:function _createNotifyingProperty(property){this._addPropertyEffect(property,TYPES.NOTIFY,{fn:runNotifyEffect,info:{eventName:CaseMap.camelToDashCase(property)+'-changed',property:property}});}// -- reflect ----------------------------------------------
},{key:'_createReflectedProperty',value:function _createReflectedProperty(property){var attr=CaseMap.camelToDashCase(property);if(attr[0]==='-'){console.warn('Property '+property+' cannot be reflected to attribute '+attr+' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property thisead.');}else{this._addPropertyEffect(property,TYPES.REFLECT,{fn:runReflectEffect,info:{attrName:attr}});}}// -- complexObserver ----------------------------------------------
},{key:'_createMethodObserver',value:function _createMethodObserver(expression){var sig=parseMethod(expression);if(!sig){throw new Error("Malformed observer expression '"+expression+"'");}createMethodEffect(this,sig,TYPES.OBSERVE,runMultiObserverEffect);}// -- computed ----------------------------------------------
},{key:'_createComputedProperty',value:function _createComputedProperty(property,expression){var sig=parseMethod(expression);if(!sig){throw new Error("Malformed computed expression '"+expression+"'");}createMethodEffect(this,sig,TYPES.COMPUTE,runComputedEffect,property);}// -- annotation ----------------------------------------------
},{key:'_bindTemplate',value:function _bindTemplate(template){bindTemplate(this,template);}},{key:'_setupBindings',value:function _setupBindings(dom,notes){setupBindings(this,dom,notes);}}]);return PropertyEffects;}(Polymer.TemplateStamp(Polymer.Attributes(Polymer.PropertyAccessors(superClass))));});})();(function(){'use strict';var utils=Polymer.Utils;var effectUid=0;function runComputedEffects(inst,changedProps,oldProps){var COMPUTE=inst.PROPERTY_EFFECT_TYPES.COMPUTE;if(inst[COMPUTE]){var inputProps=changedProps;var computedProps=void 0;while(runEffects(inst,COMPUTE,inputProps)){utils.mixin(oldProps,inst.__dataOld);utils.mixin(changedProps,inst.__dataPending);computedProps=utils.mixin(computedProps||{},inst.__dataPending);inputProps=inst.__dataPending;inst.__dataPending=null;}return computedProps;}}function computeLinkedPaths(inst,changedProps,computedProps){var links=inst.__dataLinkedPaths;if(links){var link=void 0;for(var a in links){var b=links[a];for(var path in changedProps){if(Polymer.Path.isDescendant(a,path)){link=Polymer.Path.translate(a,b,path);changedProps[link]=computedProps[link]=inst.__data[link]=changedProps[path];}else if(Polymer.Path.isDescendant(b,path)){link=Polymer.Path.translate(b,a,path);changedProps[link]=computedProps[link]=inst.__data[link]=changedProps[path];}}}}}function notifyProperties(inst,changedProps,computedProps,oldProps){// Determine which props to notify
var props=inst.__dataFromAbove?computedProps:changedProps;// Save interim data for potential re-entry
var runId=inst._runId=(inst._runId||0)+1;inst.__dataInterim=inst.__dataInterim?utils.mixin(inst.__dataInterim,changedProps):changedProps;inst.__dataInterimOld=inst.__dataInterimOld?utils.mixin(inst.__dataInterimOld,oldProps):oldProps;// Notify
var notified=void 0;var notifyEffects=inst[inst.PROPERTY_EFFECT_TYPES.NOTIFY];var id=effectUid++;// Try normal notify effects; if none, fall back to try path notification
for(var prop in props){if(notifyEffects&&runEffectsForProperty(inst,notifyEffects,id,prop,oldProps&&oldProps[prop])){notified=true;}else if(notifyPath(inst,prop)){notified=true;}}// Flush host if we actually notified and host was batching
var host=void 0;if(notified&&(host=inst.__dataHost)&&host.setProperties){host._flushProperties();}// Combine & return interim data only for last entry
if(runId==inst._runId){changedProps=inst.__dataInterim;oldProps=inst.__dataInterimOld;inst.__dataInterim=null;inst.__dataInterimOld=null;return{changedProps:changedProps,oldProps:oldProps};}}function notifyPath(inst,prop){var rootProperty=Polymer.Path.root(prop);if(rootProperty!==prop){var name=Polymer.CaseMap.camelToDashCase(rootProperty)+'-changed';var options={detail:{value:inst.__data[prop],path:prop}};inst._dispatchNotifyingEvent(new CustomEvent(name,options));return true;}}function runEffects(inst,type,props,oldProps){var ran=void 0;var effects=inst[type];if(effects){var id=effectUid++;for(var prop in props){if(runEffectsForProperty(inst,effects,id,prop,oldProps&&oldProps[prop])){ran=true;}}}return ran;}function runEffectsForProperty(inst,effects,id,prop,old){var ran=void 0;var rootProperty=Polymer.Path.root(prop);var fxs=effects[rootProperty];if(fxs){var fromAbove=inst.__dataFromAbove;for(var i=0,l=fxs.length,fx;i<l&&(fx=fxs[i]);i++){if(Polymer.Path.matches(fx.path,prop)&&(!fx.info||fx.info.lastRun!==id)){fx.fn(inst,prop,inst.__data[prop],old,fx.info,fromAbove);if(fx.info){fx.info.lastRun=id;}ran=true;}}}return ran;}Polymer.BatchedEffects=Polymer.Utils.dedupingMixin(function(superClass){return function(_Polymer$PropertyEffe){_inherits(BatchedEffects,_Polymer$PropertyEffe);function BatchedEffects(){_classCallCheck(this,BatchedEffects);var _this9=_possibleConstructorReturn(this,(BatchedEffects.__proto__||Object.getPrototypeOf(BatchedEffects)).call(this));_this9.__dataPendingClients=null;return _this9;}// -- set properties machinery
_createClass(BatchedEffects,[{key:'_propertiesChanged',value:function _propertiesChanged(currentProps,changedProps,oldProps){// ----------------------------
// let c = Object.getOwnPropertyNames(changedProps || {});
// console.group(this.localName + '#' + this.id + ': ' + c);
// ----------------------------
// Compute
var computedProps=runComputedEffects(this,changedProps,oldProps);// Compute linked paths
computeLinkedPaths(this,changedProps,computedProps);// Notify
var props=notifyProperties(this,changedProps,computedProps,oldProps);if(props){oldProps=props.oldProps;changedProps=props.changedProps;// Propagate
runEffects(this,this.PROPERTY_EFFECT_TYPES.PROPAGATE,changedProps);// Flush clients
this._flushClients();// Reflect
runEffects(this,this.PROPERTY_EFFECT_TYPES.REFLECT,changedProps,oldProps);// Observe
runEffects(this,this.PROPERTY_EFFECT_TYPES.OBSERVE,changedProps,oldProps);}// ----------------------------
// console.groupEnd(this.localName + '#' + this.id + ': ' + c);
// ----------------------------
}},{key:'_setPropertyToNodeFromAnnotation',value:function _setPropertyToNodeFromAnnotation(node,prop,value){// TODO(kschaaf): fix id of BatchedEffects client...
if(node.setProperties){if(!node._hasReadOnlyEffect(prop)){if(node._setPendingProperty(prop,value)){this._enqueueClient(node);}}}else{_get(BatchedEffects.prototype.__proto__||Object.getPrototypeOf(BatchedEffects.prototype),'_setPropertyToNodeFromAnnotation',this).call(this,node,prop,value);}}},{key:'_setPropertyFromNotification',value:function _setPropertyFromNotification(path,value,event){var detail=event.detail;if(detail&&detail.queueProperty){if(!this._hasReadOnlyEffect(path)){if(path=this._setPathOrUnmanagedProperty(path,value)){this._setPendingProperty(path,value);}}}else{_get(BatchedEffects.prototype.__proto__||Object.getPrototypeOf(BatchedEffects.prototype),'_setPropertyFromNotification',this).call(this,path,value,event);}}},{key:'_dispatchNotifyingEvent',value:function _dispatchNotifyingEvent(event){event.detail.queueProperty=true;_get(BatchedEffects.prototype.__proto__||Object.getPrototypeOf(BatchedEffects.prototype),'_dispatchNotifyingEvent',this).call(this,event);}},{key:'_setPropertyFromComputation',value:function _setPropertyFromComputation(prop,value){if(this._hasPropertyEffect(prop)){this._setPendingProperty(prop,value);}else{this[prop]=value;}}},{key:'_enqueueClient',value:function _enqueueClient(client){this.__dataPendingClients=this.__dataPendingClients||new Map();if(client!==this){this.__dataPendingClients.set(client,true);}}},{key:'_flushClients',value:function _flushClients(){// Flush all clients
var clients=this.__dataPendingClients;if(clients){clients.forEach(function(v,client){// TODO(kschaaf): more explicit check?
if(client._flushProperties){client._flushProperties(true);}});this.__dataPendingClients=null;}}},{key:'setProperties',value:function setProperties(props){for(var path in props){if(!this._hasReadOnlyEffect(path)){var value=props[path];if(path=this._setPathOrUnmanagedProperty(path,value)){this._setPendingProperty(path,value);}}}this._invalidateProperties();}}]);return BatchedEffects;}(Polymer.PropertyEffects(superClass));});})();(function(){'use strict';var StyleGather={MODULE_STYLES_SELECTOR:'style, link[rel=import][type~=css], template',INCLUDE_ATTR:'include',_importModule:function _importModule(moduleId){if(!Polymer.DomModule){return null;}return Polymer.DomModule.import(moduleId);},cssFromModules:function cssFromModules(moduleIds,warnIfNotFound){var modules=moduleIds.trim().split(' ');var cssText='';for(var i=0;i<modules.length;i++){cssText+=this.cssFromModule(modules[i],warnIfNotFound);}return cssText;},// returns cssText of styles in a given module; also un-applies any
// styles that apply to the document.
cssFromModule:function cssFromModule(moduleId,warnIfNotFound){var m=this._importModule(moduleId);if(m&&!m._cssText){m._cssText=this.cssFromElement(m);}if(!m&&warnIfNotFound){console.warn('Could not find style data in module named',moduleId);}return m&&m._cssText||'';},// support lots of ways to discover css...
cssFromElement:function cssFromElement(element){var cssText='';// if element is a template, get content from its .content
var content=element.content||element;var e$=content.querySelectorAll(this.MODULE_STYLES_SELECTOR);for(var i=0,e;i<e$.length;i++){e=e$[i];// look inside templates for elements
if(e.localName==='template'){cssText+=this.cssFromElement(e);}else{// style elements inside dom-modules will apply to the main document
// we don't want this, so we remove them here.
if(e.localName==='style'){var include=e.getAttribute(this.INCLUDE_ATTR);// now support module refs on 'styling' elements
if(include){cssText+=this.cssFromModules(include,true);}// get style element applied to main doc via HTMLImports polyfill
e=e.__appliedElement||e;e.parentNode.removeChild(e);cssText+=Polymer.ResolveUrl.resolveCss(e.textContent,element.ownerDocument);// it's an import, assume this is a text file of css content.
// TODO(sorvell): plan is to deprecate this way to get styles;
// remember to add deprecation warning when this is done.
}else if(e.import&&e.import.body){cssText+=Polymer.ResolveUrl.resolveCss(e.import.body.textContent,e.import);}}}return cssText;}};Polymer.StyleGather=StyleGather;})();(function(){'use strict';var StyleUtil={isTargetedBuild:function isTargetedBuild(buildType){return!window.ShadyDOM||!ShadyDOM.inUse?buildType==='shadow':buildType==='shady';},cssBuildTypeForModule:function cssBuildTypeForModule(module){var dm=Polymer.DomModule.import(module);if(dm){return this.getCssBuildType(dm);}},getCssBuildType:function getCssBuildType(element){return element.getAttribute('css-build');}};Polymer.StyleUtil=StyleUtil;})();(function(){'use strict';var utils=Polymer.Utils;var caseMap=Polymer.CaseMap;Polymer.ElementMixin=Polymer.Utils.cachingMixin(function(base){return function(_Polymer$BatchedEffec){_inherits(PolymerElement,_Polymer$BatchedEffec);_createClass(PolymerElement,null,[{key:'_addPropertiesToAttributes',value:function _addPropertiesToAttributes(properties,list){for(var prop in properties){list.push(Polymer.CaseMap.camelToDashCase(prop));}return list;}},{key:'finalize',// TODO(sorvell): need to work on public api surrouding `finalize`.
// Due to meta-programming, it's awkward to make a subclass impl of this.
// However, a user might want to call `finalize` prior to define to do
// this work eagerly. Need to also decide on `finalizeConfig(config)` and
// `finalizeTemplate(template)`. Both are public but have simiarly
// awkward subclassing characteristics.
value:function finalize(){var proto=this.prototype;if(!this.finalized){var superProto=Object.getPrototypeOf(proto);var superCtor=superProto&&superProto.constructor;if(superCtor.prototype instanceof PolymerElement){superCtor.finalize();}this.finalized=true;if(this.hasOwnProperty('is')&&this.is){Polymer.telemetry.register(proto);}var config=this._ownConfig;if(config){this._finalizeConfig(config);}if(this.template){var template=this.template.cloneNode(true);this._finalizeTemplate(template);}}}},{key:'_finalizeConfig',value:function _finalizeConfig(config){if(config.properties){// process properties
for(var p in config.properties){this.prototype._createPropertyFromConfig(p,config.properties[p]);}}if(config.observers){for(var i=0;i<config.observers.length;i++){this.prototype._createMethodObserver(config.observers[i]);}}}},{key:'_finalizeTemplate',value:function _finalizeTemplate(template){// support `include="module-name"`
var cssText=Polymer.StyleGather.cssFromElement(template);if(cssText){var style=document.createElement('style');style.textContent=cssText;template.content.insertBefore(style,template.content.firstChild);}if(window.ShadyCSS){window.ShadyCSS.prepareTemplate(template,this.is,this.extends);}var proto=this.prototype;// clear any existing propagation effects inherited from superClass.
proto._propagateEffects={};this.prototype._bindTemplate(template);proto._template=template;}},{key:'_ownConfig',// returns the config object on specifically on `this` class (not super)
// config is used for:
// (1) super chain mixes togther to make `flattenedProperties` which is
// then used to make observedAttributes and set property defaults
// (2) properties effects and observers are created from it at `finalize` time.
get:function get(){if(!this.hasOwnProperty('__ownConfig')){this.__ownConfig=this.hasOwnProperty('config')?this.config:{};}return this.__ownConfig;}// a flattened list of properties mixed together from the chain of all
// constructor's `config.properties`
// This list is used to create
// (1) observedAttributes,
// (2) element default values
},{key:'_flattenedProperties',get:function get(){if(!this.hasOwnProperty('__flattenedProperties')){this.__flattenedProperties=this._ownConfig.properties||{};var superCtor=Object.getPrototypeOf(this.prototype).constructor;if(superCtor.prototype instanceof PolymerElement){this.__flattenedProperties=utils.mixin(Object.create(superCtor._flattenedProperties),this.__flattenedProperties);}}return this.__flattenedProperties;}},{key:'observedAttributes',get:function get(){if(!this.hasOwnProperty('_observedAttributes')){// observedAttributes must be finalized at registration time
this._observedAttributes=this._addPropertiesToAttributes(this._flattenedProperties,[]);}return this._observedAttributes;}},{key:'finalized',get:function get(){return this.hasOwnProperty('_finalized');},set:function set(value){this._finalized=value;}},{key:'template',get:function get(){if(!this.hasOwnProperty('_template')){// TODO(sorvell): support more ways to acquire template.
// this requires `is` on constructor...
this._template=Polymer.DomModule.import(this.is,'template')||// note: implemented so a subclass can retrieve the super
// template; call the super impl this way so that `this` points
// to the superclass.
Object.getPrototypeOf(this.prototype).constructor.template;}return this._template;}}]);function PolymerElement(){_classCallCheck(this,PolymerElement);// note: `this.constructor.prototype` is wrong in Safari so make sure to
// use `__proto__`
var _this10=_possibleConstructorReturn(this,(PolymerElement.__proto__||Object.getPrototypeOf(PolymerElement)).call(this));Polymer.telemetry.instanceCount++;// add self to host's pending client list
hostStack.registerHost(_this10);return _this10;}_createClass(PolymerElement,[{key:'_initializeProperties',value:function _initializeProperties(){if(!this.constructor.finalized){this.constructor.finalize();}_get(PolymerElement.prototype.__proto__||Object.getPrototypeOf(PolymerElement.prototype),'_initializeProperties',this).call(this);// apply property defaults...
var p$=this.constructor._flattenedProperties;for(var p in p$){var info=p$[p];if('value'in info&&!this._isPropertyPending(p)){var value=typeof info.value=='function'?info.value.call(this):info.value;if(this._hasReadOnlyEffect(p)){this._setProperty(p,value);}else{this[p]=value;}}}}// create a property using the metadata in the `config` object
},{key:'_createPropertyFromConfig',value:function _createPropertyFromConfig(name,info){// computed forces readOnly...
if(info.computed){info.readOnly=true;}// readOnly, computed, reflect, notify only if not already doing so...
if(info.readOnly&&!this._hasReadOnlyEffect(name)){this._createReadOnlyProperty(name,!info.computed);}if(info.computed&&!this._hasComputedEffect(name)){this._createComputedProperty(name,info.computed);}if(info.reflectToAttribute&&!this._hasReflectEffect(name)){this._createReflectedProperty(name);}if(info.notify&&!this._hasNotifyEffect(name)){this._createNotifyingProperty(name);}// always add observer
if(info.observer){this._createObservedProperty(name,info.observer);}}// reserved for canonical behavior
},{key:'connectedCallback',value:function connectedCallback(){if(hostStack.isEmpty()){this._flushProperties();this.updateStyles();}}},{key:'disconnectedCallback',value:function disconnectedCallback(){}},{key:'ready',value:function ready(){_get(PolymerElement.prototype.__proto__||Object.getPrototypeOf(PolymerElement.prototype),'ready',this).call(this);if(this._template){hostStack.beginHosting(this);this.root=this._stampTemplate(this._template);this._flushProperties();this.root=this._attachDom(this.root);hostStack.endHosting(this);}else{this.root=this;this._flushProperties();}}/**
       * Attach an element's stamped dom to itself. By default,
       * this method creates a `shadowRoot` and adds the dom to it.
       * However, this method may be overridden to allow an element
       * to put its dom in another location.
       *
       * @method _attachDom
       * @param {NodeList} dom to attach to the element.
       * @returns {Node} node to which the dom has been attached.
       */},{key:'_attachDom',value:function _attachDom(dom){if(this.attachShadow){if(dom){if(!this.shadowRoot){this.attachShadow({mode:'open'});}this.shadowRoot.appendChild(dom);return this.shadowRoot;}}else{throw new Error('ShadowDOM not available. '+// BREAKME(sorvell): move to developer conditional when supported.
'Polymer.Element can\n              create dom as children instead of in ShadowDOM by setting\n              `this.root = this;` before `ready`.');}}},{key:'attributeChangedCallback',value:function attributeChangedCallback(name,old,value){var property=caseMap.dashToCamelCase(name);var type=this.constructor._flattenedProperties[property].type;if(!this._hasReadOnlyEffect(property)){this._attributeToProperty(name,value,type);}}},{key:'updateStyles',value:function updateStyles(properties){if(window.ShadyCSS){ShadyCSS.applyStyle(this,properties);}}}]);return PolymerElement;}(Polymer.BatchedEffects(base));});var hostStack={stack:[],isEmpty:function isEmpty(){return!this.stack.length;},registerHost:function registerHost(inst){if(this.stack.length){var host=this.stack[this.stack.length-1];host._enqueueClient(inst);}},beginHosting:function beginHosting(inst){this.stack.push(inst);},endHosting:function endHosting(inst){var stackLen=this.stack.length;if(stackLen&&this.stack[stackLen-1]==inst){this.stack.pop();}}};// telemetry
Polymer.telemetry={instanceCount:0,registrations:[],_regLog:function _regLog(prototype){console.log('['+prototype.is+']: registered');},register:function register(prototype){this.registrations.push(prototype);Polymer.log&&this._regLog(prototype);},dumpRegistrations:function dumpRegistrations(){this.registrations.forEach(this._regLog);}};Polymer.Element=Polymer.ElementMixin(HTMLElement);Polymer.updateStyles=function(props){if(window.ShadyCSS){ShadyCSS.updateStyles(props);}};})();(function(){// TODO(sorvell): There is an implicit depency on `Polymer.Class` here
// that would be good to resolve. It's because (elements/class.html)
// because this file specially handles `Polymer`.
// Polymer is a Function, but of course this is also an Object, so we
// hang various other objects off of Polymer.*
var userPolymer=window.Polymer;window.Polymer=function(info){// if input is a `class` (aka a function with a prototype), use the prototype
// remember that the `constructor` will never be called
var klass;if(typeof info==='function'){klass=info;}else{klass=Polymer.Class(info);}var options={};if(klass.extends){options.extends=klass.extends;}customElements.define(klass.is,klass,options);return klass;};if(userPolymer){for(var i in userPolymer){Polymer[i]=userPolymer[i];}}})();(function(){'use strict';Polymer.Async={_currVal:0,_lastVal:0,_callbacks:[],_twiddleContent:0,_twiddle:document.createTextNode(''),run:function run(callback,waitTime){if(waitTime>0){return~setTimeout(callback,waitTime);}else{this._twiddle.textContent=this._twiddleContent++;this._callbacks.push(callback);return this._currVal++;}},cancel:function cancel(handle){if(handle<0){clearTimeout(~handle);}else{var idx=handle-this._lastVal;if(idx>=0){if(!this._callbacks[idx]){throw'invalid async handle: '+handle;}this._callbacks[idx]=null;}}},_atEndOfMicrotask:function _atEndOfMicrotask(){var len=this._callbacks.length;for(var i=0;i<len;i++){var cb=this._callbacks[i];if(cb){try{cb();}catch(e){// Clear queue up to this point & start over after throwing
i++;this._callbacks.splice(0,i);this._lastVal+=i;this._twiddle.textContent=this._twiddleContent++;throw e;}}}this._callbacks.splice(0,len);this._lastVal+=len;},flush:function flush(){this.observer.takeRecords();this._atEndOfMicrotask();}};Polymer.Async.observer=new window.MutationObserver(function(){Polymer.Async._atEndOfMicrotask();});Polymer.Async.observer.observe(Polymer.Async._twiddle,{characterData:true});})();Polymer.Debouncer=function Debouncer(context){this.context=context;var self=this;this.boundFlush=function(){self.flush();};};Polymer.Utils.mixin(Polymer.Debouncer.prototype,{go:function go(callback,wait){var h;this.finish=function(){Polymer.Async.cancel(h);};h=Polymer.Async.run(this.boundFlush,wait);this.callback=callback;},cancel:function cancel(){if(this.finish){this.finish();this.finish=null;}},flush:function flush(){if(this.finish){this.cancel();this.callback.call(this.context);}},isActive:function isActive(){return Boolean(this.finish);}});Polymer.Debouncer.debounce=function(debouncer,callback,wait,context){context=context||this;if(debouncer){debouncer.cancel();}else{debouncer=new Polymer.Debouncer(context);}debouncer.go(callback,wait);return debouncer;};(function(){'use strict';// let DIRECTION_MAP = {
//   x: 'pan-x',
//   y: 'pan-y',
//   none: 'none',
//   all: 'auto'
// };
var wrap=function wrap(n){return n;};// detect native touch action support
var HAS_NATIVE_TA=typeof document.head.style.touchAction==='string';var GESTURE_KEY='__polymerGestures';var HANDLED_OBJ='__polymerGesturesHandled';var TOUCH_ACTION='__polymerGesturesTouchAction';// radius for tap and track
var TAP_DISTANCE=25;var TRACK_DISTANCE=5;// number of last N track positions to keep
var TRACK_LENGTH=2;// Disabling "mouse" handlers for 2500ms is enough
var MOUSE_TIMEOUT=2500;var MOUSE_EVENTS=['mousedown','mousemove','mouseup','click'];// an array of bitmask values for mapping MouseEvent.which to MouseEvent.buttons
var MOUSE_WHICH_TO_BUTTONS=[0,1,4,2];var MOUSE_HAS_BUTTONS=function(){try{return new MouseEvent('test',{buttons:1}).buttons===1;}catch(e){return false;}}();// Check for touch-only devices
var IS_TOUCH_ONLY=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);// touch will make synthetic mouse events
// `preventDefault` on touchend will cancel them,
// but this breaks `<input>` focus and link clicks
// disable mouse handlers for MOUSE_TIMEOUT ms after
// a touchend to ignore synthetic mouse events
var mouseCanceller=function mouseCanceller(mouseEvent){// skip synthetic mouse events
mouseEvent[HANDLED_OBJ]={skip:true};// disable "ghost clicks"
if(mouseEvent.type==='click'){var path=mouseEvent.composedPath&&mouseEvent.composedPath();if(path){for(var i=0;i<path.length;i++){if(path[i]===POINTERSTATE.mouse.target){return;}}}mouseEvent.preventDefault();mouseEvent.stopPropagation();}};function setupTeardownMouseCanceller(setup){for(var i=0,en;i<MOUSE_EVENTS.length;i++){en=MOUSE_EVENTS[i];if(setup){document.addEventListener(en,mouseCanceller,true);}else{document.removeEventListener(en,mouseCanceller,true);}}}function ignoreMouse(){if(IS_TOUCH_ONLY){return;}if(!POINTERSTATE.mouse.mouseIgnoreJob){setupTeardownMouseCanceller(true);}var unset=function unset(){setupTeardownMouseCanceller();POINTERSTATE.mouse.target=null;POINTERSTATE.mouse.mouseIgnoreJob=null;};POINTERSTATE.mouse.mouseIgnoreJob=Polymer.Debouncer.debounce(POINTERSTATE.mouse.mouseIgnoreJob,unset,MOUSE_TIMEOUT);}function hasLeftMouseButton(ev){var type=ev.type;// exit early if the event is not a mouse event
if(MOUSE_EVENTS.indexOf(type)===-1){return false;}// ev.button is not reliable for mousemove (0 is overloaded as both left button and no buttons)
// instead we use ev.buttons (bitmask of buttons) or fall back to ev.which (deprecated, 0 for no buttons, 1 for left button)
if(type==='mousemove'){// allow undefined for testing events
var buttons=ev.buttons===undefined?1:ev.buttons;if(ev instanceof window.MouseEvent&&!MOUSE_HAS_BUTTONS){buttons=MOUSE_WHICH_TO_BUTTONS[ev.which]||0;}// buttons is a bitmask, check that the left button bit is set (1)
return Boolean(buttons&1);}else{// allow undefined for testing events
var button=ev.button===undefined?0:ev.button;// ev.button is 0 in mousedown/mouseup/click for left button activation
return button===0;}}function isSyntheticClick(ev){if(ev.type==='click'){// ev.detail is 0 for HTMLElement.click in most browsers
if(ev.detail===0){return true;}// in the worst case, check that the x/y position of the click is within
// the bounding box of the target of the event
// Thanks IE 10 >:(
var t=gestures.findOriginalTarget(ev);var bcr=t.getBoundingClientRect();// use page x/y to account for scrolling
var x=ev.pageX,y=ev.pageY;// ev is a synthetic click if the position is outside the bounding box of the target
return!(x>=bcr.left&&x<=bcr.right&&y>=bcr.top&&y<=bcr.bottom);}return false;}var POINTERSTATE={mouse:{target:null,mouseIgnoreJob:null},touch:{x:0,y:0,id:-1,scrollDecided:false}};function firstTouchAction(ev){var ta='auto';var path=ev.composedPath&&ev.composedPath();if(path){for(var i=0,n;i<path.length;i++){n=path[i];if(n[TOUCH_ACTION]){ta=n[TOUCH_ACTION];break;}}}return ta;}function trackDocument(stateObj,movefn,upfn){stateObj.movefn=movefn;stateObj.upfn=upfn;document.addEventListener('mousemove',movefn);document.addEventListener('mouseup',upfn);}function untrackDocument(stateObj){document.removeEventListener('mousemove',stateObj.movefn);document.removeEventListener('mouseup',stateObj.upfn);stateObj.movefn=null;stateObj.upfn=null;}var gestures={gestures:{},recognizers:[],deepTargetFind:function deepTargetFind(x,y){var node=document.elementFromPoint(x,y);var next=node;// this code path is only taken when native ShadowDOM is used
// if there is a shadowroot, it may have a node at x/y
// if there is not a shadowroot, exit the loop
while(next&&next.shadowRoot){// if there is a node at x/y in the shadowroot, look deeper
next=next.shadowRoot.elementFromPoint(x,y);if(next){node=next;}}return node;},// a cheaper check than ev.composedPath()[0];
findOriginalTarget:function findOriginalTarget(ev){// shadowdom
if(ev.composedPath){return ev.composedPath()[0];}// shadydom
return ev.target;},handleNative:function handleNative(ev){var handled=void 0;var type=ev.type;var node=wrap(ev.currentTarget);var gobj=node[GESTURE_KEY];if(!gobj){return;}var gs=gobj[type];if(!gs){return;}if(!ev[HANDLED_OBJ]){ev[HANDLED_OBJ]={};if(type.slice(0,5)==='touch'){var t=ev.changedTouches[0];if(type==='touchstart'){// only handle the first finger
if(ev.touches.length===1){POINTERSTATE.touch.id=t.identifier;}}if(POINTERSTATE.touch.id!==t.identifier){return;}if(!HAS_NATIVE_TA){if(type==='touchstart'||type==='touchmove'){gestures.handleTouchAction(ev);}}if(type==='touchend'){var rootTarget=ev.composedPath?ev.composedPath()[0]:ev.target;POINTERSTATE.mouse.target=rootTarget;// ignore syntethic mouse events after a touch
ignoreMouse(true);}}}handled=ev[HANDLED_OBJ];// used to ignore synthetic mouse events
if(handled.skip){return;}var recognizers=gestures.recognizers;// reset recognizer state
for(var i=0,r;i<recognizers.length;i++){r=recognizers[i];if(gs[r.name]&&!handled[r.name]){if(r.flow&&r.flow.start.indexOf(ev.type)>-1){if(r.reset){r.reset();}}}}// enforce gesture recognizer order
for(var _i=0,_r;_i<recognizers.length;_i++){_r=recognizers[_i];if(gs[_r.name]&&!handled[_r.name]){handled[_r.name]=true;_r[type](ev);}}},handleTouchAction:function handleTouchAction(ev){var t=ev.changedTouches[0];var type=ev.type;if(type==='touchstart'){POINTERSTATE.touch.x=t.clientX;POINTERSTATE.touch.y=t.clientY;POINTERSTATE.touch.scrollDecided=false;}else if(type==='touchmove'){if(POINTERSTATE.touch.scrollDecided){return;}POINTERSTATE.touch.scrollDecided=true;var ta=firstTouchAction(ev);var prevent=false;var dx=Math.abs(POINTERSTATE.touch.x-t.clientX);var dy=Math.abs(POINTERSTATE.touch.y-t.clientY);if(!ev.cancelable){// scrolling is happening
}else if(ta==='none'){prevent=true;}else if(ta==='pan-x'){prevent=dy>dx;}else if(ta==='pan-y'){prevent=dx>dy;}if(prevent){ev.preventDefault();}else{gestures.prevent('track');}}},addListener:function addListener(node,evType,handler){if(this.gestures[evType]){this.add(node,evType,handler);return true;}},removeListener:function removeListener(node,evType,handler){if(this.gestures[evType]){this.remove(node,evType,handler);return true;}},// automate the event listeners for the native events
add:function add(node,evType,handler){// SD polyfill: handle case where `node` is unwrapped, like `document`
node=wrap(node);var recognizer=this.gestures[evType];var deps=recognizer.deps;var name=recognizer.name;var gobj=node[GESTURE_KEY];if(!gobj){node[GESTURE_KEY]=gobj={};}for(var i=0,dep,gd;i<deps.length;i++){dep=deps[i];// don't add mouse handlers on iOS because they cause gray selection overlays
if(IS_TOUCH_ONLY&&MOUSE_EVENTS.indexOf(dep)>-1){continue;}gd=gobj[dep];if(!gd){gobj[dep]=gd={_count:0};}if(gd._count===0){node.addEventListener(dep,this.handleNative);}gd[name]=(gd[name]||0)+1;gd._count=(gd._count||0)+1;}node.addEventListener(evType,handler);if(recognizer.touchAction){this.setTouchAction(node,recognizer.touchAction);}},// automate event listener removal for native events
remove:function remove(node,evType,handler){// SD polyfill: handle case where `node` is unwrapped, like `document`
node=wrap(node);var recognizer=this.gestures[evType];var deps=recognizer.deps;var name=recognizer.name;var gobj=node[GESTURE_KEY];if(gobj){for(var i=0,dep,gd;i<deps.length;i++){dep=deps[i];gd=gobj[dep];if(gd&&gd[name]){gd[name]=(gd[name]||1)-1;gd._count=(gd._count||1)-1;if(gd._count===0){node.removeEventListener(dep,this.handleNative);}}}}node.removeEventListener(evType,handler);},register:function register(recog){this.recognizers.push(recog);for(var i=0;i<recog.emits.length;i++){this.gestures[recog.emits[i]]=recog;}},findRecognizerByEvent:function findRecognizerByEvent(evName){for(var i=0,r;i<this.recognizers.length;i++){r=this.recognizers[i];for(var j=0,n;j<r.emits.length;j++){n=r.emits[j];if(n===evName){return r;}}}return null;},// set scrolling direction on node to check later on first move
// must call this before adding event listeners!
setTouchAction:function setTouchAction(node,value){if(HAS_NATIVE_TA){node.style.touchAction=value;}node[TOUCH_ACTION]=value;},fire:function fire(target,type,detail){var ev=new Event(type,{bubbles:true,cancelable:true,composed:true});ev.detail=detail;target.dispatchEvent(ev);// forward `preventDefault` in a clean way
if(ev.defaultPrevented){var se=detail.sourceEvent;// sourceEvent may be a touch, which is not preventable this way
if(se&&se.preventDefault){se.preventDefault();}}},prevent:function prevent(evName){var recognizer=this.findRecognizerByEvent(evName);if(recognizer.info){recognizer.info.prevent=true;}}};gestures.register({name:'downup',deps:['mousedown','touchstart','touchend'],flow:{start:['mousedown','touchstart'],end:['mouseup','touchend']},emits:['down','up'],info:{movefn:null,upfn:null},reset:function reset(){untrackDocument(this.info);},mousedown:function mousedown(e){if(!hasLeftMouseButton(e)){return;}var t=gestures.findOriginalTarget(e);var self=this;var movefn=function movefn(e){if(!hasLeftMouseButton(e)){self.fire('up',t,e);untrackDocument(self.info);}};var upfn=function upfn(e){if(hasLeftMouseButton(e)){self.fire('up',t,e);}untrackDocument(self.info);};trackDocument(this.info,movefn,upfn);this.fire('down',t,e);},touchstart:function touchstart(e){this.fire('down',gestures.findOriginalTarget(e),e.changedTouches[0]);},touchend:function touchend(e){this.fire('up',gestures.findOriginalTarget(e),e.changedTouches[0]);},fire:function fire(type,target,event){gestures.fire(target,type,{x:event.clientX,y:event.clientY,sourceEvent:event,prevent:function prevent(e){return gestures.prevent(e);}});}});gestures.register({name:'track',touchAction:'none',deps:['mousedown','touchstart','touchmove','touchend'],flow:{start:['mousedown','touchstart'],end:['mouseup','touchend']},emits:['track'],info:{x:0,y:0,state:'start',started:false,moves:[],addMove:function addMove(move){if(this.moves.length>TRACK_LENGTH){this.moves.shift();}this.moves.push(move);},movefn:null,upfn:null,prevent:false},reset:function reset(){this.info.state='start';this.info.started=false;this.info.moves=[];this.info.x=0;this.info.y=0;this.info.prevent=false;untrackDocument(this.info);},hasMovedEnough:function hasMovedEnough(x,y){if(this.info.prevent){return false;}if(this.info.started){return true;}var dx=Math.abs(this.info.x-x);var dy=Math.abs(this.info.y-y);return dx>=TRACK_DISTANCE||dy>=TRACK_DISTANCE;},mousedown:function mousedown(e){if(!hasLeftMouseButton(e)){return;}var t=gestures.findOriginalTarget(e);var self=this;var movefn=function movefn(e){var x=e.clientX,y=e.clientY;if(self.hasMovedEnough(x,y)){// first move is 'start', subsequent moves are 'move', mouseup is 'end'
self.info.state=self.info.started?e.type==='mouseup'?'end':'track':'start';self.info.addMove({x:x,y:y});if(!hasLeftMouseButton(e)){// always fire "end"
self.info.state='end';untrackDocument(self.info);}self.fire(t,e);self.info.started=true;}};var upfn=function upfn(e){if(self.info.started){gestures.prevent('tap');movefn(e);}// remove the temporary listeners
untrackDocument(self.info);};// add temporary document listeners as mouse retargets
trackDocument(this.info,movefn,upfn);this.info.x=e.clientX;this.info.y=e.clientY;},touchstart:function touchstart(e){var ct=e.changedTouches[0];this.info.x=ct.clientX;this.info.y=ct.clientY;},touchmove:function touchmove(e){var t=gestures.findOriginalTarget(e);var ct=e.changedTouches[0];var x=ct.clientX,y=ct.clientY;if(this.hasMovedEnough(x,y)){this.info.addMove({x:x,y:y});this.fire(t,ct);this.info.state='track';this.info.started=true;}},touchend:function touchend(e){var t=gestures.findOriginalTarget(e);var ct=e.changedTouches[0];// only trackend if track was started and not aborted
if(this.info.started){// iff tracking, always prevent tap
gestures.prevent('tap');// reset started state on up
this.info.state='end';this.info.addMove({x:ct.clientX,y:ct.clientY});this.fire(t,ct);}},fire:function fire(target,touch){var secondlast=this.info.moves[this.info.moves.length-2];var lastmove=this.info.moves[this.info.moves.length-1];var dx=lastmove.x-this.info.x;var dy=lastmove.y-this.info.y;var ddx=void 0,ddy=0;if(secondlast){ddx=lastmove.x-secondlast.x;ddy=lastmove.y-secondlast.y;}return gestures.fire(target,'track',{state:this.info.state,x:touch.clientX,y:touch.clientY,dx:dx,dy:dy,ddx:ddx,ddy:ddy,sourceEvent:touch,hover:function hover(){return gestures.deepTargetFind(touch.clientX,touch.clientY);}});}});gestures.register({name:'tap',deps:['mousedown','click','touchstart','touchend'],flow:{start:['mousedown','touchstart'],end:['click','touchend']},emits:['tap'],info:{x:NaN,y:NaN,prevent:false},reset:function reset(){this.info.x=NaN;this.info.y=NaN;this.info.prevent=false;},save:function save(e){this.info.x=e.clientX;this.info.y=e.clientY;},mousedown:function mousedown(e){if(hasLeftMouseButton(e)){this.save(e);}},click:function click(e){if(hasLeftMouseButton(e)){this.forward(e);}},touchstart:function touchstart(e){this.save(e.changedTouches[0]);},touchend:function touchend(e){this.forward(e.changedTouches[0]);},forward:function forward(e){var dx=Math.abs(e.clientX-this.info.x);var dy=Math.abs(e.clientY-this.info.y);var t=gestures.findOriginalTarget(e);// dx,dy can be NaN if `click` has been simulated and there was no `down` for `start`
if(isNaN(dx)||isNaN(dy)||dx<=TAP_DISTANCE&&dy<=TAP_DISTANCE||isSyntheticClick(e)){// prevent taps from being generated if an event has canceled them
if(!this.info.prevent){gestures.fire(t,'tap',{x:e.clientX,y:e.clientY,sourceEvent:e});}}}});// expose for bc with Polymer 1.0 (e.g. add `tap` listener to document)
Polymer.Gestures=gestures;Polymer.GestureEventListeners=Polymer.Utils.dedupingMixin(function(superClass){return function(_Polymer$EventListene){_inherits(GestureEventListeners,_Polymer$EventListene);function GestureEventListeners(){_classCallCheck(this,GestureEventListeners);return _possibleConstructorReturn(this,(GestureEventListeners.__proto__||Object.getPrototypeOf(GestureEventListeners)).apply(this,arguments));}_createClass(GestureEventListeners,[{key:'_addEventListenerToNode',value:function _addEventListenerToNode(node,eventName,handler){if(!gestures.addListener(node,eventName,handler)){_get(GestureEventListeners.prototype.__proto__||Object.getPrototypeOf(GestureEventListeners.prototype),'_addEventListenerToNode',this).call(this,node,eventName,handler);}}},{key:'_removeEventListenerToNode',value:function _removeEventListenerToNode(node,eventName,handler){if(!gestures.removeListener(node,eventName,handler)){_get(GestureEventListeners.prototype.__proto__||Object.getPrototypeOf(GestureEventListeners.prototype),'_addEventListenerToNode',this).call(this,node,eventName,handler);}}}]);return GestureEventListeners;}(Polymer.EventListeners(superClass));});})();(function(){'use strict';Polymer.AsyncRender={_scheduled:false,_beforeRenderQueue:[],_afterRenderQueue:[],beforeRender:function beforeRender(cb){if(!this._scheduled){this._schedule();}this._beforeRenderQueue.push(cb);},afterRender:function afterRender(cb){if(!this._scheduled){this._schedule();}this._afterRenderQueue.push(cb);},_schedule:function _schedule(){this._scheduled=true;var self=this;// before next render
requestAnimationFrame(function(){self._scheduled=false;self._flushQueue(self._beforeRenderQueue);// after the render
setTimeout(function(){self._flushQueue(self._afterRenderQueue);});});},flush:function flush(){this.flushBeforeRender();this.flushAfterRender();},flushBeforeRender:function flushBeforeRender(){this._flushQueue(this._beforeRenderQueue);},flushAfterRender:function flushAfterRender(){this._flushQueue(this._afterRenderQueue);},_flushQueue:function _flushQueue(queue){for(var i=0;i<queue.length;i++){// TODO(sorvell): include exception handling from Async.
try{queue[i]();}catch(e){console.warn(e);}}queue.splice(0,queue.length);}};// bc
Polymer.RenderStatus={afterNextRender:function afterNextRender(context,fn,args){Polymer.AsyncRender.afterRender(function(){fn.apply(context,args);});}};})();(function(){'use strict';function newSplice(index,removed,addedCount){return{index:index,removed:removed,addedCount:addedCount};}var EDIT_LEAVE=0;var EDIT_UPDATE=1;var EDIT_ADD=2;var EDIT_DELETE=3;var ArraySplice={// Note: This function is *based* on the computation of the Levenshtein
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
calcEditDistances:function calcEditDistances(current,currentStart,currentEnd,old,oldStart,oldEnd){// "Deletion" columns
var rowCount=oldEnd-oldStart+1;var columnCount=currentEnd-currentStart+1;var distances=new Array(rowCount);// "Addition" rows. Initialize null column.
for(var i=0;i<rowCount;i++){distances[i]=new Array(columnCount);distances[i][0]=i;}// Initialize null row
for(var j=0;j<columnCount;j++){distances[0][j]=j;}for(var _i2=1;_i2<rowCount;_i2++){for(var _j=1;_j<columnCount;_j++){if(this.equals(current[currentStart+_j-1],old[oldStart+_i2-1]))distances[_i2][_j]=distances[_i2-1][_j-1];else{var north=distances[_i2-1][_j]+1;var west=distances[_i2][_j-1]+1;distances[_i2][_j]=north<west?north:west;}}}return distances;},// This starts at the final weight, and walks "backward" by finding
// the minimum previous weight recursively until the origin of the weight
// matrix.
spliceOperationsFromEditDistances:function spliceOperationsFromEditDistances(distances){var i=distances.length-1;var j=distances[0].length-1;var current=distances[i][j];var edits=[];while(i>0||j>0){if(i==0){edits.push(EDIT_ADD);j--;continue;}if(j==0){edits.push(EDIT_DELETE);i--;continue;}var northWest=distances[i-1][j-1];var west=distances[i-1][j];var north=distances[i][j-1];var min=void 0;if(west<north)min=west<northWest?west:northWest;else min=north<northWest?north:northWest;if(min==northWest){if(northWest==current){edits.push(EDIT_LEAVE);}else{edits.push(EDIT_UPDATE);current=northWest;}i--;j--;}else if(min==west){edits.push(EDIT_DELETE);i--;current=west;}else{edits.push(EDIT_ADD);j--;current=north;}}edits.reverse();return edits;},/**
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
     *//**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */calcSplices:function calcSplices(current,currentStart,currentEnd,old,oldStart,oldEnd){var prefixCount=0;var suffixCount=0;var splice=void 0;var minLength=Math.min(currentEnd-currentStart,oldEnd-oldStart);if(currentStart==0&&oldStart==0)prefixCount=this.sharedPrefix(current,old,minLength);if(currentEnd==current.length&&oldEnd==old.length)suffixCount=this.sharedSuffix(current,old,minLength-prefixCount);currentStart+=prefixCount;oldStart+=prefixCount;currentEnd-=suffixCount;oldEnd-=suffixCount;if(currentEnd-currentStart==0&&oldEnd-oldStart==0)return[];if(currentStart==currentEnd){splice=newSplice(currentStart,[],0);while(oldStart<oldEnd){splice.removed.push(old[oldStart++]);}return[splice];}else if(oldStart==oldEnd)return[newSplice(currentStart,[],currentEnd-currentStart)];var ops=this.spliceOperationsFromEditDistances(this.calcEditDistances(current,currentStart,currentEnd,old,oldStart,oldEnd));splice=undefined;var splices=[];var index=currentStart;var oldIndex=oldStart;for(var i=0;i<ops.length;i++){switch(ops[i]){case EDIT_LEAVE:if(splice){splices.push(splice);splice=undefined;}index++;oldIndex++;break;case EDIT_UPDATE:if(!splice)splice=newSplice(index,[],0);splice.addedCount++;index++;splice.removed.push(old[oldIndex]);oldIndex++;break;case EDIT_ADD:if(!splice)splice=newSplice(index,[],0);splice.addedCount++;index++;break;case EDIT_DELETE:if(!splice)splice=newSplice(index,[],0);splice.removed.push(old[oldIndex]);oldIndex++;break;}}if(splice){splices.push(splice);}return splices;},sharedPrefix:function sharedPrefix(current,old,searchLength){for(var i=0;i<searchLength;i++){if(!this.equals(current[i],old[i]))return i;}return searchLength;},sharedSuffix:function sharedSuffix(current,old,searchLength){var index1=current.length;var index2=old.length;var count=0;while(count<searchLength&&this.equals(current[--index1],old[--index2])){count++;}return count;},calculateSplices:function calculateSplices(current,previous){return this.calcSplices(current,0,current.length,previous,0,previous.length);},equals:function equals(currentValue,previousValue){return currentValue===previousValue;}};Polymer.ArraySplice={calculateSplices:function calculateSplices(current,previous){return ArraySplice.calculateSplices(current,previous);}};})();(function(){function isSlot(node){return node.localName==='slot';}function getEffectiveNodes(node){if(isSlot(node)){return node.assignedNodes({flatten:true});}else{return Array.from(node.childNodes).map(function(node){if(isSlot(node)){return node.assignedNodes({flatten:true});}else{return[node];}}).reduce(function(a,b){return a.concat(b);},[]);}}var effectiveNodesObserverPromise=Promise.resolve();var EffectiveNodesObserver=function(){function EffectiveNodesObserver(target,callback){var _this12=this;_classCallCheck(this,EffectiveNodesObserver);this.target=target;this.callback=callback;this.effectiveNodes=[];this.observer=null;this.scheduled=false;this._boundSchedule=function(){_this12.schedule();};this.connect();this.schedule();}_createClass(EffectiveNodesObserver,[{key:'connect',value:function connect(){var _this13=this;if(isSlot(this.target)){this.listenSlots([this.target]);}else{this.listenSlots(this.target.children);if(window.ShadyDOM){this.shadyChildrenObserver=ShadyDOM.observeChildren(this.target,function(mutations){_this13.processMutations(mutations);});}else{this.nativeChildrenObserver=new MutationObserver(function(mutations){_this13.processMutations(mutations);});this.nativeChildrenObserver.observe(this.target,{childList:true});}}this.connected=true;}},{key:'disconnect',value:function disconnect(){if(isSlot(this.target)){this.unlistenSlots([this.target]);}else{this.unlistenSlots(this.target.children);if(window.ShadyDOM&&this.shadyChildrenObserver){ShadyDOM.unobserveChildren(this.shadyChildrenObserver);this.shadyChildrenObserver=null;}else if(this.nativeChildrenObserver){this.nativeChildrenObserver.disconnect();this.nativeChildrenObserver=null;}}this.connected=false;}},{key:'schedule',value:function schedule(){var _this14=this;if(!this.scheduled){this.scheduled=true;effectiveNodesObserverPromise.then(function(){_this14.flush();});}}},{key:'processMutations',value:function processMutations(mutations){this.processSlotMutations(mutations);this.flush();}},{key:'processSlotMutations',value:function processSlotMutations(mutations){if(mutations){for(var i=0;i<mutations.length;i++){var mutation=mutations[i];if(mutation.addedNodes){this.listenSlots(mutation.addedNodes);}if(mutation.removedNodes){this.unlistenSlots(mutation.removedNodes);}}}}},{key:'flush',value:function flush(){if(!this.connected){return;}if(window.ShadyDOM){ShadyDOM.flush();}if(this.nativeChildrenObserver){this.processSlotMutations(this.nativeChildrenObserver.takeRecords());}else if(this.shadyChildrenObserver){this.processSlotMutations(this.shadyChildrenObserver.takeRecords());}this.scheduled=false;var info={target:this.target,addedNodes:[],removedNodes:[]};var newNodes=getEffectiveNodes(this.target);var splices=Polymer.ArraySplice.calculateSplices(newNodes,this.effectiveNodes);// process removals
for(var i=0,s;i<splices.length&&(s=splices[i]);i++){for(var j=0,n;j<s.removed.length&&(n=s.removed[j]);j++){info.removedNodes.push(n);}}// process adds
for(var _i3=0,_s;_i3<splices.length&&(_s=splices[_i3]);_i3++){for(var _j2=_s.index;_j2<_s.index+_s.addedCount;_j2++){info.addedNodes.push(newNodes[_j2]);}}// update cache
this.effectiveNodes=newNodes;if(info.addedNodes.length||info.removedNodes.length){this.callback(info);}}},{key:'listenSlots',value:function listenSlots(nodeList){for(var i=0;i<nodeList.length;i++){var n=nodeList[i];if(isSlot(n)){n.addEventListener('slotchange',this._boundSchedule);}}}},{key:'unlistenSlots',value:function unlistenSlots(nodeList){for(var i=0;i<nodeList.length;i++){var n=nodeList[i];if(isSlot(n)){n.removeEventListener('slotchange',this._boundSchedule);}}}}]);return EffectiveNodesObserver;}();var DomApi=function(){function DomApi(node){_classCallCheck(this,DomApi);if(window.ShadyDOM){ShadyDOM.patch(node);}this.node=node;}_createClass(DomApi,[{key:'observeNodes',value:function observeNodes(callback){if(window.ShadyDOM){ShadyDOM.flush();}return new EffectiveNodesObserver(this.node,callback);}},{key:'unobserveNodes',value:function unobserveNodes(observerHandle){observerHandle.disconnect();}},{key:'notifyObserver',value:function notifyObserver(){}},{key:'deepContains',value:function deepContains(node){if(this.node.contains(node)){return true;}var n=node;var doc=node.ownerDocument;// walk from node to `this` or `document`
while(n&&n!==doc&&n!==this.node){// use logical parentnode, or native ShadowRoot host
n=Polymer.dom(n).parentNode||n.host;}return n===this.node;}},{key:'getOwnerRoot',value:function getOwnerRoot(){return this.node.getRootNode();}},{key:'getDistributedNodes',value:function getDistributedNodes(){return this.node.localName==='slot'?this.node.assignedNodes({flatten:true}):[];}},{key:'getDestinationInsertionPoints',value:function getDestinationInsertionPoints(){var ip$=[];var n=this.node.assignedSlot;while(n){ip$.push(n);n=n.assignedSlot;}return ip$;}},{key:'importNode',value:function importNode(externalNode,deep){var doc=this.node instanceof Document?this.node:this.node.ownerDocument;return doc.importNode(externalNode,deep);}},{key:'getEffectiveChildNodes',value:function getEffectiveChildNodes(){return getEffectiveNodes(this.node);}},{key:'queryDistributedElements',value:function queryDistributedElements(selector){var c$=this.getEffectiveChildNodes();var list=[];for(var i=0,l=c$.length,c;i<l&&(c=c$[i]);i++){if(c.nodeType===Node.ELEMENT_NODE&&Polymer.Utils.matchesSelector(this.node,selector)){list.push(c);}}return list;}}]);return DomApi;}();function forwardMethods(proto,methods){var _loop=function _loop(i){var method=methods[i];proto[method]=function(){return this.node[method].apply(this.node,arguments);};};for(var i=0;i<methods.length;i++){_loop(i);}}function forwardReadOnlyProperties(proto,properties){var _loop2=function _loop2(i){var name=properties[i];Object.defineProperty(proto,name,{get:function get(){return this.node[name];},configurable:true});};for(var i=0;i<properties.length;i++){_loop2(i);}}function forwardProperties(proto,properties){var _loop3=function _loop3(i){var name=properties[i];Object.defineProperty(proto,name,{get:function get(){return this.node[name];},set:function set(value){this.name[name]=value;},configurable:true});};for(var i=0;i<properties.length;i++){_loop3(i);}}forwardMethods(DomApi.prototype,['cloneNode','appendChild','insertBefore','removeChild','replaceChild','setAttribute','removeAttribute','querySelector','querySelectorAll']);forwardReadOnlyProperties(DomApi.prototype,['activeElement','parentNode','firstChild','lastChild','nextSibling','previousSibling','firstElementChild','lastElementChild','nextElementSibling','previousElementSibling','childNodes','children']);forwardProperties(DomApi.prototype,['textContent','innerHTML']);var EventApi=function(){function EventApi(event){_classCallCheck(this,EventApi);this.event=event;}_createClass(EventApi,[{key:'rootTarget',get:function get(){return this.event.composedPath()[0];}},{key:'localTarget',get:function get(){return this.event.target;}}]);return EventApi;}();Polymer.dom=function(obj){obj=obj||document;var ctor=obj instanceof Event?EventApi:DomApi;if(!obj.__domApi){obj.__domApi=new ctor(obj);}return obj.__domApi;};Polymer.dom.flush=function(){if(window.ShadyDOM){ShadyDOM.flush();}if(customElements.flush){customElements.flush();}};Polymer.Settings={useShadow:true};})();(function(){// unresolved
function resolve(){document.body.removeAttribute('unresolved');}if(window.WebComponents){addEventListener('WebComponentsReady',resolve);}else{if(document.readyState==='interactive'||document.readyState==='complete'){resolve();}else{addEventListener('DOMContentLoaded',resolve);}}})();(function(){'use strict';var utils=Polymer.Utils;// TODO(sorvell): same api as before.
Polymer._warn=function(warning){console.warn(warning);};Polymer.LegacyElementMixin=Polymer.Utils.cachingMixin(function(base){return function(_Polymer$GestureEvent){_inherits(LegacyElement,_Polymer$GestureEvent);function LegacyElement(){_classCallCheck(this,LegacyElement);var _this15=_possibleConstructorReturn(this,(LegacyElement.__proto__||Object.getPrototypeOf(LegacyElement)).call(this));_this15.created();return _this15;}_createClass(LegacyElement,[{key:'_applyListeners',value:function _applyListeners(){this._applyConfigListeners(this.constructor._ownConfig);}},{key:'_applyConfigListeners',value:function _applyConfigListeners(config){if(config.listeners){for(var l in config.listeners){this._addMethodEventListenerToNode(this,l,config.listeners[l]);}}}},{key:'_ensureAttributes',value:function _ensureAttributes(){this._ensureConfigAttributes(this.constructor._ownConfig);}},{key:'_ensureConfigAttributes',value:function _ensureConfigAttributes(config){if(config.hostAttributes){for(var a in config.hostAttributes){this._ensureAttribute(a,config.hostAttributes[a]);}}}},{key:'ready',value:function ready(){this._applyListeners();this._ensureAttributes();_get(LegacyElement.prototype.__proto__||Object.getPrototypeOf(LegacyElement.prototype),'ready',this).call(this);}},{key:'connectedCallback',value:function connectedCallback(){_get(LegacyElement.prototype.__proto__||Object.getPrototypeOf(LegacyElement.prototype),'connectedCallback',this).call(this);this.isAttached=true;this.attached();}},{key:'disconnectedCallback',value:function disconnectedCallback(){this.isAttached=false;_get(LegacyElement.prototype.__proto__||Object.getPrototypeOf(LegacyElement.prototype),'disconnectedCallback',this).call(this);this.detached();}},{key:'attributeChangedCallback',value:function attributeChangedCallback(name,old,value){_get(LegacyElement.prototype.__proto__||Object.getPrototypeOf(LegacyElement.prototype),'attributeChangedCallback',this).call(this,name,old,value);this.attributeChanged(name,old,value);}},{key:'created',value:function created(){}},{key:'attached',value:function attached(){}},{key:'detached',value:function detached(){}},{key:'attributeChanged',value:function attributeChanged(){}},{key:'serialize',value:function serialize(value){return this._serializeAttribute(value);}},{key:'deserialize',value:function deserialize(value,type){return this._deserializeAttribute(value,type);}},{key:'reflectPropertyToAttribute',value:function reflectPropertyToAttribute(property,attribute,value){this._propertyToAttribute(this,property,attribute,value);}},{key:'serializeValueToAttribute',value:function serializeValueToAttribute(value,attribute,node){this._valueToAttribute(node||this,value,attribute);}/**
       * Copies own properties (including accessor descriptors) from a source
       * object to a target object.
       *
       * @method extend
       * @param {Object} prototype Target object to copy properties to.
       * @param {Object} api Source object to copy properties from.
       * @return {Object} prototype object that was passed as first argument.
       */},{key:'extend',value:function extend(prototype,api){return utils.extend(prototype,api);}/**
       * Copies props from a source object to a target object.
       *
       * Note, this method uses a simple `for...in` strategy for enumerating
       * properties.  To ensure only `ownProperties` are copied from source
       * to target and that accessor implementations are copied, use `extend`.
       *
       * @method mixin
       * @param {Object} target Target object to copy properties to.
       * @param {Object} source Source object to copy properties from.
       * @return {Object} Target object that was passed as first argument.
       */},{key:'mixin',value:function mixin(target,source){return utils.mixin(target,source);}},{key:'chainObject',value:function chainObject(object,inherited){if(object&&inherited&&object!==inherited){if(!Object.__proto__){object=this.extend(Object.create(inherited),object);}object.__proto__=inherited;}return object;}/* **** Begin Template **** *//**
       * Calls `importNode` on the `content` of the `template` specified and
       * returns a document fragment containing the imported content.
       *
       * @method instanceTemplate
       * @param {HTMLTemplateElement} template HTML template element to instance.
       * @return {DocumentFragment} Document fragment containing the imported
       *   template content.
      */},{key:'instanceTemplate',value:function instanceTemplate(template){var dom=document.importNode(template._content||template.content,true);return dom;}/**
       * Rewrites a given URL relative to the original location of the document
       * containing the `dom-module` for this element.  This method will return
       * the same URL before and after vulcanization.
       *
       * @method resolveUrl
       * @param {string} url URL to resolve.
       * @return {string} Rewritten URL relative to the import
       */},{key:'resolveUrl',value:function resolveUrl(url){var module=Polymer.DomModule.import(this.is);var root='';if(module){var assetPath=module.getAttribute('assetpath')||'';root=Polymer.ResolveUrl.resolveUrl(assetPath,module.ownerDocument.baseURI);}return Polymer.ResolveUrl.resolveUrl(url,root);}/* **** Begin Events **** *//**
       * Dispatches a custom event with an optional detail value.
       *
       * @method fire
       * @param {String} type Name of event type.
       * @param {*=} detail Detail value containing event-specific
       *   payload.
       * @param {Object=} options Object specifying options.  These may include:
       *  `bubbles` (boolean, defaults to `true`),
       *  `cancelable` (boolean, defaults to false), and
       *  `node` on which to fire the event (HTMLElement, defaults to `this`).
       * @return {CustomEvent} The new event that was fired.
       */},{key:'fire',value:function fire(type,detail,options){options=options||{};detail=detail===null||detail===undefined?{}:detail;var event=new Event(type,{bubbles:options.bubbles===undefined?true:options.bubbles,cancelable:Boolean(options.cancelable),composed:options.composed===undefined?true:options.composed});event.detail=detail;var node=options.node||this;node.dispatchEvent(event);return event;}/**
       * Convenience method to add an event listener on a given element,
       * late bound to a named method on this element.
       *
       * @method listen
       * @param {Element} node Element to add event listener to.
       * @param {string} eventName Name of event to listen for.
       * @param {string} methodName Name of handler method on `this` to call.
       */},{key:'listen',value:function listen(node,eventName,methodName){node=node||this;var hbl=this.__boundListeners||(this.__boundListeners=new WeakMap());var bl=hbl.get(node);if(!bl){bl={};hbl.set(node,bl);}var key=eventName+methodName;if(!bl[key]){bl[key]=this._addMethodEventListenerToNode(node,eventName,methodName,this);}}/**
       * Convenience method to remove an event listener from a given element,
       * late bound to a named method on this element.
       *
       * @method unlisten
       * @param {Element} node Element to remove event listener from.
       * @param {string} eventName Name of event to stop listening to.
       * @param {string} methodName Name of handler method on `this` to not call
       anymore.
       */},{key:'unlisten',value:function unlisten(node,eventName,methodName){node=node||this;var bl=this.__boundListeners&&this.__boundListeners.get(node);var key=eventName+methodName;var handler=bl&&bl[key];if(handler){this._removeEventListenerFromNode(node,eventName,handler);bl[key]=null;}}/**
       * Override scrolling behavior to all direction, one direction, or none.
       *
       * Valid scroll directions:
       *   - 'all': scroll in any direction
       *   - 'x': scroll only in the 'x' direction
       *   - 'y': scroll only in the 'y' direction
       *   - 'none': disable scrolling for this node
       *
       * @method setScrollDirection
       * @param {String=} direction Direction to allow scrolling
       * Defaults to `all`.
       * @param {HTMLElement=} node Element to apply scroll direction setting.
       * Defaults to `this`.
       */},{key:'setScrollDirection',value:function setScrollDirection(direction,node){Polymer.Gestures.setTouchAction(node||this,direction||'auto');}/* **** End Events **** *//**
       * Convenience method to run `querySelector` on this local DOM scope.
       *
       * This function calls `Polymer.dom(this.root).querySelector(slctr)`.
       *
       * @method $$
       * @param {string} slctr Selector to run on this local DOM scope
       * @return {Element} Element found by the selector, or null if not found.
       */},{key:'$$',value:function $$(slctr){return this.root.querySelector(slctr);}/**
       * Return the element whose local dom within which this element
       * is contained. This is a shorthand for
       * `this.getRootNode().host`.
       */},{key:'distributeContent',/**
       * Force this element to distribute its children to its local dom.
       * This is necessary only when ShadyDOM is used and only in cases that
       * are not automatically handled. For example,
       * a user should call `distributeContent` if distribution has been
       * invalidated due to an element being added or removed from the shadowRoot
       * that contains an insertion point (<slot>) inside its subtree.
       * @method distributeContent
       */value:function distributeContent(){if(window.ShadyDOM&&this.shadowRoot){this.shadowRoot.forceRender();}}/**
       * Returns a list of nodes that are the effective childNodes. The effective
       * childNodes list is the same as the element's childNodes except that
       * any `<content>` elements are replaced with the list of nodes distributed
       * to the `<content>`, the result of its `getDistributedNodes` method.
       *
       * @method getEffectiveChildNodes
       * @return {Array<Node>} List of effctive child nodes.
       */},{key:'getEffectiveChildNodes',value:function getEffectiveChildNodes(){return Polymer.dom(this).getEffectiveChildNodes();}/**
       * Returns a list of nodes distributed within this element that match
       * `selector`. These can be dom children or elements distributed to
       * children that are insertion points.
       * @method queryDistributedElements
       * @param {string} selector Selector to run.
       * @return {Array<Node>} List of distributed elements that match selector.
       */},{key:'queryDistributedElements',value:function queryDistributedElements(selector){return Polymer.dom(this).queryDistributedElements(selector);}/**
       * Returns a list of elements that are the effective children. The effective
       * children list is the same as the element's children except that
       * any `<content>` elements are replaced with the list of elements
       * distributed to the `<content>`.
       *
       * @method getEffectiveChildren
       * @return {Array<Node>} List of effctive children.
       */},{key:'getEffectiveChildren',value:function getEffectiveChildren(){var list=this.getEffectiveChildNodes();return list.filter(function(n){return n.nodeType===Node.ELEMENT_NODE;});}/**
       * Returns a string of text content that is the concatenation of the
       * text content's of the element's effective childNodes (the elements
       * returned by <a href="#getEffectiveChildNodes>getEffectiveChildNodes</a>.
       *
       * @method getEffectiveTextContent
       * @return {Array<Node>} List of effctive children.
       */},{key:'getEffectiveTextContent',value:function getEffectiveTextContent(){var cn=this.getEffectiveChildNodes();var tc=[];for(var i=0,c;c=cn[i];i++){if(c.nodeType!==Node.COMMENT_NODE){tc.push(c.textContent);}}return tc.join('');}/**
       * Returns the first effective childNode within this element that
       * match `selector`. These can be dom child nodes or elements distributed
       * to children that are insertion points.
       * @method queryEffectiveChildren
       * @param {string} selector Selector to run.
       * @return {Object<Node>} First effective child node that matches selector.
       */},{key:'queryEffectiveChildren',value:function queryEffectiveChildren(selector){var e$=this.queryDistributedElements(selector);return e$&&e$[0];}/**
       * Returns a list of effective childNodes within this element that
       * match `selector`. These can be dom child nodes or elements distributed
       * to children that are insertion points.
       * @method queryEffectiveChildren
       * @param {string} selector Selector to run.
       * @return {Array<Node>} List of effective child nodes that match selector.
       */},{key:'queryAllEffectiveChildren',value:function queryAllEffectiveChildren(selector){return this.queryDistributedElements(selector);}/**
       * Returns a list of nodes distributed to this element's `<content>`.
       *
       * If this element contains more than one `<content>` in its local DOM,
       * an optional selector may be passed to choose the desired content.
       *
       * @method getContentChildNodes
       * @param {String=} slctr CSS selector to choose the desired
       *   `<content>`.  Defaults to `content`.
       * @return {Array<Node>} List of distributed nodes for the `<content>`.
       */},{key:'getContentChildNodes',value:function getContentChildNodes(slctr){var content=this.root.querySelector(slctr||'content');return content?content.getDistributedNodes():[];}/**
       * Returns a list of element children distributed to this element's
       * `<content>`.
       *
       * If this element contains more than one `<content>` in its
       * local DOM, an optional selector may be passed to choose the desired
       * content.  This method differs from `getContentChildNodes` in that only
       * elements are returned.
       *
       * @method getContentChildNodes
       * @param {String=} slctr CSS selector to choose the desired
       *   `<content>`.  Defaults to `content`.
       * @return {Array<HTMLElement>} List of distributed nodes for the
       *   `<content>`.
       */},{key:'getContentChildren',value:function getContentChildren(slctr){return this.getContentChildNodes(slctr).filter(function(n){return n.nodeType===Node.ELEMENT_NODE;});}/**
       * Checks whether an element is in this element's light DOM tree.
       *
       * @method isLightDescendant
       * @param {?Node} node The element to be checked.
       * @return {Boolean} true if node is in this element's light DOM tree.
       */},{key:'isLightDescendant',value:function isLightDescendant(node){return this!==node&&this.contains(node)&&this.getRootNode()===node.getRootNode();}/**
       * Checks whether an element is in this element's local DOM tree.
       *
       * @method isLocalDescendant
       * @param {HTMLElement=} node The element to be checked.
       * @return {Boolean} true if node is in this element's local DOM tree.
       */},{key:'isLocalDescendant',value:function isLocalDescendant(node){return this.root===node.getRootNode();}// NOTE: should now be handled by ShadyCss library.
},{key:'scopeSubtree',value:function scopeSubtree(container,shouldObserve){}// eslint-disable-line no-unused-vars
/**
       * Returns the computed style value for the given property.
       * @param {String} property
       * @return {String} the computed value
       */},{key:'getComputedStyleValue',value:function getComputedStyleValue(property){return ShadyCSS.getComputedStyleValue(this,property);}// debounce
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
       * @method debounce
       * @param {String} jobName String to indentify the debounce job.
       * @param {Function} callback Function that is called (with `this`
       *   context) when the wait time elapses.
       * @param {number} wait Optional wait time in milliseconds (ms) after the
       *   last signal that must elapse before invoking `callback`
       */},{key:'debounce',value:function debounce(jobName,callback,wait){this._debouncers=this._debouncers||{};return this._debouncers[jobName]=Polymer.Debouncer.debounce(this._debouncers[jobName],callback,wait,this);}/**
       * Returns whether a named debouncer is active.
       *
       * @method isDebouncerActive
       * @param {String} jobName The name of the debouncer started with `debounce`
       * @return {boolean} Whether the debouncer is active (has not yet fired).
       */},{key:'isDebouncerActive',value:function isDebouncerActive(jobName){this._debouncers=this._debouncers||{};var debouncer=this._debouncers[jobName];return!!(debouncer&&debouncer.isActive());}/**
       * Immediately calls the debouncer `callback` and inactivates it.
       *
       * @method flushDebouncer
       * @param {String} jobName The name of the debouncer started with `debounce`
       */},{key:'flushDebouncer',value:function flushDebouncer(jobName){this._debouncers=this._debouncers||{};var debouncer=this._debouncers[jobName];if(debouncer){debouncer.flush();}}/**
       * Cancels an active debouncer.  The `callback` will not be called.
       *
       * @method cancelDebouncer
       * @param {String} jobName The name of the debouncer started with `debounce`
       */},{key:'cancelDebouncer',value:function cancelDebouncer(jobName){this._debouncers=this._debouncers||{};var debouncer=this._debouncers[jobName];if(debouncer){debouncer.cancel();}}/**
       * Runs a callback function asyncronously.
       *
       * By default (if no waitTime is specified), async callbacks are run at
       * microtask timing, which will occur before paint.
       *
       * @method async
       * @param {Function} callback The callback function to run, bound to `this`.
       * @param {number=} waitTime Time to wait before calling the
       *   `callback`.  If unspecified or 0, the callback will be run at microtask
       *   timing (before paint).
       * @return {number} Handle that may be used to cancel the async job.
       */},{key:'async',value:function async(callback,waitTime){var self=this;return Polymer.Async.run(function(){callback.call(self);},waitTime);}/**
       * Cancels an async operation started with `async`.
       *
       * @method cancelAsync
       * @param {number} handle Handle returned from original `async` call to
       *   cancel.
       */},{key:'cancelAsync',value:function cancelAsync(handle){Polymer.Async.cancel(handle);}// other
/**
       * Convenience method for creating an element and configuring it.
       *
       * @method create
       * @param {string} tag HTML element tag to create.
       * @param {Object} props Object of properties to configure on the
       *    instance.
       * @return {Element} Newly created and configured element.
       */},{key:'create',value:function create(tag,props){var elt=document.createElement(tag);if(props){if(elt.setProperties){elt.setProperties(props);}else{for(var n in props){elt[n]=props[n];}}}return elt;}/**
       * Convenience method for importing an HTML document imperatively.
       *
       * This method creates a new `<link rel="import">` element with
       * the provided URL and appends it to the document to start loading.
       * In the `onload` callback, the `import` property of the `link`
       * element will contain the imported document contents.
       *
       * @method importHref
       * @param {string} href URL to document to load.
       * @param {Function} onload Callback to notify when an import successfully
       *   loaded.
       * @param {Function} onerror Callback to notify when an import
       *   unsuccessfully loaded.
       * @param {boolean} optAsync True if the import should be loaded `async`.
       *   Defaults to `false`.
       * @return {HTMLLinkElement} The link element for the URL to be loaded.
       */},{key:'importHref',value:function importHref(href,onload,onerror,optAsync){var l=document.createElement('link');l.rel='import';l.href=href;optAsync=Boolean(optAsync);if(optAsync){l.setAttribute('async','');}var self=this;if(onload){l.onload=function(e){return onload.call(self,e);};}if(onerror){l.onerror=function(e){return onerror.call(self,e);};}document.head.appendChild(l);return l;}/**
       * Polyfill for Element.prototype.matches, which is sometimes still
       * prefixed.
       *
       * @method elementMatches
       * @param {string} selector Selector to test.
       * @param {Element=} node Element to test the selector against.
       * @return {boolean} Whether the element matches the selector.
       */},{key:'elementMatches',value:function elementMatches(selector,node){return Polymer.Utils.matchesSelector(node||this,selector);}/**
       * Toggles an HTML attribute on or off.
       *
       * @method toggleAttribute
       * @param {String} name HTML attribute name
       * @param {boolean=} bool Boolean to force the attribute on or off.
       *    When unspecified, the state of the attribute will be reversed.
       * @param {HTMLElement=} node Node to target.  Defaults to `this`.
       */},{key:'toggleAttribute',value:function toggleAttribute(name,bool,node){node=node||this;if(arguments.length==1){bool=!node.hasAttribute(name);}if(bool){node.setAttribute(name,'');}else{node.removeAttribute(name);}}/**
       * Toggles a CSS class on or off.
       *
       * @method toggleClass
       * @param {String} name CSS class name
       * @param {boolean=} bool Boolean to force the class on or off.
       *    When unspecified, the state of the class will be reversed.
       * @param {HTMLElement=} node Node to target.  Defaults to `this`.
       */},{key:'toggleClass',value:function toggleClass(name,bool,node){node=node||this;if(arguments.length==1){bool=!node.classList.contains(name);}if(bool){node.classList.add(name);}else{node.classList.remove(name);}}/**
       * Cross-platform helper for setting an element's CSS `transform` property.
       *
       * @method transformText
       * @param {String} transform Transform setting.
       * @param {HTMLElement=} node Element to apply the transform to.
       * Defaults to `this`
       */},{key:'transform',value:function transform(transformText,node){node=node||this;node.style.webkitTransform=transformText;node.style.transform=transformText;}/**
       * Cross-platform helper for setting an element's CSS `translate3d`
       * property.
       *
       * @method translate3d
       * @param {number} x X offset.
       * @param {number} y Y offset.
       * @param {number} z Z offset.
       * @param {HTMLElement=} node Element to apply the transform to.
       * Defaults to `this`.
       */},{key:'translate3d',value:function translate3d(x,y,z,node){node=node||this;this.transform('translate3d('+x+','+y+','+z+')',node);}/**
       * Removes an item from an array, if it exists.
       *
       * If the array is specified by path, a change notification is
       * generated, so that observers, data bindings and computed
       * properties watching that path can update.
       *
       * If the array is passed directly, **no change
       * notification is generated**.
       *
       * @method arrayDelete
       * @param {String|Array} path Path to array from which to remove the item
       *   (or the array itself).
       * @param {any} item Item to remove.
       * @return {Array} Array containing item removed.
       */},{key:'arrayDelete',value:function arrayDelete(arrayOrPath,item){var index;if(Array.isArray(arrayOrPath)){index=arrayOrPath.indexOf(item);if(index>=0){return arrayOrPath.splice(index,1);}}else{var arr=Polymer.Path.get(this,arrayOrPath);index=arr.indexOf(item);if(index>=0){return this.splice(arrayOrPath,index,1);}}}},{key:'domHost',get:function get(){var root=this.getRootNode();return root instanceof DocumentFragment?root.host:root;}}]);return LegacyElement;}(Polymer.GestureEventListeners(Polymer.ElementMixin(base)));});// bc
Polymer.LegacyElement=Polymer.LegacyElementMixin(HTMLElement);Polymer.Base=Polymer.LegacyElement.prototype;})();(function(){'use strict';var utils=Polymer.Utils;var LegacyElementMixin=Polymer.LegacyElementMixin;var metaProps={attached:true,detached:true,ready:true,created:true,beforeRegister:true,registered:true,attributeChanged:true,// meta objects
behaviors:true,hostAttributes:true,properties:true,observers:true,listeners:true};var mixinBehaviors=function mixinBehaviors(behaviors,klass){for(var i=0;i<behaviors.length;i++){var b=behaviors[i];if(b){klass=Array.isArray(b)?mixinBehaviors(b,klass):MixinBehavior(b,klass);}}return klass;};var flattenBehaviors=function flattenBehaviors(behaviors,list){list=list||[];if(behaviors){for(var i=0;i<behaviors.length;i++){var b=behaviors[i];if(b){if(Array.isArray(b)){flattenBehaviors(b,list);}else{if(list.indexOf(b)<0){list.push(b);}}}else{Polymer._warn('behavior is null, check for missing or 404 import');}}}return list;};var MixinBehavior=function MixinBehavior(behavior,Base){var config={properties:behavior.properties,observers:behavior.observers};var PolymerGenerated=function(_Base){_inherits(PolymerGenerated,_Base);_createClass(PolymerGenerated,[{key:'_invokeFunction',value:function _invokeFunction(fn,args){if(fn){fn.apply(this,args);}}}],[{key:'config',get:function get(){return config;}}]);function PolymerGenerated(){_classCallCheck(this,PolymerGenerated);// call `registered` only if it was not called for *this* constructor
var _this16=_possibleConstructorReturn(this,(PolymerGenerated.__proto__||Object.getPrototypeOf(PolymerGenerated)).call(this));if(!PolymerGenerated.hasOwnProperty('__registered')){PolymerGenerated.__registered=true;if(behavior.registered){behavior.registered.call(Object.getPrototypeOf(_this16));}}return _this16;}_createClass(PolymerGenerated,[{key:'created',value:function created(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'created',this).call(this);this._invokeFunction(behavior.created);}},{key:'_applyConfigMetaData',value:function _applyConfigMetaData(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'_applyConfigMetaData',this).call(this);this._applyConfigMetaDataFrom(behavior);}},{key:'_applyListeners',value:function _applyListeners(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'_applyListeners',this).call(this);this._applyConfigListeners(behavior);}},{key:'_ensureAttributes',value:function _ensureAttributes(){// ensure before calling super so that subclasses can override defaults
this._ensureConfigAttributes(behavior);_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'_ensureAttributes',this).call(this);}},{key:'ready',value:function ready(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'ready',this).call(this);this._invokeFunction(behavior.ready);}},{key:'attached',value:function attached(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'attached',this).call(this);this._invokeFunction(behavior.attached);}},{key:'detached',value:function detached(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'detached',this).call(this);this._invokeFunction(behavior.detached);}},{key:'attributeChanged',value:function attributeChanged(name,old,value){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'attributeChanged',this).call(this,name,old,value);this._invokeFunction(behavior.attributeChanged,[name,old,value]);}}]);return PolymerGenerated;}(Base);for(var p in behavior){if(!(p in metaProps))utils.copyOwnProperty(p,behavior,PolymerGenerated.prototype);}return PolymerGenerated;};//var nativeConstructors = {};
/**
     * Returns the native element constructor for the tag specified.
     *
     * @method getNativeConstructor
     * @param {string} tag  HTML tag name.
     * @return {Object} Native constructor for specified tag.
    */var getNativeConstructor=function getNativeConstructor(tag){if(tag){// TODO(kschaaf): hack, for now, needs to be removed; needed to allow
// subclassing from overwridden constructors in CEv1 polyfill
return window['HTML'+tag[0].toUpperCase()+tag.slice(1)+'Element'];// var c = nativeConstructors[tag];
// if (!c) {
//   c = document.createElement(tag).constructor;
//   nativeConstructors[tag] = c;
// }
// return c;
}else{return HTMLElement;}};Polymer.Class=function(info){if(!info){Polymer._warn('Polymer.Class requires `info` argument');}var klass=LegacyElementMixin(getNativeConstructor(info.extends));var behaviors=flattenBehaviors(info.behaviors);if(behaviors.length){klass=mixinBehaviors(behaviors,klass);}klass=MixinBehavior(info,klass);// decorate klass with registration info
klass.is=info.is;klass.extends=info.extends;// behaviors on prototype for BC...
behaviors.reverse();klass.prototype.behaviors=behaviors;// NOTE: while we could call `beforeRegister` here to maintain
// some BC, the state of the element at this point is not as it was in 1.0
// In 1.0, the method was called *after* mixing prototypes together
// but before processing of meta-objects. Since this is now done
// in 1 step via `MixinBehavior`, this is no longer possible.
// However, *most* work (not setting `is`) that was previously done in
// `beforeRegister` should be possible in `registered`.
return klass;};})();(function(){var DomBind=function(_Polymer$BatchedEffec2){_inherits(DomBind,_Polymer$BatchedEffec2);function DomBind(){_classCallCheck(this,DomBind);return _possibleConstructorReturn(this,(DomBind.__proto__||Object.getPrototypeOf(DomBind)).apply(this,arguments));}_createClass(DomBind,[{key:'connectedCallback',value:function connectedCallback(){this.render();}},{key:'disconnectedCallback',value:function disconnectedCallback(){this._removeChildren();}},{key:'_insertChildren',value:function _insertChildren(){this.parentNode.insertBefore(this.root,this);}},{key:'_removeChildren',value:function _removeChildren(){if(this._children){for(var i=0;i<this._children.length;i++){this.root.appendChild(this._children[i]);}}}/**
       * Forces the element to render its content. This is typically only
       * necessary to call if HTMLImports with the async attribute are used.
       */},{key:'render',value:function render(){if(!this._children){var template=this.querySelector('template');if(!template){throw new Error('dom-bind requires a <template> child');}this._bindTemplate(template);this.root=this._stampTemplate(template);this._children=[];for(var n=this.root.firstChild;n;n=n.nextSibling){this._children[this._children.length]=n;}this._flushProperties(this);}this._insertChildren();this.dispatchEvent(new CustomEvent('dom-change'));}}]);return DomBind;}(Polymer.BatchedEffects(HTMLElement));customElements.define('dom-bind',DomBind);})();(function(){'use strict';var nullClass=function nullClass(){_classCallCheck(this,nullClass);};function PatchedHTMLTemplateElement(){return PatchedHTMLTemplateElement._newInstance;}PatchedHTMLTemplateElement.prototype=Object.create(HTMLTemplateElement.prototype,{constructor:{value:PatchedHTMLTemplateElement}});PatchedHTMLTemplateElement._newInstance=null;var DataTemplate=function(_Polymer$BatchedEffec3){_inherits(DataTemplate,_Polymer$BatchedEffec3);function DataTemplate(){_classCallCheck(this,DataTemplate);return _possibleConstructorReturn(this,(DataTemplate.__proto__||Object.getPrototypeOf(DataTemplate)).apply(this,arguments));}_createClass(DataTemplate,null,[{key:'upgradeTemplate',value:function upgradeTemplate(template){PatchedHTMLTemplateElement._newInstance=template;Object.setPrototypeOf(template,DataTemplate.prototype);new DataTemplate();PatchedHTMLTemplateElement._newInstance=null;}}]);return DataTemplate;}(Polymer.BatchedEffects(PatchedHTMLTemplateElement));var Templatizer=function(){function Templatizer(){_classCallCheck(this,Templatizer);}_createClass(Templatizer,[{key:'templatize',value:function templatize(template,options){var klass=template.__templatizerClass;// Return memoized class if already templatized (allows calling
// templatize on same template more than once)
if(klass){return klass;}// Ensure template has _content
template._content=template._content||template.content;// Get memoized base class for the prototypical template
var baseClass=template._content.__templatizerClass;if(!baseClass){baseClass=template._content.__templatizerClass=this._createTemplatizerClass(template,options);}// Host property forwarding must be installed onto template instance
this._prepHostProperties(template,options);// Subclass base class to add template reference for this specific
// template
klass=function(_baseClass){_inherits(TemplateInstance,_baseClass);function TemplateInstance(){_classCallCheck(this,TemplateInstance);return _possibleConstructorReturn(this,(TemplateInstance.__proto__||Object.getPrototypeOf(TemplateInstance)).apply(this,arguments));}return TemplateInstance;}(baseClass);klass.prototype.template=template;klass.instCount=0;template.__templatizerClass=klass;return klass;}},{key:'_createTemplatizerClass',value:function _createTemplatizerClass(template,options){// Anonymous class created by the templatizer
var klass=function(_Polymer$BatchedEffec4){_inherits(klass,_Polymer$BatchedEffec4);_createClass(klass,[{key:'localName',//TODO(kschaaf): for debugging; remove?
get:function get(){return'template#'+this.template.id+'/TemplateInstance';}}]);function klass(host,props){_classCallCheck(this,klass);//TODO(kschaaf): for debugging; remove?
var _this20=_possibleConstructorReturn(this,(klass.__proto__||Object.getPrototypeOf(klass)).call(this));_this20.id=_this20.constructor.instCount;_this20.constructor.instCount++;_this20.__dataHost=_this20.template;if(host){_this20._rootDataHost=host.__dataHost?host.__dataHost._rootDataHost||host.__dataHost:host;}_this20._hostProps=template._content._hostProps;_this20._configureProperties(props);//TODO(kschaaf): id marshalling unnecessary
_this20.root=_this20._stampTemplate(template);// Save list of stamped children
var children=_this20.children=[];for(var n=_this20.root.firstChild;n;n=n.nextSibling){children.push(n);n._templateInstance=_this20;}if(host.__hideTemplateChildren__){_this20._showHideChildren(true);}_this20._flushProperties(true);return _this20;}_createClass(klass,[{key:'_showHideChildren',value:function _showHideChildren(hide){var c=this.children;for(var i=0;i<c.length;i++){var n=c[i];// Ignore non-changes
if(Boolean(hide)!=Boolean(n.__hideTemplateChildren__)){if(n.nodeType===Node.TEXT_NODE){if(hide){n.__polymerTextContent__=n.textContent;n.textContent='';}else{n.textContent=n.__polymerTextContent__;}}else if(n.style){if(hide){n.__polymerDisplay__=n.style.display;n.style.display='none';}else{n.style.display=n.__polymerDisplay__;}}}n.__hideTemplateChildren__=hide;if(n._showHideChildren){n._showHideChildren(hide);}}}},{key:'_configureProperties',value:function _configureProperties(props){if(props){for(var iprop in options.instanceProps){if(iprop in props){this[iprop]=props[iprop];}}}for(var hprop in this._hostProps){this[hprop]=this.template['_host_'+hprop];}}},{key:'forwardProperty',value:function forwardProperty(prop,value,host){this._setPendingProperty(prop,value);if(host){host._enqueueClient(this);}}},{key:'flushProperties',value:function flushProperties(){this._flushProperties(true);}},{key:'dispatchEvent',value:function dispatchEvent(){}}]);return klass;}(Polymer.BatchedEffects(nullClass));// TODO(kschaaf): event listeners created need to be decorated with e.model
klass.prototype._bindTemplate(template);this._prepInstanceProperties(klass,template,options);return klass;}},{key:'_prepHostProperties',value:function _prepHostProperties(template,options){if(options.fwdHostPropToInstance){// Provide data API
// TODO(kschaaf): memoize template proto
DataTemplate.upgradeTemplate(template);// Add template - >instances effects
// and host <- template effects
var hostProps=template._content._hostProps;for(var prop in hostProps){template._addPropertyEffect('_host_'+prop,template.PROPERTY_EFFECT_TYPES.PROPAGATE,{fn:this._createHP2IEffector(prop,options)});template._createNotifyingProperty('_host_'+prop);}// Mix any pre-bound data into __data; no need to flush this to
// instances since they pull from the template at instance-time
if(template.__dataProto){Polymer.Utils.mixin(template.__data,template.__dataProto);}}}},{key:'_createHP2IEffector',value:function _createHP2IEffector(hostProp,options){return function(inst,prop,value){options.fwdHostPropToInstance.call(inst,inst,prop.substring('_host_'.length),value);};}},{key:'_prepInstanceProperties',value:function _prepInstanceProperties(klass,template,options){var hostProps=template._content._hostProps||{};for(var iprop in options.instanceProps){delete hostProps[iprop];if(options.fwdInstancePropToHost){klass.prototype._addPropertyEffect(iprop,klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:this._createIP2HEffector(iprop,options)});}}if(options.fwdHostPropToInstance&&template.__dataHost){for(var hprop in hostProps){klass.prototype._addPropertyEffect(hprop,klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,{fn:this._createHP2HEffector(template)});}}}},{key:'_createIP2HEffector',value:function _createIP2HEffector(instProp,options){return function fwdInstPropToHost(inst,prop,value,old,info,fromAbove){if(!fromAbove){options.fwdInstancePropToHost.call(inst,inst,prop,value);}};}},{key:'_createHP2HEffector',value:function _createHP2HEffector(template){return function fwdHostPropToHost(inst,prop,value,old,info,fromAbove){if(!fromAbove){// TODO(kschaaf) This does not take advantage of the efficient
// upward flow in batched effects
template._setProperty('_host_'+prop,value);}};}/**
       * Returns the template "model" associated with a given element, which
       * serves as the binding scope for the template instance the element is
       * contained in. A template model is an instance of `Polymer.Base`, and
       * should be used to manipulate data associated with this template instance.
       *
       * Example:
       *
       *   var model = modelForElement(el);
       *   if (model.index < 10) {
       *     model.set('item.checked', true);
       *   }
       *
       * @method modelForElement
       * @param {HTMLElement} el Element for which to return a template model.
       * @return {Object<Polymer.Base>} Model representing the binding scope for
       *   the element.
       */},{key:'modelForElement',value:function modelForElement(host,el){var model;while(el){// An element with a _templateInstance marks the top boundary
// of a scope; walk up until we find one, and then ensure that
// its __dataHost matches `this`, meaning this dom-repeat stamped it
if(model=el._templateInstance){// Found an element stamped by another template; keep walking up
// from its __dataHost
if(model.__dataHost!=host){el=model.__dataHost;}else{return model;}}else{// Still in a template scope, keep going up until
// a _templateInstance is found
el=el.parentNode;}}}}],[{key:'enqueueDebouncer',value:function enqueueDebouncer(debouncer){this._debouncerQueue=this._debouncerQueue||[];this._debouncerQueue.push(debouncer);}},{key:'flushDebouncers',value:function flushDebouncers(){if(this._debouncerQueue){while(this._debouncerQueue.length){this._debouncerQueue.shift().flush();}}}}]);return Templatizer;}();Polymer.Templatizer=Templatizer;})();(function(){'use strict';var templatizer=new Polymer.Templatizer();Polymer({is:'dom-repeat',_template:null,/**
     * Fired whenever DOM is added or removed by this template (by
     * default, rendering occurs lazily).  To force immediate rendering, call
     * `render`.
     *
     * @event dom-change
     */properties:{/**
       * An array containing items determining how many instances of the template
       * to stamp and that that each template instance should bind to.
       */items:{type:Array},/**
       * The name of the variable to add to the binding scope for the array
       * element associated with a given template instance.
       */as:{type:String,value:'item'},/**
       * The name of the variable to add to the binding scope with the index
       * for the inst.  If `sort` is provided, the index will reflect the
       * sorted order (rather than the original array order).
       */indexAs:{type:String,value:'index'},/**
       * The name of the variable to add to the binding scope with the index
       * for the inst.  If `sort` is provided, the index will reflect the
       * sorted order (rather than the original array order).
       */itemsIndexAs:{type:String,value:'itemsIndex'},/**
       * A function that should determine the sort order of the items.  This
       * property should either be provided as a string, indicating a method
       * name on the element's host, or else be an actual function.  The
       * function should match the sort function passed to `Array.sort`.
       * Using a sort function has no effect on the underlying `items` array.
       */sort:{type:Function,observer:'_sortChanged'},/**
       * A function that can be used to filter items out of the view.  This
       * property should either be provided as a string, indicating a method
       * name on the element's host, or else be an actual function.  The
       * function should match the sort function passed to `Array.filter`.
       * Using a filter function has no effect on the underlying `items` array.
       */filter:{type:Function,observer:'_filterChanged'},/**
       * When using a `filter` or `sort` function, the `observe` property
       * should be set to a space-separated list of the names of item
       * sub-fields that should trigger a re-sort or re-filter when changed.
       * These should generally be fields of `item` that the sort or filter
       * function depends on.
       */observe:{type:String,observer:'_observeChanged'},/**
       * When using a `filter` or `sort` function, the `delay` property
       * determines a debounce time after a change to observed item
       * properties that must pass before the filter or sort is re-run.
       * This is useful in rate-limiting shuffing of the view when
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
       */initialCount:{type:Number,observer:'_initializeChunking'},/**
       * When `initialCount` is used, this property defines a frame rate to
       * target by throttling the number of instances rendered each frame to
       * not exceed the budget for the target frame rate.  Setting this to a
       * higher number will allow lower latency and higher throughput for
       * things like event handlers, but will result in a longer time for the
       * remaining items to complete rendering.
       */targetFramerate:{type:Number,value:20},_targetFrameTime:{type:Number,computed:'_computeFrameTime(targetFramerate)'}},observers:['_itemsChanged(items.*)'],created:function created(){this._instances=[];this._pool=[];this._limit=Infinity;var self=this;this._boundRenderChunk=function(){self._renderChunk();};},detached:function detached(){this.__isDetached=true;for(var i=0;i<this._instances.length;i++){this._detachInstance(i);}},attached:function attached(){// only perform attachment if the element was previously detached.
if(this.__isDetached){this.__isDetached=false;var parent=this.parentNode;for(var i=0;i<this._instances.length;i++){this._attachInstance(i,parent);}}},ensureTemplatized:function ensureTemplatized(){// Templatizing (generating the instance constructor) needs to wait
// until ready, since won't have its template content handed back to
// it until then
if(!this._ctor){var template=this.template=this.querySelector('template');template.__domRepeat=this;if(!template){throw new Error('dom-repeat requires a <template> child');}// Template instance props that should be excluded from forwarding
var instanceProps={};instanceProps[this.as]=true;instanceProps[this.indexAs]=true;instanceProps[this.itemsIndexAs]=true;this._ctor=templatizer.templatize(template,{instanceProps:instanceProps,fwdHostPropToInstance:function fwdHostPropToInstance(host,prop,value){var repeater=this.__domRepeat;var i$=repeater._instances;for(var i=0,inst;i<i$.length&&(inst=i$[i]);i++){inst.forwardProperty(prop,value,host);}},fwdInstancePropToHost:function fwdInstancePropToHost(inst,prop,value){var repeater=inst.template.__domRepeat;if(Polymer.Path.matches(repeater.as,prop)){var idx=inst[repeater.itemsIndexAs];if(prop==repeater.as){repeater.items[idx]=value;}var path=Polymer.Path.translate(repeater.as,'items.'+idx,prop);repeater.notifyPath(path,value);}}});}},_getRootDataHost:function _getRootDataHost(){return this.__dataHost._rootDataHost||this.__dataHost;},_sortChanged:function _sortChanged(sort){var dataHost=this._getRootDataHost();this._sortFn=sort&&(typeof sort=='function'?sort:function(){return dataHost[sort].apply(dataHost,arguments);});this._needFullRefresh=true;if(this.items){this._debounceRender();}},_filterChanged:function _filterChanged(filter){var dataHost=this._getRootDataHost();this._filterFn=filter&&(typeof filter=='function'?filter:function(){return dataHost[filter].apply(dataHost,arguments);});this._needFullRefresh=true;if(this.items){this._debounceRender();}},_computeFrameTime:function _computeFrameTime(rate){return Math.ceil(1000/rate);},_initializeChunking:function _initializeChunking(){if(this.initialCount){this._limit=this.initialCount;this._chunkCount=this.initialCount;this._lastChunkTime=performance.now();}},_tryRenderChunk:function _tryRenderChunk(){// Debounced so that multiple calls through `_render` between animation
// frames only queue one new rAF (e.g. array mutation & chunked render)
if(this.items&&this._limit<this.items.length){this.debounce('renderChunk',this._requestRenderChunk);}},_requestRenderChunk:function _requestRenderChunk(){requestAnimationFrame(this._boundRenderChunk);},_renderChunk:function _renderChunk(){// Simple auto chunkSize throttling algorithm based on feedback loop:
// measure actual time between frames and scale chunk count by ratio
// of target/actual frame time
var currChunkTime=performance.now();var ratio=this._targetFrameTime/(currChunkTime-this._lastChunkTime);this._chunkCount=Math.round(this._chunkCount*ratio)||1;this._limit+=this._chunkCount;this._lastChunkTime=currChunkTime;this._debounceRender();},_observeChanged:function _observeChanged(){this._observePaths=this.observe&&this.observe.replace('.*','.').split(' ');},_itemsChanged:function _itemsChanged(change){if(this.items&&!Array.isArray(this.items)){console.warn('dom-repeat expected array for `items`, found',this.items);}// If path was to an item (e.g. 'items.3' or 'items.3.foo'), forward the
// path to that instance synchronously (retuns false for non-item paths)
if(!this._forwardItemPath(change.path,change.value)){// Otherwise, the array was reset ('items') or spliced ('items.splices'),
// so queue a full refresh
this._needFullRefresh=true;this._initializeChunking();this._debounceRender();}},_checkObservedPaths:function _checkObservedPaths(path){if(this._observePaths){path=path.substring(path.indexOf('.')+1);var paths=this._observePaths;for(var i=0;i<paths.length;i++){if(path.indexOf(paths[i])===0){this._needFullRefresh=true;if(this.delay){this.debounce('render',this._render,this.delay);}else{this._debounceRender();}return true;}}}},_debounceRender:function _debounceRender(){Polymer.Templatizer.enqueueDebouncer(this.debounce('_render',this._render));},/**
     * Forces the element to render its content. Normally rendering is
     * asynchronous to a provoking change. This is done for efficiency so
     * that multiple changes trigger only a single render. The render method
     * should be called if, for example, template rendering is required to
     * validate application state.
     */render:function render(){// Queue this repeater, then flush all in order
this._needFullRefresh=true;this._debounceRender();Polymer.Templatizer.flushDebouncers();},_render:function _render(){this.ensureTemplatized();this._applyFullRefresh();// Reset the pool
// TODO(kschaaf): Reuse pool across turns and nested templates
// Requires updating hostProps and dealing with the fact that path
// notifications won't reach instances sitting in the pool, which
// could result in out-of-sync instances since simply re-setting
// `item` may not be sufficient if the pooled instance happens to be
// the same item.
this._pool.length=0;// Set rendered item count
this._setRenderedItemCount(this._instances.length);// Notify users
this.fire('dom-change');// Check to see if we need to render more items
this._tryRenderChunk();},_applyFullRefresh:function _applyFullRefresh(){var _this21=this;var items=this.items||[];var isntIdxToItemsIdx=new Array(items.length);for(var i=0;i<items.length;i++){isntIdxToItemsIdx[i]=i;}// Apply user filter
if(this._filterFn){isntIdxToItemsIdx=isntIdxToItemsIdx.filter(function(i,idx,array){return _this21._filterFn(items[i],idx,array);});}// Apply user sort
if(this._sortFn){isntIdxToItemsIdx.sort(function(a,b){return _this21._sortFn(items[a],items[b]);});}// items->inst map kept for item path forwarding
var itemsIdxToInstIdx=this._itemsIdxToInstIdx={};var instIdx=0;// Generate instances and assign items
var limit=Math.min(isntIdxToItemsIdx.length,this._limit);for(;instIdx<limit;instIdx++){var inst=this._instances[instIdx];var itemIdx=isntIdxToItemsIdx[instIdx];var item=items[itemIdx];itemsIdxToInstIdx[itemIdx]=instIdx;if(inst&&instIdx<this._limit){inst.forwardProperty(this.as,item);inst.forwardProperty(this.indexAs,instIdx);inst.forwardProperty(this.itemsIndexAs,itemIdx);inst.flushProperties();}else{this._insertInstance(item,instIdx,itemIdx);}}// Remove any extra instances from previous state
for(var _i4=this._instances.length-1;_i4>=instIdx;_i4--){this._detachAndRemoveInstance(_i4);}},_detachInstance:function _detachInstance(idx){var inst=this._instances[idx];//TODO(sorvell): why is this necessary?
if(inst.children){for(var i=0;i<inst.children.length;i++){var el=inst.children[i];inst.root.appendChild(el);}}return inst;},_attachInstance:function _attachInstance(idx,parent){var inst=this._instances[idx];parent.insertBefore(inst.root,this);},_detachAndRemoveInstance:function _detachAndRemoveInstance(idx){var inst=this._detachInstance(idx);if(inst){this._pool.push(inst);}this._instances.splice(idx,1);},_stampInstance:function _stampInstance(item,instIdx,itemIdx){var model={};model[this.as]=item;model[this.indexAs]=instIdx;model[this.itemsIndexAs]=itemIdx;return new this._ctor(this,model);},_insertInstance:function _insertInstance(item,instIdx,itemIdx){var inst=this._pool.pop();if(inst){// TODO(kschaaf): If the pool is shared across turns, hostProps
// need to be re-set to reused instances in addition to item
inst.forwardProperty(this.as,item);inst.forwardProperty(this.indexAs,instIdx);inst.forwardProperty(this.itemsIndexAs,itemIdx);}else{inst=this._stampInstance(item,instIdx,itemIdx);}var beforeRow=this._instances[instIdx+1];var beforeNode=beforeRow?beforeRow.children[0]:this;// TODO(sorvell): remove when fragment patching is auto-magic.
if(window.ShadyDOM){ShadyDOM.patch(inst.root);}this.parentNode.insertBefore(inst.root,beforeNode);this._instances[instIdx]=inst;return inst;},// Implements extension point from Templatizer mixin
_showHideChildren:function _showHideChildren(hidden){for(var i=0;i<this._instances.length;i++){this._instances[i]._showHideChildren(hidden);}},// Called as a side effect of a host items.<key>.<path> path change,
// responsible for notifying item.<path> changes to inst for key
_forwardItemPath:function _forwardItemPath(path,value){if(this._itemsIdxToInstIdx){path=path.slice(6);// 'items.'.length == 6
var dot=path.indexOf('.');var itemsIdx=dot<0?path:path.substring(0,dot);var instIdx=this._itemsIdxToInstIdx[itemsIdx];var inst=this._instances[instIdx];if(inst){path=dot<0?'':path.substring(dot+1);if(!this._checkObservedPaths(path)){inst.forwardProperty(this.as+(path?'.'+path:''),value);inst.flushProperties();return true;}}}},/**
     * Returns the item associated with a given element stamped by
     * this `dom-repeat`.
     *
     * Note, to modify sub-properties of the item,
     * `modelForElement(el).set('item.<sub-prop>', value)`
     * should be used.
     *
     * @method itemForElement
     * @param {HTMLElement} el Element for which to return the item.
     * @return {any} Item associated with the element.
     */itemForElement:function itemForElement(el){var instance=this.modelForElement(el);return instance&&instance[this.as];},/**
     * Returns the inst index for a given element stamped by this `dom-repeat`.
     * If `sort` is provided, the index will reflect the sorted order (rather
     * than the original array order).
     *
     * @method indexForElement
     * @param {HTMLElement} el Element for which to return the index.
     * @return {any} Row index associated with the element (note this may
     *   not correspond to the array index if a user `sort` is applied).
     */indexForElement:function indexForElement(el){var instance=this.modelForElement(el);return instance&&instance[this.indexAs];},/**
     * Returns the template "model" associated with a given element, which
     * serves as the binding scope for the template instance the element is
     * contained in. A template model is an instance of `Polymer.Base`, and
     * should be used to manipulate data associated with this template instance.
     *
     * Example:
     *
     *   var model = modelForElement(el);
     *   if (model.index < 10) {
     *     model.set('item.checked', true);
     *   }
     *
     * @method modelForElement
     * @param {HTMLElement} el Element for which to return a template model.
     * @return {Object<Polymer.Base>} Model representing the binding scope for
     *   the element.
     */modelForElement:function modelForElement(el){return templatizer.modelForElement(this.template,el);}});})();(function(){var templatizer=new Polymer.Templatizer();/**
   * Stamps the template iff the `if` property is truthy.
   *
   * When `if` becomes falsey, the stamped content is hidden but not
   * removed from dom. When `if` subsequently becomes truthy again, the content
   * is simply re-shown. This approach is used due to its favorable performance
   * characteristics: the expense of creating template content is paid only
   * once and lazily.
   *
   * Set the `restamp` property to true to force the stamped content to be
   * created / destroyed when the `if` condition changes.
   */Polymer({is:'dom-if',_template:null,/**
     * Fired whenever DOM is added or removed/hidden by this template (by
     * default, rendering occurs lazily).  To force immediate rendering, call
     * `render`.
     *
     * @event dom-change
     */properties:{/**
       * A boolean indicating whether this template should stamp.
       */'if':{type:Boolean,observer:'_queueRender'},/**
       * When true, elements will be removed from DOM and discarded when `if`
       * becomes false and re-created and added back to the DOM when `if`
       * becomes true.  By default, stamped elements will be hidden but left
       * in the DOM when `if` becomes false, which is generally results
       * in better performance.
       */restamp:{type:Boolean,observer:'_queueRender'}},_queueRender:function _queueRender(){Polymer.Templatizer.enqueueDebouncer(this.debounce('_render',this._render));},detached:function detached(){if(!this.parentNode||this.parentNode.nodeType==Node.DOCUMENT_FRAGMENT_NODE&&!this.parentNode.host){this._teardownInstance();}},attached:function attached(){if(this.if){// NOTE: ideally should not be async, but node can be attached
// when shady dom is in the act of distributing/composing so push it out
this.async(this._ensureInstance);}},/**
     * Forces the element to render its content. Normally rendering is
     * asynchronous to a provoking change. This is done for efficiency so
     * that multiple changes trigger only a single render. The render method
     * should be called if, for example, template rendering is required to
     * validate application state.
     */render:function render(){Polymer.Templatizer.flushDebouncers();},_render:function _render(){if(this.if){this._ensureInstance();this._showHideChildren();}else if(this.restamp){this._teardownInstance();}if(!this.restamp&&this._instance){this._showHideChildren();}if(this.if!=this._lastIf){this.fire('dom-change');this._lastIf=this.if;}},_ensureInstance:function _ensureInstance(){var parentNode=this.parentNode;// Guard against element being detached while render was queued
if(parentNode){if(!this._ctor){var template=this.querySelector('template');if(!template){throw new Error('dom-if requires a <template> child');}var self=this;this._ctor=templatizer.templatize(template,{fwdHostPropToInstance:function fwdHostPropToInstance(host,prop,value){if(self._instance){self._instance.forwardProperty(prop,value,host);}}});}if(!this._instance){this._instance=new this._ctor(this);var root=this._instance.root;parentNode.insertBefore(root,this);}else{var c$=this._instance.children;if(c$&&c$.length){// Detect case where dom-if was re-attached in new position
var lastChild=this.previousSibling;if(lastChild!==c$[c$.length-1]){for(var i=0,n;i<c$.length&&(n=c$[i]);i++){parentNode.insertBefore(n,this);}}}}}},_teardownInstance:function _teardownInstance(){if(this._instance){var c$=this._instance.children;if(c$&&c$.length){// use first child parent, for case when dom-if may have been detached
var parent=c$[0].parentNode;for(var i=0,n;i<c$.length&&(n=c$[i]);i++){parent.removeChild(n);}}this._instance=null;}},_showHideChildren:function _showHideChildren(){var hidden=this.__hideTemplateChildren__||!this.if;if(this._instance){this._instance._showHideChildren(hidden);}}});})();(function(){'use strict';// NOTE: CustomStyle must be loaded prior to loading Polymer.
// To support asynchronous loading of custom-style, an async import
// can be made that loads custom-style and then polymer.
if(window.CustomStyle){var attr='include';window.CustomStyle.processHook=function(style){var include=style.getAttribute(attr);if(!include){return;}style.removeAttribute(attr);style.textContent=Polymer.StyleGather.cssFromModules(include)+style.textContent;};}})();(function(){var _bindingRegex_patch={// Issue with https://github.com/Polymer/polymer/issues/3349 
_bindingRegex_1_2_4:function(){var IDENT='(?:'+'[a-zA-Z_$][\\w.:$-*]*'+')';var NUMBER='(?:'+'[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?'+')';var SQUOTE_STRING='(?:'+'\'(?:[^\'\\\\]|\\\\.)*\''+')';var DQUOTE_STRING='(?:'+'"(?:[^"\\\\]|\\\\.)*"'+')';var STRING='(?:'+SQUOTE_STRING+'|'+DQUOTE_STRING+')';var ARGUMENT='(?:'+IDENT+'|'+NUMBER+'|'+STRING+'\\s*'+')';var ARGUMENTS='(?:'+ARGUMENT+'(?:,\\s*'+ARGUMENT+')*'+')';var ARGUMENT_LIST='(?:'+'\\(\\s*'+'(?:'+ARGUMENTS+'?'+')'+'\\)\\s*'+')';var BINDING='('+IDENT+'\\s*'+ARGUMENT_LIST+'?'+')';// Group 3
var OPEN_BRACKET='(\\[\\[|{{)'+'\\s*';var CLOSE_BRACKET='(?:]]|}})';var NEGATE='(?:(!)\\s*)?';// Group 2
var EXPRESSION=OPEN_BRACKET+NEGATE+BINDING+CLOSE_BRACKET;return new RegExp(EXPRESSION,"g");}(),// Fix from https://github.com/TimvdLippe/polymer/blob/fix-binding-with-dash/src/lib/annotations/annotations.html
_bindingRegex_1_2_4_patched:function(){var IDENT='(?:'+'[a-zA-Z_\\$][\\w\\.:\\$\\-\\*]*'+')';var NUMBER='(?:'+'[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?'+')';var SQUOTE_STRING='(?:'+'\'(?:[^\'\\\\]|\\\\.)*\''+')';var DQUOTE_STRING='(?:'+'"(?:[^"\\\\]|\\\\.)*"'+')';var STRING='(?:'+SQUOTE_STRING+'|'+DQUOTE_STRING+')';var ARGUMENT='(?:'+IDENT+'|'+NUMBER+'|'+STRING+'\\s*'+')';var ARGUMENTS='(?:'+ARGUMENT+'(?:,\\s*'+ARGUMENT+')*'+')';var ARGUMENT_LIST='(?:'+'\\(\\s*'+'(?:'+ARGUMENTS+'?'+')'+'\\)\\s*'+')';var BINDING='('+IDENT+'\\s*'+ARGUMENT_LIST+'?'+')';// Group 3
var OPEN_BRACKET='(\\[\\[|{{)'+'\\s*';var CLOSE_BRACKET='(?:]]|}})';var NEGATE='(?:(!)\\s*)?';// Group 2
var EXPRESSION=OPEN_BRACKET+NEGATE+BINDING+CLOSE_BRACKET;return new RegExp(EXPRESSION,"g");}()};if(!Polymer.Element&&Polymer.Annotations._bindingRegex.toString()===_bindingRegex_patch._bindingRegex_1_2_4.toString()){console.log('Fixing Polymer issue#3349 by patching Polymer.Annotations._bindingRegex for Polymer 1.2.4');Polymer.Annotations._bindingRegex=_bindingRegex_patch._bindingRegex_1_2_4_patched;}})();if(!window.Promise){window.Promise=MakePromise(Polymer.Base.async);};'use strict';Polymer({is:'iron-request',hostAttributes:{hidden:true},properties:{/**
       * A reference to the XMLHttpRequest instance used to generate the
       * network request.
       *
       * @type {XMLHttpRequest}
       */xhr:{type:Object,notify:true,readOnly:true,value:function value(){return new XMLHttpRequest();}},/**
       * A reference to the parsed response body, if the `xhr` has completely
       * resolved.
       *
       * @type {*}
       * @default null
       */response:{type:Object,notify:true,readOnly:true,value:function value(){return null;}},/**
       * A reference to the status code, if the `xhr` has completely resolved.
       */status:{type:Number,notify:true,readOnly:true,value:0},/**
       * A reference to the status text, if the `xhr` has completely resolved.
       */statusText:{type:String,notify:true,readOnly:true,value:''},/**
       * A promise that resolves when the `xhr` response comes back, or rejects
       * if there is an error before the `xhr` completes.
       *
       * @type {Promise}
       */completes:{type:Object,readOnly:true,notify:true,value:function value(){return new Promise(function(resolve,reject){this.resolveCompletes=resolve;this.rejectCompletes=reject;}.bind(this));}},/**
       * An object that contains progress information emitted by the XHR if
       * available.
       *
       * @default {}
       */progress:{type:Object,notify:true,readOnly:true,value:function value(){return{};}},/**
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
     * Sends an HTTP request to the server and returns the XHR object.
     *
     * The handling of the `body` parameter will vary based on the Content-Type
     * header. See the docs for iron-ajax's `body` param for details.
     *
     * @param {{
     *   url: string,
     *   method: (string|undefined),
     *   async: (boolean|undefined),
     *   body: (ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object),
     *   headers: (Object|undefined),
     *   handleAs: (string|undefined),
     *   jsonPrefix: (string|undefined),
     *   withCredentials: (boolean|undefined)}} options -
     *     url The url to which the request is sent.
     *     method The HTTP method to use, default is GET.
     *     async By default, all requests are sent asynchronously. To send synchronous requests,
     *         set to false.
     *     body The content for the request body for POST method.
     *     headers HTTP request headers.
     *     handleAs The response type. Default is 'text'.
     *     withCredentials Whether or not to send credentials on the request. Default is false.
     *   timeout: (Number|undefined)
     * @return {Promise}
     */send:function send(options){var xhr=this.xhr;if(xhr.readyState>0){return null;}xhr.addEventListener('progress',function(progress){this._setProgress({lengthComputable:progress.lengthComputable,loaded:progress.loaded,total:progress.total});}.bind(this));xhr.addEventListener('error',function(error){this._setErrored(true);this._updateStatus();this.rejectCompletes(error);}.bind(this));xhr.addEventListener('timeout',function(error){this._setTimedOut(true);this._updateStatus();this.rejectCompletes(error);}.bind(this));xhr.addEventListener('abort',function(){this._updateStatus();this.rejectCompletes(new Error('Request aborted.'));}.bind(this));// Called after all of the above.
xhr.addEventListener('loadend',function(){this._updateStatus();this._setResponse(this.parseResponse());if(!this.succeeded){this.rejectCompletes(new Error('The request failed with status code: '+this.xhr.status));return;}this.resolveCompletes(this);}.bind(this));this.url=options.url;xhr.open(options.method||'GET',options.url,options.async!==false);var acceptType={'json':'application/json','text':'text/plain','html':'text/html','xml':'application/xml','arraybuffer':'application/octet-stream'}[options.handleAs];var headers=options.headers||Object.create(null);var newHeaders=Object.create(null);for(var key in headers){newHeaders[key.toLowerCase()]=headers[key];}headers=newHeaders;if(acceptType&&!headers['accept']){headers['accept']=acceptType;}Object.keys(headers).forEach(function(requestHeader){if(/[A-Z]/.test(requestHeader)){Polymer.Base._error('Headers must be lower case, got',requestHeader);}xhr.setRequestHeader(requestHeader,headers[requestHeader]);},this);if(options.async!==false){if(options.async){xhr.timeout=options.timeout;}var handleAs=options.handleAs;// If a JSON prefix is present, the responseType must be 'text' or the
// browser won’t be able to parse the response.
if(!!options.jsonPrefix||!handleAs){handleAs='text';}// In IE, `xhr.responseType` is an empty string when the response
// returns. Hence, caching it as `xhr._responseType`.
xhr.responseType=xhr._responseType=handleAs;// Cache the JSON prefix, if it exists.
if(!!options.jsonPrefix){xhr._jsonPrefix=options.jsonPrefix;}}xhr.withCredentials=!!options.withCredentials;var body=this._encodeBodyObject(options.body,headers['content-type']);xhr.send(/** @type {ArrayBuffer|ArrayBufferView|Blob|Document|FormData|
                   null|string|undefined} */body);return this.completes;},/**
     * Attempts to parse the response body of the XHR. If parsing succeeds,
     * the value returned will be deserialized based on the `responseType`
     * set on the XHR.
     *
     * @return {*} The parsed response,
     * or undefined if there was an empty response or parsing failed.
     */parseResponse:function parseResponse(){var xhr=this.xhr;var responseType=xhr.responseType||xhr._responseType;var preferResponseText=!this.xhr.responseType;var prefixLen=xhr._jsonPrefix&&xhr._jsonPrefix.length||0;try{switch(responseType){case'json':// If the xhr object doesn't have a natural `xhr.responseType`,
// we can assume that the browser hasn't parsed the response for us,
// and so parsing is our responsibility. Likewise if response is
// undefined, as there's no way to encode undefined in JSON.
if(preferResponseText||xhr.response===undefined){// Try to emulate the JSON section of the response body section of
// the spec: https://xhr.spec.whatwg.org/#response-body
// That is to say, we try to parse as JSON, but if anything goes
// wrong return null.
try{return JSON.parse(xhr.responseText);}catch(_){return null;}}return xhr.response;case'xml':return xhr.responseXML;case'blob':case'document':case'arraybuffer':return xhr.response;case'text':default:{// If `prefixLen` is set, it implies the response should be parsed
// as JSON once the prefix of length `prefixLen` is stripped from
// it. Emulate the behavior above where null is returned on failure
// to parse.
if(prefixLen){try{return JSON.parse(xhr.responseText.substring(prefixLen));}catch(_){return null;}}return xhr.responseText;}}}catch(e){this.rejectCompletes(new Error('Could not parse response. '+e.message));}},/**
     * Aborts the request.
     */abort:function abort(){this._setAborted(true);this.xhr.abort();},/**
     * @param {*} body The given body of the request to try and encode.
     * @param {?string} contentType The given content type, to infer an encoding
     *     from.
     * @return {*} Either the encoded body as a string, if successful,
     *     or the unaltered body object if no encoding could be inferred.
     */_encodeBodyObject:function _encodeBodyObject(body,contentType){if(typeof body=='string'){return body;// Already encoded.
}var bodyObj=/** @type {Object} */body;switch(contentType){case'application/json':return JSON.stringify(bodyObj);case'application/x-www-form-urlencoded':return this._wwwFormUrlEncode(bodyObj);}return body;},/**
     * @param {Object} object The object to encode as x-www-form-urlencoded.
     * @return {string} .
     */_wwwFormUrlEncode:function _wwwFormUrlEncode(object){if(!object){return'';}var pieces=[];Object.keys(object).forEach(function(key){// TODO(rictic): handle array values here, in a consistent way with
//   iron-ajax params.
pieces.push(this._wwwFormUrlEncodePiece(key)+'='+this._wwwFormUrlEncodePiece(object[key]));},this);return pieces.join('&');},/**
     * @param {*} str A key or value to encode as x-www-form-urlencoded.
     * @return {string} .
     */_wwwFormUrlEncodePiece:function _wwwFormUrlEncodePiece(str){// Spec says to normalize newlines to \r\n and replace %20 spaces with +.
// jQuery does this as well, so this is likely to be widely compatible.
if(str===null){return'';}return encodeURIComponent(str.toString().replace(/\r?\n/g,'\r\n')).replace(/%20/g,'+');},/**
     * Updates the status code and status text.
     */_updateStatus:function _updateStatus(){this._setStatus(this.xhr.status);this._setStatusText(this.xhr.statusText===undefined?'':this.xhr.statusText);}});'use strict';Polymer({is:'iron-ajax',/**
     * Fired when a request is sent.
     *
     * @event request
     * @event iron-ajax-request
     *//**
     * Fired when a response is received.
     *
     * @event response
     * @event iron-ajax-response
     *//**
     * Fired when an error is received.
     *
     * @event error
     * @event iron-ajax-error
     */hostAttributes:{hidden:true},properties:{/**
       * The URL target of the request.
       */url:{type:String},/**
       * An object that contains query parameters to be appended to the
       * specified `url` when generating a request. If you wish to set the body
       * content when making a POST request, you should use the `body` property
       * instead.
       */params:{type:Object,value:function value(){return{};}},/**
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
       */headers:{type:Object,value:function value(){return{};}},/**
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
       * @type (ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object)
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
       */lastRequest:{type:Object,notify:true,readOnly:true},/**
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
       */activeRequests:{type:Array,notify:true,readOnly:true,value:function value(){return[];}},/**
       * Length of time in milliseconds to debounce multiple automatically generated requests.
       */debounceDuration:{type:Number,value:0,notify:true},/**
       * Prefix to be stripped from a JSON response before parsing it.
       *
       * In order to prevent an attack using CSRF with Array responses
       * (http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx/)
       * many backends will mitigate this by prefixing all JSON response bodies
       * with a string that would be nonsensical to a JavaScript parser.
       *
       */jsonPrefix:{type:String,value:''},/**
       * By default, iron-ajax's events do not bubble. Setting this attribute will cause its
       * request and response events as well as its iron-ajax-request, -response,  and -error
       * events to bubble to the window object. The vanilla error event never bubbles when
       * using shadow dom even if this.bubbles is true because a scoped flag is not passed with
       * it (first link) and because the shadow dom spec did not used to allow certain events,
       * including events named error, to leak outside of shadow trees (second link).
       * https://www.w3.org/TR/shadow-dom/#scoped-flag
       * https://www.w3.org/TR/2015/WD-shadow-dom-20151215/#events-that-are-not-leaked-into-ancestor-trees
       */bubbles:{type:Boolean,value:false},_boundHandleResponse:{type:Function,value:function value(){return this._handleResponse.bind(this);}}},observers:['_requestOptionsChanged(url, method, params.*, headers, contentType, '+'body, sync, handleAs, jsonPrefix, withCredentials, timeout, auto)'],/**
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
     */get requestHeaders(){var headers={};var contentType=this.contentType;if(contentType==null&&typeof this.body==='string'){contentType='application/x-www-form-urlencoded';}if(contentType){headers['content-type']=contentType;}var header;if(this.headers instanceof Object){for(header in this.headers){headers[header]=this.headers[header].toString();}}return headers;},/**
     * Request options suitable for generating an `iron-request` instance based
     * on the current state of the `iron-ajax` instance's properties.
     *
     * @return {{
     *   url: string,
     *   method: (string|undefined),
     *   async: (boolean|undefined),
     *   body: (ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined|Object),
     *   headers: (Object|undefined),
     *   handleAs: (string|undefined),
     *   jsonPrefix: (string|undefined),
     *   withCredentials: (boolean|undefined)}}
     */toRequestOptions:function toRequestOptions(){return{url:this.requestUrl||'',method:this.method,headers:this.requestHeaders,body:this.body,async:!this.sync,handleAs:this.handleAs,jsonPrefix:this.jsonPrefix,withCredentials:this.withCredentials,timeout:this.timeout};},/**
     * Performs an AJAX request to the specified URL.
     *
     * @return {!IronRequestElement}
     */generateRequest:function generateRequest(){var request=/** @type {!IronRequestElement} */document.createElement('iron-request');var requestOptions=this.toRequestOptions();this.push('activeRequests',request);request.completes.then(this._boundHandleResponse).catch(this._handleError.bind(this,request)).then(this._discardRequest.bind(this,request));request.send(requestOptions);this._setLastRequest(request);this._setLoading(true);this.fire('request',{request:request,options:requestOptions},{bubbles:this.bubbles});this.fire('iron-ajax-request',{request:request,options:requestOptions},{bubbles:this.bubbles});return request;},_handleResponse:function _handleResponse(request){if(request===this.lastRequest){this._setLastResponse(request.response);this._setLastError(null);this._setLoading(false);}this.fire('response',request,{bubbles:this.bubbles});this.fire('iron-ajax-response',request,{bubbles:this.bubbles});},_handleError:function _handleError(request,error){if(this.verbose){Polymer.Base._error(error);}if(request===this.lastRequest){this._setLastError({request:request,error:error,status:request.xhr.status,statusText:request.xhr.statusText,response:request.xhr.response});this._setLastResponse(null);this._setLoading(false);}// Tests fail if this goes after the normal this.fire('error', ...)
this.fire('iron-ajax-error',{request:request,error:error},{bubbles:this.bubbles});this.fire('error',{request:request,error:error},{bubbles:this.bubbles});},_discardRequest:function _discardRequest(request){var requestIndex=this.activeRequests.indexOf(request);if(requestIndex>-1){this.splice('activeRequests',requestIndex,1);}},_requestOptionsChanged:function _requestOptionsChanged(){this.debounce('generate-request',function(){if(this.url==null){return;}if(this.auto){this.generateRequest();}},this.debounceDuration);}});(function(){var intlLibraryScript;var intlLibraryLoadingStatus='initializing';var _setupIntlPolyfillCalled=false;/**
   * Set up Intl polyfill if required
   */function _setupIntlPolyfill(){// Polyfill Intl if required
var intlLibraryUrl=this.resolveUrl('../intl/dist/Intl.min.js');if(window.Intl){if(window.IntlPolyfill&&window.Intl===window.IntlPolyfill){intlLibraryLoadingStatus='loaded';}else{intlLibraryLoadingStatus='native';}}else{intlLibraryLoadingStatus='loading';intlLibraryScript=document.createElement('script');intlLibraryScript.setAttribute('src',intlLibraryUrl);intlLibraryScript.setAttribute('id','intl-js-library');intlLibraryScript.addEventListener('load',function intlLibraryLoaded(e){intlLibraryLoadingStatus='loaded';e.target.removeEventListener('load',intlLibraryLoaded);return false;});var s=document.querySelector('script')||document.body;s.parentNode.insertBefore(intlLibraryScript,s);}}/**
   * Set up polyfill locale of Intl if required
   *
   * @param {String} locale Target locale to polyfill
   * @param {Function} callback Callback function to handle locale load
   * @return {Boolean} true if supported; false if callback will be called
   */function _setupIntlPolyfillLocale(locale,callback){if(!window.IntlPolyfill){switch(intlLibraryLoadingStatus){case'loading':if(intlLibraryScript){var libraryLoadedBindThis=function(e){_setupIntlPolyfillLocale.call(this,locale,callback);e.target.removeEventListener('load',libraryLoadedBindThis);}.bind(this);intlLibraryScript.addEventListener('load',libraryLoadedBindThis);return false;}else{console.error('Intl.js is not being loaded');}break;// impossible cases
case'initializing':case'loaded':case'native':default:/* istanbul ignore next: these cases are impossible */break;}}else{if(intlLibraryLoadingStatus!=='native'){var supported=Intl.NumberFormat.supportedLocalesOf(locale,{localeMatcher:'lookup'});var script;var intlScript;if(supported.length===0){// load the locale
var fallbackLanguages=_enumerateFallbackLanguages(locale);locale=fallbackLanguages.shift();script=document.querySelector('script#intl-js-locale-'+locale);if(!script){script=document.createElement('script');script.setAttribute('id','intl-js-locale-'+locale);script.setAttribute('src',this.resolveUrl('../intl/locale-data/jsonp/'+locale+'.js'));var intlLocaleLoadedBindThis=function(e){if(e.target===script){e.target.removeEventListener('load',intlLocaleLoadedBindThis);callback.call(this,locale);}return false;}.bind(this);var intlLocaleLoadErrorBindThis=function(e){if(e.target===script){e.target.removeEventListener('error',intlLocaleLoadErrorBindThis);script.setAttribute('loaderror','');locale=fallbackLanguages.shift();if(!locale){locale=this.DEFAULT_LANG;}var fallbackSupport=Intl.NumberFormat.supportedLocalesOf(locale,{localeMatcher:'lookup'});if(fallbackSupport.length>0){callback.call(this,locale);}else{_setupIntlPolyfillLocale.call(this,locale,callback);}return false;}}.bind(this);script.addEventListener('load',intlLocaleLoadedBindThis);script.addEventListener('error',intlLocaleLoadErrorBindThis);intlScript=document.querySelector('script#intl-js-library')||document.body;intlScript.parentNode.insertBefore(script,intlScript.nextSibling);}else if(!script.hasAttribute('loaderror')){// already loading
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
   */function _enumerateFallbackLanguages(lang){var result=[];var parts;var match;var isExtLangCode=0;var extLangCode;var isScriptCode=0;var scriptCode;var isCountryCode=0;var countryCode;var n;if(!lang||lang.length===0){result.push('');}else{parts=lang.split(/[-_]/);// normalize ISO-639-1 language codes
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
switch(result[result.length-1]){case'zh-CN':case'zh-CHS':result.push('zh-Hans');break;case'zh-TW':case'zh-SG':case'zh-HK':case'zh-CHT':result.push('zh-Hant');break;default:break;}}parts.pop();}}return result;}Polymer({is:'i18n-number',/**
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
     */registered:function registered(){if(!_setupIntlPolyfillCalled){_setupIntlPolyfillCalled=true;_setupIntlPolyfill.call(this);}},ready:function ready(){this._setupObservers();this.raw=this.textNode.data;if(!this.lang){// Polyfill non-functional default value for lang property in Safari 7
this.lang=this.DEFAULT_LANG;}},attached:function attached(){this.raw=this.textNode.data;},/**
     * Set up observers of textContent mutations
     */_setupObservers:function _setupObservers(){this.textNode=Polymer.dom(this).childNodes[0];if(!this.textNode){Polymer.dom(this).appendChild(document.createTextNode(''));this.textNode=Polymer.dom(this).childNodes[0];}this.observer=new MutationObserver(this._textMutated.bind(this));this.observer.observe(this.textNode,{characterData:true});this.observer.observe(this,{attributes:true,attributeFilter:['lang']});this.nodeObserver=Polymer.dom(this).observeNodes(function(info){if(info.addedNodes[0]&&info.addedNodes[0].nodeType===info.addedNodes[0].TEXT_NODE){this.textNode=info.addedNodes[0];this.raw=this.textNode.data;console.log('i18n-number: text node added with '+this.raw);this.observer.observe(this.textNode,{characterData:true});}}.bind(this));},/**
     * MutationObserver callback of the child text node to re-render on text mutations.
     *
     * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
     */_textMutated:function _textMutated(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'characterData':console.log('i18n-number: _textMutated: raw = '+mutation.target.data);if(this.raw!==mutation.target.data){this.raw=mutation.target.data;}break;case'attributes':if(mutation.attributeName==='lang'){this._lang=this.lang;}break;default:/* istanbul ignore next: mutation.type is characterData or attributes */break;}},this);},/**
     * Observer of `raw` property to re-render the formatted number.
     *
     * @param {string} raw New raw number string.
     */_rawChanged:function _rawChanged(raw){if(this.textNode){if(raw!==this.textNode.data){this.textNode.data=raw;}//console.log('i18n-number: _rawChanged: raw = ' + raw);
this._render(this.lang,this.options,raw,this.offset);}},/**
     * Observer of `lang` property to re-render the formatted number.
     *
     * @param {string} lang New locale.
     */_langChanged:function _langChanged(lang){if(!lang){this.lang=this.DEFAULT_LANG;lang=this.lang;}if(this.textNode){//console.log('i18n-number: _langChanged: lang = ' + lang);
this._render(lang,this.options,this.raw,this.offset);}},/**
     * Observer of `options` property to re-render the formatted number.
     *
     * @param {Object} options New options for Intl.NumberFormat.
     */_optionsChanged:function _optionsChanged(options){if(this.textNode){//console.log('i18n-number: _optionsChanged: options = ' + JSON.stringify(options));
this._render(this.lang,options,this.raw,this.offset);}},/**
     * Observer of `options` sub-properties to re-render the formatted number.
     */_onOptionsPropertyChanged:function _onOptionsPropertyChanged()/* changeRecord */{if(this.textNode){//console.log('_onOptionsPropertyChanged: path = ' + changeRecord.path + ' value = ' + JSON.stringify(changeRecord.value));
this._render(this.lang,this.options,this.raw,this.offset);}},/**
     * Observer of `offset` property to re-render the formatted number.
     *
     * @param {number} offset New offset.
     */_offsetChanged:function _offsetChanged(offset){if(this.textNode){//console.log('i18n-number: _offsetChanged: offset = ' + offset);
this._render(this.lang,this.options,this.raw,offset);}},/**
     * Formats the number
     *
     * @param {string} lang Locale for formatting.
     * @param {Object} options Options for Intl.NumberFormat.
     * @param {number} number Number to format.
     * @return {string} Formatted number string.
     */_formatNumber:function _formatNumber(lang,options,number){if(!lang){lang=this.DEFAULT_LANG;}switch(intlLibraryLoadingStatus){case'loaded':case'loading':default:try{if(_setupIntlPolyfillLocale.call(this,lang,function(locale){this.effectiveLang=locale;this._render.call(this,locale,this.options,this.raw,this.offset);}.bind(this))){return new Intl.NumberFormat(lang,options).format(number);}else{// waiting for callback
return undefined;}}catch(e){return number.toString();}/* istanbul ignore next: unreachable code due to returns in the same case */break;case'native':// native
try{return new Intl.NumberFormat(lang,options).format(number);}catch(e){return number.toString();}/* istanbul ignore next: unreachable code due to returns in the same case */break;}},/**
     * Renders the formatted number
     *
     * @param {string} lang Locale for formatting.
     * @param {Object} options Options for Intl.NumberFormat.
     * @param {string} raw Raw number string.
     * @param {number} offset Offset for number.
     */_render:function _render(lang,options,raw,offset){// TODO: rendering may be done redundantly on property initializations
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
     */render:function render(){this._render(this.lang,this.options,this.raw,this.offset);}});})();Polymer({is:'i18n-format',/**
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
     */paramAttribute:{type:String,value:function(){return Polymer.Element?'slot':'param';}(),observer:'_paramAttributeChanged'},/**
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
   */DEFAULT_LANG:'en',ready:function ready(){this._setupParams();if(!this.lang){// Polyfill non-functional default value for lang property in Safari 7
this.lang=this.DEFAULT_LANG;}},attached:function attached(){this.render();},/**
   * Traverse the local DOM and set up parameters and observers.
   */_setupParams:function _setupParams(){var n;this.elements=Array.prototype.filter.call(Polymer.dom(this).childNodes,function(node){return node.nodeType===node.ELEMENT_NODE;});var needParamObservation=this.observeParams&&this.elements.length>0&&this.elements[0].tagName.toLowerCase()==='json-data';this.observer=new MutationObserver(this._templateMutated.bind(this));this.observer.observe(this,{attributes:true,attributeFilter:['lang']});for(n=0;n<this.elements.length;n++){if(n===0){this.templateElement=this.elements[n];this.templateTextNode=Polymer.dom(this.templateElement).childNodes[0];this.observer.observe(this.templateTextNode,{characterData:true});}else{if(!this.elements[n].hasAttribute(this.paramAttribute)){this.elements[n].setAttribute(this.paramAttribute,''+n);}if(needParamObservation){// TODO: childNodes[0] may not be a text node
this.observer.observe(Polymer.dom(this.elements[n]).childNodes[0],{characterData:true});if(this.elements[n].tagName.toLowerCase()==='i18n-number'){this.listen(this.elements[n],'rendered','render');}}}}//console.log('i18n-format: _setupParams: elements = ' + this.elements);
},/**
   * MutationObserver callback of child text nodes to re-render on template text or parameter mutations.
   *
   * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
   */_templateMutated:function _templateMutated(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'characterData'://console.log('i18n-format: ' + this.id + '._templateMutated(): characterData: tag = ' + 
//            Polymer.dom(mutation.target).parentNode.tagName.toLowerCase() + 
//            ' data = ' + mutation.target.data);
if(!mutation.target.parentNode){this.render();}else if((Polymer.Element?mutation.target:Polymer.dom(mutation.target)).parentNode.tagName.toLowerCase()!=='i18n-number'){this.render();}else if(typeof(Polymer.Element?mutation.target:Polymer.dom(mutation.target)).parentNode.formatted!=='undefined'){this.render();}break;case'attributes':if(mutation.attributeName==='lang'){this._lang=this.lang;}break;default:/* istanbul ignore next: mutation.type is always characterData or attributes */break;}},this);},/**
   * Observer of `lang` property to re-render the template text.
   *
   * @param {string} lang New locale.
   */_langChanged:function _langChanged(lang/*, oldLang */){//console.log('i18n-format: ' + this.id + '._langChanged() lang = ' + lang + ' oldLang = ' + oldLang);
if(this.elements&&lang!==undefined&&lang!==null&&!lang.match(/^{{.*}}$/)&&!lang.match(/^\[\[.*\]\]$/)){this.render();}//else {
//  console.log('i18n-format: skipping render()');
//}
},/**
   * Observer of `paramFormat` property to re-render the template text.
   *
   * @param {string} paramFormat New paramFormat.
   * @param {string} oldParamFormat Old paramFormat.
   */_paramFormatChanged:function _paramFormatChanged(paramFormat,oldParamFormat){//console.log('i18n-format: ' + this.id + '._paramFormatChanged() new = ' + paramFormat + ' old = ' + oldParamFormat);
if(this.elements&&oldParamFormat!==undefined&&paramFormat&&this.lang!==undefined&&this.lang!==null&&!this.lang.match(/^{{.*}}$/)&&!this.lang.match(/^\[\[.*\]\]$/)){this.lastTemplateText=undefined;this.render();}},/**
   * Observer of `paramAttribute` property to reset parameter attributes.
   *
   * @param {string} paramAttribute New paramAttribute.
   * @param {string} oldParamAttribute Old paramAttribute.
   */_paramAttributeChanged:function _paramAttributeChanged(paramAttribute,oldParamAttribute){//console.log('i18n-format: ' + this.id + '._paramAttributeChanged() new = ' + paramAttribute + ' old = ' + oldParamAttribute);
var n;if(this.elements&&oldParamAttribute!==undefined&&paramAttribute&&this.lang!==undefined&&this.lang!==null&&!this.lang.match(/^{{.*}}$/)&&!this.lang.match(/^\[\[.*\]\]$/)){for(n=1;n<this.elements.length;n++){this.elements[n].removeAttribute(oldParamAttribute);if(!this.elements[n].hasAttribute(paramAttribute)){this.elements[n].setAttribute(paramAttribute,''+n);}}this.lastTemplateText=undefined;this.render();}},/**
   * Detect the CLDR plural category of a number 
   * with [`make-plural` library](https://github.com/eemeli/make-plural.js).
   *
   * @param {number} n The number to get the plural category for.
   * @return {string} Plural category of the number. 
   */_getPluralCategory:function _getPluralCategory(n){var category='other';var lang=this.lang||this.DEFAULT_LANG;lang=lang.split(/[-_]/)[0];if(window.plurals[lang]){category=window.plurals[lang](n);}else{category=window.plurals.en(n);}//console.log('i18n-format: _getPluralCategory(' + n + ') = ' + category);
return category;},/**
   * Select a template text by parameters.
   *
   * @return {string} Selected template text. 
   */_selectTemplateText:function _selectTemplateText(){var templateText='';if(!this.templateElement){return templateText;}else if(this.templateElement.tagName.toLowerCase()==='json-data'){var templateObject;try{templateObject=JSON.parse(this.templateTextNode.data);}catch(ex){if(this.templateTextNode.data){console.warn('i18n-format: parse error in json-data');}return templateText;}var n;for(n=1;(typeof templateObject==='undefined'?'undefined':_typeof(templateObject))==='object'&&n<this.elements.length;n++){var param=this.elements[n];if(param.tagName.toLowerCase()==='i18n-number'){// plural selector
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
   */render:function render(){var templateText=this._selectTemplateText();var tmpNode=document.createElement('span');var paramPlaceholder;var childNodes=[];var i;var shadowDomV1=!!(Polymer.Element&&Polymer.Element.name==='PolymerElement');var shadyDomV1=!!window.ShadyDOM;if(templateText===this.lastTemplateText){//console.log('i18n-format: skipping rendering as the templateText has not changed');
return;}else if(typeof templateText==='undefined'){return;}else{this.lastTemplateText=templateText;//console.log('i18n-format: ' + this.id + '.render() templateText = ' + templateText);
}i=1;while(i<this.elements.length){paramPlaceholder=this.paramFormat.replace('n',i);templateText=templateText.replace(paramPlaceholder,shadowDomV1?'<slot name="'+i+'"></slot>':'<content select="['+this.paramAttribute+'=\''+i+'\']"></content>');i++;}tmpNode.innerHTML=templateText;if(Polymer.Element){this.root.innerHTML='';// Polymer 2.x
}else{Polymer.dom(this.root).innerHTML='';}// References of childNodes have to be copied for Shady DOM compatibility
for(i=0;i<tmpNode.childNodes.length;i++){childNodes[i]=tmpNode.childNodes[i];}for(i=0;i<childNodes.length;i++){// each node has to be appended via Polymer.dom()
Polymer.dom(this.root).appendChild(childNodes[i]);}if(shadyDomV1){ShadyDOM.flush();}this.fire('rendered');}});Polymer({is:'iron-localstorage',properties:{/**
       * localStorage item key
       */name:{type:String,value:''},/**
       * The data associated with this storage.
       * If set to null item will be deleted.
       * @type {*}
       */value:{type:Object,notify:true},/**
       * If true: do not convert value to JSON on save/load
       */useRaw:{type:Boolean,value:false},/**
       * Value will not be saved automatically if true. You'll have to do it manually with `save()`
       */autoSaveDisabled:{type:Boolean,value:false},/**
       * Last error encountered while saving/loading items
       */errorMessage:{type:String,notify:true},/** True if value has been loaded */_loaded:{type:Boolean,value:false}},observers:['_debounceReload(name,useRaw)','_trySaveValue(autoSaveDisabled)','_trySaveValue(value.*)'],ready:function ready(){this._boundHandleStorage=this._handleStorage.bind(this);},attached:function attached(){window.addEventListener('storage',this._boundHandleStorage);},detached:function detached(){window.removeEventListener('storage',this._boundHandleStorage);},_handleStorage:function _handleStorage(ev){if(ev.key==this.name){this._load(true);}},_trySaveValue:function _trySaveValue(){if(this._doNotSave){return;}if(this._loaded&&!this.autoSaveDisabled){this.debounce('save',this.save);}},_debounceReload:function _debounceReload(){this.debounce('reload',this.reload);},/**
     * Loads the value again. Use if you modify
     * localStorage using DOM calls, and want to
     * keep this element in sync.
     */reload:function reload(){this._loaded=false;this._load();},/**
     * loads value from local storage
     * @param {boolean=} externalChange true if loading changes from a different window
     */_load:function _load(externalChange){try{var v=window.localStorage.getItem(this.name);}catch(ex){this.errorMessage=ex.message;this._error("Could not save to localStorage.  Try enabling cookies for this page.",ex);};if(v===null){this._loaded=true;this._doNotSave=true;// guard for save watchers
this.value=null;this._doNotSave=false;this.fire('iron-localstorage-load-empty',{externalChange:externalChange});}else{if(!this.useRaw){try{// parse value as JSON
v=JSON.parse(v);}catch(x){this.errorMessage="Could not parse local storage value";Polymer.Base._error("could not parse local storage value",v);v=null;}}this._loaded=true;this._doNotSave=true;this.value=v;this._doNotSave=false;this.fire('iron-localstorage-load',{externalChange:externalChange});}},/**
     * Saves the value to localStorage. Call to save if autoSaveDisabled is set.
     * If `value` is null or undefined, deletes localStorage.
     */save:function save(){var v=this.useRaw?this.value:JSON.stringify(this.value);try{if(this.value===null||this.value===undefined){window.localStorage.removeItem(this.name);}else{window.localStorage.setItem(this.name,/** @type {string} */v);}}catch(ex){// Happens in Safari incognito mode,
this.errorMessage=ex.message;Polymer.Base._error("Could not save to localStorage. Incognito mode may be blocking this action",ex);}}/**
     * Fired when value loads from localStorage.
     *
     * @event iron-localstorage-load
     * @param {{externalChange:boolean}} detail -
     *     externalChange: true if change occured in different window.
     *//**
     * Fired when loaded value does not exist.
     * Event handler can be used to initialize default value.
     *
     * @event iron-localstorage-load-empty
     * @param {{externalChange:boolean}} detail -
     *     externalChange: true if change occured in different window.
     */});(function(document){'use strict';// html element of this document
var html=document.querySelector('html');// app global default language
var defaultLang=html.hasAttribute('lang')?html.getAttribute('lang'):'';// imperative synchronous registration of the template for Polymer 2.x
var template=(HTMLImports.hasNative?document.currentScript:document._currentScript).ownerDocument.querySelector('template#i18n-preference');var domModule=document.createElement('dom-module');var currentScript=HTMLImports.hasNative?document.currentScript:document._currentScript;HTMLImports.whenReady(function(){currentScript.ownerDocument.querySelector('div#dom-module-placeholder').appendChild(domModule);domModule.appendChild(template);domModule.register('i18n-preference');Polymer({is:'i18n-preference',properties:{/**
       * Persistence of preference 
       */persist:{type:Boolean,value:false,reflectToAttribute:true,notify:true,observer:'_onPersistChange'}},/**
     * Ready callback to initialize this.lang
     */ready:function ready(){if(this.persist){// delay this.lang update
}else{//this.$.storage.value = undefined;
}this.isReady=true;},/**
     * Attached callback to initialize html.lang and its observation
     */attached:function attached(){this._observe();if(this.persist){// delay html.lang update
}else{if(!html.hasAttribute('preferred')){html.setAttribute('lang',navigator.language||navigator.browserLanguage);}}},/**
     * Detached callback to diconnect html.lang observation
     */detached:function detached(){this._disconnect();},/**
     * Initialize an empty localstorage
     */_onLoadEmptyStorage:function _onLoadEmptyStorage(){if(this.isReady){if(this.persist){if(this.isInitialized){// store html.lang value
this.$.storage.value=html.getAttribute('lang');}else{if(html.hasAttribute('preferred')){this.$.storage.value=html.getAttribute('lang');}else{this.$.storage.value=navigator.language||navigator.browserLanguage;if(html.getAttribute('lang')!==this.$.storage.value){html.setAttribute('lang',this.$.storage.value);}}this.isInitialized=true;}}else{// leave the empty storage as it is
}}},/**
     * Handle the loaded storage value
     */_onLoadStorage:function _onLoadStorage(){if(this.isReady){if(this.persist){// preferred attribute in html to put higher priority
// in the default html language than navigator.language
if(html.hasAttribute('preferred')){if(this.$.storage.value!==defaultLang){// overwrite the storage by the app default language
this.$.storage.value=defaultLang;}}else{// load the value from the storage
html.setAttribute('lang',this.$.storage.value);}}else{// empty the storage
this.$.storage.value=undefined;}}},/**
     * Handle persist changes
     *
     * @param {Boolean} value new this.persist value
     */_onPersistChange:function _onPersistChange(value){if(this.isReady){if(value){if(this.$.storage.value!==html.getAttribute('lang')){// save to the storage
this.$.storage.value=html.getAttribute('lang');}}else{// empty the storage
this.$.storage.value=undefined;}}},/**
     * Handle storage value changes
     *
     * @param {Event} e value-changed event on the storage
     */_onStorageValueChange:function _onStorageValueChange(e){var value=e.detail.value;if(this.isReady){if(this.persist){if(value){if(value!==html.getAttribute('lang')){// save to the lang
html.setAttribute('lang',value);}}else{// update the storage
this.$.storage.value=html.getAttribute('lang');}}else{if(value){// empty the storage
this.$.storage.value=undefined;}}}},/**
     * Handle value changes on localstorage
     *
     * @param {MutationRecord[]} mutations Array of MutationRecords for html.lang
     *
     * Note: 
     *   - Bound to this element
     */_htmlLangMutationObserverCallback:function _htmlLangMutationObserverCallback(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'attributes':if(mutation.attributeName==='lang'){if(this.$.storage.value!==mutation.target.getAttribute('lang')){this.$.storage.value=mutation.target.getAttribute('lang');}}break;default:break;}}.bind(this));},/**
     * Set up html.lang mutation observer
     */_observe:function _observe(){// observe html lang mutations
if(!this._htmlLangMutationObserver){this._htmlLangMutationObserverCallbackBindThis=this._htmlLangMutationObserverCallback.bind(this);this._htmlLangMutationObserver=new MutationObserver(this._htmlLangMutationObserverCallbackBindThis);}this._htmlLangMutationObserver.observe(html,{attributes:true});},/**
     * Disconnect html.lang mutation observer
     */_disconnect:function _disconnect(){if(this._htmlLangMutationObserver){this._htmlLangMutationObserver.disconnect();}}});});})(document);(function(){// shared data
var sharedData={};// imperative synchronous registration of the template for Polymer 2.x
var template=(HTMLImports.hasNative?document.currentScript:document._currentScript).ownerDocument.querySelector('template#i18n-attr-repo');var domModule=document.createElement('dom-module');domModule.appendChild(template);domModule.register('i18n-attr-repo');Polymer({is:'i18n-attr-repo',ready:function ready(){this.data=sharedData;var customAttributes=Polymer.dom(this).querySelector('template#custom');// traverse custom attributes repository
if(customAttributes){this._traverseTemplateTree(customAttributes._content||customAttributes.content);}if(this.data.__ready__){return;// traverse standard attributes only once
}this.data.__ready__=true;this._traverseTemplateTree(this.$.standard._content||this.$.standard.content);},/**
     * Judge if a specific attribute of an element requires localization.
     *
     * @param {HTMLElement} element Target element.
     * @param {string} attr Target attribute name.
     * @return {string or boolean} true - property, '$' - attribute, false - not targeted, 'type-name' - type name
     */isLocalizableAttribute:function isLocalizableAttribute(element,attr){var tagName=element.tagName.toLowerCase();attr=attr.replace(/\$$/,'');if(this.data['any-elements']&&this.data['any-elements'][attr]){return this.data['any-elements'][attr];}else if(this.data[tagName]){return this.data[tagName]['any-attributes']||this._getType(element,this.data[tagName][attr]);}else{return false;}},/**
     * Get the type name or '$' for a specific attribute of an element from the attributes repository
     *
     * @param {HTMLElement} element Target element.
     * @param {object} value this.data[tagName][attr]
     * @return {string or boolean} true - property, '$' - attribute, false - not targeted, 'type-name' - type name
     */_getType:function _getType(element,value){var selector;var result;if((typeof value==='undefined'?'undefined':_typeof(value))==='object'){for(selector in value){if(selector){if(this._matchAttribute(element,selector)){result=this._getType(element,value[selector]);if(result){return result;}}}}if(value['']){if(this._matchAttribute(element,'')){result=this._getType(element,value['']);if(result){return result;}}}return false;}else{return value;}},/**
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
     */_matchAttribute:function _matchAttribute(element,selector){var value;var match;// default ''
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
     */_compareSelectors:function _compareSelectors(s1,s2){var name1=s1.replace(/^!/,'').replace(/=.*$/,'').toLowerCase();var name2=s2.replace(/^!/,'').replace(/=.*$/,'').toLowerCase();return name1.localeCompare(name2);},/**
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
     */setLocalizableAttribute:function setLocalizableAttribute(element,attr,value){this.data[element]=this.data[element]||{};var cursor=this.data[element];var prev=attr;var type=true;var selectors=[];if(typeof value==='string'&&value){selectors=value.split(',');if(selectors[selectors.length-1].match(/^[^!=][^=]*$/)){type=selectors.pop();}selectors=selectors.map(function(selector){return selector.replace(/=$/,'');});selectors.sort(this._compareSelectors);while(selectors[0]===''){selectors.shift();}}selectors.forEach(function(selector,index){if(_typeof(cursor[prev])!=='object'){cursor[prev]=cursor[prev]?{'':cursor[prev]}:{};}cursor[prev][selector]=cursor[prev][selector]||{};cursor=cursor[prev];prev=selector;});if(_typeof(cursor[prev])==='object'&&cursor[prev]&&Object.keys(cursor[prev]).length){cursor=cursor[prev];prev='';}cursor[prev]=type;},/**
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
     */registerLocalizableAttributes:function registerLocalizableAttributes(element,template){if(!element){element=template.getAttribute('id');}if(element){var attrs=(template.getAttribute('text-attr')||'').split(' ');var textAttr=false;attrs.forEach(function(attr){if(attr){this.setLocalizableAttribute(element,attr,true);}},this);Array.prototype.forEach.call(template.attributes,function(attr){switch(attr.name){case'id':case'lang':case'localizable-text':case'assetpath':break;case'text-attr':textAttr=true;break;default:if(textAttr){this.setLocalizableAttribute(element,attr.name,attr.value);}break;}}.bind(this));}},/**
     * Traverse the template of `i18n-attr-repo` in the ready() callback
     * and construct the localizable attributes repository object. The method calls itself
     * recursively for traversal.
     *
     * @param {HTMLElement} node The target HTML node for traversing.
     */_traverseTemplateTree:function _traverseTemplateTree(node){var name;if(node.nodeType===node.ELEMENT_NODE){name=node.nodeName.toLowerCase();Array.prototype.forEach.call(node.attributes,function(attribute){this.data[name]=this.data[name]||{};this.setLocalizableAttribute(name,attribute.name,attribute.value);},this);}if(node.childNodes.length>0){for(var i=0;i<node.childNodes.length;i++){this._traverseTemplateTree(node.childNodes[i]);}}}});})();/* jshint -W100 */(function(document){'use strict';var html=document.querySelector('html');if(window.ShadowDOMPolyfill){// Fix #38. Add reflectToAttribute effect on html.lang property
// for supplementing Shadow DOM MutationObserver polyfill
Object.defineProperty(html,'lang',{get:function get(){return this.getAttribute('lang');},set:function set(value){this.setAttribute('lang',value);}});}// Safari 7 predefines non-configurable standard properties
// Note: They become configurable with ShadowDOMPolyfill, which wraps them.
var isStandardPropertyConfigurable=function(){var langPropertyDescriptor=Object.getOwnPropertyDescriptor(document.createElement('span'),'lang');return!langPropertyDescriptor||langPropertyDescriptor.configurable;}();// Polymer 1.4.0 on Safari 7 inserts extra unexpected whitepace node at the beginning of template
var extraWhiteSpaceNode=!isStandardPropertyConfigurable;if(Polymer.Element){isStandardPropertyConfigurable=false;}// app global bundle storage
var bundles={'':{}};// with an empty default bundle
// app global default language
var defaultLang=html.hasAttribute('lang')?html.getAttribute('lang'):'';// shared fetching instances for bundles
var bundleFetchingInstances={};// path for start URL
var startUrl=function(){var path=window.location.pathname;if(document.querySelector('meta[name=app-root]')&&document.querySelector('meta[name=app-root]').getAttribute('content')){// <meta name="app-root" content="/"> to customize application root
path=document.querySelector('meta[name=app-root]').getAttribute('content');}else if(document.querySelector('link[rel=manifest]')&&document.querySelector('link[rel=manifest]').getAttribute('href')&&document.querySelector('link[rel=manifest]').getAttribute('href').match(/^\//)){// assume manifest is located at the application root folder
path=document.querySelector('link[rel=manifest]').getAttribute('href');}return path.replace(/\/[^\/]*$/,'/');}();// path for locales from <html locales-path="locales">
var localesPath=html.hasAttribute('locales-path')?html.getAttribute('locales-path'):'locales';// Support ShadowDOM V1 on Polymer 2.x
var paramAttribute=Polymer.Element?'slot':'param';var attributesRepository=(HTMLImports.hasNative?document.currentScript:document._currentScript).ownerDocument.querySelector('i18n-attr-repo');// set up userPreference
var userPreference=document.querySelector('i18n-preference');if(!userPreference){userPreference=document.createElement('i18n-preference');// append to body
document.querySelector('body').appendChild(userPreference);}// debug log when <html debug> attribute exists
var debuglog=html.hasAttribute('debug')?function(arg){console.log(arg);}:function(){};window.BehaviorsStore=window.BehaviorsStore||{};/**
   * Apply `BehaviorsStore.I18nControllerBehavior` to manipulate internal variables for I18N
   *
   * Note: This behavior is not for normal custom elements to apply I18N. UI is not expected.
   */BehaviorsStore.I18nControllerBehavior={properties:{/**
       * Flag for detection of `I18nControllerBehavior`
       *
       * `true` if I18nControllerBehavior is applied
       *
       * Note: Module-specific JSON resources are NOT fetched for `I18nControllerBehavior`
       */isI18nController:{type:Boolean,value:true,readOnly:true},/**
       * HTML element object for the current document
       */html:{type:Object,value:html},/**
       * Master bundles object for storing all the localized and default resources
       */masterBundles:{type:Object,value:bundles},/**
       * Default lang for the document, i.e., the initial value of `<html lang>` attribute
       */defaultLang:{type:String,value:defaultLang,readOnly:true},/**
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
       */userPreference:{type:Object,value:userPreference,readOnly:true}}};/**
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
   * @polymerBehavior BehaviorsStore.I18nBehavior
   * @group I18nBehavior
   * @hero hero.svg
   * @demo demo/index.html
   */BehaviorsStore.I18nBehavior={/**
     * Fired when the text message bundle object (`this.text`) is updated after `this.lang` is changed.
     *
     * @event lang-updated
     *//**
     * Fired when a shared bundle is fetched.
     *
     * @event bundle-fetched
     */properties:{/**
       * The locale of the element.
       * The default value is copied from `<html lang>` attribute of the current page.
       * If `<html lang>` is not specified, `''` is set to use the template default language.
       *
       * The value is synchronized with `<html lang>` attribute of the current page by default.
       *
       * ### Note:
       *  - The value may not reflect the current UI locale until the localized texts are loaded.
       */lang:{type:String,value:defaultLang,reflectToAttribute:true,observer:'_langChanged'},/**
       * Text message bundle object for the current locale.
       * The object is shared among all the instances of the same element.
       * The value is updated when `lang-updated` event is fired.
       */text:{type:Object,computed:'_getBundle(lang)'},/**
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

    *//**
     * The backend logic for `this.text` object.
     *
     * @param {string} lang Locale for the text message bundle.
     * @return {Object} Text message bundle for the locale.
     */_getBundle:function _getBundle(lang){//console.log('_getBundle called for ' + this.is + ' with lang = ' + lang);
var resolved;var id=this.is==='i18n-dom-bind'?this.id:this.is;if(lang&&lang.length>0){var fallbackLanguageList=this._enumerateFallbackLanguages(lang);var tryLang;while(tryLang=fallbackLanguageList.shift()){if(!bundles[tryLang]){// set up an empty bundle for the language if missing
bundles[tryLang]={};}if(bundles[tryLang][id]){// bundle found
resolved=bundles[tryLang][id];break;}}}else{// lang is not specified
lang='';resolved=bundles[lang][id];}// Fallback priorities: last > app default > element default > fallback > {}
// TODO: need more research on fallback priorities
if(!resolved){if(this._fetchStatus&&bundles[this._fetchStatus.lastLang]&&bundles[this._fetchStatus.lastLang][id]){// old bundle for now (no changes should be shown)
resolved=bundles[this._fetchStatus.lastLang][id];}else if(defaultLang&&defaultLang.length>0&&bundles[defaultLang]&&bundles[defaultLang][id]){// app default language for now
resolved=bundles[defaultLang][id];}else if(this.templateDefaultLang&&this.templateDefaultLang.length>0&&bundles[this.templateDefaultLang]&&bundles[this.templateDefaultLang][id]){// element default language for now
resolved=bundles[this.templateDefaultLang][id];}/* no more fallback should happen *//* istanbul ignore else */else if(bundles[''][id]){// fallback language for now (this should be the same as element default)
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
     */_enumerateFallbackLanguages:function _enumerateFallbackLanguages(lang){var result=[];var parts;var match;var isExtLangCode=0;var extLangCode;var isScriptCode=0;var scriptCode;var isCountryCode=0;var countryCode;var n;if(!lang||lang.length===0){result.push('');}else{parts=lang.split(/[-_]/);// normalize ISO-639-1 language codes
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
     * Get the next fallback locale for the target locale.
     * 
     * Subset implementation of BCP47 (https://tools.ietf.org/html/bcp47).
     *
     * ### Examples:
     *
     *| Target Locale | Next Fallback |
     *|:--------------|:--------------|
     *| ru            | null          |
     *| en-GB         | en            |
     *| fr-CA         | fr            |
     *| zh-Hans-CN    | zh-Hans       |
     *
     * @param {string} lang Target locale.
     * @return {string} Next fallback locale. `null` if there are no fallback languages.
     *//*
    _getNextFallbackLanguage: function (lang) {
      var fallbackLanguageList = this._enumerateFallbackLanguages(lang);
      fallbackLanguageList.shift();
      var nextFallbackLanguage = fallbackLanguageList.shift();
      return nextFallbackLanguage ? nextFallbackLanguage : null;
    },
    *//**
     * MutationObserver callback of `lang` attribute for Safari 7
     *
     * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
     */_handleLangAttributeChange:function _handleLangAttributeChange(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'attributes':if(mutation.attributeName==='lang'){console.log('_handleLangAttributeChange lang = '+this.lang+' oldValue = '+mutation.oldValue+' typeof oldValue = '+_typeof(mutation.oldValue)+' _lang = '+this._lang);if(!(_typeof(mutation.oldValue)==='object'&&!mutation.oldValue)&&mutation.oldValue!==this.lang){if(this._lang!==mutation.oldValue){console.log('assigning this._lang = '+mutation.oldValue+' from old value');this._lang=mutation.oldValue;}console.log('assigning this._lang = '+this.lang);this._lang=this.lang;}else if(mutation.oldValue!=this.lang&&this._lang!==this.lang){console.log('assigning this._lang = '+this.lang);this._lang=this.lang;}}break;default:/* istanbul ignore next: mutation.type is always attributes */break;}},this);},/**
     * Observer of `this.lang` changes.
     *
     * Update `this.text` object if the text message bundle of the new `lang` is locally available.
     *
     * Trigger fetching of the text message bundle of the new `lang` if the bundle is not locally available.
     *
     * @param {string} lang New value of `lang`.
     * @param {string} oldLang Old value of `lang`.
     */_langChanged:function _langChanged(lang,oldLang){console.log(this.id+':_langChanged lang = '+lang+' oldLang = '+oldLang);var id=(this.is||this.getAttribute('is'))==='i18n-dom-bind'?this.id:this.is;lang=lang||'';// undefined and null are treated as default ''
oldLang=oldLang||'';if(lang!==oldLang&&bundles[oldLang]&&bundles[oldLang][id]){this._fetchStatus.lastLang=oldLang;}if(bundles[lang]&&bundles[lang][id]){// bundle available for the new language
if(this._fetchStatus&&lang!==this._fetchStatus.ajaxLang){// reset error status
this._fetchStatus.error=null;}this.notifyPath('text',this._getBundle(this.lang));this.fire('lang-updated',{lang:this.lang,oldLang:oldLang,lastLang:this._fetchStatus.lastLang});}else{// fetch the missing bundle
this._fetchLanguage(lang);}},/**
     * Called on `lang-updated` events and update `this.effectiveLang` with the value of `this.lang`.
     */_updateEffectiveLang:function _updateEffectiveLang(event){if(Polymer.dom(event).rootTarget===this){//console.log('_updateEffectiveLang: lang = ' + this.lang);
this.effectiveLang=this.lang;}},/**
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
     */_fetchLanguage:function _fetchLanguage(lang){if(this._fetchStatus){this._fetchStatus.fallbackLanguageList=this._enumerateFallbackLanguages(lang);this._fetchStatus.fallbackLanguageList.push('');this._fetchStatus.targetLang=this._fetchStatus.fallbackLanguageList.shift();this._fetchBundle(this._fetchStatus.targetLang);}},/**
     * Fetch the text message bundle of the target locale 
     * cooperatively with other instances.
     *
     * @param {string} lang Target locale.
     */_fetchBundle:function _fetchBundle(lang){//console.log('_fetchBundle lang = ' + lang);
if(!lang||lang.length===0){// handle empty cases
if(defaultLang&&defaultLang.length>0){lang=defaultLang;// app default language
}else if(this.templateDefaultLang&&this.templateDefaultLang.length>0){lang=this.templateDefaultLang;// element default language
}else{lang='';// fallback default language
}}// set up an empty bundle if inexistent
bundles[lang]=bundles[lang]||{};var id=this.is==='i18n-dom-bind'?this.id:this.is;if(bundles[lang][id]){// bundle is available; no need to fetch
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
this._fetchStatus.ajax=Polymer.Base.create('iron-ajax');this._fetchStatus.ajax.handleAs='json';this._fetchStatus._handleResponseBindFetchingInstance=this._handleResponse.bind(this);this._fetchStatus._handleErrorBindFetchingInstance=this._handleError.bind(this);this._fetchStatus.ajax.addEventListener('response',this._fetchStatus._handleResponseBindFetchingInstance);this._fetchStatus.ajax.addEventListener('error',this._fetchStatus._handleErrorBindFetchingInstance);}else{if(this._fetchStatus._handleResponseBindFetchingInstance){this._fetchStatus.ajax.removeEventListener('response',this._fetchStatus._handleResponseBindFetchingInstance);}if(this._fetchStatus._handleErrorBindFetchingInstance){this._fetchStatus.ajax.removeEventListener('error',this._fetchStatus._handleErrorBindFetchingInstance);}this._fetchStatus._handleResponseBindFetchingInstance=this._handleResponse.bind(this);this._fetchStatus._handleErrorBindFetchingInstance=this._handleError.bind(this);this._fetchStatus.ajax.addEventListener('response',this._fetchStatus._handleResponseBindFetchingInstance);this._fetchStatus.ajax.addEventListener('error',this._fetchStatus._handleErrorBindFetchingInstance);}// TODO: app global bundles have to be handled
var url;var skipFetching=false;if(lang===''){url=this.resolveUrl(id+'.json');}else{if(bundles[lang]&&bundles[lang].bundle){// missing in the bundle
url=this.resolveUrl(localesPath+'/'+id+'.'+lang+'.json');skipFetching=!!this.isI18nController;}else{// fetch the bundle
bundleFetchingInstances[lang]=this;url=this.resolveUrl(startUrl+localesPath+'/bundle.'+lang+'.json');}}this._fetchStatus.ajax.url=url;this._fetchStatus.ajaxLang=lang;try{this._fetchStatus.error=null;if(skipFetching){this._handleError({detail:{error:'skip fetching for I18nController'}});}else{this._fetchStatus.ajax.generateRequest();}}catch(e){// TODO: extract error message from the exception e
this._handleError({detail:{error:'ajax request failed: '+e}});}}},/**
     * Handle Ajax success response for a bundle.
     *
     * @param {Object} event `iron-ajax` success event.
     */_handleResponse:function _handleResponse(event){//console.log('_handleResponse ajaxLang = ' + this._fetchStatus.ajaxLang);
if(this._fetchStatus.ajax.url.indexOf('/'+localesPath+'/bundle.')>=0){bundles[this._fetchStatus.ajaxLang]=bundles[this._fetchStatus.ajaxLang]||{};this._deepMap(bundles[this._fetchStatus.ajaxLang],event.detail.response,function(text){return text;});bundles[this._fetchStatus.ajaxLang].bundle=true;bundleFetchingInstances[this._fetchStatus.ajaxLang]=null;//console.log('bundle-fetched ' + this.is + ' ' + this._fetchStatus.ajaxLang);
this.fire('bundle-fetched',{success:true,lang:this._fetchStatus.ajaxLang});var id=this.is==='i18n-dom-bind'?this.id:this.is;if(bundles[this._fetchStatus.ajaxLang][id]){this._fetchStatus.lastResponse=bundles[this._fetchStatus.ajaxLang][id];}else{// bundle does not contain text for this.is
this._fetchStatus.fetchingInstance=null;this._fetchBundle(this._fetchStatus.ajaxLang);return;}}else{this._fetchStatus.lastResponse=event.detail.response;}if(this._fetchStatus.lastResponse){var nextFallbackLanguage=this._fetchStatus.fallbackLanguageList.shift();// store the raw response
this._fetchStatus.rawResponses[this._fetchStatus.ajaxLang]=this._fetchStatus.lastResponse;this._fetchStatus.fetchingInstance=null;if(nextFallbackLanguage){this._fetchBundle(nextFallbackLanguage);}else{this._fetchBundle('');}}else{event.detail.error='empty response for '+this._fetchStatus.ajax.url;this._handleError(event);}},/**
     * Handle Ajax error response for a bundle.
     *
     * @param {Object} event `iron-ajax` error event.
     */_handleError:function _handleError(event){var nextFallbackLanguage;this._fetchStatus.fetchingInstance=null;if(this._fetchStatus.ajax.url.indexOf('/'+localesPath+'/bundle.')>=0){bundles[this._fetchStatus.ajaxLang]=bundles[this._fetchStatus.ajaxLang]||{};bundles[this._fetchStatus.ajaxLang].bundle=true;bundleFetchingInstances[this._fetchStatus.ajaxLang]=null;// falls back to its element-specific bundle
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
     */_forwardLangEvent:function _forwardLangEvent(event){//console.log('_forwardLangEvent ' + this.is + ' ' + event.detail.lang);
event.target.removeEventListener(event.type,this._forwardLangEventBindThis);if(this.lang===event.detail.lang){this.notifyPath('text',this._getBundle(this.lang));this.fire(event.type,event.detail);}else{this.lang=event.detail.lang;this.notifyPath('text',this._getBundle(this.lang));}},/**
     * Handle `bundle-fetched` event.
     *
     * @param {Object} event `bundle-fetched` event object.
     */_handleBundleFetched:function _handleBundleFetched(event){var detail=event.detail;//console.log('_handleBundleFetched ' + this.is + ' ' + detail.lang);
event.target.removeEventListener(event.type,this._handleBundleFetchedBindThis);if(this._fetchStatus.ajaxLang===detail.lang){this._fetchStatus.fetchingInstance=null;this._fetchBundle(this._fetchStatus.ajaxLang);}},/**
     * Handle changes of `observeHtmlLang` property.
     *
     * @param {Boolean} value Value of `observeHtmlLang`
     */_observeHtmlLangChanged:function _observeHtmlLangChanged(value){if(value){this._htmlLangObserver=this._htmlLangObserver||new MutationObserver(this._handleHtmlLangChange.bind(this));this._htmlLangObserver.observe(html,{attributes:true});}else{if(this._htmlLangObserver){this._htmlLangObserver.disconnect();}}},/**
     * MutationObserver callback of `<html lang>` attribute.
     *
     * @param {Array} mutations Array of MutationRecord (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
     */_handleHtmlLangChange:function _handleHtmlLangChange(mutations){mutations.forEach(function(mutation){switch(mutation.type){case'attributes':if(mutation.attributeName==='lang'){this.lang=html.lang;}break;default:break;}},this);},/**
     * Construct the text message bundle of the target locale with fallback of missing texts.
     *
     * @param {strings} lang Target locale.
     */_constructBundle:function _constructBundle(lang){var fallbackLanguageList=this._enumerateFallbackLanguages(lang);var bundle={};var raw;var baseLang;var id=this.is==='i18n-dom-bind'?this.id:this.is;var i;fallbackLanguageList.push('');for(i=0;i<fallbackLanguageList.length;i++){if(bundles[fallbackLanguageList[i]]&&bundles[fallbackLanguageList[i]][id]){break;}}fallbackLanguageList.splice(i+1,fallbackLanguageList.length);while((baseLang=fallbackLanguageList.pop())!==undefined){if(bundles[baseLang][id]){bundle=deepcopy(bundles[baseLang][id]);}else{raw=this._fetchStatus.rawResponses[baseLang];if(raw){this._deepMap(bundle,raw,function(text){return text;});}}}// store the constructed bundle
if(!bundles[lang]){bundles[lang]={};}bundles[lang][id]=bundle;},/**
     * Construct a pseudo-bundle for the target locale. (Not used for now)
     *
     * @param {string} lang Target locale.
     *//*
    _constructPseudoBundle: function (lang) {
      var bundle = {};
      var id = this.is === 'i18n-dom-bind' ? this.id : this.is;
      this._deepMap(bundle, bundles[''][id], function (value) {
        return typeof value === 'string' ? lang + ' ' + value : value;
      });
      bundles[lang] = bundles[lang] || {};
      bundles[lang][id] = bundle;
      return bundle;
    },
    *//**
     * Recursively map the source object onto the target object with the specified map function.
     * 
     * The method is used to merge a bundle into its fallback bundle.
     *
     * @param {Object} target Target object.
     * @param {Object} source Source object.
     * @param {Function} map Mapping function.
     */_deepMap:function _deepMap(target,source,map){var value;for(var prop in source){value=source[prop];switch(typeof value==='undefined'?'undefined':_typeof(value)){case'string':case'number':case'boolean':if((typeof target==='undefined'?'undefined':_typeof(target))==='object'){target[prop]=map(value,prop);}break;case'object':if((typeof target==='undefined'?'undefined':_typeof(target))==='object'){if(Array.isArray(value)){// TODO: cannot handle deep objects properly
target[prop]=target[prop]||[];this._deepMap(target[prop],value,map);}else{target[prop]=target[prop]||{};this._deepMap(target[prop],value,map);}}break;default:if((typeof target==='undefined'?'undefined':_typeof(target))==='object'){target[prop]=value;}break;}}},/**
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
     */_constructDefaultBundle:function _constructDefaultBundle(_template){var template;var id=this.is;if(this.is==='i18n-dom-bind'){template=_template||this;id=this.id;/* istanbul ignore if */if(template.content&&template.content.childNodes.length===0){// Find the real template in Internet Explorer 11 when i18n-dom-bind is concealed in a parent template
// This does not happen on Polymer 1.3.1 or later.  So ignore this 'if' statement in code coverage.
template=Array.prototype.map.call(document.querySelectorAll('template'),function(parentTemplate){return parentTemplate.content.querySelector('template#'+id+'[is="i18n-dom-bind"]');}).reduce(function(prev,current){return prev||current;});// Patch this.content with the real one
if(template){this.content=template.content;}}}else{template=_template||Polymer.DomModule.import(id,'template');}if(template){this.templateDefaultLang=template.hasAttribute('lang')?template.lang:'en';}else{this.templateDefaultLang='en';}var bundle={model:{}};var path=[];var templateDefaultLang=this.templateDefaultLang;var localizableText,jsonData;if(template){// register localizable attributes of the element itself
attributesRepository.registerLocalizableAttributes(id,template);if(template.getAttribute('localizable-text')==='embedded'){// pick up embedded JSON from the template
localizableText=template.content.querySelector('#localizable-text');if(localizableText){jsonData=localizableText.content.querySelector('json-data');if(jsonData){bundle=JSON.parse(jsonData.textContent);}else{console.error('<json-data> not found in <template id=\"localizable-text\">');}}else{console.error('<template id=\"localizable-text\"> not found');}}else{if(extraWhiteSpaceNode){template.setAttribute('strip-whitespace','');}// traverse template to generate bundle
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
     */_traverseAttributes:function _traverseAttributes(node,path,bundle){var name=node.nodeName.toLowerCase();var id=node.getAttribute?node.getAttribute('text-id')||node.getAttribute('id'):null;var text;var messageId;var attrId;var isLocalizable;var dummy;// pick up element attributes
Array.prototype.forEach.call(node.attributes,function(attribute){text=attribute.value;switch(attribute.name){case'id':case'text-id':case'is':case'lang':case'class':// verification required before removing these attributes
case'href':case'src':case'style':case'url':case'selected':break;default:if(!(isLocalizable=attributesRepository.isLocalizableAttribute(node,attribute.name))){break;}if(text.length===0){// skip empty value attribute
}else if(text.match(/^{{[^{}]*}}$/)||text.match(/^\[\[[^\[\]]*\]\]$/)){// skip annotation attribute
}else if(text.replace(/\n/g,' ').match(/^{.*}|\[.*\]$/g)&&!text.match(/^{{[^{}]*}}|\[\[[^\[\]]*\]\]/)&&!text.match(/{{[^{}]*}}|\[\[[^\[\]]*\]\]$/)){// generate message id
messageId=this._generateMessageId(path,id);try{//console.log(messageId + ' parsing attribute ' + attribute.name + ' = ' + text);
var value=JSON.parse(text.replace(/\n/g,' '));//console.log('parsed JSON object = ');
//console.log(value);
switch(typeof value==='undefined'?'undefined':_typeof(value)){case'string':case'number':case'object':// put into model
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
debuglog(attrId+' = '+JSON.stringify(parsed));this._setBundleValue(bundle,attrId,parsed);processed='';for(n=0;n<parsed.length;n++){if(parsed[n].match(/^{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]$/)){processed+=parsed[n];}else{processed+='{{'+attrId+'.'+n+'}}';}}if(isLocalizable==='$'&&!attribute.name.match(/\$$/)){dummy=document.createElement('span');dummy.innerHTML='<span '+attribute.name+'$="'+processed+'"></span>';node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());}else{attribute.value=processed;}}else{// Parameterize
parameterized=[''];while(parsed.length){if(parsed[0].match(/^{{[^{}]{1,}}}|\[\[[^\[\]]{1,}\]\]$/)){parameterized.push(parsed[0]);parameterized[0]+='{'+(parameterized.length-1)+'}';}else{parameterized[0]+=parsed[0];}parsed.shift();}debuglog(attrId+' = '+JSON.stringify(parameterized));this._setBundleValue(bundle,attrId,parameterized);processed='{{i18nFormat('+attrId+'.0';for(n=1;n<parameterized.length;n++){processed+=','+parameterized[n].replace(/^[{\[][{\[](.*)[}\]][}\]]$/,'$1');}processed+=')}}';if(isLocalizable==='$'&&!attribute.name.match(/\$$/)){dummy=document.createElement('span');dummy.innerHTML='<span '+attribute.name+'$="'+processed+'"></span>';node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());}else{attribute.value=processed;}}}else{// string attribute
messageId=this._generateMessageId(path,id);attrId=['model',messageId,attribute.name].join('.');debuglog(attrId+' = '+text);this._setBundleValue(bundle,attrId,text);if(isLocalizable==='$'&&!attribute.name.match(/\$$/)){dummy=document.createElement('span');dummy.innerHTML='<span '+attribute.name+'$='+'"{{'+attrId+'}}"'+'></span>';node.setAttributeNode(dummy.childNodes[0].attributes[0].cloneNode());}else{attribute.value='{{'+attrId+'}}';}}break;}},this);},/**
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
     */_traverseTemplateTree:function _traverseTemplateTree(node,path,bundle,index){var i;var whiteSpaceElements=0;var isWhiteSpace=false;var isCompoundAnnotatedNode=false;var text;var span;var name=node.nodeName.toLowerCase();var id=node.getAttribute?node.getAttribute('text-id')||node.getAttribute('id'):null;var messageId;var n;var templateText;var templateTextParams;path.push(id?'#'+id:name+(index>0?'_'+index:''));//console.log(path.join(':'));
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
if(extraWhiteSpaceNode){//if (node.hasAttribute('is') && node.getAttribute('is').match(/^(i18n-)?dom-/)) {
node.setAttribute('strip-whitespace','');//}
}this._traverseTemplateTree(node.content,path,bundle,0);break;default:// element node
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
}else{prev.text.push(textContent.replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' '));current.node.textContent='{{text.'+messageId+'.'+n+'}}';}span=document.createElement('span');span.setAttribute(paramAttribute,n.toString());current.templateNode.content.removeChild(current.node);span.appendChild(current.node);current.templateNode.content.appendChild(span);prev.params.push(current.templateNode);}}return prev;}.bind(this),{text:[''],params:['{{text.'+messageId+'.0}}']});templateText=document.createElement('i18n-format');templateText.setAttribute('lang','{{effectiveLang}}');span=document.createElement('span');// span.innerText does not set an effective value in Firefox
span.textContent=templateTextParams.params.shift();templateText.appendChild(span);Array.prototype.forEach.call(templateTextParams.params,function(param){templateText.appendChild(param);});// store the text message
templateTextParams.text[0]=templateTextParams.text[0].replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' ');this._setBundleValue(bundle,messageId,templateTextParams.text);// insert i18n-format
node.innerHTML='';Polymer.dom(node).appendChild(templateText);if(!id){//node.id = messageId;
//console.warn('add missing node id as ' + messageId + ' for ' + templateTextParams.text[0]);
}debuglog(messageId+' = '+templateTextParams.text);}else{// traverse childNodes
for(i=0;i<node.childNodes.length;i++){//console.log(path.join(':') + ':' + node.childNodes[i].nodeName + ':' + (i - whiteSpaceElements) + ' i = ' + i + ' whiteSpaceElements = ' + whiteSpaceElements);
if(this._traverseTemplateTree(node.childNodes[i],path,bundle,i-whiteSpaceElements)){whiteSpaceElements++;}}}}break;}break;case node.TEXT_NODE:// text node
text=node.textContent;if(text.length===0||text.match(/^\s*$/g)){// skip empty or whitespace node
isWhiteSpace=true;}else if(text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)){// skip annotation node
}else{var parent=node.parentNode;if(this._isCompoundAnnotatedText(text)){// apply i18n-format
n=0;messageId=this._generateMessageId(path,id);templateTextParams=Array.prototype.map.call([node],function(child){return this._compoundAnnotationToSpan(child).map(function(_child){return{node:_child,type:_child.nodeType,text:_child.nodeType===_child.TEXT_NODE?_child.textContent:null,childTextNode:_child.nodeType===_child.ELEMENT_NODE&&_child.childNodes.length>0};});}.bind(this)).reduce(function(prev,currentList){var current;for(var i=0;i<currentList.length;i++){current=currentList[i];if(current.text){prev.text[0]+=current.text;}if(current.type===current.node.ELEMENT_NODE){n++;prev.text[0]+='{'+n+'}';path.push(n);this._traverseAttributes(current.node,path,bundle);path.pop();/* current.childTextNode is always true since current.node is <span>{{annotation}}</span> */prev.text.push(current.node.textContent);current.node.setAttribute(paramAttribute,n.toString());prev.params.push(current.node);}}return prev;}.bind(this),{text:[''],params:['{{text.'+messageId+'.0}}']});templateText=document.createElement('i18n-format');templateText.setAttribute('lang','{{effectiveLang}}');span=document.createElement('span');// span.innerText does not set an effective value in Firefox
span.textContent=templateTextParams.params.shift();templateText.appendChild(span);Array.prototype.forEach.call(templateTextParams.params,function(param){templateText.appendChild(param);});// store the text message
templateTextParams.text[0]=templateTextParams.text[0].replace(/^[\s]*[\s]/,' ').replace(/[\s][\s]*$/,' ');this._setBundleValue(bundle,messageId,templateTextParams.text);// insert i18n-format
Polymer.dom(parent).insertBefore(templateText,node);Polymer.dom(parent).removeChild(node);debuglog(messageId+' = '+templateTextParams.text);}else{// generate message id
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
     */_isCompoundAnnotatedText:function _isCompoundAnnotatedText(text){return!text.trim().match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)&&!!text.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/);},/**
     * Check if the text has annotation 
     * 
     * @param {string} text target text to check annotation
     * @return {Boolean} true if the text contains annotation
     */_hasAnnotatedText:function _hasAnnotatedText(text){return!!text.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/);},/**
     * Convert compound annotations to span elements
     * 
     * @param {Text} node target text node to convert compound annotations
     * @return {Object[]} Array of Text or span elements
     */_compoundAnnotationToSpan:function _compoundAnnotationToSpan(node){var result;/* istanbul ignore else: node is prechecked to contain annotation(s) */if(node.textContent.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\])/)){result=node.textContent.match(/({{[^{}]*}}|\[\[[^\[\]]*\]\]|[^{}\[\]]{1,}|[{}\[\]]{1,})/g).reduce(function(prev,current){if(current.match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)){prev.push(current);prev.push('');}else{if(prev.length===0){prev.push(current);}else{prev[prev.length-1]+=current;}}return prev;}.bind(this),[]).map(function(item){var childNode;if(item.match(/^({{[^{}]*}}|\[\[[^\[\]]*\]\])$/)){childNode=document.createElement('span');childNode.textContent=item;}else if(item){childNode=document.createTextNode(item);}else{childNode=null;}return childNode;});if(result.length>0){if(!result[result.length-1]){result.pop();// pop null node for ''
}}}else{// no compound annotation
result=[node];}return result;},/**
     * Add the value to the target default bundle with the specified message Id 
     * 
     * @param {Object} bundle Default bundle.
     * @param {string} messageId ID string of the value.
     * @param {Object} value Value of the text message. Normally a string.
     */_setBundleValue:function _setBundleValue(bundle,messageId,value){var messageIdPath=messageId.split('.');bundle.model=bundle.model||{};if(messageIdPath.length===1){bundle[messageId]=value;}else{var cursor=bundle;for(var i=0;i<messageIdPath.length;i++){if(i<messageIdPath.length-1){cursor[messageIdPath[i]]=cursor[messageIdPath[i]]||{};cursor=cursor[messageIdPath[i]];}else{cursor[messageIdPath[i]]=value;}}}},/**
     * Generate a message ID from the specified path and id.
     * 
     * ### TODO: 
     *
     * - Shorten or optimize ids
     *
     * @param {Array} path List of ascestor elements of the current node in traversal.
     * @param {id} id Value of `id` or `text-id` attribute of the current node.
     */_generateMessageId:function _generateMessageId(path,id){var messageId;if(!id||id.length===0){for(var i=1;i<path.length;i++){if(path[i][0]==='#'){if(path[i]!=='#document-fragment'){if(messageId&&path[i].substr(0,5)==='#text'){messageId+=':'+path[i].substr(1);}else{messageId=path[i].substr(1);}}}else{if(messageId){messageId+=':'+path[i];}else{messageId=path[i];}}}}else{messageId=id;}return messageId;},/**
     * Merge `this.defaultText` into the target default bundle.
     * 
     * ### TODO: 
     *
     * - Need more research on the effective usage of this feature.
     *
     * @param {Object} bundle Default bundle.
     *//*
    _mergeDefaultText: function (bundle) {
      if (this.defaultText) {
        this._deepMap(bundle, this.defaultText, function (text) { return text; });
      }
    },
    *//**
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
     */or:function or(){var result=arguments[0];var i=1;while(!result&&i<arguments.length){result=arguments[i++];}return result;},/**
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
     */tr:function tr(key,table){if(table){if((typeof table==='undefined'?'undefined':_typeof(table))==='object'){if(typeof table[key]!=='undefined'){return table[key];}else if(typeof table['default']!=='undefined'){return table['default'];}else{return key;}}else{return key;}}else{return _typeof(this.text)==='object'&&typeof key!=='undefined'&&typeof this.text[key]!=='undefined'?this.text[key]:key;}},/**
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
     */i18nFormat:function i18nFormat(){if(arguments.length>0){var formatted=arguments[0]||'';for(var n=1;n<arguments.length;n++){formatted=formatted.replace('{'+n+'}',arguments[n]);}}return formatted;},// Lifecycle callbacks
/**
     * Lifecycle callback before registration of the custom element.
     *
     * The default bundle is constructed via traversal of the element's template at this timing per registration.
     *
     * ### Notes: 
     *
     * - For `i18n-dom-bind` elements, bundle construction is put off until `ready` lifecycle callback.
     * - As called twice per custom element registration, the method skips bundle construction at the second call.
     */beforeRegister:function beforeRegister(){if(this.is!=='i18n-dom-bind'){if(!this._templateLocalizable){this._templateLocalizable=this._constructDefaultBundle();}}},/**
     * Lifecycle callback at registration of the custom element.
     *
     * this._fetchStatus is initialized per registration.
     */registered:function registered(){if(this.is!=='i18n-dom-bind'){this._fetchStatus=deepcopy({// per custom element
fetchingInstance:null,ajax:null,ajaxLang:null,lastLang:null,fallbackLanguageList:null,targetLang:null,lastResponse:{},rawResponses:{}});}},/**
     * Lifecycle callback on instance creation
     */created:function created(){// Fix #34. [Polymer 1.4.0] _propertyEffects have to be maintained per instance
if(this.is==='i18n-dom-bind'){this._propertyEffects=deepcopy(this._propertyEffects);}if(!isStandardPropertyConfigurable){// Fix #36. Emulate lang's observer since Safari 7 predefines non-configurable lang property
this.observer=new MutationObserver(this._handleLangAttributeChange.bind(this));this.observer.observe(this,{attributes:true,attributeFilter:['lang'],attributeOldValue:true});}},/**
     * Lifecycle callback when the template children are ready.
     */ready:function ready(){if(this.is==='i18n-dom-bind'){if(!this._templateLocalizable){this._templateLocalizable=this._constructDefaultBundle();}if(!this._fetchStatus){this._fetchStatus=deepcopy({// per instance
fetchingInstance:null,ajax:null,ajaxLang:null,lastLang:null,fallbackLanguageList:null,targetLang:null,lastResponse:{},rawResponses:{}});}this._onDomChangeBindThis=this._onDomChange.bind(this);this.addEventListener('dom-change',this._onDomChangeBindThis);// Fix #34. [Polymer 1.4.0] Supply an empty object if this.__data__ is undefined
this.__data__=this.__data__||Object.create(null);}else{if(!isStandardPropertyConfigurable){// Fix #36. Patch missing properties except for lang
for(var p in this._propertyEffects){if(this._propertyEffects[p]&&!Object.getOwnPropertyDescriptor(this,p)){//console.log('ready: creating accessors for ' + p);
Polymer.Bind._createAccessors(this,p,this._propertyEffects[p]);}}}this._langChanged(this.getAttribute('lang'),undefined);// model per instance
this.model=deepcopy(this.text.model);}},/**
     * attached lifecycle callback.
     */attached:function attached(){if(this.is==='i18n-dom-bind'){if(this._properties){// Fix #35. [IE10] Restore properties for use in rendering
this.properties=this._properties;delete this._properties;}}if(this.observeHtmlLang){this.lang=html.lang;// TODO: this call is redundant
this._observeHtmlLangChanged(true);}},/**
     * Handle `dom-change` event for `i18n-dom-bind`
     */_onDomChange:function _onDomChange(){// Fix #16: [IE11][Polymer 1.3.0] On IE11, i18n-dom-bind does not work with Polymer 1.3.0
// Patch the broken lang property accessors manually if it is missing
// Fix #34: [IE11][Polymer 1.4.0] Create missing property accessors including lang
for(var p in this._propertyEffects){if(this._propertyEffects[p]&&!Object.getOwnPropertyDescriptor(this,p)){Polymer.Bind._createAccessors(this,p,this._propertyEffects[p]);}}this.removeEventListener('dom-change',this._onDomChangeBindThis);if(this.text&&this.text.model){this.model=deepcopy(this.text.model);}// Fix #17: [Polymer 1.3.0] observeHtmlLang is undefined in i18n-dom-bind
// Explicitly initialize observeHtmlLang if the value is undefined.
if(typeof this.observeHtmlLang==='undefined'&&!this.hasAttribute('observe-html-lang')){this.observeHtmlLang=true;}if(this.observeHtmlLang){this.lang=html.lang;this._observeHtmlLangChanged(true);}},/**
     * detached lifecycle callback
     */detached:function detached(){if(this.observeHtmlLang){this._observeHtmlLangChanged(false);}}};// Fix #36. Rename lang property as _lang to avoid conflict with the predefined lang property
if(!isStandardPropertyConfigurable){var _properties=Object.create(null);for(var p in BehaviorsStore.I18nBehavior.properties){if(p==='lang'){_properties._lang=BehaviorsStore.I18nBehavior.properties.lang;}else{_properties[p]=BehaviorsStore.I18nBehavior.properties[p];}}BehaviorsStore.I18nBehavior.properties=_properties;BehaviorsStore.I18nBehavior.properties._lang.reflectToAttribute=false;BehaviorsStore.I18nBehavior.properties.text.computed='_getBundle(_lang)';BehaviorsStore.I18nBehavior._updateEffectiveLang=function(){if(!Polymer.Element&&Polymer.dom(event).rootTarget===this||Polymer.Element&&event.composedPath()[0]===this){console.log('lang-updated: _updateEffectiveLang: assigning effectiveLang = '+this._lang);this.effectiveLang=this._lang;}};BehaviorsStore.I18nBehavior.hostAttributes={'lang':''//defaultLang
};}if(Polymer.Element&&Polymer.Element.name==='PolymerElement'){// Polymer 2.x
}else{// Polymer 1.x
/**
   * `<template is="i18n-dom-bind">` element extends `dom-bind` template element with `I18nBehavior`
   *
   * @group I18nBehavior
   * @element i18n-dom-bind
   */var i18nBehaviorDomBind={};Polymer.Base.extend(i18nBehaviorDomBind,BehaviorsStore.I18nBehavior);var i18nDomBind={};var domBind=document.createElement('template','dom-bind');var domBindProto=Object.getPrototypeOf(domBind);if(typeof domBindProto.render!=='function'){domBindProto=domBind.__proto__;// fallback for IE10
}Polymer.Base.extend(i18nDomBind,domBindProto);i18nDomBind.is='i18n-dom-bind';if(!navigator.language&&navigator.browserLanguage){// Detect IE10
// Fix #35. [IE10] Hide properties until attached phase in IE10
// to avoid exceptions in overriding unconfigurable properties in Object.defineProperty
i18nBehaviorDomBind._properties=i18nBehaviorDomBind.properties;i18nBehaviorDomBind.properties=Object.create(null);}/* As of Polymer 1.3.1, dom-bind does not have predefined behaviors *//* istanbul ignore if */if(i18nDomBind.behaviors){i18nDomBind.behaviors.push(i18nBehaviorDomBind);}else{i18nDomBind.behaviors=[i18nBehaviorDomBind];}var _Polymer=Polymer;_Polymer(i18nDomBind);}})(document);Polymer.Utils=Polymer.Utils||{};Polymer.Utils.MixinBehavior=function(behavior,Base){var utils=Polymer.Utils;var metaProps={attached:true,detached:true,ready:true,created:true,beforeRegister:true,registered:true,attributeChanged:true,// meta objects
behaviors:true,hostAttributes:true,properties:true,observers:true,listeners:true};var config={properties:behavior.properties,observers:behavior.observers};var PolymerGenerated=function(_Base2){_inherits(PolymerGenerated,_Base2);_createClass(PolymerGenerated,[{key:'_invokeFunction',value:function _invokeFunction(fn,args){if(fn){fn.apply(this,args);}}}],[{key:'config',get:function get(){return config;}}]);function PolymerGenerated(){_classCallCheck(this,PolymerGenerated);// call `registered` only if it was not called for *this* constructor
var _this22=_possibleConstructorReturn(this,(PolymerGenerated.__proto__||Object.getPrototypeOf(PolymerGenerated)).call(this));if(!PolymerGenerated.hasOwnProperty('__registered')){PolymerGenerated.__registered=true;if(behavior.registered){behavior.registered.call(Object.getPrototypeOf(_this22));}}return _this22;}_createClass(PolymerGenerated,[{key:'created',value:function created(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'created',this).call(this);this._invokeFunction(behavior.created);}},{key:'_applyConfigMetaData',value:function _applyConfigMetaData(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'_applyConfigMetaData',this).call(this);this._applyConfigMetaDataFrom(behavior);}},{key:'_applyListeners',value:function _applyListeners(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'_applyListeners',this).call(this);this._applyConfigListeners(behavior);}},{key:'_ensureAttributes',value:function _ensureAttributes(){// ensure before calling super so that subclasses can override defaults
this._ensureConfigAttributes(behavior);_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'_ensureAttributes',this).call(this);}},{key:'ready',value:function ready(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'ready',this).call(this);this._invokeFunction(behavior.ready);}},{key:'attached',value:function attached(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'attached',this).call(this);this._invokeFunction(behavior.attached);}},{key:'detached',value:function detached(){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'detached',this).call(this);this._invokeFunction(behavior.detached);}},{key:'attributeChanged',value:function attributeChanged(name,old,value){_get(PolymerGenerated.prototype.__proto__||Object.getPrototypeOf(PolymerGenerated.prototype),'attributeChanged',this).call(this,name,old,value);this._invokeFunction(behavior.attributeChanged,[name,old,value]);}}]);return PolymerGenerated;}(Base);for(var p in behavior){if(!(p in metaProps))utils.copyOwnProperty(p,behavior,PolymerGenerated.prototype);}return PolymerGenerated;};// Globally expose base elements and mixins
window.BaseElements=window.BaseElements||{};window.Mixins=window.Mixins||{};// Localizable mixin
Mixins.Localizable=function(base){return function(_Polymer$Utils$MixinB){_inherits(Localizable,_Polymer$Utils$MixinB);function Localizable(){_classCallCheck(this,Localizable);Localizable.template;return _possibleConstructorReturn(this,(Localizable.__proto__||Object.getPrototypeOf(Localizable)).call(this));}_createClass(Localizable,[{key:'is',get:function get(){return this.constructor.is;}}],[{key:'_uncamelCase',value:function _uncamelCase(name){return name// insert a hyphen between lower & upper
.replace(/([a-z0-9])([A-Z])/g,'$1 $2')// space before last upper in a sequence followed by lower
.replace(/\b([A-Z]+)([A-Z])([a-z0-9])/,'$1 $2$3')// replace spaces with hyphens
.replace(/ /g,'-')// lowercase
.toLowerCase();}},{key:'_i18nPreprocess',value:function _i18nPreprocess(template){if(this.is&&template&&!this._templateLocalizable){this._templateLocalizable=this.prototype._constructDefaultBundle(template);}return template;}},{key:'_rawTemplate',get:function get(){var id=this.is;if(!id&&this.name&&this.name!=='Localizable'){id=this.is=this._uncamelCase(this.name);}var template=_get(Localizable.__proto__||Object.getPrototypeOf(Localizable),'template',this);if(id&&!template){var current=HTMLImports.useNative?document.currentScript:document._currentScript;template=(current?current.ownerDocument.querySelector('template[id='+id+']'):null)||document.querySelector('template[id='+id+']');if(template){var domModule=document.createElement('dom-module');var assetUrl=new URL(current.baseURI||window.currentImport.baseURI);domModule.appendChild(template);domModule.setAttribute('assetpath',assetUrl.pathname.indexOf('.vulcanized.')<0?assetUrl.pathname:template.hasAttribute('assetpath')?template.getAttribute('assetpath'):assetUrl.pathname);domModule.register(id);this._template=template;}}return template;}},{key:'template',get:function get(){return this._i18nPreprocess(this._rawTemplate);}},{key:'_templateLocalizable',get:function get(){return this.hasOwnProperty('__templateLocalizable');},set:function set(value){this.__templateLocalizable=value;}}]);return Localizable;}(Polymer.Utils.MixinBehavior(BehaviorsStore.I18nBehavior,base));};Mixins.I18nBehavior=function(info){return Mixins.Localizable(Polymer.Class(info));};// Logger mixin
Mixins.Logger=function(base){return function(_base){_inherits(_class,_base);function _class(){_classCallCheck(this,_class);return _possibleConstructorReturn(this,(_class.__proto__||Object.getPrototypeOf(_class)).apply(this,arguments));}_createClass(_class,[{key:'connectedCallback',value:function connectedCallback(){_get(_class.prototype.__proto__||Object.getPrototypeOf(_class.prototype),'connectedCallback',this).call(this);console.log('<'+Object.getPrototypeOf(this).constructor.is+'>: '+'id = '+this.id+', '+'this.text = '+JSON.stringify(this.text,null,2));console.log('Preprocessed template = \n',Object.getPrototypeOf(this).constructor.template);}}]);return _class;}(base);};// I18N Base Element
Object.defineProperty(BaseElements,'I18nElement',{get:function get(){return Mixins.I18nBehavior(Polymer.LegacyElement);}});var LocalizableElement=function(_Mixins$Logger){_inherits(LocalizableElement,_Mixins$Logger);function LocalizableElement(){_classCallCheck(this,LocalizableElement);return _possibleConstructorReturn(this,(LocalizableElement.__proto__||Object.getPrototypeOf(LocalizableElement)).apply(this,arguments));}_createClass(LocalizableElement,null,[{key:'is',get:function get(){return'localizable-element';}}]);return LocalizableElement;}(Mixins.Logger(Mixins.Localizable(Polymer.LegacyElement)));customElements.define(LocalizableElement.is,LocalizableElement);var I18nSubclassElement=function(_Mixins$Logger2){_inherits(I18nSubclassElement,_Mixins$Logger2);function I18nSubclassElement(){_classCallCheck(this,I18nSubclassElement);return _possibleConstructorReturn(this,(I18nSubclassElement.__proto__||Object.getPrototypeOf(I18nSubclassElement)).apply(this,arguments));}_createClass(I18nSubclassElement,[{key:'_langUpdated',value:function _langUpdated(){this.model=deepcopy(this.text.model);}}],[{key:'is',get:function get(){return'i18n-subclass-element';}},{key:'config',get:function get(){return{listeners:{'lang-updated':'_langUpdated'}};}}]);return I18nSubclassElement;}(Mixins.Logger(BaseElements.I18nElement));customElements.define(I18nSubclassElement.is,I18nSubclassElement);Polymer(Mixins.I18nBehavior({is:'i18n-legacy-element'}));
//# sourceMappingURL=pocbabelvulcanized/imports.js.map
