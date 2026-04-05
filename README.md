
# Math Academy by Mrs Garg

A professional tutoring website with multi-TA support, review system, and admin panel.
Built with **React + Vite** for the frontend and **Python mock API** for local development.

## 🚀 Running Locally

### Prerequisites
- Python 3.x (for mock API server)
- Node.js 16+ and npm (for React app)
- Git

### Quick Start (Two Terminal Windows Required)

**Terminal 1: Start the Mock API Server**
```bash
cd /Users/abhi/lm\ copy
python3 test-api.py
```
✓ Runs on `http://localhost:9999`

**Terminal 2: Start React Dev Server** (keep Terminal 1 running)
```bash
cd /Users/abhi/lm\ copy/react-app
npm run dev
```
✓ Runs on `http://localhost:5173`

**Open in Browser:**
```
http://localhost:5173
```

**First time only:**
```bash
cd /Users/abhi/lm\ copy/react-app
npm install
npm run dev
```

**✓ Features:**
- Hot reload enabled (code changes appear instantly)
- API proxied to localhost:9999
- TA data loaded from `tas.json`

---

## 🛑 Stopping the Servers

**Kill all servers at once:**
```bash
pkill -f "test-api.py"
pkill -f "node"
```

**Or kill individual servers:**
```bash
pkill -f "test-api.py"    # Stop API only
pkill -f "node"           # Stop React dev server only
```

---

## � Troubleshooting Local Setup

### "API calls not working" / "Reviews won't load"

**Step 1: Check both servers are running**
- Terminal 1 should show: `🚀 Mock API server running on http://localhost:9999`
- Terminal 2 should show: `Serving HTTP on 0.0.0.0 port 8888`

**Step 2: Open Browser Console** (Right-click → Inspect → Console tab)
- Look for any red error messages
- Common error: `CORS` or `Failed to fetch`

**Step 3: Test the API directly**
- Open this URL in your browser: `http://localhost:9999/api/reviews/teacher`
- You should see JSON data (a list of reviews)
- If you get an error, the API server didn't start properly

**Step 4: Check ports are free**
```bash
# See what's using port 8888
lsof -i :8888

# See what's using port 9999
lsof -i :9999
```
If something else is using these ports, kill it first:
```bash
pkill -f "http.server"
pkill -f "test-api.py"
```

### "Port already in use" error

```bash
# Kill any existing processes on these ports
pkill -9 -f "http.server"
pkill -9 -f "test-api.py"
pkill -9 -f "node"
```

Then restart the servers.

---

## �📝 GitHub & Version Control

### Initial Setup (First Time Only)

**1. Configure Git (if not already done):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**2. Navigate to the project:**
```bash
cd /Users/abhi/lm\ copy
```

**3. Initialize Git (if not already a repo):**
```bash
git init
git remote add origin https://github.com/kaizoku4740/tutor-web.git
```

---

### Daily Workflow: Pushing Changes to GitHub

**1. Check what files have changed:**
```bash
git status
```

**2. Stage all changes:**
```bash
git add .
```

**Or stage specific files:**
```bash
git add path/to/file
```

**3. Commit your changes:**
```bash
git commit -m "Your descriptive commit message"
```

**Examples:**
```bash
git commit -m "Add new TA profile and update reviews"
git commit -m "Fix responsive design on mobile devices"
git commit -m "Update admin panel password validation"
```

**4. Push to GitHub:**
```bash
git push origin main
```

**Or if you're on a different branch:**
```bash
git push origin branch-name
```

---

### Useful Git Commands

**View commit history:**
```bash
git log --oneline
```

**Create a new branch for features:**
```bash
git checkout -b feature/new-feature-name
```

**Switch to existing branch:**
```bash
git checkout branch-name
```

**Pull latest changes from GitHub:**
```bash
git pull origin main
```

**Check differences before committing:**
```bash
git diff
```

**Undo last commit (keeps changes):**
```bash
git reset --soft HEAD~1
```

**Undo last commit (discards changes):**
```bash
git reset --hard HEAD~1
```

---

## 🌐 Production Deployment

### Deploy to Cloudflare Pages (React App)

**1. Push your code to GitHub** (see GitHub & Version Control section above)

**2. Connect repository to Cloudflare Pages:**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Select Pages → Create a project → Connect to Git
- Select `kaizoku4740/tutor-web` repository

**3. Use these build settings:**
- Framework preset: `Vite`
- Build command: `cd react-app && npm ci && npm run build`
- Build output directory: `react-app/dist`
- Root directory: `/`
- Functions directory: `functions`

**4. Deploy:**
- Cloudflare will automatically build and deploy on every push to `main`

**5. Post-deploy Verification:**
- Test static routes: `/about`, `/tas`, `/reviews`
- Test dynamic routes: `/reviews/ta1`, `/reviews/teacher`
- Submit contact form test
- Access admin panel (triple-click footer) and test review deletion

---

## ⚙️ Configuration & Setup

### Contact Form (FormSubmit)

The React app includes a contact form that uses FormSubmit service (no backend required).

**Contact endpoint is already configured in `react-app/src/App.jsx`:**
```javascript
const CONTACT_ENDPOINT = 'https://formsubmit.co/kaizoku4740@gmail.com'
```

**To change the email address:**
1. Open `react-app/src/App.jsx`
2. Find `CONTACT_ENDPOINT`
3. Replace `kaizoku4740@gmail.com` with your email
4. Rebuild and deploy

**First-time setup after deployment:**
1. Submit the form once from the live site
2. Check your inbox for FormSubmit confirmation email
3. Click the confirmation link
4. Future submissions will work normally

---

### Admin Access

**To access the admin panel:**
1. Open any page on the website
2. Triple-click on the footer text
3. Enter password: `password`
4. Admin panel opens in the same window

**Admin Features:**
- View all reviews
- Delete reviews
- Manage TA data

** Security Note:** Change the admin password before production deployment!

---

## Development Log

### Time Spent

- **Day 1**: 5 hours - March 8th, 1:30 PM to 6:30 PM
  - Initial setup, homepage, general structure
  
- **Day 2**: 2 hours - March 9th, 5:00 PM to 7:00 PM
  - Admin panel and CSS

- **Day 3**: 2 hours - March 11th, 3:30 PM to 5:30 PM
  - Worked on review pages

- **Day 4**: 4 hours - March 12th, 4:00 PM to 8:00 PM
  - Finished review pages

- **Day 5**: 3.5 hours - March 14th, 5:00 PM to 8:30 PM
  - Made review pages store data non-locally

- **Day 6**: 2.5 hours - March 15th, 11:00 AM to 1:30 PM
  - Debugged visuals on review pages

- **Day 7**: 5.5 hours - March 16th, 10:00 AM to 1:00 PM and 8:30 PM to 11:00 PM
  - Contact form implementation

- **Day 8**: 2 hours - March 18th, 6:00 PM to 8:00 PM
  - Visual improvements and refactoring

- **Day 9**: 1.5 hours - March 24th, 5:00 PM to 6:30 PM
  - Animations and polish

**Total**: 28 hours

---

## 📋 Important Notes

- **Reviews in Local Dev**: Stored in-memory (lost on server restart)
- **Production Storage**: Uses Cloudflare Workers KV for persistence
- **Admin Password**: Change before production deployment
- **Timezone Issue**: Needs fixing for user-facing timestamps
- **TA #2 Profile**: Needs to be added from template

---

## 🗂️ Project File Structure

### React Frontend (`react-app/`)
- **`src/App.jsx`** - Main React component with all pages (Home, About, TAs, Reviews, Contact, Admin)
- **`src/App.css`** - Styling for React app
- **`src/main.jsx`** - React entry point
- **`public/data/tas.json`** - TA profile data
- **`vite.config.js`** - Vite config with API proxy to localhost:9999

### Backend & API
- **`test-api.py`** - Mock API server (port 9999)
  - Simulates Cloudflare Worker endpoints
  - Stores reviews in-memory
  - Supports GET/POST/DELETE with CORS
  - Admin password: `password`

### Configuration & Deployment
- **`wrangler.toml`** - Cloudflare Pages deployment configuration
- **`functions/`** - Cloudflare Functions for backend
- **`tas.json`** - TA data (root level, used by API)

### Assets & Logs
- **`favicon.svg`** - Site favicon
- **`api.log`** - Mock API server logs (auto-generated)

---

##  Technologies Used

### Languages & Frameworks
- **HTML5** - Page structure
- **CSS3** - Styling, layouts, animations, responsive design
- **JavaScript (ES6+)** - Client-side interactivity and API calls
- **Python 3** - Mock API server
- **React + Vite** - Modern frontend framework

### Backend & Hosting
- **Cloudflare Workers** - Serverless backend
- **Cloudflare KV** - Persistent data storage
- **Cloudflare Pages** - Production deployment
- **FormSubmit** - Email form handling

---

## 🔮 Future Enhancements

- Email notifications for new reviews
- Review moderation queue
- TA availability calendar
- Online booking system so no mor sign up genius
- Photo uploads for reviews
- Star rating analytics
- Fix TA 2 need to add from template

---