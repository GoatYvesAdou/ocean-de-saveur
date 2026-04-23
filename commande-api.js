/**
 * ═══════════════════════════════════════════════
 *  COMMANDE-API.JS — Océan de Saveurs
 *  Connecte commande.html à l'API (api.php)
 *  À placer dans : C:\wamp64\www\ocean-de-saveurs\
 *  À ajouter dans commande.html : <script src="commande-api.js" defer></script>
 * ═══════════════════════════════════════════════
 */

const API = 'api.php';

/* ══════════════════════════════════════════════
   1. CHARGEMENT DES GÂTEAUX DEPUIS LA BD
   Remplace les cartes HTML statiques par les
   données réelles de la table `gateau`
══════════════════════════════════════════════ */
async function chargerGateaux() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Afficher un loader pendant le chargement
  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">
      <div style="font-size:2rem;margin-bottom:0.5rem">⏳</div>
      Chargement de nos créations...
    </div>`;

  try {
    const res  = await fetch(`${API}?action=get_gateaux`);
    const data = await res.json();

    if (!data.succes || !data.gateaux.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">
        Aucun gâteau disponible pour le moment.</div>`;
      return;
    }

    grid.innerHTML = '';
    data.gateaux.forEach(g => grid.appendChild(creerCarteGateau(g)));

    // Réappliquer images-vivantes si présent
    if (typeof window.ivRefreshProductCards === 'function') {
      window.ivRefreshProductCards();
    }

  } catch (err) {
    console.error('Erreur chargement gâteaux:', err);
    // En cas d'erreur réseau, laisser les cartes HTML statiques existantes
    grid.innerHTML = document.getElementById('productsGrid-static')?.innerHTML || '';
  }
}

function creerCarteGateau(g) {
  // Tags spéciaux (sans gluten, vegan, etc.)
  const tags = [];
  if (g.sans_gluten == 1) tags.push('<span class="tag">Sans gluten ✓</span>');
  if (g.vegan == 1)       tags.push('<span class="tag" style="color:white;">Végétalien ✓</span>');
  if (g.sans_lactose == 1) tags.push('<span class="tag">Sans lactose ✓</span>');

  // Prix par taille (depuis la BD)
  const pP = parseFloat(g.prix_petite)  || Math.round(parseFloat(g.prix_grande) * 0.67);
  const pM = parseFloat(g.prix_moyenne) || parseFloat(g.prix_grande);
  const pG = parseFloat(g.prix_grande)  || parseFloat(g.prix_unitaire);

  // Catégorie → data-cat pour les filtres
  const catMap = {
    'Classiques': 'classique', 'Fruités': 'fruite',
    'Chocolat': 'chocolat',   'Exotiques': 'exotique'
  };
  const dataCat = catMap[g.categorie] || 'classique';

  const div = document.createElement('div');
  div.className = 'product-card';
  div.dataset.cat     = dataCat;
  div.dataset.grande  = pG;
  div.dataset.moyenne = pM;
  div.dataset.id      = g.num_produits;

  // Fond photo si disponible
  if (g.photo_url) {
    div.style.backgroundImage = `url(${g.photo_url})`;
    div.style.backgroundSize  = 'cover';
  }

  div.innerHTML = `
    <div class="product-body">
      ${tags.length ? `<div class="product-tags">${tags.join('')}</div>` : ''}
      <h3>${g.libelle_produit}</h3>
      <p style="color:white;">${g.description || ''}</p>
      <div class="product-options">
        <label>Taille :</label>
        <div class="size-selector">
          <button class="size-btn active" data-size="petite" onclick="selectSize(this)">
            <span>Petite</span><em class="size-price">${Math.round(pP)} Frcfa</em>
          </button>
          <button class="size-btn" data-size="moyenne" onclick="selectSize(this)">
            <span>Moyenne</span><em class="size-price">${Math.round(pM)} Frcfa</em>
          </button>
          <button class="size-btn" data-size="grande" onclick="selectSize(this)">
            <span>Grande</span><em class="size-price">${Math.round(pG)} Frcfa</em>
          </button>
        </div>
      </div>
      <div class="product-footer">
        <span class="product-price">${Math.round(pP)} Frcfa</span>
        <button class="btn-primary" style="padding:0.6rem 1.2rem;font-size:0.82rem"
          onclick="addToCartFromCard(this)">Ajouter</button>
      </div>
    </div>`;

  return div;
}

/* ══════════════════════════════════════════════
   2. FILTRE CATÉGORIES DEPUIS LA BD
   Charge les boutons de filtre dynamiquement
══════════════════════════════════════════════ */
async function chargerFiltres() {
  try {
    const res  = await fetch(`${API}?action=get_categories`);
    const data = await res.json();
    if (!data.succes) return;

    const bar = document.querySelector('.filter-bar');
    if (!bar) return;

    // Garder uniquement le bouton "Tous"
    bar.innerHTML = `<button class="filter-btn active" onclick="filterCakes('all',this)">Tous</button>`;

    const catMap = {
      'Classiques': 'classique', 'Fruités': 'fruite',
      'Chocolat': 'chocolat',   'Exotiques': 'exotique'
    };
    data.categories.forEach(cat => {
      const slug = catMap[cat.libelle_gateau] || cat.libelle_gateau.toLowerCase();
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = cat.libelle_gateau;
      btn.onclick = function() { filterCakes(slug, this); };
      bar.appendChild(btn);
    });
  } catch (err) {
    console.warn('Filtres BD non chargés, utilisation des filtres statiques');
  }
}

/* ══════════════════════════════════════════════
   3. ENVOI DE LA COMMANDE À LA BD
   Remplace la fonction confirmOrder() existante
══════════════════════════════════════════════ */
async function confirmOrder() {
  const modeEl = document.querySelector('input[name=paymode]:checked');
  if (!modeEl) { showToast('⚠️ Veuillez choisir un mode de paiement'); return; }

  const mode  = modeEl.value;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const labels = {
    mobile_money: 'Mobile Money',
    carte_bancaire: 'Carte bancaire',
    especes: 'Paiement à la livraison'
  };

  // Récupérer les infos client du step 1
  const prenom  = document.getElementById('fPrenom')?.value  || '';
  const nom     = document.getElementById('fNom')?.value     || '';
  const adresse = document.getElementById('fAdresse')?.value || '';
  const ville   = 'Abidjan'; // Valeur par défaut (pas de champ ville dans le formulaire)
  const tel     = document.getElementById('fTel')?.value     || '';
  const date    = document.getElementById('fDate')?.value    || null;
  const note    = document.getElementById('fNote')?.value    || '';

  // Désactiver le bouton pendant l'envoi
  const btnConfirm = document.querySelector('[onclick="confirmOrder()"]');
  if (btnConfirm) { btnConfirm.disabled = true; btnConfirm.textContent = 'Enregistrement...'; }

  try {
    // 1. Enregistrer la commande
    const resCmd = await fetch(`${API}?action=passer_commande`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_client:               `${prenom} ${nom}`.trim(),
        num_tel:                  tel,
        adresse_livraison:        adresse,
        ville_livraison:          ville,
        date_livraison_souhaitee: date,
        note_client:              note,
        montant_total:            total,
        mode_paiement:            labels[mode],
        livraison_offerte:        total >= 10000 ? 1 : 0,
      })
    });
    const dataCmd = await resCmd.json();
    if (!dataCmd.succes) throw new Error(dataCmd.erreur);

    const idCommande = dataCmd.id_commande;
    const ref = 'MD-' + idCommande + '-' + Date.now().toString(36).toUpperCase();

    // 2. Enregistrer le paiement
    await fetch(`${API}?action=enregistrer_paiement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        num_paiement:    ref,
        montant_paiement: total.toString(),
        mode_paiement:   labels[mode],
        num_commande:    idCommande,
      })
    });

    // 3. Afficher la confirmation (step 3)
    document.getElementById('confirmMsg').textContent =
      `Commande de ${total.toLocaleString('fr-FR')} Frcfa enregistrée. Mode : ${labels[mode]}.`;
    document.getElementById('confirmRef').textContent = '🔖 Référence : ' + ref;
    setStep(3);

    // Vider le panier
    cart.length = 0;
    renderCart();

  } catch (err) {
    console.error('Erreur commande:', err);
    showToast('❌ Erreur : ' + (err.message || 'Impossible d\'enregistrer la commande'));
    if (btnConfirm) { btnConfirm.disabled = false; btnConfirm.textContent = 'Confirmer et payer'; }
  }
}

/* ══════════════════════════════════════════════
   4. INITIALISATION AU CHARGEMENT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  chargerFiltres();
  chargerGateaux();
});
