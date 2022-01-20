<p align="center">
    <img src="./logo.png" alt="" width="300"/>
</p>

# Server

<p>
  <a href="https://github.com/getferdi/server/actions/workflows/builds.yml"><img alt="Build Status" src="https://github.com/getferdi/server/actions/workflows/builds.yml/badge.svg?branch=master&event=push"></a>
  <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href='#contributors-'><img src='https://img.shields.io/badge/contributors-5-default.svg?logo=github' alt='Contributors'/></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
  <a href="#backers-via-opencollective"><img alt="Open Collective backers" src="https://img.shields.io/opencollective/backers/getferdi?logo=open-collective"></a>
  <a href="https://gitter.im/getferdi/community"><img alt="Gitter Chat Room" src="https://img.shields.io/gitter/room/getferdi/community"></a>
</p>

> 👨🏾‍🍳 Server for [Ferdi](https://getferdi.com) that you can re-use to run your own

## Why use a custom server?

_Find answers to other frequently asked questions on [getferdi.com/faq](https://getferdi.com/faq/)._

<details>
<summary>Toggle answer</summary>

A custom server allows you to manage the data of all registered users yourself and add your own recipes to the repository. If you are not interested in doing this you can use our official instance of the server at [api.getferdi.com](https://api.getferdi.com).

</details>

## Features
- [x] User registration and login
- [x] Service creation, download, listing and removing
- [x] Workspace support
- [x] Functioning service store
- [x] User dashboard
- [x] Export/import data to other Ferdi-servers
- [x] Password recovery
- [x] Recipe update

## Deploying the App

Click this button to deploy the app to the DigitalOcean App Platform.

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/getferdi/server/tree/master&refcode=5292301af793)


<details>
<summary>Setup with Docker</summary>
The easiest way to set up Ferdi-server on your server is with Docker.

The Docker image can be run as is, with the default SQLite database or you can modify your ENV variables to use an external database (e.g. MySQL, MariaDB, Postgres, etc).
After setting up the docker container we recommend you set up an NGINX reverse proxy to access Ferdi-server outside of your home network and protect it with an SSL certificate.

**Warning**, please note that the use of the previous `config.txt` is now deprecated and a number of environmental variables have changed, specifically the default database name and location, the internal container port, and an additional `DATA_DIR` variable has been added. Make sure to pass the correct environmental variables to your container at runtime. If you are an existing Ferdi-server user, please see [the Ferdi docker documentation](./docker/README.md) for more information about migrating to the new image.

1. Pull the Docker image

    ```sh
    docker pull getferdi/ferdi-server
    ```
2. Create a *new* Docker container with your desired configuration **Existing users please seee the warning above.**

    ```sh
	    docker create \
	    --name=ferdi-server \
	    -e NODE_ENV=development \
	    -e APP_URL=<ferdi-server-url> \
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
      -e DATA_DIR=data \
	    -p <port>:3333 \
	    -v <path to data>:/data \
	    -v <path to recipes>:/app/recipes \
	    --restart unless-stopped \
	    getferdi/ferdi-server
    ```

    Alternatively, you can also use docker-compose v2 schema. An example can be found [in the docker folder](./docker/docker-compose.yml).

3. Optionally, you can [set up Nginx as a reverse proxy](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#set-up-nginx-as-a-reverse-proxy-server).

For more information on configuring the Docker image, please read [the Ferdi docker documentation](./docker/README.md).
</details>
<details>
<summary>Manual setup</summary>

1. Clone repository with submodule
2. Install the [AdonisJS CLI](https://adonisjs.com/)
3. Copy `.env.example` to `.env` and edit the [configuration](#configuration) to your needs
4. Have env DB_SSL=true only if your database is postgres and it is hosted online on platforms like GCP, AWS, etc
5. Run `npm install` to install local dependencies
6. Run the database migrations with

    ```js
    node ace migration:run
    ```

7. Start the server with

    ```js
    npm start
    ```
</details>
<details>
<summary>Configuration</summary>

franz-server's configuration is saved inside an `.env` file. Besides AdonisJS's settings, Ferdi-server has the following custom settings:
- `IS_CREATION_ENABLED` (`true` or `false`, default: `true`): Whether to enable the [creation of custom recipes](#creating-and-using-custom-recipes)
- `IS_REGISTRATION_ENABLED` (`true` or `false`, default: `true`): Whether to enable the creation of new user accounts
- `IS_DASHBOARD_ENABLED` (`true` or `false`, default: `true`): Whether to enable the user dashboard
- `CONNECT_WITH_FRANZ` (`true` or `false`, default: `true`): Whether to enable connections to the Franz server. By enabling this option, Ferdi-server can:
  - Show the full Franz recipe library instead of only custom recipes
  - Import Franz accounts
</details>
<details>
<summary>Importing your Franz account</summary>

Ferdi-server allows you to import your full Franz account, including all its settings.

To import your Franz account, open `http://[YOUR FERDI-SERVER]/import` in your browser and login using your Franz account details. Ferdi-server will create a new user with the same credentials and copy your Franz settings, services and workspaces.
</details>
<details>
<summary>Transferring user data</summary>

Please refer to <https://github.com/getferdi/ferdi/wiki/Transferring-data-between-servers>
</details>
<details>
<summary>Creating and using custom recipes</summary>
Ferdi-server allows to extends the Franz recipe catalogue with custom Ferdi recipes.

For documentation on how to create a recipe, please visit [the official guide by Franz](https://github.com/meetfranz/plugins/blob/master/docs/integration.md).

To add your recipe to Ferdi-server, open `http://[YOUR FERDI-SERVER]/new` in your browser. You can now define the following settings:

- `Author`: Author who created the recipe
- `Name`: Name for your new service. Can contain spaces and unicode characters
- `Service ID`: Unique ID for this recipe. Does not contain spaces or special characters (e.g. `google-drive`)
- `Link to SVG image`: Direct link to a 1024x1024 SVG image that is used as a logo inside the store. Please use jsDelivr when using a file uploaded to GitHub as raw.githubusercontent files won't load
- `Recipe files`: Recipe files that you created using the [Franz recipe creation guide](https://github.com/meetfranz/plugins/blob/master/docs/integration.md). Please do *not* package your files beforehand - upload the raw files (you can drag and drop multiple files). Ferdi-server will automatically package and store the recipe in the right format. Please also do not drag and drop or select the whole folder, select the individual files.
</details>
<details>
<summary>Listing custom recipes</summary>

Inside Ferdi, searching for `ferdi:custom` will list all of your custom recipes.
</details>

## Contributing

Please read the [contributing guidelines](CONTRIBUTING.md) to setup your development machine and proceed.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://pogonip.pw/"><img src="https://avatars.githubusercontent.com/u/5242865?v=4?s=100" width="100px;" alt=""/><br /><sub><b>nick</b></sub></a><br /><a href="https://github.com/getferdi/server/commits?author=HuggableSquare" title="Code">💻</a></td>
    <td align="center"><a href="http://code-addict.pl"><img src="https://avatars.githubusercontent.com/u/6313392?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michał Kostewicz</b></sub></a><br /><a href="https://github.com/getferdi/server/commits?author=k0staa" title="Code">💻</a></td>
    <td align="center"><a href="https://gitlab.com/cromefire_"><img src="https://avatars.githubusercontent.com/u/26320625?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cromefire_</b></sub></a><br /><a href="https://github.com/getferdi/server/commits?author=cromefire" title="Code">💻</a></td>
    <td align="center"><a href="https://omkaragrawal.dev"><img src="https://avatars.githubusercontent.com/u/10913160?v=4?s=100" width="100px;" alt=""/><br /><sub><b>OMKAR AGRAWAL</b></sub></a><br /><a href="https://github.com/getferdi/server/commits?author=Omkaragrawal" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
