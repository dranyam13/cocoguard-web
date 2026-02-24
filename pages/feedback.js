// Feedback Page Script
// Version: 3.0 - Admin Response Feature

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.feedbackModuleLoaded) {
        console.log('Feedback module already loaded, skipping...');
        return;
    }
    window.feedbackModuleLoaded = true;

    console.log('💬 Feedback page script loaded v3.0');

    // Store feedbacks for modal access
    let currentFeedbacks = [];

// Format date for display in Philippine Time (UTC+8)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    // Database stores UTC time without 'Z' suffix
    let utcDateString = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+')) {
        utcDateString = dateString + 'Z';
    }
    const date = new Date(utcDateString);
    return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusColors = {
        'Received': { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
        'In Review': { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' },
        'Real Pest': { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
        'New Pest': { bg: '#f3e5f5', color: '#7b1fa2', border: '#ce93d8' },
        'Not a Pest': { bg: '#fce4ec', color: '#c62828', border: '#ef9a9a' },
        'Resolved': { bg: '#e0f2f1', color: '#00695c', border: '#80cbc4' }
    };
    
    const style = statusColors[status] || { bg: '#f5f5f5', color: '#666', border: '#ddd' };
    return `<span style="display:inline-block;padding:4px 10px;border-radius:12px;background:${style.bg};color:${style.color};font-size:11px;font-weight:600;border:1px solid ${style.border};">${escapeHtml(status || 'Unknown')}</span>`;
}

// Render feedback table with status and actions
function renderFeedbackTable(feedbacks) {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;
    
    currentFeedbacks = feedbacks; // Store for modal access
    
    if (!feedbacks || feedbacks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888;">No feedback found.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = feedbacks.map(f => {
        let userName = '-';
        if (f.user && (f.user.full_name || f.user.username)) {
            userName = escapeHtml(f.user.full_name || f.user.username);
        }
        
        // Type badge
        let typeBadge = escapeHtml(f.type || '-');
        if (f.type && f.type.toLowerCase() === 'out-of-scope report') {
            typeBadge = '<span style="display:inline-block;padding:3px 10px;border-radius:10px;background:#fff3e0;color:#e65100;font-size:12px;font-weight:600;border:1px solid #ffcc80;">🔍 Out-of-Scope Report</span>';
        } else if (f.type) {
            typeBadge = `<span style="display:inline-block;padding:3px 10px;border-radius:10px;background:#e8f5e9;color:#2e7d32;font-size:12px;font-weight:600;">${escapeHtml(f.type)}</span>`;
        }
        
        // Status badge
        const statusBadge = getStatusBadge(f.status);
        
        // Message with admin response if exists
        let messageContent = escapeHtml(f.message);
        if (f.admin_response) {
            messageContent += `<br><small style="color: #4CAF50; margin-top: 5px; display: block;"><strong>Admin Response:</strong> ${escapeHtml(f.admin_response)}</small>`;
        }
        
        // Action button
        const actionBtn = `<button onclick="window.feedbackModule.openResponseModal(${f.id})" style="padding: 6px 12px; border: none; border-radius: 6px; background: #2196F3; color: white; cursor: pointer; font-size: 12px; font-weight: 500;">
            ${f.admin_response ? '✏️ Edit' : '💬 Respond'}
        </button>`;
        
        return `
        <tr>
            <td>${userName}</td>
            <td>${formatDate(f.created_at)}</td>
            <td>${typeBadge}</td>
            <td>${statusBadge}</td>
            <td style="max-width: 300px; word-wrap: break-word;">${messageContent}</td>
            <td>${actionBtn}</td>
        </tr>
        `;
    }).join('');
}

// Open response modal
function openResponseModal(feedbackId) {
    const feedback = currentFeedbacks.find(f => f.id === feedbackId);
    if (!feedback) {
        console.error('Feedback not found:', feedbackId);
        return;
    }
    
    // Populate modal
    document.getElementById('feedbackId').value = feedbackId;
    document.getElementById('modalFeedbackUser').textContent = 
        feedback.user ? (feedback.user.full_name || feedback.user.username) : 'Anonymous';
    document.getElementById('modalFeedbackType').textContent = feedback.type || 'General Feedback';
    document.getElementById('modalFeedbackMessage').textContent = feedback.message;
    document.getElementById('feedbackStatus').value = feedback.status || 'Received';
    document.getElementById('adminResponse').value = feedback.admin_response || '';
    
    // Show modal
    document.getElementById('feedbackResponseModal').style.display = 'flex';
}

// Close response modal
function closeResponseModal() {
    document.getElementById('feedbackResponseModal').style.display = 'none';
    document.getElementById('feedbackResponseForm').reset();
}

// Submit response
async function submitResponse(e) {
    e.preventDefault();
    
    const feedbackId = document.getElementById('feedbackId').value;
    const status = document.getElementById('feedbackStatus').value;
    const adminResponse = document.getElementById('adminResponse').value.trim();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const payload = {
            status: status,
            admin_response: adminResponse || null
        };
        
        let result;
        if (typeof apiClient !== 'undefined') {
            result = await apiClient.request(`/feedback/${feedbackId}/respond`, {
                method: 'PUT',
                body: payload
            });
        } else {
            const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiBase}/feedback/${feedbackId}/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Failed to submit response');
            }
            result = await response.json();
        }
        
        console.log('Response submitted:', result);
        closeResponseModal();
        
        // Show success notification
        if (typeof showNotification === 'function') {
            showNotification('Response submitted successfully!', 'success');
        } else {
            alert('Response submitted successfully!');
        }
        
        // Reload feedbacks
        loadFeedbacks();
        
    } catch (error) {
        console.error('Failed to submit response:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to submit response: ' + error.message, 'error');
        } else {
            alert('Failed to submit response: ' + error.message);
        }
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Load feedbacks from API
async function loadFeedbacks() {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">Loading feedback...</td></tr>`;
    try {
        let feedbacks = [];
        if (typeof apiClient !== 'undefined') {
            feedbacks = await apiClient.request('/feedback/', { method: 'GET' });
        } else {
            // fallback fetch - use dynamic hostname
            const apiBase = `${window.location.protocol}//${window.location.hostname}:8000`;
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiBase}/feedback/`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            feedbacks = await response.json();
        }
        renderFeedbackTable(feedbacks);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #d32f2f;">Failed to load feedbacks.</td></tr>`;
    }
}

// Initialize feedback page
function initFeedback() {
    console.log('🔧 Initializing feedback module v3.0...');
    loadFeedbacks();
    
    // Setup form submission
    const form = document.getElementById('feedbackResponseForm');
    if (form) {
        form.addEventListener('submit', submitResponse);
    }
    
    // Setup modal close on outside click
    const modal = document.getElementById('feedbackResponseModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeResponseModal();
            }
        });
    }
    
    console.log('✅ Feedback module initialized successfully');
}

// Export for use in main script
window.feedbackModule = {
    init: initFeedback,
    loadFeedbacks: loadFeedbacks,
    renderFeedbackTable: renderFeedbackTable,
    openResponseModal: openResponseModal,
    closeResponseModal: closeResponseModal
};

console.log('✓ feedbackModule exported v3.0');

})(); // End IIFE
