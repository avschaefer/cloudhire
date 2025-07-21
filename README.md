# CloudHire - AI-Evaluated Technical Exams

A Next.js web application for conducting AI-evaluated technical exams with automated grading, report generation, and email sharing via Resend.

## 🚀 Deployment

This application is deployed on **Cloudflare Workers** using OpenNext for optimal performance and cost-effectiveness.

### Live Demo
- **Production**: [https://www.cloudhire.app](https://www.cloudhire.app)
- **Development**: [https://cloudhire.avschaefer.workers.dev](https://cloudhire.avschaefer.workers.dev)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Cloudflare Workers, D1 Database
- **AI Grading**: xAI Grok-powered evaluation system
- **Email**: Resend for automated report sharing
- **Deployment**: Cloudflare Workers via OpenNext

## 📋 Prerequisites

- Node.js 22+
- npm or pnpm
- Cloudflare account with D1 database
- Resend account for email functionality

## 🚀 Quick Start

### Local Development

\`\`\`bash
# Clone the repository
git clone https://github.com/avschaefer/cloudhire.git
cd cloudhire

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

### Build and Deploy

\`\`\`bash
# Test configuration
npm run test:config
npm run test:email

# Build for production
npm run build:opennext

# Deploy to Cloudflare Workers
npm run deploy

# Deploy to preview environment
npm run deploy:preview

# Local development with Workers
npm run preview
\`\`\`

### Troubleshooting

If you encounter build failures:

1. **Check Node.js version**: Ensure you're using Node.js 22+
2. **Validate configuration**: Run `npm run test:config`
3. **Check secrets**: Ensure all required secrets are set in Cloudflare
4. **Clean build**: Run `npm run clean` and rebuild
5. **Check logs**: Use `wrangler tail` to monitor deployment logs

## Supabase Setup
- Create a Supabase project at supabase.com.
- Note the project URL and anon key.
- In Vercel dashboard, add Supabase integration or manually set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Locally, add to .env file.

## Environment Variables
Add these to Vercel and local .env:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- Existing: RESEND_API_KEY, etc.

## Running Python with DB
- Install dependencies: cd python; pip install -r requirements.txt
- Set env vars including SUPABASE_URL and SUPABASE_ANON_KEY.
- Run scripts like python grader.py

## 📁 Project Structure

\`\`\`
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
\`\`\`

## 🔄 Migration from Vercel

This project has been migrated from Vercel to Cloudflare Workers for:
- ✅ Vercel-free deployment
- ✅ Better cost-effectiveness
- ✅ Full Next.js feature support
- ✅ Seamless D1 database integration

## 🚀 Recent Improvements

### Architecture Enhancements
- **Modular Design**: Separated concerns into dedicated modules (`lib/config.ts`, `lib/db-utils.ts`, `lib/email-utils.ts`)
- **AI Integration**: Enhanced Python grader with xAI API integration and fallback mechanisms
- **Error Handling**: Comprehensive error handling with custom error classes
- **Configuration Management**: Centralized configuration with validation

### AI Grading System
- **Modular Structure**: Split into `api_client.py`, `report_generator.py`, and `grader.py`
- **xAI Integration**: Primary AI grading using xAI Grok API
- **Fallback System**: Automatic fallback to basic grading when AI is unavailable
- **Comprehensive Reports**: Detailed analysis with strengths, improvements, and hiring recommendations

### Deployment Improvements
- **Automated Scripts**: Deployment script with validation checks
- **Health Monitoring**: `/api/health` endpoint for service monitoring
- **Better Configuration**: Enhanced `wrangler.toml` with proper build settings
- **Error Recovery**: Graceful handling of configuration and service failures

## 📝 License

MIT License - see LICENSE file for details.
