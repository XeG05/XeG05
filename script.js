/* ============================================================
   CONFIGURACIÓN — edita esto con tus datos
   ============================================================ */
const CONFIG = {
  roles: [                 // frases del efecto máquina de escribir
    "Ingeniero de Software Junior",
    "Desarrollador Full Stack",
    "Java · C# · React · PostgreSQL",
    "Estudiante en la UPV 🎓",
  ],
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

/* ---------- Título: letras animadas ---------- */
document.querySelectorAll(".split").forEach((el) => {
  const text = el.dataset.text;
  el.innerHTML = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "char" + (ch === " " ? " space" : "");
    span.textContent = ch === " " ? " " : ch;
    span.style.animationDelay = `${0.3 + i * 0.05}s`;
    el.appendChild(span);
  });
});

/* ---------- Máquina de escribir ---------- */
(function typewriter() {
  const el = document.getElementById("typed");
  let r = 0, c = 0, deleting = false;
  function tick() {
    const word = CONFIG.roles[r];
    el.textContent = word.slice(0, c);
    if (!deleting && c < word.length) c++;
    else if (deleting && c > 0) c--;
    else if (!deleting) { deleting = true; return setTimeout(tick, 1600); }
    else { deleting = false; r = (r + 1) % CONFIG.roles.length; }
    setTimeout(tick, deleting ? 40 : 85);
  }
  setTimeout(tick, 1000);
})();

/* ---------- Reveal al hacer scroll + contadores ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    e.target.querySelectorAll(".counter").forEach(animateCounter);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });

function observeReveals(root = document) {
  root.querySelectorAll(".reveal:not(.visible)").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    el.querySelectorAll(".chips li").forEach((li, j) => (li.style.transitionDelay = `${0.25 + j * 0.06}s`));
    io.observe(el);
  });
}
observeReveals();

function animateCounter(el) {
  const target = +el.dataset.target;
  const dur = 1800;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const dec = +(el.dataset.decimals || 0);
    const v = dec ? +(eased * target).toFixed(dec) : Math.floor(eased * target);
    el.textContent = "plain" in el.dataset ? v : v.toLocaleString("es", { minimumFractionDigits: dec });
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* Porcentaje visible en las barras de habilidades */
document.querySelectorAll(".skill").forEach((s) => {
  s.querySelector("span").dataset.pct = getComputedStyle(s).getPropertyValue("--lvl").trim();
});

/* ---------- Navegación ---------- */
const nav = document.querySelector(".nav");
const progress = document.querySelector(".progress");
let lastY = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 40);
  nav.classList.toggle("hidden", y > lastY && y > 400 && !navLinks.classList.contains("open"));
  lastY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}, { passive: true });

const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Brillo que sigue al cursor ---------- */
const glow = document.querySelector(".cursor-glow");
if (isTouch) glow.style.display = "none";
window.addEventListener("pointermove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

/* ---------- Tarjetas con inclinación 3D ---------- */
function bindTilt(card) {
  if (isTouch || reduceMotion) return;
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.transition = "transform .1s, border-color .3s";
    card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-6px)`;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.transition = "";
    card.style.transform = "";
  });
}
document.querySelectorAll(".tilt").forEach(bindTilt);

/* ---------- Botones magnéticos ---------- */
document.querySelectorAll(".magnetic").forEach((btn) => {
  if (isTouch || reduceMotion) return;
  btn.addEventListener("pointermove", (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
  });
  btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
});

/* ---------- Filtro de proyectos ---------- */
document.querySelectorAll(".filter").forEach((f) =>
  f.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    f.classList.add("active");
    const cat = f.dataset.filter;
    document.querySelectorAll(".project").forEach((p) => {
      const show = cat === "all" || p.dataset.cat === cat;
      p.classList.toggle("hide", !show);
      if (show) {
        p.animate(
          [{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }],
          { duration: 450, easing: "cubic-bezier(.22,1,.36,1)" }
        );
      }
    });
  })
);

/* ---------- Fondo de partículas conectadas ---------- */
(function particles() {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  let w, h, pts;
  const mouse = { x: -9999, y: -9999 };

  function init() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    const n = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { p.x += dx / d; p.y += dy / d; }
      ctx.fillStyle = "rgba(124,245,196,.6)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(138,125,255,${0.18 * (1 - d / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", init);
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  init();
  draw();
})();

document.getElementById("year").textContent = new Date().getFullYear();
