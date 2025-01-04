# Description: Dockerfile for the Skywatch Tools
FROM node:lts
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Create app directory
WORKDIR /app
COPY package*.json bun.lockb ./

# Install app dependencies
RUN bun i

# Bundle app source
COPY . .

# Expose the port the app runs
EXPOSE 4101

# Serve the app
CMD ["bun", "run", "start"]
