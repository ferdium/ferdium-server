FROM lsiobase/alpine:3.11

# version labels
ARG BUILD_DATE
LABEL build_version="Ferdi-server-docker Build-date:- ${BUILD_DATE}"
LABEL maintainer="xthursdayx"

ARG FERDI_RELEASE
ENV NODE_VERSION=10.16.3 
ENV S6_BEHAVIOUR_IF_STAGE2_FAILS=2

# install packages
RUN \
  echo "**** installing build packages ****" && \
  apk add --no-cache \
   libcap \
   libstdc++ \
   nano && \
  apk add --no-cache --virtual .build-deps \
   binutils-gold \
   curl \
   gnupg \
   gcc \
   g++ \
   linux-headers \
   make \
   memcached \
   python && \
  echo "**** downloading keys ****" && \
  # gpg keys listed at https://github.com/nodejs/node#release-keys
  for key in \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    77984A986EBC2AA786BC0F66B01FBB92821C587A \
    8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
    4ED778F539E3634C779C87C6D7062848A1AB005C \
    A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
    B9E2F5981AA6E0CD28160D9FF13993A75599653C \
  ; do \
    gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
    gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done && \
  echo "**** installing node ****" && \
  curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.xz" && \
  curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" && \
  gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc && \
  grep " node-v$NODE_VERSION.tar.xz\$" SHASUMS256.txt | sha256sum -c - && \
  tar -xf "node-v$NODE_VERSION.tar.xz" && \
  cd "node-v$NODE_VERSION" && \
  ./configure --prefix=/usr && \
  make -j$(getconf _NPROCESSORS_ONLN) V= && \
  make install && \
  apk del .build-deps && \
  cd / && \
  rm -Rf "node-v$NODE_VERSION" && \
  rm "node-v$NODE_VERSION.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt
  
RUN \
  apk add --no-cache --virtual .build-deps-ferdi \
  curl \
  gnupg \
  tar && \
  echo "**** installing npm ****" && \
  npm config set unsafe-perm true && \
  npm install -g npm@latest && \
  find /usr/lib/node_modules/npm -name test -o -name .bin -type d | xargs rm -rf && \
  echo "**** install ferdi server ****" && \
  mkdir -p /ferdi && \
  curl -o /ferdi/ferdi.tar.gz -L "https://github.com/getferdi/server/archive/master.tar.gz" && \
  echo "**** cleanup ****" && \
  apk del .build-deps-ferdi && \
  rm -rf \
   ${RM_DIRS} \
   /SHASUMS256.txt \
   /tmp/* \
   /var/cache/apk/* \
   /usr/share/man/* \
   /usr/share/doc \
   /root/.node-gyp \
   /root/.config \
   /usr/lib/node_modules/npm/man \
   /usr/lib/node_modules/npm/doc \
   /usr/lib/node_modules/npm/html \
   /usr/lib/node_modules/npm/scripts
  
COPY root/ /

USER root

# ports and volumes
EXPOSE 80 443
VOLUME /app/database /app/recipes /config
