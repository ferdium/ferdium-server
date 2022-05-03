# Ferdium-server-docker
[Ferdium](https://github.com/ferdium/ferdium-app) is a hard-fork of [Ferdi](https://github.com/getferdi/ferdi), adding awesome features and removing unwanted ones. Ferdium-server is an unofficial replacement of the Franz/Ferdi server for use with the Ferdium Client.

This is a dockerized version of [Ferdium-server](https://github.com/ferdium/ferdium-server) running on Alpine Linux and Node.js (v10.16.3).

## Why use a custom Ferdium-server?
A custom Ferdium-server allows you to experience the full potential of the Ferdium Client. It allows you to use all Premium features (e.g. Workspaces and custom URL recipes) for free and [add your own recipes](#creating-and-using-custom-recipes) that are monetized in Franz.

## Features
- [x] User registration and login
- [x] Service creation, download, listing and removing
- [x] Workspace support
- [x] Functioning service store
- [x] User dashboard
- [x] Password recovery
- [x] Export/import data to other Ferdium-servers
- [ ] Recipe update

## Installation & Setup

Here are some example snippets to help you get started creating a container.

The docker can be run as is, with the default sqlite database, or you can modify your environment variables to use an external database (e.g. MySQL, MariaDB, Postgres, etc). After setting up the docker container you will need to create a reverse proxy to access Ferdium-server outside of your home network, using a webserver such as NGINX.

**Existing users, please note:** The latest updates to Ferdium-server and the Ferdium-server Docker image, introduce changes to the default SQLite database name and location, as well as the internal container port. The new container port is `3333`. If you would like to keep your existing SQLite database, you will need to add the `DATA_DIR` variable and change it to `/app/database`, to match your existing data volume. You will also need to change the `DB_DATABASE` variable to `development` to match your existing database. Please see the parameters in the [Migration section](#migrating-from-an-existing-ferdium-server) below.

### docker

Pull the docker image:

    docker pull ferdium/ferdium-server:latest

To create the docker container with the proper parameters:

	docker create \
	  --name=ferdium-server \
	  -e NODE_ENV=development \
	  -e APP_URL=<ferdium-server-url> \
	  -e DB_CONNECTION=<database> \
	  -e DB_HOST=<yourdbhost> \
	  -e DB_PORT=<yourdbport> \
	  -e DB_USER=<yourdbuser> \
	  -e DB_PASSWORD=<yourdbpass> \
	  -e DB_DATABASE=<yourdbdatabase> \
	  -e DB_SSL=false \
	  -e MAIL_CONNECTION=smtp \
	  -e SMTP_HOST=<smtpmailserver> \
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
	  ferdium/ferdium-server:latest

### docker-compose

You can use the provided sample [docker-compose.yml](https://github.com/ferdium/ferdium-server/tree/main/docker/docker-compose.yml) if you are happy with the default environment variables. This will pull the latest image from Docker Hub or use a local copy of the image, which you can build using the instructions provided in the [Building locally section](#building-locally).

To start the application, use `docker-compose -f docker/docker-compose.yml up -d`.
The server will be launched at [http://localhost:3333/](http://localhost:3333/) address.

## Configuration

Container images are configured using parameters passed at runtime (such as those above). An explanaition of the default parameters is included below, but please see [the Docker documentation](https://docs.docker.com/get-started/overview/) for additional information.

<strike>If any environment parameter is not passed to the container, its value will be taken from the `/config/config.txt` file.</strike>
**Warning, the use of `config.txt` is now deprecated. Please make sure to pass the correct environment variables to your container at runtime. **

| Parameter | Function |
| :----: | --- |
| `-p <port>:3333` | Will map the container's port 3333 to a port on the host, default is 3333. See the [Docker docs](https://docs.docker.com/config/containers/container-networking/) for more information about port mapping |
| `-e NODE_ENV=development` | for specifying Node environment, production or development, default is development **currently this should not be changed**. See the [Docker docs](https://docs.docker.com/) for more information on the use of environment variables in [Command-line](https://docs.docker.com/engine/reference/commandline/run/#mount-volume--v---read-only) and [Docker Compose](https://docs.docker.com/compose/environment-variables/) |
| `-e APP_URL=<ferdium-server-url>` | for specifying the URL of the Ferdium-server, including `http://` or `https://` as relevant. |
| `-e DB_CONNECTION=<databasedriver` | for specifying the database being used, default is `sqlite`, see [below](#supported-databases-and-drivers) for other options |
| `-e DB_HOST=<yourdbhost>` | for specifying the database host, default is `127.0.0.1` |
| `-e DB_PORT=<yourdbport>` | for specifying the database port, default is `3306` |
| `-e DB_USER=<yourdbuser>` | for specifying the database user, default is `root` |
| `-e DB_PASSWORD=<yourdbpass>` | for specifying the database password, default is `password` |
| `-e DB_DATABASE=<databasename>` | for specifying the database name to be used, default is `ferdium` |
| `-e DB_SSL=false` | true only if your database is postgres and it is hosted online, on platforms like GCP, AWS, etc |
| `-e MAIL_CONNECTION=<mailsender>` | for specifying the mail sender to be used, default is `smtp` |
| `-e SMTP_HOST=<smtpmailserver>` | for specifying the mail host to be used, default is `127.0.0.1` |
| `-e SMTP_PORT=<smtpport>` | for specifying the mail port to be used, default is `2525` |
| `-e MAIL_SSL=true/false` | for specifying SMTP mail security, default is `false` |
| `-e MAIL_USERNAME=<yourmailusername>` | for specifying your mail username to be used, default is `username` |
| `-e MAIL_PASSWORD=<yourmailpassword>` | for specifying your mail password to be used, default is `password` |
| `-e MAIL_SENDER=<sendemailaddress` | for specifying the mail sender address to be used, default is `noreply@ferdium.org` |
| `-e IS_CREATION_ENABLED=true` | for specifying whether to enable the [creation of custom recipes](#creating-and-using-custom-recipes), default is `true` |
| `-e IS_DASHBOARD_ENABLED=true` | for specifying whether to enable the Ferdium-server dashboard, default is `true` |
| `-e IS_REGISTRATION_ENABLED=true` | for specifying whether to allow user registration, default is `true` |
| `-e CONNECT_WITH_FRANZ=true` | for specifying whether to enable connections to the Franz server, default is `true` |
| `-e DATA_DIR=/data` | for specifying the SQLite database folder, default is `/data` |
| `-v <path to data on host>:/data` | this will store Ferdium-server's data (its database, among other things) on the docker host for persistence. See the [Docker docs](https://docs.docker.com/storage/volumes/) for more information on the use of container volumes |
| `-v <path to recipes on host>:/app/recipes` | this will store Ferdium-server's recipes on the docker host for persistence |

By enabling the `CONNECT_WITH_FRANZ` option, Ferdium-server can:
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

## Migrating from an existing Ferdium-server

If you are an existing Ferdium-server user using the built-in `SQlite` database, you should include the following variables:
| Parameter | Function |
| :----: | --- |
| `-p 3333:3333` | existing Ferdium-server users will need to update their container port mappings from `80:3333` to `3333:3333` |
| `-e DB_PASSWORD=development` | existing Ferdium-server users who use the built-in sqlite database should use the database name `development` |
| `-e DATA_DIR=/app/database` | existing Ferdium-server users who use the built-in sqlite database should add this environment variable to ensure data persistence |
| `-v <path to data on host>=/app/databases` | existing Ferdium-server users who use the built-in sqlite database should use the volume name `/app/database` |

If you are an existing Ferdium-server user who uses an external database or different variables for the built-in `SQlite` database, you should updatae your parameterse acordingly. For example, if you aree using an exterenal MariaDB or MySql  database your unique parameters might look like this:
| Parameter | Function |
| :----: | --- |
| `-e DB_CONNECTION=mysql` | for specifying the database being used |
| `-e DB_HOST=192.168.10.1` | for specifying the database host machine IP |
| `-e DB_PORT=3306` | for specifying the database port |
| `-e DB_USER=ferdium` | for specifying the database user |
| `-e DB_PASSWORD=ferdiumpw` | for specifying the database password|
| `-e DB_DATABASE=adonis` | for specifying the database to be used|
| `-v <path to database>:/app/database` | this will store Ferdium-server's database on the docker host for persistence |
| `-v <path to recipes>:/app/recipes` | this will store Ferdium-server's recipes on the docker host for persistence |

**In either case, please be sure to pass the correct variables to the new Ferdium-server container in order maintain access to your existing database.**

## NGINX config block

To access Ferdium-server from outside of your home network on a subdomain use this server block:

```
# Ferdium-server
server {
  listen 443 ssl http2;
  server_name ferdium.my.website;

  # all ssl related config moved to ssl.conf
  include /config/nginx/ssl.conf;

  location / {
    proxy_pass http://<Ferdium-IP>:3333;
    proxy_set_header  X-Real-IP  $remote_addr;
    proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header  Host  $host;
    proxy_set_header  X-Forwarded-Proto  $scheme;
  }
}
```

## Importing your Franz/Ferdi account

Ferdium-server allows you to import your full Franz account, including all its settings.

To import your Franz account, open `http://[YOUR FERDIUM-SERVER]/import` in your browser and login using your Franz account details. Ferdium-server will create a new user with the same credentials and copy your Franz settings, services and workspaces.

## Transferring user data

Please refer to <https://github.com/getferdi/ferdi/wiki/Transferring-data-between-servers>

## Creating and using custom recipes

Ferdium-server allows to extends the Franz recipe catalogue with custom Ferdi recipes.

For documentation on how to create a recipe, please visit [the official guide](https://github.com/ferdium/ferdium-recipes/blob/main/docs/integration.md).

To add your recipe to Ferdium-server, open `http://[YOUR FERDIUM-SERVER]/new` in your browser. You can now define the following settings:
- `Author`: Author who created the recipe
- `Name`: Name for your new service. Can contain spaces and unicode characters
- `Service ID`: Unique ID for this recipe. Does not contain spaces or special characters (e.g. `google-drive`)
- `Link to PNG/SVG image`: Direct link to a 1024x1024 PNG image and SVG that is used as a logo inside the store. Please use jsDelivr when using a file uploaded to GitHub as raw.githubusercontent files won't load
- `Recipe files`: Recipe files that you created using the [recipe creation guide](https://github.com/ferdium/ferdium-recipes/blob/main/docs/integration.md). Please do *not* package your files beforehand - upload the raw files (you can drag and drop multiple files). Ferdium-server will automatically package and store the recipe in the right format. Please also do not drag and drop or select the whole folder, select the individual files.

### Listing custom recipes

Inside Ferdium, searching for `ferdium:custom` will list all your custom recipes.

## Support Info

* Shell access while the container is running: `docker exec -it ferdium-server /bin/bash`
* To monitor the logs of the container in realtime: `docker logs -f ferdium-server`

## Updating Info

Below are the instructions for updating the container to get the most recent version of Ferdium-server:

### Via Docker Run/Create

* Update the image: `docker pull ferdium/ferdium-server:latest`
* Stop the running container: `docker stop ferdium-server`
* Delete the container: `docker rm ferdium-server`
* Recreate a new container with the same docker create parameters as instructed above (if mapped correctly to a host folder, your `/config` folder and ENV settings will be preserved)
* Start the new container: `docker start ferdium-server`

### Via Docker Compose

* Update all images: `docker-compose -f docker/docker-compose.yml pull`
  * or update a single image: `docker-compose -f docker/docker-compose.yml pull ferdium-server`
* Let compose update all containers as necessary: `docker-compose -f docker/docker-compose.yml up -d`
  * or update a single container: `docker-compose -f docker/docker-compose.yml up -d ferdium-server`

## Building locally

If you want to build this image locally, please run this command from root of [Ferdium-server repository](https://github.com/ferdium/ferdium-server/tree/main/):
```
docker build \
  --no-cache \
  --pull \
  -t ferdium/ferdium-server:latest .
```

## License
Ferdium-server-docker and Ferdium-server are licensed under the MIT License.
