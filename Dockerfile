FROM node:16-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm i

ENTRYPOINT node ./lib/index.js