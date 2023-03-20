# Contributing to ferdium-server

:tada: First off, thanks for taking the time and your effort to make Ferdium better! :tada:

## Table of contents

<!-- TOC depthFrom:2 depthTo:2 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Contributing to ferdium-server](#contributing-to-ferdium-server)
  - [Table of contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [What should I know before I get started?](#what-should-i-know-before-i-get-started)
  - [How Can I Contribute?](#how-can-i-contribute)
  - [Setting up your Development machine](#setting-up-your-development-machine)
    - [Install System-level dependencies](#install-system-level-dependencies)
      - [Node.js, pnpm, python](#nodejs-pnpm-python)
      - [Git](#git)
    - [Clone repository with submodule](#clone-repository-with-submodule)
    - [Install dependencies](#install-dependencies)
    - [Start development app](#start-development-app)
    - [Styleguide](#styleguide)
      - [Git Commit Messages format](#git-commit-messages-format)
      - [Javascript Coding style-checker](#javascript-coding-style-checker)

<!-- /TOC -->

## Code of Conduct

This project and everyone participating in it is governed by the [Ferdium Code of Conduct](https://github.com/ferdium/ferdium-app/blob/develop/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [hello@ferdium.org](mailto:hello@ferdium.org).

## What should I know before I get started?

For the moment, Ferdium's development is just getting started but all contributions (code, testing, bug-logging, feature-suggestions) are highly appreciated.

## How Can I Contribute?

As a basic rule, before filing issues, feature requests or anything else, please take a look at the issues and check if this has not already been reported by another user. If so, engage in the already existing discussion.

## Setting up your Development machine

### Install System-level dependencies

#### Node.js, pnpm, python

Please make sure you are conforming to the `engines` requirements used by the developers/contributors as specified in the [`package.json`](./package.json#engines) and [`recipes/package.json`](./recipes/package.json#engine) files.

Currently, these are the combinations of system dependencies that work for MacOS/Linux/Windows:

```bash
$ jq --null-input '[inputs.engines] | add' < ./package.json < ./recipes/package.json
{
  "node": "18.15.0",
  "pnpm": "7.30.0",
  "python": "3.11.1"
}
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
git clone https://github.com/ferdium/ferdium-server.git
cd ferdium-server
git submodule update --init --recursive --remote --rebase --force
```

It is important you execute the last command to get the required submodules (recipes).

### Install dependencies

- Run the following command to install all dependencies, and link sibling modules with ferdium-server.

```bash
pnpm i
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

### Start development app

```bash
pnpm start --dev
```

### Styleguide

#### Git Commit Messages format

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- When only changing documentation, include `[ci skip]` in the commit description

#### Javascript Coding style-checker

- Please use `lint` and `lint:fix` and the defined rules to maintain a consistent style
