# Netlify Deployment Guide

## Quick Deploy via Netlify CLI

1. **Login to Netlify** (if not already logged in):
   ```bash
   netlify login
   ```

2. **Initialize and create site**:
   ```bash
   netlify init
   ```
   - Select "Yes, create and deploy site manually"
   - Choose your team
   - The site will be created and linked

3. **Set up environment variables**:
   ```bash
   netlify env:set DATABASE_URL "your-database-url"
   netlify env:set STRIPE_WEBHOOK_SECRET "your-webhook-secret"
   netlify env:set AUTH_SECRET "your-random-secret-key"
   netlify env:set NEXT_PUBLIC_APP_URL "https://your-site-name.netlify.app"
   ```
   
   **Note**: Stripe keys should be entered in Admin Settings after deployment, not as environment variables.

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Alternative: Deploy via Netlify Dashboard

1. **Push to GitHub** (recommended):
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin master
   ```

2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables in Site settings → Environment variables

3. **Set Environment Variables**:
   - `DATABASE_URL`: Your database connection string
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret (optional)
   - `AUTH_SECRET`: A random secret for session management
   - `NEXT_PUBLIC_APP_URL`: Your Netlify site URL (e.g., `https://your-site.netlify.app`)

## Database Setup

For production, you'll need a PostgreSQL database. Options:

1. **Supabase** (Free tier available):
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Copy connection string
   - Update `prisma/schema.prisma` datasource to:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```

2. **Railway** (Free tier available):
   - Create account at [railway.app](https://railway.app)
   - Create PostgreSQL database
   - Copy connection string

3. **Neon** (Free tier available):
   - Create account at [neon.tech](https://neon.tech)
   - Create database
   - Copy connection string

## Post-Deployment Steps

1. **Run database migrations**:
   - You may need to run migrations manually or set up a build hook
   - Or use Netlify Functions to run migrations

2. **Create admin user**:
   - Access your database directly
   - Create a user with `isAdmin: true`

3. **Configure Stripe**:
   - Log in to admin dashboard
   - Go to Settings → Stripe Configuration
   - Enter your Stripe Secret Key and Publishable Key

4. **Set up webhook**:
   - In Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-site.netlify.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `checkout.session.async_payment_failed`
   - Copy webhook secret to environment variable

5. **After schema changes (e.g., new SEO/map fields)**:
   - Ensure a new deploy runs `npx prisma migrate deploy` (your Netlify build script does this)
   - If needed, trigger a fresh deploy so migrations apply to production DB

## Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json`
- **Database errors**: Ensure `DATABASE_URL` is set correctly
- **Stripe errors**: Verify keys are entered in admin settings
- **Webhook errors**: Check webhook URL is accessible and secret matches

