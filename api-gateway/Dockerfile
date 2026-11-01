FROM node:lts-alpine

WORKDIR /app/api-gateway

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
COPY --from=proto . /app/proto

EXPOSE 3000

CMD ["node", "index.js"]