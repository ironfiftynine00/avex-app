# AVEX Backend - Railway Deployment

This is the backend API for the AVEX AMT certification study platform.

## Deployment Steps

1. **Create a Railway Project**
   - Go to [Railway](https://railway.app)
   - Create a new project
   - Connect your GitHub repository or upload this folder

2. **Set Environment Variables**
   - Copy variables from `.env.example`
   - Set them in Railway's environment variables section
   - Required variables:
     - `DATABASE_URL`: PostgreSQL connection string
     - `SESSION_SECRET`: Random secure string
     - `FRONTEND_URL`: Your Vercel frontend URL

3. **Database Setup**
   - Add a PostgreSQL database to your Railway project
   - Copy the `DATABASE_URL` connection string
   - Run `npm run db:push` to create tables

4. **Deploy**
   - Railway will automatically deploy when you push to main branch
   - Your API will be available at: `https://your-app.railway.app`

## Environment Variables

See `.env.example` for all required environment variables.

## Health Check

The API includes a health check endpoint at `/health` for monitoring.