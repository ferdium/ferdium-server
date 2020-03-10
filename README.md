<p align="center">
    <img src="./logo.png" alt="" width="300"/>  
</p>

# ferdi-server
Official Server software for the [Ferdi Messaging Browser](https://getferdi.com)

- [ferdi-server](#ferdi-server)
  - [Why use a custom Ferdi server?](#why-use-a-custom-ferdi-server)
  - [Features](#features)
  - [Setup](#setup)
    - [with Docker](#with-docker)
    - [Manual setup](#manual-setup)
  - [Configuration](#configuration)
  - [Importing your Franz account](#importing-your-franz-account)
  - [Transferring user data](#transferring-user-data)
  - [Creating and using custom recipes](#creating-and-using-custom-recipes)
    - [Listing custom recipes](#listing-custom-recipes)
  - [License](#license)

## Why use a custom Ferdi server?
A custom server allows you to manage the data of all registered users yourself and add your own recipes to the repository.

If you are not interested in doing this you can use our official instance of Ferdi server at <https://api.getferdi.com>.

## Features
- [x] User registration and login
- [x] Service creation, download, listing and removing
- [x] Workspace support
- [x] Functioning service store
- [x] User dashboard
- [x] Export/import data to other ferdi-servers
- [ ] Password recovery
- [ ] Recipe update

## Setup
### with Docker
The easiest way to set up Ferdi server on your server is with Docker.

The Docker image can be run as is, with the default sqlite database or you can modifying your ENV variables to use an external database (e.g. MySQL, MariaDB, Postgres, etc). 
After setting up the docker container we recommend you to set up an NGINX reverse proxy to access ferdi-server outside of your home network and protect it with an SSL certificate.

1. Pull the Docker image

    ```sh
    docker pull getferdi/ferdi-server
    ```
2. Create a new Docker container with your desired configuration

    ```sh
    docker create \
      --name=ferdi-server \
	    -e NODE_ENV=development \
	    -e DB_CONNECTION=<database> \
	    -e DB_HOST=<yourdbhost> \
	    -e DB_PORT=<yourdbPORT> \
	    -e DB_USER=<yourdbuser> \
	    -e DB_PASSWORD=<yourdbpass> \
	    -e DB_DATABASE=<yourdbdatabase> \
	    -e IS_CREATION_ENABLED=true \
	    -e CONNECT_WITH_FRANZ=true \
	    -p <port>:80 \
	    -v <path to data>:/config \
	    -v <path to database>:/usr/src/app/database \
	    -v <path to recipes>:/usr/src/app/recipes \
	    --restart unless-stopped \
	    getferdi/ferdi-server
    ```

    Alternatively, you can also use docker-compose v2 schemas

    ```sh
    ---
    version: "2"
    services:
    ferdi-server:
        image: getferdi/ferdi-server
        container_name: ferdi-server
        environment:
        - NODE_ENV=development
        - DB_CONNECTION=<database>
        - DB_HOST=<yourdbhost>
        - DB_PORT=<yourdbPORT>
        - DB_USER=<yourdbuser>
        - DB_PASSWORD=<yourdbpass>
        - DB_DATABASE=<yourdbdatabase>
        - IS_CREATION_ENABLED=true/false
        - CONNECT_WITH_FRANZ=true/false  
        - IS_REGISTRATION_ENABLED=true/false  
        - IS_DASHBOARD_ENABLED=true/false  
        volumes:
        - <path to data>:/config
        - <path to database>:/usr/src/app/database
        - <path to recipes>:/usr/src/app/recipes
        ports:
        - <port>:80
        restart: unless-stopped
    ```
3. Optionally, you can now [set up Nginx as a reverse proxy](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#set-up-nginx-as-a-reverse-proxy-server).

For more information on configuring the Docker image, visit the Docker image repository at <https://github.com/getferdi/server-docker>.

### Manual setup
1. Clone this repository
2. Install the [AdonisJS CLI](https://adonisjs.com/)
3. Copy `.env.example` to `.env` and edit the [configuration](#configuration) to your needs
4. Run `npm install` to install local dependencies
5. Run the database migrations with
    ```js
    adonis migration:run
    ```
6. Start the server with
    ```js
    adonis serve --dev
    ```

## Configuration
franz-server's configuration is saved inside the `.env` file. Besides AdonisJS's settings, ferdi-server has the following custom settings:
- `IS_CREATION_ENABLED` (`true` or `false`, default: `true`): Whether to enable the [creation of custom recipes](#creating-and-using-custom-recipes)
- `IS_REGISTRATION_ENABLED` (`true` or `false`, default: `true`): Whether to enable the creation of new user accounts
- `IS_DASHBOARD_ENABLED` (`true` or `false`, default: `true`): Whether to enable the user dashboard
- `CONNECT_WITH_FRANZ` (`true` or `false`, default: `true`): Whether to enable connections to the Franz server. By enabling this option, ferdi-server can:
  - Show the full Franz recipe library instead of only custom recipes
  - Import Franz accounts

## Importing your Franz account
ferdi-server allows you to import your full Franz account, including all its settings.

To import your Franz account, open `http://[YOUR FERDI-SERVER]/import` in your browser and login using your Franz account details. ferdi-server will create a new user with the same credentials and copy your Franz settings, services and workspaces.

## Transferring user data
Please refer to <https://github.com/getferdi/ferdi/wiki/Transferring-data-between-servers>

## Creating and using custom recipes
ferdi-server allows to extends the Franz recipe catalogue with custom Ferdi recipes.

For documentation on how to create a recipe, please visit [the official guide by Franz](https://github.com/meetfranz/plugins/blob/master/docs/integration.md).

To add your recipe to ferdi-server, open `http://[YOUR FERDI-SERVER]/new` in your browser. You can now define the following settings:
- `Author`: Author who created the recipe
- `Name`: Name for your new service. Can contain spaces and unicode characters
- `Service ID`: Unique ID for this recipe. Does not contain spaces or special characters (e.g. `google-drive`)
- `Link to PNG/SVG image`: Direct link to a 1024x1024 PNG image and SVG that is used as a logo inside the store. Please use jsDelivr when using a file uploaded to GitHub as raw.githubusercontent files won't load
- `Recipe files`: Recipe files that you created using the [Franz recipe creation guide](https://github.com/meetfranz/plugins/blob/master/docs/integration.md). Please do *not* package your files beforehand - upload the raw files (you can drag and drop multiple files). ferdi-server will automatically package and store the recipe in the right format. Please also do not drag and drop or select the whole folder, select the individual files.

### Listing custom recipes
Inside Ferdi, searching for `ferdi:custom` will list all your custom recipes.

## License
ferdi-server is licensed under the MIT License
