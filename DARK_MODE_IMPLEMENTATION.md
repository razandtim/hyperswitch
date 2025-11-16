# Dark Mode Implementation for Hyperswitch Dashboard

## Overview
This document describes the dark mode feature implementation for the Hyperswitch control center dashboard. The feature allows users to set their display preference to System, Light, or Dark mode from their profile settings.

## Backend Implementation

### 1. Database Schema
A new enum value `display_mode` has been added to the `DashboardMetadata` PostgreSQL enum type.

**Migration**: `migrations/2025-11-16-120000_add-display-mode-dashboard-metadata/`

```sql
ALTER TYPE "DashboardMetadata"
ADD VALUE IF NOT EXISTS 'display_mode';
```

### 2. API Models

**Request/Response Types** (`crates/api_models/src/user/dashboard_metadata.rs`):

```rust
#[derive(Debug, serde::Deserialize, serde::Serialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum DisplayMode {
    System,  // Follow system preferences
    Light,   // Force light mode
    Dark,    // Force dark mode
}
```

### 3. API Endpoints

The display mode preference is managed through the existing dashboard metadata endpoints:

#### Set Display Mode
```http
POST /user/data
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "DisplayMode": "dark"
}
```

**Response**: `200 OK`

#### Get Display Mode
```http
GET /user/data/list?keys=display_mode
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
[
  {
    "DisplayMode": "dark"
  }
]
```

For multiple keys:
```http
GET /user/data/list?keys=display_mode,is_change_password_required
```

### 4. Storage Scope
The display mode preference is stored as **user-scoped** metadata, meaning each user can have their own preference regardless of merchant or organization.

## Frontend Integration Guide

### 1. Setting Display Mode

When a user changes their display mode preference in the UI:

```typescript
const setDisplayMode = async (mode: 'system' | 'light' | 'dark') => {
  const response = await fetch('/user/data', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      DisplayMode: mode
    })
  });
  
  if (response.ok) {
    // Apply the theme
    applyTheme(mode);
  }
};
```

### 2. Getting Display Mode

On app initialization or profile page load:

```typescript
const getDisplayMode = async () => {
  const response = await fetch('/user/data/list?keys=display_mode', {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  const data = await response.json();
  const mode = data[0]?.DisplayMode;
  
  if (mode) {
    applyTheme(mode);
  } else {
    // Default to system
    applyTheme('system');
  }
};
```

### 3. Applying the Theme

```typescript
const applyTheme = (mode: 'system' | 'light' | 'dark') => {
  let theme = mode;
  
  if (mode === 'system') {
    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }
  
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
};

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const currentMode = getCurrentDisplayMode(); // Get from state
  if (currentMode === 'system') {
    applyTheme('system');
  }
});
```

## UI Component Example

Here's a suggested UI component for the Profile Settings page:

```typescript
// Profile Settings Component
const DisplaySettings = () => {
  const [displayMode, setDisplayMode] = useState<'system' | 'light' | 'dark'>('system');
  
  useEffect(() => {
    // Load saved preference on mount
    fetchDisplayMode();
  }, []);
  
  const fetchDisplayMode = async () => {
    try {
      const response = await fetch('/user/data/list?keys=display_mode', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const mode = data[0]?.DisplayMode || 'system';
      setDisplayMode(mode);
      applyTheme(mode);
    } catch (error) {
      console.error('Failed to fetch display mode:', error);
    }
  };
  
  const handleModeChange = async (mode: 'system' | 'light' | 'dark') => {
    try {
      const response = await fetch('/user/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ DisplayMode: mode })
      });
      
      if (response.ok) {
        setDisplayMode(mode);
        applyTheme(mode);
      }
    } catch (error) {
      console.error('Failed to update display mode:', error);
    }
  };
  
  return (
    <div className="display-settings-container">
      <h3>Display</h3>
      <p className="settings-description">Choose your display mode</p>
      
      <div className="mode-options">
        <button 
          className={`mode-option ${displayMode === 'system' ? 'active' : ''}`}
          onClick={() => handleModeChange('system')}
        >
          <span className="icon">🖥️</span>
          <span className="label">System</span>
        </button>
        
        <button 
          className={`mode-option ${displayMode === 'light' ? 'active' : ''}`}
          onClick={() => handleModeChange('light')}
        >
          <span className="icon">☀️</span>
          <span className="label">Light</span>
        </button>
        
        <button 
          className={`mode-option ${displayMode === 'dark' ? 'active' : ''}`}
          onClick={() => handleModeChange('dark')}
        >
          <span className="icon">🌙</span>
          <span className="label">Dark</span>
        </button>
      </div>
    </div>
  );
};
```

## Testing

### Manual Testing Steps

1. **Set Display Mode**:
   ```bash
   curl -X POST http://localhost:8080/user/data \
     -H "Authorization: Bearer <YOUR_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"DisplayMode": "dark"}'
   ```

2. **Get Display Mode**:
   ```bash
   curl -X GET "http://localhost:8080/user/data/list?keys=display_mode" \
     -H "Authorization: Bearer <YOUR_TOKEN>"
   ```

3. **Update Display Mode**:
   ```bash
   curl -X POST http://localhost:8080/user/data \
     -H "Authorization: Bearer <YOUR_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"DisplayMode": "system"}'
   ```

### Database Verification

Connect to the database and verify the data:

```sql
SELECT user_id, data_key, data_value 
FROM dashboard_metadata 
WHERE data_key = 'display_mode';
```

## CSS Implementation

### Required CSS Variables

```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #e9ecef;
  --shadow-color: rgba(0, 0, 0, 0.05);
}

body.dark-theme {
  /* Dark theme */
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --text-primary: #e0e0e0;
  --text-secondary: #9ca3af;
  --border-color: #2d2d2d;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## Architecture Notes

1. **User-Scoped**: Display mode is stored per user, not per merchant/organization
2. **Updateable**: Users can change their preference multiple times; the backend supports updates
3. **Optional**: If no preference is set, the frontend should default to "system"
4. **JWT Required**: All endpoints require authentication via JWT token

## Files Modified

### Backend
- `crates/diesel_models/src/enums.rs` - Added DisplayMode to DashboardMetadata enum
- `crates/api_models/src/user/dashboard_metadata.rs` - Added DisplayMode API types
- `crates/router/src/types/domain/user/dashboard_metadata.rs` - Added DisplayMode to MetaData enum
- `crates/router/src/core/user/dashboard_metadata.rs` - Added handlers for DisplayMode
- `crates/router/src/utils/user/dashboard_metadata.rs` - Added user-scoped handling
- `migrations/2025-11-16-120000_add-display-mode-dashboard-metadata/` - Database migration

### Frontend (To be implemented)
- Profile settings page component
- Theme application logic
- CSS dark theme styles
- System preference detection

## Next Steps

1. **Apply Migration**: Run the database migration in your container
   ```bash
   docker-compose exec migration_runner diesel migration run
   ```

2. **Rebuild Backend**: The Rust code changes will be picked up on next build

3. **Frontend Implementation**:
   - Add the Display settings section to the profile page
   - Implement theme switching logic
   - Add CSS for dark mode
   - Test across different components

4. **Testing**: Test the API endpoints and verify persistence across sessions

## Support

For questions or issues, refer to:
- Hyperswitch documentation: https://docs.hyperswitch.io
- This repository's issues section

