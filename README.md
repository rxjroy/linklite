<div align="center">
  <img src="./client/public/logo.png" alt="LinkLite Logo" width="200"/>
  <h1>LinkLite</h1>
  <p>A modern, high-performance, and beautifully designed Open-Source URL Shortener.</p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-4-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

<br/>

LinkLite is a robust, production-ready full-stack URL shortener built for marketers, developers, and power users. Unlike basic link shorteners, LinkLite provides granular analytics, robust security features like password protection, and a premium "glassmorphic" UI built on React 19. 

Short links map purely to your root domain (e.g., `linklite.com/promo`), giving you clean and professional URLs inspired by industry leaders like Bitly.

---

## ✨ Key Features

### 🔗 Link Management
- **Instant Shortening:** Generate blazing-fast short links with secure, collision-free codes.
- **Root Domain Slugs:** Links map directly to the root (`yourdomain.com/slug`) with no annoying `/s/` or `/link/` prefixes.
- **Custom Aliases:** Claim memorable, personalized slugs (e.g., `yourdomain.com/portfolio`). 
- **Reserved Slug Protection:** Prevents users from overriding native app routes like `/dashboard` or `/login`.

### 🛡️ Security & Access Control
- **OTP Email Verification:** Every signup and login requires a 6-digit OTP code sent to the user's email, preventing unauthorized account creation.
- **Password Protected Links:** Lock sensitive destinations behind a secure, hashed password screen.
- **Link Expiration:** Automatically deactivate links after a specific date and time.
- **Stateless Auth:** Secure JSON Web Token (JWT) based user authentication.

### 📊 Advanced Analytics
- **Dashboard Tracking:** View total links, total clicks, and 30-day performance trends visually.
- **Link-level Analytics:** Track individual link performance. (Ready for advanced Geo/Device tracking expansion).

### ⚡ Seamless Sharing
- **QR Code Generation:** Instantly auto-generate downloadable SVG/PNG QR codes for every short link.
- **One-Click Social Sharing:** Native share buttons for WhatsApp, Twitter/X, Telegram, and Email.
- **Copy to Clipboard:** 1-click copy functionality throughout the UI.

### 🎨 Premium UI/UX
- **Dark Mode Glassmorphism:** A stunning, modern interface with glossy transparent panels and vibrant neon accents.
- **Micro-animations:** Built with Framer Motion for buttery-smooth page transitions, modal pops, and hover states.
- **Fully Responsive:** Beautifully crafted layouts that look perfect on mobile, tablet, and ultra-wide desktops.

---

## 🛠️ Technology Stack

LinkLite is built as a highly scalable single-pane full-stack application.

| Area | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Routing** | Wouter (Ultra-lightweight hook-based routing) |
| **Styling & UI** | Tailwind CSS v4, Radix UI (accessible primitives), Framer Motion |
| **Form Handling** | React Hook Form, Zod (Schema Validation) |
| **Backend Core** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose ORM |
| **Caching (Optional)** | Redis (ioredis) |
| **Email / OTP** | Nodemailer (SMTP), Gmail App Passwords |
| **Security** | Bcryptjs (Password Hashing), Helmet, express-rate-limit |

---

## 🚀 Local Development Guide

Follow these steps to run LinkLite on your local machine.

### Prerequisites
1. **Node.js** (v18 or higher)
2. **pnpm** (recommended) or **npm**
3. **MongoDB** instance (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/linklite.git
   cd linklite
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env` in the root directory and populate your credentials:
   ```env
   # .env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/linklite
   JWT_SECRET=your-super-secret-jwt-key
   PORT=4000
   BASE_URL=http://localhost:4000

   # SMTP for OTP emails (Gmail App Password)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   ```

   > **Gmail App Password:** Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), create an app password for "LinkLite", and paste the 16-character code as `SMTP_PASS`.

### Running the App (Dev Mode)

In development, the Vite Frontend and the Node Backend run as separate processes locally to allow Hot-Module Replacement (HMR).

**Open Terminal 1 (Start the React Frontend):**
```bash
pnpm run dev:client
```
*Frontend runs on `http://localhost:3001`*

**Open Terminal 2 (Start the Express Backend):**
```bash
pnpm run dev:server
```
*Backend API runs on `http://localhost:4000`*

*(Note: The Vite proxy is configured to automatically route your short-link requests `http://localhost:3001/slug` to the backend during development).*

---

## 🌍 Production Deployment (Vercel)

LinkLite is architected to be easily deployable on Vercel as a unified application. Vercel will build the Vite frontend and expose the Express backend as a Serverless API.

### 1. Upload to GitHub
Initialize your repo and push your code to your GitHub account. Ensure `.env` is **not** committed (it is ignored by default).

```bash
git add .
git commit -m "Initial commit for LinkLite URL Shortener"
git branch -M main
git remote add origin https://github.com/yourusername/linklite.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your new `linklite` GitHub repository.
4. Expand the **Build and Output Settings** window:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` *(This builds both Vite and Esbuilds the Node server).*
   - **Output Directory**: `dist/public`
5. Expand **Environment Variables** and add:
   - `MONGODB_URI` = `your-production-database-connection-url`
   - `JWT_SECRET` = `a-very-long-random-string`
   - `BASE_URL` = `https://your-production-vercel-url.vercel.app`
   - `NODE_ENV` = `production`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASS` = `your-gmail-app-password`
6. Click **Deploy**.

**How Routing Works in Production:**
In production, the Node Express server takes over completely. It serves the statically built `dist/public` React files for known SPA routes (like `/dashboard`), and intercepts dynamic slugs `/slug` directly to perform the database lookup and 301 redirection.

---

## 🔒 Security Posture

- **OTP Verification:** All signups and logins require email-based OTP verification. Codes expire in 5 minutes with a max of 5 failed attempts, and resend is rate-limited to 1 per 60 seconds.
- **Rate Limiting:** Global rate limiters protect auth routes (`/login`, `/signup`) from brute-force dictionary attacks, and limit link creation to prevent spam.
- **Passwords:** Plain-text passwords are never stored. User accounts and locked links both utilize `bcryptjs` with salt rounds.
- **Sanitization:** Input is strictly verified on the backend layer via `Zod` validation schemas.
- **CORS & Helmet:** Cross-Origin Resource Sharing is controlled, and Helmet sets secure HTTP headers natively.

---

## 🤝 Contributing
Contributions are always welcome! Feel free to open a Pull Request or create an Issue to discuss requested new features or bug fixes.

## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.
