# tskpay Desktop

macOS desktop application for tskpay built with Tauri.

## Development

### Prerequisites

- Node.js (v18 or later)
- Rust (latest stable) - Install from https://rustup.rs/
- macOS 10.13 or later

### Setup

1. Navigate to the app directory:
```bash
cd apps/tskpay-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri:dev
```

This will:
- Automatically start the Vite dev server on port 1420
- Build and launch the Tauri app
- Enable hot reload for UI changes

**Note:** The first run may take a few minutes as Rust dependencies are compiled.

### Building

Build the app for production:
```bash
npm run tauri:build
```

The built app will be in `src-tauri/target/release/bundle/`.

**Note:** For production builds, you'll need to add app icons to `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows - optional for macOS-only)

## Project Structure

- `src/` - React frontend (reused from web app)
- `src-tauri/` - Rust backend (Tauri)
  - `src/main.rs` - Rust entry point
  - `Cargo.toml` - Rust dependencies
  - `tauri.conf.json` - Tauri configuration
- `dist/` - Built frontend assets (generated)

## Notes

- The app uses `HashRouter` instead of `BrowserRouter` for Tauri compatibility
- All data will be stored locally using SQLite (to be implemented in Step 3)
- No cloud services or remote databases
- The app runs completely offline

## Troubleshooting

If `npm run tauri:dev` fails:
1. Ensure Rust is installed: `rustc --version`
2. Ensure Node.js is v18+: `node --version`
3. Try cleaning and reinstalling: `rm -rf node_modules && npm install`
4. For Rust issues: `cd src-tauri && cargo clean && cd ..`
