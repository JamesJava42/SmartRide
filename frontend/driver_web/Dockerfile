FROM node:20-alpine

WORKDIR /app

COPY driver_web/package.json driver_web/package-lock.json* ./
RUN npm install

COPY driver_web/ .
COPY shared/ ./shared/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
