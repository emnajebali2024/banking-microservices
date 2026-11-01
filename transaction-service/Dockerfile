FROM node:lts-alpine

WORKDIR /app/transaction-service

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
COPY --from=proto . /app/proto

RUN mkdir -p /data

EXPOSE 50052

CMD ["node", "index.js"]