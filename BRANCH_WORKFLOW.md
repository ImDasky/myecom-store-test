# Branch Workflow Guide

## Current Branches

- **`main`** - Production branch (deployed to production)
- **`develop`** - Development/testing branch (deployed as preview)

## Working on the Develop Branch

### Switch to develop branch:
```bash
git checkout develop
```

### Make changes and commit:
```bash
git add .
git commit -m "Your change description"
git push
```

### Netlify will automatically:
- Create a **Deploy Preview** for the develop branch
- Give you a unique URL like: `https://develop--your-site.netlify.app`
- You can test changes there before merging to main

## Merging to Production

When you're ready to deploy to production:

```bash
# Switch to main
git checkout main

# Merge develop into main
git merge develop

# Push to production
git push

# Netlify will automatically deploy to production
```

## Branch Deployments

Netlify automatically creates preview deployments for:
- Pull requests
- Branch pushes (like `develop`)
- Each gets its own URL for testing

## Quick Commands

```bash
# See current branch
git branch

# Switch to develop
git checkout develop

# Switch to main
git checkout main

# Create a new feature branch
git checkout -b feature/your-feature-name

# Push new branch
git push -u origin feature/your-feature-name
```

## Best Practices

1. **Work on `develop`** for testing new features
2. **Test on preview deployment** before merging
3. **Merge to `main`** when ready for production
4. **Use feature branches** for larger changes

## Netlify Preview URLs

After pushing to `develop`, check:
- **Netlify Dashboard** → **Deploys** tab
- Look for "Deploy Preview" or branch deploy
- Click to get the preview URL

