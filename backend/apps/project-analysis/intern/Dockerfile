FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

ENV PORT=5030
EXPOSE 5030

CMD ["node", "server.js"]
