# Plumb

Drop an image, position it behind a realistic Mac or iPhone lock screen (clock, date, notch / Dynamic Island), optionally mount it in a framed, matted print, and export at the device's native resolution. Runs entirely in the browser.

## Use

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # static output in dist/
```

- Drop, browse or paste (⌘V) an image. Choose Mac, iPhone or Both.
- Drag to move, scroll / pinch to zoom, double-click or `0` to reset, arrow keys to nudge (Shift for bigger steps), `+` / `-` to zoom.
- **Frame it** puts the image in a moulding with a paper mat on a wall colour (auto-derived from the image, or pick one).
- Your last image and settings are remembered locally (IndexedDB / localStorage). Undo / redo with ⌘Z / ⇧⌘Z.
- Exports are tagged Display P3, so colours match what Apple screens show.
- Pick a device model or enter a custom size.
- Downloads are named `<image>-mac.png` and `<image>-iphone.png`. The lock screen overlay is never part of the export.

## Notes

- Resolutions live in `src/lib/devices.ts`. Sizes were checked against Apple's spec page (MacBook Neo) and Wikipedia (iPhone 18 Pro / Pro Max). The base 18 and Air aren't listed yet.
- Preview and export share one drawing function (`src/lib/draw.ts`), so the crop matches exactly.
- Stack: Vite, React, TypeScript, Tailwind CSS v4.
