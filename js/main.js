/* ═══════════════════════════════════════════════════════
   Mohammed Essam — Multi-Page Portfolio Website
   Main JavaScript
═══════════════════════════════════════════════════════ */

'use strict';

// ─── Hero Canvas: Animated Abstract Shapes ───────────────
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animId;
  let shapes = [];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  const COLORS = ['#FFE600', '#FF5C00', '#FF2D78', '#00E5FF', '#00FF88', '#7C3AED'];

  function randomBetween(a, b) {
    return Math.random() * (b - a) + a;
  }

  function createShape() {
    return {
      x:        randomBetween(0, canvas.width),
      y:        randomBetween(0, canvas.height),
      vx:       randomBetween(-0.4, 0.4),
      vy:       randomBetween(-0.4, 0.4),
      size:     randomBetween(20, 80),
      rotation: randomBetween(0, Math.PI * 2),
      rotSpeed: randomBetween(-0.008, 0.008),
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      type:     Math.random() > 0.5 ? 'rect' : 'circle',
      alpha:    randomBetween(0.04, 0.14),
    };
  }

  function initShapes() {
    shapes = [];
    const count = Math.min(22, Math.floor((canvas.width * canvas.height) / 30000));
    for (let i = 0; i < count; i++) {
      shapes.push(createShape());
    }
  }

  function drawShape(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.globalAlpha = s.alpha;
    ctx.strokeStyle = s.color;
    ctx.fillStyle   = s.color;
    ctx.lineWidth   = 2;

    if (s.type === 'rect') {
      ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
      if (Math.random() < 0.01) {
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.globalAlpha = s.alpha * 0.2;
      }
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function updateShape(s) {
    s.x += s.vx;
    s.y += s.vy;
    s.rotation += s.rotSpeed;

    const padding = s.size;
    if (s.x < -padding) s.x = canvas.width  + padding;
    if (s.x > canvas.width  + padding) s.x = -padding;
    if (s.y < -padding) s.y = canvas.height + padding;
    if (s.y > canvas.height + padding) s.y = -padding;
  }

  let mouse = { x: -1000, y: -1000 };
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  function applyMouseRepel(s) {
    const dx   = s.x - mouse.x;
    const dy   = s.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120 && dist > 0) {
      const force = (120 - dist) / 120 * 0.8;
      s.vx += (dx / dist) * force;
      s.vy += (dy / dist) * force;
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (speed > 2) {
        s.vx = (s.vx / speed) * 2;
        s.vy = (s.vy / speed) * 2;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(s => {
      applyMouseRepel(s);
      updateShape(s);
      drawShape(s);
    });
    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    initShapes();
  });

  resize();
  initShapes();
  draw();
})();


// ─── Navbar: Scroll Effect + Active Link (Multi-Page) ─────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function highlightActiveRoute() {
    const path = window.location.pathname.toLowerCase();
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    function isMatch(href) {
      if (!href) return false;
      const cleanHref = href.split('?')[0].split('#')[0].toLowerCase();
      const linkPage = cleanHref.substring(cleanHref.lastIndexOf('/') + 1) || 'index.html';
      
      if (currentPage === '' || currentPage === 'index.html') {
        return linkPage === '' || linkPage === 'index.html';
      }
      return linkPage.startsWith(currentPage.replace('.html', '')) || currentPage.startsWith(linkPage.replace('.html', ''));
    }

    navLinks.forEach(link => {
      if (isMatch(link.getAttribute('href'))) {
        link.classList.add('active');
      }
    });

    mobileNavLinks.forEach(link => {
      if (isMatch(link.getAttribute('href'))) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
  highlightActiveRoute();
})();


// ─── Mobile Menu Toggle ───────────────────────────────────
(function initMobileMenu() {
  const btn         = document.getElementById('menu-btn');
  const menu        = document.getElementById('mobile-menu');
  const icon        = document.getElementById('menu-icon');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!btn || !menu) return;

  function toggleMenu(force) {
    const isOpen = force !== undefined ? force : !menu.classList.contains('open');
    if (isOpen) {
      menu.classList.remove('hidden');
      requestAnimationFrame(() => menu.classList.add('open'));
    } else {
      menu.classList.remove('open');
      menu.addEventListener('transitionend', () => {
        if (!menu.classList.contains('open')) menu.classList.add('hidden');
      }, { once: true });
    }
    if (icon) {
      icon.className = isOpen ? 'fas fa-times text-xl' : 'fas fa-bars text-xl';
    }
  }

  btn.addEventListener('click', () => toggleMenu());

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      if (menu.classList.contains('open')) toggleMenu(false);
    }
  });
})();


// ─── Scroll Reveal Animations ─────────────────────────────
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseFloat(el.style.animationDelay) || 0;
        setTimeout(() => {
          el.classList.add('visible');
        }, delay * 1000);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  revealEls.forEach(el => observer.observe(el));
})();


// ─── Counter Animation for Stats ─────────────────────────
(function initCounters() {
  const statItems = document.querySelectorAll('.stat-item');
  if (!statItems.length) return;

  function animateValue(el, start, end, duration) {
    let startTime = null;
    const suffix  = el.textContent.replace(/[0-9]/g, '').trim();

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * (end - start) + start) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numEl  = entry.target.querySelector('span:first-child') || entry.target;
        if (!numEl) return;

        const text   = numEl.textContent.trim();
        const num    = parseInt(text.replace(/\D/g, ''), 10);

        if (!isNaN(num)) {
          animateValue(numEl, 0, num, 1200);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statItems.forEach(el => observer.observe(el));
})();


// ─── Category Filtering for Work / Portfolio Page ─────────
(function initWorkFilters() {
  const filterBtns = document.querySelectorAll('.work-filter-btn');
  const grid       = document.getElementById('work-grid');
  if (!grid || !filterBtns.length) return;

  const cards = grid.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active', 'bg-brutal-yellow', 'text-brutal-dark', 'shadow-brutal');
        b.classList.add('bg-brutal-gray', 'text-brutal-light/70', 'border-brutal-light/10');
      });

      btn.classList.remove('bg-brutal-gray', 'text-brutal-light/70', 'border-brutal-light/10');
      btn.classList.add('active', 'bg-brutal-yellow', 'text-brutal-dark', 'shadow-brutal');

      const filterValue = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const categories = (card.getAttribute('data-categories') || '').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      if (grid.updateCarouselDots) {
        grid.updateCarouselDots();
      }
    });
  });
})();


// ─── Contact Form & Pre-selection Helper ──────────────────
(function initContactHelper() {
  const serviceSelect = document.getElementById('service-select');
  const contactForm    = document.getElementById('contact-form');
  const formStatus     = document.getElementById('form-status');

  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get('service');
  if (serviceSelect && requestedService) {
    const options = Array.from(serviceSelect.options);
    const match = options.find(opt => opt.value.toLowerCase().includes(requestedService.toLowerCase()));
    if (match) {
      serviceSelect.value = match.value;
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = (document.getElementById('name-input')?.value || '').trim();
      const email = (document.getElementById('email-input')?.value || '').trim();
      const company = (document.getElementById('company-input')?.value || '').trim();
      const service = serviceSelect?.value || 'Project Inquiry';
      const budget = document.getElementById('budget-select')?.value || 'Not specified';
      const message = (document.getElementById('message-input')?.value || '').trim();

      const companyInfo = company ? ` [Company/Brand: ${company}]` : '';
      const textMessage = `Hello Mohammed, my name is ${name} (${email})${companyInfo}. I'm interested in: ${service} (Budget: ${budget}). Details: ${message}`;

      const encodedMsg = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/201018923563?text=${encodedMsg}`;

      if (formStatus) {
        formStatus.className = 'mt-4 p-4 border-2 border-brutal-green bg-brutal-green/10 text-brutal-green font-mono text-sm';
        formStatus.textContent = 'Opening WhatsApp to send your inquiry directly...';
        formStatus.classList.remove('hidden');
      }

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 600);
    });
  }
})();


// ─── Carousel Dots Pagination (Mobile) ────────────────────
(function initCarouselDots() {
  const carousels = document.querySelectorAll('.carousel-snap');

  carousels.forEach(carousel => {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots flex justify-center items-center gap-2.5 mt-6 md:hidden';
    carousel.parentNode.insertBefore(dotsContainer, carousel.nextSibling);

    function updateDots() {
      dotsContainer.innerHTML = '';
      
      const children = Array.from(carousel.children).filter(el => {
        return !el.classList.contains('hidden') && el.offsetHeight > 0;
      });

      if (children.length <= 1) return;

      children.forEach((child, index) => {
        const dot = document.createElement('button');
        dot.className = 'w-2.5 h-2.5 rounded-full border border-brutal-light/30 bg-brutal-light/10 transition-all duration-200 cursor-pointer focus:outline-none';
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);

        dot.addEventListener('click', () => {
          carousel.scrollTo({
            left: child.offsetLeft - carousel.offsetLeft,
            behavior: 'smooth'
          });
        });

        dotsContainer.appendChild(dot);
      });

      highlightActiveDot(children);
    }

    function highlightActiveDot(children) {
      if (!children) {
        children = Array.from(carousel.children).filter(el => {
          return !el.classList.contains('hidden') && el.offsetHeight > 0;
        });
      }
      
      const dots = dotsContainer.querySelectorAll('button');
      if (dots.length === 0) return;

      const scrollLeft = carousel.scrollLeft;
      
      let activeIndex = 0;
      let minDiff = Infinity;

      children.forEach((child, idx) => {
        const diff = Math.abs(child.offsetLeft - carousel.offsetLeft - scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          activeIndex = idx;
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.className = 'w-3.5 h-3.5 rounded-full border-2 border-brutal-dark bg-brutal-yellow scale-110 shadow-[1.5px_1.5px_0_0_#0A0A0A] transition-all duration-200 focus:outline-none';
        } else {
          dot.className = 'w-2.5 h-2.5 rounded-full border border-brutal-light/20 bg-brutal-light/15 hover:bg-brutal-light/35 transition-all duration-200 cursor-pointer focus:outline-none';
        }
      });
    }

    updateDots();

    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const visibleChildren = Array.from(carousel.children).filter(el => {
          return !el.classList.contains('hidden') && el.offsetHeight > 0;
        });
        highlightActiveDot(visibleChildren);
      }, 50);
    }, { passive: true });

    carousel.updateCarouselDots = updateDots;
  });
})();


// ─── Dynamic Portfolio Screenshots (Auto Fallback) ───────
(function initDynamicScreenshots() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    const img = card.querySelector('img');
    const url = card.getAttribute('data-live-url') || card.getAttribute('href');
    if (img && url && url.startsWith('http')) {
      const originalSrc = img.getAttribute('src');
      const encodedUrl = encodeURIComponent(url);
      const screenshotSrc = `https://api.microlink.io?url=${encodedUrl}&screenshot=true&embed=screenshot.url`;

      img.onerror = function() {
        img.onerror = null;
        img.src = originalSrc;
      };

      img.src = screenshotSrc;
    }
  });
})();


// ─── Live Page Hits Counter ──────────────────────────────
(function initHitsCounter() {
  const counterCard = document.getElementById('counter-card');
  const countEl = document.getElementById('visitor-count');
  if (!countEl || !counterCard) return;

  let localViews = parseInt(localStorage.getItem('admin_local_views') || '4822');
  localViews += 1;
  localStorage.setItem('admin_local_views', localViews.toString());

  fetch('https://countapi.mileshilliard.com/api/v1/hit/mohammedessam_portfolio_pageviews')
    .then(response => response.json())
    .then(data => {
      if (data && typeof data.value !== 'undefined') {
        countEl.textContent = data.value.toLocaleString();
        localStorage.setItem('admin_local_views', data.value.toString());
      } else {
        countEl.textContent = localViews.toLocaleString();
      }
    })
    .catch(() => {
      countEl.textContent = localViews.toLocaleString();
    });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('admin') || urlParams.has('stats')) {
    counterCard.classList.remove('hidden');
  }
})();

