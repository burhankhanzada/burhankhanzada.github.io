import{C as e,S as t,T as n,a as r,b as i,d as a,g as o,l as s,n as c,o as l,r as u,t as d,u as f,v as p,w as m,y as h}from"./web.BFK2eyNI.js";function g(e){let t=e.getBoundingClientRect(),n=()=>{t=e.getBoundingClientRect()},r=new ResizeObserver(n);return r.observe(e),addEventListener(`scroll`,n,{passive:!0,capture:!0}),addEventListener(`resize`,n,{passive:!0}),{get current(){return t},destroy(){r.disconnect(),removeEventListener(`scroll`,n,!0),removeEventListener(`resize`,n)}}}var _=f(`<div style=position:relative><canvas layoutsubtree=true></canvas><!$><!/><canvas aria-hidden=true style=position:absolute;inset:0;width:100%;height:100%;pointer-events:none>`),v=f(`<div style=position:relative;width:100%;height:100%;overflow:auto>`),y={radius:500,softness:.75,size:1,scatter:25,drift:1,aberration:40,bend:50,fade:.85,threshold:.1,background:`#000000`,smoothing:.25},b=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,x=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uContent;
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uPointer;
uniform float uActive;
uniform float uRadius;
uniform float uSoftness;
uniform float uSize;
uniform float uScatter;
uniform float uDrift;
uniform float uAberration;
uniform float uBend;
uniform float uFade;
uniform float uThreshold;
uniform vec3 uBg;
uniform float uTime;
uniform float uMaxX;
uniform float uCrisp;

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec4 samp (vec2 p) {
  vec2 uv = p / uRes;
  uv = clamp(uv, vec2(0.001), vec2(uMaxX - 0.001, 0.999));
  return texture(uContent, uv);
}

void main () {
  vec2 pc = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  if (pc.x > uMaxX * uRes.x) {
    outColor = vec4(0.0);
    return;
  }
  if (uCrisp > 0.5) {
    outColor = samp(pc);
    return;
  }

  float dist = length(pc - uPointer);
  float radius = max(uRadius, 1.0);
  float inner = radius * (1.0 - clamp(uSoftness, 0.02, 1.0));
  float e = (1.0 - smoothstep(inner, radius, dist)) * uActive;

  float band = radius * 0.9;
  float ring = smoothstep(inner, radius, dist)
    * (1.0 - smoothstep(radius, radius + band, dist))
    * uActive;

  vec2 dir = (pc - uPointer) / max(dist, 1e-3);
  vec2 tang = vec2(-dir.y, dir.x);
  vec2 warp = (dir * -1.0 + tang * 0.6) * uBend * ring;
  float ca = uAberration * ring;

  float cellPx = max(uSize, 0.5) * uDpr;
  vec2 cell = floor(gl_FragCoord.xy / cellPx);
  float n1 = hash(cell);
  float n2 = hash(cell + vec2(3.1, 7.7));
  float n3 = hash(cell + vec2(9.3, 1.3));
  float ft = floor(uTime * (2.0 + uDrift * 6.0));
  float n4 = hash(cell + vec2(ft * 0.613, ft * 0.831));

  float g0 = uThreshold * 0.6;
  float g1 = uThreshold * 1.6 + 0.01;
  vec3 lw = vec3(0.299, 0.587, 0.114);

  vec2 bp = pc + warp;
  vec4 bR = samp(bp + dir * ca);
  vec4 bC = samp(bp);
  vec4 bB = samp(bp - dir * ca);
  vec3 baseRgb = vec3(bR.r, bC.g, bB.b);
  float uiHome = smoothstep(g0, g1, dot(abs(baseRgb - uBg), lw));

  float rad = uScatter * pow(n1, 2.5) * (1.0 - e);
  float ang = n2 * 6.2832 + uTime * uDrift * (0.5 + n3 * 1.5);
  vec2 dustP = bp + vec2(cos(ang), sin(ang)) * rad;

  vec4 dR = samp(dustP + dir * ca);
  vec4 dC = samp(dustP);
  vec4 dB = samp(dustP - dir * ca);
  vec3 dustRgb = vec3(dR.r, dC.g, dB.b);
  float lumD = dot(dustRgb, lw);
  float dDust = dot(abs(dustRgb - uBg), lw);

  float gate = smoothstep(g0, g1, dDust);
  float falloff = 1.0 - 0.7 * rad / max(uScatter, 1.0);
  float prob = clamp(gate * (0.15 + 1.2 * sqrt(dDust)) * falloff, 0.0, 1.0) * uiHome;
  float speck = step(n4 * 0.999, prob);

  float shade = pow(lumD, 0.4) * (0.8 + 0.4 * n3);
  vec3 dustCol = mix(uBg, vec3(shade), clamp(uFade, 0.0, 1.0));

  vec3 unrevealed = mix(mix(baseRgb, uBg, uiHome), dustCol, speck);
  vec3 col = mix(unrevealed, baseRgb, e);
  float alpha = mix(bC.a, dC.a, speck * (1.0 - e));
  outColor = vec4(col, alpha);
}`,S=null;function C(e){if(typeof document>`u`)return[0,0,0];if(!S){let e=document.createElement(`canvas`);e.width=1,e.height=1,S=e.getContext(`2d`,{willReadFrequently:!0})}if(!S)return[0,0,0];S.fillStyle=`#000000`,S.fillStyle=e,S.clearRect(0,0,1,1),S.fillRect(0,0,1,1);let t=S.getImageData(0,0,1,1).data;return[t[0]/255,t[1]/255,t[2]/255]}function w(){if(typeof document>`u`)return!1;let e=document.createElement(`canvas`),t=e.getContext(`2d`);return!!(t&&typeof t.drawElementImage==`function`&&typeof e.requestPaint==`function`)}function T(e,t={}){let n={...y,...t},{source:r,content:i,output:a}=e,o=a.getContext(`webgl2`,{alpha:!0,depth:!1,stencil:!1,antialias:!1,premultipliedAlpha:!1});if(!o||o.isContextLost())return null;let s=r.getContext(`2d`),c=r,l=!!(s&&typeof s.drawElementImage==`function`&&typeof c.requestPaint==`function`),u=!1,d=()=>{};l&&(c.onpaint=()=>{try{s.reset(),s.drawElementImage(i,0,0),u=!0,d()}catch{}});function f(e,t){let n=o.createShader(e);return o.shaderSource(n,t),o.compileShader(n),o.getShaderParameter(n,o.COMPILE_STATUS)||console.error(`ParticleReveal shader error:`,o.getShaderInfoLog(n)),n}let p=f(o.VERTEX_SHADER,b),m=f(o.FRAGMENT_SHADER,x),h=o.createProgram();o.attachShader(h,p),o.attachShader(h,m),o.linkProgram(h);let _={},v=o.getProgramParameter(h,o.ACTIVE_UNIFORMS);for(let e=0;e<v;e++){let t=o.getActiveUniform(h,e);_[t.name]=o.getUniformLocation(h,t.name)}let S=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,S),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);let w=o.createTexture();o.bindTexture(o.TEXTURE_2D,w),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));let T=1;function E(){let e=Math.min(window.devicePixelRatio||1,2),t=Math.max(1,Math.round(a.clientWidth*e)),n=Math.max(1,Math.round(a.clientHeight*e));if((a.width!==t||a.height!==n)&&(a.width=t,a.height=n),T=Math.min(1,Math.max(.05,i.clientWidth/Math.max(a.clientWidth,1))),l){let t=Math.max(1,Math.round(r.clientWidth)),n=Math.max(1,Math.round(r.clientHeight));(r.width!==t*e||r.height!==n*e)&&(r.width=t*e,r.height=n*e),c.requestPaint()}}let D={x:-1e5,y:-1e5,tx:-1e5,ty:-1e5,active:0,target:0},O=0,k=``,A=[0,0,0],j=window.matchMedia(`(prefers-reduced-motion: reduce)`),M=j.matches;E();function N(){!l||!u||(u=!1,o.bindTexture(o.TEXTURE_2D,w),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,r))}function P(){N();let e=Math.max(a.clientWidth,1),t=Math.max(a.clientHeight,1),r=a.width/e;o.useProgram(h),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,w),o.uniform1i(_.uContent,0),o.uniform2f(_.uRes,e,t),o.uniform1f(_.uDpr,r),o.uniform2f(_.uPointer,D.x,D.y),o.uniform1f(_.uActive,D.active),o.uniform1f(_.uRadius,Math.max(n.radius,1)),o.uniform1f(_.uSoftness,n.softness),o.uniform1f(_.uSize,Math.max(n.size,.5)),o.uniform1f(_.uScatter,Math.max(n.scatter,0)),o.uniform1f(_.uDrift,Math.max(n.drift,0)),o.uniform1f(_.uAberration,Math.max(n.aberration,0)),o.uniform1f(_.uBend,Math.max(n.bend,0)),o.uniform1f(_.uFade,n.fade),o.uniform1f(_.uThreshold,Math.max(n.threshold,0)),n.background!==k&&(k=n.background,A=C(n.background)),o.uniform3f(_.uBg,A[0],A[1],A[2]),o.uniform1f(_.uTime,O),o.uniform1f(_.uMaxX,T),o.uniform1f(_.uCrisp,M||!l?1:0),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,a.width,a.height),o.drawArrays(o.TRIANGLE_STRIP,0,4)}let F=0,I=performance.now(),L=!1,R=!1,z=!0;function B(e){if(L)return;if(!z){R=!1;return}let t=Math.min((e-I)/1e3,1/30);I=e,O+=t;let r=Math.max(n.smoothing,1e-4),i=M?1:1-Math.exp(-t/r);if(D.x+=(D.tx-D.x)*i,D.y+=(D.ty-D.y)*i,D.active+=(D.target-D.active)*i,P(),Math.abs(D.tx-D.x)<.1&&Math.abs(D.ty-D.y)<.1&&Math.abs(D.target-D.active)<.001&&!u&&(M||!l||n.drift<=0)){D.x=D.tx,D.y=D.ty,D.active=D.target,R=!1;return}F=requestAnimationFrame(B)}function V(){L||R||!z||(R=!0,I=performance.now(),F=requestAnimationFrame(B))}d=V,V();function H(){M=j.matches,V()}j.addEventListener(`change`,H);let U=new ResizeObserver(()=>{E(),V()});U.observe(a),U.observe(i);let W=new IntersectionObserver(e=>{z=e[e.length-1]?.isIntersecting??!0,z&&V()});W.observe(a);let G=a.parentElement??a,K=g(a);function q(e){let t=K.current,n=e.clientX-t.left,r=e.clientY-t.top;D.target===0&&D.active<.001&&(D.x=n,D.y=r),D.tx=n,D.ty=r,D.target=1,V()}function J(){D.target=0,V()}return G.addEventListener(`pointermove`,q,{passive:!0}),G.addEventListener(`pointerleave`,J,{passive:!0}),{setOptions(e){Object.entries(e).some(([e,t])=>n[e]!==t)&&(Object.assign(n,e),V())},resize(){E(),V()},destroy(){L=!0,K.destroy(),cancelAnimationFrame(F),U.disconnect(),W.disconnect(),j.removeEventListener(`change`,H),G.removeEventListener(`pointermove`,q),G.removeEventListener(`pointerleave`,J),o.deleteTexture(w),o.deleteProgram(h),o.deleteShader(p),o.deleteShader(m),o.deleteBuffer(S),l&&(c.onpaint=null)}}}function E(f){let[g,y]=m(f,[`children`,`class`,`style`]),b=o(()=>g.children),[x,S]=i(!1),[C,E]=i(!1),[D,O]=i(!1),k=()=>C()&&!D(),A,j,M=null,[N,P]=i();return e(()=>{E(w()),S(!0)}),p(()=>{let e=N();if(!x()||!e)return;let r=k(),i=n(()=>({...y})),a=T({source:A,content:e,output:j},i);M=a,r&&!a&&O(!0),t(()=>{a?.destroy(),M===a&&(M=null)})}),p(()=>{M?.setOptions({...y})}),(()=>{var e=c(_),t=e.firstChild,n=t.nextSibling,[i,o]=u(n.nextSibling),f=i.nextSibling,p=A;typeof p==`function`?a(p,t):A=t,r(t,(()=>{var e=l(()=>!!k());return()=>e()?(()=>{var e=c(v);return a(P,e),r(e,b),e})():null})()),r(e,(()=>{var e=l(()=>!k());return()=>e()?(()=>{var e=c(v);return a(P,e),r(e,b),e})():null})(),i,o);var m=j;return typeof m==`function`?a(m,f):j=f,h(n=>{var r=g.class,i={...g.style},a=k()?{position:`absolute`,inset:`0`,width:`100%`,height:`100%`}:{display:`none`};return r!==n.e&&d(e,n.e=r),n.t=s(e,i,n.t),n.a=s(t,a,n.a),n},{e:void 0,t:void 0,a:void 0}),e})()}export{E as ParticleReveal,E as default,T as createParticleReveal,w as supportsHtmlInCanvas};