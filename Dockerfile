FROM node:lts as builder
WORKDIR /app
COPY package*.json /app/
RUN npm ci
COPY tsconfig.json /app/
COPY src/ /app/src/
COPY public/ /app/public/
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf