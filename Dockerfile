FROM nginx:alpine
# Healthcheck managed by Coolify
COPY . /usr/share/nginx/html/
EXPOSE 80
