#!/bin/bash

# Test script for Display Mode API
# Make sure to set your JWT token before running

BASE_URL="http://localhost:8080"
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "==================================="
echo "Dark Mode API Testing Script"
echo "==================================="
echo ""

# Test 1: Set Display Mode to Dark
echo "Test 1: Setting display mode to 'dark'..."
curl -X POST "${BASE_URL}/user/data" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"DisplayMode": "dark"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

# Test 2: Get Display Mode
echo "Test 2: Getting current display mode..."
curl -X GET "${BASE_URL}/user/data/list?keys=display_mode" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

# Test 3: Update to Light Mode
echo "Test 3: Updating display mode to 'light'..."
curl -X POST "${BASE_URL}/user/data" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"DisplayMode": "light"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

# Test 4: Get Display Mode Again
echo "Test 4: Verifying update..."
curl -X GET "${BASE_URL}/user/data/list?keys=display_mode" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

# Test 5: Update to System Mode
echo "Test 5: Setting display mode to 'system'..."
curl -X POST "${BASE_URL}/user/data" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"DisplayMode": "system"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

# Test 6: Get Multiple Metadata Keys
echo "Test 6: Getting multiple metadata keys (display_mode + others)..."
curl -X GET "${BASE_URL}/user/data/list?keys=display_mode,is_change_password_required" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo ""

echo "==================================="
echo "Testing Complete!"
echo "==================================="

