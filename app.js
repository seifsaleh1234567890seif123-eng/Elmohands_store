/* ==========================================================================
   ELMOHANDS PLAYSTATION LOUNGE - JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. INTRO SPLASH ENGINE (~2.2 SECONDS DURATION)
  // --------------------------------------------------------------------------
  const initIntroSplash = () => {
    const splash = document.getElementById('intro-splash');
    const brandContainer = document.getElementById('falling-brand');

    if (brandContainer) {
      const text = 'ELMOHANDS';
      brandContainer.innerHTML = '';

      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'falling-letter';
        span.textContent = char;
        span.style.animationDelay = `${0.12 * index}s`;
        brandContainer.appendChild(span);
      });
    }

    if (splash) {
      const closeSplash = () => {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
          triggerScrollReveal();
        }, 600);
      };

      setTimeout(closeSplash, 2200);
      splash.addEventListener('click', closeSplash);
    }
  };

  initIntroSplash();

  // --------------------------------------------------------------------------
  // 2. HERO SLIDER ENGINE (3.5s ROTATION + PAUSE ON HOVER + KEYBOARD NAVIGATION)
  // --------------------------------------------------------------------------
  const sliderContainer = document.querySelector('.hero-slider-container');
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.indicator');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  let currentSlide = 0;
  let sliderInterval = null;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
    currentSlide = index;
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    sliderInterval = setInterval(nextSlide, 2000); // Fast 2.0s rotation
  };

  const stopAutoSlide = () => {
    if (sliderInterval) clearInterval(sliderInterval);
  };

  prevBtn?.addEventListener('click', () => {
    prevSlide();
    startAutoSlide();
  });

  nextBtn?.addEventListener('click', () => {
    nextSlide();
    startAutoSlide();
  });

  indicators.forEach((ind) => {
    ind.addEventListener('click', (e) => {
      const slideIdx = parseInt(e.target.dataset.slide);
      showSlide(slideIdx);
      startAutoSlide();
    });
  });

  // Pause on hover for laptop/desktop users
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', () => {
      stopAutoSlide();
    });
    sliderContainer.addEventListener('mouseleave', () => {
      startAutoSlide();
    });
  }

  // Keyboard navigation for desktop/laptop
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      prevSlide(); // RTL direction: right goes to previous
      startAutoSlide();
    } else if (e.key === 'ArrowLeft') {
      nextSlide(); // RTL direction: left goes to next
      startAutoSlide();
    }
  });

  // Mobile Touch Swipe Support
  const sliderWrapper = document.getElementById('slider-wrapper');
  if (sliderWrapper) {
    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          prevSlide();
        } else {
          nextSlide();
        }
        startAutoSlide();
      }
    }, { passive: true });
  }

  startAutoSlide();

  // --------------------------------------------------------------------------
  // 3. 3D SCROLL REVEAL OBSERVER FOR HTML GAME CARDS
  // --------------------------------------------------------------------------
  let observer = null;

  const triggerScrollReveal = () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if ('IntersectionObserver' in window) {
      if (observer) observer.disconnect();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
            }
          });
        },
        { threshold: 0.12 }
      );

      revealElements.forEach((el) => observer.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('revealed'));
    }
  };

  triggerScrollReveal();

  // Sticky Navbar
  const header = document.getElementById('navbar-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });
});
