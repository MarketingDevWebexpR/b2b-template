#!/bin/bash

# Script pour generer les assets PNG a partir des fichiers SVG
# Necessite: brew install librsvg (pour rsvg-convert) ou utiliser un outil en ligne

ASSETS_DIR="$(dirname "$0")/../assets/images"

echo "=== Generation des assets pour Maison Bijoux ==="
echo ""

# Verifier si rsvg-convert est installe
if command -v rsvg-convert &> /dev/null; then
    echo "Utilisation de rsvg-convert pour la conversion..."

    # Icon (1024x1024)
    rsvg-convert -w 1024 -h 1024 "$ASSETS_DIR/icon.svg" -o "$ASSETS_DIR/icon.png"
    echo "- icon.png (1024x1024) genere"

    # Splash (1284x2778 pour iPhone 14 Pro Max)
    rsvg-convert -w 1284 -h 2778 "$ASSETS_DIR/splash.svg" -o "$ASSETS_DIR/splash.png"
    echo "- splash.png (1284x2778) genere"

    # Adaptive icon (1024x1024)
    rsvg-convert -w 1024 -h 1024 "$ASSETS_DIR/adaptive-icon.svg" -o "$ASSETS_DIR/adaptive-icon.png"
    echo "- adaptive-icon.png (1024x1024) genere"

    # Favicon (48x48)
    rsvg-convert -w 48 -h 48 "$ASSETS_DIR/favicon.svg" -o "$ASSETS_DIR/favicon.png"
    echo "- favicon.png (48x48) genere"

    echo ""
    echo "=== Assets generes avec succes! ==="
else
    echo "rsvg-convert n'est pas installe."
    echo ""
    echo "Options pour generer les PNG:"
    echo ""
    echo "1. Installer librsvg (recommande):"
    echo "   brew install librsvg"
    echo "   Puis relancez ce script"
    echo ""
    echo "2. Utiliser un outil en ligne comme:"
    echo "   - https://svgtopng.com"
    echo "   - https://cloudconvert.com/svg-to-png"
    echo ""
    echo "Tailles requises:"
    echo "   - icon.png: 1024x1024 pixels"
    echo "   - splash.png: 1284x2778 pixels"
    echo "   - adaptive-icon.png: 1024x1024 pixels"
    echo "   - favicon.png: 48x48 pixels"
    echo ""
    echo "3. Utiliser Figma ou Adobe Illustrator pour exporter"
fi
