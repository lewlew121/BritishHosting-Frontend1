British Hosting – Frontend
==========================
1) Rename .env.example to .env and fill:
   - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (or test key)
   - VITE_BACKEND_URL=https://<your-backend-domain>
2) Install & build:
   npm install
   npm run build
3) Deploy the dist/ folder to Netlify/Vercel/GitHub Pages (drag & drop).
