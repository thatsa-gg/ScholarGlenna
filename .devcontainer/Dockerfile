ARG VARIANT="bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}
ARG INSTALL_ZSH="false"
ARG UPGRADE_PACKAGES="false"
ARG ENABLE_NONROOT_DOCKER="true"
ARG USE_MOBY="true"
ENV DOCKER_BUILDKIT=1
ARG USERNAME=automatic
ARG USER_UID=1000
ARG USER_GID=$USER_UID
COPY library-scripts/*.sh /tmp/library-scripts/
RUN apt-get update \
    && /bin/bash /tmp/library-scripts/common-debian.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" "true" "true" \
    && /bin/bash /tmp/library-scripts/docker-in-docker-debian.sh "${ENABLE_NONROOT_DOCKER}" "${USERNAME}" "${USE_MOBY}" "latest" "v2" \
    && apt-get install -y iputils-ping \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/* /tmp/library-scripts/
ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
VOLUME [ "/var/lib/docker" ]
CMD [ "sleep", "infinity" ]
RUN echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && echo "deb https://deb.nodesource.com/node_18.x $(lsb_release -cs) main" > /etc/apt/sources.list.d/nodesource.list \
    && echo "deb-src https://deb.nodesource.com/node_18.x $(lsb_release -cs) main" >> /etc/apt/sources.list.d/nodesource.list \
    && echo "deb https://packages.redis.io/deb $(lsb_release -cs) main" > /etc/apt/sources.list.d/redis.list \
    && apt-key adv --fetch-keys https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    && apt-key adv --fetch-keys https://deb.nodesource.com/gpgkey/nodesource.gpg.key \
    && apt-key adv --fetch-keys https://packages.redis.io/gpg \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc g++ make \
        nodejs=18.* \
        postgresql-client \
        redis \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/* \
    && corepack enable
