#!/usr/bin/env bash
# This wrapper executes uvicorn via python3 -m uvicorn and handles directory routing

# If we are in the repository root (where apps/api exists), change directory to it
if [ -d "apps/api" ]; then
  echo "uvicorn-wrapper: Changing directory to apps/api..."
  cd apps/api
fi

# Add common local paths just in case
export PATH="$HOME/.local/bin:$PATH"

echo "uvicorn-wrapper: Running python3 -m uvicorn $@"
exec python3 -m uvicorn "$@"
