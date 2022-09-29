#!/bin/sh

. "${APP_DIR}"/.env

if [ x"${HEROKU_ENV}" != "x" ]
then
  echo "/* HEROKU ENVIRONMENT: ${HEROKU_ENV} */"
  env > .env
  if [ x"${DATABASE_URL}" != "x" ] && [ x"${SKIP_HEROKU_DATABASE_URL}" = "x" ]
  then
    echo "Found DATABASE_URL env variable. Maybe there is an Heroku database. Updating vars. To skip this define a SKIP_HEROKU_DATABASE_URL in env"
    DB_ENVS=$(node ace parse:url "${DATABASE_URL}")
    if [ "$?" != "0" ]
    then
      echo "Something went wrong while updating the env file"
    else
      printf "\n$DB_ENVS\n" >> .env
      set -a
      source .env
      set +a
    fi
  fi
fi

cat << "EOL"
-------------------------------------------------
.        _____               __
.       / ___/___  _________/ (_)_  ______ ___
.      / /_  / _ \/ ___/ __  / / / / / __ `__ \
.     / __/ /  __/ /  / /_/ / / /_/ / / / / / /
.    /_/    \___/_/   \__,_/_/\__,_/_/ /_/ /_/
.       ____
.      / __/ ___  ______   _____  _____
.      \__ \/ _ \/ ___/ | / / _ \/ ___/
.     ___/ /  __/ /   | |/ /  __/ /
.    /____/\___/_/    |___/\___/_/
.
.  Brought to you by ferdium.org (and marchrius)
-------------------------------------------------
EOL

RECIPES_PATH="${CUSTOM_RECIPES_PATH}"
RECIPES_URL="${CUSTOM_RECIPES_URL}"

if [ "x${RECIPES_PATH}" = 'x' ]
then
  RECIPES_PATH="/app/recipes"
fi
echo "Recipes path '${RECIPES_PATH}' will be used"

if [ "x${RECIPES_URL}" = 'x' ]
then
  RECIPES_URL=https://github.com/ferdium/ferdium-recipes
fi
echo "Recipes url '${RECIPES_URL}' will be used"

if [ "x${RESET_RECIPES}" = 'xtrue' ]
then
  echo "** Resetting recipes at ${RECIPES_PATH}"
  rm -rf "${RECIPES_PATH}"
fi

# Update recipes from official git repository
if [ ! -d "${RECIPES_PATH}/.git" ] # When we mount an existing volume (ferdium-recipes-vol:/app/recipes) if this is only /app/recipes it is always true
then
  rm -rf "${RECIPES_PATH}"
  echo '**** Generating recipes for first run ****'
  git clone --branch main "${RECIPES_URL}" "${RECIPES_PATH}"
else
  echo '**** Updating recipes ****'
  # TODO: in docker check another way to do this
  #chown -R root /app/recipes # Fixes ownership problem when doing git pull -r
  CURR_PWD="$(pwd)"
  cd "${RECIPES_PATH}"
  git stash -u
  git pull -r
  git stash pop
  cd "${CURR_PWD}"
fi

CURR_PWD="$(pwd)"
cd "${RECIPES_PATH}"
git config --global --add safe.directory "${RECIPES_PATH}"
EXPECTED_PNPM_VERSION=$(node -p 'require("./package.json").engines.pnpm')
npm i -gf pnpm@$EXPECTED_PNPM_VERSION
pnpm i
pnpm package
cd "${CURR_PWD}"

mkdir -p "${DATA_DIR}"

print_app_key_message() {
  printf '**** App key is %s. You can modify `%s` to update the app key ****\n' "${1}" "${2}"
}

if [ "x${HEROKU_ENV}" = "x" ]
then
  key_file="${DATA_DIR}/FERDIUM_APP_KEY.txt"

  # Create APP key if needed
  if [ -z ${APP_KEY} ] && [ ! -f ${key_file} ] && [ "x${NODE_ENV}" != 'xproduction' ]
  then
    echo '**** Generating Ferdium-server app key for first run ****'
    adonis key:generate
    APP_KEY=$(grep APP_KEY .env | cut -d '=' -f2)
    echo ${APP_KEY} > ${key_file}
    print_app_key_message "${APP_KEY}" "${key_file}"
  elif [ -z ${APP_KEY} ] && [ -f ${key_file} ]
  then
    APP_KEY=$(cat ${key_file})
    print_app_key_message "${APP_KEY}" "${key_file}"
  fi

  export APP_KEY="${APP_KEY}"
elif [ "x${NODE_ENV}" = 'xproduction' ]
then
  print_app_key_message "${APP_KEY}" "Config on your provider"
fi

node ace migration:run --force

# TODO: why do this in docker container?
#chown -R "${PUID:-1000}":"${PGID:-1000}" "${DATA_DIR}" /app # This is the cause of the problem on line 29/32

# TODO: why do this in docker container?
#su-exec "${PUID:-1000}":"${PGID:-1000}" node server.js

node server.js
