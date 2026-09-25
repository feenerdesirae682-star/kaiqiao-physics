// 共享交互 — 主题、滚动揭示、导航、计数器
(function() {
  let stored;
  try { stored = localStorage.getItem('kq-theme'); } catch {}
  if (stored === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  window.toggleTheme = function() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('kq-theme', next); } catch {}
    updateThemeIcon();
  };

  function updateThemeIcon() {
    const cur = document.documentElement.getAttribute('data-theme');
    document.querySelectorAll('.theme-toggle .glyph-sun').forEach(el => el.style.display = cur === 'dark' ? 'block' : 'none');
    document.querySelectorAll('.theme-toggle .glyph-moon').forEach(el => el.style.display = cur === 'dark' ? 'none' : 'block');
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(updateThemeIcon);

  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const tgt = parseInt(el.dataset.target, 10);
    if (!tgt) return;
    const dur = 1400; const steps = 40; const interval = dur / steps;
    let i = 0; el.textContent = '0';
    const id = setInterval(() => {
      i++;
      const t = Math.min(1, i / steps);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(tgt * eased).toLocaleString();
      if (i >= steps) clearInterval(id);
    }, interval);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('on');
        if (e.target.classList.contains('demo-board')) {
          e.target.querySelectorAll('.demo-step').forEach((s, i) => {
            setTimeout(() => s.classList.add('on'), 200 + i * 120);
          });
        }
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '-40px 0px' });

  ready(() => {
    document.querySelectorAll('.reveal, .demo-board').forEach(el => obs.observe(el));
    setTimeout(() => {
      document.querySelectorAll('.stat-num[data-target]').forEach(el => animateCounter(el));
    }, 400);

    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    const fill = bar.querySelector('i');
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      fill.style.width = (total > 0 ? (h.scrollTop / total) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
})();

window.renderNav = function(active) {
  const items = [
    ['index.html', '首页', 'home'],
    ['techniques.html', '物理大招库', 'techniques'],
    ['questions.html', '例题示范', 'questions'],
    ['about.html', '名师档案', 'about']
  ];
  return `<a class="skip-link" href="#main-content">跳到正文</a><nav class="topbar" aria-label="主导航">
    <div class="topbar-inner">
      <a href="index.html" class="brand" aria-label="开窍物理首页">
        <span class="seal-glyph">开</span>
        开窍物理<small>KAIQIAO · PHYS</small>
      </a>
      <div id="main-navigation" class="nav-links">
        ${items.map(([href, label, key]) => `<a href="${href}" class="${active === key ? 'active' : ''}" ${active === key ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
      </div>
      <div class="nav-meta"><button class="menu-toggle" aria-expanded="false" aria-controls="main-navigation" aria-label="打开导航菜单">菜单 ☰</button>
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="切换明暗主题">
          <svg class="glyph-moon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
          <svg class="glyph-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="display:none"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        </button>
      </div>
    </div>
  </nav>`;
};

window.renderFooter = function() {
  return `<footer class="foot"><div class="wrap"><div class="foot-inner">
    <div>
      <div style="font-family:var(--serif);font-weight:700;font-size:20px;margin-bottom:12px;">开窍物理</div>
      <p style="font-family:var(--serif);font-size:15px;color:var(--ink-2);line-height:1.7;max-width:340px;margin:0;">框架建对了，没见过的题也能做出来。<br>—— 一套贯通的物理大招体系，从初中到高考。</p>
    </div>
    <div>
      <h5>大招体系</h5>
      <a href="index.html">首页</a>
      <a href="techniques.html">物理大招库</a>
      <a href="questions.html">例题示范</a>
      <a href="about.html">名师档案</a>
    </div>
    <div>
      <h5>关于</h5>
      <a href="about.html">教研声明</a>
      <a href="about.html">履历时间线</a>
      <span style="font-family:var(--serif);font-size:14px;color:var(--ink-3);display:block;padding:4px 0;">仅展示 · 不接受报名咨询</span>
    </div>
  </div>
  <div class="colophon"><span>© ${new Date().getFullYear()} 开窍物理教研.</span><span>Set in Noto Serif SC &amp; EB Garamond.</span></div>
  </div></footer>`;
};


// 小屏菜单与键盘操作共用状态；离开小屏时清理展开状态。
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.portrait-image').forEach(img => {
    const showFallback = () => { img.hidden = true; };
    img.addEventListener('error', showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  });
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.topbar');
  if (!button || !nav) return;
  const setOpen = open => {
    nav.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    button.textContent = open ? '收起 ✕' : '菜单 ☰';
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); } });
  const mobile = matchMedia('(max-width: 880px)');
  const resetMenu = () => { if (!mobile.matches) setOpen(false); };
  if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', resetMenu);
  else if (typeof mobile.addListener === 'function') mobile.addListener(resetMenu);
});

