#!/bin/sh

echo << EOL
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
if [ ! -f "/config/FERDI_APP_KEY.txt" ];
	then
	echo " "
	echo "**** Generating Ferdi-server app key for first run ****"
	adonis key:generate
	source .env
	echo $APP_KEY > /config/FERDI_APP_KEY.txt
	echo "**** App Key set to $APP_KEY you can modify FERDI_APP_KEY.txt to update your key ****"
	sed -i "s/APP_KEY=/APP_KEY=$APP_KEY/g" /config/config.txt
elif [ -f "/config/FERDI_APP_KEY.txt" ];
	then
	echo " "
	echo "**** App Key found ****"
	APP_KEY=$(cat /config/FERDI_APP_KEY.txt)
	sed -i "s/APP_KEY=.*/APP_KEY=$APP_KEY/g" /config/config.txt
	echo "**** App Key set to $APP_KEY you can modify FERDI_APP_KEY.txt to update your key ****"
fi

export APP_KEY=$APP_KEY

node ace migration:run --force

exec node server.js
