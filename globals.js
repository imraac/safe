/**
 * WASH & GO — globals.js
 * Shared JavaScript utilities, components, and behaviours
 * Modern ES2020+ standards, no frameworks required
 */

'use strict';

/* ─── Constants ─────────────────────────────────────────────── */
const WHATSAPP_NUMBER = '+254700000000'; // Update with real number
const BUSINESS_EMAIL  = 'hello@washandgo.co.ke';
const BUSINESS_PHONE  = '+254 700 000 000';

/* ─── DOM Utilities ─────────────────────────────────────────── */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * Wait for DOM to be ready
 * @param {Function} fn
 */
const onReady = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
};

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} wait
 */
const debounce = (fn, wait = 200) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

/**
 * Throttle function
 * @param {Function} fn
 * @param {number} limit
 */
const throttle = (fn, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

/* ─── Page Loader ───────────────────────────────────────────── */
const PageLoader = {
  el: null,

  init() {
    this.el = $('.page-loader');
    if (!this.el) return;
    window.addEventListener('load', () => {
      setTimeout(() => this.hide(), 300);
    });
  },

  hide() {
    this.el?.classList.add('is-hidden');
    setTimeout(() => this.el?.remove(), 600);
  }
};

/* ─── Navigation ────────────────────────────────────────────── */
const Nav = {
  nav: null,
  toggle: null,
  mobileMenu: null,
  lastScrollY: 0,

  init() {
    this.nav = $('.nav');
    this.toggle = $('.nav__toggle');
    this.mobileMenu = $('.nav__mobile-menu');
    if (!this.nav) return;

    this.setActiveLink();
    this.setupScrollBehavior();
    this.setupMobileMenu();
    this.setupKeyboard();
  },

  setActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav__link, .nav__mobile-link').forEach(link => {
      const href = link.getAttribute('href')?.split('/').pop();
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  },

  setupScrollBehavior() {
    const onScroll = throttle(() => {
      const scrollY = window.scrollY;
      if (scrollY > 80) {
        this.nav.classList.add('is-scrolled');
      } else {
        this.nav.classList.remove('is-scrolled');
      }
      this.lastScrollY = scrollY;
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run immediately
  },

  setupMobileMenu() {
    if (!this.toggle || !this.mobileMenu) return;

    this.toggle.addEventListener('click', () => this.toggleMobileMenu());

    // Close on link click
    $$('.nav__mobile-link', this.mobileMenu).forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });

    // Close on backdrop click
    this.mobileMenu.addEventListener('click', (e) => {
      if (e.target === this.mobileMenu) this.closeMobileMenu();
    });
  },

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMobileMenu();
    });
  },

  toggleMobileMenu() {
    const isOpen = this.mobileMenu.classList.toggle('is-open');
    this.toggle.classList.toggle('is-open', isOpen);
    this.toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },

  closeMobileMenu() {
    this.mobileMenu?.classList.remove('is-open');
    this.toggle?.classList.remove('is-open');
    this.toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
};

/* ─── Scroll Reveal ─────────────────────────────────────────── */
const ScrollReveal = {
  observer: null,

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements
      $$('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.reveal').forEach(el => this.observer.observe(el));
  },

  /**
   * Observe newly added elements
   * @param {Element} container
   */
  observeNew(container) {
    $$('.reveal', container).forEach(el => this.observer?.observe(el));
  }
};

/* ─── Accordion / FAQ ───────────────────────────────────────── */
const Accordion = {
  init() {
    $$('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => this.toggle(trigger));
    });
  },

  toggle(trigger) {
    const item = trigger.closest('.accordion-item');
    const isOpen = item.classList.contains('is-open');

    // Close all siblings (optional: comment out for multi-open)
    const siblings = $$('.accordion-item', item.closest('.accordion'));
    siblings.forEach(sib => {
      if (sib !== item) {
        sib.classList.remove('is-open');
        sib.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
      }
    });

    item.classList.toggle('is-open', !isOpen);
    trigger.setAttribute('aria-expanded', !isOpen);
  }
};

/* ─── Toast Notifications ───────────────────────────────────── */
const Toast = {
  container: null,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(this.container);
  },

  /**
   * Show a toast message
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration ms
   */
  show(message, type = 'info', duration = 5000) {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span style="font-size:1.2rem;flex-shrink:0;color:${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : 'var(--clr-primary-light)'}">${icons[type]}</span>
      <span style="font-size:var(--fs-sm);color:var(--clr-text);flex:1">${message}</span>
      <button onclick="this.closest('.toast').remove()" style="color:var(--clr-text-faint);font-size:1rem;cursor:pointer;background:none;border:none;padding:0;line-height:1" aria-label="Close">✕</button>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);

    return toast;
  },

  success: (msg, dur) => Toast.show(msg, 'success', dur),
  error:   (msg, dur) => Toast.show(msg, 'error', dur),
  info:    (msg, dur) => Toast.show(msg, 'info', dur),
};

/* ─── Form Validation ───────────────────────────────────────── */
const FormValidator = {
  rules: {
    required: (v) => v.trim().length > 0 || 'This field is required',
    email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address',
    phone:    (v) => /^[\d\s\+\-\(\)]{7,}$/.test(v.trim()) || 'Enter a valid phone number',
    minLen:   (n) => (v) => v.trim().length >= n || `Must be at least ${n} characters`,
  },

  /**
   * Validate a single field
   * @param {HTMLElement} field
   * @param {string[]} ruleNames
   * @returns {{ valid: boolean, message: string }}
   */
  validateField(field, ruleNames = ['required']) {
    const value = field.value;
    for (const name of ruleNames) {
      const rule = typeof name === 'function' ? name : this.rules[name];
      if (!rule) continue;
      const result = rule(value);
      if (result !== true) {
        return { valid: false, message: result };
      }
    }
    return { valid: true, message: '' };
  },

  /**
   * Show field error
   */
  showError(field, message) {
    field.style.borderColor = 'var(--clr-error)';
    field.style.boxShadow = '0 0 0 4px rgba(239,68,68,0.15)';

    const errorId = `error-${field.id || Math.random().toString(36).slice(2)}`;
    field.setAttribute('aria-describedby', errorId);

    let errorEl = field.parentNode.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'form-error';
      field.parentNode.appendChild(errorEl);
    }
    errorEl.id = errorId;
    errorEl.textContent = message;
    errorEl.setAttribute('role', 'alert');
  },

  /**
   * Clear field error
   */
  clearError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    field.removeAttribute('aria-describedby');
    field.parentNode.querySelector('.form-error')?.remove();
  },

  /**
   * Validate entire form
   * @param {HTMLFormElement} form
   * @returns {boolean}
   */
  validateForm(form) {
    let isValid = true;
    const fields = $$('[data-validate]', form);

    fields.forEach(field => {
      const rules = field.dataset.validate.split(',').map(r => r.trim());
      const { valid, message } = this.validateField(field, rules);
      if (!valid) {
        this.showError(field, message);
        isValid = false;
      } else {
        this.clearError(field);
      }
    });

    if (!isValid) {
      const firstError = form.querySelector('[data-validate]');
      firstError?.focus();
    }

    return isValid;
  },

  /**
   * Setup live validation on a form
   * @param {HTMLFormElement} form
   */
  setupLiveValidation(form) {
    $$('[data-validate]', form).forEach(field => {
      field.addEventListener('blur', () => {
        const rules = field.dataset.validate.split(',').map(r => r.trim());
        const { valid, message } = this.validateField(field, rules);
        if (!valid) {
          this.showError(field, message);
        } else {
          this.clearError(field);
        }
      });

      field.addEventListener('input', () => {
        if (field.parentNode.querySelector('.form-error')) {
          this.clearError(field);
        }
      });
    });
  }
};

/* ─── Booking Form ──────────────────────────────────────────── */
const BookingForm = {
  init() {
    const forms = $$('.booking-form');
    forms.forEach(form => {
      FormValidator.setupLiveValidation(form);
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    });
  },

  async handleSubmit(e, form) {
    e.preventDefault();
    if (!FormValidator.validateForm(form)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Collect form data
    const data = Object.fromEntries(new FormData(form));

    try {
      // Simulate API call — replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Success
      Toast.success('Booking request sent! We\'ll contact you within 1 hour.', 7000);

      // Optionally redirect
      if (form.dataset.redirect) {
        setTimeout(() => {
          window.location.href = form.dataset.redirect;
        }, 1500);
      }

      form.reset();
    } catch (err) {
      Toast.error('Something went wrong. Please try again or call us directly.');
      console.error('Booking form error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
};

/* ─── WhatsApp Helper ───────────────────────────────────────── */
const WhatsApp = {
  buildLink(message = '', number = WHATSAPP_NUMBER) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${number.replace(/\D/g, '')}${encoded ? `?text=${encoded}` : ''}`;
  },

  openChat(message = '') {
    window.open(this.buildLink(message), '_blank', 'noopener,noreferrer');
  },

  init() {
    $$('[data-whatsapp]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = el.dataset.whatsapp || '';
        this.openChat(msg);
      });
    });
  }
};

/* ─── Smooth Scroll ─────────────────────────────────────────── */
const SmoothScroll = {
  init() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = $(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height'), 10) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }
};

/* ─── Tabs ──────────────────────────────────────────────────── */
const Tabs = {
  init() {
    $$('.tabs').forEach(tabGroup => {
      const triggers = $$('[data-tab]', tabGroup);
      const panels = $$('[data-tab-panel]', tabGroup);

      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const target = trigger.dataset.tab;

          triggers.forEach(t => {
            t.classList.toggle('is-active', t === trigger);
            t.setAttribute('aria-selected', t === trigger);
          });

          panels.forEach(panel => {
            const isActive = panel.dataset.tabPanel === target;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
          });
        });
      });

      // Init first tab
      triggers[0]?.click();
    });
  }
};

/* ─── Counter Animation ─────────────────────────────────────── */
const CountUp = {
  init() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(el => observer.observe(el));
  },

  animate(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = parseInt(el.dataset.duration || 2000, 10);
    const decimals = (target.toString().split('.')[1] || '').length;

    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = (target * eased).toFixed(decimals);
      el.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
};

/* ─── Service Category Filter ───────────────────────────────── */
const ServiceFilter = {
  init() {
    const filterGroup = $('.service-filters');
    if (!filterGroup) return;

    $$('[data-filter]', filterGroup).forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-filter]', filterGroup).forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;
        $$('[data-category]').forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.style.display = match ? '' : 'none';
          card.style.opacity = match ? '1' : '0';
        });
      });
    });
  }
};

/* ─── Date Input — Set minimum to today ─────────────────────── */
const DateInputs = {
  init() {
    $$('input[type="date"]').forEach(input => {
      const today = new Date().toISOString().split('T')[0];
      input.setAttribute('min', today);
      if (!input.value) input.value = '';
    });
  }
};

/* ─── Cookie Banner ─────────────────────────────────────────── */
const CookieBanner = {
  key: 'wg_cookie_consent',

  init() {
    if (localStorage.getItem(this.key)) return;
    this.render();
  },

  render() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div style="position:fixed;bottom:var(--space-5);left:50%;transform:translateX(-50%);z-index:var(--z-modal);
        background:var(--clr-surface-2);border:1px solid var(--clr-border);border-radius:var(--radius-md);
        padding:var(--space-5) var(--space-6);max-width:min(600px, calc(100% - var(--space-8)));width:100%;
        display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4);box-shadow:var(--shadow-lg);
        animation:toast-in .5s var(--ease-out) forwards">
        <p style="font-size:var(--fs-sm);color:var(--clr-text-muted);flex:1;min-width:200px">
          🍪 We use cookies to improve your experience. 
          <a href="privacy.html" style="color:var(--clr-primary-light);text-decoration:underline">Learn more</a>
        </p>
        <div style="display:flex;gap:var(--space-3);flex-shrink:0">
          <button class="btn btn--ghost btn--sm" id="cookie-decline">Decline</button>
          <button class="btn btn--primary btn--sm" id="cookie-accept">Accept</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    $('#cookie-accept').addEventListener('click', () => {
      localStorage.setItem(this.key, 'accepted');
      banner.remove();
    });

    $('#cookie-decline').addEventListener('click', () => {
      localStorage.setItem(this.key, 'declined');
      banner.remove();
    });
  }
};

/* ─── Image Lazy Loading ────────────────────────────────────── */
const LazyImages = {
  init() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.add('is-loaded');
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px' }
    );

    $$('img[data-src]').forEach(img => observer.observe(img));
  }
};

/* ─── Booking Summary Preview ───────────────────────────────── */
const BookingSummary = {
  init() {
    const form = $('.booking-form');
    const summary = $('.booking-summary');
    if (!form || !summary) return;

    const update = debounce(() => {
      const service = $('[name="service"]', form)?.value;
      const date = $('[name="date"]', form)?.value;
      const time = $('[name="time"]', form)?.value;
      const vehicleType = $('[name="vehicle_type"]', form)?.value;

      const serviceEl = $('#summary-service', summary);
      const dateEl = $('#summary-date', summary);
      const timeEl = $('#summary-time', summary);
      const vehicleEl = $('#summary-vehicle', summary);

      if (serviceEl && service) serviceEl.textContent = service.replace(/-/g, ' ');
      if (dateEl && date) {
        dateEl.textContent = new Date(date + 'T00:00').toLocaleDateString('en-KE', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
      }
      if (timeEl && time) timeEl.textContent = time;
      if (vehicleEl && vehicleType) vehicleEl.textContent = vehicleType;
    }, 300);

    $$('input, select', form).forEach(el => el.addEventListener('input', update));
  }
};

/* ─── Testimonial Slider ────────────────────────────────────── */
const Slider = {
  init() {
    $$('.slider').forEach(slider => this.initSlider(slider));
  },

  initSlider(slider) {
    const track = $('.slider__track', slider);
    const slides = $$('.slider__slide', slider);
    const prevBtn = $('.slider__prev', slider);
    const nextBtn = $('.slider__next', slider);
    const dotsContainer = $('.slider__dots', slider);

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;

    // Create dots
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = $$('.slider__dot', slider);

    const goTo = (index) => {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
      slides.forEach((s, i) => {
        s.setAttribute('aria-hidden', i !== current);
        s.inert = i !== current;
      });
    };

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // Auto-play
    const interval = parseInt(slider.dataset.interval || 0, 10);
    if (interval > 0) {
      let autoplay = setInterval(() => goTo(current + 1), interval);
      slider.addEventListener('mouseenter', () => clearInterval(autoplay));
      slider.addEventListener('mouseleave', () => {
        autoplay = setInterval(() => goTo(current + 1), interval);
      });
    }

    // Touch/swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
    });

    // Keyboard
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });

    goTo(0);
  }
};

/* ─── Pricing Toggle (monthly/one-time) ─────────────────────── */
const PricingToggle = {
  init() {
    const toggle = $('#pricing-toggle');
    if (!toggle) return;

    toggle.addEventListener('change', () => {
      const isMonthly = toggle.checked;
      $$('[data-price-monthly]').forEach(el => {
        el.textContent = isMonthly
          ? el.dataset.priceMonthly
          : el.dataset.priceOnce;
      });
      $$('[data-period]').forEach(el => {
        el.textContent = isMonthly ? '/month' : 'one-time';
      });
    });
  }
};

/* ─── Scroll-to-top ──────────────────────────────────────────── */
const ScrollTop = {
  init() {
    const btn = $('#scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', throttle(() => {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    }, 200), { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

/* ─── Parallax ───────────────────────────────────────────────── */
const Parallax = {
  init() {
    const elements = $$('[data-parallax]');
    if (!elements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onScroll = throttle(() => {
      const scrollY = window.scrollY;
      elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax || 0.3);
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * speed}px)`;
      });
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
  }
};

/* ─── Clipboard Copy ─────────────────────────────────────────── */
const Clipboard = {
  init() {
    $$('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = original; }, 2000);
        } catch {
          Toast.error('Could not copy to clipboard');
        }
      });
    });
  }
};

/* ─── Analytics Helpers ─────────────────────────────────────── */
const Analytics = {
  /**
   * Track an event (works with GA4, Plausible, etc.)
   * @param {string} event
   * @param {object} params
   */
  track(event, params = {}) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
      gtag('event', event, params);
    }
    // Plausible
    if (typeof plausible === 'function') {
      plausible(event, { props: params });
    }
    // Debug
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Analytics]', event, params);
    }
  }
};

/* ─── Format Utilities ───────────────────────────────────────── */
const Format = {
  currency(amount, currency = 'KES') {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount);
  },

  phone(number) {
    return number.replace(/(\+254|0)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  },

  date(dateStr, options = {}) {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      ...options
    });
  }
};

/* ─── Main Initializer ───────────────────────────────────────── */
onReady(() => {
  PageLoader.init();
  Nav.init();
  ScrollReveal.init();
  Accordion.init();
  Toast.init();
  BookingForm.init();
  WhatsApp.init();
  SmoothScroll.init();
  Tabs.init();
  CountUp.init();
  ServiceFilter.init();
  DateInputs.init();
  LazyImages.init();
  BookingSummary.init();
  Slider.init();
  PricingToggle.init();
  ScrollTop.init();
  Parallax.init();
  Clipboard.init();
  CookieBanner.init();
});

/* ─── Exports (for module environments) ─────────────────────── */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    $, $$, onReady, debounce, throttle,
    Nav, ScrollReveal, Accordion, Toast, FormValidator,
    BookingForm, WhatsApp, SmoothScroll, Tabs, CountUp,
    ServiceFilter, Slider, Analytics, Format,
    WHATSAPP_NUMBER, BUSINESS_EMAIL, BUSINESS_PHONE
  };
}

//# select vehicle type script 

(function () {

  function initVehicleScripts() {

    const vehicleKeys = ["sedan", "suv", "pickup", "van"];
    let currentIndex = 0;

    const vehicles = {
      sedan: { image: "public/Assets/sedan.png", title: "Sedan Detailing", price: "KES 5,500" },
      suv: { image: "public/Assets/suv.png", title: "SUV Detailing", price: "KES 10,500" },
      pickup: { image: "public/Assets/pickup.png", title: "Pickup Detailing", price: "KES 12,000" },
      van: { image: "public/Assets/van.png", title: "Mini Van Detailing", price: "KES 14,000" }
    };

    const img = document.getElementById("carImage");
    const modal = document.getElementById("packageModal");
    const content = document.getElementById("modalContent");

   
    if (!img || !modal || !content) return;

    vehicleKeys.forEach(key => {
      const preloaded = new Image();
      preloaded.src = vehicles[key].image;
    });

    function updateImage(type) {
      img.classList.add("fade");

      setTimeout(() => {
        img.src = vehicles[type].image;
        img.classList.remove("fade");
      }, 200);
    }

    function selectVehicle(type, buttonElement = null) {
      currentIndex = vehicleKeys.indexOf(type);
      updateImage(type);

      document.querySelectorAll(".vehicle-types button")
        .forEach(btn => btn.classList.remove("active"));

      if (buttonElement) buttonElement.classList.add("active");
    }

    function nextCar() {
      currentIndex = (currentIndex + 1) % vehicleKeys.length;
      selectVehicle(vehicleKeys[currentIndex]);
    }

    function prevCar() {
      currentIndex = (currentIndex - 1 + vehicleKeys.length) % vehicleKeys.length;
      selectVehicle(vehicleKeys[currentIndex]);
    }

    document.querySelectorAll(".vehicle-types button")
      .forEach(btn => {
        btn.addEventListener("click", function () {
          const type = this.dataset.vehicle;
          selectVehicle(type, this);
        });
      });

    const nextBtn = document.getElementById("nextCarBtn");
    const prevBtn = document.getElementById("prevCarBtn");
    const bookBtn = document.getElementById("bookNowBtn");

    if (nextBtn) nextBtn.addEventListener("click", nextCar);
    if (prevBtn) prevBtn.addEventListener("click", prevCar);
    if (bookBtn) bookBtn.addEventListener("click", openModal);


    selectVehicle(vehicleKeys[currentIndex]);
  }

  if (document.readyState !== "loading") {
    initVehicleScripts();
  } else {
    document.addEventListener("DOMContentLoaded", initVehicleScripts);
  }

})();