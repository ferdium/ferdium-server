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

# if config.txt doesn't exist then create one with default values
if [ ! -f /config/config.txt ]; then	
	cp /app/.env.example /config/config.txt
fi

# use config.txt default values as .env file	
if [ -f /app/.env ]; then	
	rm /app/.env	
	ln -s /config/config.txt /app/.env	
elif [ ! -f /app/.env ]; then	
	ln -s /config/config.txt /app/.env	
fi

# Create APP key if needed
if [ ! -f "/config/FERDI_APP_KEY.txt" ];
	then
	echo " "
	echo "**** Generating Ferdi-server app key for first run ****"
	adonis key:generate
	APP_KEY=$(grep APP_KEY .env | cut -d '=' -f2)
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

export APP_KEY

node ace migration:run --force

exec node server.js
