FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .

RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

CMD ["node", "index.js"]

