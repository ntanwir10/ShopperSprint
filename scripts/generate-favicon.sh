#!/bin/bash

# Generate favicon.ico from SVG
# This script provides multiple methods to create favicon.ico

echo "🎨 Generating favicon.ico for ShopperSprint..."

FRONTEND_DIR="/Users/ntanwir/Developer/shoppersprint/frontend/public"
SVG_FILE="$FRONTEND_DIR/favicon.svg"
ICO_FILE="$FRONTEND_DIR/favicon.ico"

# Method 1: Try with ImageMagick (if available)
if command -v convert &> /dev/null; then
    echo "✅ Using ImageMagick to convert SVG to ICO..."
    convert "$SVG_FILE" -resize 16x16 -resize 32x32 -resize 48x48 "$ICO_FILE"
    echo "✅ favicon.ico generated successfully!"
    exit 0
fi

# Method 2: Try with rsvg-convert and ImageMagick
if command -v rsvg-convert &> /dev/null && command -v convert &> /dev/null; then
    echo "✅ Using rsvg-convert + ImageMagick..."
    rsvg-convert -w 32 -h 32 "$SVG_FILE" > /tmp/favicon-32.png
    convert /tmp/favicon-32.png "$ICO_FILE"
    rm /tmp/favicon-32.png
    echo "✅ favicon.ico generated successfully!"
    exit 0
fi

# Method 3: Online conversion instructions
echo "❌ ImageMagick not found. Please use one of these methods:"
echo ""
echo "🌐 Online Conversion (Recommended):"
echo "   1. Go to https://favicon.io/favicon-converter/"
echo "   2. Upload: $SVG_FILE"
echo "   3. Download the generated favicon.ico"
echo "   4. Replace: $ICO_FILE"
echo ""
echo "📦 Install ImageMagick:"
echo "   macOS: brew install imagemagick"
echo "   Ubuntu: sudo apt-get install imagemagick"
echo ""
echo "🔧 Manual Creation:"
echo "   1. Open $SVG_FILE in any graphics editor"
echo "   2. Export as 32x32 PNG"
echo "   3. Convert PNG to ICO using online tools"
echo ""
echo "📝 Note: The SVG favicon will work in modern browsers even without ICO"
