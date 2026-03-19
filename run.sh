#!/usr/bin/env bash
# RootAI startup script for macOS / Linux
# Usage: bash run.sh   (or  chmod +x run.sh && ./run.sh)

set -e

# Check Python 3 is available
if ! command -v python3 &>/dev/null; then
    echo "❌  python3 not found."
    echo "    Install Python 3.10+ from https://www.python.org/downloads/"
    exit 1
fi

python3 run.py
