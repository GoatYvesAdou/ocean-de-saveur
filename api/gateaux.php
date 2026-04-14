<?php
/* ═══════════════════════════════════════════════════════════
   api/gateaux.php — Endpoint API pour le catalogue
   Maison Dorée

   Accepte uniquement les requêtes GET.
   Retourne tous les gâteaux disponibles avec leurs prix
   et leur catégorie, en JSON.
   ═══════════════════════════════════════════════════════════ */

require_once 'config.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['succes' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$pdo = getConnexion();

// Lire tous les gâteaux disponibles avec leur catégorie
// La colonne prix_petite est calculée automatiquement par le trigger en BDD
$stmt = $pdo->query("
    SELECT
        g.id_gateau,
        g.nom,
        g.description,
        g.emoji,
        g.photo_url,
        g.prix_petite,
        g.prix_moyenne,
        g.prix_grande,
        g.sans_gluten,
        g.vegan,
        g.sans_lactose,
        cg.libelle AS categorie
    FROM gateau g
    JOIN categorie_gateau cg ON cg.id_categorie = g.id_categorie
    WHERE g.disponible = 1
    ORDER BY cg.libelle, g.nom
");

$gateaux = $stmt->fetchAll();

http_response_code(200);
echo json_encode([
    'succes'  => true,
    'total'   => count($gateaux),
    'gateaux' => $gateaux,
]);
