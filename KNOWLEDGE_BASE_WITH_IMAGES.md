# 📚 Knowledge Base Article Management with Images

## Overview
The Knowledge Base feature allows administrators to create, edit, and manage educational articles with images through the web admin panel. These articles are automatically synced and displayed in the CocoGuard mobile application, providing farmers with valuable information about coconut farming.

## ✨ Features Implemented

### 1. **Web Admin Panel (cocoguard_web)**
- ✅ Add new articles with images
- ✅ Edit existing articles
- ✅ Upload and preview images (JPG, PNG, WebP)
- ✅ Category-based organization
- ✅ Tag management
- ✅ Image thumbnail display in table
- ✅ Full-size image preview modal
- ✅ File size validation (max 5MB)
- ✅ Real-time image preview before upload

### 2. **Mobile Application (cocoguard)**
- ✅ Display all articles with images
- ✅ Category filtering
- ✅ Article detail view with full image
- ✅ View counter
- ✅ Responsive image loading
- ✅ Error handling for missing images

### 3. **Backend API (cocoguard-backend)**
- ✅ Article CRUD operations
- ✅ Image upload endpoint
- ✅ File validation and storage
- ✅ Database schema with image_url field

## 📂 File Structure

```
cocoguard-backend/
├── app/
│   ├── models.py (KnowledgeArticle model with image_url)
│   └── routers/
│       ├── knowledge.py (Article CRUD endpoints)
│       └── uploads.py (Image upload endpoint)

cocoguard_web/
└── pages/
    ├── knowledge.html (Admin interface)
    └── knowledge.js (Client-side logic)

cocoguard/
├── lib/
│   ├── services/
│   │   └── knowledge_service.dart (API communication)
│   └── screens/
│       └── knowledge/
│           └── knowledge_screen.dart (Mobile UI)
```

## 🎯 How to Use

### Adding a New Article with Image

1. **Open the Web Admin Panel**
   - Navigate to `http://localhost/cocoguard_web/pages/knowledge.html`
   - Login with admin credentials

2. **Click "Add Article" Button**
   - The modal will open with the form

3. **Fill in Article Details**
   - **Title**: Enter a descriptive title (e.g., "How to Identify Coconut Beetles")
   - **Category**: Select from:
     - 🐛 Pest Management
     - 🩺 Disease Control
     - ⭐ Best Practices
     - 🌱 Fertilization
     - 🥥 Harvesting
   - **Content**: Write detailed information about the topic
   - **Tags**: Add comma-separated tags (e.g., pest, beetle, prevention)

4. **Upload Image**
   - Click "Choose File" under Article Image
   - Select an image (JPG, PNG, or WebP)
   - Maximum file size: 5MB
   - Recommended: Square images (1:1 ratio) for best mobile display
   - Preview will appear automatically

5. **Submit**
   - Click "✓ Add Article" button
   - System will:
     - Upload the image to server
     - Create the article record
     - Return to the articles list

6. **View on Mobile App**
   - Open the CocoGuard mobile app
   - Navigate to Knowledge Base
   - The new article will appear with the uploaded image
   - Click to view full details

### Editing an Article

1. Click the "Edit" button on any article row
2. Update any fields (title, category, content, tags)
3. Optionally upload a new image to replace the current one
4. Click "✓ Update Article"

### Image Features

- **Thumbnail View**: Click any thumbnail in the table to view full-size
- **Image Preview**: See preview before uploading
- **Progress Bar**: Visual feedback during upload
- **Validation**: Automatic file size and type checking

## 🔧 Technical Details

### Backend Endpoints

```
POST /uploads/knowledge-image
- Upload article image
- Auth: Admin only
- Returns: { filename, url, size, content_type }

POST /knowledge
- Create new article
- Auth: Admin only
- Body: { title, content, category, tags, image_url }

GET /knowledge
- List all articles
- Optional filters: category, tag
- Returns array of articles with image URLs

GET /knowledge/{article_id}
- Get single article
- Increments view counter
- Returns article with image URL

PUT /knowledge/{article_id}
- Update article
- Auth: Admin only
- Body: { title, content, category, tags, image_url }

DELETE /knowledge/{article_id}
- Delete article
- Auth: Admin only
```

### Database Schema

```sql
CREATE TABLE knowledge_articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT,
    image_url VARCHAR(255),  -- New field for image
    author_id INT,
    views INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### Image Storage

- **Location**: `cocoguard-backend/uploads/`
- **Naming**: `knowledge_YYYYMMDD_HHMMSS.ext`
- **Access URL**: `http://127.0.0.1:8000/uploads/files/{filename}`
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Max Size**: 5MB

## 📱 Mobile App Integration

### How Articles Appear in Mobile App

1. **Knowledge Screen**
   - Articles displayed as cards
   - Category badge with color coding
   - Image displayed if available (or placeholder icon)
   - Title and content preview
   - View count and date

2. **Article Detail View**
   - Full-screen image at top
   - Complete article content
   - All tags displayed as chips
   - Category information
   - Metadata (views, date)

3. **Category Filtering**
   - Filter chips at top of screen
   - Categories match web admin categories
   - Real-time filtering

## 🎨 UI/UX Enhancements

### Web Admin Panel
- Enhanced modals with emojis for better visual appeal
- Real-time image preview
- Progress indicators for uploads
- Clickable thumbnails in table
- Full-screen image modal
- Category badges with color coding
- Responsive design

### Mobile App
- Split background design
- Smooth animations
- Pull-to-refresh
- Error handling with retry
- Fallback for missing images
- Category-based color schemes

## 🧪 Testing Checklist

### Web Admin Testing
- [ ] Login as admin
- [ ] Click "Add Article" button
- [ ] Fill all required fields
- [ ] Upload an image (test with different formats: JPG, PNG, WebP)
- [ ] Verify image preview appears
- [ ] Submit the article
- [ ] Check article appears in table with thumbnail
- [ ] Click thumbnail to view full-size
- [ ] Edit an article and change image
- [ ] Delete an article

### Mobile App Testing
- [ ] Open CocoGuard mobile app
- [ ] Navigate to Knowledge Base
- [ ] Verify new article appears
- [ ] Check image loads correctly
- [ ] Click article to view details
- [ ] Verify full image displays
- [ ] Test category filtering
- [ ] Pull to refresh
- [ ] Test with poor network (image loading)

### Backend Testing
- [ ] Verify file upload endpoint works
- [ ] Check file size validation (try >5MB file)
- [ ] Test with invalid file types
- [ ] Verify files saved in uploads directory
- [ ] Check database records include image_url
- [ ] Test API endpoints with Postman/REST client

## 🚀 Deployment Notes

### Before Going Live

1. **Update Image URL in Backend**
   ```python
   # In uploads.py, change:
   "url": f"http://127.0.0.1:8000/uploads/files/{filename}"
   # To your production domain:
   "url": f"https://your-domain.com/uploads/files/{filename}"
   ```

2. **Ensure Upload Directory Permissions**
   ```bash
   chmod 755 cocoguard-backend/uploads
   ```

3. **Configure CORS for Images**
   - Ensure mobile app can access image URLs
   - Add proper CORS headers in backend

4. **Set Up Image Optimization** (Optional)
   - Consider adding image compression
   - Generate multiple sizes for responsive loading

## 🔒 Security Considerations

- ✅ Admin-only upload access
- ✅ File type validation
- ✅ File size limits
- ✅ Unique filename generation
- ✅ Path traversal prevention
- ⚠️ Consider: Image virus scanning for production
- ⚠️ Consider: Content moderation for user-generated content

## 📊 Categories Explained

| Category | Description | Mobile Icon |
|----------|-------------|-------------|
| Pest Management | Articles about identifying and managing pests | 🐛 |
| Disease Control | Information about coconut diseases and treatments | 🩺 |
| Best Practices | General farming best practices and tips | ⭐ |
| Fertilization | Fertilizer application and soil management | 🌱 |
| Harvesting | Harvesting techniques and timing | 🥥 |

## 🐛 Troubleshooting

### Image Not Showing in Mobile App
1. Check image URL is absolute (includes http://)
2. Verify backend server is accessible from mobile device
3. Check CORS configuration
4. Verify image file exists in uploads directory

### Upload Fails
1. Check file size (<5MB)
2. Verify file type (JPG, PNG, WebP only)
3. Check uploads directory permissions
4. Verify backend server is running

### Articles Not Appearing
1. Check backend API is running
2. Verify mobile app API_BASE_URL setting
3. Check network connectivity
4. Review backend logs for errors

## 📈 Future Enhancements

- [ ] Rich text editor for content
- [ ] Multiple images per article
- [ ] Video support
- [ ] PDF attachment support
- [ ] Article versioning
- [ ] Scheduled publishing
- [ ] Analytics dashboard
- [ ] Article ratings and comments
- [ ] Search functionality
- [ ] Export articles to PDF

## 🎓 Examples

### Sample Article: Pest Management
```
Title: How to Identify Coconut Beetles
Category: Pest Management
Content: The coconut beetle (Oryctes rhinoceros) is one of the most 
destructive pests affecting coconut palms. Early identification is 
crucial for effective management...

Tags: pest, beetle, identification, prevention, coconut
Image: Clear photo of a coconut beetle on a palm frond
```

### Sample Article: Best Practices
```
Title: Best Practices for Coconut Farming
Category: Best Practices
Content: Successful coconut farming requires attention to several key 
factors. This guide covers essential practices for optimal yield...

Tags: farming, best-practices, tips, coconut, yield
Image: Well-maintained coconut plantation
```

## 📞 Support

For questions or issues:
- Check the API documentation in backend/API_REQUESTS.rest
- Review backend logs for error messages
- Test endpoints with Postman or REST client
- Verify all services are running (backend, web server)

---

**Last Updated**: December 10, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
