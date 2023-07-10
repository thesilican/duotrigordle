FROM node:lts as builder
WORKDIR /app
COPY package*.json /app/
RUN npm ci
COPY . /app/
RUN npm run build

FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/
COPY nginx/default.conf.template /etc/nginx/templates/
COPY --from=builder /app/build/ /public
ENV PORT 8080
ENV PUBLIC_DIR /public
