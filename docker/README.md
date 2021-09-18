# Ferdi-server-docker
[Ferdi](https://github.com/getferdi/ferdi) is a hard-fork of [Franz](https://github.com/meetfranz/franz), adding awesome features and removing unwanted ones. Ferdi-server is an unofficial replacement of the Franz server for use with the Ferdi Client. 

This is a dockerized version of [Ferdi-server](https://github.com/getferdi/server) running on Alpine Linux and Node.js (v10.16.3).

## Why use a custom Ferdi-server?
A custom Ferdi-server allows you to experience the full potential of the Ferdi Client. It allows you to use all Premium features (e.g. Workspaces and custom URL recipes) and [add your own recipes](#creating-and-using-custom-recipes).

## Features
- [x] User registration and login
- [x] Service creation, download, listing and removing
- [x] Workspace support
- [x] Functioning service store
- [x] User dashboard
- [x] Password recovery
- [x] Export/import data to other Ferdi-servers
- [ ] Recipe update

## Installation & Setup

Here are some example snippets to help you get started creating a container.

The docker can be run as is, with the default sqlite database, or you can modify your environment variables to use an external database (e.g. MySQL, MariaDB, Postgres, etc). After setting up the docker container you will need to create a reverse proxy to access Ferdi-server outside of your home network, using a webserver such as NGINX.

**Existing users, please note:** The latest updates to Ferdi-server and the Ferdi-server Docker image introduce changes to the default SQLite database name and location, as well as the internal container port. The new container port is `3333`. If you would like to keep your existing SQLite database, you will need to add the `DATA_DIR` variable and change it to `/app/database`, to match your existing data volume. You will also need to change the `DB_DATABASE` variable to `development` to match your existing database. Please see the parameters in the [Migration section](#migrating-from-an-existing-ferdi-server) below.

### docker

Pull the docker image:

    docker pull getferdi/ferdi-server

To create the docker container with the proper parameters:

	docker create \
	  --name=ferdi-server \
	  -e NODE_ENV=development \
	  -e EXTERNAL_DOMAIN=<ferdi-serverdomain> \  
	  -e DB_CONNECTION=<database> \
	  -e DB_HOST=<yourdbhost> \
	  -e DB_PORT=<yourdbport> \
	  -e DB_USER=<yourdbuser> \
	  -e DB_PASSWORD=<yourdbpass> \
	  -e DB_DATABASE=<yourdbdatabase> \
	  -e DB_SSL=false \
	  -e MAIL_CONNECTION=smtp \
	  -e SMPT_HOST=<smtpmailserver> \
	  -e SMTP_PORT=<smtpport> \
	  -e MAIL_SSL=true/false \
	  -e MAIL_USERNAME=<yourmailusername> \
	  -e MAIL_PASSWORD=<yourmailpassword> \
	  -e MAIL_SENDER=<sendemailaddress> \
	  -e IS_CREATION_ENABLED=true \
	  -e IS_DASHBOARD_ENABLED=true \
	  -e IS_REGISTRATION_ENABLED=true \
	  -e CONNECT_WITH_FRANZ=true \
	  -e DATA_DIR=/data \
	  -p <port>:3333 \
	  -v <path to data>:/data \
	  -v <path to recipes>:/app/recipes \
	  --restart unless-stopped \
	  getferdi/ferdi-server

### docker-compose

  You can use the provided sample [docker-compose.yml](https://github.com/getferdi/server/tree/master/docker/docker-compose.yml) if you are happy with the default environmental variables. This will pull the latest image from Docker Hub or use a local copy of the image which you can build using the instructions provided in the [Building locally section](#building-locally).

  To start the application, use `docker-compose up -d`.
The server will be launched at [http://localhost:3333/](http://localhost:3333/) address.

## Configuration

Container images are configured using parameters passed at runtime (such as those above). An explanaition of the default parameters is included below, but please see [the Docker documentation](https://docs.docker.com/get-started/overview/) for additional information.

<strike>If any environmental parameter is not passed to the container, its value will be taken from the `/config/config.txt` file.</strike> 
**Warning, the use of `config.txt` is now deprecated. Please make sure to pass the correct environmental variables to your container at runtime. ** 

| Parameter | Function |
| :----: | --- |
| `-p <port>:3333` | Will map the container's port 3333 to a port on the host, default is 3333. See the [Docker docs](https://docs.docker.com/config/containers/container-networking/) for more information about port mapping |
| `-e NODE_ENV=development` | for specifying Node environment, production or development, default is development **currently this should not be changed**. See the [Docker docs](https://docs.docker.com/) for more information on the use of environmental variables in [Command-line](https://docs.docker.com/engine/reference/commandline/run/#mount-volume--v---read-only) and [Docker Compose](https://docs.docker.com/compose/environment-variables/) |
| `-e EXTERNAL_DOMAIN=<ferdi-serverdomain>` | for specifying the external domain address of the Ferdi-server |
| `-e DB_CONNECTION=<databasedriver` | for specifying the database being used, default is sqlite, see [below](#supported-databases-and-drivers) for other options |
| `-e DB_HOST=<yourdbhost>` | for specifying the database host, default is 127.0.0.1 |
| `-e DB_PORT=<yourdbport>` | for specifying the database port, default is 3306 |
| `-e DB_USER=<yourdbuser>` | for specifying the database user, default is root |
| `-e DB_PASSWORD=<yourdbpass>` | for specifying the database password, default is password |
| `-e DB_DATABASE=<databasename>` | for specifying the database name to be used, default is ferdi |
| `-e DB_SSL=false` | true only if your database is postgres and it is hosted online, on platforms like GCP, AWS, etc |
| `-e MAIL_CONNECTION=<mailsender>` | for specifying the mail sender to be used, default is smtp |
| `-e SMPT_HOST=<smtpmailserver>` | for specifying the mail host to be used, default is 127.0.0.1 |
| `-e SMTP_PORT=<smtpport>` | for specifying the mail port to be used, default is 2525 |
| `-e MAIL_SSL=true/false` | for specifying SMTP mail security, default is false |
| `-e MAIL_USERNAME=<yourmailusername>` | for specifying your mail username to be used, default is username |
| `-e MAIL_PASSWORD=<yourmailpassword>` | for specifying your mail password to be used, default is password |
| `-e MAIL_SENDER=<sendemailaddress` | for specifying the mail sender address to be used, default is noreply@getferdi.com |
| `-e IS_CREATION_ENABLED=true` | for specifying whether to enable the [creation of custom recipes](#creating-and-using-custom-recipes), default is true |
| `-e IS_DASHBOARD_ENABLED=true` | for specifying whether to enable the Ferdi-server dashboard, default is true |
| `-e IS_REGISTRATION_ENABLED=true` | for specifying whether to allow user registration, default is true |
| `-e CONNECT_WITH_FRANZ=true` | for specifying whether to enable connections to the Franz server, default is true |
| `-e DATA_DIR=data` | for specifying the SQLite database folder, default is data |
| `-v <path to data on host>:/data` | this will store Ferdi-server's data (its database, among other things) on the docker host for persistence. See the [Docker docs](https://docs.docker.com/storage/volumes/) for more information on the use of container volumes |
| `-v <path to recipes on host>:/app/recipes` | this will store Ferdi-server's recipes on the docker host for persistence |

By enabling the `CONNECT_WITH_FRANZ` option, Ferdi-server can:
    - Show the full Franz recipe library instead of only custom recipes
    - Import Franz accounts

## Supported databases and drivers

To use a different database than the default, SQLite3, enter the driver code below in your ENV configuration. 

| Database | Driver |
| :----: | --- |
| MariaDB/MySQL | mysql |
| PostgreSQL | pg |
| SQLite3 | sqlite |

## Supported mail connections (advanced)

To use a different email sender than the default, SMTP, enter the correct information in your ENV configuration and adapt your docker run, create, or compose commands accordingly.

| Mail Connection | ENV variables |
| :----: | --- |
| SMTP | SMTP_PORT, SMTP_HOST, MAIL_USERNAME, MAIL_PASSWORD, MAIL_SSL |
| SparkPost | SPARKPOST_API_KEY |
| Mailgun | MAILGUN_DOMAIN, MAILGUN_API_REGION, MAILGUN_API_KEY |
| (**Deprecated**) Ethereal | A disposable account is created automatically if you choose this option. |

## Migrating from an existing Ferdi-server

If you are an existing Ferdi-server user using the built-in `SQlite` database, you should include the following variables:
| Parameter | Function |
| :----: | --- |
| `-p 3333:3333` | existing Ferdi-server users will need to update their container port mappings from `80:3333` to `3333:3333` |
| `-e DB_PASSWORD=development` | existing Ferdi-server users who use the built-in sqlite database should use the database name `development` |
| `-e DATA_DIR=/app/database` | existing Ferdi-server users who use the built-in sqlite database should add this environmental variable to ensure data persistence |
| `-v <path to data on host>=/app/databases` | existing Ferdi-server users who use the built-in sqlite database should use the volume name `/app/database` |

If you are an existing Ferdi-server user who usees an external database or different variables for the built-in `SQlite` database, you should updatae your parameterse acordingly. For exaple, if you aree using an exterenal MariaDB or MYSql  database your unique parameters might look like this:
| Parameter | Function |
| :----: | --- |
| `-e DB_CONNECTION=mysql` | for specifying the database being used |
| `-e DB_HOST=192.168.10.1` | for specifying the database host machine IP |
| `-e DB_PORT=3306` | for specifying the database port |
| `-e DB_USER=ferdi` | for specifying the database user |
| `-e DB_PASSWORD=ferdipw` | for specifying the database password|
| `-e DB_DATABASE=adonis` | for specifying the database to be used|
| `-v <path to database>:/app/database` | this will strore Ferdi-server's database on the docker host for persistence |
| `-v <path to recipes>:/app/recipes` | this will strore Ferdi-server's recipes on the docker host for persistence |

**In eithr case, pleasee be sure to pass the correct variables to the new Ferdi-server container in order maintain access to your existing database.**
 
## NGINX config block

To access Ferdi-server from outside of your home network on a subdomain use this server block:

```
# Ferdi-server
server {
        listen 443 ssl http2;
        server_name ferdi.my.website;

        # all ssl related config moved to ssl.conf
        include /config/nginx/ssl.conf;

        location / {
          proxy_pass http://<Ferdi-IP>:3333;
          proxy_set_header  X-Real-IP  $remote_addr;
          proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
          proxy_set_header  Host  $host;
          proxy_set_header  X-Forwarded-Proto  $scheme;
        }
}
```

## Importing your Franz account

Ferdi-server allows you to import your full Franz account, including all its settings.

To import your Franz account, open `http://[YOUR FERDI-SERVER]/import` in your browser and login using your Franz account details. Ferdi-server will create a new user with the same credentials and copy your Franz settings, services and workspaces.

## Transferring user data

Please refer to <https://github.com/getferdi/ferdi/wiki/Transferring-data-between-servers>

## Creating and using custom recipes

Ferdi-server allows to extends the Franz recipe catalogue with custom Ferdi recipes.

For documentation on how to create a recipe, please visit [the official guide by Franz](https://github.com/meetfranz/plugins/blob/master/docs/integration.md).

To add your recipe to Ferdi-server, open `http://[YOUR FERDI-SERVER]/new` in your browser. You can now define the following settings:
- `Author`: Author who created the recipe
- `Name`: Name for your new service. Can contain spaces and unicode characters
- `Service ID`: Unique ID for this recipe. Does not contain spaces or special characters (e.g. `google-drive`)
- `Link to PNG/SVG image`: Direct link to a 1024x1024 PNG image and SVG that is used as a logo inside the store. Please use jsDelivr when using a file uploaded to GitHub as raw.githubusercontent files won't load
- `Recipe files`: Recipe files that you created using the [Franz recipe creation guide](https://github.com/meetfranz/plugins/blob/master/docs/integration.md). Please do *not* package your files beforehand - upload the raw files (you can drag and drop multiple files). Ferdi-server will automatically package and store the recipe in the right format. Please also do not drag and drop or select the whole folder, select the individual files.

### Listing custom recipes

Inside Ferdi, searching for `ferdi:custom` will list all your custom recipes.

## Support Info

* Shell access while the container is running: `docker exec -it ferdi-server /bin/bash`
* To monitor the logs of the container in realtime: `docker logs -f ferdi-server`

## Updating Info

Below are the instructions for updating the container to get the most recent version of Ferdi-server:

### Via Docker Run/Create

* Update the image: `docker pull getferdi/ferdi-server`
* Stop the running container: `docker stop ferdi-server`
* Delete the container: `docker rm ferdi-server`
* Recreate a new container with the same docker create parameters as instructed above (if mapped correctly to a host folder, your `/config` folder and ENV settings will be preserved)
* Start the new container: `docker start ferdi-server`
* You can also remove the old dangling images: `docker image prune`

### Via Docker Compose

* Update all images: `docker-compose pull`
  * or update a single image: `docker-compose pull ferdi-server`
* Let compose update all containers as necessary: `docker-compose up -d`
  * or update a single container: `docker-compose up -d ferdi-server`
* You can also remove the old dangling images: `docker image prune`

## Building locally

If you want to build this image locally, please run this command from root of [Ferdi-server repository](https://github.com/getferdi/server/tree/master/):
```
docker build \
  --no-cache \
  --pull \
  -t getferdi/ferdi-server:latest .
```

## License
Ferdi-server-docker and Ferdi-server are licensed under the MIT License.
