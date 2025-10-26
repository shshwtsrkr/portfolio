#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR"/.. && pwd)"
ENV_FILE="$ROOT_DIR/.env.defaults"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cat <<EOF2 > "$BACKEND_DIR/.env.dev"
# Database Configuration
DB_HOST=$DEV_DB_HOST
DB_PORT=$DEV_DB_PORT
DB_NAME=$DEV_DB_NAME
DB_USERNAME=$DEV_DB_USERNAME
DB_PASSWORD=$DEV_DB_PASSWORD

# File Upload Configuration
FILE_UPLOAD_DIR=uploads
FILE_UPLOAD_BASE_URL=http://localhost:8080

# Server Configuration
SERVER_PORT=8080

# CORS Configuration
CORS_ALLOWED_ORIGINS=$DEV_CORS
EOF2

cat <<EOF3 > "$BACKEND_DIR/.env.production"
# Database Configuration
DB_HOST=$PROD_DB_HOST
DB_PORT=$PROD_DB_PORT
DB_NAME=$PROD_DB_NAME
DB_USERNAME=$PROD_DB_USERNAME
DB_PASSWORD=$PROD_DB_PASSWORD

# File Upload Configuration
FILE_UPLOAD_DIR=uploads
FILE_UPLOAD_BASE_URL=$PROD_FILE_UPLOAD_BASE_URL

# Server Configuration
SERVER_PORT=8080

# CORS Configuration
CORS_ALLOWED_ORIGINS=$PROD_CORS
EOF3

cat <<EOF4 > "$FRONTEND_DIR/.env.development"
# Backend API URL
VITE_BACKEND_URL=$DEV_FRONTEND_URL
EOF4

cat <<EOF5 > "$FRONTEND_DIR/.env.production"
# Backend API URL
VITE_BACKEND_URL=$PROD_FRONTEND_URL
EOF5

echo "Environment templates generated."
