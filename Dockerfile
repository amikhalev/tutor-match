FROM node:alpine

RUN apk add --no-cache make bash git
RUN npm install -g yarn
ADD package.json yarn.lock /app/
WORKDIR /app/
RUN yarn install --production=false

ADD Makefile index.js tslint.json /app/
ADD client/ /app/client
ADD common/ /app/common
ADD server/ /app/server
ADD static/ /app/static
ADD views /app/views

RUN make build

# FROM node:alpine

# WORKDIR /app/
# COPY --from=0 /app .
ENV PORT=80

EXPOSE 80
ENTRYPOINT [ "node", "index.js" ]
