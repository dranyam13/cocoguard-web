// Users Page Script
// Version: 3.2 - IIFE Wrapper Fix

(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.usersModuleLoaded) {
        console.log('Users module already loaded, skipping...');
        return;
    }
    window.usersModuleLoaded = true;

    console.log('👥 Users page script loaded v3.2');

    // Use window to avoid redeclaration issues on script reload
    if (typeof window.usersData === 'undefined') {
        window.usersData = [];
    }

// Format date for display in Philippine Time (UTC+8)
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    // Normalize status - handle any unexpected values
    const normalizedStatus = (status || 'active').toLowerCase();
    const isActive = normalizedStatus === 'active';
    const statusClass = isActive ? 'status-active' : 'status-inactive';
    const statusText = isActive ? 'Active' : 'Inactive';
    return `<span class="status-badge ${statusClass}">${statusText}</span>`;
}

// Render users table
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                    No users found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const normalizedStatus = (user.status || 'active').toLowerCase();
        const isActive = normalizedStatus === 'active';
        return `
        <tr data-user-id="${user.id}">
            <td>#${user.id}</td>
            <td>${escapeHtml(user.username || 'N/A')}</td>
            <td>${escapeHtml(user.email || 'N/A')}</td>
            <td>${escapeHtml(user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User')}</td>
            <td>${getStatusBadge(user.status)}</td>
            <td>${formatDate(user.date_joined || user.created_at)}</td>
            <td>
                <button class="btn btn-secondary edit-user-btn" style="font-size: 12px; padding: 5px 10px;" data-user-id="${user.id}">
                    Edit
                </button>
                <button class="btn btn-${isActive ? 'danger' : 'success'} status-toggle-btn" style="font-size: 12px; padding: 5px 10px; margin-left: 5px;" data-user-id="${user.id}" data-status="${isActive ? 'inactive' : 'active'}">
                    ${isActive ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        </tr>
        `;
    }).join('');
    
    // Add event listeners to action buttons
    attachActionListeners();
}

// Attach event listeners to action buttons
function attachActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.target.dataset.userId;
            const user = window.usersData.find(u => u.id == userId);
            if (user) {
                openEditUserModal(user);
            }
        });
    });

    // Status toggle buttons
    document.querySelectorAll('.status-toggle-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.target.dataset.userId;
            const newStatus = e.target.dataset.status;
            const user = window.usersData.find(u => u.id == userId);
            if (!user) return;
            if (!confirm(`Are you sure you want to ${newStatus === 'inactive' ? 'deactivate' : 'activate'} this user?`)) return;
            try {
                await apiClient.setUserStatus(userId, newStatus);
                user.status = newStatus;
                renderUsersTable(window.usersData);
                showSuccessMessage(`User ${newStatus === 'inactive' ? 'deactivated' : 'activated'} successfully.`);
            } catch (err) {
                showErrorMessage('Failed to update user status: ' + (err.message || err));
            }
        });
    });
}

// Show success message
function showSuccessMessage(message) {
    // Use the global modal if available, otherwise alert
    if (typeof showModal === 'function') {
        showModal('Success', message, 'success');
    } else {
        alert(message);
    }
}

// Show error message
function showErrorMessage(message) {
    if (typeof showModal === 'function') {
        showModal('Error', message, 'error');
    } else {
        alert(message);
    }
}

// ========== ADD USER MODAL ==========

function openAddUserModal() {
    console.log('🔓 openAddUserModal called');
    
    // First try to find modal in pageContainer
    let modal = document.getElementById('add-user-modal');
    
    // If not found in usual place, search entire document
    if (!modal) {
        console.log('🔍 Modal not found by ID, searching in pageContainer...');
        const pageContainer = document.getElementById('pageContainer');
        if (pageContainer) {
            modal = pageContainer.querySelector('#add-user-modal');
        }
    }
    
    console.log('🔍 Modal element:', modal);
    
    if (modal) {
        // Move modal to body if it's not already there (for proper z-index positioning)
        if (modal.parentElement && modal.parentElement.id !== 'body' && !document.body.contains(modal)) {
            document.body.appendChild(modal);
        }
        modal.style.display = 'flex';
        // Reset form
        const form = document.getElementById('add-user-form');
        if (form) form.reset();
        console.log('✅ Modal opened');
    } else {
        console.error('❌ Modal not found: add-user-modal');
        // Create modal dynamically if not found
        createAddUserModalDynamically();
    }
}

// Create modal dynamically if not found in DOM
function createAddUserModalDynamically() {
    console.log('🔧 Creating Add User modal dynamically...');
    
    const modalHTML = `
    <div id="add-user-modal" class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; justify-content: center; align-items: center;">
        <div class="modal-content modal-form" style="background: white; border-radius: 12px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header-pro" style="background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <div class="modal-title-wrapper">
                    <h3 style="margin: 0; font-size: 20px;">Add New User</h3>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Create a new user account</p>
                </div>
                <button class="modal-close-pro" id="close-add-user-modal" style="position: absolute; right: 15px; top: 15px; background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px;">×</button>
            </div>
            <div class="modal-body-pro" style="padding: 25px;">
                <form id="add-user-form">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group-pro">
                            <label for="add-username" style="display: block; margin-bottom: 5px; font-weight: 500;">Username *</label>
                            <input type="text" id="add-username" name="username" required placeholder="Enter username" minlength="3" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        <div class="form-group-pro">
                            <label for="add-email" style="display: block; margin-bottom: 5px; font-weight: 500;">Email *</label>
                            <input type="email" id="add-email" name="email" required placeholder="user@example.com" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        <div class="form-group-pro">
                            <label for="add-full-name" style="display: block; margin-bottom: 5px; font-weight: 500;">Full Name</label>
                            <input type="text" id="add-full-name" name="full_name" placeholder="Enter full name" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        <div class="form-group-pro">
                            <label for="add-phone" style="display: block; margin-bottom: 5px; font-weight: 500;">Phone</label>
                            <input type="tel" id="add-phone" name="phone" placeholder="Enter phone" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        <div class="form-group-pro">
                            <label for="add-password" style="display: block; margin-bottom: 5px; font-weight: 500;">Password *</label>
                            <input type="password" id="add-password" name="password" required placeholder="Min. 6 characters" minlength="6" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        <div class="form-group-pro">
                            <label for="add-role" style="display: block; margin-bottom: 5px; font-weight: 500;">Role</label>
                            <select id="add-role" name="role" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <button type="button" class="btn-cancel-pro" id="cancel-add-user" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
                        <button type="submit" class="btn-submit-pro" id="submit-add-user" style="padding: 10px 20px; background: linear-gradient(135deg, #16a34a, #15803d); color: white; border: none; border-radius: 6px; cursor: pointer;">Create User</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Attach event listeners
    const modal = document.getElementById('add-user-modal');
    const closeBtn = document.getElementById('close-add-user-modal');
    const cancelBtn = document.getElementById('cancel-add-user');
    const form = document.getElementById('add-user-form');
    
    if (closeBtn) closeBtn.addEventListener('click', closeAddUserModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAddUserModal);
    if (form) form.addEventListener('submit', handleAddUser);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAddUserModal();
        });
    }
    
    console.log('✅ Modal created dynamically and opened');
}

function closeAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function handleAddUser(e) {
    e.preventDefault();
    
    const form = document.getElementById('add-user-form');
    const submitBtn = document.getElementById('submit-add-user');
    
    const userData = {
        username: document.getElementById('add-username').value.trim(),
        email: document.getElementById('add-email').value.trim(),
        password: document.getElementById('add-password').value,
        full_name: document.getElementById('add-full-name').value.trim() || null,
        phone: document.getElementById('add-phone').value.trim() || null,
        role: document.getElementById('add-role').value
    };
    
    // Validation
    if (!userData.username || userData.username.length < 3) {
        showErrorMessage('Username must be at least 3 characters');
        return;
    }
    
    if (!userData.email || !userData.email.includes('@')) {
        showErrorMessage('Please enter a valid email address');
        return;
    }
    
    if (!userData.password || userData.password.length < 6) {
        showErrorMessage('Password must be at least 6 characters');
        return;
    }
    
    // Disable button while processing
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-small"></span> Creating...';
    
    try {
        const result = await apiClient.createUser(userData);
        console.log('✅ User created:', result);
        
        closeAddUserModal();
        showSuccessMessage(`User "${userData.username}" created successfully!`);
        
        // Reload users list
        await loadUsers();
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
        showErrorMessage(error.message || 'Failed to create user');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Create User
        `;
    }
}

// ========== EDIT USER MODAL ==========

function openEditUserModal(user) {
    // Remove old specific modal if it exists to prevent conflicts
    const oldModal = document.getElementById('edit-user-modal');
    if (oldModal && oldModal.parentNode) {
        oldModal.parentNode.removeChild(oldModal);
    }

    let modal = document.getElementById('edit-user-modal-v2');
    
    // If modal not found, create it dynamically
    if (!modal) {
        console.log('🔧 Creating Edit User modal v2 dynamically...');
        createEditUserModalDynamically();
        modal = document.getElementById('edit-user-modal-v2');
    }
    
    if (!modal) {
        showErrorMessage('Unable to open edit modal');
        return;
    }
    
    // Populate form fields
    const editUserId = document.getElementById('edit-user-id');
    const editUsername = document.getElementById('edit-username');
    const editEmail = document.getElementById('edit-email');
    const editFullName = document.getElementById('edit-full-name');
    const editPhone = document.getElementById('edit-phone');
    const editRole = document.getElementById('edit-role');
    const editStatus = document.getElementById('edit-status');
    const displayUserId = document.getElementById('display-user-id');
    const displayDateJoined = document.getElementById('display-date-joined');
    
    if (editUserId) editUserId.value = user.id;
    if (editUsername) editUsername.value = user.username || '';
    if (editEmail) editEmail.value = user.email || '';
    if (editFullName) editFullName.value = user.full_name || '';
    if (editPhone) editPhone.value = user.phone || '';
    if (editRole) editRole.value = user.role || 'user';
    if (editStatus) editStatus.value = (user.status || 'active').toLowerCase();
    
    // Display info
    if (displayUserId) displayUserId.textContent = user.id;
    if (displayDateJoined) displayDateJoined.textContent = formatDate(user.date_joined || user.created_at);
    
    modal.style.display = 'flex';
}

function createEditUserModalDynamically() {
    const modalHTML = `
    <div id="edit-user-modal-v2" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
        <div class="modal-content modal-form" style="background: white; border-radius: 16px; max-width: 650px; width: 90%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            
            <!-- Fixed Header -->
            <div class="modal-header-pro" style="background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 24px 28px; border-radius: 16px 16px 0 0; display: flex; align-items: center; gap: 16px; flex-shrink: 0;">
                <div class="modal-icon-wrapper" style="width: 52px; height: 52px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </div>
                <div class="modal-title-wrapper" style="flex-grow: 1;">
                    <h3 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.3px;">Edit User</h3>
                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px; font-weight: 400;">Update user information and settings</p>
                </div>
                <button class="modal-close-btn" id="close-edit-user-modal" type="button" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <!-- Scrollable Body -->
            <div class="modal-body-pro" style="padding: 28px; overflow-y: auto; flex-grow: 1; background: #fff;">
                <form id="edit-user-form">
                    <input type="hidden" id="edit-user-id" name="user_id">
                    
                    <!-- User Info Section -->
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #f0fdf4;">
                            <span style="font-size: 14px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Account Information</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
                            <div class="form-group-pro">
                                <label for="edit-username" style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #374151;">Username</label>
                                <input type="text" id="edit-username" name="username" readonly class="form-input-pro" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #f9fafb; color: #6b7280; box-sizing: border-box;">
                            </div>
                            <div class="form-group-pro">
                                <label for="edit-email" style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #374151;">Email Address</label>
                                <input type="email" id="edit-email" name="email" readonly class="form-input-pro" style="width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #f9fafb; color: #6b7280; box-sizing: border-box;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Personal Details Section -->
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #f0fdf4;">
                            <span style="font-size: 14px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Personal Details</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
                            <div class="form-group-pro">
                                <label for="edit-full-name" style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #374151;">Full Name</label>
                                <input type="text" id="edit-full-name" name="full_name" placeholder="Enter full name" class="form-input-pro" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; box-sizing: border-box;">
                            </div>
                            <div class="form-group-pro">
                                <label for="edit-phone" style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #374151;">Phone Number</label>
                                <input type="tel" id="edit-phone" name="phone" placeholder="Enter phone number" class="form-input-pro" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; box-sizing: border-box;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Role & Status Section -->
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #f0fdf4;">
                            <span style="font-size: 14px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Role & Status</span>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
                            <div class="form-group-pro">
                                <label for="edit-role" style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #374151;">User Role</label>
                                <select id="edit-role" name="role" class="form-select-pro" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; box-sizing: border-box;">
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div class="form-group-pro">
                                <label for="edit-status" style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 13px; color: #374151;">Account Status</label>
                                <select id="edit-status" name="status" class="form-select-pro" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; box-sizing: border-box;">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <!-- Footer Action Buttons -->
            <div class="modal-footer-pro" style="padding: 20px 28px; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; flex-shrink: 0; border-radius: 0 0 16px 16px;">
                <button type="button" class="btn-cancel-styled" id="cancel-edit-user" style="padding: 10px 20px; border: 1px solid #d1d5db; background: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; color: #374151;">
                    Cancel
                </button>
                <button type="submit" form="edit-user-form" class="btn-save-pro" style="padding: 10px 24px; background: linear-gradient(135deg, #16a34a, #15803d); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                    Save Changes
                </button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        // Attach event listeners
        const modal = document.getElementById('edit-user-modal-v2');
        const closeBtn = document.getElementById('close-edit-user-modal');
        const cancelBtn = document.getElementById('cancel-edit-user');
        const form = document.getElementById('edit-user-form');
        
        console.log('Attaching listeners to edit user modal:', { closeBtn, cancelBtn, modal });
        
        if (closeBtn) {
            closeBtn.onclick = closeEditUserModal; // Direct assignment for robustness
        }
        if (cancelBtn) {
            cancelBtn.onclick = closeEditUserModal; // Direct assignment for robustness
        }
        if (form) form.addEventListener('submit', handleEditUser);
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) closeEditUserModal();
            };
        }
    }, 100);
}

function closeEditUserModal() {
    console.log('Closing edit user modal...');
    const modal = document.getElementById('edit-user-modal-v2');
    if (modal) {
        modal.style.display = 'none';
        // Remove from DOM to ensure clean state next time
        // modal.parentNode.removeChild(modal); // Keep it for now to avoid recreating every time
    }
    
    // Also try checking for old modal just in case
    const oldModal = document.getElementById('edit-user-modal');
    if (oldModal) oldModal.style.display = 'none';
}

async function handleEditUser(e) {
    e.preventDefault();
    
    const userId = document.getElementById('edit-user-id').value;
    const newStatus = document.getElementById('edit-status').value;
    
    // For now, we only support status change through edit modal
    // Full edit would require additional backend endpoint
    
    try {
        await apiClient.setUserStatus(userId, newStatus);
        
        closeEditUserModal();
        showSuccessMessage('User updated successfully!');
        
        // Reload users list
        await loadUsers();
        
    } catch (error) {
        console.error('❌ Error updating user:', error);
        showErrorMessage(error.message || 'Failed to update user');
    }
}

// Load users from API
async function loadUsers() {
    console.log('📥 loadUsers() called');
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) {
        console.error('❌ usersTableBody element not found!');
        return;
    }
    
    console.log('✓ usersTableBody element found');
    
    if (typeof apiClient === 'undefined') {
        console.error('❌ apiClient is not defined!');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #d32f2f;">
                    <strong>Error:</strong> API Client not initialized
                </td>
            </tr>
        `;
        return;
    }
    
    console.log('✓ apiClient is available');
    
    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    <div class="loading-spinner">Loading users...</div>
                </td>
            </tr>
        `;
        
        console.log('🔄 Fetching users from API...');
        const users = await apiClient.listUsers();
        window.usersData = users;
        
        console.log('✅ Users loaded:', users.length);
        console.log('👥 Users data:', users);
        renderUsersTable(users);
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #d32f2f;">
                    <strong>Error loading users:</strong> ${error.message}
                    <br><br>
                    <button class="btn btn-primary" onclick="window.usersModule.loadUsers()">Retry</button>
                </td>
            </tr>
        `;
    }
}

// Setup password toggle for modals
function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password-pro').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                this.classList.toggle('showing', !isPassword);
            }
        });
    });
}

// Initialize users page
function initUsers() {
    console.log('🔧 Initializing users module v3.0...');
    
    try {
        // Add User button
        const addUserBtn = document.getElementById('addUserBtn');
        console.log('🔍 Looking for addUserBtn:', addUserBtn);
        if (addUserBtn) {
            console.log('✓ Add User button found, attaching click handler');
            // Remove any existing listeners first
            addUserBtn.replaceWith(addUserBtn.cloneNode(true));
            const newAddUserBtn = document.getElementById('addUserBtn');
            newAddUserBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Add User button clicked!');
                openAddUserModal();
            });
            console.log('✓ Click handler attached to Add User button');
        } else {
            console.error('❌ Add User button NOT found!');
        }
        
        // Add User Modal - Close button
        const closeAddUserBtn = document.getElementById('close-add-user-modal');
        if (closeAddUserBtn) {
            closeAddUserBtn.addEventListener('click', closeAddUserModal);
        }
        
        // Add User Modal - Cancel button
        const cancelAddUserBtn = document.getElementById('cancel-add-user');
        if (cancelAddUserBtn) {
            cancelAddUserBtn.addEventListener('click', closeAddUserModal);
        }
        
        // Add User Form submit
        const addUserForm = document.getElementById('add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', handleAddUser);
        }
        
        // Edit User Modal - Close button
        const closeEditUserBtn = document.getElementById('close-edit-user-modal');
        if (closeEditUserBtn) {
            closeEditUserBtn.addEventListener('click', closeEditUserModal);
        }
        
        // Edit User Modal - Cancel button
        const cancelEditUserBtn = document.getElementById('cancel-edit-user');
        if (cancelEditUserBtn) {
            cancelEditUserBtn.addEventListener('click', closeEditUserModal);
        }
        
        // Edit User Form submit
        const editUserForm = document.getElementById('edit-user-form');
        if (editUserForm) {
            editUserForm.addEventListener('submit', handleEditUser);
        }
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Setup password toggles
        setupPasswordToggles();
        
        console.log('✅ Users module initialized successfully');
        
        // Load users on initialization
        console.log('🚀 Calling loadUsers()...');
        loadUsers().catch(err => {
            console.error('❌ loadUsers() failed:', err);
        });
        
    } catch (err) {
        console.error('❌ Error initializing users:', err);
    }
}

// Export for use in main script
window.usersModule = {
    init: initUsers,
    loadUsers: loadUsers,
    renderUsersTable: renderUsersTable,
    openAddUserModal: openAddUserModal,
    openEditUserModal: openEditUserModal
};

console.log('✓ usersModule exported v3.2');

})(); // End IIFE