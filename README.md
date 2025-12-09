# MyEcom - Complete Ecommerce Template

A production-ready, single-store ecommerce website template designed for brick-and-mortar retail businesses. Built with Next.js 14, TypeScript, Prisma, and Stripe Connect.

## Features

- **Full Storefront**: Product catalog, shopping cart, checkout, and customer accounts
- **Admin Dashboard**: Complete admin interface for managing products, orders, settings, blog, and FAQ
- **Stripe Connect Integration**: OAuth-based onboarding for accepting payments
- **Flexible Shipping**: Support for flat-rate or Stripe shipping rates
- **Feature Toggles**: Enable/disable pages and features from admin settings
- **Dynamic Theming**: Customizable colors and branding
- **Blog & FAQ**: Built-in content management
- **Netlify Ready**: Configured for easy deployment

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via Prisma, easily switchable to PostgreSQL)
- **ORM**: Prisma
- **Payments**: Stripe Connect
- **Authentication**: Email/password with bcrypt

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account (for payments)

### Installation

1. **Clone or extract the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DATABASE_URL`: Database connection string (default: `file:./dev.db` for SQLite)
   - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe (optional, for webhook verification)
   - `AUTH_SECRET`: Random secret for session management
   - `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., `http://localhost:3000`)

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```
   
   **Note**: If you're updating from a previous version that used Stripe Connect, you'll need to create a migration to replace `stripeAccountId` and `stripeOnboardingComplete` fields with `stripeSecretKey` and `stripePublishableKey`:
   ```bash
   npx prisma migrate dev --name update_stripe_to_api_keys
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Create an admin user**
   
   You'll need to create an admin user manually. You can do this by:
   - Using Prisma Studio: `npx prisma studio`
   - Or creating a seed script
   - Or using the registration endpoint and then updating the user in the database

   To create an admin user via Prisma Studio:
   1. Run `npx prisma studio`
   2. Navigate to the User table
   3. Create a new user with:
      - `email`: Your admin email
      - `passwordHash`: Use a bcrypt hash (you can generate one using an online tool or Node.js)
      - `isAdmin`: `true`

## Deploy note
- Trigger a fresh deploy after schema changes (e.g., new SEO/map fields) so `npx prisma migrate deploy` runs on production.

   Or use this Node.js script:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('your-password', 10);
   console.log(hash);
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to `http://localhost:3000`

## Stripe Setup

### 1. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys
2. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)
3. Copy your **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### 2. Configure Stripe Keys in Admin

1. Log in as admin
2. Go to Admin → Settings
3. Scroll to "Stripe Configuration" section
4. Enter your Stripe Secret Key and Publishable Key
5. Save settings

### 3. Set Up Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `checkout.session.async_payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Operational Flow

### Admin Setup

1. **Initial Setup**
   - Create admin user (see Installation step 6)
   - Log in to admin dashboard
   - Configure store settings (business info, colors, etc.)
   - Enter Stripe API keys in Admin → Settings → Stripe Configuration

2. **Stripe Configuration**
   - Go to Admin → Settings
   - Enter your Stripe Secret Key and Publishable Key in the Stripe Configuration section
   - Save settings

3. **Product Management**
   - Go to Admin → Products
   - Add products with images, descriptions, and prices
   - Add variants (sizes, colors, etc.) with individual pricing and stock
   - Toggle products/variants active/inactive

4. **Content Management**
   - Add blog posts (Admin → Blog)
   - Manage FAQs (Admin → FAQ)
   - Configure homepage hero section

### Customer Flow

1. **Browsing**
   - Browse products on the storefront
   - Search products (if enabled)
   - View product details and variants

2. **Shopping**
   - Add items to cart
   - Review cart
   - Proceed to checkout

3. **Checkout**
   - Enter email address
   - Server validates products, variants, and stock
   - Server calculates totals and shipping
   - Redirects to Stripe Checkout (connected account)
   - Customer completes payment

4. **Order Processing**
   - Webhook receives `checkout.session.completed` event
   - Order status updated to "paid"
   - Stock decremented for purchased variants
   - Customer receives confirmation

### Order Management

- Admins can view all orders in Admin → Orders
- View order details, customer info, and items
- Track order status (pending, paid, failed)

## Project Structure

```
/app
  /api              # API routes
    /admin          # Admin API endpoints
    /auth           # Authentication endpoints
    /checkout       # Checkout processing
    /stripe         # Stripe webhooks and Connect
  /admin            # Admin pages
  /account          # Customer account pages
  /auth             # Login/register pages
  /blog             # Blog pages
  /cart             # Shopping cart
  /checkout         # Checkout pages
  /contact          # Contact page
  /faq              # FAQ page
  /location         # Store location page
  /products         # Product pages
/components         # React components
/lib                # Utility functions
  auth.ts           # Authentication helpers
  db.ts             # Prisma client
  settings.ts       # Store settings cache
  shipping.ts       # Shipping calculations
  stripe.ts         # Stripe client
  utils.ts          # General utilities
/prisma             # Database schema
```

## Deployment to Netlify

1. **Build Configuration**
   
   The project is already configured for Netlify. Ensure your `netlify.toml` (if needed) includes:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   ```

2. **Environment Variables**
   
   Add all environment variables in Netlify dashboard:
   - Settings → Environment Variables

3. **Database**
   
   For production, consider using PostgreSQL:
   - Update `DATABASE_URL` in Prisma schema to PostgreSQL
   - Or use a service like Supabase, Railway, or Neon

4. **Deploy**
   
   Connect your Git repository to Netlify or use Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

## Important Notes

- **Image Uploads**: Currently uses image URLs. For production, consider integrating with Cloudinary, AWS S3, or similar
- **Admin User**: Only one admin user is supported. Create additional admin users by setting `isAdmin: true` in the database
- **Stock Management**: Stock is automatically decremented when orders are paid via webhook
- **Shipping**: Flat-rate shipping is default. Stripe shipping requires additional configuration in Stripe Dashboard

## Troubleshooting

### Database Issues
- Ensure Prisma migrations are run: `npx prisma migrate dev`
- Regenerate Prisma client: `npx prisma generate`

### Stripe Issues
- Verify Stripe keys are entered in Admin → Settings
- Ensure you're using test keys (sk_test_/pk_test_) for development
- Check webhook endpoint is accessible
- Verify webhook secret matches in Stripe Dashboard

### Authentication Issues
- Clear browser cookies if session issues occur
- Verify `AUTH_SECRET` is set

## License

This is a template project. Use as needed for your business.

## Support

For issues or questions, refer to the codebase documentation or create an issue in your repository.

