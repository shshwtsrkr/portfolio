#!/bin/bash
set -e
cd "$(dirname "$0")/.."
docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/html -d $DOMAIN -d www.$DOMAIN
