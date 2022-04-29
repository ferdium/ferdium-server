#!/bin/sh

cat << "EOF"
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
EOF

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

chown -R "${PUID:-1000}":"${PGID:-1000}" "${DATA_DIR}" /app

su-exec "${PUID:-1000}":"${PGID:-1000}" node server.js
