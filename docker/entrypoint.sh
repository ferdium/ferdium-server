#!/bin/sh

cat << EOL
-------------------------------------
          ____           ___
         / __/__ _______/ (_)
        / _// -_) __/ _  / /
      _/_/  \__/_/  \_,_/_/
     / __/__ _____  _____ ____
    _\ \/ -_) __/ |/ / -_) __/
   /___/\__/_/  |___/\__/_/
Brought to you by getferdi.com
Support our Open Collective at:
https://opencollective.com/getferdi/
EOL

key_file="${DATA_DIR}/FERDI_APP_KEY.txt"

print_app_key_message() {
  app_key=$1
  printf '**** App key is %s. ' ${app_key}
  printf 'You can modify `%s` to update the app key ****\n' ${key_file}
}

# Create APP key if needed
if [ -z ${APP_KEY} ] && [ ! -f ${key_file} ]
then
  echo '**** Generating Ferdi-server app key for first run ****'
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
