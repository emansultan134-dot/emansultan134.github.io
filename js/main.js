/**
 * Eman Sultan — portfolio interactions
 *
 * Add real contact details here before publishing. Leave a value empty
 * until it is real. Do not insert placeholder addresses.
 *
 *   email: "name@domain.com"
 *   linkedin: "https://www.linkedin.com/in/your-profile"
 *   otherLabel: "Instagram"
 *   otherUrl: "https://instagram.com/your-profile"
 */
const CONTACT = {
  email: "emansultan134@gmail.com",
  linkedin: "",
  otherLabel: "",
  otherUrl: ""
};

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileNavQuery = window.matchMedia("(max-width: 1040px)");

document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const nav = document.querySelector("#primary-nav");
const navToggle = document.querySelector(".nav-toggle");
const main = document.querySelector("#main");
const footer = document.querySelector(".site-footer");
const dialog = document.querySelector("#project-dialog");
const form = document.querySelector("#contact-form");

function setCurrent(id) {
  document.querySelectorAll('.nav-list a[href^="#"]:not(.btn)').forEach((link) => {
    if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function closeMenu() {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
  document.documentElement.classList.remove("nav-open");
  syncNavInert();
}

function openMenu() {
  if (!nav || !navToggle) return;
  nav.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Close menu");
  document.documentElement.classList.add("nav-open");
  syncNavInert();
  const firstLink = nav.querySelector("a");
  if (firstLink) firstLink.focus();
}

function syncNavInert() {
  if (!nav) return;
  const lock = mobileNavQuery.matches && nav.classList.contains("is-open");
  main?.toggleAttribute("inert", lock);
  footer?.toggleAttribute("inert", lock);
  if (mobileNavQuery.matches && !nav.classList.contains("is-open")) nav.setAttribute("inert", "");
  else nav.removeAttribute("inert");
}

if (header) {
  const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  document.addEventListener("scroll", onScroll, { passive: true });
}

navToggle?.addEventListener("click", () => {
  if (nav.classList.contains("is-open")) {
    closeMenu();
    navToggle.focus();
  } else {
    openMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    closeMenu();
    navToggle?.focus();
  }
});

mobileNavQuery.addEventListener("change", () => {
  closeMenu();
  syncNavInert();
});
syncNavInert();

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const id = link.getAttribute("href").slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const menuWasOpen = nav?.classList.contains("is-open");
  closeMenu();
  target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  if (history.pushState) history.pushState(null, "", `#${id}`);
  if (!menuWasOpen) target.focus({ preventScroll: true });
});

const sectionMap = [
  ["home", "home"],
  ["about", "about"],
  ["services", "services"],
  ["process", "services"],
  ["portfolio", "portfolio"],
  ["skills", "skills"],
  ["why", "skills"],
  ["testimonials", "contact"],
  ["contact", "contact"]
];

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const mapped = sectionMap.find(([id]) => id === entry.target.id);
        if (mapped) setCurrent(mapped[1]);
      });
    },
    { rootMargin: "-42% 0px -48% 0px", threshold: 0 }
  );
  sectionMap.forEach(([id]) => {
    const section = document.getElementById(id);
    if (section) navObserver.observe(section);
  });
}
setCurrent("home");

const revealItems = document.querySelectorAll(".reveal");
const dashboard = document.querySelector(".dashboard");

function armDashboard() {
  dashboard?.classList.add("is-live");
}

if (prefersReduced || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-inview"));
  armDashboard();
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  revealItems.forEach((item) => {
    if (item.getBoundingClientRect().top < window.innerHeight * 0.92) item.classList.add("is-inview");
    else revealObserver.observe(item);
  });

  if (dashboard) {
    if (dashboard.getBoundingClientRect().top < window.innerHeight * 0.94) armDashboard();
    else {
      const dashObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            armDashboard();
            dashObserver.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      dashObserver.observe(dashboard);
    }
  }
}

let lastTrigger = null;

function openProject(card, trigger) {
  if (!dialog || !card) return;
  const title = dialog.querySelector("#dialog-title");
  const industry = dialog.querySelector("#dialog-industry");
  const summary = dialog.querySelector("#dialog-summary");
  const services = dialog.querySelector("#dialog-services");
  const visit = dialog.querySelector("#dialog-visit");

  title.textContent = card.querySelector(".project-title")?.textContent.trim() || "Project";
  industry.textContent = card.querySelector(".project-industry")?.textContent.trim() || "";
  summary.textContent = card.querySelector(".project-copy")?.textContent.trim() || "";
  services.replaceChildren();
  card.querySelectorAll(".tag-list li").forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.textContent.trim();
    services.appendChild(li);
  });

  const url = card.getAttribute("data-url");
  if (url) {
    visit.href = url;
    visit.hidden = false;
    visit.rel = "noopener noreferrer";
    visit.target = "_blank";
  } else {
    visit.hidden = true;
    visit.removeAttribute("href");
  }

  lastTrigger = trigger || card.querySelector(".view-project");
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

document.querySelector(".dialog-close")?.addEventListener("click", () => {
  dialog?.close();
});

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    openProject(card, event.target.closest(".view-project") || card.querySelector(".view-project"));
  });
});

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog?.addEventListener("close", () => {
  lastTrigger?.focus();
});

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeUrl(value) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function upgradeContactLink(slotName, href, text, labelText) {
  const slot = document.querySelector(`[data-slot="${slotName}"]`);
  if (!slot || !href) return;
  if (labelText) {
    const label = slot.querySelector(".contact-label");
    if (label) label.textContent = labelText;
  }
  const link = document.createElement("a");
  link.className = "contact-value";
  link.href = href;
  link.textContent = text;
  if (!href.startsWith("mailto:")) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  slot.querySelector(".contact-value")?.replaceWith(link);
}

if (looksLikeEmail(CONTACT.email.trim())) {
  upgradeContactLink("email", `mailto:${CONTACT.email.trim()}`, CONTACT.email.trim());
}
if (CONTACT.linkedin.trim()) {
  upgradeContactLink("linkedin", normalizeUrl(CONTACT.linkedin.trim()), "Open profile");
}
if (CONTACT.otherUrl.trim()) {
  upgradeContactLink(
    "other",
    normalizeUrl(CONTACT.otherUrl.trim()),
    "Open profile",
    CONTACT.otherLabel.trim() || "Profile"
  );
}

function setFieldError(field, message) {
  const error = document.getElementById(`${field.id}-error`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message || "";
}

function openMailDraft(subject, body) {
  const mailto = `mailto:${CONTACT.email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

async function sendToInbox(fields) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONTACT.email.trim())}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      name: fields.name,
      email: fields.email,
      message: fields.message,
      _replyto: fields.email,
      _subject: fields.subject,
      _template: "table",
      _captcha: "false"
    })
  });
  if (!response.ok) throw new Error("Delivery failed");
  const data = await response.json();
  if (String(data.success) !== "true") throw new Error(data.message || "Delivery failed");
}

if (form) {
  form.noValidate = true;
  const success = document.getElementById("form-success");
  const submitButton = form.querySelector('[type="submit"]');

  form.addEventListener("input", () => {
    if (success && !success.hidden) success.hidden = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const subject = form.querySelector("#subject");
    const message = form.querySelector("#message");
    const company = form.querySelector("#company");
    const service = form.querySelector("#service-needed");
    const honey = form.querySelector('[name="_honey"]');

    let valid = true;
    const nameValue = name?.value.trim() || "";
    const emailValue = email?.value.trim() || "";
    const subjectValue = subject?.value.trim() || "";
    const messageValue = message?.value.trim() || "";

    if (name) {
      if (!nameValue) {
        setFieldError(name, "Please enter your name.");
        valid = false;
      } else setFieldError(name, "");
    }

    if (email) {
      if (!looksLikeEmail(emailValue)) {
        setFieldError(email, "Please enter a valid email address.");
        valid = false;
      } else setFieldError(email, "");
    }

    if (subject) {
      if (!subjectValue) {
        setFieldError(subject, "Please enter a subject.");
        valid = false;
      } else setFieldError(subject, "");
    }

    if (service) {
      if (!service.value) {
        setFieldError(service, "Please select a service.");
        valid = false;
      } else setFieldError(service, "");
    }

    if (message) {
      if (!messageValue) {
        setFieldError(message, "Please enter a message.");
        valid = false;
      } else setFieldError(message, "");
    }

    if (!valid) {
      form.querySelector("[aria-invalid='true']")?.focus();
      return;
    }

    if (honey?.value) return;

    const mailSubject = subjectValue || `SEO inquiry from ${nameValue}`;
    const lines = [
      `Name: ${nameValue}`,
      `Email: ${emailValue}`,
      `Subject: ${mailSubject}`
    ];
    if (company) lines.push(`Company / Website: ${company.value.trim() || "Not provided"}`);
    if (service) lines.push(`Service needed: ${service.value}`);
    lines.push("", messageValue);
    const mailBody = lines.join("\n");

    const originalLabel = submitButton?.textContent || "Send";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
    }

    try {
      await sendToInbox({
        name: nameValue,
        email: emailValue,
        subject: mailSubject,
        message: mailBody
      });
      form.reset();
      success.textContent = `Thank you, ${nameValue}. Your message has been sent to Eman Sultan.`;
    } catch {
      openMailDraft(mailSubject, mailBody);
      success.textContent = `Thank you, ${nameValue}. If the message did not send directly, your email app should open so you can deliver it to emansultan134@gmail.com.`;
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
      success.hidden = false;
      success.focus();
    }
  });
}
