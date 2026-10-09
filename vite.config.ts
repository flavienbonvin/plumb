import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Social crawlers need an absolute URL for the preview image. Set SITE_URL when building
  // (for example SITE_URL=https://plumb.example.com pnpm build); without it the path stays relative.
  const siteUrl = (loadEnv(mode, '.', '').SITE_URL ?? '').replace(/\/$/, '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      { name: 'site-url', transformIndexHtml: (html: string) => html.replaceAll('%SITE_URL%', siteUrl) },
    ],
  }
})
