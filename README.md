# CloudHire - AI-Evaluated Technical Exams

A Next.js web application for conducting AI-evaluated technical exams with automated grading, report generation, and email sharing via Resend.

## 🚀 Deployment

This application is deployed on **Cloudflare Workers** using OpenNext for optimal performance and cost-effectiveness.

### Live Demo
- **Production**: [Coming Soon]
- **Development**: [Coming Soon]

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Cloudflare Workers, D1 Database
- **AI Grading**: Python-based evaluation system
- **Email**: Resend for automated report sharing
- **Deployment**: Cloudflare Workers via OpenNext

## 📋 Prerequisites

- Node.js 22+
- npm or pnpm
- Cloudflare account with D1 database
- Resend account for email functionality

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/avschaefer/cloudhire.git
cd cloudhire

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build and Deploy

```bash
# Build for production
npm run build:opennext

# Deploy to Cloudflare Workers
npm run deploy
```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Resend Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_email
RESEND_TO_EMAIL=recipient_email

# Site Configuration
SITE_URL=https://your-domain.com
NEXT_PUBLIC_HIRING_MANAGER_EMAIL=hiring@example.com

# AI Grader (if using separate worker)
AI_GRADER_WORKER_URL=https://ai-grader-worker.your-subdomain.workers.dev

# Gemini AI (if using)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## 📁 Project Structure

```
cloudhire/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── utils/             # Utility functions
├── components/            # Shared UI components
├── lib/                   # Library configurations
├── migrations/            # D1 database migrations
├── python/                # Python AI grader
└── public/                # Static assets
```

## 🔄 Migration from Vercel

This project has been migrated from Vercel to Cloudflare Workers for:
- ✅ Vercel-free deployment
- ✅ Better cost-effectiveness
- ✅ Full Next.js feature support
- ✅ Seamless D1 database integration

## 📝 License

MIT License - see LICENSE file for details.
