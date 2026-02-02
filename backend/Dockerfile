FROM node:18

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node typescript

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "ts-node --transpile-only server.ts & ts-node --transpile-only worker.ts"]
