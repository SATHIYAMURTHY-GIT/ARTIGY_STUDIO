<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Artify Studio

Transform your photos into professional pencil sketches and ASCII art using Gemini AI.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   `npm install`
2. Create `.env.local` and add your Gemini API key:
   `VITE_GEMINI_API_KEY=your_api_key_here`
3. Run the app:
   `npm run dev`

## Build for Hosting

1. Build production assets:
   `npm run build`
2. Deploy the generated `dist/` folder on your hosting platform.
3. In your hosting platform environment variables, set:
   `VITE_GEMINI_API_KEY=your_api_key_here`

This project uses standard Vite environment variables (`VITE_*`) so it works across common hosts like Vercel, Netlify, Cloudflare Pages, Render static sites, and any static hosting with a build step.
