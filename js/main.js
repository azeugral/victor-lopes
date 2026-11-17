/* Victor Lopes · abertura, hero, menu, índice, portfólio, disponíveis, comparação e orçamento (Manequim). */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const suave = () => (reduz ? "auto" : "smooth");
  const MANEQUIM = "https://lrgz-manequim.pages.dev/victor-lopes/";
  const pad = (n) => String(n).padStart(2, "0");
  document.documentElement.classList.add("js");

  // ---------- rasgo de papel (bordas irregulares, sempre o mesmo desenho) ----------
  let sem = 11;
  const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  function rasgo(passo = 0.9, prof = 7) {
    const cima = [], baixo = [];
    for (let x = 0; x <= 100.001; x += passo * (0.6 + rnd() * 0.8)) cima.push(`${Math.min(x, 100).toFixed(2)}% ${(rnd() * prof).toFixed(2)}%`);
    for (let x = 100; x >= -0.001; x -= passo * (0.6 + rnd() * 0.8)) baixo.push(`${Math.max(x, 0).toFixed(2)}% ${(100 - rnd() * prof).toFixed(2)}%`);
    return `polygon(${cima.join(",")}, ${baixo.join(",")})`;
  }
  const faixa = $("#faixa");
  faixa.style.setProperty("--rasgo", rasgo());

  // ---------- abertura: o M se desenha, a folha sobe ----------
  const ab = $("#abertura"), body = document.body;
  const path = $("#abPath"), svg = $("#abM");
  function libera() { ab.classList.add("sai"); body.classList.add("pronto"); setTimeout(() => ab.remove(), 900); }
  if (window.LOGO) {
    svg.setAttribute("viewBox", LOGO.vb);
    path.setAttribute("d", LOGO.d);
    const L = path.getTotalLength ? path.getTotalLength() : 4000;
    path.style.strokeDasharray = L;
    path.style.strokeDashoffset = L;
    path.getBoundingClientRect();
    requestAnimationFrame(() => {
      path.style.transition = reduz ? "none" : "stroke-dashoffset .85s cubic-bezier(.16,.84,.32,1), fill-opacity .35s cubic-bezier(.16,.84,.32,1) .7s";
      path.style.strokeDashoffset = 0;
      ab.classList.add("desenha");
    });
  }
  setTimeout(libera, reduz ? 200 : 1150);

  // ---------- hero: a folha troca de peça a cada 5 s ----------
  const peças = [
    ["Vaso com lírios", "Fine line"], ["Tigre nas costas", "Blackwork"], ["Peônia no ombro", "Fine line"],
    ["Adaga e serpente", "Blackwork"], ["Sol e lua", "Fine line"],
  ];
  const imgsHero = $$(".folha-img img");
  let h = 0;
  if (!reduz) setInterval(() => {
    if (document.hidden) return;
    imgsHero[h].classList.remove("on");
    h = (h + 1) % imgsHero.length;
    imgsHero[h].classList.add("on");
    $("#folhaNum").textContent = "Nº " + pad(h + 1);
    $("#folhaTit").textContent = peças[h][0];
  }, 5000);

  // ---------- topo, progresso, índice ----------
  const topo = $("#topo"), prog = $("#prog"), wa = $("#waFixo");
  function rolou() {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    topo.classList.toggle("cheio", scrollY > 30);
    wa.classList.toggle("no-hero", scrollY < innerHeight * 0.55);
  }
  addEventListener("scroll", rolou, { passive: true });
  rolou();
  const links = $$(".indice a");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.dataset.i === e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main > .cap").forEach((s) => io.observe(s));
  }

  // ---------- menu ----------
  const menu = $("#menu"), mbt = $("#menuBt");
  function menuAbre(v) {
    menu.hidden = !v; mbt.setAttribute("aria-expanded", v);
    $(".menu-txt").textContent = v ? "Fechar" : "Menu";
    body.classList.toggle("trava", v);
  }
  mbt.addEventListener("click", () => menuAbre(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => menuAbre(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) menuAbre(false); });

  // ---------- reveal ----------
  const rvs = $$(".cap-linha, .cap-tit, .cap-lead, .temas, .sobre, .cic-cab, .cic, .estudio, .contatos, .fecho, .flash-wrap");
  rvs.forEach((el) => el.classList.add("rv"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    rvs.forEach((el) => io.observe(el));
  } else rvs.forEach((el) => el.classList.add("in"));

  // ---------- orçamento (Manequim no modo vitrine) ----------
  const fr = $("#manequim");
  const topoLivre = () => topo.getBoundingClientRect().bottom + 14;
  addEventListener("message", (e) => {
    if (e.source !== fr.contentWindow || !e.data || !e.data.manequim) return;
    const d = e.data;
    if (d.altura) fr.style.height = Math.max(480, Math.min(4000, d.altura)) + "px";
    if (d.rolar) {
      const base = fr.getBoundingClientRect().top + scrollY, t = base + d.rolar.t, b = base + d.rolar.b;
      const cima = scrollY + topoLivre(), baixo = scrollY + innerHeight - 16;
      let y = null;
      if (d.rolar.modo === "fim") { if (b > baixo) y = b - innerHeight + 24; }
      else if (t < cima || b > baixo) y = t - topoLivre();
      if (y !== null) scrollTo({ top: Math.max(0, y), behavior: suave() });
    }
  });
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => wa.classList.toggle("fora", e.isIntersecting), { rootMargin: "-15% 0px -15% 0px" }).observe(fr);
  function orcamento(estilo, desenho) {
    const q = new URLSearchParams({ vitrine: "1" });
    if (estilo) q.set("estilo", estilo);
    if (desenho) q.set("desenho", desenho);
    fr.src = MANEQUIM + "?" + q.toString();
    $("#orcamento").scrollIntoView({ behavior: suave() });
  }

  // ---------- visualizador ----------
  const lb = $("#lb"), lbImg = $("#lbImg");
  let lista = [], li = 0, ultimoFoco = null;
  function lbMostra(i, dir = 0) {
    li = (i + lista.length) % lista.length;
    const o = lista[li];
    const troca = () => {
      lbImg.src = o.src; lbImg.alt = o.alt;
      $("#lbTit").textContent = o.titulo; $("#lbSub").textContent = o.sub;
      $("#lbPos").textContent = `${pad(li + 1)} / ${pad(lista.length)}`;
      lbImg.classList.remove("troca");
    };
    if (dir && !reduz) { lbImg.classList.add("troca"); setTimeout(troca, 180); } else troca();
    // pré-carrega vizinhos
    [li + 1, li - 1].forEach((k) => { const n = lista[(k + lista.length) % lista.length]; if (n) new Image().src = n.src; });
  }
  function lbAbre(l, i) {
    lista = l; ultimoFoco = document.activeElement;
    lb.hidden = false; body.classList.add("trava"); wa.classList.add("fora");
    lbMostra(i); $("#lbFecha").focus();
  }
  function lbFecha() {
    lb.hidden = true; body.classList.remove("trava"); wa.classList.remove("fora");
    if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
  }
  $("#lbFecha").addEventListener("click", lbFecha);
  $("#lbAnt").addEventListener("click", () => lbMostra(li - 1, -1));
  $("#lbProx").addEventListener("click", () => lbMostra(li + 1, 1));
  $("#lbQuero").addEventListener("click", (e) => { e.preventDefault(); const o = lista[li]; lbFecha(); orcamento(o.estilo, o.desenho); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") lbFecha();
    if (e.key === "ArrowRight") lbMostra(li + 1, 1);
    if (e.key === "ArrowLeft") lbMostra(li - 1, -1);
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-fig")) lbFecha(); });
  let x0 = null;
  $(".lb-fig").addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  $(".lb-fig").addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) lbMostra(li + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });

  // ---------- portfólio ----------
  const OB = (window.OBRAS || []).map((o) => ({
    ...o, src: `img/g/${o.n}.webp`, thumb: `img/t/${o.n}.webp`, alt: `${o.titulo}, ${o.estilo.toLowerCase()}`,
    sub: `${o.estilo} · ${{ floral: "Floral", fauna: "Fauna", simbolos: "Símbolos", figuras: "Figuras" }[o.tema]}`,
    desenho: `${o.titulo} (do portfólio)`,
  }));
  const grade = $("#grade"), mais = $("#mais"), info = $("#gradeInfo"), todos = $("#verTodos");
  const NOMES = { floral: "Floral", fauna: "Fauna", simbolos: "Símbolos", figuras: "Figuras" };
  let tema = "", mostra = 12;
  const filtradas = () => (tema ? OB.filter((o) => o.tema === tema) : OB);
  function render(novo = false) {
    const l = filtradas(), ate = Math.min(mostra, l.length);
    const ini = novo ? 0 : grade.children.length;
    if (novo) grade.innerHTML = "";
    for (let i = ini; i < ate; i++) {
      const o = l[i], el = document.createElement("li");
      el.style.animationDelay = `${((i - ini) % 12) * 40}ms`;
      el.innerHTML = `<button class="obra" type="button" aria-label="Ver ${o.titulo}"><div class="im"><img src="${o.thumb}" alt="${o.alt}" width="720" height="900" draggable="false"></div><div class="cap-o"><b>${o.titulo}</b><span>${o.estilo}</span></div></button>`;
      el.firstChild.addEventListener("click", () => lbAbre(l, i));
      grade.appendChild(el);
    }
    info.textContent = `${tema ? NOMES[tema] : "Todos"} · ${pad(ate)} de ${pad(l.length)} trabalhos`;
    todos.hidden = !tema;
    mais.hidden = ate >= l.length;
  }
  $$("#temas button").forEach((b) => b.addEventListener("click", () => {
    const t = b.dataset.tema;
    tema = tema === t ? "" : t; mostra = 12;
    $$("#temas button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.tema === tema));
    render(true);
    const alvo = $(".grade-info").getBoundingClientRect().top;
    if (alvo > innerHeight * 0.85 || alvo < 0) $(".grade-info").scrollIntoView({ behavior: suave(), block: "start" });
  }));
  todos.addEventListener("click", () => { tema = ""; mostra = 12; $$("#temas button").forEach((x) => x.setAttribute("aria-pressed", "false")); render(true); });
  mais.addEventListener("click", () => { mostra += 12; render(); });
  render(true);

  // ---------- disponíveis ----------
  const FL = Array.from({ length: 10 }, (_, i) => ({
    src: `img/flash/${pad(i + 1)}.webp`, alt: `Arte disponível nº ${pad(i + 1)}`, titulo: `Flash nº ${pad(i + 1)}`,
    sub: "Arte disponível · tatua uma vez só", estilo: "Arte disponível", desenho: `Flash nº ${pad(i + 1)} (disponíveis do site)`,
  }));
  const fl = $("#flash");
  FL.forEach((o, i) => {
    const el = document.createElement("li");
    el.innerHTML = `<article class="cartao"><button class="ver" type="button" aria-label="Ampliar ${o.titulo}"><img src="${o.src}" alt="${o.alt}" width="1000" height="1250" draggable="false"><span class="ct-num">Nº ${pad(i + 1)}</span></button><div class="ct-info"><b>${o.titulo}</b><span>Disponível</span></div><a class="quero" href="#orcamento">Quero esta arte <b aria-hidden="true">→</b></a></article>`;
    $(".ver", el).addEventListener("click", () => lbAbre(FL, i));
    $(".quero", el).addEventListener("click", (e) => { e.preventDefault(); orcamento(o.estilo, o.desenho); });
    fl.appendChild(el);
  });
  const ant = $("#flashAnt"), prox = $("#flashProx"), pos = $("#flashPos");
  const passo = () => (fl.children[1] ? fl.children[1].offsetLeft - fl.children[0].offsetLeft : fl.clientWidth);
  function flashPos() {
    const p = passo(), i = Math.round(fl.scrollLeft / p);
    const vis = Math.max(1, Math.round(fl.clientWidth / p));
    pos.textContent = `${pad(Math.min(FL.length, i + 1))} / ${pad(FL.length)}`;
    ant.disabled = fl.scrollLeft < 4;
    prox.disabled = fl.scrollLeft + fl.clientWidth >= fl.scrollWidth - 4 || i + vis >= FL.length;
  }
  ant.addEventListener("click", () => fl.scrollBy({ left: -passo(), behavior: suave() }));
  prox.addEventListener("click", () => fl.scrollBy({ left: passo(), behavior: suave() }));
  fl.addEventListener("scroll", flashPos, { passive: true });
  addEventListener("resize", flashPos);
  flashPos();

  // ---------- fresca x cicatrizada ----------
  $$(".antes-depois").forEach((f) => {
    const r = $("input", f);
    const set = () => { f.style.setProperty("--p", r.value + "%"); f.style.setProperty("--pn", r.value / 100); };
    r.addEventListener("input", set); set();
  });
})();
