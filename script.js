/* ============================================================
   OmniCalc Privacy Policy – Scripts
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- URL parameters (override detection) --- */
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  const urlTheme = urlParams.get('theme');

  /* --- State --- */
  let currentLang = 'en';
  let toastTimer = null;

  /* --- DOM refs --- */
  const contentEn = document.getElementById('content-en');
  const contentAr = document.getElementById('content-ar');
  const langBtns = document.querySelectorAll('.lang-btn');
  const themeToggle = document.querySelector('.theme-toggle');
  const backToTop = document.querySelector('.back-to-top');
  const tocContainer = document.querySelector('.toc');
  const tocList = document.querySelector('.toc-list');
  const tocHeader = document.querySelector('.toc-header');
  const tocToggle = document.querySelector('.toc-toggle');
  const toast = document.querySelector('.toast');

  /* ============================================================
     THEME
     ============================================================ */

  function getPreferredTheme() {
    if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme;
    const stored = localStorage.getItem('omniTheme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem('omniTheme', theme);
  }

  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  setTheme(getPreferredTheme());

  themeToggle.addEventListener('click', toggleTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('omniTheme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ============================================================
     LANGUAGE
     ============================================================ */

  function getPreferredLanguage() {
    if (urlLang === 'ar' || urlLang === 'en') return urlLang;
    const stored = localStorage.getItem('omniLang');
    if (stored === 'en' || stored === 'ar') return stored;
    const langs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (const l of langs) {
      const code = l.split('-')[0];
      if (code === 'ar') return 'ar';
    }
    return 'en';
  }

  function setLanguage(lang) {
    currentLang = lang;

    if (lang === 'ar') {
      contentAr.removeAttribute('hidden');
      contentEn.setAttribute('hidden', '');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else {
      contentEn.removeAttribute('hidden');
      contentAr.setAttribute('hidden', '');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }

    langBtns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang);
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    localStorage.setItem('omniLang', lang);
    updateLocalizedTexts(lang);
    generateToc();
    updateActiveTocItem();
  }

  function updateLocalizedTexts(lang) {
    document.querySelectorAll('[data-en][data-ar]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });
    const backBtn = document.querySelector('.back-to-top');
    if (backBtn) {
      backBtn.setAttribute('aria-label', backBtn.getAttribute('data-' + lang));
    }
  }

  langBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(this.getAttribute('data-lang'));
    });
  });

  setLanguage(getPreferredLanguage());

  /* ============================================================
     TABLE OF CONTENTS
     ============================================================ */

  function generateToc() {
    const activeContent = currentLang === 'ar' ? contentAr : contentEn;
    const sections = activeContent.querySelectorAll('.policy-section');
    const fragment = document.createDocumentFragment();

    sections.forEach(function (sec) {
      const id = sec.getAttribute('id');
      const heading = sec.querySelector('h2');
      if (!id || !heading) return;

      const text = heading.textContent.trim().replace(/^\d+\.\s*/, '');
      const num = heading.querySelector('.section-num');
      const label = num ? num.textContent + ' ' + text : text;

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.setAttribute('href', '#' + id);
      a.textContent = label;
      li.appendChild(a);
      fragment.appendChild(li);
    });

    tocList.innerHTML = '';
    tocList.appendChild(fragment);
  }

  function updateActiveTocItem() {
    const fromTop = window.scrollY + 120;
    const activeContent = currentLang === 'ar' ? contentAr : contentEn;
    const sections = activeContent.querySelectorAll('.policy-section');
    let activeId = '';

    sections.forEach(function (sec) {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (fromTop >= top && fromTop < top + height) {
        activeId = sec.getAttribute('id');
      }
    });

    tocList.querySelectorAll('a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
    });
  }

  generateToc();

  tocHeader.addEventListener('click', function () {
    tocList.classList.toggle('collapsed');
    tocToggle.classList.toggle('open');
    tocHeader.setAttribute('aria-expanded', !tocList.classList.contains('collapsed'));
  });

  tocList.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerOffset = 80;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

    window.scrollTo({ top: top, behavior: 'smooth' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

    if (window.innerWidth <= 768) {
      tocList.classList.add('collapsed');
      tocToggle.classList.remove('open');
      tocHeader.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('scroll', function () {
    updateActiveTocItem();

    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  /* ============================================================
     BACK TO TOP
     ============================================================ */

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     COPY EMAIL
     ============================================================ */

  document.addEventListener('click', function (e) {
    const copyBtn = e.target.closest('.copy-btn');
    if (!copyBtn) return;

    const email = copyBtn.getAttribute('data-email');
    if (!email) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () {
        showCopiedToast(copyBtn);
      }).catch(function () {
        fallbackCopy(email, copyBtn);
      });
    } else {
      fallbackCopy(email, copyBtn);
    }
  });

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopiedToast(btn);
    } catch (_) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function showCopiedToast(btn) {
    btn.classList.add('copied');
    btn.textContent = '\u2713';

    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = btn.getAttribute('data-toast') || 'Copied!';
    toast.classList.add('show');

    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
      btn.classList.remove('copied');
      btn.textContent = '\uD83D\uDCCB';
    }, 2000);
  }

  /* ============================================================
     HASH HANDLING (for direct links to sections)
     ============================================================ */

  if (window.location.hash) {
    setTimeout(function () {
      const id = window.location.hash.substring(1);
      const target = document.getElementById(id);
      if (target) {
        const headerOffset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 300);
  }

});
