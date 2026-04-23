/**
 * ═══════════════════════════════════════════════
 *  PERSONNALISER-API.JS — Océan de Saveurs
 *  Connecte personnaliser.html à l'API (api.php)
 *  À placer dans : C:\wamp64\www\ocean-de-saveurs\
 *  À ajouter dans personnaliser.html : <script src="personnaliser-api.js" defer></script>
 * ═══════════════════════════════════════════════
 */

const API_PERSO = 'api.php';

/* ══════════════════════════════════════════════
   1. CHARGEMENT DES GÂTEAUX POUR LE SÉLECTEUR
   Remplace les cartes statiques du step 1 par
   les données réelles de la table `gateau`
══════════════════════════════════════════════ */
async function chargerGateauxPerso() {
  const selector = document.querySelector('.cakes-selector');
  if (!selector) return;

  selector.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-light)">
      <div style="font-size:2rem;margin-bottom:0.5rem">✨</div>
      Chargement de nos créations...
    </div>`;

  try {
    const res  = await fetch(`${API_PERSO}?action=get_gateaux`);
    const data = await res.json();

    if (!data.succes || !data.gateaux.length) {
      // Laisser les cartes statiques si la BD est vide
      restaurerCartesStatiques();
      return;
    }

    // Stocker les gâteaux BD pour usage dans goToStep3
    window.gateauxBD = data.gateaux;

    selector.innerHTML = '';
    data.gateaux.forEach((g, index) => {
      const card = document.createElement('div');
      card.className = 'cake-sel-card';
      card.onclick = () => selectCakeBD(index);
      card.innerHTML = `
        <div class="cake-sel-icon">${g.emoji || '🎂'}</div>
        <div class="cake-sel-info">
          <h3>${g.libelle_produit}</h3>
          <p>${g.description || g.categorie || ''}</p>
          <span class="cake-sel-price">${parseFloat(g.prix_grande || g.prix_unitaire).toLocaleString('fr-FR')} FCFA</span>
        </div>`;
      selector.appendChild(card);
    });

  } catch (err) {
    console.warn('BD non accessible, utilisation des données statiques:', err);
    // Les cartes HTML statiques originales restent affichées
  }
}

/* ══════════════════════════════════════════════
   2. SÉLECTION D'UN GÂTEAU DEPUIS LA BD
   Charge les ingrédients réels depuis `ingrédient`
══════════════════════════════════════════════ */
async function selectCakeBD(index) {
  const gateau = window.gateauxBD?.[index];
  if (!gateau) { selectCake(index); return; } // fallback statique

  // Mettre à jour les indicateurs visuels
  document.getElementById('step1-ind').classList.remove('active');
  document.getElementById('step2-ind').classList.add('active');
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');

  // Stocker le gâteau sélectionné
  window.selectedGateauBD = gateau;

  // Afficher la sidebar immédiatement
  afficherSidebarBD(gateau);

  // Charger les ingrédients depuis la BD
  const panel = document.getElementById('ingredientPanel');
  panel.innerHTML = `
    <div style="text-align:center;padding:2rem;color:var(--text-light)">
      <div style="font-size:1.5rem">⏳</div> Chargement des ingrédients...
    </div>`;

  try {
    const res  = await fetch(`${API_PERSO}?action=get_gateau&id=${gateau.num_produits}`);
    const data = await res.json();

    const ingrBD = data.gateau?.ingredients || [];

    if (ingrBD.length > 0) {
      afficherIngredientsBD(gateau, ingrBD);
    } else {
      // Fallback : utiliser les ingrédients statiques du gâteau correspondant
      afficherIngredientsFallback(gateau, index);
    }
  } catch (err) {
    console.warn('Ingrédients BD non chargés, fallback statique');
    afficherIngredientsFallback(gateau, index);
  }
}

function afficherIngredientsBD(gateau, ingrBD) {
  const panel = document.getElementById('ingredientPanel');
  window.ingredientsBD = {};

  panel.innerHTML = `
    <h2 class="perso-title">${gateau.emoji || '🎂'} Personnalisez les ingrédients</h2>
    <p class="perso-sub">Cochez ou décochez les ingrédients selon vos préférences. Tout est sélectionné par défaut.</p>
    <div class="ingr-category">
      <h3 class="ingr-cat-title">Ingrédients</h3>
      <div class="ingr-grid" id="ingrGrid"></div>
    </div>`;

  const grid = document.getElementById('ingrGrid');
  ingrBD.forEach(ingr => {
    const id = `bd_${ingr['nom-ingrédient']}`;
    const label = ingr['nom-ingrédient'];
    const qtt   = ingr['qtt-ingrédient'];

    window.ingredientsBD[id] = true;

    const el = document.createElement('label');
    el.className = 'ingr-item checked';
    el.id = `label_${id}`;
    el.innerHTML = `
      <input type="checkbox" checked
        onchange="toggleIngredientBD('${id}', '${label}', this.checked)" />
      <div class="ingr-item-content">
        <span class="ingr-name">${label}</span>
        <span class="ingr-info">Quantité : ${qtt || 'standard'}</span>
      </div>
      <div class="ingr-check-icon">✓</div>`;
    grid.appendChild(el);
  });

  mettreAJourSidebar();
}

function afficherIngredientsFallback(gateau, index) {
  // Les données statiques du JS original sont toujours disponibles
  if (typeof cakes !== 'undefined' && cakes[index]) {
    selectedCake = index;
    ingredients  = {};
    cakes[index].categories.forEach(cat => {
      cat.items.forEach(item => { ingredients[item.id] = true; });
    });
    renderIngredientPanel(cakes[index]);
    updateSidebar(cakes[index]);
  } else {
    document.getElementById('ingredientPanel').innerHTML =
      `<p style="color:var(--text-light);padding:2rem">Ingrédients non disponibles pour ce gâteau.</p>`;
  }
}

function afficherSidebarBD(gateau) {
  const pG = parseFloat(gateau.prix_grande || gateau.prix_unitaire) || 0;
  document.getElementById('cakePreview').innerHTML = `
    <div class="preview-icon">${gateau.emoji || '🎂'}</div>
    <div class="preview-name">${gateau.libelle_produit}</div>
    <div class="preview-desc">${gateau.description || ''}</div>
    <div class="preview-count" id="previewCount">Chargement des ingrédients...</div>`;
  document.getElementById('priceBox').innerHTML = `
    <div class="price-label">Prix de base</div>
    <div class="price-amount" id="prixDynamique">${pG.toLocaleString('fr-FR')} Frcfa</div>
    <div class="price-note">Livraison offerte dès 10 000 Frcfa</div>`;
}

function toggleIngredientBD(id, nom, checked) {
  if (!window.ingredientsBD) return;
  window.ingredientsBD[id] = checked;
  const label = document.getElementById(`label_${id}`);
  if (label) {
    label.classList.toggle('checked', checked);
    label.classList.toggle('unchecked', !checked);
  }
  mettreAJourSidebar();
  showToast(checked ? `✓ Ajouté : ${nom}` : `✗ Retiré : ${nom}`);
}

function mettreAJourSidebar() {
  if (!window.ingredientsBD || !window.selectedGateauBD) return;
  const total   = Object.keys(window.ingredientsBD).length;
  const checked = Object.values(window.ingredientsBD).filter(Boolean).length;
  const gateau  = window.selectedGateauBD;
  const prixBase = parseFloat(gateau.prix_grande || gateau.prix_unitaire) || 0;
  const remise   = (total - checked) * (prixBase * 0.02); // -2% par ingrédient retiré
  const prixFinal = Math.max(prixBase - remise, prixBase * 0.7);

  const countEl = document.getElementById('previewCount');
  const prixEl  = document.getElementById('prixDynamique');
  if (countEl) countEl.innerHTML = `<strong>${checked}/${total}</strong> ingrédients sélectionnés`;
  if (prixEl)  prixEl.textContent = `${Math.round(prixFinal).toLocaleString('fr-FR')} Frcfa`;
}

/* ══════════════════════════════════════════════
   3. ENVOI DE LA COMMANDE PERSONNALISÉE
   Enregistre la commande + ingrédients choisis
══════════════════════════════════════════════ */
async function envoyerCommandePerso(infoClient) {
  const gateau = window.selectedGateauBD;
  if (!gateau) { showToast('❌ Aucun gâteau sélectionné'); return; }

  const prixBase = parseFloat(gateau.prix_grande || gateau.prix_unitaire) || 0;
  const ingrActifs = window.ingredientsBD
    ? Object.entries(window.ingredientsBD)
        .filter(([, v]) => v)
        .map(([k]) => k.replace('bd_', ''))
        .join(', ')
    : '';

  const note = `Gâteau personnalisé : ${gateau.libelle_produit}. Ingrédients retenus : ${ingrActifs}`;

  try {
    const res = await fetch(`${API_PERSO}?action=passer_commande`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_client:              infoClient.nom        || 'Client',
        num_tel:                 infoClient.tel        || '',
        email:                   infoClient.email      || '',
        adresse_livraison:       infoClient.adresse    || '',
        ville_livraison:         infoClient.ville      || 'Abidjan',
        date_livraison_souhaitee: infoClient.date      || null,
        note_client:             note,
        montant_total:           prixBase,
        mode_paiement:           infoClient.paiement   || 'À définir',
        livraison_offerte:       prixBase >= 10000 ? 1 : 0,
      })
    });
    const data = await res.json();
    if (!data.succes) throw new Error(data.erreur);

    return data.id_commande;
  } catch (err) {
    console.error('Erreur commande perso:', err);
    throw err;
  }
}

/* ══════════════════════════════════════════════
   4. REMPLACEMENT DE goToStep3 POUR LA BD
   Ajoute un formulaire client + bouton d'envoi
══════════════════════════════════════════════ */
function goToStep3BD() {
  const gateau = window.selectedGateauBD;
  if (!gateau) { goToStep3(); return; } // fallback statique

  document.getElementById('step2-ind').classList.remove('active');
  document.getElementById('step3-ind').classList.add('active');
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.remove('hidden');

  const ingrActifs = window.ingredientsBD
    ? Object.entries(window.ingredientsBD)
        .filter(([, v]) => v)
        .map(([k]) => k.replace('bd_', ''))
    : [];

  const prixBase = parseFloat(gateau.prix_grande || gateau.prix_unitaire) || 0;
  const total    = Object.keys(window.ingredientsBD || {}).length;
  const checked  = ingrActifs.length;
  const remise   = (total - checked) * (prixBase * 0.02);
  const prixFinal = Math.max(prixBase - remise, prixBase * 0.7);

  document.getElementById('summaryBox').innerHTML = `
    <div class="summary-header">
      <div class="summary-icon">${gateau.emoji || '🎂'}</div>
      <h2>${gateau.libelle_produit}</h2>
      <p>${gateau.description || ''}</p>
    </div>
    <div class="summary-ingredients">
      <h3>Votre composition (${checked} ingrédients) :</h3>
      <div class="sum-cat">
        <h4>Ingrédients sélectionnés</h4>
        <ul>${ingrActifs.map(i => `<li>✓ ${i}</li>`).join('') || '<li>Composition standard</li>'}</ul>
      </div>
      <div style="text-align:center;margin:1.5rem 0">
        <div class="price-label">Prix final estimé</div>
        <div class="price-amount">${Math.round(prixFinal).toLocaleString('fr-FR')} Frcfa</div>
      </div>
    </div>

    <!-- Formulaire client -->
    <div style="border-top:1px solid rgba(212,168,67,0.1);padding-top:1.5rem;margin-top:1rem">
      <h3 style="font-family:'Playfair Display',serif;color:var(--text-dark);margin-bottom:1rem">
        📋 Vos coordonnées
      </h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
        <div class="cf-group">
          <label>Nom complet *</label>
          <input type="text" id="persoNom" placeholder="Marie Dupont" required
            style="padding:0.7rem;border:1.5px solid rgba(212,168,67,0.2);border-radius:10px;
                   background:var(--surface-2);color:var(--text-dark);font-family:'DM Sans',sans-serif;width:100%"/>
        </div>
        <div class="cf-group">
          <label>Téléphone *</label>
          <input type="tel" id="persoTel" placeholder="+225 07 XX XX XX" required
            style="padding:0.7rem;border:1.5px solid rgba(212,168,67,0.2);border-radius:10px;
                   background:var(--surface-2);color:var(--text-dark);font-family:'DM Sans',sans-serif;width:100%"/>
        </div>
        <div class="cf-group" style="grid-column:1/-1">
          <label>Adresse de livraison *</label>
          <input type="text" id="persoAdresse" placeholder="Cocody, rue des Jardins" required
            style="padding:0.7rem;border:1.5px solid rgba(212,168,67,0.2);border-radius:10px;
                   background:var(--surface-2);color:var(--text-dark);font-family:'DM Sans',sans-serif;width:100%"/>
        </div>
        <div class="cf-group">
          <label>Ville</label>
          <input type="text" id="persoVille" value="Abidjan"
            style="padding:0.7rem;border:1.5px solid rgba(212,168,67,0.2);border-radius:10px;
                   background:var(--surface-2);color:var(--text-dark);font-family:'DM Sans',sans-serif;width:100%"/>
        </div>
        <div class="cf-group">
          <label>Date souhaitée</label>
          <input type="date" id="persoDate"
            style="padding:0.7rem;border:1.5px solid rgba(212,168,67,0.2);border-radius:10px;
                   background:var(--surface-2);color:var(--text-dark);font-family:'DM Sans',sans-serif;width:100%"/>
        </div>
      </div>
    </div>

    <div class="summary-actions">
      <button class="btn-primary" style="font-size:1rem;padding:1rem 2.5rem"
        onclick="soumettreCmdPerso()" id="btnSoumettre">
        ✦ Confirmer ma commande
      </button>
      <button class="btn-outline" onclick="retourStep2()">← Modifier</button>
    </div>
    <div id="confirmationPerso" style="display:none;text-align:center;padding:1.5rem;
      background:rgba(212,168,67,0.08);border-radius:16px;border:1px solid rgba(212,168,67,0.2);margin-top:1rem">
    </div>`;
}

async function soumettreCmdPerso() {
  const nom     = document.getElementById('persoNom')?.value.trim();
  const tel     = document.getElementById('persoTel')?.value.trim();
  const adresse = document.getElementById('persoAdresse')?.value.trim();

  if (!nom || !tel || !adresse) {
    showToast('⚠️ Veuillez remplir les champs obligatoires (*)');
    return;
  }

  const btn = document.getElementById('btnSoumettre');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  try {
    const idCommande = await envoyerCommandePerso({
      nom,
      tel,
      adresse,
      ville:   document.getElementById('persoVille')?.value  || 'Abidjan',
      date:    document.getElementById('persoDate')?.value   || null,
      email:   '',
      paiement: 'À définir',
    });

    const ref = 'MD-PERSO-' + idCommande;
    const confirmDiv = document.getElementById('confirmationPerso');
    confirmDiv.style.display = 'block';
    confirmDiv.innerHTML = `
      <div style="font-size:2rem;margin-bottom:0.5rem">🎉</div>
      <strong style="color:var(--text-dark);font-family:'Playfair Display',serif;font-size:1.1rem">
        Commande enregistrée avec succès !
      </strong>
      <p style="color:var(--text-light);margin-top:0.5rem">
        Votre référence : <strong style="color:var(--gold)">${ref}</strong>
      </p>
      <p style="color:var(--text-light);font-size:0.88rem;margin-top:0.3rem">
        Notre équipe vous contactera au ${tel} pour confirmer les détails.
      </p>`;

    btn.textContent = '✓ Commande envoyée';

  } catch (err) {
    showToast('❌ Erreur : ' + (err.message || 'Impossible d\'enregistrer'));
    btn.disabled = false;
    btn.textContent = '✦ Confirmer ma commande';
  }
}

function retourStep2() {
  document.getElementById('step2-ind').classList.add('active');
  document.getElementById('step3-ind').classList.remove('active');
  document.getElementById('step2').classList.remove('hidden');
  document.getElementById('step3').classList.add('hidden');
}

/* ══════════════════════════════════════════════
   5. PATCH DU BOUTON "Commander ce gâteau"
   Redirige vers goToStep3BD si la BD est active
══════════════════════════════════════════════ */
function patchBoutonCommander() {
  const btn = document.querySelector('[onclick="goToStep3()"]');
  if (btn) btn.setAttribute('onclick', 'goToStep3BD()');
}

/* ══════════════════════════════════════════════
   6. INITIALISATION
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  chargerGateauxPerso().then(patchBoutonCommander);
});
