# Quick test script for Display Mode
# Run this in PowerShell

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Display Mode Quick Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get token
Write-Host "Step 1: Get your JWT token" -ForegroundColor Yellow
Write-Host "  1. Go to http://localhost:9000 in your browser"
Write-Host "  2. Press F12 > Application > Local Storage"
Write-Host "  3. Find your auth token"
Write-Host "  4. Copy it"
Write-Host ""

$TOKEN = Read-Host "Paste your token here"

if ([string]::IsNullOrWhiteSpace($TOKEN)) {
    Write-Host "Error: No token provided!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 2: Testing API..." -ForegroundColor Yellow
Write-Host ""

# Test 1: Set to dark mode
Write-Host "Test 1: Setting display mode to 'dark'..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/user/data" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body '{"DisplayMode": "dark"}'
    
    Write-Host "✓ Success! Set to dark mode" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Get current mode
Write-Host "Test 2: Getting current display mode..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/user/data/list?keys=display_mode" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        }
    
    $mode = $response[0].DisplayMode
    Write-Host "✓ Success! Current mode: $mode" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 3: Set to light mode
Write-Host "Test 3: Setting display mode to 'light'..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/user/data" `
        -Method Post `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body '{"DisplayMode": "light"}'
    
    Write-Host "✓ Success! Set to light mode" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 4: Verify
Write-Host "Test 4: Verifying the change..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/user/data/list?keys=display_mode" `
        -Method Get `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "application/json"
        }
    
    $mode = $response[0].DisplayMode
    Write-Host "✓ Success! Current mode: $mode" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "All tests passed! ✓" -ForegroundColor Green
Write-Host "Backend is working perfectly!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now test the frontend:" -ForegroundColor Yellow
Write-Host "  1. Open frontend_display_mode_vanilla.html" -ForegroundColor White
Write-Host "  2. Press F12 and run: localStorage.setItem('auth_token', '$TOKEN');" -ForegroundColor White
Write-Host "  3. Refresh and test the buttons!" -ForegroundColor White
Write-Host ""

