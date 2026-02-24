// API Client is initialized in api-client.js as a global variable
// No need to re-declare it here

// Global XSS sanitization utility
window.escapeHtml = function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Page modules configuration
const pageModules = {
    'dashboard': {
        html: 'pages/dashboard.html',
        css: 'pages/dashboard.css',
        js: 'pages/dashboard.js?v=2',
        title: 'Dashboard Overview'
    },
    'scan': {
        html: 'pages/scan.html',
        css: 'pages/scan.css',
        js: 'pages/scan.js?v=2',
        title: 'Scan History'
    },
    'pest-management': {
        html: 'pages/pest-management.html',
        css: 'pages/pest-management.css',
        js: 'pages/pest-management.js?v=2',
        title: 'Pest Type Management'
    },
    'feedback': {
        html: 'pages/feedback.html',
        css: 'pages/feedback.css',
        js: 'pages/feedback.js?v=2',
        title: 'User Feedback & Reports'
    },
    'knowledge': {
        html: 'pages/knowledge.html',
        css: 'pages/knowledge.css',
        js: 'pages/knowledge.js?v=2',
        title: 'Knowledge Base'
    },
    'users': {
        html: 'pages/users.html',
        css: 'pages/users.css',
        js: 'pages/users.js?v=2',
        title: 'User Management'
    },
    'notifications': {
        html: 'pages/notifications.html?v=' + Date.now(),
        css: 'pages/notifications.css?v=' + Date.now(),
        js: 'pages/notifications.js?v=' + Date.now(),
        title: 'Pest Alert Notifications'
    },
    'settings': {
        html: 'pages/settings.html?v=' + Date.now(),
        css: 'pages/settings.css?v=' + Date.now(),
        js: 'pages/settings.js?v=' + Date.now(),
        title: 'Settings'
    }
};
// ...existing code...
console.log('✓ Main script loaded!');

// Apply saved theme immediately on load
(function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    let effectiveTheme = savedTheme;
    
    if (savedTheme === 'auto') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.body.classList.add(`theme-${effectiveTheme}`);
    console.log('🎨 Applied saved theme:', savedTheme, '(effective:', effectiveTheme + ')');
})();

// Apply saved language immediately on load
(function applySavedLanguage() {
    const savedLang = localStorage.getItem('app_language') || 'en';
    if (window.Translator) {
        window.Translator.setLang(savedLang);
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ DOM Content Loaded');

// Check if returning from Google OAuth callback (fallback for when popup auto-closed)
const pendingGoogleResult = localStorage.getItem('google_oauth_result');
if (pendingGoogleResult) {
    localStorage.removeItem('google_oauth_result');
}

// Page modules configuration
const pageModules = {
    'dashboard': {
        html: 'pages/dashboard.html?v=' + Date.now(),
        css: 'pages/dashboard.css?v=' + Date.now(),
        js: 'pages/dashboard.js?v=' + Date.now(),
        title: 'Dashboard Overview'
    },
    'scan': {
        html: 'pages/scan.html',
        css: 'pages/scan.css',
        js: 'pages/scan.js?v=' + Date.now(),
        title: 'Scan History'
    },
    'pest-management': {
        html: 'pages/pest-management.html',
        css: 'pages/pest-management.css',
        js: 'pages/pest-management.js?v=' + Date.now(),
        title: 'Pest Type Management'
    },
    'feedback': {
        html: 'pages/feedback.html',
        css: 'pages/feedback.css',
        js: 'pages/feedback.js?v=' + Date.now(),
        title: 'User Feedback & Reports'
    },
    'knowledge': {
        html: 'pages/knowledge.html',
        css: 'pages/knowledge.css',
        js: 'pages/knowledge.js?v=' + Date.now(),
        title: 'Knowledge Base'
    },
    'users': {
        html: 'pages/users.html',
        css: 'pages/users.css',
        js: 'pages/users.js?v=' + Date.now(),
        title: 'User Management'
    },
    'notifications': {
        html: 'pages/notifications.html?v=' + Date.now(),
        css: 'pages/notifications.css?v=' + Date.now(),
        js: 'pages/notifications.js?v=' + Date.now(),
        title: 'Pest Alerts'
    },
    'settings': {
        html: 'pages/settings.html?v=' + Date.now(),
        css: 'pages/settings.css?v=' + Date.now(),
        js: 'pages/settings.js?v=' + Date.now(),
        title: 'Settings'
    }
};

const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const loginPage = document.getElementById('loginPage');
const mainDashboard = document.getElementById('mainDashboard');
const pageContainer = document.getElementById('pageContainer');
const pageTitle = document.getElementById('pageTitle');


console.log('✓ Elements found:');
console.log('  loginBtn:', !!loginBtn);
console.log('  pageContainer:', !!pageContainer);
console.log('  pageTitle:', !!pageTitle);

// Load page dynamically using XMLHttpRequest (works with file:// protocol)
function loadPage(pageName) {
    try {
        const module = pageModules[pageName];
        if (!module) {
            console.error('❌ Module not found:', pageName);
            return;
        }

        console.log('⏳ Loading page:', pageName);

        // Load HTML using XMLHttpRequest (works with file:// protocol)
        const xhr = new XMLHttpRequest();
        xhr.open('GET', module.html, true);
        xhr.onload = function() {
            if (xhr.status === 0 || xhr.status === 200) {
                pageContainer.innerHTML = xhr.responseText;
                console.log('✓ HTML loaded:', module.html);

                // Load CSS dynamically
                if (module.css) {
                    const cssId = `css-${pageName}`;
                    const existingLink = document.getElementById(cssId);
                    if (existingLink) {
                        existingLink.remove();
                    }
                    
                    const link = document.createElement('link');
                    link.id = cssId;
                    link.rel = 'stylesheet';
                    // Check if version is already in the string (from pageModules config)
                    if (module.css.includes('?v=')) {
                        link.href = module.css;
                    } else {
                        link.href = `${module.css}?v=${new Date().getTime()}`;
                    }
                    document.head.appendChild(link);
                    console.log('✓ CSS loaded:', module.css);
                }

                // Convert page name to camelCase for module name lookup
                // e.g., 'pest-management' -> 'pestManagementModule'
                const camelCaseName = pageName.split('-').map((word, index) => {
                    if (index === 0) return word;
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join('');
                const moduleVarName = camelCaseName + 'Module';
                console.log('🔍 Looking for module:', moduleVarName);
                console.log('✓ Available modules:', Object.keys(window).filter(k => k.includes('Module')));

                // Always call module init after HTML is loaded
                const reinitModule = () => {
                    const moduleInitFunc = window[moduleVarName];
                    if (moduleInitFunc && moduleInitFunc.init) {
                        console.log('✓ (Re)Initializing module:', moduleVarName);
                        try {
                            moduleInitFunc.init();
                            console.log('✅ Module initialized successfully');
                        } catch (err) {
                            console.error('❌ Error during module init:', err);
                        }
                    } else {
                        console.warn('❌ Module not found or missing init:', moduleVarName);
                        console.warn('🔍 Available window properties:', Object.keys(window).filter(k => k.includes('module')));
                    }
                    // Apply translations to newly loaded page content
                    if (window.Translator) {
                        window.Translator.applyTranslations();
                    }
                };

                const existingScript = document.getElementById(`js-${pageName}`);
                if (existingScript) {
                    existingScript.remove(); // Always remove old script to force reload
                }

                const script = document.createElement('script');
                script.id = `js-${pageName}`;
                // Add timestamp to prevent caching during development
                script.src = `${module.js}?v=${new Date().getTime()}`;
                script.onload = () => {
                    console.log('✓ Script loaded:', module.js);
                    setTimeout(reinitModule, 100);
                };
                script.onerror = () => {
                    console.error('❌ Failed to load script:', module.js);
                };
                document.body.appendChild(script);

                // Update page title (use translated version if available)
                if (window.Translator) {
                    const titleKey = 'page.' + pageName.replace(/-/g, '_');
                    const translated = window.Translator.t(titleKey);
                    pageTitle.textContent = (translated !== titleKey) ? translated : module.title;
                } else {
                    pageTitle.textContent = module.title;
                }
            } else {
                throw new Error(`Failed to load ${module.html}: ${xhr.status}`);
            }
        };
        
        xhr.onerror = function() {
            console.error('❌ Error loading page:', xhr.status);
            pageContainer.innerHTML = `<div class="table-card"><h3>Error loading page: ${xhr.status}</h3></div>`;
        };
        
        xhr.send();
    } catch (error) {
        console.error('❌ Error loading page:', error);
        pageContainer.innerHTML = `<div class="table-card"><h3>Error loading page: ${error.message}</h3></div>`;
    }
}

// Login function
async function handleLogin() {
    console.log('Login button clicked!');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        const response = await apiClient.login(username, password);
        
        // Handle 2FA challenge
        if (response.requires_2fa) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
            alert('Two-factor authentication is required. Please use the mobile app to complete login, or contact your administrator.');
            return;
        }
        
        console.log('Login successful!');
        
        // Store user data for header display
        if (response.user) {
            localStorage.setItem('user_data', JSON.stringify(response.user));
        }
        
        loginPage.classList.add('hidden');
        mainDashboard.classList.remove('hidden');
        
        // Update header user profile with logged-in user info
        updateUserProfileHeader();
        
        // Apply translations to dashboard sidebar/header
        if (window.Translator) {
            window.Translator.applyTranslations();
        }
        
        // Load dashboard on login
        loadPage('dashboard');
        
        // Check for pest alerts and update badge
        setTimeout(() => {
            if (typeof checkForNewAlerts === 'function') {
                checkForNewAlerts();
            }
            // Fetch pest alerts to update badge count
            fetchAndUpdateAlertBadge();
        }, 1000);
    } catch (error) {
        console.error('Login failed:', error);
        
        // Show alert with appropriate error message
        let errorMessage = 'Invalid username or password. Please try again.';
        
        if (error.message.includes('credentials')) {
            errorMessage = 'Invalid username or password!\n\nPlease check your credentials and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error!\n\nPlease check your connection and try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        alert(errorMessage);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Add click event
if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
    console.log('✓ Login button event listener added!');
} else {
    console.error('❌ Login button not found!');
}

// Add Enter key support for login form
if (usernameInput && passwordInput) {
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    console.log('✓ Enter key support added for login form!');
}

// Forgot Password Link Handler
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLoginLink = document.getElementById('backToLoginLink');
const resetLinkBtn = document.getElementById('resetLinkBtn');
const forgotEmailInput = document.getElementById('forgotEmailInput');
const forgotError = document.getElementById('forgotError');
const forgotSuccess = document.getElementById('forgotSuccess');
const loginForm = document.getElementById('loginForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Password Reset Flow State
let resetEmail = '';
let resetCode = '';

// Step elements
const step1Email = document.getElementById('step1-email');
const step2Code = document.getElementById('step2-code');
const step3Password = document.getElementById('step3-password');
const step4Success = document.getElementById('step4-success');

// Step 2 elements
const sentToEmail = document.getElementById('sentToEmail');
const verificationCodeInput = document.getElementById('verificationCodeInput');
const verifyCodeBtn = document.getElementById('verifyCodeBtn');
const resendCodeLink = document.getElementById('resendCodeLink');
const backToStep1 = document.getElementById('backToStep1');
const codeError = document.getElementById('codeError');
const codeSuccess = document.getElementById('codeSuccess');

// Step 3 elements
const newPasswordInput = document.getElementById('newPasswordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const passwordError = document.getElementById('passwordError');
const passwordSuccess = document.getElementById('passwordSuccess');

// Step 4 elements
const goToLoginBtn = document.getElementById('goToLoginBtn');

// Helper function to show a step
function showPasswordResetStep(stepNumber) {
    [step1Email, step2Code, step3Password, step4Success].forEach(step => {
        if (step) step.classList.add('hidden');
    });
    
    switch(stepNumber) {
        case 1:
            if (step1Email) step1Email.classList.remove('hidden');
            break;
        case 2:
            if (step2Code) step2Code.classList.remove('hidden');
            break;
        case 3:
            if (step3Password) step3Password.classList.remove('hidden');
            break;
        case 4:
            if (step4Success) step4Success.classList.remove('hidden');
            break;
    }
}

// Clear all error/success messages
function clearPasswordResetMessages() {
    [forgotError, forgotSuccess, codeError, codeSuccess, passwordError, passwordSuccess].forEach(el => {
        if (el) {
            el.textContent = '';
            el.classList.remove('show');
        }
    });
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔑 Forgot Password link clicked');
        // Hide all forms, show forgot password
        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.classList.add('hidden');
        loginForm.classList.add('hidden');
        forgotPasswordForm.classList.remove('hidden');
        clearPasswordResetMessages();
        showPasswordResetStep(1);
        if (forgotEmailInput) forgotEmailInput.value = '';
        resetEmail = '';
        resetCode = '';
    });
    console.log('✓ Forgot Password link event listener added!');
}

if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('← Back to Login clicked');
        forgotPasswordForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.classList.add('hidden');
        clearPasswordResetMessages();
        showPasswordResetStep(1);
    });
    console.log('✓ Back to Login link event listener added!');
}

// Step 1: Send verification code
if (resetLinkBtn) {
    resetLinkBtn.addEventListener('click', async () => {
        const email = forgotEmailInput.value.trim();
        console.log('Send Verification Code clicked for:', email);
        
        if (!email) {
            forgotError.textContent = '❌ Please enter your email address';
            forgotError.classList.add('show');
            return;
        }
        
        if (!isValidEmail(email)) {
            forgotError.textContent = '❌ Please enter a valid email address';
            forgotError.classList.add('show');
            return;
        }
        
        // Disable button and show loading
        resetLinkBtn.disabled = true;
        resetLinkBtn.textContent = 'Sending...';
        forgotError.textContent = '';
        
        try {
            const response = await apiClient.requestPasswordReset(email);
            
            if (response.success) {
                resetEmail = email;
                forgotSuccess.textContent = '✅ ' + response.message;
                forgotSuccess.classList.add('show');
                
                // Move to step 2 after short delay
                setTimeout(() => {
                    clearPasswordResetMessages();
                    if (sentToEmail) sentToEmail.textContent = email;
                    showPasswordResetStep(2);
                    if (verificationCodeInput) verificationCodeInput.focus();
                }, 1500);
            } else {
                forgotError.textContent = '❌ ' + (response.message || 'Failed to send code');
                forgotError.classList.add('show');
            }
        } catch (error) {
            console.error('Error sending reset code:', error);
            forgotError.textContent = '❌ ' + (error.message || 'Failed to send verification code');
            forgotError.classList.add('show');
        } finally {
            resetLinkBtn.disabled = false;
            resetLinkBtn.textContent = 'Send Verification Code';
        }
    });
    console.log('✓ Reset Link button event listener added!');
}

// Step 2: Verify code
if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', async () => {
        const code = verificationCodeInput.value.trim();
        console.log('Verify Code clicked:', code);
        
        if (!code || code.length !== 6) {
            codeError.textContent = '❌ Please enter the 6-digit verification code';
            codeError.classList.add('show');
            return;
        }
        
        verifyCodeBtn.disabled = true;
        verifyCodeBtn.textContent = 'Verifying...';
        codeError.textContent = '';
        
        try {
            const response = await apiClient.verifyResetCode(resetEmail, code);
            
            if (response.success) {
                resetCode = code;
                codeSuccess.textContent = '✅ ' + response.message;
                codeSuccess.classList.add('show');
                
                // Move to step 3 after short delay
                setTimeout(() => {
                    clearPasswordResetMessages();
                    showPasswordResetStep(3);
                    if (newPasswordInput) newPasswordInput.focus();
                }, 1000);
            } else {
                codeError.textContent = '❌ ' + (response.message || 'Invalid code');
                codeError.classList.add('show');
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            codeError.textContent = '❌ ' + (error.message || 'Failed to verify code');
            codeError.classList.add('show');
        } finally {
            verifyCodeBtn.disabled = false;
            verifyCodeBtn.textContent = 'Verify Code';
        }
    });
}

// Step 2: Resend code
if (resendCodeLink) {
    resendCodeLink.addEventListener('click', async () => {
        console.log('Resend code clicked');
        
        resendCodeLink.textContent = 'Sending...';
        resendCodeLink.style.pointerEvents = 'none';
        
        try {
            const response = await apiClient.resendResetCode(resetEmail);
            
            if (response.success) {
                codeSuccess.textContent = '✅ New code sent to your email';
                codeSuccess.classList.add('show');
                if (verificationCodeInput) verificationCodeInput.value = '';
            } else {
                codeError.textContent = '❌ ' + (response.message || 'Failed to resend code');
                codeError.classList.add('show');
            }
        } catch (error) {
            codeError.textContent = '❌ Failed to resend code';
            codeError.classList.add('show');
        } finally {
            resendCodeLink.textContent = 'Resend Code';
            resendCodeLink.style.pointerEvents = 'auto';
        }
    });
}

// Step 2: Back to step 1
if (backToStep1) {
    backToStep1.addEventListener('click', () => {
        clearPasswordResetMessages();
        showPasswordResetStep(1);
    });
}

// Step 3: Reset password
if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', async () => {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        console.log('Reset Password clicked');
        
        if (!newPassword || newPassword.length < 6) {
            passwordError.textContent = '❌ Password must be at least 6 characters';
            passwordError.classList.add('show');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            passwordError.textContent = '❌ Passwords do not match';
            passwordError.classList.add('show');
            return;
        }
        
        resetPasswordBtn.disabled = true;
        resetPasswordBtn.textContent = 'Resetting...';
        passwordError.textContent = '';
        
        try {
            const response = await apiClient.confirmPasswordReset(resetEmail, resetCode, newPassword);
            
            if (response.success) {
                passwordSuccess.textContent = '✅ ' + response.message;
                passwordSuccess.classList.add('show');
                
                // Move to success step
                setTimeout(() => {
                    clearPasswordResetMessages();
                    showPasswordResetStep(4);
                }, 1000);
            } else {
                passwordError.textContent = '❌ ' + (response.message || 'Failed to reset password');
                passwordError.classList.add('show');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            passwordError.textContent = '❌ ' + (error.message || 'Failed to reset password');
            passwordError.classList.add('show');
        } finally {
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.textContent = 'Reset Password';
        }
    });
}

// Step 4: Go back to login
if (goToLoginBtn) {
    goToLoginBtn.addEventListener('click', () => {
        forgotPasswordForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        showPasswordResetStep(1);
        // Clear inputs
        if (forgotEmailInput) forgotEmailInput.value = '';
        if (verificationCodeInput) verificationCodeInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
        resetEmail = '';
        resetCode = '';
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add password visibility toggle for login form
const passwordIcon = document.querySelector('.input-icon');
if (passwordIcon) {
    passwordIcon.addEventListener('click', () => {
        const input = passwordIcon.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            passwordIcon.textContent = '👁️‍🗨️';
            console.log('Password visible');
        } else {
            input.type = 'password';
            passwordIcon.textContent = '👁️';
            console.log('Password hidden');
        }
    });
    console.log('✓ Password toggle event listener added!');
}

// Add password visibility toggle for password reset form
document.querySelectorAll('.toggle-pass-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input && input.type === 'password') {
            input.type = 'text';
            icon.textContent = '👁️‍🗨️';
        } else if (input) {
            input.type = 'password';
            icon.textContent = '👁️';
        }
    });
});

// Add enter key support for password reset forms
if (verificationCodeInput) {
    verificationCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && verifyCodeBtn) {
            verifyCodeBtn.click();
        }
    });
}

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && resetPasswordBtn) {
            resetPasswordBtn.click();
        }
    });
}

// Add enter key support for login
if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed on password');
            handleLogin();
        }
    });
}

if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed on username');
            handleLogin();
        }
    });
}

// Add enter key support for forgot email
if (forgotEmailInput) {
    forgotEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed on forgot email');
            resetLinkBtn.click();
        }
    });
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchIcon = document.querySelector('.search-icon');

if (searchIcon) {
    searchIcon.addEventListener('click', () => {
        console.log('🔍 Search icon clicked');
        searchInput.focus();
        searchInput.select();
    });
    console.log('✓ Search icon click handler added!');
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        console.log('🔍 Searching for:', searchTerm);
        
        // Get all table rows in the current page
        const tables = document.querySelectorAll('table tbody tr');
        let foundCount = 0;
        let hiddenCount = 0;
        
        if (tables.length === 0) {
            console.log('No tables found on current page');
            return;
        }
        
        tables.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (searchTerm === '' || text.includes(searchTerm)) {
                row.style.display = '';
                foundCount++;
            } else {
                row.style.display = 'none';
                hiddenCount++;
            }
        });
        
        console.log(`✓ Search results: ${foundCount} visible, ${hiddenCount} hidden`);
    });
    
    // Clear search on escape key
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            // Trigger input event to show all rows
            searchInput.dispatchEvent(new Event('input'));
        }
    });
    
    console.log('✓ Search functionality enabled!');
} else {
    console.error('❌ Search input not found!');
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        console.log('🚪 Logout clicked');
        mainDashboard.classList.add('hidden');
        loginPage.classList.remove('hidden');
        usernameInput.value = '';
        passwordInput.value = '';
        pageContainer.innerHTML = '';
        // Clear auth-related localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_provider');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_data');
        // Reset settings module flag so it reinitializes on next login
        window.settingsModuleLoaded = false;
    });
}

// ====================================================
// USER PROFILE DROPDOWN
// ====================================================

function updateUserProfileHeader() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const fullName = userData.full_name || userData.username || 'Admin';
    const email = userData.email || '';
    const initial = fullName.charAt(0).toUpperCase();

    // Header elements
    const userAvatarInitial = document.getElementById('userAvatarInitial');
    const userDisplayName = document.getElementById('userDisplayName');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownName = document.getElementById('dropdownName');
    const dropdownEmail = document.getElementById('dropdownEmail');

    if (userAvatarInitial) userAvatarInitial.textContent = initial;
    if (userDisplayName) userDisplayName.textContent = fullName;
    if (dropdownAvatar) dropdownAvatar.textContent = initial;
    if (dropdownName) dropdownName.textContent = fullName;
    if (dropdownEmail) dropdownEmail.textContent = email;
}

// Dropdown toggle
const userProfileBtn = document.getElementById('userProfileBtn');
const userDropdown = document.getElementById('userDropdown');

if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = userDropdown.classList.contains('show');
        userDropdown.classList.toggle('show');
        userProfileBtn.classList.toggle('active');
        if (!isOpen) {
            // Close on outside click
            setTimeout(() => {
                document.addEventListener('click', closeDropdown);
            }, 0);
        }
    });

    function closeDropdown() {
        userDropdown.classList.remove('show');
        userProfileBtn.classList.remove('active');
        document.removeEventListener('click', closeDropdown);
    }

    // Dropdown Settings click
    const dropdownSettings = document.getElementById('dropdownSettings');
    if (dropdownSettings) {
        dropdownSettings.addEventListener('click', (e) => {
            e.preventDefault();
            closeDropdown();
            // Navigate to settings page
            const navLinks = document.querySelectorAll('.nav-link[data-page]');
            navLinks.forEach(l => l.classList.remove('active'));
            const settingsNavLink = document.querySelector('.nav-link[data-page="settings"]');
            if (settingsNavLink) settingsNavLink.classList.add('active');
            loadPage('settings');
        });
    }

    // Dropdown Logout click
    const dropdownLogout = document.getElementById('dropdownLogout');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', (e) => {
            e.preventDefault();
            closeDropdown();
            // Trigger the same logout as sidebar
            if (logoutBtn) logoutBtn.click();
        });
    }
}

// Initialize header on page load (for auto-login / token persistence)
updateUserProfileHeader();

// If we have a token but no cached user data, fetch it from the API
(async function() {
    const token = localStorage.getItem('access_token');
    const cachedUser = localStorage.getItem('user_data');
    if (token && !cachedUser) {
        try {
            const userData = await apiClient.getCurrentUser();
            if (userData) {
                localStorage.setItem('user_data', JSON.stringify(userData));
                updateUserProfileHeader();
            }
        } catch (e) {
            console.log('Could not fetch user profile:', e.message);
        }
    }
})();

// Navigation
const navLinks = document.querySelectorAll('.nav-link[data-page]');
console.log('✓ Found nav links:', navLinks.length);

/**
 * Fetch pest alerts and update the nav badge count globally.
 * Works independently of whether the notifications page is loaded.
 */
async function fetchAndUpdateAlertBadge() {
    try {
        const data = await apiClient.request('/notifications/admin/pest-alerts?limit=50');
        if (data) {
            // Store globally so badge logic can use it
            window.notificationsData = data;
            // Calculate unread count using read IDs from localStorage
            // Convert to strings for consistent comparison (prevents type mismatch)
            const readIds = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
            const unreadCount = data.filter(n => !readIds.includes(String(n.id))).length;
            const navBadge = document.getElementById('navAlertBadge');
            if (navBadge) {
                if (unreadCount > 0) {
                    navBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    navBadge.classList.remove('hidden');
                } else {
                    navBadge.classList.add('hidden');
                    navBadge.textContent = '0';
                }
            }
        }
    } catch (e) {
        console.log('Could not fetch alert badge count:', e.message);
    }
}
// Refresh badge periodically (every 30 seconds)
setInterval(fetchAndUpdateAlertBadge, 30000);

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.dataset.page;
        console.log('📍 Navigation clicked:', targetPage);

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Close sidebar on mobile after navigation
        closeSidebarMobile();

        loadPage(targetPage);
    });
});

// ====================================================
// MOBILE SIDEBAR TOGGLE
// ====================================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebarMobile() {
    if (sidebar) sidebar.classList.add('open');
    if (hamburgerBtn) hamburgerBtn.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebarMobile() {
    if (sidebar) sidebar.classList.remove('open');
    if (hamburgerBtn) hamburgerBtn.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        if (sidebar && sidebar.classList.contains('open')) {
            closeSidebarMobile();
        } else {
            openSidebarMobile();
        }
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebarMobile);
}

// Close sidebar on window resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        closeSidebarMobile();
    }
});

// ====================================================
// ADMIN REGISTRATION FLOW
// ====================================================
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegisterLink');
const regBackToLoginLink = document.getElementById('regBackToLoginLink');

// Registration state
let regEmail = '';
let regCode = '';

// Step elements
const regStep1 = document.getElementById('reg-step1-email');
const regStep2 = document.getElementById('reg-step2-code');
const regStep3 = document.getElementById('reg-step3-profile');
const regStep4 = document.getElementById('reg-step4-success');

// Step 1 elements
const regEmailInput = document.getElementById('regEmailInput');
const regSendCodeBtn = document.getElementById('regSendCodeBtn');
const regEmailError = document.getElementById('regEmailError');
const regEmailSuccess = document.getElementById('regEmailSuccess');

// Step 2 elements
const regSentToEmail = document.getElementById('regSentToEmail');
const regVerificationCode = document.getElementById('regVerificationCode');
const regVerifyCodeBtn = document.getElementById('regVerifyCodeBtn');
const regResendCodeLink = document.getElementById('regResendCodeLink');
const regBackToStep1 = document.getElementById('regBackToStep1');
const regCodeError = document.getElementById('regCodeError');
const regCodeSuccess = document.getElementById('regCodeSuccess');

// Step 3 elements
const regFullName = document.getElementById('regFullName');
const regUsername = document.getElementById('regUsername');
const regPassword = document.getElementById('regPassword');
const regConfirmPassword = document.getElementById('regConfirmPassword');
const regCompleteBtn = document.getElementById('regCompleteBtn');
const regBackToStep2 = document.getElementById('regBackToStep2');
const regProfileError = document.getElementById('regProfileError');
const regProfileSuccess = document.getElementById('regProfileSuccess');

// Step 4
const regGoToLoginBtn = document.getElementById('regGoToLoginBtn');

// Helper functions
function showRegisterStep(stepNum) {
    [regStep1, regStep2, regStep3, regStep4].forEach(s => {
        if (s) s.classList.add('hidden');
    });
    switch(stepNum) {
        case 1: if (regStep1) regStep1.classList.remove('hidden'); break;
        case 2: if (regStep2) regStep2.classList.remove('hidden'); break;
        case 3: if (regStep3) regStep3.classList.remove('hidden'); break;
        case 4: if (regStep4) regStep4.classList.remove('hidden'); break;
    }
}

function clearRegMessages() {
    [regEmailError, regEmailSuccess, regCodeError, regCodeSuccess, regProfileError, regProfileSuccess].forEach(el => {
        if (el) { el.textContent = ''; el.classList.remove('show'); }
    });
}

function showAllForms(formToShow) {
    // Hide all forms
    if (loginForm) loginForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    
    // Show the requested form
    if (formToShow) formToShow.classList.remove('hidden');
}

// Show register form
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('📝 Show Register form clicked');
        showAllForms(registerForm);
        clearRegMessages();
        showRegisterStep(1);
        if (regEmailInput) regEmailInput.value = '';
        regEmail = '';
        regCode = '';
    });
}

// Back to login from register
if (regBackToLoginLink) {
    regBackToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showAllForms(loginForm);
    });
}

// Step 1: Send verification code for registration
if (regSendCodeBtn) {
    regSendCodeBtn.addEventListener('click', async () => {
        const email = regEmailInput.value.trim();
        clearRegMessages();
        
        if (!email) {
            regEmailError.textContent = '❌ Please enter your email address';
            regEmailError.classList.add('show');
            return;
        }
        if (!isValidEmail(email)) {
            regEmailError.textContent = '❌ Please enter a valid email address';
            regEmailError.classList.add('show');
            return;
        }
        
        regSendCodeBtn.disabled = true;
        regSendCodeBtn.textContent = 'Sending...';
        
        try {
            const response = await apiClient.sendRegistrationCode(email);
            
            if (response.success) {
                regEmail = email;
                regEmailSuccess.textContent = '✅ ' + response.message;
                regEmailSuccess.classList.add('show');
                
                setTimeout(() => {
                    clearRegMessages();
                    if (regSentToEmail) regSentToEmail.textContent = email;
                    showRegisterStep(2);
                    if (regVerificationCode) regVerificationCode.focus();
                }, 1500);
            } else {
                regEmailError.textContent = '❌ ' + (response.message || 'Failed to send code');
                regEmailError.classList.add('show');
            }
        } catch (error) {
            regEmailError.textContent = '❌ ' + (error.message || 'Failed to send verification code');
            regEmailError.classList.add('show');
        } finally {
            regSendCodeBtn.disabled = false;
            regSendCodeBtn.textContent = 'Send Verification Code';
        }
    });
}

// Enter key on reg email
if (regEmailInput) {
    regEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && regSendCodeBtn) regSendCodeBtn.click();
    });
}

// Step 2: Verify registration code
if (regVerifyCodeBtn) {
    regVerifyCodeBtn.addEventListener('click', async () => {
        const code = regVerificationCode.value.trim();
        clearRegMessages();
        
        if (!code || code.length !== 6) {
            regCodeError.textContent = '❌ Please enter the 6-digit verification code';
            regCodeError.classList.add('show');
            return;
        }
        
        regVerifyCodeBtn.disabled = true;
        regVerifyCodeBtn.textContent = 'Verifying...';
        
        try {
            const response = await apiClient.verifyRegistrationCode(regEmail, code);
            
            if (response.success) {
                regCode = code;
                regCodeSuccess.textContent = '✅ ' + response.message;
                regCodeSuccess.classList.add('show');
                
                setTimeout(() => {
                    clearRegMessages();
                    showRegisterStep(3);
                    if (regFullName) regFullName.focus();
                }, 1000);
            } else {
                regCodeError.textContent = '❌ ' + (response.message || 'Invalid code');
                regCodeError.classList.add('show');
            }
        } catch (error) {
            regCodeError.textContent = '❌ ' + (error.message || 'Failed to verify code');
            regCodeError.classList.add('show');
        } finally {
            regVerifyCodeBtn.disabled = false;
            regVerifyCodeBtn.textContent = 'Verify Code';
        }
    });
}

// Enter key on verification code
if (regVerificationCode) {
    regVerificationCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && regVerifyCodeBtn) regVerifyCodeBtn.click();
    });
}

// Step 2: Resend code
if (regResendCodeLink) {
    regResendCodeLink.addEventListener('click', async () => {
        regResendCodeLink.textContent = 'Sending...';
        regResendCodeLink.style.pointerEvents = 'none';
        clearRegMessages();
        
        try {
            const response = await apiClient.resendRegistrationCode(regEmail);
            if (response.success) {
                regCodeSuccess.textContent = '✅ New code sent to your email';
                regCodeSuccess.classList.add('show');
                if (regVerificationCode) regVerificationCode.value = '';
            } else {
                regCodeError.textContent = '❌ ' + (response.message || 'Failed to resend');
                regCodeError.classList.add('show');
            }
        } catch (error) {
            regCodeError.textContent = '❌ Failed to resend code';
            regCodeError.classList.add('show');
        } finally {
            regResendCodeLink.textContent = 'Resend Code';
            regResendCodeLink.style.pointerEvents = 'auto';
        }
    });
}

// Step 2: Back to step 1
if (regBackToStep1) {
    regBackToStep1.addEventListener('click', () => {
        clearRegMessages();
        showRegisterStep(1);
    });
}

// Step 3: Back to step 2
if (regBackToStep2) {
    regBackToStep2.addEventListener('click', () => {
        clearRegMessages();
        showRegisterStep(2);
    });
}

// Step 3: Complete registration
if (regCompleteBtn) {
    regCompleteBtn.addEventListener('click', async () => {
        clearRegMessages();
        
        const fullName = regFullName.value.trim();
        const username = regUsername.value.trim();
        const password = regPassword.value;
        const confirmPw = regConfirmPassword.value;
        
        if (!fullName) {
            regProfileError.textContent = '❌ Please enter your full name';
            regProfileError.classList.add('show');
            return;
        }
        if (!username) {
            regProfileError.textContent = '❌ Please choose a username';
            regProfileError.classList.add('show');
            return;
        }
        if (username.length < 3) {
            regProfileError.textContent = '❌ Username must be at least 3 characters';
            regProfileError.classList.add('show');
            return;
        }
        if (!password || password.length < 6) {
            regProfileError.textContent = '❌ Password must be at least 6 characters';
            regProfileError.classList.add('show');
            return;
        }
        if (password !== confirmPw) {
            regProfileError.textContent = '❌ Passwords do not match';
            regProfileError.classList.add('show');
            return;
        }
        
        regCompleteBtn.disabled = true;
        regCompleteBtn.textContent = 'Creating Account...';
        
        try {
            const response = await apiClient.completeAdminRegistration(
                regEmail, regCode, username, fullName, password
            );
            
            if (response.success) {
                regProfileSuccess.textContent = '✅ ' + response.message;
                regProfileSuccess.classList.add('show');
                
                setTimeout(() => {
                    clearRegMessages();
                    showRegisterStep(4);
                }, 1000);
            } else {
                regProfileError.textContent = '❌ ' + (response.message || response.detail || 'Registration failed');
                regProfileError.classList.add('show');
            }
        } catch (error) {
            regProfileError.textContent = '❌ ' + (error.message || 'Registration failed');
            regProfileError.classList.add('show');
        } finally {
            regCompleteBtn.disabled = false;
            regCompleteBtn.textContent = 'Create Account';
        }
    });
}

// Step 4: Go to login
if (regGoToLoginBtn) {
    regGoToLoginBtn.addEventListener('click', () => {
        showAllForms(loginForm);
        showRegisterStep(1);
        // Clear all inputs
        if (regEmailInput) regEmailInput.value = '';
        if (regVerificationCode) regVerificationCode.value = '';
        if (regFullName) regFullName.value = '';
        if (regUsername) regUsername.value = '';
        if (regPassword) regPassword.value = '';
        if (regConfirmPassword) regConfirmPassword.value = '';
        regEmail = '';
        regCode = '';
    });
}

// Add password toggle for all registration form password fields
document.querySelectorAll('#registerForm .toggle-pass-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling;
        if (input && input.type === 'password') {
            input.type = 'text';
            icon.textContent = '👁️‍🗨️';
        } else if (input) {
            input.type = 'password';
            icon.textContent = '👁️';
        }
    });
});

console.log('✓✓✓ Script initialization complete!');

}); // End of DOMContentLoaded
