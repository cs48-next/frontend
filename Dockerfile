FROM node:latest as build-deps
WORKDIR /usr/src/frontend
COPY package.json ./
RUN npm install
ADD src/ ./src
ADD public/ ./public
RUN npm run build

# Stage 2 - the production environment
FROM nginx:latest 
COPY --from=build-deps /usr/src/frontend/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
ADD conf/ /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]