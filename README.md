<p align="center">
    <img src="./logo.png" alt="" width="300"/>
</p>

# Server

[![Docker Build and Publish](https://github.com/ferdium/ferdium-server/actions/workflows/docker.yml/badge.svg)](https://github.com/ferdium/ferdium-server/actions/workflows/docker.yml)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href='#contributors-'><img src='https://img.shields.io/badge/contributors-17-default.svg?logo=github' alt='Contributors'/></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->

> 👨🏾‍🍳 Server for [Ferdium](https://ferdium.org) that you can re-use to run your own

## Why use a custom server?

_Find answers to other frequently asked questions on [ferdium.org/faq](https://ferdium.org/faq/)._

<details>
<summary>Toggle answer</summary>

A custom server allows you to manage the data of all registered users yourself and add your own recipes to the repository. If you are not interested in doing this you can use our official instance of the server at [api.ferdium.org](https://api.ferdium.org).

</details>

## Features

- [x] User registration and login
- [x] Service creation, download, listing and removing
- [x] Workspace support
- [x] Functioning service store
- [x] User dashboard
- [x] Export/import data to other Ferdium-servers
- [x] Password recovery
- [x] Recipe update

## Deploying the App

<details>
<summary>Setup with Docker</summary>
The easiest way to set up Ferdium-server on your server is with Docker.

The Docker image can be run as is, with the default SQLite database or you can modify your ENV variables to use an external database (e.g. MySQL, MariaDB, Postgres, etc).
After setting up the docker container we recommend you set up an NGINX reverse proxy to access Ferdium-server outside of your home network and protect it with an SSL certificate.

**Warning**, please note that the use of the previous `config.txt` is now deprecated and a number of environment variables have changed, specifically the default database name and location, the internal container port, and an additional `DATA_DIR` variable has been added. Make sure to pass the correct environment variables to your container at runtime. If you are an existing Ferdium-server user, please see [the Ferdium docker documentation](./docker/README.md) for more information about migrating to the new image.

1. Pull the Docker image

   ```sh
   docker pull ferdium/ferdium-server:latest
   ```

2. Create a _new_ Docker container with your desired configuration **Existing users please seee the warning above.**

   ```sh
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
     -e DATA_DIR=data \
       -p <port>:3333 \
       -v <path to data>:/data \
       -v <path to recipes>:/app/recipes \
       --restart unless-stopped \
       ferdium/ferdium-server:latest
   ```

   Alternatively, you can also use docker-compose v2 schema. An example can be found [in the docker folder](./docker/docker-compose.yml).

3. Optionally, you can [set up Nginx as a reverse proxy](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04#set-up-nginx-as-a-reverse-proxy-server).

For more information on configuring the Docker image, please read [the Ferdium docker documentation](./docker/README.md).

</details>
<details>
<summary>Manual setup</summary>

1.  Clone repository with submodule
2.  Install the [AdonisJS CLI](https://adonisjs.com/)
3.  Copy `.env.example` to `.env` and edit the [configuration](#configuration) to your needs
4.  Have env DB_SSL=true only if your database is postgres and it is hosted online on platforms like GCP, AWS, etc
5.  Run `npm install` to install local dependencies
6.  Run the database migrations with

    ```js
    node ace migration:run
    ```

7.  Start the server with

        ```js
        npm start
        ```

    </details>
    <details>
    <summary>Configuration</summary>

Ferdium-server's configuration is saved inside an `.env` file. Besides AdonisJS's settings, Ferdium-server has the following custom settings:

- `IS_CREATION_ENABLED` (`true` or `false`, default: `true`): Whether to enable the [creation of custom recipes](#creating-and-using-custom-recipes)
- `IS_REGISTRATION_ENABLED` (`true` or `false`, default: `true`): Whether to enable the creation of new user accounts
- `IS_DASHBOARD_ENABLED` (`true` or `false`, default: `true`): Whether to enable the user dashboard
- `CONNECT_WITH_FRANZ` (`true` or `false`, default: `true`): Whether to enable connections to the Franz server. By enabling this option, Ferdium-server can:
  - Show the full Franz recipe library instead of only custom recipes
  - Import Franz accounts
  </details>
  <details>
  <summary>Importing your Franz/Ferdi account</summary>

Ferdium-server allows you to import your full Franz/Ferdi account, including all its settings.

To import your Franz/Ferdi account, open `http://[YOUR FERDIUM-SERVER]/import` in your browser and login using your Franz/Ferdi account details. Ferdium-server will create a new user with the same credentials and copy your Franz/Ferdi settings, services and workspaces.

</details>
<details>
<summary>Transferring user data</summary>

Please refer to <https://github.com/getferdi/ferdi/wiki/Transferring-data-between-servers>

</details>
<details>
<summary>Creating and using custom recipes</summary>
Ferdium-server allows to extends the Franz/Ferdi recipe catalogue with custom Ferdium recipes.

For documentation on how to create a recipe, please visit [the official guide](https://github.com/ferdium/ferdium-recipes/blob/main/docs/integration.md).

To add your recipe to Ferdium-server, open `http://[YOUR FERDIUM-SERVER]/new` in your browser. You can now define the following settings:

- `Author`: Author who created the recipe
- `Name`: Name for your new service. Can contain spaces and unicode characters
- `Service ID`: Unique ID for this recipe. Does not contain spaces or special characters (e.g. `google-drive`)
- `Link to SVG image`: Direct link to a 1024x1024 SVG image that is used as a logo inside the store. Please use jsDelivr when using a file uploaded to GitHub as raw.githubusercontent files won't load
- `Recipe files`: Recipe files that you created using the [recipe creation guide](https://github.com/ferdium/ferdium-recipes/blob/main/docs/integration.md). Please do _not_ package your files beforehand - upload the raw files (you can drag and drop multiple files). Ferdium-server will automatically package and store the recipe in the right format. Please also do not drag and drop or select the whole folder, select the individual files.

</details>
<details>
<summary>Listing custom recipes</summary>

Inside Ferdium, searching for `ferdium:custom` will list all of your custom recipes.

</details>

## Contributing

Please read the [contributing guidelines](CONTRIBUTING.md) to setup your development machine and proceed.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href='https://pogonip.pw/' title='nick: code'><img src='https://avatars.githubusercontent.com/u/5242865?v=4' alt='HuggableSquare' style='width:100px;'/></a></td>
      <td align="center"><a href='http://code-addict.pl' title='Michał Kostewicz: code'><img src='https://avatars.githubusercontent.com/u/6313392?v=4' alt='k0staa' style='width:100px;'/></a></td>
      <td align="center"><a href='https://gitlab.com/cromefire_' title='Cromefire_: code'><img src='https://avatars.githubusercontent.com/u/26320625?v=4' alt='cromefire' style='width:100px;'/></a></td>
      <td align="center"><a href='https://omkaragrawal.dev' title='OMKAR AGRAWAL: code'><img src='https://avatars.githubusercontent.com/u/10913160?v=4' alt='Omkaragrawal' style='width:100px;'/></a></td>
      <td align="center"><a href='http://www.nathanaelhoun.fr' title='Nathanaël Houn: review'><img src='https://avatars.githubusercontent.com/u/45119518?v=4' alt='nathanaelhoun' style='width:100px;'/></a></td>
      <td align="center"><a href='https://github.com/ericreeves' title='Eric Reeves: infra'><img src='https://avatars.githubusercontent.com/u/1744930?v=4' alt='ericreeves' style='width:100px;'/></a></td>
      <td align="center"><a href='https://github.com/SpecialAro' title='André Oliveira: infra, design'><img src='https://avatars.githubusercontent.com/u/37463445?v=4' alt='SpecialAro' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center"><a href='https://mydarkstar.net' title='mydarkstar: review'><img src='https://avatars.githubusercontent.com/u/17343993?v=4' alt='mydarkstar' style='width:100px;'/></a></td>
      <td align="center"><a href='https://santhosh.cyou' title='Santhosh C: code'><img src='https://avatars.githubusercontent.com/u/20743451?v=4' alt='santhosh-chinnasamy' style='width:100px;'/></a></td>
      <td align="center"><a href='https://github.com/vraravam' title='Vijay Aravamudhan: review, code'><img src='https://avatars.githubusercontent.com/u/69629?v=4' alt='vraravam' style='width:100px;'/></a></td>
      <td align="center"><a href='https://github.com/dqos' title='Tamer: design'><img src='https://avatars.githubusercontent.com/u/8611981?v=4' alt='dqos' style='width:100px;'/></a></td>
      <td align="center"><a href='https://github.com/Gibby' title='Gibby: infra, doc'><img src='https://avatars.githubusercontent.com/u/503761?v=4' alt='Gibby' style='width:100px;'/></a></td>
      <td align="center"><a href='https://github.com/palepinkdot' title='MG: review'><img src='https://avatars.githubusercontent.com/u/55257671?v=4' alt='palepinkdot' style='width:100px;'/></a></td>
      <td align="center"><a href='https://github.com/xthursdayx' title='thursday: infra'><img src='https://avatars.githubusercontent.com/u/18044308?v=4' alt='xthursdayx' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center"><a href='https://vantezzen.io/' title='Bennett: code'><img src='https://avatars.githubusercontent.com/u/10333196?v=4' alt='vantezzen' style='width:100px;'/></a></td>
      <td align="center"><a href='https://gitlab.com/reggermont/' title='Romain Eggermont: infra'><img src='https://avatars.githubusercontent.com/u/14902909?v=4' alt='reggermont' style='width:100px;'/></a></td>
      <td align="center"><a href='https://marchrius.org/' title='Matteo Gaggiano: maintenance, platform, plugin, projectManagement'><img src='https://avatars.githubusercontent.com/u/534837?v=4' alt='marchrius' style='width:100px;'/></a></td>
    </tr>
  </tbody>
  <tfoot>
    
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
