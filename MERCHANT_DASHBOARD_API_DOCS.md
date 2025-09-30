API Endpoints
1. GET /overview

Description: Fetches the merchant's dashboard overview (profile, verification, completion status).
Method: GET
Request:

Headers: None (session cookie handled by browser)
Query Parameters: None
Body: None


Response:
json{
  "success": true,
  "data": {
    "merchant": {
      "id": "string", // MongoDB ObjectId
      "businessName": "string",
      "email": "string",
      "phone": "string",
      "rating": 0, // Number
      "totalReviews": 0, // Number
      "memberSince": "2023-01-01T00:00:00Z" // Date
    },
    "verificationStatus": {
      "isVerified": true, // Boolean
      "isFeatured": false, // Boolean
      "verificationBadge": "string", // e.g., "Verified Business"
      "statusMessage": "string", // e.g., "Your business is verified"
      "verifiedDate": "2023-01-01T00:00:00Z" // Date or null
    },
    "profileCompletion": {
      "percentage": 0, // Number (0-100)
      "documentsPercentage": 0, // Number (0-100)
      "nextSteps": ["string"] // e.g., ["Complete your business profile"]
    }
  }
}

Error Example:
json{
  "success": false,
  "error": "Merchant not found"
}

Frontend Example (using Fetch with credentials):
fetch('http://localhost:5000/api/merchants/dashboard/overview', {
  method: 'GET',
  credentials: 'include' // Include session cookie
})
.then(response => response.json())
.then(data => console.log(data.data.merchant.businessName))
.catch(error => console.error('Error:', error));


2. GET /analytics

Description: Retrieves performance analytics (reviews, products, orders) over a period.
Method: GET
Request:

Headers: None (session cookie handled by browser)
Query Parameters: period (optional, default: 30, number of days)
Body: None


Response:
json{
  "success": true,
  "data": {
    "period": "string", // e.g., "Last 30 days"
    "analytics": {
      "reviews": {
        "total": 0, // Number
        "recent": 0, // Number
        "growth": "string" // e.g., "+10.5%"
      }
    },
    "products": {
      "total": 0, // Number
      "active": 0, // Number
      "inactive": 0, // Number
      "recent": 0, // Number
      "growth": "string" // e.g., "+15.2%"
    } // or null if unavailable
    "orders": {
      "total": 0, // Number
      "recent": 0, // Number
      "growth": "string", // e.g., "+20.0%"
      "revenue": {
        "current": 0, // Number (KES)
        "previous": 0, // Number (KES)
        "growth": "string", // e.g., "+25.3%"
        "currency": "string" // e.g., "KES"
      }
    } // or null if unavailable
  }
}

Error Example:
json{
  "success": false,
  "error": "Failed to fetch performance analytics"
}

Frontend Example:
fetch('http://localhost:5000/api/merchants/dashboard/analytics?period=7', {
  method: 'GET',
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data.data.analytics.reviews.total))
.catch(error => console.error('Error:', error));


3. GET /activity

Description: Fetches recent merchant activities (reviews, products, orders).
Method: GET
Request:

Headers: None (session cookie handled by browser)
Query Parameters: limit (optional, default: 10, number of activities)
Body: None


Response:
json{
  "success": true,
  "count": 0, // Number of activities returned
  "data": [
    {
      "type": "string", // e.g., "review", "product", "order"
      "description": "string", // e.g., "New 4-star review from John Doe"
      "timestamp": "string", // e.g., "2 hours ago"
      "date": "2023-01-01T00:00:00Z", // Date
      "data": {
        "rating": 0, // Number (for review)
        "content": "string", // String (for review)
        "productName": "string", // String (for product)
        "status": "string", // String (for product, e.g., "active")
        "orderNumber": "string", // String (for order)
        "status": "string", // String (for order, e.g., "pending")
        "amount": 0 // Number (for order)
      }
    }
  ]
}

Error Example:
json{
  "success": false,
  "error": "Failed to fetch recent activity"
}

Frontend Example:
fetch('http://localhost:5000/api/merchants/dashboard/activity?limit=5', {
  method: 'GET',
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data.data[0].description))
.catch(error => console.error('Error:', error));


4. GET /notifications

Description: Retrieves merchant notifications (verification, profile, reviews).
Method: GET
Request:

Headers: None (session cookie handled by browser)
Query Parameters: None
Body: None


Response:
json{
  "success": true,
  "count": 0, // Total number of notifications
  "unreadCount": 0, // Number of unread notifications
  "data": [
    {
      "id": "string", // Unique notification ID
      "type": "string", // e.g., "success", "warning", "info"
      "icon": "string", // e.g., "check-circle", "alert-circle"
      "title": "string", // e.g., "Verification completed successfully!"
      "timestamp": "string", // e.g., "2 days ago"
      "date": "2023-01-01T00:00:00Z", // Date
      "read": true // Boolean
    }
  ]
}

Error Example:
json{
  "success": false,
  "error": "Failed to fetch notifications"
}

Frontend Example:
fetch('http://localhost:5000/api/merchants/dashboard/notifications', {
  method: 'GET',
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data.unreadCount, data.data[0].title))
.catch(error => console.error('Error:', error));


5. GET /reviews

Description: Fetches merchant reviews with pagination and statistics.
Method: GET
Request:

Headers: None (session cookie handled by browser)
Query Parameters:

page (optional, default: 1)
limit (optional, default: 10)
sortBy (optional, default: createdAt)
order (optional, default: desc)
rating (optional, e.g., 5, all)


Body: None


Response:
json{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "string", // MongoDB ObjectId
        "rating": 0, // Number (1-5)
        "content": "string", // Review text
        "customerName": "string", // e.g., "John Doe" or "Anonymous"
        "customerImage": "string", // URL or null
        "date": "2023-01-01T00:00:00Z", // Date
        "timeAgo": "string", // e.g., "3 hours ago"
        "helpful": 0, // Number
        "reply": "string" // or null
      }
    ],
    "stats": {
      "totalReviews": 0, // Number
      "averageRating": 0, // Number (e.g., 4.5)
      "distribution": {
        "5": 0, // Number
        "4": 0, // Number
        "3": 0, // Number
        "2": 0, // Number
        "1": 0 // Number
      }
    },
    "pagination": {
      "page": 0, // Number
      "limit": 0, // Number
      "total": 0, // Number
      "pages": 0 // Number
    }
  }
}

Error Example:
json{
  "success": false,
  "error": "Failed to fetch reviews"
}

Frontend Example:
fetch('http://localhost:5000/api/merchants/dashboard/reviews?page=1&limit=10', {
  method: 'GET',
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data.data.reviews[0].customerName, data.data.stats.averageRating))
.catch(error => console.error('Error:', error));


6. GET /quick-actions

Description: Provides quick action items for the merchant dashboard.
Method: GET
Request:

Headers: None (session cookie handled by browser)
Query Parameters: None
Body: None


Response:
json{
  "success": true,
  "data": [
    {
      "id": "string", // e.g., "edit_profile"
      "label": "string", // e.g., "Edit Profile"
      "icon": "string", // e.g., "edit"
      "link": "string", // e.g., "/merchant/profile/edit" (frontend route)
      "enabled": true, // Boolean
      "badge": "string", // e.g., "Verified" or "Incomplete" or null
      "badgeColor": "string" // e.g., "green" or "red" or null
    }
  ]
}

Error Example:
json{
  "success": false,
  "error": "Failed to fetch quick actions"
}

Frontend Example:
fetch('http://localhost:5000/api/merchants/dashboard/quick-actions', {
  method: 'GET',
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log(data.data[0].label, data.data[0].link))
.catch(error => console.error('Error:', error));