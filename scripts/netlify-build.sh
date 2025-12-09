#!/bin/bash
set -e

# Ensure DATABASE_URL is set from NETLIFY_DATABASE_URL
if [ -z "$DATABASE_URL" ] && [ -n "$NETLIFY_DATABASE_URL" ]; then
  export DATABASE_URL="$NETLIFY_DATABASE_URL"
fi

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "Building application..."
npm run build

