<?php


// ── HEADERS CORS & JSON ─────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── CONNEXION BASE DE DONNÉES ───────────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'root');         // ← ton user phpMyAdmin (root par défaut WAMP)
define('DB_PASS', '');             // ← ton mot de passe (vide par défaut WAMP)
define('DB_NAME', 'ocean_de_saveur');

function getDB() {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    return $pdo;
}

// ── FONCTIONS UTILITAIRES ───────────────────────
function reponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function erreur($message, $code = 400) {
    reponse(['succes' => false, 'erreur' => $message], $code);
}

function body() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ── ROUTEUR PRINCIPAL ───────────────────────────
$action = $_GET['action'] ?? '';

try {
    $pdo = getDB();

    switch ($action) {

        // ════════════════════════════════════════
        //  GÂTEAUX
        // ════════════════════════════════════════

        /**
         * GET api.php?action=get_gateaux
         * Retourne tous les gâteaux disponibles avec leur catégorie
         */
        case 'get_gateaux':
            $stmt = $pdo->query("
                SELECT
                    g.num_produits,
                    g.libelle_produit,
                    g.`description-gateau` AS description,
                    g.prix_unitaire,
                    g.prix_petite,
                    g.prix_moyenne,
                    g.prix_grande,
                    g.emoji,
                    g.photo_url,
                    g.disponible,
                    g.sans_gluten,
                    g.vegan,
                    g.sans_lactose,
                    c.libelle_gateau AS categorie
                FROM gateau g
                LEFT JOIN categorie_gateau c
                    ON g.nom_categorie = c.nom_categorie_gateau
                WHERE g.disponible = 1
                ORDER BY g.num_produits ASC
            ");
            reponse(['succes' => true, 'gateaux' => $stmt->fetchAll()]);
            break;

        /**
         * GET api.php?action=get_gateau&id=1
         * Retourne un gâteau précis + ses ingrédients
         */
        case 'get_gateau':
            $id = intval($_GET['id'] ?? 0);
            if (!$id) erreur('ID gâteau manquant');

            $stmt = $pdo->prepare("
                SELECT
                    g.*,
                    g.`description-gateau` AS description,
                    c.libelle_gateau AS categorie
                FROM gateau g
                LEFT JOIN categorie_gateau c
                    ON g.nom_categorie = c.nom_categorie_gateau
                WHERE g.num_produits = ?
            ");
            $stmt->execute([$id]);
            $gateau = $stmt->fetch();
            if (!$gateau) erreur('Gâteau introuvable', 404);

            // Récupérer les ingrédients associés
            $stmtIngr = $pdo->prepare("
                SELECT `nom-ingrédient`, `qtt-ingrédient`
                FROM `ingrédient`
                WHERE `num-produits` = ?
            ");
            $stmtIngr->execute([$id]);
            $gateau['ingredients'] = $stmtIngr->fetchAll();

            reponse(['succes' => true, 'gateau' => $gateau]);
            break;

        /**
         * GET api.php?action=get_gateaux_categorie&cat=2
         * Gâteaux filtrés par catégorie
         */
        case 'get_gateaux_categorie':
            $cat = intval($_GET['cat'] ?? 0);
            if (!$cat) erreur('Catégorie manquante');

            $stmt = $pdo->prepare("
                SELECT g.*, g.`description-gateau` AS description
                FROM gateau g
                WHERE g.nom_categorie = ? AND g.disponible = 1
                ORDER BY g.libelle_produit ASC
            ");
            $stmt->execute([$cat]);
            reponse(['succes' => true, 'gateaux' => $stmt->fetchAll()]);
            break;


        // ════════════════════════════════════════
        //  CATÉGORIES
        // ════════════════════════════════════════

        /**
         * GET api.php?action=get_categories
         */
        case 'get_categories':
            $stmt = $pdo->query("SELECT * FROM categorie_gateau ORDER BY libelle_gateau ASC");
            reponse(['succes' => true, 'categories' => $stmt->fetchAll()]);
            break;


        case 'passer_commande':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') erreur('Méthode POST requise');
            $data = body();

            $requis = ['nom_client', 'adresse_livraison', 'ville_livraison', 'montant_total'];
            foreach ($requis as $champ) {
                if (empty($data[$champ])) erreur("Champ requis manquant : $champ");
            }

            $stmt = $pdo->prepare("
                INSERT INTO commande (
                    nom_client,
                    num_tel,
                    email,
                    date_livraison_souhaitee,
                    statut,
                    adresse_livraison,
                    ville_livraison,
                    note_client,
                    montant_total,
                    total_commande,
                    mode_paiement,
                    statut_paiement,
                    livraison_offerte
                ) VALUES (?, ?, ?, ?, 'En attente', ?, ?, ?, ?, ?, ?, 'En attente', ?)
            ");
            $stmt->execute([
                $data['nom_client'],
                $data['num_tel'] ?? null,
                $data['email'] ?? null,
                $data['date_livraison_souhaitee'] ?? null,
                $data['adresse_livraison'],
                $data['ville_livraison'],
                $data['note_client'] ?? null,
                $data['montant_total'],
                $data['montant_total'],
                $data['mode_paiement'] ?? 'Non précisé',
                $data['livraison_offerte'] ?? 0,
            ]);

            $idCommande = $pdo->lastInsertId();

            // Si un num_tel est fourni, créer/màj le client
            if (!empty($data['num_tel'])) {
                $stmtCli = $pdo->prepare("
                    INSERT INTO client (num_tel, addr_liv, email, ville)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        addr_liv = VALUES(addr_liv),
                        email    = VALUES(email),
                        ville    = VALUES(ville)
                ");
                $stmtCli->execute([
                    $data['num_tel'],
                    $data['adresse_livraison'],
                    $data['email'] ?? null,
                    $data['ville_livraison'],
                ]);
            }

            reponse([
                'succes'      => true,
                'message'     => 'Commande créée avec succès',
                'id_commande' => $idCommande,
            ], 201);
            break;

        /**
         * GET api.php?action=get_commande&id=5
         */
        case 'get_commande':
            $id = intval($_GET['id'] ?? 0);
            if (!$id) erreur('ID commande manquant');

            $stmt = $pdo->prepare("SELECT * FROM commande WHERE id_commande = ? OR total_commande = ?");
            $stmt->execute([$id, $id]);
            $commande = $stmt->fetch();
            if (!$commande) erreur('Commande introuvable', 404);

            // Paiement associé
            $stmtPay = $pdo->prepare("SELECT * FROM paiement WHERE `num-commande` = ?");
            $stmtPay->execute([$commande['id_commande'] ?? $id]);
            $commande['paiement'] = $stmtPay->fetch() ?: null;

            reponse(['succes' => true, 'commande' => $commande]);
            break;

        /**
         * POST api.php?action=maj_statut
         * Body : { "id_commande": 5, "statut": "Confirmée" }
         * Valeurs statut : En attente | Confirmée | En préparation | Livrée | Annulée
         */
        case 'maj_statut':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') erreur('Méthode POST requise');
            $data = body();
            if (empty($data['id_commande']) || empty($data['statut'])) erreur('id_commande et statut requis');

            $statutsValides = ['En attente', 'Confirmée', 'En préparation', 'Livrée', 'Annulée'];
            if (!in_array($data['statut'], $statutsValides)) erreur('Statut invalide');

            $stmt = $pdo->prepare("UPDATE commande SET statut = ? WHERE id_commande = ? OR total_commande = ?");
            $stmt->execute([$data['statut'], $data['id_commande'], $data['id_commande']]);

            reponse(['succes' => true, 'message' => 'Statut mis à jour']);
            break;


        // ════════════════════════════════════════
        //  CLIENTS
        // ════════════════════════════════════════

        /**
         * POST api.php?action=creer_client
         * Body : { "num_tel": "0700000000", "addr_liv": "...", "email": "...", "ville": "Abidjan" }
         */
        case 'creer_client':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') erreur('Méthode POST requise');
            $data = body();
            if (empty($data['num_tel'])) erreur('num_tel requis');

            $stmt = $pdo->prepare("
                INSERT INTO client (num_tel, addr_liv, email, ville)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    addr_liv = VALUES(addr_liv),
                    email    = VALUES(email),
                    ville    = VALUES(ville)
            ");
            $stmt->execute([
                $data['num_tel'],
                $data['addr_liv'] ?? null,
                $data['email']    ?? null,
                $data['ville']    ?? 'Abidjan',
            ]);

            reponse(['succes' => true, 'message' => 'Client enregistré']);
            break;

        /**
         * GET api.php?action=get_client&tel=0700000000
         */
        case 'get_client':
            $tel = $_GET['tel'] ?? '';
            if (!$tel) erreur('Numéro de téléphone manquant');

            $stmt = $pdo->prepare("SELECT * FROM client WHERE num_tel = ?");
            $stmt->execute([$tel]);
            $client = $stmt->fetch();
            if (!$client) erreur('Client introuvable', 404);

            reponse(['succes' => true, 'client' => $client]);
            break;


        // ════════════════════════════════════════
        //  PAIEMENTS
        // ════════════════════════════════════════

        /**
         * POST api.php?action=enregistrer_paiement
         * Body : {
         *   "num_paiement": "PAY-2025-001",
         *   "date_paiement": "2025-12-25",
         *   "montant_paiement": "5200",
         *   "mode_paiement": "Mobile Money",
         *   "num_commande": 5
         * }
         */
        case 'enregistrer_paiement':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') erreur('Méthode POST requise');
            $data = body();

            $requis = ['num_paiement', 'montant_paiement', 'mode_paiement', 'num_commande'];
            foreach ($requis as $champ) {
                if (empty($data[$champ])) erreur("Champ requis manquant : $champ");
            }

            $stmt = $pdo->prepare("
                INSERT INTO paiement (`num-paiement`, `date-paiement`, `montant-paiement`, `mode-paiement`, `num-commande`)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['num_paiement'],
                $data['date_paiement'] ?? date('Y-m-d'),
                $data['montant_paiement'],
                $data['mode_paiement'],
                $data['num_commande'],
            ]);

            // Mettre à jour le statut_paiement de la commande par id_commande OU total_commande
            $stmtUpd = $pdo->prepare("UPDATE commande SET statut_paiement = 'Payé' WHERE id_commande = ? OR total_commande = ?");
            $stmtUpd->execute([$data['num_commande'], $data['num_commande']]);

            reponse(['succes' => true, 'message' => 'Paiement enregistré'], 201);
            break;


        // ════════════════════════════════════════
        //  CLASSEMENT LIVREURS
        // ════════════════════════════════════════

        /**
         * GET api.php?action=get_classement
         * Retourne les livreurs avec le nombre de commandes livrées
         */
        case 'get_classement':
            $stmt = $pdo->query("
                SELECT
                    l.`num-livreur`     AS nom_livreur,
                    l.`code-livreur`    AS code,
                    COUNT(l.`num-commande`) AS nb_livraisons
                FROM livreur l
                GROUP BY l.`num-livreur`, l.`code-livreur`
                ORDER BY nb_livraisons DESC
                LIMIT 10
            ");
            reponse(['succes' => true, 'classement' => $stmt->fetchAll()]);
            break;


        // ════════════════════════════════════════
        //  ACTION INCONNUE
        // ════════════════════════════════════════
        default:
            erreur("Action inconnue : '$action'. Consultez la documentation en haut du fichier.", 404);
    }

} catch (PDOException $e) {
    erreur('Erreur base de données : ' . $e->getMessage(), 500);
} catch (Exception $e) {
    erreur('Erreur serveur : ' . $e->getMessage(), 500);
}
