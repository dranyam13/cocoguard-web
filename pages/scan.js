// Scan Page Script
// Version: 2.0 - IIFE Wrapper Fix

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.scanModuleLoaded) {
        console.log('Scan module already loaded, skipping...');
        return;
    }
    window.scanModuleLoaded = true;

    console.log('📷 Scan page script loaded v2.0');

    // Placeholder image for scans without images
    const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23e5e7eb' width='40' height='40'/%3E%3C/svg%3E";

    // Store scan data for viewing details - use window to avoid redeclaration
    if (typeof window.scansData === 'undefined') {
        window.scansData = [];
    }

    // Pagination settings
    const ITEMS_PER_PAGE = 50;

    // Image Zoom State
    let zoomState = {
        scale: 1,
        minScale: 0.25,
        maxScale: 5,
        translateX: 0,
        translateY: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0
    };
    
    // Use window for pagination state
    if (typeof window.scanCurrentPage === 'undefined') {
        window.scanCurrentPage = 1;
    }
    if (typeof window.scanTotalPages === 'undefined') {
        window.scanTotalPages = 1;
    }
    if (typeof window.allScansData === 'undefined') {
        window.allScansData = [];
    }

    // Create local references for convenience (these reference window properties)
    // Use getters/setters pattern to keep in sync
    Object.defineProperty(window, 'currentPage', {
        get: function() { return window.scanCurrentPage; },
        set: function(val) { window.scanCurrentPage = val; },
        configurable: true
    });
    Object.defineProperty(window, 'totalPages', {
        get: function() { return window.scanTotalPages; },
        set: function(val) { window.scanTotalPages = val; },
        configurable: true
    });
    Object.defineProperty(window, 'scansData', {
        get: function() { return window._scansData || []; },
        set: function(val) { window._scansData = val; },
        configurable: true
    });
    Object.defineProperty(window, 'allScansData', {
        get: function() { return window._allScansData || []; },
        set: function(val) { window._allScansData = val; },
        configurable: true
    });

// Get full image URL (prepend API base URL if needed)
function getFullImageUrl(imageUrl) {
    if (!imageUrl) return PLACEHOLDER_IMAGE;
    // If already a full URL or data URL, return as-is
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
        return imageUrl;
    }
    // Get API base URL safely
    const baseUrl = (typeof apiClient !== 'undefined' && apiClient.baseURL)
        ? apiClient.baseURL
        : (() => {
            const host = window.location.hostname;
            const stored = localStorage.getItem('api_base_url');
            const isHostedEnv = /\.(workers\.dev|pages\.dev|onrender\.com)$/i.test(host);
            const invalidStored = isHostedEnv && /(workers\.dev|pages\.dev|onrender\.com):8000/i.test(stored || '');
            return (!invalidStored && stored) || (isHostedEnv
                ? 'https://cocoguard-api.onrender.com'
                : `${window.location.protocol}//${host}:8000`);
        })();
    // Prepend API base URL for relative paths
    return baseUrl + imageUrl;
}

// Handle image load errors
function handleImageError(imgElement) {
    imgElement.onerror = null; // Prevent infinite loop
    imgElement.src = PLACEHOLDER_IMAGE;
}

// Format date for display in Philippine Time (UTC+8)
function formatDateTime(dateString) {
    if (!dateString) return '-';
    // Database stores UTC time without 'Z' suffix, so we need to append it
    // to tell JavaScript to treat it as UTC before converting to local time
    let utcDateString = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+')) {
        utcDateString = dateString + 'Z';
    }
    const date = new Date(utcDateString);
    // Convert to Philippine Time (UTC+8)
    return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Get source badge HTML
function getSourceBadge(source) {
    if (source === 'survey') {
        return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:#e0f2fe;color:#0369a1;font-size:11px;font-weight:600;">📋 Survey</span>';
    }
    return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:#f0fdf4;color:#166534;font-size:11px;font-weight:600;">📷 Image</span>';
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusLower = status?.toLowerCase() || 'pending';
    const statusMap = {
        'pending': { class: 'status-pending', text: 'Pending' },
        'verified': { class: 'status-active', text: 'Verified' },
        'rejected': { class: 'status-inactive', text: 'Rejected' }
    };
    const statusInfo = statusMap[statusLower] || statusMap['pending'];
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// Load scans from API
async function loadScans() {
    const tableBody = document.getElementById('scanTableBody');
    
    try {
        console.log('📡 Fetching scans from API...');
        const scans = await apiClient.adminListScans();
        
        // Sort by ID ascending (FIFO - oldest first, but displayed newest first for better UX)
        // Actually FIFO means first-in-first-out, so oldest scan appears first
        allScansData = (scans || []).sort((a, b) => a.id - b.id);
        
        console.log('✓ Scans loaded:', allScansData.length, 'total');
        
        if (!allScansData || allScansData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                        <div style="margin-bottom: 10px;">📷</div>
                        No scan records found.<br>
                        <small>Scans will appear here when users submit pest detections from the mobile app.</small>
                    </td>
                </tr>
            `;
            updatePaginationControls();
            return;
        }
        
        // Calculate pagination
        totalPages = Math.ceil(allScansData.length / ITEMS_PER_PAGE);
        
        // Ensure current page is valid
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;
        
        // Display current page
        displayCurrentPage();
        
    } catch (error) {
        console.error('❌ Error loading scans:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #dc2626;">
                    Error loading scans: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Display scans for the current page
function displayCurrentPage() {
    const tableBody = document.getElementById('scanTableBody');
    
    // Calculate start and end indices
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, allScansData.length);
    
    // Get scans for current page
    scansData = allScansData.slice(startIndex, endIndex);
    
    console.log(`📄 Displaying page ${currentPage}/${totalPages} (items ${startIndex + 1}-${endIndex} of ${allScansData.length})`);
    
    tableBody.innerHTML = scansData.map(scan => `
        <tr data-id="${scan.id}">
            <td>#${String(scan.id).padStart(3, '0')}</td>
            <td>${formatDateTime(scan.datetime)}</td>
            <td><img src="${escapeHtml(getFullImageUrl(scan.image_url))}" alt="scan" class="scan-thumb" onerror="handleImageError(this)" onclick="openImageZoom('${escapeHtml(getFullImageUrl(scan.image_url))}')" title="Click to zoom"></td>
            <td>${escapeHtml(scan.pest_type || 'Out-of-Scope Pest Detection')}</td>
            <td>${getSourceBadge(scan.source)}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(scan.location_text || 'Unknown Location')}">${escapeHtml(scan.location_text || 'Unknown Location')}</td>
        </tr>
    `).join('');
    
    // Add event listeners for view buttons
    attachScanButtonListeners();
    
    // Update pagination controls
    updatePaginationControls();
}

// Update pagination controls UI
function updatePaginationControls() {
    const paginationContainer = document.getElementById('scanPagination');
    if (!paginationContainer) return;
    
    const totalItems = allScansData.length;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
    
    paginationContainer.innerHTML = `
        <div class="pagination-info">
            Showing <strong>${startItem}-${endItem}</strong> of <strong>${totalItems}</strong> scans
        </div>
        <div class="pagination-buttons">
            <button class="pagination-btn" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''} title="First Page">
                ⏮️
            </button>
            <button class="pagination-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} title="Previous">
                ◀️
            </button>
            <span class="pagination-current">Page ${currentPage} of ${totalPages || 1}</span>
            <button class="pagination-btn" onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} title="Next">
                ▶️
            </button>
            <button class="pagination-btn" onclick="goToPage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''} title="Last Page">
                ⏭️
            </button>
        </div>
    `;
}

// Navigate to a specific page
function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayCurrentPage();
    
    // Scroll to top of table
    const tableCard = document.querySelector('.table-card');
    if (tableCard) {
        tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Make goToPage available globally
window.goToPage = goToPage;

// Attach event listeners to table rows for viewing scan details
function attachScanButtonListeners() {
    // Click on table rows to open scan detail modal
    document.querySelectorAll('#scanTableBody tr[data-id]').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            // Don't trigger if clicking on image (image has its own zoom handler)
            if (e.target.tagName === 'IMG') return;
            const scanId = parseInt(row.dataset.id);
            const scan = scansData.find(s => s.id === scanId);
            if (scan) {
                openScanDetailModal(scan);
            }
        });
    });
}

// Open scan detail modal
function openScanDetailModal(scan) {
    const modal = document.getElementById('scanDetailModal');
    const content = document.getElementById('scanDetailContent');
    
    // Determine which action buttons to show based on current status
    const statusLower = scan.status?.toLowerCase() || 'pending';
    let actionButtons = '';
    
    if (statusLower === 'pending') {
        actionButtons = `
            <div class="scan-action-buttons" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-success" onclick="updateScanStatus(${scan.id}, 'verified')" style="background: #22c55e; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                    ✓ Verify Scan
                </button>
                <button class="btn btn-danger" onclick="updateScanStatus(${scan.id}, 'rejected')" style="background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                    ✗ Reject Scan
                </button>
            </div>
        `;
    } else if (statusLower === 'verified') {
        actionButtons = `
            <div class="scan-action-buttons" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-warning" onclick="updateScanStatus(${scan.id}, 'pending')" style="background: #f59e0b; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                    ↺ Set to Pending
                </button>
                <button class="btn btn-danger" onclick="updateScanStatus(${scan.id}, 'rejected')" style="background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                    ✗ Reject Scan
                </button>
            </div>
        `;
    } else if (statusLower === 'rejected') {
        actionButtons = `
            <div class="scan-action-buttons" style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-success" onclick="updateScanStatus(${scan.id}, 'verified')" style="background: #22c55e; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                    ✓ Verify Scan
                </button>
                <button class="btn btn-warning" onclick="updateScanStatus(${scan.id}, 'pending')" style="background: #f59e0b; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                    ↺ Set to Pending
                </button>
            </div>
        `;
    }
    
    content.innerHTML = `
        ${scan.image_url ? `<img src="${escapeHtml(getFullImageUrl(scan.image_url))}" class="scan-detail-image" alt="Scan Image" onerror="handleImageError(this)" onclick="openImageZoom('${escapeHtml(getFullImageUrl(scan.image_url))}')"> ` : ''}
        <div class="scan-detail-row">
            <span class="scan-detail-label">Scan ID</span>
            <span class="scan-detail-value">#${String(scan.id).padStart(3, '0')}</span>
        </div>
        <div class="scan-detail-row">
            <span class="scan-detail-label">Date & Time</span>
            <span class="scan-detail-value">${formatDateTime(scan.datetime)}</span>
        </div>
        <div class="scan-detail-row">
            <span class="scan-detail-label">Submitted By</span>
            <span class="scan-detail-value">${escapeHtml(scan.user || '-')}</span>
        </div>
        <div class="scan-detail-row">
            <span class="scan-detail-label">Source</span>
            <span class="scan-detail-value">${getSourceBadge(scan.source)}</span>
        </div>
        <div class="scan-detail-row">
            <span class="scan-detail-label">Detected Pest</span>
            <span class="scan-detail-value">${escapeHtml(scan.pest_type || '-')}</span>
        </div>
        <div class="scan-detail-row">
            <span class="scan-detail-label">Confidence</span>
            <span class="scan-detail-value">${scan.confidence ? scan.confidence.toFixed(1) + '%' : '-'}</span>
        </div>
        <div class="scan-detail-row">
            <span class="scan-detail-label">Status</span>
            <span class="scan-detail-value">${getStatusBadge(scan.status)}</span>
        </div>
        ${scan.pest_type && scan.pest_type !== 'Out-of-Scope Pest Detection' ? `
        <div style="margin-top: 16px; padding: 12px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
            <div style="font-weight: 600; color: #166534; margin-bottom: 8px;">🛠️ Management Strategies</div>
            <button class="btn" onclick="viewManagementStrategies('${escapeHtml(scan.pest_type)}')" style="background: #166534; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
                View Strategies for ${escapeHtml(scan.pest_type)}
            </button>
        </div>
        ` : ''}
        ${actionButtons}
    `;
    
    modal.style.display = 'flex';
}

// Update scan status (verify/reject)
async function updateScanStatus(scanId, newStatus) {
    try {
        console.log(`📝 Updating scan ${scanId} to status: ${newStatus}`);
        
        await apiClient.updateScanStatus(scanId, newStatus);
        
        // Show success message
        alert(`Scan #${String(scanId).padStart(3, '0')} has been ${newStatus}!`);
        
        // Close modal and reload scans
        closeScanModal();
        loadScans();
        
    } catch (error) {
        console.error('❌ Error updating scan status:', error);
        alert('Error updating scan status: ' + error.message);
    }
}

// Close scan detail modal
function closeScanModal() {
    document.getElementById('scanDetailModal').style.display = 'none';
}

// ============================================
// IMAGE ZOOM FUNCTIONALITY
// ============================================

// Open image zoom modal
function openImageZoom(imageUrl) {
    const modal = document.getElementById('imageZoomModal');
    const zoomImage = document.getElementById('zoomImage');
    
    if (!modal || !zoomImage) {
        console.error('Zoom modal elements not found');
        return;
    }
    
    // Reset zoom state
    zoomState.scale = 1;
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    
    // Set image source
    zoomImage.src = imageUrl;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Update zoom display
    updateZoomDisplay();
    
    console.log('🔍 Image zoom modal opened');
}

// Close image zoom modal
function closeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update zoom level display
function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoomLevel');
    const zoomImage = document.getElementById('zoomImage');
    
    if (zoomLevel) {
        zoomLevel.textContent = Math.round(zoomState.scale * 100) + '%';
    }
    
    if (zoomImage) {
        zoomImage.style.transform = `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`;
    }
}

// Zoom in function
function zoomIn() {
    if (zoomState.scale < zoomState.maxScale) {
        zoomState.scale = Math.min(zoomState.scale * 1.25, zoomState.maxScale);
        updateZoomDisplay();
    }
}

// Zoom out function
function zoomOut() {
    if (zoomState.scale > zoomState.minScale) {
        zoomState.scale = Math.max(zoomState.scale / 1.25, zoomState.minScale);
        // Reset position if zoomed out too much
        if (zoomState.scale <= 1) {
            zoomState.translateX = 0;
            zoomState.translateY = 0;
        }
        updateZoomDisplay();
    }
}

// Reset zoom to 100%
function zoomReset() {
    zoomState.scale = 1;
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    updateZoomDisplay();
}

// Fit image to screen
function zoomFit() {
    const container = document.getElementById('zoomImageContainer');
    const zoomImage = document.getElementById('zoomImage');
    
    if (!container || !zoomImage) return;
    
    // Reset position first
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    
    // Calculate fit scale
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageWidth = zoomImage.naturalWidth || zoomImage.width;
    const imageHeight = zoomImage.naturalHeight || zoomImage.height;
    
    if (imageWidth && imageHeight) {
        const scaleX = containerWidth / imageWidth;
        const scaleY = containerHeight / imageHeight;
        zoomState.scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some margin
    } else {
        zoomState.scale = 1;
    }
    
    updateZoomDisplay();
}

// Handle mouse wheel zoom
function handleWheelZoom(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -1 : 1;
    const zoomFactor = 1.1;
    
    if (delta > 0) {
        // Zoom in
        if (zoomState.scale < zoomState.maxScale) {
            zoomState.scale = Math.min(zoomState.scale * zoomFactor, zoomState.maxScale);
        }
    } else {
        // Zoom out
        if (zoomState.scale > zoomState.minScale) {
            zoomState.scale = Math.max(zoomState.scale / zoomFactor, zoomState.minScale);
            // Reset position if zoomed out
            if (zoomState.scale <= 1) {
                zoomState.translateX = 0;
                zoomState.translateY = 0;
            }
        }
    }
    
    updateZoomDisplay();
}

// Handle mouse drag for panning
function handleDragStart(e) {
    if (zoomState.scale <= 1) return; // Only allow panning when zoomed in
    
    zoomState.isDragging = true;
    zoomState.startX = e.clientX - zoomState.translateX;
    zoomState.startY = e.clientY - zoomState.translateY;
    
    const container = document.getElementById('zoomImageContainer');
    if (container) {
        container.style.cursor = 'grabbing';
    }
}

function handleDragMove(e) {
    if (!zoomState.isDragging) return;
    
    e.preventDefault();
    zoomState.translateX = e.clientX - zoomState.startX;
    zoomState.translateY = e.clientY - zoomState.startY;
    updateZoomDisplay();
}

function handleDragEnd() {
    zoomState.isDragging = false;
    
    const container = document.getElementById('zoomImageContainer');
    if (container) {
        container.style.cursor = zoomState.scale > 1 ? 'grab' : 'default';
    }
}

// Initialize zoom modal event listeners
function initZoomModal() {
    const modal = document.getElementById('imageZoomModal');
    const closeBtn = document.getElementById('closeZoomModal');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const zoomFitBtn = document.getElementById('zoomFitBtn');
    const container = document.getElementById('zoomImageContainer');
    const zoomImage = document.getElementById('zoomImage');
    
    if (!modal) {
        console.log('⚠️ Zoom modal not found, skipping initialization');
        return;
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageZoom);
    }
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageZoom();
        }
    });
    
    // Zoom controls
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', zoomReset);
    if (zoomFitBtn) zoomFitBtn.addEventListener('click', zoomFit);
    
    // Mouse wheel zoom
    if (container) {
        container.addEventListener('wheel', handleWheelZoom, { passive: false });
        
        // Drag to pan
        container.addEventListener('mousedown', handleDragStart);
        container.addEventListener('mousemove', handleDragMove);
        container.addEventListener('mouseup', handleDragEnd);
        container.addEventListener('mouseleave', handleDragEnd);
    }
    
    // Double-click to reset
    if (zoomImage) {
        zoomImage.addEventListener('dblclick', zoomReset);
        
        // When image loads, fit to screen
        zoomImage.addEventListener('load', () => {
            zoomFit();
        });
    }
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeImageZoom();
        }
        // Keyboard shortcuts for zoom
        if (modal.style.display === 'flex') {
            if (e.key === '+' || e.key === '=') zoomIn();
            if (e.key === '-') zoomOut();
            if (e.key === '0') zoomReset();
        }
    });
    
    console.log('✅ Zoom modal initialized');
}

// Make zoom function globally available
window.openImageZoom = openImageZoom;
window.closeImageZoom = closeImageZoom;

// View management strategies for a pest
async function viewManagementStrategies(pestType) {
    try {
        const data = await apiClient.request(`/management-strategies/${encodeURIComponent(pestType)}`);
        if (!data || !data.strategies) {
            alert('No management strategies found for ' + pestType);
            return;
        }

        // Build strategies HTML
        let strategiesHtml = `
            <div style="max-height: 70vh; overflow-y: auto; padding: 4px;">
                <h3 style="color: #166534; margin-bottom: 4px;">🛠️ ${data.pest_name}</h3>
                <p style="color: #666; font-style: italic; font-size: 13px; margin-bottom: 16px;">${data.scientific_name} | ${data.reference_pages}</p>
        `;

        const categoryColors = {
            'Cultural Control': { bg: '#f0fdf4', border: '#86efac', header: '#166534' },
            'Mechanical / Physical Control': { bg: '#eff6ff', border: '#93c5fd', header: '#1e40af' },
            'Biological Control': { bg: '#fdf2f8', border: '#f9a8d4', header: '#9d174d' },
            'Chemical Control': { bg: '#fffbeb', border: '#fcd34d', header: '#92400e' },
        };

        for (const strategy of data.strategies) {
            const colors = categoryColors[strategy.category] || { bg: '#f9fafb', border: '#d1d5db', header: '#374151' };
            strategiesHtml += `
                <div style="margin-bottom: 12px; border: 1px solid ${colors.border}; border-radius: 8px; overflow: hidden;">
                    <div style="background: ${colors.bg}; padding: 10px 14px; font-weight: 600; color: ${colors.header};">
                        ${strategy.icon} ${strategy.category}
                    </div>
                    <div style="padding: 12px 14px;">
                        <ul style="margin: 0; padding-left: 18px;">
                            ${strategy.items.map(item => `<li style="margin-bottom: 6px; font-size: 13px; line-height: 1.5; color: #374151;">${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        strategiesHtml += `
                <div style="margin-top: 12px; padding: 10px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; font-size: 12px; color: #9a3412;">
                    ⚠️ Kumunsulta sa Philippine Coconut Authority (PCA) bago gumamit ng anumang chemical treatment.
                </div>
            </div>
        `;

        // Show in scan detail modal (reuse existing modal)
        const content = document.getElementById('scanDetailContent');
        content.innerHTML = strategiesHtml + `
            <div style="margin-top: 16px; text-align: center;">
                <button onclick="closeScanModal()" style="background: #166534; color: white; padding: 10px 24px; border: none; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
        `;
    } catch (error) {
        console.error('Error loading management strategies:', error);
        alert('Error loading management strategies: ' + error.message);
    }
}

window.viewManagementStrategies = viewManagementStrategies;
window.handleImageError = handleImageError;
window.updateScanStatus = updateScanStatus;
window.closeScanModal = closeScanModal;

// Export scans to CSV
function exportScansToCSV() {
    if (scansData.length === 0) {
        alert('No scans to export');
        return;
    }
    
    const headers = ['ID', 'Date & Time', 'User', 'Pest Type', 'Source', 'Status'];
    const rows = scansData.map(scan => [
        scan.id,
        formatDateTime(scan.datetime),
        scan.user || '',
        scan.pest_type || '',
        scan.source || 'image',
        scan.status || ''
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cocoguard_scans_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Initialize scan page
function initScan() {
    console.log('🔧 Initializing scan module...');
    
    try {
        const closeScanModalBtn = document.getElementById('closeScanModal');
        const scanDetailModal = document.getElementById('scanDetailModal');
        
        if (closeScanModalBtn) {
            closeScanModalBtn.addEventListener('click', closeScanModal);
        }
        
        if (scanDetailModal) {
            scanDetailModal.addEventListener('click', (e) => {
                if (e.target === scanDetailModal) {
                    closeScanModal();
                }
            });
        }
        
        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && scanDetailModal && scanDetailModal.style.display === 'flex') {
                closeScanModal();
            }
        });
        
        // Initialize image zoom modal
        initZoomModal();
        
        // Load scans from API
        loadScans();
        
        console.log('✅ Scan module initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing scan:', err);
    }
}

// Export for use in main script
window.scanModule = {
    init: initScan,
    reload: loadScans
};

console.log('✓ scanModule exported v2.0');

})(); // End IIFE