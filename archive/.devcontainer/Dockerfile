FROM mcr.microsoft.com/devcontainers/python:1-3.12-bullseye

# Install system dependencies for cartopy and geopandas
RUN apt-get update && apt-get install -y \
    libproj-dev \
    proj-data \
    proj-bin \
    libgeos-dev \
    libspatialindex-dev \
    && rm -rf /var/lib/apt/lists/*
