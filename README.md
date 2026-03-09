# Huntlog

Huntlog is a minimal, elegant bug report tracker built with Next.js 14, Supabase, and Tailwind CSS. It features a dark-themed UI heavily inspired by Linear.app.

![Dashboard Preview](/screenshots/dashboard.png)

## Tech Stack
* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (using Radix UI Primitives)
* **Database & Auth:** [Supabase](https://supabase.com/)
* **Icons:** [Lucide React](https://lucide.dev/)

## Features
* **Authentication:** Seamless user signup, login, and session persistence powered by Supabase Auth (SSR).
* **Dashboard:** High-level statistics on bug statuses (Open, In Progress, Resolved).
* **Bug Tracking:** Create, Read, Update, and Delete bugs with detailed forms including Steps to Reproduce.
* **Filtering:** Filter bugs easily by Severity (Low, Medium, High, Critical) and Status.
* **Security:** Row Level Security (RLS) ensures users can only access their own reports.

## Demo
*[Coming Soon]*

## Local Setup & Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/huntlog.git
cd huntlog
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Supabase
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor and run the queries found in \`supabase/schema.sql\`.
3. Go to Project Settings -> API and copy your \`URL\` and \`anon key\`.

### 4. Configure Environment Variables
Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`
Fill in the placeholders with your actual Supabase URL and Anon Key.

### 5. Start Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.
