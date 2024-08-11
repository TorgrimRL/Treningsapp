import{A as Ze,B,a as Ue,b as me,c as z,d as Je,e as Be,f as q,g as T,h as he,i as ze,j as X,k as Ve,l as Ye,m as Z,n as V,p as pe,q as we,r as ye,s as Re,u as Xe,v as Ge,w as Dt,x as We,y as Ke,z as qe}from"/build/_shared/chunk-ZYSMYXEW.js";import{d as U,f as J}from"/build/_shared/chunk-DLUJ32DX.js";X();var k=U(J());Dt();B();function E(){return E=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},E.apply(this,arguments)}var c=U(J());B();function $(e,t){if(e===!1||e===null||typeof e>"u")throw new Error(t)}B();async function Q(e,t){if(e.id in t)return t[e.id];try{let r=await import(e.module);return t[e.id]=r,r}catch{return window.__remixContext.isSpaMode,window.location.reload(),new Promise(()=>{})}}function Qe(e,t,r){let n=e.map(a=>{var l;let i=t[a.route.id],s=r.routes[a.route.id];return[s.css?s.css.map(u=>({rel:"stylesheet",href:u})):[],(i==null||(l=i.links)===null||l===void 0?void 0:l.call(i))||[]]}).flat(2),o=Ft(e,r);return nt(n,o)}async function ge(e,t){var r,n;if(!e.css&&!t.links||!jt())return;let o=[((r=e.css)===null||r===void 0?void 0:r.map(i=>({rel:"stylesheet",href:i})))??[],((n=t.links)===null||n===void 0?void 0:n.call(t))??[]].flat(1);if(o.length===0)return;let a=[];for(let i of o)!te(i)&&i.rel==="stylesheet"&&a.push({...i,rel:"preload",as:"style"});let l=a.filter(i=>(!i.media||window.matchMedia(i.media).matches)&&!document.querySelector(`link[rel="stylesheet"][href="${i.href}"]`));await Promise.all(l.map(Pt))}async function Pt(e){return new Promise(t=>{let r=document.createElement("link");Object.assign(r,e);function n(){document.head.contains(r)&&document.head.removeChild(r)}r.onload=()=>{n(),t()},r.onerror=()=>{n(),t()},document.head.appendChild(r)})}function te(e){return e!=null&&typeof e.page=="string"}function It(e){return e==null?!1:e.href==null?e.rel==="preload"&&typeof e.imageSrcSet=="string"&&typeof e.imageSizes=="string":typeof e.rel=="string"&&typeof e.href=="string"}async function et(e,t,r){let n=await Promise.all(e.map(async o=>{let a=await Q(t.routes[o.route.id],r);return a.links?a.links():[]}));return nt(n.flat(1).filter(It).filter(o=>o.rel==="stylesheet"||o.rel==="preload").map(o=>o.rel==="stylesheet"?{...o,rel:"prefetch",as:"style"}:{...o,rel:"prefetch"}))}function _e(e,t,r,n,o,a){let l=ot(e),i=(f,d)=>r[d]?f.route.id!==r[d].route.id:!0,s=(f,d)=>{var m;return r[d].pathname!==f.pathname||((m=r[d].route.path)===null||m===void 0?void 0:m.endsWith("*"))&&r[d].params["*"]!==f.params["*"]};return a==="data"&&o.search!==l.search?t.filter((f,d)=>{if(!n.routes[f.route.id].hasLoader)return!1;if(i(f,d)||s(f,d))return!0;if(f.route.shouldRevalidate){var p;let h=f.route.shouldRevalidate({currentUrl:new URL(o.pathname+o.search+o.hash,window.origin),currentParams:((p=r[0])===null||p===void 0?void 0:p.params)||{},nextUrl:new URL(e,window.origin),nextParams:f.params,defaultShouldRevalidate:!0});if(typeof h=="boolean")return h}return!0}):t.filter((f,d)=>{let m=n.routes[f.route.id];return(a==="assets"||m.hasLoader)&&(i(f,d)||s(f,d))})}function tt(e,t,r){let n=ot(e);return ve(t.filter(o=>r.routes[o.route.id].hasLoader).map(o=>{let{pathname:a,search:l}=n,i=new URLSearchParams(l);return i.set("_data",o.route.id),`${a}?${i}`}))}function rt(e,t){return ve(e.map(r=>{let n=t.routes[r.route.id],o=[n.module];return n.imports&&(o=o.concat(n.imports)),o}).flat(1))}function Ft(e,t){return ve(e.map(r=>{let n=t.routes[r.route.id],o=[n.module];return n.imports&&(o=o.concat(n.imports)),o}).flat(1))}function ve(e){return[...new Set(e)]}function Tt(e){let t={},r=Object.keys(e).sort();for(let n of r)t[n]=e[n];return t}function nt(e,t){let r=new Set,n=new Set(t);return e.reduce((o,a)=>{if(t&&!te(a)&&a.as==="script"&&a.href&&n.has(a.href))return o;let i=JSON.stringify(Tt(a));return r.has(i)||(r.add(i),o.push({key:i,link:a})),o},[])}function ot(e){let t=me(e);return t.search===void 0&&(t.search=""),t}var ee;function jt(){if(ee!==void 0)return ee;let e=document.createElement("link");return ee=e.relList.supports("preload"),e=null,ee}var Ht={"&":"\\u0026",">":"\\u003e","<":"\\u003c","\u2028":"\\u2028","\u2029":"\\u2029"},Ut=/[&><\u2028\u2029]/g;function G(e){return e.replace(Ut,t=>Ht[t])}function Ee(e){return{__html:e}}var Oe=U(J());X();var Jt=-1,Bt=-2,zt=-3,Vt=-4,Yt=-5,Xt=-6,Gt=-7,Wt="B",Kt="D",at="E",qt="M",Zt="N",it="P",Qt="R",er="S",tr="Y",rr="U",nr="Z",st=class{promise;resolve;reject;constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}};function or(){let e=new TextDecoder,t="";return new TransformStream({transform(r,n){let o=e.decode(r,{stream:!0}),a=(t+o).split(`
`);t=a.pop()||"";for(let l of a)n.enqueue(l)},flush(r){t&&r.enqueue(t)}})}var Ir=Object.getOwnPropertyNames(Object.prototype).sort().join("\0");var xe=typeof window<"u"?window:typeof globalThis<"u"?globalThis:void 0;function Se(e){let{hydrated:t,values:r}=this;if(typeof e=="number")return N.call(this,e);if(!Array.isArray(e)||!e.length)throw new SyntaxError;let n=r.length;return r.push(...e),t.length=r.length,N.call(this,n)}function N(e){let{hydrated:t,values:r,deferred:n,plugins:o}=this;switch(e){case Gt:return;case Yt:return null;case Bt:return NaN;case Xt:return 1/0;case zt:return-1/0;case Vt:return-0}if(t[e])return t[e];let a=r[e];if(!a||typeof a!="object")return t[e]=a;if(Array.isArray(a))if(typeof a[0]=="string"){let[l,i,s]=a;switch(l){case Kt:return t[e]=new Date(i);case rr:return t[e]=new URL(i);case Wt:return t[e]=BigInt(i);case Qt:return t[e]=new RegExp(i,s);case tr:return t[e]=Symbol.for(i);case er:let u=new Set;t[e]=u;for(let w=1;w<a.length;w++)u.add(N.call(this,a[w]));return u;case qt:let f=new Map;t[e]=f;for(let w=1;w<a.length;w+=2)f.set(N.call(this,a[w]),N.call(this,a[w+1]));return f;case Zt:let d=Object.create(null);t[e]=d;for(let w in i)d[N.call(this,Number(w))]=N.call(this,i[w]);return d;case it:if(t[i])return t[e]=t[i];{let w=new st;return n[i]=w,t[e]=w.promise}case at:let[,m,p]=a,h=p&&xe&&xe[p]?new xe[p](m):new Error(m);return t[e]=h,h;case nr:return N.call(this,i);default:if(Array.isArray(o)){let w=a.slice(1).map(g=>N.call(this,g));for(let g of o){let x=g(a[0],...w);if(x)return t[e]=x.value}}throw new SyntaxError}}else{let l=[];t[e]=l;for(let i=0;i<a.length;i++){let s=a[i];s!==Jt&&(l[i]=N.call(this,s))}return l}else{let l={};t[e]=l;for(let i in a)l[N.call(this,Number(i))]=N.call(this,a[i]);return l}}async function lt(e,t){let{plugins:r}=t??{},n=new st,o=e.pipeThrough(or()).getReader(),a={values:[],hydrated:[],deferred:{},plugins:r},l=await ar.call(a,o),i=n.promise;return l.done?n.resolve():i=ir.call(a,o).then(n.resolve).catch(s=>{for(let u of Object.values(a.deferred))u.reject(s);n.reject(s)}),{done:i.then(()=>o.closed),value:l.value}}async function ar(e){let t=await e.read();if(!t.value)throw new SyntaxError;let r;try{r=JSON.parse(t.value)}catch{throw new SyntaxError}return{done:t.done,value:Se.call(this,r)}}async function ir(e){let t=await e.read();for(;!t.done;){if(!t.value)continue;let r=t.value;switch(r[0]){case it:{let n=r.indexOf(":"),o=Number(r.slice(1,n)),a=this.deferred[o];if(!a)throw new Error(`Deferred ID ${o} not found in stream`);let l=r.slice(n+1),i;try{i=JSON.parse(l)}catch{throw new SyntaxError}let s=Se.call(this,i);a.resolve(s);break}case at:{let n=r.indexOf(":"),o=Number(r.slice(1,n)),a=this.deferred[o];if(!a)throw new Error(`Deferred ID ${o} not found in stream`);let l=r.slice(n+1),i;try{i=JSON.parse(l)}catch{throw new SyntaxError}let s=Se.call(this,i);a.reject(s);break}default:throw new SyntaxError}t=await e.read()}}var re=Symbol("SingleFetchRedirect"),jr=Symbol("ResponseStubAction");var Hr=Symbol("ResponseStubOperations");X();function ct(e){return e.headers.get("X-Remix-Catch")!=null}function sr(e){return e.headers.get("X-Remix-Error")!=null}function lr(e){return be(e)&&e.status>=400&&e.headers.get("X-Remix-Error")==null&&e.headers.get("X-Remix-Catch")==null&&e.headers.get("X-Remix-Response")==null}function dt(e){return e.headers.get("X-Remix-Redirect")!=null}function ft(e){var t;return!!((t=e.headers.get("Content-Type"))!==null&&t!==void 0&&t.match(/text\/remix-deferred/))}function be(e){return e!=null&&typeof e.status=="number"&&typeof e.statusText=="string"&&typeof e.headers=="object"&&typeof e.body<"u"}function mt(e){let t=e;return t&&typeof t=="object"&&typeof t.data=="object"&&typeof t.subscribe=="function"&&typeof t.cancel=="function"&&typeof t.resolveData=="function"}async function Le(e,t,r=0){let n=new URL(e.url);n.searchParams.set("_data",t),r>0&&await new Promise(i=>setTimeout(i,5**r*10));let o=await ke(e),a=window.__remixRevalidation,l=await fetch(n.href,o).catch(i=>{if(typeof a=="number"&&a===window.__remixRevalidation&&i?.name==="TypeError"&&r<3)return Le(e,t,r+1);throw i});if(sr(l)){let i=await l.json(),s=new Error(i.message);return s.stack=i.stack,s}if(lr(l)){let i=await l.text(),s=new Error(i);return s.stack=void 0,s}return l}async function ke(e){let t={signal:e.signal};if(e.method!=="GET"){t.method=e.method;let r=e.headers.get("Content-Type");r&&/\bapplication\/json\b/.test(r)?(t.headers={"Content-Type":r},t.body=JSON.stringify(await e.json())):r&&/\btext\/plain\b/.test(r)?(t.headers={"Content-Type":r},t.body=await e.text()):r&&/\bapplication\/x-www-form-urlencoded\b/.test(r)?t.body=new URLSearchParams(await e.text()):t.body=await e.formData()}return t}var ur="__deferred_promise:";async function ht(e){if(!e)throw new Error("parseDeferredReadableStream requires stream argument");let t,r={};try{let n=cr(e),a=(await n.next()).value;if(!a)throw new Error("no critical data");let l=JSON.parse(a);if(typeof l=="object"&&l!==null)for(let[i,s]of Object.entries(l))typeof s!="string"||!s.startsWith(ur)||(t=t||{},t[i]=new Promise((u,f)=>{r[i]={resolve:d=>{u(d),delete r[i]},reject:d=>{f(d),delete r[i]}}}));return(async()=>{try{for await(let i of n){let[s,...u]=i.split(":"),f=u.join(":"),d=JSON.parse(f);if(s==="data")for(let[m,p]of Object.entries(d))r[m]&&r[m].resolve(p);else if(s==="error")for(let[m,p]of Object.entries(d)){let h=new Error(p.message);h.stack=p.stack,r[m]&&r[m].reject(h)}}for(let[i,s]of Object.entries(r))s.reject(new Je(`Deferred ${i} will never be resolved`))}catch(i){for(let s of Object.values(r))s.reject(i)}})(),new Be({...l,...t})}catch(n){for(let o of Object.values(r))o.reject(n);throw n}}async function*cr(e){let t=e.getReader(),r=[],n=[],o=!1,a=new TextEncoder,l=new TextDecoder,i=async()=>{if(n.length>0)return n.shift();for(;!o&&n.length===0;){let u=await t.read();if(u.done){o=!0;break}r.push(u.value);try{let d=l.decode(ut(...r)).split(`

`);if(d.length>=2&&(n.push(...d.slice(0,-1)),r=[a.encode(d.slice(-1).join(`

`))]),n.length>0)break}catch{continue}}return n.length>0||r.length>0&&(n=l.decode(ut(...r)).split(`

`).filter(f=>f),r=[]),n.shift()},s=await i();for(;s;)yield s,s=await i()}function ut(...e){let t=new Uint8Array(e.reduce((n,o)=>n+o.length,0)),r=0;for(let n of e)t.set(n,r),r+=n.length;return t}function wt(e,t){return async({request:r,matches:n})=>r.method!=="GET"?dr(r,n):fr(e,t,r,n)}function dr(e,t){return Promise.all(t.map(async r=>{let n;return{...await r.resolve(async a=>({type:"data",result:await a(async()=>{let i=ne(e.url),s=await ke(e),{data:u,status:f}=await Ce(i,s);return n=f,$e(u,r.route.id)}),status:n})),status:n}}))}function fr(e,t,r,n){let o;return Promise.all(n.map(async a=>a.resolve(async l=>{let i,s=mr(ne(r.url));return e.routes[a.route.id].hasClientLoader?i=await l(async()=>{s.searchParams.set("_routes",a.route.id);let{data:u}=await Ce(s);return pt(u,a.route.id)}):i=await l(async()=>{o||(s=Me(e,t,n.map(f=>f.route),n.filter(f=>f.shouldLoad).map(f=>f.route),s),o=Ce(s).then(({data:f})=>f));let u=await o;return pt(u,a.route.id)}),{type:"data",result:i}})))}function mr(e){let t=e.searchParams.getAll("index");e.searchParams.delete("index");let r=[];for(let n of t)n&&r.push(n);for(let n of r)e.searchParams.append("index",n);return e}function Me(e,t,r,n,o){let a=u=>u.filter(f=>e.routes[f].hasLoader).join(",");if(!r.some(u=>{var f,d;return((f=t[u.id])===null||f===void 0?void 0:f.shouldRevalidate)||((d=e.routes[u.id])===null||d===void 0?void 0:d.hasClientLoader)}))return o;let i=a(r.map(u=>u.id)),s=a(n.filter(u=>{var f;return!((f=e.routes[u.id])!==null&&f!==void 0&&f.hasClientLoader)}).map(u=>u.id));return i!==s&&o.searchParams.set("_routes",s),o}function ne(e){let t=typeof e=="string"?new URL(e,window.location.origin):e;return t.pathname=`${t.pathname==="/"?"_root":t.pathname}.data`,t}async function Ce(e,t){let r=await fetch(e,t);$(r.body,"No response body to decode");try{let n=await Ne(r.body,window);return{status:r.status,data:n.value}}catch(n){throw console.error(n),new Error(`Unable to decode turbo-stream response from URL: ${e.toString()}`)}}function Ne(e,t){return lt(e,{plugins:[(r,...n)=>{if(r==="SanitizedError"){let[o,a,l]=n,i=Error;o&&o in t&&typeof t[o]=="function"&&(i=t[o]);let s=new i(a);return s.stack=l,{value:s}}if(r==="ErrorResponse"){let[o,a,l]=n;return{value:new T(a,l,o)}}if(r==="SingleFetchRedirect")return{value:{[re]:n[0]}}}]})}function pt(e,t){let r=e[re];return r?$e(r,t):e[t]!==void 0?$e(e[t],t):null}function $e(e,t){if("error"in e)throw e.error;if("redirect"in e){let r={};return e.revalidate&&(r["X-Remix-Revalidate"]="yes"),e.reload&&(r["X-Remix-Reload-Document"]="yes"),q(e.redirect,{status:e.status,headers:r})}else{if("data"in e)return e.data;throw new Error(`No response found for routeId "${t}"`)}}function Rt(){let e=c.useContext(Ve);return $(e,"You must render this element inside a <DataRouterContext.Provider> element"),e}function ae(){let e=c.useContext(Ye);return $(e,"You must render this element inside a <DataRouterStateContext.Provider> element"),e}var K=c.createContext(void 0);K.displayName="Remix";function P(){let e=c.useContext(K);return $(e,"You must render this element inside a <Remix> element"),e}function gt(e,t){let[r,n]=c.useState(!1),[o,a]=c.useState(!1),{onFocus:l,onBlur:i,onMouseEnter:s,onMouseLeave:u,onTouchStart:f}=t,d=c.useRef(null);c.useEffect(()=>{if(e==="render"&&a(!0),e==="viewport"){let h=g=>{g.forEach(x=>{a(x.isIntersecting)})},w=new IntersectionObserver(h,{threshold:.5});return d.current&&w.observe(d.current),()=>{w.disconnect()}}},[e]);let m=()=>{e==="intent"&&n(!0)},p=()=>{e==="intent"&&(n(!1),a(!1))};return c.useEffect(()=>{if(r){let h=setTimeout(()=>{a(!0)},100);return()=>{clearTimeout(h)}}},[r]),[o,d,{onFocus:W(l,m),onBlur:W(i,p),onMouseEnter:W(s,m),onMouseLeave:W(u,p),onTouchStart:W(f,m)}]}var _t=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,vt=c.forwardRef(({to:e,prefetch:t="none",...r},n)=>{let o=typeof e=="string"&&_t.test(e),a=Z(e),[l,i,s]=gt(t,r);return c.createElement(c.Fragment,null,c.createElement(qe,E({},r,s,{ref:St(n,i),to:e})),l&&!o?c.createElement(ie,{page:a}):null)});vt.displayName="NavLink";var Et=c.forwardRef(({to:e,prefetch:t="none",...r},n)=>{let o=typeof e=="string"&&_t.test(e),a=Z(e),[l,i,s]=gt(t,r);return c.createElement(c.Fragment,null,c.createElement(Ke,E({},r,s,{ref:St(n,i),to:e})),l&&!o?c.createElement(ie,{page:a}):null)});Et.displayName="Link";function W(e,t){return r=>{e&&e(r),r.defaultPrevented||t(r)}}function Ae(e,t,r){if(r&&!oe)return[e[0]];if(t){let n=e.findIndex(o=>t[o.route.id]!==void 0);return e.slice(0,n+1)}return e}function hr(){let{isSpaMode:e,manifest:t,routeModules:r,criticalCss:n}=P(),{errors:o,matches:a}=ae(),l=Ae(a,o,e),i=c.useMemo(()=>Qe(l,r,t),[l,r,t]);return c.createElement(c.Fragment,null,n?c.createElement("style",{dangerouslySetInnerHTML:{__html:n}}):null,i.map(({key:s,link:u})=>te(u)?c.createElement(ie,E({key:s},u)):c.createElement("link",E({key:s},u))))}function ie({page:e,...t}){let{router:r}=Rt(),n=c.useMemo(()=>z(r.routes,e,r.basename),[r.routes,e,r.basename]);return n?c.createElement(wr,E({page:e,matches:n},t)):(console.warn(`Tried to prefetch ${e} but no routes matched.`),null)}function pr(e){let{manifest:t,routeModules:r}=P(),[n,o]=c.useState([]);return c.useEffect(()=>{let a=!1;return et(e,t,r).then(l=>{a||o(l)}),()=>{a=!0}},[e,t,r]),n}function wr({page:e,matches:t,...r}){let n=V(),{future:o,manifest:a,routeModules:l}=P(),{matches:i}=ae(),s=c.useMemo(()=>_e(e,t,i,a,n,"data"),[e,t,i,a,n]),u=c.useMemo(()=>_e(e,t,i,a,n,"assets"),[e,t,i,a,n]),f=c.useMemo(()=>tt(e,s,a),[s,e,a]),d=c.useMemo(()=>rt(u,a),[u,a]),m=pr(u),p=null;if(!o.unstable_singleFetch)p=f.map(h=>c.createElement("link",E({key:h,rel:"prefetch",as:"fetch",href:h},r)));else if(s.length>0){let h=Me(a,l,t.map(w=>w.route),s.map(w=>w.route),ne(e));h.searchParams.get("_routes")!==""&&(p=c.createElement("link",E({key:h.pathname+h.search,rel:"prefetch",as:"fetch",href:h.pathname+h.search},r)))}return c.createElement(c.Fragment,null,p,d.map(h=>c.createElement("link",E({key:h,rel:"modulepreload",href:h},r))),m.map(({key:h,link:w})=>c.createElement("link",E({key:h},w))))}function yr(){let{isSpaMode:e,routeModules:t}=P(),{errors:r,matches:n,loaderData:o}=ae(),a=V(),l=Ae(n,r,e),i=null;r&&(i=r[l[l.length-1].route.id]);let s=[],u=null,f=[];for(let d=0;d<l.length;d++){let m=l[d],p=m.route.id,h=o[p],w=m.params,g=t[p],x=[],O={id:p,data:h,meta:[],params:m.params,pathname:m.pathname,handle:m.route.handle,error:i};if(f[d]=O,g!=null&&g.meta?x=typeof g.meta=="function"?g.meta({data:h,params:w,location:a,matches:f,error:i}):Array.isArray(g.meta)?[...g.meta]:g.meta:u&&(x=[...u]),x=x||[],!Array.isArray(x))throw new Error("The route at "+m.route.path+` returns an invalid value. All route meta functions must return an array of meta objects.

To reference the meta function API, see https://remix.run/route/meta`);O.meta=x,f[d]=O,s=[...x],u=s}return c.createElement(c.Fragment,null,s.flat().map(d=>{if(!d)return null;if("tagName"in d){let{tagName:m,...p}=d;return Rr(m)?c.createElement(m,E({key:JSON.stringify(p)},p)):(console.warn(`A meta object uses an invalid tagName: ${m}. Expected either 'link' or 'meta'`),null)}if("title"in d)return c.createElement("title",{key:"title"},String(d.title));if("charset"in d&&(d.charSet??=d.charset,delete d.charset),"charSet"in d&&d.charSet!=null)return typeof d.charSet=="string"?c.createElement("meta",{key:"charSet",charSet:d.charSet}):null;if("script:ld+json"in d)try{let m=JSON.stringify(d["script:ld+json"]);return c.createElement("script",{key:`script:ld+json:${m}`,type:"application/ld+json",dangerouslySetInnerHTML:{__html:m}})}catch{return null}return c.createElement("meta",E({key:JSON.stringify(d)},d))}))}function Rr(e){return typeof e=="string"&&/^(meta|link)$/.test(e)}function xt(e){return c.createElement(Xe,e)}var oe=!1;function De(e){let{manifest:t,serverHandoffString:r,abortDelay:n,serializeError:o,isSpaMode:a,future:l,renderMeta:i}=P(),{router:s,static:u,staticContext:f}=Rt(),{matches:d}=ae(),m=pe();i&&(i.didRenderScripts=!0);let p=Ae(d,null,a);c.useEffect(()=>{oe=!0},[]);let h=(y,v)=>{let C;return o&&v instanceof Error?C=o(v):C=v,`${JSON.stringify(y)}:__remixContext.p(!1, ${G(JSON.stringify(C))})`},w=(y,v,C)=>{let M;try{M=JSON.stringify(C)}catch(Y){return h(v,Y)}return`${JSON.stringify(v)}:__remixContext.p(${G(M)})`},g=(y,v,C)=>{let M;return o&&C instanceof Error?M=o(C):M=C,`__remixContext.r(${JSON.stringify(y)}, ${JSON.stringify(v)}, !1, ${G(JSON.stringify(M))})`},x=(y,v,C)=>{let M;try{M=JSON.stringify(C)}catch(Y){return g(y,v,Y)}return`__remixContext.r(${JSON.stringify(y)}, ${JSON.stringify(v)}, ${G(M)})`},O=[],_=c.useMemo(()=>{var y;let v=l.unstable_singleFetch?"window.__remixContext.stream = new ReadableStream({start(controller){window.__remixContext.streamController = controller;}}).pipeThrough(new TextEncoderStream());":"",C=f?`window.__remixContext = ${r};${v}`:" ",M=l.unstable_singleFetch?void 0:f?.activeDeferreds;C+=M?["__remixContext.p = function(v,e,p,x) {","  if (typeof e !== 'undefined') {",`    x=new Error("Unexpected Server Error");
    x.stack=undefined;`,"    p=Promise.reject(x);","  } else {","    p=Promise.resolve(v);","  }","  return p;","};","__remixContext.n = function(i,k) {","  __remixContext.t = __remixContext.t || {};","  __remixContext.t[i] = __remixContext.t[i] || {};","  let p = new Promise((r, e) => {__remixContext.t[i][k] = {r:(v)=>{r(v);},e:(v)=>{e(v);}};});",typeof n=="number"?`setTimeout(() => {if(typeof p._error !== "undefined" || typeof p._data !== "undefined"){return;} __remixContext.t[i][k].e(new Error("Server timeout."))}, ${n});`:"","  return p;","};","__remixContext.r = function(i,k,v,e,p,x) {","  p = __remixContext.t[i][k];","  if (typeof e !== 'undefined') {",`    x=new Error("Unexpected Server Error");
    x.stack=undefined;`,"    p.e(x);","  } else {","    p.r(v);","  }","};"].join(`
`)+Object.entries(M).map(([D,I])=>{let Nt=new Set(I.pendingKeys),At=I.deferredKeys.map(F=>{if(Nt.has(F))return O.push(c.createElement(yt,{key:`${D} | ${F}`,deferredData:I,routeId:D,dataKey:F,scriptProps:e,serializeData:x,serializeError:g})),`${JSON.stringify(F)}:__remixContext.n(${JSON.stringify(D)}, ${JSON.stringify(F)})`;{let fe=I.data[F];return typeof fe._error<"u"?h(F,fe._error):w(D,F,fe._data)}}).join(`,
`);return`Object.assign(__remixContext.state.loaderData[${JSON.stringify(D)}], {${At}});`}).join(`
`)+(O.length>0?`__remixContext.a=${O.length};`:""):"";let Y=u?`${(y=t.hmr)!==null&&y!==void 0&&y.runtime?`import ${JSON.stringify(t.hmr.runtime)};`:""}import ${JSON.stringify(t.url)};
${p.map((D,I)=>`import * as route${I} from ${JSON.stringify(t.routes[D.route.id].module)};`).join(`
`)}
window.__remixRouteModules = {${p.map((D,I)=>`${JSON.stringify(D.route.id)}:route${I}`).join(",")}};

import(${JSON.stringify(t.entry.module)});`:" ";return c.createElement(c.Fragment,null,c.createElement("script",E({},e,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:Ee(C),type:void 0})),c.createElement("script",E({},e,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:Ee(Y),type:"module",async:!0})))},[]);if(!u&&typeof __remixContext=="object"&&__remixContext.a)for(let y=0;y<__remixContext.a;y++)O.push(c.createElement(yt,{key:y,scriptProps:e,serializeData:x,serializeError:g}));let R=c.useMemo(()=>{if(m.location){let y=z(s.routes,m.location,s.basename);return $(y,`No routes match path "${m.location.pathname}"`),y}return[]},[m.location,s.routes,s.basename]),L=p.concat(R).map(y=>{let v=t.routes[y.route.id];return(v.imports||[]).concat([v.module])}).flat(1),S=oe?[]:t.entry.imports.concat(L);return oe?null:c.createElement(c.Fragment,null,c.createElement("link",{rel:"modulepreload",href:t.url,crossOrigin:e.crossOrigin}),c.createElement("link",{rel:"modulepreload",href:t.entry.module,crossOrigin:e.crossOrigin}),_r(S).map(y=>c.createElement("link",{key:y,rel:"modulepreload",href:y,crossOrigin:e.crossOrigin})),_,O)}function yt({dataKey:e,deferredData:t,routeId:r,scriptProps:n,serializeData:o,serializeError:a}){return typeof document>"u"&&t&&e&&r&&$(t.pendingKeys.includes(e),`Deferred data for route ${r} with key ${e} was not pending but tried to render a script for it.`),c.createElement(c.Suspense,{fallback:typeof document>"u"&&t&&e&&r?null:c.createElement("script",E({},n,{async:!0,suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:" "}}))},typeof document>"u"&&t&&e&&r?c.createElement(xt,{resolve:t.data[e],errorElement:c.createElement(gr,{dataKey:e,routeId:r,scriptProps:n,serializeError:a}),children:l=>c.createElement("script",E({},n,{async:!0,suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:o(r,e,l)}}))}):c.createElement("script",E({},n,{async:!0,suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:" "}})))}function gr({dataKey:e,routeId:t,scriptProps:r,serializeError:n}){let o=Re();return c.createElement("script",E({},r,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:n(t,e,o)}}))}function _r(e){return[...new Set(e)]}function St(...e){return t=>{e.forEach(r=>{typeof r=="function"?r(t):r!=null&&(r.current=t)})}}var b=U(J());B();var se=class extends b.Component{constructor(t){super(t),this.state={error:t.error||null,location:t.location}}static getDerivedStateFromError(t){return{error:t}}static getDerivedStateFromProps(t,r){return r.location!==t.location?{error:t.error||null,location:t.location}:{error:t.error||r.error,location:r.location}}render(){return this.state.error?b.createElement(Pe,{error:this.state.error}):this.props.children}};function Pe({error:e}){console.error(e);let t=b.createElement("script",{dangerouslySetInnerHTML:{__html:`
        console.log(
          "\u{1F4BF} Hey developer \u{1F44B}. You can provide a way better UX than this when your app throws errors. Check out https://remix.run/guides/errors for more information."
        );
      `}});if(he(e))return b.createElement(le,{title:"Unhandled Thrown Response!"},b.createElement("h1",{style:{fontSize:"24px"}},e.status," ",e.statusText),t);let r;if(e instanceof Error)r=e;else{let n=e==null?"Unknown Error":typeof e=="object"&&"toString"in e?e.toString():JSON.stringify(e);r=new Error(n)}return b.createElement(le,{title:"Application Error!"},b.createElement("h1",{style:{fontSize:"24px"}},"Application Error"),b.createElement("pre",{style:{padding:"2rem",background:"hsla(10, 50%, 50%, 0.1)",color:"red",overflow:"auto"}},r.stack),t)}function le({title:e,renderScripts:t,children:r}){var n;let{routeModules:o}=P();return(n=o.root)!==null&&n!==void 0&&n.Layout?r:b.createElement("html",{lang:"en"},b.createElement("head",null,b.createElement("meta",{charSet:"utf-8"}),b.createElement("meta",{name:"viewport",content:"width=device-width,initial-scale=1,viewport-fit=cover"}),b.createElement("title",null,e)),b.createElement("body",null,b.createElement("main",{style:{fontFamily:"system-ui, sans-serif",padding:"2rem"}},r,t?b.createElement(De,null):null)))}X();function bt(e){if(!e)return null;let t=Object.entries(e),r={};for(let[n,o]of t)if(o&&o.__type==="RouteErrorResponse")r[n]=new T(o.status,o.statusText,o.data,o.internal===!0);else if(o&&o.__type==="Error"){if(o.__subType){let a=window[o.__subType];if(typeof a=="function")try{let l=new a(o.message);l.stack=o.stack,r[n]=l}catch{}}if(r[n]==null){let a=new Error(o.message);a.stack=o.stack,r[n]=a}}else r[n]=o;return r}var j=U(J());X();B();var Ie=U(J());function Lt(){return Ie.createElement(le,{title:"Loading...",renderScripts:!0},Ie.createElement("script",{dangerouslySetInnerHTML:{__html:`
              console.log(
                "\u{1F4BF} Hey developer \u{1F44B}. You can provide a way better UX than this " +
                "when your app is running \`clientLoader\` functions on hydration. " +
                "Check out https://remix.run/route/hydrate-fallback for more information."
              );
            `}}))}function Ct(e){let t={};return Object.values(e).forEach(r=>{let n=r.parentId||"";t[n]||(t[n]=[]),t[n].push(r)}),t}function vr(e,t,r){let n=Ot(t),o=t.HydrateFallback&&(!r||e.id==="root")?t.HydrateFallback:e.id==="root"?Lt:void 0,a=t.ErrorBoundary?t.ErrorBoundary:e.id==="root"?()=>j.createElement(Pe,{error:ye()}):void 0;return e.id==="root"&&t.Layout?{...n?{element:j.createElement(t.Layout,null,j.createElement(n,null))}:{Component:n},...a?{errorElement:j.createElement(t.Layout,null,j.createElement(a,null))}:{ErrorBoundary:a},...o?{hydrateFallbackElement:j.createElement(t.Layout,null,j.createElement(o,null))}:{HydrateFallback:o}}:{Component:n,ErrorBoundary:a,HydrateFallback:o}}function $t(e,t,r,n,o,a){return ce(t,r,n,o,a,"",Ct(t),e)}function ue(e,t,r){if(r){let l=`You cannot call ${e==="action"?"serverAction()":"serverLoader()"} in SPA Mode (routeId: "${t.id}")`;throw console.error(l),new T(400,"Bad Request",new Error(l),!0)}let o=`You are trying to call ${e==="action"?"serverAction()":"serverLoader()"} on a route that does not have a server ${e} (routeId: "${t.id}")`;if(e==="loader"&&!t.hasLoader||e==="action"&&!t.hasAction)throw console.error(o),new T(400,"Bad Request",new Error(o),!0)}function Fe(e,t){let r=e==="clientAction"?"a":"an",n=`Route "${t}" does not have ${r} ${e}, but you are trying to submit to it. To fix this, please add ${r} \`${e}\` function to the route`;throw console.error(n),new T(405,"Method Not Allowed",new Error(n),!0)}function ce(e,t,r,n,o,a="",l=Ct(e),i){return(l[a]||[]).map(s=>{let u=t[s.id];async function f(_,R,L){if(typeof L=="function")return await L();let S=await xr(_,s);return R?Sr(S):S}function d(_,R,L){return s.hasLoader?f(_,R,L):Promise.resolve(null)}function m(_,R,L){if(!s.hasAction)throw Fe("action",s.id);return f(_,R,L)}async function p(_){let R=t[s.id],L=R?ge(s,R):Promise.resolve();try{return _()}finally{await L}}let h={id:s.id,index:s.index,path:s.path};if(u){var w,g,x;Object.assign(h,{...h,...vr(s,u,o),handle:u.handle,shouldRevalidate:i?kt(s.id,u.shouldRevalidate,i):u.shouldRevalidate});let _=r==null||(w=r.loaderData)===null||w===void 0?void 0:w[s.id],R=r==null||(g=r.errors)===null||g===void 0?void 0:g[s.id],L=i==null&&(((x=u.clientLoader)===null||x===void 0?void 0:x.hydrate)===!0||!s.hasLoader);h.loader=async({request:S,params:y},v)=>{try{return await p(async()=>($(u,"No `routeModule` available for critical-route loader"),u.clientLoader?u.clientLoader({request:S,params:y,async serverLoader(){if(ue("loader",s,o),L){if(R!==void 0)throw R;return _}return d(S,!0,v)}}):o?null:d(S,!1,v)))}finally{L=!1}},h.loader.hydrate=Te(s,u,o),h.action=({request:S,params:y},v)=>p(async()=>{if($(u,"No `routeModule` available for critical-route action"),!u.clientAction){if(o)throw Fe("clientAction",s.id);return m(S,!1,v)}return u.clientAction({request:S,params:y,async serverAction(){return ue("action",s,o),m(S,!0,v)}})})}else s.hasClientLoader||(h.loader=({request:_},R)=>p(()=>o?Promise.resolve(null):d(_,!1,R))),s.hasClientAction||(h.action=({request:_},R)=>p(()=>{if(o)throw Fe("clientAction",s.id);return m(_,!1,R)})),h.lazy=async()=>{let _=await Er(s,t),R={..._};if(_.clientLoader){let L=_.clientLoader;R.loader=(S,y)=>L({...S,async serverLoader(){return ue("loader",s,o),d(S.request,!0,y)}})}if(_.clientAction){let L=_.clientAction;R.action=(S,y)=>L({...S,async serverAction(){return ue("action",s,o),m(S.request,!0,y)}})}return i&&(R.shouldRevalidate=kt(s.id,_.shouldRevalidate,i)),{...R.loader?{loader:R.loader}:{},...R.action?{action:R.action}:{},hasErrorBoundary:R.hasErrorBoundary,shouldRevalidate:R.shouldRevalidate,handle:R.handle,Component:R.Component,ErrorBoundary:R.ErrorBoundary}};let O=ce(e,t,r,n,o,s.id,l,i);return O.length>0&&(h.children=O),h})}function kt(e,t,r){let n=!1;return o=>n?t?t(o):o.defaultShouldRevalidate:(n=!0,r.has(e))}async function Er(e,t){let r=await Q(e,t);return await ge(e,r),{Component:Ot(r),ErrorBoundary:r.ErrorBoundary,clientAction:r.clientAction,clientLoader:r.clientLoader,handle:r.handle,links:r.links,meta:r.meta,shouldRevalidate:r.shouldRevalidate}}async function xr(e,t){let r=await Le(e,t.id);if(r instanceof Error)throw r;if(dt(r))throw br(r);if(ct(r))throw r;return ft(r)&&r.body?await ht(r.body):r}function Sr(e){if(mt(e))return e.data;if(be(e)){let t=e.headers.get("Content-Type");return t&&/\bapplication\/json\b/.test(t)?e.json():e.text()}return e}function br(e){let t=parseInt(e.headers.get("X-Remix-Status"),10)||302,r=e.headers.get("X-Remix-Redirect"),n={},o=e.headers.get("X-Remix-Revalidate");o&&(n["X-Remix-Revalidate"]=o);let a=e.headers.get("X-Remix-Reload-Document");return a&&(n["X-Remix-Reload-Document"]=a),q(r,{status:t,headers:n})}function Ot(e){if(e.default==null)return;if(!(typeof e.default=="object"&&Object.keys(e.default).length===0))return e.default}function Te(e,t,r){return r&&e.id!=="root"||t.clientLoader!=null&&(t.clientLoader.hydrate===!0||e.hasLoader!==!0)}var H,A,je=!1;var He,Fn=new Promise(e=>{He=e}).catch(()=>{});function Lr(e){if(!A){let a=window.__remixContext.url,l=window.location.pathname;if(a!==l&&!window.__remixContext.isSpaMode){let u=`Initial URL (${a}) does not match URL at time of hydration (${l}), reloading page...`;return console.error(u),window.location.reload(),k.createElement(k.Fragment,null)}if(window.__remixContext.future.unstable_singleFetch){if(!H){let u=window.__remixContext.stream;$(u,"No stream found for single fetch decoding"),window.__remixContext.stream=void 0,H=Ne(u,window).then(f=>{window.__remixContext.state=f.value,H.value=!0}).catch(f=>{H.error=f})}if(H.error)throw H.error;if(!H.value)throw H}let i=ce(window.__remixManifest.routes,window.__remixRouteModules,window.__remixContext.state,window.__remixContext.future,window.__remixContext.isSpaMode),s;if(!window.__remixContext.isSpaMode){s={...window.__remixContext.state,loaderData:{...window.__remixContext.state.loaderData}};let u=z(i,window.location);if(u)for(let f of u){let d=f.route.id,m=window.__remixRouteModules[d],p=window.__remixManifest.routes[d];m&&Te(p,m,window.__remixContext.isSpaMode)&&(m.HydrateFallback||!p.hasLoader)?s.loaderData[d]=void 0:p&&!p.hasLoader&&(s.loaderData[d]=null)}s&&s.errors&&(s.errors=bt(s.errors))}A=ze({routes:i,history:Ue(),basename:window.__remixContext.basename,future:{v7_normalizeFormMethod:!0,v7_fetcherPersist:window.__remixContext.future.v3_fetcherPersist,v7_partialHydration:!0,v7_prependBasename:!0,v7_relativeSplatPath:window.__remixContext.future.v3_relativeSplatPath,unstable_skipActionErrorRevalidation:window.__remixContext.future.unstable_singleFetch===!0},hydrationData:s,mapRouteProperties:Ge,unstable_dataStrategy:window.__remixContext.future.unstable_singleFetch?wt(window.__remixManifest,window.__remixRouteModules):void 0}),A.state.initialized&&(je=!0,A.initialize()),A.createRoutesForHMR=$t,window.__remixRouter=A,He&&He(A)}let[t,r]=k.useState(void 0),[n,o]=k.useState(A.state.location);return k.useLayoutEffect(()=>{je||(je=!0,A.initialize())},[]),k.useLayoutEffect(()=>A.subscribe(a=>{a.location!==n&&o(a.location)}),[n]),k.createElement(k.Fragment,null,k.createElement(K.Provider,{value:{manifest:window.__remixManifest,routeModules:window.__remixRouteModules,future:window.__remixContext.future,criticalCss:t,isSpaMode:window.__remixContext.isSpaMode}},k.createElement(se,{location:n},k.createElement(We,{router:A,fallbackElement:null,future:{v7_startTransition:!0}}))),window.__remixContext.future.unstable_singleFetch?k.createElement(k.Fragment,null):null)}B();var de=U(J());B();var Mt="positions";function kr({getKey:e,...t}){let{isSpaMode:r}=P(),n=V(),o=we();Ze({getKey:e,storageKey:Mt});let a=de.useMemo(()=>{if(!e)return null;let i=e(n,o);return i!==n.key?i:null},[]);if(r)return null;let l=((i,s)=>{if(!window.history.state||!window.history.state.key){let u=Math.random().toString(32).slice(2);window.history.replaceState({key:u},"")}try{let f=JSON.parse(sessionStorage.getItem(i)||"{}")[s||window.history.state.key];typeof f=="number"&&window.scrollTo(0,f)}catch(u){console.error(u),sessionStorage.removeItem(i)}}).toString();return de.createElement("script",E({},t,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${l})(${JSON.stringify(Mt)}, ${JSON.stringify(a)})`}}))}export{hr as a,yr as b,De as c,Lr as d,kr as e};
/*! Bundled license information:

@remix-run/react/dist/esm/_virtual/_rollupPluginBabelHelpers.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/invariant.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/routeModules.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/links.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/markup.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/server-runtime/dist/esm/single-fetch.js:
  (**
   * @remix-run/server-runtime v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/server-runtime/dist/esm/index.js:
  (**
   * @remix-run/server-runtime v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/data.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/single-fetch.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/components.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/errorBoundaries.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/errors.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/fallback.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/routes.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/browser.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/scroll-restoration.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@remix-run/react/dist/esm/index.js:
  (**
   * @remix-run/react v2.9.2
   *
   * Copyright (c) Remix Software Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
