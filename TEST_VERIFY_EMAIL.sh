#!/bin/bash

# Test de l'endpoint verify-email avec l'access_token depuis la redirection Supabase

# Valeurs extraites de l'URL
ACCESS_TOKEN="eyJhbGciOiJFUzI1NiIsImtpZCI6ImMwZDNjODUxLTZkMTQtNDVhMS1hZmZmLTIyZTRlZGFjMTNkYyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2h6ZWl5eXpvcHF1eG1neHB1aHBvLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyYjBiYTA4OC1jZTNhLTRjNDgtYjg3OC1lOTMyYzZkMmJiYTMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNDgwNzI5LCJpYXQiOjE3NzE0NzcxMjksImVtYWlsIjoiYWFkaW9wQGRpemlncm91cC5uZXQiLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiYWFkaW9wQGRpemlncm91cC5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibm9tIjoiRHVwb250IiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwcmVub20iOiJKZWFuIiwic3ViIjoiMmIwYmEwODgtY2UzYS00YzQ4LWI4NzgtZTkzMmM2ZDJiYmEzIiwidGVsZXBob25lIjoiKzI0MTA2MjM0NTY3OCIsInR5cGVfdXRpbGlzYXRldXIiOiJMT0NBVEFJUkUifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3NzE0NzcxMjl9XSwic2Vzc2lvbl9pZCI6IjA0OTU3Y2I2LWE2ODctNDVlYS04YjExLTU1ZDZlNGE4YTcwZCIsImlzX2Fub255bW91cyI6ZmFsc2V9.hMR3j41um_tI8-2EFIQt4tsH_Y5hp-r9LkVbM-ESfeeAR2K4kW3Z7VngLND0hSw88F2eHscT0yFcxUJk2JaoOA"
TYPE="signup"

echo "🧪 Test de l'endpoint verify-email..."
echo ""

curl -X POST 'http://localhost:3000/api/auth/verify-email' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "{
    \"accessToken\": \"$ACCESS_TOKEN\",
    \"type\": \"$TYPE\"
  }" | jq '.'

echo ""
echo "✅ Test terminé"
