# Avex Backend

This is the backend API (Express + TypeScript).

Important: By default the server will NOT serve the frontend. To serve a built client from the backend, set SERVE_CLIENT=true.

To run locally:
1. cd into this folder
2. npm install
3. npm run dev

To deploy to Railway:
- Create a project and link the repository.
- Set environment variables (DB connection string, SESSION_SECRET, etc).
- Build command: `npm run build`
- Start command: `npm run start`

