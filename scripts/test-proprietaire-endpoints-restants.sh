#!/bin/bash

BASE_URL="http://localhost:3000"
EMAIL="proprietaire.test@gmail.com"
PASSWORD="Proprietaire123!"

echo "🔐 Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('session', {}).get('accessToken', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Erreur de connexion"
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
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -10 || echo "$BODY" | head -3
  else
    echo "   ❌ Erreur ($HTTP_CODE)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "⚠️  Arrêt des tests à cause de l'erreur ci-dessus"
    exit 1
  fi
  echo ""
}

echo "📦 Création de données de test fraîches..."
npx tsx scripts/create-test-data-proprietaire.ts > /dev/null 2>&1
sleep 2

echo ""
echo "=== GESTION DES RÉSERVATIONS (RESTANTS) ==="
RESERVATION_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/reservations/en-attente" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); reservations = data.get('data', []); print(reservations[0]['id'] if reservations else '')" 2>/dev/null)

if [ -n "$RESERVATION_ID" ]; then
  test_endpoint "PUT" "/api/proprietaire/reservations/$RESERVATION_ID/accepter" "" "PUT /proprietaire/reservations/{id}/accepter - Accepter une réservation"
  
  # Créer une nouvelle réservation pour tester refuser
  npx tsx scripts/create-test-data-proprietaire.ts > /dev/null 2>&1
  sleep 2
  
  NEW_RESERVATION_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/reservations/en-attente" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); reservations = data.get('data', []); print(reservations[0]['id'] if reservations else '')" 2>/dev/null)
  
  if [ -n "$NEW_RESERVATION_ID" ] && [ "$NEW_RESERVATION_ID" != "$RESERVATION_ID" ]; then
    test_endpoint "PUT" "/api/proprietaire/reservations/$NEW_RESERVATION_ID/refuser" '{"motif":"Test de refus"}' "PUT /proprietaire/reservations/{id}/refuser - Refuser une réservation"
  fi
  
  # Tester signer avec la réservation acceptée
  ACCEPTED_RESERVATION_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/reservations" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); reservations = data.get('data', []); accepted = [r for r in reservations if r.get('statut') == 'ACCEPTEE']; print(accepted[0]['id'] if accepted else '')" 2>/dev/null)
  
  if [ -n "$ACCEPTED_RESERVATION_ID" ]; then
    test_endpoint "POST" "/api/proprietaire/reservations/$ACCEPTED_RESERVATION_ID/signer" "" "POST /proprietaire/reservations/{id}/signer - Signer le contrat"
  fi
else
  echo "⚠️  Aucune réservation en attente trouvée"
fi

echo ""
echo "=== GESTION DES PAIEMENTS (RESTANTS) ==="
PAIEMENT_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/paiements" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); paiements = data.get('data', []); en_attente = [p for p in paiements if p.get('statut') == 'EN_ATTENTE']; print(en_attente[0]['id'] if en_attente else '')" 2>/dev/null)

if [ -n "$PAIEMENT_ID" ]; then
  test_endpoint "PUT" "/api/proprietaire/paiements/$PAIEMENT_ID/valider" "" "PUT /proprietaire/paiements/{id}/valider - Valider un paiement"
else
  echo "⚠️  Aucun paiement en attente trouvé"
fi

# Pour restituer caution, créer une réservation terminée
echo "   ⚠️  POST /proprietaire/paiements/caution/restituer nécessite une réservation TERMINEE (test manuel requis)"

echo ""
echo "=== MESSAGERIE (RESTANTS) ==="
CONVERSATION_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/messages" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); conversations = data.get('data', []); print(conversations[0]['reservationId'] if conversations else '')" 2>/dev/null)

if [ -n "$CONVERSATION_ID" ]; then
  # Récupérer un message envoyé par le locataire (non lu)
  PROPRIETAIRE_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/profil" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
  
  MESSAGE_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/messages/$CONVERSATION_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); messages = data.get('data', {}).get('messages', []); unread = [m for m in messages if m.get('destinataireId') == sys.argv[1] and not m.get('estLu')]; print(unread[0]['id'] if unread else '')" "$PROPRIETAIRE_ID" 2>/dev/null)
  
  if [ -n "$MESSAGE_ID" ]; then
    test_endpoint "PUT" "/api/proprietaire/messages/lu/$MESSAGE_ID" "" "PUT /proprietaire/messages/lu/{messageId} - Marquer un message comme lu"
  else
    echo "⚠️  Aucun message non lu du locataire trouvé"
  fi
else
  echo "⚠️  Aucune conversation trouvée"
fi

echo ""
echo "✅ Tous les tests sont passés avec succès!"
