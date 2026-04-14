<?php
/* ═══════════════════════════════════════════════════════════
   config.php — Connexion à la base de données
   Maison Dorée
   ═══════════════════════════════════════════════════════════
   Ce fichier est inclus par tous les autres fichiers PHP.
   Ne jamais l'exposer publiquement (mettre hors du dossier www
   en production).
   ═══════════════════════════════════════════════════════════ */

// ── Paramètres de connexion ──────────────────────────────────
define('DB_HOST', 'localhost');   // Hôte MySQL — toujours localhost sur WAMP
define('DB_NAME', 'm-dorée'); // Nom exact de ta base dans MySQL Workbench
define('DB_USER', 'root');        // Utilisateur WAMP par défaut
define('DB_PASS', '');            // Mot de passe WAMP par défaut = vide
define('DB_CHARSET', 'utf8mb4');  // Encodage — doit correspondre à ta BDD

// ── Création de la connexion PDO ─────────────────────────────
// PDO = PHP Data Objects : interface moderne et sécurisée pour MySQL
function getConnexion(): PDO {
    $dsn = "mysql:host=" . DB_HOST
         . ";dbname=" . DB_NAME
         . ";charset=" . DB_CHARSET;

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // lance une exception si erreur SQL
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // retourne des tableaux associatifs
        PDO::ATTR_EMULATE_PREPARES   => false,                  // vraies requêtes préparées (sécurité)
    ];

    try {
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // En production, ne jamais afficher le message d'erreur brut
        http_response_code(500);
        echo json_encode([
            'succes'  => false,
            'message' => 'Erreur de connexion à la base de données.',
            // 'detail' => $e->getMessage() // ← décommenter UNIQUEMENT en développement
        ]);
        exit;
    }
}

// ── En-têtes HTTP communs à toutes les réponses API ──────────
// Permet au JavaScript (même sur un autre port) d'appeler l'API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');             // en prod : mettre l'URL exacte du site
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Répondre immédiatement aux requêtes OPTIONS (pre-flight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
