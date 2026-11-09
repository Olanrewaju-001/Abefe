/* ============================================================
   PORTFOLIO — script.js
   Vanilla JS, IIFE, no globals
   ============================================================ */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function safeStorage(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return null;
    }
  }

  /* ---------- Theme ---------- */
  const themeToggle = $('#theme-toggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F5F7FA' : '#0B0F19');
  }

  function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) { stored = null; }
    if (stored === 'light' || stored === 'dark') {
      applyTheme(stored);
    } else {
      applyTheme(prefersDark ? 'dark' : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
    }
  }
  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Mobile menu ---------- */
  const navToggle = $('#nav-toggle');
  const navList = $('#nav-list');

  // Build mobile menu overlay dynamically
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu';
  mobileMenu.id = 'mobile-menu';
  mobileMenu.setAttribute('aria-hidden', 'true');
  const mobileList = document.createElement('ul');
  mobileList.className = 'mobile-menu__list';
  $$('.nav__link').forEach(function (link) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'mobile-menu__link';
    a.href = link.getAttribute('href');
    a.textContent = link.textContent;
    li.appendChild(a);
    mobileList.appendChild(li);
  });
  mobileMenu.appendChild(mobileList);
  document.body.appendChild(mobileMenu);

  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    // focus first link
    const first = mobileMenu.querySelector('a');
    if (first) first.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); navToggle.focus(); }
    document.body.style.overflow = '';
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
  }
  // close on link click
  mobileMenu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Scroll spy ---------- */
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    const spyObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            link.classList.toggle('is-active', href === '#' + id);
          });
          $$('.mobile-menu__link').forEach(function (link) {
            const href = link.getAttribute('href');
            link.classList.toggle('is-active', href === '#' + id);
          });
        }
      });
    }, { threshold: 0.35, rootMargin: '-20% 0px -60% 0px' });
    sections.forEach(function (s) { spyObs.observe(s); });
  }

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const cObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cObs.observe(c); });
    } else {
      counters.forEach(function (c) {
        const t = parseFloat(c.getAttribute('data-count'));
        const s = c.getAttribute('data-suffix') || '';
        const d = parseInt(c.getAttribute('data-decimals') || '0', 10);
        c.textContent = t.toFixed(d) + s;
      });
    }
  }

  /* ---------- Typing effect ---------- */
  const typedEl = $('#typed');
  const phrases = ['LLM Applications','RAG Pipelines','AI Agents','Computer Vision','MLOps Platforms'];
  if (typedEl && !prefersReducedMotion) {
    let pi = 0, ci = 0, deleting = false;
    function tick() {
      const phrase = phrases[pi];
      if (!deleting) {
        typedEl.textContent = phrase.slice(0, ci + 1);
        ci++;
        if (ci === phrase.length) { deleting = true; setTimeout(tick, 1400); return; }
        setTimeout(tick, 70);
      } else {
        typedEl.textContent = phrase.slice(0, ci - 1);
        ci--;
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 300); return; }
        setTimeout(tick, 40);
      }
    }
    tick();
  } else if (typedEl) {
    typedEl.textContent = phrases[0];
  }

  /* ---------- Project filtering ---------- */
  const filterBtns = $$('.filter__btn');
  const projects = $$('.project');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      projects.forEach(function (p) {
        const cat = p.getAttribute('data-category');
        const show = f === 'all' || cat === f;
        p.classList.toggle('is-hidden', !show);
      });
    });
  });
  /* ---------- Form validation ---------- */
  const form = $('#contact-form');
  if (form) {
    const nameInput = $('#name');
    const emailInput = $('#email');
    const messageInput = $('#message');
    const submitBtn = $('#submit-btn');
    const status = $('#form-status');

    function setError(input, msg) {
      input.classList.add('is-error');
      const err = $('#' + input.id + '-error');
      if (err) err.textContent = msg;
    }
    function clearError(input) {
      input.classList.remove('is-error');
      const err = $('#' + input.id + '-error');
      if (err) err.textContent = '';
    }
    function validateEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    function validate() {
      let ok = true;
      clearError(nameInput); clearError(emailInput); clearError(messageInput);
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        setError(nameInput, 'Please enter your name (at least 2 characters).'); ok = false;
      }
      if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        setError(emailInput, 'Please enter a valid email address.'); ok = false;
      }
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        setError(messageInput, 'Please enter a message (at least 10 characters).'); ok = false;
      }
      return ok;
    }
    [nameInput, emailInput, messageInput].forEach(function (inp) {
      inp.addEventListener('input', function () { clearError(inp); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      // Backend drop-in point: set form action to your Formspree/endpoint URL.
      // Example: <form action="https://formspree.io/f/XXXX" method="POST">
      // Here we simulate success. Replace with fetch() to your endpoint.
      setTimeout(function () {
        if (status) { status.textContent = 'Thanks! Your message has been sent. I will reply within one business day.'; status.classList.remove('is-error'); }
        form.reset();
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
      }, 600);
    });
  }

  /* ---------- Back to top ---------- */
  const backToTop = $('#back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Canvas neural network background ---------- */
  const canvas = $('#hero-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let points = [];
    let raf = null;
    let running = true;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor((w * h) / 18000));
      points = [];
      for (let i = 0; i < count; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.5 + 0.8
        });
      }
    }
    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      // update
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      // connections
      const maxDist = 130;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = 'rgba(45, 212, 191, ' + alpha + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        ctx.fillStyle = 'rgba(45, 212, 191, 0.8)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }
    resize();
    step();
    window.addEventListener('resize', function () { resize(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
      } else {
        running = true;
        step();
      }
    });
  }

  /* ---------- Smooth scroll offset for anchor links ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

})();

