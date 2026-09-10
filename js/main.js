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
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
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
        deckStatus.textContent = "Plate " + (deckAt + 1) + " of " + deckTotal + " — " +
          deckCaps[deckAt].textContent.replace(/\s+/g, " ").trim();
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
    if (p && p.catch) { p.catch(function () {}); }
  });
  video.addEventListener("ended", function () {
    wrap.classList.remove("is-playing");
    video.removeAttribute("controls");
  });
})();

/* Footprints globe — a hand-rolled orthographic sphere on 2D canvas.

   Coastline geometry is Natural Earth 110m land (public domain), converted
   offline into a compact ring array at assets/geo/land-110m.json.

   There is deliberately no globe library here. The WebGL option we tried first
   drew its land mask from a texture address book that disagrees with how it
   places markers: at every southern-hemisphere anchor the sites floated in open
   water under a straight clipped edge. Since this section is about Indonesia,
   that is the one thing it must not get wrong. Owning the projection reduces
   the view centre to a plain latitude and longitude, and land and markers go
   through the same function, so they cannot drift apart.

   The plate is an enrichment of the inline dossier map above it. If the
   geometry fetch fails the graticule and the site markers still draw. */
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

  /* Where the sphere settles when nothing is pulling it: the Banda Sea, so
     Sumatra in the west and Halmahera in the east both sit inside the disc. */
  var ANCHOR = { lat: -3, lng: 115.5 };
  var MAX_LAT = 35;   // stop well short of the poles
  var MAX_LNG = 70;

  var RAD = Math.PI / 180;
  var TAU = Math.PI * 2;
  var LAND = null;          // polygons -> rings -> [lng, lat]
  var geoRequested = false;

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
  var SX = new Float64Array(4096), SY = new Float64Array(4096);

  function ensure(n) {
    if (n > BX.length) {
      BX = new Float64Array(n); BY = new Float64Array(n); BV = new Float64Array(n);
      BL = new Float64Array(n); BN = new Float64Array(n);
    }
    if (2 * n > SX.length) { SX = new Float64Array(2 * n); SY = new Float64Array(2 * n); }
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

     What clipping does cost us: where a continent runs off the edge of the
     visible hemisphere, its fill closes on a straight cut rather than following
     the horizon. Choosing the right horizon arc for that closure needs the
     polygon's winding order, which TopoJSON does not guarantee. So the cut is
     never stroked — only real coastline is — and the limb darkening in draw()
     is graded hard enough that the cut lands in the shadow band. Measured cost:
     1.0% of samples disagree with the source data inside 0.75 of the radius. */
  function traceFill(ring, R, c) {
    var n = projectRing(ring, c), k, j, m = 0, t;
    for (k = 0; k < n; k++) {
      j = k + 1 === n ? 0 : k + 1;
      if (BV[k] >= 0) { SX[m] = BX[k]; SY[m] = BY[k]; m++; }
      if ((BV[k] >= 0) !== (BV[j] >= 0)) {           // Sutherland–Hodgman crossing
        t = BV[k] / (BV[k] - BV[j]);
        project(BL[k] + (BL[j] - BL[k]) * t, lngStep(BN[k], BN[j], t), c, P);
        SX[m] = P.x; SY[m] = P.y; m++;
      }
    }
    if (m < 3) return;                               // nothing of it is in view
    ctx.moveTo(SX[0] * R, SY[0] * R);
    for (k = 1; k < m; k++) ctx.lineTo(SX[k] * R, SY[k] * R);
  }

  /* Coastline: only the segments genuinely in view. The chords that close the
     fill are construction seams, not coast, so they never get drawn. */
  function traceCoast(ring, R, c) {
    var n = projectRing(ring, c), k, j, pen = false;
    for (k = 0; k < n; k++) {
      j = k + 1 === n ? 0 : k + 1;
      if (BV[k] < 0 || BV[j] < 0) { pen = false; continue; }
      if (!pen) { ctx.moveTo(BX[k] * R, BY[k] * R); pen = true; }
      ctx.lineTo(BX[j] * R, BY[j] * R);
    }
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

  var dpr = 1, W = 0, H = 0, R = 0, degPerPx = 1;

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    /* capped at 2: the plate is redrawn every frame and a 3× buffer would put
       more pixels through the path than the motion is worth */
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
  }

  function draw(c) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, i, j, s;

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

    if (LAND) {
      /* land — lifted to roughly --hairline-dark so white markers stay dominant */
      ctx.beginPath();
      for (i = 0; i < LAND.length; i++) for (j = 0; j < LAND[i].length; j++) traceFill(LAND[i][j], R, c);
      ctx.fillStyle = "#343437";
      ctx.fill("evenodd");
      ctx.beginPath();
      for (i = 0; i < LAND.length; i++) for (j = 0; j < LAND[i].length; j++) traceCoast(LAND[i][j], R, c);
      ctx.strokeStyle = "rgba(255,255,255,.14)";
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }

    /* limb darkening, so the edge of the disc reads as curvature. Graded hard:
       it also carries the horizon cuts that traceFill has to close with a chord. */
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
  var off = { lat: 0, lng: 0 };
  resize();
  if (!reduced) { cur.lng -= 26; cur.lat += 8; }   // turns into frame on arrival

  var dragging = false, onScreen = false, raf = null, prev = 0, t0 = 0, lastX = 0, lastY = 0;

  function play() { if (raf === null && onScreen) raf = requestAnimationFrame(frame); }

  function frame(now) {
    raf = null;
    if (!onScreen) return;
    if (!t0) t0 = now;
    var dt = prev ? clamp((now - prev) / 1000, 0.004, 0.1) : 0.016;
    var t = (now - t0) / 1000;
    prev = now;

    if (!dragging && !reduced) {
      var decay = Math.exp(-dt * 2.4);
      off.lat *= decay;
      off.lng *= decay;
    }
    /* Two unrelated periods so the drift never quite repeats, and never travels
       far enough to lose the archipelago. */
    var wanderLng = reduced ? 0 : Math.sin(t * 0.24) * 5.5 + Math.sin(t * 0.11 + 2.1) * 2.8;
    var wanderLat = reduced ? 0 : Math.sin(t * 0.17 + 1.1) * 1.7;
    var goalLng = ANCHOR.lng + clamp(off.lng + wanderLng, -MAX_LNG, MAX_LNG);
    var goalLat = ANCHOR.lat + clamp(off.lat + wanderLat, -MAX_LAT, MAX_LAT);

    /* Frame-rate independent ease: one constant for the arrival and the settle-back. */
    var k = reduced ? 1 : 1 - Math.exp(-dt * 3.4);
    cur.lng += (goalLng - cur.lng) * k;
    cur.lat += (goalLat - cur.lat) * k;

    draw(cur);

    /* With reduced motion there is no drift to keep alive, so the loop stops once
       the sphere is at its pose and only restarts on a pointer or a new frame of
       geometry. Nothing repaints 60 times a second to show the same image. */
    var settled = Math.abs(goalLng - cur.lng) < 0.01 && Math.abs(goalLat - cur.lat) < 0.01;
    if (!(reduced && settled && !dragging)) play();
  }

  function loadGeometry() {
    if (geoRequested || !window.fetch) return;
    geoRequested = true;
    fetch(new URL("assets/geo/land-110m.json", document.baseURI).href)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.length) LAND = d;
        play();                       // the loop may already have parked at its pose
      })
      .catch(function () { /* graticule and markers alone still read */ });
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

  if (window.PointerEvent) {
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      stage.classList.add("is-dragging", "is-touched");
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      play();
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      /* grab-and-drag: the surface follows the pointer, so the centre moves the
         other way in longitude and the same way in latitude */
      off.lng = clamp(off.lng - (e.clientX - lastX) * degPerPx, -MAX_LNG, MAX_LNG);
      off.lat = clamp(off.lat + (e.clientY - lastY) * degPerPx, -MAX_LAT, MAX_LAT);
      lastX = e.clientX; lastY = e.clientY;
      play();
    });
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    function endDrag() {
      dragging = false;
      stage.classList.remove("is-dragging");
      play();
    }
  }

  play();
})();
