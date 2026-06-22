#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies for backend..."
pip install -r apps/api/requirements.txt
