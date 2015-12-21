FROM node:slim

WORKDIR /src

COPY ./package.json /src/

RUN cd /src && npm install

COPY ./*.js /src/

EXPOSE 80

CMD ["npm", "start"]
