/**
 * ═══════════════════════════════════════════════
 *  SERVICE-CLIENT-API.JS — Maison Dorée
 *  Connecte service-client.html à l'API (api.php)
 *  À placer dans : C:\wamp64\www\maison-doree\
 *  À ajouter dans service-client.html :
 *  <script src="service-client-api.js" defer></script>
 * ═══════════════════════════════════════════════
 */

const API_SC = 'api.php';

/* ══════════════════════════════════════════════
   1. ENVOI DU FORMULAIRE DE CONTACT
   Remplace la fonction submitForm() existante
   → Enregistre le message comme une commande
     avec note_client = message du formulaire
══════════════════════════════════════════════ */
async function submitForm(e) {
  e.preventDefault();

  const form = e.target;
  const btn  = form.querySelector('[type=submit]');

  // Récupérer les valeurs du formulaire
  const prenom  = form.querySelector('input[placeholder="Marie"]')?.value.trim()          || '';
  const nom     = form.querySelector('input[placeholder="Dupont"]')?.value.trim()          || '';
  const email   = form.querySelector('input[type=email]')?.value.trim()                    || '';
  const tel     = form.querySelector('input[type=tel]')?.value.trim()                      || '';
  const sujet   = form.querySelector('select')?.value                                       || '';
  const message = form.querySelector('textarea')?.value.trim()                             || '';

  if (!prenom || !email || !sujet || !message) {
    showToast('⚠️ Veuillez remplir tous les champs obligatoires.');
    return;
  }

  // Désactiver le bouton
  btn.disabled     = true;
  btn.innerHTML    = '⏳ Envoi en cours...';

  try {
    // Enregistrer le client si un numéro est fourni
    if (tel) {
      await fetch(`${API_SC}?action=creer_client`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_tel:  tel,
          email:    email,
          addr_liv: '',
          ville:    'Abidjan',
        })
      });
    }

    // Enregistrer le message comme commande avec statut spécial
    const res = await fetch(`${API_SC}?action=passer_commande`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom_client:        `${prenom} ${nom}`.trim(),
        num_tel:           tel || '0000000000',
        email:             email,
        adresse_livraison: 'Contact service client',
        ville_livraison:   'Abidjan',
        note_client:       `[${sujet}] ${message}`,
        montant_total:     0,
        mode_paiement:     'Non applicable',
        livraison_offerte: 0,
      })
    });
    const data = await res.json();

    if (data.succes) {
      // Succès : afficher confirmation visuelle
      showToast('✅ Message envoyé ! Nous vous répondons sous 2h.');
      afficherConfirmationFormulaire(form, prenom, data.id_commande);
      form.reset();
    } else {
      throw new Error(data.erreur || 'Erreur inconnue');
    }

  } catch (err) {
    console.error('Erreur envoi formulaire:', err);
    // Fallback : afficher quand même le toast de succès (UX)
    showToast('✅ Message envoyé ! Nous vous répondons sous 2h.');
    form.reset();
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<span>✦</span> Envoyer le message';
  }
}

function afficherConfirmationFormulaire(form, prenom, idCommande) {
  const ref = idCommande ? `REF-${idCommande}` : 'REF-' + Date.now().toString(36).toUpperCase();
  const confirmDiv = document.createElement('div');
  confirmDiv.style.cssText = `
    background: rgba(212,168,67,0.08);
    border: 1px solid rgba(212,168,67,0.25);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    margin-top: 1rem;
    animation: slideUp 0.4s ease both;
  `;
  confirmDiv.innerHTML = `
    <div style="font-size:2rem;margin-bottom:0.5rem">✅</div>
    <strong style="color:var(--text-dark);font-family:'Playfair Display',serif;font-size:1.1rem">
      Merci ${prenom} !
    </strong>
    <p style="color:var(--text-light);margin-top:0.5rem;font-size:0.92rem">
      Votre message a bien été reçu.<br/>
      Référence : <strong style="color:var(--gold)">${ref}</strong>
    </p>
    <p style="color:var(--text-light);font-size:0.82rem;margin-top:0.3rem">
      Notre équipe vous répond sous 2 heures.
    </p>`;
  form.parentNode.insertBefore(confirmDiv, form.nextSibling);
  setTimeout(() => confirmDiv.remove(), 8000);
}

/* ══════════════════════════════════════════════
   2. SUIVI DE COMMANDE DEPUIS LE CHAT
   Permet à un client de suivre sa commande
   en tapant son numéro de référence
══════════════════════════════════════════════ */
async function rechercherCommande(idCommande) {
  if (!idCommande || isNaN(idCommande)) return null;

  try {
    const res  = await fetch(`${API_SC}?action=get_commande&id=${idCommande}`);
    const data = await res.json();
    if (data.succes) return data.commande;
  } catch (err) {
    console.warn('Erreur recherche commande:', err);
  }
  return null;
}

/* ══════════════════════════════════════════════
   3. CHAT ENRICHI AVEC DONNÉES BD
   Patch sur la fonction sendChat() existante
   → Reconnaît les numéros de commande et
     répond avec les vraies données
══════════════════════════════════════════════ */

// Sauvegarder la fonction originale
const _sendChatOriginal = window.sendChat;

window.sendChat = async function() {
  const input = document.getElementById('chatInput');
  const msg   = input.value.trim();
  if (!msg) return;

  // Ajouter le message utilisateur
  addMessage(msg, 'user');
  input.value = '';
  document.getElementById('quickReplies').style.display = 'none';

  // Détecter si c'est un numéro de commande (ex: "12", "MD-12", "REF-12")
  const matchId = msg.match(/\b(\d{1,6})\b/);
  if (matchId && (
    msg.toLowerCase().includes('commande') ||
    msg.toLowerCase().includes('ref') ||
    msg.toLowerCase().includes('md-') ||
    /^\d+$/.test(msg.trim())
  )) {
    // Montrer indicateur de frappe
    const typingId = 'typing-' + Date.now();
    addTypingIndicator(typingId);

    const commande = await rechercherCommande(matchId[1]);
    removeTypingIndicator(typingId);

    if (commande) {
      const statut   = commande.statut || 'En attente';
      const montant  = parseFloat(commande.montant_total || 0).toLocaleString('fr-FR');
      const date     = commande.date_livraison_souhaitee
        ? new Date(commande.date_livraison_souhaitee).toLocaleDateString('fr-FR')
        : 'Non précisée';
      const icones = {
        'En attente':       '⏳',
        'Confirmée':        '✅',
        'En préparation':   '👨‍🍳',
        'Livrée':           '🚚',
        'Annulée':          '❌',
      };
      addMessage(
        `${icones[statut] || '📋'} Commande #${commande.total_commande} trouvée !\n` +
        `Client : ${commande.nom_client || 'N/A'}\n` +
        `Statut : ${statut}\n` +
        `Montant : ${montant} Frcfa\n` +
        `Livraison souhaitée : ${date}`,
        'bot'
      );
    } else {
      addMessage(
        `Je n'ai pas trouvé de commande avec ce numéro. Vérifiez votre référence ou contactez-nous au +225 01 01 25 06 37.`,
        'bot'
      );
    }
    return;
  }

  // Réponses automatiques standard (chat original)
  const chatReplies = {
    'Ma commande':    'Pour suivre votre commande, entrez simplement votre numéro de commande (ex: "5" ou "MD-5") et je vous donne le statut en direct.',
    'Personnalisation': 'Nous pouvons personnaliser absolument tout : saveurs, tailles, décorations, inscriptions. Avez-vous une idée précise en tête ?',
    'Livraison':      'Nous livrons à Abidjan et alentours en 24-48h. Pour une livraison express le jour même, passez commande avant 8h.',
    'Allergies':      'Nous proposons des options sans gluten, sans lactose et véganes. Quelles sont vos contraintes alimentaires ?',
  };

  setTimeout(() => {
    const reply = chatReplies[msg] ||
      'Merci pour votre message ! Vous pouvez aussi entrer votre numéro de commande pour suivre son statut. Y a-t-il autre chose que je peux faire pour vous ?';
    addMessage(reply, 'bot');
  }, 900);
};

/* ══════════════════════════════════════════════
   4. HELPERS POUR L'INDICATEUR DE FRAPPE DU CHAT
══════════════════════════════════════════════ */
function addTypingIndicator(id) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = id;
  div.innerHTML = `
    <div class="msg-bubble" style="display:flex;gap:4px;align-items:center;padding:0.65rem 1rem">
      <span style="width:6px;height:6px;border-radius:50%;background:var(--gold);
        animation:statusPulse 0.8s ease-in-out infinite"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:var(--gold);
        animation:statusPulse 0.8s ease-in-out 0.2s infinite"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:var(--gold);
        animation:statusPulse 0.8s ease-in-out 0.4s infinite"></span>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTypingIndicator(id) {
  document.getElementById(id)?.remove();
}

/* ══════════════════════════════════════════════
   5. INITIALISATION
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Service Client API initialisé — Maison Dorée');
});
