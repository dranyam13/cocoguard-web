# Users Module - Backend Integration Complete

## Overview
The Users module has been updated to fetch real data from the CocoGuard backend database instead of displaying static data.

## Changes Made

### 1. Frontend Updates (`pages/users.html`)
- Removed static user rows from the HTML table
- Added loading state with spinner for better UX
- Table now dynamically populated from API

### 2. JavaScript Updates (`pages/users.js`)
- **New Functions:**
  - `loadUsers()` - Fetches users from backend API
  - `renderUsersTable(users)` - Dynamically renders user data in table
  - `formatDate(dateString)` - Formats dates for display
  - `getStatusBadge(status)` - Returns HTML for status badges
  - `showUserDetails(user)` - Displays detailed user information
  - `toggleUserStatus(userId, newStatus)` - Placeholder for status toggle functionality
  - `attachActionListeners()` - Attaches event listeners to action buttons

- **Features:**
  - Real-time data loading from API
  - Loading spinner during data fetch
  - Error handling with retry button
  - User details view on Edit button click
  - Status toggle button (ready for backend implementation)

### 3. CSS Updates (`pages/users.css`)
- Added loading spinner animation
- Enhanced status badge styling
- Improved visual feedback for active/inactive states

### 4. Backend Updates (`app/routers/users.py`)
- Enhanced user listing endpoint to include additional fields:
  - `full_name`
  - `phone`
  - `address_line`
  - `region`
  - `province`
  - `city`
  - `barangay`
  - `created_at`
  - `updated_at`

## API Endpoint Used

**GET** `/users`
- **Authentication:** Admin only (requires admin JWT token)
- **Returns:** Array of user objects with complete profile information
- **Response Format:**
```json
[
  {
    "id": 1,
    "username": "john_farmer",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "date_joined": "2025-11-20T12:00:00",
    "full_name": "John Farmer",
    "phone": "+63912345678",
    "address_line": "123 Farm Road",
    "region": "Region IV-A",
    "province": "Quezon",
    "city": "Lucena City",
    "barangay": "Barangay 1",
    "created_at": "2025-11-20T12:00:00",
    "updated_at": "2025-11-20T12:00:00"
  }
]
```

## Testing Instructions

### 1. Start the Backend Server
```bash
cd c:\xampp\htdocs\cocoguard-backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Open the Web Application
1. Open `c:\xampp\htdocs\cocoguard_web\index.html` in a browser
2. Login as admin user
3. Navigate to "Users" in the sidebar

### 3. Verify Functionality
- ✅ Users table loads automatically on page load
- ✅ Loading spinner displays during data fetch
- ✅ All registered users from mobile app appear in table
- ✅ User information displays correctly (ID, username, email, role, status, date)
- ✅ Status badges show correct colors (green for active, red for inactive)
- ✅ Edit button shows detailed user information
- ✅ Error handling works if backend is offline

### 4. Check Backend Data
Verify users exist in database:
```bash
cd c:\xampp\htdocs\cocoguard-backend
python check_users.py
```

## Data Flow

```
Mobile App (Flutter)
    ↓ [Registration]
Backend Database (SQLite/PostgreSQL)
    ↓ [API: GET /users]
Web Admin Panel (JavaScript)
    ↓ [Display]
Users Module Table
```

## Features Implemented

### ✅ Completed
- [x] Dynamic user data loading from backend
- [x] Real-time table population
- [x] Loading states and error handling
- [x] User details view
- [x] Status badge display
- [x] Responsive table layout
- [x] Date formatting
- [x] Role capitalization

### 🚧 Ready for Implementation (Backend Needed)
- [ ] User status toggle (activate/deactivate)
- [ ] Edit user functionality
- [ ] Add new user
- [ ] Delete user
- [ ] Search/filter users
- [ ] Pagination for large datasets
- [ ] Export users to CSV

## User Fields Displayed

| Field | Description |
|-------|-------------|
| ID | User's unique identifier |
| Username | User's login username |
| Email | User's email address |
| Role | User role (Admin/User) |
| Status | Account status (Active/Inactive) |
| Date Joined | User registration date |

## User Detail Fields

Additional information shown when clicking "Edit":
- Full Name
- Phone Number
- Complete Address (Line, Region, Province, City, Barangay)
- Last Updated timestamp

## Error Handling

The module includes comprehensive error handling:
1. **Network Errors:** Shows error message with retry button
2. **Authentication Errors:** Redirects to login
3. **Empty Data:** Shows "No users found" message
4. **Backend Offline:** Shows connection error with instructions

## Browser Console Logs

For debugging, the module provides detailed console logs:
- `🔧 Initializing users module...`
- `🔄 Fetching users from API...`
- `✅ Users loaded: [count]`
- `❌ Error loading users: [error message]`

## Security Notes

- Users endpoint requires admin authentication
- JWT token automatically sent with requests
- Unauthorized access returns 403 Forbidden
- Invalid tokens redirect to login page

## Next Steps

To extend functionality:

1. **Add User Status Toggle Endpoint:**
```python
@router.put("/{user_id}/status")
def update_user_status(user_id: int, status: UserStatus, db: Session = Depends(get_db)):
    # Implementation needed
```

2. **Add User Update Endpoint:**
```python
@router.put("/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    # Implementation needed
```

3. **Add Search/Filter:**
```javascript
async function searchUsers(query) {
    const users = await apiClient.listUsers();
    return users.filter(u => 
        u.username.includes(query) || 
        u.email.includes(query)
    );
}
```

## Troubleshooting

### Users Not Loading
1. Check backend server is running on port 8000
2. Verify admin user is logged in
3. Check browser console for errors
4. Verify API base URL in localStorage

### Authentication Errors
1. Clear browser localStorage
2. Login again as admin
3. Check JWT token expiration

### Empty User List
1. Verify users exist in database: `python check_users.py`
2. Create test users: `python create_farmer_user.py`
3. Check database connection in backend

## Related Files

- `cocoguard_web/pages/users.html` - User table HTML
- `cocoguard_web/pages/users.js` - User module JavaScript
- `cocoguard_web/pages/users.css` - User module styles
- `cocoguard_web/api-client.js` - API client (includes `listUsers()`)
- `cocoguard-backend/app/routers/users.py` - Backend users endpoint
- `cocoguard-backend/app/models.py` - User model definition

## Summary

The Users module is now fully integrated with the backend database. All users registered through the CocoGuard mobile application will automatically appear in the admin web panel's Users module. The interface is dynamic, responsive, and includes proper error handling for a professional user experience.
