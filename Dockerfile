FROM node:22.18.0-alpine AS builder

WORKDIR /server-build

RUN apk add --no-cache python3 make gcc g++ libc-dev sqlite-dev

ENV CI=true

COPY package*.json ./
COPY .npmrc ./
COPY patches ./patches

RUN npm i -gf "pnpm@$(node -p 'require("./package.json").engines.pnpm')" && pnpm -v
RUN pnpm install --config.build-from-source=sqlite --config.sqlite=/usr/local

COPY . .

RUN pnpm build

# ---- RECIPES IMAGE ----------------------------------------------------------
FROM node:22.18.0-alpine AS recipes

# needed for simple-git repository checks, even though this isn't a git repository
RUN apk add --no-cache git

WORKDIR /recipes

ENV CI=true
ENV NODE_ENV=development

RUN wget -qO- https://github.com/ferdium/ferdium-recipes/archive/refs/heads/main.tar.gz | tar xz --strip-components=1

RUN npm i -gf "pnpm@$(node -p 'require("./package.json").engines.pnpm')" && pnpm -v
RUN pnpm install
RUN pnpm package

# ---- RUNTIME IMAGE ----------------------------------------------------------
FROM node:22.18.0-alpine

WORKDIR /app
LABEL maintainer="ferdium"

# TODO: Shouldn't we set 'NODE_ENV=production' when running in production mode?
ENV HOST=0.0.0.0 PORT=3333 DATA_DIR="/data"

# TODO: Are all these packages needed for the runtime image?
RUN apk add --no-cache sqlite-libs curl su-exec python3 make g++ py3-pip git py3-pip sqlite
# The next command is needed for sqlite3 install command executed by node-gyp
# RUN ln -s /usr/bin/python3 /usr/bin/python

COPY --from=builder /server-build /app
RUN npm i -g @adonisjs/cli

# TODO: Do we need to copy more things over?
COPY --from=recipes /recipes/archives /app/recipes/archives
COPY --from=recipes /recipes/all.json /recipes/featured.json /app/recipes/

HEALTHCHECK --start-period=5s --interval=30s --retries=5 --timeout=3s CMD curl -sSf http://localhost:${PORT}/health

COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/.env /app/.env

ENTRYPOINT ["/entrypoint.sh"]
