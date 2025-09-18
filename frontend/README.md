# AVEX Frontend - Vercel Deployment

This is the frontend React application for the AVEX AMT certification study platform.

## Deployment Steps

1. **Create a Vercel Project**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository or upload this folder
   - Select "Vite" as the framework preset

2. **Set Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add the following variables:
     - `VITE_API_URL`: Your Railway backend URL (e.g., `https://your-app.railway.app`)
     - Other variables from `.env.example` as needed

3. **Update vercel.json**
   - Edit `vercel.json` and replace `your-railway-backend.railway.app` with your actual Railway backend URL

4. **Deploy**
   - Vercel will automatically deploy your main branch
   - Your frontend will be available at: `https://your-project.vercel.app`

## Environment Variables

See `.env.example` for all available environment variables.

## Configuration

- `vercel.json`: Vercel deployment configuration with API proxy
- `vite.config.ts`: Vite build configuration with proxy for development
- The app automatically detects the environment and routes API calls appropriately

## Development

```bash
npm install
npm run dev
```

The development server will proxy API calls to your local backend or the configured `VITE_API_URL`.

## Build

```bash
npm run build
```

This creates a `dist` folder with the production build.