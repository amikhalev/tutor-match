FROM node:alpine

ADD package.json package-lock.json /app/
WORKDIR /app/
RUN npm install --production --verbose

ADD index.js .env /app/
ADD static/ /app/static
ADD views/ /app/views
ADD dist/ /app/dist

EXPOSE 8080
ENTRYPOINT [ "node", "index.js" ]
