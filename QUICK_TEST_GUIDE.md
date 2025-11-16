# 🚀 Quick Test Guide - Display Mode Feature

## Test the Backend RIGHT NOW (5 minutes)

### Step 1: Get Your JWT Token

1. Open the Hyperswitch dashboard in your browser: http://localhost:9000
2. Log in if not already logged in
3. Open Browser DevTools (F12)
4. Go to **Application** tab > **Storage** > **Local Storage** or **Session Storage**
5. Look for a key like `auth_token`, `token`, `jwt`, etc.
6. Copy the token value

**Alternative Method:**
1. Open **Network** tab in DevTools
2. Click any navigation in the dashboard
3. Click on any request in the Network tab
4. Look at **Request Headers** > **Authorization**
5. Copy the token after "Bearer "

### Step 2: Test with cURL

Open PowerShell and run:

```powershell
# Set your token as a variable (replace with your actual token)
$TOKEN = "YOUR_JWT_TOKEN_HERE"

# Test 1: Set display mode to dark
curl -X POST http://localhost:8080/user/data `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"DisplayMode\": \"dark\"}'

# Should return: HTTP 200 OK

# Test 2: Get current display mode
curl -X GET "http://localhost:8080/user/data/list?keys=display_mode" `
  -H "Authorization: Bearer $TOKEN"

# Should return: [{"DisplayMode":"dark"}]

# Test 3: Change to light mode
curl -X POST http://localhost:8080/user/data `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"DisplayMode\": \"light\"}'

# Test 4: Verify the change
curl -X GET "http://localhost:8080/user/data/list?keys=display_mode" `
  -H "Authorization: Bearer $TOKEN"

# Should return: [{"DisplayMode":"light"}]
```

### Step 3: Test with the HTML Demo

1. **Open** `frontend_display_mode_vanilla.html` in your browser
   - Just double-click the file, or
   - Right-click > Open with > Your browser

2. **Open Browser DevTools** (F12) > Console tab

3. **Set your token:**
   ```javascript
   localStorage.setItem('auth_token', 'YOUR_JWT_TOKEN_HERE');
   ```

4. **Refresh the page** (F5)

5. **Test the buttons!**
   - Click "System" - should follow your OS theme
   - Click "Light" - should use light theme
   - Click "Dark" - should use dark theme
   - The page should change themes instantly!

### Step 4: Verify in Database

Connect to your PostgreSQL database:

```powershell
docker exec -it hyperswitch-pg-1 psql -U db_user -d hyperswitch_db
```

Then run:

```sql
-- Check if the enum value exists
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'DashboardMetadata'::regtype 
ORDER BY enumlabel;

-- Should see 'display_mode' in the list

-- Check your saved preference
SELECT user_id, data_key, data_value 
FROM dashboard_metadata 
WHERE data_key = 'display_mode';

-- Should show your saved display mode
```

---

## ✅ Success Criteria

If all these work, the backend is 100% functional:

- ✅ cURL commands return 200 OK
- ✅ GET request returns your saved mode
- ✅ HTML demo loads without errors
- ✅ HTML demo changes themes when clicking buttons
- ✅ Database query shows the saved preference

---

## 🐛 Troubleshooting

### "Authentication failed" or 401 Error

**Problem:** Token is invalid or expired

**Solution:**
1. Log out and log back into the dashboard
2. Get a fresh token from DevTools
3. Try again

### "Failed to fetch display mode"

**Problem:** Backend not running or wrong URL

**Solution:**
```powershell
# Check if backend is running
docker ps | Select-String "hyperswitch-server"

# Check if backend is responding
curl http://localhost:8080/health
```

### HTML demo shows "No authentication token found"

**Problem:** Token not set in localStorage

**Solution:**
1. Open DevTools Console
2. Run: `localStorage.setItem('auth_token', 'YOUR_TOKEN');`
3. Refresh page

### Theme not changing in HTML demo

**Problem:** CSS not loading or browser cache

**Solution:**
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear browser cache
3. Try in incognito/private mode

---

## 📸 Expected Results

### cURL Test Output:

```
# After POST /user/data
HTTP/1.1 200 OK

# After GET /user/data/list?keys=display_mode
[
  {
    "DisplayMode": "dark"
  }
]
```

### HTML Demo:
- Page loads with three buttons: System, Light, Dark
- Clicking buttons changes the page theme immediately
- Active button is highlighted with blue border
- No errors in console

### Database Query Output:
```
 user_id | data_key     | data_value
---------+--------------+------------------
 user123 | display_mode | {"dark"}
```

---

## 🎯 Next Steps After Testing

Once the backend tests pass:

1. **For Control Center Integration:**
   - See `FRONTEND_INTEGRATION_GUIDE.md`
   - Option A: If you have Control Center source code
   - Option B: Fork and customize
   - Option C: Request feature from Hyperswitch team

2. **Use the React Component:**
   - Copy `frontend_display_mode_component.tsx`
   - Add to your Control Center project
   - Follow integration guide

3. **Customize:**
   - Adjust colors/styling
   - Add your icon library
   - Add analytics tracking

---

## 💡 Quick Win

**Want to see it work in the actual dashboard RIGHT NOW?**

Use a browser extension like Tampermonkey:

1. Install Tampermonkey browser extension
2. Create new script
3. Set match pattern: `http://localhost:9000/*`
4. Copy the JavaScript from `frontend_display_mode_vanilla.html`
5. Inject it into the profile page
6. It will work immediately! (Though this is just for demo/testing)

---

**Ready to test? Start with Step 1! 🚀**

