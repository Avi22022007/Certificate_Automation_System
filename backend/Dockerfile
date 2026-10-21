FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads && chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER node

CMD ["node", "server.js"]