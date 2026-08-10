#!/bin/sh

set -euo pipefail

cat << "EOL"
-------------------------------------
       ______              ___
      / ____/__  _________/ (_)_  ______ ___
     / /_  / _ \/ ___/ __  / / / / / __ `__ \
    / __/ /  __/ /  / /_/ / / /_/ / / / / / /
   /_/    \___/_/   \__,_/_/\__,_/_/ /_/ /_/

      _____
     / ___/___  ______   _____  _____
     \__ \/ _ \/ ___/ | / / _ \/ ___/
    ___/ /  __/ /   | |/ /  __/ /
   /____/\___/_/    |___/\___/_/
Brought to you by ferdium.org
EOL

NODE_ENV="${NODE_ENV:-production}"

DATA_DIR="${DATA_DIR:-/data}"

APP_KEY="${APP_KEY:-}"
JWT_USE_PEM="${JWT_USE_PEM:-false}"

# Create APP key if needed
if [ ! -z "${APP_KEY}" ]; then
    echo "**** APP_KEY env var is set, using it ****"
    echo "**** App key is ${APP_KEY} ****"
else
    KEY_FILE="${DATA_DIR}/FERDIUM_APP_KEY.txt"
    if [ -f ${KEY_FILE} ]; then
        APP_KEY=$(cat ${KEY_FILE})
    else
        echo "**** Generating Ferdium-server app key for first run ****"
        APP_KEY=$(CACHE_DIR=/tmp/adonis-cache node ace generate:key)
        echo ${APP_KEY} > ${KEY_FILE}
    fi
    echo -n "**** App key is ${APP_KEY}. "
    echo "You can modify '${KEY_FILE}' to update the app key ****"
fi


# -------------------------------------
# Create JWT public/private keys if needed

# Check if JWT_USE_PEM is true
if [ "$JWT_USE_PEM" = "true" ]; then
  # Define file paths for public and private keys
  publicKeyFile="${DATA_DIR}/FERDIUM_JWT_PUBLIC_KEY.pem"
  privateKeyFile="${DATA_DIR}/FERDIUM_JWT_PRIVATE_KEY.pem"
  # Check if public and private key files exist
  if [ ! -f "$publicKeyFile" ] || [ ! -f "$privateKeyFile" ]; then
      echo "Generating public and private keys..."

      # Use Node.js to generate the keys
      node ace jwt:generate-keys $DATA_DIR
      mv ${DATA_DIR}/public.pem ${publicKeyFile}
      mv ${DATA_DIR}/private.pem ${privateKeyFile}

      echo "Public and private keys generated successfully."
  else
      echo "Using existing public and private keys."
  fi
  JWT_PUBLIC_KEY=$(cat ${publicKeyFile})
  JWT_PRIVATE_KEY=$(cat ${privateKeyFile})
  export JWT_PUBLIC_KEY
  export JWT_PRIVATE_KEY
else
    echo "JWT_USE_PEM is not set to true. Skipping JWT certificate generation."
fi
# End of JWT public/private keys
# -------------------------------------

export APP_KEY
export NODE_ENV

# Run the script to migrate from AdonisJS v4 to v5
sh /app/scripts/adonisjs-4-to-5.sh

CACHE_DIR=/tmp/adonis-cache node ace migration:run --force

node build/server.js
