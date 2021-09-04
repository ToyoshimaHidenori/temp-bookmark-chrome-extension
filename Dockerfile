FROM node:14-alpine as build
RUN apk update && \
    apk upgrade && \
    apk add make && \
    rm -rf /var/cache/apk/*

WORKDIR /
COPY . .
RUN yarn install
RUN yarn run build