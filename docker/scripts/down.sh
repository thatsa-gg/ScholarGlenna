#!/usr/bin/bash
set -e
cd -Pe -- "$(dirname -- "${BASH_SOURCE[0]}")"
docker compose down
