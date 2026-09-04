/* ==========================================================================
   ELMOHANDS PLAYSTATION LOUNGE - JAVASCRIPT ENGINE & ADMIN SYSTEM
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
  // 2. HERO SLIDER ENGINE (2.0s FAST ROTATION + PAUSE ON HOVER + KEYBOARD NAVIGATION)
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

  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      prevSlide();
      startAutoSlide();
    } else if (e.key === 'ArrowLeft') {
      nextSlide();
      startAutoSlide();
    }
  });

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
  // 3. FAST GPU SCROLL REVEAL OBSERVER
  // --------------------------------------------------------------------------
  let observer = null;

  const triggerScrollReveal = () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if ('IntersectionObserver' in window) {
      if (observer) observer.disconnect();

      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -30px 0px', threshold: 0.08 }
      );

      revealElements.forEach((el) => observer.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('revealed'));
    }
  };

  // Sticky Navbar with requestAnimationFrame
  const header = document.getElementById('navbar-header');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          header?.classList.add('scrolled');
        } else {
          header?.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ==========================================================================
  // 4. FIREBASE CLOUD DATABASE & REALTIME ENGINE
  // ==========================================================================
  const firebaseConfig = {
    apiKey: "AIzaSyCs-VmEzb7q8oIAzGZ8QpHllPI0yGtdsPA",
    authDomain: "elmohands-store.firebaseapp.com",
    projectId: "elmohands-store",
    storageBucket: "elmohands-store.firebasestorage.app",
    messagingSenderId: "577193319663",
    appId: "1:577193319663:web:fc57174413106afb474f1a",
    measurementId: "G-8GME76MV08"
  };

  let db = null;
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      if (firebase.analytics) {
        try { firebase.analytics(); } catch (e) {}
      }
      db = firebase.firestore();
      db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code !== 'unimplemented') {
          console.warn('Firestore offline persistence warning:', err);
        }
      });
      console.log('Firebase Cloud initialized successfully 🚀');
    }
  } catch (e) {
    console.warn('Firebase initialization notice:', e);
  }

  const STORAGE_KEY_GAMES = 'elmohands_games_data_v1';
  const STORAGE_KEY_AUTH = 'elmohands_admin_authenticated';
  const STORAGE_KEY_PWD = 'elmohands_admin_password_hash';
  const DEFAULT_PASSWORD = 'admin123';

  // Base library of games (Fallback & Initial Seed)
  const DEFAULT_GAMES = [
    // Featured Games
    { id: 'f-1', title: 'Fc27 Standard Edition', image: 'Fc27 Standard Edition.jpeg', glow: 'glow-cyan', section: 'featured', order: 1 },
    { id: 'f-2', title: 'Fc27 Ultimate Edition', image: 'Fc27 Ultimate Edition.jpeg', glow: 'glow-gold', section: 'featured', order: 2 },
    { id: 'f-3', title: 'Fc27 Ultimate plus Edition', image: 'Fc27 Ultimate plus Edition.jpeg', glow: 'glow-sports', section: 'featured', order: 3 },
    { id: 'f-4', title: 'GTA 6', image: 'GTA 6.jpeg', glow: 'glow-purple', section: 'featured', order: 4 },

    // Catalog Games
    { id: 'c-1', title: 'gta', image: 'gta.jpeg', glow: 'glow-cyan', section: 'catalog', order: 10 },
    { id: 'c-2', title: 'EA Sports FC26', image: 'Fc26.jpeg', glow: 'glow-sports', section: 'catalog', order: 11 },
    { id: 'c-3', title: "Assassin's Creed Valhalla", image: "Assassin's Creed Valhalla.jpeg", glow: 'glow-purple', section: 'catalog', order: 12 },
    { id: 'c-4', title: "Assassin's Creed Mirage", image: "Assassin's Creed Mirage.jpeg", glow: 'glow-gold', section: 'catalog', order: 13 },
    { id: 'c-5', title: 'Away Out', image: 'Away Out.jpeg', glow: 'glow-cyan', section: 'catalog', order: 14 },
    { id: 'c-6', title: 'Call of duty black ops3', image: 'Call of duty black ops3.jpeg', glow: 'glow-purple', section: 'catalog', order: 15 },
    { id: 'c-7', title: 'ctr', image: 'ctr.jpeg', glow: 'glow-cyan', section: 'catalog', order: 16 },
    { id: 'c-8', title: 'Crash Bandicoot TM', image: 'Crash Bandicoot TM - Quadrilogy Bundle.jpeg', glow: 'glow-cyan', section: 'catalog', order: 17 },
    { id: 'c-9', title: 'Crach Rumble', image: 'Crach Rumble.jpeg', glow: 'glow-cyan', section: 'catalog', order: 18 },
    { id: 'c-10', title: 'CyberPunk 2077', image: 'CyberPunk 2077.jpeg', glow: 'glow-cyan', section: 'catalog', order: 19 },
    { id: 'c-11', title: 'Days Gone', image: 'Days Gone.jpeg', glow: 'glow-cyan', section: 'catalog', order: 20 },
    { id: 'c-12', title: 'Dirt5', image: 'Dirt5.jpeg', glow: 'glow-cyan', section: 'catalog', order: 21 },
    { id: 'c-13', title: 'Ghost of tsushima', image: 'Ghost of tsushima.jpeg', glow: 'glow-cyan', section: 'catalog', order: 22 },
    { id: 'c-14', title: 'Hogwarts Legacy', image: 'Hogwarts Legacy.jpeg', glow: 'glow-cyan', section: 'catalog', order: 23 },
    { id: 'c-15', title: 'God of War', image: 'God of War.jpeg', glow: 'glow-cyan', section: 'catalog', order: 24 },
    { id: 'c-16', title: 'God of War Ragnarok', image: 'God of War Ragnarok.jpeg', glow: 'glow-cyan', section: 'catalog', order: 25 },
    { id: 'c-17', title: 'It Takes Two', image: 'It Takes Two.jpeg', glow: 'glow-cyan', section: 'catalog', order: 26 },
    { id: 'c-18', title: 'Unravel Two', image: 'Unravel Two.jpeg', glow: 'glow-cyan', section: 'catalog', order: 27 },
    { id: 'c-19', title: 'Mortal Kombat 11', image: 'Mortal Kombat 11.jpeg', glow: 'glow-cyan', section: 'catalog', order: 28 },
    { id: 'c-20', title: 'Mortal Kombat1', image: 'Mortal Kombat1.jpeg', glow: 'glow-cyan', section: 'catalog', order: 29 },
    { id: 'c-21', title: 'Need For Speed heat', image: 'NFS Heat.jpeg', glow: 'glow-cyan', section: 'catalog', order: 30 },
    { id: 'c-22', title: 'Need For Speed Payback', image: 'Need For Speed Payback.jpeg', glow: 'glow-cyan', section: 'catalog', order: 31 },
    { id: 'c-23', title: 'Need For Speed Unbound', image: 'NFS Unbound.jpeg', glow: 'glow-cyan', section: 'catalog', order: 32 },
    { id: 'c-24', title: 'Overcooked2 and Overcooked1', image: 'Overcooked2.jpeg', glow: 'glow-cyan', section: 'catalog', order: 33 },
    { id: 'c-25', title: 'Red Dead Redemption2', image: 'Red Dead Redemption2.jpeg', glow: 'glow-cyan', section: 'catalog', order: 34 },
    { id: 'c-26', title: 'Ratchet and clank', image: 'Ratchet and clank.jpeg', glow: 'glow-cyan', section: 'catalog', order: 35 },
    { id: 'c-27', title: 'Resident Evll4', image: 'Resident Evll4.jpeg', glow: 'glow-cyan', section: 'catalog', order: 36 },
    { id: 'c-28', title: 'Resident Evll7', image: 'Resident Evll7.jpeg', glow: 'glow-cyan', section: 'catalog', order: 37 },
    { id: 'c-29', title: 'Spider man marvel', image: 'Spider man marvel.jpeg', glow: 'glow-cyan', section: 'catalog', order: 38 },
    { id: 'c-30', title: 'Spider man miles', image: 'Spider man miles.jpeg', glow: 'glow-cyan', section: 'catalog', order: 39 },
    { id: 'c-31', title: 'spider man2', image: 'spider man2.jpeg', glow: 'glow-cyan', section: 'catalog', order: 40 },
    { id: 'c-32', title: 'Tekken7', image: 'Tekken7.jpeg', glow: 'glow-cyan', section: 'catalog', order: 41 },
    { id: 'c-33', title: 'The Crew Motorfest', image: 'The Crew Motorfest.jpeg', glow: 'glow-cyan', section: 'catalog', order: 42 },
    { id: 'c-34', title: 'WWE25', image: 'WWE25.jpeg', glow: 'glow-cyan', section: 'catalog', order: 43 },
    { id: 'c-35', title: 'Watch dogs Legion', image: 'Watch dogs Legion.jpeg', glow: 'glow-cyan', section: 'catalog', order: 44 },
    { id: 'c-36', title: 'Watch dogs2', image: 'Watch dogs2.jpeg', glow: 'glow-cyan', section: 'catalog', order: 45 },
    { id: 'c-37', title: 'The last of us 1', image: 'The last of us 1 Remastered.jpeg', glow: 'glow-cyan', section: 'catalog', order: 46 },
    { id: 'c-38', title: 'The last of us Part 2', image: 'The last of us Part 2.jpeg', glow: 'glow-cyan', section: 'catalog', order: 47 },
    { id: 'c-39', title: 'uncharted 4', image: "uncharted 4 a thief's end.jpeg", glow: 'glow-cyan', section: 'catalog', order: 48 },
    { id: 'c-40', title: 'Unchartted Collection', image: 'Unchartted Collection.jpeg', glow: 'glow-cyan', section: 'catalog', order: 49 },
    { id: 'c-41', title: 'Unchartted The Lost Legacy', image: 'Unchartted The Lost Legacy.jpeg', glow: 'glow-cyan', section: 'catalog', order: 50 },
    { id: 'c-42', title: 'Minecraft', image: 'Minecraft.jpeg', glow: 'glow-cyan', section: 'catalog', order: 51 }
  ];

  // Load games from localStorage or initialize with defaults
  const getStoredGames = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GAMES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing stored games:', e);
    }
    saveLocalGames(DEFAULT_GAMES);
    return DEFAULT_GAMES;
  };

  const saveLocalGames = (games) => {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
    } catch (e) {
      console.error('Error saving games to localStorage:', e);
    }
  };

  // Get Admin Password
  const getAdminPassword = () => {
    return localStorage.getItem(STORAGE_KEY_PWD) || DEFAULT_PASSWORD;
  };

  // Check Admin Login state
  const isAdminLoggedIn = () => {
    return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true' || localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  };

  const setAdminLoggedIn = (isLoggedIn, remember = true) => {
    if (isLoggedIn) {
      if (remember) {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      }
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
    }
    updateAdminUIState();
  };

  // ==========================================================================
  // 5. RENDER ENGINE FOR FEATURED & CATALOG GRIDS
  // ==========================================================================
  const featuredGrid = document.getElementById('featured-grid');
  const catalogGrid = document.getElementById('catalog-grid');

  const createCardElement = (game, isAdmin) => {
    const card = document.createElement('div');
    card.className = `featured-card scroll-reveal ${game.glow || 'glow-cyan'}`;
    card.dataset.id = game.id;

    // Generate WhatsApp link: use custom URL if specified, or auto-generate from title/message
    let waUrl = game.whatsappUrl || game.whatsappLink;
    if (waUrl && waUrl.trim()) {
      waUrl = waUrl.trim();
      if (!waUrl.startsWith('http://') && !waUrl.startsWith('https://')) {
        if (waUrl.startsWith('wa.me')) {
          waUrl = 'https://' + waUrl;
        } else if (/^\+?\d+$/.test(waUrl.replace(/[\s-]/g, ''))) {
          waUrl = `https://wa.me/${waUrl.replace(/[\s+-]/g, '')}?text=${encodeURIComponent('مرحباً ELMOHANDS، أريد طلب لعبة: ' + game.title)}`;
        } else {
          waUrl = 'https://' + waUrl;
        }
      }
    } else {
      const waText = game.whatsappMsg || `مرحباً ELMOHANDS، أريد طلب لعبة: ${game.title}`;
      waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    }

    // Image fallback handling
    const imgSrc = game.image || 'gta.jpeg';

    card.innerHTML = `
      ${isAdmin ? `
        <div class="admin-card-actions">
          <button class="admin-card-btn admin-card-edit-btn" data-id="${game.id}" title="تعديل بيانات اللعبة"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="admin-card-btn admin-card-delete-btn" data-id="${game.id}" data-title="${game.title}" title="حذف الكارد"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      ` : ''}
      <div class="card-image-wrap">
        <img src="${imgSrc}" alt="${game.title}" loading="lazy" decoding="async" onerror="this.src='gta.jpeg'" />
      </div>
      <div class="card-content">
        <h3 class="card-title">${game.title}</h3>
        <div class="card-footer-info">
          <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-block">
            <i class="fa-brands fa-whatsapp"></i> الذهاب إلى الواتس
          </a>
        </div>
      </div>
    `;

    return card;
  };

  const createAddPlaceholder = (section) => {
    const placeholder = document.createElement('div');
    placeholder.className = 'add-card-placeholder scroll-reveal';
    placeholder.dataset.section = section;
    placeholder.innerHTML = `
      <div class="placeholder-icon"><i class="fa-solid fa-plus"></i></div>
      <span class="placeholder-text">إضافة لعبة جديدة</span>
      <span class="placeholder-sub">${section === 'featured' ? 'في الألعاب المميزة' : 'في الكتالوج'}</span>
    `;
    placeholder.addEventListener('click', () => {
      openGameModal(null, section);
    });
    return placeholder;
  };

  const renderAllGrids = () => {
    const games = getStoredGames();
    const isAdmin = isAdminLoggedIn();

    // 1. Render Featured Grid
    if (featuredGrid) {
      featuredGrid.innerHTML = '';
      if (isAdmin) {
        featuredGrid.appendChild(createAddPlaceholder('featured'));
      }
      const featuredGames = games.filter(g => g.section === 'featured' || g.section === 'both');
      featuredGames.forEach(game => {
        featuredGrid.appendChild(createCardElement(game, isAdmin));
      });
    }

    // 2. Render Catalog Grid
    if (catalogGrid) {
      catalogGrid.innerHTML = '';
      if (isAdmin) {
        catalogGrid.appendChild(createAddPlaceholder('catalog'));
      }
      const catalogGames = games.filter(g => g.section === 'catalog' || g.section === 'both');
      catalogGames.forEach(game => {
        catalogGrid.appendChild(createCardElement(game, isAdmin));
      });
    }

    // Attach Admin Card Action Listeners
    if (isAdmin) {
      document.querySelectorAll('.admin-card-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const gameId = btn.dataset.id;
          const gameTitle = btn.dataset.title;
          openConfirmDeleteModal(gameId, gameTitle);
        });
      });

      document.querySelectorAll('.admin-card-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const gameId = btn.dataset.id;
          const game = games.find(g => g.id === gameId);
          if (game) {
            openGameModal(game);
          }
        });
      });
    }

    // Trigger animation observer on new cards
    triggerScrollReveal();
  };

  // ==========================================================================
  // 6. FIRESTORE REAL-TIME SYNCHRONIZATION
  // ==========================================================================
  const initFirebaseRealtimeSync = () => {
    if (!db) {
      console.log('Using local offline storage mode');
      return;
    }

    // 1. Realtime listener for all games
    db.collection('games').onSnapshot((snapshot) => {
      if (snapshot.empty) {
        console.log('Cloud database is empty. Seeding initial games library to Firestore cloud...');
        const batch = db.batch();
        DEFAULT_GAMES.forEach((game, index) => {
          const docRef = db.collection('games').doc(game.id);
          batch.set(docRef, { ...game, order: index });
        });
        batch.commit().catch(err => console.error('Cloud seed error:', err));
      } else {
        const cloudGames = [];
        snapshot.forEach(doc => {
          cloudGames.push({ id: doc.id, ...doc.data() });
        });
        // Sort by order or creation time
        cloudGames.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        saveLocalGames(cloudGames);
        renderAllGrids();
        console.log('⚡ Synchronized with Firebase cloud:', cloudGames.length, 'games');
      }
    }, (error) => {
      console.warn('Firestore realtime sync warning (using offline cache):', error);
    });

    // 2. Realtime listener for Admin Password
    db.collection('settings').doc('admin').onSnapshot((doc) => {
      if (doc.exists && doc.data().password) {
        localStorage.setItem(STORAGE_KEY_PWD, doc.data().password);
      }
    }, (err) => console.warn('Password sync warning:', err));
  };

  // ==========================================================================
  // 7. ADMIN UI STATE MANAGEMENT
  // ==========================================================================
  const adminTopBar = document.getElementById('admin-topbar');
  const adminLoginBtn = document.getElementById('admin-login-btn');

  const updateAdminUIState = () => {
    const isAdmin = isAdminLoggedIn();

    document.body.classList.toggle('admin-mode-active', isAdmin);

    if (adminTopBar) {
      adminTopBar.style.display = isAdmin ? 'block' : 'none';
    }

    if (adminLoginBtn) {
      if (isAdmin) {
        adminLoginBtn.classList.add('admin-logged-in');
        adminLoginBtn.innerHTML = '<i class="fa-solid fa-crown"></i> <span class="admin-btn-text">لوحة التحكم</span>';
      } else {
        adminLoginBtn.classList.remove('admin-logged-in');
        adminLoginBtn.innerHTML = '<i class="fa-solid fa-user-shield"></i> <span class="admin-btn-text">الإدارة</span>';
      }
    }

    renderAllGrids();
  };

  // ==========================================================================
  // 8. TOAST NOTIFICATIONS
  // ==========================================================================
  const toastEl = document.getElementById('gamer-toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');
  let toastTimeout = null;

  const showToast = (message, isError = false) => {
    if (!toastEl) return;
    if (toastTimeout) clearTimeout(toastTimeout);

    if (toastMsg) toastMsg.textContent = message;
    if (toastIcon) {
      toastIcon.className = isError ? 'toast-icon fa-solid fa-circle-exclamation' : 'toast-icon fa-solid fa-circle-check';
    }
    toastEl.querySelector('.toast-content')?.classList.toggle('toast-error', isError);

    toastEl.style.display = 'block';

    toastTimeout = setTimeout(() => {
      toastEl.style.display = 'none';
    }, 3200);
  };

  // ==========================================================================
  // 9. MODAL CONTROLS & EVENT LISTENERS
  // ==========================================================================

  // --- 9.1 Admin Login Modal ---
  const loginModal = document.getElementById('admin-login-modal');
  const loginModalClose = document.getElementById('login-modal-close');
  const loginForm = document.getElementById('admin-login-form');
  const pwdInput = document.getElementById('admin-password-input');
  const pwdToggleBtn = document.getElementById('toggle-password-visibility');
  const pwdEyeIcon = document.getElementById('pwd-eye-icon');
  const loginErrorMsg = document.getElementById('login-error-msg');

  adminLoginBtn?.addEventListener('click', () => {
    if (isAdminLoggedIn()) {
      showToast('👑 أنت مسجل الدخول كـ أدمن بالفعل!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
      if (pwdInput) pwdInput.value = '';
      if (loginModal) loginModal.style.display = 'flex';
      pwdInput?.focus();
    }
  });

  loginModalClose?.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
  });

  loginModal?.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
  });

  pwdToggleBtn?.addEventListener('click', () => {
    if (pwdInput) {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      pwdEyeIcon?.classList.toggle('fa-eye', !isPwd);
      pwdEyeIcon?.classList.toggle('fa-eye-slash', isPwd);
    }
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = pwdInput?.value || '';
    const currentPass = getAdminPassword();

    if (entered === currentPass) {
      setAdminLoggedIn(true);
      if (loginModal) loginModal.style.display = 'none';
      showToast('تم تسجيل الدخول بنجاح! وضع الأدمن مفعل 👑');
    } else {
      if (loginErrorMsg) {
        loginErrorMsg.textContent = 'كلمة المرور غير صحيحة! يرجى المحاولة مرة أخرى.';
        loginErrorMsg.style.display = 'block';
      }
      pwdInput?.classList.add('input-error');
      setTimeout(() => pwdInput?.classList.remove('input-error'), 1000);
    }
  });

  // Logout button
  document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
    setAdminLoggedIn(false);
    showToast('تم تسجيل الخروج بنجاح 👋');
  });

  // --- 9.2 Add / Edit Game Modal ---
  const gameModal = document.getElementById('admin-game-modal');
  const gameModalClose = document.getElementById('game-modal-close');
  const cancelGameBtn = document.getElementById('cancel-game-btn');
  const gameForm = document.getElementById('admin-game-form');
  const gameModalTitle = document.getElementById('game-modal-title');
  const editGameId = document.getElementById('edit-game-id');
  const gameTitleInput = document.getElementById('game-title-input');
  const gameSectionInput = document.getElementById('game-section-input');
  const gameGlowInput = document.getElementById('game-glow-input');
  const gameImageFile = document.getElementById('game-image-file');
  const gameImageUrl = document.getElementById('game-image-url');
  const gameWhatsappUrl = document.getElementById('game-whatsapp-url');
  const imgPreviewContainer = document.getElementById('image-preview-container');
  const imgPreviewImg = document.getElementById('image-preview-img');
  const clearImgBtn = document.getElementById('clear-image-btn');
  let currentUploadedBase64 = '';

  const setPreviewImage = (src) => {
    if (src && imgPreviewImg && imgPreviewContainer) {
      imgPreviewImg.src = src;
      imgPreviewContainer.style.display = 'block';
    } else if (imgPreviewContainer) {
      imgPreviewContainer.style.display = 'none';
      if (imgPreviewImg) imgPreviewImg.src = '';
    }
  };

  // Open Game Modal for Add or Edit
  const openGameModal = (gameToEdit = null, defaultSection = 'catalog') => {
    currentUploadedBase64 = '';
    if (gameImageFile) gameImageFile.value = '';

    if (gameToEdit) {
      if (gameModalTitle) gameModalTitle.textContent = 'تعديل كارد لعبة';
      if (editGameId) editGameId.value = gameToEdit.id;
      if (gameTitleInput) gameTitleInput.value = gameToEdit.title || '';
      if (gameSectionInput) gameSectionInput.value = gameToEdit.section || 'catalog';
      if (gameGlowInput) gameGlowInput.value = gameToEdit.glow || 'glow-cyan';
      if (gameImageUrl) gameImageUrl.value = gameToEdit.image && !gameToEdit.image.startsWith('data:') ? gameToEdit.image : '';
      if (gameWhatsappUrl) gameWhatsappUrl.value = gameToEdit.whatsappUrl || gameToEdit.whatsappLink || '';
      setPreviewImage(gameToEdit.image || '');
    } else {
      if (gameModalTitle) gameModalTitle.textContent = 'إضافة كارد لعبة جديد';
      if (editGameId) editGameId.value = '';
      if (gameTitleInput) gameTitleInput.value = '';
      if (gameSectionInput) gameSectionInput.value = defaultSection;
      if (gameGlowInput) gameGlowInput.value = 'glow-cyan';
      if (gameImageUrl) gameImageUrl.value = '';
      if (gameWhatsappUrl) gameWhatsappUrl.value = '';
      setPreviewImage('');
    }

    if (gameModal) gameModal.style.display = 'flex';
    gameTitleInput?.focus();
  };

  document.getElementById('btn-add-game-top')?.addEventListener('click', () => {
    openGameModal();
  });

  gameModalClose?.addEventListener('click', () => {
    if (gameModal) gameModal.style.display = 'none';
  });

  cancelGameBtn?.addEventListener('click', () => {
    if (gameModal) gameModal.style.display = 'none';
  });

  gameModal?.addEventListener('click', (e) => {
    if (e.target === gameModal) gameModal.style.display = 'none';
  });

  // Handle local image file upload & convert to Base64
  gameImageFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('حجم الصورة كبير، يفضل اختيار صورة أصغر من 2 ميجابايت للمزامنة السحابية السريعة', true);
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        currentUploadedBase64 = event.target?.result;
        setPreviewImage(currentUploadedBase64);
        if (gameImageUrl) gameImageUrl.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle image URL typed
  gameImageUrl?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      currentUploadedBase64 = '';
      if (gameImageFile) gameImageFile.value = '';
      setPreviewImage(val);
    } else if (!currentUploadedBase64) {
      setPreviewImage('');
    }
  });

  // Clear preview
  clearImgBtn?.addEventListener('click', () => {
    currentUploadedBase64 = '';
    if (gameImageFile) gameImageFile.value = '';
    if (gameImageUrl) gameImageUrl.value = '';
    setPreviewImage('');
  });

  // Save Game (Add or Update) with Cloud Sync
  gameForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = gameTitleInput?.value.trim();
    if (!title) {
      showToast('يرجى كتابة اسم اللعبة!', true);
      return;
    }

    const finalImage = currentUploadedBase64 || gameImageUrl?.value.trim() || 'gta.jpeg';
    const section = gameSectionInput?.value || 'catalog';
    const glow = gameGlowInput?.value || 'glow-cyan';
    const rawWa = gameWhatsappUrl?.value.trim() || '';
    const whatsappUrl = rawWa;
    const whatsappMsg = `مرحباً ELMOHANDS، أريد طلب لعبة: ${title}`;
    const editingId = editGameId?.value;

    const games = getStoredGames();

    if (editingId) {
      // Update existing game
      const idx = games.findIndex(g => g.id === editingId);
      const updatedGame = {
        title,
        image: finalImage,
        section,
        glow,
        whatsappUrl,
        whatsappLink: whatsappUrl,
        whatsappMsg,
        updatedAt: new Date().toISOString()
      };

      if (idx !== -1) {
        games[idx] = { ...games[idx], ...updatedGame };
        saveLocalGames(games);
      }

      // Sync to Firebase Firestore
      if (db) {
        db.collection('games').doc(editingId).set(updatedGame, { merge: true })
          .then(() => showToast(`تم تعديل كارد "${title}" وتحديثه على جميع الأجهزة! ☁️`))
          .catch((err) => {
            console.error('Firebase update error:', err);
            showToast(`تم التعديل محلياً`, false);
          });
      } else {
        showToast(`تم تعديل كارد "${title}" بنجاح ✨`);
      }
    } else {
      // Add new game (order = -timestamp so it appears first)
      const newGame = {
        id: 'game_' + Date.now(),
        title,
        image: finalImage,
        section,
        glow,
        whatsappUrl,
        whatsappLink: whatsappUrl,
        whatsappMsg,
        order: -Date.now(),
        createdAt: new Date().toISOString()
      };

      games.unshift(newGame);
      saveLocalGames(games);

      // Sync to Firebase Firestore
      if (db) {
        db.collection('games').doc(newGame.id).set(newGame)
          .then(() => showToast(`تمت إضافة "${title}" ونشرها على جميع الأجهزة! 🎮☁️`))
          .catch((err) => {
            console.error('Firebase create error:', err);
            showToast(`تمت الإضافة محلياً`, false);
          });
      } else {
        showToast(`تمت إضافة كارد "${title}" بنجاح! 🎮`);
      }
    }

    if (gameModal) gameModal.style.display = 'none';
    renderAllGrids();
  });

  // --- 9.3 Delete Confirmation Modal with Cloud Sync ---
  const confirmModal = document.getElementById('admin-confirm-modal');
  const confirmDeleteText = document.getElementById('confirm-delete-text');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  let gameIdToDelete = null;

  const openConfirmDeleteModal = (gameId, gameTitle) => {
    gameIdToDelete = gameId;
    if (confirmDeleteText) {
      confirmDeleteText.textContent = `هل أنت متأكد من رغبتك في حذف لعبة "${gameTitle}"؟`;
    }
    if (confirmModal) confirmModal.style.display = 'flex';
  };

  btnCancelDelete?.addEventListener('click', () => {
    if (confirmModal) confirmModal.style.display = 'none';
    gameIdToDelete = null;
  });

  confirmModal?.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      confirmModal.style.display = 'none';
      gameIdToDelete = null;
    }
  });

  btnConfirmDelete?.addEventListener('click', () => {
    if (gameIdToDelete) {
      let games = getStoredGames();
      const target = games.find(g => g.id === gameIdToDelete);
      const title = target ? target.title : 'الكارد';

      games = games.filter(g => g.id !== gameIdToDelete);
      saveLocalGames(games);

      // Delete from Firebase Firestore
      if (db) {
        db.collection('games').doc(gameIdToDelete).delete()
          .then(() => showToast(`تم حذف "${title}" من جميع الأجهزة! 🗑️☁️`))
          .catch((err) => {
            console.error('Firebase delete error:', err);
            showToast(`تم الحذف محلياً`, false);
          });
      } else {
        showToast(`تم حذف "${title}" بنجاح 🗑️`);
      }

      if (confirmModal) confirmModal.style.display = 'none';
      gameIdToDelete = null;
      renderAllGrids();
    }
  });

  // --- 9.4 Change Password Modal with Cloud Sync ---
  const pwdModal = document.getElementById('admin-password-modal');
  const pwdModalClose = document.getElementById('pwd-modal-close');
  const pwdForm = document.getElementById('admin-password-form');
  const oldPwdInput = document.getElementById('old-password-input');
  const newPwdInput = document.getElementById('new-password-input');
  const confirmNewPwdInput = document.getElementById('confirm-new-password-input');
  const pwdChangeError = document.getElementById('pwd-change-error');
  const pwdChangeSuccess = document.getElementById('pwd-change-success');

  document.getElementById('btn-change-password-top')?.addEventListener('click', () => {
    if (oldPwdInput) oldPwdInput.value = '';
    if (newPwdInput) newPwdInput.value = '';
    if (confirmNewPwdInput) confirmNewPwdInput.value = '';
    if (pwdChangeError) pwdChangeError.style.display = 'none';
    if (pwdChangeSuccess) pwdChangeSuccess.style.display = 'none';
    if (pwdModal) pwdModal.style.display = 'flex';
    oldPwdInput?.focus();
  });

  pwdModalClose?.addEventListener('click', () => {
    if (pwdModal) pwdModal.style.display = 'none';
  });

  pwdModal?.addEventListener('click', (e) => {
    if (e.target === pwdModal) pwdModal.style.display = 'none';
  });

  pwdForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldVal = oldPwdInput?.value || '';
    const newVal = newPwdInput?.value || '';
    const confirmVal = confirmNewPwdInput?.value || '';
    const currentPass = getAdminPassword();

    if (oldVal !== currentPass) {
      if (pwdChangeError) {
        pwdChangeError.textContent = 'كلمة المرور الحالية غير صحيحة!';
        pwdChangeError.style.display = 'block';
      }
      return;
    }

    if (newVal.length < 4) {
      if (pwdChangeError) {
        pwdChangeError.textContent = 'كلمة المرور الجديدة يجب أن تكون 4 أحرف أو أرقام على الأقل!';
        pwdChangeError.style.display = 'block';
      }
      return;
    }

    if (newVal !== confirmVal) {
      if (pwdChangeError) {
        pwdChangeError.textContent = 'كلمتا المرور غير متطابقتين!';
        pwdChangeError.style.display = 'block';
      }
      return;
    }

    // Save new password locally & to Firebase Cloud
    localStorage.setItem(STORAGE_KEY_PWD, newVal);
    if (db) {
      db.collection('settings').doc('admin').set({ password: newVal }, { merge: true })
        .then(() => console.log('Password synced to cloud'))
        .catch(err => console.error('Cloud password error:', err));
    }

    if (pwdChangeError) pwdChangeError.style.display = 'none';
    if (pwdChangeSuccess) {
      pwdChangeSuccess.textContent = 'تم تغيير كلمة المرور وتحديثها على السحابة بنجاح!';
      pwdChangeSuccess.style.display = 'block';
    }

    showToast('تم تحديث كلمة مرور الأدمن سحابياً 🔑☁️');
    setTimeout(() => {
      if (pwdModal) pwdModal.style.display = 'none';
    }, 1200);
  });

  // --- 9.5 Reset to Defaults with Cloud Sync ---
  document.getElementById('btn-reset-games-top')?.addEventListener('click', () => {
    if (confirm('هل أنت متأكد من رغبتك في استعادة قائمة الألعاب الأصلية ومزامنتها على جميع الأجهزة؟')) {
      saveLocalGames(DEFAULT_GAMES);
      renderAllGrids();
      showToast('تمت استعادة الألعاب الافتراضية محلياً 🔄');

      if (db) {
        db.collection('games').get().then((snapshot) => {
          const batch = db.batch();
          snapshot.forEach(doc => batch.delete(doc.ref));
          DEFAULT_GAMES.forEach((game, index) => {
            const docRef = db.collection('games').doc(game.id);
            batch.set(docRef, { ...game, order: index });
          });
          return batch.commit();
        }).then(() => {
          showToast('تمت مزامنة الألعاب الافتراضية على السحابة لجميع الأجهزة ☁️');
        }).catch((err) => {
          console.error('Cloud reset error:', err);
        });
      }
    }
  });

  // ==========================================================================
  // 10. INITIALIZATION & REALTIME START
  // ==========================================================================
  updateAdminUIState();
  initFirebaseRealtimeSync();
});


