#!/bin/sh
# Neue Versionsnummer an CSS und JS in index.html hängen, damit Browser nach einer
# Änderung sicher alle Dateien neu laden (GitHub Pages lässt sie sonst ~10 Minuten im Zwischenspeicher).
# Aufruf vor dem Commit:  sh tools/version.sh
cd "$(dirname "$0")/.." || exit 1
V=$(date -u +%Y%m%d%H%M)
sed -i.bak -E "s#(href=\"css/styles\.css)(\?v=[0-9]+)?\"#\1?v=$V\"#; s#(src=\"js/[a-z0-9/_-]+\.js)(\?v=[0-9]+)?\"#\1?v=$V\"#g" index.html && rm -f index.html.bak
echo "Version $V"
