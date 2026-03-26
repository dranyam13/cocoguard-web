/**
 * CocoGuard API Client
 * Handles all communication with the backend API
 */

class CocoGuardAPI {
    constructor(baseURL = null) {
        // Dynamically detect API URL based on current hostname.
        // Production (workers/pages/render) must call the Render backend.
        const host = window.location.hostname;
        const port = 8000;
        const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
        const productionApi = 'https://cocoguard-api.onrender.com';
        const isHostedEnv = /\.(workers\.dev|pages\.dev|onrender\.com)$/i.test(host);
        const detectedUrl = isHostedEnv ? productionApi : `${protocol}://${host}:${port}`;

        const isInvalidHostedStoredUrl = (url) => {
            if (!url) return false;
            return /(workers\.dev|pages\.dev|onrender\.com):8000/i.test(url);
        };
        
        // Use custom URL from storage if set, otherwise auto-detect
        const storedUrl = localStorage.getItem('api_base_url');
        if (baseURL) {
            this.baseURL = baseURL;
        } else if (storedUrl && !(isHostedEnv && isInvalidHostedStoredUrl(storedUrl))) {
            this.baseURL = storedUrl;
        } else {
            this.baseURL = detectedUrl;
            localStorage.setItem('api_base_url', this.baseURL);
        }

        // Expose resolved API URL for legacy page modules.
        window.API_BASE_URL = this.baseURL;
        window.KNOWLEDGE_API_BASE_URL = this.baseURL;
        
        console.log('API Client initialized with URL:', this.baseURL);
        this.token = localStorage.getItem('access_token');
        this.headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            this.headers['Authorization'] = `Bearer ${this.token}`;
        }
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            this.headers['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('access_token', token);
        } else {
            delete this.headers['Authorization'];
            localStorage.removeItem('access_token');
        }
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const method = options.method || 'GET';
        // Always get fresh token from storage
        const currentToken = localStorage.getItem('access_token');
        const headers = { 
            'Content-Type': 'application/json',
            ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
            ...options.headers 
        };
        
        const config = {
            method,
            headers,
        };

        const controller = new AbortController();
        const timeoutMs = 30000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        config.signal = controller.signal;

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        console.log(`🔐 API Request to ${endpoint}:`, {
            method,
            hasToken: !!currentToken
        });

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error && error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            console.error('API Request Error:', error);
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }


    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData,
        });
    }

    async login(email, password) {
        console.log('🔑 Login: Clearing old token before login...');
        localStorage.removeItem('access_token');
        
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: {
                email_or_username: email,
                password,
            },
        });
        
        // Check if 2FA challenge was returned (no token)
        if (response.requires_2fa) {
            console.log('🔐 2FA required');
            return response;  // Don't set token, return challenge
        }
        
        console.log('🔑 Login successful!');
        this.setToken(response.access_token);
        
        return response;
    }

    logout() {
        this.setToken(null);
    }

    // ============= USERS =============

    async getCurrentUser() {
        return this.request('/users/me');
    }

    async listUsers() {
        console.log('📡 API: Calling GET /users');
        return this.request('/users');
    }

    async createUser(userData) {
        console.log('📡 API: Creating new user');
        return this.request('/users', {
            method: 'POST',
            body: userData,
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: userData,
        });
    }

    async setUserStatus(userId, status) {
        return this.request(`/users/${userId}/status?status=${status}`, {
            method: 'PUT',
        });
    }

    // ============= FARMS =============

    async listFarms(limit = 50, skip = 0) {
        return this.request(`/farms?limit=${limit}&skip=${skip}`);
    }

    async createFarm(farmData) {
        return this.request('/farms', {
            method: 'POST',
            body: farmData,
        });
    }

    async getFarm(farmId) {
        return this.request(`/farms/${farmId}`);
    }

    async updateFarm(farmId, farmData) {
        return this.request(`/farms/${farmId}`, {
            method: 'PUT',
            body: farmData,
        });
    }

    async deleteFarm(farmId) {
        return this.request(`/farms/${farmId}`, {
            method: 'DELETE',
        });
    }

    // ============= PEST TYPES =============

    async listPestTypes(limit = 100) {
        return this.request(`/pest-types?limit=${limit}`);
    }

    async listAllPestTypes(limit = 100) {
        return this.request(`/pest-types/all?limit=${limit}`);
    }

    async getPestType(pestTypeId) {
        return this.request(`/pest-types/${pestTypeId}`);
    }

    async createPestType(pestData) {
        return this.request('/pest-types', {
            method: 'POST',
            body: pestData,
        });
    }

    async updatePestType(pestTypeId, pestData) {
        return this.request(`/pest-types/${pestTypeId}`, {
            method: 'PUT',
            body: pestData,
        });
    }

    async togglePestType(pestTypeId) {
        return this.request(`/pest-types/${pestTypeId}/toggle`, {
            method: 'PUT',
        });
    }

    // ============= SCANS =============

    async createScan(scanData) {
        return this.request('/scans', {
            method: 'POST',
            body: scanData,
        });
    }

    async listMyScans(limit = 50, skip = 0) {
        return this.request(`/scans/my-scans?limit=${limit}&skip=${skip}`);
    }

    async adminListScans() {
        return this.request('/scans/admin');
    }

    async getScan(scanId) {
        return this.request(`/scans/${scanId}`);
    }

    async updateScanStatus(scanId, status, notes = '') {
        return this.request(`/scans/${scanId}/status`, {
            method: 'PUT',
            body: { status, notes },
        });
    }

    // ============= UPLOADS =============

    async uploadScanImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseURL}/uploads/scan-image`, {
            method: 'POST',
            headers: {
                'Authorization': this.headers['Authorization'] || '',
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        return response.json();
    }

    async deleteFile(filename) {
        return this.request(`/uploads/files/${filename}`, {
            method: 'DELETE',
        });
    }

    // ============= FEEDBACK =============

    async submitFeedback(feedbackData) {
        return this.request('/feedback', {
            method: 'POST',
            body: feedbackData,
        });
    }

    // ============= KNOWLEDGE BASE =============

    async listKnowledge(limit = 50, category = null, tag = null) {
        let query = `/knowledge?limit=${limit}`;
        if (category) query += `&category=${encodeURIComponent(category)}`;
        if (tag) query += `&tag=${encodeURIComponent(tag)}`;
        return this.request(query);
    }

    async getKnowledgeArticle(articleId) {
        return this.request(`/knowledge/${articleId}`);
    }

    async getKnowledgeByCategory(category, limit = 50) {
        return this.request(`/knowledge/category/${category}?limit=${limit}`);
    }

    async createKnowledgeArticle(articleData) {
        return this.request('/knowledge', {
            method: 'POST',
            body: articleData,
        });
    }

    // ============= ANALYTICS =============

    async getDashboardSummary() {
        return this.request('/analytics/dashboard/summary');
    }

    async getAdminDashboardSummary() {
        return this.request('/analytics/admin/dashboard/summary');
    }

    async getScansByPest(days = 30) {
        return this.request(`/analytics/scans/by-pest?days=${days}`);
    }

    async getScansByStatus() {
        return this.request('/analytics/scans/by-status');
    }

    async getScanTrends(days = 30) {
        return this.request(`/analytics/scans/trends?days=${days}`);
    }

    async getFarmsSummary() {
        return this.request('/analytics/farms/summary');
    }

    async getSystemStats() {
        return this.request('/analytics/admin/system-stats');
    }

    async getAdminScansByPest(days = 30) {
        return this.request(`/analytics/admin/scans/by-pest?days=${days}`);
    }

    async getAdminScansByFarm(days = 30) {
        return this.request(`/analytics/admin/scans/by-farm?days=${days}`);
    }

    async getAdminMonthlyScans(months = 6) {
        return this.request(`/analytics/admin/monthly-scans?months=${months}`);
    }

    async getAdminDailyScans(days = 7) {
        return this.request(`/analytics/admin/daily-scans?days=${days}`);
    }

    // ============= PASSWORD RESET =============

    /**
     * Request a password reset code to be sent to email
     * @param {string} email - User's email
     * @param {string} source - 'web' for admin website, 'app' for mobile
     */
    async requestPasswordReset(email, source = 'web') {
        return this.request('/password-reset/request', {
            method: 'POST',
            body: { email, source },
        });
    }

    /**
     * Verify the password reset code
     */
    async verifyResetCode(email, code) {
        return this.request('/password-reset/verify', {
            method: 'POST',
            body: { email, code },
        });
    }

    /**
     * Confirm password reset with new password
     */
    async confirmPasswordReset(email, code, newPassword) {
        return this.request('/password-reset/confirm', {
            method: 'POST',
            body: { 
                email, 
                code, 
                new_password: newPassword 
            },
        });
    }

    /**
     * Resend the password reset code
     */
    async resendResetCode(email, source = 'web') {
        return this.request('/password-reset/resend', {
            method: 'POST',
            body: { email, source },
        });
    }

    // ============= ADMIN REGISTRATION =============

    /**
     * Send verification code for admin registration
     */
    async sendRegistrationCode(email) {
        return this.request('/admin-register/send-code', {
            method: 'POST',
            body: { email },
        });
    }

    /**
     * Verify registration code
     */
    async verifyRegistrationCode(email, code) {
        return this.request('/admin-register/verify-code', {
            method: 'POST',
            body: { email, code },
        });
    }

    /**
     * Complete admin registration
     */
    async completeAdminRegistration(email, code, username, fullName, password) {
        return this.request('/admin-register/complete', {
            method: 'POST',
            body: { 
                email, 
                code, 
                username, 
                full_name: fullName, 
                password 
            },
        });
    }

    /**
     * Resend registration verification code
     */
    async resendRegistrationCode(email) {
        return this.request('/admin-register/resend-code', {
            method: 'POST',
            body: { email },
        });
    }

    // ============= HEALTH CHECK =============

    async healthCheck() {
        return this.request('/');
    }
}

// Create global API client instance
// Dynamically uses current hostname - works across any network (LAN, hotspot, etc.)
const apiClient = new CocoGuardAPI();
