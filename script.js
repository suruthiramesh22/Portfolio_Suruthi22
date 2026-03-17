/* =============================================
   Suruthi R – Portfolio : JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- DOM Elements ---------- */
  const navbar       = document.getElementById('navbar');
  const navToggle    = document.getElementById('navToggle');
  const navLinks     = document.getElementById('navLinks');
  const allNavLinks  = document.querySelectorAll('.nav-link');
  const backToTop    = document.getElementById('backToTop');
  const contactForm  = document.getElementById('contactForm');
  const formStatus   = document.getElementById('formStatus');
  const heroParticles = document.getElementById('heroParticles');

  /* ===========================================
     1. PARTICLES (Floating Background)
     =========================================== */
  function createParticles() {
    const count = window.innerWidth < 600 ? 20 : 45;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (6 + Math.random() * 10) + 's';
      particle.style.animationDelay = (Math.random() * 8) + 's';
      particle.style.width = particle.style.height = (2 + Math.random() * 3) + 'px';
      const hue = Math.random() > 0.5 ? '260' : '190';
      particle.style.background = `hsla(${hue}, 80%, 65%, ${0.25 + Math.random() * 0.3})`;
      heroParticles.appendChild(particle);
    }
  }
  createParticles();

  /* ===========================================
     2. NAVBAR – Scroll Behaviour
     =========================================== */
  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /* ===========================================
     3. BACK TO TOP
     =========================================== */
  function handleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ===========================================
     4. ACTIVE NAV LINK BASED ON SCROLL
     =========================================== */
  const sectionIds = ['home', 'about', 'skills', 'projects', 'contact'];
  const sections   = sectionIds.map(id => document.getElementById(id));

  function highlightNavLink() {
    const scrollPos = window.scrollY + window.innerHeight / 3;

    sections.forEach((section, index) => {
      if (!section) return;
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        allNavLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionIds[index]}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }

  /* Combined scroll handler */
  window.addEventListener('scroll', () => {
    handleNavScroll();
    handleBackToTop();
    highlightNavLink();
  }, { passive: true });

  /* ===========================================
     5. MOBILE NAVIGATION TOGGLE
     =========================================== */
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  /* Close mobile menu on link click */
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  /* Close mobile menu on outside click */
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });

  /* ===========================================
     6. SCROLL ANIMATIONS (Intersection Observer)
     =========================================== */
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        /* Animate skill progress bars when visible */
        const progressBar = entry.target.querySelector('.skill-progress');
        if (progressBar) {
          const progress = progressBar.getAttribute('data-progress');
          progressBar.style.width = progress + '%';
        }

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));

  /* ===========================================
     7. COUNTER ANIMATION (Hero Stats)
     =========================================== */
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count');
      const duration = 1800;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        /* Ease out cubic */
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    });
  }

  /* Trigger counter animation when hero stats become visible */
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
  }

  /* ===========================================
     8. CONTACT FORM HANDLING
     =========================================== */
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('contactName').value.trim();
    const email   = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      showFormStatus('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFormStatus('Please enter a valid email address.', 'error');
      return;
    }

    /* Send via Web3Forms API */
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    try {
      const formData = new FormData(contactForm);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showFormStatus('Thank you! Your message has been sent successfully. 🎉', 'success');
        contactForm.reset();
      } else {
        showFormStatus('Something went wrong. Please try again later.', 'error');
      }
    } catch (error) {
      showFormStatus('Network error. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
  });

  function showFormStatus(msg, type) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status ' + type;

    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 5000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ===========================================
     9. RESUME DOWNLOAD BUTTON
     =========================================== */
  /* Resume download now handled via direct link in HTML */

  /* ===========================================
     10. SMOOTH SCROLL FOR ALL ANCHOR LINKS
     =========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ===========================================
     11. INITIAL TRIGGERS
     =========================================== */
  handleNavScroll();
  handleBackToTop();
  highlightNavLink();
});
