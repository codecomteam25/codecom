/* ===== CodeCom — Main JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');
  
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run on load

  // ===== MOBILE NAV TOGGLE =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ===== OPTIONAL FIELD TOGGLES =====
  const optionalFieldToggles = document.querySelectorAll('[data-optional-toggle]');

  optionalFieldToggles.forEach(toggle => {
    const group = toggle.closest('.form-group');
    if (!group) return;

    const body = group.querySelector('.optional-field-body');
    const input = group.querySelector('input, textarea, select');
    if (!body || !input) return;

    const setOffState = (isOff) => {
      body.hidden = isOff;
      input.disabled = isOff;
      if (isOff) input.value = '';

      toggle.setAttribute('aria-pressed', isOff ? 'true' : 'false');
      toggle.textContent = isOff ? 'I have one' : "I don't have one";
    };

    // Default: field hidden and disabled
    setOffState(true);

    toggle.addEventListener('click', () => {
      setOffState(!body.hidden);
    });
  });

  // ===== FORM HANDLING — Send directly via Backend with Gmail =====
  const forms = document.querySelectorAll('form');
  
  // Determine the correct API base URL
  const getApiBaseUrl = () => {
    // In production, use relative URLs
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '';
    }
    
    // In development, check if we're on Live Server (port 5500) or Node server (port 3000)
    if (window.location.port === '5500') {
      // Live Server - point to Node.js server
      return 'http://localhost:3000';
    } else if (window.location.port === '3000') {
      // Already on Node.js server
      return '';
    } else {
      // Default to Node.js server for development
      return 'http://localhost:3000';
    }
  };
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const button = form.querySelector('button[type="submit"]');
      const originalHTML = button.innerHTML;
      
      // Collect form data
      const formData = new FormData(form);
      
      // Determine endpoint based on form ID
      const isApplication = form.id === 'applicationForm' || form.id === 'volunteerForm';
      const isFeedback = form.id === 'feedbackForm';
      const endpoint = isApplication 
        ? '/api/submit-application' 
        : isFeedback 
        ? '/api/submit-feedback' 
        : null;

      if (!endpoint) return; // Only handle known forms

      // Get the full URL
      const apiBaseUrl = getApiBaseUrl();
      const fullUrl = `${apiBaseUrl}${endpoint}`;

      // Show loading state
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
        Submitting...
      `;
      button.style.pointerEvents = 'none';
      button.style.opacity = '0.7';

      try {
        // For application form with file upload, send FormData
        // For feedback form, send JSON
        const requestOptions = {
          method: 'POST',
          body: isApplication ? formData : JSON.stringify(Object.fromEntries(formData))
        };
        
        // Only add Content-Type header for non-file forms
        if (!isApplication) {
          requestOptions.headers = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
        } else {
          requestOptions.headers = { 
            'Accept': 'application/json'
          };
        }

        const response = await fetch(fullUrl, requestOptions);

        // Check if response is ok and has content
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned invalid response format');
        }

        const result = await response.json();

        if (result.success) {
          // Use shorter message on mobile
          const isMobile = window.innerWidth <= 768;
          const successMessage = isMobile ? 'Sent!' : (result.message || 'Submitted Successfully!');
          
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ${successMessage}
          `;
          button.classList.add('form-message');
          button.style.background = '#2ed573';
          button.style.color = '#ffffff';
          form.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Use shorter error messages on mobile
        const isMobile = window.innerWidth <= 768;
        let errorMessage = isMobile ? 'Error!' : 'Error — please try again';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = isMobile ? 'No connection' : 'Connection error — check server';
        } else if (error.message.includes('HTTP 405')) {
          errorMessage = isMobile ? 'Server offline' : 'Server not running — start Node.js server';
        }
        
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ${errorMessage}
        `;
        button.classList.add('form-message');
        button.style.background = '#ff4757';
        button.style.color = '#ffffff';
      }

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('form-message');
        button.style.pointerEvents = '';
        button.style.opacity = '';
        button.style.background = '';
        button.style.color = '';
      }, 3000);
    });
  });

  // ===== COUNTER ANIMATION (Hero Stats) =====
  const statElements = document.querySelectorAll('.hero-stat h3');
  
  const animateCounter = (el) => {
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;
    
    const target = parseInt(match[0]);
    const suffix = text.replace(match[0], '').trim();
    const duration = 2000;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      
      el.innerHTML = current + '<span>' + suffix + '</span>';
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.innerHTML = target + '<span>' + suffix + '</span>';
      }
    };

    requestAnimationFrame(tick);
  };

  if (statElements.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statElements.forEach(el => statsObserver.observe(el));
  }

  // ===== CURSOR GLOW EFFECT (Subtle) =====
  const hero = document.querySelector('.hero');
  if (hero) {
    const glowEl = document.createElement('div');
    glowEl.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(0, 212, 255, 0.03);
      pointer-events: none;
      z-index: 1;
      transition: transform 0.15s ease;
      filter: blur(60px);
    `;
    document.body.appendChild(glowEl);

    document.addEventListener('mousemove', (e) => {
      glowEl.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
    });
  }

  // ===== KEYBOARD SPIN ANIMATION =====
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // ===== PORTFOLIO FILTER =====
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterButtons.length > 0 && portfolioItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        // Filter portfolio items
        portfolioItems.forEach(item => {
          const category = item.getAttribute('data-category');
          
          if (filter === 'all' || filter === category) {
            item.classList.remove('hidden');
            item.style.animation = 'fadeIn 0.5s ease-in-out';
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  // ===== IMAGE LIGHTBOX =====
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDescription = document.getElementById('lightboxDescription');
  const portfolioThumbs = document.querySelectorAll('.portfolio-thumb');

  if (lightboxModal && portfolioThumbs.length > 0) {
    // Open lightbox on image click
    portfolioThumbs.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const img = thumb.querySelector('img');
        const portfolioItem = thumb.closest('.portfolio-item');
        const title = portfolioItem.querySelector('.portfolio-header h3').textContent;
        const description = portfolioItem.querySelector('.portfolio-info p').textContent;
        
        if (img && img.src && !img.src.includes('placeholder')) {
          lightboxImage.src = img.src;
          lightboxImage.alt = img.alt;
          lightboxTitle.textContent = title;
          lightboxDescription.textContent = description;
          
          lightboxModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    // Close lightbox functions
    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = 'auto';
      
      // Clear image after animation
      setTimeout(() => {
        lightboxImage.src = '';
        lightboxImage.alt = '';
        lightboxTitle.textContent = '';
        lightboxDescription.textContent = '';
      }, 300);
    };

    // Close on backdrop click
    lightboxBackdrop.addEventListener('click', closeLightbox);

    // Close on close button click
    lightboxClose.addEventListener('click', closeLightbox);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });

    // Prevent body scroll when modal is open
    lightboxModal.addEventListener('wheel', (e) => {
      if (lightboxModal.classList.contains('active')) {
        e.preventDefault();
      }
    });
  }

});
