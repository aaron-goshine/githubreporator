# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the application's source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Define the command to run the application
CMD [ "node", "dist/index.js" ]
