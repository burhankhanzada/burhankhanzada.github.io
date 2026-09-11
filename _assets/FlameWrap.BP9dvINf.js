import{C as e,S as t,T as n,a as r,b as i,c as a,d as o,g as s,l as c,n as l,o as u,r as d,t as f,u as p,v as m,w as h,y as g}from"./web.BFK2eyNI.js";var _=p(`<div style=position:relative><canvas layoutsubtree=true></canvas><!$><!/><canvas aria-hidden=true style=position:absolute;pointer-events:none>`),v=p(`<div style=position:relative;width:100%;height:100%;overflow:auto>`),y={color:[.31,.54,1],intensity:.5,height:170,spread:8,radius:40,speed:.25,scale:.75,turbulence:.5,turbulenceScale:.5,turbulenceReach:25,sparks:1.5,sparkSize:.35,sparkDensity:1,sparkSpeed:1,rim:2.5,melt:4.5,distortion:10,smoke:1.5,ember:2,scorch:0},b=`#version 300 es
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
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uRectCenter;
uniform vec2 uRectHalf;
uniform float uCorner;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uHeight;
uniform float uSpread;
uniform float uScale;
uniform float uTurbulence;
uniform float uTurbScale;
uniform float uTurbReach;
uniform float uSparks;
uniform float uSparkSize;
uniform float uSparkDensity;
uniform float uSparkSpeed;
uniform float uRim;
uniform float uMelt;
uniform float uDistortion;
uniform float uSmoke;
uniform float uEmber;
uniform float uScorch;
uniform float uHasContent;

#define S(a, b, t) smoothstep(a, b, t)

vec3 permute (vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise (vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm (vec2 p) {
  mat2 m = mat2(0.8, -0.6, 0.6, 0.8);
  float v = 0.5 * snoise(p);
  p = m * p * 2.03 + vec2(11.3, 7.1);
  v += 0.27 * snoise(p);
  p = m * p * 1.97 + vec2(3.7, 19.1);
  v += 0.15 * snoise(p);
  p = m * p * 2.01 + vec2(8.3, 2.9);
  v += 0.08 * snoise(p);
  return v * 0.5 + 0.5;
}

float fbm2 (vec2 p) {
  float v = 0.62 * snoise(p);
  v += 0.31 * snoise(mat2(0.8, -0.6, 0.6, 0.8) * p * 2.13 + vec2(5.2, 1.3));
  return v * 0.54 + 0.5;
}

vec2 turbulence (vec2 p) {
  float freq = 12.0 * clamp(uScale, 0.05, 1.0) * clamp(uTurbScale, 0.2, 3.0);
  mat2 rot = mat2(0.6, -0.8, 0.8, 0.6);
  for (float i = 0.0; i < 7.0; i++) {
    float phase = freq * (p * rot).y + 6.0 * uTime + i;
    p += uTurbulence * rot[0] * sin(phase) / freq;
    rot *= mat2(0.6, -0.8, 0.8, 0.6);
    freq *= 1.2;
  }
  return p;
}

vec3 hash3 (vec2 p) {
  vec3 q = vec3(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3)),
    dot(p, vec2(419.2, 371.9))
  );
  return fract(sin(q) * 43758.5453);
}

float sdRoundRect (vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main () {
  vec2 frag = vUv * uResolution;
  vec2 rel = frag - uRectCenter;
  float unit = max(uHeight, 24.0);
  float corner = min(uCorner, min(uRectHalf.x, uRectHalf.y));
  float spreadPx = max(uSpread, 8.0);
  float t = uTime;
  float detail = clamp(uScale, 0.05, 1.0);

  float d0 = sdRoundRect(rel, uRectHalf, corner);
  float px = rel.x / unit;
  float py = rel.y / unit;

  float yA = max(rel.y - uRectHalf.y, 0.0) / unit;
  float sway = snoise(vec2(px * 1.1, t * 0.5)) * 0.55
    + snoise(vec2(px * 2.4, t * 0.9 + 41.0)) * 0.25;
  float sx = px + yA * sway;
  float env = fbm2(vec2(sx * 1.6 * detail + 3.7, t * 0.55 - yA * 0.4));
  float env2 = fbm2(vec2(sx * 3.6 * detail, t * 0.85 + 17.0 - yA * 0.6));
  float tongue = clamp(
    0.75 * S(0.3, 0.9, env) + 0.5 * S(0.4, 0.95, env2),
    0.0,
    1.0
  );

  float meltPx = max(uMelt, 1.0);
  float biteTop = (3.0 + meltPx * 1.4) * (0.35 + 0.65 * tongue)
    + 2.0 * snoise(vec2(px * 5.0 * detail, t * 1.1 + 5.0));
  float yF = uRectHalf.y - biteTop;
  float frontTop = rel.y - yF;

  float perim = fbm2(rel * (1.9 / unit) * detail + vec2(0.0, t * 0.4) + 31.0);
  float biteSB = 3.0 + meltPx * (0.25 + 0.75 * perim);
  float frontSB = d0 + biteSB;

  float wTop = S(-0.62 * unit, -0.1 * unit, rel.y - uRectHalf.y)
    * S(10.0, -30.0, abs(rel.x) - (uRectHalf.x - corner));
  float front = mix(frontSB, frontTop, wTop);

  float reach = mix(
    spreadPx * 0.9,
    unit * (0.2 + 0.45 * tongue),
    wTop
  );
  float q = front / reach;

  vec2 np = vec2(px * 2.3, py * 1.25 - t * 1.85) * detail;
  np = turbulence(np);
  float n = fbm(np);

  float win = S(-0.08, 0.02, q);
  float root = exp(-abs(q) * 5.0);
  float ridge = 1.0 - abs(2.0 * n - 1.0);
  float flameH = mix(1.0, 0.5 + 0.6 * tongue, wTop);
  float g = max(q, 0.0) / flameH;
  float shred = fbm2(np * 1.9 + 63.0);
  g *= 1.0 + 0.7 * (shred - 0.5) * S(0.2, 0.8, g);
  float dens = n * 0.95 + ridge * 0.45 - 0.18
    + (1.0 - min(g, 1.0)) * 0.3
    - g * (0.9 + 0.25 * n);
  dens = clamp(dens * 2.4, 0.0, 1.0) * win;
  dens *= mix(1.0 - S(0.32, 1.05, q), 1.0 - S(0.9, 1.2, g), wTop);
  float body = dens * dens * (3.0 - 2.0 * dens);
  float emis = clamp(uIntensity, 0.0, 2.0);
  float e = body * (0.55 + 0.75 * root) * (0.45 + 0.55 * n)
    + win * root * (0.1 + 0.4 * n);
  e *= mix(0.45, 1.0, wTop) * max(emis, 0.001);

  vec3 hot = mix(uColor, vec3(1.0), 0.35);
  vec3 deep = mix(uColor, uColor * uColor, 0.5) * 0.9;
  float ramp = 1.0 - exp(-e * 2.4);
  vec3 fireCol = mix(deep, uColor, S(0.0, 0.55, ramp));
  float core = ramp * (0.45 + 0.55 * exp(-g * 2.2)) * (0.5 + 0.5 * n);
  fireCol = mix(fireCol, hot, S(0.7, 1.05, core));
  fireCol *= 0.8 + 0.4 * ramp;
  float fireA = clamp(1.0 - exp(-e * 3.4), 0.0, 1.0);

  float halo = exp(-max(front, 0.0) / (spreadPx * 1.2)) * S(0.0, 3.0, front)
    * (0.5 + 0.5 * n) * 0.3 * clamp(uRim, 0.0, 2.0) * mix(1.0, 0.45, wTop);
  vec3 glow = uColor * halo * clamp(uIntensity, 0.0, 2.0);

  if (uSparks > 0.001) {
    float sSpeed = max(uSparkSpeed, 0.05);
    float sCells = 5.0 * clamp(uSparkDensity, 0.3, 2.5);
    float sSize = clamp(uSparkSize, 0.2, 3.0);
    float gate = S(-0.05, 0.1, q) * (1.0 - S(1.3, 2.2, q)) * wTop;
    float spark = 0.0;
    for (float L = 0.0; L < 2.0; L++) {
      float speed = 1.5 * sSpeed * (0.75 + 0.5 * L);
      vec2 ps = vec2(px, py - t * speed);
      ps.x += 0.08 * snoise(vec2(py * 0.9 + L * 5.0, t * 0.5));
      float cells = sCells * (1.0 + 0.6 * L);
      vec2 cl = floor(ps * cells) + L * 19.0;
      vec2 fr = fract(ps * cells);
      vec3 rnd = hash3(cl);
      vec3 rnd2 = hash3(cl + 7.3);
      float on = step(rnd2.x, 0.42);
      float life = fract(rnd.z + t * sSpeed * (0.3 + 0.5 * rnd2.x));
      vec2 ppos = vec2(0.5) + 0.56 * (rnd.xy - 0.5);
      ppos.x += 0.14 * sin(t * (0.7 + rnd.z * 2.8) + rnd.y * 6.2832)
        + 0.1 * snoise(vec2(t * 0.6 + rnd.x * 9.0, cl.y * 0.7))
        + (life - 0.5) * 0.5 * (rnd2.y - 0.5);
      ppos.y += (life - 0.5) * 0.3 * rnd2.y;
      float tw = S(0.02, 0.2, life) * S(1.0, 0.55, life);
      tw *= 0.75 + 0.25 * sin(t * (6.0 + rnd2.z * 9.0) + rnd.x * 6.2832);
      vec2 pd = (fr - ppos) / cells * unit;
      pd.y *= 0.55 + 0.3 * rnd2.z;
      float dp = length(pd);
      float r = (0.004 + 0.014 * rnd.y * rnd.y) * unit * sSize
        * mix(1.15, 0.55, life);
      float bmask = S(0.5, 0.32, max(abs(fr.x - 0.5), abs(fr.y - 0.5)));
      float sbody = exp(-dp * dp / (r * r));
      float sbloom = exp(-dp * dp / (r * r * 6.0)) * 0.3;
      spark += (sbody + sbloom) * tw * tw * on * bmask * (1.0 - 0.35 * L);
    }
    spark *= gate * uSparks;
    fireCol += mix(uColor, vec3(1.0), 0.55) * spark * 1.6;
    fireA = clamp(fireA + spark * 0.85, 0.0, 1.0);
  }

  vec2 edgePx = min(frag, uResolution - frag);
  float fadeW = max(24.0, spreadPx * 0.75);
  float fade = S(0.0, fadeW, edgePx.x) * S(0.0, fadeW, edgePx.y);
  fireA *= fade;
  glow *= fade;
  halo *= fade;

  float wisp = S(0.45, 0.9, fbm2(np * 0.55 + vec2(0.0, 17.0)));
  float smoke = S(1.55, 1.05, g) * S(0.85, 1.15, g)
    * (1.0 - body) * wTop
    * wisp * 0.055 * clamp(uSmoke, 0.0, 2.0) * fade;
  vec3 smokeCol = mix(vec3(0.5), uColor, 0.5);

  if (uHasContent < 0.5) {
    float sA = clamp(smoke, 0.0, 1.0);
    float a = clamp(fireA + sA * (1.0 - fireA), 0.0, 1.0);
    outColor = vec4(
      fireCol * fireA + glow + smokeCol * sA * (1.0 - fireA),
      clamp(a + halo * 0.6, 0.0, 1.0)
    );
    return;
  }

  vec2 cUv = (rel + uRectHalf) / (2.0 * uRectHalf);
  float inRect = step(abs(cUv.x - 0.5), 0.5) * step(abs(cUv.y - 0.5), 0.5);

  float heatBand = exp(-abs(front) / max(uTurbReach, 4.0));
  vec2 wob = vec2(
    snoise(np * 1.7 + 9.0),
    snoise(np * 1.7 + 27.0)
  );
  vec2 disp = wob * min(uDistortion, 32.0) * heatBand;
  vec2 cUvD = clamp(cUv + disp / (2.0 * uRectHalf), vec2(0.002), vec2(0.998));
  vec4 content = texture(uContent, vec2(cUvD.x, 1.0 - cUvD.y));

  float burn = clamp(uIntensity, 0.0, 1.0);
  float depth = max(-front, 0.0);
  float charPatch = 0.5 + 0.5 * fbm2(rel * (2.6 / unit) * detail + 57.0);
  float charW = mix(4.0, 6.0 + meltPx * 1.6, wTop) * charPatch;
  float charT = (1.0 - S(charW, charW * 2.4, depth));
  content.rgb = mix(
    content.rgb,
    content.rgb * vec3(0.22, 0.19, 0.17),
    clamp(charT * 0.85 * burn * clamp(uScorch, 0.0, 2.0), 0.0, 1.0)
  );

  float emberW = mix(2.5, 5.5, wTop);
  float emberN = 0.3 + 0.7 * fbm2(np * 2.2 + 73.0);
  float emberK = clamp(uEmber, 0.0, 2.0);
  float ember = exp(-depth / emberW) * emberN * emberK;
  float whiteHot = exp(-depth / (emberW * 0.4)) * emberN * emberN * emberK;
  content.rgb = mix(content.rgb, uColor * 1.2, clamp(ember, 0.0, 1.0) * burn);
  content.rgb = mix(
    content.rgb,
    mix(uColor, vec3(1.0), 0.3) * 1.2,
    clamp(whiteHot, 0.0, 1.0) * burn
  );

  float dn = fbm2(rel * (3.2 / unit) * detail + vec2(0.0, t * 0.5) + 91.0);
  float dw = mix(2.0, 5.0, wTop);
  float dissolve = S(-dw, dw, front + (dn - 0.5) * dw * 2.5);
  float cA = content.a * (1.0 - dissolve) * inRect;
  float smk = smoke * (1.0 - cA);
  float baseA = min(cA + smk, 1.0);
  vec3 base = content.rgb * cA + smokeCol * smk;
  vec3 col = fireCol * fireA + base * (1.0 - fireA) + glow;
  float alpha = clamp(fireA + baseA * (1.0 - fireA) + halo * 0.5, 0.0, 1.0);
  outColor = vec4(col, alpha);
}`;function S(){if(typeof document>`u`)return!1;let e=document.createElement(`canvas`),t=e.getContext(`2d`);return!!(t&&typeof t.drawElementImage==`function`&&typeof e.requestPaint==`function`)}function C(e,t={}){let n={...y,...t},{source:r,content:i,output:a}=e,o=a.getContext(`webgl2`,{alpha:!0,depth:!1,stencil:!1,antialias:!1,premultipliedAlpha:!0});if(!o||o.isContextLost())return null;let s=r.getContext(`2d`),c=r,l=!!(s&&typeof s.drawElementImage==`function`&&typeof c.requestPaint==`function`),u=!1,d=()=>{};l&&(c.onpaint=()=>{try{s.reset(),s.drawElementImage(i,0,0),u=!0,d()}catch{}});function f(e,t){let n=o.createShader(e);return o.shaderSource(n,t),o.compileShader(n),o.getShaderParameter(n,o.COMPILE_STATUS)||console.error(`FlameWrap shader error:`,o.getShaderInfoLog(n)),n}let p=f(o.VERTEX_SHADER,b),m=f(o.FRAGMENT_SHADER,x),h=o.createProgram();o.attachShader(h,p),o.attachShader(h,m),o.linkProgram(h);let g={},_=o.getProgramParameter(h,o.ACTIVE_UNIFORMS);for(let e=0;e<_;e++){let t=o.getActiveUniform(h,e);g[t.name]=o.getUniformLocation(h,t.name)}let v=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,v),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0);let S=o.createTexture();o.bindTexture(o.TEXTURE_2D,S),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,1,1,0,o.RGBA,o.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));let C={cx:0,cy:0,hx:1,hy:1},w=1;function T(){w=Math.min(window.devicePixelRatio||1,2);let e=Math.max(1,Math.round(a.clientWidth*w)),t=Math.max(1,Math.round(a.clientHeight*w));(a.width!==e||a.height!==t)&&(a.width=e,a.height=t);let n=l?r:i,o=a.getBoundingClientRect(),s=n.getBoundingClientRect();if(o.width>0&&s.width>0&&(C.cx=(s.left+s.right)/2-o.left,C.cy=o.bottom-(s.top+s.bottom)/2,C.hx=s.width/2,C.hy=s.height/2),l){let e=Math.max(1,Math.round(r.clientWidth)),t=Math.max(1,Math.round(r.clientHeight));(r.width!==e*w||r.height!==t*w)&&(r.width=e*w,r.height=t*w),c.requestPaint()}}T();function E(){!l||!u||(u=!1,o.bindTexture(o.TEXTURE_2D,S),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,r),s.clearRect(0,0,r.width,r.height))}let D=0;function O(){E(),o.useProgram(h),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,S),o.uniform1i(g.uContent,0),o.uniform2f(g.uResolution,a.width,a.height),o.uniform1f(g.uTime,D),o.uniform2f(g.uRectCenter,C.cx*w,C.cy*w),o.uniform2f(g.uRectHalf,Math.max(C.hx*w,1),Math.max(C.hy*w,1)),o.uniform1f(g.uCorner,Math.max(n.radius,0)*w),o.uniform3f(g.uColor,n.color[0],n.color[1],n.color[2]),o.uniform1f(g.uIntensity,Math.max(n.intensity,0)),o.uniform1f(g.uHeight,Math.max(n.height,24)*w),o.uniform1f(g.uSpread,Math.max(n.spread,8)*w),o.uniform1f(g.uScale,Math.max(n.scale,.05)),o.uniform1f(g.uTurbulence,Math.max(n.turbulence,0)),o.uniform1f(g.uTurbScale,Math.max(n.turbulenceScale,.2)),o.uniform1f(g.uTurbReach,Math.max(n.turbulenceReach,4)*w),o.uniform1f(g.uSparks,Math.max(n.sparks,0)),o.uniform1f(g.uSparkSize,Math.max(n.sparkSize,.2)),o.uniform1f(g.uSparkDensity,Math.max(n.sparkDensity,.3)),o.uniform1f(g.uSparkSpeed,Math.max(n.sparkSpeed,.05)),o.uniform1f(g.uRim,Math.max(n.rim,0)),o.uniform1f(g.uMelt,Math.max(n.melt,0)*w),o.uniform1f(g.uDistortion,Math.max(n.distortion,0)*w),o.uniform1f(g.uSmoke,Math.max(n.smoke,0)),o.uniform1f(g.uEmber,Math.max(n.ember,0)),o.uniform1f(g.uScorch,Math.max(n.scorch,0)),o.uniform1f(g.uHasContent,+!!l),o.bindFramebuffer(o.FRAMEBUFFER,null),o.viewport(0,0,a.width,a.height),o.drawArrays(o.TRIANGLE_STRIP,0,4)}let k=0,A=performance.now(),j=!1,M=!1,N=!0,P=window.matchMedia(`(prefers-reduced-motion: reduce)`),F=P.matches;function I(e){if(j)return;if(!N){M=!1;return}let t=Math.min((e-A)/1e3,1/30);if(A=e,F||(D+=t*n.speed),O(),F&&!u){M=!1;return}k=requestAnimationFrame(I)}function L(){j||M||!N||(M=!0,A=performance.now(),k=requestAnimationFrame(I))}d=L,L();function R(){F=P.matches,L()}P.addEventListener(`change`,R);let z=new ResizeObserver(()=>{T(),L()});z.observe(a),z.observe(i);let B=new IntersectionObserver(e=>{N=e[e.length-1]?.isIntersecting??!0,N&&L()});return B.observe(a),{setOptions(e){let t=!1;for(let[r,i]of Object.entries(e)){let e=n[r];if(Array.isArray(i)&&Array.isArray(e)){if(i.length!==e.length||i.some((t,n)=>t!==e[n])){t=!0;break}}else if(e!==i){t=!0;break}}Object.assign(n,e),t&&(T(),L())},resize(){T(),L()},destroy(){j=!0,cancelAnimationFrame(k),z.disconnect(),B.disconnect(),P.removeEventListener(`change`,R),o.deleteTexture(S),o.deleteProgram(h),o.deleteShader(p),o.deleteShader(m),o.deleteBuffer(v),l&&(c.onpaint=null)}}}function w(p){let[y,b]=h(p,[`children`,`class`,`style`]),x=s(()=>y.children),[w,T]=i(!1),[E,D]=i(!1),[O,k]=i(!1),A=()=>E()&&!O(),j=()=>Math.round(Math.max(b.height??170,24)*1.5)+40,M=()=>Math.round(Math.max(b.spread??8,8)*3)+16,N,P,F=null,[I,L]=i();return e(()=>{D(S()),T(!0)}),m(()=>{let e=I();if(!w()||!e)return;let r=A(),i=n(()=>({...b})),a=C({source:N,content:e,output:P},i);F=a,r&&!a&&k(!0),t(()=>{a?.destroy(),F===a&&(F=null)})}),m(()=>{F?.setOptions({...b})}),(()=>{var e=l(_),t=e.firstChild,n=t.nextSibling,[i,s]=d(n.nextSibling),p=i.nextSibling,m=N;typeof m==`function`?o(m,t):N=t,r(t,(()=>{var e=u(()=>!!A());return()=>e()?(()=>{var e=l(v);return o(L,e),r(e,x),e})():null})()),r(e,(()=>{var e=u(()=>!A());return()=>e()?(()=>{var e=l(v);return o(L,e),r(e,x),e})():null})(),i,s);var h=P;return typeof h==`function`?o(h,p):P=p,g(n=>{var r=y.class,i={...y.style},o=A()?{position:`absolute`,inset:`0`,width:`100%`,height:`100%`}:{display:`none`},s=`${-j()}px`,l=`${-M()}px`,u=`${-M()}px`,d=`${-M()}px`,m=`calc(100% + ${M()*2}px)`,h=`calc(100% + ${j()+M()}px)`;return r!==n.e&&f(e,n.e=r),n.t=c(e,i,n.t),n.a=c(t,o,n.a),s!==n.o&&a(p,`top`,n.o=s),l!==n.i&&a(p,`right`,n.i=l),u!==n.n&&a(p,`bottom`,n.n=u),d!==n.s&&a(p,`left`,n.s=d),m!==n.h&&a(p,`width`,n.h=m),h!==n.r&&a(p,`height`,n.r=h),n},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0}),e})()}export{w as FlameWrap,w as default,C as createFlameWrap,S as supportsHtmlInCanvas};