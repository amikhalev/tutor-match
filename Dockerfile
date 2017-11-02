FROM node:alpine

RUN npm install -g yarn nodemon
ADD package.json yarn.lock /app/
WORKDIR /app/
RUN yarn install --production --verbose

ADD index.js .env /app/
ADD static/ /app/static
ADD views/ /app/views
ADD dist/ /app/dist

EXPOSE 8080
ENTRYPOINT [ "node", "index.js" ]
