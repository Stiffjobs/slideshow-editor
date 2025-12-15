# slideshow-gen

A lightweight **slideshow / cover-image editor** built with **React + Konva**. It lets you compose a 1080×1920 (9:16) canvas with an optional background image and draggable/resizable text layers, then export the result.

## Features

- **Canvas editor**: 1080×1920 stage (`CANVAS_WIDTH`, `CANVAS_HEIGHT`)
- **Background image**: cover-fit rendering
- **Text layers**:
  - drag to position
  - resize via transformer handles
  - double-click to edit text
  - presets (plain / outlined / badge styles)
  - fit-to-canvas wrapping + left/center/right alignment within the text box
- **Figma-like center guides**: while dragging text, guides appear and snap when the element is centered horizontally/vertically
- **Export**: PNG or JPEG
- **Local persistence**: project doc saved to localStorage + background image stored in IndexedDB

## Tech stack

- **Runtime/Tooling**: Bun, Vite
- **UI**: React, Tailwind CSS, shadcn/ui
- **Canvas**: Konva + react-konva
- **Routing**: TanStack Router (file-based routes in `src/routes`)
- **State**: Zustand
- **Storage**: `idb` (IndexedDB) + localStorage

## Getting started

```bash
bun install
bun run dev
```

Open the app at `http://localhost:3000`.

## How to use

- **Add text**: click “Add text”, then drag on the canvas
- **Edit text**: double-click the text element
- **Resize/rotate**: select the text element and use the transformer handles
- **Alignment**:
  - enable “Fit to canvas width” to wrap text and use left/center/right alignment
  - while dragging, watch for **center guides** to snap to canvas center
- **Export**: use “Export PNG” or “Export JPG”

## Scripts

```bash
bun run dev
bun run build
bun run preview
bun run test
```

## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/):

```bash
pnpm dlx shadcn@latest add button
```

## Project structure (high-level)

- `src/pages/EditorPage.tsx`: main editor UI (controls + stage)
- `src/canvas/EditorStage.tsx`: Konva stage and layers
- `src/canvas/TextLayer.tsx`: text element rendering + interactions
- `src/canvas/CanvasGuides.tsx`: center-alignment guides overlay
- `src/state/useEditorStore.ts`: editor state/actions
- `src/storage/projectStorage.ts`: localStorage + IndexedDB persistence

## Deployment

This repo includes Wrangler configs. To deploy:

```bash
bun run deploy
```

## Notes / troubleshooting

- **Why doesn’t “align” do anything?** Alignment affects layout when the text has a width (fit-to-canvas wrapping). For free-positioned text, use drag + center guides.
- **Reset project**: use the “Reset project” button in the UI (clears state and background image).
