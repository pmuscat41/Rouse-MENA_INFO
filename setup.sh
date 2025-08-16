#!/bin/bash

# Exit on error
set -e

echo "Setting up MENA Mapping environment..."

# Create virtual environment with system site packages
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv --system-site-packages
fi

# Activate virtual environment
source .venv/bin/activate

# Install pip in the virtual environment using get-pip.py
echo "Installing pip in virtual environment..."
curl -sS https://bootstrap.pypa.io/get-pip.py | python3

# Upgrade pip
echo "Upgrading pip..."
python3 -m pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
python3 -m pip install -r requirements.txt

# Install and register Jupyter kernel
echo "Setting up Jupyter kernel..."
python3 -m ipykernel install --user --name=mena-mapping --display-name="MENA Mapping (Python 3)"

echo "Setup complete! Virtual environment '.venv' is ready."
echo "To activate: source .venv/bin/activate"