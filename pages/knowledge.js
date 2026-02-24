// Knowledge Base Page Script
// Version: 2.0 - IIFE Wrapper Fix

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.knowledgeModuleLoaded) {
        console.log('Knowledge module already loaded, skipping...');
        return;
    }
    window.knowledgeModuleLoaded = true;

    console.log('📚 Knowledge Base page script loaded v2.0');

    // Use window to avoid redeclaration
    if (typeof window.KNOWLEDGE_API_BASE_URL === 'undefined') {
        window.KNOWLEDGE_API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;
    }
    var API_BASE_URL = window.KNOWLEDGE_API_BASE_URL;

// Helper function to get the full image URL from the API server
function getKnowledgeImageUrl(imageUrl) {
    if (!imageUrl) return null;
    const trimmedUrl = imageUrl.trim();
    
    // If already an absolute URL, use as-is
    if (/^https?:\/\//i.test(trimmedUrl)) {
        return trimmedUrl;
    }
    
    // Get just the filename
    const filename = trimmedUrl.split('/').pop();
    
    // Construct the full URL to the API server's uploads endpoint
    return `${API_BASE_URL}/uploads/files/${filename}`;
}

// Get auth token
function getAuthToken() {
    // Try both keys for compatibility
    return localStorage.getItem('access_token') || localStorage.getItem('token');
}

// Format date in Philippine Time (UTC+8)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    // Database stores UTC time without 'Z' suffix
    let utcDateString = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+')) {
        utcDateString = dateString + 'Z';
    }
    const date = new Date(utcDateString);
    return date.toLocaleDateString('en-PH', { 
        timeZone: 'Asia/Manila',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Load articles (with offline support)
async function loadArticles() {
    try {
        const token = getAuthToken();
        if (!token) {
            console.warn('No auth token found');
            return;
        }

        let articles = [];
        let online = navigator.onLine;
        if (online) {
            try {
                const response = await fetch(`${API_BASE_URL}/knowledge/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Network error');
                articles = await response.json();
                // Save to IndexedDB for offline use
                if (typeof saveArticles === 'function') await saveArticles(articles);
                console.log('✓ Articles loaded from API:', articles);
            } catch (err) {
                // If fetch fails, fallback to IndexedDB
                if (typeof getArticles === 'function') {
                    articles = await getArticles();
                    console.warn('Loaded articles from IndexedDB (offline fallback):', articles);
                }
            }
        } else {
            // Offline: load from IndexedDB
            if (typeof getArticles === 'function') {
                articles = await getArticles();
                console.warn('Loaded articles from IndexedDB (offline):', articles);
            }
        }
        
        displayArticles(articles);
    } catch (err) {
        console.error('❌ Error loading articles:', err);
        showNotification('Failed to load articles', 'error');
    }
}

// Display articles in table
function displayArticles(articles) {
    const tbody = document.getElementById('knowledgeTableBody');
    if (!tbody) {
        console.warn('⚠ Table body not found');
        return;
    }

    if (articles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No articles found</td></tr>';
        return;
    }

    tbody.innerHTML = articles.map(article => {
        // Truncate content for table display
        const contentPreview = article.content && article.content.length > 80
            ? article.content.substring(0, 80) + '...'
            : (article.content || '');
        const isPublished = article.is_published !== false;
        return `
        <tr style="${!isPublished ? 'opacity: 0.6;' : ''}">
            <td>${escapeHtml(article.title)}</td>
            <td title="${escapeHtml(article.content || '')}">${escapeHtml(contentPreview)}</td>
            <td><span style="background: #e8f5e9; color: #2d7a3e; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${escapeHtml(getCategoryDisplay(article.category))}</span></td>
            <td>${isPublished ? '<span style="color: #16a34a; font-weight: 500;">✓ Active</span>' : '<span style="color: #dc2626; font-weight: 500;">✗ Disabled</span>'}</td>
            <td>${formatDate(article.created_at)}</td>
            <td>${article.updated_at ? formatDate(article.updated_at) : '-'}</td>
            <td>
                <button class="btn btn-secondary" style="font-size: 12px; padding: 5px 10px;" onclick="editArticle(${article.id})">Edit</button>
                <button class="btn ${isPublished ? 'btn-danger' : 'btn-success'}" style="font-size: 12px; padding: 5px 10px; ${!isPublished ? 'background: #16a34a; color: white;' : ''}" onclick="toggleArticle(${article.id}, ${isPublished})">${isPublished ? 'Disable' : 'Enable'}</button>
            </td>
        </tr>
        `;
    }).join('');
}

// Get category display name
function getCategoryDisplay(category) {
    const categories = {
        'pest-management': 'Pest Management',
        'nature-of-damage': 'Nature of Damage',
        'disease-control': 'Nature of Damage',  // backwards compatibility
        'best-practices': 'Best Practices',
        'management-strategies': 'Management Strategies',
        'fertilization': 'Management Strategies',  // backwards compatibility
        'harvesting': 'Harvesting'  // backwards compatibility for old articles
    };
    return categories[category] || category;
}

// Show image in modal with zoom functionality
window.showImageModal = function(imageUrl) {
    let isZoomed = false;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'imageModalOverlay';
    modal.style.cssText = `
        z-index: 10000;
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    modal.innerHTML = `
        <div id="imageModalContent" class="modal-content" style="max-width: 800px; width: 100%; background: transparent; box-shadow: none; display: flex; align-items: center; justify-content: center; position: relative;">
            <div id="imageContainer" style="position: relative; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease;">
                <img id="modalImg" src="${imageUrl}" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 12px; display: block; cursor: zoom-in; transition: transform 0.3s ease, max-height 0.3s ease;">
                <div id="imgErrorMsg" style="display:none; position:absolute; left:0; right:0; top:50%; transform:translateY(-50%); text-align:center; color:#fff; background:rgba(0,0,0,0.7); padding:20px; border-radius:12px; font-size:18px;">Image could not be loaded.</div>
            </div>
            <button id="closeImageModalBtn" 
                    style="position: absolute; top: -15px; right: -15px; background: rgba(255,255,255,0.95); color: #333; border: 2px solid #ddd; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 10001;">
                ×
            </button>
            <div id="zoomHint" style="position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%); color: #fff; font-size: 13px; background: rgba(0,0,0,0.6); padding: 6px 14px; border-radius: 20px; white-space: nowrap;">
                🔍 Click image to zoom in/out
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Get elements
    const img = document.getElementById('modalImg');
    const errMsg = document.getElementById('imgErrorMsg');
    const closeBtn = document.getElementById('closeImageModalBtn');
    const modalContent = document.getElementById('imageModalContent');
    const zoomHint = document.getElementById('zoomHint');
    
    // Error handler for image
    if (img && errMsg) {
        img.onerror = function() {
            img.style.display = 'none';
            errMsg.style.display = 'block';
            if (zoomHint) zoomHint.style.display = 'none';
        };
    }
    
    // Close button click - always close modal
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.remove();
    });
    
    // Image click - toggle zoom
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        isZoomed = !isZoomed;
        if (isZoomed) {
            img.style.transform = 'scale(1.8)';
            img.style.maxHeight = '90vh';
            img.style.cursor = 'zoom-out';
            zoomHint.textContent = '🔍 Click image to zoom out, click outside to close';
        } else {
            img.style.transform = 'scale(1)';
            img.style.maxHeight = '70vh';
            img.style.cursor = 'zoom-in';
            zoomHint.textContent = '🔍 Click image to zoom in/out';
        }
    });
    
    // Modal content click (outside image but inside content area) - zoom out if zoomed
    modalContent.addEventListener('click', (e) => {
        if (e.target === modalContent && isZoomed) {
            isZoomed = false;
            img.style.transform = 'scale(1)';
            img.style.maxHeight = '70vh';
            img.style.cursor = 'zoom-in';
            zoomHint.textContent = '🔍 Click image to zoom in/out';
        }
    });
    
    // Background click (overlay) - close modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            if (isZoomed) {
                // First ESC: zoom out
                isZoomed = false;
                img.style.transform = 'scale(1)';
                img.style.maxHeight = '70vh';
                img.style.cursor = 'zoom-in';
                zoomHint.textContent = '🔍 Click image to zoom in/out';
            } else {
                // Second ESC or not zoomed: close modal
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        }
    };
    document.addEventListener('keydown', escHandler);
}

// Ensure closeModal is globally available
window.closeModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
};

// Show add article modal
function showAddArticleModal() {
    // Remove any existing modals first
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; overflow-y: hidden;';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; width: 100%; max-height: 85vh; background: white; border-radius: 12px; margin: auto; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
            <!-- Fixed Header -->
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e7eb; background: #fff; flex-shrink: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h2 style="margin: 0; font-size: 24px; color: #1f2937;">📝 Add New Knowledge Article</h2>
                    <button onclick="closeModal()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #9ca3af; line-height: 1; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;">&times;</button>
                </div>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">Create educational content for coconut farmers.</p>
            </div>

            <!-- Scrollable Body -->
            <div style="flex-grow: 1; overflow-y: auto; padding: 30px;">
                <form id="addArticleForm">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">Title *</label>
                        <input type="text" id="articleTitle" required 
                               placeholder="e.g., How to Identify Coconut Beetles"
                               style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; font-family: inherit;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">Category *</label>
                        <select id="articleCategory" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: white; font-family: inherit;">
                            <option value="">-- Select a Category --</option>
                            <option value="pest-management">🐛 Pest Management</option>
                            <option value="nature-of-damage">🩺 Nature of Damage</option>
                            <option value="best-practices">⭐ Best Practices</option>
                            <option value="management-strategies">🌱 Management Strategies</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">Content *</label>
                        <textarea id="articleContent" required rows="15" 
                                  placeholder="Write detailed information about the topic..."
                                  style="width: 100%; min-height: 300px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box; font-family: inherit;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">📷 Article Image</label>
                        <input type="file" id="articleImageFile" accept="image/jpeg,image/jpg,image/png,image/webp" 
                               style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: white;">
                        <small style="color: #6b7280; font-size: 12px; display: block; margin-top: 6px;">Recommended: Square image (1:1 ratio), max 5MB. Formats: JPG, PNG, WebP</small>
                        <div id="imagePreview" style="margin-top: 15px; display: none;">
                            <p style="font-weight: 600; margin-bottom: 10px; color: #16a34a; font-size: 14px;">Preview:</p>
                            <img id="previewImg" src="" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 2px solid #e5e7eb; display: block;">
                        </div>
                        <div id="uploadProgress" style="margin-top: 15px; display: none;">
                            <div style="background: #f3f4f6; border-radius: 8px; height: 35px; overflow: hidden; position: relative;">
                                <div id="progressBar" style="background: linear-gradient(90deg, #16a34a, #22c55e); height: 100%; width: 0%; transition: width 0.3s;"></div>
                                <div id="progressText" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 13px; font-weight: 600; color: #1f2937;"></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Fixed Footer -->
            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end; flex-shrink: 0;">
                <button type="button" class="btn btn-secondary" onclick="closeModal()" style="padding: 12px 24px; font-size: 14px; font-weight: 600;">Cancel</button>
                <button type="button" class="btn btn-primary" id="submitArticleBtn" onclick="handleAddArticleSubmit()" style="padding: 12px 24px; font-size: 14px; font-weight: 600;">✓ Add Article</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Image preview
    const fileInput = document.getElementById('articleImageFile');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                fileInput.value = '';
                preview.style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    });

    // Make preview image clickable to view in modal
    previewImg.onclick = function() {
        if (previewImg.src) {
            showImageModal(previewImg.src);
        }
    };
}

// Handle add article submit
async function handleAddArticleSubmit() {
    console.log('📝 Add Article button clicked!');
    
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to upload this article?');
    console.log('User confirmed:', confirmed);
    
    if (confirmed) {
        await createArticle();
    }
}

// Create new article
async function createArticle() {
    try {
        const token = getAuthToken();
        console.log('🔑 Token from localStorage:', token ? token.substring(0, 50) + '...' : 'No token');
        console.log('🔑 access_token:', localStorage.getItem('access_token') ? 'exists' : 'missing');
        console.log('🔑 token:', localStorage.getItem('token') ? 'exists' : 'missing');

        if (!token) {
            alert('No authentication token found. Please refresh and try again.');
            return;
        }

        const submitBtn = document.getElementById('submitArticleBtn');
        if (!submitBtn) {
            console.error('Submit button not found');
            alert('Error: Could not find submit button');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        const title = document.getElementById('articleTitle').value;
        const category = document.getElementById('articleCategory').value;
        const content = document.getElementById('articleContent').value;
        const imageFile = document.getElementById('articleImageFile').files[0];
        
        const tags = [];
        
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            const progressDiv = document.getElementById('uploadProgress');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            
            progressDiv.style.display = 'block';
            progressText.textContent = 'Uploading image...';
            progressBar.style.width = '30%';
            
            try {
                const formData = new FormData();
                formData.append('file', imageFile);
                
                const uploadResponse = await fetch(`${API_BASE_URL}/uploads/knowledge-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    throw new Error(error.detail || 'Failed to upload image');
                }

                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.url;
                
                progressBar.style.width = '60%';
                progressText.textContent = 'Image uploaded successfully!';
            } catch (err) {
                console.error('Image upload error:', err);
                showNotification(`Image upload failed: ${err.message}`, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Add Article';
                return;
            }
        }
        
        // Create article
        const response = await fetch(`${API_BASE_URL}/knowledge`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                category,
                content,
                tags,
                image_url: imageUrl
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create article');
        }

        showNotification('Article created successfully!', 'success');
        closeModal();
        await loadArticles();
    } catch (err) {
        console.error('❌ Error creating article:', err);
        showNotification(err.message, 'error');
    } finally {
        const submitBtn = document.getElementById('submitArticleBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Article';
        }
    }
}

// Edit article
async function editArticle(articleId) {
    try {
        const token = getAuthToken();
        if (!token) {
            showNotification('Please login first', 'error');
            return;
        }

        // Fetch article details
        const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load article');
        }

        const article = await response.json();
        
        // Show edit modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; width: 100%; max-height: 85vh; background: white; border-radius: 12px; margin: auto; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
                
                <!-- Fixed Header -->
                <div style="padding: 24px 30px; border-bottom: 1px solid #e5e7eb; background: #fff; flex-shrink: 0; display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h2 style="margin: 0 0 8px 0; color: #2d7a3e; font-size: 24px;">✏️ Edit Article</h2>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">Update article information.</p>
                    </div>
                     <button onclick="closeModal()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #9ca3af; line-height: 1; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s;">&times;</button>
                </div>

                <!-- Scrollable Body -->
                <div style="flex-grow: 1; overflow-y: auto; padding: 30px;">
                    <form id="editArticleForm" style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Title *</label>
                            <input type="text" id="editArticleTitle" value="${escapeHtml(article.title)}" required 
                                   style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s;"
                                   onfocus="this.style.borderColor='#2d7a3e'" onblur="this.style.borderColor='#e0e0e0'">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Category *</label>
                            <select id="editArticleCategory" required 
                                    style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: white; transition: border-color 0.2s;"
                                    onfocus="this.style.borderColor='#2d7a3e'" onblur="this.style.borderColor='#e0e0e0'">
                                <option value="pest-management" ${article.category === 'pest-management' ? 'selected' : ''}>🐛 Pest Management</option>
                                <option value="nature-of-damage" ${article.category === 'nature-of-damage' || article.category === 'disease-control' ? 'selected' : ''}>🩺 Nature of Damage</option>
                                <option value="best-practices" ${article.category === 'best-practices' ? 'selected' : ''}>⭐ Best Practices</option>
                                <option value="management-strategies" ${article.category === 'management-strategies' || article.category === 'fertilization' ? 'selected' : ''}>🌱 Management Strategies</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Content *</label>
                            <textarea id="editArticleContent" required rows="10" 
                                      style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; box-sizing: border-box; transition: border-color 0.2s;"
                                      onfocus="this.style.borderColor='#2d7a3e'" onblur="this.style.borderColor='#e0e0e0'">${escapeHtml(article.content)}</textarea>
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 14px;">Article Image</label>
                            ${article.image_url ? (() => {
                                // Use the helper function to get the correct image URL from API server
                                const displayUrl = getKnowledgeImageUrl(article.image_url);
                                // Show filename as fallback if image fails
                                return `
                                <div style=\"margin-bottom: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;\">
                                    <p style=\"margin: 0 0 10px 0; font-size: 13px; color: #555; font-weight: 500;\">Current Image:</p>
                                     <img src=\"${escapeHtml(displayUrl)}\" 
                                         style=\"max-width: 100%; height: auto; max-height: 180px; border-radius: 8px; border: 2px solid #ddd; display: block; cursor: pointer;\" 
                                         onclick=\"showImageModal('${escapeHtml(displayUrl)}')\"
                                         title=\"Click to view full image\"
                                         onerror=\"this.style.display='none';this.nextElementSibling.style.display='block';\">
                                     <div style=\"display:none; color:#b91c1c; font-size:13px; margin-top:8px;\">Image not found: <span style=\"word-break:break-all;\">${escapeHtml(displayUrl)}</span></div>
                                </div>
                                `;
                            })() : '<div style="margin-bottom: 12px; padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px dashed #ddd; text-align: center;"><p style="margin: 0; color: #999; font-size: 14px;">📷 No image uploaded yet</p></div>'}
                            
                            <div style="margin-top: 12px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #555; font-size: 13px;">Upload New Image (optional)</label>
                                <input type="file" id="editArticleImageFile" accept="image/jpeg,image/png,image/webp"
                                       style="width: 100%; padding: 10px; border: 2px dashed #ddd; border-radius: 8px; font-size: 13px; box-sizing: border-box; background: #fafafa;">
                                <p style="margin: 6px 0 0 0; font-size: 12px; color: #888;">Supported: JPEG, PNG, WebP (max 10MB)</p>
                            </div>
                            <div id="editUploadProgress" style="display: none; margin-top: 12px;">
                                <div style="background: #eee; border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div id="editProgressBar" style="height: 100%; width: 0%; background: #2d7a3e; transition: width 0.3s;"></div>
                                </div>
                                <p id="editProgressText" style="margin: 6px 0 0 0; font-size: 12px; color: #666;"></p>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Fixed Footer -->
                <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; gap: 12px; justify-content: flex-end; flex-shrink: 0;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()" 
                            style="padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; border: 2px solid #ddd; background: white; color: #555; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                        Cancel
                    </button>
                    <button type="submit" form="editArticleForm" class="btn btn-primary" id="updateArticleBtn"
                            style="padding: 12px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; border: none; background: #2d7a3e; color: white; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='#25613e'" onmouseout="this.style.background='#2d7a3e'">
                        ✓ Update Article
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Prevent form submission from refreshing the page
        document.getElementById('editArticleForm').addEventListener('submit', function(e) {
            e.preventDefault();
            updateArticle(articleId, article.image_url);
        });
    } catch (err) {
        console.error('❌ Error loading article for edit:', err);
        showNotification('Failed to load article', 'error');
    }
}

// Update article
async function updateArticle(articleId, currentImageUrl) {
    try {
        const token = getAuthToken();
        if (!token) {
            showNotification('Please login first', 'error');
            return;
        }

        const updateBtn = document.getElementById('updateArticleBtn');
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';

        const title = document.getElementById('editArticleTitle').value;
        const category = document.getElementById('editArticleCategory').value;
        const content = document.getElementById('editArticleContent').value;
        const imageFile = document.getElementById('editArticleImageFile')?.files[0];
        const tags = [];
        
        let imageUrl = currentImageUrl;
        
        // Upload new image if provided
        if (imageFile) {
            const progressDiv = document.getElementById('editUploadProgress');
            const progressBar = document.getElementById('editProgressBar');
            const progressText = document.getElementById('editProgressText');
            
            if (progressDiv) progressDiv.style.display = 'block';
            if (progressText) progressText.textContent = 'Uploading image...';
            if (progressBar) progressBar.style.width = '30%';
            
            try {
                const formData = new FormData();
                formData.append('file', imageFile);
                
                const uploadResponse = await fetch(`${API_BASE_URL}/uploads/knowledge-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {
                    const error = await uploadResponse.json();
                    throw new Error(error.detail || 'Failed to upload image');
                }

                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.url;
                
                if (progressBar) progressBar.style.width = '60%';
                if (progressText) progressText.textContent = 'Image uploaded successfully!';
            } catch (err) {
                console.error('Image upload error:', err);
                showNotification(`Image upload failed: ${err.message}`, 'error');
                updateBtn.disabled = false;
                updateBtn.textContent = 'Update Article';
                return;
            }
        }
        
        const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                category,
                content,
                tags,
                image_url: imageUrl
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update article');
        }

        showNotification('Article updated successfully!', 'success');
        closeModal();
        await loadArticles();
    } catch (err) {
        console.error('❌ Error updating article:', err);
        showNotification(err.message, 'error');
    } finally {
        const updateBtn = document.getElementById('updateArticleBtn');
        if (updateBtn) {
            updateBtn.disabled = false;
            updateBtn.textContent = 'Update Article';
        }
    }
}

// Toggle article (disable/enable)
async function toggleArticle(articleId, isCurrentlyPublished) {
    const action = isCurrentlyPublished ? 'disable' : 'enable';
    if (!confirm(`Are you sure you want to ${action} this article?\n\n${action === 'disable' ? 'This article will no longer appear in the CocoGuard app.' : 'This article will be visible again in the CocoGuard app.'}`)) {
        return;
    }

    try {
        const token = getAuthToken();
        if (!token) {
            showNotification('Please login first', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/knowledge/${articleId}/toggle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || `Failed to ${action} article`);
        }

        showNotification(`Article ${action}d successfully`, 'success');
        await loadArticles();
    } catch (err) {
        console.error(`❌ Error ${action} article:`, err);
        showNotification(err.message, 'error');
    }
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize knowledge base page
function initKnowledge() {
    console.log('🔧 Initializing knowledge base module...');
    
    try {
        const addArticleBtn = document.getElementById('addArticleBtn');
        
        if (addArticleBtn) {
            console.log('✓ Add Article button found');
            addArticleBtn.addEventListener('click', () => {
                console.log('📋 Add article button clicked');
                showAddArticleModal();
            });
        } else {
            console.warn('⚠ Add Article button not found');
        }
        
        // Load articles
        loadArticles();
        
        console.log('✅ Knowledge Base module initialized successfully');
    } catch (err) {
        console.error('❌ Error initializing knowledge base:', err);
    }
}

// Make functions globally accessible
window.editArticle = editArticle;
window.toggleArticle = toggleArticle;
window.closeModal = closeModal;
window.showImageModal = showImageModal;
window.showAddArticleModal = showAddArticleModal;
window.getCategoryDisplay = getCategoryDisplay;
window.handleAddArticleSubmit = handleAddArticleSubmit;

// Export for use in main script
window.knowledgeModule = {
    init: initKnowledge
};

console.log('✓ knowledgeModule exported v2.0');

})(); // End IIFE

