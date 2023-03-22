#!/usr/bin/bash
set -e

if [ -z "$DO_AUTH_TOKEN" ]; then
    read -s -p "DigitalOcean DNS Auth Token: " DO_AUTH_TOKEN
fi
cd -Pe -- "$(dirname -- "${BASH_SOURCE[0]}")"
docker compose -f docker-compose.yml up -d
