FROM node:25-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

ENV PORT=3000
ENV APP="THIS IS MY PROJECT"
CMD ["node","index.js"]

