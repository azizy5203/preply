# Preply Clone MVP - Setup Guide

## 🎉 What's Been Built

### ✅ Core Infrastructure (100% Complete)

- Next.js 15 project with App Router
- TypeScript configuration
- Tailwind CSS + shadcn/ui setup
- Prisma ORM with PostgreSQL
- NextAuth v5 for authentication
- Supabase client (realtime + storage)
- Middleware for role-based access
- Complete database schema (12 models)
- Comprehensive seed data

### ✅ API Routes (100% Complete)

- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers
- `GET /api/tutors/search` - Tutor search with filters
- `PUT /api/tutors/profile` - Update tutor profile
- `POST /api/bookings/create` - Create booking
- `POST /api/payments/confirm` - Mock payment confirmation
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversations` - Get conversations

### ✅ Pages (Core Pages Complete)

- `/` - Landing page with hero, categories, features, testimonials
- `/login` - Login page
- `/register` - Registration with role selection
- `/tutors` - Tutor search page with grid
- `/tutors/[id]` - Tutor profile with reviews
- `/student` - Student dashboard
- `/tutor` - Tutor dashboard

### ✅ Utilities & Libraries

- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/supabase.ts` - Supabase client + helpers
- `src/lib/payment.ts` - Mock payment utilities
- `src/lib/utils.ts` - Utility functions
- `src/types/index.ts` - TypeScript types
- `src/middleware.ts` - Auth & role-based protection

---

## 🚀 Quick Start

### 1. Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (takes ~2 minutes)
3. Get your credentials from **Settings > API**:
   - Project URL
   - Anon public key
   - Service role key
4. Get database URL from **Settings > Database > Connection string > URI**

5. **Create Storage Bucket**:

   - Go to **Storage** in Supabase dashboard
   - Click "New bucket"
   - Name: `tutor-videos`
   - Make it **Public**

6. **Enable Realtime** (for messaging):
   - Go to **Database > Replication**
   - Find `Message` table
   - Toggle **Realtime** ON

### 2. Configure Environment Variables

Copy `env.template` to `.env.local`:

```bash
cp env.template .env.local
```

Fill in your Supabase credentials in `.env.local`:

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Payment Mode
PAYMENT_MODE="mock"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed demo data (10 tutors, 4 students, reviews, etc.)
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## 📝 Demo Accounts

After seeding, you can login with:

**Student Account:**

- Email: `john@example.com`
- Password: `password123`

**Tutor Account:**

- Email: `maria@tutor.com`
- Password: `password123`

---

## 🔧 What Still Needs to Be Added

### Missing Pages (Can Add Later)

- `/student/lessons` - View all lessons (upcoming/past)
- `/student/payments` - Payment history page
- `/student/favorites` - Favorite tutors list
- `/tutor/bookings` - Manage all bookings
- `/tutor/availability` - Set weekly availability
- `/tutor/profile` - Edit tutor profile
- `/book/[tutorId]` - Booking flow with payment
- `/messages` - Real-time chat interface

### Missing Features

- Real-time messaging UI (Supabase Realtime ready)
- Video upload component
- Booking calendar/time picker
- Favorites toggle functionality
- Review submission form
- Profile edit forms

---

## 🎯 Current Functionality

### What Works Now:

✅ User registration (Student/Tutor)
✅ Login/Logout
✅ Landing page navigation
✅ Browse tutors
✅ View tutor profiles
✅ Protected dashboards (role-based)
✅ Database with demo data

### What's Mocked/Not Yet Functional:

⚠️ Booking flow (page needs to be created)
⚠️ Messaging (UI needs to be created, backend ready)
⚠️ Profile editing (form needs to be created)
⚠️ Video uploads (Supabase Storage ready)
⚠️ Favorite actions (API ready, UI needed)

---

## 📦 File Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── student/page.tsx      ✅ Created
│   │   ├── tutor/page.tsx        ✅ Created
│   │   └── layout.tsx            ✅ Created
│   ├── api/
│   │   ├── auth/                 ✅ All routes created
│   │   ├── tutors/               ✅ Search & profile routes
│   │   ├── bookings/             ✅ Create route
│   │   ├── payments/             ✅ Confirm route
│   │   └── messages/             ✅ Send & conversations routes
│   ├── tutors/
│   │   ├── page.tsx              ✅ Created
│   │   └── [id]/page.tsx         ✅ Created
│   ├── login/page.tsx            ✅ Created
│   ├── register/page.tsx         ✅ Created
│   ├── page.tsx                  ✅ Created (landing)
│   ├── layout.tsx                ✅ Created
│   └── globals.css               ✅ Created
├── lib/
│   ├── prisma.ts                 ✅ Created
│   ├── auth.ts                   ✅ Created
│   ├── supabase.ts               ✅ Created
│   ├── payment.ts                ✅ Created
│   └── utils.ts                  ✅ Created
├── types/index.ts                ✅ Created
└── middleware.ts                 ✅ Created

prisma/
├── schema.prisma                 ✅ Created
└── seed.ts                       ✅ Created
```

---

## 🐛 Troubleshooting

### Prisma Errors

```bash
# If you get Prisma client errors
npm run prisma:generate

# If database schema is outdated
npm run prisma:push
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

- Check `.env.local` has correct DATABASE_URL
- Verify Supabase project is running
- Ensure password in connection string is URL-encoded

---

## 🔜 Next Steps to Complete MVP

1. **Add Booking Flow** (~3-4 files)

   - Time slot picker component
   - Booking confirmation page
   - Payment confirmation UI

2. **Add Messaging Interface** (~3-4 files)

   - Conversation list component
   - Chat window with real-time updates
   - Message input

3. **Add Profile Editor** (~2-3 files)

   - Tutor profile edit form
   - Video upload component
   - Availability editor

4. **Add Student Pages** (~3 files)
   - Lessons page
   - Payments history
   - Favorites list

---

## 🎨 Design System

The app uses:

- **Primary Color**: Purple (#9333EA)
- **Secondary Color**: Pink
- **Gradients**: Purple-to-pink, Blue-to-cyan
- **Font**: Inter (Google Fonts)
- **UI Library**: shadcn/ui components
- **Icons**: Lucide React

---

## 📚 Tech Stack Summary

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth v5
- **Realtime**: Supabase Realtime
- **Storage**: Supabase Storage
- **Forms**: React Hook Form + Zod
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React

---

## ✅ Production Checklist (When Going Live)

- [ ] Add real Stripe payment integration
- [ ] Set up Google OAuth
- [ ] Add email notifications
- [ ] Set up Supabase production database
- [ ] Configure proper RLS policies in Supabase
- [ ] Add video transcoding/streaming
- [ ] Build admin panel
- [ ] Add comprehensive error boundaries
- [ ] Set up monitoring & analytics
- [ ] Add rate limiting
- [ ] Implement proper SEO
- [ ] Add sitemap & robots.txt
- [ ] Set up CI/CD pipeline

---

**MVP Status**: ~70% Complete - Core infrastructure and main pages done, additional pages and features needed for full functionality.
