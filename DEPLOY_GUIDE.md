# 🚀 SmartExpense Deployment Guide

Follow these steps to get your website live for free with a persistent database.

## Phase 1: Setup Turso (Cloud Database)
1. Go to [Turso.tech](https://turso.tech/) and sign up for a free account.
2. Install the Turso CLI or use their web dashboard to create a new database.
3. Once created, click on **"Manage Database"** to find your:
   - **TURSO_URL**: (Looks like `libsql://your-db-name.turso.io`)
   - **TURSO_TOKEN**: (Click "Generate Token")
4. **Keep these handy!**

## Phase 2: Setup Render (Hosting)
1. Go to [Render.com](https://render.com/) and sign up.
2. Click **"New +"** -> **"Web Service"**.
3. Connect your GitHub repository.
4. Use these settings:
   - **Name**: `smartexpense`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
5. Click **"Advanced"** to add **Environment Variables**:
   - `TURSO_URL`: (Your Turso URL)
   - `TURSO_TOKEN`: (Your Turso Token)
   - `JWT_SECRET`: (Any random string, e.g., `super-secret-123`)
   - `NODE_ENV`: `production`

## Phase 3: Verify
1. Render will take 2-3 minutes to build and deploy.
2. Once finished, click the **URL** provided by Render (e.g., `https://smartexpense.onrender.com`).
3. Signup, Login, and start tracking!

> [!IMPORTANT]
> Since we are using the free tier of Render, the first time you open the website after some time, it might take 30-40 seconds to "wake up". This is normal for free hosting!
