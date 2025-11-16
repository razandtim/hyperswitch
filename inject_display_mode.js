// ==UserScript==
// @name         Hyperswitch Display Mode
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add display mode settings to Hyperswitch dashboard
// @author       You
// @match        http://localhost:9000/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for page to load
    function init() {
        // Check if we're on the profile page
        if (!window.location.pathname.includes('profile')) {
            return;
        }

        // Wait for the page to be fully rendered
        setTimeout(() => {
            injectDisplaySettings();
        }, 2000);
    }

    function injectDisplaySettings() {
        // Find where to inject (you may need to adjust the selector)
        const profileContainer = document.querySelector('[data-testid="profile-container"]') 
            || document.querySelector('.profile-page')
            || document.querySelector('main')
            || document.body;

        if (!profileContainer) {
            console.log('Could not find profile container');
            return;
        }

        // Check if already injected
        if (document.getElementById('display-mode-settings')) {
            return;
        }

        // Create the display settings HTML
        const displayHTML = `
            <div id="display-mode-settings" style="
                background: var(--bg-secondary, #f8f9fa);
                border: 1px solid var(--border-color, #e9ecef);
                border-radius: 8px;
                padding: 24px;
                margin-top: 20px;
            ">
                <h3 style="
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                ">Display</h3>
                <p style="
                    font-size: 14px;
                    color: #6c757d;
                    margin: 0 0 20px 0;
                ">Choose your mode</p>
                
                <div id="display-error" style="display: none;"></div>
                
                <div id="mode-buttons" style="
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                ">
                    <button data-mode="system" style="
                        flex: 1;
                        min-width: 120px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        padding: 16px;
                        background: white;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-family: inherit;
                    ">
                        <span style="font-size: 32px;">🖥️</span>
                        <span style="font-weight: 600;">System</span>
                        <span style="font-size: 12px; color: #6c757d;">Follow system</span>
                    </button>
                    
                    <button data-mode="light" style="
                        flex: 1;
                        min-width: 120px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        padding: 16px;
                        background: white;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-family: inherit;
                    ">
                        <span style="font-size: 32px;">☀️</span>
                        <span style="font-weight: 600;">Light</span>
                        <span style="font-size: 12px; color: #6c757d;">Light theme</span>
                    </button>
                    
                    <button data-mode="dark" style="
                        flex: 1;
                        min-width: 120px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        padding: 16px;
                        background: white;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        font-family: inherit;
                    ">
                        <span style="font-size: 32px;">🌙</span>
                        <span style="font-weight: 600;">Dark</span>
                        <span style="font-size: 12px; color: #6c757d;">Dark theme</span>
                    </button>
                </div>
            </div>
        `;

        // Insert the HTML
        profileContainer.insertAdjacentHTML('beforeend', displayHTML);

        // Add dark theme CSS if not exists
        if (!document.getElementById('dark-theme-styles')) {
            const style = document.createElement('style');
            style.id = 'dark-theme-styles';
            style.textContent = `
                body.dark-theme {
                    --bg-primary: #0f0f0f;
                    --bg-secondary: #1a1a1a;
                    --text-primary: #e0e0e0;
                    --text-secondary: #9ca3af;
                    --border-color: #2d2d2d;
                    background-color: var(--bg-primary);
                    color: var(--text-primary);
                }
                
                body.dark-theme #display-mode-settings {
                    background: var(--bg-secondary);
                    border-color: var(--border-color);
                }
                
                body.dark-theme button[data-mode] {
                    background: var(--bg-secondary);
                    border-color: var(--border-color);
                    color: var(--text-primary);
                }
                
                body.dark-theme button[data-mode].active {
                    border-color: #3b82f6;
                    background: #1e3a5f;
                }
                
                button[data-mode].active {
                    border-color: #0066ff !important;
                    background: #e6f2ff !important;
                }
                
                button[data-mode]:hover {
                    border-color: #0066ff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
            `;
            document.head.appendChild(style);
        }

        // Initialize
        fetchDisplayMode();
        attachEventListeners();
    }

    function getAuthToken() {
        // Try various token storage locations
        return localStorage.getItem('auth_token') 
            || localStorage.getItem('token')
            || sessionStorage.getItem('auth_token')
            || sessionStorage.getItem('token');
    }

    async function fetchDisplayMode() {
        try {
            const token = getAuthToken();
            if (!token) {
                showError('No auth token found');
                return;
            }

            const response = await fetch('http://localhost:8080/user/data/list?keys=display_mode', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const mode = data[0]?.DisplayMode || 'system';
            
            updateActiveButton(mode);
            applyTheme(mode);
        } catch (error) {
            console.error('Error fetching display mode:', error);
            showError('Failed to load preference');
            applyTheme('system');
        }
    }

    async function updateDisplayMode(mode) {
        try {
            const token = getAuthToken();
            if (!token) {
                showError('No auth token found');
                return;
            }

            const response = await fetch('http://localhost:8080/user/data', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ DisplayMode: mode })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            updateActiveButton(mode);
            applyTheme(mode);
            clearError();
        } catch (error) {
            console.error('Error updating display mode:', error);
            showError('Failed to update preference');
        }
    }

    function applyTheme(mode) {
        let actualTheme = 'light';

        if (mode === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            actualTheme = prefersDark ? 'dark' : 'light';
        } else {
            actualTheme = mode;
        }

        if (actualTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        localStorage.setItem('theme', actualTheme);
    }

    function updateActiveButton(mode) {
        const buttons = document.querySelectorAll('button[data-mode]');
        buttons.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function attachEventListeners() {
        const buttons = document.querySelectorAll('button[data-mode]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                updateDisplayMode(btn.dataset.mode);
            });
        });
    }

    function showError(message) {
        const errorDiv = document.getElementById('display-error');
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.style.background = '#fee2e2';
            errorDiv.style.color = '#991b1b';
            errorDiv.style.padding = '12px';
            errorDiv.style.borderRadius = '6px';
            errorDiv.style.marginBottom = '16px';
            errorDiv.textContent = message;
        }
    }

    function clearError() {
        const errorDiv = document.getElementById('display-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    // Run on page load and navigation
    init();
    
    // Re-run on URL changes (for SPAs)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            init();
        }
    }).observe(document, {subtree: true, childList: true});

})();

