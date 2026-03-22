FROM node:20-alpine

WORKDIR /app

COPY rider_web/package.json rider_web/package-lock.json* ./
RUN npm install

COPY rider_web/ .
COPY shared/ ./shared/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
