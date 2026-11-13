/* Portfolio · Ganen Xia
   Terminal animada, aparición al hacer scroll, contadores, navegación
   activa, menú móvil, filtro de proyectos y copiar email. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Terminal del hero ----------
   Cada línea es { cmd } (se escribe letra a letra) o { out: [[clase, texto], ...] }.
   Clases: p=prompt, k=clave, s=cadena, d=atenuado, a=acento, g=verde. */
const TERMINAL = [
  { cmd: "whoami" },
  { out: [["a", "ganen-xia"], ["d", "  # Ingeniero de Software Junior · Full Stack"]] },
  { cmd: "cat perfil.json" },
  { out: [["c", "{"]] },
  { out: [["c", "  "], ["k", '"ubicacion"'], ["c", ": "], ["s", '"Valencia, España"'], ["c", ","]] },
  { out: [["c", "  "], ["k", '"formacion"'], ["c", ": "], ["s", '"Ing. Informática · UPV"'], ["c", ","]] },
  { out: [["c", "  "], ["k", '"stack"'], ["c", ": ["], ["s", '"Java"'], ["c", ", "], ["s", '"C#"'], ["c", ", "], ["s", '"React"'], ["c", ", "], ["s", '"PostgreSQL"'], ["c", "],"]] },
  { out: [["c", "  "], ["k", '"proceso"'], ["c", ": "], ["s", '"Scrum"'], ["c", ","]] },
  { out: [["c", "  "], ["k", '"disponible"'], ["c", ": "], ["g", "true"]] },
  { out: [["c", "}"]] },
  { cmd: "ls proyectos/" },
  { out: [["k", "life-quest/"], ["c", "  "], ["k", "smartcart/"], ["c", "  "], ["k", "votify/"], ["c", "  "], ["k", "portfolio/"]] },
];

(function terminal() {
  const out = document.getElementById("term");
  const ghost = document.getElementById("term-ghost");
  if (!out) return;

  const span = (cls, text) => {
    const s = document.createElement("span");
    s.className = cls;
    s.textContent = text;
    return s;
  };
  const renderLine = (line, target) => {
    if (line.cmd !== undefined) {
      target.append(span("p", "$ "), span("c", line.cmd));
    } else {
      line.out.forEach(([cls, text]) => target.append(span(cls, text)));
    }
    target.append("\n");
  };

  // Copia invisible con el contenido final (reserva el alto)
  TERMINAL.forEach((l) => renderLine(l, ghost));
  ghost.append(span("p", "$ "), span("term-caret", "▌"));

  const caret = span("term-caret", "▌");
  const finish = () => out.append(span("p", "$ "), caret);

  if (reduceMotion) {
    TERMINAL.forEach((l) => renderLine(l, out));
    finish();
    return;
  }

  let i = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  (async function run() {
    await wait(700);
    for (; i < TERMINAL.length; i++) {
      const line = TERMINAL[i];
      if (line.cmd !== undefined) {
        out.append(span("p", "$ "));
        const cmd = span("c", "");
        out.append(cmd, caret);
        await wait(350);
        for (const ch of line.cmd) {
          cmd.textContent += ch;
          await wait(45 + Math.random() * 45);
        }
        await wait(250);
        caret.remove();
        out.append("\n");
      } else {
        renderLine(line, out);
        await wait(70);
      }
    }
    finish();
  })();
})();

/* ---------- Aparición al hacer scroll + contadores ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll(".counter").forEach(animateCounter);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 0.07}s`;
  revealObserver.observe(el);
});

function animateCounter(el) {
  const target = Number(el.dataset.target);
  if (reduceMotion) { el.textContent = target; return; }
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Barra de progreso y borde de la navegación ---------- */
const nav = document.querySelector(".nav");
const progress = document.querySelector(".progress");
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  nav.classList.toggle("scrolled", y > 8);
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Enlace activo según la sección visible ---------- */
const navLinks = document.querySelectorAll(".nav-links a[href^='#']:not(.btn)");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Menú móvil ---------- */
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector(".nav-links");
function setMenu(open) {
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- Filtro de proyectos ---------- */
const filters = document.querySelectorAll(".filter");
filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    filters.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-selected", String(b === btn));
    });
    const cat = btn.dataset.filter;
    document.querySelectorAll(".project").forEach((card) => {
      const show = cat === "all" || card.dataset.cat === cat;
      card.classList.toggle("hide", !show);
      if (show && !reduceMotion) {
        card.animate(
          [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
          { duration: 350, easing: "cubic-bezier(.22,1,.36,1)" }
        );
      }
    });
  })
);

/* ---------- Copiar email ---------- */
document.querySelectorAll("[data-copy]").forEach((btn) =>
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "¡copiado!";
      btn.classList.add("done");
    } catch {
      btn.textContent = "error";
    }
    setTimeout(() => {
      btn.textContent = "copiar";
      btn.classList.remove("done");
    }, 2000);
  })
);

document.getElementById("year").textContent = new Date().getFullYear();
