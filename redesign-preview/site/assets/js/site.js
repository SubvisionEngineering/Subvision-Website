(() => {
  const THEME_VARIABLES = [
    "--bg",
    "--bg-deep",
    "--bg-lower",
    "--bg-panel",
    "--bg-panel-strong",
    "--accent",
    "--accent-bright",
    "--accent-soft",
    "--bg-glow-top-left",
    "--bg-glow-top-right",
    "--bg-glow-bottom",
    "--bg-gradient-start",
    "--bg-gradient-mid",
    "--bg-gradient-late",
    "--bg-gradient-end",
    "--bg-overlay-top",
    "--bg-overlay-bottom",
  ];

  const EDITABLE_SELECTORS = [
    { selector: ".page-title", type: "text", prefix: "page-title" },
    { selector: ".lede", type: "text", prefix: "lede" },
    { selector: ".button-row", type: "button-group", prefix: "button-row" },
    { selector: ".button-row .button", type: "text", prefix: "button" },
    { selector: ".hero-signal-list", type: "block", prefix: "signal-list" },
    { selector: ".hero-signal-list span", type: "text", prefix: "signal" },
    { selector: ".proof-strip li", type: "block", prefix: "proof-card" },
    { selector: ".proof-strip li strong", type: "text", prefix: "proof-value" },
    { selector: ".proof-strip li span", type: "text", prefix: "proof-copy" },
    { selector: ".support-band", type: "block", prefix: "support-band" },
    { selector: ".support-band strong", type: "text", prefix: "support-title" },
    { selector: ".support-band p:not(.section-kicker)", type: "text", prefix: "support-copy" },
    { selector: ".media-card", type: "media", prefix: "media-card" },
    { selector: ".media-caption", type: "text", prefix: "media-caption" },
    { selector: ".feature-image", type: "media", prefix: "feature-image" },
    { selector: ".section-heading", type: "block", prefix: "section-heading" },
    { selector: ".section-kicker", type: "text", prefix: "section-kicker" },
    { selector: ".section-title", type: "text", prefix: "section-title" },
    { selector: ".section-copy p", type: "text", prefix: "section-copy" },
    { selector: ".card", type: "block", prefix: "card" },
    { selector: ".card h3", type: "text", prefix: "card-title" },
    { selector: ".card p", type: "text", prefix: "card-copy" },
    { selector: ".journey-stop", type: "block", prefix: "journey-stop" },
    { selector: ".journey-stop__title", type: "text", prefix: "journey-title" },
    { selector: ".journey-stop__copy", type: "text", prefix: "journey-copy" },
    { selector: ".metric-card", type: "block", prefix: "metric-card" },
    { selector: ".metric-number", type: "text", prefix: "metric-value" },
    { selector: ".metric-label", type: "text", prefix: "metric-copy" },
    { selector: ".partner-card", type: "block", prefix: "partner-card" },
    { selector: ".partner-meta", type: "text", prefix: "partner-meta" },
    { selector: ".partner-card h3", type: "text", prefix: "partner-title" },
    { selector: ".partner-card p", type: "text", prefix: "partner-copy" },
    { selector: ".issue-card", type: "block", prefix: "issue-card" },
    { selector: ".issue-card__metric", type: "text", prefix: "issue-metric" },
    { selector: ".issue-card__hint", type: "text", prefix: "issue-hint" },
    { selector: ".issue-card h3", type: "text", prefix: "issue-title" },
    { selector: ".issue-card__body p", type: "text", prefix: "issue-copy" },
    { selector: ".contact-card", type: "block", prefix: "contact-card" },
    { selector: ".contact-card h3", type: "text", prefix: "contact-title" },
    { selector: ".contact-card p", type: "text", prefix: "contact-copy" },
    { selector: ".contact-link", type: "text", prefix: "contact-link" },
    { selector: ".cta-shell", type: "block", prefix: "cta-shell" },
    { selector: ".cta-title", type: "text", prefix: "cta-title" },
    { selector: ".cta-shell p:not(.section-kicker)", type: "text", prefix: "cta-copy" },
    { selector: ".cluster-card", type: "block", prefix: "cluster-card" },
    { selector: ".cluster-title", type: "text", prefix: "cluster-title" },
    { selector: ".cluster-header p", type: "text", prefix: "cluster-copy" },
    { selector: ".cluster-person", type: "block", prefix: "cluster-person" },
    { selector: ".leader-name", type: "text", prefix: "leader-name" },
    { selector: ".cluster-role", type: "text", prefix: "leader-role" },
    { selector: ".cluster-person p:not(.cluster-role)", type: "text", prefix: "leader-copy" },
    { selector: ".quote-card", type: "block", prefix: "quote-card" },
    { selector: ".quote-card h3", type: "text", prefix: "quote-title" },
    { selector: ".quote-card p", type: "text", prefix: "quote-copy" },
  ];

  const originalElementState = new WeakMap();
  const layoutState = {
    overrides: null,
    resizeTimer: null,
  };

  const getCurrentPageKey = (win = window) => {
    const pathname = win.location.pathname.split("/").pop() || "index.html";
    return pathname === "" ? "index.html" : pathname;
  };

  const getPageSlug = (pageKey = getCurrentPageKey()) =>
    pageKey.replace(/\.html$/i, "").replace(/[^a-z0-9]+/gi, "-") || "page";

  const getBreakpointName = (width = window.innerWidth) => {
    if (width <= 767) return "mobile";
    if (width <= 1100) return "tablet";
    return "desktop";
  };

  const formatCssValue = (property, value) => {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "number") {
      if (property === "lineHeight") return String(value);
      return `${value}px`;
    }
    if (/^-?\d+(\.\d+)?$/.test(String(value).trim())) {
      if (property === "lineHeight") return String(value).trim();
      return `${String(value).trim()}px`;
    }
    return String(value).trim();
  };

  const assignAutoEditHooks = (doc = document) => {
    const pageSlug = getPageSlug(doc.defaultView ? getCurrentPageKey(doc.defaultView) : getCurrentPageKey());

    EDITABLE_SELECTORS.forEach(({ selector, type, prefix }) => {
      const nodes = Array.from(doc.querySelectorAll(selector));
      nodes.forEach((node, index) => {
        if (!node.dataset.editId) {
          node.dataset.editId = `${pageSlug}-${prefix}-${index + 1}`;
        }
        if (!node.dataset.editType) {
          node.dataset.editType = type;
        }
      });
    });
  };

  const captureOriginalState = (element) => {
    if (originalElementState.has(element)) return;
    originalElementState.set(element, {
      styleText: element.getAttribute("style") || "",
      textContent: element.dataset.editType === "text" ? element.textContent : null,
    });
  };

  const resetEditableElement = (element) => {
    const original = originalElementState.get(element);
    if (!original) return;

    if (original.styleText) {
      element.setAttribute("style", original.styleText);
    } else {
      element.removeAttribute("style");
    }

    if (original.textContent !== null) {
      element.textContent = original.textContent;
    }
  };

  const resetAllEditableElements = (doc = document) => {
    Array.from(doc.querySelectorAll("[data-edit-id]")).forEach((element) => {
      captureOriginalState(element);
      resetEditableElement(element);
    });
  };

  const applyThemeOverrides = (doc = document, themeOverrides = {}) => {
    const root = doc.documentElement;
    THEME_VARIABLES.forEach((variable) => {
      root.style.removeProperty(variable);
    });

    Object.entries(themeOverrides || {}).forEach(([variable, value]) => {
      if (!THEME_VARIABLES.includes(variable)) return;
      if (value === null || value === undefined || value === "") return;
      root.style.setProperty(variable, String(value).trim());
    });
  };

  const applyElementOverride = (element, override) => {
    if (!element || !override) return;
    captureOriginalState(element);
    resetEditableElement(element);

    if (override.hidden === true) {
      element.style.display = "none";
      return;
    }

    if (element.dataset.editType === "text" && typeof override.text === "string") {
      element.textContent = override.text;
    }

    const styleMap = {
      width: "width",
      maxWidth: "maxWidth",
      minHeight: "minHeight",
      padding: "padding",
      gap: "gap",
      fontSize: "fontSize",
      lineHeight: "lineHeight",
      align: "textAlign",
      textAlign: "textAlign",
    };

    Object.entries(styleMap).forEach(([overrideKey, styleKey]) => {
      if (override[overrideKey] === undefined || override[overrideKey] === null || override[overrideKey] === "") return;
      element.style[styleKey] = formatCssValue(styleKey, override[overrideKey]);
    });

    const hasOffsetX = override.x !== undefined && override.x !== null && override.x !== "";
    const hasOffsetY = override.y !== undefined && override.y !== null && override.y !== "";
    if (hasOffsetX || hasOffsetY) {
      element.style.position = "relative";
      if (hasOffsetX) element.style.left = formatCssValue("left", override.x);
      if (hasOffsetY) element.style.top = formatCssValue("top", override.y);
    }
  };

  const getMergedPageOverrides = (overrides, pageKey, breakpoint) => {
    const pageOverrides = overrides && overrides.pages ? overrides.pages[pageKey] || {} : {};
    const merged = {};
    const mergeBlock = (block) => {
      Object.entries(block || {}).forEach(([editId, config]) => {
        merged[editId] = { ...(merged[editId] || {}), ...config };
      });
    };

    mergeBlock(pageOverrides.desktop);
    if (breakpoint === "tablet" || breakpoint === "mobile") {
      mergeBlock(pageOverrides.tablet);
    }
    if (breakpoint === "mobile") {
      mergeBlock(pageOverrides.mobile);
    }

    return merged;
  };

  const applyPageLayoutOverrides = ({
    overrides = layoutState.overrides,
    doc = document,
    pageKey = getCurrentPageKey(doc.defaultView || window),
    breakpoint = getBreakpointName((doc.defaultView || window).innerWidth),
  } = {}) => {
    assignAutoEditHooks(doc);
    resetAllEditableElements(doc);
    applyThemeOverrides(doc, overrides && overrides.theme ? overrides.theme : {});
    if (!overrides) return;

    const merged = getMergedPageOverrides(overrides, pageKey, breakpoint);
    Object.entries(merged).forEach(([editId, config]) => {
      const target = Array.from(doc.querySelectorAll("[data-edit-id]")).find((element) => element.dataset.editId === editId);
      if (target) {
        applyElementOverride(target, config);
      }
    });
  };

  const setLayoutOverrides = (nextOverrides) => {
    layoutState.overrides = nextOverrides;
    applyPageLayoutOverrides();
  };

  const loadLayoutOverrides = async () => {
    assignAutoEditHooks(document);

    try {
      const response = await fetch("assets/data/layout-overrides.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load overrides: ${response.status}`);
      layoutState.overrides = await response.json();
    } catch (error) {
      layoutState.overrides = { pages: {} };
      console.warn("[SubvisionLayout] Falling back to empty overrides.", error);
    }

    applyPageLayoutOverrides();
  };

  const registerResizeReapply = () => {
    window.addEventListener("resize", () => {
      if (layoutState.resizeTimer) {
        window.clearTimeout(layoutState.resizeTimer);
      }

      layoutState.resizeTimer = window.setTimeout(() => {
        applyPageLayoutOverrides();
      }, 120);
    });
  };

  window.SubvisionLayout = {
    assignAutoEditHooks,
    applyPageLayoutOverrides,
    getBreakpointName,
    getCurrentPageKey,
    getMergedPageOverrides,
    loadLayoutOverrides,
    setLayoutOverrides,
    getThemeVariables: () => [...THEME_VARIABLES],
    getLayoutOverrides: () => layoutState.overrides,
  };

  loadLayoutOverrides();
  registerResizeReapply();

  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu = () => {
    if (!header || !menuToggle) return;
    header.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (menuToggle && header) {
    menuToggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const syncHeaderState = () => {
    if (!header) return;
    header.classList.toggle("site-header--scrolled", window.scrollY > 8);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });

  const revealItems = Array.from(document.querySelectorAll(".reveal, .stagger"));
  const revealIfInViewport = (item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      item.classList.add("revealed");
      return true;
    }
    return false;
  };

  if (reducedMotion) {
    revealItems.forEach((item) => item.classList.add("revealed"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.22,
        rootMargin: "0px 0px -84px 0px",
      },
    );

    revealItems.forEach((item) => {
      if (!revealIfInViewport(item)) {
        observer.observe(item);
      }
    });
  } else {
    revealItems.forEach((item) => revealIfInViewport(item) || item.classList.add("revealed"));
  }

  const autoplayVideos = Array.from(document.querySelectorAll("[data-autoplay-video]"));
  const attemptPlay = (video) => {
    const shouldMute = video.dataset.userUnmuted !== "true";
    video.muted = shouldMute;
    video.defaultMuted = shouldMute;
    video.loop = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  autoplayVideos.forEach((video) => {
    if (reducedMotion) {
      video.pause();
      return;
    }

    attemptPlay(video);
    video.addEventListener("loadeddata", () => attemptPlay(video), { once: true });
  });

  document.addEventListener("visibilitychange", () => {
    autoplayVideos.forEach((video) => {
      if (document.hidden) {
        video.pause();
        return;
      }

      if (!video.dataset.userPaused && !reducedMotion) {
        attemptPlay(video);
      }
    });
  });

  document.querySelectorAll("[data-video-toggle]").forEach((button) => {
    const card = button.closest(".media-card");
    const video = card ? card.querySelector("video") : null;
    if (!video) return;

    const syncLabel = () => {
      const paused = video.paused;
      button.textContent = paused ? "Play video" : "Pause video";
      button.setAttribute("aria-label", paused ? "Play video" : "Pause video");
    };

    button.addEventListener("click", () => {
      if (video.paused) {
        video.dataset.userPaused = "";
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        video.dataset.userPaused = "true";
        video.pause();
      }
      syncLabel();
    });

    video.addEventListener("play", syncLabel);
    video.addEventListener("pause", syncLabel);
    syncLabel();
  });

  const audioButtons = Array.from(document.querySelectorAll("[data-audio-toggle]"));
  const syncAudioButton = (button, video) => {
    const audioOn = !video.muted;
    button.textContent = audioOn ? "Audio on" : "Audio off";
    button.setAttribute("aria-label", audioOn ? "Mute audio" : "Enable audio");
  };

  const muteOtherAudioVideos = (currentVideo) => {
    audioButtons.forEach((otherButton) => {
      const otherCard = otherButton.closest(".media-card");
      const otherVideo = otherCard ? otherCard.querySelector("video") : null;
      if (!otherVideo || otherVideo === currentVideo) return;

      otherVideo.dataset.userUnmuted = "";
      otherVideo.muted = true;
      otherVideo.defaultMuted = true;
      syncAudioButton(otherButton, otherVideo);
    });
  };

  audioButtons.forEach((button) => {
    const card = button.closest(".media-card");
    const video = card ? card.querySelector("video") : null;
    if (!video) return;

    button.addEventListener("click", () => {
      const audioCurrentlyOn = !video.muted;
      if (audioCurrentlyOn) {
        video.dataset.userUnmuted = "";
        video.muted = true;
        video.defaultMuted = true;
      } else {
        muteOtherAudioVideos(video);
        video.dataset.userUnmuted = "true";
        video.muted = false;
        video.defaultMuted = false;

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            video.dataset.userUnmuted = "";
            video.muted = true;
            video.defaultMuted = true;
            syncAudioButton(button, video);
          });
        }
      }

      syncAudioButton(button, video);
    });

    video.addEventListener("volumechange", () => syncAudioButton(button, video));
    syncAudioButton(button, video);
  });

  if (!reducedMotion) {
    document.querySelectorAll("[data-auto-scroll]").forEach((track) => {
      if (track.scrollWidth <= track.clientWidth + 8) return;

      let direction = 1;
      let paused = false;
      const stepSize = 0.95;

      const pause = () => {
        paused = true;
      };

      const resume = () => {
        paused = false;
      };

      track.addEventListener("pointerenter", pause);
      track.addEventListener("pointerleave", resume);
      track.addEventListener("focusin", pause);
      track.addEventListener("focusout", resume);
      track.addEventListener("pointerdown", pause);
      track.addEventListener("wheel", pause, { passive: true });

      window.setInterval(() => {
        if (paused) return;

        const maxScroll = track.scrollWidth - track.clientWidth;
        const next = track.scrollLeft + direction * stepSize;
        if (next <= 0) {
          track.scrollLeft = 0;
          direction = 1;
          return;
        }

        if (next >= maxScroll) {
          track.scrollLeft = maxScroll;
          direction = -1;
          return;
        }

        track.scrollLeft = next;
      }, 30);
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
