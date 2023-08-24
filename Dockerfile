# Use a lightweight Node.js 12 image as the base
FROM node:16-alpine as base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Stage for building application
FROM base as build
RUN apk update
# Install development dependencies and build the application
RUN apk add --no-cache --virtual .build-deps g++ && \
    npm install && \
    apk del .build-deps

# Copy the application code from the build stage
COPY . .

# Expose the port your application uses (replace 3000 with your actual port)
EXPOSE 3000

# Command to run your application
CMD ["node", "index.js"]
