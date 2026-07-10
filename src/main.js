import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import manifest from "./manifest.json";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------
   Chapter definitions — each year gets its own feeling
------------------------------------------------------------------- */
const YEARS = [
  {
    id: 1,
    key: "y1",
    accent: "#e8a054",
    label: "JUL 2022 — JUL 2023",
    feeling: "FEELING: WARM / NERVOUS / NEW",
    title: ["Year one.", "The spark."],
    desc: "Everything was a first. First photos, first inside jokes, first time the word “us” felt like a place. These frames developed slowly — so here, they still do.",
    galleryNote: "GALLERY 01 — POLAROIDS, STILL DEVELOPING",
  },
  {
    id: 2,
    key: "y2",
    accent: "#6fcdbb",
    label: "JUL 2023 — JUL 2024",
    feeling: "FEELING: RESTLESS / LOUD / ALIVE",
    title: ["Year two.", "The adventure."],
    desc: "The year the map got bigger. More roads, more plates shared, more of the world seen from the same side of the table. This gallery refuses to sit still — it moves the way that year did.",
    galleryNote: "GALLERY 02 — FILMSTRIP IN MOTION, KEEP SCROLLING",
  },
  {
    id: 3,
    key: "y3",
    accent: "#bca0e8",
    label: "JUL 2024 — JUL 2025",
    feeling: "FEELING: SOFT / STEADY / SURE",
    title: ["Year three.", "The quiet."],
    desc: "Less noise, more knowing. The comfortable silences, the routines that became rituals. These photos wake up slowly, from memory into color, as you pass them.",
    galleryNote: "GALLERY 03 — TWO TIDES, DRIFTING PAST EACH OTHER",
  },
  {
    id: 4,
    key: "y4",
    accent: "#e7c468",
    label: "JUL 2025 — NOW",
    feeling: "FEELING: GOLDEN / CERTAIN / HOME",
    title: ["Year four.", "The now."],
    desc: "All of it — every scattered moment of four years — pulled together into one clear picture. This is where the pieces land.",
    galleryNote: "GALLERY 04 — EVERY PIECE FINDS ITS PLACE",
  },
];

const main = document.getElementById("chapters");

/* ------------------------------------------------------------------
   Lightbox
------------------------------------------------------------------- */
const lightbox = document.querySelector(".lightbox");
const lbImg = lightbox.querySelector(".lightbox-img");
const lbVideo = lightbox.querySelector(".lightbox-video");
const lbCount = lightbox.querySelector(".lightbox-count");
let lbList = [];
let lbIndex = 0;

function openLightbox(list, index) {
  lbList = list;
  lbIndex = index;
  renderLightbox();
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}
function renderLightbox() {
  const item = lbList[lbIndex];
  if (item.video) {
    lbImg.hidden = true;
    lbImg.src = "";
    lbVideo.hidden = false;
    lbVideo.src = item.video;
    lbVideo.poster = item.src;
    lbVideo.play().catch(() => {});
  } else {
    lbVideo.pause();
    lbVideo.hidden = true;
    lbVideo.removeAttribute("src");
    lbImg.hidden = false;
    lbImg.src = item.src;
  }
  lbCount.textContent = `${String(lbIndex + 1).padStart(3, "0")} / ${String(lbList.length).padStart(3, "0")}`;
}
function closeLightbox() {
  lightbox.hidden = true;
  lbImg.src = "";
  lbVideo.pause();
  lbVideo.removeAttribute("src");
  document.body.style.overflow = "";
}
lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => {
  lbIndex = (lbIndex - 1 + lbList.length) % lbList.length;
  renderLightbox();
});
lightbox.querySelector(".lightbox-next").addEventListener("click", () => {
  lbIndex = (lbIndex + 1) % lbList.length;
  renderLightbox();
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
window.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightbox.querySelector(".lightbox-prev").click();
  if (e.key === "ArrowRight") lightbox.querySelector(".lightbox-next").click();
});

/* ------------------------------------------------------------------
   Shared: chapter plate (the title card before each gallery)
------------------------------------------------------------------- */
function buildPlate(year) {
  const plate = document.createElement("section");
  plate.className = "plate";
  plate.style.setProperty("--accent", year.accent);
  plate.innerHTML = `
    <div class="plate-numeral" aria-hidden="true">0${year.id}</div>
    <div class="plate-meta mono">
      <span class="accent">CHAPTER 0${year.id}</span>
      <span>${year.label}</span>
      <span>${manifest[year.key].length} RECORDS</span>
    </div>
    <h2 class="plate-title">${year.title[0]}<br /><em>${year.title[1]}</em></h2>
    <p class="plate-desc">${year.desc}</p>
    <p class="plate-feel mono">${year.feeling}</p>
  `;

  if (!reducedMotion) {
    gsap.from(plate.querySelectorAll(".plate-meta, .plate-title, .plate-desc, .plate-feel"), {
      y: 46,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: plate, start: "top 62%" },
    });
    gsap.fromTo(
      plate.querySelector(".plate-numeral"),
      { yPercent: 18 },
      {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: plate, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  }
  return plate;
}

function img(item, extra = "", sizes = "(max-width: 900px) 46vw, 320px") {
  // "extra" may override loading; duplicate attributes are ignored, so only
  // emit the lazy default when no override is given
  const loading = extra.includes("loading=") ? "" : 'loading="lazy"';
  return `<img src="${item.src}"
    srcset="${item.t} 480w, ${item.m} 960w, ${item.src} 1600w" sizes="${sizes}"
    ${extra} ${loading} decoding="async" alt=""
    style="background:${item.color}" width="${item.w}" height="${item.h}" />`;
}

/* muted in-gallery clip; plays while on screen (see playWhileVisible) */
function videoTile(item) {
  return `
    <video src="${item.video}" poster="${item.t}" muted loop playsinline preload="none"
      style="background:${item.color};aspect-ratio:${item.w} / ${item.h}"></video>
    <span class="live-badge mono">LIVE</span>`;
}

const playWhileVisible = reducedMotion
  ? null
  : new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target.querySelector("video");
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.15 }
    );

function observeVideos(root) {
  if (!playWhileVisible) return;
  root.querySelectorAll("video").forEach((v) => playWhileVisible.observe(v.parentElement));
}

/* ------------------------------------------------------------------
   YEAR 1 — THE SPARK
   Polaroids scattered on a table, each developing as it enters view.
------------------------------------------------------------------- */
function buildYear1(photos) {
  const wrap = document.createElement("div");
  wrap.className = "g1-wrap";

  photos.forEach((p, i) => {
    const el = document.createElement("figure");
    el.className = "g1-item";
    const rot = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    el.style.transform = `rotate(${(rot * 6 - 3).toFixed(2)}deg)`;
    el.innerHTML = `
      <div class="g1-photo">${img(p)}</div>
      <figcaption class="g1-caption"><span>NO.${String(i + 1).padStart(3, "0")}</span><span>YR.01</span></figcaption>
    `;
    el.addEventListener("click", () => openLightbox(photos, i));
    wrap.appendChild(el);
  });

  // develop + tumble in as each polaroid crosses the fold
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        el.classList.add("developed");
        if (!reducedMotion) {
          gsap.from(el, {
            y: 70,
            opacity: 0,
            rotation: "+=8",
            duration: 1,
            ease: "power3.out",
            delay: (Number(el.dataset.i) % 4) * 0.08,
          });
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px" }
  );
  wrap.querySelectorAll(".g1-item").forEach((el, i) => {
    el.dataset.i = i;
    io.observe(el);
  });

  return wrap;
}

/* ------------------------------------------------------------------
   YEAR 2 — THE ADVENTURE
   Pinned stage; three filmstrip rows slide in opposing directions.
------------------------------------------------------------------- */
function buildYear2(photos) {
  const stage = document.createElement("div");
  stage.className = "g2-stage";
  stage.innerHTML = `
    <div class="g2-hud mono"><span>REEL 02</span><span>${photos.length} FRAMES</span><span>DIR: BOTH WAYS AT ONCE</span></div>
    <div class="g2-progress"><div class="g2-progress-fill"></div></div>
  `;

  const rows = [[], [], []];
  photos.forEach((p, i) => rows[i % 3].push({ p, i }));

  const rowEls = rows.map((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "g2-row";
    row.forEach(({ p, i }) => {
      const cell = document.createElement("div");
      cell.className = "g2-cell";
      cell.dataset.no = `F.${String(i + 1).padStart(3, "0")}`;
      cell.innerHTML = p.video ? videoTile(p) : img(p, "", "42vh");
      cell.addEventListener("click", () => openLightbox(photos, i));
      rowEl.appendChild(cell);
    });
    stage.insertBefore(rowEl, stage.querySelector(".g2-progress"));
    return rowEl;
  });
  observeVideos(stage);

  requestAnimationFrame(() => {
    if (reducedMotion) {
      // no pin — let rows wrap into a simple static strip
      stage.style.height = "auto";
      stage.style.padding = "3rem 1rem 6rem";
      rowEls.forEach((r) => {
        r.style.flexWrap = "wrap";
        r.style.width = "auto";
      });
      return;
    }
    const travel = () =>
      Math.max(...rowEls.map((r) => r.scrollWidth - window.innerWidth)) + 200;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${travel()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          stage.querySelector(".g2-progress-fill").style.width = `${self.progress * 100}%`;
        },
      },
    });
    rowEls.forEach((row, r) => {
      const overflow = () => row.scrollWidth - window.innerWidth + 40;
      if (r === 1) {
        gsap.set(row, { x: () => -overflow() });
        tl.to(row, { x: 0, ease: "none" }, 0);
      } else {
        tl.to(row, { x: () => -overflow(), ease: "none" }, 0);
      }
    });
  });

  return stage;
}

/* ------------------------------------------------------------------
   YEAR 3 — THE QUIET
   Two columns drifting at different speeds; photos wake from
   grayscale into color as you reach them.
------------------------------------------------------------------- */
function buildYear3(photos) {
  const wrap = document.createElement("div");
  wrap.className = "g3-wrap";
  const colA = document.createElement("div");
  colA.className = "g3-col g3-col-a";
  const colB = document.createElement("div");
  colB.className = "g3-col g3-col-b";
  wrap.append(colA, colB);

  photos.forEach((p, i) => {
    const el = document.createElement("figure");
    el.className = "g3-item";
    el.innerHTML = `
      ${p.video ? videoTile(p) : img(p, "", "(max-width: 520px) 46vw, 40vw")}
      <figcaption class="g3-caption">${p.video ? "MOTION" : "STILL"} ${String(i + 1).padStart(3, "0")} — REMEMBERED IN COLOR</figcaption>
    `;
    el.addEventListener("click", () => openLightbox(photos, i));
    (i % 2 === 0 ? colA : colB).appendChild(el);
  });
  observeVideos(wrap);

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("awake");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -22% 0px" }
  );
  wrap.querySelectorAll(".g3-item").forEach((el) => io.observe(el));

  if (!reducedMotion) {
    gsap.to(colA, {
      yPercent: -7,
      ease: "none",
      scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 1.2 },
    });
    gsap.to(colB, {
      yPercent: 7,
      ease: "none",
      scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 1.2 },
    });
  }

  return wrap;
}

/* ------------------------------------------------------------------
   YEAR 4 — THE NOW
   A pinned constellation: every photo starts scattered across the
   sky and converges into one complete mosaic.
------------------------------------------------------------------- */
function buildYear4(photos) {
  const stage = document.createElement("div");
  stage.className = "g4-stage";
  const grid = document.createElement("div");
  grid.className = "g4-grid";
  stage.appendChild(grid);

  const word = document.createElement("div");
  word.className = "g4-word";
  word.innerHTML = `<span>all of it, at once</span>`;
  stage.appendChild(word);

  const perRow = window.matchMedia("(max-width: 520px)").matches
    ? 4
    : window.matchMedia("(max-width: 900px)").matches
      ? 5
      : 8;
  const count = Math.floor(photos.length / perRow) * perRow;
  const shown = photos.slice(0, count);
  // the grid trims to complete rows — swap any trimmed videos in over stills
  const trimmedVideos = photos.slice(count).filter((p) => p.video);
  for (let j = shown.length - 1; j >= 0 && trimmedVideos.length; j--) {
    if (!shown[j].video) shown[j] = trimmedVideos.shift();
  }

  shown.forEach((p) => {
    const cell = document.createElement("div");
    cell.className = "g4-cell";
    cell.innerHTML = p.video
      ? videoTile(p)
      : img(p, 'loading="eager"', "(max-width: 900px) 20vw, 12vw");
    cell.addEventListener("click", () => openLightbox(photos, photos.indexOf(p)));
    grid.appendChild(cell);
  });
  observeVideos(grid);

  if (reducedMotion) return stage;

  requestAnimationFrame(() => {
    const cells = grid.querySelectorAll(".g4-cell");
    const rand = (seed, min, max) => {
      const t = Math.abs(Math.sin(seed * 91.7)) % 1;
      return min + t * (max - min);
    };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "+=180%",
        pin: true,
        scrub: 0.9,
      },
    });
    cells.forEach((cell, i) => {
      tl.from(
        cell,
        {
          x: rand(i + 1, -1, 1) * window.innerWidth * 0.42,
          y: rand(i + 7, -1, 1) * window.innerHeight * 0.45,
          rotation: rand(i + 13, -40, 40),
          scale: rand(i + 3, 0.35, 0.7),
          opacity: 0.85,
          duration: 0.7,
          ease: "power2.inOut",
        },
        rand(i + 5, 0, 0.3)
      );
    });
    tl.fromTo(word.querySelector("span"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35 }, 0.35)
      .to(word.querySelector("span"), { opacity: 0, y: -30, duration: 0.3 }, 0.85);
  });

  return stage;
}

/* ------------------------------------------------------------------
   THE LETTER — interlude between year three and year four.
   Lines surface out of the dark as you scroll, lilac giving
   way to gold.
------------------------------------------------------------------- */
const LETTER = [
  { t: "Hi, Darling.", style: "display" },
  { t: "We made it this far. Four years of laughter, sadness, love — galit, away, suntukan, habulan — and above all of it, loyalty." },
  { t: "Now that we're stepping into a new phase of our journey, alam kong busy ka sa pagrereview mo. But still, we make sure. We see each other. We make time. I love where we are right now, and I appreciate lahat ng ginagawa mo — para sa akin, at para sa atin." },
  { t: "Ako naman — I'm in a season of putting serious, honest effort into my work and my career. But one thing I need you to be sure of: I will never, ever build any of it without you in it. You are, and will always be, at the center of everything I'm working for." },
  { t: "As we keep going, let's get stronger together. Faith first. Take care of our bodies. Stay healthy — for the future we keep talking about." },
  { t: "I would never have made it this far without my Darling. I just want you to know that." },
  { t: "Mahal na mahal kita.", style: "display" },
  { t: "Happy 4th.", style: "sign" },
];

function splitWords(el) {
  const words = el.textContent.split(" ");
  el.textContent = "";
  return words.map((w, k) => {
    const span = document.createElement("span");
    span.className = "letter-word";
    span.textContent = w;
    el.appendChild(span);
    if (k < words.length - 1) el.appendChild(document.createTextNode(" "));
    return span;
  });
}

function buildLetter() {
  const section = document.createElement("section");
  section.className = "letter";
  section.id = "letter";

  // pinned opening moment: darkness, then "Hi, Darling." breathes in
  const opening = document.createElement("div");
  opening.className = "letter-open";
  opening.innerHTML = `
    <p class="letter-eyebrow mono">BETWEEN CHAPTERS 03 AND 04 — A LETTER, READ SLOWLY</p>
    <p class="letter-line letter-display letter-open-title">${LETTER[0].t}</p>
    <div class="letter-open-glow" aria-hidden="true"></div>
  `;
  section.appendChild(opening);

  const inner = document.createElement("div");
  inner.className = "letter-inner";
  section.appendChild(inner);

  LETTER.slice(1).forEach(({ t, style }) => {
    const p = document.createElement("p");
    p.className = `letter-line${style ? ` letter-${style}` : ""}`;
    p.textContent = t;
    inner.appendChild(p);
  });

  if (reducedMotion) return section;

  requestAnimationFrame(() => {
    // — opening: pinned while the greeting slowly surfaces, holds, and lifts away
    const openTl = gsap.timeline({
      scrollTrigger: {
        trigger: opening,
        start: "top top",
        end: "+=160%",
        pin: true,
        scrub: 1.2,
      },
    });
    openTl
      .fromTo(
        opening.querySelector(".letter-open-glow"),
        { opacity: 0, scale: 0.55 },
        { opacity: 1, scale: 1, duration: 1, ease: "power1.inOut" },
        0
      )
      .fromTo(
        opening.querySelector(".letter-eyebrow"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power1.out" },
        0.1
      )
      .fromTo(
        opening.querySelector(".letter-open-title"),
        { opacity: 0, scale: 0.92, filter: "blur(10px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power2.out" },
        0.3
      )
      // hold the moment, then let it drift up and soften as the letter begins
      .to(opening.querySelectorAll(".letter-eyebrow, .letter-open-title"), {
        y: -60,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.5,
        ease: "power1.in",
      }, 1.6)
      .to(opening.querySelector(".letter-open-glow"), { opacity: 0.35, duration: 0.5 }, 1.6);

    // — body: each paragraph reveals word by word, paced by the scroll
    inner.querySelectorAll(".letter-line").forEach((line) => {
      const words = splitWords(line);
      gsap.fromTo(
        words,
        { opacity: 0.08, y: 18, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.08,
          ease: "power1.out",
          scrollTrigger: { trigger: line, start: "top 92%", end: "top 38%", scrub: 1 },
        }
      );
    });
  });

  return section;
}

/* ------------------------------------------------------------------
   Assemble the journey
------------------------------------------------------------------- */
const builders = { 1: buildYear1, 2: buildYear2, 3: buildYear3, 4: buildYear4 };

YEARS.forEach((year) => {
  const chapter = document.createElement("section");
  chapter.className = "chapter";
  chapter.id = `year-${year.id}`;
  chapter.style.setProperty("--accent", year.accent);
  chapter.appendChild(buildPlate(year));

  const note = document.createElement("p");
  note.className = "mono";
  note.style.cssText = `padding:0 clamp(1.5rem,7vw,7rem) 2.5rem;color:${year.accent};opacity:.75`;
  note.textContent = year.galleryNote;
  chapter.appendChild(note);

  chapter.appendChild(builders[year.id](manifest[year.key]));
  main.appendChild(chapter);

  if (year.id === 3) main.appendChild(buildLetter());
});

/* ------------------------------------------------------------------
   Hero entrance
------------------------------------------------------------------- */
if (!reducedMotion) {
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".hero-numeral", { opacity: 0, scale: 1.15, duration: 2, ease: "power2.out" })
    .from(".hero-eyebrow", { opacity: 0, y: 18, duration: 0.8 }, 0.3)
    .from(".hero-line > span", { yPercent: 110, duration: 1.2, stagger: 0.14 }, 0.45)
    .from(".hero-sub", { opacity: 0, y: 24, duration: 0.9 }, 1.0)
    .from(".hero-scroll", { opacity: 0, duration: 1 }, 1.4)
    .from(".topbar", { opacity: 0, y: -14, duration: 0.8 }, 1.2);

  gsap.to(".hero-inner", {
    yPercent: -14,
    opacity: 0.15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  gsap.from(".finale-title span, .finale-sub, .finale-eyebrow, .finale-heart", {
    y: 50,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: { trigger: ".finale", start: "top 60%" },
  });
}

/* ------------------------------------------------------------------
   Journey rail — progress + one tick per chapter
------------------------------------------------------------------- */
const rail = document.querySelector(".journey");
const railFill = document.querySelector(".journey-fill");
const ticks = YEARS.map((year) => {
  const t = document.createElement("div");
  t.className = "journey-tick";
  t.style.setProperty("--tick-color", year.accent);
  rail.appendChild(t);
  return t;
});

function layoutTicks() {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  YEARS.forEach((year, i) => {
    const el = document.getElementById(`year-${year.id}`);
    const pos = Math.min(0.99, el.offsetTop / docH);
    ticks[i].style.top = `${pos * 100}%`;
  });
}

function updateRail() {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const p = Math.min(1, window.scrollY / docH);
  railFill.style.height = `${p * 100}%`;
  ticks.forEach((t) => {
    t.classList.toggle("lit", parseFloat(t.style.top) / 100 <= p + 0.002);
  });

  // topbar active state
  let active = null;
  YEARS.forEach((year) => {
    const el = document.getElementById(`year-${year.id}`);
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.3) active = year.id;
  });
  document.querySelectorAll(".topbar-years a").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === `year-${active}`);
  });
}

window.addEventListener("scroll", updateRail, { passive: true });
window.addEventListener("resize", () => {
  layoutTicks();
  updateRail();
});
// pinned sections change the document height after ScrollTrigger initializes
ScrollTrigger.addEventListener("refresh", () => {
  layoutTicks();
  updateRail();
});
window.addEventListener("load", () => ScrollTrigger.refresh());
layoutTicks();
updateRail();
