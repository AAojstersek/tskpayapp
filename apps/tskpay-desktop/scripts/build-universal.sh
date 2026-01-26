#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building universal binary for macOS...${NC}"

# Ensure we're in the correct directory (apps/tskpay-desktop)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${APP_DIR}"

# Get the app name from tauri.conf.json
APP_NAME="tskpay"
BINARY_NAME="${APP_NAME}-desktop"
BUILD_DIR="src-tauri/target"
INTEL_TARGET="x86_64-apple-darwin"
ARM64_TARGET="aarch64-apple-darwin"

# Build frontend first
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Build for Intel
echo -e "${YELLOW}Building for Intel (x86_64)...${NC}"
if ! npx tauri build --target ${INTEL_TARGET} --bundles app; then
  echo -e "${RED}Error: Failed to build for Intel architecture${NC}"
  echo -e "${YELLOW}Make sure you have the Intel target installed: rustup target add x86_64-apple-darwin${NC}"
  exit 1
fi

INTEL_APP="${BUILD_DIR}/${INTEL_TARGET}/release/bundle/macos/${APP_NAME}.app"
INTEL_BINARY_RELEASE="${BUILD_DIR}/${INTEL_TARGET}/release/${BINARY_NAME}"
INTEL_BINARY_APP="${INTEL_APP}/Contents/MacOS/${APP_NAME}"
INTEL_BINARY_APP_ALT="${INTEL_APP}/Contents/MacOS/${BINARY_NAME}"

# Find Intel binary - try multiple locations
INTEL_BINARY=""
if [ -f "${INTEL_BINARY_RELEASE}" ]; then
  INTEL_BINARY="${INTEL_BINARY_RELEASE}"
elif [ -f "${INTEL_BINARY_APP}" ]; then
  INTEL_BINARY="${INTEL_BINARY_APP}"
elif [ -f "${INTEL_BINARY_APP_ALT}" ]; then
  INTEL_BINARY="${INTEL_BINARY_APP_ALT}"
else
  echo -e "${RED}Error: Intel binary not found. Tried:${NC}"
  echo -e "  ${INTEL_BINARY_RELEASE}"
  echo -e "  ${INTEL_BINARY_APP}"
  echo -e "  ${INTEL_BINARY_APP_ALT}"
  exit 1
fi
echo -e "${GREEN}Found Intel binary at: ${INTEL_BINARY}${NC}"

# Build for Apple Silicon
echo -e "${YELLOW}Building for Apple Silicon (arm64)...${NC}"
if ! npx tauri build --target ${ARM64_TARGET} --bundles app; then
  echo -e "${RED}Error: Failed to build for Apple Silicon architecture${NC}"
  echo -e "${YELLOW}Make sure you have the ARM64 target installed: rustup target add aarch64-apple-darwin${NC}"
  exit 1
fi

ARM64_APP="${BUILD_DIR}/${ARM64_TARGET}/release/bundle/macos/${APP_NAME}.app"
ARM64_BINARY_RELEASE="${BUILD_DIR}/${ARM64_TARGET}/release/${BINARY_NAME}"
ARM64_BINARY_APP="${ARM64_APP}/Contents/MacOS/${APP_NAME}"
ARM64_BINARY_APP_ALT="${ARM64_APP}/Contents/MacOS/${BINARY_NAME}"

# Find ARM64 binary - try multiple locations
ARM64_BINARY=""
if [ -f "${ARM64_BINARY_RELEASE}" ]; then
  ARM64_BINARY="${ARM64_BINARY_RELEASE}"
elif [ -f "${ARM64_BINARY_APP}" ]; then
  ARM64_BINARY="${ARM64_BINARY_APP}"
elif [ -f "${ARM64_BINARY_APP_ALT}" ]; then
  ARM64_BINARY="${ARM64_BINARY_APP_ALT}"
else
  echo -e "${RED}Error: ARM64 binary not found. Tried:${NC}"
  echo -e "  ${ARM64_BINARY_RELEASE}"
  echo -e "  ${ARM64_BINARY_APP}"
  echo -e "  ${ARM64_BINARY_APP_ALT}"
  exit 1
fi
echo -e "${GREEN}Found ARM64 binary at: ${ARM64_BINARY}${NC}"

# Create universal app directory in release location (where Tauri expects it for DMG)
UNIVERSAL_DIR="${BUILD_DIR}/release/bundle/macos"
mkdir -p "${UNIVERSAL_DIR}"

# Copy one of the apps as base (we'll use ARM64 as base)
echo -e "${YELLOW}Creating universal app bundle...${NC}"
cp -R "${ARM64_APP}" "${UNIVERSAL_DIR}/"

UNIVERSAL_APP="${UNIVERSAL_DIR}/${APP_NAME}.app"
UNIVERSAL_BINARY_DIR="${UNIVERSAL_APP}/Contents/MacOS"
mkdir -p "${UNIVERSAL_BINARY_DIR}"

# Use the binary name - try app name first, then binary name
if [ -f "${ARM64_APP}/Contents/MacOS/${APP_NAME}" ]; then
  UNIVERSAL_BINARY="${UNIVERSAL_BINARY_DIR}/${APP_NAME}"
else
  UNIVERSAL_BINARY="${UNIVERSAL_BINARY_DIR}/${BINARY_NAME}"
fi

# Create universal binary using lipo
echo -e "${YELLOW}Merging binaries with lipo...${NC}"
if ! lipo -create -output "${UNIVERSAL_BINARY}" "${INTEL_BINARY}" "${ARM64_BINARY}"; then
  echo -e "${RED}Error: Failed to merge binaries with lipo${NC}"
  exit 1
fi

# If binary was from release dir, we need to ensure it's executable
chmod +x "${UNIVERSAL_BINARY}"

# Verify the universal binary
echo -e "${YELLOW}Verifying universal binary...${NC}"
lipo -info "${UNIVERSAL_BINARY}"

# Build DMG with universal binary
echo -e "${YELLOW}Building DMG with universal binary...${NC}"
cd src-tauri
npx tauri build --bundles dmg
cd ..

echo -e "${GREEN}Universal binary build complete!${NC}"
echo -e "${GREEN}DMG location: ${BUILD_DIR}/release/bundle/dmg/${NC}"
echo -e "${GREEN}Universal app location: ${UNIVERSAL_APP}${NC}"
