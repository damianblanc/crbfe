# Build CRBFE React app
FROM node:14 as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve CRBFE React app
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html