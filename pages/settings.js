// Settings Page Script
// Version: 2.0 - IIFE Wrapper Fix

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.settingsModuleLoaded) {
        console.log('Settings module already loaded, skipping...');
        return;
    }
    window.settingsModuleLoaded = true;

    console.log('⚙️ Settings page script loaded v2.0');

    // Use window to avoid redeclaration.
    // Prefer stored API URL; in hosted env default to Render backend.
    if (typeof window.API_BASE_URL === 'undefined') {
        const host = window.location.hostname;
        const stored = localStorage.getItem('api_base_url');
        const isHostedEnv = /\.(workers\.dev|pages\.dev|onrender\.com)$/i.test(host);
        const invalidStored = isHostedEnv && /(workers\.dev|pages\.dev|onrender\.com):8000/i.test(stored || '');
        window.API_BASE_URL = (!invalidStored && stored) || (isHostedEnv
            ? 'https://cocoguard-api.onrender.com'
            : `${window.location.protocol}//${host}:8000`);
    }
    const API_BASE_URL = window.API_BASE_URL;
    
    if (typeof window.currentSettings === 'undefined') {
        window.currentSettings = null;
    }

// Initialize settings page
async function initSettings() {
    console.log('🔧 Initializing settings module...');
    
    try {
        // Load current settings from backend
        await loadSettings();
        
        // Setup event listeners
        setupEventListeners();
        
        // Apply current theme
        applyTheme(document.getElementById('theme')?.value || 'light');
        
        // Sync Translator with loaded language setting
        const langVal = document.getElementById('language')?.value || 'en';
        if (window.Translator) {
            window.Translator.setLang(langVal);
        }
        
        console.log('✅ Settings module initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing settings:', err);
        showError('Failed to load settings. Please try again.');
    }
}

// Load settings from backend
async function loadSettings() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/cocoguard_web/index.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/settings/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        window.currentSettings = await response.json();
        console.log('✓ Settings loaded:', window.currentSettings);
        
        // Populate form with current settings
        populateSettings(window.currentSettings);
        
    } catch (error) {
        console.error('Error loading settings:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

// Populate form fields with settings data
function populateSettings(settings) {
    // Toggle switches
    const toggles = [
        'email_notifications',
        'sms_notifications',
        'push_notifications',
        'two_factor_enabled',
        'auto_backup',
        'data_sharing',
        'profile_visible'
    ];
    
    toggles.forEach(field => {
        const element = document.getElementById(field);
        if (element && settings[field] !== undefined) {
            element.checked = settings[field];
        }
    });
    
    // Select fields
    if (settings.language) {
        const langElement = document.getElementById('language');
        if (langElement) langElement.value = settings.language;
    }
    
    if (settings.theme) {
        const themeElement = document.getElementById('theme');
        if (themeElement) {
            themeElement.value = settings.theme;
            applyTheme(settings.theme);
        }
    }
}

// Apply theme to the page
function applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark');
    
    let effectiveTheme = theme;
    
    // Default to light if somehow 'auto' value exists
    if (theme === 'auto') {
        effectiveTheme = 'light';
    }
    
    body.classList.add(`theme-${effectiveTheme}`);
    localStorage.setItem('theme', theme);
    
    // Apply CSS variables for theme - matching website's styles.css
    if (effectiveTheme === 'dark') {
        root.style.setProperty('--bg-primary', '#111827');
        root.style.setProperty('--bg-secondary', '#1f2937');
        root.style.setProperty('--text-primary', '#f3f4f6');
        root.style.setProperty('--text-secondary', '#9ca3af');
        root.style.setProperty('--card-bg', '#1f2937');
        root.style.setProperty('--border-color', '#374151');
        root.style.setProperty('--accent-color', '#16a34a');
        root.style.setProperty('--accent-hover', '#15803d');
    } else {
        root.style.setProperty('--bg-primary', '#f5f7fa');
        root.style.setProperty('--bg-secondary', '#ffffff');
        root.style.setProperty('--text-primary', '#1f2937');
        root.style.setProperty('--text-secondary', '#6b7280');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--border-color', '#e5e7eb');
        root.style.setProperty('--accent-color', '#16a34a');
        root.style.setProperty('--accent-hover', '#15803d');
    }
    
    console.log(`🎨 Theme applied: ${effectiveTheme}`);
}

// Setup event listeners
function setupEventListeners() {
    // Save button
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    
    // Reset button
    const resetBtn = document.getElementById('reset-settings-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }
    
    // Change password button
    const changePwdBtn = document.getElementById('change-password-btn');
    if (changePwdBtn) {
        changePwdBtn.addEventListener('click', openChangePasswordModal);
    }
    
    // Export data button
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportUserData);
    }
    
    // Delete account button
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', openDeleteAccountModal);
    }
    
    // Logout all devices button
    const logoutAllBtn = document.getElementById('logout-all-btn');
    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', logoutAllDevices);
    }
    
    // Theme change - apply immediately
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }
    
    // Setup password modal event listeners
    setupPasswordModalListeners();
    
    // Setup delete account modal listeners
    setupDeleteAccountModalListeners();
    
    // Setup 2FA toggle listener
    setup2FAToggleListener();
    
    // Setup backup management
    setupBackupManagement();
    
    
    // Auto-save on toggle change
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const setting = e.target.dataset.setting;
            console.log(`📋 Setting changed: ${setting} = ${e.target.checked}`);
            
            // Special handling for 2FA toggle
            if (setting === 'two_factor_enabled') {
                handle2FAToggle(e.target.checked);
            }
        });
    });
    
    // Auto-save on select change
    const selects = document.querySelectorAll('.settings-select');
    selects.forEach(select => {
        select.addEventListener('change', (e) => {
            const setting = e.target.dataset.setting;
            console.log(`📋 Setting changed: ${setting} = ${e.target.value}`);

            // Apply language change immediately
            if (setting === 'language' && window.Translator) {
                window.Translator.setLang(e.target.value);
                console.log(`🌐 Language switched to: ${e.target.value}`);
            }
        });
    });
}

// ============ TWO-FACTOR AUTHENTICATION FUNCTIONALITY ============

let twofaData = {
    resendTimer: null,
    resendCountdown: 0,
    userEmail: ''
};

function setup2FAToggleListener() {
    // The toggle listener is set up in setupEventListeners
    // This function sets up 2FA modal listeners
    
    const closeBtn = document.getElementById('close-twofa-modal');
    const cancelBtn = document.getElementById('cancel-twofa-setup');
    const sendCodeBtn = document.getElementById('send-twofa-code');
    const verifyBtn = document.getElementById('verify-twofa-code');
    const backBtn = document.getElementById('twofa-back-btn');
    const resendBtn = document.getElementById('twofa-resend-btn');
    const closeSuccessBtn = document.getElementById('close-twofa-success');
    const codeInput = document.getElementById('twofa-code-input');
    
    if (closeBtn) closeBtn.addEventListener('click', close2FAModal);
    if (cancelBtn) cancelBtn.addEventListener('click', close2FAModal);
    if (sendCodeBtn) sendCodeBtn.addEventListener('click', send2FAVerificationCode);
    if (verifyBtn) verifyBtn.addEventListener('click', verify2FACode);
    if (backBtn) backBtn.addEventListener('click', goBack2FAStep1);
    if (resendBtn) resendBtn.addEventListener('click', resend2FACode);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', close2FAModal);
    
    // Only allow numbers in code input
    if (codeInput) {
        codeInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
        });
    }
    
    // Close on overlay click
    const modal = document.getElementById('twofa-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                close2FAModal();
            }
        });
    }
}

function handle2FAToggle(isEnabled) {
    console.log(`🔐 2FA toggle changed: ${isEnabled}`);
    
    if (isEnabled) {
        // Open 2FA setup modal
        open2FAModal();
    } else {
        // Prompt for password to disable 2FA
        showDisable2FAModal();
    }
}

function showDisable2FAModal() {
    // Create a simple password prompt modal
    const existingModal = document.getElementById('disable-2fa-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'disable-2fa-modal';
    modal.className = 'modal';
    modal.style.cssText = 'display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;';
    modal.innerHTML = `
        <div style="background: var(--bg-primary, white); border-radius: 16px; max-width: 400px; width: 90%; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 25px; text-align: center;">
                <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                </div>
                <h3 style="color: white; margin: 0; font-size: 20px;">Disable Two-Factor Authentication</h3>
                <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0; font-size: 14px;">Enter your password to confirm</p>
            </div>
            <div style="padding: 25px;">
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0 0 20px; text-align: center;">This will make your account less secure. Are you sure?</p>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-primary);">Current Password</label>
                    <input type="password" id="disable-2fa-password" placeholder="Enter your password" style="width: 100%; padding: 12px; border: 1px solid var(--border-color, #ddd); border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="cancel-disable-2fa" style="flex: 1; padding: 12px; border: 1px solid var(--border-color, #ddd); background: transparent; border-radius: 8px; cursor: pointer; font-size: 14px;">Cancel</button>
                    <button id="confirm-disable-2fa" style="flex: 1; padding: 12px; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;">Disable 2FA</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus password input
    setTimeout(() => document.getElementById('disable-2fa-password')?.focus(), 100);
    
    // Event listeners
    document.getElementById('cancel-disable-2fa').addEventListener('click', () => {
        modal.remove();
        // Revert toggle
        const toggle = document.getElementById('two_factor_enabled');
        if (toggle) toggle.checked = true;
    });
    
    document.getElementById('confirm-disable-2fa').addEventListener('click', async () => {
        const password = document.getElementById('disable-2fa-password').value;
        if (!password) {
            showError('Please enter your password');
            return;
        }
        modal.remove();
        await disable2FA(password);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            const toggle = document.getElementById('two_factor_enabled');
            if (toggle) toggle.checked = true;
        }
    });
    
    // Enter key support
    document.getElementById('disable-2fa-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('confirm-disable-2fa').click();
        }
    });
}

function open2FAModal() {
    const modal = document.getElementById('twofa-modal');
    if (modal) {
        modal.style.display = 'flex';
        reset2FAModal();
    }
}

function close2FAModal() {
    const modal = document.getElementById('twofa-modal');
    if (modal) {
        modal.style.display = 'none';
        reset2FAModal();
        
        // Revert toggle if not completed
        const toggle = document.getElementById('two_factor_enabled');
        if (toggle && !window.currentSettings?.two_factor_enabled) {
            toggle.checked = false;
        }
    }
}

function reset2FAModal() {
    // Show step 1, hide others
    const step1 = document.getElementById('twofa-step-1');
    const step2 = document.getElementById('twofa-step-2');
    const step3 = document.getElementById('twofa-step-3');
    
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (step3) step3.style.display = 'none';
    
    // Reset step indicators
    const stepInd1 = document.getElementById('twofa-step-indicator-1');
    const stepInd2 = document.getElementById('twofa-step-indicator-2');
    const stepLine = document.getElementById('twofa-step-line');
    
    if (stepInd1) {
        stepInd1.classList.add('active');
        stepInd1.classList.remove('completed');
    }
    if (stepInd2) {
        stepInd2.classList.remove('active', 'completed');
    }
    if (stepLine) {
        stepLine.classList.remove('active');
    }
    
    // Clear code input
    const codeInput = document.getElementById('twofa-code-input');
    if (codeInput) codeInput.value = '';
    
    // Clear timer
    if (twofaData.resendTimer) {
        clearInterval(twofaData.resendTimer);
    }
    
    twofaData = {
        resendTimer: null,
        resendCountdown: 0,
        userEmail: ''
    };
}

async function send2FAVerificationCode() {
    const sendBtn = document.getElementById('send-twofa-code');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<span class="spinner-small"></span> Sending...';
    }
    
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/2fa/setup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            twofaData.userEmail = data.email;
            
            // Update email display
            const emailDisplay = document.getElementById('twofa-email-display');
            if (emailDisplay && data.email) {
                // Mask email for display
                const parts = data.email.split('@');
                const maskedEmail = parts[0].substring(0, 2) + '***@' + parts[1];
                emailDisplay.textContent = maskedEmail;
            }
            
            // Move to step 2
            goTo2FAStep2();
            showSuccess('Verification code sent to your email!');
        } else {
            showError(data.message || 'Failed to send verification code');
        }
        
    } catch (error) {
        console.error('Error sending 2FA code:', error);
        showError('Failed to send verification code. Please try again.');
    } finally {
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Send Code
            `;
        }
    }
}

function goTo2FAStep2() {
    // Hide step 1, show step 2
    const step1 = document.getElementById('twofa-step-1');
    const step2 = document.getElementById('twofa-step-2');
    
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    
    // Update step indicators
    const stepInd1 = document.getElementById('twofa-step-indicator-1');
    const stepInd2 = document.getElementById('twofa-step-indicator-2');
    const stepLine = document.getElementById('twofa-step-line');
    
    if (stepInd1) {
        stepInd1.classList.remove('active');
        stepInd1.classList.add('completed');
    }
    if (stepInd2) {
        stepInd2.classList.add('active');
    }
    if (stepLine) {
        stepLine.classList.add('active');
    }
    
    // Start resend timer
    start2FAResendTimer();
    
    // Focus code input
    const codeInput = document.getElementById('twofa-code-input');
    if (codeInput) codeInput.focus();
}

function goBack2FAStep1() {
    // Show step 1, hide step 2
    const step1 = document.getElementById('twofa-step-1');
    const step2 = document.getElementById('twofa-step-2');
    
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    
    // Reset step indicators
    const stepInd1 = document.getElementById('twofa-step-indicator-1');
    const stepInd2 = document.getElementById('twofa-step-indicator-2');
    const stepLine = document.getElementById('twofa-step-line');
    
    if (stepInd1) {
        stepInd1.classList.add('active');
        stepInd1.classList.remove('completed');
    }
    if (stepInd2) {
        stepInd2.classList.remove('active');
    }
    if (stepLine) {
        stepLine.classList.remove('active');
    }
    
    // Clear timer
    if (twofaData.resendTimer) {
        clearInterval(twofaData.resendTimer);
    }
}

function start2FAResendTimer() {
    twofaData.resendCountdown = 60;
    
    const timerEl = document.getElementById('twofa-resend-timer');
    const resendBtn = document.getElementById('twofa-resend-btn');
    
    if (timerEl) timerEl.style.display = 'inline';
    if (resendBtn) resendBtn.style.display = 'none';
    
    twofaData.resendTimer = setInterval(() => {
        twofaData.resendCountdown--;
        
        if (timerEl) {
            timerEl.innerHTML = `Resend code in <strong>${twofaData.resendCountdown}s</strong>`;
        }
        
        if (twofaData.resendCountdown <= 0) {
            clearInterval(twofaData.resendTimer);
            if (timerEl) timerEl.style.display = 'none';
            if (resendBtn) resendBtn.style.display = 'inline';
        }
    }, 1000);
}

async function resend2FACode() {
    await send2FAVerificationCode();
}

async function verify2FACode() {
    const codeInput = document.getElementById('twofa-code-input');
    const code = codeInput?.value || '';
    
    if (code.length !== 6) {
        showError('Please enter a valid 6-digit code');
        return;
    }
    
    const verifyBtn = document.getElementById('verify-twofa-code');
    if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<span class="spinner-small"></span> Verifying...';
    }
    
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/2fa/enable`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local settings
            if (window.currentSettings) {
                window.currentSettings.two_factor_enabled = true;
            }
            
            // Show success step
            const step2 = document.getElementById('twofa-step-2');
            const step3 = document.getElementById('twofa-step-3');
            const stepsContainer = document.getElementById('twofa-steps');
            
            if (step2) step2.style.display = 'none';
            if (step3) step3.style.display = 'block';
            if (stepsContainer) stepsContainer.style.display = 'none';
            
            showSuccess('Two-Factor Authentication enabled successfully!');
        } else {
            showError(data.message || 'Invalid verification code');
        }
        
    } catch (error) {
        console.error('Error verifying 2FA code:', error);
        showError('Verification failed. Please try again.');
    } finally {
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Enable 2FA
            `;
        }
    }
}

async function disable2FA(password) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/2fa/disable`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local settings
            if (window.currentSettings) {
                window.currentSettings.two_factor_enabled = false;
            }
            
            showSuccess('Two-Factor Authentication has been disabled');
        } else {
            showError(data.message || 'Failed to disable 2FA');
            // Revert toggle
            const toggle = document.getElementById('two_factor_enabled');
            if (toggle) toggle.checked = true;
        }
        
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        showError('Failed to disable 2FA. Please try again.');
        // Revert toggle
        const toggle = document.getElementById('two_factor_enabled');
        if (toggle) toggle.checked = true;
    }
}

// ============ PASSWORD CHANGE FUNCTIONALITY (2-Step Verification) ============

let passwordChangeData = {
    currentPassword: '',
    newPassword: '',
    userEmail: '',
    resendTimer: null,
    resendCountdown: 0
};

function setupPasswordModalListeners() {
    // Close modal buttons
    const closeBtn = document.getElementById('close-password-modal');
    const cancelBtn = document.getElementById('cancel-password-change');
    
    if (closeBtn) closeBtn.addEventListener('click', closeChangePasswordModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeChangePasswordModal);
    
    // Form submission - Step 1 (Send verification code)
    const form = document.getElementById('change-password-form');
    if (form) {
        form.addEventListener('submit', handleRequestVerificationCode);
    }
    
    // Toggle password visibility (new simpler version)
    const toggleBtns = document.querySelectorAll('.toggle-pwd');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                this.textContent = isPassword ? '🙈' : '👁️';
            }
        });
    });
    
    // Password strength indicator
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Password match indicator
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Close modal on outside click (modal background or overlay)
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                closeChangePasswordModal();
            }
        });
    }
    
    // Step 2: Back button
    const backBtn = document.getElementById('back-to-step1');
    if (backBtn) {
        backBtn.addEventListener('click', goBackToStep1);
    }
    
    // Step 2: Verify and change button
    const verifyBtn = document.getElementById('verify-and-change');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleVerifyAndChange);
    }
    
    // Step 2: Resend code button
    const resendBtn = document.getElementById('resend-code-btn');
    if (resendBtn) {
        resendBtn.addEventListener('click', handleResendCode);
    }
    
    // Setup code digit inputs
    setupCodeInput();
}

function setupCodeInput() {
    const codeInput = document.getElementById('verification-code-input');
    
    if (codeInput) {
        // Only allow numbers
        codeInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
        });
        
        // Handle paste
        codeInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
            this.value = pastedData;
        });
    }
}

function updateVerificationCode() {
    const codeDigits = document.querySelectorAll('.code-digit');
    const hiddenInput = document.getElementById('verification-code');
    
    let code = '';
    codeDigits.forEach(digit => {
        code += digit.value;
    });
    
    if (hiddenInput) {
        hiddenInput.value = code;
    }
}

function openChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'flex';
        resetPasswordModal();
    }
}

function resetPasswordModal() {
    // Reset to step 1
    const step1 = document.getElementById('pwd-step-1');
    const step2 = document.getElementById('pwd-step-2');
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    
    // Reset step indicators
    const stepInd1 = document.getElementById('step-indicator-1');
    const stepInd2 = document.getElementById('step-indicator-2');
    const stepLine = document.getElementById('step-line');
    
    if (stepInd1) {
        stepInd1.classList.add('active');
        stepInd1.classList.remove('completed');
    }
    if (stepInd2) {
        stepInd2.classList.remove('active', 'completed');
    }
    if (stepLine) {
        stepLine.classList.remove('active');
    }
    
    // Reset form
    const form = document.getElementById('change-password-form');
    if (form) form.reset();
    
    // Clear code input
    const codeInput = document.getElementById('verification-code-input');
    if (codeInput) {
        codeInput.value = '';
    }
    
    // Clear indicators
    const strengthEl = document.getElementById('password-strength');
    const matchEl = document.getElementById('password-match');
    if (strengthEl) {
        strengthEl.querySelectorAll('.str-bar').forEach(bar => {
            bar.className = 'str-bar';
        });
        const strengthText = strengthEl.querySelector('.str-text');
        if (strengthText) {
            strengthText.textContent = '';
            strengthText.className = 'str-text';
        }
    }
    if (matchEl) {
        matchEl.innerHTML = '';
        matchEl.classList.remove('match', 'no-match');
    }
    
    // Clear timer
    if (passwordChangeData.resendTimer) {
        clearInterval(passwordChangeData.resendTimer);
    }
    
    // Reset data
    passwordChangeData = {
        currentPassword: '',
        newPassword: '',
        userEmail: '',
        resendTimer: null,
        resendCountdown: 0
    };
}

function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.style.display = 'none';
        resetPasswordModal();
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('new-password')?.value || '';
    const strengthEl = document.getElementById('password-strength');
    
    if (!strengthEl) return;
    
    let strength = 0;
    const hasLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (hasLength) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && hasUpper) strength++;
    if (hasNumber) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    const strengthBars = strengthEl.querySelectorAll('.str-bar');
    const strengthText = strengthEl.querySelector('.str-text');
    
    if (password.length === 0) {
        strengthBars.forEach(bar => bar.className = 'str-bar');
        if (strengthText) {
            strengthText.textContent = '';
            strengthText.className = 'str-text';
        }
        return;
    }
    
    let strengthLabel = '';
    let strengthClass = '';
    let activeBars = 0;
    
    if (strength < 2) {
        strengthLabel = 'Weak';
        strengthClass = 'weak';
        activeBars = 1;
    } else if (strength < 4) {
        strengthLabel = 'Medium';
        strengthClass = 'medium';
        activeBars = 2;
    } else {
        strengthLabel = 'Strong';
        strengthClass = 'strong';
        activeBars = 4;
    }
    
    strengthBars.forEach((bar, i) => {
        if (i < activeBars) {
            bar.className = `str-bar active ${strengthClass}`;
        } else {
            bar.className = 'str-bar';
        }
    });
    
    if (strengthText) {
        strengthText.textContent = strengthLabel;
        strengthText.className = `str-text ${strengthClass}`;
    }
    
    // Also check password match if confirm field has value
    checkPasswordMatch();
}

function checkPasswordMatch() {
    const newPassword = document.getElementById('new-password')?.value || '';
    const confirmPassword = document.getElementById('confirm-password')?.value || '';
    const matchEl = document.getElementById('password-match');
    
    if (!matchEl || confirmPassword.length === 0) {
        if (matchEl) {
            matchEl.innerHTML = '';
            matchEl.classList.remove('match', 'no-match');
        }
        return;
    }
    
    if (newPassword === confirmPassword) {
        matchEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Passwords match
        `;
        matchEl.classList.add('match');
        matchEl.classList.remove('no-match');
    } else {
        matchEl.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Passwords do not match
        `;
        matchEl.classList.add('no-match');
        matchEl.classList.remove('match');
    }
}

async function handleRequestVerificationCode(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password')?.value;
    const newPassword = document.getElementById('new-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError('Please fill in all password fields');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('New password must be at least 6 characters');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }
    
    // Store for later use
    passwordChangeData.currentPassword = currentPassword;
    passwordChangeData.newPassword = newPassword;
    
    try {
        showLoading(true);
        const submitBtn = document.getElementById('submit-password-change');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }
        
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/auth/change-password/request-code`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || 'Failed to send verification code');
        }
        
        // Store email and go to step 2
        passwordChangeData.userEmail = result.email || 'your email';
        goToStep2();
        
        showSuccess('Verification code sent to your email!');
        
    } catch (error) {
        console.error('Error requesting verification code:', error);
        showError(error.message || 'Failed to send verification code');
    } finally {
        showLoading(false);
        const submitBtn = document.getElementById('submit-password-change');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Verification Code →';
        }
    }
}

function goToStep2() {
    // Update step indicators
    const stepInd1 = document.getElementById('step-indicator-1');
    const stepInd2 = document.getElementById('step-indicator-2');
    const stepLine = document.getElementById('step-line');
    
    if (stepInd1) {
        stepInd1.classList.remove('active');
        stepInd1.classList.add('completed');
    }
    if (stepInd2) {
        stepInd2.classList.add('active');
    }
    if (stepLine) {
        stepLine.classList.add('active');
    }
    
    // Show step 2, hide step 1
    const step1 = document.getElementById('pwd-step-1');
    const step2 = document.getElementById('pwd-step-2');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    
    // Update email display
    const emailDisplay = document.getElementById('user-email-display');
    if (emailDisplay && passwordChangeData.userEmail) {
        // Mask email for privacy
        const email = passwordChangeData.userEmail;
        const [localPart, domain] = email.split('@');
        const maskedLocal = localPart.length > 2 
            ? localPart[0] + '***' + localPart.slice(-1)
            : localPart[0] + '***';
        emailDisplay.textContent = maskedLocal + '@' + domain;
    }
    
    // Focus first code input
    const codeInput = document.getElementById('verification-code-input');
    if (codeInput) {
        setTimeout(() => codeInput.focus(), 300);
    }
    
    // Start resend countdown
    startResendCountdown();
}

function goBackToStep1() {
    // Update step indicators
    const stepInd1 = document.getElementById('step-indicator-1');
    const stepInd2 = document.getElementById('step-indicator-2');
    const stepLine = document.getElementById('step-line');
    
    if (stepInd1) {
        stepInd1.classList.add('active');
        stepInd1.classList.remove('completed');
    }
    if (stepInd2) {
        stepInd2.classList.remove('active');
    }
    if (stepLine) {
        stepLine.classList.remove('active');
    }
    
    // Show step 1, hide step 2
    const step1 = document.getElementById('pwd-step-1');
    const step2 = document.getElementById('pwd-step-2');
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    
    // Clear code input
    const codeInput = document.getElementById('verification-code-input');
    if (codeInput) {
        codeInput.value = '';
    }
    
    // Stop countdown
    if (passwordChangeData.resendTimer) {
        clearInterval(passwordChangeData.resendTimer);
    }
}

function startResendCountdown() {
    passwordChangeData.resendCountdown = 60;
    const timerEl = document.getElementById('resend-timer');
    const resendBtn = document.getElementById('resend-code-btn');
    
    if (timerEl) timerEl.style.display = 'inline';
    if (resendBtn) resendBtn.style.display = 'none';
    
    passwordChangeData.resendTimer = setInterval(() => {
        passwordChangeData.resendCountdown--;
        
        if (timerEl) {
            timerEl.innerHTML = `Resend code in <strong>${passwordChangeData.resendCountdown}s</strong>`;
        }
        
        if (passwordChangeData.resendCountdown <= 0) {
            clearInterval(passwordChangeData.resendTimer);
            if (timerEl) timerEl.style.display = 'none';
            if (resendBtn) resendBtn.style.display = 'inline-flex';
        }
    }, 1000);
}

async function handleResendCode() {
    try {
        const resendBtn = document.getElementById('resend-code-btn');
        if (resendBtn) {
            resendBtn.disabled = true;
        }
        
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/auth/change-password/request-code`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: passwordChangeData.currentPassword,
                new_password: passwordChangeData.newPassword
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || 'Failed to resend code');
        }
        
        // Clear old code
        const codeInput = document.getElementById('verification-code-input');
        if (codeInput) {
            codeInput.value = '';
        }
        
        showSuccess('New verification code sent!');
        startResendCountdown();
        
    } catch (error) {
        console.error('Error resending code:', error);
        showError(error.message || 'Failed to resend code');
    } finally {
        const resendBtn = document.getElementById('resend-code-btn');
        if (resendBtn) {
            resendBtn.disabled = false;
        }
    }
}

async function handleVerifyAndChange() {
    const codeInput = document.getElementById('verification-code-input');
    const code = codeInput?.value;
    
    if (!code || code.length !== 6) {
        // Show error on code input
        if (codeInput) {
            codeInput.style.borderColor = '#ef4444';
            codeInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
            setTimeout(() => {
                codeInput.style.borderColor = '#d1d5db';
                codeInput.style.boxShadow = 'none';
            }, 2000);
        }
        showError('Please enter the 6-digit verification code');
        return;
    }
    
    try {
        showLoading(true);
        const verifyBtn = document.getElementById('verify-and-change');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.textContent = 'Verifying...';
        }
        
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/auth/change-password/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: passwordChangeData.currentPassword,
                new_password: passwordChangeData.newPassword,
                code: code
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || 'Invalid verification code');
        }
        
        showSuccess('🎉 Password changed successfully!');
        closeChangePasswordModal();
        
    } catch (error) {
        console.error('Error verifying code:', error);
        // Show error on code input
        const codeInput = document.getElementById('verification-code-input');
        if (codeInput) {
            codeInput.style.borderColor = '#ef4444';
            codeInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
        }
        showError(error.message || 'Failed to verify code');
    } finally {
        showLoading(false);
        const verifyBtn = document.getElementById('verify-and-change');
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.textContent = '✓ Verify & Change Password';
        }
        // Remove error styling after delay
        setTimeout(() => {
            const codeInput = document.getElementById('verification-code-input');
            if (codeInput) {
                codeInput.style.borderColor = '#d1d5db';
                codeInput.style.boxShadow = 'none';
            }
        }, 2000);
    }
}

// ============ DELETE ACCOUNT FUNCTIONALITY ============

function setupDeleteAccountModalListeners() {
    const closeBtn = document.getElementById('close-delete-modal');
    const cancelBtn = document.getElementById('cancel-delete-account');
    const confirmBtn = document.getElementById('confirm-delete-account');
    const confirmText = document.getElementById('delete-confirm-text');
    
    if (closeBtn) closeBtn.addEventListener('click', closeDeleteAccountModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteAccountModal);
    
    // Enable delete button only when DELETE is typed
    if (confirmText) {
        confirmText.addEventListener('input', function() {
            if (confirmBtn) {
                confirmBtn.disabled = this.value !== 'DELETE';
            }
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleDeleteAccount);
    }
    
    // Close modal on outside click
    const modal = document.getElementById('delete-account-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDeleteAccountModal();
            }
        });
    }
}

function openDeleteAccountModal() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset fields
        const passwordField = document.getElementById('delete-confirm-password');
        const textField = document.getElementById('delete-confirm-text');
        const confirmBtn = document.getElementById('confirm-delete-account');
        if (passwordField) passwordField.value = '';
        if (textField) textField.value = '';
        if (confirmBtn) confirmBtn.disabled = true;
    }
}

function closeDeleteAccountModal() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function handleDeleteAccount() {
    const password = document.getElementById('delete-confirm-password')?.value;
    const confirmText = document.getElementById('delete-confirm-text')?.value;
    
    if (!password) {
        showError('Please enter your password');
        return;
    }
    
    if (confirmText !== 'DELETE') {
        showError('Please type DELETE to confirm');
        return;
    }
    
    try {
        const confirmBtn = document.getElementById('confirm-delete-account');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Deleting...';
        }
        
        const token = localStorage.getItem('access_token');
        
        // Call the account deletion endpoint with password verification
        const deleteResponse = await fetch(`${API_BASE_URL}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: password
            })
        });
        
        if (!deleteResponse.ok) {
            const error = await deleteResponse.json();
            throw new Error(error.detail || 'Failed to delete account');
        }
        
        showSuccess('Account deleted successfully. All your data has been permanently removed. Redirecting...');
        closeDeleteAccountModal();
        
        // Clear local storage and redirect to login
        setTimeout(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/cocoguard_web/index.html';
        }, 2500);
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showError(error.message || 'Failed to delete account');
    } finally {
        const confirmBtn = document.getElementById('confirm-delete-account');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Delete My Account';
        }
    }
}

// ============ DATA EXPORT FUNCTIONALITY ============

async function exportUserData() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('access_token');
        
        // Fetch user data
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userResponse.json();
        
        // Fetch settings
        const settingsResponse = await fetch(`${API_BASE_URL}/settings/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const settingsData = await settingsResponse.json();
        
        // Try to fetch scans (may fail if not available)
        let scansData = [];
        try {
            const scansResponse = await fetch(`${API_BASE_URL}/scans/me?limit=1000`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (scansResponse.ok) {
                const scans = await scansResponse.json();
                scansData = scans.scans || [];
            }
        } catch (e) {
            console.log('Could not fetch scans:', e);
        }
        
        // Compile export data
        const exportData = {
            exportDate: new Date().toISOString(),
            profile: userData,
            settings: settingsData,
            scans: scansData
        };
        
        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cocoguard_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('Data exported successfully!');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showError('Failed to export data. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ============ LOGOUT ALL DEVICES ============

async function logoutAllDevices() {
    if (!confirm('This will sign you out from all devices, including this one. Continue?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const token = localStorage.getItem('access_token');
        
        // Call backend to invalidate sessions
        if (token) {
            try {
                await fetch(`${API_BASE_URL}/auth/logout-all`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (e) {
                console.log('Backend logout-all call failed (non-critical):', e);
            }
        }
        
        // Clear all local storage
        localStorage.clear();
        sessionStorage.clear();
        
        showSuccess('Signed out from all devices. Redirecting...');
        
        setTimeout(() => {
            window.location.href = '/cocoguard_web/index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error logging out:', error);
        showError('Failed to sign out. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ============ SAVE/RESET SETTINGS ============

// Save all settings
async function saveSettings() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '../index.html';
            return;
        }

        // Gather all settings from form
        const updatedSettings = {
            email_notifications: document.getElementById('email_notifications')?.checked || false,
            sms_notifications: document.getElementById('sms_notifications')?.checked || false,
            push_notifications: document.getElementById('push_notifications')?.checked || false,
            two_factor_enabled: document.getElementById('two_factor_enabled')?.checked || false,
            auto_backup: document.getElementById('auto_backup')?.checked || false,
            data_sharing: document.getElementById('data_sharing')?.checked || false,
            profile_visible: document.getElementById('profile_visible')?.checked || false,
            language: document.getElementById('language')?.value || 'en',
            theme: document.getElementById('theme')?.value || 'light'
        };

        console.log('💾 Saving settings:', updatedSettings);

        const response = await fetch(`${API_BASE_URL}/settings/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedSettings)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✓ Settings saved:', result);
        
        window.currentSettings = result;
        
        // Apply theme after save
        applyTheme(updatedSettings.theme);
        
        showSuccess('Settings saved successfully!');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showError('Failed to save settings. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Reset settings to defaults
async function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '../index.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/settings/reset`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✓ Settings reset:', result);
        
        window.currentSettings = result;
        populateSettings(result);
        
        // Apply default theme
        applyTheme('light');
        
        showSuccess('Settings reset to defaults!');
        
    } catch (error) {
        console.error('Error resetting settings:', error);
        showError('Failed to reset settings. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ============ UI HELPER FUNCTIONS ============

function showLoading(show) {
    const loadingOverlay = document.getElementById('settings-loading');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    // Also show password modal loading if it exists
    const pwdLoading = document.getElementById('pwd-loading');
    if (pwdLoading) {
        pwdLoading.style.display = show ? 'flex' : 'none';
    }
    
    // Disable buttons while loading
    const buttons = document.querySelectorAll('.settings-actions button');
    buttons.forEach(btn => {
        btn.disabled = show;
    });
}

function showSuccess(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============ BACKUP MANAGEMENT FUNCTIONALITY ============

function setupBackupManagement() {
    const createBackupBtn = document.getElementById('create-backup-btn');
    const refreshBackupsBtn = document.getElementById('refresh-backups-btn');
    
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', createBackup);
    }
    
    if (refreshBackupsBtn) {
        refreshBackupsBtn.addEventListener('click', loadBackups);
    }
    
    // Load backups on init
    loadBackups();
}

async function loadBackups() {
    const backupList = document.getElementById('backup-list');
    const token = localStorage.getItem('access_token');
    
    if (!token || !backupList) return;
    
    try {
        backupList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">Loading backups...</div>';
        
        // Load backup stats
        const statsResponse = await fetch(`${API_BASE_URL}/backup/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('stat-total-backups').textContent = stats.total_backups;
            document.getElementById('stat-storage').textContent = stats.total_size_readable;
            document.getElementById('stat-last-backup').textContent = stats.last_auto_backup 
                ? formatDate(stats.last_auto_backup) 
                : 'Never';
        }
        
        // Load backup list
        const response = await fetch(`${API_BASE_URL}/backup/list`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load backups');
        }
        
        const data = await response.json();
        
        if (data.backups && data.backups.length > 0) {
            backupList.innerHTML = data.backups.map(backup => `
                <div class="backup-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid var(--border-color);">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; color: var(--text-primary);">
                            ${backup.type === 'automatic' ? '🔄' : '📦'} ${backup.filename}
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                            ${formatDate(backup.created_at)} • ${backup.size_readable} • ${backup.files_count} files
                            ${backup.description ? `• ${backup.description}` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-secondary" onclick="downloadBackup('${backup.filename}')" title="Download">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBackup('${backup.filename}')" title="Delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            backupList.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 10px; opacity: 0.5;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                    </svg>
                    <p style="margin: 0;">No backups yet</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px;">Click "Create Backup" to create your first backup</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading backups:', error);
        backupList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #dc2626;">
                Failed to load backups. Please try again.
            </div>
        `;
    }
}

async function createBackup() {
    const createBackupBtn = document.getElementById('create-backup-btn');
    const token = localStorage.getItem('access_token');
    
    if (!token) return;
    
    try {
        createBackupBtn.disabled = true;
        createBackupBtn.innerHTML = `
            <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
            </svg>
            Creating...
        `;
        
        const response = await fetch(`${API_BASE_URL}/backup/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                include_database: true,
                include_uploads: true,
                description: 'Manual backup from admin panel'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create backup');
        }
        
        const backup = await response.json();
        showSuccess(`Backup created successfully: ${backup.size_readable}`);
        
        // Reload backup list
        await loadBackups();
        
    } catch (error) {
        console.error('Error creating backup:', error);
        showError('Failed to create backup. Please try again.');
    } finally {
        createBackupBtn.disabled = false;
        createBackupBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Create Backup
        `;
    }
}

// Make functions globally accessible for onclick handlers
window.downloadBackup = async function(filename) {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/backup/download/${filename}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to download backup');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        showSuccess('Backup download started');
    } catch (error) {
        console.error('Error downloading backup:', error);
        showError('Failed to download backup');
    }
};

window.deleteBackup = async function(filename) {
    if (!confirm(`Are you sure you want to delete backup "${filename}"? This cannot be undone.`)) {
        return;
    }
    
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/backup/${filename}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete backup');
        }
        
        showSuccess('Backup deleted successfully');
        await loadBackups();
    } catch (error) {
        console.error('Error deleting backup:', error);
        showError('Failed to delete backup');
    }
};

function formatDate(isoString) {
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return isoString;
    }
}

// Add spin animation for loading states
const backupStyles = document.createElement('style');
backupStyles.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
    .btn-sm {
        padding: 6px 10px;
        font-size: 12px;
        border-radius: 6px;
    }
    .backup-item:last-child {
        border-bottom: none;
    }
    .backup-item:hover {
        background: var(--bg-hover, rgba(0,0,0,0.02));
    }
    .stat-item {
        text-align: center;
    }
    .stat-label {
        display: block;
        font-size: 11px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .stat-value {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
        margin-top: 4px;
    }
`;
document.head.appendChild(backupStyles);

// Export for use in main script
window.settingsModule = {
    init: initSettings,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    resetSettings: resetSettings,
    applyTheme: applyTheme
};

console.log('✓ settingsModule exported v2.0');

})(); // End IIFE

