# RENDER.COM DEPLOYMENT GUIDE

## Step-by-Step Instructions

### 1. CREATE RENDER ACCOUNT
- Go to https://render.com
- Click "Sign up with GitHub" (recommended - authenticates directly)
- Authorize Render to access your GitHub

### 2. CREATE NEW WEB SERVICE
- Click "New" → "Web Service"
- Select "Build and deploy from a Git repository"
- Connect your GitHub repo: `R0HIT-45/Finance-Flow`
- Choose branch: `main`

### 3. CONFIGURE DEPLOYMENT SETTINGS
Fill in the following:

**Name:** `finance-flow-api`

**Environment:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm run dev` 
(Or use `npx ts-node src/index.ts` for production)

**Plan:** Choose "Free" (for testing) or "Starter" (small production)

### 4. SET ENVIRONMENT VARIABLES
Click "Advanced" → "Add Environment Variable"

Add:
```
DATABASE_URL=file:./prisma/dev.db
NODE_ENV=production
```

### 5. GENERATE PRISMA CLIENT
After deployment starts, you may need to run:
```
npx prisma generate
```

### 6. VERIFY DEPLOYMENT
Once deployed (green status), you'll get a URL like:
```
https://finance-flow-api-xxxxx.onrender.com
```

Test it:
- Health check: `GET https://finance-flow-api-xxxxx.onrender.com/health`
- Swagger docs: `GET https://finance-flow-api-xxxxx.onrender.com/api-docs`
- Register: `POST https://finance-flow-api-xxxxx.onrender.com/api/auth/register`

---

## IMPORTANT NOTES FOR PRODUCTION

⚠️ **Current Setup Issue:**
Your app uses SQLite (`file:./prisma/dev.db`), which stores data in the container's filesystem. This means:
- Data will be lost when the container restarts (happens frequently)
- Not recommended for production

✅ **Better Solution for Production:**
Use PostgreSQL or MongoDB:

1. Click "Add PostgreSQL" → Create database
2. Copy the connection string
3. Update `DATABASE_URL` environment variable
4. Render will auto-link the database
5. Migrations will run automatically

---

## POSSIBLE ERRORS & FIXES

### Error: "Port is already in use"
→ Change port in src/index.ts from 3000 to process.env.PORT || 3000

### Error: "Module not found"
→ Make sure all dependencies are in package.json (check swagger packages!)

### Error: "Prisma generation failed"
→ May need to add build script in package.json:
```json
"build": "npx prisma generate"
```

### Error: "Database connection refused"
→ Render is having trouble accessing SQLite
→ Switch to PostgreSQL database

---

## QUICK CHECKLIST
✅ Code pushed to main branch
✅ package.json has all dependencies
✅ .env variables documented
✅ GitHub repo is public or Render has access

👉 You're ready to deploy!
