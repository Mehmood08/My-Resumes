# AI CV Builder

AI CV Builder is a professional, feature-rich web application built on the MERN stack (MongoDB, Express.js, React, Node.js). It allows users to create, customize, score with AI, and download professional resumes using modern, responsive templates.

---

## 🚀 Key Features

* **Interactive CV Builder:** Step-by-step form editor covering Personal Info, Work Experience, Education, Skills, Projects, Languages, Certifications, and Custom Sections.
* **Premium Templates:** 10 pre-designed templates tailored for different industries:
  * Academic, American, Creative, European, Executive, Gulf, Minimalist, Professional, Service, and Tech layouts.
* **AI-Powered CV Scoring:** Integrates Google Gemini AI to analyze CV content, score ATS compatibility, and provide detailed improvement tips.
* **Real-time Live Preview:** Instantly see updates in the selected template format as you edit.
* **Google OAuth & JWT Authentication:** Secure login using Google Sign-in or email/password with full reset password flow.
* **Instant PDF Export:** High-quality PDF generation directly from the browser using `html2pdf.js`.

---

## 📁 Project Structure

```bash
lollylaw/
├── backend/                  # Express.js Server API
│   ├── api/                  # API routes (Auth, Resumes)
│   ├── models/               # MongoDB Mongoose Schemas (User, Resume)
│   ├── utils/                # Utility helpers (AI integration, Emails)
│   ├── server.js             # Main backend server file
│   └── vercel.json           # Vercel deployment configuration
│
└── frontend/                 # React.js + Vite Application
    ├── src/
    │   ├── Components/       # UI Components & Forms
    │   │   ├── Templates/    # Individual CSS & JSX files for all 10 CV templates
    │   │   ├── GuidedEditor  # Complex multipage form for CV inputs
    │   │   ├── CVPreview     # CV preview wrapper
    │   │   └── CVScoringModal# Gemini AI CV analysis popup
    │   ├── context/          # State Management context
    │   ├── App.jsx           # Routing and core logic
    │   └── main.jsx          # Entry point
    └── vercel.json           # Vercel frontend config
```

---

## 🛠️ Setup & Running Instructions

### Prerequisites
Make sure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas Cloud instance)

---

### 1. Backend Setup & Run

1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` folder (or copy from `.env.example`):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   
   # Email Configurations (for Password Reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_specific_password
   EMAIL_FROM=your_email@gmail.com
   ```

4. **Start the Backend Server:**
   * **Development Mode (Auto Reload):**
     ```bash
     npm run dev
     ```
   * **Production Mode:**
     ```bash
     npm start
     ```
   The backend will start running on [http://localhost:5000](http://localhost:5000).

---

### 2. Frontend Setup & Run

1. **Navigate to the Frontend Directory:**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `frontend/` folder:
   ```env
   VITE_API_URL=http://localhost:5000
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

4. **Start the Frontend Application:**
   ```bash
   npm run dev
   ```
   The application will start on [http://localhost:5173](http://localhost:5173). Open this URL in your web browser.

---

## 💻 Tech Stack Details

* **Frontend:** React (v19), Vite, CSS3, `html2pdf.js`, React Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (via Mongoose ODM)
* **AI Processing:** Google Gemini API (`@google/genai`)
* **Mailing:** Nodemailer (SMTP)
* **Authentication:** Google OAuth2 Client & JWT (JSON Web Tokens)
