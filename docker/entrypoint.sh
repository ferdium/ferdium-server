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
  adonis key:generate
  APP_KEY=$(grep APP_KEY .env | cut -d '=' -f2)
  echo ${APP_KEY} > ${key_file}
  print_app_key_message ${APP_KEY}
else
  APP_KEY=$(cat ${key_file})
  print_app_key_message ${APP_KEY}
fi

export APP_KEY

node ace migration:run --force

chown -R "${PUID:-1000}":"${PGID:-1000}" "${DATA_DIR}" /app # This is the cause of the problem on line 29/32

su-exec "${PUID:-1000}":"${PGID:-1000}" node server.js
