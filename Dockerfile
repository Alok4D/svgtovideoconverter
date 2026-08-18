FROM node:20-bullseye-slim

# Install system dependencies for Chromium, FFmpeg and Fonts
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    fonts-liberation \
    fonts-noto-color-emoji \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxss1 \
    libxtst6 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer / Remotion
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set up pnpm
RUN npm install -g pnpm

WORKDIR /app

# Create user with UID 1000 (standard for Hugging Face Spaces)
RUN useradd -m -u 1000 user
RUN mkdir -p /app/uploads && chown -R user:user /app

# Switch to the non-root user
USER user

# Copy package files first for caching
COPY --chown=user:user package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy all source files
COPY --chown=user:user . .

# Build Next.js application
RUN pnpm run build

# Expose port 7860 (Hugging Face Spaces default)
ENV PORT=7860
EXPOSE 7860

# Start server
CMD ["pnpm", "run", "prod"]
