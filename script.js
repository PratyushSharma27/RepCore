/**
 * Repcore — Premium Smooth Scroll & Dynamic Parallax Flow Engine
 * Integrates Lenis inertia scrolling with multi-layer continuous parallax.
 */
(() => {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const progressBar = document.getElementById('scroll-progress');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------------------------------------------------------------
  // 1. Lenis Smooth Scroll Engine
  // -------------------------------------------------------------------------
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !reduced) {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth scroll helper for anchor links
  const scrollToTarget = (target) => {
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -72, duration: 1.2 });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  // Intercept in-page hash links for butter-smooth gliding
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        scrollToTarget(target);
        if (nav && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Mobile menu toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('#nav-mobile a').forEach((a) =>
    a.addEventListener('click', () => {
      if (nav) nav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // -------------------------------------------------------------------------
  // 2. Parallax Elements Cache
  // -------------------------------------------------------------------------
  const orb1 = document.querySelector('.ambient__orb--1');
  const orb2 = document.querySelector('.ambient__orb--2');
  const orb3 = document.querySelector('.ambient__orb--3');
  const heroInner = document.querySelector('.hero__inner');
  const heroVisual = document.getElementById('hero-visual');
  const heroImg = heroVisual ? heroVisual.querySelector('.hero__img') : null;
  const heroGlow = heroVisual ? heroVisual.querySelector('.hero__glow') : null;
  const pageHeroInner = document.querySelector('.page-hero__inner');
  const processSteps = document.querySelectorAll('.process__step');
  const saasRing = document.querySelector('.visual-saas .vs-ring');
  const vmPhone = document.querySelector('.visual-mobile .vm-phone');
  const vbHero = document.querySelector('.visual-browser .vb-hero');
  const founderCard = document.querySelector('.founder-card');
  const founderMonogram = document.querySelector('.founder-monogram');

  // Trigger initial visibility for hero image
  if (heroVisual && heroImg) {
    const showHero = () => requestAnimationFrame(() => heroVisual.classList.add('is-visible'));
    if (heroImg.complete) showHero();
    else heroImg.addEventListener('load', showHero);
  }

  // -------------------------------------------------------------------------
  // 3. Continuous Scroll Loop (Smooth Parallax & Flow)
  // -------------------------------------------------------------------------
  let lastScrollY = -1;
  const onScrollUpdate = () => {
    const scrollY = window.scrollY;
    if (scrollY === lastScrollY) return;
    lastScrollY = scrollY;

    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight - winHeight;

    // 1. Navbar blur transition
    if (nav) {
      nav.classList.toggle('is-scrolled', scrollY > 16);
    }

    // 2. Glowing top progress bar
    if (progressBar && docHeight > 0) {
      const pct = Math.min(Math.max((scrollY / docHeight) * 100, 0), 100);
      progressBar.style.width = `${pct}%`;
    }

    if (reduced) return;

    // 3. Ambient Orbs Multi-layer Parallax
    if (orb1) orb1.style.transform = `translateX(-50%) translateY(${scrollY * 0.16}px) scale(${1 + scrollY * 0.00015})`;
    if (orb2) orb2.style.transform = `translate(${scrollY * -0.06}px, ${scrollY * 0.12}px)`;
    if (orb3) orb3.style.transform = `translate(${scrollY * 0.08}px, ${scrollY * -0.08}px)`;

    // 4. Hero Elements Parallax Flow
    if (heroInner) {
      const heroFade = Math.max(0, 1 - scrollY / 650);
      heroInner.style.transform = `translateY(${scrollY * -0.18}px)`;
      heroInner.style.opacity = heroFade.toFixed(3);
    }

    if (heroImg) {
      heroImg.style.transition = 'none';
      heroImg.style.transform = `translateY(${scrollY * 0.14}px) scale(${Math.max(0.94, 1 - scrollY * 0.0001)})`;
    }
    if (heroGlow) {
      heroGlow.style.transform = `translate(-50%, -50%) scale(${1 + Math.min(scrollY * 0.0006, 0.4)})`;
      heroGlow.style.opacity = Math.max(0.2, 0.6 - scrollY * 0.0008).toFixed(2);
    }

    // 5. Page Hero Parallax (Inner pages)
    if (pageHeroInner) {
      const pageFade = Math.max(0, 1 - scrollY / 550);
      pageHeroInner.style.transform = `translateY(${scrollY * -0.16}px)`;
      pageHeroInner.style.opacity = pageFade.toFixed(3);
    }

    // 6. Interactive Process Step Activation
    if (processSteps.length > 0) {
      const focalLine = winHeight * 0.48;
      let closestStep = null;
      let minDistance = Infinity;

      processSteps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const dist = Math.abs(stepCenter - focalLine);
        if (rect.top < winHeight && rect.bottom > 0 && dist < minDistance) {
          minDistance = dist;
          closestStep = step;
        }
      });

      processSteps.forEach((step) => {
        step.classList.toggle('is-active-step', step === closestStep && minDistance < 240);
      });
    }

    // 7. Bento & Interactive Elements Micro-Parallax
    if (saasRing) {
      const r = saasRing.getBoundingClientRect();
      if (r.top < winHeight && r.bottom > 0) {
        saasRing.style.transform = `rotate(${scrollY * 0.18}deg)`;
      }
    }

    if (vmPhone) {
      const r = vmPhone.getBoundingClientRect();
      if (r.top < winHeight && r.bottom > 0) {
        const offset = (r.top - winHeight / 2) * -0.08;
        vmPhone.style.transform = `translateY(${offset}px)`;
      }
    }

    if (vbHero) {
      const r = vbHero.getBoundingClientRect();
      if (r.top < winHeight && r.bottom > 0) {
        const offset = (r.top - winHeight / 2) * -0.04;
        vbHero.style.transform = `translateY(${offset}px)`;
      }
    }

    // 8. Founder Card Spotlight & Monogram Glow
    if (founderCard && founderMonogram) {
      const r = founderCard.getBoundingClientRect();
      if (r.top < winHeight && r.bottom > 0) {
        const progress = (r.top - winHeight / 2) * -0.06;
        founderMonogram.style.transform = `translateY(${progress}px)`;
      }
    }
  };

  // Bind to Lenis or window scroll
  if (lenis) {
    lenis.on('scroll', onScrollUpdate);
  } else {
    window.addEventListener('scroll', onScrollUpdate, { passive: true });
  }
  onScrollUpdate();

  // -------------------------------------------------------------------------
  // 4. Staggered Entrance & Count-up Animation
  // -------------------------------------------------------------------------
  document.querySelectorAll('.reveal').forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i * 0.08, 0.4)}s`);
  });

  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const fmt = (v) => prefix + v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (reduced) { el.textContent = fmt(target); return; }
    const dur = 1800;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      el.querySelectorAll('[data-count]').forEach(countUp);
      if (el.dataset.count) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // -------------------------------------------------------------------------
  // 5. Cursor-Follow Dynamic Lighting on Glass Cards (Throttled & Reflow-Free)
  // -------------------------------------------------------------------------
  document.querySelectorAll('.card, .glass').forEach((card) => {
    let rect = null;
    let ticking = false;

    card.addEventListener('pointerenter', () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener('pointermove', (e) => {
      if (!ticking) {
        ticking = true;
        const clientX = e.clientX;
        const clientY = e.clientY;
        requestAnimationFrame(() => {
          if (rect) {
            card.style.setProperty('--mx', `${clientX - rect.left}px`);
            card.style.setProperty('--my', `${clientY - rect.top}px`);
          }
          ticking = false;
        });
      }
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      rect = null;
      ticking = false;
    }, { passive: true });
  });

  // -------------------------------------------------------------------------
  // 6. Services Page Subnav Scroll-Spy
  // -------------------------------------------------------------------------
  const subLinks = document.querySelectorAll('.subnav a');
  if (subLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        subLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.srv').forEach((s) => spy.observe(s));
  }

  // -------------------------------------------------------------------------
  // 7. Interactive Form Submission
  // -------------------------------------------------------------------------
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      ['input-name', 'input-email'].forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        const field = input.closest('.field');
        const valid = input.value.trim() && input.checkValidity();
        if (field) field.classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        if (status) {
          status.style.color = '#ff453a';
          status.textContent = 'Please provide your name and a valid email address.';
        }
        return;
      }
      const btn = document.getElementById('form-submit');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending inquiry…';
      }
      setTimeout(() => {
        if (btn) btn.textContent = 'Inquiry Sent ✓';
        if (status) {
          status.style.color = '#30d158';
          status.textContent = "Thank you! Pratyush Sharma will reply within 24 hours.";
        }
        form.reset();
        setTimeout(() => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Send inquiry';
          }
        }, 3500);
      }, 850);
    });
  }

  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // -------------------------------------------------------------------------
  // 8. Work & Case Studies Filter Engine
  // -------------------------------------------------------------------------
  const filters = document.querySelectorAll('.filter');
  const cases = document.querySelectorAll('.case');
  if (filters.length && cases.length) {
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.forEach((f) => f.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filterVal = btn.dataset.filter || 'all';

        cases.forEach((c) => {
          const category = c.dataset.category || '';
          if (filterVal === 'all' || category.includes(filterVal)) {
            c.classList.remove('is-hidden');
            c.classList.add('is-entering');
            setTimeout(() => c.classList.remove('is-entering'), 50);
          } else {
            c.classList.add('is-hidden');
          }
        });
      });
    });
  }

  // -------------------------------------------------------------------------
  // 9. Interactive Pricing Calculator Engine (With Monthly Maintenance Support)
  // -------------------------------------------------------------------------
  const calcForm = document.getElementById('pricing-calc');
  if (calcForm) {
    const priceDisplay = document.getElementById('calc-total-price');
    const timeDisplay = document.getElementById('calc-total-time');
    const ms1Display = document.getElementById('calc-ms1');
    const ms2Display = document.getElementById('calc-ms2');
    const ms3Display = document.getElementById('calc-ms3');
    const maintDisplay = document.getElementById('calc-maint-row');
    const maintVal = document.getElementById('calc-maint-val');

    const updateCalc = () => {
      let base = 5000;
      let timelineText = '2–3 days delivery';

      // Project Type
      const typeInput = calcForm.querySelector('input[name="calc_type"]:checked');
      const type = typeInput ? typeInput.value : 'website';

      if (type === 'website') {
        base = 5000;
        timelineText = '2–3 days delivery';
      } else if (type === 'webapp') {
        base = 35000;
        timelineText = '3–5 weeks delivery';
      } else if (type === 'saas') {
        base = 50000;
        timelineText = '5–7 weeks delivery';
      } else if (type === 'mobile') {
        base = 45000;
        timelineText = '4–6 weeks delivery';
      } else if (type === 'api') {
        base = 20000;
        timelineText = '2–4 weeks delivery';
      } else if (type === 'maintenance_only') {
        base = 0;
        timelineText = 'Continuous monthly retainer';
      }

      // Add-ons
      calcForm.querySelectorAll('input[name="calc_addon"]:checked').forEach((addon) => {
        base += parseInt(addon.value, 10) || 0;
      });

      // Monthly Maintenance Selection (₹2,000 - ₹6,000 / mo)
      const maintInput = calcForm.querySelector('input[name="calc_maint"]:checked');
      const maintMonthly = maintInput ? parseInt(maintInput.value, 10) : 0;

      // Format currency in INR
      if (priceDisplay) {
        if (type === 'maintenance_only') {
          const mFee = maintMonthly > 0 ? maintMonthly : 2000;
          priceDisplay.textContent = '₹' + mFee.toLocaleString('en-IN') + '/mo';
        } else {
          priceDisplay.textContent = '₹' + base.toLocaleString('en-IN');
        }
      }

      if (timeDisplay) {
        timeDisplay.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${timelineText}`;
      }

      // Monthly Care Indicator
      if (maintDisplay && maintVal) {
        if (maintMonthly > 0 && type !== 'maintenance_only') {
          maintDisplay.style.display = 'flex';
          maintVal.textContent = '+ ₹' + maintMonthly.toLocaleString('en-IN') + '/mo';
        } else {
          maintDisplay.style.display = 'none';
        }
      }

      // Milestones: 30% on Prototype approval, 40% on Feature-complete staging, 30% on Final Launch & IP Transfer
      const msSection = document.querySelector('.calc-milestones');
      if (type === 'maintenance_only') {
        if (msSection) msSection.style.display = 'none';
      } else {
        if (msSection) msSection.style.display = 'flex';
        const ms1 = Math.round(base * 0.3);
        const ms2 = Math.round(base * 0.4);
        const ms3 = base - ms1 - ms2;

        if (ms1Display) ms1Display.textContent = '₹' + ms1.toLocaleString('en-IN');
        if (ms2Display) ms2Display.textContent = '₹' + ms2.toLocaleString('en-IN');
        if (ms3Display) ms3Display.textContent = '₹' + ms3.toLocaleString('en-IN');
      }
    };

    calcForm.addEventListener('change', updateCalc);
    updateCalc();
  }
})();
