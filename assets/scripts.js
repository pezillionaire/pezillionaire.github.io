var app=function(){"use strict";function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function h(){return Object.create(null)}function m(t){t.forEach(n)}function o(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function i(e,n,h){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const h=e.subscribe(...n);return h.unsubscribe?()=>h.unsubscribe():h}(n,h))}function r(t,n,h,m){return t[1]&&m?e(h.ctx.slice(),t[1](m(n))):h.ctx}function l(t,e,n,h,m,o,c){const i=function(t,e,n,h){if(t[2]&&h){const m=t[2](h(n));if(void 0===e.dirty)return m;if("object"==typeof m){const t=[],n=Math.max(e.dirty.length,m.length);for(let h=0;h<n;h+=1)t[h]=e.dirty[h]|m[h];return t}return e.dirty|m}return e.dirty}(e,h,m,o);if(i){const m=r(e,n,h,c);t.p(m,i)}}function s(t,e,n=e){return t.set(n),e}function a(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function v(t){t.parentNode.removeChild(t)}function p(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function f(t){return document.createElement(t)}function d(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function g(t){return document.createTextNode(t)}function $(){return g(" ")}function w(){return g("")}function y(t,e,n,h){return t.addEventListener(e,n,h),()=>t.removeEventListener(e,n,h)}function x(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function b(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function z(t,e,n,h){t.style.setProperty(e,n,h?"important":"")}function V(t,e,n){t.classList[n?"add":"remove"](e)}let k;function H(t){k=t}function M(){if(!k)throw new Error("Function called outside component initialization");return k}function _(t){M().$$.on_mount.push(t)}function E(){const t=M();return(e,n)=>{const h=t.$$.callbacks[e];if(h){const m=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);h.slice().forEach((e=>{e.call(t,m)}))}}}const C=[],I=[],S=[],T=[],B=Promise.resolve();let P=!1;function L(t){S.push(t)}let N=!1;const j=new Set;function A(){if(!N){N=!0;do{for(let t=0;t<C.length;t+=1){const e=C[t];H(e),O(e.$$)}for(H(null),C.length=0;I.length;)I.pop()();for(let t=0;t<S.length;t+=1){const e=S[t];j.has(e)||(j.add(e),e())}S.length=0}while(C.length);for(;T.length;)T.pop()();P=!1,N=!1,j.clear()}}function O(t){if(null!==t.fragment){t.update(),m(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(L)}}const G=new Set;let D;function q(){D={r:0,c:[],p:D}}function J(){D.r||m(D.c),D=D.p}function R(t,e){t&&t.i&&(G.delete(t),t.i(e))}function Y(t,e,n,h){if(t&&t.o){if(G.has(t))return;G.add(t),D.c.push((()=>{G.delete(t),h&&(n&&t.d(1),h())})),t.o(e)}}const F="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;function W(t,e){const n={},h={},m={$$scope:1};let o=t.length;for(;o--;){const c=t[o],i=e[o];if(i){for(const t in c)t in i||(h[t]=1);for(const t in i)m[t]||(n[t]=i[t],m[t]=1);t[o]=i}else for(const t in c)m[t]=1}for(const t in h)t in n||(n[t]=void 0);return n}function X(t){return"object"==typeof t&&null!==t?t:{}}function K(t){t&&t.c()}function Q(t,e,h){const{fragment:c,on_mount:i,on_destroy:r,after_update:l}=t.$$;c&&c.m(e,h),L((()=>{const e=i.map(n).filter(o);r?r.push(...e):m(e),t.$$.on_mount=[]})),l.forEach(L)}function U(t,e){const n=t.$$;null!==n.fragment&&(m(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Z(t,e){-1===t.$$.dirty[0]&&(C.push(t),P||(P=!0,B.then(A)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function tt(e,n,o,c,i,r,l=[-1]){const s=k;H(e);const a=n.props||{},u=e.$$={fragment:null,ctx:null,props:r,update:t,not_equal:i,bound:h(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(s?s.$$.context:[]),callbacks:h(),dirty:l,skip_bound:!1};let p=!1;if(u.ctx=o?o(e,a,((t,n,...h)=>{const m=h.length?h[0]:n;return u.ctx&&i(u.ctx[t],u.ctx[t]=m)&&(!u.skip_bound&&u.bound[t]&&u.bound[t](m),p&&Z(e,t)),n})):[],u.update(),p=!0,m(u.before_update),u.fragment=!!c&&c(u.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);u.fragment&&u.fragment.l(t),t.forEach(v)}else u.fragment&&u.fragment.c();n.intro&&R(e.$$.fragment),Q(e,n.target,n.anchor),A()}H(s)}class et{$destroy(){U(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const nt=[];function ht(e,n=t){let h;const m=[];function o(t){if(c(e,t)&&(e=t,h)){const t=!nt.length;for(let t=0;t<m.length;t+=1){const n=m[t];n[1](),nt.push(n,e)}if(t){for(let t=0;t<nt.length;t+=2)nt[t][0](nt[t+1]);nt.length=0}}}return{set:o,update:function(t){o(t(e))},subscribe:function(c,i=t){const r=[c,i];return m.push(r),1===m.length&&(h=n(o)||t),c(e),()=>{const t=m.indexOf(r);-1!==t&&m.splice(t,1),0===m.length&&(h(),h=null)}}}}const mt=ht([{name:"Pez",component:"Menu",active:!1,svg:"<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><path class='svg-fill-prime' d='M4 60v-4h4v-4h4v-4h4v-8h-4v-4H8V24h4v-4H8v-4h4v-4h4V8h4V4h8v4h4V4h12v4h4v4h4v4h4v20h-4v4h-4v8h4v4h4v4h4v8h-4v-8h-4v-4H40v4H24v-4H12v4H8v8H4v-4zm36-10v-2h4v-8h4v-4h4V16h-4v-4h-4V8H32v4h-4V8h-8v4h-4v4h-4v4h4v4h-4v12h4v4h4v8h4v4h16v-2zm-16-6v-4h-4v-4h-4v-4h4v-4h-4v-4h4v-4h-4v-4h4v-4h4v4h-4v4h4v4h4v-4h4v4h8v-4h-4v-4h4v-4h4v4h4v4h-4v4h4v4h-4v4h4v4h-4v4h-4v8h-4V36h4v-4h-4v-4H24v4h-4v4h8v12h-4v-4zm0-18v-2h-4v4h4v-2zm20 0v-2h-4v4h4v-2zm0-8v-2h-4v4h4v-2zM16 62v-2h4v4h-4v-2zm28 0v-2h4v4h-4v-2z'/></svg>",items:[{name:"Resume",type:"link",url:"https://github.com/pezillionaire/resume"},{name:"Contact",type:"link",url:"https://github.com/pezillionaire/resume"},{name:"This Does Nothing… Yet!",type:"action"}]},{name:"Stuff",component:"Menu",active:!1,items:[{name:"Gifl.ink",type:"link",url:"http://gifl.ink"},{name:"Peak Design System",type:"link",url:"https://peak.wealth.bar"}]},{name:"Theme",component:"SelectMenu",active:!1,items:[{name:"harmony",type:"select",active:!0,primary:"#0466c8",alt:"#e2e7ed"},{name:"alpinglow",type:"select",active:!1,primary:"#480ca8",alt:"#ffc8dd"},{name:"overcast",type:"select",active:!1,primary:"#222",alt:"#bfb8b9"},{name:"creekside",type:"select",active:!1,primary:"#006d77",alt:"#edf6f9"}]}]),ot=ht(!1);function ct(e){let n,h,m,c,i,r,l,s,p=e[0].name+"",d=e[1]?"✓":"";return{c(){n=f("button"),h=f("span"),m=g(p),c=$(),i=f("span"),r=g(d),x(h,"class","svelte-doxoaw"),x(i,"class","menuitem icon svelte-doxoaw"),x(n,"type","button"),x(n,"class","svelte-doxoaw")},m(t,v){u(t,n,v),a(n,h),a(h,m),a(n,c),a(n,i),a(i,r),l||(s=y(n,"click",(function(){o(e[2](e[0]))&&e[2](e[0]).apply(this,arguments)})),l=!0)},p(t,[n]){e=t,1&n&&p!==(p=e[0].name+"")&&b(m,p),2&n&&d!==(d=e[1]?"✓":"")&&b(r,d)},i:t,o:t,d(t){t&&v(n),l=!1,s()}}}function it(t,e,n){const h=E();let{index:m}=e,{item:o}=e,c=o.active;return t.$$set=t=>{"index"in t&&n(3,m=t.index),"item"in t&&n(0,o=t.item)},t.$$.update=()=>{t.$$.dirty,t.$$.dirty},[o,c,function(t){n(1,c=!c),t.active=!t.active,h("action",{item:t,index:m})},m]}class rt extends et{constructor(t){super(),tt(this,t,it,ct,c,{index:3,item:0})}}function lt(e){let n,h,m,o,c;return{c(){n=f("a"),h=f("span"),m=g(e[0]),o=$(),c=f("span"),c.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path class="svg-fill-prime" d="M0 7V0h8v4H6V2H2v10h4v-2h2v4H0V7zm10 3V8H4V6h6V2h2v2h2v2h2v2h-2v2h-2v2h-2v-2z"></path></svg>',x(c,"class","menuitem icon"),x(n,"href",e[1])},m(t,e){u(t,n,e),a(n,h),a(h,m),a(n,o),a(n,c)},p(t,[e]){1&e&&b(m,t[0]),2&e&&x(n,"href",t[1])},i:t,o:t,d(t){t&&v(n)}}}function st(t,e,n){let{name:h}=e,{type:m}=e,{url:o}=e;return t.$$set=t=>{"name"in t&&n(0,h=t.name),"type"in t&&n(2,m=t.type),"url"in t&&n(1,o=t.url)},t.$$.update=()=>{t.$$.dirty,t.$$.dirty,t.$$.dirty},[h,o,m]}class at extends et{constructor(t){super(),tt(this,t,st,lt,c,{name:0,type:2,url:1})}}function ut(t,e,n){const h=t.slice();return h[8]=e[n],h[10]=n,h}function vt(t){let e,n,h=t[1].items,m=[];for(let e=0;e<h.length;e+=1)m[e]=gt(ut(t,h,e));const o=t=>Y(m[t],1,1,(()=>{m[t]=null}));return{c(){e=f("ul");for(let t=0;t<m.length;t+=1)m[t].c()},m(t,h){u(t,e,h);for(let t=0;t<m.length;t+=1)m[t].m(e,null);n=!0},p(t,n){if(2&n){let c;for(h=t[1].items,c=0;c<h.length;c+=1){const o=ut(t,h,c);m[c]?(m[c].p(o,n),R(m[c],1)):(m[c]=gt(o),m[c].c(),R(m[c],1),m[c].m(e,null))}for(q(),c=h.length;c<m.length;c+=1)o(c);J()}},i(t){if(!n){for(let t=0;t<h.length;t+=1)R(m[t]);n=!0}},o(t){m=m.filter(Boolean);for(let t=0;t<m.length;t+=1)Y(m[t]);n=!1},d(t){t&&v(e),p(m,t)}}}function pt(e){let n,h;return n=new rt({props:{item:e[8],index:e[10]}}),n.$on("action",e[5]),{c(){K(n.$$.fragment)},m(t,e){Q(n,t,e),h=!0},p:t,i(t){h||(R(n.$$.fragment,t),h=!0)},o(t){Y(n.$$.fragment,t),h=!1},d(t){U(n,t)}}}function ft(t){let n,h;const m=[t[8]];let o={};for(let t=0;t<m.length;t+=1)o=e(o,m[t]);return n=new at({props:o}),{c(){K(n.$$.fragment)},m(t,e){Q(n,t,e),h=!0},p(t,e){const h=2&e?W(m,[X(t[8])]):{};n.$set(h)},i(t){h||(R(n.$$.fragment,t),h=!0)},o(t){Y(n.$$.fragment,t),h=!1},d(t){U(n,t)}}}function dt(t){let n,h;const m=[t[8]];let o={};for(let t=0;t<m.length;t+=1)o=e(o,m[t]);return n=new yt({props:o}),{c(){K(n.$$.fragment)},m(t,e){Q(n,t,e),h=!0},p(t,e){const h=2&e?W(m,[X(t[8])]):{};n.$set(h)},i(t){h||(R(n.$$.fragment,t),h=!0)},o(t){Y(n.$$.fragment,t),h=!1},d(t){U(n,t)}}}function gt(t){let e,n,h,m,o;const c=[dt,ft,pt],i=[];return n=function(t,e){return"folder"===t[8].type?0:"link"===t[8].type?1:2}(t),h=i[n]=c[n](t),{c(){e=f("li"),h.c(),m=$(),x(e,":class",t[8].type)},m(t,h){u(t,e,h),i[n].m(e,null),a(e,m),o=!0},p(t,e){h.p(t,e)},i(t){o||(R(h),o=!0)},o(t){Y(h),o=!1},d(t){t&&v(e),i[n].d()}}}function $t(e){let n,h,o,c,i,r,l,s=e[1].svg&&function(e){let n,h=e[1].svg+"";return{c(){n=f("span"),x(n,"class","menu-svgicon svelte-16l818a")},m(t,e){u(t,n,e),n.innerHTML=h},p:t,d(t){t&&v(n)}}}(e),p=e[1].name&&function(e){let n,h,m=e[1].name+"";return{c(){var t;n=f("span"),h=g(m),x(n,"class",(null==(t="menu-name "+(e[1].svg?"hidden":""))?"":t)+" svelte-16l818a")},m(t,e){u(t,n,e),a(n,h)},p:t,d(t){t&&v(n)}}}(e),d=e[0]&&vt(e);return{c(){n=f("menu"),h=f("button"),s&&s.c(),o=$(),p&&p.c(),c=$(),d&&d.c(),V(h,"active",e[0])},m(t,m){u(t,n,m),a(n,h),s&&s.m(h,null),a(h,o),p&&p.m(h,null),a(n,c),d&&d.m(n,null),i=!0,r||(l=[y(h,"click",e[2]),y(h,"mouseenter",e[3])],r=!0)},p(t,[e]){t[1].svg&&s.p(t,e),t[1].name&&p.p(t,e),1&e&&V(h,"active",t[0]),t[0]?d?(d.p(t,e),1&e&&R(d,1)):(d=vt(t),d.c(),R(d,1),d.m(n,null)):d&&(q(),Y(d,1,1,(()=>{d=null})),J())},i(t){i||(R(d),i=!0)},o(t){Y(d),i=!1},d(t){t&&v(n),s&&s.d(),p&&p.d(),d&&d.d(),r=!1,m(l)}}}function wt(t,e,n){let h,m;i(t,mt,(t=>n(6,h=t))),i(t,ot,(t=>n(7,m=t)));let{menuIndex:o}=e;const c=h[o];let r=!1;mt.subscribe((t=>{n(0,r=t[o].active)}));const l=t=>{n(0,r=!1===t||!0===t?t:!r),s(mt,h[o].active=r,h),s(ot,m=r,m),h.forEach(((t,e)=>{e!==o&&(t.active=!1)})),mt.set(h)};return t.$$set=t=>{"menuIndex"in t&&n(4,o=t.menuIndex)},t.$$.update=()=>{t.$$.dirty},[r,c,l,()=>{m&!r&&l()},o,function(e){!function(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t(e)))}(t,e)}]}class yt extends et{constructor(t){super(),tt(this,t,wt,$t,c,{menuIndex:4})}}function xt(t,e,n){const h=t.slice();return h[12]=e[n].name,h[13]=e[n].active,h[15]=n,h}function bt(t){let e,n=t[0],h=[];for(let e=0;e<n.length;e+=1)h[e]=Vt(xt(t,n,e));return{c(){e=f("ul");for(let t=0;t<h.length;t+=1)h[t].c();x(e,"role","menu")},m(t,n){u(t,e,n);for(let t=0;t<h.length;t+=1)h[t].m(e,null)},p(t,m){if(33&m){let o;for(n=t[0],o=0;o<n.length;o+=1){const c=xt(t,n,o);h[o]?h[o].p(c,m):(h[o]=Vt(c),h[o].c(),h[o].m(e,null))}for(;o<h.length;o+=1)h[o].d(1);h.length=n.length}},d(t){t&&v(e),p(h,t)}}}function zt(t){let e,n;return{c(){e=d("svg"),n=d("path"),x(n,"d","M4 13v-1H2v-2H0V6h2v2h2v2h2V8h2V6h2V4h2V2h2V0h2v4h-2v2h-2v2h-2v2H8v2H6v2H4z"),x(e,"xmlns","http://www.w3.org/2000/svg"),x(e,"viewBox","0 0 16 16"),x(e,"shape-rendering","crispEdges"),x(e,"class","svg-fill")},m(t,h){u(t,e,h),a(e,n)},d(t){t&&v(e)}}}function Vt(t){let e,n,h,m,o,c,i,r,l,s=t[12]+"",p=t[13]&&zt();function d(){return t[7](t[15])}return{c(){e=f("li"),n=f("button"),h=f("span"),m=g(s),o=$(),c=f("span"),p&&p.c(),i=$(),x(c,"class","menuitem icon"),x(n,"type","button")},m(t,s){u(t,e,s),a(e,n),a(n,h),a(h,m),a(n,o),a(n,c),p&&p.m(c,null),a(e,i),r||(l=y(n,"click",d,{once:!0}),r=!0)},p(e,n){t=e,1&n&&s!==(s=t[12]+"")&&b(m,s),t[13]?p||(p=zt(),p.c(),p.m(c,null)):p&&(p.d(1),p=null)},d(t){t&&v(e),p&&p.d(),r=!1,l()}}}function kt(e){let n,h,o,c,i,r=e[1]&&bt(e);return{c(){n=f("menu"),h=f("button"),h.textContent=`${e[2].name}`,o=$(),r&&r.c(),x(h,"type","button"),V(h,"active",e[1])},m(t,m){u(t,n,m),a(n,h),a(n,o),r&&r.m(n,null),c||(i=[y(h,"click",e[3]),y(h,"mouseenter",e[4])],c=!0)},p(t,[e]){2&e&&V(h,"active",t[1]),t[1]?r?r.p(t,e):(r=bt(t),r.c(),r.m(n,null)):r&&(r.d(1),r=null)},i:t,o:t,d(t){t&&v(n),r&&r.d(),c=!1,m(i)}}}function Ht(t,e,n){let h,m;i(t,mt,(t=>n(8,h=t))),i(t,ot,(t=>n(9,m=t)));let{menuIndex:o}=e;const c=h[o],r=h[o].items;let l=!1;mt.subscribe((t=>{n(1,l=t[o].active)}));const a=t=>{r.forEach((t=>{t.active=!1})),n(0,r[t].active=!0,r),localStorage.clear(),localStorage.setItem("theme",JSON.stringify(r[t]));const e=document.querySelector(":root");e.style.setProperty("--primary",r[t].primary),e.style.setProperty("--alt",r[t].alt)},u=t=>{n(1,l=!1===t||!0===t?t:!l),s(mt,h[o].active=l,h),s(ot,m=l,m),h.forEach(((t,e)=>{e!==o&&(t.active=!1)})),mt.set(h)},v=t=>{n(0,r[t].active=!0,r),a(t),setTimeout((()=>{u(!1)}),200)};_((async()=>{(()=>{if(""==localStorage.getItem("theme"))return 0;{const t=JSON.parse(localStorage.getItem("theme")),e=e=>e.name===t.name;a(r.findIndex(e))}})()}));return t.$$set=t=>{"menuIndex"in t&&n(6,o=t.menuIndex)},t.$$.update=()=>{t.$$.dirty},[r,l,c,u,()=>{m&!l&&u()},v,o,t=>v(t)]}class Mt extends et{constructor(t){super(),tt(this,t,Ht,kt,c,{menuIndex:6})}}function _t(t,e,n){const h=t.slice();return h[4]=e[n],h[6]=n,h}function Et(t){let e,n,h;var m=t[2][t[4].component];function o(t){return{props:{menuIndex:t[6]}}}return m&&(e=new m(o(t))),{c(){e&&K(e.$$.fragment),n=w()},m(t,m){e&&Q(e,t,m),u(t,n,m),h=!0},p(t,h){if(m!==(m=t[2][t[4].component])){if(e){q();const t=e;Y(t.$$.fragment,1,0,(()=>{U(t,1)})),J()}m?(e=new m(o(t)),K(e.$$.fragment),R(e.$$.fragment,1),Q(e,n.parentNode,n)):e=null}},i(t){h||(e&&R(e.$$.fragment,t),h=!0)},o(t){e&&Y(e.$$.fragment,t),h=!1},d(t){t&&v(n),e&&U(e,t)}}}function Ct(e){let n,h,m;return{c(){n=f("div"),x(n,"class","click-capture svelte-le7meu")},m(t,o){u(t,n,o),h||(m=y(n,"click",e[3],{once:!0}),h=!0)},p:t,d(t){t&&v(n),h=!1,m()}}}function It(t){let e,n,h,m,o=t[1],c=[];for(let e=0;e<o.length;e+=1)c[e]=Et(_t(t,o,e));const i=t=>Y(c[t],1,1,(()=>{c[t]=null}));let r=t[0]&&Ct(t);return{c(){e=f("nav");for(let t=0;t<c.length;t+=1)c[t].c();n=$(),r&&r.c(),h=w(),x(e,"role","navigation")},m(t,o){u(t,e,o);for(let t=0;t<c.length;t+=1)c[t].m(e,null);u(t,n,o),r&&r.m(t,o),u(t,h,o),m=!0},p(t,[n]){if(6&n){let h;for(o=t[1],h=0;h<o.length;h+=1){const m=_t(t,o,h);c[h]?(c[h].p(m,n),R(c[h],1)):(c[h]=Et(m),c[h].c(),R(c[h],1),c[h].m(e,null))}for(q(),h=o.length;h<c.length;h+=1)i(h);J()}t[0]?r?r.p(t,n):(r=Ct(t),r.c(),r.m(h.parentNode,h)):r&&(r.d(1),r=null)},i(t){if(!m){for(let t=0;t<o.length;t+=1)R(c[t]);m=!0}},o(t){c=c.filter(Boolean);for(let t=0;t<c.length;t+=1)Y(c[t]);m=!1},d(t){t&&v(e),p(c,t),t&&v(n),r&&r.d(t),t&&v(h)}}}function St(t,e,n){let h,m;i(t,ot,(t=>n(0,h=t))),i(t,mt,(t=>n(1,m=t)));return[h,m,{SelectMenu:Mt,Menu:yt},()=>{s(ot,h=!1,h),m.forEach((t=>{t.active=!1})),mt.set(m)}]}class Tt extends et{constructor(t){super(),tt(this,t,St,It,c,{})}}function Bt(e){let n,h,m,o,c,i;return{c(){n=f("div"),h=f("time"),m=g(e[3]),o=g(e[1]),c=g(e[2]),i=g(e[4]),x(h,"datetime",e[0]),x(n,"id","clock")},m(t,e){u(t,n,e),a(n,h),a(h,m),a(h,o),a(h,c),a(h,i)},p(t,[e]){8&e&&b(m,t[3]),2&e&&b(o,t[1]),4&e&&b(c,t[2]),16&e&&b(i,t[4]),1&e&&x(h,"datetime",t[0])},i:t,o:t,d(t){t&&v(n)}}}function Pt(t,e,n){let h,m,o,c=new Date,i=":";return _((()=>{setInterval((()=>{n(0,c=new Date),n(1,i=":"==i?" ":":")}),1e3)})),t.$$.update=()=>{1&t.$$.dirty&&n(2,h=("0"+c.getMinutes()).slice(-2)),1&t.$$.dirty&&n(3,m=c.getHours()<12?c.getHours():c.getHours()-12),1&t.$$.dirty&&n(4,o=c.getHours()<12?" AM":" PM")},[c,i,h,m,o]}class Lt extends et{constructor(t){super(),tt(this,t,Pt,Bt,c,{})}}const{window:Nt}=F;function jt(t){let e,n,h,o,c,i,s,p,d,w,V,k;const H=t[9].default,M=function(t,e,n,h){if(t){const m=r(t,e,n,h);return t[0](m)}}(H,t,t[8],null);return{c(){e=f("div"),n=f("header"),h=f("button"),h.textContent="close modal",o=$(),c=f("div"),i=f("h2"),s=g(t[0]),p=$(),d=f("section"),M&&M.c(),x(h,"type","button"),x(h,"class","window-close"),x(c,"class","window-title"),x(n,"class","window-header"),x(d,"class","window-main"),x(e,"class","window"),z(e,"left",t[2].left+"px"),z(e,"top",t[2].top+"px")},m(m,r){u(m,e,r),a(e,n),a(n,h),a(n,o),a(n,c),a(c,i),a(i,s),a(e,p),a(e,d),M&&M.m(d,null),t[10](e),w=!0,V||(k=[y(Nt,"keydown",t[7]),y(Nt,"mouseup",t[5]),y(Nt,"mousemove",t[6]),y(h,"click",t[3]),y(n,"mousedown",t[4])],V=!0)},p(t,[n]){(!w||1&n)&&b(s,t[0]),M&&M.p&&256&n&&l(M,H,t,t[8],n,null,null),(!w||4&n)&&z(e,"left",t[2].left+"px"),(!w||4&n)&&z(e,"top",t[2].top+"px")},i(t){w||(R(M,t),w=!0)},o(t){Y(M,t),w=!1},d(n){n&&v(e),M&&M.d(n),t[10](null),V=!1,m(k)}}}function At(t,e,n){let{$$slots:h={},$$scope:m}=e;const o=E(),c=()=>o("close");let i,r={top:16,left:16,moving:!1};const l="undefined"!=typeof document&&document.activeElement;var s;l&&(s=()=>{l.focus()},M().$$.on_destroy.push(s));let{title:a="title"}=e;return t.$$set=t=>{"title"in t&&n(0,a=t.title),"$$scope"in t&&n(8,m=t.$$scope)},[a,i,r,c,function(){n(2,r.moving=!0,r)},function(){n(2,r.moving=!1,r),r.left<=0&&n(2,r.left=0,r),r.top<=0&&n(2,r.top=0,r)},function(t){r.moving&&(n(2,r.left+=t.movementX,r),n(2,r.top+=t.movementY,r))},t=>{"Escape"!==t.key||c()},m,h,function(t){I[t?"unshift":"push"]((()=>{i=t,n(1,i)}))}]}class Ot extends et{constructor(t){super(),tt(this,t,At,jt,c,{title:0})}}function Gt(t){let e,n;return e=new Ot({props:{title:"Cartridge",$$slots:{default:[Dt]},$$scope:{ctx:t}}}),e.$on("close",t[3]),{c(){K(e.$$.fragment)},m(t,h){Q(e,t,h),n=!0},p(t,n){const h={};128&n&&(h.$$scope={dirty:n,ctx:t}),e.$set(h)},i(t){n||(R(e.$$.fragment,t),n=!0)},o(t){Y(e.$$.fragment,t),n=!1},d(t){U(e,t)}}}function Dt(t){let e,n,h,m,o,c,i,r,l,s,a,p,d;return{c(){e=f("h1"),e.textContent="Pezillionaire Interactive Manufacturing Concern",n=$(),h=f("p"),h.textContent="Welcome,",m=$(),o=f("p"),o.textContent="This is a website on internet. It is my space to explore coding concepts, play with interaction ideas, and create user experiences.",c=$(),i=f("p"),i.innerHTML='It will be updated randomly. The source can be found <a href="https://github.com/pezillionaire/pezillionaire.github.io" target="_blank">here</a>. Sometimes this site will be up to date – sometimes it will not — this is ok.',r=$(),l=f("p"),l.textContent="This is project an ongoing concern… if you have concerns send me a message.",s=$(),a=f("h4"),a.textContent="— Andrew [Pez] Pengelly",p=$(),d=f("p"),d.textContent="P.S. Garbage links are in the garbage."},m(t,v){u(t,e,v),u(t,n,v),u(t,h,v),u(t,m,v),u(t,o,v),u(t,c,v),u(t,i,v),u(t,r,v),u(t,l,v),u(t,s,v),u(t,a,v),u(t,p,v),u(t,d,v)},d(t){t&&v(e),t&&v(n),t&&v(h),t&&v(m),t&&v(o),t&&v(c),t&&v(i),t&&v(r),t&&v(l),t&&v(s),t&&v(a),t&&v(p),t&&v(d)}}}function qt(t){let e,n;return e=new Ot({props:{title:"Garbage",$$slots:{default:[Jt]},$$scope:{ctx:t}}}),e.$on("close",t[4]),{c(){K(e.$$.fragment)},m(t,h){Q(e,t,h),n=!0},p(t,n){const h={};128&n&&(h.$$scope={dirty:n,ctx:t}),e.$set(h)},i(t){n||(R(e.$$.fragment,t),n=!0)},o(t){Y(e.$$.fragment,t),n=!1},d(t){U(e,t)}}}function Jt(t){let e;return{c(){e=f("div"),e.innerHTML='<a href="https://twitter.com/pezillionaire" class="icon" target="blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path class="svg-prime" d="M2 .4h28m-29 1h30m-31 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h7m1 0h10m4 0h4m1 0h5m-32 1h7m2 0h8m6 0h1m2 0h6m-32 1h7m3 0h6m12 0h4m-32 1h7m5 0h4m10 0h6m-32 1h7m8 0h1m9 0h7m-32 1h8m17 0h7m-32 1h9m16 0h7m-32 1h8m17 0h7m-32 1h9m15 0h8m-32 1h10m14 0h8m-32 1h9m14 0h9m-32 1h10m13 0h9m-32 1h11m11 0h10m-32 1h12m9 0h11m-32 1h11m9 0h12m-32 1h8m10 0h14m-32 1h10m6 0h16m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-31 1h30m-29 1h28"></path><path class="svg-alt" d="M7 8.4h1m10 0h4m4 0h1m-20 1h2m8 0h6m1 0h2m-19 1h3m6 0h12m-21 1h5m4 0h10m-19 1h8m1 0h9m-17 1h17m-16 1h16m-17 1h17m-16 1h15m-14 1h14m-15 1h14m-13 1h13m-12 1h11m-10 1h9m-10 1h9m-12 1h10m-8 1h6"></path></svg> \n            <span>Rants</span></a> \n          <a href="https://github.com/pezillionaire" class="icon" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path class="svg-prime" d="M12 .444h8m-11 1h14m-16 1h18m-19 1h20m-21 1h22m-23 1h24m-25 1h4m1 0h16m1 0h4m-27 1h5m3 0h12m3 0h5m-28 1h5m18 0h5m-29 1h6m18 0h6m-30 1h6m18 0h6m-30 1h6m18 0h6m-31 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h7m18 0h7m-31 1h7m16 0h7m-30 1h8m14 0h8m-30 1h4m1 0h5m10 0h10m-29 1h3m2 0h6m6 0h11m-27 1h3m2 0h5m6 0h10m-26 1h4m12 0h10m-25 1h4m11 0h9m-23 1h8m6 0h8m-21 1h7m6 0h7m-18 1h5m6 0h5m-14 1h3m6 0h3m-10 1h1m6 0h1"></path><path class="svg-alt" d="M7 6.444h1m16 0h1m-18 1h3m12 0h3m-18 1h18m-18 1h18m-18 1h18m-18 1h18m-19 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-19 1h18m-17 1h16m-15 1h14m-18 1h1m5 0h10m-16 1h2m6 0h6m-13 1h2m5 0h6m-12 1h12m-11 1h11m-6 1h6m-6 1h6m-6 1h6m-6 1h6m-6 1h6"></path></svg> \n            <span>Codes</span></a> \n          <a href="https://twitch.tv/pezillionaire" class="icon" target="blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path class="svg-prime" d="M3 .533h29m-29 1h29m-30 1h30m-30 1h4m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m22 0h4m-31 1h5m21 0h4m-30 1h5m20 0h4m-29 1h5m19 0h4m-28 1h11m4 0h12m-27 1h11m3 0h12m-26 1h11m2 0h12m-25 1h11m1 0h12m-24 1h23m-15 1h8m-8 1h6m-6 1h6m-6 1h5"></path><path class="svg-alt" d="M6 3.533h23m-23 1h23m-23 1h23m-23 1h23m-23 1h23m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h23m-23 1h23m-23 1h22m-22 1h21m-21 1h20m-20 1h19m-13 1h4m-4 1h3m-3 1h2m-2 1h1"></path></svg> \n            <span>Games</span></a>',x(e,"class","socials")},m(t,n){u(t,e,n)},d(t){t&&v(e)}}}function Rt(t){let e,n,h,o,c,i,r,l,s,p,d,g,w,b,z,k;n=new Tt({}),n.$on("action",t[2]),o=new Lt({});let H=t[0]&&Gt(t),M=t[1]&&qt(t);return{c(){e=f("header"),K(n.$$.fragment),h=$(),K(o.$$.fragment),c=$(),i=f("main"),r=f("section"),H&&H.c(),l=$(),M&&M.c(),s=$(),p=f("section"),d=f("button"),d.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path class="svg-prime-fill" d="M6 60v-4H4V4h2V2h52v2h2v52h-2v8H6z"></path><path class="svg-alt-fill" d="M10 33V4H6v52h2v6h2V33zm10 27v-2h-8v4h8v-2zm36-1v-3h2V4h-4v40h-2V4H26v40h-2V4h-2v58h34v-3zm-36-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-5V4h-8v4h8V6z"></path><path class="svg-prime-fill" d="M38 57v-1h-2v-2h2v2h2v-2h2v2h-2v2h-2v-1zM26 45v-1h26v2H26v-1zm8-6v-1h-2v-2h-2v-4h4v2h2v2h6v-2h2v-2h4v4h-2v2h-2v2H34v-1zm-2-14v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1zm10 0v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1z"></path><path class="svg-alt-fill" d="M34 16v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1zm10 5v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1z"></path></svg> \n      <span>Cartridge</span>',g=$(),w=f("button"),w.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path class="svg-alt-fill" d="M14 64v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2z"></path><path class="svg-prime-fill" d="M32 64H14v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2H32zm-.002-2h18V10h-36v52h18zM19 58h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zM32 8h20V6H12v2h20zm0-4h6V2H26v2h6z"></path></svg> \n      <span>Garbage</span>',x(e,"role","banner"),x(r,"class","window-layer"),x(d,"type","button"),x(d,"class","icon mac"),V(d,"open",t[0]),x(w,"type","button"),x(w,"class","icon trash"),V(w,"open",t[1]),x(p,"class","desktop-layer"),x(i,"role","main")},m(m,v){u(m,e,v),Q(n,e,null),a(e,h),Q(o,e,null),u(m,c,v),u(m,i,v),a(i,r),H&&H.m(r,null),a(r,l),M&&M.m(r,null),a(i,s),a(i,p),a(p,d),a(p,g),a(p,w),b=!0,z||(k=[y(d,"click",t[5]),y(w,"click",t[6])],z=!0)},p(t,[e]){t[0]?H?(H.p(t,e),1&e&&R(H,1)):(H=Gt(t),H.c(),R(H,1),H.m(r,l)):H&&(q(),Y(H,1,1,(()=>{H=null})),J()),t[1]?M?(M.p(t,e),2&e&&R(M,1)):(M=qt(t),M.c(),R(M,1),M.m(r,null)):M&&(q(),Y(M,1,1,(()=>{M=null})),J()),1&e&&V(d,"open",t[0]),2&e&&V(w,"open",t[1])},i(t){b||(R(n.$$.fragment,t),R(o.$$.fragment,t),R(H),R(M),b=!0)},o(t){Y(n.$$.fragment,t),Y(o.$$.fragment,t),Y(H),Y(M),b=!1},d(t){t&&v(e),U(n),U(o),t&&v(c),t&&v(i),H&&H.d(),M&&M.d(),z=!1,m(k)}}}function Yt(t,e,n){let h=!0,m=!1;return[h,m,t=>console.log(t),()=>n(0,h=!h),()=>n(1,m=!h),()=>n(0,h=!0),()=>n(1,m=!0)]}var Ft;return{app:new class extends et{constructor(t){super(),tt(this,t,Yt,Rt,c,{})}}({target:(Ft=document.querySelector("#app"),Ft.innerHTML="",Ft)})}}();
//# sourceMappingURL=scripts.js.map
