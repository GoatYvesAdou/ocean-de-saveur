/**
 * IMAGES VIVANTES — Maison Dorée


   BIBLIOTHÈQUE D'IMAGES
   ══════════════════════════════════════════════════════ */
const IMGS = {

  /* ── IMAGE DE GÂTEAUX RÉELS (URL) ───── */
  cakes : [
    { url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=85&fit=crop", label: "Layer cake chocolat" },
    { url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=85&fit=crop", label: "Fraisier fraise" },
    { url: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=85&fit=crop", label: "Macaron rose" },
    { url: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=85&fit=crop", label: "Gâteau chocolat intense" },
    { url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=85&fit=crop", label: "Tarte fruits rouges" },
    { url: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&q=85&fit=crop", label: "Cheesecake myrtille" },
    { url: "https://images.unsplash.com/photo-1587248720327-8eb72564be1e?w=800&q=85&fit=crop", label: "Gâteau exotique" },
    { url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=85&fit=crop", label: "Choux caramel" },
    { url: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=85&fit=crop", label: "Forêt noire" },
    { url: "https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=800&q=85&fit=crop", label: "Millefeuille" },
  ],

  /* ── INGRÉDIENTS ──── */
  ingredients: [
    { url: "https://images.unsplash.com/photo-1511381939415-e44c0dc4d64b?w=700&q=85&fit=crop", label: "Chocolat fondu" },
    { url: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=700&q=85&fit=crop", label: "Fraises fraîches" },
    { url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=700&q=85&fit=crop", label: "Macarons colorés" },
    { url: "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=700&q=85&fit=crop", label: "Farine et beurre" },
    { url: "https://images.unsplash.com/photo-1587491439149-bd2ff295d450?w=700&q=85&fit=crop", label: "Crème fouettée" },
    { url: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=700&q=85&fit=crop", label: "Vanille et épices" },
  ],

  /* ── BOUTIQUE ─── */
  boutique: [
    { url: "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?w=1400&q=85&fit=crop", label: "Atelier pâtisserie" },
    { url: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1400&q=85&fit=crop", label: "Vitrine pâtisserie" },
    { url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1400&q=85&fit=crop", label: "Gâteau élégant blanc" },
    { url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=1400&q=85&fit=crop", label: "Boutique pâtisserie" },
  ],

  /* ── carroussel ──────── */
  strip: [
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1511381939415-e44c0dc4d64b?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1587248720327-8eb72564be1e?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&q=80&fit=crop",
    "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?w=400&q=80&fit=crop",
  ],
};


  //  autres
   
function mkImg(src, alt, cls) {
  const el = document.createElement('img');
  el.src  = src;
  el.alt  = alt || '';
  el.loading = 'lazy';
  el.decoding = 'async';
  if (cls) el.className = cls;
  return el;
}
function mkDiv(cls) {
  const el = document.createElement('div');
  if (cls) el.className = cls;
  return el;
}


  //  DÉTECTION DE PAGE
const onIndex    = !!document.querySelector('.hero');
const onCommande = !!document.querySelector('.products-grid');
const onPerso    = !!document.querySelector('.cakes-selector');
const onService  = !!document.querySelector('.sc-main');


  //  PAGE ACCUEIL , CARTES et ARRIÈRE-PLANS
  
if (onIndex) {

  /* 1. HERO : showcase photo flottante */
  const showcase = document.querySelector('.cake-showcase');
  if (showcase) {
    showcase.innerHTML = '';
    const pShowcase = mkDiv('iv-hero-showcase');
    pShowcase.innerHTML = `<div class="iv-ring iv-ring-outer"></div><div class="iv-ring iv-ring-inner"></div>`;

    const mainPhoto = mkImg(IMGS.cakes[0].url, IMGS.cakes[0].label, 'iv-hero-main-photo iv-float-a');

    const miniData = [
      { src: IMGS.ingredients[0].url, label: IMGS.ingredients[0].label, cls: 'iv-mini iv-mini-1 iv-float-b' },
      { src: IMGS.ingredients[1].url, label: IMGS.ingredients[1].label, cls: 'iv-mini iv-mini-2 iv-float-c' },
      { src: IMGS.ingredients[2].url, label: IMGS.ingredients[2].label, cls: 'iv-mini iv-mini-3 iv-float-a' },
    ];
    miniData.forEach(d => {
      const m = mkImg(d.src, d.label, d.cls);
      m.addEventListener('mouseenter', () => {
        mainPhoto.classList.add('iv-photo-swap');
        setTimeout(() => { mainPhoto.src = d.src; mainPhoto.classList.remove('iv-photo-swap'); }, 180);
      });
      pShowcase.appendChild(m);
    });

    pShowcase.appendChild(mainPhoto);
    showcase.appendChild(pShowcase);

    /* rotation douce toutes les 3.5s */
    let heroIdx = 0;
    setInterval(() => {
      heroIdx = (heroIdx + 1) % IMGS.cakes.length;
      mainPhoto.classList.add('iv-photo-swap');
      setTimeout(() => { mainPhoto.src = IMGS.cakes[heroIdx].url; mainPhoto.classList.remove('iv-photo-swap'); }, 200);
    }, 3500);
  }

  /* 2. HERO BG : éléments ingrédients décoratifs */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    [
      { src: IMGS.ingredients[3].url, cls: 'iv-deco-float iv-deco-1 iv-float-b' },
      { src: IMGS.ingredients[4].url, cls: 'iv-deco-float iv-deco-2 iv-float-c' },
      { src: IMGS.boutique[0].url,    cls: 'iv-deco-float iv-deco-3 iv-float-a' },
    ].forEach(d => heroBg.appendChild(mkImg(d.src, '', d.cls)));
  }

  /* 3. CARTES SIGNATURE :  */
  document.querySelectorAll('.cake-card').forEach((card, i) => {
    const iconDiv = card.querySelector('.cake-card-icon');
    if (!iconDiv) return;
    const wrap  = mkDiv('iv-card-img-wrap');
    const photo = mkImg(IMGS.cakes[i % IMGS.cakes.length].url, IMGS.cakes[i % IMGS.cakes.length].label, 'iv-card-photo');
    wrap.appendChild(photo);
    iconDiv.replaceWith(wrap);
  });

  /* 4. photo  boutique  */
  const whyVisual = document.querySelector('.why-visual');
  if (whyVisual) {
    whyVisual.innerHTML = '';
    const photoWrap = mkDiv('iv-why-wrap');
    photoWrap.innerHTML = `<div class="iv-why-badge">37 ans de savoir-faire ✦</div>`;
    photoWrap.appendChild(mkImg(IMGS.boutique[1].url, 'Ambiance pâtisserie Maison Dorée', 'iv-why-photo iv-float-b'));
    whyVisual.appendChild(photoWrap);
  }

  /* exemple de témoignage */
  const testiSection = document.querySelector('.testimonials-section');
  if (testiSection) {
    testiSection.style.cssText += ';position:relative;overflow:hidden';
    const bg = mkDiv('iv-testi-bg');
    bg.appendChild(mkImg(IMGS.boutique[2].url, ''));
    testiSection.insertBefore(bg, testiSection.firstChild);
    Array.from(testiSection.children).forEach(c => {
      if (c !== bg) { c.style.position = 'relative'; c.style.zIndex = '1'; }
    });
  }

  /* carroussel */
  const whySection = document.querySelector('.why-section');
  if (whySection) whySection.parentNode.insertBefore(buildStrip(), whySection);
}


  //  PAGE COMMANDE
   
if (onCommande) {
  injectHeader(IMGS.boutique[3].url);

  document.querySelectorAll('.product-card').forEach((card, i) => {
    const emojiDiv = card.querySelector('.product-img');
    if (!emojiDiv) return;
    const wrap  = mkDiv('iv-product-img-wrap');
    const photo = mkImg(IMGS.cakes[i % IMGS.cakes.length].url, IMGS.cakes[i % IMGS.cakes.length].label, 'iv-product-photo');
    wrap.appendChild(photo);
    emojiDiv.replaceWith(wrap);
  });

  /*  arrière-plan cart */
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.style.position = 'relative';
    cartSidebar.style.overflow = 'hidden';
    const decoBg = mkDiv('iv-cart-deco-bg');
    decoBg.appendChild(mkImg(IMGS.ingredients[0].url, ''));
    cartSidebar.appendChild(decoBg);
  }

  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    const s = buildStrip();
    s.style.gridColumn = '1 / -1';
    filterBar.parentNode.insertBefore(s, filterBar.nextSibling);
  }
}


  //  PAGE PERSONNALISER

if (onPerso) {
  injectHeader(IMGS.ingredients[2].url);

  document.querySelectorAll('.cake-sel-card').forEach((card, i) => {
    const iconDiv = card.querySelector('.cake-sel-icon');
    if (!iconDiv) return;
    iconDiv.replaceWith(mkImg(IMGS.cakes[i % IMGS.cakes.length].url, IMGS.cakes[i % IMGS.cakes.length].label, 'iv-sel-photo'));
  });

  const persoMain = document.querySelector('.perso-main');
  if (persoMain) {
    persoMain.style.position = 'relative';
    const bgDeco = mkDiv('iv-perso-bg');
    bgDeco.appendChild(mkImg(IMGS.ingredients[5].url, ''));
    persoMain.insertBefore(bgDeco, persoMain.firstChild);
  }

  const stepsBar = document.querySelector('.steps-bar');
  if (stepsBar) stepsBar.parentNode.insertBefore(buildStrip(), stepsBar);
}


  //  PAGE SERVICE CLIENT
 
if (onService) {
  injectHeader(IMGS.boutique[1].url);

  const contactBgs = [IMGS.boutique[3].url, IMGS.boutique[0].url, IMGS.boutique[1].url];
  document.querySelectorAll('.contact-card').forEach((card, i) => {
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    const bgWrap = mkDiv('iv-contact-card-bg');
    bgWrap.appendChild(mkImg(contactBgs[i] || IMGS.boutique[0].url, ''));
    card.insertBefore(bgWrap, card.firstChild);
    const overlay = mkDiv('iv-contact-overlay');
    card.insertBefore(overlay, bgWrap.nextSibling);
    Array.from(card.children).forEach(c => {
      if (c !== bgWrap && c !== overlay) { c.style.position = 'relative'; c.style.zIndex = '2'; }
    });
    card.addEventListener('mouseenter', () => {
      bgWrap.querySelector('img').style.transform = 'scale(1.07)';
      overlay.style.background = 'rgba(253,246,236,0.80)';
    });
    card.addEventListener('mouseleave', () => {
      bgWrap.querySelector('img').style.transform = 'scale(1)';
      overlay.style.background = 'rgba(253,246,236,0.88)';
    });
  });

  const scForm = document.querySelector('.sc-form-section');
  if (scForm) {
    scForm.insertBefore(
      mkImg(IMGS.boutique[0].url, 'Atelier Maison Dorée', 'iv-sc-banner-photo'),
      scForm.firstChild
    );
  }

  const scMain = document.querySelector('.sc-main')

    // FONCTIONS PARTAGÉES

  if (scMain) scMain.parentNode.insertBefore(buildStrip(), scMain.nextSibling);
}

function injectHeader(src) {
  const header = document.querySelector('.page-header');
  if (!header) return;
  header.style.position = 'relative';
  header.style.overflow = 'hidden';
  const wrap = mkDiv('iv-page-header-bg');
  wrap.appendChild(mkImg(src, ''));
  header.insertBefore(wrap, header.firstChild);
  Array.from(header.children).forEach(c => {
    if (c !== wrap) { c.style.position = 'relative'; c.style.zIndex = '1'; }
  });
}

function buildStrip() {
  const strip = mkDiv('iv-strip');
  const track = mkDiv('iv-strip-track');
  [...IMGS.strip, ...IMGS.strip].forEach(src => {
    track.appendChild(mkImg(src, 'Création Maison Dorée', 'iv-strip-item'));
  });
  strip.appendChild(track);
  return strip;
}
