FROM node:lts-alpine3.14

ARG USER=node

ENV HOME=/home/${USER}

RUN apk add python3 alpine-sdk \
    && mkdir ${HOME}/app

COPY . "${HOME}/app/"

RUN cd ${HOME}/app \
    && yarn install \
    && npm run build 

WORKDIR ${HOME}/app/

ENTRYPOINT [ "npm", "start" ]