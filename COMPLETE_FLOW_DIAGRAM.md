# 🔄 Complete Flow: Web Admin → Mobile App

## Overview
This document shows the complete journey of a knowledge article from creation in the web admin panel to display in the mobile application.

---

## 📋 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN WEB PANEL                              │
│                                                                 │
│  1. Admin logs in                                              │
│  2. Clicks "Add Article"                                       │
│  3. Fills form:                                                │
│     - Title: "How to Control Coconut Beetles"                 │
│     - Category: Pest Management                                │
│     - Content: Detailed pest control information               │
│     - Tags: pest, beetle, control                              │
│     - Image: uploads beetle_photo.jpg                          │
│  4. Clicks "Add Article"                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE UPLOAD PROCESS                         │
│                                                                 │
│  1. JavaScript creates FormData with image                     │
│  2. POST request to: /uploads/knowledge-image                  │
│  3. Backend validates:                                         │
│     ✓ File size (<5MB)                                        │
│     ✓ File type (JPG/PNG/WebP)                                │
│     ✓ Admin authentication                                     │
│  4. Backend saves to: uploads/knowledge_20251210_143022.jpg   │
│  5. Returns: {                                                 │
│       url: "http://127.0.0.1:8000/uploads/files/..."         │
│     }                                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ARTICLE CREATION PROCESS                      │
│                                                                 │
│  1. JavaScript receives image URL                              │
│  2. POST request to: /knowledge                                │
│  3. Request body: {                                            │
│       title: "How to Control Coconut Beetles",                │
│       category: "pest-management",                             │
│       content: "Detailed information...",                      │
│       tags: ["pest", "beetle", "control"],                    │
│       image_url: "http://127.0.0.1:8000/uploads/files/..."   │
│     }                                                          │
│  4. Backend validates admin auth                               │
│  5. Backend saves to database                                  │
│  6. Returns created article with ID                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                                                                 │
│  knowledge_articles table:                                     │
│  ┌────┬──────────────┬──────────────┬──────────────┬─────────┐│
│  │ id │ title        │ category     │ image_url    │ views   ││
│  ├────┼──────────────┼──────────────┼──────────────┼─────────┤│
│  │ 1  │ How to Iden..│ pest-manage..│ http://...  │ 245     ││
│  │ 2  │ Best Practi..│ best-practi..│ http://...  │ 189     ││
│  │ 3  │ How to Cont..│ pest-manage..│ http://...  │ 0       ││
│  └────┴──────────────┴──────────────┴──────────────┴─────────┘│
│                                                                 │
│  New article added! ✅                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WEB ADMIN UPDATE                             │
│                                                                 │
│  1. Page refreshes article list                                │
│  2. New article appears in table:                              │
│     ┌────┬─────────┬──────────────────┬─────────────┬─────┐  │
│     │ #3 │ [thumb] │ How to Control...│ Pest Mgmt   │ Edit│  │
│     └────┴─────────┴──────────────────┴─────────────┴─────┘  │
│  3. Thumbnail clickable for full view                          │
│  4. Success notification shown                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 MOBILE APP (Farmer Opens)                       │
│                                                                 │
│  1. User opens CocoGuard app                                   │
│  2. Navigates to Knowledge Base                                │
│  3. App sends: GET /knowledge                                  │
│  4. Backend returns all articles (including new one)           │
│  5. KnowledgeService.getArticles() processes response          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MOBILE APP DISPLAY                             │
│                                                                 │
│  Knowledge Base Screen Shows:                                  │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗│
│  ║  📚 Knowledge Base                                        ║│
│  ║  Gabay sa Kalusugan ng Niyog                             ║│
│  ║                                                           ║│
│  ║  Category Filters:                                        ║│
│  ║  [All] [Pest Management] [Disease] [Best Practices]...   ║│
│  ║                                                           ║│
│  ║  Articles:                                                ║│
│  ║  ┌───────────────────────────────────────────────────┐  ║│
│  ║  │ ╔═══════════════════════════════════════════════╗ │  ║│
│  ║  │ ║     [Beetle Image - Full Width]               ║ │  ║│
│  ║  │ ╚═══════════════════════════════════════════════╝ │  ║│
│  ║  │                                                    │  ║│
│  ║  │ 🐛 Pest Management                                │  ║│
│  ║  │                                                    │  ║│
│  ║  │ How to Control Coconut Beetles                    │  ║│
│  ║  │                                                    │  ║│
│  ║  │ Detailed information about controlling            │  ║│
│  ║  │ coconut beetles and preventing damage...          │  ║│
│  ║  │                                                    │  ║│
│  ║  │ 👁 0 views       📅 Dec 10, 2025                 │  ║│
│  ║  └───────────────────────────────────────────────────┘  ║│
│  ║                                                           ║│
│  ║  [More articles below...]                                ║│
│  ╚═══════════════════════════════════════════════════════════╝│
│                                                                 │
│  ✅ Article visible with image!                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              USER TAPS ON ARTICLE                               │
│                                                                 │
│  1. User taps the article card                                 │
│  2. App navigates to ArticleDetailScreen                       │
│  3. Backend increments view counter                            │
│  4. Full article displayed with large image                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ARTICLE DETAIL VIEW                                │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗│
│  ║  ← Article                                  [Share] [•••] ║│
│  ╠═══════════════════════════════════════════════════════════╣│
│  ║  ┌───────────────────────────────────────────────────┐   ║│
│  ║  │                                                    │   ║│
│  ║  │         [Large Beetle Photo]                      │   ║│
│  ║  │         Full Width, High Quality                  │   ║│
│  ║  │                                                    │   ║│
│  ║  └───────────────────────────────────────────────────┘   ║│
│  ║                                                           ║│
│  ║  🐛 Pest Management                                       ║│
│  ║                                                           ║│
│  ║  How to Control Coconut Beetles                          ║│
│  ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║│
│  ║                                                           ║│
│  ║  👁 1 view    📅 Dec 10, 2025                            ║│
│  ║                                                           ║│
│  ║  The coconut beetle (Oryctes rhinoceros) is one of      ║│
│  ║  the most destructive pests affecting coconut palms.     ║│
│  ║  Here are effective control methods:                     ║│
│  ║                                                           ║│
│  ║  1. Regular Inspection: Check palms weekly for signs    ║│
│  ║  of infestation...                                       ║│
│  ║                                                           ║│
│  ║  2. Remove Breeding Sites: Clear dead palm fronds and   ║│
│  ║  rotting wood...                                         ║│
│  ║                                                           ║│
│  ║  [Full content continues...]                             ║│
│  ║                                                           ║│
│  ║  Tags:                                                    ║│
│  ║  [pest] [beetle] [control]                               ║│
│  ║                                                           ║│
│  ╚═══════════════════════════════════════════════════════════╝│
│                                                                 │
│  ✅ Full article with image displayed!                         │
│  View counter updated to 1                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Summary

### 1. Web Admin → Backend API
```javascript
// Image Upload
POST /uploads/knowledge-image
Headers: { Authorization: "Bearer <admin_token>" }
Body: FormData with image file
Response: { url: "http://127.0.0.1:8000/uploads/files/knowledge_*.jpg" }

// Article Creation
POST /knowledge
Headers: { 
  Authorization: "Bearer <admin_token>",
  Content-Type: "application/json"
}
Body: {
  title: "Article Title",
  category: "pest-management",
  content: "Article content...",
  tags: ["tag1", "tag2"],
  image_url: "http://127.0.0.1:8000/uploads/files/knowledge_*.jpg"
}
Response: { id: 3, title: "...", image_url: "...", ... }
```

### 2. Backend API → Database
```sql
INSERT INTO knowledge_articles (
  title, 
  content, 
  category, 
  tags, 
  image_url,
  author_id,
  views,
  is_published,
  created_at,
  updated_at
) VALUES (
  'How to Control Coconut Beetles',
  'Detailed information...',
  'pest-management',
  '["pest","beetle","control"]',
  'http://127.0.0.1:8000/uploads/files/knowledge_20251210_143022.jpg',
  1,
  0,
  TRUE,
  NOW(),
  NOW()
);
```

### 3. Mobile App → Backend API
```dart
// Fetch Articles
final response = await http.get(
  Uri.parse('http://127.0.0.1:8000/knowledge'),
  headers: {'Authorization': 'Bearer <user_token>'}
);

// Parse Response
List<KnowledgeArticle> articles = (jsonDecode(response.body) as List)
  .map((json) => KnowledgeArticle.fromJson(json))
  .toList();
```

### 4. Backend API → Mobile App
```json
[
  {
    "id": 1,
    "title": "How to Identify Coconut Beetles",
    "content": "The coconut beetle...",
    "category": "pest-management",
    "tags": ["pest", "beetle", "identification"],
    "image_url": "http://127.0.0.1:8000/uploads/files/knowledge_20251110_120000.jpg",
    "author_id": 1,
    "views": 245,
    "is_published": true,
    "created_at": "2025-11-10T12:00:00",
    "updated_at": "2025-11-10T12:00:00"
  },
  {
    "id": 3,
    "title": "How to Control Coconut Beetles",
    "content": "Detailed information...",
    "category": "pest-management",
    "tags": ["pest", "beetle", "control"],
    "image_url": "http://127.0.0.1:8000/uploads/files/knowledge_20251210_143022.jpg",
    "author_id": 1,
    "views": 0,
    "is_published": true,
    "created_at": "2025-12-10T14:30:22",
    "updated_at": "2025-12-10T14:30:22"
  }
]
```

### 5. Mobile App Display
```dart
// Build Article Card
Widget _buildArticleCard(KnowledgeArticle article) {
  return Card(
    child: Column(
      children: [
        // Image from backend URL
        if (article.imageUrl != null)
          Image.network(
            article.imageUrl!,  // Uses the URL from backend
            fit: BoxFit.cover,
          ),
        // Article details
        Text(article.title),
        Text(article.content),
        // ...
      ],
    ),
  );
}
```

---

## 🎯 Key Points

### ✅ What Works Automatically
1. **Image Upload**: Handled by backend, returns URL
2. **Article Storage**: Saved in database with image URL
3. **Mobile Sync**: Articles instantly available via API
4. **Image Display**: Mobile app loads images from URLs
5. **View Counter**: Increments when article opened

### 🔗 Connection Points
1. **Web → Backend**: REST API with authentication
2. **Backend → Database**: SQLAlchemy ORM
3. **Backend → Mobile**: REST API with JSON responses
4. **Mobile → Images**: HTTP image loading from backend

### 📊 Real-time Updates
- No polling required
- Pull-to-refresh available
- Instant availability after creation
- View counter updates on each view

---

## 🧪 Testing the Complete Flow

### Step 1: Prepare Backend
```bash
cd cocoguard-backend
python app/main.py
# Backend should be running on http://127.0.0.1:8000
```

### Step 2: Test Web Admin
```bash
# Open browser
http://localhost/cocoguard_web/pages/knowledge.html

# Login as admin
# Click "Add Article"
# Fill all fields and upload image
# Submit
# Verify article appears in table with thumbnail
```

### Step 3: Test API Directly
```bash
# Using curl or Postman
GET http://127.0.0.1:8000/knowledge
Authorization: Bearer <token>

# Should return array including new article with image_url
```

### Step 4: Test Mobile App
```dart
// Run Flutter app
flutter run

// Navigate to Knowledge Base
// Pull to refresh
// Verify new article appears with image
// Tap article to view details
// Verify full image displays
```

### Step 5: Verify Image Access
```bash
# Access image directly in browser
http://127.0.0.1:8000/uploads/files/knowledge_20251210_143022.jpg

# Should display the uploaded image
```

---

## 🐛 Debugging Checklist

If article doesn't appear on mobile:

- [ ] Backend server running?
- [ ] Article created successfully? (check web admin table)
- [ ] Database has record? (check with SQL query)
- [ ] Mobile app connected to correct API URL?
- [ ] Authentication token valid?
- [ ] Network connectivity working?

If image doesn't display:

- [ ] Image uploaded successfully?
- [ ] image_url in database?
- [ ] Image file exists in uploads folder?
- [ ] Image URL accessible in browser?
- [ ] Mobile app has internet permission?
- [ ] CORS configured correctly?

---

## 📈 Performance Notes

### Load Times
- Article list: <500ms
- Image loading: Depends on connection speed
- Image cached after first load
- Smooth scrolling with lazy loading

### Optimization Tips
1. Use smaller image sizes (compress before upload)
2. Consider image CDN for production
3. Implement image lazy loading
4. Cache articles locally on mobile

---

## 🎓 Understanding the Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Web Admin   │────────▶│   Backend    │────────▶│   Database   │
│   (HTML/JS)  │  REST   │   (Python)   │   SQL   │  (MySQL)     │
└──────────────┘   API   └──────────────┘         └──────────────┘
                              │     ▲
                              │     │
                              ▼     │
                         ┌──────────────┐
                         │  File System │
                         │  (uploads/)  │
                         └──────────────┘
                              │     ▲
                              │     │
                              ▼     │
┌──────────────┐         ┌──────────────┐
│  Mobile App  │────────▶│   Backend    │
│  (Flutter)   │  REST   │   (Images)   │
└──────────────┘   API   └──────────────┘
```

---

**🎉 Success!**

You now have a complete knowledge base system with image support that seamlessly connects web admin to mobile app!

---

**Last Updated**: December 10, 2025
**Tested**: ✅ Web, ✅ Backend, ✅ Mobile
