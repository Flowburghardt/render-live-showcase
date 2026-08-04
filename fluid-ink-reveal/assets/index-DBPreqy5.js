var m=Object.defineProperty;var v=(c,e,r)=>e in c?m(c,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):c[e]=r;var s=(c,e,r)=>v(c,typeof e!="symbol"?e+"":e,r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&t(a)}).observe(document,{childList:!0,subtree:!0});function r(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(o){if(o.ep)return;o.ep=!0;const i=r(o);fetch(o.href,i)}})();const p={simBase:512,simMax:1440,radius:.004,intensity:3.5,spread:.79,decay:1.5,friction:3,wobble:2.6,grain:.7,edge:[.39,.4],bottomFade:.18,velScale:1.6,velClamp:4,bgVar:"--bg"},g=`#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv;
void main () { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`,d=`
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1, 0)), f.x),
    mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  return noise(p) * 0.55 + noise(p * 2.6) * 0.3 + noise(p * 6.3) * 0.15;
}`,x=`#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D uField;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  float g = exp(-dot(p, p) / radius);
  vec4 f = texture(uField, vUv);
  float w = clamp(g * color.x, 0.0, 1.0);
  fragColor = vec4(f.r + g * color.x, mix(f.g, color.y, w), mix(f.b, color.z, w), 1.0);
}`,E=`#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D uField;
uniform vec2 texelSize;
uniform float dt;
uniform float friction;
uniform float spread;
uniform float decay;
uniform float wobble;
uniform float grain;
uniform float time;
${d}
void main () {
  vec2 vel = texture(uField, vUv).gb;
  vec2 coord = vUv - vel * dt;
  vec4 s = texture(uField, coord);
  float t = time * 0.3;
  vec2 warp = (vec2(
    fbm(vUv * 11.0 + t),
    fbm(vUv * 11.0 + 37.2 - t)
  ) - 0.5) * 2.0 * wobble * texelSize;
  vec4 nL = texture(uField, coord + vec2(-texelSize.x, 0.0) + warp);
  vec4 nR = texture(uField, coord + vec2( texelSize.x, 0.0) + warp);
  vec4 nT = texture(uField, coord + vec2(0.0,  texelSize.y) + warp);
  vec4 nB = texture(uField, coord + vec2(0.0, -texelSize.y) + warp);
  float avgD = (nL.r + nR.r + nT.r + nB.r) * 0.25;
  vec2 avgV = (nL.gb + nR.gb + nT.gb + nB.gb) * 0.25;
  float d = mix(s.r, avgD, spread);
  vec2 v = mix(s.gb, avgV, spread * 0.5);
  float g = fbm(vUv * 15.0 + 5.1 + t * 0.6);
  d *= 1.0 / (1.0 + (decay + grain * decay * (g - 0.5) * 2.0) * dt);
  v *= 1.0 / (1.0 + friction * dt);
  fragColor = vec4(max(d, 0.0), v, 1.0);
}`,b=`#version 300 es
precision highp float;
in vec2 vUv; out vec4 fragColor;
uniform sampler2D uField;
uniform vec3 maskColor;
uniform vec2 edge;
uniform float bottomFade;
uniform float time;
${d}
void main () {
  float d = texture(uField, vUv).r;
  float n = fbm(vec2(vUv.x * 9.0, time * 0.25));
  float localFade = bottomFade * (0.35 + n * 1.3);
  d *= smoothstep(0.0, localFade, vUv.y);
  float alpha = 1.0 - smoothstep(edge.x, edge.y, d);
  fragColor = vec4(maskColor, alpha);
}`;class u{constructor(e,r={},t){s(this,"container");s(this,"canvas");s(this,"gl");s(this,"opts");s(this,"filtering");s(this,"splatProg");s(this,"updateProg");s(this,"renderProg");s(this,"read");s(this,"write");s(this,"texelX",0);s(this,"texelY",0);s(this,"maskColor",[1,1,1]);s(this,"pointer",{x:0,y:0,px:0,py:0,vx:0,vy:0,moved:!1,init:!1});s(this,"rect");s(this,"raf",null);s(this,"lastFrame",0);s(this,"lastPointer",0);s(this,"painted",!1);s(this,"onFirstPaint");s(this,"resizeObserver");s(this,"onPointerMove");s(this,"loop",()=>{this.raf=requestAnimationFrame(this.loop);const e=this.gl,r=this.opts,t=performance.now(),o=Math.min((t-this.lastFrame)/1e3,.033);this.lastFrame=t,e.disable(e.BLEND),this.pointer.moved&&(this.splatSegment(),this.pointer.moved=!1);const i=this.updateProg.uniforms;e.useProgram(this.updateProg.p),e.uniform2f(i.texelSize??null,this.texelX,this.texelY),e.uniform1f(i.dt??null,o),e.uniform1f(i.friction??null,r.friction),e.uniform1f(i.spread??null,r.spread),e.uniform1f(i.decay??null,r.decay),e.uniform1f(i.wobble??null,r.wobble),e.uniform1f(i.grain??null,r.grain),e.uniform1f(i.time??null,t*.001),e.uniform1i(i.uField??null,this.attach(0,this.read)),this.blit(this.write),this.swap();const a=this.renderProg.uniforms;e.useProgram(this.renderProg.p),e.uniform1i(a.uField??null,this.attach(0,this.read)),e.uniform3f(a.maskColor??null,this.maskColor[0],this.maskColor[1],this.maskColor[2]),e.uniform2f(a.edge??null,r.edge[0],r.edge[1]),e.uniform1f(a.bottomFade??null,r.bottomFade),e.uniform1f(a.time??null,t*.001),this.blit(null),this.painted||(this.painted=!0,this.onFirstPaint&&(this.onFirstPaint(),this.onFirstPaint=null))});this.container=e,this.opts={...p,...r},this.onFirstPaint=t??null;const o=e.querySelector("[data-fluid-canvas]");if(!o)throw new Error("FluidInkReveal: [data-fluid-canvas] fehlt im Container.");this.canvas=o,this.canvas.style.color="var("+this.opts.bgVar+", #ffffff)";const i=o.getContext("webgl2",{alpha:!0,premultipliedAlpha:!1});if(!i)throw new Error("FluidInkReveal: WebGL2 nicht verfügbar.");this.gl=i,i.getExtension("EXT_color_buffer_float"),this.filtering=i.getExtension("OES_texture_float_linear")?i.LINEAR:i.NEAREST,this.rect=e.getBoundingClientRect(),this.buildPrograms(),this.buildQuad(),this.resize(),this.readMaskColor(),this.onPointerMove=a=>this.handlePointer(a.clientX,a.clientY),e.addEventListener("pointermove",this.onPointerMove),e.addEventListener("pointerdown",this.onPointerMove),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.lastFrame=performance.now(),this.lastPointer=this.lastFrame,this.loop()}static supported(){const r=document.createElement("canvas").getContext("webgl2");return r!==null&&r.getExtension("EXT_color_buffer_float")!==null}setEdge(e){this.opts.edge=e}destroy(){this.raf!==null&&cancelAnimationFrame(this.raf),this.raf=null,this.container.removeEventListener("pointermove",this.onPointerMove),this.container.removeEventListener("pointerdown",this.onPointerMove),this.resizeObserver.disconnect()}compile(e,r){const t=this.gl,o=t.createShader(e);if(!o)throw new Error("createShader fehlgeschlagen");if(t.shaderSource(o,r),t.compileShader(o),!t.getShaderParameter(o,t.COMPILE_STATUS))throw new Error("Shader-Fehler: "+(t.getShaderInfoLog(o)??"unbekannt"));return o}program(e){const r=this.gl,t=r.createProgram();if(!t)throw new Error("createProgram fehlgeschlagen");if(r.attachShader(t,this.compile(r.VERTEX_SHADER,g)),r.attachShader(t,this.compile(r.FRAGMENT_SHADER,e)),r.linkProgram(t),!r.getProgramParameter(t,r.LINK_STATUS))throw new Error("Link-Fehler: "+(r.getProgramInfoLog(t)??"unbekannt"));const o={},i=r.getProgramParameter(t,r.ACTIVE_UNIFORMS);for(let a=0;a<i;a++){const l=r.getActiveUniform(t,a);l&&(o[l.name]=r.getUniformLocation(t,l.name))}return{p:t,uniforms:o}}buildPrograms(){this.splatProg=this.program(x),this.updateProg=this.program(E),this.renderProg=this.program(b)}buildQuad(){const e=this.gl,r=e.createVertexArray();e.bindVertexArray(r);const t=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0)}createFbo(e,r){const t=this.gl,o=t.createTexture();if(!o)throw new Error("createTexture fehlgeschlagen");t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,o),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,this.filtering),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,this.filtering),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,t.RGBA16F,e,r,0,t.RGBA,t.HALF_FLOAT,null);const i=t.createFramebuffer();if(!i)throw new Error("createFramebuffer fehlgeschlagen");return t.bindFramebuffer(t.FRAMEBUFFER,i),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,o,0),t.viewport(0,0,e,r),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),{tex:o,fbo:i,w:e,h:r}}attach(e,r){const t=this.gl;return t.activeTexture(t.TEXTURE0+e),t.bindTexture(t.TEXTURE_2D,r.tex),e}swap(){const e=this.read;this.read=this.write,this.write=e}resize(){const e=this.gl;this.rect=this.container.getBoundingClientRect(),this.canvas.width=Math.max(1,Math.round(this.rect.width)),this.canvas.height=Math.max(1,Math.round(this.rect.height));const r=this.canvas.width/Math.max(this.canvas.height,1),{simBase:t,simMax:o}=this.opts;let i,a;r>=1?(a=t,i=Math.min(Math.round(t*r),o)):(i=t,a=Math.min(Math.round(t/r),o)),!(this.read&&this.read.w===i&&this.read.h===a)&&(this.read&&(e.deleteTexture(this.read.tex),e.deleteFramebuffer(this.read.fbo),e.deleteTexture(this.write.tex),e.deleteFramebuffer(this.write.fbo)),this.read=this.createFbo(i,a),this.write=this.createFbo(i,a),this.texelX=1/i,this.texelY=1/a)}readMaskColor(){const e=getComputedStyle(this.canvas).color.match(/[\d.]+/g);e&&e.length>=3&&(this.maskColor=[Number(e[0])/255,Number(e[1])/255,Number(e[2])/255])}handlePointer(e,r){const t=performance.now(),o=Math.max((t-this.lastPointer)/1e3,.004);this.lastPointer=t;const i=this.rect,a=(e-i.left)/i.width,l=1-(r-i.top)/i.height,n=this.pointer;n.init?(n.px=n.x,n.py=n.y):(n.px=a,n.py=l,n.init=!0),n.vx=(a-n.px)/o,n.vy=(l-n.py)/o,n.x=a,n.y=l,n.moved=!0}blit(e){const r=this.gl;e?(r.bindFramebuffer(r.FRAMEBUFFER,e.fbo),r.viewport(0,0,e.w,e.h)):(r.bindFramebuffer(r.FRAMEBUFFER,null),r.viewport(0,0,this.canvas.width,this.canvas.height)),r.drawArrays(r.TRIANGLE_STRIP,0,4)}splat(e,r,t,o,i){const a=this.gl,l=this.splatProg.uniforms;a.useProgram(this.splatProg.p),a.uniform1i(l.uField??null,this.attach(0,this.read)),a.uniform1f(l.aspectRatio??null,this.canvas.width/Math.max(this.canvas.height,1)),a.uniform2f(l.point??null,e,r),a.uniform3f(l.color??null,t,o,i),a.uniform1f(l.radius??null,this.opts.radius),this.blit(this.write),this.swap()}splatSegment(){const e=this.pointer,r=this.opts,t=this.canvas.width/Math.max(this.canvas.height,1),o=Math.max(-r.velClamp,Math.min(r.velClamp,e.vx))*r.velScale,i=Math.max(-r.velClamp,Math.min(r.velClamp,e.vy))*r.velScale,a=Math.hypot((e.x-e.px)*t,e.y-e.py),l=Math.max(1,Math.ceil(a/(.4*Math.sqrt(r.radius))));for(let n=0;n<l;n++){const h=l===1?1:n/(l-1);this.splat(e.px+(e.x-e.px)*h,e.py+(e.y-e.py)*h,r.intensity,o,i)}}}const F={tusche:[.39,.4],nebel:[.05,.85]};function T(){var i;const c=document.querySelector("[data-fluid-reveal]"),e=document.querySelector("[data-hint]");if(!c)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!u.supported()){(i=c.querySelector("[data-fluid-canvas]"))==null||i.remove(),e==null||e.remove();return}const t=new u(c);let o=!1;c.addEventListener("pointermove",()=>{!o&&e&&(o=!0,e.classList.add("is-hidden"))}),document.querySelectorAll("[data-mode]").forEach(a=>{a.addEventListener("click",()=>{const l=a.dataset.mode??"tusche",n=F[l];n&&t.setEdge(n),document.querySelectorAll("[data-mode]").forEach(h=>{const f=h===a;h.classList.toggle("is-active",f),h.setAttribute("aria-pressed",String(f))})})})}T();
