import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Crawlers need absolute URLs (social preview image, canonical link, sitemap). Set SITE_URL in
  // .env.production, or when building (SITE_URL=https://plumb.example.com pnpm build).
  // Without it the paths stay relative and robots.txt and sitemap.xml are not written.
  const siteUrl = (loadEnv(mode, '.', '').SITE_URL ?? '').replace(/\/$/, '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'site-url',
        transformIndexHtml: (html: string) => html.replaceAll('%SITE_URL%', siteUrl),
        generateBundle() {
          if (!siteUrl) return
          const today = new Date().toISOString().slice(0, 10)
          this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n` })
          this.emitFile({
            type: 'asset',
            fileName: 'sitemap.xml',
            source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`,
          })
        },
      },
    ],
  }
})
