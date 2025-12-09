#!/bin/bash
# Don't use set -e, we want to continue even if migrations fail
# Migrations will run automatically on first request if they fail during build

# Debug: Show environment variables (without exposing full values)
echo "Checking environment variables..."
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'no')"
echo "NETLIFY_DATABASE_URL is set: $([ -n "$NETLIFY_DATABASE_URL" ] && echo 'yes' || echo 'no')"

# Note: NETLIFY_DATABASE_URL is only available at runtime, not during build
# So we'll skip migrations during build and they'll run automatically on first request
echo "NOTE: NETLIFY_DATABASE_URL is only available at runtime."
echo "Migrations will run automatically on first page load if needed."

# Build the application
echo "Building application..."
npm run build

