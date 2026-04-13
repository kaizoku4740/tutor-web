# Math Tutoring Backend API Documentation

## Overview

The backend system handles signup submissions, validation, and persistence using Cloudflare Pages Functions and KV storage. All data is stored in the `math-tutor-signups` KV namespace.

## API Endpoints

### 1. POST `/api/contact-messages` - Submit Signup

**Description:** Submit a new signup for a tutoring session.

**Request Body:**
```json
{
  "name": "John Doe",
  "emailOrPhone": "john@example.com",
  "goal": "Understand calculus better",
  "tutor": "Neha M.",
  "date": "2026-04-16",
  "time": "7:00pm - 8:00pm"
}
```

**Required Fields:**
- `name` (string): Student's full name, 1+ characters
- `emailOrPhone` (string): Valid email or phone number
  - Email format: `user@domain.com`
  - Phone formats: `555-123-4567`, `(555) 123-4567`, `+1 555 123 4567`, etc.
- `goal` (string): Session goal, 1+ characters
- `tutor` (string): Tutor name (must match available tutors)
- `date` (string): Date in ISO format `YYYY-MM-DD`
- `time` (string): Time slot (e.g., "7:00pm - 8:00pm")

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Signup confirmed!",
  "signup": {
    "id": "signup-1681234567890-abc123def",
    "tutor": "Neha M.",
    "date": "2026-04-16",
    "time": "7:00pm - 8:00pm"
  }
}
```

**Response (Validation Error - 400):**
```json
{
  "success": false,
  "errors": [
    "Name is required",
    "Please provide a valid email address or phone number"
  ]
}
```

**Response (Slot Full - 409):**
```json
{
  "success": false,
  "error": "This slot is now full. Please select another time."
}
```

**Response (Duplicate Booking - 409):**
```json
{
  "success": false,
  "error": "You have already signed up for this time slot"
}
```

**Validation Rules:**
- Each slot has a capacity of 3 students
- No duplicate bookings (same tutor, date, and contact)
- Email must be in valid format
- Phone must have at least 10 digits

---

### 2. GET `/api/contact-messages` - Retrieve All Signups (Admin Only)

**Description:** Get all submitted signups (requires admin authentication).

**Headers:**
```
X-Admin-Key: admin-password-change-me
```

**Response (Success - 200):**
```json
{
  "success": true,
  "count": 5,
  "signups": [
    {
      "id": "signup-1681234567890-abc123def",
      "name": "John Doe",
      "contact": "john@example.com",
      "isEmail": true,
      "goal": "Understand calculus better",
      "tutor": "Neha M.",
      "date": "2026-04-16",
      "time": "7:00pm - 8:00pm",
      "createdAt": "2026-04-13T15:30:00Z",
      "status": "confirmed"
    }
  ]
}
```

**Response (Unauthorized - 403):**
```json
{
  "error": "Unauthorized"
}
```

---

### 3. GET `/api/signups` - Signups Analytics (Admin Only)

**Description:** Get signup analytics and filtering options.

**Headers:**
```
X-Admin-Key: admin-password-change-me
```

**Query Parameters (Optional):**
- `tutor`: Filter by tutor name
- `date`: Filter by date (YYYY-MM-DD)

**Examples:**
```
GET /api/signups?tutor=Neha%20M.
GET /api/signups?date=2026-04-16
GET /api/signups?tutor=Neha%20M.&date=2026-04-16
```

**Response (Success - 200):**
```json
{
  "success": true,
  "count": 3,
  "signups": [...],
  "analytics": {
    "totalSignups": 3,
    "byTutor": {
      "Neha M.": 2,
      "Nandita S.": 1
    },
    "byDate": {
      "2026-04-16": 2,
      "2026-04-14": 1
    },
    "slotUtilization": {
      "Neha M.-2026-04-16-7:00pm - 8:00pm": {
        "signups": 2,
        "capacity": 3
      }
    }
  }
}
```

---

### 4. DELETE `/api/contact-messages` - Clear All Signups (Admin Only)

**Description:** Clear all signup data (admin only).

**Headers:**
```
X-Admin-Key: admin-password-change-me
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "All signups cleared"
}
```

**Response (Unauthorized - 403):**
```json
{
  "error": "Unauthorized"
}
```

---

### 5. DELETE `/api/signups?id={signupId}` - Remove Specific Signup (Admin Only)

**Description:** Delete a specific signup by ID.

**Headers:**
```
X-Admin-Key: admin-password-change-me
```

**Query Parameters:**
- `id` (required): The signup ID to delete

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Signup removed"
}
```

**Response (Not Found - 404):**
```json
{
  "error": "Signup not found"
}
```

**Response (Unauthorized - 403):**
```json
{
  "error": "Unauthorized"
}
```

---

## Data Schema

### Signup Object
```javascript
{
  id: string,              // Unique signup ID (auto-generated)
  name: string,            // Student name
  contact: string,         // Email or phone number
  isEmail: boolean,        // Whether contact is email (vs phone)
  goal: string,            // Session goal
  tutor: string,           // Tutor name
  date: string,            // Date (YYYY-MM-DD)
  time: string,            // Time slot
  createdAt: string,       // ISO timestamp
  status: "confirmed"      // Current status
}
```

---

## Environment Setup

### Required Cloudflare Settings

1. **KV Namespace Binding:**
   - Namespace: `REVIEWS`
   - ID: `fa6ae6d29690413ebca26d9236ef7afd`
   - Preview ID: `fa6ae6d29690413ebca26d9236ef7afd`

2. **Storage Limits:**
   - Max storage key: `math-tutor-signups`
   - Max entries: 1000 (auto-bounded to prevent growth)
   - Automatic cleanup: Oldest entries removed when limit reached

### Configuration

Update the `ADMIN_PASSWORD` in `/functions/api/contact-messages.js` and `/functions/api/signups.js`:

```javascript
const ADMIN_PASSWORD = 'your-secure-password-here';
```

---

## Testing

### Using the Test Script

```bash
# Test against localhost (requires running dev server)
python3 test-backend.py

# Test against production
python3 test-backend.py prod
```

### Manual Testing with cURL

**Submit Signup:**
```bash
curl -X POST http://localhost:8787/api/contact-messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "emailOrPhone": "john@example.com",
    "goal": "Learn calculus",
    "tutor": "Neha M.",
    "date": "2026-04-16",
    "time": "7:00pm - 8:00pm"
  }'
```

**Get All Signups (Admin):**
```bash
curl -H "X-Admin-Key: admin-password-change-me" \
  http://localhost:8787/api/contact-messages
```

**Get Analytics:**
```bash
curl -H "X-Admin-Key: admin-password-change-me" \
  "http://localhost:8787/api/signups?tutor=Neha%20M."
```

---

## Error Handling

### Common Error Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 201 | Signup created successfully | N/A |
| 400 | Validation error (missing/invalid fields) | Invalid email format |
| 403 | Unauthorized (missing/wrong admin key) | Wrong X-Admin-Key |
| 404 | Signup not found | ID doesn't exist |
| 409 | Conflict (slot full or duplicate booking) | Slot capacity reached |
| 500 | Server error | Database unavailable |

### Validation Error Messages

- `"Name is required"` - Name field is empty
- `"Email or phone is required"` - Contact field is empty
- `"Please provide a valid email address or phone number"` - Invalid format
- `"Session goal is required"` - Goal field is empty
- `"Tutor selection is required"` - Tutor not specified
- `"Date selection is required"` - Date not specified
- `"Time slot is required"` - Time not specified
- `"This slot is now full. Please select another time."` - Capacity reached (3/3)
- `"You have already signed up for this time slot"` - Duplicate booking

---

## Frontend Integration

The React frontend (`SignupPage.jsx`) sends the correct payload format:

```javascript
const response = await fetch('/api/contact-messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: formData.name,
    emailOrPhone: formData.emailOrPhone,
    goal: formData.goal,
    tutor: selectedSlot.tutor,
    date: selectedDate.toISOString().split('T')[0],
    time: selectedSlot.time,
  }),
});
```

---

## Deployment

### Deploy to Cloudflare Pages

```bash
# Install Wrangler CLI
npm install -g wrangler

# Deploy functions
wrangler deploy

# Or via GitHub integration (automatic on git push)
git add -A
git commit -m "Update backend"
git push origin main
```

---

## Security Notes

1. **Admin Key:** Change `ADMIN_PASSWORD` from default value
2. **CORS:** Currently allows all origins (`*`) - consider restricting in production
3. **Rate Limiting:** Not implemented - consider adding for production
4. **Input Sanitization:** Basic validation only - consider additional sanitization
5. **HTTPS Only:** Always use HTTPS in production (Cloudflare Pages enforces this)

---

## Future Enhancements

- [ ] Email notifications to tutors and parents
- [ ] SMS confirmations
- [ ] Student account management
- [ ] Payment integration
- [ ] Automated reminders
- [ ] Rescheduling/cancellation
- [ ] TA dashboard for managing signups
- [ ] Export signups to CSV/JSON
