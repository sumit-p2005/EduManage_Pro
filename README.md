# EduManage Pro 🎓

> **"Smart Coaching. Simplified Management."**

EduManage Pro is a premium, full-stack Coaching Management System designed for coaching centers and private tutors. It features a modern, responsive, role-based analytics dashboard (Light/Dark mode) with comprehensive administrative control for Teachers (Admins) and a customized workspace for Students.

The application contains **dual-mode backend execution**:
1. **Mock DB Mode (Default out-of-the-box)**: Operates entirely offline with a local JSON file-based database store seeding rich evaluation datasets. Perfect for immediate testing and evaluation without setting up Firebase.
2. **Firebase Mode**: Fully functional production deployment connecting to Firebase Authentication, Firestore, and Storage.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite bundler)
- **Tailwind CSS** (Custom education themes & dark mode)
- **Framer Motion** (Smooth micro-animations)
- **Recharts** (Visual analytics)
- **Axios** (REST API requests)
- **React Hook Form** (Form validation)
- **Lucide Icons** (Premium interface UI)

### Backend & Database
- **Node.js & Express.js**
- **Firebase Admin SDK** (Authentication, Firestore, Storage)
- **Multer** (File stream buffers)
- **Native Crypto** (Session token signatures for local mock mode)

---

## 📁 Repository Structure

```
EduManage_Pro/
├── backend/
│   ├── src/
│   │   ├── config/          # Firebase Admin SDK & local mock seeding
│   │   ├── controllers/     # Core REST API controller handlers
│   │   ├── middleware/      # Bearer authenticators & upload configurations
│   │   ├── routes/          # Express routing directories
│   │   └── index.js         # Entry point
│   ├── data/                # Local database folder (mock mode)
│   ├── uploads/             # Locally stored files (mock mode)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Responsive sidebars, search bars, and navs
│   │   ├── contexts/        # Auth & Theme mode context providers
│   │   ├── pages/           # Landing homepage, login, dashboards, grids
│   │   ├── services/        # Axios API clients
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start (Mock Mode)

You can run the entire application locally with no Firebase credentials configured. It will seed a mock JSON database automatically on the first start.

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server starts at `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The Vite hot server starts at `http://localhost:3000`. Open this address in your browser.

### 🔑 Demo Login Accounts
You can log in directly using the following credentials:
- **Teacher (Admin)**:
  - **Email**: `admin@edumanage.com`
  - **Password**: `admin123`
- **Student**:
  - **Email**: `student@edumanage.com`
  - **Password**: `student123`

---

## 🧱 Firebase Configuration

To connect the application to your real Firebase project:

### 1. Backend Service Credentials
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select **Project Settings > Service Accounts**.
3. Generate a new private key and download the service key JSON.
4. Open the `backend/.env` file and insert the fields:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```
   *Make sure to keep the private key inside quotes and format line breaks as `\n`.*

### 2. Frontend client Credentials
1. Under **Project Settings > General**, register a web application to retrieve client configurations.
2. In the `frontend` root, draft a `.env` file containing:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```


---

## ⚡ Supabase Storage Configuration (Alternative/Free Storage)

To avoid Firebase paid upgrade (Blaze Plan) limits on storage bandwidth or simply to use a generous 1 GB free cloud storage alternative, you can enable Supabase Storage:

### 1. Create a Supabase Storage Bucket
1. Visit the [Supabase Console](https://supabase.com/).
2. Create a project. Once ready, click on **Storage** in the left menu.
3. Click **Create Bucket**, name it `edumanage-pro` (or any custom name), set the bucket visibility to **Public**, and save.

### 2. Configure Backend Credentials
Add your Supabase API credentials to the `backend/.env` file:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_STORAGE_BUCKET=edumanage-pro
```
*Note: Use the `service_role` key (not the `anon` key) to ensure the backend can upload assets directly bypassing storage RLS rules.*

### 3. Verify Connection
Run the verification script from the `backend/` directory:
```bash
cd backend
node test-supabase.js
```
If configured correctly, the script will connect, upload a test file, retrieve its public URL, delete it, and display a success status!

---

## 🔒 Security Rules & Features

- **Role-based Authentication**: Route guards strictly block student access from administrative views (`/students`, `/batches`).
- **REST Validation**: Controller handlers strictly evaluate inputs before registering transactions.
- **WhatsApp Integration**: Allows teacher admins to tap WhatsApp cards to auto-draft payment reminders to parents directly using phone numbers.
