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

#### Building DMG for macOS Distribution

To build a DMG file for macOS distribution:

**From the root directory:**
```bash
npm run desktop:build:dmg
```

**Or from the app directory:**
```bash
cd apps/tskpay-desktop
npm run build:dmg
```

The DMG file will be generated in `apps/tskpay-desktop/src-tauri/target/release/bundle/dmg/` with the name `tskpay_0.1.0_x64.dmg` (or similar, depending on your architecture).

#### Building DMG for Intel MacBooks only

To build a DMG for older Intel MacBooks (x86_64):

**From the root directory:**
```bash
npm run desktop:build:dmg:intel
```

**Or from the app directory:**
```bash
cd apps/tskpay-desktop
npm run build:dmg:intel
```

Requirement: `rustup target add x86_64-apple-darwin` (once).

The DMG will be in `src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/`.

#### Building Universal Binary (Intel + Apple Silicon)

To build a universal binary that works on both Intel and Apple Silicon MacBooks:

**From the root directory:**
```bash
npm run desktop:build:universal
```

**Or from the app directory:**
```bash
cd apps/tskpay-desktop
npm run build:universal
```

This will:
1. Build the frontend
2. Build for Intel (x86_64-apple-darwin)
3. Build for Apple Silicon (aarch64-apple-darwin)
4. Merge both binaries using `lipo` into a universal binary
5. Generate a DMG with the universal binary

The universal DMG will be in `apps/tskpay-desktop/src-tauri/target/release/bundle/dmg/` and will work on both Intel and Apple Silicon MacBooks.

**Prerequisites for universal build:**
- Rust toolchain for both architectures:
  ```bash
  rustup target add x86_64-apple-darwin
  rustup target add aarch64-apple-darwin
  ```
- macOS with Xcode Command Line Tools (for `lipo`)

**Note:** 
- DMG can only be built on macOS
- Universal build takes longer as it compiles for both architectures
- The first build may take several minutes as Rust dependencies are compiled
- For production builds, you'll need to add app icons to `src-tauri/icons/`:
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

### Build fails with "failed to read plugin permissions"

If the build fails with `failed to read plugin permissions: failed to read file '.../app_hide.toml': No such file or directory`, the project path likely **contains a space** (e.g. `tskpay app`). Use a path without spaces (same fix as below for DMG).

### DMG build fails with "failed to run bundle_dmg.sh"

If the Intel (or default) DMG build fails with `failed to run .../bundle_dmg.sh` while the app compiles and bundles successfully, the project path likely **contains a space** (e.g. `tskpay app`). Tauri’s DMG script does not handle paths with spaces.

**Fix:** Use a path without spaces.

1. Close the IDE and any terminals in this project.
2. In a terminal:
   ```bash
   cd /Users/ao/Documents/code
   mv "tskpay app" tskpay-app
   ```
3. Open the project from the new path: `/Users/ao/Documents/code/tskpay-app`.
4. Run the build again: `npm run desktop:build:dmg:intel` (from repo root).

To keep the original folder and only build from a path without spaces:
```bash
cd /Users/ao/Documents/code
ln -s "tskpay app" tskpay-app
cd tskpay-app && npm install && npm run desktop:build:dmg:intel
```
If it still fails, use the `mv` approach above.
