#!/bin/bash

# Attendre que Keycloak soit prêt
sleep 30

# Obtenir un token admin
TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

# Créer un nouveau realm
curl -X POST http://localhost:8080/admin/realms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "est-realm",
    "enabled": true
  }'

# Créer les clients
# Client pour l'auth-service
curl -X POST http://localhost:8080/admin/realms/est-realm/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "est-auth-client",
    "enabled": true,
    "publicClient": false,
    "secret": "your-auth-client-secret",
    "serviceAccountsEnabled": true
  }'

# Client pour le cours-service
curl -X POST http://localhost:8080/admin/realms/est-realm/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "est-cours-client",
    "enabled": true,
    "publicClient": false,
    "secret": "your-cours-client-secret",
    "serviceAccountsEnabled": true
  }'

# Client pour le frontend
curl -X POST http://localhost:8080/admin/realms/est-realm/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "est-frontend-client",
    "enabled": true,
    "publicClient": true,
    "redirectUris": ["http://localhost:3000/*"],
    "webOrigins": ["http://localhost:3000"]
  }'