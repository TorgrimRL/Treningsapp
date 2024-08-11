import{a as u3}from"/build/_shared/chunk-VQOUZTVV.js";import{d as t1,f as C3}from"/build/_shared/chunk-DLUJ32DX.js";function m1(c,a){var e=Object.keys(c);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(c);a&&(r=r.filter(function(s){return Object.getOwnPropertyDescriptor(c,s).enumerable})),e.push.apply(e,r)}return e}function m(c){for(var a=1;a<arguments.length;a++){var e=arguments[a]!=null?arguments[a]:{};a%2?m1(Object(e),!0).forEach(function(r){x(c,r,e[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(c,Object.getOwnPropertyDescriptors(e)):m1(Object(e)).forEach(function(r){Object.defineProperty(c,r,Object.getOwnPropertyDescriptor(e,r))})}return c}function d2(c){return d2=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(a){return typeof a}:function(a){return a&&typeof Symbol=="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},d2(c)}function L3(c,a){if(!(c instanceof a))throw new TypeError("Cannot call a class as a function")}function H1(c,a){for(var e=0;e<a.length;e++){var r=a[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(c,r.key,r)}}function d3(c,a,e){return a&&H1(c.prototype,a),e&&H1(c,e),Object.defineProperty(c,"prototype",{writable:!1}),c}function x(c,a,e){return a in c?Object.defineProperty(c,a,{value:e,enumerable:!0,configurable:!0,writable:!0}):c[a]=e,c}function X2(c,a){return x3(c)||b3(c,a)||R1(c,a)||k3()}function l2(c){return g3(c)||N3(c)||R1(c)||S3()}function g3(c){if(Array.isArray(c))return D2(c)}function x3(c){if(Array.isArray(c))return c}function N3(c){if(typeof Symbol<"u"&&c[Symbol.iterator]!=null||c["@@iterator"]!=null)return Array.from(c)}function b3(c,a){var e=c==null?null:typeof Symbol<"u"&&c[Symbol.iterator]||c["@@iterator"];if(e!=null){var r=[],s=!0,i=!1,f,n;try{for(e=e.call(c);!(s=(f=e.next()).done)&&(r.push(f.value),!(a&&r.length===a));s=!0);}catch(l){i=!0,n=l}finally{try{!s&&e.return!=null&&e.return()}finally{if(i)throw n}}return r}}function R1(c,a){if(c){if(typeof c=="string")return D2(c,a);var e=Object.prototype.toString.call(c).slice(8,-1);if(e==="Object"&&c.constructor&&(e=c.constructor.name),e==="Map"||e==="Set")return Array.from(c);if(e==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return D2(c,a)}}function D2(c,a){(a==null||a>c.length)&&(a=c.length);for(var e=0,r=new Array(a);e<a;e++)r[e]=c[e];return r}function S3(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function k3(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var z1=function(){},Y2={},E1={},U1=null,O1={mark:z1,measure:z1};try{typeof window<"u"&&(Y2=window),typeof document<"u"&&(E1=document),typeof MutationObserver<"u"&&(U1=MutationObserver),typeof performance<"u"&&(O1=performance)}catch{}var w3=Y2.navigator||{},v1=w3.userAgent,V1=v1===void 0?"":v1,U=Y2,p=E1,h1=U1,m2=O1,H6=!!U.document,D=!!p.documentElement&&!!p.head&&typeof p.addEventListener=="function"&&typeof p.createElement=="function",q1=~V1.indexOf("MSIE")||~V1.indexOf("Trident/"),H2,z2,v2,V2,h2,T="___FONT_AWESOME___",R2=16,W1="fa",I1="svg-inline--fa",j="data-fa-i2svg",E2="data-fa-pseudo-element",y3="data-fa-pseudo-element-pending",$2="data-prefix",Q2="data-icon",M1="fontawesome-i2svg",A3="async",P3=["HTML","HEAD","STYLE","SCRIPT"],G1=function(){try{return!0}catch{return!1}}(),M="classic",C="sharp",K2=[M,C];function o2(c){return new Proxy(c,{get:function(e,r){return r in e?e[r]:e[M]}})}var r2=o2((H2={},x(H2,M,{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fad:"duotone","fa-duotone":"duotone",fab:"brands","fa-brands":"brands",fak:"kit",fakd:"kit","fa-kit":"kit","fa-kit-duotone":"kit"}),x(H2,C,{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"}),H2)),s2=o2((z2={},x(z2,M,{solid:"fas",regular:"far",light:"fal",thin:"fat",duotone:"fad",brands:"fab",kit:"fak"}),x(z2,C,{solid:"fass",regular:"fasr",light:"fasl",thin:"fast"}),z2)),i2=o2((v2={},x(v2,M,{fab:"fa-brands",fad:"fa-duotone",fak:"fa-kit",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"}),x(v2,C,{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"}),v2)),T3=o2((V2={},x(V2,M,{"fa-brands":"fab","fa-duotone":"fad","fa-kit":"fak","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"}),x(V2,C,{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"}),V2)),B3=/fa(s|r|l|t|d|b|k|ss|sr|sl|st)?[\-\ ]/,_1="fa-layers-text",F3=/Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp|Kit)?.*/i,D3=o2((h2={},x(h2,M,{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"}),x(h2,C,{900:"fass",400:"fasr",300:"fasl",100:"fast"}),h2)),j1=[1,2,3,4,5,6,7,8,9,10],R3=j1.concat([11,12,13,14,15,16,17,18,19,20]),E3=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],G={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},f2=new Set;Object.keys(s2[M]).map(f2.add.bind(f2));Object.keys(s2[C]).map(f2.add.bind(f2));var U3=[].concat(K2,l2(f2),["2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","fw","inverse","layers-counter","layers-text","layers","li","pull-left","pull-right","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul",G.GROUP,G.SWAP_OPACITY,G.PRIMARY,G.SECONDARY]).concat(j1.map(function(c){return"".concat(c,"x")})).concat(R3.map(function(c){return"w-".concat(c)})),a2=U.FontAwesomeConfig||{};function O3(c){var a=p.querySelector("script["+c+"]");if(a)return a.getAttribute(c)}function q3(c){return c===""?!0:c==="false"?!1:c==="true"?!0:c}p&&typeof p.querySelector=="function"&&(p1=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-auto-a11y","autoA11y"],["data-search-pseudo-elements","searchPseudoElements"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]],p1.forEach(function(c){var a=X2(c,2),e=a[0],r=a[1],s=q3(O3(e));s!=null&&(a2[r]=s)}));var p1,X1={styleDefault:"solid",familyDefault:"classic",cssPrefix:W1,replacementClass:I1,autoReplaceSvg:!0,autoAddCss:!0,autoA11y:!0,searchPseudoElements:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};a2.familyPrefix&&(a2.cssPrefix=a2.familyPrefix);var K=m(m({},X1),a2);K.autoReplaceSvg||(K.observeMutations=!1);var z={};Object.keys(X1).forEach(function(c){Object.defineProperty(z,c,{enumerable:!0,set:function(e){K[c]=e,e2.forEach(function(r){return r(z)})},get:function(){return K[c]}})});Object.defineProperty(z,"familyPrefix",{enumerable:!0,set:function(a){K.cssPrefix=a,e2.forEach(function(e){return e(z)})},get:function(){return K.cssPrefix}});U.FontAwesomeConfig=z;var e2=[];function W3(c){return e2.push(c),function(){e2.splice(e2.indexOf(c),1)}}var E=R2,A={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function I3(c){if(!(!c||!D)){var a=p.createElement("style");a.setAttribute("type","text/css"),a.innerHTML=c;for(var e=p.head.childNodes,r=null,s=e.length-1;s>-1;s--){var i=e[s],f=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(f)>-1&&(r=i)}return p.head.insertBefore(a,r),c}}var G3="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function n2(){for(var c=12,a="";c-- >0;)a+=G3[Math.random()*62|0];return a}function J(c){for(var a=[],e=(c||[]).length>>>0;e--;)a[e]=c[e];return a}function J2(c){return c.classList?J(c.classList):(c.getAttribute("class")||"").split(" ").filter(function(a){return a})}function Y1(c){return"".concat(c).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function _3(c){return Object.keys(c||{}).reduce(function(a,e){return a+"".concat(e,'="').concat(Y1(c[e]),'" ')},"").trim()}function N2(c){return Object.keys(c||{}).reduce(function(a,e){return a+"".concat(e,": ").concat(c[e].trim(),";")},"")}function Z2(c){return c.size!==A.size||c.x!==A.x||c.y!==A.y||c.rotate!==A.rotate||c.flipX||c.flipY}function j3(c){var a=c.transform,e=c.containerWidth,r=c.iconWidth,s={transform:"translate(".concat(e/2," 256)")},i="translate(".concat(a.x*32,", ").concat(a.y*32,") "),f="scale(".concat(a.size/16*(a.flipX?-1:1),", ").concat(a.size/16*(a.flipY?-1:1),") "),n="rotate(".concat(a.rotate," 0 0)"),l={transform:"".concat(i," ").concat(f," ").concat(n)},t={transform:"translate(".concat(r/2*-1," -256)")};return{outer:s,inner:l,path:t}}function X3(c){var a=c.transform,e=c.width,r=e===void 0?R2:e,s=c.height,i=s===void 0?R2:s,f=c.startCentered,n=f===void 0?!1:f,l="";return n&&q1?l+="translate(".concat(a.x/E-r/2,"em, ").concat(a.y/E-i/2,"em) "):n?l+="translate(calc(-50% + ".concat(a.x/E,"em), calc(-50% + ").concat(a.y/E,"em)) "):l+="translate(".concat(a.x/E,"em, ").concat(a.y/E,"em) "),l+="scale(".concat(a.size/E*(a.flipX?-1:1),", ").concat(a.size/E*(a.flipY?-1:1),") "),l+="rotate(".concat(a.rotate,"deg) "),l}var Y3=`:root, :host {
  --fa-font-solid: normal 900 1em/1 "Font Awesome 6 Solid";
  --fa-font-regular: normal 400 1em/1 "Font Awesome 6 Regular";
  --fa-font-light: normal 300 1em/1 "Font Awesome 6 Light";
  --fa-font-thin: normal 100 1em/1 "Font Awesome 6 Thin";
  --fa-font-duotone: normal 900 1em/1 "Font Awesome 6 Duotone";
  --fa-font-sharp-solid: normal 900 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-regular: normal 400 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-light: normal 300 1em/1 "Font Awesome 6 Sharp";
  --fa-font-sharp-thin: normal 100 1em/1 "Font Awesome 6 Sharp";
  --fa-font-brands: normal 400 1em/1 "Font Awesome 6 Brands";
}

svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
  overflow: visible;
  box-sizing: content-box;
}

.svg-inline--fa {
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285705em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left {
  margin-right: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-pull-right {
  margin-left: var(--fa-pull-margin, 0.3em);
  width: auto;
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  top: 0.25em;
}
.svg-inline--fa.fa-fw {
  width: var(--fa-fw-width, 1.25em);
}

.fa-layers svg.svg-inline--fa {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: 1em;
}
.fa-layers svg.svg-inline--fa {
  -webkit-transform-origin: center center;
          transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
  -webkit-transform-origin: center center;
          transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  -webkit-transform: scale(var(--fa-counter-scale, 0.25));
          transform: scale(var(--fa-counter-scale, 0.25));
  -webkit-transform-origin: top right;
          transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: bottom right;
          transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: bottom left;
          transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: top right;
          transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  -webkit-transform: scale(var(--fa-layers-scale, 0.25));
          transform: scale(var(--fa-layers-scale, 0.25));
  -webkit-transform-origin: top left;
          transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: 0.625em;
  line-height: 0.1em;
  vertical-align: 0.225em;
}

.fa-xs {
  font-size: 0.75em;
  line-height: 0.0833333337em;
  vertical-align: 0.125em;
}

.fa-sm {
  font-size: 0.875em;
  line-height: 0.0714285718em;
  vertical-align: 0.0535714295em;
}

.fa-lg {
  font-size: 1.25em;
  line-height: 0.05em;
  vertical-align: -0.075em;
}

.fa-xl {
  font-size: 1.5em;
  line-height: 0.0416666682em;
  vertical-align: -0.125em;
}

.fa-2xl {
  font-size: 2em;
  line-height: 0.03125em;
  vertical-align: -0.1875em;
}

.fa-fw {
  text-align: center;
  width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-left: var(--fa-li-margin, 2.5em);
  padding-left: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  left: calc(var(--fa-li-width, 2em) * -1);
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.08em);
  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);
}

.fa-pull-left {
  float: left;
  margin-right: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right {
  float: right;
  margin-left: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  -webkit-animation-name: fa-beat;
          animation-name: fa-beat;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);
          animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  -webkit-animation-name: fa-bounce;
          animation-name: fa-bounce;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  -webkit-animation-name: fa-fade;
          animation-name: fa-fade;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  -webkit-animation-name: fa-beat-fade;
          animation-name: fa-beat-fade;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  -webkit-animation-name: fa-flip;
          animation-name: fa-flip;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);
          animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  -webkit-animation-name: fa-shake;
          animation-name: fa-shake;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, linear);
          animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  -webkit-animation-name: fa-spin;
          animation-name: fa-spin;
  -webkit-animation-delay: var(--fa-animation-delay, 0s);
          animation-delay: var(--fa-animation-delay, 0s);
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 2s);
          animation-duration: var(--fa-animation-duration, 2s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, linear);
          animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  -webkit-animation-name: fa-spin;
          animation-name: fa-spin;
  -webkit-animation-direction: var(--fa-animation-direction, normal);
          animation-direction: var(--fa-animation-direction, normal);
  -webkit-animation-duration: var(--fa-animation-duration, 1s);
          animation-duration: var(--fa-animation-duration, 1s);
  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);
          animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  -webkit-animation-timing-function: var(--fa-animation-timing, steps(8));
          animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
.fa-bounce,
.fa-fade,
.fa-beat-fade,
.fa-flip,
.fa-pulse,
.fa-shake,
.fa-spin,
.fa-spin-pulse {
    -webkit-animation-delay: -1ms;
            animation-delay: -1ms;
    -webkit-animation-duration: 1ms;
            animation-duration: 1ms;
    -webkit-animation-iteration-count: 1;
            animation-iteration-count: 1;
    -webkit-transition-delay: 0s;
            transition-delay: 0s;
    -webkit-transition-duration: 0s;
            transition-duration: 0s;
  }
}
@-webkit-keyframes fa-beat {
  0%, 90% {
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  45% {
    -webkit-transform: scale(var(--fa-beat-scale, 1.25));
            transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-beat {
  0%, 90% {
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  45% {
    -webkit-transform: scale(var(--fa-beat-scale, 1.25));
            transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@-webkit-keyframes fa-bounce {
  0% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  10% {
    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  100% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-bounce {
  0% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  10% {
    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
  100% {
    -webkit-transform: scale(1, 1) translateY(0);
            transform: scale(1, 1) translateY(0);
  }
}
@-webkit-keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@-webkit-keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  50% {
    opacity: 1;
    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));
            transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    -webkit-transform: scale(1);
            transform: scale(1);
  }
  50% {
    opacity: 1;
    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));
            transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@-webkit-keyframes fa-flip {
  50% {
    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-flip {
  50% {
    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@-webkit-keyframes fa-shake {
  0% {
    -webkit-transform: rotate(-15deg);
            transform: rotate(-15deg);
  }
  4% {
    -webkit-transform: rotate(15deg);
            transform: rotate(15deg);
  }
  8%, 24% {
    -webkit-transform: rotate(-18deg);
            transform: rotate(-18deg);
  }
  12%, 28% {
    -webkit-transform: rotate(18deg);
            transform: rotate(18deg);
  }
  16% {
    -webkit-transform: rotate(-22deg);
            transform: rotate(-22deg);
  }
  20% {
    -webkit-transform: rotate(22deg);
            transform: rotate(22deg);
  }
  32% {
    -webkit-transform: rotate(-12deg);
            transform: rotate(-12deg);
  }
  36% {
    -webkit-transform: rotate(12deg);
            transform: rotate(12deg);
  }
  40%, 100% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
}
@keyframes fa-shake {
  0% {
    -webkit-transform: rotate(-15deg);
            transform: rotate(-15deg);
  }
  4% {
    -webkit-transform: rotate(15deg);
            transform: rotate(15deg);
  }
  8%, 24% {
    -webkit-transform: rotate(-18deg);
            transform: rotate(-18deg);
  }
  12%, 28% {
    -webkit-transform: rotate(18deg);
            transform: rotate(18deg);
  }
  16% {
    -webkit-transform: rotate(-22deg);
            transform: rotate(-22deg);
  }
  20% {
    -webkit-transform: rotate(22deg);
            transform: rotate(22deg);
  }
  32% {
    -webkit-transform: rotate(-12deg);
            transform: rotate(-12deg);
  }
  36% {
    -webkit-transform: rotate(12deg);
            transform: rotate(12deg);
  }
  40%, 100% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
}
@-webkit-keyframes fa-spin {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}
@keyframes fa-spin {
  0% {
    -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  -webkit-transform: rotate(90deg);
          transform: rotate(90deg);
}

.fa-rotate-180 {
  -webkit-transform: rotate(180deg);
          transform: rotate(180deg);
}

.fa-rotate-270 {
  -webkit-transform: rotate(270deg);
          transform: rotate(270deg);
}

.fa-flip-horizontal {
  -webkit-transform: scale(-1, 1);
          transform: scale(-1, 1);
}

.fa-flip-vertical {
  -webkit-transform: scale(1, -1);
          transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  -webkit-transform: scale(-1, -1);
          transform: scale(-1, -1);
}

.fa-rotate-by {
  -webkit-transform: rotate(var(--fa-rotate-angle, 0));
          transform: rotate(var(--fa-rotate-angle, 0));
}

.fa-stack {
  display: inline-block;
  vertical-align: middle;
  height: 2em;
  position: relative;
  width: 2.5em;
}

.fa-stack-1x,
.fa-stack-2x {
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  z-index: var(--fa-stack-z-index, auto);
}

.svg-inline--fa.fa-stack-1x {
  height: 1em;
  width: 1.25em;
}
.svg-inline--fa.fa-stack-2x {
  height: 2em;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.sr-only,
.fa-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:not(:focus),
.fa-sr-only-focusable:not(:focus) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.fad.fa-inverse,
.fa-duotone.fa-inverse {
  color: var(--fa-inverse, #fff);
}`;function $1(){var c=W1,a=I1,e=z.cssPrefix,r=z.replacementClass,s=Y3;if(e!==c||r!==a){var i=new RegExp("\\.".concat(c,"\\-"),"g"),f=new RegExp("\\--".concat(c,"\\-"),"g"),n=new RegExp("\\.".concat(a),"g");s=s.replace(i,".".concat(e,"-")).replace(f,"--".concat(e,"-")).replace(n,".".concat(r))}return s}var C1=!1;function P2(){z.autoAddCss&&!C1&&(I3($1()),C1=!0)}var $3={mixout:function(){return{dom:{css:$1,insertCss:P2}}},hooks:function(){return{beforeDOMElementCreation:function(){P2()},beforeI2svg:function(){P2()}}}},B=U||{};B[T]||(B[T]={});B[T].styles||(B[T].styles={});B[T].hooks||(B[T].hooks={});B[T].shims||(B[T].shims=[]);var y=B[T],Q1=[],Q3=function c(){p.removeEventListener("DOMContentLoaded",c),g2=1,Q1.map(function(a){return a()})},g2=!1;D&&(g2=(p.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(p.readyState),g2||p.addEventListener("DOMContentLoaded",Q3));function K3(c){D&&(g2?setTimeout(c,0):Q1.push(c))}function t2(c){var a=c.tag,e=c.attributes,r=e===void 0?{}:e,s=c.children,i=s===void 0?[]:s;return typeof c=="string"?Y1(c):"<".concat(a," ").concat(_3(r),">").concat(i.map(t2).join(""),"</").concat(a,">")}function u1(c,a,e){if(c&&c[a]&&c[a][e])return{prefix:a,iconName:e,icon:c[a][e]}}var J3=function(a,e){return function(r,s,i,f){return a.call(e,r,s,i,f)}},T2=function(a,e,r,s){var i=Object.keys(a),f=i.length,n=s!==void 0?J3(e,s):e,l,t,o;for(r===void 0?(l=1,o=a[i[0]]):(l=0,o=r);l<f;l++)t=i[l],o=n(o,a[t],t,a);return o};function Z3(c){for(var a=[],e=0,r=c.length;e<r;){var s=c.charCodeAt(e++);if(s>=55296&&s<=56319&&e<r){var i=c.charCodeAt(e++);(i&64512)==56320?a.push(((s&1023)<<10)+(i&1023)+65536):(a.push(s),e--)}else a.push(s)}return a}function U2(c){var a=Z3(c);return a.length===1?a[0].toString(16):null}function c4(c,a){var e=c.length,r=c.charCodeAt(a),s;return r>=55296&&r<=56319&&e>a+1&&(s=c.charCodeAt(a+1),s>=56320&&s<=57343)?(r-55296)*1024+s-56320+65536:r}function L1(c){return Object.keys(c).reduce(function(a,e){var r=c[e],s=!!r.icon;return s?a[r.iconName]=r.icon:a[e]=r,a},{})}function O2(c,a){var e=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},r=e.skipHooks,s=r===void 0?!1:r,i=L1(a);typeof y.hooks.addPack=="function"&&!s?y.hooks.addPack(c,L1(a)):y.styles[c]=m(m({},y.styles[c]||{}),i),c==="fas"&&O2("fa",a)}var M2,p2,C2,Y=y.styles,a4=y.shims,e4=(M2={},x(M2,M,Object.values(i2[M])),x(M2,C,Object.values(i2[C])),M2),c1=null,K1={},J1={},Z1={},c3={},a3={},r4=(p2={},x(p2,M,Object.keys(r2[M])),x(p2,C,Object.keys(r2[C])),p2);function s4(c){return~U3.indexOf(c)}function i4(c,a){var e=a.split("-"),r=e[0],s=e.slice(1).join("-");return r===c&&s!==""&&!s4(s)?s:null}var e3=function(){var a=function(i){return T2(Y,function(f,n,l){return f[l]=T2(n,i,{}),f},{})};K1=a(function(s,i,f){if(i[3]&&(s[i[3]]=f),i[2]){var n=i[2].filter(function(l){return typeof l=="number"});n.forEach(function(l){s[l.toString(16)]=f})}return s}),J1=a(function(s,i,f){if(s[f]=f,i[2]){var n=i[2].filter(function(l){return typeof l=="string"});n.forEach(function(l){s[l]=f})}return s}),a3=a(function(s,i,f){var n=i[2];return s[f]=f,n.forEach(function(l){s[l]=f}),s});var e="far"in Y||z.autoFetchSvg,r=T2(a4,function(s,i){var f=i[0],n=i[1],l=i[2];return n==="far"&&!e&&(n="fas"),typeof f=="string"&&(s.names[f]={prefix:n,iconName:l}),typeof f=="number"&&(s.unicodes[f.toString(16)]={prefix:n,iconName:l}),s},{names:{},unicodes:{}});Z1=r.names,c3=r.unicodes,c1=b2(z.styleDefault,{family:z.familyDefault})};W3(function(c){c1=b2(c.styleDefault,{family:z.familyDefault})});e3();function a1(c,a){return(K1[c]||{})[a]}function f4(c,a){return(J1[c]||{})[a]}function _(c,a){return(a3[c]||{})[a]}function r3(c){return Z1[c]||{prefix:null,iconName:null}}function n4(c){var a=c3[c],e=a1("fas",c);return a||(e?{prefix:"fas",iconName:e}:null)||{prefix:null,iconName:null}}function O(){return c1}var e1=function(){return{prefix:null,iconName:null,rest:[]}};function b2(c){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=a.family,r=e===void 0?M:e,s=r2[r][c],i=s2[r][c]||s2[r][s],f=c in y.styles?c:null;return i||f||null}var d1=(C2={},x(C2,M,Object.keys(i2[M])),x(C2,C,Object.keys(i2[C])),C2);function S2(c){var a,e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.skipLookups,s=r===void 0?!1:r,i=(a={},x(a,M,"".concat(z.cssPrefix,"-").concat(M)),x(a,C,"".concat(z.cssPrefix,"-").concat(C)),a),f=null,n=M;(c.includes(i[M])||c.some(function(t){return d1[M].includes(t)}))&&(n=M),(c.includes(i[C])||c.some(function(t){return d1[C].includes(t)}))&&(n=C);var l=c.reduce(function(t,o){var H=i4(z.cssPrefix,o);if(Y[o]?(o=e4[n].includes(o)?T3[n][o]:o,f=o,t.prefix=o):r4[n].indexOf(o)>-1?(f=o,t.prefix=b2(o,{family:n})):H?t.iconName=H:o!==z.replacementClass&&o!==i[M]&&o!==i[C]&&t.rest.push(o),!s&&t.prefix&&t.iconName){var v=f==="fa"?r3(t.iconName):{},h=_(t.prefix,t.iconName);v.prefix&&(f=null),t.iconName=v.iconName||h||t.iconName,t.prefix=v.prefix||t.prefix,t.prefix==="far"&&!Y.far&&Y.fas&&!z.autoFetchSvg&&(t.prefix="fas")}return t},e1());return(c.includes("fa-brands")||c.includes("fab"))&&(l.prefix="fab"),(c.includes("fa-duotone")||c.includes("fad"))&&(l.prefix="fad"),!l.prefix&&n===C&&(Y.fass||z.autoFetchSvg)&&(l.prefix="fass",l.iconName=_(l.prefix,l.iconName)||l.iconName),(l.prefix==="fa"||f==="fa")&&(l.prefix=O()||"fas"),l}var l4=function(){function c(){L3(this,c),this.definitions={}}return d3(c,[{key:"add",value:function(){for(var e=this,r=arguments.length,s=new Array(r),i=0;i<r;i++)s[i]=arguments[i];var f=s.reduce(this._pullDefinitions,{});Object.keys(f).forEach(function(n){e.definitions[n]=m(m({},e.definitions[n]||{}),f[n]),O2(n,f[n]);var l=i2[M][n];l&&O2(l,f[n]),e3()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(e,r){var s=r.prefix&&r.iconName&&r.icon?{0:r}:r;return Object.keys(s).map(function(i){var f=s[i],n=f.prefix,l=f.iconName,t=f.icon,o=t[2];e[n]||(e[n]={}),o.length>0&&o.forEach(function(H){typeof H=="string"&&(e[n][H]=t)}),e[n][l]=t}),e}}]),c}(),g1=[],$={},Q={},o4=Object.keys(Q);function t4(c,a){var e=a.mixoutsTo;return g1=c,$={},Object.keys(Q).forEach(function(r){o4.indexOf(r)===-1&&delete Q[r]}),g1.forEach(function(r){var s=r.mixout?r.mixout():{};if(Object.keys(s).forEach(function(f){typeof s[f]=="function"&&(e[f]=s[f]),d2(s[f])==="object"&&Object.keys(s[f]).forEach(function(n){e[f]||(e[f]={}),e[f][n]=s[f][n]})}),r.hooks){var i=r.hooks();Object.keys(i).forEach(function(f){$[f]||($[f]=[]),$[f].push(i[f])})}r.provides&&r.provides(Q)}),e}function q2(c,a){for(var e=arguments.length,r=new Array(e>2?e-2:0),s=2;s<e;s++)r[s-2]=arguments[s];var i=$[c]||[];return i.forEach(function(f){a=f.apply(null,[a].concat(r))}),a}function X(c){for(var a=arguments.length,e=new Array(a>1?a-1:0),r=1;r<a;r++)e[r-1]=arguments[r];var s=$[c]||[];s.forEach(function(i){i.apply(null,e)})}function F(){var c=arguments[0],a=Array.prototype.slice.call(arguments,1);return Q[c]?Q[c].apply(null,a):void 0}function W2(c){c.prefix==="fa"&&(c.prefix="fas");var a=c.iconName,e=c.prefix||O();if(a)return a=_(e,a)||a,u1(s3.definitions,e,a)||u1(y.styles,e,a)}var s3=new l4,m4=function(){z.autoReplaceSvg=!1,z.observeMutations=!1,X("noAuto")},H4={i2svg:function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return D?(X("beforeI2svg",a),F("pseudoElements2svg",a),F("i2svg",a)):Promise.reject("Operation requires a DOM of some kind.")},watch:function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},e=a.autoReplaceSvgRoot;z.autoReplaceSvg===!1&&(z.autoReplaceSvg=!0),z.observeMutations=!0,K3(function(){v4({autoReplaceSvgRoot:e}),X("watch",a)})}},z4={icon:function(a){if(a===null)return null;if(d2(a)==="object"&&a.prefix&&a.iconName)return{prefix:a.prefix,iconName:_(a.prefix,a.iconName)||a.iconName};if(Array.isArray(a)&&a.length===2){var e=a[1].indexOf("fa-")===0?a[1].slice(3):a[1],r=b2(a[0]);return{prefix:r,iconName:_(r,e)||e}}if(typeof a=="string"&&(a.indexOf("".concat(z.cssPrefix,"-"))>-1||a.match(B3))){var s=S2(a.split(" "),{skipLookups:!0});return{prefix:s.prefix||O(),iconName:_(s.prefix,s.iconName)||s.iconName}}if(typeof a=="string"){var i=O();return{prefix:i,iconName:_(i,a)||a}}}},w={noAuto:m4,config:z,dom:H4,parse:z4,library:s3,findIconDefinition:W2,toHtml:t2},v4=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},e=a.autoReplaceSvgRoot,r=e===void 0?p:e;(Object.keys(y.styles).length>0||z.autoFetchSvg)&&D&&z.autoReplaceSvg&&w.dom.i2svg({node:r})};function k2(c,a){return Object.defineProperty(c,"abstract",{get:a}),Object.defineProperty(c,"html",{get:function(){return c.abstract.map(function(r){return t2(r)})}}),Object.defineProperty(c,"node",{get:function(){if(D){var r=p.createElement("div");return r.innerHTML=c.html,r.children}}}),c}function V4(c){var a=c.children,e=c.main,r=c.mask,s=c.attributes,i=c.styles,f=c.transform;if(Z2(f)&&e.found&&!r.found){var n=e.width,l=e.height,t={x:n/l/2,y:.5};s.style=N2(m(m({},i),{},{"transform-origin":"".concat(t.x+f.x/16,"em ").concat(t.y+f.y/16,"em")}))}return[{tag:"svg",attributes:s,children:a}]}function h4(c){var a=c.prefix,e=c.iconName,r=c.children,s=c.attributes,i=c.symbol,f=i===!0?"".concat(a,"-").concat(z.cssPrefix,"-").concat(e):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:m(m({},s),{},{id:f}),children:r}]}]}function r1(c){var a=c.icons,e=a.main,r=a.mask,s=c.prefix,i=c.iconName,f=c.transform,n=c.symbol,l=c.title,t=c.maskId,o=c.titleId,H=c.extra,v=c.watchable,h=v===void 0?!1:v,L=r.found?r:e,S=L.width,d=L.height,N=s==="fak",u=[z.replacementClass,i?"".concat(z.cssPrefix,"-").concat(i):""].filter(function(R){return H.classes.indexOf(R)===-1}).filter(function(R){return R!==""||!!R}).concat(H.classes).join(" "),g={children:[],attributes:m(m({},H.attributes),{},{"data-prefix":s,"data-icon":i,class:u,role:H.attributes.role||"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 ".concat(S," ").concat(d)})},k=N&&!~H.classes.indexOf("fa-fw")?{width:"".concat(S/d*16*.0625,"em")}:{};h&&(g.attributes[j]=""),l&&(g.children.push({tag:"title",attributes:{id:g.attributes["aria-labelledby"]||"title-".concat(o||n2())},children:[l]}),delete g.attributes.title);var b=m(m({},g),{},{prefix:s,iconName:i,main:e,mask:r,maskId:t,transform:f,symbol:n,styles:m(m({},k),H.styles)}),W=r.found&&e.found?F("generateAbstractMask",b)||{children:[],attributes:{}}:F("generateAbstractIcon",b)||{children:[],attributes:{}},I=W.children,A2=W.attributes;return b.children=I,b.attributes=A2,n?h4(b):V4(b)}function x1(c){var a=c.content,e=c.width,r=c.height,s=c.transform,i=c.title,f=c.extra,n=c.watchable,l=n===void 0?!1:n,t=m(m(m({},f.attributes),i?{title:i}:{}),{},{class:f.classes.join(" ")});l&&(t[j]="");var o=m({},f.styles);Z2(s)&&(o.transform=X3({transform:s,startCentered:!0,width:e,height:r}),o["-webkit-transform"]=o.transform);var H=N2(o);H.length>0&&(t.style=H);var v=[];return v.push({tag:"span",attributes:t,children:[a]}),i&&v.push({tag:"span",attributes:{class:"sr-only"},children:[i]}),v}function M4(c){var a=c.content,e=c.title,r=c.extra,s=m(m(m({},r.attributes),e?{title:e}:{}),{},{class:r.classes.join(" ")}),i=N2(r.styles);i.length>0&&(s.style=i);var f=[];return f.push({tag:"span",attributes:s,children:[a]}),e&&f.push({tag:"span",attributes:{class:"sr-only"},children:[e]}),f}var B2=y.styles;function I2(c){var a=c[0],e=c[1],r=c.slice(4),s=X2(r,1),i=s[0],f=null;return Array.isArray(i)?f={tag:"g",attributes:{class:"".concat(z.cssPrefix,"-").concat(G.GROUP)},children:[{tag:"path",attributes:{class:"".concat(z.cssPrefix,"-").concat(G.SECONDARY),fill:"currentColor",d:i[0]}},{tag:"path",attributes:{class:"".concat(z.cssPrefix,"-").concat(G.PRIMARY),fill:"currentColor",d:i[1]}}]}:f={tag:"path",attributes:{fill:"currentColor",d:i}},{found:!0,width:a,height:e,icon:f}}var p4={found:!1,width:512,height:512};function C4(c,a){!G1&&!z.showMissingIcons&&c&&console.error('Icon with name "'.concat(c,'" and prefix "').concat(a,'" is missing.'))}function G2(c,a){var e=a;return a==="fa"&&z.styleDefault!==null&&(a=O()),new Promise(function(r,s){var i={found:!1,width:512,height:512,icon:F("missingIconAbstract")||{}};if(e==="fa"){var f=r3(c)||{};c=f.iconName||c,a=f.prefix||a}if(c&&a&&B2[a]&&B2[a][c]){var n=B2[a][c];return r(I2(n))}C4(c,a),r(m(m({},p4),{},{icon:z.showMissingIcons&&c?F("missingIconAbstract")||{}:{}}))})}var N1=function(){},_2=z.measurePerformance&&m2&&m2.mark&&m2.measure?m2:{mark:N1,measure:N1},c2='FA "6.5.2"',u4=function(a){return _2.mark("".concat(c2," ").concat(a," begins")),function(){return i3(a)}},i3=function(a){_2.mark("".concat(c2," ").concat(a," ends")),_2.measure("".concat(c2," ").concat(a),"".concat(c2," ").concat(a," begins"),"".concat(c2," ").concat(a," ends"))},s1={begin:u4,end:i3},u2=function(){};function b1(c){var a=c.getAttribute?c.getAttribute(j):null;return typeof a=="string"}function L4(c){var a=c.getAttribute?c.getAttribute($2):null,e=c.getAttribute?c.getAttribute(Q2):null;return a&&e}function d4(c){return c&&c.classList&&c.classList.contains&&c.classList.contains(z.replacementClass)}function g4(){if(z.autoReplaceSvg===!0)return L2.replace;var c=L2[z.autoReplaceSvg];return c||L2.replace}function x4(c){return p.createElementNS("http://www.w3.org/2000/svg",c)}function N4(c){return p.createElement(c)}function f3(c){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},e=a.ceFn,r=e===void 0?c.tag==="svg"?x4:N4:e;if(typeof c=="string")return p.createTextNode(c);var s=r(c.tag);Object.keys(c.attributes||[]).forEach(function(f){s.setAttribute(f,c.attributes[f])});var i=c.children||[];return i.forEach(function(f){s.appendChild(f3(f,{ceFn:r}))}),s}function b4(c){var a=" ".concat(c.outerHTML," ");return a="".concat(a,"Font Awesome fontawesome.com "),a}var L2={replace:function(a){var e=a[0];if(e.parentNode)if(a[1].forEach(function(s){e.parentNode.insertBefore(f3(s),e)}),e.getAttribute(j)===null&&z.keepOriginalSource){var r=p.createComment(b4(e));e.parentNode.replaceChild(r,e)}else e.remove()},nest:function(a){var e=a[0],r=a[1];if(~J2(e).indexOf(z.replacementClass))return L2.replace(a);var s=new RegExp("".concat(z.cssPrefix,"-.*"));if(delete r[0].attributes.id,r[0].attributes.class){var i=r[0].attributes.class.split(" ").reduce(function(n,l){return l===z.replacementClass||l.match(s)?n.toSvg.push(l):n.toNode.push(l),n},{toNode:[],toSvg:[]});r[0].attributes.class=i.toSvg.join(" "),i.toNode.length===0?e.removeAttribute("class"):e.setAttribute("class",i.toNode.join(" "))}var f=r.map(function(n){return t2(n)}).join(`
`);e.setAttribute(j,""),e.innerHTML=f}};function S1(c){c()}function n3(c,a){var e=typeof a=="function"?a:u2;if(c.length===0)e();else{var r=S1;z.mutateApproach===A3&&(r=U.requestAnimationFrame||S1),r(function(){var s=g4(),i=s1.begin("mutate");c.map(s),i(),e()})}}var i1=!1;function l3(){i1=!0}function j2(){i1=!1}var x2=null;function k1(c){if(h1&&z.observeMutations){var a=c.treeCallback,e=a===void 0?u2:a,r=c.nodeCallback,s=r===void 0?u2:r,i=c.pseudoElementsCallback,f=i===void 0?u2:i,n=c.observeMutationsRoot,l=n===void 0?p:n;x2=new h1(function(t){if(!i1){var o=O();J(t).forEach(function(H){if(H.type==="childList"&&H.addedNodes.length>0&&!b1(H.addedNodes[0])&&(z.searchPseudoElements&&f(H.target),e(H.target)),H.type==="attributes"&&H.target.parentNode&&z.searchPseudoElements&&f(H.target.parentNode),H.type==="attributes"&&b1(H.target)&&~E3.indexOf(H.attributeName))if(H.attributeName==="class"&&L4(H.target)){var v=S2(J2(H.target)),h=v.prefix,L=v.iconName;H.target.setAttribute($2,h||o),L&&H.target.setAttribute(Q2,L)}else d4(H.target)&&s(H.target)})}}),D&&x2.observe(l,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function S4(){x2&&x2.disconnect()}function k4(c){var a=c.getAttribute("style"),e=[];return a&&(e=a.split(";").reduce(function(r,s){var i=s.split(":"),f=i[0],n=i.slice(1);return f&&n.length>0&&(r[f]=n.join(":").trim()),r},{})),e}function w4(c){var a=c.getAttribute("data-prefix"),e=c.getAttribute("data-icon"),r=c.innerText!==void 0?c.innerText.trim():"",s=S2(J2(c));return s.prefix||(s.prefix=O()),a&&e&&(s.prefix=a,s.iconName=e),s.iconName&&s.prefix||(s.prefix&&r.length>0&&(s.iconName=f4(s.prefix,c.innerText)||a1(s.prefix,U2(c.innerText))),!s.iconName&&z.autoFetchSvg&&c.firstChild&&c.firstChild.nodeType===Node.TEXT_NODE&&(s.iconName=c.firstChild.data)),s}function y4(c){var a=J(c.attributes).reduce(function(s,i){return s.name!=="class"&&s.name!=="style"&&(s[i.name]=i.value),s},{}),e=c.getAttribute("title"),r=c.getAttribute("data-fa-title-id");return z.autoA11y&&(e?a["aria-labelledby"]="".concat(z.replacementClass,"-title-").concat(r||n2()):(a["aria-hidden"]="true",a.focusable="false")),a}function A4(){return{iconName:null,title:null,titleId:null,prefix:null,transform:A,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function w1(c){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},e=w4(c),r=e.iconName,s=e.prefix,i=e.rest,f=y4(c),n=q2("parseNodeAttributes",{},c),l=a.styleParser?k4(c):[];return m({iconName:r,title:c.getAttribute("title"),titleId:c.getAttribute("data-fa-title-id"),prefix:s,transform:A,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:i,styles:l,attributes:f}},n)}var P4=y.styles;function o3(c){var a=z.autoReplaceSvg==="nest"?w1(c,{styleParser:!1}):w1(c);return~a.extra.classes.indexOf(_1)?F("generateLayersText",c,a):F("generateSvgReplacementMutation",c,a)}var q=new Set;K2.map(function(c){q.add("fa-".concat(c))});Object.keys(r2[M]).map(q.add.bind(q));Object.keys(r2[C]).map(q.add.bind(q));q=l2(q);function y1(c){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!D)return Promise.resolve();var e=p.documentElement.classList,r=function(H){return e.add("".concat(M1,"-").concat(H))},s=function(H){return e.remove("".concat(M1,"-").concat(H))},i=z.autoFetchSvg?q:K2.map(function(o){return"fa-".concat(o)}).concat(Object.keys(P4));i.includes("fa")||i.push("fa");var f=[".".concat(_1,":not([").concat(j,"])")].concat(i.map(function(o){return".".concat(o,":not([").concat(j,"])")})).join(", ");if(f.length===0)return Promise.resolve();var n=[];try{n=J(c.querySelectorAll(f))}catch{}if(n.length>0)r("pending"),s("complete");else return Promise.resolve();var l=s1.begin("onTree"),t=n.reduce(function(o,H){try{var v=o3(H);v&&o.push(v)}catch(h){G1||h.name==="MissingIcon"&&console.error(h)}return o},[]);return new Promise(function(o,H){Promise.all(t).then(function(v){n3(v,function(){r("active"),r("complete"),s("pending"),typeof a=="function"&&a(),l(),o()})}).catch(function(v){l(),H(v)})})}function T4(c){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;o3(c).then(function(e){e&&n3([e],a)})}function B4(c){return function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=(a||{}).icon?a:W2(a||{}),s=e.mask;return s&&(s=(s||{}).icon?s:W2(s||{})),c(r,m(m({},e),{},{mask:s}))}}var F4=function(a){var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=e.transform,s=r===void 0?A:r,i=e.symbol,f=i===void 0?!1:i,n=e.mask,l=n===void 0?null:n,t=e.maskId,o=t===void 0?null:t,H=e.title,v=H===void 0?null:H,h=e.titleId,L=h===void 0?null:h,S=e.classes,d=S===void 0?[]:S,N=e.attributes,u=N===void 0?{}:N,g=e.styles,k=g===void 0?{}:g;if(a){var b=a.prefix,W=a.iconName,I=a.icon;return k2(m({type:"icon"},a),function(){return X("beforeDOMElementCreation",{iconDefinition:a,params:e}),z.autoA11y&&(v?u["aria-labelledby"]="".concat(z.replacementClass,"-title-").concat(L||n2()):(u["aria-hidden"]="true",u.focusable="false")),r1({icons:{main:I2(I),mask:l?I2(l.icon):{found:!1,width:null,height:null,icon:{}}},prefix:b,iconName:W,transform:m(m({},A),s),symbol:f,title:v,maskId:o,titleId:L,extra:{attributes:u,styles:k,classes:d}})})}},D4={mixout:function(){return{icon:B4(F4)}},hooks:function(){return{mutationObserverCallbacks:function(e){return e.treeCallback=y1,e.nodeCallback=T4,e}}},provides:function(a){a.i2svg=function(e){var r=e.node,s=r===void 0?p:r,i=e.callback,f=i===void 0?function(){}:i;return y1(s,f)},a.generateSvgReplacementMutation=function(e,r){var s=r.iconName,i=r.title,f=r.titleId,n=r.prefix,l=r.transform,t=r.symbol,o=r.mask,H=r.maskId,v=r.extra;return new Promise(function(h,L){Promise.all([G2(s,n),o.iconName?G2(o.iconName,o.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(S){var d=X2(S,2),N=d[0],u=d[1];h([e,r1({icons:{main:N,mask:u},prefix:n,iconName:s,transform:l,symbol:t,maskId:H,title:i,titleId:f,extra:v,watchable:!0})])}).catch(L)})},a.generateAbstractIcon=function(e){var r=e.children,s=e.attributes,i=e.main,f=e.transform,n=e.styles,l=N2(n);l.length>0&&(s.style=l);var t;return Z2(f)&&(t=F("generateAbstractTransformGrouping",{main:i,transform:f,containerWidth:i.width,iconWidth:i.width})),r.push(t||i.icon),{children:r,attributes:s}}}},R4={mixout:function(){return{layer:function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},s=r.classes,i=s===void 0?[]:s;return k2({type:"layer"},function(){X("beforeDOMElementCreation",{assembler:e,params:r});var f=[];return e(function(n){Array.isArray(n)?n.map(function(l){f=f.concat(l.abstract)}):f=f.concat(n.abstract)}),[{tag:"span",attributes:{class:["".concat(z.cssPrefix,"-layers")].concat(l2(i)).join(" ")},children:f}]})}}}},E4={mixout:function(){return{counter:function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},s=r.title,i=s===void 0?null:s,f=r.classes,n=f===void 0?[]:f,l=r.attributes,t=l===void 0?{}:l,o=r.styles,H=o===void 0?{}:o;return k2({type:"counter",content:e},function(){return X("beforeDOMElementCreation",{content:e,params:r}),M4({content:e.toString(),title:i,extra:{attributes:t,styles:H,classes:["".concat(z.cssPrefix,"-layers-counter")].concat(l2(n))}})})}}}},U4={mixout:function(){return{text:function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},s=r.transform,i=s===void 0?A:s,f=r.title,n=f===void 0?null:f,l=r.classes,t=l===void 0?[]:l,o=r.attributes,H=o===void 0?{}:o,v=r.styles,h=v===void 0?{}:v;return k2({type:"text",content:e},function(){return X("beforeDOMElementCreation",{content:e,params:r}),x1({content:e,transform:m(m({},A),i),title:n,extra:{attributes:H,styles:h,classes:["".concat(z.cssPrefix,"-layers-text")].concat(l2(t))}})})}}},provides:function(a){a.generateLayersText=function(e,r){var s=r.title,i=r.transform,f=r.extra,n=null,l=null;if(q1){var t=parseInt(getComputedStyle(e).fontSize,10),o=e.getBoundingClientRect();n=o.width/t,l=o.height/t}return z.autoA11y&&!s&&(f.attributes["aria-hidden"]="true"),Promise.resolve([e,x1({content:e.innerHTML,width:n,height:l,transform:i,title:s,extra:f,watchable:!0})])}}},O4=new RegExp('"',"ug"),A1=[1105920,1112319];function q4(c){var a=c.replace(O4,""),e=c4(a,0),r=e>=A1[0]&&e<=A1[1],s=a.length===2?a[0]===a[1]:!1;return{value:U2(s?a[0]:a),isSecondary:r||s}}function P1(c,a){var e="".concat(y3).concat(a.replace(":","-"));return new Promise(function(r,s){if(c.getAttribute(e)!==null)return r();var i=J(c.children),f=i.filter(function(I){return I.getAttribute(E2)===a})[0],n=U.getComputedStyle(c,a),l=n.getPropertyValue("font-family").match(F3),t=n.getPropertyValue("font-weight"),o=n.getPropertyValue("content");if(f&&!l)return c.removeChild(f),r();if(l&&o!=="none"&&o!==""){var H=n.getPropertyValue("content"),v=~["Sharp"].indexOf(l[2])?C:M,h=~["Solid","Regular","Light","Thin","Duotone","Brands","Kit"].indexOf(l[2])?s2[v][l[2].toLowerCase()]:D3[v][t],L=q4(H),S=L.value,d=L.isSecondary,N=l[0].startsWith("FontAwesome"),u=a1(h,S),g=u;if(N){var k=n4(S);k.iconName&&k.prefix&&(u=k.iconName,h=k.prefix)}if(u&&!d&&(!f||f.getAttribute($2)!==h||f.getAttribute(Q2)!==g)){c.setAttribute(e,g),f&&c.removeChild(f);var b=A4(),W=b.extra;W.attributes[E2]=a,G2(u,h).then(function(I){var A2=r1(m(m({},b),{},{icons:{main:I,mask:e1()},prefix:h,iconName:g,extra:W,watchable:!0})),R=p.createElementNS("http://www.w3.org/2000/svg","svg");a==="::before"?c.insertBefore(R,c.firstChild):c.appendChild(R),R.outerHTML=A2.map(function(p3){return t2(p3)}).join(`
`),c.removeAttribute(e),r()}).catch(s)}else r()}else r()})}function W4(c){return Promise.all([P1(c,"::before"),P1(c,"::after")])}function I4(c){return c.parentNode!==document.head&&!~P3.indexOf(c.tagName.toUpperCase())&&!c.getAttribute(E2)&&(!c.parentNode||c.parentNode.tagName!=="svg")}function T1(c){if(D)return new Promise(function(a,e){var r=J(c.querySelectorAll("*")).filter(I4).map(W4),s=s1.begin("searchPseudoElements");l3(),Promise.all(r).then(function(){s(),j2(),a()}).catch(function(){s(),j2(),e()})})}var G4={hooks:function(){return{mutationObserverCallbacks:function(e){return e.pseudoElementsCallback=T1,e}}},provides:function(a){a.pseudoElements2svg=function(e){var r=e.node,s=r===void 0?p:r;z.searchPseudoElements&&T1(s)}}},B1=!1,_4={mixout:function(){return{dom:{unwatch:function(){l3(),B1=!0}}}},hooks:function(){return{bootstrap:function(){k1(q2("mutationObserverCallbacks",{}))},noAuto:function(){S4()},watch:function(e){var r=e.observeMutationsRoot;B1?j2():k1(q2("mutationObserverCallbacks",{observeMutationsRoot:r}))}}}},F1=function(a){var e={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return a.toLowerCase().split(" ").reduce(function(r,s){var i=s.toLowerCase().split("-"),f=i[0],n=i.slice(1).join("-");if(f&&n==="h")return r.flipX=!0,r;if(f&&n==="v")return r.flipY=!0,r;if(n=parseFloat(n),isNaN(n))return r;switch(f){case"grow":r.size=r.size+n;break;case"shrink":r.size=r.size-n;break;case"left":r.x=r.x-n;break;case"right":r.x=r.x+n;break;case"up":r.y=r.y-n;break;case"down":r.y=r.y+n;break;case"rotate":r.rotate=r.rotate+n;break}return r},e)},j4={mixout:function(){return{parse:{transform:function(e){return F1(e)}}}},hooks:function(){return{parseNodeAttributes:function(e,r){var s=r.getAttribute("data-fa-transform");return s&&(e.transform=F1(s)),e}}},provides:function(a){a.generateAbstractTransformGrouping=function(e){var r=e.main,s=e.transform,i=e.containerWidth,f=e.iconWidth,n={transform:"translate(".concat(i/2," 256)")},l="translate(".concat(s.x*32,", ").concat(s.y*32,") "),t="scale(".concat(s.size/16*(s.flipX?-1:1),", ").concat(s.size/16*(s.flipY?-1:1),") "),o="rotate(".concat(s.rotate," 0 0)"),H={transform:"".concat(l," ").concat(t," ").concat(o)},v={transform:"translate(".concat(f/2*-1," -256)")},h={outer:n,inner:H,path:v};return{tag:"g",attributes:m({},h.outer),children:[{tag:"g",attributes:m({},h.inner),children:[{tag:r.icon.tag,children:r.icon.children,attributes:m(m({},r.icon.attributes),h.path)}]}]}}}},F2={x:0,y:0,width:"100%",height:"100%"};function D1(c){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return c.attributes&&(c.attributes.fill||a)&&(c.attributes.fill="black"),c}function X4(c){return c.tag==="g"?c.children:[c]}var Y4={hooks:function(){return{parseNodeAttributes:function(e,r){var s=r.getAttribute("data-fa-mask"),i=s?S2(s.split(" ").map(function(f){return f.trim()})):e1();return i.prefix||(i.prefix=O()),e.mask=i,e.maskId=r.getAttribute("data-fa-mask-id"),e}}},provides:function(a){a.generateAbstractMask=function(e){var r=e.children,s=e.attributes,i=e.main,f=e.mask,n=e.maskId,l=e.transform,t=i.width,o=i.icon,H=f.width,v=f.icon,h=j3({transform:l,containerWidth:H,iconWidth:t}),L={tag:"rect",attributes:m(m({},F2),{},{fill:"white"})},S=o.children?{children:o.children.map(D1)}:{},d={tag:"g",attributes:m({},h.inner),children:[D1(m({tag:o.tag,attributes:m(m({},o.attributes),h.path)},S))]},N={tag:"g",attributes:m({},h.outer),children:[d]},u="mask-".concat(n||n2()),g="clip-".concat(n||n2()),k={tag:"mask",attributes:m(m({},F2),{},{id:u,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[L,N]},b={tag:"defs",children:[{tag:"clipPath",attributes:{id:g},children:X4(v)},k]};return r.push(b,{tag:"rect",attributes:m({fill:"currentColor","clip-path":"url(#".concat(g,")"),mask:"url(#".concat(u,")")},F2)}),{children:r,attributes:s}}}},$4={provides:function(a){var e=!1;U.matchMedia&&(e=U.matchMedia("(prefers-reduced-motion: reduce)").matches),a.missingIconAbstract=function(){var r=[],s={fill:"currentColor"},i={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};r.push({tag:"path",attributes:m(m({},s),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var f=m(m({},i),{},{attributeName:"opacity"}),n={tag:"circle",attributes:m(m({},s),{},{cx:"256",cy:"364",r:"28"}),children:[]};return e||n.children.push({tag:"animate",attributes:m(m({},i),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:m(m({},f),{},{values:"1;0;1;1;0;1;"})}),r.push(n),r.push({tag:"path",attributes:m(m({},s),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:e?[]:[{tag:"animate",attributes:m(m({},f),{},{values:"1;0;0;0;0;1;"})}]}),e||r.push({tag:"path",attributes:m(m({},s),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:m(m({},f),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:r}}}},Q4={hooks:function(){return{parseNodeAttributes:function(e,r){var s=r.getAttribute("data-fa-symbol"),i=s===null?!1:s===""?!0:s;return e.symbol=i,e}}}},K4=[$3,D4,R4,E4,U4,G4,_4,j4,Y4,$4,Q4];t4(K4,{mixoutsTo:w});var z6=w.noAuto,v6=w.config,V6=w.library,h6=w.dom,w2=w.parse,M6=w.findIconDefinition,p6=w.toHtml,t3=w.icon,C6=w.layer,u6=w.text,L6=w.counter;var V=t1(u3()),o1=t1(C3());function m3(c,a){var e=Object.keys(c);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(c);a&&(r=r.filter(function(s){return Object.getOwnPropertyDescriptor(c,s).enumerable})),e.push.apply(e,r)}return e}function P(c){for(var a=1;a<arguments.length;a++){var e=arguments[a]!=null?arguments[a]:{};a%2?m3(Object(e),!0).forEach(function(r){Z(c,r,e[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(c,Object.getOwnPropertyDescriptors(e)):m3(Object(e)).forEach(function(r){Object.defineProperty(c,r,Object.getOwnPropertyDescriptor(e,r))})}return c}function y2(c){return y2=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(a){return typeof a}:function(a){return a&&typeof Symbol=="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},y2(c)}function Z(c,a,e){return a in c?Object.defineProperty(c,a,{value:e,enumerable:!0,configurable:!0,writable:!0}):c[a]=e,c}function J4(c,a){if(c==null)return{};var e={},r=Object.keys(c),s,i;for(i=0;i<r.length;i++)s=r[i],!(a.indexOf(s)>=0)&&(e[s]=c[s]);return e}function Z4(c,a){if(c==null)return{};var e=J4(c,a),r,s;if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(c);for(s=0;s<i.length;s++)r=i[s],!(a.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(c,r)&&(e[r]=c[r])}return e}function n1(c){return c6(c)||a6(c)||e6(c)||r6()}function c6(c){if(Array.isArray(c))return l1(c)}function a6(c){if(typeof Symbol<"u"&&c[Symbol.iterator]!=null||c["@@iterator"]!=null)return Array.from(c)}function e6(c,a){if(c){if(typeof c=="string")return l1(c,a);var e=Object.prototype.toString.call(c).slice(8,-1);if(e==="Object"&&c.constructor&&(e=c.constructor.name),e==="Map"||e==="Set")return Array.from(c);if(e==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return l1(c,a)}}function l1(c,a){(a==null||a>c.length)&&(a=c.length);for(var e=0,r=new Array(a);e<a;e++)r[e]=c[e];return r}function r6(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function s6(c){var a,e=c.beat,r=c.fade,s=c.beatFade,i=c.bounce,f=c.shake,n=c.flash,l=c.spin,t=c.spinPulse,o=c.spinReverse,H=c.pulse,v=c.fixedWidth,h=c.inverse,L=c.border,S=c.listItem,d=c.flip,N=c.size,u=c.rotation,g=c.pull,k=(a={"fa-beat":e,"fa-fade":r,"fa-beat-fade":s,"fa-bounce":i,"fa-shake":f,"fa-flash":n,"fa-spin":l,"fa-spin-reverse":o,"fa-spin-pulse":t,"fa-pulse":H,"fa-fw":v,"fa-inverse":h,"fa-border":L,"fa-li":S,"fa-flip":d===!0,"fa-flip-horizontal":d==="horizontal"||d==="both","fa-flip-vertical":d==="vertical"||d==="both"},Z(a,"fa-".concat(N),typeof N<"u"&&N!==null),Z(a,"fa-rotate-".concat(u),typeof u<"u"&&u!==null&&u!==0),Z(a,"fa-pull-".concat(g),typeof g<"u"&&g!==null),Z(a,"fa-swap-opacity",c.swapOpacity),a);return Object.keys(k).map(function(b){return k[b]?b:null}).filter(function(b){return b})}function i6(c){return c=c-0,c===c}function v3(c){return i6(c)?c:(c=c.replace(/[\-_\s]+(.)?/g,function(a,e){return e?e.toUpperCase():""}),c.substr(0,1).toLowerCase()+c.substr(1))}var f6=["style"];function n6(c){return c.charAt(0).toUpperCase()+c.slice(1)}function l6(c){return c.split(";").map(function(a){return a.trim()}).filter(function(a){return a}).reduce(function(a,e){var r=e.indexOf(":"),s=v3(e.slice(0,r)),i=e.slice(r+1).trim();return s.startsWith("webkit")?a[n6(s)]=i:a[s]=i,a},{})}function V3(c,a){var e=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};if(typeof a=="string")return a;var r=(a.children||[]).map(function(l){return V3(c,l)}),s=Object.keys(a.attributes||{}).reduce(function(l,t){var o=a.attributes[t];switch(t){case"class":l.attrs.className=o,delete a.attributes.class;break;case"style":l.attrs.style=l6(o);break;default:t.indexOf("aria-")===0||t.indexOf("data-")===0?l.attrs[t.toLowerCase()]=o:l.attrs[v3(t)]=o}return l},{attrs:{}}),i=e.style,f=i===void 0?{}:i,n=Z4(e,f6);return s.attrs.style=P(P({},s.attrs.style),f),c.apply(void 0,[a.tag,P(P({},s.attrs),n)].concat(n1(r)))}var h3=!1;try{h3=!0}catch{}function o6(){if(!h3&&console&&typeof console.error=="function"){var c;(c=console).error.apply(c,arguments)}}function H3(c){if(c&&y2(c)==="object"&&c.prefix&&c.iconName&&c.icon)return c;if(w2.icon)return w2.icon(c);if(c===null)return null;if(c&&y2(c)==="object"&&c.prefix&&c.iconName)return c;if(Array.isArray(c)&&c.length===2)return{prefix:c[0],iconName:c[1]};if(typeof c=="string")return{prefix:"fas",iconName:c}}function f1(c,a){return Array.isArray(a)&&a.length>0||!Array.isArray(a)&&a?Z({},c,a):{}}var z3={border:!1,className:"",mask:null,maskId:null,fixedWidth:!1,inverse:!1,flip:!1,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:null,transform:null,swapOpacity:!1},M3=o1.default.forwardRef(function(c,a){var e=P(P({},z3),c),r=e.icon,s=e.mask,i=e.symbol,f=e.className,n=e.title,l=e.titleId,t=e.maskId,o=H3(r),H=f1("classes",[].concat(n1(s6(e)),n1((f||"").split(" ")))),v=f1("transform",typeof e.transform=="string"?w2.transform(e.transform):e.transform),h=f1("mask",H3(s)),L=t3(o,P(P(P(P({},H),v),h),{},{symbol:i,title:n,titleId:l,maskId:t}));if(!L)return o6("Could not find icon",o),null;var S=L.abstract,d={ref:a};return Object.keys(e).forEach(function(N){z3.hasOwnProperty(N)||(d[N]=e[N])}),t6(S[0],d)});M3.displayName="FontAwesomeIcon";M3.propTypes={beat:V.default.bool,border:V.default.bool,beatFade:V.default.bool,bounce:V.default.bool,className:V.default.string,fade:V.default.bool,flash:V.default.bool,mask:V.default.oneOfType([V.default.object,V.default.array,V.default.string]),maskId:V.default.string,fixedWidth:V.default.bool,inverse:V.default.bool,flip:V.default.oneOf([!0,!1,"horizontal","vertical","both"]),icon:V.default.oneOfType([V.default.object,V.default.array,V.default.string]),listItem:V.default.bool,pull:V.default.oneOf(["right","left"]),pulse:V.default.bool,rotation:V.default.oneOf([0,90,180,270]),shake:V.default.bool,size:V.default.oneOf(["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:V.default.bool,spinPulse:V.default.bool,spinReverse:V.default.bool,symbol:V.default.oneOfType([V.default.bool,V.default.string]),title:V.default.string,titleId:V.default.string,transform:V.default.oneOfType([V.default.string,V.default.object]),swapOpacity:V.default.bool};var t6=V3.bind(null,o1.default.createElement);var N6={prefix:"fas",iconName:"bullseye",icon:[512,512,[],"f140","M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"]};var b6={prefix:"fas",iconName:"trash",icon:[448,512,[],"f1f8","M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"]};var m6={prefix:"fas",iconName:"ellipsis-vertical",icon:[128,512,["ellipsis-v"],"f142","M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"]},S6=m6;var k6={prefix:"fas",iconName:"arrow-down",icon:[384,512,[8595],"f063","M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"]};var w6={prefix:"fas",iconName:"arrow-up",icon:[384,512,[8593],"f062","M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"]};var y6={prefix:"fas",iconName:"thumbtack",icon:[384,512,[128204,128392,"thumb-tack"],"f08d","M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3H32c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64H64C46.3 64 32 49.7 32 32zM160 384h64v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V384z"]};export{M3 as a,N6 as b,b6 as c,S6 as d,k6 as e,w6 as f,y6 as g};
