# Preply Clone - Tutoring Marketplace MVP

A full-stack tutoring marketplace web application built with Next.js 15, inspired by Preply.

## 🚀 Features

- **Landing Page** with hero, categories, featured tutors carousel, and testimonials
- **Tutor Search & Filtering** with advanced filters (subject, language, price, availability)
- **Tutor Profiles** with intro videos, bios, reviews, and availability calendars
- **Authentication** with credentials-based login/registration
- **Student Dashboard** to manage lessons, payments, and favorite tutors
- **Tutor Dashboard** to manage profile, availability, earnings, and bookings
- **Booking System** with time slot selection and mock payment confirmation
- **Real-time Messaging** using Supabase Realtime
- **File Upload** for tutor intro videos using Supabase Storage

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth v5
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Forms**: React Hook Form + Zod
- **Payment**: Mock (Stripe integration ready)

## ⚠️ Important: Node.js Version Requirement

**This project requires Node.js 18.17 or higher.**

Your current version is v16.20.2. Please upgrade Node.js before proceeding:

### Upgrade Options:

1. **Using NVM (Node Version Manager)** - Recommended

   ```bash
   # Install NVM from: https://github.com/coreybutler/nvm-windows
   nvm install 20
   nvm use 20
   ```

2. **Direct Download**
   - Download Node.js 20 LTS from: https://nodejs.org/

## 📦 Installation

Once you have Node.js 18.17+:

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.template .env.local
# Then edit .env.local with your Supabase credentials

# Initialize Prisma
npx prisma generate
npx prisma db push

# Seed the database with demo data
npm run prisma:seed

# Start development server
npm run dev
```

Visit http://localhost:3000

## 🔑 Environment Variables

You need to set up a free Supabase project and add these credentials to `.env.local`:

### Getting Supabase Credentials:

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. From your project dashboard, get:

**Database URL:**

- Settings > Database > Connection string > URI
- Replace `[YOUR-PASSWORD]` with your database password

**Supabase Configuration:**

- Settings > API > Project URL
- Settings > API > Project API keys > `anon` `public`
- Settings > API > Project API keys > `service_role`

**NextAuth Secret:**

```bash
# Generate a random secret
openssl rand -base64 32
```

### Supabase Setup:

1. **Create Storage Bucket**:

   - Go to Storage in Supabase dashboard
   - Create new bucket named: `tutor-videos`
   - Set it to **Public**

2. **Enable Realtime**:
   - Go to Database > Replication
   - Enable realtime for the `messages` table

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages (student & tutor)
│   ├── (marketing)/         # Landing page
│   ├── tutors/              # Tutor search & profiles
│   ├── book/                # Booking flow
│   ├── messages/            # Messaging interface
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── landing/             # Landing page components
│   ├── tutors/              # Tutor-related components
│   ├── booking/             # Booking components
│   ├── messaging/           # Chat components
│   ├── dashboard/           # Dashboard components
│   ├── shared/              # Shared components
│   └── layout/              # Layout components
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   ├── supabase.ts         # Supabase client
│   ├── payment.ts          # Mock payment utilities
│   └── utils.ts            # Helper functions
├── hooks/                   # Custom React hooks
└── types/                   # TypeScript type definitions

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seed script
```

## 🎨 Design System

The app uses a modern design with:

- Gradient backgrounds
- Soft shadows
- Rounded corners
- Smooth animations
- Responsive layouts
- Dark mode support (coming soon)

## 🔐 Authentication

- **Signup**: Choose between Student or Tutor role
- **Login**: Credentials-based authentication
- **Protected Routes**: Role-based access control
- **Session Management**: JWT-based sessions

## 💳 Payments (MVP)

Currently using mock payments - just a confirmation button.

When going live, integrate Stripe:

1. Add Stripe keys to `.env.local`
2. Replace mock payment in `src/lib/payment.ts`
3. Set up Stripe webhook handler

## 📱 Key Pages

### Public:

- `/` - Landing page
- `/tutors` - Search tutors
- `/tutors/[id]` - Tutor profile
- `/login` - Login
- `/register` - Registration

### Student Dashboard:

- `/student` - Dashboard home
- `/student/lessons` - Upcoming & past lessons
- `/student/payments` - Payment history
- `/student/favorites` - Favorite tutors

### Tutor Dashboard:

- `/tutor` - Dashboard home
- `/tutor/profile` - Edit profile
- `/tutor/availability` - Set availability
- `/tutor/bookings` - Manage bookings
- `/tutor/earnings` - View earnings

### Shared:

- `/messages` - Real-time chat
- `/book/[tutorId]` - Book a lesson

## 🗄️ Database Models

- **User** - Students, tutors, and admins
- **TutorProfile** - Extended tutor information
- **Subject** - Course categories
- **Booking** - Lesson bookings
- **Review** - Student reviews
- **Message** & **Conversation** - Chat system
- **Payment** - Payment records
- **Availability** - Tutor schedules
- **Favorite** - Student favorites

## 🚧 Roadmap (Post-MVP)

- [ ] Admin panel for tutor approval
- [ ] Google OAuth login
- [ ] Real Stripe payments
- [ ] Video call integration (Zoom/Agora)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is an MVP project. Feel free to extend and customize!

## 📄 License

MIT License - feel free to use for your own projects

---

**Built with ❤️ using Next.js and Supabase**
