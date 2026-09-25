/* ==========================================================================
   PRECIOUS MOTION - script.js (vanilla JS, no libraries)
   CONTACT SETTINGS - EDIT HERE:
   - WHATSAPP_NUMBER: your WhatsApp number in international format,
     digits only, no plus or spaces. Example: "2348012345678".
     Leave as "" until ready. When blank, the form offers copy only
     and never links to a fake WhatsApp address.
   - EMAIL: your public email, or "" to show "details coming soon".
   - SOCIALS: add real profile links, or leave empty to hide them.
     Example: [{ label: "Instagram", url: "https://instagram.com/..." }]
   ========================================================================== */
const CONTACT = {
  WHATSAPP_NUMBER: "",
  EMAIL: "",
  SOCIALS: []
};

(function () {
  "use strict";
  document.documentElement.classList.add("js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Current year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Accessible mobile menu ---------- */
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");
  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      const first = nav.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
  }
  if (toggle && nav) {
    setMenu(false);
    toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
  }

  /* ---------- Pause decorative motion ---------- */
  const pauseBtn = document.getElementById("motionPause");
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      const paused = document.body.classList.toggle("paused");
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.textContent = paused ? "Resume background motion" : "Pause background motion";
    });
    if (prefersReducedMotion) {
      document.body.classList.add("paused");
      pauseBtn.setAttribute("aria-pressed", "true");
      pauseBtn.textContent = "Resume background motion";
    }
  }

  /* ---------- Scroll reveals (content stays visible without JS) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Prompt to possibility slider ---------- */
  const slider = document.getElementById("promptSlider");
  const grade = document.getElementById("promptGrade");
  const pct = document.getElementById("promptPct");
  const steps = Array.from(document.querySelectorAll(".prompt-steps li"));
  function renderPrompt() {
    if (!slider || !grade) return;
    const v = Number(slider.value);
    grade.style.opacity = String(v / 100);
    if (pct) pct.textContent = v + "%";
    let active = 0;
    if (v >= 75) active = 3; else if (v >= 50) active = 2; else if (v >= 25) active = 1;
    steps.forEach((li, i) => li.classList.toggle("active", i === active));
  }
  if (slider) {
    renderPrompt();
    slider.addEventListener("input", renderPrompt);
  }

  /* ---------- Video showcase ----------
     Each <video> starts with NO src or poster, only data-src / data-poster.
     On play press (or desktop hover) JS copies data-src to src and
     data-poster to poster, then plays. This defers all downloads until
     the visitor shows interest. Missing files show a friendly message. */
  const cards = Array.from(document.querySelectorAll(".video-card"));
  const videos = [];

  function loadSource(video) {
    if (video.dataset.loaded === "true") return true;
    const src = (video.getAttribute("data-src") || "").trim();
    if (!src || src.indexOf("videos/") !== 0) {
      // Placeholder path, not a real file yet.
    }
    if (!src) return false;
    const poster = (video.getAttribute("data-poster") || "").trim();
    if (poster) video.setAttribute("poster", poster);
    video.src = src;
    video.dataset.loaded = "true";
    try { video.load(); } catch (err) { /* ignore */ }
    return true;
  }

  function setPlaying(card, playing) {
    const btn = card.querySelector(".play-btn");
    if (btn) {
      btn.setAttribute("aria-pressed", String(playing));
      const base = btn.getAttribute("aria-label") || "Preview";
      btn.setAttribute("aria-label", playing ? base.replace("Play", "Pause") : base.replace("Pause", "Play"));
      btn.querySelector("span").textContent = playing ? "❚❚" : "▶";
    }
  }

  function showError(card, msg) {
    const err = card.querySelector(".video-error");
    if (err) {
      err.hidden = false;
      err.textContent = msg;
    }
  }

  cards.forEach((card) => {
    const video = card.querySelector("video");
    const btn = card.querySelector(".play-btn");
    if (!video || !btn) return;
    videos.push({ card, video });

    video.addEventListener("error", () => {
      showError(card, "Preview coming soon. This slot is ready for the final film.");
      setPlaying(card, false);
    }, true);
    const srcEl = video.querySelector("source");
    if (srcEl) srcEl.addEventListener("error", () => {
      showError(card, "Preview coming soon. This slot is ready for the final film.");
    });

    btn.addEventListener("click", () => {
      if (video.paused) {
        const ok = loadSource(video);
        if (!ok) {
          showError(card, "Preview coming soon. This slot is ready for the final film.");
          return;
        }
        card.querySelector(".video-error").hidden = true;
        video.muted = true;
        const p = video.play();
        if (p && typeof p.catch === "function") {
          p.then(() => {
            card.querySelector(".video-frame").classList.add("has-video");
            setPlaying(card, true);
          }).catch(() => {
            showError(card, "Preview coming soon. This slot is ready for the final film.");
          });
        } else {
          card.querySelector(".video-frame").classList.add("has-video");
          setPlaying(card, true);
        }
      } else {
        video.pause();
        setPlaying(card, false);
      }
    });

    // Desktop hover preview: muted autoplay only, never with reduced motion.
    if (canHover && !prefersReducedMotion) {
      card.addEventListener("mouseenter", () => {
        if (!video.paused) return;
        if (btn.getAttribute("data-touched") === "true") return;
        const ok = loadSource(video);
        if (!ok) return;
        video.muted = true;
        const p = video.play();
        if (p && typeof p.catch === "function") {
          p.then(() => {
            card.querySelector(".video-frame").classList.add("has-video");
            setPlaying(card, true);
          }).catch(() => { /* stay on fallback */ });
        }
      });
      card.addEventListener("mouseleave", () => {
        if (btn.getAttribute("data-touched") !== "true" && !video.paused) {
          video.pause();
          setPlaying(card, false);
        }
      });
      btn.addEventListener("click", () => btn.setAttribute("data-touched", "true"), { once: true });
    }

    video.addEventListener("pause", () => setPlaying(card, false));
  });

  // Stop playback when cards leave the viewport.
  if ("IntersectionObserver" in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) {
          const v = en.target.querySelector("video");
          if (v && !v.paused) v.pause();
        }
      });
    }, { threshold: 0.2 });
    cards.forEach((c) => vio.observe(c));
  }
  // Stop playback when the tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) videos.forEach(({ video }) => { if (!video.paused) video.pause(); });
  });

  /* ---------- Package buttons preselect the form ---------- */
  const serviceSelect = document.getElementById("fService");
  document.querySelectorAll(".package-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const pkg = b.getAttribute("data-package");
      if (serviceSelect && pkg) {
        const opt = Array.from(serviceSelect.options).find((o) => o.value === pkg || o.text === pkg);
        if (opt) serviceSelect.value = opt.value || opt.text;
      }
      document.getElementById("contact").scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      const name = document.getElementById("fName");
      if (name) name.focus({ preventScroll: true });
    });
  });

  /* ---------- Contact: prepare, review, WhatsApp or copy ---------- */
  const form = document.getElementById("enquiryForm");
  const waNumber = (CONTACT.WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const waValid = /^\d{7,15}$/.test(waNumber);

  const whatsLine = document.querySelector("#contactWhats span");
  const mailLine = document.querySelector("#contactMail span");
  if (whatsLine) whatsLine.textContent = waValid ? "+" + waNumber : "details coming soon";
  if (mailLine) mailLine.textContent = CONTACT.EMAIL ? CONTACT.EMAIL : "details coming soon";

  // Footer socials: only render when real destinations exist.
  const socialNav = document.getElementById("footerSocial");
  if (socialNav && Array.isArray(CONTACT.SOCIALS) && CONTACT.SOCIALS.length) {
    CONTACT.SOCIALS.forEach((s) => {
      if (!s || !s.url) return;
      const a = document.createElement("a");
      a.href = s.url;
      a.textContent = s.label || "Profile";
      a.target = "_blank";
      a.rel = "noopener";
      socialNav.appendChild(a);
    });
    socialNav.hidden = false;
  }

  // Floating WhatsApp button.
  const waFloat = document.getElementById("waFloat");
  if (waFloat) {
    if (waValid) {
      waFloat.href = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent("Hello Precious Motion. I would like a video quote.");
      waFloat.setAttribute("aria-label", "Chat on WhatsApp");
    } else {
      waFloat.href = "#contact";
      waFloat.setAttribute("aria-label", "Chat on WhatsApp (contact details coming soon)");
    }
  }

  function buildMessage() {
    const name = document.getElementById("fName").value.trim();
    const service = serviceSelect ? serviceSelect.value : "";
    const email = document.getElementById("fEmail").value.trim();
    const brief = document.getElementById("fBrief").value.trim();
    let msg = "Hello Precious Motion. I would like a video quote.\n";
    msg += "Name: " + name + "\nService: " + service + "\n";
    if (email) msg += "Email: " + email + "\n";
    msg += "Brief: " + brief;
    return { msg, name, brief };
  }

  async function copyText(text, fallbackTarget) {
    try {
      if (navigator.clipboard && window.isSecureContext !== false) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) { /* fall through to manual */ }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) return true;
    } catch (err) { /* fall through */ }
    if (fallbackTarget) {
      fallbackTarget.value = text;
      fallbackTarget.focus();
      fallbackTarget.select();
    }
    return false;
  }

  if (form) {
    const errBox = document.getElementById("formError");
    const preview = document.getElementById("briefPreview");
    const briefText = document.getElementById("briefText");
    const waContinue = document.getElementById("waContinue");
    const copyBtn = document.getElementById("copyBrief");
    const note = document.getElementById("briefNote");
    const manual = document.getElementById("manualCopy");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { msg, name, brief } = buildMessage();
      if (!name || !brief) {
        errBox.hidden = false;
        return;
      }
      errBox.hidden = true;
      preview.hidden = false;
      briefText.textContent = msg;
      manual.value = msg;

      if (waValid) {
        waContinue.hidden = false;
        waContinue.href = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(msg);
        note.textContent = "Review your brief above, then choose Continue to WhatsApp to send it from your own chat. Nothing is sent automatically.";
      } else {
        waContinue.hidden = true;
        note.textContent = "Direct WhatsApp details are coming soon. Copy your brief below and keep it ready to send once contact details are published.";
      }
      preview.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const text = briefText.textContent || manual.value;
        const ok = await copyText(text, manual);
        copyBtn.textContent = ok ? "Copied" : "Select the text below to copy";
        setTimeout(() => { copyBtn.textContent = "Copy brief"; }, 2200);
      });
    }
  }
})();
