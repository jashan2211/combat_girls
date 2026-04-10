# COMBAT GIRLS - Women's Combat Sports TV

The premier streaming platform for women's combat sports. Watch MMA fights, boxing, BJJ, Muay Thai and more. Athletes create portfolio profiles, fans discover content through feeds and shorts.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** NextAuth.js (Google OAuth + Email/Password)
- **Video:** YouTube embeds (Cloudflare R2/Stream ready)
- **Payments:** Stripe (subscriptions + PPV)
- **Real-time:** Socket.io

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### Setup

```bash
# Clone
git clone <repo-url>
cd COMBAT_GIRLS

# Backend
cd backend
cp .env.example .env    # Edit with your values
npm install
npm run dev             # Runs on port 5000

# Frontend (new terminal)
cd frontend
cp .env.example .env.local   # Edit with your values
npm install
npm run dev             # Runs on port 3000
```

### Seed Database
```bash
cd backend
node utils/seed.js              # Sample data (athletes, videos, events)
node utils/import-fighters.js   # Import UFC female fighters from CSV
```

### Login Credentials (after seeding)
- **Admin:** admin@combatgirls.tv / password123
- **Athlete:** sarah@combatgirls.tv / password123
- **Fan:** alex@example.com / password123

## Features

- Home feed with video grid + stories
- TikTok-style vertical shorts with swipe
- Athlete portfolio profiles (fight record, stats, socials)
- Pre-created profiles (claim system for athletes)
- Easy video posting (paste YouTube URL)
- Fighter tagging on videos (Fighter 1 vs Fighter 2)
- Events with fight cards and countdowns
- Admin dashboard (moderation, claims, analytics)
- Google Sign-in + email auth
- Stripe subscriptions (Free/Bronze/Silver/Gold)
- Dark theme with combat sports aesthetic

## Deployment (Hostinger VPS)

```bash
# On VPS
npm install -g pm2
cd backend && npm install && pm2 start server.js --name api
cd ../frontend && npm install && npm run build && pm2 start npm --name web -- start

# Nginx reverse proxy
# Port 3000 -> yourdomain.com
# Port 5000 -> api.yourdomain.com
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

Key services to configure:
- **MongoDB** - Database connection
- **Google OAuth** - Sign-in with Google
- **Stripe** - Payments (optional for development)
- **Cloudflare R2** - File storage (optional, uses YouTube embeds for now)
