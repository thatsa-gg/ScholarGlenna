#!/usr/bin/bash
set -e
cd -Pe -- "$(dirname "$(dirname -- "${BASH_SOURCE[0]}")")"
docker compose -p scholar-glenna -f docker-compose.yml down
