# Frontend Integration Guide for Display Mode

## 🎯 Overview

The backend for Display Mode is **100% complete and functional**. This guide explains how to integrate the frontend UI into the Hyperswitch Control Center.

---

## 📦 What's Been Created

I've provided **three implementation options**:

1. **`frontend_display_mode_component.tsx`** - React/TypeScript component (recommended for Control Center)
2. **`frontend_display_mode_vanilla.html`** - Standalone HTML/JS demo (for testing/reference)
3. This integration guide

---

## 🚀 Quick Start - Test the API

Before integrating the frontend, verify the backend works:

### 1. Get Your JWT Token

Open your browser DevTools (F12) while logged into the dashboard:
- Go to **Application** > **Storage** > **Local Storage** or **Session Storage**
- Find your auth token (usually called `auth_token`, `token`, or similar)
- Or check **Network** tab > look for request headers > `Authorization: Bearer <token>`

### 2. Test with cURL

```bash
# Replace YOUR_TOKEN with the token from step 1

# Set display mode to dark
curl -X POST http://localhost:8080/user/data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"DisplayMode": "dark"}'

# Get current display mode
curl -X GET "http://localhost:8080/user/data/list?keys=display_mode" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test with the HTML Demo

1. Open `frontend_display_mode_vanilla.html` in a browser
2. Open browser DevTools console (F12)
3. Set your token:
   ```javascript
   localStorage.setItem('auth_token', 'YOUR_JWT_TOKEN_HERE');
   ```
4. Refresh the page
5. The Display settings should load and work!

---

## 🔧 Integration into Control Center

### Option A: If You Have Access to Control Center Source Code

The Hyperswitch Control Center is likely a React/TypeScript application. Here's how to integrate:

#### Step 1: Add the Component

Copy `frontend_display_mode_component.tsx` to your Control Center project:

```bash
# Assuming typical structure:
cp frontend_display_mode_component.tsx /path/to/control-center/src/components/Settings/DisplayModeSettings.tsx
```

#### Step 2: Update the Profile Page

Find the Profile/Settings page component (likely at something like `src/screens/Settings/Profile.tsx` or `src/pages/Settings/Profile.tsx`):

```typescript
// Profile.tsx or similar
import { DisplayModeSettings } from '../../components/Settings/DisplayModeSettings';

export const ProfilePage = () => {
  return (
    <div className="profile-page">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your profile settings here</p>
      
      {/* Existing User Info Container */}
      <div className="settings-container">
        <h3 className="section-title">User Info</h3>
        {/* ... existing user info fields ... */}
      </div>
      
      {/* NEW: Display Mode Settings */}
      <DisplayModeSettings />
      
      {/* ... other settings containers ... */}
    </div>
  );
};
```

#### Step 3: Add CSS

If using CSS Modules, create `DisplayModeSettings.module.css`:

```css
/* Copy the styles from frontend_display_mode_component.tsx */
/* Or add to your global stylesheet */
```

If using styled-components or Tailwind, adapt the styles accordingly.

#### Step 4: Update Token Retrieval

In `DisplayModeSettings.tsx`, update the `getAuthToken()` function to match your auth implementation:

```typescript
// Example for React Context
const { token } = useAuth();

// Example for Redux
const token = useSelector(state => state.auth.token);

// Example for custom hook
const { getToken } = useAuthToken();
const token = getToken();
```

---

### Option B: If Control Center is Pre-built (Current Situation)

Since you're using the pre-built Docker image, you have these options:

#### Option B1: Request Feature from Hyperswitch Team

Contact the Hyperswitch team to add this feature to the official Control Center. Provide them:
- This implementation guide
- The React component (`frontend_display_mode_component.tsx`)
- Reference to the backend PR/commit

#### Option B2: Fork and Build Custom Control Center

1. **Clone the Control Center repository**:
   ```bash
   # Find the official repo (likely on GitHub)
   git clone https://github.com/juspay/hyperswitch-control-center
   cd hyperswitch-control-center
   ```

2. **Add the Display Mode component** (follow Option A above)

3. **Build a custom Docker image**:
   ```bash
   # Build custom image
   docker build -t my-hyperswitch-control-center:latest .
   ```

4. **Update docker-compose.yml**:
   ```yaml
   hyperswitch-control-center:
     image: my-hyperswitch-control-center:latest  # Use your custom image
     build: ./path/to/control-center  # Or build locally
     pull_policy: never  # Don't pull from registry
     ports:
       - "9000:9000"
     # ... rest of config ...
   ```

#### Option B3: Inject via Browser Extension (Temporary/Dev Only)

For development/testing, you can inject the component via a browser extension or userscript:

```javascript
// Tampermonkey/Greasemonkey script
// @match http://localhost:9000/*

(function() {
  'use strict';
  
  // Wait for page to load
  window.addEventListener('load', function() {
    // Find the profile page container
    const profileContainer = document.querySelector('.profile-page');
    
    if (profileContainer) {
      // Inject the Display settings HTML
      const displaySettings = document.createElement('div');
      displaySettings.className = 'display-settings-container';
      displaySettings.innerHTML = `
        <!-- HTML from frontend_display_mode_vanilla.html -->
      `;
      
      // Insert after User Info
      const userInfo = profileContainer.querySelector('.user-info-container');
      userInfo.after(displaySettings);
      
      // Add event listeners
      // ... copy the JavaScript logic from vanilla version ...
    }
  });
})();
```

---

## 📝 Component API Reference

### DisplayModeSettings Component Props

```typescript
interface DisplayModeSettingsProps {
  // No props required - component is self-contained
}
```

### State Management

The component manages its own state internally:
- `displayMode`: Current selected mode ('system' | 'light' | 'dark')
- `isLoading`: Loading state during API calls
- `error`: Error message if API calls fail

### API Integration

The component uses these endpoints:
- `GET /user/data/list?keys=display_mode` - Fetch current mode
- `POST /user/data` - Update mode

---

## 🎨 Customization

### Changing Styles

Edit the CSS variables in your theme:

```css
:root {
  --primary-color: #your-brand-color;
  --bg-primary: #your-background;
  /* ... other variables ... */
}
```

### Adding Animations

```css
.mode-option {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-option:active {
  transform: scale(0.95);
}
```

### Custom Icons

Replace the emoji icons with your icon library:

```typescript
const modeOptions = [
  { value: 'system', label: 'System', icon: <ComputerIcon />, ... },
  { value: 'light', label: 'Light', icon: <SunIcon />, ... },
  { value: 'dark', label: 'Dark', icon: <MoonIcon />, ... },
];
```

---

## 🧪 Testing

### Unit Tests (Jest/React Testing Library)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DisplayModeSettings } from './DisplayModeSettings';

describe('DisplayModeSettings', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  it('renders display mode options', () => {
    render(<DisplayModeSettings />);
    
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('fetches current mode on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ DisplayMode: 'dark' }],
    });

    render(<DisplayModeSettings />);

    await waitFor(() => {
      expect(screen.getByLabelText(/dark/i)).toHaveClass('active');
    });
  });

  it('updates mode when option clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ DisplayMode: 'light' }],
      })
      .mockResolvedValueOnce({ ok: true });

    render(<DisplayModeSettings />);

    await waitFor(() => {
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/dark/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ DisplayMode: 'dark' }),
        })
      );
    });
  });
});
```

### E2E Tests (Cypress)

```typescript
describe('Display Mode Settings', () => {
  beforeEach(() => {
    cy.login(); // Your login helper
    cy.visit('/dashboard/account-settings/profile');
  });

  it('should display mode settings', () => {
    cy.contains('Display').should('be.visible');
    cy.contains('Choose your mode').should('be.visible');
  });

  it('should change to dark mode', () => {
    cy.contains('button', 'Dark').click();
    
    cy.wait('@updateDisplayMode'); // Mock API call
    
    cy.get('body').should('have.class', 'dark-theme');
  });

  it('should persist mode across page refresh', () => {
    cy.contains('button', 'Dark').click();
    cy.wait('@updateDisplayMode');
    
    cy.reload();
    
    cy.get('body').should('have.class', 'dark-theme');
    cy.contains('button', 'Dark').should('have.class', 'active');
  });
});
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch display mode"

**Causes:**
- Invalid or expired JWT token
- CORS issues
- Backend not running

**Solutions:**
```javascript
// Check token
console.log('Token:', localStorage.getItem('auth_token'));

// Check CORS
// Add to backend CORS config if needed

// Verify backend
curl http://localhost:8080/health
```

### Issue: Theme not applying

**Causes:**
- CSS not loaded
- CSS specificity issues
- Theme class not being set

**Solutions:**
```javascript
// Debug theme application
console.log('Current theme:', localStorage.getItem('theme'));
console.log('Body classes:', document.body.classList);

// Force theme
document.body.classList.add('dark-theme');
```

### Issue: System mode not detecting

**Causes:**
- Browser doesn't support prefers-color-scheme
- Listener not attached

**Solutions:**
```javascript
// Check support
console.log('Supports dark mode:', 
  window.matchMedia('(prefers-color-scheme: dark)').matches
);

// Test listener
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', e => console.log('System theme changed:', e.matches));
```

---

## 📚 Additional Resources

- **Backend API**: See `DARK_MODE_IMPLEMENTATION.md`
- **Test Script**: Use `test_display_mode.sh`
- **Quick Reference**: See `DARK_MODE_SUMMARY.md`

---

## ✅ Integration Checklist

- [ ] Backend migration applied
- [ ] API endpoints tested with cURL/Postman
- [ ] Component added to Control Center
- [ ] Token retrieval updated for your auth system
- [ ] CSS styles added (global or module)
- [ ] Profile page updated to include component
- [ ] Dark theme CSS variables defined
- [ ] Component tested in browser
- [ ] Theme persists across page refreshes
- [ ] System preference detection works
- [ ] Error handling tested
- [ ] Unit tests written (optional)
- [ ] E2E tests written (optional)

---

## 💡 Pro Tips

1. **Use localStorage** for quick persistence while API is processing
2. **Debounce** API calls if user clicks quickly
3. **Add loading states** to prevent double-clicks
4. **Show toast notifications** for successful updates
5. **Handle offline mode** gracefully
6. **Test with slow network** to catch edge cases
7. **Support keyboard navigation** (already included in component)
8. **Add analytics** to track which modes users prefer

---

**Need Help?** Check the other documentation files or ask for specific assistance!

