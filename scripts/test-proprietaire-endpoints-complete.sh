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

# Fonction pour tester un endpoint avec multipart/form-data
test_endpoint_file() {
  local method=$1
  local endpoint=$2
  local file_field=$3
  local file_path=$4
  local description=$5
  
  echo "🧪 Test: $description"
  echo "   $method $endpoint"
  
  if [ ! -f "$file_path" ]; then
    echo "   ⚠️  Fichier de test créé: $file_path"
    # Créer un fichier de test simple (1x1 pixel PNG)
    echo -ne '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82' > "$file_path"
  fi
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
    -H "Authorization: Bearer $TOKEN" \
    -F "$file_field=@$file_path")
  
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

# Récupérer l'ID de la première annonce
echo "📋 Récupération des données nécessaires..."
ANNONCE_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/annonces" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); annonces = data.get('data', []); print(annonces[0]['id'] if annonces else '')" 2>/dev/null)

if [ -z "$ANNONCE_ID" ]; then
  echo "⚠️  Aucune annonce trouvée, création d'une annonce..."
  CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/proprietaire/annonces" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"titre":"Test Annonce","description":"Description de test pour les endpoints. Cette annonce servira à tester les fonctionnalités de gestion des annonces.","typeBien":"APPARTEMENT","categorieBien":"T2","prix":100000,"caution":200000,"ville":"Libreville","quartier":"Mont-Bouët","adresseComplete":"123 Test","estMeuble":false,"equipements":["Climatisation"],"dateDisponibilite":"2026-03-01T00:00:00Z"}')
  ANNONCE_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
fi

echo "✅ Annonce ID: $ANNONCE_ID"
echo ""

# Tests des endpoints restants
echo "=== GESTION DU PROFIL (RESTANTS) ==="
test_endpoint_file "POST" "/api/proprietaire/profil/photo" "photo" "/tmp/test-photo.png" "POST /proprietaire/profil/photo - Uploader photo de profil"

echo ""
echo "=== GESTION DES ANNONCES (RESTANTS) ==="
if [ -n "$ANNONCE_ID" ]; then
  # Uploader des photos d'abord
  echo "📸 Upload de photos pour l'annonce..."
  test_endpoint_file "POST" "/api/proprietaire/annonces/$ANNONCE_ID/photos" "photos" "/tmp/test-photo.png" "POST /proprietaire/annonces/{id}/photos - Uploader des photos"
  
  # Récupérer l'URL de la première photo
  PHOTO_URL=$(curl -s -X GET "$BASE_URL/api/proprietaire/annonces/$ANNONCE_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); annonce = data.get('data', {}); photos = annonce.get('photos', []); print(photos[0] if photos else '')" 2>/dev/null)
  
  if [ -n "$PHOTO_URL" ]; then
    # Encoder l'URL pour l'utiliser dans le path
    PHOTO_ID=$(echo "$PHOTO_URL" | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read().strip(), safe=''))")
    test_endpoint "PUT" "/api/proprietaire/annonces/$ANNONCE_ID/photos/$PHOTO_ID/principale" "" "PUT /proprietaire/annonces/{id}/photos/{photoId}/principale - Définir photo principale"
    
    # Tester la suppression d'une photo (mais garder au moins une photo)
    PHOTOS_COUNT=$(curl -s -X GET "$BASE_URL/api/proprietaire/annonces/$ANNONCE_ID" \
      -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); annonce = data.get('data', {}); photos = annonce.get('photos', []); print(len(photos))" 2>/dev/null)
    
    if [ "$PHOTOS_COUNT" -gt 1 ]; then
      # Supprimer la dernière photo (pas la principale)
      LAST_PHOTO_URL=$(curl -s -X GET "$BASE_URL/api/proprietaire/annonces/$ANNONCE_ID" \
        -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); annonce = data.get('data', {}); photos = annonce.get('photos', []); print(photos[-1] if len(photos) > 1 else '')" 2>/dev/null)
      if [ -n "$LAST_PHOTO_URL" ]; then
        LAST_PHOTO_ID=$(echo "$LAST_PHOTO_URL" | python3 -c "import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read().strip(), safe=''))")
        test_endpoint "DELETE" "/api/proprietaire/annonces/$ANNONCE_ID/photos/$LAST_PHOTO_ID" "" "DELETE /proprietaire/annonces/{id}/photos/{photoId} - Supprimer une photo"
      fi
    fi
  fi
  
  # Note: L'activation nécessite que l'annonce soit approuvée par un admin
  # On teste juste que l'endpoint existe et retourne une erreur appropriée
  echo "🧪 Test: PUT /proprietaire/annonces/{id}/activer - Activer une annonce (nécessite approbation admin)"
  echo "   PUT /api/proprietaire/annonces/$ANNONCE_ID/activer"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/proprietaire/annonces/$ANNONCE_ID/activer" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" -eq 409 ]; then
    echo "   ✅ Erreur attendue ($HTTP_CODE) - Annonce non approuvée"
  else
    echo "   ❌ Code inattendu ($HTTP_CODE)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
  fi
  echo ""
  
  # Tester la désactivation (même si l'annonce n'est pas activée)
  test_endpoint "PUT" "/api/proprietaire/annonces/$ANNONCE_ID/desactiver" "" "PUT /proprietaire/annonces/{id}/desactiver - Désactiver une annonce"
  
  # Tester la suppression (mais seulement si pas de réservations actives)
  echo "🧪 Test: DELETE /proprietaire/annonces/{id} - Supprimer une annonce"
  echo "   DELETE /api/proprietaire/annonces/$ANNONCE_ID"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/proprietaire/annonces/$ANNONCE_ID" \
    -H "Authorization: Bearer $TOKEN")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "   ✅ Succès ($HTTP_CODE)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -10 || echo "$BODY" | head -3
  elif [ "$HTTP_CODE" -eq 409 ]; then
    echo "   ⚠️  Conflit ($HTTP_CODE) - Réservations actives (attendu)"
  else
    echo "   ❌ Erreur ($HTTP_CODE)"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
  fi
  echo ""
fi

echo ""
echo "=== GESTION DES RÉSERVATIONS (RESTANTS) ==="
# Récupérer une réservation si elle existe
RESERVATION_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/reservations" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); reservations = data.get('data', []); print(reservations[0]['id'] if reservations else '')" 2>/dev/null)

if [ -n "$RESERVATION_ID" ]; then
  test_endpoint "GET" "/api/proprietaire/reservations/$RESERVATION_ID" "" "GET /proprietaire/reservations/{id} - Consulter le détail d'une réservation"
  test_endpoint "GET" "/api/proprietaire/reservations/$RESERVATION_ID/locataire" "" "GET /proprietaire/reservations/{id}/locataire - Consulter le profil du locataire"
else
  echo "⚠️  Aucune réservation trouvée pour tester ces endpoints"
fi

echo ""
echo "=== GESTION DES PAIEMENTS (RESTANTS) ==="
# Récupérer un paiement si il existe
PAIEMENT_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/paiements" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); paiements = data.get('data', []); print(paiements[0]['id'] if paiements else '')" 2>/dev/null)

if [ -n "$PAIEMENT_ID" ]; then
  test_endpoint "GET" "/api/proprietaire/paiements/$PAIEMENT_ID" "" "GET /proprietaire/paiements/{id} - Consulter le détail d'un paiement"
else
  echo "⚠️  Aucun paiement trouvé pour tester cet endpoint"
fi

test_endpoint "GET" "/api/proprietaire/paiements/export?format=CSV" "" "GET /proprietaire/paiements/export - Exporter l'historique (CSV)"

echo ""
echo "=== MESSAGERIE (RESTANTS) ==="
# Récupérer une conversation si elle existe
CONVERSATION_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/messages" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); conversations = data.get('data', []); print(conversations[0]['reservationId'] if conversations else '')" 2>/dev/null)

if [ -n "$CONVERSATION_ID" ]; then
  test_endpoint "GET" "/api/proprietaire/messages/$CONVERSATION_ID" "" "GET /proprietaire/messages/{conversationId} - Consulter une conversation"
  
  # Récupérer un message ID pour marquer comme lu
  MESSAGE_ID=$(curl -s -X GET "$BASE_URL/api/proprietaire/messages/$CONVERSATION_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys, json; data = json.load(sys.stdin); messages = data.get('data', {}).get('messages', []); print(messages[0]['id'] if messages else '')" 2>/dev/null)
  
  if [ -n "$MESSAGE_ID" ]; then
    test_endpoint "PUT" "/api/proprietaire/messages/lu/$MESSAGE_ID" "" "PUT /proprietaire/messages/lu/{messageId} - Marquer un message comme lu"
  fi
else
  echo "⚠️  Aucune conversation trouvée pour tester ces endpoints"
fi

echo ""
echo "✅ Tous les tests sont passés avec succès!"
