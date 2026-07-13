(function () {
  const tocLinksEl = document.getElementById('toc-links');
  let currentObserver = null;

  function showArticle(id, pushState) {
    document.querySelectorAll('.doc-article').forEach(a => a.classList.toggle('visible', a.id === 'article-' + id));
    document.querySelectorAll('.sidebar-link[data-article]').forEach(l => l.classList.toggle('active', l.dataset.article === id));
    document.querySelectorAll('.sidebar-link[data-chip-id]').forEach(l => l.classList.toggle('active', 'chip-' + l.dataset.chipId === id));
    window.scrollTo(0, 0);
    buildToc(id);
    if (pushState !== false) {
      history.pushState({ article: id }, '', '#' + id);
    }
  }

  const tocAside = document.getElementById('docs-toc');

  function buildToc(id) {
    const article = document.getElementById('article-' + id);
    if (currentObserver) { currentObserver.disconnect(); currentObserver = null; }
    tocLinksEl.innerHTML = '';
    if (!article) { tocAside.style.visibility = 'hidden'; return; }
    const headings = article.querySelectorAll('h2[id], h3[id]');
    if (!headings.length) { tocAside.style.visibility = 'hidden'; return; }
    tocAside.style.visibility = '';

    headings.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'toc-link' + (h.tagName === 'H3' ? ' sub' : '');
      btn.textContent = h.textContent;
      btn.dataset.target = h.id;
      btn.addEventListener('click', () => h.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      tocLinksEl.appendChild(btn);
    });

    currentObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const btn = tocLinksEl.querySelector('[data-target="' + entry.target.id + '"]');
        if (btn) btn.classList.toggle('active', entry.isIntersecting);
      });
    }, { rootMargin: '-56px 0px -65% 0px', threshold: 0 });

    headings.forEach(h => currentObserver.observe(h));
  }

  document.querySelector('.docs-sidebar').addEventListener('click', e => {
    const btn = e.target.closest('.sidebar-link[data-article]');
    if (btn) { showArticle(btn.dataset.article); closeMobileSidebar(); return; }
    const chipBtn = e.target.closest('.sidebar-link[data-chip-id]');
    if (chipBtn) { showArticle('chip-' + chipBtn.dataset.chipId); closeMobileSidebar(); }
  });

  // ── Mobile sidebar drawer toggle ──
  const sidebarEl = document.getElementById('docs-sidebar');
  const overlayEl = document.getElementById('docs-sidebar-overlay');
  const toggleBtn = document.getElementById('docs-menu-toggle');
  function openMobileSidebar() {
    sidebarEl.classList.add('open');
    overlayEl.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMobileSidebar() {
    sidebarEl.classList.remove('open');
    overlayEl.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (sidebarEl.classList.contains('open')) closeMobileSidebar();
      else openMobileSidebar();
    });
  }
  if (overlayEl) overlayEl.addEventListener('click', closeMobileSidebar);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebarEl.classList.contains('open')) closeMobileSidebar();
  });

  document.addEventListener('click', e => {
    const navLink = e.target.closest('[data-nav]');
    if (navLink) { e.preventDefault(); showArticle(navLink.dataset.nav); }
  });

  function loadFromHash() {
    const id = window.location.hash.slice(1) || 'overview';
    if (document.getElementById('article-' + id)) {
      showArticle(id, false);
    } else {
      // id is a heading anchor inside an article show the parent article without
      // resetting scroll, then jump directly to the heading
      const heading = document.getElementById(id);
      const parentArticle = heading && heading.closest('.doc-article');
      if (parentArticle) {
        const articleId = parentArticle.id.replace(/^article-/, '');
        document.querySelectorAll('.doc-article').forEach(a => a.classList.toggle('visible', a.id === 'article-' + articleId));
        document.querySelectorAll('.sidebar-link[data-article]').forEach(l => l.classList.toggle('active', l.dataset.article === articleId));
        document.querySelectorAll('.sidebar-link[data-chip-id]').forEach(l => l.classList.toggle('active', 'chip-' + l.dataset.chipId === articleId));
        buildToc(articleId);
        heading.scrollIntoView({ block: 'start' });
      } else {
        showArticle('overview', false);
      }
    }
  }

  window.__showArticle = showArticle;
  window.__loadFromHash = loadFromHash;
  window.addEventListener('popstate', loadFromHash);
  loadFromHash();
})();
