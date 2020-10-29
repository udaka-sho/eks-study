FROM node:slim
WORKDIR /usr/src/app
COPY ./app .
RUN yarn install
EXPOSE 8080
ENTRYPOINT ["yarn", "start"]