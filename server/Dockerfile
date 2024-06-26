# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json

# Install dependencies
RUN npm install express mssql cors bcrypt multer body-parser dotenv

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the server
CMD ["node", "app.js"]

