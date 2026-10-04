/* ============================================================
   NB Portfolio v3 — main.js
   particles · navbar · typing · reveals · counters ·
   project cards · filters · modal slider · contact form
   ============================================================ */
(function(){
'use strict';

/* ---------- helpers ---------- */
const $  = (s, c) => (c||document).querySelector(s);
const $$ = (s, c) => Array.from((c||document).querySelectorAll(s));
const esc = s => String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function fixUrl(u){
  if(!u) return '';
  u = String(u).trim();
  if(u.startsWith('http://')) u = 'https://' + u.slice(7);
  return u;
}

/* Clean WordPress/Elementor junk out of descriptions */
function cleanDesc(raw, title){
  let t = String(raw||'');
  t = t.replace(/&nbsp;/gi,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  t = t.replace(/\/\*![\s\S]*?\*\//g,' ');                 // /*! elementor ... */ comments
  t = t.replace(/\.[a-zA-Z0-9_#.\-:\[\]="'\s>+~*,()]+?\{[^}]*\}/g,' '); // CSS rule blocks
  t = t.replace(/<[^>]*>/g,' ');                            // HTML tags
  const shareIdx = t.search(/share\s*:/i);                  // "SHARE: Facebook Twitter..." boilerplate
  if(shareIdx > -1) t = t.slice(0, shareIdx);
  t = t.replace(/Scope\s+Design[\s\S]{0,120}?Data analyst/gi,' ');
  t = t.replace(/Other Projects[\s\S]*$/gi,' ');
  t = t.replace(/\s+/g,' ').trim();
  // drop one leading title stutter ("Title Title desc" -> "Title desc")
  const tl = String(title||'').trim();
  if(tl){
    const low = t.toLowerCase(), lt = tl.toLowerCase();
    if(low.startsWith(lt)){
      const after = t.slice(tl.length);
      if(after === '' || /^[\s\-–—:;,.]/.test(after)) t = after.replace(/^[\s\-–—:;,.]+/, '') || tl;
    }
  }
  if(t.length < 40) t = (title||'Project') + ' — a project from my portfolio. Open it to browse the full screenshot gallery.';
  if(t.length > 900) t = t.slice(0, 897).trim() + '…';
  return t;
}

/* ---------- normalized project data ---------- */
function getProjects(){
  if(typeof PROJECTS === 'undefined' || !Array.isArray(PROJECTS)) return [];
  return PROJECTS.map(p => {
    const seen = new Set();
    const imgs = [];
    const push = u => { u = fixUrl(u); if(u && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(u) && !seen.has(u)){ seen.add(u); imgs.push(u); } };
    push(p.featured);
    (p.images||[]).forEach(push);
    return {
      title: String(p.title||'Untitled project').trim(),
      description: cleanDesc(p.description, p.title),
      images: imgs,
      featured: imgs[0] || '',
      github: fixUrl(p.github||''),
      category: String(p.category||'Web').trim()
    };
  }).filter(p => p.images.length > 0);
}
const PROJECTS_N = getProjects();

/* image fallback -> gradient placeholder */
window.imgFallback = function(el){
  if(!el || el.dataset.fb) return;
  el.dataset.fb = '1';
  const d = document.createElement('div');
  d.className = 'img-ph';
  d.innerHTML = '<span>NB</span>';
  el.replaceWith(d);
};
const phStyle = document.createElement('style');
phStyle.textContent = '.img-ph{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#1b1b48,#0d3a52);min-height:120px}.img-ph span{font-family:var(--font-d);font-weight:700;font-size:2.4rem;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;opacity:.7}.card-media .img-ph{position:absolute;inset:0}.thumbs .img-ph{width:96px;height:60px;min-height:0;border-radius:10px}.slider-main .img-ph{position:absolute;inset:0}';
document.head.appendChild(phStyle);

/* ---------- navbar ---------- */
const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer'), scrim = $('#scrim');
function onScroll(){ nav && nav.classList.toggle('scrolled', window.scrollY > 30); }
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
function setDrawer(open){
  burger && burger.classList.toggle('open', open);
  drawer && drawer.classList.toggle('open', open);
  scrim && scrim.classList.toggle('show', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger && burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
scrim && scrim.addEventListener('click', () => setDrawer(false));
$$('#drawer a').forEach(a => a.addEventListener('click', () => setDrawer(false)));

/* ---------- toast ---------- */
let toastT;
function toast(msg){
  let t = $('.toast');
  if(!t){ t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ---------- particles ---------- */
(function particles(){
  const cv = $('#particles'); if(!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, dots = [], mouse = {x:-9999, y:-9999};
  const COLORS = ['139,92,246','34,211,238','59,130,246','168,85,247'];
  function resize(){ W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
  function init(){
    resize();
    const n = Math.min(90, Math.floor(W*H/16000));
    dots = Array.from({length:n}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.45, vy: (Math.random()-.5)*.45,
      r: Math.random()*2.2+.8, c: COLORS[Math.random()*COLORS.length|0]
    }));
  }
  cv.parentElement.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top;
  });
  cv.parentElement.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  function step(){
    ctx.clearRect(0,0,W,H);
    for(const d of dots){
      d.x += d.vx; d.y += d.vy;
      const dx = d.x-mouse.x, dy = d.y-mouse.y, dist = Math.hypot(dx,dy);
      if(dist < 130 && dist > 1){ d.x += dx/dist*.7; d.y += dy/dist*.7; }
      if(d.x<0||d.x>W) d.vx*=-1; if(d.y<0||d.y>H) d.vy*=-1;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,7);
      ctx.fillStyle = `rgba(${d.c},.85)`; ctx.shadowBlur = 10; ctx.shadowColor = `rgba(${d.c},.9)`; ctx.fill(); ctx.shadowBlur = 0;
    }
    for(let i=0;i<dots.length;i++) for(let j=i+1;j<dots.length;j++){
      const a=dots[i], b=dots[j], dist=Math.hypot(a.x-b.x,a.y-b.y);
      if(dist<130){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(139,92,246,${(1-dist/130)*.28})`; ctx.lineWidth=1; ctx.stroke(); }
    }
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', init);
  init(); step();
})();

/* ---------- typing effect ---------- */
(function typing(){
  const el = $('#typing'); if(!el) return;
  const phrases = [
    'Full-Stack Engineer',
    'React · Node.js · TypeScript',
    'AWS · Docker · Cloud & DevOps',
    'WordPress & CMS Specialist',
    'AI Automation Builder 🤖'
  ];
  let pi=0, ci=0, del=false;
  function tick(){
    const word = phrases[pi];
    el.textContent = word.slice(0, ci);
    let wait = del ? 38 : 72;
    if(!del && ci === word.length){ wait = 1600; del = true; }
    else if(del && ci === 0){ del = false; pi = (pi+1)%phrases.length; wait = 350; }
    ci += del ? -1 : 1;
    setTimeout(tick, wait);
  }
  setTimeout(tick, 600);
})();

/* ---------- reveal on scroll ---------- */
const rvObs = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting){ e.target.classList.add('in'); rvObs.unobserve(e.target); }
}), {threshold:.12});
function watchReveals(root){ $$('.rv:not(.in)', root||document).forEach(el => rvObs.observe(el)); }
watchReveals();

/* ---------- animated counters ---------- */
const cObs = new IntersectionObserver(es => es.forEach(e => {
  if(!e.isIntersecting) return;
  cObs.unobserve(e.target);
  const to = +e.target.dataset.to || 0, t0 = performance.now(), dur = 1600;
  (function up(t){
    const p = Math.min(1,(t-t0)/dur), ease = 1-Math.pow(1-p,3);
    e.target.textContent = Math.round(to*ease);
    if(p<1) requestAnimationFrame(up);
  })(t0);
}), {threshold:.5});
$$('.count').forEach(el => cObs.observe(el));

/* ---------- skill bars (about) ---------- */
const bObs = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting){ e.target.style.width = e.target.dataset.w + '%'; bObs.unobserve(e.target); }
}), {threshold:.4});
$$('.bar i').forEach(el => bObs.observe(el));

/* ---------- marquee ---------- */
(function marquee(){
  const track = $('#marqueeTrack'); if(!track) return;
  const techs = ['React','Node.js','TypeScript','AWS','Docker','WordPress','PHP','Next.js','Express','MySQL','n8n','Tailwind CSS','WooCommerce','REST APIs','Git','Figma','JavaScript','AI Agents'];
  const half = '<span>' + techs.map(t => esc(t) + ' <i>✦</i>').join('') + '</span>';
  track.innerHTML = half + half;
})();

/* ---------- project cards ---------- */
function shortDesc(p){
  const d = p.description;
  return d.length > 130 ? d.slice(0,127).trim() + '…' : d;
}
function cardHTML(p, listIdx){
  const gh = p.github
    ? `<a class="gh-mini" href="${esc(p.github)}" target="_blank" rel="noopener" data-stop="1">🐙 GitHub</a>` : '';
  return `<article class="card rv" data-list-idx="${listIdx}" tabindex="0" role="button" aria-label="View details: ${esc(p.title)}">
    <div class="card-media">
      <span class="cat-badge">${esc(p.category)}</span>
      <span class="img-count">🖼️ ${p.images.length}</span>
      <img src="${esc(p.featured)}" alt="${esc(p.title)} — screenshot" loading="lazy" onerror="imgFallback(this)">
      <div class="card-overlay"><span class="view-btn">👁 View Details</span></div>
    </div>
    <div class="card-body">
      <h3>${esc(p.title)}</h3>
      <p>${esc(shortDesc(p))}</p>
      <div class="card-foot">
        <span class="open-link">Open case study →</span>${gh}
      </div>
    </div>
  </article>`;
}
function bindCards(container){
  container.addEventListener('click', e => {
    if(e.target.closest('[data-stop]')) return;             // GitHub link: don't open modal
    const card = e.target.closest('.card');
    if(card) openModal(currentList, +card.dataset.listIdx);
  });
  container.addEventListener('keydown', e => {
    if(e.key === 'Enter' || e.key === ' '){
      if(e.target.closest('[data-stop]')) return;             // let links handle their own keys
      const card = e.target.closest('.card');
      if(card){ e.preventDefault(); openModal(currentList, +card.dataset.listIdx); }
    }
  });
}

/* ---------- home: featured ---------- */
let currentList = PROJECTS_N;   // list the modal navigates within
(function featured(){
  const grid = $('#featuredGrid'); if(!grid || !PROJECTS_N.length) return;
  const top = [...PROJECTS_N].sort((a,b) => b.images.length - a.images.length).slice(0,6);
  currentList = top;
  grid.innerHTML = top.map((p) => cardHTML(p, top.indexOf(p))).join('');
  bindCards(grid);
  watchReveals(grid);
})();

/* ---------- projects page: grid + filters + search ---------- */
(function projectsPage(){
  const grid = $('#projectsGrid'); if(!grid) return;
  const pills = $('#pills'), search = $('#searchInput'),
        countLine = $('#countLine'), emptyState = $('#emptyState');
  let cat = 'All', q = '';

  function filtered(){
    return PROJECTS_N.filter(p =>
      (cat === 'All' || p.category === cat) &&
      (!q || (p.title + ' ' + p.description).toLowerCase().includes(q))
    );
  }
  function render(){
    currentList = filtered();
    grid.innerHTML = currentList.map((p,i) => cardHTML(p,i)).join('');
    emptyState.style.display = currentList.length ? 'none' : 'block';
    const totalImgs = currentList.reduce((s,p) => s + p.images.length, 0);
    countLine.innerHTML = `Showing <b>${currentList.length}</b> of <b>${PROJECTS_N.length}</b> projects · <b>${totalImgs}</b> screenshots`;
    watchReveals(grid);
  }
  pills && pills.addEventListener('click', e => {
    const b = e.target.closest('.pill'); if(!b) return;
    $$('.pill', pills).forEach(x => x.classList.remove('active'));
    b.classList.add('active'); cat = b.dataset.cat; render();
  });
  let deb;
  search && search.addEventListener('input', () => {
    clearTimeout(deb);
    deb = setTimeout(() => { q = search.value.trim().toLowerCase(); render(); }, 180);
  });
  bindCards(grid);
  render();
})();

/* ---------- modal with image slider ---------- */
let modalEl = null, mList = [], mIdx = 0, sIdx = 0, touchX = 0;

function ensureModal(){
  if(modalEl) return modalEl;
  document.body.insertAdjacentHTML('beforeend', `
  <div class="modal-root" id="modalRoot" role="dialog" aria-modal="true">
    <div class="modal-scrim" id="modalScrim"></div>
    <div class="modal" id="modalBox">
      <button class="modal-close" id="modalClose" aria-label="Close">✕</button>
      <div class="slider">
        <div class="slider-main" id="slideMain">
          <img id="slideImg" alt="Project screenshot">
          <button class="s-arrow s-prev" id="sPrev" aria-label="Previous image">‹</button>
          <button class="s-arrow s-next" id="sNext" aria-label="Next image">›</button>
          <div class="s-dots" id="sDots"></div>
          <div class="s-counter" id="sCounter"></div>
        </div>
        <div class="thumbs" id="sThumbs"></div>
      </div>
      <div class="modal-body">
        <span class="cat-badge" id="mCat" style="position:static"></span>
        <h2 id="mTitle"></h2>
        <p class="desc" id="mDesc"></p>
        <div class="meta-row" id="mMeta"></div>
        <div class="modal-nav">
          <button class="pn-btn" id="mPrev"><span>←</span><span><small>Previous</small><span class="t" id="mPrevT"></span></span></button>
          <button class="pn-btn" id="mNext" style="flex-direction:row-reverse"><span>→</span><span style="text-align:right"><small>Next</small><span class="t" id="mNextT"></span></span></button>
        </div>
      </div>
    </div>
  </div>`);
  modalEl = $('#modalRoot');
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalScrim').addEventListener('click', closeModal);
  $('#sPrev').addEventListener('click', e => { e.stopPropagation(); showSlide(sIdx-1); });
  $('#sNext').addEventListener('click', e => { e.stopPropagation(); showSlide(sIdx+1); });
  $('#mPrev').addEventListener('click', () => openModal(mList, mIdx-1));
  $('#mNext').addEventListener('click', () => openModal(mList, mIdx+1));
  const main = $('#slideMain');
  main.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, {passive:true});
  main.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if(Math.abs(dx) > 45) showSlide(sIdx + (dx < 0 ? 1 : -1));
  }, {passive:true});
  document.addEventListener('keydown', e => {
    if(!modalEl.classList.contains('open')) return;
    if(e.key === 'Escape') closeModal();
    else if(e.key === 'ArrowRight') showSlide(sIdx+1);
    else if(e.key === 'ArrowLeft') showSlide(sIdx-1);
  });
  return modalEl;
}

function showSlide(i){
  const p = mList[mIdx]; if(!p) return;
  const n = p.images.length;
  sIdx = ((i % n) + n) % n;
  let img = $('#slideImg');
  if(!img){ // rebuild if a previous fallback replaced the element
    $('#slideMain').insertAdjacentHTML('afterbegin', '<img id="slideImg" alt="Project screenshot">');
    img = $('#slideImg');
  }
  img.classList.remove('slide-fade'); void img.offsetWidth; img.classList.add('slide-fade');
  img.onerror = () => imgFallback(img);
  img.src = p.images[sIdx];
  img.alt = `${p.title} — screenshot ${sIdx+1} of ${n}`;
  $('#sCounter').textContent = `${sIdx+1} / ${n}`;
  const dots = $('#sDots');
  dots.innerHTML = p.images.map((_,k) => `<i class="${k===sIdx?'on':''}" data-k="${k}"></i>`).join('');
  $$('#sDots i').forEach(d => d.addEventListener('click', () => showSlide(+d.dataset.k)));
  const thumbs = $('#sThumbs');
  thumbs.innerHTML = p.images.map((u,k) =>
    `<img src="${esc(u)}" class="${k===sIdx?'on':''}" data-k="${k}" alt="Thumbnail ${k+1}" loading="lazy" onerror="imgFallback(this)">`).join('');
  $$('#sThumbs img').forEach(t => t.addEventListener('click', () => showSlide(+t.dataset.k)));
  const active = $('#sThumbs img.on');
  active && active.scrollIntoView({block:'nearest', inline:'center', behavior:'smooth'});
}

function openModal(list, idx){
  if(!list || !list.length) return;
  mList = list;
  mIdx = ((idx % list.length) + list.length) % list.length;
  const p = mList[mIdx];
  ensureModal();
  $('#mCat').textContent = p.category;
  $('#mTitle').textContent = p.title;
  $('#mDesc').textContent = p.description;
  const ghBtn = p.github
    ? `<a class="btn btn-ghost btn-sm" href="${esc(p.github)}" target="_blank" rel="noopener">🐙 View on GitHub</a>` : '';
  $('#mMeta').innerHTML = `
    <span class="gh-mini" style="cursor:default">🖼️ ${p.images.length} screenshots</span>
    <span class="gh-mini" style="cursor:default">🏷️ ${esc(p.category)}</span>${ghBtn}`;
  $('#mPrevT').textContent = mIdx > 0 ? mList[mIdx-1].title : '';
  $('#mNextT').textContent = mIdx < list.length-1 ? mList[mIdx+1].title : '';
  $('#mPrev').disabled = mIdx === 0;
  $('#mNext').disabled = mIdx === list.length-1;
  sIdx = 0;
  showSlide(0);
  $('#modalBox').scrollTop = 0;
  modalEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  if(!modalEl) return;
  modalEl.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------- contact form -> mailto ---------- */
(function contactForm(){
  const form = $('#contactForm'); if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName').value.trim(), email = $('#fEmail').value.trim(), msg = $('#fMsg').value.trim();
    if(!name || !email || !msg){ toast('Please fill in all fields ✍️'); return; }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ toast('That email looks off — check it? 📧'); return; }
    const btn = $('#sendBtn');
    btn.disabled = true; btn.style.opacity = '.6'; btn.firstChild.textContent = 'Opening email… ';
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
    setTimeout(() => {
      window.location.href = `mailto:nourhb58@gmail.com?subject=${subject}&body=${body}`;
      $('#formWrap').style.display = 'none';
      $('#formOk').classList.add('show');
      toast('Opening your email app 📬');
    }, 700);
  });
  const again = $('#formAgain');
  again && again.addEventListener('click', () => {
    $('#formOk').classList.remove('show');
    $('#formWrap').style.display = 'block';
    form.reset();
    const btn = $('#sendBtn');
    btn.disabled = false; btn.style.opacity = ''; btn.firstChild.textContent = 'Send message ';
  });
})();

})();
