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


// ─── Category & Status Filtering for Work / Portfolio Page ─────────
(function initWorkFilters() {
  const filterBtns   = document.querySelectorAll('.work-filter-btn');
  const liveSec      = document.getElementById('live-projects-section');
  const upcomingSec  = document.getElementById('upcoming-projects-section');
  const cards        = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !cards.length) return;

  function applyFilter(filterValue) {
    filterBtns.forEach(b => {
      if (b.getAttribute('data-filter') === filterValue) {
        b.classList.remove('bg-brutal-gray', 'text-brutal-light/70', 'border-brutal-light/10');
        b.classList.add('active', 'bg-brutal-yellow', 'text-brutal-dark', 'shadow-brutal');
      } else {
        b.classList.remove('active', 'bg-brutal-yellow', 'text-brutal-dark', 'shadow-brutal');
        b.classList.add('bg-brutal-gray', 'text-brutal-light/70', 'border-brutal-light/10');
      }
    });

    let visibleLive = 0;
    let visibleUpcoming = 0;

    cards.forEach(card => {
      const categories = (card.getAttribute('data-categories') || '').split(' ');
      const status = card.getAttribute('data-status') || '';
      
      let isVisible = false;
      if (filterValue === 'all') {
        isVisible = true;
      } else if (filterValue === 'live') {
        isVisible = (status === 'live' || categories.includes('live'));
      } else if (filterValue === 'upcoming') {
        isVisible = (status === 'upcoming' || categories.includes('upcoming'));
      } else {
        isVisible = categories.includes(filterValue);
      }

      if (isVisible) {
        card.classList.remove('hidden');
        if (status === 'live' || categories.includes('live')) visibleLive++;
        if (status === 'upcoming' || categories.includes('upcoming')) visibleUpcoming++;
      } else {
        card.classList.add('hidden');
      }
    });

    // Toggle section visibility based on visible card counts
    if (liveSec) {
      if (visibleLive > 0) {
        liveSec.classList.remove('hidden');
      } else {
        liveSec.classList.add('hidden');
      }
    }
    if (upcomingSec) {
      if (visibleUpcoming > 0) {
        upcomingSec.classList.remove('hidden');
      } else {
        upcomingSec.classList.add('hidden');
      }
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-filter');
      applyFilter(val);
    });
  });

  // Check URL param ?filter=...
  const urlParams = new URLSearchParams(window.location.search);
  const paramFilter = urlParams.get('filter');
  if (paramFilter) {
    applyFilter(paramFilter.toLowerCase());
  } else {
    // Default filter is 'live' per master specification
    applyFilter('live');
  }
})();


// ─── Contact Form & Pre-selection Helper (Robust AJAX Submission) ──
(function initContactHelper() {
  const serviceSelect = document.getElementById('service-select');
  const contactForm   = document.getElementById('contact-form');
  const formStatus    = document.getElementById('form-status');

  // Preselect service if passed in query param ?service=...
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
    const isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!submitBtn || submitBtn.disabled) return;

      // Check standard HTML5 validation
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // Collect form values
      const name = (document.getElementById('name-input')?.value || '').trim();
      const email = (document.getElementById('email-input')?.value || '').trim();
      const phone = (document.getElementById('phone-input')?.value || '').trim();
      const company = (document.getElementById('company-input')?.value || '').trim();
      const businessType = (document.getElementById('business-type-select')?.value || document.getElementById('business-type-input')?.value || '').trim();
      const websiteSituation = (document.getElementById('website-situation-select')?.value || '').trim();
      const service = serviceSelect?.value || 'Project Inquiry';
      const budget = (document.getElementById('budget-select')?.value || 'Not specified').trim();
      const preferredContact = (document.getElementById('preferred-contact-select')?.value || 'Email').trim();
      const message = (document.getElementById('message-input')?.value || '').trim();

      // Basic client-side checks
      if (!name || !email || !message) {
        if (formStatus) {
          formStatus.className = 'mt-4 p-4 border-2 border-brutal-orange bg-brutal-orange/10 text-brutal-orange font-mono text-sm';
          formStatus.textContent = isArabic
            ? 'يرجى ملء جميع الحقول الإلزامية (*)'
            : 'Please fill out all required fields marked with an asterisk (*).';
          formStatus.classList.remove('hidden');
        }
        return;
      }

      // Set Loading State
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = isArabic
        ? '<i class="fas fa-spinner fa-spin ml-2"></i> جاري حفظ وإرسال طلبك...'
        : '<i class="fas fa-spinner fa-spin mr-2"></i> SENDING INQUIRY...';
      submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

      if (formStatus) {
        formStatus.className = 'mt-4 p-4 border-2 border-brutal-yellow bg-brutal-yellow/10 text-brutal-yellow font-mono text-sm';
        formStatus.innerHTML = isArabic
          ? '<div class="flex items-center gap-2"><i class="fas fa-circle-notch fa-spin"></i> جاري إرسال البيانات بشكل مشفر وآمن إلى بريد محمد عصام...</div>'
          : '<div class="flex items-center gap-2"><i class="fas fa-circle-notch fa-spin"></i> Securely sending inquiry to Mohammed Essam...</div>';
        formStatus.classList.remove('hidden');
      }

      // Prepare payload
      const payload = {
        name: name,
        email: email,
        phone: phone || 'Not provided',
        company: company || 'N/A',
        businessType: businessType || 'Not specified',
        websiteSituation: websiteSituation || 'Not specified',
        service: service,
        budget: budget,
        preferredContact: preferredContact,
        message: message,
        _subject: `New Project Inquiry from ${name} [${service}]`,
        _replyto: email,
        _template: 'table'
      };

      // Form submission endpoint. Defaults to reliable FormSubmit endpoint configured to hello@mohammedessam.site
      // Can also be set via window.FORM_SUBMISSION_ENDPOINT
      const ENDPOINT = window.FORM_SUBMISSION_ENDPOINT || 'https://formsubmit.co/ajax/hello@mohammedessam.site';

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => null);

        if (response.ok && (!result || result.success === true || result.success === 'true' || result.ok === true || response.status === 200)) {
          // Success!
          submitBtn.innerHTML = isArabic ? '✓ تم إرسال الطلب بنجاح' : '✓ INQUIRY SENT SUCCESSFULLY';
          submitBtn.classList.remove('bg-brutal-yellow', 'text-brutal-dark');
          submitBtn.classList.add('bg-brutal-green', 'text-brutal-dark');

          // Optional follow-up via WhatsApp
          const companyTag = company ? ` [${company}]` : '';
          const waText = isArabic
            ? `مرحباً محمد، أرسلت لك طلباً عبر الموقع:\n- الاسم: ${name}${companyTag}\n- الخدمة: ${service}\n- الميزانية: ${budget}\n- تفاصيل: ${message}`
            : `Hello Mohammed, I just submitted an inquiry via your website:\n- Name: ${name}${companyTag}\n- Service: ${service}\n- Budget: ${budget}\n- Details: ${message}`;
          const waUrl = `https://wa.me/201018923563?text=${encodeURIComponent(waText)}`;

          if (formStatus) {
            formStatus.className = 'mt-6 p-6 border-4 border-brutal-green bg-brutal-green/10 text-brutal-light font-mono text-sm space-y-3';
            formStatus.innerHTML = isArabic
              ? `<div class="flex items-start gap-3">
                   <span class="text-2xl text-brutal-green">✓</span>
                   <div>
                     <h4 class="font-bold text-base text-brutal-green uppercase">تم استلام طلبك بنجاح!</h4>
                     <p class="text-xs text-brutal-light/90 mt-1">شكراً لك يا <strong>${name}</strong>. وصلت رسالتك إلى بريدي الرسمي (hello@mohammedessam.site) وسأراجع متطلبات المشروع وأتواصل معك خلال 24 ساعة.</p>
                   </div>
                 </div>
                 <div class="pt-3 border-t border-brutal-green/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                   <span class="text-xs text-brutal-light/70">هل ترغب في تنبيهي مباشرة عبر واتساب للمتابعة الفورية؟</span>
                   <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-brutal-green text-brutal-dark font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-brutal-sm">
                     <i class="fab fa-whatsapp text-sm"></i> فتح محادثة واتساب الآن (اختياري)
                   </a>
                 </div>`
              : `<div class="flex items-start gap-3">
                   <span class="text-2xl text-brutal-green">✓</span>
                   <div>
                     <h4 class="font-bold text-base text-brutal-green uppercase">Inquiry Received Successfully!</h4>
                     <p class="text-xs text-brutal-light/90 mt-1">Thank you <strong>${name}</strong>. Your project details have been successfully captured and routed to hello@mohammedessam.site. I will review your requirements and follow up within 24 hours.</p>
                   </div>
                 </div>
                 <div class="pt-3 border-t border-brutal-green/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                   <span class="text-xs text-brutal-light/70">Want an immediate real-time touchpoint?</span>
                   <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-brutal-green text-brutal-dark font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-brutal-sm">
                     <i class="fab fa-whatsapp text-sm"></i> Open WhatsApp Follow-up (Optional)
                   </a>
                 </div>`;
          }

          contactForm.reset();
        } else {
          throw new Error(result?.message || 'Submission service returned an unexpected response.');
        }
      } catch (err) {
        console.error('Submission error:', err);

        // Reset submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');

        // Honest Error Message with direct 1-click fallback
        const companyTag = company ? ` [${company}]` : '';
        const fallbackWaText = `مرحباً محمد، حاولت إرسال رسالة عبر نموذج الموقع وتعذر الإرسال بسبب اتصال الشبكة:\n- الاسم: ${name}${companyTag}\n- الخدمة: ${service}\n- تفاصيل: ${message}`;
        const fallbackWaUrl = `https://wa.me/201018923563?text=${encodeURIComponent(fallbackWaText)}`;

        if (formStatus) {
          formStatus.className = 'mt-6 p-6 border-4 border-brutal-orange bg-brutal-orange/10 text-brutal-light font-mono text-sm space-y-3';
          formStatus.innerHTML = isArabic
            ? `<div class="flex items-start gap-3">
                 <span class="text-2xl text-brutal-orange"><i class="fas fa-exclamation-triangle"></i></span>
                 <div>
                   <h4 class="font-bold text-base text-brutal-orange uppercase">تعذر تسليم النموذج مؤقتاً</h4>
                   <p class="text-xs text-brutal-light/90 mt-1">حدث انقطاع في الاتصال أو استجابة الخدمة. لضمان عدم ضياع فكرتك، تفاصيلك محفوظة ويمكنك إرسالها إليّ بنقرة واحدة مباشرة:</p>
                 </div>
               </div>
               <div class="pt-2 flex flex-wrap gap-2">
                 <a href="${fallbackWaUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-brutal-green text-brutal-dark font-bold text-xs uppercase hover:bg-white transition-all shadow-brutal-sm">
                   <i class="fab fa-whatsapp text-sm"></i> إرسال عبر واتساب الآن
                 </a>
                 <a href="mailto:hello@mohammedessam.site?subject=Project Inquiry - ${encodeURIComponent(name)}" class="inline-flex items-center gap-2 px-4 py-2 bg-brutal-yellow text-brutal-dark font-bold text-xs uppercase hover:bg-white transition-all shadow-brutal-sm">
                   <i class="fas fa-envelope text-sm"></i> مراسلة عبر الإيميل مباشرة
                 </a>
               </div>`
            : `<div class="flex items-start gap-3">
                 <span class="text-2xl text-brutal-orange"><i class="fas fa-exclamation-triangle"></i></span>
                 <div>
                   <h4 class="font-bold text-base text-brutal-orange uppercase">Submission Temporarily Interrupted</h4>
                   <p class="text-xs text-brutal-light/90 mt-1">A network or server issue prevented direct delivery. To ensure your inquiry reaches me immediately, click below to forward your details directly via WhatsApp or email:</p>
                 </div>
               </div>
               <div class="pt-2 flex flex-wrap gap-2">
                 <a href="${fallbackWaUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-brutal-green text-brutal-dark font-bold text-xs uppercase hover:bg-white transition-all shadow-brutal-sm">
                   <i class="fab fa-whatsapp text-sm"></i> Forward via WhatsApp
                 </a>
                 <a href="mailto:hello@mohammedessam.site?subject=Project Inquiry - ${encodeURIComponent(name)}" class="inline-flex items-center gap-2 px-4 py-2 bg-brutal-yellow text-brutal-dark font-bold text-xs uppercase hover:bg-white transition-all shadow-brutal-sm">
                   <i class="fas fa-envelope text-sm"></i> Send Directly via Email
                 </a>
               </div>`;
          formStatus.classList.remove('hidden');
        }
      }
    });
  }
})();

// ─── Language Preference Storage & Helper ─────────────────
(function initLanguageManager() {
  // If user clicks a link with data-lang-switch attribute
  document.querySelectorAll('[data-lang-switch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetLang = btn.getAttribute('data-lang-switch');
      try {
        localStorage.setItem('mo_lang_pref', targetLang);
      } catch (err) {}
    });
  });

  // Track active language
  const isArabic = document.documentElement.lang === 'ar' || window.location.pathname.includes('/ar/');
  try {
    localStorage.setItem('mo_current_lang', isArabic ? 'ar' : 'en');
  } catch (err) {}
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



// ─── Project Preview Modal / Lightbox Controller ─────────
(function initProjectPreviewModal() {
  const modal = document.getElementById('project-preview-modal');
  if (!modal) return;

  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalIndustry = document.getElementById('modal-industry');
  const modalPlatform = document.getElementById('modal-platform');
  const modalStatusBadge = document.getElementById('modal-status-badge');
  const modalLiveLink = document.getElementById('modal-live-link');
  const modalCaseLink = document.getElementById('modal-case-link');
  const closeBtn = document.getElementById('modal-close-btn');

  function openModal(data) {
    if (!modal) return;
    if (modalImg) modalImg.src = data.img || '';
    if (modalTitle) modalTitle.textContent = data.title || 'Project Preview';
    if (modalDesc) modalDesc.textContent = data.desc || '';
    if (modalIndustry) modalIndustry.textContent = data.industry || 'E-Commerce';
    if (modalPlatform) modalPlatform.textContent = data.platform || 'Shopify';
    
    if (modalStatusBadge) {
      modalStatusBadge.textContent = data.status || 'LIVE';
      if ((data.status || '').includes('LIVE')) {
        modalStatusBadge.className = 'font-mono text-xs font-bold px-2.5 py-1 bg-brutal-green text-brutal-dark uppercase tracking-wider';
      } else {
        modalStatusBadge.className = 'font-mono text-xs font-bold px-2.5 py-1 bg-brutal-cyan text-brutal-dark uppercase tracking-wider';
      }
    }

    if (modalLiveLink) {
      if (data.liveUrl && data.liveUrl.startsWith('http')) {
        modalLiveLink.href = data.liveUrl;
        modalLiveLink.classList.remove('hidden');
      } else {
        modalLiveLink.classList.add('hidden');
      }
    }

    if (modalCaseLink) {
      if (data.caseStudy && !data.caseStudy.includes('None')) {
        modalCaseLink.href = data.caseStudy;
        modalCaseLink.classList.remove('hidden');
      } else {
        modalCaseLink.classList.add('hidden');
      }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Attach click listeners to all project card preview triggers
  document.querySelectorAll('.project-preview-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const card = trigger.closest('.project-card') || trigger;
      const data = {
        title: card.getAttribute('data-preview-title') || card.querySelector('h3')?.textContent || '',
        desc: card.getAttribute('data-preview-desc') || card.querySelector('p')?.textContent || '',
        img: card.getAttribute('data-preview-img') || card.querySelector('img')?.getAttribute('src') || '',
        industry: card.getAttribute('data-preview-industry') || '',
        platform: card.getAttribute('data-preview-platform') || '',
        status: card.getAttribute('data-status') || 'LIVE',
        liveUrl: card.getAttribute('data-live-url') || '',
        caseStudy: card.getAttribute('data-case-study') || ''
      };
      openModal(data);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
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


// ─── Floating WhatsApp Action Button ─────────────────────
(function initFloatingWhatsApp() {
  if (document.getElementById('floating-whatsapp-btn')) return;
  
  const isAr = document.documentElement.lang === 'ar' || document.documentElement.getAttribute('dir') === 'rtl';
  const msg = isAr 
    ? "مرحباً محمد، تصفحت موقعك وأرغب في استشارة بخصوص متجري/مشروعي."
    : "Hi Mohammed, I visited your website and would like to discuss a project for my business.";
  const url = `https://wa.me/201018923563?text=${encodeURIComponent(msg)}`;
  const label = isAr ? "تواصل واتساب" : "Chat on WhatsApp";

  const btn = document.createElement('a');
  btn.id = 'floating-whatsapp-btn';
  btn.className = 'floating-whatsapp-btn';
  btn.href = url;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', label);
  btn.title = label;

  btn.innerHTML = `
    <span class="floating-whatsapp-pulse" aria-hidden="true"></span>
    <i class="fab fa-whatsapp text-lg" aria-hidden="true"></i>
    <span class="floating-whatsapp-text font-bold">${label}</span>
  `;

  document.body.appendChild(btn);
})();

// ─── Neo-Brutalist FAQ Accordion ─────────────────────────
(function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      if (isActive) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

// ─── Click-to-Copy Email with Toast ─────────────────────
(function initCopyEmail() {
  function showToast(text) {
    let toast = document.getElementById('copy-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'copy-toast-notification';
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = text;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function copyText(val, successHtml) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(val).then(() => {
        showToast(successHtml);
      }).catch(() => {
        fallbackCopy(val, successHtml);
      });
    } else {
      fallbackCopy(val, successHtml);
    }
  }

  function fallbackCopy(val, successHtml) {
    const ta = document.createElement('textarea');
    ta.value = val;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successHtml);
    } catch (e) {
      prompt("Copy email:", val);
    }
    document.body.removeChild(ta);
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-copy="email"], .btn-copy-email');
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();

    const isAr = document.documentElement.lang === 'ar' || document.documentElement.getAttribute('dir') === 'rtl';
    const email = 'hello@mohammedessam.site';
    const msg = isAr 
      ? `<i class="fas fa-check-circle text-brutal-dark"></i> تم نسخ البريد الإلكتروني: <strong>${email}</strong>`
      : `<i class="fas fa-check-circle text-brutal-dark"></i> Email copied: <strong>${email}</strong>`;

    copyText(email, msg);
  });
})();
