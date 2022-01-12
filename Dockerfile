#use node latest as the base image; we can consider a LTS version node instead to keep stability
FROM node:latest
#define the work directory folder in docker container
WORKDIR ./
#copy package and package-lock first and perform npm install or npm ci.
#This is to take the benefits of docker builde cache;
#Normally package file is not frequently changed, so docker will use cached step to skip repeatly reinstall npm packages when we only have code changes
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci

COPY / .
RUN npm run start
EXPOSE 3000
ENTRYPOINT [ "node", "." ]
