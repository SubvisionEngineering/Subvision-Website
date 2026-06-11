/* ==========================================================================
   Subvision interactive enhancement layer
   Additive, progressive, and studio-safe: every feature checks for reduced
   motion, and heavy effects stay off inside the studio editing frame.
   ========================================================================== */
(() => {
  "use strict";

  const inStudioFrame = window.self !== window.top;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* Resolves once site.js has applied layout overrides (or after a timeout),
     so text effects never fight the studio override system. */
  const overridesReady = () =>
    new Promise((resolve) => {
      const started = performance.now();
      const tick = () => {
        const layout = window.SubvisionLayout;
        if ((layout && layout.getLayoutOverrides && layout.getLayoutOverrides()) || performance.now() - started > 3000) {
          resolve();
          return;
        }
        window.setTimeout(tick, 80);
      };
      tick();
    });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  const setupCanvas = (canvas, cssWidth, cssHeight) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  /* ------------------------------------------------------------------------
     Ocean ambience: marine snow, rising bubbles, light rays, depth tint.
     ------------------------------------------------------------------------ */
  const initOcean = () => {
    if (reducedMotion || inStudioFrame) return;

    const canvas = document.createElement("canvas");
    canvas.className = "sv-ocean";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    let ctx;
    let width = 0;
    let height = 0;
    let particles = [];
    let bubbles = [];
    let rafId = 0;
    let lastTime = performance.now();
    const pointer = { x: -9999, y: -9999 };

    const buildParticles = () => {
      const count = clamp(Math.round((width * height) / 26000), 30, 110);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.5 + Math.random() * 1.5,
        depth: 0.25 + Math.random() * 0.75,
        drift: 2 + Math.random() * 7,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.05 + Math.random() * 0.13,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      ctx = setupCanvas(canvas, width, height);
      buildParticles();
    };

    const spawnBubble = () => {
      if (bubbles.length > 14) return;
      bubbles.push({
        x: Math.random() * width,
        y: height + 12,
        r: 1 + Math.random() * 2.4,
        speed: 16 + Math.random() * 26,
        wobble: Math.random() * Math.PI * 2,
        alpha: 0.12 + Math.random() * 0.16,
      });
    };

    const scrollFraction = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    };

    const drawRays = (time, fraction) => {
      if (fraction > 0.45) return;
      const fade = 1 - fraction / 0.45;
      for (let i = 0; i < 3; i += 1) {
        const sway = Math.sin(time / 6000 + i * 2.1) * 90;
        const baseX = width * (0.22 + i * 0.3) + sway;
        const grad = ctx.createLinearGradient(baseX, 0, baseX + 160, height * 0.6);
        grad.addColorStop(0, `rgba(125, 215, 255, ${0.05 * fade})`);
        grad.addColorStop(1, "rgba(125, 215, 255, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(baseX - 70, -10);
        ctx.lineTo(baseX + 70, -10);
        ctx.lineTo(baseX + 240, height * 0.62);
        ctx.lineTo(baseX + 40, height * 0.62);
        ctx.closePath();
        ctx.fill();
      }
    };

    const frame = (time) => {
      const dt = clamp((time - lastTime) / 1000, 0, 0.05);
      lastTime = time;
      ctx.clearRect(0, 0, width, height);

      const fraction = scrollFraction();
      drawRays(time, fraction);

      const scrollShift = window.scrollY;
      ctx.fillStyle = "rgba(190, 220, 255, 1)";
      particles.forEach((p) => {
        p.x += Math.sin(time / 3200 + p.phase) * p.drift * dt;
        p.y += p.drift * 0.55 * dt;

        const dx = p.x - pointer.x;
        const dy = p.y - ((pointer.y + scrollShift * p.depth * 0.12) % (height + 40));
        const dist = Math.hypot(dx, dy);
        if (dist < 110 && dist > 0.01) {
          const push = ((110 - dist) / 110) * 26 * dt;
          p.x += (dx / dist) * push;
          p.y += (dy / dist) * push;
        }

        if (p.y > height + 20) p.y = -10;
        if (p.x > width + 20) p.x = -10;
        if (p.x < -20) p.x = width + 10;

        const drawY = (p.y + scrollShift * p.depth * 0.12) % (height + 40);
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (Math.random() < dt * 1.4) spawnBubble();
      bubbles = bubbles.filter((b) => b.y > -16);
      bubbles.forEach((b) => {
        b.y -= b.speed * dt;
        b.wobble += dt * 2.4;
        const bx = b.x + Math.sin(b.wobble) * 7;
        ctx.globalAlpha = b.alpha;
        ctx.strokeStyle = "rgba(150, 220, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      if (fraction > 0.04) {
        ctx.fillStyle = `rgba(2, 8, 18, ${(fraction * 0.26).toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);
      }

      rafId = window.requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    if (finePointer) {
      window.addEventListener(
        "pointermove",
        (event) => {
          pointer.x = event.clientX;
          pointer.y = event.clientY;
        },
        { passive: true },
      );
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.cancelAnimationFrame(rafId);
      } else {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(frame);
      }
    });

    rafId = window.requestAnimationFrame(frame);
  };

  /* ------------------------------------------------------------------------
     Depth gauge: scroll position rendered as dive depth along a ship draft.
     ------------------------------------------------------------------------ */
  const initDepthGauge = () => {
    if (reducedMotion || inStudioFrame) return;

    const gauge = document.createElement("div");
    gauge.className = "sv-depth";
    gauge.setAttribute("aria-hidden", "true");
    gauge.title = "Scroll depth";

    const rail = document.createElement("div");
    rail.className = "sv-depth__rail";
    gauge.appendChild(rail);

    for (let i = 0; i <= 8; i += 1) {
      const tick = document.createElement("div");
      tick.className = "sv-depth__tick";
      tick.style.top = `${(i / 8) * 100}%`;
      if (i % 2 === 0) tick.style.width = "10px";
      gauge.appendChild(tick);
    }

    const marker = document.createElement("div");
    marker.className = "sv-depth__marker";
    gauge.appendChild(marker);

    const readout = document.createElement("div");
    readout.className = "sv-depth__readout";
    readout.textContent = "0.0 m";
    gauge.appendChild(readout);

    document.body.appendChild(gauge);

    const MAX_DEPTH_M = 16; // roughly the draft of a large container ship
    let hideTimer = 0;

    const sync = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      marker.style.top = `${fraction * 100}%`;
      readout.style.top = `${fraction * 100}%`;
      readout.textContent = `−${(fraction * MAX_DEPTH_M).toFixed(1)} m`;
      gauge.classList.add("is-scrolling");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => gauge.classList.remove("is-scrolling"), 900);
    };

    gauge.addEventListener("pointerdown", (event) => {
      const rect = gauge.getBoundingClientRect();
      const fraction = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: fraction * max, behavior: "smooth" });
    });

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
    gauge.classList.remove("is-scrolling");
  };

  /* ------------------------------------------------------------------------
     Stat count-ups: animate numbers exactly back to their authored strings.
     ------------------------------------------------------------------------ */
  const initCounters = async () => {
    if (reducedMotion || inStudioFrame) return;
    await overridesReady();

    const targets = Array.from(
      document.querySelectorAll(".proof-strip strong, .funding-summary__title, .issue-card__metric"),
    );
    const NUMBER_PATTERN = /^([^0-9]*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s;

    const animate = (element) => {
      const finalText = element.textContent;
      const match = finalText.trim().match(NUMBER_PATTERN);
      if (!match) return;

      const [, prefix, numText, suffix] = match;
      const target = parseFloat(numText.replace(/,/g, ""));
      if (!isFinite(target)) return;

      const decimals = (numText.split(".")[1] || "").length;
      const useGrouping = numText.includes(",");
      const duration = 1300;
      const started = performance.now();

      const step = (now) => {
        const t = clamp((now - started) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        const rendered = value.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          useGrouping,
        });
        element.textContent = `${prefix}${rendered}${suffix}`;
        if (t < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = finalText;
        }
      };

      window.requestAnimationFrame(step);
    };

    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          observer.unobserve(entry.target);
          animate(entry.target);
        });
      },
      { threshold: 0.5 },
    );

    targets.forEach((element) => observer.observe(element));
  };

  /* ------------------------------------------------------------------------
     Cursor spotlight across cards.
     ------------------------------------------------------------------------ */
  const initSpotlight = () => {
    if (reducedMotion || inStudioFrame || !finePointer) return;

    const selectors = [
      ".card",
      ".proof-strip li",
      ".partner-card",
      ".contact-card",
      ".cluster-card",
      ".media-card",
      ".issue-card",
      ".quote-card",
      ".journey-stop",
      ".metric-card",
      ".support-band",
      ".cta-shell",
      ".hull-demo",
      ".interval-lab",
    ];

    document.querySelectorAll(selectors.join(", ")).forEach((card) => {
      card.classList.add("sv-spot");
      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
          card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
        },
        { passive: true },
      );
    });
  };

  /* ------------------------------------------------------------------------
     Lightbox for photos and renders.
     ------------------------------------------------------------------------ */
  const initLightbox = () => {
    if (inStudioFrame) return;

    const images = Array.from(
      document.querySelectorAll(".feature-image img, .journey-stop__media img, .media-card > img"),
    );
    if (!images.length) return;

    const overlay = document.createElement("div");
    overlay.className = "sv-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image viewer");
    overlay.innerHTML = `
      <button class="sv-lightbox__close" type="button" aria-label="Close image viewer">✕</button>
      <figure class="sv-lightbox__figure">
        <img alt="">
        <figcaption class="sv-lightbox__caption"></figcaption>
      </figure>
    `;
    document.body.appendChild(overlay);

    const overlayImg = overlay.querySelector("img");
    const overlayCaption = overlay.querySelector(".sv-lightbox__caption");
    const closeButton = overlay.querySelector(".sv-lightbox__close");
    let lastFocused = null;

    const close = () => {
      overlay.classList.remove("is-open");
      document.body.style.removeProperty("overflow");
      if (lastFocused) lastFocused.focus({ preventScroll: true });
    };

    const open = (img) => {
      lastFocused = document.activeElement;
      overlayImg.src = img.currentSrc || img.src;
      overlayImg.alt = img.alt || "";
      overlayCaption.textContent = img.alt || "";
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      // Wait one frame so the overlay is visible and can receive focus.
      window.requestAnimationFrame(() => closeButton.focus({ preventScroll: true }));
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target === closeButton) close();
    });
    document.addEventListener("keydown", (event) => {
      if (!overlay.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        close();
      } else if (event.key === "Tab") {
        // The close button is the only focusable element inside the dialog.
        event.preventDefault();
        closeButton.focus();
      }
    });

    images.forEach((img) => {
      img.classList.add("sv-zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `View larger: ${img.alt || "image"}`);
      img.addEventListener("click", () => open(img));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(img);
        }
      });
    });
  };

  /* ------------------------------------------------------------------------
     Interactive hull-cleaning demo (homepage).
     ------------------------------------------------------------------------ */
  const initHullDemo = () => {
    const root = document.querySelector("[data-hull-demo]");
    if (!root) return;

    const canvas = root.querySelector("[data-demo-canvas]");
    const cleanBar = root.querySelector("[data-demo-clean-bar]");
    const cleanValue = root.querySelector("[data-demo-clean-value]");
    const dragBar = root.querySelector("[data-demo-drag-bar]");
    const dragValue = root.querySelector("[data-demo-drag-value]");
    const hint = root.querySelector("[data-demo-hint]");
    const modeButtons = Array.from(root.querySelectorAll("[data-demo-mode]"));
    const resetButton = root.querySelector("[data-demo-reset]");
    if (!canvas) return;

    let ctx;
    let width = 0;
    let height = 0;
    let spots = [];
    let sparkles = [];
    let rafId = 0;
    let running = false;
    let lastTime = 0;
    let mode = "manual";
    let hintDismissed = false;

    const rover = { x: 120, y: 120, tx: 120, ty: 120 };
    const auto = { dir: 1, row: 0 };
    const ROVER_RADIUS = 52;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      ctx = setupCanvas(canvas, width, height);
    };

    const spawnSpot = (initial = false) => {
      if (spots.length > 130) return;
      spots.push({
        x: 16 + Math.random() * (width - 32),
        y: 16 + Math.random() * (height - 32),
        r: initial ? 3 + Math.random() * 12 : 0.8,
        rMax: 7 + Math.random() * 17,
        rate: 0.7 + Math.random() * 1.5,
        kind: Math.random() < 0.78 ? "algae" : "barnacle",
        lobes: Array.from({ length: 7 }, () => 0.72 + Math.random() * 0.52),
        spin: Math.random() * Math.PI * 2,
      });
    };

    const reset = () => {
      spots = [];
      sparkles = [];
      for (let i = 0; i < 14; i += 1) spawnSpot(true);
      rover.x = rover.tx = width * 0.5;
      rover.y = rover.ty = height * 0.4;
    };

    const drawPlate = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#22354c");
      grad.addColorStop(0.5, "#16263a");
      grad.addColorStop(1, "#0d1a2c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(8, 16, 28, 0.85)";
      ctx.lineWidth = 2;
      const seamGap = 150;
      for (let y = seamGap; y < height; y += seamGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.fillStyle = "rgba(170, 195, 220, 0.18)";
        for (let x = 26; x < width; x += 52) {
          ctx.beginPath();
          ctx.arc(x, y, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const sheen = ctx.createRadialGradient(width * 0.3, height * 0.2, 40, width * 0.3, height * 0.2, width * 0.7);
      sheen.addColorStop(0, "rgba(140, 200, 255, 0.05)");
      sheen.addColorStop(1, "rgba(140, 200, 255, 0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, width, height);
    };

    const drawSpot = (spot) => {
      const established = spot.r > spot.rMax * 0.82;
      ctx.save();
      ctx.translate(spot.x, spot.y);
      ctx.rotate(spot.spin);
      ctx.beginPath();
      spot.lobes.forEach((lobe, i) => {
        const angle = (i / spot.lobes.length) * Math.PI * 2;
        const radius = spot.r * lobe;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();

      if (spot.kind === "algae") {
        ctx.fillStyle = established ? "rgba(64, 102, 60, 0.92)" : "rgba(86, 130, 74, 0.78)";
      } else {
        ctx.fillStyle = established ? "rgba(126, 112, 86, 0.94)" : "rgba(140, 128, 100, 0.8)";
      }
      ctx.fill();

      if (established) {
        ctx.strokeStyle = "rgba(20, 30, 22, 0.6)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawRover = (time) => {
      const pulse = reducedMotion ? 0.85 : 0.82 + Math.sin(time / 260) * 0.18;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(rover.x, rover.y, 4, rover.x, rover.y, ROVER_RADIUS * 1.5);
      glow.addColorStop(0, `rgba(140, 234, 255, ${0.34 * pulse})`);
      glow.addColorStop(0.55, `rgba(105, 226, 255, ${0.16 * pulse})`);
      glow.addColorStop(1, "rgba(105, 226, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(rover.x, rover.y, ROVER_RADIUS * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(rover.x, rover.y);
      const w = 58;
      const h = 44;

      ctx.beginPath();
      const hex = [
        [-w * 0.32, -h * 0.5],
        [w * 0.32, -h * 0.5],
        [w * 0.55, 0],
        [w * 0.32, h * 0.5],
        [-w * 0.32, h * 0.5],
        [-w * 0.55, 0],
      ];
      hex.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath();
      ctx.fillStyle = "#0b1626";
      ctx.fill();
      ctx.strokeStyle = "rgba(105, 226, 255, 0.85)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = "rgba(40, 64, 96, 0.9)";
      [[-w * 0.34, -h * 0.34], [w * 0.34, -h * 0.34], [w * 0.34, h * 0.34], [-w * 0.34, h * 0.34]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 6.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(130, 180, 230, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      const core = ctx.createLinearGradient(-10, -10, 12, 12);
      core.addColorStop(0, "#2f7cf6");
      core.addColorStop(1, "#69e2ff");
      ctx.fillStyle = core;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-12, -9, 24, 18, 5);
      } else {
        ctx.rect(-12, -9, 24, 18);
      }
      ctx.fill();
      ctx.restore();
    };

    const updateHud = () => {
      if (!cleanBar) return;
      const plateArea = width * height;
      let fouledArea = 0;
      spots.forEach((spot) => {
        fouledArea += Math.PI * spot.r * spot.r * 0.62;
      });
      const cleanliness = clamp(1 - (fouledArea / plateArea) * 3.4, 0, 1);
      const pct = Math.round(cleanliness * 100);
      cleanBar.style.width = `${pct}%`;
      cleanValue.textContent = `${pct}%`;
      const drag = 1 - cleanliness;
      dragBar.style.width = `${Math.round(drag * 100)}%`;
      dragValue.textContent = drag < 0.12 ? "Low" : drag < 0.3 ? "Rising" : drag < 0.55 ? "High" : "Severe";
    };

    const frame = (time) => {
      const dt = clamp((time - lastTime) / 1000, 0, 0.05);
      lastTime = time;

      if (!reducedMotion) {
        spots.forEach((spot) => {
          if (spot.r < spot.rMax) spot.r = Math.min(spot.rMax, spot.r + spot.rate * dt);
        });
        if (Math.random() < dt * 2.4) spawnSpot();
      }

      if (mode === "auto") {
        const margin = 64;
        const rowHeight = 84;
        const rows = Math.max(1, Math.floor((height - margin * 2) / rowHeight) + 1);
        rover.ty = margin + auto.row * rowHeight;
        rover.tx += auto.dir * 150 * dt;
        if (rover.tx > width - margin) {
          rover.tx = width - margin;
          auto.dir = -1;
          auto.row = (auto.row + 1) % rows;
        } else if (rover.tx < margin) {
          rover.tx = margin;
          auto.dir = 1;
          auto.row = (auto.row + 1) % rows;
        }
      }

      const ease = reducedMotion ? 1 : mode === "auto" ? 0.16 : 0.2;
      rover.x = lerp(rover.x, rover.tx, ease);
      rover.y = lerp(rover.y, rover.ty, ease);

      spots = spots.filter((spot) => {
        const dist = Math.hypot(spot.x - rover.x, spot.y - rover.y);
        if (dist < ROVER_RADIUS + spot.r) {
          if (reducedMotion) return false;
          spot.r -= 36 * dt;
          if (spot.r <= 1) {
            for (let i = 0; i < 4; i += 1) {
              sparkles.push({
                x: spot.x + (Math.random() - 0.5) * 10,
                y: spot.y + (Math.random() - 0.5) * 10,
                life: 0.5,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50 - 18,
              });
            }
            return false;
          }
        }
        return true;
      });

      drawPlate();
      spots.forEach(drawSpot);

      sparkles = sparkles.filter((s) => s.life > 0);
      sparkles.forEach((s) => {
        s.life -= dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = clamp(s.life * 2, 0, 1);
        ctx.fillStyle = "#9cf7ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      drawRover(time);
      updateHud();

      if (running) rafId = window.requestAnimationFrame(frame);
    };

    const renderOnce = () => {
      lastTime = performance.now();
      frame(lastTime);
    };

    const start = () => {
      if (reducedMotion) {
        // No autonomous motion: render stills, redrawn on each interaction.
        renderOnce();
        return;
      }
      if (running) return;
      running = true;
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(rafId);
    };

    canvas.addEventListener(
      "pointermove",
      (event) => {
        if (mode !== "manual") return;
        const rect = canvas.getBoundingClientRect();
        rover.tx = event.clientX - rect.left;
        rover.ty = event.clientY - rect.top;
        if (!hintDismissed && hint) {
          hintDismissed = true;
          hint.classList.add("is-hidden");
        }
        if (reducedMotion) renderOnce();
      },
      { passive: true },
    );

    canvas.addEventListener(
      "pointerdown",
      (event) => {
        if (mode !== "manual") return;
        const rect = canvas.getBoundingClientRect();
        rover.tx = event.clientX - rect.left;
        rover.ty = event.clientY - rect.top;
        if (reducedMotion) renderOnce();
      },
      { passive: true },
    );

    canvas.addEventListener("keydown", (event) => {
      if (mode !== "manual") return;
      const STEP = 34;
      let handled = true;
      if (event.key === "ArrowLeft") rover.tx -= STEP;
      else if (event.key === "ArrowRight") rover.tx += STEP;
      else if (event.key === "ArrowUp") rover.ty -= STEP;
      else if (event.key === "ArrowDown") rover.ty += STEP;
      else handled = false;
      if (!handled) return;
      event.preventDefault();
      rover.tx = clamp(rover.tx, 16, width - 16);
      rover.ty = clamp(rover.ty, 16, height - 16);
      if (!hintDismissed && hint) {
        hintDismissed = true;
        hint.classList.add("is-hidden");
      }
      if (reducedMotion) renderOnce();
    });

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.demoMode;
        modeButtons.forEach((other) => {
          other.classList.toggle("is-active", other === button);
          other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
        if (hint) hint.classList.add("is-hidden");
        if (mode === "auto") {
          auto.dir = 1;
          auto.row = 0;
          rover.tx = 64;
          rover.ty = 64;
        }
        if (reducedMotion) renderOnce();
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        reset();
        if (reducedMotion) renderOnce();
      });
    }

    const visibility = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            resize();
            if (!spots.length) reset();
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.15 },
    );
    visibility.observe(root);

    window.addEventListener("resize", () => {
      if (!running) return;
      resize();
      spots.forEach((spot) => {
        spot.x = clamp(spot.x, 8, width - 8);
        spot.y = clamp(spot.y, 8, height - 8);
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });
  };

  /* ------------------------------------------------------------------------
     Cleaning-interval lab (impact page).
     ------------------------------------------------------------------------ */
  const initIntervalLab = () => {
    const root = document.querySelector("[data-interval-lab]");
    if (!root) return;

    const canvas = root.querySelector("[data-interval-canvas]");
    const slider = root.querySelector("[data-interval-slider]");
    const valueLabel = root.querySelector("[data-interval-value]");
    const stat = root.querySelector("[data-interval-stat]");
    if (!canvas || !slider) return;

    const MONTHS = 24;
    const MAX_PENALTY = 40;
    let ctx;
    let width = 0;
    let height = 0;
    let shownInterval = parseFloat(slider.value);
    let targetInterval = shownInterval;
    let rafId = 0;
    let animating = false;

    const penaltyAt = (monthsSinceClean) => MAX_PENALTY * Math.pow(monthsSinceClean / MONTHS, 1.15);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      ctx = setupCanvas(canvas, width, height);
    };

    const pad = { left: 56, right: 18, top: 22, bottom: 38 };

    const plotX = (month) => pad.left + (month / MONTHS) * (width - pad.left - pad.right);
    const plotY = (penalty) => height - pad.bottom - (penalty / MAX_PENALTY) * (height - pad.top - pad.bottom);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(156, 196, 255, 0.12)";
      ctx.fillStyle = "rgba(193, 208, 230, 0.95)";
      ctx.lineWidth = 1;
      ctx.font = '12px "Space Grotesk", "Segoe UI", sans-serif';

      for (let p = 0; p <= MAX_PENALTY; p += 10) {
        const y = plotY(p);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(width - pad.right, y);
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillText(`+${p}%`, pad.left - 8, y + 4);
      }

      ctx.textAlign = "center";
      for (let m = 0; m <= MONTHS; m += 6) {
        const x = plotX(m);
        ctx.fillText(m === 0 ? "0" : `${m} mo`, x, height - pad.bottom + 20);
      }

      ctx.fillStyle = "rgba(178, 194, 219, 0.95)";
      ctx.save();
      ctx.translate(16, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Added power demand", 0, 0);
      ctx.restore();

      const steps = 320;

      ctx.strokeStyle = "rgba(255, 157, 118, 0.9)";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const month = (i / steps) * MONTHS;
        const x = plotX(month);
        const y = plotY(penaltyAt(month));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(plotX(0), plotY(0));
      for (let i = 0; i <= steps; i += 1) {
        const month = (i / steps) * MONTHS;
        const sinceClean = month % shownInterval;
        ctx.lineTo(plotX(month), plotY(penaltyAt(sinceClean)));
      }
      const fillBottom = plotY(0);
      ctx.lineTo(plotX(MONTHS), fillBottom);
      ctx.lineTo(plotX(0), fillBottom);
      ctx.closePath();
      ctx.fillStyle = "rgba(105, 226, 255, 0.1)";
      ctx.fill();

      ctx.strokeStyle = "rgba(105, 226, 255, 0.95)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const month = (i / steps) * MONTHS;
        const sinceClean = month % shownInterval;
        const x = plotX(month);
        const y = plotY(penaltyAt(sinceClean));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = "#9cf7ff";
      for (let m = shownInterval; m < MONTHS; m += shownInterval) {
        ctx.beginPath();
        ctx.arc(plotX(m), plotY(0), 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const updateStat = () => {
      const samples = 600;
      let cleanedSum = 0;
      let neverSum = 0;
      for (let i = 0; i < samples; i += 1) {
        const month = (i / samples) * MONTHS;
        cleanedSum += penaltyAt(month % targetInterval);
        neverSum += penaltyAt(month);
      }
      const saving = Math.round((1 - cleanedSum / neverSum) * 100);
      if (stat) {
        stat.innerHTML = `In this illustration, cleaning every <strong>${targetInterval} month${targetInterval > 1 ? "s" : ""}</strong> keeps the average added power demand about <strong>${saving}% lower</strong> than never cleaning.`;
      }
    };

    const animateTo = () => {
      if (animating) return;
      animating = true;
      const step = () => {
        shownInterval = lerp(shownInterval, targetInterval, reducedMotion ? 1 : 0.18);
        if (Math.abs(shownInterval - targetInterval) < 0.01) {
          shownInterval = targetInterval;
          animating = false;
        }
        draw();
        if (animating) rafId = window.requestAnimationFrame(step);
      };
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(step);
    };

    slider.addEventListener("input", () => {
      targetInterval = parseFloat(slider.value);
      if (valueLabel) valueLabel.textContent = `${targetInterval} month${targetInterval > 1 ? "s" : ""}`;
      updateStat();
      animateTo();
    });

    const visibility = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            resize();
            draw();
          }
        });
      },
      { threshold: 0.2 },
    );
    visibility.observe(root);

    window.addEventListener("resize", () => {
      resize();
      draw();
    });

    resize();
    updateStat();
    draw();
  };

  /* ------------------------------------------------------------------------
     ZIMA hotspot explorer (technology page).
     ------------------------------------------------------------------------ */
  const initHotspots = () => {
    const stage = document.querySelector("[data-hotspot-stage]");
    if (!stage) return;

    const inner = stage.querySelector(".hotspot-stage__inner");
    const dots = Array.from(stage.querySelectorAll("[data-hotspot]"));
    const cards = Array.from(stage.querySelectorAll("[data-hotspot-card]"));

    const closeAll = () => {
      cards.forEach((card) => {
        card.hidden = true;
      });
      dots.forEach((dot) => dot.setAttribute("aria-expanded", "false"));
    };

    const positionCard = (dot, card) => {
      const innerRect = inner.getBoundingClientRect();
      const dotRect = dot.getBoundingClientRect();
      const cardWidth = Math.min(300, innerRect.width * 0.82);
      const dotX = dotRect.left - innerRect.left + dotRect.width / 2;
      const dotY = dotRect.top - innerRect.top + dotRect.height / 2;

      let left = dotX + 26;
      if (left + cardWidth > innerRect.width - 8) {
        left = dotX - cardWidth - 26;
      }
      left = clamp(left, 8, innerRect.width - cardWidth - 8);

      card.style.left = `${left}px`;
      card.style.top = `${clamp(dotY - 30, 8, innerRect.height - 120)}px`;
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", (event) => {
        event.stopPropagation();
        const id = dot.dataset.hotspot;
        const card = cards.find((c) => c.dataset.hotspotCard === id);
        if (!card) return;

        const wasOpen = !card.hidden;
        closeAll();
        if (!wasOpen) {
          card.hidden = false;
          positionCard(dot, card);
          dot.setAttribute("aria-expanded", "true");
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!stage.contains(event.target)) closeAll();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAll();
    });
    window.addEventListener("resize", closeAll);
  };

  /* ------------------------------------------------------------------------
     Header: hide on scroll down, reveal on scroll up.
     ------------------------------------------------------------------------ */
  const initHeaderMotion = () => {
    if (reducedMotion || inStudioFrame) return;
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          const delta = y - lastY;
          if (y > 340 && delta > 6 && !header.classList.contains("is-open")) {
            header.classList.add("sv-header-hidden");
          } else if (delta < -4 || y < 340) {
            header.classList.remove("sv-header-hidden");
          }
          lastY = y;
          ticking = false;
        });
      },
      { passive: true },
    );
  };

  /* ------------------------------------------------------------------------
     Scroll parallax on photography inside overflow-hidden frames.
     ------------------------------------------------------------------------ */
  const initParallax = () => {
    if (reducedMotion || inStudioFrame) return;
    const items = Array.from(document.querySelectorAll(".feature-image img, .journey-stop__media img"));
    if (!items.length) return;

    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      items.forEach((img) => {
        const frame = img.parentElement;
        const rect = frame.getBoundingClientRect();
        if (rect.bottom < -90 || rect.top > vh + 90) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        img.style.transform = `translateY(${(-progress * 16).toFixed(1)}px) scale(1.1)`;
      });
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true },
    );
    window.addEventListener("resize", update);
    update();
  };

  /* ------------------------------------------------------------------------
     Magnetic buttons: a light pull toward the cursor.
     ------------------------------------------------------------------------ */
  const initMagneticButtons = () => {
    if (reducedMotion || inStudioFrame || !finePointer) return;

    document.querySelectorAll(".button").forEach((button) => {
      button.addEventListener(
        "pointermove",
        (event) => {
          const rect = button.getBoundingClientRect();
          const dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          button.style.transform = `translate(${(dx * 5).toFixed(1)}px, ${(dy * 4 - 2).toFixed(1)}px)`;
        },
        { passive: true },
      );
      button.addEventListener("pointerleave", () => {
        button.style.removeProperty("transform");
      });
    });
  };

  /* ------------------------------------------------------------------------
     Easter egg: type "zima" and the orca swims by.
     ------------------------------------------------------------------------ */
  const initEasterEgg = () => {
    if (reducedMotion || inStudioFrame) return;

    let buffer = "";
    let swimming = false;

    document.addEventListener("keydown", (event) => {
      const tag = (event.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || event.target.isContentEditable) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-4);
      if (buffer !== "zima" || swimming) return;
      swimming = true;

      const swimmer = document.createElement("img");
      swimmer.src = "assets/media/logo-mark.png";
      swimmer.alt = "";
      swimmer.className = "sv-swimmer";
      swimmer.style.top = `${18 + Math.random() * 50}vh`;
      document.body.appendChild(swimmer);

      const bubbleTimer = window.setInterval(() => {
        const rect = swimmer.getBoundingClientRect();
        if (rect.left < 0 || rect.left > window.innerWidth) return;
        const bubble = document.createElement("div");
        bubble.className = "sv-bubble";
        bubble.style.left = `${rect.left + 8}px`;
        bubble.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(bubble);
        window.setTimeout(() => bubble.remove(), 1900);
      }, 320);

      window.setTimeout(() => {
        window.clearInterval(bubbleTimer);
        swimmer.remove();
        swimming = false;
      }, 6200);
    });

    if (!inStudioFrame) {
      console.info("%cSubvision • psst — try typing “zima”", "color:#69e2ff");
    }
  };

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  const boot = () => {
    initOcean();
    initDepthGauge();
    initCounters();
    initSpotlight();
    initLightbox();
    initHullDemo();
    initIntervalLab();
    initHotspots();
    initHeaderMotion();
    initParallax();
    initMagneticButtons();
    initEasterEgg();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
