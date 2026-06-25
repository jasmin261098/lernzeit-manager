FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts ./

RUN npx prisma generate
RUN npx prisma db push

EXPOSE 3000

CMD ["npm", "run", "dev"]