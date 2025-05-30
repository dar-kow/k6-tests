#!/bin/bash
#
# Remove all single‐line (//…) and block (/*…*/ ) comments
# from .js and .sh files under this directory, in place.
# Backups are saved with a .bak extension.

find . -type f \( -name '*.js' -o -name '*.sh' \) | while read -r file; do
  # delete single‐line comments
  sed -E -i.bak '/^\s*\/\//d' "$file"
  # delete block comments (may span multiple lines)
  sed -E -i.bak '/\/\*/{:a;N;/\*\//!ba;d}' "$file"
done
