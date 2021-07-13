# Contributing to ferdi-server

:tada: First off, thanks for taking the time and your effort to make Ferdi better! :tada:

## Table of contents

<!-- TOC depthFrom:2 depthTo:2 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Contributing to ferdi-server](#contributing-to-ferdi-server)
  - [Table of contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [What should I know before I get started?](#what-should-i-know-before-i-get-started)
  - [How Can I Contribute?](#how-can-i-contribute)
  - [Setting up your Development machine](#setting-up-your-development-machine)
    - [Install System-level dependencies](#install-system-level-dependencies)
      - [Node.js, npm, node-gyp](#nodejs-npm-node-gyp)
      - [Git](#git)
    - [Clone repository with submodule](#clone-repository-with-submodule)
    - [Install dependencies](#install-dependencies)
    - [Styleguide](#styleguide)
      - [Git Commit Messages format](#git-commit-messages-format)
      - [Javascript Coding style-checker](#javascript-coding-style-checker)

<!-- /TOC -->

## Code of Conduct

This project and everyone participating in it is governed by the [Ferdi Code of Conduct](https://github.com/getferdi/ferdi/blob/develop/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [stefan@adlk.io](mailto:stefan@adlk.io).

## What should I know before I get started?

For the moment, Ferdi's development is a bit slow but all contributions are highly appreciated. [Check this issue for discussion](https://github.com/getferdi/ferdi/issues/956).

## How Can I Contribute?

As a basic rule, before filing issues, feature requests or anything else. Take a look at the issues and check if this has not already been reported by another user. If so, engage in the already existing discussion.

## Setting up your Development machine

### Install System-level dependencies

#### Node.js, npm, node-gyp

Please make sure you are running the exact node version used by the developers/contributors as specified in the [nvmrc file](./.nvmrc).

Currently, these are the combinations of system dependencies that work on an intel-based machines for MacOS/Linux/Windows (building on an ARM-based machine is still a work-in-progress due to node-sass native dependencies)

```bash
node -v
v14.17.3
npm -v
6.14.12
node-gyp -v
v8.0.0
```

#### Git

The version [2.23.0](https://github.com/git-for-windows/git/releases/tag/v2.23.0.windows.1) for Git is working fine for development. You can then use the console from Git to do the development procedure.

<!-- #### Debian/Ubuntu

```bash
apt install libx11-dev libxext-dev libxss-dev libxkbfile-dev rpm
```

#### Fedora

```bash
dnf install libX11-devel libXext-devel libXScrnSaver-devel libxkbfile-devel rpm
```

#### Windows

Please make sure you run this command as an administrator:

```bash
npm i -g windows-build-tools --vs2015
```
 -->

### Clone repository with submodule

```bash
git clone https://github.com/getferdi/server.git
cd server
git submodule update --init --recursive
```

It is important you execute the last command to get the required submodules (recipes, server).

### Install dependencies

- Run the following command to install all dependencies, and link sibling modules with ferdi-server.

```bash
npm i
```

- Copy the `.env.example` file into `.env` and change the values to match your system.

```bash
cp .env.example .env
```

_Note:_

1. Have env DB_SSL=true only if your database is postgres and it is hosted online on platforms like GCP, AWS, etc
2. You will have to provide a value for `API_KEY` that is at least 16 characters long.

- If using sqlite for local development, create the database directory (whatever is set to `DATA` in `.env`)

```bash
mkdir -p data
```

- Run the database migrations with

  ```bash
  node ace migration:refresh
  ```

- To get the full functionality, you will need to have an SMTP server running for local development.

<!-- ### Package recipe repository

Ferdi requires its recipes to be packaged before it can use it. When running Ferdi as a development instance, you'll need to package the local recipes before you can create any services inside Ferdi.

```bash
cd recipes && npm i && npm run package
``` -->

### Start development app

  ```bash
  npm start --dev
  ```

### Styleguide

#### Git Commit Messages format

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- When only changing documentation, include `[ci skip]` in the commit description

#### Javascript Coding style-checker

- Please use `es-lint` and the defined rules to maintain a consistent style
