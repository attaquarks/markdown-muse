# Markdown Muse

A sleek, installable desktop-style PWA for reading and editing your markdown files with a beautiful, interactive interface. Built for context engineers, prompt engineers, and anyone drowning in `.md` files across their agent stacks.

> Open a folder. Read. Edit. Save. Never touch an IDE again.

## Features

- **Open a whole folder** of `.md` files — get a live file tree sidebar with folders, expand/collapse, rename, new-file, and delete actions
- **Drag & drop** individual `.md` files from anywhere on your OS
- **Three editor modes** per tab — Split (raw + preview side by side), Editor only, or Preview only
- **Save straight back to disk** with `⌘/Ctrl+S`. Dirty-dot indicator on unsaved tabs
- **Multiple tabs** so you can flip between agents fast
- **CodeMirror 6** editor with markdown syntax highlighting
- **GFM preview** — tables, task lists, syntax-highlighted code blocks via `react-markdown` + `remark-gfm` + `rehype-highlight`
- **Installable as a desktop app** (PWA). On Chromium, it registers as a file handler for `.md` / `.markdown` so double-clicking a markdown file opens Muse
- **Dark theme**, lime accent, monospace editor — gen-z clean, focused
- **100% local** — files never leave your machine. No uploads, no accounts

## Tech Stack

- [TanStack Start](https://tanstack.com/start) (React 19, Vite 7)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [CodeMirror 6](https://codemirror.net) via `@uiw/react-codemirror`
- [react-markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm` + `rehype-highlight`
- [Zustand](https://zustand-demo.pmnd.rs) for tab / editor state
- [idb-keyval](https://github.com/jakearchibald/idb-keyval) to persist the last opened directory handle
- **File System Access API** (`showDirectoryPicker`, `showOpenFilePicker`, drag-drop `getAsFileSystemHandle`) for real read/write to disk

## Browser Support

The File System Access API is **Chromium-only** (Chrome, Edge, Arc, Brave, Opera). On Safari / Firefox the app falls back to file-input open and download-to-save. For the full desktop experience, install it as a PWA from a Chromium browser.

## Getting Started

```bash
bun install
bun run dev
```

Then open [http://localhost:8080](http://localhost:8080). Click **Install Muse** from your browser menu to add it to your dock/home screen.

## Build

```bash
bun run build
```

## License

MIT
