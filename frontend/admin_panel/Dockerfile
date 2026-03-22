FROM node:20-alpine

WORKDIR /app

COPY admin_panel/package.json admin_panel/package-lock.json* ./
RUN npm install

COPY admin_panel/ .
COPY shared/ ./shared/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
