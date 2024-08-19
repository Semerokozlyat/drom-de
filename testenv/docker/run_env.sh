#!/usr/bin/env bash

set -e
shopt -s expand_aliases

CUR_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "${CUR_SCRIPT_DIR}"

function docker_cleanup() {
  docker-compose -f docker-compose.yml down --remove-orphans
  docker-compose -f docker-compose.yml rm -sfv # remove any leftovers
}
trap docker_cleanup EXIT

docker_cleanup
docker-compose -f docker-compose.yml up --remove-orphans
