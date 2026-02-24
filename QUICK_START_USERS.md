# Quick Start Guide - Testing Users Module

## Step 1: Start the Backend Server

Open PowerShell and run:

```powershell
cd c:\xampp\htdocs\cocoguard-backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## Step 2: Verify Database Has Users

In another PowerShell window:

```powershell
cd c:\xampp\htdocs\cocoguard-backend
python check_users.py
```

If no users exist, create an admin and some test users:

```powershell
# Create admin user
python create_admin_user.py

# Create test farmer user
python create_farmer_user.py
```

## Step 3: Test the API (Optional)

Open in browser:
```
c:\xampp\htdocs\cocoguard_web\test_users_api.html
```

Follow the test steps:
1. Click "Test Connection" - Should show "✅ Backend Connected!"
2. Click "Login" (with admin credentials)
3. Click "Get All Users" - Should display all users in a table

## Step 4: Open the Main Web Application

1. Open `c:\xampp\htdocs\cocoguard_web\index.html` in your browser
2. Login with admin credentials:
   - Email: `admin@cocoguard.com`
   - Password: `admin123` (or whatever you set)

## Step 5: Navigate to Users Module

1. Click "Users" in the sidebar
2. You should see:
   - A loading spinner briefly
   - Then a table with all registered users
   - Users from the mobile app will appear here

## Expected Results

✅ **Working correctly if you see:**
- Table loads automatically
- All users from database displayed
- Status badges show (green for Active, red for Inactive)
- Click "Edit" to see user details
- No errors in browser console (F12)

❌ **Troubleshooting:**

### "Error loading users"
- Check backend is running on port 8000
- Verify you're logged in as admin
- Check browser console for errors

### "No users found"
- Run `python check_users.py` to verify database has users
- Create test users with `python create_farmer_user.py`

### Authentication errors
- Clear browser cache and localStorage
- Login again with admin account
- Verify admin user exists in database

### Connection refused
- Backend not running - start it with uvicorn command
- Wrong port - check API base URL in browser console

## Testing Mobile App Integration

1. Open CocoGuard mobile app (Flutter)
2. Register a new user account
3. Complete registration with farm details
4. Go to web admin panel → Users module
5. Refresh the page
6. New user should appear in the table

## Browser Console Commands

Open browser console (F12) and try these commands:

```javascript
// Check API client
console.log(apiClient.baseURL);

// Check authentication
console.log(localStorage.getItem('access_token'));

// Manually fetch users
apiClient.listUsers().then(users => console.log(users));

// Check current user
apiClient.getCurrentUser().then(user => console.log(user));
```

## Files Modified

- ✅ `pages/users.html` - Removed static data
- ✅ `pages/users.js` - Added API integration
- ✅ `pages/users.css` - Added loading spinner
- ✅ `app/routers/users.py` - Enhanced user data

## Next Steps

Once everything is working:

1. **Add More Features:**
   - Search/filter users
   - Export to CSV
   - User statistics

2. **Implement User Management:**
   - Edit user details
   - Toggle user status
   - Delete users

3. **Add Pagination:**
   - Handle large numbers of users
   - Implement page navigation

4. **Enhance UI:**
   - Add sorting by columns
   - Add filtering by role/status
   - Add bulk actions

## Support

If you encounter issues:

1. Check browser console (F12) for JavaScript errors
2. Check backend logs for API errors
3. Verify database connection
4. Ensure admin authentication is working

## Summary

The Users module now dynamically loads data from your backend database. All users registered through the CocoGuard mobile application will automatically appear in this table. The system is fully integrated and ready to use!
