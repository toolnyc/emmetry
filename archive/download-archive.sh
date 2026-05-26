#!/bin/bash
# Download emmetry.org from the Internet Archive Wayback Machine
# Run this script when web.archive.org is back online.
#
# Known snapshots:
#   - 20180329100238 (March 29, 2018)
#   - 20191207040125 (December 7, 2019)

set -e

DEST="$(dirname "$0")/archive-raw"
mkdir -p "$DEST"

echo "=== Checking if web.archive.org is reachable... ==="
if ! curl -s --max-time 10 "https://web.archive.org" -o /dev/null; then
  echo "ERROR: web.archive.org is still unreachable. Try again later."
  exit 1
fi
echo "Server is up! Starting download..."

# Step 1: Get full list of archived URLs via CDX API
echo ""
echo "=== Fetching URL index from CDX API... ==="
curl -s --max-time 120 \
  "https://web.archive.org/cdx/search/cdx?url=emmetry.org/*&output=json&fl=timestamp,original,mimetype,statuscode&filter=statuscode:200&collapse=urlkey" \
  -o "$DEST/cdx-index.json"

echo "CDX index saved to $DEST/cdx-index.json"
echo "URLs found: $(wc -l < "$DEST/cdx-index.json")"

# Step 2: Download the homepage from both known snapshots
echo ""
echo "=== Downloading homepage snapshots... ==="
for ts in 20180329100238 20191207040125; do
  echo "  Downloading snapshot $ts..."
  curl -s --max-time 60 -L \
    "https://web.archive.org/web/${ts}id_/http://emmetry.org/" \
    -o "$DEST/index-${ts}.html"
  echo "  Saved: $DEST/index-${ts}.html ($(wc -c < "$DEST/index-${ts}.html") bytes)"
done

# Step 3: Use wget to mirror the most recent snapshot
echo ""
echo "=== Mirroring full site from latest snapshot (2019)... ==="
MIRROR_DIR="$DEST/mirror-2019"
mkdir -p "$MIRROR_DIR"

wget --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-parent \
  --timeout=60 \
  --tries=3 \
  --wait=1 \
  --directory-prefix="$MIRROR_DIR" \
  "https://web.archive.org/web/20191207040125/http://emmetry.org/" \
  2>&1 | tee "$DEST/wget-mirror.log"

echo ""
echo "=== Done! ==="
echo "Files saved to: $DEST/"
echo "Mirror saved to: $MIRROR_DIR/"
echo ""
echo "Next steps:"
echo "  1. Review the downloaded HTML files"
echo "  2. Extract text content and structure"
echo "  3. Rebuild the site"
