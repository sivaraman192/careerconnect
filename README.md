# CareerConnect – Job Portal System

CareerConnect is a production-ready, full-stack job portal system built using the MERN stack with a beautiful dark glassmorphic design system. 

It enables **Job Seekers** to browse/filter listings, bookmark jobs, apply using their profile or uploaded resume, and track application progress. It empowers **Recruiters & Admins** to post new positions, update job details, list applications, download resumes, track pipeline progress, and monitor system analytics.

---

## 🌟 Key Features

1. **Dual-Mode Database Fallback**: 
   - *MongoDB Mode*: Standard Mongoose database connection to `MONGO_URI`.
   - *JSON Local Mode*: Automatically triggers if MongoDB is not running locally. It simulates standard CRUD and population queries over a local `server/data/db.json` file. This lets you test the full-stack system out-of-the-box without needing a live MongoDB server!
2. **JWT Authentication & Role Security**: Secure token-based validation with custom router guards for Seekers, Recruiters, and Admins.
3. **Resume File Upload**: Express + Multer middleware uploads PDFs/Word files directly to the server, serving them statically for recruiter downloads.
4. **Hiring Status Pipeline**: Full applicant workflow (Applied ➔ Reviewed ➔ Shortlisted ➔ Rejected ➔ Hired).
5. **Analytical Charting**: Recharts-powered pipeline dashboards for both seekers and recruiter consoles.
6. **Premium Dark Theme UI**: Styled with Tailwind CSS, custom glassmorphism overlays, and smooth Framer Motion animations.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + React Router + Axios + Recharts + Framer Motion + Lucide Icons
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose (with dynamic local JSON fallback)
- **Auth**: JWT Authentication (attached via Axios request interceptor)
- **File Upload**: Multer

---

## 📂 Project Structure

```
d:/project/job/
├── client/                     # Frontend React + Vite
│   ├── dist/                   # Production build outputs
│   ├── src/
│   │   ├── api/                # Axios configuration
│   │   ├── components/         # Reusable UI (Navbar, StatusBadge, SocialIcons, etc.)
│   │   ├── context/            # AuthContext (JWT & login state)
│   │   ├── pages/              # Landing, Login, Dashboards, Profiles, Jobs, Details
│   │   ├── App.jsx             # Main Router configuration
│   │   ├── index.css           # Tailwind overrides & custom scrollbars
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── server/                     # Backend Node.js + Express
    ├── config/                 # Database initialization helper
    ├── controllers/            # API controller methods (Auth, Jobs, Applications, Saved)
    ├── data/                   # Fallback local JSON database storage
    ├── middleware/             # Role guards and Multer config
    ├── models/                 # Mongoose models with MockModel wrappers
    ├── routes/                 # Express API routing links
    ├── uploads/                # Directory for uploaded resumes
    ├── server.js               # Main entry point
    └── package.json
```

---

## 🚀 Step-by-Step Run Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed on your system.

---

### 2. Run the Backend Server
1. Navigate into the `server/` directory:
   ```bash
   cd server
   ```
2. Configure `.env` variables (a default `.env` has already been pre-created):
   - Set `MONGO_URI` to your MongoDB connection string (e.g. `mongodb://localhost:27017/careerconnect`).
   - If you leave this string as-is or do not have MongoDB running, the server will **automatically log a warning and fallback to local JSON database mode**.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server (runs on port `5000`):
   ```bash
   npm run dev
   ```
   *(Alternatively, run `npm start` to run directly using node).*

---

### 3. Run the Frontend Client
1. Open a new terminal tab and navigate into the `client/` directory:
   ```bash
   cd client
   ```
2. Configure `.env` variables (a default `.env` has already been pre-created pointing to `http://localhost:5000/api`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server (runs on port `5173`):
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing Scenarios to Try

1. **Seeker Flow**:
   - Register a new user as a **Job Seeker**.
   - Go to **Profile** and upload a dummy PDF resume, fill in skills (e.g. "React, Node, Express"), experience, and social links.
   - Go to **Find Jobs** to inspect listings. Bookmark a job card, then click **View Details** to read responsibilities.
   - Click **Apply Now**, fill out the application details (it will show your active profile resume loaded), and click **Submit**.
   - Review your application stage in **My Applications** or **Dashboard** stats.

2. **Recruiter Flow**:
   - Register another user as a **Recruiter**.
   - Go to the **Recruiter Console** dashboard tab.
   - Select **Post a Job** and enter listing fields. Click **Post Job**.
   - Go to **Manage Jobs** to view your listings. Click **Applications** on your listing to view candidates.
   - In the candidate list, read their cover letters, click **Download** to review their PDF resume, and use the status dropdown to change their status to **Shortlisted** or **Hired**.
   - Check the **Overview** dashboard tab to see analytical widgets and pipeline charts update in real-time!
