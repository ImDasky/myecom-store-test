#!/bin/bash
set -e

# Debug: Show environment variables (without exposing full values)
echo "Checking environment variables..."
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'no')"
echo "NETLIFY_DATABASE_URL is set: $([ -n "$NETLIFY_DATABASE_URL" ] && echo 'yes' || echo 'no')"

# Ensure DATABASE_URL is set from NETLIFY_DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  if [ -n "$NETLIFY_DATABASE_URL" ]; then
    export DATABASE_URL="$NETLIFY_DATABASE_URL"
    echo "Set DATABASE_URL from NETLIFY_DATABASE_URL"
  else
    echo "ERROR: Neither DATABASE_URL nor NETLIFY_DATABASE_URL is set!"
    exit 1
  fi
fi

# Verify DATABASE_URL starts with postgresql:// or postgres://
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]] && [[ ! "$DATABASE_URL" =~ ^postgres:// ]]; then
  echo "ERROR: DATABASE_URL must start with postgresql:// or postgres://"
  echo "DATABASE_URL preview: ${DATABASE_URL:0:30}..."
  exit 1
fi

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "Building application..."
npm run build

