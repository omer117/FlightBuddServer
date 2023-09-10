FROM node:alpine

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 3004


RUN npm run build


CMD [ "node","dist/app.js" ]

