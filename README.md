
# AVEX App (Separated)

This repository is split into **frontend** and **backend** for easier deployment.

## Frontend (Vercel)
- Path: `/frontend`
- Framework: React + Vite + Tailwind
- Env: `NEXT_PUBLIC_API_URL` pointing to backend

## Backend (Railway)
- Path: `/backend`
- Framework: Express + Drizzle + Neon DB
- Env: `DATABASE_URL`, `JWT_SECRET`
    