// CocoGuard Web Admin - Translation System
// Supports: English (en), Filipino (fil)

(function () {
    'use strict';

    const translations = {
        // ========== SIDEBAR & NAVIGATION ==========
        'sidebar.title': { en: 'CocoGuard', fil: 'CocoGuard' },
        'sidebar.subtitle': { en: 'Admin Panel', fil: 'Admin Panel' },
        'nav.dashboard': { en: 'Dashboard', fil: 'Dashboard' },
        'nav.scan': { en: 'Scan', fil: 'I-scan' },
        'nav.pest_management': { en: 'Pest Type Management', fil: 'Pamamahala ng Uri ng Peste' },
        'nav.feedback': { en: 'User Feedback & Reports', fil: 'Mga Feedback at Ulat' },
        'nav.knowledge': { en: 'Knowledge Base', fil: 'Kaalaman' },
        'nav.users': { en: 'User Management', fil: 'Pamamahala ng mga User' },
        'nav.notifications': { en: 'Pest Alerts', fil: 'Mga Alerto sa Peste' },
        'nav.settings': { en: 'Settings', fil: 'Mga Setting' },
        'nav.logout': { en: 'Logout', fil: 'Mag-logout' },

        // ========== HEADER ==========
        'header.search': { en: 'Search...', fil: 'Maghanap...' },
        'header.admin': { en: 'Admin', fil: 'Admin' },

        // ========== PAGE TITLES ==========
        'page.dashboard': { en: 'Dashboard Overview', fil: 'Pangkalahatang-tanaw ng Dashboard' },
        'page.scan': { en: 'Scan History', fil: 'Kasaysayan ng Pag-scan' },
        'page.pest_management': { en: 'Pest Type Management', fil: 'Pamamahala ng Uri ng Peste' },
        'page.feedback': { en: 'User Feedback & Reports', fil: 'Mga Feedback at Ulat ng User' },
        'page.knowledge': { en: 'Knowledge Base', fil: 'Base ng Kaalaman' },
        'page.users': { en: 'User Management', fil: 'Pamamahala ng mga User' },
        'page.notifications': { en: 'Pest Alert Notifications', fil: 'Mga Alertong Notipikasyon sa Peste' },
        'page.settings': { en: 'Settings', fil: 'Mga Setting' },

        // ========== LOGIN PAGE ==========
        'login.brand_kicker': { en: 'THE NEW ERA OF', fil: 'ANG BAGONG PANAHON NG' },
        'login.brand_title': { en: 'AGRICULTURE', fil: 'AGRIKULTURA' },
        'login.title': { en: 'Login to Pest Management', fil: 'Mag-login sa Pamamahala ng Peste' },
        'login.subtitle': { en: 'Enter your credentials to access the admin panel', fil: 'Ilagay ang iyong kredensyal para ma-access ang admin panel' },
        'login.email': { en: 'Email', fil: 'Email' },
        'login.password': { en: 'Password', fil: 'Password' },
        'login.forgot': { en: 'Forgot Password?', fil: 'Nakalimutan ang Password?' },
        'login.submit': { en: 'Login', fil: 'Mag-login' },
        'login.forgot_title': { en: 'Forgot Your Password?', fil: 'Nakalimutan Mo ang Password?' },
        'login.forgot_desc': { en: "Enter your email address and we'll send you a verification code.", fil: 'Ilagay ang iyong email at padadalhan ka namin ng verification code.' },
        'login.email_address': { en: 'Email Address', fil: 'Email Address' },
        'login.send_code': { en: 'Send Verification Code', fil: 'Magpadala ng Verification Code' },
        'login.back_to_login': { en: '← Back to Login', fil: '← Bumalik sa Login' },
        'login.enter_code': { en: 'Enter Verification Code', fil: 'Ilagay ang Verification Code' },
        'login.verify_code': { en: 'Verify Code', fil: 'I-verify ang Code' },
        'login.didnt_receive': { en: "Didn't receive the code?", fil: 'Hindi natanggap ang code?' },
        'login.resend_code': { en: 'Resend Code', fil: 'Ipadala Muli ang Code' },
        'login.change_email': { en: '← Change Email', fil: '← Palitan ang Email' },
        'login.set_new_password': { en: 'Set New Password', fil: 'Magtakda ng Bagong Password' },
        'login.new_password': { en: 'New Password', fil: 'Bagong Password' },
        'login.confirm_password': { en: 'Confirm Password', fil: 'Kumpirmahin ang Password' },
        'login.reset_password': { en: 'Reset Password', fil: 'I-reset ang Password' },
        'login.reset_success': { en: 'Password Reset Successful!', fil: 'Matagumpay na Na-reset ang Password!' },
        'login.go_to_login': { en: 'Go to Login', fil: 'Pumunta sa Login' },

        // ========== DASHBOARD ==========
        'dashboard.total_scans': { en: 'Total Scans', fil: 'Kabuuang Pag-scan' },
        'dashboard.active_users': { en: 'Active Users', fil: 'Mga Aktibong User' },
        'dashboard.todays_scans': { en: "Today's Scans", fil: 'Mga Pag-scan Ngayon' },
        'dashboard.knowledge_articles': { en: 'Knowledge Articles', fil: 'Mga Artikulo ng Kaalaman' },
        'dashboard.loading': { en: 'Loading...', fil: 'Naglo-load...' },
        'dashboard.pest_distribution': { en: 'Pest Distribution Overview', fil: 'Pangkalahatang-tanaw ng Distribusyon ng Peste' },
        'dashboard.monthly_activity': { en: 'Monthly Scan Activity', fil: 'Buwanang Aktibidad ng Pag-scan' },
        'dashboard.top_pests': { en: 'Top 5 Detected Pests', fil: 'Nangungunang 5 Natukoy na Peste' },
        'dashboard.top_farmers': { en: 'Top 5 Affected Farmers', fil: 'Nangungunang 5 Apektadong Magsasaka' },
        'dashboard.detection_trend': { en: 'Detection Trend (Last 7 Days)', fil: 'Trend ng Pagtukoy (Huling 7 Araw)' },
        'dashboard.accuracy_rate': { en: 'Detection Accuracy Rate', fil: 'Rate ng Katumpakan ng Pagtukoy' },
        'dashboard.recent_scans': { en: 'Recent Scans', fil: 'Mga Kamakailang Pag-scan' },
        'dashboard.recent_feedback': { en: 'Recent Feedback Reports', fil: 'Mga Kamakailang Ulat ng Feedback' },

        // ========== TABLE HEADERS ==========
        'table.id': { en: 'ID', fil: 'ID' },
        'table.date_time': { en: 'Date & Time', fil: 'Petsa at Oras' },
        'table.image': { en: 'Image', fil: 'Larawan' },
        'table.pest_type': { en: 'Pest Type', fil: 'Uri ng Peste' },
        'table.source': { en: 'Source', fil: 'Pinagmulan' },
        'table.location': { en: 'Location', fil: 'Lokasyon' },
        'table.user': { en: 'User', fil: 'User' },
        'table.type': { en: 'Type', fil: 'Uri' },
        'table.message': { en: 'Message', fil: 'Mensahe' },
        'table.pest_name': { en: 'Pest Name', fil: 'Pangalan ng Peste' },
        'table.scientific_name': { en: 'Scientific Name', fil: 'Siyentipikong Pangalan' },
        'table.risk_level': { en: 'Risk Level', fil: 'Antas ng Panganib' },
        'table.active': { en: 'Active', fil: 'Aktibo' },
        'table.actions': { en: 'Actions', fil: 'Mga Aksyon' },
        'table.username': { en: 'Username', fil: 'Username' },
        'table.email': { en: 'Email', fil: 'Email' },
        'table.role': { en: 'Role', fil: 'Tungkulin' },
        'table.status': { en: 'Status', fil: 'Katayuan' },
        'table.date_joined': { en: 'Date Joined', fil: 'Petsa ng Pagsali' },
        'table.title': { en: 'Article Title', fil: 'Pamagat ng Artikulo' },
        'table.content': { en: 'Content', fil: 'Nilalaman' },
        'table.category': { en: 'Category', fil: 'Kategorya' },
        'table.date_created': { en: 'Date Created', fil: 'Petsa ng Paglikha' },
        'table.last_updated': { en: 'Last Updated', fil: 'Huling Na-update' },

        // ========== BUTTONS ==========
        'btn.save': { en: 'Save', fil: 'I-save' },
        'btn.cancel': { en: 'Cancel', fil: 'Kanselahin' },
        'btn.delete': { en: 'Delete', fil: 'Burahin' },
        'btn.edit': { en: 'Edit', fil: 'I-edit' },
        'btn.add': { en: 'Add', fil: 'Idagdag' },
        'btn.export': { en: 'Export', fil: 'I-export' },
        'btn.close': { en: 'Close', fil: 'Isara' },
        'btn.confirm': { en: 'Confirm', fil: 'Kumpirmahin' },
        'btn.refresh': { en: 'Refresh', fil: 'I-refresh' },
        'btn.new_scan': { en: 'New Scan', fil: 'Bagong Scan' },
        'btn.add_pest': { en: 'Add Pest Type', fil: 'Magdagdag ng Uri ng Peste' },
        'btn.add_article': { en: 'Add Article', fil: 'Magdagdag ng Artikulo' },
        'btn.add_user': { en: 'Add User', fil: 'Magdagdag ng User' },
        'btn.mark_all_read': { en: 'Mark All Read', fil: 'Markahang Nabasa Lahat' },

        // ========== SCAN PAGE ==========
        'scan.title': { en: 'Scan History', fil: 'Kasaysayan ng Pag-scan' },
        'scan.details': { en: 'Scan Details', fil: 'Detalye ng Pag-scan' },
        'scan.image_viewer': { en: 'Image Viewer', fil: 'Viewer ng Larawan' },
        'scan.zoom_in': { en: 'Zoom In', fil: 'Palakihin' },
        'scan.zoom_out': { en: 'Zoom Out', fil: 'Paliitin' },
        'scan.reset_zoom': { en: 'Reset Zoom', fil: 'I-reset ang Zoom' },
        'scan.fit_screen': { en: 'Fit to Screen', fil: 'I-fit sa Screen' },

        // ========== PEST MANAGEMENT ==========
        'pest.add_title': { en: 'Add New Pest Type', fil: 'Magdagdag ng Bagong Uri ng Peste' },
        'pest.save': { en: 'Save Pest Type', fil: 'I-save ang Uri ng Peste' },
        'pest.risk_critical': { en: 'Critical', fil: 'Kritikal' },
        'pest.risk_high': { en: 'High', fil: 'Mataas' },
        'pest.risk_medium': { en: 'Medium', fil: 'Katamtaman' },
        'pest.risk_low': { en: 'Low', fil: 'Mababa' },
        'pest.visible_to_users': { en: 'Active (visible to users)', fil: 'Aktibo (makikita ng mga user)' },

        // ========== KNOWLEDGE BASE ==========
        'knowledge.title': { en: 'Knowledge Base', fil: 'Base ng Kaalaman' },

        // ========== USER MANAGEMENT ==========
        'users.title': { en: 'User Management', fil: 'Pamamahala ng mga User' },
        'users.add_title': { en: 'Add New User', fil: 'Magdagdag ng Bagong User' },
        'users.add_desc': { en: 'Create a new user account', fil: 'Lumikha ng bagong user account' },
        'users.full_name': { en: 'Full Name', fil: 'Buong Pangalan' },

        // ========== NOTIFICATIONS ==========
        'notifications.title': { en: 'Pest Alerts', fil: 'Mga Alerto sa Peste' },
        'notifications.subtitle': { en: 'Monitor and manage pest detection alerts from the field', fil: 'Subaybayan at pamahalaan ang mga alerto sa pagtukoy ng peste mula sa bukid' },
        'notifications.total_alerts': { en: 'Total Alerts', fil: 'Kabuuang Alerto' },
        'notifications.critical_apw': { en: 'Critical (APW)', fil: 'Kritikal (APW)' },
        'notifications.today': { en: 'Today', fil: 'Ngayon' },
        'notifications.locations': { en: 'Locations', fil: 'Mga Lokasyon' },
        'notifications.search': { en: 'Search alerts...', fil: 'Maghanap ng alerto...' },
        'notifications.all_types': { en: 'All Types', fil: 'Lahat ng Uri' },
        'notifications.critical_only': { en: 'Critical Only', fil: 'Kritikal Lamang' },
        'notifications.all_time': { en: 'All Time', fil: 'Lahat ng Oras' },
        'notifications.this_week': { en: 'This Week', fil: 'Ngayong Linggo' },
        'notifications.no_alerts': { en: 'No Alerts', fil: 'Walang Alerto' },
        'notifications.all_clear': { en: 'All clear! No pest alerts at this time.', fil: 'Malinaw na lahat! Walang alerto sa peste sa ngayon.' },

        // ========== SETTINGS PAGE ==========
        'settings.title': { en: 'Settings', fil: 'Mga Setting' },
        'settings.profile_settings': { en: 'Profile Settings', fil: 'Mga Setting ng Profile' },
        'settings.profile_visible': { en: 'Profile Visibility', fil: 'Visibility ng Profile' },
        'settings.profile_visible_desc': { en: 'Make your profile visible to other users', fil: 'Gawin makikita ang iyong profile sa ibang user' },
        'settings.language': { en: 'Language', fil: 'Wika' },
        'settings.language_desc': { en: 'Select your preferred language', fil: 'Piliin ang iyong gustong wika' },
        'settings.theme': { en: 'Theme', fil: 'Tema' },
        'settings.theme_desc': { en: 'Choose your display theme', fil: 'Pumili ng display na tema' },
        'settings.notification_settings': { en: 'Notification Settings', fil: 'Mga Setting ng Notipikasyon' },
        'settings.email_notif': { en: 'Email Notifications', fil: 'Mga Notipikasyon sa Email' },
        'settings.email_notif_desc': { en: 'Receive email updates and alerts', fil: 'Makatanggap ng mga update at alerto sa email' },
        'settings.sms_notif': { en: 'SMS Notifications', fil: 'Mga Notipikasyon sa SMS' },
        'settings.sms_notif_desc': { en: 'Receive SMS pest alerts', fil: 'Makatanggap ng mga alerto sa SMS' },
        'settings.push_notif': { en: 'Push Notifications', fil: 'Mga Push Notification' },
        'settings.push_notif_desc': { en: 'Receive browser push notifications', fil: 'Makatanggap ng mga push notification sa browser' },
        'settings.security': { en: 'Security Settings', fil: 'Mga Setting ng Seguridad' },
        'settings.two_factor': { en: 'Two-Factor Authentication', fil: 'Two-Factor Authentication' },
        'settings.two_factor_desc': { en: 'Enable 2FA for enhanced security', fil: 'I-enable ang 2FA para sa mas mataas na seguridad' },
        'settings.change_password': { en: 'Change Password', fil: 'Palitan ang Password' },
        'settings.change_password_desc': { en: 'Update your account password', fil: 'I-update ang iyong password' },
        'settings.session': { en: 'Session Management', fil: 'Pamamahala ng Session' },
        'settings.signout_all': { en: 'Sign Out All Devices', fil: 'Mag-sign Out sa Lahat ng Device' },
        'settings.data_privacy': { en: 'Data & Privacy', fil: 'Data at Privacy' },
        'settings.auto_backup': { en: 'Automatic Backup', fil: 'Awtomatikong Backup' },
        'settings.auto_backup_desc': { en: 'Automatically back up your data', fil: 'Awtomatikong i-backup ang iyong data' },
        'settings.data_sharing': { en: 'Data Sharing', fil: 'Pagbabahagi ng Data' },
        'settings.data_sharing_desc': { en: 'Share anonymized data for research', fil: 'Ibahagi ang anonymized na data para sa pananaliksik' },
        'settings.export_data': { en: 'Export My Data', fil: 'I-export ang Aking Data' },
        'settings.export_data_desc': { en: 'Download all your data in JSON format', fil: 'I-download ang lahat ng iyong data sa JSON format' },
        'settings.delete_account': { en: 'Delete Account', fil: 'Burahin ang Account' },
        'settings.delete_account_desc': { en: 'Permanently delete your account and all data', fil: 'Permanenteng burahin ang iyong account at lahat ng data' },
        'settings.save_all': { en: 'Save All Settings', fil: 'I-save ang Lahat ng Setting' },
        'settings.reset_defaults': { en: 'Reset to Defaults', fil: 'I-reset sa Default' },
        'settings.danger_zone': { en: 'Danger Zone', fil: 'Danger Zone' },

        // ========== CHANGE PASSWORD MODAL ==========
        'password.current': { en: 'Current Password', fil: 'Kasalukuyang Password' },
        'password.new': { en: 'New Password', fil: 'Bagong Password' },
        'password.confirm': { en: 'Confirm New Password', fil: 'Kumpirmahin ang Bagong Password' },
        'password.send_code': { en: 'Send Code', fil: 'Magpadala ng Code' },
        'password.verify_email': { en: 'Verify Your Email', fil: 'I-verify ang Iyong Email' },
        'password.code': { en: 'Verification Code', fil: 'Verification Code' },
        'password.resend': { en: 'Resend Code', fil: 'Ipadala Muli ang Code' },
        'password.change': { en: 'Change Password', fil: 'Palitan ang Password' },
        'password.back': { en: '← Back', fil: '← Bumalik' },

        // ========== 2FA MODAL ==========
        'twofa.enable_title': { en: 'Enable Two-Factor Authentication', fil: 'I-enable ang Two-Factor Authentication' },
        'twofa.how_it_works': { en: 'How it works', fil: 'Paano ito gumagana' },
        'twofa.enabled': { en: '2FA Enabled!', fil: '2FA Na-enable na!' },
        'twofa.done': { en: 'Done', fil: 'Tapos Na' },

        // ========== DELETE ACCOUNT MODAL ==========
        'delete.title': { en: 'Delete Account', fil: 'Burahin ang Account' },
        'delete.warning': { en: 'This action is permanent and cannot be undone. The following data will be deleted:', fil: 'Ang aksyon na ito ay permanente at hindi na mababawi. Ang sumusunod na data ay mabubura:' },
        'delete.profile_info': { en: 'Profile information', fil: 'Impormasyon ng profile' },
        'delete.scan_history': { en: 'Scan history', fil: 'Kasaysayan ng pag-scan' },
        'delete.farm_data': { en: 'Farm data', fil: 'Data ng farm' },
        'delete.settings_prefs': { en: 'Settings and preferences', fil: 'Mga setting at kagustuhan' },
        'delete.enter_password': { en: 'Enter your password to confirm:', fil: 'Ilagay ang iyong password upang kumpirmahin:' },
        'delete.type_delete': { en: 'Type DELETE to confirm:', fil: 'I-type ang DELETE upang kumpirmahin:' },
        'delete.confirm_btn': { en: 'Delete My Account', fil: 'Burahin ang Aking Account' },

        // ========== COMMON ==========
        'common.loading': { en: 'Loading...', fil: 'Naglo-load...' },
        'common.error': { en: 'Error', fil: 'Error' },
        'common.success': { en: 'Success', fil: 'Tagumpay' },
        'common.no_data': { en: 'No data available', fil: 'Walang available na data' },
        'common.other': { en: 'Other', fil: 'Iba Pa' },
        'common.yes': { en: 'Yes', fil: 'Oo' },
        'common.no': { en: 'No', fil: 'Hindi' },

        // ========== FEEDBACK ==========
        'feedback.title': { en: 'User Feedback & Reports', fil: 'Mga Feedback at Ulat ng User' },
    };

    // ========== TRANSLATOR CLASS ==========

    let currentLang = localStorage.getItem('app_language') || 'en';

    const Translator = {
        /**
         * Get translated string by key
         * @param {string} key - Translation key (e.g., 'nav.dashboard')
         * @param {string} [fallback] - Fallback text if key not found
         * @returns {string}
         */
        t(key, fallback) {
            const entry = translations[key];
            if (!entry) return fallback || key;
            return entry[currentLang] || entry['en'] || fallback || key;
        },

        /**
         * Get current language
         * @returns {string}
         */
        getCurrentLang() {
            return currentLang;
        },

        /**
         * Set language and apply translations
         * @param {string} lang - 'en' or 'fil'
         */
        setLang(lang) {
            if (lang !== 'en' && lang !== 'fil') lang = 'en';
            currentLang = lang;
            localStorage.setItem('app_language', lang);
            this.applyTranslations();
        },

        /**
         * Apply translations to all elements with data-i18n attribute
         * data-i18n="key" → sets textContent
         * data-i18n-placeholder="key" → sets placeholder
         * data-i18n-title="key" → sets title attribute
         */
        applyTranslations() {
            // Translate text content
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const text = this.t(key);
                if (text !== key) el.textContent = text;
            });

            // Translate placeholders
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const text = this.t(key);
                if (text !== key) el.placeholder = text;
            });

            // Translate title attributes
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.getAttribute('data-i18n-title');
                const text = this.t(key);
                if (text !== key) el.title = text;
            });

            // Update page title in header
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                const currentPage = document.querySelector('.nav-link.active')?.getAttribute('data-page');
                if (currentPage) {
                    const titleKey = 'page.' + currentPage.replace(/-/g, '_');
                    const translated = this.t(titleKey);
                    if (translated !== titleKey) pageTitle.textContent = translated;
                }
            }

            console.log(`🌐 Translations applied (${currentLang})`);
        }
    };

    // Expose globally
    window.Translator = Translator;
    window.t = Translator.t.bind(Translator);

})();
