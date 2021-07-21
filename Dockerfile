FROM node:lts-alpine as build

WORKDIR /server-build

RUN ["apk", "add", "--no-cache", "python", "make", "gcc", "g++", "libc-dev", "sqlite-dev"]

COPY . /server-build

RUN ["npm", "ci", "--production", "--build-from-source", "--sqlite=/usr/local"]

FROM node:lts-alpine

WORKDIR /app
LABEL maintainer="xthursdayx"

ENV HOST=0.0.0.0 PORT=3333 DATA_DIR="/data" 

RUN ["apk", "add", "--no-cache", "sqlite-libs", "curl", "su-exec"]

COPY --from=build /server-build /app
RUN ["npm", "i", "-g", "@adonisjs/cli"]

HEALTHCHECK --interval=5m --timeout=3s CMD curl -sSf http://localhost:${PORT}/health

COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/.env /app/.env
CMD ["/entrypoint.sh"]
