#!/bin/bash

# Script de test pour tous les endpoints ADMIN
# Usage: ./scripts/test-admin-endpoints.sh

BASE_URL="http://localhost:3000"
EMAIL="admin.test@kama.ga"
PASSWORD="AdminTest123!"

echo "🧪 Test des endpoints ADMIN"
echo "================================"
echo ""

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "📌 $description"
    echo "   $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo "   ✅ Succès ($http_code)"
    else
        echo "   ❌ Erreur ($http_code)"
        echo "   Réponse: $body" | head -c 200
    fi
    echo ""
}

# 1. Connexion
echo "🔐 Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
    "$BASE_URL/api/auth/login")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Échec de la connexion"
    echo "Réponse: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Connexion réussie"
echo "Token: ${TOKEN:0:20}..."
echo ""
echo "================================"
echo ""

# Variables pour stocker les IDs récupérés
USER_ID=""
ANNONCE_ID=""
RESERVATION_ID=""
PAIEMENT_ID=""
MESSAGE_ID=""

# ============================================
# GESTION DES UTILISATEURS (8 endpoints)
# ============================================
echo "👥 GESTION DES UTILISATEURS"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/users?page=1&limit=10" "" "Lister tous les utilisateurs"
# Récupérer un USER_ID pour les tests suivants
USERS_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/admin/users?page=1&limit=1")
USER_ID=$(echo $USERS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$USER_ID" ]; then
    test_endpoint "GET" "/api/admin/users/$USER_ID" "" "Consulter le profil détaillé d'un utilisateur"
    test_endpoint "PUT" "/api/admin/users/$USER_ID/activate" "" "Activer un compte utilisateur"
    test_endpoint "GET" "/api/admin/users/statistics" "" "Statistiques des utilisateurs"
    test_endpoint "GET" "/api/admin/users/pending-validation?page=1&limit=10" "" "Lister les utilisateurs en attente de validation"
else
    echo "⚠️  Aucun utilisateur trouvé pour les tests"
fi

echo ""

# ============================================
# GESTION DES ANNONCES (8 endpoints)
# ============================================
echo "🏠 GESTION DES ANNONCES"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/annonces?page=1&limit=10" "" "Lister toutes les annonces"
# Récupérer un ANNONCE_ID
ANNONCES_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/admin/annonces?page=1&limit=1")
ANNONCE_ID=$(echo $ANNONCES_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$ANNONCE_ID" ]; then
    test_endpoint "GET" "/api/admin/annonces/$ANNONCE_ID" "" "Consulter le détail d'une annonce"
    test_endpoint "PUT" "/api/admin/annonces/$ANNONCE_ID/approve" "" "Approuver une annonce"
    test_endpoint "PUT" "/api/admin/annonces/$ANNONCE_ID/feature" '{"featured":true}' "Mettre en avant une annonce"
fi

test_endpoint "GET" "/api/admin/annonces/pending-moderation?page=1&limit=10" "" "Lister les annonces en attente de modération"
test_endpoint "GET" "/api/admin/annonces/statistics" "" "Statistiques globales des annonces"

echo ""

# ============================================
# GESTION DES RÉSERVATIONS (4 endpoints)
# ============================================
echo "📅 GESTION DES RÉSERVATIONS"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/reservations?page=1&limit=10" "" "Lister toutes les réservations"
# Récupérer un RESERVATION_ID
RESERVATIONS_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/admin/reservations?page=1&limit=1")
RESERVATION_ID=$(echo $RESERVATIONS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$RESERVATION_ID" ]; then
    test_endpoint "GET" "/api/admin/reservations/$RESERVATION_ID" "" "Consulter le détail d'une réservation"
fi

test_endpoint "GET" "/api/admin/reservations/statistics" "" "Statistiques des réservations"

echo ""

# ============================================
# GESTION DES PAIEMENTS (5 endpoints)
# ============================================
echo "💳 GESTION DES PAIEMENTS"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/paiements?page=1&limit=10" "" "Lister toutes les transactions"
# Récupérer un PAIEMENT_ID
PAIEMENTS_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/admin/paiements?page=1&limit=1")
PAIEMENT_ID=$(echo $PAIEMENTS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PAIEMENT_ID" ]; then
    test_endpoint "GET" "/api/admin/paiements/$PAIEMENT_ID" "" "Consulter le détail d'une transaction"
fi

test_endpoint "GET" "/api/admin/paiements/statistics" "" "Statistiques financières globales"
test_endpoint "GET" "/api/admin/paiements/export?format=CSV" "" "Exporter les données financières (CSV)"

echo ""

# ============================================
# GESTION DES LITIGES (4 endpoints)
# ============================================
echo "⚖️  GESTION DES LITIGES"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/litiges?page=1&limit=10" "" "Lister tous les litiges"
echo "⚠️  Note: Les litiges nécessitent le modèle Prisma Litige"

echo ""

# ============================================
# MESSAGERIE ET SUPPORT (3 endpoints)
# ============================================
echo "💬 MESSAGERIE ET SUPPORT"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/messages?page=1&limit=10" "" "Consulter toutes les conversations"
# Récupérer un MESSAGE_ID
MESSAGES_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/admin/messages?page=1&limit=1")
MESSAGE_ID=$(echo $MESSAGES_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

test_endpoint "GET" "/api/admin/messages/flagged?page=1&limit=10" "" "Lister les messages signalés"

echo ""

# ============================================
# RAPPORTS ET STATISTIQUES (6 endpoints)
# ============================================
echo "📊 RAPPORTS ET STATISTIQUES"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/reports/users" "" "Rapport détaillé des utilisateurs"
test_endpoint "GET" "/api/admin/reports/annonces" "" "Rapport détaillé des annonces"
test_endpoint "GET" "/api/admin/reports/revenus" "" "Rapport financier détaillé"
test_endpoint "GET" "/api/admin/reports/activite" "" "Rapport d'activité globale"
test_endpoint "POST" "/api/admin/reports/custom" '{"type":"users","format":"JSON"}' "Générer un rapport personnalisé"
test_endpoint "GET" "/api/admin/dashboard" "" "Dashboard administrateur (KPIs principaux)"

echo ""

# ============================================
# CONFIGURATION SYSTÈME (4 endpoints)
# ============================================
echo "⚙️  CONFIGURATION SYSTÈME"
echo "================================"
echo ""

test_endpoint "GET" "/api/admin/config" "" "Obtenir la configuration actuelle"
test_endpoint "PUT" "/api/admin/config" '{"key":"maintenance","value":false}' "Modifier la configuration système"
test_endpoint "GET" "/api/admin/logs?page=1&limit=10" "" "Consulter les logs système"
test_endpoint "POST" "/api/admin/backup" "" "Déclencher une sauvegarde manuelle"

echo ""
echo "================================"
echo "✅ Tests terminés !"
echo "================================"
