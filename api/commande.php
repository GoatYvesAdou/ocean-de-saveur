<?php
/* ═══════════════════════════════════════════════════════════
   api/commande.php — Endpoint API pour les commandes
   Maison Dorée

   Accepte uniquement les requêtes POST avec un body JSON.
   Insère la commande + les lignes de commande en base.
   Retourne un JSON { succes, message, id_commande, reference }
   ═══════════════════════════════════════════════════════════ */

require_once 'config.php';
require_once __DIR__ . '/config.php';

// ── 1. Vérifier la méthode HTTP ──────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['succes' => false, 'message' => 'Méthode non autorisée. Utilisez POST.']);
    exit;
}

// ── 2. Lire et décoder le body JSON envoyé par le JavaScript ─
$bodyBrut = file_get_contents('php://input'); // lit le corps de la requête HTTP
$data     = json_decode($bodyBrut, true);     // décode le JSON en tableau PHP associatif

if (!$data) {
    http_response_code(400); // Bad Request
    echo json_encode(['succes' => false, 'message' => 'Body JSON invalide ou vide.']);
    exit;
}

// ── 3. Valider les champs obligatoires ───────────────────────
$champsObligatoires = ['prenom', 'nom', 'telephone', 'adresse', 'articles'];

foreach ($champsObligatoires as $champ) {
    if (empty($data[$champ])) {
        http_response_code(422); // Unprocessable Entity
        echo json_encode([
            'succes'  => false,
            'message' => "Champ manquant ou vide : « $champ »"
        ]);
        exit;
    }
}

if (!is_array($data['articles']) || count($data['articles']) === 0) {
    http_response_code(422);
    echo json_encode(['succes' => false, 'message' => 'Le panier est vide.']);
    exit;
}

// ── 4. Nettoyer les données (sécurité de base) ───────────────
// htmlspecialchars() empêche l'injection HTML/XSS
// trim() supprime les espaces inutiles
$prenom           = htmlspecialchars(trim($data['prenom']),   ENT_QUOTES, 'UTF-8');
$nom              = htmlspecialchars(trim($data['nom']),      ENT_QUOTES, 'UTF-8');
$telephone        = htmlspecialchars(trim($data['telephone']),ENT_QUOTES, 'UTF-8');
$adresse          = htmlspecialchars(trim($data['adresse']),  ENT_QUOTES, 'UTF-8');
$note             = htmlspecialchars(trim($data['note']   ?? ''), ENT_QUOTES, 'UTF-8');
$modePaiement     = in_array($data['mode_paiement'] ?? '', ['mobile_money','carte_bancaire','especes'])
                      ? $data['mode_paiement']
                      : 'especes';
$dateSouhaitee    = !empty($data['date_livraison']) ? $data['date_livraison'] : date('Y-m-d', strtotime('+2 days'));

// ── 5. Calculer le montant total côté serveur ────────────────
// On ne fait PAS confiance au total envoyé par le JS :
// on recalcule depuis les prix en BDD pour éviter la fraude.
$pdo          = getConnexion();
$montantTotal = 0;
$articlesValides = [];

foreach ($data['articles'] as $article) {
    // Vérifier que l'article a les champs nécessaires
    if (empty($article['nom']) || empty($article['taille']) || empty($article['quantite'])) {
        continue;
    }

    $taille   = in_array($article['taille'], ['petite','moyenne','grande']) ? $article['taille'] : 'petite';
    $quantite = max(1, intval($article['quantite']));

    // Lire le prix réel depuis la BDD selon la taille
    $colonnePrix = match($taille) {
        'grande'  => 'prix_grande',
        'moyenne' => 'prix_moyenne',
        default   => 'prix_petite',   // petite = grande × 2/3, calculé dans la BDD
    };

    $stmt = $pdo->prepare("SELECT id_gateau, nom, $colonnePrix AS prix FROM gateau WHERE nom = ? AND disponible = 1");
    $stmt->execute([trim($article['nom'])]);
    $gateau = $stmt->fetch();

    if (!$gateau) {
        // Gâteau introuvable ou indisponible — on ignore cet article
        continue;
    }

    $prixUnitaire  = floatval($gateau['prix']);
    $montantTotal += $prixUnitaire * $quantite;

    $articlesValides[] = [
        'id_gateau'     => $gateau['id_gateau'],
        'taille'        => $taille,
        'quantite'      => $quantite,
        'prix_unitaire' => $prixUnitaire,
    ];
}

if (count($articlesValides) === 0) {
    http_response_code(422);
    echo json_encode(['succes' => false, 'message' => 'Aucun article valide dans le panier.']);
    exit;
}

// Livraison offerte si total >= 50 000 FCFA
$livraisonOfferte = $montantTotal >= 50000 ? 1 : 0;

// ── 6. Insérer dans la BDD avec une transaction ──────────────
// Une transaction garantit que TOUT est inséré ou RIEN
// (si l'insertion des lignes échoue, la commande est annulée aussi)
try {
    $pdo->beginTransaction(); // démarre la transaction

    // 6a. Trouver ou créer le client
    $stmtClient = $pdo->prepare("SELECT id_client FROM client WHERE telephone = ?");
    $stmtClient->execute([$telephone]);
    $client = $stmtClient->fetch();

    if ($client) {
        $idClient = $client['id_client'];
    } else {
        // Nouveau client : on l'insère
        $stmtInsertClient = $pdo->prepare("
            INSERT INTO client (nom, prenom, email, telephone, adresse, ville)
            VALUES (?, ?, ?, ?, ?, 'Abidjan')
        ");
        $stmtInsertClient->execute([
            $nom, $prenom,
            $data['email'] ?? '',
            $telephone,
            $adresse
        ]);
        $idClient = $pdo->lastInsertId(); // récupère l'ID auto-incrémenté
    }

    // 6b. Insérer la commande principale
    $stmtCommande = $pdo->prepare("
        INSERT INTO commande (
            id_client,
            date_livraison_souhaitee,
            statut,
            adresse_livraison,
            ville_livraison,
            note_client,
            montant_total,
            mode_paiement,
            statut_paiement,
            livraison_offerte
        ) VALUES (?, ?, 'en_attente', ?, 'Abidjan', ?, ?, ?, 'non_paye', ?)
    ");
    $stmtCommande->execute([
        $idClient,
        $dateSouhaitee,
        $adresse,
        $note,
        $montantTotal,
        $modePaiement,
        $livraisonOfferte
    ]);
    $idCommande = $pdo->lastInsertId();

    // 6c. Insérer chaque ligne de commande
    $stmtLigne = $pdo->prepare("
        INSERT INTO ligne_commande (id_commande, id_gateau, taille, quantite, prix_unitaire)
        VALUES (?, ?, ?, ?, ?)
    ");
    foreach ($articlesValides as $article) {
        $stmtLigne->execute([
            $idCommande,
            $article['id_gateau'],
            $article['taille'],
            $article['quantite'],
            $article['prix_unitaire']
        ]);
    }

    $pdo->commit(); // valide toute la transaction

    // ── 7. Générer la référence et répondre ──────────────────
    $reference = 'MD-' . strtoupper(base_convert($idCommande . time(), 10, 36));

    http_response_code(201); // Created
    echo json_encode([
        'succes'      => true,
        'message'     => 'Commande enregistrée avec succès.',
        'id_commande' => $idCommande,
        'reference'   => $reference,
        'montant'     => $montantTotal,
        'nb_articles' => count($articlesValides),
    ]);

} catch (PDOException $e) {
    $pdo->rollBack(); // annule tout si une erreur survient
    http_response_code(500);
    echo json_encode([
        'succes'  => false,
        'message' => 'Erreur lors de l\'enregistrement de la commande.',
        // 'detail' => $e->getMessage() // ← décommenter en dev uniquement
    ]);
}
