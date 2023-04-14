#FROM node:12.12.0-alpine
#WORKDIR /app
#EXPOSE 3001
#COPY . /app
#RUN apk --no-cache add curl
#RUN npm install -g nodemon
#RUN npm install
#RUN npm run start
#CMD ["npm", "startDev"]

FROM node:12.12.0-alpine as debug

WORKDIR /app/
COPY ./package.json /app/package.json
RUN apk --no-cache add curl
RUN npm install
RUN npm install -g nodemon
COPY . /app/

ENTRYPOINT [ "nodemon","--inspect=0.0.0.0","./server.js" ]