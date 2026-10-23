/* AAARON 2026 site application */
(() => {
'use strict';
const D = window.AAARON_DATA, AR = window.AAARON_AR || {};
const Q = (s, r = document) => r.querySelector(s), QA = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const PHONE = '96891145302';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON = {arrow: '<svg class="arr" aria-hidden="true"><use href="#i-arrow"/></svg>'};

/* ------------------------------------------------------------------ data */
const {services, products, brands: BRANDS, blog} = D;
products.forEach(p => { p.brand = p.brand || 'Seal Coatings'; });
const LOGO = {'Seal Coatings': 'assets/Seal_Coatings_Logo.png', 'Geobit': 'assets/Geobit_Logo.png', 'Elephant Shield': 'assets/Elephant_Shield_Logo.png', 'Silikal': 'assets/Silikal_Logo.png'};
const BRAND_MEDIA = {
  'Seal Coatings': {img: 'assets/seal-acroprime.webp', pos: '30% 40%'},
  'Geobit': {packs: ['geobit-betocoat-pu', 'geobit-betofloor-fc']},
  'Elephant Shield': {img: 'assets/elephant-roof-wide.webp', pos: '50% 60%'},
  'Silikal': {img: 'assets/silikal-carpark.webp', pos: '50% 60%'}
};
const SVC_ART = {
  'resin-flooring': ['scene-floor', '30% 60%'], 'protective-coatings': ['scene-steel', '50% 40%'], 'thermal-insulation': ['scene-roof', '70% 40%'],
  'concrete-repairs': ['scene-repair', '40% 50%'], 'waterproofing': 'SYS', 'water-tank-coatings': ['scene-tank', '50% 50%'],
  'decorative-flooring': ['scene-metallic', '50% 50%'], 'hygiene-flooring': ['scene-floor', '85% 75%'], 'paint-works': ['scene-steel', '50% 95%']
};
const GALLERY = [
  {title: 'Industrial resin floors', cat: 'Flooring', sub: 'Durable industrial and warehouse surfaces', img: 'scene-floor', op: '50% 60%', ar: '4/3'},
  {title: 'Roof waterproofing', cat: 'Waterproofing', sub: 'Water-resistant roof protection systems', img: 'scene-roof', op: '40% 50%', ar: '4/5'},
  {title: 'Industrial protective coatings', cat: 'Coatings', sub: 'Protection for exposed plant and equipment', img: 'scene-steel', op: '50% 50%', ar: '1/1'},
  {title: 'Concrete repair & restoration', cat: 'Repairs', sub: 'Concrete rehabilitation and surface preparation', img: 'scene-repair', op: '40% 50%', ar: '4/3'},
  {title: 'Water tank lining systems', cat: 'Waterproofing', sub: 'Seamless linings and tank protection', img: 'scene-tank', op: '50% 50%', ar: '4/5'},
  {title: 'Commercial decorative finishes', cat: 'Flooring', sub: 'Seamless flooring for commercial interiors', img: 'scene-metallic', op: '50% 50%', ar: '1/1'}
];
const APPS = [
  {id: 'roof', label: 'Roofs & terraces', icon: 'roof', service: 'Waterproofing', test: p => /\broofs?\b|\bterrace|\bbalcon|metal roofs/i.test(p.short + ' ' + p.use) || /thermal shield rf/i.test(p.name)},
  {id: 'below', label: 'Basements & foundations', icon: 'base', service: 'Waterproofing', test: p => /\bfoundations?\b|below[- ]ground|\bpools?\b|geosynthetic|\bsbs\b/i.test(p.short + ' ' + p.name) || (p.cat === 'Waterproofing' && /membrane/i.test(p.name + p.short))},
  {id: 'tank', label: 'Water tanks', icon: 'tank', service: 'Water Tank Coatings', test: p => /tank|reservoir|polyurea|lining|aquaculture/i.test(p.short + ' ' + p.name + ' ' + p.use)},
  {id: 'floor', label: 'Floors', icon: 'floor', service: 'Resin Flooring', test: p => p.cat === 'Flooring' || /floor/i.test(p.name + ' ' + p.short)},
  {id: 'repair', label: 'Concrete repair', icon: 'repair', service: 'Concrete Repairs', test: p => p.cat === 'Repairs' || /repair|grout|mortar|crack|micro[- ]concrete/i.test(p.short + ' ' + p.name)},
  {id: 'steel', label: 'Steel & coatings', icon: 'steel', service: 'Protective Coatings', test: p => /metal|steel|corrosion|anti-?carbon|protective|paint|exterior|interior|primer/i.test(p.short + ' ' + p.name + ' ' + p.use) && p.cat !== 'Flooring'}
];
const PRODUCT_PACK = p => {
  const n = p.name.toLowerCase(), c = p.cat.toLowerCase();
  if (p.brand === 'Elephant Shield') return n.includes('fabric') ? null : 'elephant-liquid-rubber';
  if (p.brand !== 'Geobit') return null;
  if (n.includes('betocoat pu2k')) return 'geobit-betocoat-pu2k';
  if (n.includes('betocoat pu')) return 'geobit-betocoat-pu';
  if (n.includes('betofloor sl')) return 'geobit-betofloor-sl';
  if (n.includes('betofloor')) return 'geobit-betofloor-fc';
  if (n.includes('betocure')) return 'geobit-betocure';
  if (n.includes('betogrout')) return 'geobit-betogrout-ns';
  if (n.includes('betoflex ac')) return 'geobit-betoflex-ac';
  if (n.includes('betoure') || c.includes('polyurea')) return 'geobit-betourea';
  if (n.includes('4s')) return 'geobit-betoflex-app-membrane';
  if (n.includes('geosynthetic')) return 'geobit-betotec-mesh';
  if (c.includes('waterproofing')) return 'geobit-betoflex-membrane';
  if (c.includes('flooring')) return 'geobit-betofloor-fc';
  if (c.includes('repairs')) return 'geobit-betogrout-ns';
  return null;
};
const VIDEOS = [
  {id: 'buildup', title: 'How a waterproofing system is built', desc: 'The five layers of a roof or terrace system, from substrate to protection.'},
  {id: 'basement', title: 'Why basements leak', desc: 'How groundwater gets in, and how a membrane on the outer face stops it.'}
];
const ARTICLE_VIDEO = {'roof-waterproofing-systems': 'buildup'};
const DARK_PACK = new Set(['geobit-betoflex-ac', 'geobit-betourea']);

/* ------------------------------------------------------------------ language */
let language = window.AAARON_DEFAULT_LANG || (() => { try { return localStorage.getItem('aaaron-language') === 'ar' ? 'ar' : 'en'; } catch { return 'en'; } })();
const origAttr = new WeakMap();
function translatePiece(str) {
  const key = str.trim().replace(/\s+/g, ' ');
  if (!key) return str;
  let r = AR[key], m;
  const tr = k => AR[k] || k;
  if (!r && (m = key.match(/^Request (.+) quote$/))) r = 'اطلب عرض سعر لـ ' + tr(m[1]);
  if (!r && (m = key.match(/^Showing (\d+) of (\d+) catalogue references$/))) r = `عرض ${m[1]} من أصل ${m[2]} مرجعاً للمنتجات`;
  if (!r && (m = key.match(/^(\d+) catalogue references$/))) r = `${m[1]} مرجعاً في الكتالوج`;
  if (!r && (m = key.match(/^(\d+) matching catalogue references$/))) r = `${m[1]} مرجعاً مطابقاً في الكتالوج`;
  if (!r && (m = key.match(/^View (.+) details$/))) r = 'عرض تفاصيل ' + tr(m[1]);
  if (!r && (m = key.match(/^Read (.+)$/)) && AR[m[1]]) r = 'اقرأ ' + AR[m[1]];
  if (!r && (m = key.match(/^(.+?) · (.+)$/))) r = tr(m[1]) + ' · ' + tr(m[2]);
  if (!r && (m = key.match(/^(.+?) \/ (.+)$/)) && (AR[m[1]] || AR[m[2]])) r = tr(m[1]) + ' / ' + tr(m[2]);
  if (!r) return str;
  return str.match(/^\s*/)[0] + r + str.match(/\s*$/)[0];
}
function localize(root = document.body) {
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode(n) { const p = n.parentElement; if (!p || p.closest('script,style,noscript,[data-no-translate],.msgs,#aaChat')) return NodeFilter.FILTER_REJECT; return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; }});
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  for (const n of nodes) {
    if (n._en === undefined) n._en = n.nodeValue;
    const want = language === 'ar' ? translatePiece(n._en) : n._en;
    if (n.nodeValue !== want) n.nodeValue = want;
  }
  const els = [...(root.querySelectorAll ? root.querySelectorAll('[placeholder],[aria-label],[title],[alt],option') : [])];
  if (root.nodeType === 1) els.push(root);
  for (const el of els) {
    if (el.closest('[data-no-translate],#aaChat')) continue;
    for (const a of ['placeholder', 'aria-label', 'title', 'alt']) {
      if (!el.hasAttribute(a)) continue;
      let o = origAttr.get(el); if (!o) { o = {}; origAttr.set(el, o); }
      if (!(a in o)) o[a] = el.getAttribute(a);
      const want = language === 'ar' ? translatePiece(o[a]) : o[a];
      if (el.getAttribute(a) !== want) el.setAttribute(a, want);
    }
  }
  setTitle();
}
const TITLES = {home: ['AAARON | Waterproofing and Construction Chemical Solutions, Oman', 'AAARON | العزل المائي والكيماويات الإنشائية في عُمان'], solutions: ['Solutions', 'الحلول والخدمات'], products: ['Product catalogue', 'كتالوج العلامات التجارية'], applications: ['Applications', 'معرض التطبيقات'], projects: ['Projects & references', 'المشاريع والمرجعيات'], about: ['About us', 'من نحن'], group: ['AAA Group', 'مجموعة AAA'], blog: ['Blog', 'المدونة والمعرفة الفنية'], contact: ['Contact and quotation', 'التواصل وطلب عرض سعر']};
let currentRoute = 'home';
function setTitle() {
  const t = TITLES[currentRoute] || TITLES.home, i = language === 'ar' ? 1 : 0;
  document.title = currentRoute === 'home' ? t[i] : 'AAARON | ' + t[i];
}
function heroLines() {
  QA('.hero h1 .ln').forEach((ln, li) => {
    if (!ln._en) ln._en = ln.innerHTML;
    if (language === 'ar') ln.innerHTML = ln.dataset.ar.split(' ').map((w, i) => `<span class="w" style="--i:${li * 3 + i}">${w}</span>`).join(' ');
    else ln.innerHTML = ln._en;
  });
  const h = Q('.hero h1'); if (h) h.setAttribute('aria-label', language === 'ar' ? 'بُنيت لتحمي. وصُنعت لتدوم.' : 'Built to protect. Made to last.');
}
function updateLanguage(next) {
  language = next;
  const h = document.documentElement;
  h.lang = next; h.dir = next === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('ar-mode', next === 'ar');
  try { localStorage.setItem('aaaron-language', next); } catch {}
  const t = Q('#languageToggle');
  t.textContent = next === 'ar' ? 'EN' : 'العربية';
  t.setAttribute('aria-label', next === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  Q('#mobileLang').textContent = next === 'ar' ? 'English' : 'العربية';
  heroLines();
  if (Q('#blogList') && !Q('#blogList').hidden) renderVideos();
  else if (Q('#blogArticle') && !Q('#blogArticle').hidden) renderBlog((location.hash.split('/')[2]) || '');
  localize();
  chatRefresh();
}

/* ------------------------------------------------------------------ renderers */
const brandBySlug = s => BRANDS.find(b => b.slug === s);
function brandCard(b) {
  const m = BRAND_MEDIA[b.name], n = products.filter(p => p.brand === b.name).length;
  const media = m.packs
    ? `<div class="packs" style="background:linear-gradient(160deg,#fff,#e6edf0)">${m.packs.map(k => `<img src="assets/${k}.webp" alt="" loading="lazy">`).join('')}</div>`
    : `<img src="${m.img}" alt="" loading="lazy" style="object-position:${m.pos}">`;
  return `<a class="bcard" href="#/products/${b.slug}"><div class="ph">${media}<span class="mark"><img src="${LOGO[b.name]}" alt="${esc(b.name)}"></span></div><div class="bd"><h3>${esc(b.name)}</h3><p>${esc(b.desc)}</p><span class="cnt">${n} catalogue references</span></div></a>`;
}
function renderHome() {
  Q('#homeLogos').innerHTML = BRANDS.map(b => `<a class="logo-pill" href="#/products/${b.slug}" aria-label="${esc(b.name)}"><img src="${LOGO[b.name]}" alt="${esc(b.name)}"></a>`).join('');
  Q('#homeBrands').innerHTML = BRANDS.map(brandCard).join('');
  Q('#homeJournal').innerHTML = blog.map(a => `<a class="jitem" href="#/blog/${a.slug}"><img src="${a.img}" alt="" loading="lazy"><div><small>${esc(a.cat)}</small><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p></div></a>`).join('');
}
function renderSolutions() {
  Q('#solutionJump').innerHTML = services.map(s => `<a class="fbtn" href="#/solutions/${s.id}">${esc(s.name)}</a>`).join('');
  const sys = Q('#sysSvg');
  Q('#serviceList').innerHTML = services.map(s => {
    const a = SVC_ART[s.id];
    const art = a === 'SYS' ? '<div class="svc-art" data-sys style="background:#0a2740;display:grid;place-items:center"></div>' : `<div class="svc-art"><img src="assets/img/${a[0]}.webp" alt="" loading="lazy" style="object-position:${a[1]}"></div>`;
    return `<article class="svc" id="service-${s.id}">${art}<div><span class="tag">${esc(s.tag)}</span><h3>${esc(s.name)}</h3><p class="desc">${esc(s.desc)}</p><p class="det">${esc(s.detail)}</p><ol>${s.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol><button class="btn ink sm" type="button" data-quote-service="${esc(s.name)}">Request ${esc(s.name)} quote</button></div></article>`;
  }).join('');
  const slot = Q('[data-sys]');
  if (slot && sys) { const c = sys.cloneNode(true); c.removeAttribute('id'); c.dataset.step = '5'; c.setAttribute('aria-hidden', 'true'); c.removeAttribute('role'); c.removeAttribute('aria-label'); c.style.maxHeight = 'none'; slot.appendChild(c); }
  Q('#interest').innerHTML = '<option value="">Select a service</option>' + services.map(s => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('');
}
let activeBrand = 'All', activeCat = 'All', activeApp = null;
function productImage(p) {
  if (p.img) return {full: true, style: 'background:#e6ebee', html: `<img class="full" src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`};
  const pack = PRODUCT_PACK(p);
  if (pack) { const dark = DARK_PACK.has(pack); const white = pack.startsWith('geobit') && !dark; return {style: dark ? 'background:#050505' : 'background:#fff', html: `<img class="pk" src="assets/${pack}.webp" alt="" loading="lazy" style="height:auto;max-height:${p.brand === 'Elephant Shield' ? 88 : 78}%;max-width:70%;${white ? '' : ''}">`}; }
  const b = BRANDS.find(x => x.name === p.brand);
  return {style: `--sw:${p.color || b.accent}`, html: `<span class="lg"><img src="${LOGO[p.brand]}" alt="${esc(p.brand)}"></span>`};
}
function renderProducts() {
  Q('#brandFilters').innerHTML = ['All', ...BRANDS.map(b => b.name)].map(b => `<button class="fbtn" type="button" data-brand="${esc(b)}" aria-pressed="${b === activeBrand}">${b === 'All' ? 'All brands' : esc(b)}</button>`).join('');
  const cats = [...new Set(products.filter(p => activeBrand === 'All' || p.brand === activeBrand).map(p => p.cat))].sort();
  if (activeCat !== 'All' && !cats.includes(activeCat)) activeCat = 'All';
  Q('#productFilters').innerHTML = ['All', ...cats].map(c => `<button class="fbtn" type="button" data-cat="${esc(c)}" aria-pressed="${c === activeCat}">${c === 'All' ? 'All categories' : esc(c)}</button>`).join('');
  const s = Q('#productSearch').value.trim().toLocaleLowerCase();
  const found = products.filter(p => (activeBrand === 'All' || p.brand === activeBrand) && (activeCat === 'All' || p.cat === activeCat) && [p.name, p.short, p.use, p.cat, p.brand].map(v => v + ' ' + (AR[v] || '')).join(' ').toLocaleLowerCase().includes(s));
  Q('#productCount').textContent = `Showing ${found.length} of ${products.length} catalogue references`;
  Q('#productGrid').innerHTML = found.map(p => { const im = productImage(p); return `<article class="prod"><div class="im" style="${im.style}">${im.html}</div><div class="bd"><small>${esc(p.brand)} · ${esc(p.cat)}</small><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p><div class="acts"><button class="btn line sm" type="button" data-product="${esc(p.name)}">Details</button><button class="btn ink sm" type="button" data-quote-product="${esc(p.name)}">Request quote</button></div></div></article>`; }).join('') || '<p>No catalogue references match this filter.</p>';
  QA('#brandCards .bcard').forEach(c => { c.style.outline = ''; });
}
function renderFinder() {
  Q('#finderChips').innerHTML = APPS.map(a => `<button class="chip" type="button" data-app="${a.id}" aria-pressed="${a.id === activeApp}"><svg aria-hidden="true"><use href="#i-${a.icon}"/></svg>${a.label}</button>`).join('');
  const box = Q('#finderResults');
  const app = APPS.find(a => a.id === activeApp);
  if (!app) { box.innerHTML = ''; return; }
  const list = products.filter(app.test);
  box.innerHTML = `<p class="fmsg" style="grid-column:1/-1">${list.length} matching catalogue references</p>` + list.map(p => `<div class="it" role="button" tabindex="0" data-product="${esc(p.name)}"><b>${esc(p.name)}</b><span>${esc(p.brand)} · ${esc(p.cat)}</span></div>`).join('') + `<div style="grid-column:1/-1;margin-top:6px"><button class="btn amber sm" type="button" data-quote-service="${esc(app.service)}">Request ${esc(app.service)} quote</button></div>`;
}
function renderGallery(cat = 'All') {
  Q('#galleryFilters').innerHTML = ['All', 'Flooring', 'Waterproofing', 'Coatings', 'Repairs'].map(c => `<button class="fbtn" type="button" data-gcat="${c}" aria-pressed="${c === cat}">${c === 'All' ? 'All applications' : c}</button>`).join('');
  Q('#galleryGrid').innerHTML = GALLERY.map((g, i) => ({g, i})).filter(x => cat === 'All' || x.g.cat === cat).map(({g, i}) => `<button class="gcard" type="button" data-gallery="${i}" style="--ar:${g.ar};--op:${g.op}" aria-label="View ${esc(g.title)} details"><img src="assets/img/${g.img}.webp" alt="" loading="lazy"><span class="cap"><small>${esc(g.cat)}</small><b>${esc(g.title)}</b><span>${esc(g.sub)}</span></span></button>`).join('');
}
const videoHTML = v => `<figure class="vcard"><div class="vwrap"><video data-vid controls muted loop playsinline preload="metadata" poster="assets/video/${v.id}-${language}.jpg" aria-label="${esc(v.title)}"><source src="assets/video/${v.id}-${language}.mp4" type="video/mp4"><source src="assets/video/${v.id}-${language}.webm" type="video/webm"></video></div><figcaption><b>${esc(v.title)}</b><span>${esc(v.desc)}</span></figcaption></figure>`;
let vidObs = null;
function watchVideos() {
  if (vidObs) vidObs.disconnect();
  const vs = QA('video[data-vid]'); if (!vs.length) return;
  vs.forEach(v => { v.addEventListener('pause', () => { if (!v._auto) v.dataset.user = '1'; v._auto = false; }); v.addEventListener('play', () => { if (!v._auto) delete v.dataset.user; v._auto = false; }); });
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  vidObs = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.dataset.user) { v._auto = true; v.play().catch(() => { v._auto = false; }); } } else if (!v.paused) { v._auto = true; v.pause(); } }), {threshold: .55});
  vs.forEach(v => vidObs.observe(v));
}
function renderVideos() { const g = Q('#videoGrid'); if (g) { g.innerHTML = VIDEOS.map(videoHTML).join(''); watchVideos(); } }
let blogCat = 'All';
function renderBlog(slug) {
  const list = Q('#blogList'), art = Q('#blogArticle');
  const a = blog.find(x => x.slug === slug);
  if (!a) {
    list.hidden = false; art.hidden = true; renderVideos();
    Q('#blogFilters').innerHTML = ['All', ...new Set(blog.map(b => b.cat))].map(c => `<button class="fbtn" type="button" data-bcat="${esc(c)}" aria-pressed="${c === blogCat}">${c === 'All' ? 'All topics' : esc(c)}</button>`).join('');
    Q('#blogGrid').innerHTML = blog.filter(b => blogCat === 'All' || b.cat === blogCat).map(b => `<a class="bcard2" href="#/blog/${b.slug}" aria-label="Read ${esc(b.title)}"><img src="${b.img}" alt="" loading="lazy"><div class="bd"><small>${esc(b.cat)}</small><h3>${esc(b.title)}</h3><p>${esc(b.excerpt)}</p><span style="font-weight:600;font-size:14px">Read article</span></div></a>`).join('');
    return;
  }
  list.hidden = true; art.hidden = false;
  art.innerHTML = `<div class="article"><a class="back" href="#/blog">Back to all articles</a><small style="display:block;font-weight:600;color:var(--amber-ink);margin-bottom:10px">${esc(a.cat)} / From the AAARON team</small><h1 style="font-size:clamp(36px,5vw,68px);font-stretch:86%;margin-bottom:16px">${esc(a.title)}</h1><p class="lead">${esc(a.excerpt)}</p>${ARTICLE_VIDEO[a.slug] ? videoHTML(VIDEOS.find(x => x.id === ARTICLE_VIDEO[a.slug])) : ''}${a.sections.map(s => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join('')}<div class="guide">${esc(D.guidance)}</div><div class="artcta"><h2>Select the right solution for your site.</h2><p>Talk to AAARON about your requirement, required product datasheets and a project-specific quotation.</p><a class="btn amber" href="#/contact">Request technical guidance</a></div></div>`;
  watchVideos();
}
function fillProductSelect() {
  Q('#product').innerHTML = '<option value="">Select product (optional)</option>' + BRANDS.map(b => `<optgroup label="${esc(b.name)}">${products.filter(p => p.brand === b.name).map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</optgroup>`).join('');
}

/* ------------------------------------------------------------------ modal / quote */
let lastFocus = null;
function openModal(html) { lastFocus = document.activeElement; Q('#modalContents').innerHTML = html; const m = Q('#detailModal'); m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); Q('#modalClose').focus(); document.body.style.overflow = 'hidden'; }
function closeModal() { const m = Q('#detailModal'); m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }
function productDetails(name) {
  const p = products.find(x => x.name === name); if (!p) return;
  const im = productImage(p);
  openModal(`<div class="mimg${im.full ? ' prodimg' : ''}" style="${im.style};${im.full ? '' : 'display:grid;place-items:center'}">${im.full ? im.html.replace('loading="lazy"', '') : im.html.replace('class="pk"', 'class="pk" style="height:90%;width:auto"')}</div><div class="meta"><span>${esc(p.brand)}</span><span>${esc(p.cat)}</span><span>${esc(p.use)}</span></div><h2 id="modalHeading">${esc(p.name)}</h2><p>${esc(p.short)}</p><p style="font-size:14px;color:var(--mute)">Product information is introductory. Confirm availability, application limits and the current manufacturer TDS with AAARON before specification.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn amber" type="button" data-quote-product="${esc(p.name)}">Request quote</button></div>`);
}
function galleryDetails(i) {
  const g = GALLERY[i]; if (!g) return;
  openModal(`<div class="mimg"><img src="assets/img/${g.img}.webp" alt="" style="object-position:${g.op}"></div><div class="meta"><span>${esc(g.cat)}</span><span>Illustrative render</span></div><h2 id="modalHeading">${esc(g.title)}</h2><p>${esc(g.sub)}</p><p style="font-size:14px;color:var(--mute)">This image is an illustrative render, not an AAARON project photograph.</p><div><button class="btn amber" type="button" data-quote-service="${esc(g.cat === 'Flooring' ? 'Resin Flooring' : g.cat === 'Waterproofing' ? 'Waterproofing' : g.cat === 'Repairs' ? 'Concrete Repairs' : 'Protective Coatings')}">Request a quotation</button></div>`);
}
function openQuote(service, product) {
  closeModal();
  if (service) Q('#interest').value = service;
  if (product) Q('#product').value = product;
  if (location.hash !== '#/contact') location.hash = '#/contact'; else route();
  setTimeout(() => Q('#fullName').focus({preventScroll: true}), 350);
}

/* ------------------------------------------------------------------ router */
const PAGES = ['home', 'about', 'solutions', 'products', 'applications', 'projects', 'contact', 'group', 'blog'];
function route() {
  const path = (location.hash || '#/home').replace(/^#\/?/, '').split('/').filter(Boolean);
  const name = PAGES.includes(path[0]) ? path[0] : 'home';
  currentRoute = name;
  QA('.page').forEach(s => s.classList.toggle('active', s.dataset.page === name));
  QA('[data-nav]').forEach(a => a.getAttribute('data-nav') === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  closeMenu();
  let scrollTarget = null;
  if (name === 'products') {
    const seg = path[1] || '';
    if (seg.startsWith('for-')) { activeApp = seg.slice(4); activeBrand = 'All'; scrollTarget = '#finder'; }
    else if (brandBySlug(seg)) { activeBrand = brandBySlug(seg).name; activeApp = null; scrollTarget = '#brandFilters'; }
    renderFinder(); renderProducts();
  }
  if (name === 'solutions' && path[1]) scrollTarget = '#service-' + path[1];
  if (name === 'blog') renderBlog(path[1]);
  setTitle();
  if (scrollTarget && Q(scrollTarget)) setTimeout(() => Q(scrollTarget).scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block: scrollTarget === '#finder' ? 'center' : 'start'}), 80);
  else window.scrollTo({top: 0, behavior: 'instant'});
  if (!scrollTarget) setTimeout(() => Q('#main').focus({preventScroll: true}), 0);
  if (name === 'home') setupSystem();
}
function closeMenu() { Q('#mobileMenu').classList.remove('open'); Q('#menuBtn').setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }

/* ------------------------------------------------------------------ interactions */
let sysObs = null;
function setupSystem() {
  const svg = Q('#sysSvg'), steps = QA('.step');
  if (!svg || !steps.length) return;
  const set = n => { svg.dataset.step = n; steps.forEach(s => s.classList.toggle('on', +s.dataset.step === n)); };
  if (sysObs) sysObs.disconnect();
  if (!('IntersectionObserver' in window)) { set(5); return; }
  sysObs = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.step); }); }, {rootMargin: '-42% 0px -42% 0px'});
  steps.forEach(s => { s.tabIndex = 0; sysObs.observe(s); s.onfocus = () => set(+s.dataset.step); });
  const head = Q('.scrolly .head');
  if (head) new IntersectionObserver(es => { if (es[0].isIntersecting && es[0].boundingClientRect.top > 0) set(0); }, {threshold: .6}).observe(head);
}
function setupHero() {
  const hero = Q('#hero'); if (!hero || reduceMotion) return;
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
}

/* ------------------------------------------------------------------ forms */
function buildMessage() {
  const f = new FormData(Q('#quoteForm'));
  const lines = ['Hello AAARON, I would like to request a quotation.', '', 'Name: ' + f.get('name'), 'Company: ' + (f.get('company') || '-'), 'Email: ' + f.get('email'), 'Phone: ' + f.get('phone'), 'Service: ' + (f.get('service') || 'Not selected'), 'Product: ' + (f.get('product') || 'Not selected'), 'Project location: ' + (f.get('location') || '-'), 'Area: ' + (f.get('area') || '-'), '', 'Project details:', '' + f.get('message')];
  const names = [...Q('#documents').files].map(x => x.name);
  if (names.length) lines.push('', 'Attachments to send separately: ' + names.join(', '));
  return lines.join('\n');
}
const fmsg = (t, c = '') => { const m = Q('#formMessage'); m.textContent = t; m.className = 'msg ' + c; };
function prepareWhatsApp() { if (!Q('#quoteForm').reportValidity()) return; const u = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(buildMessage()); const w = window.open(u, '_blank', 'noopener,noreferrer'); if (!w) location.href = u; fmsg('WhatsApp opened with your enquiry details. Please attach any selected files manually in WhatsApp before sending.', 'success'); }
function prepareEmail() { if (!Q('#quoteForm').reportValidity()) return; location.href = 'mailto:info@aaa-ron.com?subject=' + encodeURIComponent('AAARON website RFQ — ' + (Q('#interest').value || 'Project enquiry')) + '&body=' + encodeURIComponent(buildMessage()); fmsg('Your email application should open. Please attach any required documents manually.'); }
async function submitQuote(e) {
  e.preventDefault();
  const f = Q('#quoteForm'); if (!f.reportValidity()) return;
  const files = [...Q('#documents').files];
  if (files.length > 3 || files.some(x => x.size > 10 * 1024 * 1024)) { fmsg('Choose no more than 3 files, each under 10 MB.', 'error'); return; }
  if (location.protocol === 'file:') { prepareWhatsApp(); return; }
  const btn = Q('#submitBtn'), label = btn.textContent; btn.disabled = true; btn.textContent = language === 'ar' ? 'جارٍ إرسال الطلب…' : 'Sending enquiry…';
  try {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000); let r;
    try { r = await fetch('/api/enquiries', {method: 'POST', body: new FormData(f), signal: ctl.signal, headers: {Accept: 'application/json'}}); } finally { clearTimeout(t); }
    const res = await r.json().catch(() => ({}));
    if (!r.ok || !res.success) throw Error(res.error || 'The enquiry server is not configured.');
    fmsg((language === 'ar' ? 'تم استلام طلبك وحفظه. المرجع: ' : 'Your enquiry has been received and saved. Reference: ') + res.reference, 'success'); f.reset(); Q('#fileInfo').textContent = '';
  } catch (err) {
    fmsg('The server did not receive this enquiry (' + (err.message || 'connection error') + '). Please use “Open WhatsApp” or “Compose enquiry by email”; attach any documents manually.', 'error');
  } finally { btn.disabled = false; btn.textContent = label; }
}

/* ------------------------------------------------------------------ chat widget */
const CHAT = {"en": {"name": "AAARON Assistant", "status": "Instant help · English & Arabic", "fab": "Ask AAARON", "sub": "Instant assistance", "close": "Close chat", "placeholder": "Ask about products, services or quotes...", "send": "Send message", "notice": "General guidance only. When AI is enabled, chat messages are sent to the AI provider. Confirm technical details with our team.", "hello": "Hello! 👋 I’m the AAARON website assistant. I can help with construction chemicals from Seal Coatings, Geobit, Elephant Shield and Silikal, plus quotation requests. What do you need?", "suggestions": ["Our services", "Browse product brands", "Request a quote"], "busy": "Checking your question…", "error": "I can help with our services, products and contact details. For detailed technical advice, please contact the AAARON team.", "contact": "You can reach AAARON in Sohar, Oman on +968 9114 5302 or at info@aaa-ron.com. You can also open the quotation form.", "quote": "For an accurate quotation, please share your name, company, phone, location, application area, scope and any drawings. Open the quotation form and attach your RFQ if the server is enabled.", "pricing": "Prices depend on product, quantity, project specifications and delivery. We don’t display confirmed prices on the website. Please request a quotation.", "services": "We provide resin flooring, protective coatings, thermal insulation, concrete repairs, waterproofing, water tank coatings, decorative flooring, hygiene flooring and paint works. Tell me which application you need.", "products": "Our catalogue covers Seal Coatings thermal and waterproofing products; Geobit BETOFLEX membranes, polyurea and repair systems; Elephant Shield liquid rubber and reinforcement fabric; and Silikal resin floors and repair mortars. Choose a brand in Products; confirm stock and the latest TDS with our team.", "technical": "For product selection, share the substrate, exposure, operating temperature, chemical conditions and project requirements. Selection must be checked against the latest manufacturer TDS.", "fallback": "I can explain our services and products, or help you prepare an RFQ. For a project-specific answer, please send details to AAARON via the quotation form or WhatsApp.", "view": "View quotation form ↗", "catalogue": "View product catalogue ↗", "whatsapp": "WhatsApp AAARON ↗"}, "ar": {"name": "مساعد AAARON", "status": "مساعدة فورية · العربية والإنجليزية", "fab": "اسأل AAARON", "sub": "مساعدة فورية", "close": "إغلاق المحادثة", "placeholder": "اسأل عن المنتجات والخدمات وعروض الأسعار...", "send": "إرسال الرسالة", "notice": "إرشادات عامة فقط. عند تفعيل الذكاء الاصطناعي تُرسل رسائل الدردشة إلى مزود خدمة الذكاء الاصطناعي. أكّد التفاصيل الفنية مع فريقنا.", "hello": "مرحباً! 👋 أنا مساعد AAARON. أساعدك في منتجات سيل كوتينغز وجيوبيت وإليفانت شيلد وسيليكـال، وطلبات عروض الأسعار. كيف أساعدك؟", "suggestions": ["خدماتنا", "تصفح العلامات التجارية", "طلب عرض سعر"], "busy": "جارٍ مراجعة سؤالك…", "error": "يمكنني مساعدتك في الخدمات والمنتجات وبيانات التواصل. للحصول على استشارة فنية مفصلة، تواصل مع فريق AAARON.", "contact": "يمكنك التواصل مع AAARON في صحار، عُمان على +968 9114 5302 أو عبر info@aaa-ron.com، أو تعبئة نموذج طلب عرض السعر.", "quote": "للحصول على عرض سعر دقيق، أرسل الاسم والشركة والهاتف وموقع المشروع ومساحة التطبيق والنطاق والرسومات إن وجدت. افتح نموذج الطلب وأرفق المستندات عند تفعيل الخادم.", "pricing": "تتغير الأسعار حسب المنتج والكمية والمواصفات والتوصيل. لا توجد أسعار مؤكدة منشورة على الموقع. يرجى طلب عرض سعر.", "services": "نقدم الأرضيات الراتنجية والطلاءات الواقية والعزل الحراري وإصلاح الخرسانة والعزل المائي وطلاءات خزانات المياه والأرضيات الزخرفية والصحية وأعمال الدهانات. ما الخدمة التي تحتاجها؟", "products": "يشمل كتالوجنا سيل كوتينغز للعزل والطلاءات، وجيوبيت بيتوفليكس للأغشية والبولي يوريا والإصلاح، وإليفانت شيلد للمطاط السائل وقماش التسليح، وسيليكـال للأرضيات والملاط. اختر العلامة من صفحة المنتجات وتأكد من النشرات الفنية والتوافر.", "technical": "لاختيار المنتج، أرسل نوع السطح وظروف التعرض ودرجة حرارة التشغيل والظروف الكيميائية ومتطلبات المشروع. يجب التأكد من توافقه مع أحدث النشرات الفنية للشركة المصنّعة.", "fallback": "يمكنني توضيح خدماتنا ومنتجاتنا أو مساعدتك في إعداد طلب عرض سعر. للاستفسارات الفنية الخاصة بمشروعك، أرسل التفاصيل عبر النموذج أو واتساب.", "view": "فتح نموذج عرض السعر ↗", "catalogue": "عرض كتالوج المنتجات ↗", "whatsapp": "واتساب AAARON ↗"}};
const cs = {messages: [], opened: false, busy: false, mode: 'messages', file: null};
const cL = () => CHAT[language];
function buildChat() {
  document.body.insertAdjacentHTML('beforeend', `<div class="chat-widget" id="aaChat">
  <section class="panel" id="chatPanel" role="dialog" aria-label="AAARON support chat" hidden>
   <header class="ph-head"><img src="assets/Sara_AI_Avatar.png" alt="" width="42" height="42"><div><strong id="chatName"></strong><span id="chatStatus"></span></div><button id="chatClose" type="button" aria-label="Close chat">⌄</button></header>
   <nav class="modes" aria-label="Contact options"><button class="active" id="modeMsg" type="button"><svg><use href="#i-chat"/></svg><span id="modeMsgT"></span></button><button id="modeCall" type="button"><svg><use href="#i-phone"/></svg><span id="modeCallT"></span></button></nav>
   <div class="cmain" id="chatMain"><div class="msgs" id="chatMessages" role="log" aria-live="polite"></div><div class="sugg" id="chatSugg"></div>
    <div class="attn" id="chatAttn" hidden><span id="chatAttnLabel"></span><button type="button" id="chatAttnRFQ"></button><button type="button" id="chatAttnClear" aria-label="Remove attachment">×</button></div>
    <form class="cform" id="chatForm"><div class="iw"><input type="text" id="chatInput" maxlength="1000" autocomplete="off" required><button class="mini" type="button" id="chatMic" aria-label="Dictate message"><svg><use href="#i-mic"/></svg></button><label class="mini" style="cursor:pointer" aria-label="Attach document"><svg><use href="#i-clip"/></svg><input type="file" id="chatFile" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"></label></div><button class="send" id="chatSend" type="submit" aria-label="Send message"><svg><use href="#i-send"/></svg></button></form>
    <p class="cdisc" id="chatDisc"></p></div>
   <div class="callv" id="chatCall" hidden><img src="assets/Sara_AI_Avatar.png" alt="" width="88" height="88"><h3>Sara</h3><p id="callRole"></p><a class="btn amber" id="callLink" href="tel:+${PHONE}"></a><small id="callNote" style="color:var(--mute)"></small></div>
  </section>
  <div class="invite" id="chatInvite"><img src="assets/Sara_AI_Avatar.png" alt="" width="40" height="40"><button class="t" type="button" id="inviteOpen"></button><button class="x" type="button" id="inviteClose" aria-label="Dismiss chat greeting">×</button></div>
  <div class="launchers"><a class="fab wa" href="https://wa.me/${PHONE}?text=Hello%20AAARON%2C%20I%20have%20an%20enquiry." target="_blank" rel="noopener noreferrer" aria-label="Chat with AAARON on WhatsApp"><svg><use href="#i-wa"/></svg></a><button class="fab ch" id="chatFab" type="button" aria-controls="chatPanel" aria-expanded="false" aria-label="Chat with Sara AI"><svg><use href="#i-chat"/></svg></button></div></div>`);
}
function chatAdd(role, text, save = true) {
  const el = document.createElement('div'); el.className = 'bub ' + (role === 'user' ? 'me' : 'bot'); el.dir = 'auto'; el.textContent = text;
  Q('#chatMessages').appendChild(el); Q('#chatMessages').scrollTop = 1e6;
  if (save) { cs.messages.push({role: role === 'bot' ? 'assistant' : 'user', content: text}); cs.messages = cs.messages.slice(-12); }
  return el;
}
function chatRefresh() {
  if (!Q('#aaChat')) return;
  const c = cL(), ar = language === 'ar';
  Q('#chatName').textContent = cs.mode === 'call' ? (ar ? 'تحدث معنا!' : 'Talk to us!') : (ar ? 'هل لديك سؤال؟' : 'Have a question?');
  Q('#chatStatus').textContent = ar ? 'سارة · مساعد AAARON الذكي' : 'Sara · AAARON AI Assistant';
  Q('#modeMsgT').textContent = ar ? 'محادثة' : 'Message us'; Q('#modeCallT').textContent = ar ? 'اتصل بنا' : 'Call us';
  Q('#chatInput').placeholder = ar ? 'اكتب رسالة' : 'Type a message'; Q('#chatInput').setAttribute('aria-label', c.placeholder);
  Q('#chatDisc').textContent = ar ? 'مساعد AAARON الذكي · إرشاد عام فقط' : 'AAARON AI assistant · General guidance only';
  Q('#inviteOpen').innerHTML = ar ? 'مرحباً! هل لديك سؤال؟<br>تواصل معنا هنا.' : 'Hi there! Have a question?<br>Talk with us here.';
  Q('#callRole').textContent = ar ? 'المساعد الذكي لخدمة عملاء AAARON' : 'AAARON AI Support Assistant';
  Q('#callLink').textContent = ar ? 'اتصل بنا هنا' : 'Call us here';
  Q('#callNote').textContent = ar ? 'يفتح تطبيق الاتصال · +968 9114 5302' : 'Opens your phone dialer · +968 9114 5302';
  Q('#chatAttnRFQ').textContent = ar ? 'أرفق مع طلب السعر' : 'Add to RFQ';
  const L = ar ? {panel: 'دعم AAARON', opts: 'خيارات التواصل', attach: 'إرفاق مستند', wa: 'تواصل مع AAARON عبر واتساب', fab: 'تحدث مع سارة', close: 'إغلاق المحادثة', mic: 'إملاء الرسالة', inv: 'إخفاء رسالة الترحيب', rm: 'إزالة المرفق', send: 'إرسال الرسالة'}
    : {panel: 'AAARON support chat', opts: 'Contact options', attach: 'Attach document', wa: 'Chat with AAARON on WhatsApp', fab: 'Chat with Sara AI', close: 'Close chat', mic: 'Dictate message', inv: 'Dismiss chat greeting', rm: 'Remove attachment', send: 'Send message'};
  const A = (sel, v) => { const e = Q(sel); if (e) e.setAttribute('aria-label', v); };
  A('#chatPanel', L.panel); A('.modes', L.opts); A('label.mini', L.attach); A('.fab.wa', L.wa); A('#chatFab', L.fab); A('#chatClose', L.close);
  A('#chatMic', L.mic); A('#inviteClose', L.inv); A('#chatAttnClear', L.rm); A('#chatSend', L.send);
  if (!cs.messages.length) { Q('#chatMessages').replaceChildren(); chatAdd('bot', c.hello, false); }
  const box = Q('#chatSugg'); box.replaceChildren();
  c.suggestions.forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.onclick = () => chatSubmit(s); box.appendChild(b); });
}
function chatMode(m) { cs.mode = m; Q('#chatMain').hidden = m !== 'messages'; Q('#chatCall').hidden = m !== 'call'; Q('#modeMsg').classList.toggle('active', m === 'messages'); Q('#modeCall').classList.toggle('active', m === 'call'); chatRefresh(); }
function chatOpen() { Q('#chatInvite').hidden = true; Q('#chatPanel').hidden = false; Q('#chatFab').setAttribute('aria-expanded', 'true'); cs.opened = true; Q('#chatInput').focus(); }
function chatClose() { Q('#chatPanel').hidden = true; Q('#chatFab').setAttribute('aria-expanded', 'false'); cs.opened = false; Q('#chatFab').focus(); }
function chatLocal(input) {
  const q = input.toLowerCase().normalize('NFKC').replace(/[\u064b-\u065f]/g, ''), c = cL();
  if (/quote|quotation|rfq|proposal|عرض|سعر|تسعير|مناقصة/.test(q)) return [c.quote, 'quote'];
  if (/price|cost|rate|rates|سعر|تكلفة|كم السعر/.test(q)) return [c.pricing, 'quote'];
  if (/contact|phone|office|address|location|email|whatsapp|التواصل|اتصال|هاتف|موقع|عنوان|ايميل|واتساب/.test(q)) return [c.contact, 'whatsapp'];
  if (/tds|datasheet|technical|temperature|specification|نشرة|فني|حرارة|مواصفات|شهادة/.test(q)) return [c.technical, 'quote'];
  if (/product|seal|shield|guard|flexiproof|metprime|acroprime|anticarbon|geobit|betoflex|elephant|silikal|brand|منتج|سيل|جيوبيت|بيتوفليكس|إليفانت|سيليكال|العلامات|كتالوج|طلاء حراري/.test(q)) return [c.products, 'catalogue'];
  if (/service|floor|waterproof|tank|epoxy|thermal|coating|repair|application|خدمة|خدمات|أرضيات|عزل|خزان|إيبوكسي|اصلاح|طلاءات|تطبيق/.test(q)) return [c.services, 'quote'];
  return [c.fallback, 'quote'];
}
function chatAction(type) {
  const href = {quote: '#/contact', catalogue: '#/products', whatsapp: 'https://wa.me/' + PHONE}[type], c = cL();
  const a = document.createElement('a'); a.className = 'cact'; a.href = href; a.textContent = c[type === 'quote' ? 'view' : type];
  if (type === 'whatsapp') { a.target = '_blank'; a.rel = 'noopener noreferrer'; } else a.addEventListener('click', chatClose);
  Q('#chatMessages').appendChild(a); Q('#chatMessages').scrollTop = 1e6;
}
async function chatSubmit(question) {
  if (cs.busy) return;
  const input = String(question || '').trim().slice(0, 1000); if (!input) return;
  cs.busy = true; Q('#chatSend').disabled = true; Q('#chatInput').value = '';
  chatAdd('user', input);
  const waiting = chatAdd('bot', cL().busy, false); waiting.classList.add('thinking');
  let reply = '', action = 'quote';
  try {
    if (location.protocol !== 'file:') {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000); let r;
      try { r = await fetch('/api/chat', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({language, messages: cs.messages.slice(-9)}), signal: ctl.signal}); } finally { clearTimeout(t); }
      if (r.ok) { const j = await r.json(); if (j.success && typeof j.reply === 'string' && j.reply.trim()) reply = j.reply.slice(0, 1800); }
    }
  } catch {}
  if (!reply) { const x = chatLocal(input); reply = x[0]; action = x[1]; }
  waiting.remove(); chatAdd('bot', reply); chatAction(action);
  cs.busy = false; Q('#chatSend').disabled = false; Q('#chatInput').focus();
}
function setupInvite() {
  let gone = false; try { gone = sessionStorage.getItem('aaaron-invite') === '1'; } catch {}
  const inv = Q('#chatInvite'); if (gone) { inv.hidden = true; return; }
  setTimeout(() => { if (!cs.opened) inv.hidden = true; }, 24000);
}
function bindChat() {
  Q('#chatFab').onclick = () => cs.opened ? chatClose() : chatOpen();
  Q('#chatClose').onclick = chatClose; Q('#inviteOpen').onclick = chatOpen; Q('#inviteClose').onclick = () => { Q('#chatInvite').hidden = true; try { sessionStorage.setItem('aaaron-invite', '1'); } catch {} };
  Q('#modeMsg').onclick = () => chatMode('messages'); Q('#modeCall').onclick = () => chatMode('call');
  Q('#chatForm').onsubmit = e => { e.preventDefault(); chatSubmit(Q('#chatInput').value); };
  Q('#chatMic').onclick = () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition, mic = Q('#chatMic');
    if (!R) { chatAdd('bot', language === 'ar' ? 'الإملاء الصوتي غير مدعوم في هذا المتصفح. يمكنك كتابة رسالتك هنا.' : 'Voice dictation is unavailable in this browser. You can type your question instead.', false); return; }
    if (mic.classList.contains('listening')) return;
    const rec = new R(); rec.lang = language === 'ar' ? 'ar-OM' : 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = e => { Q('#chatInput').value = (Q('#chatInput').value + ' ' + e.results[0][0].transcript).trim(); Q('#chatInput').focus(); };
    rec.onend = rec.onerror = () => mic.classList.remove('listening');
    mic.classList.add('listening'); try { rec.start(); } catch { mic.classList.remove('listening'); }
  };
  Q('#chatFile').onchange = e => { const f = e.target.files && e.target.files[0]; if (!f) return; if (f.size > 10 * 1024 * 1024) { alert(language === 'ar' ? 'الحد الأقصى 10 ميجابايت للملف.' : 'Maximum 10 MB per file.'); e.target.value = ''; return; } cs.file = f; Q('#chatAttn').hidden = false; Q('#chatAttnLabel').textContent = f.name; };
  Q('#chatAttnClear').onclick = () => { cs.file = null; Q('#chatFile').value = ''; Q('#chatAttn').hidden = true; };
  Q('#chatAttnRFQ').onclick = () => {
    if (!cs.file) return; const file = cs.file; location.hash = '#/contact'; chatClose();
    setTimeout(() => { const fld = Q('#documents'); if (!fld) return; try { const dt = new DataTransfer(); [...fld.files].slice(0, 2).forEach(x => dt.items.add(x)); dt.items.add(file); fld.files = dt.files; fld.dispatchEvent(new Event('change', {bubbles: true})); fld.focus(); } catch { alert(language === 'ar' ? 'اختر الملف مرة أخرى في نموذج طلب عرض السعر.' : 'Please choose the file again in the RFQ form.'); } }, 350);
    cs.file = null; Q('#chatAttn').hidden = true; Q('#chatFile').value = '';
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (Q('#detailModal').classList.contains('open')) closeModal(); else if (cs.opened) chatClose(); } });
}

/* ------------------------------------------------------------------ init */
function init() {
  Q('#year').textContent = new Date().getFullYear();
  renderHome(); renderSolutions(); renderGallery(); fillProductSelect(); renderFinder(); renderProducts();
  Q('#brandCards').innerHTML = BRANDS.map(brandCard).join('');
  buildChat(); bindChat(); setupInvite(); chatMode('messages');
  window.addEventListener('hashchange', route);
  Q('#menuBtn').onclick = () => { const m = Q('#mobileMenu'), o = m.classList.toggle('open'); Q('#menuBtn').setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  Q('#mobileMenu').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  Q('#languageToggle').onclick = () => updateLanguage(language === 'ar' ? 'en' : 'ar');
  Q('#mobileLang').onclick = () => { updateLanguage(language === 'ar' ? 'en' : 'ar'); closeMenu(); };
  document.addEventListener('click', e => {
    const t = e.target;
    let el;
    if ((el = t.closest('[data-brand]'))) { activeBrand = el.dataset.brand; activeApp = null; renderFinder(); renderProducts(); }
    else if ((el = t.closest('[data-cat]'))) { activeCat = el.dataset.cat; renderProducts(); }
    else if ((el = t.closest('[data-app]'))) { activeApp = activeApp === el.dataset.app ? null : el.dataset.app; renderFinder(); }
    else if ((el = t.closest('[data-gcat]'))) renderGallery(el.dataset.gcat);
    else if ((el = t.closest('[data-bcat]'))) { blogCat = el.dataset.bcat; renderBlog(); }
    else if ((el = t.closest('[data-gallery]'))) galleryDetails(+el.dataset.gallery);
    else if ((el = t.closest('[data-product]'))) productDetails(el.dataset.product);
    else if ((el = t.closest('[data-quote-product]'))) { const p = products.find(x => x.name === el.dataset.quoteProduct); openQuote(p && /floor/i.test(p.cat) ? 'Resin Flooring' : p && /waterproof|polyurea/i.test(p.cat) ? 'Waterproofing' : p && /repair/i.test(p.cat) ? 'Concrete Repairs' : '', el.dataset.quoteProduct); }
    else if ((el = t.closest('[data-quote-service]'))) openQuote(el.dataset.quoteService);
    else if (t.id === 'detailModal') closeModal();
  });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.fres .it')) { e.preventDefault(); productDetails(e.target.dataset.product); } });
  Q('#modalClose').onclick = closeModal;
  Q('#productSearch').addEventListener('input', renderProducts);
  Q('#directWA').onclick = prepareWhatsApp; Q('#directMail').onclick = prepareEmail; Q('#quoteForm').addEventListener('submit', submitQuote);
  Q('#documents').addEventListener('change', e => { Q('#fileInfo').textContent = [...e.target.files].map(f => f.name).join(', '); });
  setupHero();
  route();
  updateLanguage(language);
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; setTimeout(() => { queued = false; localize(); }, 0); }).observe(document.body, {subtree: true, childList: true});
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
