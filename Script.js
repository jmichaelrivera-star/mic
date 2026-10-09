/* =========================================================
   ANDREA CRUZ — VIRTUAL ASSISTANT PORTFOLIO
   Vanilla JavaScript (no frameworks, no libraries)
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =========================================================
     1. THEME (light / dark) — persisted in localStorage
     ========================================================= */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");

  const getStoredTheme = () => {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  };

  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* ignore */
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0c0c16" : "#6d5efc");
  };

  // Initial theme: stored → system preference → light
  const stored = getStoredTheme();
  if (stored) {
    setTheme(stored);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setTheme("dark");
  }

  themeToggle?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(current === "dark" ? "light" : "dark");
  });

  /* =========================================================
     2. MOBILE NAV
     ========================================================= */
  const navMenu = $("#navMenu");
  const navToggle = $("#navToggle");
  const navOverlay = $("#navOverlay");

  const openNav = () => {
    navMenu.classList.add("is-open");
    navToggle.classList.add("is-open");
    navOverlay.classList.add("is-visible");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  };

  const closeNav = () => {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navOverlay.classList.remove("is-visible");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  };

  navToggle?.addEventListener("click", () => {
    navMenu.classList.contains("is-open") ? closeNav() : openNav();
  });

  navOverlay?.addEventListener("click", closeNav);

  // Close when a link is clicked
  $$(".nav__link, .nav__cta").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  // Close on resize to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeNav();
  });

  /* =========================================================
     3. HEADER SCROLL STATE + SCROLL PROGRESS
     ========================================================= */
  const header = $("#header");
  const progressBar = $("#scrollProgress");
  const backToTop = $("#backToTop");

  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = progress + "%";

    header?.classList.toggle("is-scrolled", scrollTop > 20);
    backToTop?.classList.toggle("is-visible", scrollTop > 500);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* =========================================================
     4. TYPED TEXT EFFECT (hero subtitle)
     ========================================================= */
  const typedEl = $("#typed");
  const phrases = [
    "Virtual Assistant",
    "Inbox Zero Specialist",
    "Calendar Ninja",
    "Systems Builder",
    "Social Media Manager",
  ];

  if (typedEl) {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeLoop = () => {
      const current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(typeLoop, 1600);
        }
        return setTimeout(typeLoop, 70);
      } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          return setTimeout(typeLoop, 350);
        }
        return setTimeout(typeLoop, 40);
      }
    };

    setTimeout(typeLoop, 600);
  }

  /* =========================================================
     5. SCROLL REVEAL (IntersectionObserver)
     ========================================================= */
  const revealEls = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     6. ANIMATED COUNTERS (about stats)
     ========================================================= */
  const counters = $$(".stat-card__num");

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    };

    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => counterObserver.observe(c));
  } else {
    counters.forEach((c) => {
      c.textContent =
        parseInt(c.dataset.count || "0", 10).toLocaleString() +
        (c.dataset.suffix || "");
    });
  }

  /* =========================================================
     7. SKILL BARS
     ========================================================= */
  const skillBars = $("#skillBars");

  const fillSkills = () => {
    $$(".skill__fill", skillBars).forEach((fill) => {
      const level = fill.dataset.level || "0";
      fill.style.width = level + "%";
    });
  };

  if (skillBars && "IntersectionObserver" in window) {
    const skillObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fillSkills();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    skillObserver.observe(skillBars);
  } else if (skillBars) {
    fillSkills();
  }

  /* =========================================================
     8. PORTFOLIO FILTER
     ========================================================= */
  const filterBtns = $$(".filter");
  const workCards = $$(".work-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;

      workCards.forEach((card) => {
        const category = card.dataset.category;
        const show = filter === "all" || category === filter;

        if (show) {
          card.classList.remove("is-hidden");
          // Re-trigger a subtle fade
          card.style.animation = "none";
          void card.offsetWidth;
          card.style.animation = "fadeInUp 0.5s var(--ease) both";
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  // Inject keyframes for filter animation (once)
  if (!document.getElementById("filterKeyframes")) {
    const style = document.createElement("style");
    style.id = "filterKeyframes";
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  /* =========================================================
     9. TESTIMONIAL SLIDER
     ========================================================= */
  const track = $("#testimonialTrack");
  const dotsWrap = $("#testimonialDots");

  if (track && dotsWrap) {
    const slides = $$(".testimonial", track);
    let current = 0;
    let autoPlayTimer = null;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = $$("button", dotsWrap);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
      restartAutoPlay();
    }

    function next() {
      goTo(current + 1);
    }

    function startAutoPlay() {
      autoPlayTimer = setInterval(next, 6000);
    }

    function restartAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    // Pause on hover / focus
    track.addEventListener("mouseenter", () => clearInterval(autoPlayTimer));
    track.addEventListener("mouseleave", startAutoPlay);

    // Touch swipe support
    let touchStartX = 0;
    track.addEventListener(
      "touchstart",
      (e) => (touchStartX = e.changedTouches[0].clientX),
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 50) {
          delta < 0 ? goTo(current + 1) : goTo(current - 1);
        }
      },
      { passive: true }
    );

    startAutoPlay();
  }

  /* =========================================================
     10. CONTACT FORM VALIDATION
     ========================================================= */
  const form = $("#contactForm");
  const formStatus = $("#formStatus");

  if (form) {
    const fields = {
      name: { el: $("#name"), message: "Please enter your name." },
      email: {
        el: $("#email"),
        message: "Please enter a valid email address.",
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      },
      service: { el: $("#service"), message: "Please select a service." },
      message: {
        el: $("#message"),
        message: "Please tell me a bit about your project.",
        validate: (v) => v.trim().length >= 10,
      },
    };

    const setError = (el, msg) => {
      const field = el.closest(".field");
      const errorEl = field?.querySelector(".field__error");
      if (msg) {
        field?.classList.add("has-error");
        if (errorEl) errorEl.textContent = msg;
      } else {
        field?.classList.remove("has-error");
        if (errorEl) errorEl.textContent = "";
      }
    };

    const validateField = (key) => {
      const { el, message, validate } = fields[key];
      if (!el) return true;
      const value = el.value.trim();

      if (!value) {
        setError(el, message);
        return false;
      }
      if (validate && !validate(value)) {
        setError(el, message);
        return false;
      }
      setError(el, "");
      return true;
    };

    // Live validation on blur / input
    Object.keys(fields).forEach((key) => {
      const el = fields[key].el;
      if (!el) return;
      el.addEventListener("blur", () => validateField(key));
      el.addEventListener("input", () => {
        if (el.closest(".field")?.classList.contains("has-error")) {
          validateField(key);
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const results = Object.keys(fields).map((key) => validateField(key));
      const allValid = results.every(Boolean);

      if (!allValid) {
        const firstError = form.querySelector(".field.has-error input, .field.has-error select, .field.has-error textarea");
        firstError?.focus();
        formStatus.textContent = "Please fix the highlighted fields.";
        formStatus.style.color = "#ef4444";
        return;
      }

      // Simulate submission
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending…";
      formStatus.textContent = "";
      formStatus.style.color = "";

      setTimeout(() => {
        formStatus.textContent = "✓ Thanks! Your message has been sent. I'll reply within 24 hours.";
        formStatus.style.color = "#22c55e";
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();

        // Clear success message after a while
        setTimeout(() => {
          formStatus.textContent = "";
        }, 6000);
      }, 1200);
    });
  }

  /* =========================================================
     11. ACTIVE NAV LINK ON SCROLL (scroll spy)
     ========================================================= */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link");

  const spy = () => {
    const scrollPos = window.scrollY + 120;
    let activeId = "";

    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === "#" + activeId
      );
    });
  };

  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* =========================================================
     12. FOOTER YEAR
     ========================================================= */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     13. SMOOTH SCROLL FALLBACK (older browsers)
     ========================================================= */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId === "#" || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerOffset = header ? header.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerOffset + 1;

      window.scrollTo({ top, behavior: "smooth" });
      history.pushState(null, "", targetId);
    });
  });
})();