# LocalReads 📚

LocalReads is a community-driven web application that allows people in the same local area to discover, borrow, and share books with each other. It is built with **React, Vite, TailwindCSS, Supabase, and Cloudinary**.

## 🌟 Features
- **User Authentication:** Secure login and registration using Supabase Auth.
- **Book Publishing:** Users can upload their own books to share with the community, including cover images hosted on Cloudinary.
- **Library Dashboard:** Discover books added by other users in your local network.
- **Borrowing System:** Request to borrow books for a specific duration, with status tracking (Pending, Approved, Rejected).
- **Interactive Profiles:** Manage your owned books, active borrows, sent requests, and approve/decline incoming requests from others.
- **Modern UI:** Responsive, glassmorphic design powered by TailwindCSS v4.

---

## 🚀 Local Setup Instructions

Follow these steps to get the application running on your local machine.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- A **[Supabase](https://supabase.com/)** account for database and authentication.
- A **[Cloudinary](https://cloudinary.com/)** account for handling book cover image uploads.

### 2. Install Dependencies
Navigate into the project directory and install the required npm packages:
```bash
cd LocalReads
npm install
```

### 3. Supabase Database Setup
You need to create the database tables, triggers, and security policies before the app can function.

1. Go to your [Supabase Dashboard](https://supabase.com/) and create a new project.
2. Navigate to the **SQL Editor** (the `>_` icon on the left sidebar) and click **+ New Query**.
3. **Run Schema 1:** Copy everything from the `supabase_schema.sql` file in this repository, paste it into the editor, and click **Run**.
4. **Run Schema 2:** Copy everything from `fix_profiles_schema.sql`, paste it into a new query tab, and click **Run**.
5. **Run Schema 3:** Finally, copy everything from `fix_books_foreign_key.sql`, paste it into a new query tab, and click **Run**.

*(This sets up your tables, row-level security, and the triggers that synchronize Auth users to your Public Profiles).*

### 4. Cloudinary Setup
To allow users to upload book images directly from the browser:

1. Log into your [Cloudinary Console](https://console.cloudinary.com/).
2. Note down your **Cloud Name** located on the dashboard.
3. Go to **Settings** (gear icon) -> **Upload**.
4. Scroll down to **Upload Presets** and click **Add upload preset**.
5. Name the preset `ml_default` (or your preferred name).
6. **CRITICAL:** Change the **Signing Mode** from Signed to **Unsigned**.
7. Click **Save**.

### 5. Environment Variables
Create a file named **`.env.local`** in the root folder of the project. Do not commit this file to version control.

Add the following keys and replace the placeholder values with your actual credentials:

```ini
# Found in Supabase Project Settings -> API
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"

# Found in Cloudinary Dashboard and Settings
VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name"
VITE_CLOUDINARY_UPLOAD_PRESET="ml_default"
```

### 6. Run the Development Server
Once your environment variables are saved, start the Vite development server:

```bash
npm run dev
```

The application will typically be securely hosted at **[http://localhost:5173/](http://localhost:5173/)** (check your terminal output for the exact port). Open that link in your browser to start using LocalReads!

---

## 🛠️ Tech Stack
- **Frontend:** React 18, React Router DOM, TypeScript, Vite
- **Styling:** TailwindCSS v4, Lucide Icons
- **Backend as a Service:** Supabase (PostgreSQL, GoTrue Auth)
- **Media Hosting:** Cloudinary
