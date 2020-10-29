FROM node:slim
WORKDIR /usr/src/app
COPY ./app .
WORKDIR /usr/src/app/react-sample
RUN yarn install
EXPOSE 3000
ENTRYPOINT ["yarn", "start"]