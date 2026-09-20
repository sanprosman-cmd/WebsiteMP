(function () {
  "use strict";

  /* ---------- Site configuration (single point) ----------
     GA_MEASUREMENT_ID — GA4 measurement id, e.g. "G-AB12CD34EF".
       Empty string = analytics stays off (no cookies, no tracking).
       Analytics only ever loads after the visitor accepts the banner.
     FORM_ENDPOINT — hosted form endpoint (e.g. Formspree:
       "https://formspree.io/f/xxxxxxx"). Empty string = the contact
       form falls back to a prepared mailto draft instead of pretending
       to send.                                                          */
  var GA_MEASUREMENT_ID = "";
  var FORM_ENDPOINT = "";
  window.MP_CONFIG = { gaMeasurementId: GA_MEASUREMENT_ID, formEndpoint: FORM_ENDPOINT };

  document.documentElement.classList.add("js");

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header state ---------- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 32);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- background video under reduced-motion ---------- */
  if (prefersReduced) {
    [].slice.call(document.querySelectorAll("video[autoplay]")).forEach(function (v) {
      v.pause();
      v.removeAttribute("autoplay");
    });
  }

  /* ---------- mobile menu ---------- */
  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- scroll progress bar ---------- */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  var ticking = false;
  function updateProgress() {
    ticking = false;
    onScroll();
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = "scaleX(" + p + ")";
    updateParallax();
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });

  /* ---------- parallax on marked figures ---------- */
  var parallaxEls = [].slice.call(document.querySelectorAll("[data-parallax]"));
  var parallaxActive = [];
  function updateParallax() {
    if (prefersReduced) return;
    var vh = window.innerHeight;
    parallaxActive.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var delta = (r.top + r.height / 2) - vh / 2;
      el.style.transform = "translateY(" + (delta * -0.06).toFixed(1) + "px)";
    });
  }
  if ("IntersectionObserver" in window && parallaxEls.length) {
    var pIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = parallaxActive.indexOf(entry.target);
        if (entry.isIntersecting && i === -1) parallaxActive.push(entry.target);
        else if (!entry.isIntersecting && i !== -1) parallaxActive.splice(i, 1);
      });
    }, { rootMargin: "20% 0px 20% 0px" });
    parallaxEls.forEach(function (el) { pIo.observe(el); });
  }

  /* ---------- scroll reveal with group stagger ----------
     Reveal fires once. Children of a group container get a
     70ms-per-index transition delay via --stagger.
     .reveal = rise from below · .reveal-l = slide from left. */
  var GROUPS = ".cards-grid, .rows, .impact-grid, .products-grid, .project-grid, .values-strip, .vendor-grid, .footprints, .stat-strip";

  document.querySelectorAll(GROUPS).forEach(function (group) {
    var kids = group.querySelectorAll(".reveal, .reveal-l");
    var cap = group.classList.contains("footprints") ? 32 : 10;
    for (var i = 0; i < kids.length; i++) {
      if (i < cap) kids[i].style.setProperty("--stagger", i * 60 + "ms");
    }
  });

  /* award rows slide in from the left */
  document.querySelectorAll(".rows .award-row").forEach(function (row, i) {
    row.classList.add("reveal-l");
    if (i < 10) row.style.setProperty("--stagger", i * 80 + "ms");
  });

  var revealEls = document.querySelectorAll(".reveal, .reveal-l");
  if (!prefersReduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- stat count-up ----------
     Animates the numeric part of stat values once, on view.
     Parses prefix (≤ ≥ ±) and suffix (km, %, m³ …); skips
     anything it can't parse cleanly. Skipped under reduced motion. */
  function parseStat(el) {
    var t = el.textContent.trim();
    var m = t.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return null;
    var val = parseFloat(m[2]);
    if (isNaN(val)) return null;
    var decimals = (m[2].split(".")[1] || "").length;
    return { el: el, pre: m[1], val: val, post: m[3], decimals: decimals };
  }

  function runCountUp(stat) {
    var duration = 900;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      stat.el.textContent =
        stat.pre + (stat.val * eased).toFixed(stat.decimals) + stat.post;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var statEls = document.querySelectorAll(".impact-cell__value, .stat-strip__value");
  if (!prefersReduced && "IntersectionObserver" in window && statEls.length) {
    var stats = [];
    statEls.forEach(function (el) {
      var s = parseStat(el);
      if (s) stats.push(s);
    });
    if (stats.length) {
      var statIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var stat = stats.find(function (s) { return s.el === entry.target; });
              if (stat) runCountUp(stat);
              statIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      stats.forEach(function (s) { statIo.observe(s.el); });
    }
  }

/* ---------- contact form ---------- */
  var form = document.getElementById("demo-form");
  if (form) {
    var status = document.getElementById("form-status");
    var submitBtn = form.querySelector('[type="submit"]');
    var required = form.querySelectorAll("[required]");

    function setFieldError(field, bad) {
      var wrap = field.closest(".field");
      if (wrap) wrap.classList.toggle("is-invalid", bad);
      if (bad) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }

    function fieldIsValid(field) {
      if (field.type === "checkbox") return field.checked;
      var v = field.value.trim();
      if (!v) return false;
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return false;
      return true;
    }

    function showStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.hidden = false;
      status.classList.remove("form-status--error", "form-status--notice");
      if (kind) status.classList.add("form-status--" + kind);
    }

    required.forEach(function (field) {
      field.addEventListener("input", function () { setFieldError(field, false); });
      field.addEventListener("change", function () { setFieldError(field, false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;

      required.forEach(function (field) {
        var bad = !fieldIsValid(field);
        setFieldError(field, bad);
        if (bad && !firstBad) firstBad = field;
      });

      if (firstBad) {
        showStatus("Please complete the highlighted fields.", "error");
        firstBad.focus();
        return;
      }

      var company = form.elements.company.value.trim();
      var name = form.elements.name.value.trim();
      var endpoint = window.MP_CONFIG && window.MP_CONFIG.formEndpoint;

      if (endpoint) {
        if (submitBtn) submitBtn.disabled = true;
        showStatus("Sending…");
        var data = new FormData(form);
        data.append("_subject", "Website inquiry — " + (company || name));
        fetch(endpoint, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        }).then(function (res) {
          if (res.ok) {
            window.location.href = "thank-you.html";
            return null;
          }
          return res.json().catch(function () { return {}; }).then(function (body) {
            throw new Error(body && body.error ? body.error : "Request failed");
          });
        }).catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          showStatus("Sending failed — please email us directly at admin@maharaniprima.com, or try again.", "error");
        });
        return;
      }

      /* No endpoint configured — hand over a ready-made email draft
         instead of pretending the message was delivered. */
      var email = form.elements.email.value.trim();
      var phone = form.elements.phone.value.trim();
      var interest = form.elements.interest.value;
      var message = form.elements.message.value.trim();
      var subject = encodeURIComponent("Inquiry — " + (company || name));
      var body = encodeURIComponent(
        "Name: " + name +
        "\nCompany: " + company +
        "\nEmail: " + email +
        "\nPhone: " + phone +
        "\nInterest: " + interest +
        "\n\nMessage:\n" + message
      );
      showStatus("This form is not connected to a mailbox yet — open the prepared draft below and send it from your email.", "notice");
      var mailLink = document.getElementById("form-mailto");
      if (!mailLink) {
        mailLink = document.createElement("a");
        mailLink.id = "form-mailto";
        mailLink.className = "btn btn--dark";
        mailLink.style.marginTop = "12px";
        (status && status.parentNode ? status.parentNode : form).appendChild(mailLink);
      }
      mailLink.href = "mailto:admin@maharaniprima.com?subject=" + subject + "&body=" + body;
      mailLink.textContent = "Open email draft";
      mailLink.focus();
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* ============================================================
   CONSENT + ANALYTICS
   Banner is injected on every page. GA4 loads only after an
   explicit "Accept All". See MP_CONFIG at the top of this file.
   ============================================================ */
(function () {
  "use strict";

  var CONSENT_KEY = "cookie_consent";

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function loadAnalytics() {
    var id = window.MP_CONFIG && window.MP_CONFIG.gaMeasurementId;
    if (!id || id.indexOf("G-") !== 0 || document.getElementById("ga4-script")) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    var s = document.createElement("script");
    s.id = "ga4-script";
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.appendChild(s);
  }

  function injectBanner() {
    var banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.id = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.hidden = true;
    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__text">We use essential cookies to make this site work and analytics cookies to understand how you use it. <a href="privacy.html">Read our cookie policy</a>.</p>' +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="cookie-banner__btn" id="cookie-reject">Reject All</button>' +
          '<button type="button" class="cookie-banner__btn cookie-banner__btn--primary" id="cookie-accept">Accept All</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    document.getElementById("cookie-accept").addEventListener("click", function () { setConsent("accept", banner); });
    document.getElementById("cookie-reject").addEventListener("click", function () { setConsent("reject", banner); });
    return banner;
  }

  function showBanner(banner) {
    banner.hidden = false;
    requestAnimationFrame(function () { banner.classList.add("is-visible"); });
  }

  function setConsent(value, banner) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
    if (banner) {
      banner.classList.remove("is-visible");
      window.setTimeout(function () { banner.hidden = true; }, 350);
    }
    if (value === "accept") loadAnalytics();
  }

  /* "Cookie Settings" button reopens the banner */
  document.addEventListener("click", function (e) {
    var trigger = e.target && e.target.closest ? e.target.closest("[data-cookie-settings]") : null;
    if (!trigger) return;
    e.preventDefault();
    try { localStorage.removeItem(CONSENT_KEY); } catch (err) {}
    var banner = document.getElementById("cookie-banner") || injectBanner();
    showBanner(banner);
  });

  var stored = getConsent();
  if (stored === "accept") {
    loadAnalytics();
  } else if (!stored) {
    showBanner(injectBanner());
  }
})();

/* ============================================================
   INTERACTIVE LAYER
   cursor ring · magnetic buttons · ticker · projects filter ·
   capabilities scrollspy · EPCC stepper · interactive map
   ============================================================ */
(function () {
  "use strict";
  if (document.documentElement.dataset.interactiveBound) return;
  document.documentElement.dataset.interactiveBound = "1";

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- cursor ring + magnetic buttons ---------- */
  if (finePointer && !reduced) {
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    var ringDot = document.createElement("span");
    ringDot.className = "cursor-ring__dot";
    ring.appendChild(ringDot);
    document.body.appendChild(ring);

    var mx = -100, my = -100, rx = -100, ry = -100, ringOn = false, rafId = null;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!ringOn) { ringOn = true; rx = mx; ry = my; ring.classList.add("is-on"); loop(); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      ringOn = false; ring.classList.remove("is-on");
    });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
      if (ringOn) rafId = requestAnimationFrame(loop);
    }

    var interactiveSel = "a, button, .map-pin, .filter-btn, .spy-tab";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(interactiveSel)) ring.classList.add("is-active");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(interactiveSel)) ring.classList.remove("is-active");
    });

    /* magnetic pull on buttons */
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (dx * 0.08).toFixed(1) + "px," + (dy * 0.18).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- hero telemetry ticker ---------- */
  var ticker = document.querySelector(".ticker .ticker__item");
  if (ticker) {
    var facts = [
      "220 wellpads delivered across the Rokan Block",
      "550 km of HV & MV transmission energized",
      "9 power plants commissioned — coal to geothermal",
      "130 km of pipelines built & tested",
      "5,402,696 safe man-hours without lost injury",
      "3.6M m³ of earth moved & hauled"
    ];
    var fi = 0;
    setInterval(function () {
      fi = (fi + 1) % facts.length;
      ticker.classList.remove("is-entering");
      ticker.classList.add("is-leaving");
      setTimeout(function () {
        ticker.textContent = facts[fi];
        ticker.classList.remove("is-leaving");
        ticker.classList.add("is-entering");
      }, reduced ? 0 : 380);
    }, 3200);
  }

  /* ---------- projects filter ---------- */
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".project-grid .project-card"));
    var count = document.getElementById("filter-count");
    function applyFilter(cat) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = cat === "all" || card.dataset.cat === cat;
        if (match) {
          shown++;
          if (card.classList.contains("is-hidden")) {
            card.classList.remove("is-hidden");
            card.classList.add("is-appearing");
            setTimeout(function () { card.classList.remove("is-appearing"); }, 480);
          }
        } else if (!card.classList.contains("is-hidden")) {
          card.classList.add("is-hidden");
        }
      });
      if (count) count.textContent = "Showing " + shown + " of " + cards.length + " projects";
    }
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      applyFilter(btn.dataset.filter);
    });
    applyFilter("all");
  }

  /* ---------- site record deck ---------- */
  var deck = document.querySelector("[data-deck]");
  if (deck) {
    var deckSlides = [].slice.call(deck.querySelectorAll(".deck__slide"));
    var deckCaps = [].slice.call(deck.querySelectorAll(".deck__cap"));
    var deckDots = [].slice.call(deck.querySelectorAll("[data-deck-go]"));
    var deckStage = deck.querySelector("[data-deck-stage]");
    var deckStatus = deck.querySelector("[data-deck-status]");
    var deckTotal = deckSlides.length;
    var deckAt = 0;

    /* Slot relative to the front plate, wrapped so the shortest path is taken.
       Negative = already dealt off to the left; positive = still in the stack.
       Only seven slots are ever styled, so anything further out parks one slot
       beyond the visible range and stays invisible. */
    function deckSlot(i) {
      var d = i - deckAt;
      if (d > deckTotal / 2) d -= deckTotal;
      if (d < -deckTotal / 2) d += deckTotal;
      return Math.max(-2, Math.min(5, d));
    }

    function deckRender() {
      deckSlides.forEach(function (slide, i) {
        var d = deckSlot(i);
        slide.setAttribute("data-pos", String(d));
        slide.setAttribute("aria-hidden", d === 0 ? "false" : "true");
      });
      deckCaps.forEach(function (cap, i) { cap.classList.toggle("is-current", i === deckAt); });
      deckDots.forEach(function (dot, i) {
        if (i === deckAt) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (deckStage) deckStage.setAttribute("aria-label", "Field photographs, plate " + (deckAt + 1) + " of " + deckTotal);
      if (deckStatus && deckCaps[deckAt]) {
        var capCat = deckCaps[deckAt].querySelector(".deck__cap-cat");
        var capTxt = deckCaps[deckAt].querySelector(".deck__cap-text");
        var capText = capCat && capTxt
          ? capCat.textContent.replace(/\s+/g, " ").trim() + ": " +
            capTxt.textContent.replace(/\s+/g, " ").trim()
          : deckCaps[deckAt].textContent.replace(/\s+/g, " ").trim();
        deckStatus.textContent = "Plate " + (deckAt + 1) + " of " + deckTotal + " — " + capText;
      }
    }

    function deckGo(i) {
      deckAt = (i + deckTotal) % deckTotal;
      deckRender();
    }

    deck.addEventListener("click", function (e) {
      var jump = e.target.closest("[data-deck-go]");
      if (jump) { deckGo(Number(jump.dataset.deckGo)); return; }
      if (e.target.closest("[data-deck-prev]")) { deckGo(deckAt - 1); return; }
      if (e.target.closest("[data-deck-next]")) { deckGo(deckAt + 1); }
    });

    if (deckStage) {
      deckStage.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); deckGo(deckAt + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); deckGo(deckAt - 1); }
      });

      /* swipe on touch pointers only — on a desktop the drag belongs to the reader */
      if (window.matchMedia("(pointer: coarse)").matches) {
        var sx = 0, sy = 0, tracking = false;
        deckStage.addEventListener("touchstart", function (e) {
          /* The arrows now live on the plate, so a drag that begins on one belongs
             to the button — otherwise a swipe from an arrow could advance twice. */
          if (e.target.closest && e.target.closest(".deck__nav")) { tracking = false; return; }
          var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; tracking = true;
        }, { passive: true });
        deckStage.addEventListener("touchend", function (e) {
          if (!tracking) return;
          tracking = false;
          var t = e.changedTouches[0];
          var dx = t.clientX - sx, dy = t.clientY - sy;
          if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) deckGo(deckAt + (dx < 0 ? 1 : -1));
        }, { passive: true });
      }
    }

    deckRender();
  }

  /* ---------- capabilities scrollspy ---------- */
  var spyTabs = document.querySelectorAll(".spy-tab");
  if (spyTabs.length) {
    var sections = ["mining", "wellpad", "surface", "transmission", "powerplant"]
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function setActiveTab(id) {
      spyTabs.forEach(function (t) {
        var on = t.dataset.target === id;
        t.classList.toggle("is-active", on);
        if (on) t.setAttribute("aria-current", "true");
        else t.removeAttribute("aria-current");
      });
    }
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveTab(entry.target.id);
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }
    spyTabs.forEach(function (t) {
      t.addEventListener("click", function () {
        var el = document.getElementById(t.dataset.target);
        if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      });
    });
  }

  /* ---------- EPCC stepper (scroll-driven) ---------- */
  var stepper = document.getElementById("stepper");
  if (stepper) {
    var fill = document.getElementById("stepper-fill");
    var steps = stepper.querySelectorAll(".step");
    var stepperActive = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { stepperActive = en.isIntersecting; });
      }, { rootMargin: "10% 0px 10% 0px" }).observe(stepper);
    } else { stepperActive = true; }

    window.__updateStepper = function () {
      if (!stepperActive) return;
      var r = stepper.getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = Math.min(Math.max((vh * 0.75 - r.top) / (r.height + vh * 0.25), 0), 1);
      var vertical = window.innerWidth <= 860;
      if (vertical) fill.style.transform = "scaleY(" + progress + ")";
      else fill.style.transform = "scaleX(" + progress + ")";
      var lit = Math.round(progress * steps.length - 0.01);
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i <= lit); });
    };
  }

  /* ---------- interactive footprints map ---------- */
  var mapFigure = document.querySelector(".footprints-figure");
  if (mapFigure) {
    var pins = mapFigure.querySelectorAll(".map-pin[data-site]");
    var info = document.getElementById("map-info");
    var infoName = info ? info.querySelector(".map-info__name") : null;
    var infoNote = info ? info.querySelector(".map-info__note") : null;
    var chips = document.querySelectorAll("#footchips [data-site]");

    var NOTES = {
      "jakarta-hq": ["Jakarta · HQ", "Head office at CIBIS Nine Business Park, Jakarta Selatan — delivery hub for the whole archipelago."],
      "rokan-block": ["Rokan Block", "220 wellpads, 300 km of wellpad roads and matting works for Pertamina Hulu Rokan."],
      "dumai": ["Dumai", "Mechanical, electrical, piping & instrument works on the Dumai gas pipeline distribution for PGN."],
      "duri": ["Duri", "Earthwork unit-rate services in the Rokan Block with PT Perta Drilling Contractor."],
      "lhoksukon": ["Lhoksukon", "Ground support in the PTSLK operating area, North Aceh."],
      "koto-gasib": ["Koto Gasib", "Operations in the Grissik corridor, South Sumatra."],
      "grissik": ["Grissik", "Dangu water-flood injection EPC for ConocoPhillips (Grissik) Ltd."],
      "cirebon": ["Cirebon", "150/20 kV backfeeding project for PLTU Cirebon Power 2."],
      "dieng": ["Dieng", "EPC tie-in wells HCE-10A & HCE-33 — PLTP Dieng Unit 1, for Geo Dipa Energi."],
      "lombok": ["Lombok", "Nusa Tenggara operations — projects across Lombok and the NTB region."],
      "ende": ["Ende", "Ende, Flores — project location in the NTT region."],
      "gorontalo": ["Gorontalo", "Project location on Sulawesi's northern arm."],
      "matindok": ["Matindok", "Gas facility area works, Central Sulawesi."],
      "tidore": ["Tidore", "North Maluku operations — Tidore island."],
      "jailolo": ["Jailolo", "North Maluku operations — Halmahera."],
      "pontianak": ["Pontianak", "Diesel power plant 5×1.5 MW relocation with PT Indonesia Power."],
      "sukamara": ["Sukamara", "Operations support in Central Kalimantan."],
      "karimun-jawa": ["Karimun Jawa", "Java Sea project location, north of Semarang."],
      "lumut-balai": ["Lumut Balai", "General services for drilling operations 2026–2027, Pertamina Geothermal Energy."],
      "bali": ["Bali", "Project location — Bali operations."],
      "bandung": ["Bandung", "West Java operations base."],
      "pangalengan": ["Pangalengan", "West Java highlands operations."],
      "klari": ["Klari", "Site works in the Klari industrial corridor, West Java."],
      "rawa-minyak": ["Rawa Minyak", "Riau operations — Sumatra oil fields."],
      "minas": ["Minas", "Riau operations — Sumatra oil fields."],
      "bangko-balam": ["Bangko Balam", "Riau operations — Sumatra oil fields."],
      "kuala-pambuang": ["Kuala Pambuang", "Southern Kalimantan project location."],
      "gresik": ["Gresik", "East Java operations."],
      "pasuruan": ["Pasuruan", "East Java operations."]
    };

    function showSite(key, pinEl) {
      pins.forEach(function (p) { p.classList.remove("is-selected"); });
      if (pinEl) pinEl.classList.add("is-selected");
      var note = NOTES[key];
      if (!note || !info) return;
      infoName.textContent = note[0];
      infoNote.textContent = note[1];
      info.hidden = false;
    }

    pins.forEach(function (pin) {
      var key = pin.dataset.site;
      var hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hit.setAttribute("r", "16");
      hit.setAttribute("fill", "transparent");
      hit.setAttribute("stroke", "none");
      pin.insertBefore(hit, pin.firstChild);
      pin.addEventListener("mouseenter", function () { showSite(key, pin); });
      pin.addEventListener("click", function () { showSite(key, pin); });
      pin.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showSite(key, pin); }
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var key = chip.dataset.site;
        if (key === "rokan-block") key = "duri";
        var pin = mapFigure.querySelector('.map-pin[data-site="' + key + '"]');
        showSite(key, pin);
      });
    });
  }

  /* hook stepper into the existing rAF scroll loop */
  var _origUpdate = window.__updateStepper;
  if (_origUpdate) {
    window.addEventListener("scroll", function () { requestAnimationFrame(_origUpdate); }, { passive: true });
    _origUpdate();
  }
})();

/* Company intro video — click to play (the MP4 loads on demand) */
(function () {
  var wrap = document.querySelector("[data-video-intro]");
  if (!wrap) return;
  var video = wrap.querySelector("video");
  var playBtn = wrap.querySelector(".video-intro__play");
  if (!video || !playBtn) return;
  playBtn.addEventListener("click", function () {
    wrap.classList.add("is-playing");
    video.setAttribute("controls", "controls");
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        wrap.classList.remove("is-playing");
        video.removeAttribute("controls");
      });
    }
  });
  video.addEventListener("ended", function () {
    wrap.classList.remove("is-playing");
    video.removeAttribute("controls");
  });
})();

/* Footprints globe — a hand-rolled orthographic sphere on 2D canvas.

   Geometry is Natural Earth 1:50m (public domain), reduced offline by
   tools/_geo/build-earth.js into assets/geo/earth-50m.js. Raw 50m is 60,629
   vertices and the renderer traces land twice a frame; measured on this plate
   that is 8.92ms of trig alone, over half a 16.7ms frame before anything is
   rasterised. So the coastline is simplified against a vertex budget with three
   times the fidelity inside the archipelago, and each polygon carries a bounding
   cap that lets draw() skip it with one cosine when it is over the horizon.

   Three layers, because the plate has to answer "where is this site":
     land    the union coastline, so adjacent countries share an edge exactly
     border  interior admin-0 boundaries from the topological mesh — the only
             thing on the sphere that says which country a marker is standing in
     idn     Indonesia lifted out of the country layer and drawn brighter, since
             every site here is in it and the coastline alone does not say so
   Borneo and New Guinea are single merged polygons in the union layer, so
   Indonesia is overlaid rather than cut out; the shared vertex budget keeps the
   two traces in agreement.

   There is deliberately no globe library here. The WebGL option we tried first
   drew its land mask from a texture address book that disagrees with how it
   places markers: at every southern-hemisphere anchor the sites floated in open
   water under a straight clipped edge. Since this section is about Indonesia,
   that is the one thing it must not get wrong. Owning the projection reduces
   the view centre to a plain latitude and longitude, and land and markers go
   through the same function, so they cannot drift apart.

   The plate is an enrichment of the inline dossier map above it. Geometry
   loads as a classic script tag — the one path that also works when the site
   is opened straight from disk, where fetch() of a local file is blocked. If
   it fails the graticule, the island names and the site markers all still
   draw — the names are copy, not geometry, so they never depend on it. */
(function () {
  "use strict";

  var plate = document.querySelector("[data-globe-plate]");
  var stage = plate && plate.querySelector("[data-globe-stage]");
  var canvas = plate && plate.querySelector("[data-globe]");
  if (!plate || !stage || !canvas) return;

  var ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) { plate.hidden = true; return; }

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The active sites the dossier names, as [lat, lng, marker weight] —
     the head office carries the larger dot. */
  var SITES = [
    [-6.200, 106.817, 0.030], // Jakarta · HQ
    [5.171, 97.208, 0.015],   // Lhoksukon
    [1.681, 101.446, 0.015],  // Dumai
    [1.683, 101.383, 0.015],  // Duri
    [-2.050, 103.900, 0.015], // Grissik
    [-4.250, 104.050, 0.015], // Lumut Balai
    [-0.026, 109.343, 0.015], // Pontianak
    [-2.850, 110.867, 0.015], // Sukamara
    [-2.683, 112.183, 0.015], // Kuala Pambuang
    [-5.700, 110.500, 0.015], // Karimun Jawa
    [-6.320, 107.230, 0.015], // Klari
    [-6.717, 108.583, 0.015], // Cirebon
    [-6.915, 107.610, 0.015], // Bandung
    [-7.083, 107.633, 0.015], // Pangalengan
    [-7.200, 109.917, 0.015], // Dieng
    [-7.246, 112.738, 0.015], // Surabaya
    [-7.150, 112.650, 0.015], // Gresik
    [-7.633, 112.933, 0.015], // Pasuruan
    [-8.500, 115.250, 0.015], // Bali
    [-8.650, 116.320, 0.015], // Lombok
    [-8.840, 121.650, 0.015], // Ende
    [0.533, 123.050, 0.015],  // Gorontalo
    [-0.750, 121.250, 0.015], // Matindok
    [0.800, 127.550, 0.015],  // Tidore
    [1.450, 128.000, 0.015]   // Jailolo
  ];

  /* Where the sphere starts: the Banda Sea, so Sumatra in the west and
     Halmahera in the east both sit inside the disc. From there rotation is
     free — any longitude, any latitude short of the poles, where the
     orthographic projection degenerates. It rests wherever the visitor
     leaves it; nothing pulls it back. */
  var ANCHOR = { lat: -3, lng: 115.5 };
  var LAT_LIMIT = 85;   // the poles are unreachable on purpose

  var RAD = Math.PI / 180;
  var TAU = Math.PI * 2;
  /* { land, idn, border } — each an array of [cap, rings], rings -> [lng, lat].
     cap is [sinLat0, cosLat0, lng0, -sin(rho)]: the bounding sphere the far-side
     cull tests against the view centre. Borders wrap a single open line in the
     same ring shape so one walker serves all three layers. */
  var GEO = null;
  var geoRequested = false;

  /* Place names, so a marker reads as somewhere instead of as a dot. Islands
     only: country and continent names came off the sphere when the admin-0
     borders took over saying which land is which — a border answers "which
     country" without nine pieces of copy crowding the disc. The island set
     matches the dossier map above the plate.
     [lat, lng, text] */
  var LABELS = [
    [0.4, 101.7, "SUMATRA"],
    [-7.5, 110.4, "JAVA"],
    [-2.1, 121.4, "SULAWESI"],
    [-4.0, 138.5, "PAPUA"]
  ];

  /* size / weight / peak alpha / the facing at which the name starts to appear.
     minV is a horizon guard: a label near the limb would be squeezed into the
     shading and read as noise, so it fades in only once the surface turns to us. */
  var LABEL_TIER = { size: 8.5, weight: 400, alpha: 0.30, minV: 0.42, track: 1.5 };

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* Orthographic projection. x/y come back in unit-disc space, y up-negative for
     the canvas, and v is how far the point faces the viewer: v >= 0 is near side. */
  function project(lat, lng, c, o) {
    var p = lat * RAD, l = (lng - c.lng) * RAD, p0 = c.lat * RAD;
    var sp = Math.sin(p), cp = Math.cos(p), s0 = Math.sin(p0), c0 = Math.cos(p0);
    o.v = s0 * sp + c0 * cp * Math.cos(l);
    o.x = cp * Math.sin(l);
    o.y = -(c0 * sp - s0 * cp * Math.cos(l));
    return o;
  }

  var P = { x: 0, y: 0, v: 0 };
  var BX = new Float64Array(2048), BY = new Float64Array(2048), BV = new Float64Array(2048);
  var BL = new Float64Array(2048), BN = new Float64Array(2048);
  var AZ = new Float64Array(2048);

  function ensure(n) {
    if (n > BX.length) {
      BX = new Float64Array(n); BY = new Float64Array(n); BV = new Float64Array(n);
      BL = new Float64Array(n); BN = new Float64Array(n); AZ = new Float64Array(n);
    }
  }

  /* Shortest-path longitude step, for the few rings that close across the
     antimeridian. */
  function lngStep(a, b, t) { return a + ((((b - a) % 360) + 540) % 360 - 180) * t; }

  function projectRing(ring, c) {
    var n = ring.length, k;
    ensure(n);
    for (k = 0; k < n; k++) {
      project(ring[k][1], ring[k][0], c, P);
      BX[k] = P.x; BY[k] = P.y; BV[k] = P.v;
      BL[k] = ring[k][1]; BN[k] = ring[k][0];
    }
    return n;
  }

  /* Land is clipped to the visible hemisphere ring by ring, then projected.
     Snapping far-side vertices onto the limb instead — the obvious shortcut —
     draws chords straight across the face: measured at this anchor, one ring
     with 6% of its vertices in view painted most of the disc as land. Clipping
     cannot do that, because a ring that is mostly behind the horizon simply has
     almost nothing left to draw.

     The visible region is bounded by the horizon, so where a ring dips behind
     it and comes back — Eurasia from an American view touches the disc at
     Chukotka and the Baltic with all of Siberia hidden between — the crossing
     points are joined around the limb, not across the face. Every hidden
     vertex still projects to a plane position, and atan2 of that position is
     its azimuth on the limb circle even for far-side points, so the closure
     simply follows the hidden vertices' azimuths around the circle. Free
     rotation walks into edge-on views of whole continents constantly, and the
     old straight-chord closure painted them as a wedge of land over open
     ocean; the arc closure bounds the fill by the true limb instead.

     The arc is construction, never coast: traceCoast draws only genuinely
     visible segments, so no horizon section is ever stroked as if it were
     shoreline. */

  /* one arc segment every 8 degrees: the chord between two points that close
     on the limb bows inward by R*(1-cos(4°)) ≈ 0.24% of R — under half a pixel
     at this plate's largest size. */
  var ARC_STEP = 8 * RAD;

  function arcTo(az, from) {
    var g = az - from, steps, i, a;
    if (g > Math.PI) g -= TAU; else if (g < -Math.PI) g += TAU;   // shortest wrap
    steps = Math.ceil(Math.abs(g) / ARC_STEP);
    for (i = 1; i <= steps; i++) {
      a = from + g * i / steps;
      ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
    }
    return from + g;    // unwrapped, so the next gap measures from here
  }

  function traceFill(ring, R, c) {
    var n = projectRing(ring, c), i, k, kp, j, t, q;
    var pen = false, onLimb = false, azCur = 0, azStart = 0, arcN = 0, s = 0;
    if (n < 3) return;
    /* start just after a hidden→visible boundary, so a hidden run that
       straddles the array seam is walked as one continuous run instead of
       being split into a lost arc and a bogus chord back to the start */
    if (BV[0] < 0) {
      for (i = 1; i <= n; i++) {
        if (BV[i % n] >= 0 && BV[(i + n - 1) % n] < 0) { s = i % n; break; }
      }
    }
    for (i = 0; i < n; i++) {
      k = (s + i) % n;
      kp = (k + n - 1) % n;
      j = (k + 1) % n;
      if (BV[k] < 0) {
        /* far side: remember where this hidden section sits on the limb */
        if (onLimb && BX[k] * BX[k] + BY[k] * BY[k] > 1e-8) AZ[arcN++] = Math.atan2(BY[k], BX[k]);
        continue;
      }
      if (BV[kp] < 0) {                              // Sutherland–Hodgman in-crossing
        t = BV[kp] / (BV[kp] - BV[k]);
        project(BL[kp] + (BL[k] - BL[kp]) * t, lngStep(BN[kp], BN[k], t), c, P);
        if (onLimb) {                                // close the hidden run around the limb
          AZ[arcN++] = Math.atan2(P.y, P.x);
          for (q = 0; q < arcN; q++) azCur = arcTo(AZ[q], azCur);
          arcN = 0; onLimb = false;
        }
        if (pen) ctx.lineTo(P.x * R, P.y * R);
        else { ctx.moveTo(P.x * R, P.y * R); azStart = Math.atan2(P.y, P.x); pen = true; }
      } else if (!pen) {                             // ring fully in view
        ctx.moveTo(BX[k] * R, BY[k] * R);
        pen = true;
      }
      ctx.lineTo(BX[k] * R, BY[k] * R);
      if (BV[j] < 0) {                               // out-crossing: open the limb arc
        t = BV[k] / (BV[k] - BV[j]);
        project(BL[k] + (BL[j] - BL[k]) * t, lngStep(BN[k], BN[j], t), c, P);
        ctx.lineTo(P.x * R, P.y * R);
        azCur = Math.atan2(P.y, P.x);
        arcN = 0; onLimb = true;
      }
    }
    if (onLimb) {
      /* a hidden run that straddles the array seam closes at the start
         crossing, whose flush point has already gone by inside the loop —
         finish the arc here, from the exit azimuth around to it */
      AZ[arcN++] = azStart;
      for (q = 0; q < arcN; q++) azCur = arcTo(AZ[q], azCur);
    }
  }

  /* Coastline: only the segments genuinely in view. The chords that close the
     fill are construction seams, not coast, so they never get drawn.

     closed=false for the border layer — an admin boundary is an open line, and
     joining its last vertex back to its first would draw a chord across a country. */
  function traceCoast(ring, R, c, closed) {
    var n = projectRing(ring, c), k, j, last = closed ? n : n - 1, pen = false;
    for (k = 0; k < last; k++) {
      j = k + 1 === n ? 0 : k + 1;
      if (BV[k] < 0 || BV[j] < 0) { pen = false; continue; }
      if (!pen) { ctx.moveTo(BX[k] * R, BY[k] * R); pen = true; }
      ctx.lineTo(BX[j] * R, BY[j] * R);
    }
  }

  /* Named once rather than as closures at the call site: these run five times a
     frame, and an arrow literal there would allocate sixty times a second. */
  function coastClosed(ring, R, c) { traceCoast(ring, R, c, true); }
  function coastOpen(ring, R, c) { traceCoast(ring, R, c, false); }

  /* Walk one layer, skipping every polygon whose bounding cap is over the
     horizon. One cosine per polygon stands in for projecting each of its
     vertices, which at 50m is the difference between tracing the whole planet
     and tracing the half of it that can be seen. The cap is conservative: it
     keeps some polygons that are actually hidden, and build-earth.js checks at
     every centre the rotation can reach that it never drops one that is not. */
  function traceLayer(list, R, c, trace) {
    if (!list) return;
    var sl = Math.sin(c.lat * RAD), cl = Math.cos(c.lat * RAD), k, j, cap, rings;
    for (k = 0; k < list.length; k++) {
      cap = list[k][0];
      if (cap[0] * sl + cap[1] * cl * Math.cos((cap[2] - c.lng) * RAD) < cap[3]) continue;
      rings = list[k][1];
      for (j = 0; j < rings.length; j++) trace(rings[j], R, c);
    }
  }

  /* Place names ride the sphere — projected like everything else, so they turn
     with a drag and hold still over the land they name. They fade out as they
     approach the limb and are drawn under the shading and under the markers: the
     dossier map above sets its island names at the same recessive weight, and a
     name must never outrank the site it is sitting next to. */
  function drawLabels(c, R) {
    var canTrack = "letterSpacing" in ctx, i, s, v, a;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    for (i = 0; i < LABELS.length; i++) {
      s = LABELS[i];
      project(s[0], s[1], c, P);
      v = P.v;
      if (v < LABEL_TIER.minV) continue;
      /* ramp to full over the first 40% of the way from horizon to centre */
      a = LABEL_TIER.alpha * clamp((v - LABEL_TIER.minV) / (0.4 * (1 - LABEL_TIER.minV)), 0, 1);
      ctx.globalAlpha = a;
      ctx.font = LABEL_TIER.weight + " " + LABEL_TIER.size + 'px "D-DIN", Arial, sans-serif';
      if (canTrack) ctx.letterSpacing = LABEL_TIER.track + "px";
      ctx.fillText(s[2], P.x * R, P.y * R);
    }
    ctx.globalAlpha = 1;
    if (canTrack) ctx.letterSpacing = "0px";
  }

  /* Parallels every 30° and meridians every 30°, drawn only where the surface
     turns to us — the pen lifts at the horizon. */
  function drawGraticule(c) {
    var lat, lng, k, pen;
    for (lat = -60; lat <= 60; lat += 30) {
      pen = false;
      for (k = 0; k <= 96; k++) {
        project(lat, c.lng - 180 + 360 * k / 96, c, P);
        if (P.v < 0) { pen = false; continue; }
        if (pen) ctx.lineTo(P.x * R, P.y * R); else ctx.moveTo(P.x * R, P.y * R);
        pen = true;
      }
    }
    for (lng = -180; lng < 180; lng += 30) {
      pen = false;
      for (k = 0; k <= 64; k++) {
        project(-90 + 180 * k / 64, lng, c, P);
        if (P.v < 0) { pen = false; continue; }
        if (pen) ctx.lineTo(P.x * R, P.y * R); else ctx.moveTo(P.x * R, P.y * R);
        pen = true;
      }
    }
  }

  var dpr = 1, W = 0, H = 0, R = 0, degPerPx = 1, expensive = false;

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    /* Capped at 2 because a 3x buffer is never worth it, and never capped below
       the device's own ratio. This plate exists to show coastlines and interior
       boundaries as hairlines, and a reduced buffer is the one thing that turns
       them back into mush. The frame cost is paid in cadence instead — see
       `expensive` below. */
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w; H = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    R = 0.4 * h;                 // half-height framing, disc takes 80% of it
    /* Grab-and-drag has to put the surface under the pointer. At the centre of an
       orthographic disc a rotation of t radians moves the surface R*t pixels, so
       one pointer pixel is worth 1/R radians of surface. The obvious 90/R — a
       quarter turn per radius — measures 1.55x too fast. */
    degPerPx = (180 / Math.PI) / R;
    /* Rasterising the disc dominates the frame cost and grows with the buffer
       ratio squared, so the budget is counted in device pixels of disc rather
       than in CSS size — a phone at 2x and a retina laptop at 2x are the same
       problem even though their plates differ threefold. Measured on identical
       geometry, full cadence: 135k and 212k device pixels hold 16.7ms a frame,
       235k lose one vsync in three, 305k one in seven, 542k every other one.
       The ceiling also depends on the page around the plate — 212k was clean in
       a desktop viewport and 235k was not in a phone one — so the budget sits
       below the lowest measured failure rather than at the highest measured
       success. Above it the ambient wander draws every other vsync; drags, the
       arrival turn-in and the tail of a fling keep all of them (see frame). */
    var Rd = R * dpr;
    expensive = Math.PI * Rd * Rd > 200000;
  }

  function draw(c) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, s;

    /* body — lit slightly high and left so it reads as a sphere, not a disc */
    var body = ctx.createRadialGradient(cx - R * 0.34, cy - R * 0.4, R * 0.1, cx, cy, R);
    body.addColorStop(0, "#17171b");
    body.addColorStop(0.62, "#101013");
    body.addColorStop(1, "#08080a");
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
    ctx.fillStyle = body; ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    ctx.translate(cx, cy);

    /* graticule — same hairline weight as the dossier map's own grid */
    ctx.strokeStyle = "rgba(255,255,255,.055)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    drawGraticule(c);
    ctx.stroke();

    if (GEO) {
      /* Land reads clearly against the body gradient — the plate exists to
         answer "where on Earth is this site", and land you cannot see answers
         nothing — while staying under the white markers, the loudest thing on
         the plate. */
      ctx.beginPath();
      traceLayer(GEO.land, R, c, traceFill);
      ctx.fillStyle = "#3b3b43";
      ctx.fill("evenodd");

      /* Indonesia lifted above it. Every site on this globe is in the country,
         and a coastline — however detailed — does not say so on its own. Drawn
         over the union layer rather than cut out of it, because Borneo and New
         Guinea are single merged polygons there. */
      ctx.beginPath();
      traceLayer(GEO.idn, R, c, traceFill);
      ctx.fillStyle = "#5d5d67";
      ctx.fill("evenodd");

      /* Coastline first, then interior boundaries over it at a heavier weight.
         The interior lines are what answers "which country is this site in" —
         the coast only says land — and with the country names gone they are
         the only thing on the sphere that says it. */
      ctx.beginPath();
      traceLayer(GEO.land, R, c, coastClosed);
      traceLayer(GEO.idn, R, c, coastClosed);
      ctx.strokeStyle = "rgba(255,255,255,.30)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      traceLayer(GEO.border, R, c, coastOpen);
      ctx.strokeStyle = "rgba(255,255,255,.40)";
      ctx.lineWidth = 0.85;
      ctx.stroke();

      /* Indonesia's own outline, brightest of the three */
      ctx.beginPath();
      traceLayer(GEO.idn, R, c, coastClosed);
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* Names sit under the limb shading, so a label turning away darkens with the
       surface it is printed on. They are copy, not geometry: they still draw when
       the script fails. */
    drawLabels(c, R);

    /* limb darkening, so the edge of the disc reads as curvature */
    var shade = ctx.createRadialGradient(0, 0, R * 0.25, 0, 0, R);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(0.62, "rgba(0,0,0,.06)");
    shade.addColorStop(0.84, "rgba(0,0,0,.30)");
    shade.addColorStop(0.95, "rgba(0,0,0,.64)");
    shade.addColorStop(1, "rgba(0,0,0,.84)");
    ctx.fillStyle = shade;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();

    /* sites — the HQ weight gets a ring as well as a larger dot */
    for (s = 0; s < SITES.length; s++) {
      project(SITES[s][0], SITES[s][1], c, P);
      if (P.v < 0) continue;
      var rad = 1.6 + SITES[s][2] * 90;
      ctx.globalAlpha = clamp(P.v * 3.2, 0, 1);
      ctx.beginPath(); ctx.arc(P.x * R, P.y * R, rad, 0, TAU);
      ctx.fillStyle = "#fff"; ctx.fill();
      if (SITES[s][2] > 0.02) {
        ctx.beginPath(); ctx.arc(P.x * R, P.y * R, rad + 3.5, 0, TAU);
        ctx.strokeStyle = "rgba(255,255,255,.34)"; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    /* limb */
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
    ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = 1; ctx.stroke();
  }

  var cur = { lat: ANCHOR.lat, lng: ANCHOR.lng };
  var goal = { lat: ANCHOR.lat, lng: ANCHOR.lng };
  var vel = { lat: 0, lng: 0 };    // deg/s of momentum left over from a fling
  resize();
  if (!reduced) { cur.lng -= 26; cur.lat += 8; }   // turns into frame on arrival

  var dragging = false, onScreen = false, raf = null, prev = 0, t0 = 0, lastX = 0, lastY = 0;
  var lastMoveT = 0, dragVLng = 0, dragVLat = 0;
  var lag = 99;                    // degrees still to cover; 99 keeps the first frame at full cadence

  function play() { if (raf === null && onScreen) raf = requestAnimationFrame(frame); }

  function frame(now) {
    raf = null;
    if (!onScreen) return;
    /* Half cadence on an expensive disc: draw every other vsync so each drawn
       frame has a 33ms budget instead of 16.7ms. prev is deliberately left stale
       so the next drawn frame eases over the whole skipped interval.
       Gated on lag because only the ambient wander is cheap enough to halve. At
       its peak the wander moves the surface 0.16px a frame at 30fps, which is not
       visible; the arrival turn-in and the tail of a fling cover tens of
       degrees and would step by 17px. They keep every vsync until they decay
       inside 1.5 degrees, a band the wander's own steady-state lag of about 0.4
       degrees never leaves. */
    if (expensive && !dragging && !reduced && lag < 1.5 && prev && now - prev < 30) { play(); return; }
    if (!t0) t0 = now;
    var dt = prev ? clamp((now - prev) / 1000, 0.004, 0.1) : 0.016;
    var t = (now - t0) / 1000;
    prev = now;

    /* A fling carries the sphere and bleeds off exponentially. Longitude is
       unbounded — cos and sin are periodic, so 400 degrees projects exactly
       like 40 — and latitude stops dead at the cap rather than sliding back
       down it. Both shift by whole turns together, so nothing jumps. */
    if (!dragging && (vel.lng || vel.lat)) {
      goal.lng += vel.lng * dt;
      goal.lat = clamp(goal.lat + vel.lat * dt, -LAT_LIMIT, LAT_LIMIT);
      if (goal.lat === -LAT_LIMIT || goal.lat === LAT_LIMIT) vel.lat = 0;
      var decay = Math.exp(-dt * 2.2);
      vel.lng *= decay; vel.lat *= decay;
      if (vel.lng < 1 && vel.lng > -1 && vel.lat < 1 && vel.lat > -1) { vel.lng = 0; vel.lat = 0; }
    }
    if (!dragging && (goal.lng > 720 || goal.lng < -720)) {
      var turn = Math.round(goal.lng / 360) * 360;
      goal.lng -= turn; cur.lng -= turn;   // tidy the numbers; the view does not move
    }
    /* Two unrelated periods so the drift never quite repeats. Added at draw
       time and never accumulated, so it cannot walk the sphere away from
       wherever the visitor left it. */
    var wanderLng = reduced ? 0 : Math.sin(t * 0.24) * 5.5 + Math.sin(t * 0.11 + 2.1) * 2.8;
    var wanderLat = reduced ? 0 : Math.sin(t * 0.17 + 1.1) * 1.7;

    /* Frame-rate independent ease: one constant for the arrival, the drag
       follow and the spin decay. */
    var k = reduced ? 1 : 1 - Math.exp(-dt * 3.4);
    cur.lng += (goal.lng + wanderLng - cur.lng) * k;
    cur.lat += (goal.lat + wanderLat - cur.lat) * k;
    lag = Math.max(Math.abs(goal.lng + wanderLng - cur.lng), Math.abs(goal.lat + wanderLat - cur.lat));

    draw(cur);

    /* With reduced motion there is no drift to keep alive, so the loop stops once
       the sphere is at its pose and only restarts on a pointer or a new frame of
       geometry. Nothing repaints 60 times a second to show the same image. */
    var settled = Math.abs(goal.lng - cur.lng) < 0.01 && Math.abs(goal.lat - cur.lat) < 0.01;
    if (!(reduced && settled && !dragging)) play();
  }

  function loadGeometry() {
    if (geoRequested) return;
    geoRequested = true;
    if (window.EARTH_50M && window.EARTH_50M.land) { GEO = window.EARTH_50M; play(); return; }
    /* A classic <script src>, injected on first view — the one load path that
       works from file:// as well as over HTTP. fetch() of a local file is
       blocked by the browser outright, which is exactly how a static site like
       this one gets opened. */
    var s = document.createElement("script");
    s.src = new URL("assets/geo/earth-50m.js", document.baseURI).href;
    s.onload = function () {
      if (window.EARTH_50M && window.EARTH_50M.land) { GEO = window.EARTH_50M; play(); }
    };
    s.onerror = function () { /* graticule, island names and markers alone still read */ };
    document.head.appendChild(s);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var seen = entries[0].isIntersecting;
      if (seen && !onScreen) prev = 0;
      onScreen = seen;
      if (onScreen) { loadGeometry(); play(); }
    }, { rootMargin: "120px 0px" }).observe(stage);
  } else {
    onScreen = true;
    loadGeometry();
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { resize(); draw(cur); }).observe(stage);
  } else {
    window.addEventListener("resize", function () { resize(); draw(cur); });
  }

  /* The place names are set in D-DIN. If the face lands after the first paint the
     loop would go on drawing them in the fallback, and under reduced motion the
     loop has already parked — so ask for one more frame once fonts settle. */
  if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
    document.fonts.ready.then(function () { play(); });
  }

  if (window.PointerEvent) {
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      vel.lng = 0; vel.lat = 0;        // a grab kills any fling still in flight
      dragVLng = 0; dragVLat = 0;
      lastX = e.clientX; lastY = e.clientY; lastMoveT = e.timeStamp;
      stage.classList.add("is-dragging", "is-touched");
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      play();
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      /* grab-and-drag: the surface follows the pointer, so the centre moves the
         other way in longitude and the same way in latitude */
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      goal.lng -= dx * degPerPx;
      goal.lat = clamp(goal.lat + dy * degPerPx, -LAT_LIMIT, LAT_LIMIT);
      /* momentum estimate: a blend of the instantaneous velocities, so one
         jittery move cannot throw the sphere the moment the finger lifts */
      var dtm = clamp((e.timeStamp - lastMoveT) / 1000, 0.004, 0.1);
      dragVLng = dragVLng * 0.72 - (dx * degPerPx / dtm) * 0.28;
      dragVLat = dragVLat * 0.72 + (dy * degPerPx / dtm) * 0.28;
      lastX = e.clientX; lastY = e.clientY; lastMoveT = e.timeStamp;
      play();
    });
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    function endDrag(e) {
      if (dragging) {
        /* keep the pointer's velocity, capped, unless it has stalled — a press-
           and-hold must not launch the sphere on release. Reduced motion gets
           none at all: the surface stops where the finger leaves it. */
        if (e.timeStamp - lastMoveT > 90) { dragVLng = 0; dragVLat = 0; }
        vel.lng = reduced ? 0 : clamp(dragVLng, -240, 240);
        vel.lat = reduced ? 0 : clamp(dragVLat, -120, 120);
      }
      dragging = false;
      lastMoveT = 0;
      dragVLng = 0; dragVLat = 0;
      stage.classList.remove("is-dragging");
      play();
    }
  }

  play();
})();
