# Description: Dockerfile for the nodejs app

# Get the base image
FROM node:23-alpine

# Create app directory
RUN mkdir -p /home/app

# Copy the app to the container
COPY ./app /home/app 

# Set the working directory
WORKDIR /home/app

# Install the dependencies
RUN npm install

# Run the app
CMD ["npm", "start"]