# VFurniture — Customer Storefront

Next.js 16 e-commerce storefront for VFurniture. Customers can browse products, manage a cart, place orders, pay via Razorpay, and chat with an AI assistant.

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **State** — Zustand + TanStack Query v5
- **Auth** — JWT (access + refresh tokens) + Google OAuth
- **Database** — MongoDB via Mongoose
- **Cache** — Upstash Redis
- **Payments** — Razorpay
- **Real-time** — Pusher
- **AI Chat** — Groq (Llama 3.3 70B)
- **Media** — Cloudinary
- **Email** — Nodemailer

---

## Project Structure

```
src/
├── app/
│   ├── (shop)/           # Customer-facing pages
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── checkout/
│   │   ├── collections/
│   │   ├── inspiration/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── order-details/
│   │   ├── order-success/
│   │   ├── payment/
│   │   ├── products/
│   │   ├── search/
│   │   ├── settings/
│   │   ├── support/
│   │   ├── wishlist/
│   │   └── [slug]/       # Dynamic product/category pages
│   ├── api/              # API route handlers
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── chat/
│   │   ├── coupons/
│   │   ├── inspirations/
│   │   ├── notifications/
│   │   ├── oauth/
│   │   ├── orders/
│   │   ├── payment/
│   │   ├── products/
│   │   ├── reviews/
│   │   ├── search/
│   │   └── wishlist/
│   ├── auth/             # Login / sign-in pages
│   └── profile/          # User profile & address
├── components/
│   ├── auth/             # Auth modal, guards, OAuth, reset password
│   ├── chat/             # AI chat widget
│   ├── filter/           # Product filter sidebar
│   ├── footer/
│   └── ...
└── lib/                  # Domain logic, middleware, utilities
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- Upstash Redis instance
- Cloudinary account
- Razorpay account (test keys for dev)
- Pusher account
- Groq API key
- Google OAuth credentials

### 1. Install dependencies

```bash
cd v-furniture-client
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI
GROQ_API_KEY_UNDERSTAND=your_groq_key
GROQ_API_KEY_NORMALIZE=your_groq_key
GROQ_API_KEY_RESPOND=your_groq_key
GROQ_MODEL_UNDERSTAND=llama-3.3-70b-versatile
GROQ_MODEL_RESPOND=llama-3.3-70b-versatile
GROQ_MODEL_NORMALIZE=llama-3.3-70b-versatile

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Upstash Redis
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

# Pusher
PUSHER_APP_ID=your_pusher_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Features

- **Product catalog** — categories, subcategories, collections, search with AI-powered query understanding
- **Cart & checkout** — persistent cart, coupon codes, address management
- **Payments** — Razorpay integration with webhook verification
- **Orders** — full order lifecycle, order details, PDF invoice download
- **Wishlist** — save products across sessions
- **AI Chat** — Groq + Pinecone RAG for product recommendations
- **Inspiration** — curated room inspiration gallery
- **Auth** — email/password + Google OAuth, OTP-based password reset
- **Real-time notifications** — Pusher-powered live updates
- **Profile** — address book, order history, account settings

---

## Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Auth Flow

1. Register with email + password → OTP sent to email → verify → account created
2. Login returns JWT access token (cookie) + refresh token (cookie)
3. Google OAuth via `/api/oauth/google/callback`
4. Password reset: send code → verify 6-digit OTP → set new password

---

## Deployment

Deploy to [Vercel](https://vercel.com). Set all environment variables in the Vercel project settings. The `NEXT_PUBLIC_BASE_URL` must match your production domain.
