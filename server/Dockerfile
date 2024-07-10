# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.10.0

# If the docker image should expose it's port, default=true
# Needed for cloud deployment, it is exposed there programmatically
ARG EXPOSE_PORT=true

FROM node:${NODE_VERSION}-alpine as base

# Create app folder in /usr/src/notes-backend
# Use exec form, not shell form, as exec form is executed directly 
RUN ["mkdir", "-p", "/usr/src/notes-backend"]

WORKDIR /usr/src/notes-backend/

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
# Use exec form
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    ["npm", "ci", "--omit=dev"]

# Give node user read/write access to prisma folder, so that prisma can run properly
RUN ["chown", "-R", "node:node", "./node_modules/prisma"]
RUN ["chown", "-R", "node:node", "./node_modules/.prisma"]

# Copy the rest of the source files into the image.
COPY . .

ARG EXPOSE_PORT

FROM base as base-exposed-true
# Expose the port that the application listens on.
RUN echo "Expose default port 5000"
EXPOSE 5000

FROM base as base-exposed-false
RUN echo "Don't expose default port 5000, will be done on cloud"

FROM base-exposed-${EXPOSE_PORT} as final

# Run the application
# Use exec form
CMD ["npm", "run", "start:docker"]
