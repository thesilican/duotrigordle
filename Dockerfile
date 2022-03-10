FROM node:lts as builder
WORKDIR /app
COPY package*.json /app/
RUN npm ci
COPY . /app/
RUN npm run build

FROM httpd:2.4
COPY --from=builder /app/build /usr/local/apache2/htdocs/
