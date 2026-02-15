# MUBAS Leo Club Platform

A comprehensive web platform for MUBAS Leo Club featuring:
- Public website with information about the club
- Member portal with personalized dashboard
- E-commerce shop for club merchandise
- Event management and calendar
- Donation system with payment integration
- Admin analytics and reporting

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: TanStack React Query
- **Animation**: Framer Motion
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Cloudinary
- **Payments**: PayChangu
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- Cloudinary account
- PayChangu merchant account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PayChangu
NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY=your_public_key
PAYCHANGU_SECRET_KEY=your_secret_key
```

### Installation

```bash
# Install dependencies
npm install

# Initialize Firestore with sample data
npm run init-db

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/
│   ├── (public)/          # Public-facing pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── portal/            # Member portal
│   └── api/               # API routes
├── components/
│   ├── auth/              # Authentication components
│   ├── common/            # Shared components
│   ├── layout/            # Layout components
│   └── ui/                # UI components (shadcn)
├── lib/
│   ├── firebase/          # Firebase config and utilities
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   └── types/             # TypeScript types
└── scripts/               # Utility scripts
```

## Features

### Public Website
- Home page with hero section
- About, Leaders, Services pages
- Events calendar with filtering
- Gallery with lightbox
- Membership information
- Donation page

### Authentication
- Email/password registration and login
- Password reset functionality
- Protected routes with middleware
- Role-based access control

### Member Portal
- Personalized dashboard with stats
- Profile management with image upload
- My Club - member directory
- Event browsing and registration
- Shop with cart functionality
- Notifications system

### Admin Dashboard
- Member management
- Event management
- Donation tracking
- Analytics and reports

### E-Commerce
- Product catalog with categories
- Shopping cart
- Checkout with PayChangu integration
- Order history

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Initialize database
npm run init-db
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For support, email info@mubasleoclub.org or visit our website.
```

```json file="" isHidden
