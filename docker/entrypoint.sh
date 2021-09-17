#!/bin/bash

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

# Create APP key if needed
if [[ -z ${APP_KEY} && ! -f "${DATA_DIR}/FERDI_APP_KEY.txt" ]]; then
	echo "**** Generating Ferdi-server app key for first run ****"
	adonis key:generate
	APP_KEY=$(grep APP_KEY .env | cut -d '=' -f2)
	echo "${APP_KEY}" > "${DATA_DIR}/FERDI_APP_KEY.txt"
	echo "**** App Key set to $APP_KEY you can modify FERDI_APP_KEY.txt to update your key ****"
else APP_KEY=$(cat "${DATA_DIR}/FERDI_APP_KEY.txt")
	echo "**** App Key set to $APP_KEY you can modify FERDI_APP_KEY.txt to update your key ****"
fi

export APP_KEY

node ace migration:run --force

chown -R "${PUID:-1000}":"${PGID:-1000}" "$DATA_DIR" /app

su-exec "${PUID:-1000}":"${PGID:-1000}" node server.js#!/bin/bash
