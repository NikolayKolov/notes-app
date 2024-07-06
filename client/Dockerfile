# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.10.0

# Pass an ARG that signals if the container should contain a separate proxy server/load balancer service or not (default = false)
# The proxy server now just acts as a reverse proxy for the back end - any calls to /api are redirected to backend service.
# It may be more beneficial when the app grows to make a separate proxy service to direct traffic to various back ends,
# but it can be good to make it a smaller container with just 2 services when a proxy isn't that necessary

# The nginx server can also be a load balancer, but this app will be deployed on 
# AWS ECS with a more advanced application auto load balancer and will use this instead

# Nginx load balancer - https://nginx.org/en/docs/http/ngx_http_upstream_module.html#upstream
ARG USE_PROXY=false

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as build

# Create app folder in /usr/src/notes-frontend
# Use exec form, not shell form, as exec form is executed directly 
RUN ["mkdir", "-p", "/usr/src/notes-frontend"]

# Set working directory for all build stages.
WORKDIR /usr/src/notes-frontend/

# Use production node environment by default.
#ENV NODE_ENV production

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
# Don't use "--omit=dev", use dev dependencies for compiling and building TypeScript with "tsc && vite build"
# The next stage just takes the build from /dist folder and uses that, so it won't matter for image size
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    ["npm", "ci"]

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN ["npm", "run", "build"]

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
# Use an nginx web server to run the generated build. 
FROM nginx:1.26.1-alpine as final

WORKDIR /usr/share/nginx/

RUN ["rm", "-rf", "html"]
RUN ["mkdir", "html"]

WORKDIR /

# Use the value of passed arg
ARG USE_PROXY

# If ARG USE_PROXY is set to default value of true, load appropriate conf
FROM final as final-proxy-true
RUN echo "this is the stage from USE_PROXY=true"
ENV NGINX_CONF=nginx.conf

# If ARG USE_PROXY is set to default value of true, load appropriate conf
FROM final as final-proxy-false
RUN echo "this is the stage from from USE_PROXY=false"
ENV NGINX_CONF=nginx-noproxy.conf


FROM final-proxy-${USE_PROXY}

# Copy appropriate *.conf server settings to docker image
# Use file /etc/nginx/conf.d/default.conf rather than /etc/nginx/nginx.conf on image,
# because /etc/nginx/nginx.conf already includes all *.conf files in folder /etc/nginx/conf.d/
COPY --from=build /usr/src/notes-frontend/nginx/${NGINX_CONF} /etc/nginx/conf.d/default.conf

# Copy generated app build to web server folder
COPY --from=build /usr/src/notes-frontend/dist/ /usr/share/nginx/html/

# Expose the port that the application listens on.
EXPOSE 4173

# Run the application.
# -g flag for directives, daemon off runs nginx in foreground as a main process
# this is optimized for production, as docker containers are a singel process,
# and if the main process stops, so will the other background threads like nginx daemon running in background
CMD ["nginx", "-g", "daemon off;"]
