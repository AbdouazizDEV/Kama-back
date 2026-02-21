#!/bin/bash

BASE_URL="http://localhost:3000"
EMAIL="proprietaire.test@gmail.com"
PASSWORD="Proprietaire123!"

echo "🔐 Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('session', {}).get('accessToken', data.get('data', {}).get('accessToken', '')))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Erreur de connexion"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Connecté avec succès"
echo ""

# Fonction pour tester un endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo "🧪 Test: $description"
  echo "   $method $endpoint"
  
  if [ -z "$data" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "   ✅ Succès ($HTTP_CODE)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -20 || echo "$BODY" | head -5
  else
    echo "   ❌ Erreur ($HTTP_CODE)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "⚠️  Arrêt des tests à cause de l'erreur ci-dessus"
    exit 1
  fi
  echo ""
}

# Tests des endpoints
echo "=== GESTION DU PROFIL ==="
test_endpoint "GET" "/api/proprietaire/profil" "" "GET /proprietaire/profil - Consulter mon profil complet"
test_endpoint "PUT" "/api/proprietaire/profil" '{"nom":"Proprietaire","prenom":"Test Modifié","telephone":"+241061234567"}' "PUT /proprietaire/profil - Modifier mes informations personnelles"
test_endpoint "GET" "/api/proprietaire/profil/verification/statut" "" "GET /proprietaire/profil/verification/statut - Consulter le statut de vérification"
test_endpoint "GET" "/api/proprietaire/profil/statistiques" "" "GET /proprietaire/profil/statistiques - Consulter mes statistiques globales"

echo ""
echo "=== GESTION DES ANNONCES ==="
test_endpoint "GET" "/api/proprietaire/annonces" "" "GET /proprietaire/annonces - Lister toutes mes annonces"
test_endpoint "POST" "/api/proprietaire/annonces" '{"titre":"Appartement T3 moderne","description":"Bel appartement de 3 pièces avec balcon, situé en centre-ville. Proche de tous les commerces et transports. Climatisation, eau courante, électricité.","typeBien":"APPARTEMENT","categorieBien":"T3","prix":150000,"caution":300000,"ville":"Libreville","quartier":"Mont-Bouët","adresseComplete":"123 Avenue de la République","estMeuble":true,"equipements":["Climatisation","Électricité","Eau courante"],"dateDisponibilite":"2026-03-01T00:00:00Z"}' "POST /proprietaire/annonces - Créer une nouvelle annonce"

# Récupérer l'ID de la première annonce créée
ANNONCE_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/annonces" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); annonces = data.get('data', []); print(annonces[0]['id'] if annonces else '')" 2>/dev/null)

if [ -n "$ANNONCE_ID" ]; then
  test_endpoint "GET" "/api/proprietaire/annonces/$ANNONCE_ID" "" "GET /proprietaire/annonces/{id} - Consulter le détail d'une annonce"
  test_endpoint "PUT" "/api/proprietaire/annonces/$ANNONCE_ID" '{"titre":"Appartement T3 moderne - Modifié","prix":160000}' "PUT /proprietaire/annonces/{id} - Modifier une annonce"
  test_endpoint "GET" "/api/proprietaire/annonces/$ANNONCE_ID/statistiques" "" "GET /proprietaire/annonces/{id}/statistiques - Consulter les stats d'une annonce"
fi

echo ""
echo "=== GESTION DES RÉSERVATIONS ==="
test_endpoint "GET" "/api/proprietaire/reservations" "" "GET /proprietaire/reservations - Lister toutes les réservations"
test_endpoint "GET" "/api/proprietaire/reservations/en-attente" "" "GET /proprietaire/reservations/en-attente - Lister les demandes en attente"

echo ""
echo "=== GESTION DES PAIEMENTS ==="
test_endpoint "GET" "/api/proprietaire/paiements" "" "GET /proprietaire/paiements - Consulter l'historique des paiements"
test_endpoint "GET" "/api/proprietaire/paiements/statistiques" "" "GET /proprietaire/paiements/statistiques - Statistiques financières"

echo ""
echo "=== MESSAGERIE ==="
test_endpoint "GET" "/api/proprietaire/messages" "" "GET /proprietaire/messages - Lister toutes mes conversations"
test_endpoint "GET" "/api/proprietaire/messages/non-lus" "" "GET /proprietaire/messages/non-lus - Compter les messages non lus"

echo ""
echo "=== TABLEAUX DE BORD ==="
test_endpoint "GET" "/api/proprietaire/dashboard" "" "GET /proprietaire/dashboard - Obtenir les données du dashboard"
test_endpoint "GET" "/api/proprietaire/dashboard/revenus?periode=mois" "" "GET /proprietaire/dashboard/revenus - Statistiques de revenus"
test_endpoint "GET" "/api/proprietaire/dashboard/occupation" "" "GET /proprietaire/dashboard/occupation - Taux d'occupation"
test_endpoint "GET" "/api/proprietaire/dashboard/demandes" "" "GET /proprietaire/dashboard/demandes - Résumé des demandes"

echo ""
echo "✅ Tous les tests sont passés avec succès!"
