/**
 * IMAGES VIVANTES — Océan de Saveurs


   BIBLIOTHÈQUE D'IMAGES
   ══════════════════════════════════════════════════════ */
const IMGS = {

  /* ── IMAGE DE GÂTEAUX RÉELS (LOCAL et externe) ───── */
  cakes : [
    { url: "gateau choco.jpeg", label: "Layer cake chocolat" },
    { url: "gateau fraise.png", label: "Fraisier fraise" },
    { url: "foret noir.jpeg", label: "Forêt noire" },
    { url: "tarte fraise.jpeg", label: "Tarte fruits rouges" },
    { url: "macaron rose.jpeg", label: "Macaron rose" },
    { url: "vanille.jpeg", label: "Vanille suprême" },
    { url: "mangue.jpeg", label: "Gâteau exotique" },
    { url: "myrtille.jpeg", label: "Millefeuille" },
  ],

  /* ── INGRÉDIENTS ──── */
  ingredients: [
    { url: "vanille.jpeg", label: "Vanille premium" },
    { url: "citron.jpeg", label: "Citron confit" },
    { url: "cform.jpeg", label: "Crème fraîche" },
    { url: "mangue.jpeg", label: "Mango frais" },
    { url: "myrtille.jpeg", label: "Mytille" },
    { url: "fruit rouge.jpeg", label: "Fruits rouges" },
  ],

  /* ── BOUTIQUE ─── */
  boutique: [
    { url: "wsection.jpeg", label: "Atelier Océan de Saveurs" },
    { url: "imgp.jpeg", label: "Vitrine pâtisserie" },
    { url: "cform.jpeg", label: "Plateau gourmands" },
    { url: "gateau fraise.png", label: "Ambiance boutique" },
  ],

  /* ── carroussel ──────── */
  strip: [
    "vanille.jpeg",
    "citron.jpeg",
    "gateau fraise.png",
    "macaron rose.jpeg",
    "myrtille.jpeg",
    "mangue.jpeg",
    "foret noir.jpeg",
    "tarte fraise.jpeg",
    "gateau choco.jpeg",
    "fruit rouge.jpeg",
  ],
};


  //  autres
   
function mkImg(src, alt, cls) {
  const el = document.createElement('img');
  const normalizedSrc = src ? encodeURI(src.trim()) : '';
  el.src  = normalizedSrc;
  el.alt  = alt || '';
  el.loading = 'lazy';
  el.decoding = 'async';
  if (cls) el.className = cls;
  el.onerror = () => {
    // si le local manque, masquer l'élément pour éviter le cœur brisé
    el.style.display = 'none';
  };
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

try {
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

      /* rotation douce toutes les 8s */
      let heroIdx = 0;
      setInterval(() => {
        heroIdx = (heroIdx + 1) % IMGS.cakes.length;
        mainPhoto.classList.add('iv-photo-swap');
        setTimeout(() => { mainPhoto.src = IMGS.cakes[heroIdx].url; mainPhoto.classList.remove('iv-photo-swap'); }, 200);
      }, 8000);
    }

    /* 2. HERO BG : éléments ingrédients décoratifs (désactivés pour éviter bruit visuel) */
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
      heroBg.style.opacity = '0.35';
      heroBg.style.filter = 'blur(2px)';
      // plus de décorations d'image ajoutées ici pour éviter éléments parasites visuels
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
      photoWrap.innerHTML = `<div class="iv-why-badge">6 ans de savoir-faire ✦</div>`;
      photoWrap.appendChild(mkImg(IMGS.boutique[1].url, 'Ambiance pâtisserie Océan de Saveurs', 'iv-why-photo iv-float-b'));
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
} catch (e) {
  console.warn('Erreur dans images-vivantes.js (page accueil):', e);
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
      mkImg(IMGS.boutique[0].url, 'Atelier Océan de Saveurs', 'iv-sc-banner-photo'),
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
    track.appendChild(mkImg(src, 'Création Océan de Saveurs', 'iv-strip-item'));
  });
  strip.appendChild(track);
  return strip;
}
