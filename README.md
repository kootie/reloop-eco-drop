# 🔄 Reloop Live - E-Waste Recycling Platform

A simple e-waste recycling platform that rewards users with ADA tokens for proper electronic waste disposal. Built with Next.js and Supabase for easy deployment.

## 🚀 Features

- **User Authentication**: Email/password login with Cardano wallet connection
- **E-waste Submission**: Photo-based submissions with device categorization
- **Admin Verification**: Batch approval system with checkbox selection
- **ADA Rewards**: Automatic token distribution (1-7 ADA per item)
- **Real-time Tracking**: GPS verification and location-based bin finding
- **Multi-language Support**: Georgian and English translations

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: JWT + BCrypt password hashing
- **Blockchain**: Cardano, Lucid-Cardano, Eternl wallet
- **UI**: Radix UI components, Lucide icons
- **Deployment**: Vercel-ready

## ⚡ Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd reloop-live
npm install
```

### 2. Set Up Supabase Database

Follow the **5-minute setup** guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 4. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 How It Works

### For Users:

1. **Register** with email/password at homepage
2. **Connect Cardano wallet** (Eternl recommended)
3. **Find collection bins** using the interactive map
4. **Submit e-waste** by taking photos and selecting device type
5. **Earn ADA rewards** when admin approves submission

### For Admins:

1. **Login** at `/admin` with admin credentials
2. **View pending submissions** with user details and photos
3. **Select multiple submissions** using checkboxes
4. **Batch approve** and automatically distribute ADA payments
5. **Track all activity** through comprehensive dashboard

## 💰 Reward Structure

| Device Type | Category           | ADA Reward |
| ----------- | ------------------ | ---------- |
| USB Cable   | Cables & Chargers  | 1 ADA      |
| Headphones  | Small Electronics  | 1.5 ADA    |
| Smartphone  | Medium Electronics | 3 ADA      |
| Laptop      | Large Electronics  | 5 ADA      |
| Tablet      | Large Electronics  | 5 ADA      |
| Battery     | Hazardous Items    | 7 ADA      |

## 🗄️ Database Schema

Simple Supabase tables:

- **users**: Authentication & wallet info
- **drops**: E-waste submissions
- **device_types**: Reward categories
- **bins**: Collection locations
- **payment_batches**: Batch processing

## 🔒 Security Features

- ✅ BCrypt password hashing (12 salt rounds)
- ✅ JWT session management
- ✅ Input validation & sanitization
- ✅ Cardano address verification
- ✅ Admin role protection
- ✅ Audit trails for all actions

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically!

Your Supabase database will work perfectly with Vercel's serverless functions.

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
JWT_SECRET=your_secure_production_secret
NODE_ENV=production
```

## 📊 Admin Dashboard Features

- **User Verification**: Filter by verified/unverified users
- **Batch Processing**: Select multiple submissions with checkboxes
- **Photo Review**: Click to view detailed submission photos
- **Payment Automation**: Automatic ADA distribution to user wallets
- **Statistics**: Track total users, drops, and rewards distributed

## 🔧 Development

### Project Structure

```
reloop-live/
├── app/                 # Next.js 15 app directory
│   ├── api/            # API routes
│   ├── admin/          # Admin dashboard
│   └── page.tsx        # Homepage
├── components/         # React components
├── lib/               # Utilities & Supabase client
└── SUPABASE_SETUP.md  # Database setup guide
```

### Key Components

- `components/auth-screen.tsx` - Login/registration
- `components/admin-verification.tsx` - Batch approval system
- `components/eternl-wallet-connector.tsx` - Cardano wallet integration
- `lib/supabase.ts` - Database service layer

## 🔍 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/wallet` - Connect wallet

### Submissions

- `POST /api/drops/submit` - Submit e-waste
- `GET /api/admin/submissions/pending` - Get pending submissions
- `POST /api/admin/submissions/batch-approve` - Batch approve & pay

## 🎯 Production Ready

The application includes:

- ✅ Secure authentication system
- ✅ Database connection pooling
- ✅ Error handling & validation
- ✅ Payment processing simulation
- ✅ Responsive design
- ✅ TypeScript for type safety
- ✅ Vercel deployment optimization

## 📝 License

MIT License - feel free to use for your own projects!

## 🆘 Support

1. **Setup Issues**: Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. **Deployment**: Vercel + Supabase work perfectly together
3. **Database**: Use Supabase dashboard for easy management

---

**Simple, secure, and Vercel-ready e-waste recycling platform! ♻️ 🚀**
