# ferdi-server
Unofficial Franz server replacement for use with the Ferdi Client.

⚠️ Currently not to be used publicly/productively as there are no validations etc. yet.

## Features
- [x] User registration and login
- [x] Service creation, download, listing and removing
- [x] Workspace support
- [x] Functioning service store

## Setup
1. Clone this repository
2. Install the [AdonisJS CLI](https://adonisjs.com/)
3. Run the database migrations with
    ```js
    adonis migration:run
    ```
4. Start the server with
    ```js
    adonis serve --dev
    ```

## License
ferdi-server is licensed under the MIT License
