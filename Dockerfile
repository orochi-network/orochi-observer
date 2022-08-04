FROM node:16.16.0

ARG USER=node

ENV HOME=/home/${USER}

RUN mkdir ${HOME}/app

COPY . "${HOME}/app/"

RUN cd ${HOME}/app \
    && yarn install \
    && npm run build 

WORKDIR ${HOME}/app/

ENTRYPOINT [ "npm", "start" ]