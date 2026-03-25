/**
 * CocoGuard Web Configuration
 * Update these values for your deployment environment
 */

// Production API URL - Update this to your Render backend URL
// Example: https://cocoguard-api.onrender.com
const COCOGUARD_CONFIG = {
    // API Base URL - Set to your Render backend URL after deployment
    // Leave empty to auto-detect (for local development)
    API_URL: '',
    
    // App version
    VERSION: '1.0.0',
    
    // Enable debug logging
    DEBUG: false
};

// Auto-configure based on environment
(function() {
    // If API_URL is not set, try to detect production environment
    if (!COCOGUARD_CONFIG.API_URL) {
        const hostname = window.location.hostname;
        
        // Production detection: if running on Render, Cloudflare Pages, or Workers
        if (hostname.includes('.onrender.com') || hostname.includes('.pages.dev') || hostname.includes('.workers.dev')) {
            // Production: Use the backend URL (update after first deployment)
            // You need to update this after deploying the backend
            const backendName = 'cocoguard-api'; // Change if your service name is different
            COCOGUARD_CONFIG.API_URL = `https://${backendName}.onrender.com`;
            console.log('🌐 Production mode detected, using:', COCOGUARD_CONFIG.API_URL);
        } else {
            // Development: Use same host with port 8000
            const protocol = window.location.protocol;
            COCOGUARD_CONFIG.API_URL = `${protocol}//${hostname}:8000`;
            console.log('🔧 Development mode, using:', COCOGUARD_CONFIG.API_URL);
        }
    }
    
    // Store in localStorage if not already set
    if (!localStorage.getItem('api_base_url') && COCOGUARD_CONFIG.API_URL) {
        localStorage.setItem('api_base_url', COCOGUARD_CONFIG.API_URL);
    }
})();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.COCOGUARD_CONFIG = COCOGUARD_CONFIG;
}
