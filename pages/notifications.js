/**
 * Notifications Module - Pest Alert Management
 * Handles fetching and displaying pest alert notifications from the API
 */

// Wrap in IIFE to prevent duplicate declarations on script reload
(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.notificationsModuleLoaded) {
        console.log('Notifications module already loaded, skipping...');
        return;
    }
    window.notificationsModuleLoaded = true;

    // Global notification state (use window to avoid redeclaration issues)
    if (typeof window.notificationsData === 'undefined') {
        window.notificationsData = [];
    }

    // Polling interval reference
    let pollingInterval = null;
    let currentView = 'cards';
    let currentFilter = { type: 'all', time: 'all', search: '' };

    /**
     * Initialize notifications module
     */
    function initNotifications() {
        console.log('Initializing notifications module...');
        loadNotifications();
        setupNotificationEventListeners();
        setupFilters();
        
        // Clear existing interval if any
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }
        // Start polling for new notifications every 30 seconds
        pollingInterval = setInterval(checkForNewAlerts, 30000);
    }

    /**
     * Setup filter and view controls
     */
    function setupFilters() {
        const searchInput = document.getElementById('alertSearchInput');
        const filterType = document.getElementById('alertFilterType');
        const filterTime = document.getElementById('alertFilterTime');
        const viewButtons = document.querySelectorAll('.view-btn');

        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                currentFilter.search = e.target.value.toLowerCase();
                renderNotifications();
            }, 300));
        }

        if (filterType) {
            filterType.addEventListener('change', (e) => {
                currentFilter.type = e.target.value;
                renderNotifications();
            });
        }

        if (filterTime) {
            filterTime.addEventListener('change', (e) => {
                currentFilter.time = e.target.value;
                renderNotifications();
            });
        }

        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                const list = document.getElementById('notificationsList');
                if (list) {
                    list.classList.toggle('compact-view', currentView === 'compact');
                }
            });
        });
    }

    /**
     * Debounce helper
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

/**
 * Setup event listeners
 */
function setupNotificationEventListeners() {
    const refreshBtn = document.getElementById('refreshNotificationsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadNotifications);
    }
    
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', markAllNotificationsRead);
    }
    
    // Header notification bell click
    const bellBtn = document.getElementById('notificationBell');
    if (bellBtn) {
        bellBtn.addEventListener('click', () => {
            // Navigate to notifications page
            window.location.hash = '#notifications';
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.page === 'notifications') {
                    link.classList.add('active');
                }
            });
        });
    }
}

/**
 * Load notifications from API
 */
async function loadNotifications() {
    const loadingEl = document.getElementById('notificationsLoading');
    const emptyEl = document.getElementById('notificationsEmpty');
    const listEl = document.getElementById('notificationsList');
    
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (listEl) listEl.classList.add('hidden');
    
    try {
        // Use the global apiClient instance
        const data = await apiClient.request('/notifications/admin/pest-alerts?limit=50');
        
        // Debug: Log the first notification's created_at value
        if (data && data.length > 0) {
            console.log('[API DEBUG] First notification created_at:', data[0].created_at);
            console.log('[API DEBUG] Parsed as Date:', new Date(data[0].created_at));
        }
        
        window.notificationsData = data || [];
        renderNotifications();
        updateAlertBadge();
    } catch (error) {
        console.error('Error loading notifications:', error);
        showNotificationError('Error connecting to server: ' + error.message);
    }
    
    if (loadingEl) loadingEl.classList.add('hidden');
}

/**
 * Render notifications list
 */
function renderNotifications() {
    const emptyEl = document.getElementById('notificationsEmpty');
    const listEl = document.getElementById('notificationsList');
    
    if (!listEl) return;
    
    // Filter notifications
    const filteredData = filterNotifications(window.notificationsData);
    
    // Update statistics
    updateStatistics(window.notificationsData);
    
    if (filteredData.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
        listEl.classList.add('hidden');
        return;
    }
    
    if (emptyEl) emptyEl.classList.add('hidden');
    listEl.classList.remove('hidden');
    
    listEl.innerHTML = filteredData.map(notification => {
        const isAPW = notification.pest_type && 
            (notification.pest_type.includes('APW') || 
             notification.pest_type.toLowerCase().includes('asiatic'));
        
        const isOOSReport = notification.title && 
            notification.title.toLowerCase().includes('out-of-scope');
        
        const date = new Date(notification.created_at);
        const formattedDate = formatNotificationDate(date);
        
        // Truncate location for cleaner display
        const location = notification.location_text || 'Unknown location';
        const shortLocation = location.length > 50 ? location.substring(0, 50) + '...' : location;
        
        // Determine icon and badge based on notification type
        let icon = '🔔';
        let badgeClass = 'warning';
        let badgeText = 'WARNING';
        if (isOOSReport) {
            icon = '🔍';
            badgeClass = 'info';
            badgeText = 'OOS REPORT';
        } else if (isAPW) {
            icon = '⚠️';
            badgeClass = 'critical';
            badgeText = 'CRITICAL';
        }
        
        return `
            <div class="alert-item" data-id="${notification.id}">
                <div class="alert-icon ${isAPW ? 'critical' : isOOSReport ? 'info' : 'normal'}">
                    ${icon}
                </div>
                <div class="alert-content">
                    <div class="alert-header">
                        <div class="alert-type">
                            <span class="alert-badge ${badgeClass}" ${isOOSReport ? 'style="background:#fff3e0;color:#e65100;border:1px solid #ffcc80;"' : ''}>
                                ${badgeText}
                            </span>
                            <span class="pest-name">${isOOSReport ? 'Out-of-Scope Report' : escapeHtml(notification.pest_type || 'Pest Detected')}</span>
                        </div>
                        <span class="alert-time">${formattedDate}</span>
                    </div>
                    <p class="alert-message">${escapeHtml(notification.message || 'A pest has been detected in the field.')}</p>
                    <div class="alert-footer">
                        <div class="alert-location">
                            ${isOOSReport ? '📋' : '📍'} ${isOOSReport ? 'User Report' : escapeHtml(shortLocation)}
                            ${notification.scan_id ? `<span class="scan-id">#${notification.scan_id}</span>` : ''}
                        </div>
                        <div class="alert-actions">
                            ${notification.latitude && notification.longitude ? `
                            <button class="btn-action secondary" onclick="event.stopPropagation(); viewOnMap(${notification.latitude}, ${notification.longitude})">
                                🗺️ Map
                            </button>
                            ` : ''}
                            <button class="btn-action primary" onclick="event.stopPropagation(); viewNotificationDetails(${notification.id})">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filter notifications based on current filters
 */
function filterNotifications(data) {
    if (!data) return [];
    
    return data.filter(notification => {
        // Type filter
        if (currentFilter.type !== 'all') {
            const isAPW = notification.pest_type && 
                (notification.pest_type.includes('APW') || 
                 notification.pest_type.toLowerCase().includes('asiatic'));
            if (currentFilter.type === 'apw' && !isAPW) return false;
            if (currentFilter.type === 'other' && isAPW) return false;
        }
        
        // Time filter
        if (currentFilter.time !== 'all') {
            const date = new Date(notification.created_at);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (currentFilter.time === 'today' && diffDays > 0) return false;
            if (currentFilter.time === 'week' && diffDays > 7) return false;
            if (currentFilter.time === 'month' && diffDays > 30) return false;
        }
        
        // Search filter
        if (currentFilter.search) {
            const searchStr = currentFilter.search.toLowerCase();
            const matchesLocation = notification.location_text?.toLowerCase().includes(searchStr);
            const matchesPest = notification.pest_type?.toLowerCase().includes(searchStr);
            const matchesMessage = notification.message?.toLowerCase().includes(searchStr);
            if (!matchesLocation && !matchesPest && !matchesMessage) return false;
        }
        
        return true;
    });
}

/**
 * Update statistics cards
 */
function updateStatistics(data) {
    if (!data) return;
    
    const criticalCount = data.filter(n => 
        n.pest_type && (n.pest_type.includes('APW') || n.pest_type.toLowerCase().includes('asiatic'))
    ).length;
    
    const uniqueLocations = new Set(data.map(n => n.location_text).filter(Boolean)).size;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = data.filter(n => new Date(n.created_at) >= today).length;
    
    const criticalEl = document.getElementById('criticalCount');
    const totalEl = document.getElementById('totalAlerts');
    const locationsEl = document.getElementById('locationsCount');
    const todayEl = document.getElementById('todayAlerts');
    
    if (criticalEl) criticalEl.textContent = criticalCount;
    if (totalEl) totalEl.textContent = data.length;
    if (locationsEl) locationsEl.textContent = uniqueLocations;
    if (todayEl) todayEl.textContent = todayCount;
}

/**
 * View notification details - displays scan image and details
 */
function viewNotificationDetails(notificationId) {
    if (!notificationId) {
        alert('Alert details not available');
        return;
    }
    
    // Find the notification in our data
    const notification = window.notificationsData.find(n => n.id === notificationId);
    
    if (!notification) {
        alert('Alert not found');
        return;
    }
    
    const modal = document.getElementById('scanDetailsModal');
    const modalBody = document.getElementById('scanDetailsBody');
    const modalTitle = document.getElementById('scanDetailsTitle');
    
    if (!modal || !modalBody) return;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Format date
    const date = new Date(notification.created_at);
    const formattedDate = date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    // Update modal title - use sequential index based on position in list
    const isOOSReport = notification.title && 
        notification.title.toLowerCase().includes('out-of-scope');
    const allData = window.notificationsData || [];
    // Separate OOS and pest alerts, find 1-based index within their own type
    const sameTypeNotifications = allData.filter(n => {
        const nIsOOS = n.title && n.title.toLowerCase().includes('out-of-scope');
        return isOOSReport ? nIsOOS : !nIsOOS;
    });
    // Sort oldest first for sequential numbering
    const sortedSameType = [...sameTypeNotifications].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const seqIndex = sortedSameType.findIndex(n => n.id === notification.id) + 1;
    const displayNum = seqIndex > 0 ? seqIndex : 1;
    modalTitle.textContent = isOOSReport 
        ? `Out-of-Scope Report #${String(displayNum).padStart(3, '0')}`
        : `Pest Alert #${String(displayNum).padStart(3, '0')}`;
    
    // Mark this notification as read and update badge
    markNotificationViewed(notification.id);
    
    // Get image URL from notification - use dynamic hostname
    let imageUrl = '';
    if (notification.image_url) {
        const host = window.location.hostname;
        const stored = localStorage.getItem('api_base_url');
        const isHostedEnv = /\.(workers\.dev|pages\.dev|onrender\.com)$/i.test(host);
        const invalidStored = isHostedEnv && /(workers\.dev|pages\.dev|onrender\.com):8000/i.test(stored || '');
        const apiBase = (!invalidStored && stored) || (isHostedEnv
            ? 'https://cocoguard-api.onrender.com'
            : `${window.location.protocol}//${host}:8000`);
        imageUrl = notification.image_url.startsWith('http') ? 
            notification.image_url : 
            `${apiBase}${notification.image_url}`;
    }
    
    // Build modal content
    modalBody.innerHTML = `
        ${imageUrl ? `
        <div class="scan-image-container" style="position:relative;overflow:hidden;border-radius:12px;margin-bottom:20px;background:#000;cursor:zoom-in;" onclick="openImageViewer('${escapeHtml(imageUrl)}')">
            <img src="${escapeHtml(imageUrl)}" alt="Scan Image" class="scan-detail-image" style="width:100%;display:block;max-height:400px;object-fit:contain;">
            <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;">🔍 Click to zoom</div>
        </div>` : '<div style="background: #f3f4f6; padding: 40px; text-align: center; border-radius: 12px; margin-bottom: 20px; color: #9ca3af;">📷 Image not available</div>'}
        
        <div class="scan-detail-grid">
            <div class="scan-detail-item">
                <div class="scan-detail-label">Pest Type</div>
                <div class="scan-detail-value">${escapeHtml(notification.pest_type || 'Unknown')}</div>
            </div>
            
            <div class="scan-detail-item">
                <div class="scan-detail-label">Detection Date</div>
                <div class="scan-detail-value">${formattedDate}</div>
            </div>
            
            <div class="scan-detail-item scan-detail-full">
                <div class="scan-detail-label">Location</div>
                <div class="scan-detail-value">${escapeHtml(notification.location_text || 'Unknown location')}</div>
            </div>
            
            ${notification.latitude && notification.longitude ? `
            <div class="scan-detail-item">
                <div class="scan-detail-label">Coordinates</div>
                <div class="scan-detail-value">${notification.latitude}, ${notification.longitude}</div>
            </div>
            ` : ''}
            
            ${notification.farmer_name ? `
            <div class="scan-detail-item">
                <div class="scan-detail-label">Submitted By</div>
                <div class="scan-detail-value">${escapeHtml(notification.farmer_name)}</div>
            </div>
            ` : ''}
            
            ${notification.message ? `
            <div class="scan-detail-item scan-detail-full">
                <div class="scan-detail-label">Alert Message</div>
                <div class="scan-detail-value">${escapeHtml(notification.message)}</div>
            </div>
            ` : ''}
        </div>
        
        <div class="scan-detail-actions">
            ${notification.latitude && notification.longitude ? `
            <button class="btn-action primary" onclick="viewOnMap(${notification.latitude}, ${notification.longitude})">
                🗺️ View on Map
            </button>
            ` : ''}
            <button class="btn-action secondary" onclick="closeScanDetailsModal()">
                Close
            </button>
        </div>
    `;
}

/**
 * View location on map - Opens Google Maps with coordinates
 */
function viewOnMap(lat, lng) {
    // Convert to numbers and validate
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude) || !latitude || !longitude) {
        alert('❌ Location coordinates not available for this alert.');
        return;
    }
    
    // Open Google Maps with the coordinates
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;
    window.open(mapsUrl, '_blank');
}

/**
 * Close scan details modal
 */
function closeScanDetailsModal() {
    const modal = document.getElementById('scanDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions globally accessible
window.viewNotificationDetails = viewNotificationDetails;
window.viewOnMap = viewOnMap;
window.closeScanDetailsModal = closeScanDetailsModal;
window.openImageViewer = openImageViewer;
window.closeImageViewer = closeImageViewer;

/**
 * Open full-screen image viewer with zoom and pan support
 */
function openImageViewer(imageUrl) {
    // Remove existing viewer if any
    const existing = document.getElementById('imageViewerOverlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'imageViewerOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.92); z-index: 10000; display: flex;
        align-items: center; justify-content: center; cursor: grab;
    `;
    
    overlay.innerHTML = `
        <div style="position:absolute;top:16px;right:16px;display:flex;gap:10px;z-index:10001;">
            <button onclick="zoomImageViewer(1.3)" style="background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:22px;width:42px;height:42px;border-radius:50%;cursor:pointer;" title="Zoom In">+</button>
            <button onclick="zoomImageViewer(0.7)" style="background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:22px;width:42px;height:42px;border-radius:50%;cursor:pointer;" title="Zoom Out">−</button>
            <button onclick="resetImageViewer()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:16px;width:42px;height:42px;border-radius:50%;cursor:pointer;" title="Reset">↺</button>
            <button onclick="closeImageViewer()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:22px;width:42px;height:42px;border-radius:50%;cursor:pointer;" title="Close">✕</button>
        </div>
        <img id="viewerImage" src="${imageUrl}" alt="Scan Image" style="max-width:90vw;max-height:85vh;object-fit:contain;transform:scale(1) translate(0px,0px);transition:transform 0.15s ease;user-select:none;pointer-events:none;">
        <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.5);font-size:13px;">
            Scroll to zoom · Drag to pan · Click background to close
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // State for zoom/pan
    let scale = 1, translateX = 0, translateY = 0;
    let isDragging = false, startX = 0, startY = 0;
    
    const img = document.getElementById('viewerImage');
    
    function applyTransform() {
        img.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }
    
    // Zoom with scroll wheel
    overlay.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        scale = Math.max(0.3, Math.min(10, scale * factor));
        applyTransform();
    }, { passive: false });
    
    // Drag to pan
    overlay.addEventListener('mousedown', (e) => {
        if (e.target === img || scale > 1) {
            isDragging = true;
            startX = e.clientX - translateX * scale;
            startY = e.clientY - translateY * scale;
            overlay.style.cursor = 'grabbing';
        }
    });
    
    overlay.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = (e.clientX - startX) / scale;
        translateY = (e.clientY - startY) / scale;
        applyTransform();
    });
    
    overlay.addEventListener('mouseup', () => {
        isDragging = false;
        overlay.style.cursor = 'grab';
    });
    
    // Click background to close (only if not dragging and not zoomed in)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay && scale <= 1) {
            closeImageViewer();
        }
    });
    
    // Escape key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeImageViewer();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Expose zoom/reset for buttons
    window.zoomImageViewer = function(factor) {
        scale = Math.max(0.3, Math.min(10, scale * factor));
        applyTransform();
    };
    
    window.resetImageViewer = function() {
        scale = 1; translateX = 0; translateY = 0;
        applyTransform();
    };
}

/**
 * Close the full-screen image viewer
 */
function closeImageViewer() {
    const overlay = document.getElementById('imageViewerOverlay');
    if (overlay) overlay.remove();
}

/**
 * Format notification date for display
 * Server returns ISO timestamps with timezone info (Asia/Manila UTC+8)
 */
function formatNotificationDate(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Handle case where diff is negative (shouldn't happen with proper timezone)
    if (diff < 0) {
        return 'Just now';
    }
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

/**
 * Check for new alerts (called periodically)
 */
async function checkForNewAlerts() {
    try {
        const data = await apiClient.request('/notifications/admin/pest-alerts?limit=1');
        if (data && data.length > 0) {
            const latestId = data[0].id;
            const currentLatestId = window.notificationsData.length > 0 ? window.notificationsData[0].id : 0;
            
            if (latestId > currentLatestId) {
                // New notification detected
                console.log('New pest alert detected!');
                loadNotifications();
                
                // Show browser notification if supported
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('⚠️ New Pest Alert!', {
                        body: 'A dangerous pest has been detected. Check the admin panel.',
                        icon: '🥥'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error checking for new alerts:', error);
    }
}

/**
 * Mark all notifications as read - hides the badge immediately
 */
async function markAllNotificationsRead() {
    // Store all current notification IDs as read (as strings for consistent comparison)
    const allIds = window.notificationsData.map(n => String(n.id));
    localStorage.setItem('readNotificationIds', JSON.stringify(allIds));
    
    // Hide the badge in navigation immediately
    const navBadge = document.getElementById('navAlertBadge');
    if (navBadge) {
        navBadge.classList.add('hidden');
        navBadge.textContent = '0';
    }
    
    // Show confirmation
    const markBtn = document.getElementById('markAllReadBtn');
    if (markBtn) {
        const originalText = markBtn.innerHTML;
        markBtn.innerHTML = '✓ Marked as Read';
        markBtn.style.background = '#16a34a';
        setTimeout(() => {
            markBtn.innerHTML = originalText;
            markBtn.style.background = '';
        }, 2000);
    }
}

/**
 * Mark a single notification as viewed (by storing its ID)
 */
function markNotificationViewed(notificationId) {
    const readIds = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
    const idStr = String(notificationId);
    if (!readIds.includes(idStr)) {
        readIds.push(idStr);
        localStorage.setItem('readNotificationIds', JSON.stringify(readIds));
    }
    updateAlertBadge();
}

/**
 * Get unread notification count (notifications not yet individually viewed)
 */
function getUnreadCount() {
    const readIds = JSON.parse(localStorage.getItem('readNotificationIds') || '[]');
    // Convert to strings for consistent comparison
    return window.notificationsData.filter(n => !readIds.includes(String(n.id))).length;
}

/**
 * Update alert badge count in header and nav (only unread)
 */
function updateAlertBadge() {
    const unreadCount = getUnreadCount();
    
    const navBadge = document.getElementById('navAlertBadge');
    
    if (navBadge) {
        if (unreadCount > 0) {
            navBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            navBadge.classList.remove('hidden');
        } else {
            navBadge.classList.add('hidden');
        }
    }
}

/**
 * Show error message
 */
function showNotificationError(message) {
    const listEl = document.getElementById('notificationsList');
    const emptyEl = document.getElementById('notificationsEmpty');
    
    if (emptyEl) {
        emptyEl.innerHTML = `
            <div class="icon">❌</div>
            <h3>Error Loading Alerts</h3>
            <p>${message}</p>
            <button class="btn-refresh" onclick="loadNotifications()" style="margin-top: 15px;">
                🔄 Try Again
            </button>
        `;
        emptyEl.classList.remove('hidden');
    }
    
    if (listEl) listEl.classList.add('hidden');
}

/**
 * Request browser notification permission
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Initialize on page load if on notifications page
if (typeof window !== 'undefined') {
    // Request notification permission
    requestNotificationPermission();
}

// Export module for main script
window.notificationsModule = {
    init: initNotifications,
    reload: loadNotifications
};

// Also export individual functions
window.initNotifications = initNotifications;
window.checkForNewAlerts = checkForNewAlerts;
window.updateAlertBadge = updateAlertBadge;
window.markAllNotificationsRead = markAllNotificationsRead;
window.markNotificationViewed = markNotificationViewed;

console.log('✓ notificationsModule exported');

})(); // End IIFE