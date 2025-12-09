# Automatic Neon Database Setup

## Overview

This project is configured to **automatically work with Neon databases** when connected via Netlify's integration. No manual environment variable setup is required!

## How It Works

1. **Connect Neon via Netlify Integration**
   - Go to your Netlify site → **Site settings** → **Data**
   - Click **"Add data store"** or **"Connect Neon database"**
   - Follow the prompts to create/connect your database

2. **Automatic Configuration**
   - Netlify automatically provides `NETLIFY_DATABASE_URL` at runtime
   - The code in `lib/db.ts` automatically uses `NETLIFY_DATABASE_URL` if `DATABASE_URL` is not set
   - The build script automatically uses `NETLIFY_DATABASE_URL` for migrations during build

3. **Deploy and It Works!**
   - After connecting Neon, trigger a new deploy
   - The database will be automatically connected
   - Migrations will run during the build process

## What Gets Set Automatically

When Neon is connected via Netlify integration:
- ✅ `NETLIFY_DATABASE_URL` - Automatically available at runtime
- ✅ `NETLIFY_DATABASE_URL_UNPOOLED` - Also available if needed
- ✅ Database migrations run automatically during build
- ✅ No need to manually add `DATABASE_URL` environment variable

## Code Changes

The following files handle the automatic setup:

- **`lib/db.ts`**: Automatically uses `NETLIFY_DATABASE_URL` if `DATABASE_URL` is not set
- **`scripts/netlify-build.sh`**: Maps `NETLIFY_DATABASE_URL` to `DATABASE_URL` during build for migrations
- **`netlify.toml`**: Configured to work with Netlify's Neon integration

## Verification

After deploying, check that everything works:

1. **Health Check**: Visit `https://your-site.netlify.app/api/health`
   - Should show: `{"status":"ok","database":"connected"}`

2. **Environment Check**: Visit `https://your-site.netlify.app/api/test-env`
   - Should show: `NETLIFY_DATABASE_URL_set: true`

3. **Homepage**: Should load without database errors

## Troubleshooting

**Database not connecting?**
- Make sure Neon is connected via **Netlify integration** (not just manually added as environment variable)
- Check that the connection shows up in **Site settings** → **Data**
- Verify in build logs that migrations ran successfully
- Check `/api/health` endpoint for detailed error messages

**Still need to manually set DATABASE_URL?**
- This should only be needed if you're NOT using Neon integration
- If using Neon integration, `NETLIFY_DATABASE_URL` should be automatically available
- Check that Neon is properly connected in Netlify dashboard

## Manual Setup (Alternative)

If you prefer to set up the database manually or use a different provider:

1. Add `DATABASE_URL` to Netlify environment variables
2. The code will use `DATABASE_URL` if it's set (takes precedence over `NETLIFY_DATABASE_URL`)

