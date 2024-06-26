# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
RUN npx create-react-app client
WORKDIR /usr/src/app/client
RUN rm -rf src
COPY . .
# Install dependencies
RUN npm install react react-dom axios

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Serve the React app using serve
RUN npm install -g serve
CMD ["serve", "-s", "build"]

# Expose the port the app runs on
EXPOSE 5000

