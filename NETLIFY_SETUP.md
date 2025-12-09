# Netlify Deployment Steps

## Your GitHub Repository
✅ **Repository created**: https://github.com/ImDasky/myecom-store

## Deploy to Netlify

### Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"** (or Git provider you used)
4. Authorize Netlify to access your GitHub account if prompted
5. Select the repository: **`ImDasky/myecom-store`**

### Step 2: Configure Build Settings

Netlify should auto-detect Next.js, but verify these settings:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Base directory**: (leave empty)

Click **"Deploy site"**

### Step 3: Connect Neon Database (Recommended - Automatic Setup)

**The easiest way to set up your database is using Neon via Netlify integration:**

1. In your Netlify site dashboard, go to **Site settings** → **Data** (or look for "Neon" in the sidebar)
2. Click **"Add data store"** or **"Connect Neon database"**
3. Follow the prompts to create or connect a Neon database
4. Once connected, Netlify automatically provides `NETLIFY_DATABASE_URL` at runtime
5. **No manual environment variable setup needed!** The code automatically uses `NETLIFY_DATABASE_URL` if `DATABASE_URL` is not set

**✅ That's it!** The database connection will work automatically after the next deploy.

### Step 4: Set Other Environment Variables

After the site is created, go to:
**Site settings** → **Environment variables** → **Add variable**

Add these variables (if not using Neon, you'll also need DATABASE_URL):

1. **DATABASE_URL** (Only needed if NOT using Neon integration)
   - For production, use PostgreSQL
   - Example: `postgresql://user:password@host:5432/dbname`
   - You can get this from Supabase, Railway, or Neon
   - **Skip this if you connected Neon via Netlify integration above**

2. **AUTH_SECRET**
   - Generate a random secret key
   - Example: `openssl rand -base64 32`
   - Or use any long random string

3. **NEXT_PUBLIC_APP_URL**
   - Your Netlify site URL
   - Example: `https://your-site-name.netlify.app`
   - You'll get this after first deployment

4. **STRIPE_WEBHOOK_SECRET** (Optional)
   - Get this from Stripe Dashboard after setting up webhook
   - Can be added later

### Step 5: Redeploy

After connecting Neon (or adding environment variables):
- Go to **Deploys** tab
- Click **"Trigger deploy"** → **"Clear cache and deploy site"**

The build script will automatically:
- Use `NETLIFY_DATABASE_URL` for database migrations during build
- The runtime code will automatically use `NETLIFY_DATABASE_URL` if available

### Step 6: Alternative Database Setup (If Not Using Neon Integration)

If you prefer to use a different database provider or set up Neon manually:

**Option A: Supabase (Free tier)**
1. Go to [supabase.com](https://supabase.com)
2. Create account and new project
3. Go to Settings → Database
4. Copy the connection string
5. Add it as `DATABASE_URL` in Netlify environment variables

**Option B: Railway**
1. Go to [railway.app](https://railway.app)
2. Create account
3. New Project → Add PostgreSQL
4. Copy connection string
5. Add it as `DATABASE_URL` in Netlify environment variables

**Option C: Neon (Manual Setup)**
1. Go to [neon.tech](https://neon.tech)
2. Create account
3. Create database
4. Copy connection string
5. Add it as `DATABASE_URL` in Netlify environment variables

### Step 7: Run Database Migrations

You have a few options:

**Option A: Use Netlify Functions** (Recommended)
- Create a function to run migrations
- Or use a build hook

**Option B: Run locally pointing to production DB**
```bash
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

**Option C: Use Prisma Studio or direct SQL**
- Connect to your production database
- Run the schema manually

### Step 8: Create Admin User

After database is set up, create an admin user:

1. Connect to your database
2. Insert a user with:
   - Email: your admin email
   - passwordHash: bcrypt hash of your password
   - isAdmin: true

You can generate a password hash using:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

### Step 9: Configure Stripe

1. Log in to your deployed site as admin
2. Go to **Admin → Settings**
3. Scroll to **Stripe Configuration**
4. Enter your:
   - **Stripe Secret Key** (starts with `sk_test_` or `sk_live_`)
   - **Stripe Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Save settings

### Step 10: Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. **Add endpoint**
4. Endpoint URL: `https://your-site.netlify.app/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_failed`
6. Copy the **Signing secret**
7. Add to Netlify environment variables as `STRIPE_WEBHOOK_SECRET`
8. Redeploy site

## Your Site URL

After deployment, your site will be available at:
`https://your-site-name.netlify.app`

You can customize the site name in:
**Site settings** → **General** → **Site details** → **Change site name**

## Troubleshooting

- **Build fails**: Check build logs in Netlify dashboard
- **Database errors**: 
  - If using Neon integration: Verify Neon is connected in **Site settings** → **Data**
  - If not using Neon: Verify `DATABASE_URL` is set in environment variables
  - Check `/api/health` endpoint to see database connection status
- **Database not connecting automatically with Neon**: 
  - Make sure Neon is connected via Netlify integration (not just manually added)
  - The `NETLIFY_DATABASE_URL` variable is automatically provided by Netlify
  - Check build logs to see if migrations ran successfully
- **Stripe errors**: Check keys are entered in admin settings
- **Webhook errors**: Verify webhook URL and secret

## Quick Commands Reference

```bash
# View your site
gh repo view --web

# Push updates
git add .
git commit -m "Your message"
git push

# Netlify will auto-deploy on push
```

