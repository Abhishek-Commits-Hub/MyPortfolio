/**
 * Abhishek Kumar Dutta — Portfolio Architecture & Creative Interaction Engine
 * Creative Features:
 * - 150-frame smooth video canvas sequence with LERP interpolation
 * - High-DPI Retina canvas scaling with cover aspect-ratio
 * - Interactive 3D Perspective Tilt with Specular Glare
 * - Ambient Cursor Glow Spotlight Tracker
 * - Magnetic Buttons & Micro-interactions
 * - Scroll-triggered Cascading Reveal Animations
 * - Interactive UI Micro-Actions (Cart updates, filter toggles)
 * - Scroll spy for active navigation state
 * - Mobile drawer navigation
 * - One-click clipboard email copy with feedback
 * - Dynamic year calculation
 * - Prefers-reduced-motion compatibility
 */

(() => {
  'use strict';

  /* Constants */
  const TOTAL_FRAMES = 150;
  const LERP_FACTOR = 0.09;
  const EMAIL_ADDRESS = 'abhishekdutta.contact@gmail.com';

  /* DOM Elements */
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const heroTrack = document.getElementById('hero-track');
  const headlineBlock = document.querySelector('.hero-headline-block');
  const frameProgressLabel = document.getElementById('frame-progress-label');
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');
  const copyToast = document.getElementById('copy-toast');
  const yearHolder = document.getElementById('year-holder');
  const cursorGlow = document.getElementById('cursor-glow');

  /* Animation State */
  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let targetProgress = 0;
  let currentProgress = 0;
  let lastRenderedFrame = -1;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cursor Glow Coordinates */
  let mouseX = -1000;
  let mouseY = -1000;
  let glowX = -1000;
  let glowY = -1000;

  /* Generate Frame Path: frames/ezgif-frame-001.jpg -> ezgif-frame-150.jpg */
  function getFrameSrc(index) {
    const padded = String(index + 1).padStart(3, '0');
    return `frames/ezgif-frame-${padded}.jpg`;
  }

  /* Adjust Canvas Resolution for High-DPI Displays */
  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    lastRenderedFrame = -1;
  }

  /* Render Frame with Cover Scaling and Centering */
  function renderFrame(index) {
    if (!ctx) return;
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);

    const drawWidth = img.width * ratio;
    const drawHeight = img.height * ratio;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    ctx.drawImage(img, 0, 0, img.width, img.height, offsetX, offsetY, drawWidth, drawHeight);
    lastRenderedFrame = index;

    if (frameProgressLabel) {
      frameProgressLabel.textContent = `FRAME ${String(index + 1).padStart(3, '0')}`;
    }
  }

  /* Compute Scroll Progress Relative to Hero Track */
  function updateScrollTarget() {
    if (!heroTrack) return;
    const trackRect = heroTrack.getBoundingClientRect();
    const scrollDistance = heroTrack.offsetHeight - window.innerHeight;

    if (scrollDistance <= 0) {
      targetProgress = 0;
      return;
    }

    const scrollYInTrack = -trackRect.top;
    targetProgress = Math.max(0, Math.min(1, scrollYInTrack / scrollDistance));

    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  /* Main Animation Loop with LERP */
  function loop() {
    if (prefersReducedMotion) {
      currentProgress = targetProgress;
    } else {
      currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;
    }

    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))
    );

    if (frameIndex !== lastRenderedFrame) {
      renderFrame(frameIndex);
    }

    /* Hero Parallax */
    if (headlineBlock && window.innerWidth > 768) {
      const opacity = Math.max(0.12, 1 - currentProgress * 0.88);
      const translateY = -(currentProgress * 44);
      headlineBlock.style.opacity = opacity.toFixed(3);
      headlineBlock.style.transform = `translateY(${translateY.toFixed(1)}px)`;
    }

    /* Ambient Cursor Glow Smooth Interpolation */
    if (cursorGlow && window.innerWidth > 768) {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }

    requestAnimationFrame(loop);
  }

  /* Preload Frames with Asynchronous Decoding */
  async function preloadFrames() {
    resizeCanvas();

    const loadPromises = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      images[i] = img;

      const promise = new Promise((resolve) => {
        img.onload = async () => {
          if ('decode' in img) {
            try {
              await img.decode();
            } catch (e) {
              /* Fallback ignore */
            }
          }
          loadedCount++;

          const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          if (loaderBar) loaderBar.style.width = `${percent}%`;
          if (loaderText) loaderText.textContent = `${percent}%`;

          if (i === 0 && lastRenderedFrame === -1) {
            renderFrame(0);
          }
          resolve();
        };

        img.onerror = () => {
          loadedCount++;
          resolve();
        };
      });

      loadPromises.push(promise);
    }

    await Promise.all(loadPromises);

    if (loader) {
      setTimeout(() => {
        loader.classList.add('loaded');
      }, 200);
    }

    updateScrollTarget();
    currentProgress = targetProgress;
    renderFrame(Math.round(currentProgress * (TOTAL_FRAMES - 1)));
  }

  /* 3D Perspective Tilt Effect for Interactive Cards */
  function setupTiltEffects() {
    if (prefersReducedMotion || window.innerWidth <= 768) return;

    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        const rotateX = (deltaY * -6).toFixed(2);
        const rotateY = (deltaX * 6).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /* Magnetic Buttons & Interactive Elements */
  function setupMagneticButtons() {
    if (prefersReducedMotion || window.innerWidth <= 768) return;

    const magneticElements = document.querySelectorAll('[data-magnetic]');

    magneticElements.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  /* Ambient Cursor Glow Spotlight Tracking */
  function setupCursorGlow() {
    if (window.innerWidth <= 768) return;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorGlow) cursorGlow.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      if (cursorGlow) cursorGlow.style.opacity = '0';
    });
  }

  /* Scroll Reveal via IntersectionObserver */
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* Interactive Mock Storefront Controls */
  function setupMockStoreInteractions() {
    const addCartBtns = document.querySelectorAll('.add-cart-action');
    const cartCounter = document.getElementById('mock-cart-counter');
    const cartBadge = document.getElementById('mock-cart-badge');
    let cartTotalItems = 3;
    let cartTotalCost = 349;

    addCartBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        cartTotalItems++;
        cartTotalCost += 120;

        if (cartCounter) {
          cartCounter.textContent = `CART (${String(cartTotalItems).padStart(2, '0')})`;
        }
        if (cartBadge) {
          cartBadge.textContent = `CART · $${cartTotalCost}`;
          cartBadge.style.backgroundColor = 'var(--accent-orange)';
          setTimeout(() => {
            cartBadge.style.backgroundColor = 'var(--accent-teal)';
          }, 600);
        }

        const originalText = btn.textContent;
        btn.textContent = '✓ ADDED';
        btn.style.color = '#34d399';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
        }, 1500);
      });
    });

    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  }

  /* Active Navigation Spy */
  function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /* Mobile Drawer Menu */
  function setupMobileMenu() {
    if (!mobileToggle || !mobileDrawer) return;

    function toggleMenu() {
      const isOpen = mobileToggle.classList.toggle('open');
      mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileDrawer.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    mobileToggle.addEventListener('click', toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('open')) {
          toggleMenu();
        }
      });
    });
  }

  /* One-Click Clipboard Email Copy */
  function setupEmailCopy() {
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(EMAIL_ADDRESS);
        if (copyText) copyText.textContent = 'COPIED!';
        if (copyToast) copyToast.classList.add('visible');

        setTimeout(() => {
          if (copyText) copyText.textContent = 'COPY EMAIL';
          if (copyToast) copyToast.classList.remove('visible');
        }, 2400);
      } catch (err) {
        window.prompt('Copy email address:', EMAIL_ADDRESS);
      }
    });
  }

  /* Dynamic Year */
  function setupDynamicYear() {
    if (yearHolder) {
      yearHolder.textContent = new Date().getFullYear();
    }
  }

  /* Window Event Listeners */
  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
    renderFrame(Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(currentProgress * (TOTAL_FRAMES - 1)))));
  });

  /* App Initialization */
  function init() {
    setupDynamicYear();
    setupMobileMenu();
    setupScrollSpy();
    setupScrollReveal();
    setupEmailCopy();
    setupTiltEffects();
    setupMagneticButtons();
    setupCursorGlow();
    setupMockStoreInteractions();
    preloadFrames();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
