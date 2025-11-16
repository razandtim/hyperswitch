/**
 * Display Mode Settings Component for Hyperswitch Control Center
 * 
 * This component should be added to the Profile Settings page,
 * right after the "User Info" container.
 * 
 * Location: /src/screens/Settings/Profile.tsx (or similar)
 */

import React, { useState, useEffect } from 'react';

// Types
type DisplayMode = 'system' | 'light' | 'dark';

interface DisplayModeResponse {
  DisplayMode: DisplayMode;
}

// Component
export const DisplayModeSettings: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from your auth context/store
  const getAuthToken = () => {
    // Replace with your actual auth token retrieval
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  };

  // Fetch current display mode on mount
  useEffect(() => {
    fetchDisplayMode();
  }, []);

  // Fetch display mode from API
  const fetchDisplayMode = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      
      const response = await fetch('/user/data/list?keys=display_mode', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch display mode');
      }

      const data: DisplayModeResponse[] = await response.json();
      const mode = data[0]?.DisplayMode || 'system';
      
      setDisplayMode(mode);
      applyTheme(mode);
      setError(null);
    } catch (err) {
      console.error('Error fetching display mode:', err);
      setError('Failed to load display preference');
      // Default to system
      applyTheme('system');
    } finally {
      setIsLoading(false);
    }
  };

  // Update display mode via API
  const updateDisplayMode = async (newMode: DisplayMode) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch('/user/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ DisplayMode: newMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to update display mode');
      }

      setDisplayMode(newMode);
      applyTheme(newMode);
      setError(null);
      
      // Optional: Show success toast
      // toast.success('Display mode updated');
    } catch (err) {
      console.error('Error updating display mode:', err);
      setError('Failed to update display preference');
      // Optional: Show error toast
      // toast.error('Failed to update display mode');
    }
  };

  // Apply theme to document
  const applyTheme = (mode: DisplayMode) => {
    let actualTheme: 'light' | 'dark' = 'light';

    if (mode === 'system') {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? 'dark' : 'light';
    } else {
      actualTheme = mode;
    }

    // Apply theme class to body
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }

    // Store for persistence
    localStorage.setItem('theme', actualTheme);
    localStorage.setItem('theme_preference', mode);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (displayMode === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [displayMode]);

  const modeOptions = [
    { value: 'system' as const, label: 'System', icon: '🖥️', description: 'Follow system settings' },
    { value: 'light' as const, label: 'Light', icon: '☀️', description: 'Light theme' },
    { value: 'dark' as const, label: 'Dark', icon: '🌙', description: 'Dark theme' },
  ];

  if (isLoading) {
    return (
      <div className="display-settings-container">
        <h3 className="settings-title">Display</h3>
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="display-settings-container">
      <h3 className="settings-title">Display</h3>
      <p className="settings-description">Choose your mode</p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="mode-options">
        {modeOptions.map((option) => (
          <button
            key={option.value}
            className={`mode-option ${displayMode === option.value ? 'active' : ''}`}
            onClick={() => updateDisplayMode(option.value)}
            aria-label={`Set display mode to ${option.label}`}
            aria-pressed={displayMode === option.value}
          >
            <span className="mode-icon" aria-hidden="true">{option.icon}</span>
            <div className="mode-content">
              <span className="mode-label">{option.label}</span>
              <span className="mode-description">{option.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// CSS Styles (add to your global stylesheet or CSS module)
const styles = `
.display-settings-container {
  background: var(--bg-secondary, #f8f9fa);
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 8px;
  padding: 24px;
  margin-top: 20px;
}

.settings-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #212529);
  margin: 0 0 8px 0;
}

.settings-description {
  font-size: 14px;
  color: var(--text-secondary, #6c757d);
  margin: 0 0 20px 0;
}

.loading-state {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary, #6c757d);
}

.error-message {
  background: var(--error-bg, #fee2e2);
  color: var(--error-text, #991b1b);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.mode-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mode-option {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg-primary, #ffffff);
  border: 2px solid var(--border-color, #e9ecef);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.mode-option:hover {
  border-color: var(--primary-color, #0066ff);
  background: var(--hover-bg, #f1f3f5);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

.mode-option.active {
  border-color: var(--primary-color, #0066ff);
  background: var(--primary-bg, #e6f2ff);
  box-shadow: 0 2px 8px var(--primary-shadow, rgba(0, 102, 255, 0.2));
}

.mode-option:focus-visible {
  outline: 2px solid var(--primary-color, #0066ff);
  outline-offset: 2px;
}

.mode-icon {
  font-size: 32px;
  line-height: 1;
}

.mode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mode-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #212529);
}

.mode-description {
  font-size: 12px;
  color: var(--text-secondary, #6c757d);
  text-align: center;
}

/* Dark theme styles */
body.dark-theme {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --text-primary: #e0e0e0;
  --text-secondary: #9ca3af;
  --border-color: #2d2d2d;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --hover-bg: #262626;
  --primary-color: #3b82f6;
  --primary-bg: #1e3a5f;
  --primary-shadow: rgba(59, 130, 246, 0.2);
  --error-bg: rgba(220, 38, 38, 0.15);
  --error-text: #ef4444;
}

body.dark-theme .display-settings-container {
  background: var(--bg-secondary);
}

body.dark-theme .mode-option {
  background: var(--bg-secondary);
}

body.dark-theme .mode-option:hover {
  background: var(--hover-bg);
}

/* Smooth theme transitions */
body,
.display-settings-container,
.mode-option {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
`;

// Export the styles if using CSS-in-JS
export const displayModeStyles = styles;

// Usage example in Profile page:
/*
import { DisplayModeSettings } from './components/DisplayModeSettings';

function ProfilePage() {
  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <p>Manage your profile settings here</p>
      
      {/* User Info Container *\/}
      <div className="user-info-container">
        <h3>User Info</h3>
        {/* ... existing user info fields ... *\/}
      </div>
      
      {/* Display Mode Settings - NEW *\/}
      <DisplayModeSettings />
      
      {/* ... other settings ... *\/}
    </div>
  );
}
*/

