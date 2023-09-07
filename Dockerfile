FROM node:18.15.0-alpine as build

WORKDIR /server-build

RUN apk add --no-cache python3 make gcc g++ libc-dev sqlite-dev

COPY . /server-build

ENV CI=true
RUN PNPM_VERSION=$(node -p 'require("./package.json").engines.pnpm'); npm i -g pnpm@$PNPM_VERSION
RUN pnpm install --config.build-from-source=sqlite --config.sqlite=/usr/local

# ---- RUNTIME IMAGE ----------------------------------------------------------
FROM node:18.15.0-alpine

WORKDIR /app
LABEL maintainer="ferdium"

# TODO: Shouldn't we set 'NODE_ENV=production' when running in production mode?
ENV HOST=0.0.0.0 PORT=3333 DATA_DIR="/data"

RUN apk add --no-cache sqlite-libs curl su-exec python3 make g++ py3-pip git py3-pip
# The next command is needed for sqlite3 install command executed by node-gyp
RUN ln -s /usr/bin/python3 /usr/bin/python


COPY --from=build /server-build /app
RUN npm i -g @adonisjs/cli

HEALTHCHECK --start-period=5s --interval=30s --retries=5 --timeout=3s CMD curl -sSf http://localhost:${PORT}/health

COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/.env /app/.env

ENTRYPOINT ["/entrypoint.sh"]
