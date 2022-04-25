FROM node:16.14-alpine as build

WORKDIR /server-build

RUN ["apk", "add", "--no-cache", "python3", "make", "gcc", "g++", "libc-dev", "sqlite-dev"]

COPY . /server-build

RUN npm i -g npm@8.7.0
RUN ["npm", "ci", "--production", "--build-from-source", "--sqlite=/usr/local"]

FROM node:16.4-alpine

WORKDIR /app
LABEL maintainer="ferdium"

ENV HOST=0.0.0.0 PORT=3333 DATA_DIR="/data"

RUN ["apk", "add", "--no-cache", "sqlite-libs", "curl", "su-exec"]

COPY --from=build /server-build /app
RUN ["npm", "i", "-g", "@adonisjs/cli"]

HEALTHCHECK --start-period=5s --interval=30s --retries=5 --timeout=3s CMD curl -sSf http://localhost:${PORT}/health

COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/.env /app/.env
CMD ["/entrypoint.sh"]
