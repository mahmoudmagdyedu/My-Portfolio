FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE $PORT
CMD ["node", "server.js"]
