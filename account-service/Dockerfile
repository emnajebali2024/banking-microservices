FROM node:lts-alpine

WORKDIR /app/account-service

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
COPY --from=proto . /app/proto

RUN mkdir -p /data

EXPOSE 50051

CMD ["node", "index.js"]