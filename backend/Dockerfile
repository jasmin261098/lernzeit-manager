FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts ./

COPY entrypoint.sh ./

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]