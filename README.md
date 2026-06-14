# CareerOS

A personal job search command center — a drag-and-drop application tracker, an experience bank for all your career history, resume prep tools, networking reminders, and search analytics. Built with React, Firebase Auth, and Firestore.

---

## Features

### 📋 Application Tracker 
- Drag and drop job cards between **Applied → Interviewing → Offered → Declined**
- Quick-add modal or a full guided onboarding wizard for new applications
- Delete button on every card (with confirmation) for accidental entries

### 🚀 New Application Wizard
A 9-step guided flow when adding a job, designed to maximize your odds:
1. **Job Info** — title, company, salary, type, URL, and job description
2. **Recruiter** — did you contact a recruiter? Logs them as a contact automatically
3. **Read JD** — confirms you actually read the full description
4. **Simplify JD** — generates a ready-to-paste AI prompt to break down the JD
5. **Skill Match** — compares JD keywords against your Experience Bank and gives a match score
6. **Resume** — generates a tailored resume-rewrite AI prompt using your bullets
7. **Cover Letter** — generates a targeted cover letter AI prompt
8. **Final Checklist** — 7-point quality check (metrics, keywords, LinkedIn, portfolio, proofreading, etc.)
9. **Summary** — review everything, then submit straight into your Applied column

All onboarding data is saved per-job and viewable later in the **Onboarding Log** tab.

### ⚡ Experience Bank
A master list of everything you've done — work experience, internships, projects, volunteering, research, achievements, and leadership roles. Each entry supports:
- Title, organization, date range, description
- Tags (skills, technologies, keywords)
- Bullet points with one-click copy buttons

This bank powers the skill-matching and resume prep tools across the app.

### 📂 Job Detail Panel
Click any job to open a side panel with five tabs:
- **Overview** — status, date added, full job description
- **Networking** — contacts, follow-up reminders, interaction history/timeline
- **Milestones** — track applied → phone screen → OA → interview rounds → offer, each with dates
- **Resume Prep** — JD keyword picker, your experience bullets, and a ready-to-paste AI prompt
- **Onboarding Log** — full record of how you prepared this application

### 🔔 Networking Reminders
Each contact has a configurable "remind me after X days" setting. Contacts that are overdue for follow-up show a red badge on their job card and a notification count on the Dashboard nav item.

### 📊 Analytics
- Ghosted %, decline rate, offer rate, average response time
- Conversion funnel (Applied → Interviewing → Offered → Declined)
- Applications-per-week chart

### 👤 Master Profile
Stores your personal info, education, and a professional summary — a single source of truth to reference when generating resumes and cover letters with AI.

### 🗂 Archive
Declined or closed applications move here, with options to restore or permanently delete.

### 🔐 Authentication
- Email/password sign up and sign in
- Google sign-in
- Password reset via email
- All data is scoped per-user in Firestore

---

## Tech Stack

- **React** (hooks-based, no external state libraries)
- **Firebase Authentication** (email/password + Google OAuth)
- **Cloud Firestore** (per-user collections: `jobs`, `experiences`, `profile`)
- Plain CSS-in-JS (no Tailwind, no UI framework)

---

## Setup

### 1. Firebase Project
1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password and Google sign-in methods
3. Enable **Cloud Firestore** (start in test mode, then lock down rules — see below)
4. Register a Web App and copy the config values

### 2. Environment Variables
Create a `.env` file (see `.env.example`) with your Firebase config:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Install & Run

```bash
npm install
npm install firebase
npm run dev
```


## Data Structure

All data lives under `users/{uid}/...`:

- **`jobs`** — application records (title, company, status, JD, milestones, contacts, interactions, onboarding data)
- **`experiences`** — Experience Bank entries (title, org, type, date, description, bullets, tags)
- **`profile`** — master profile (personal info, education, summary)

---

## Notes

- No AI is built into the app — instead, it generates copy-paste-ready prompts for you to use in ChatGPT, Claude, Gemini, or any AI tool of your choice.
- Mobile responsiveness is in progress; the layout currently targets desktop/tablet widths best.
