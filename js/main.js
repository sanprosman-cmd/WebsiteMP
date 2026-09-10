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
