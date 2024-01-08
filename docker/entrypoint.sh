#!/bin/sh

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

# Update recipes from official git repository

# We need to set NODE_ENV to development to install devDependencies
SAVE_NODE_ENV=$NODE_ENV
NODE_ENV=development

if [ ! -d "/app/recipes/.git" ]; # When we mount an existing volume (ferdium-recipes-vol:/app/recipes) if this is only /app/recipes it is always true
then
    echo '**** Generating recipes for first run ****'
    git clone --branch main https://github.com/ferdium/ferdium-recipes recipes
else
    echo '**** Updating recipes ****'
    chown -R root /app/recipes # Fixes ownership problem when doing git pull -r
    cd recipes
    git stash -u
    git pull -r
    git stash pop
    cd ..
fi

cd recipes
git config --global --add safe.directory /app/recipes
EXPECTED_PNPM_VERSION=$(node -p 'require("./package.json").engines.pnpm')
npm i -gf pnpm@$EXPECTED_PNPM_VERSION
pnpm i
pnpm package
cd ..

# Restore NODE_ENV
NODE_ENV=$SAVE_NODE_ENV

key_file="${DATA_DIR}/FERDIUM_APP_KEY.txt"

print_app_key_message() {
    app_key=$1
    printf '**** App key is %s. ' ${app_key}
    printf 'You can modify `%s` to update the app key ****\n' ${key_file}
}

# Create APP key if needed
if [ -z ${APP_KEY} ] && [ ! -f ${key_file} ]
then
    echo '**** Generating Ferdium-server app key for first run ****'
    adonis key:generate --force
    APP_KEY=$(grep APP_KEY .env | cut -d '=' -f2)
    echo ${APP_KEY} > ${key_file}
    print_app_key_message ${APP_KEY}
else
    APP_KEY=$(cat ${key_file})
    print_app_key_message ${APP_KEY}
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

# Enable the errexit option
set -e

# Run the script to migrate from AdonisJS v4 to v5
sh /app/scripts/adonisjs-4-to-5.sh

# Disable the errexit option
set +e

node ace migration:run --force

node build/server.js
