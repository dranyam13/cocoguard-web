// Users Page Script - Version 2.0
// Fresh version to bypass cache

console.log('👥 Users page script loaded v2.0 FRESH');

let usersData = [];

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusClass = status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
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
    
    tbody.innerHTML = users.map(user => `
        <tr data-user-id="${user.id}">
            <td>#${user.id}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</td>
            <td>${getStatusBadge(user.status || 'active')}</td>
            <td>${formatDate(user.date_joined || user.created_at)}</td>
            <td>
                <button class="btn btn-secondary edit-user-btn" style="font-size: 12px; padding: 5px 10px;" data-user-id="${user.id}">
                    Edit
                </button>
                <button class="btn btn-danger toggle-status-btn" style="font-size: 12px; padding: 5px 10px;" data-user-id="${user.id}" data-status="${user.status}">
                    ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners to action buttons
    attachActionListeners();
}

// Attach event listeners to action buttons
function attachActionListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.target.dataset.userId;
            const user = usersData.find(u => u.id == userId);
            if (user) {
                showUserDetails(user);
            }
        });
    });
    
    // Toggle status buttons
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = e.target.dataset.userId;
            const currentStatus = e.target.dataset.status;
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await toggleUserStatus(userId, newStatus);
        });
    });
}

// Show user details
function showUserDetails(user) {
    const details = `
User ID: ${user.id}
Username: ${user.username || 'N/A'}
Email: ${user.email || 'N/A'}
Role: ${user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
Status: ${user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
Date Joined: ${formatDate(user.date_joined || user.created_at)}
Full Name: ${user.full_name || 'Not provided'}
Phone: ${user.phone || 'Not provided'}
Address: ${user.address_line || 'Not provided'}
Region: ${user.region || 'Not provided'}
Province: ${user.province || 'Not provided'}
City: ${user.city || 'Not provided'}
Barangay: ${user.barangay || 'Not provided'}
    `;
    alert(details.trim());
}

// Toggle user status
async function toggleUserStatus(userId, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
        return;
    }
    
    try {
        console.log(`Toggling user ${userId} status to ${newStatus}`);
        alert('Status update feature requires backend endpoint implementation.');
    } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Failed to update user status: ' + error.message);
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
        usersData = users;
        
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

// Initialize users page
function initUsers() {
    console.log('🔧 Initializing users module v2.0...');
    
    try {
        const addUserBtn = document.getElementById('addUserBtn');
        
        if (addUserBtn) {
            console.log('✓ Add User button found');
            addUserBtn.addEventListener('click', () => {
                console.log('📋 Add user button clicked');
                alert('Add user feature coming soon!');
            });
        } else {
            console.warn('⚠ Add User button not found');
        }
        
        console.log('✅ Users module initialized successfully');
        
        // Load users on initialization (async, don't block)
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
    renderUsersTable: renderUsersTable
};

console.log('✓ usersModule exported v2.0 FRESH');
