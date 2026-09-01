(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function r(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=r(o);fetch(o.href,a)}})();const c=[{number:"01",title:"Find our humans",body:"We start with the people, not the product. Who they are, what they already buy, and why they would switch.",caption:"E.g. Research, market sizing, segmentation",media:{kind:"photo",seed:"lam-step-01"}},{number:"02",title:"Think big",body:"The position comes before the logo. We look for the one claim the whole category cannot answer.",caption:"E.g. Positioning, naming, brand strategy",media:{kind:"field",tone:"var(--tone-tan)",word:"Position"}},{number:"03",title:"Build a product",body:"A brand without a product is a poster. We prototype until the thing actually works in a hand.",caption:"E.g. Product R&D, UX/UI design, prototyping",media:{kind:"photo",seed:"lam-step-03"}},{number:"04",title:"Build a world",body:"Identity is not a mark, it is a climate. Type, colour, packaging and tone arrive together or not at all.",caption:"E.g. Art direction, identity, packaging",media:{kind:"field",tone:"var(--tone-green)",word:"World"}},{number:"05",title:"Find 1000 fans",body:"A thousand believers beat a million impressions. We launch where those thousand already spend their evenings.",caption:"E.g. Go to market, campaign, community",media:{kind:"photo",seed:"lam-step-05"}},{number:"06",title:"Put them to work",body:"Growth is an operating system, not a campaign. We stay until the machine runs without us in the room.",caption:"E.g. E-commerce, supply chain, retention",media:{kind:"field",tone:"var(--tone-grey)",word:"Engine"}}],w=[[{title:"Telepathic Instruments",tags:["Brand","Digital","Ventures"],src:"https://picsum.photos/seed/lam-telepathic/908/1190",width:908,height:1190,alt:"Telepathic Instruments — case cover for the music hardware venture",grow:2},{title:"Fluff",tags:["Brand","Digital"],src:"https://picsum.photos/seed/lam-fluff/860/970",width:860,height:970,alt:"Fluff — case cover for the beauty range",grow:1}],[{title:"Omega Yeast",tags:["Brand","Digital"],src:"https://picsum.photos/seed/lam-omega/1133/692",width:1133,height:692,alt:"Omega Yeast — full-width case cover for the brewing supplier",grow:1}],[{title:"Polaroid",tags:["Brand"],src:"https://picsum.photos/seed/lam-polaroid/669/724",width:669,height:724,alt:"Polaroid — case cover for the camera campaign",grow:1},{title:"Idealworks",tags:["Brand","Ventures"],src:"https://picsum.photos/seed/lam-idealworks/669/891",width:669,height:891,alt:"Idealworks — case cover for the robotics spin-off",grow:1}]],u=700,h=1340,m=210,y=264;function b(e,t,r){return`https://picsum.photos/seed/${e}/${t}/${r}`}function _(e){const t=e.media;return t.kind==="photo"?`<div class="playbook__layer">
        <img
          class="playbook__layer-img"
          src="${b(t.seed,u,h)}"
          width="${u}"
          height="${h}"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>`:`<div class="playbook__layer playbook__layer--field" style="--tone: ${t.tone}">
      <span class="playbook__layer-number">${e.number}</span>
      <span class="playbook__layer-word">${t.word}</span>
    </div>`}function v(e){return`<li class="playbook__panel">
      <h3 class="playbook__step-heading">
        <span class="playbook__step-number">${e.number}</span>
        <span class="playbook__step-title">${e.title}</span>
      </h3>
      <p class="playbook__step-body">${e.body}</p>
      <p class="playbook__step-caption">
        <span class="playbook__arrow" aria-hidden="true">&larr;</span>${e.caption}
      </p>
    </li>`}function $(e){const t=e.media;return t.kind==="photo"?`<li class="playbook__ticker-item">
        <img
          class="playbook__ticker-img"
          src="${b(t.seed,m,y)}"
          width="${m}"
          height="${y}"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </li>`:`<li class="playbook__ticker-item playbook__ticker-item--field" style="--tone: ${t.tone}">
      ${e.number}
    </li>`}function f(e,t){e.forEach((r,n)=>{r.toggleAttribute("data-active",n===t)})}function A(e,t){e.forEach((r,n)=>{r.toggleAttribute("data-active",n===t),r.toggleAttribute("data-below",n<t)})}function E(e){e.media.innerHTML=c.map(_).join(""),e.panels.innerHTML=c.map(v).join(""),e.ticker.innerHTML=`<ul class="playbook__ticker-list">${c.map($).join("")}</ul>`,e.triggers.innerHTML=c.map((i,d)=>`<div class="playbook__trigger" data-step="${d}"></div>`).join("");const t=Array.from(e.media.querySelectorAll(".playbook__layer")),r=Array.from(e.panels.querySelectorAll(".playbook__panel")),n=Array.from(e.ticker.querySelectorAll(".playbook__ticker-item")),o=Array.from(e.triggers.querySelectorAll(".playbook__trigger"));let a=-1;function s(i){i!==a&&(i<0||i>=c.length||(a=i,A(t,i),f(r,i),f(n,i),e.ticker.style.setProperty("--ticker-index",String(i))))}s(0);const k=new IntersectionObserver(i=>{for(const d of i){if(!d.isIntersecting)continue;const p=d.target.getAttribute("data-step");if(p===null)continue;const g=Number.parseInt(p,10);Number.isNaN(g)||s(g)}},{rootMargin:"-50% 0px -50% 0px",threshold:0});for(const i of o)k.observe(i)}function l(e){const t=document.querySelector(e);if(!(t instanceof HTMLElement))throw new Error(`Erwartetes Element fehlt: ${e}`);return t}function I(e){const t=e.tags.map(r=>`<span class="work-tile__tag">${r}</span>`).join("");return`<a
      class="work-tile"
      href="#work"
      style="--grow: ${e.grow}; --ratio: ${e.width} / ${e.height}"
      data-reveal
    >
      <span class="work-tile__figure">
        <img
          class="work-tile__img"
          src="${e.src}"
          width="${e.width}"
          height="${e.height}"
          alt="${e.alt}"
          loading="lazy"
          decoding="async"
        />
        <span class="work-tile__badge">View</span>
      </span>
      <span class="work-tile__label">${e.title}</span>
      <span class="work-tile__tags">${t}</span>
    </a>`}l("#work-rows").innerHTML=w.map(e=>`<div class="work__row">${e.map(I).join("")}</div>`).join("");E({media:l("#playbook-media"),panels:l("#playbook-panels"),ticker:l("#playbook-ticker"),triggers:l("#playbook-triggers")});function H(e){document.documentElement.dataset.stage=e,document.body.dataset.stage=e}const T=new IntersectionObserver(e=>{for(const t of e)H(t.isIntersecting?"red":"bone")},{threshold:0});T.observe(l("#stage-sentinel"));const O=new IntersectionObserver((e,t)=>{for(const r of e)r.isIntersecting&&(r.target.setAttribute("data-revealed",""),t.unobserve(r.target))},{threshold:0,rootMargin:"0px 0px -10% 0px"});for(const e of document.querySelectorAll("[data-reveal]"))O.observe(e);
