# Plumb

Drop an image, see it behind the clock on a Mac or iPhone lock screen, frame it, give it a film look, and export it at the screen's native resolution. Everything runs in your browser; nothing is uploaded.

## Features

- **Previews** for each device: lock screen, Mac desktop (menu bar and Dock) or iPhone home screen, or the plain wallpaper. Models: MacBook Neo, Air 13″ and 15″, Pro 14″ and 16″, 4K and 5K displays, and iPhones from the 15 to the 18 Pro Max (including the Air, 16e and 17e), plus custom sizes.
- **Position**: drag, scroll or pinch to zoom, arrow keys to nudge. The image snaps to the centre lines.
- **Frame it**: a moulding and a paper mat, with your choice of colours and thickness.
- **Looks**: eight film looks inspired by Fujifilm simulations (Provia, Velvia, Astia, Classic Chrome, Classic Neg., Eterna, Acros), with grain and vignette. One look can be shared by both devices.
- **Clock check**: warns when white lock screen text will be hard to read and can add a soft shade behind it.
- **Export**: PNG or JPEG in Display P3, named `<image>-mac` and `<image>-iphone`. Share through the system share sheet (AirDrop, Save to Photos) where the browser supports it.
- **Comfort**: light and dark themes, undo and redo (⌘Z, ⇧⌘Z), your last image and settings are remembered locally.

The lock screen, desktop and home screen overlays, and the iOS home screen blur option, are previews only. They are never part of the exported file. The app icons shown on the desktop and home screen are neutral placeholder tiles, not real app icons.

## Develop

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # static output in dist/
```

Stack: Vite, React, TypeScript and Tailwind CSS v4. No server code.

Where things live:

| Path | What |
| --- | --- |
| `src/lib/devices.ts` | Device list, resolutions, Dynamic Island and notch sizes |
| `src/lib/draw.ts` | The one drawing function used by both preview and export |
| `src/lib/looks.ts` | Film looks, grain and vignette |
| `src/components/screens/` | Menu bar, status bar and placeholder icons |
| `src/components/*Overlay.tsx` | Lock screen, desktop and home screen overlays |

Device sizes were checked against Apple's spec pages, Wikipedia and ios-resolution.com. The Dynamic Island on the iPhone 18 Pro and Pro Max (about 81 × 37 pt) comes from reported figures, not an Apple specification.

## Deploy (Cloudflare)

The site is static and is served by Cloudflare Workers static assets (`wrangler.jsonc`, output in `dist/`).

```sh
pnpm exec wrangler login   # once
SITE_URL=https://your-domain pnpm deploy
```

`SITE_URL` makes the social preview image URL absolute, which link scrapers need. Without it the page works, but shared links may not show the preview.

Or connect the GitHub repo in the Cloudflare dashboard (Workers & Pages, then Create, then Import a repository) with `pnpm build` as the build command and `npx wrangler deploy` as the deploy command. Set `SITE_URL` as a build variable there.

`public/_headers` sets security headers and long-lived caching for the hashed files in `/assets`.

## Sample photos

Photos in `public/samples` are CC0 (public domain) from Wikimedia Commons: Aurora by Johannes Groll, Glacier by Adrian Aows, Dunes by Breanna Galley, Fog by Mar Mkrtchyan, Sunset by Arnaud Mesureur, Summit by Victor Filippov.
