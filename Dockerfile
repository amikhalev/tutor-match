FROM node:alpine

RUN npm install -g yarn
ADD package.json yarn.lock /app/
WORKDIR /app/
RUN yarn install --production

ADD index.js /app/
ADD static/ /app/static
ADD views/ /app/views
ADD dist/ /app/dist

EXPOSE 8080
ENTRYPOINT [ "node", "index.js" ]
