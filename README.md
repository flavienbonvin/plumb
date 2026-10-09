# Plumb

Drop an image, see it behind the clock on a Mac or iPhone lock screen, frame it, give it a film look, and export it at the screen's native resolution. Everything runs in your browser; nothing is uploaded.

## How it works

Pick Mac or iPhone, add an image, then go through three steps. You can jump to any step at any time.

1. **Place**: choose the model, zoom and move the image, optionally frame it.
2. **Style**: pick a film look, set grain, vignette and the clock shade. You can download from here.
3. **Export**: check the summary, choose PNG or JPEG, download or share. **Also create for Mac / iPhone** starts the other device from the same look, frame and position, in one undo step.

Each device keeps its own settings, so switching back restores them.

## Features

- **Previews** for each device: lock screen, Mac desktop (menu bar and Dock) or iPhone home screen, or the plain wallpaper. Models: MacBook Neo, Air 13″ and 15″, Pro 14″ and 16″, 4K and 5K displays, and iPhones from the 15 to the 18 Pro Max (including the Air, 16e and 17e), plus custom sizes.
- **Position**: drag, scroll or pinch to zoom, arrow keys to nudge. The image snaps to the centre lines.
- **Frame it**: a moulding and a paper mat, with your choice of colours and thickness.
- **Looks**: film looks inspired by Fujifilm simulations (Provia, Velvia, Astia, Classic Chrome, Classic Neg., Eterna, Acros), with grain and vignette. A new look cross-fades in.
- **Clock check**: warns when white lock screen text will be hard to read and can add a soft shade behind it.
- **Export**: PNG or JPEG in Display P3, named `plumb-mac` and `plumb-iphone`. Share through the system share sheet (AirDrop, Save to Photos) where the browser supports it.
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
| `src/lib/state.ts` | Per-device settings, and reading saved data (including the older format) |
| `src/lib/carry.ts` | Copies look, frame and position from one device to the other |
| `src/components/Wizard.tsx` | The stage and the Place, Style and Export panels |
| `src/components/screens/` | Menu bar, status bar and placeholder icons |
| `src/components/*Overlay.tsx` | Lock screen, desktop and home screen overlays |

Device sizes were checked against Apple's spec pages, Wikipedia and ios-resolution.com. The Dynamic Island on the iPhone 18 Pro and Pro Max (about 81 × 37 pt) comes from reported figures, not an Apple specification.

## Deploy (Cloudflare)

The site is static and is served by Cloudflare Workers static assets (`wrangler.jsonc`, output in `dist/`).

```sh
pnpm exec wrangler login   # once
SITE_URL=https://your-domain pnpm deploy
```

`SITE_URL` is set in `.env.production` (currently `https://plumb.flavienbonvin.com`), so every build picks it up. It makes the social preview image URL absolute, which link scrapers need. Without it the page works, but shared links may not show the preview.

Or connect the GitHub repo in the Cloudflare dashboard (Workers & Pages, then Create, then Import a repository) with `pnpm build` as the build command and `npx wrangler deploy` as the deploy command. Set `SITE_URL` as a build variable there.

`public/_headers` sets security headers and long-lived caching for the hashed files in `/assets`.

## Sample photos

Photos in `public/samples` are CC0 (public domain) from Wikimedia Commons: Dunes by Breanna Galley, Fog by Mar Mkrtchyan, Ridges by Simon Berger, Golden hour by Johannes Plenio, Lake by Ales Krivec, Snow by Bonnie Moreland.
