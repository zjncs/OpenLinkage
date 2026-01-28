#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-ipa}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild not found. Install Xcode and Command Line Tools first." >&2
  exit 1
fi

PROJECT_PATH="ios/App/App.xcodeproj"
SCHEME="App"
CONFIGURATION="${IOS_CONFIGURATION:-Release}"

BUILD_DIR="ios/build"
ARCHIVE_PATH="$BUILD_DIR/App.xcarchive"
EXPORT_DIR="$BUILD_DIR/ipa"
EXPORT_OPTIONS_PLIST="$BUILD_DIR/ExportOptions.plist"

mkdir -p "$BUILD_DIR"

npm run build
npx cap sync ios

echo "Archiving iOS app..."
xcodebuild \
  -project "$PROJECT_PATH" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates \
  archive

if [[ "$MODE" == "archive-only" ]]; then
  echo "Archive created: $ARCHIVE_PATH"
  exit 0
fi

METHOD="${IOS_EXPORT_METHOD:-development}"

cat >"$EXPORT_OPTIONS_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>${METHOD}</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>compileBitcode</key>
  <false/>
  <key>stripSwiftSymbols</key>
  <true/>
</dict>
</plist>
EOF

rm -rf "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR"

echo "Exporting IPA (method=$METHOD)..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
  -allowProvisioningUpdates

IPA_PATH="$(find "$EXPORT_DIR" -maxdepth 1 -name '*.ipa' -print -quit || true)"
if [[ -z "$IPA_PATH" ]]; then
  echo "Export finished, but no .ipa found under: $EXPORT_DIR" >&2
  exit 2
fi

echo "IPA created: $IPA_PATH"
