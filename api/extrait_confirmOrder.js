/* ═══════════════════════════════════════════════════════════
   EXTRAIT JS à remplacer dans commande.html
   Remplace la fonction confirmOrder() existante par celle-ci.
   ═══════════════════════════════════════════════════════════

   AVANT (ancienne version — commande factice) :
   ─────────────────────────────────────────────
   function confirmOrder() {
     const mode  = document.querySelector('input[name=paymode]:checked').value;
     const total = cart.reduce(...)
     const ref   = 'MD-' + Date.now()...
     ...
     setStep(3);
     cart.length = 0; renderCart();
   }

   APRÈS (nouvelle version — envoie à PHP/MySQL) :
   ─────────────────────────────────────────────── */

async function confirmOrder() {
  const mode = document.querySelector('input[name=paymode]:checked').value;

  // ── 1. Construire l'objet à envoyer ───────────────────────
  const payload = {
    prenom:          document.getElementById('fPrenom').value,
    nom:             document.getElementById('fNom').value,
    telephone:       document.getElementById('fTel').value,
    adresse:         document.getElementById('fAdresse').value,
    email:           document.getElementById('fEmail')?.value || '',
    note:            document.getElementById('fNote').value,
    date_livraison:  document.getElementById('fDate').value,
    mode_paiement:   mode,

    // Transformer le tableau cart en format attendu par PHP
    articles: cart.map(item => ({
      nom:      item.name,
      taille:   item.size,       // 'petite' | 'moyenne' | 'grande'
      quantite: item.qty,
      prix:     item.price       // PHP recalcule depuis la BDD, ce champ est ignoré
    }))
  };

  // ── 2. Désactiver le bouton pendant l'envoi ────────────────
  const btn = document.getElementById('btnConfirmerPaiement');
  if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

  try {
    // ── 3. Appel fetch vers l'API PHP ──────────────────────────
    const response = await fetch('api/commande.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)   // convertit l'objet JS en JSON texte
    });

    // ── 4. Lire la réponse JSON de PHP ─────────────────────────
    const result = await response.json();

    if (!response.ok || !result.succes) {
      // PHP a retourné une erreur
      throw new Error(result.message || 'Erreur inconnue du serveur.');
    }

    // ── 5. Succès — afficher la confirmation ───────────────────
    document.getElementById('confirmMsg').textContent =
      `Commande de ${result.montant.toLocaleString()} FCFA enregistrée en base de données !`;
    document.getElementById('confirmRef').textContent =
      '🔖 Référence : ' + result.reference;

    setStep(3);
    cart.length = 0;
    renderCart();

  } catch (erreur) {
    // ── 6. Afficher l'erreur à l'utilisateur ───────────────────
    showToast('❌ ' + erreur.message);
    console.error('Erreur API commande :', erreur);

  } finally {
    // ── 7. Réactiver le bouton dans tous les cas ───────────────
    if (btn) { btn.disabled = false; btn.textContent = '✦ Confirmer et prépayer'; }
  }
}

/* ═══════════════════════════════════════════════════════════
   AJOUTE AUSSI cet id au bouton dans ton HTML (étape 2 du modal) :

   AVANT :
   <button class="btn-primary" style="..." onclick="confirmOrder()">
     ✦ Confirmer et prépayer
   </button>

   APRÈS :
   <button id="btnConfirmerPaiement" class="btn-primary" style="..." onclick="confirmOrder()">
     ✦ Confirmer et prépayer
   </button>
   ═══════════════════════════════════════════════════════════ */
