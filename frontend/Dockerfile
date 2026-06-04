FROM node:22

WORKDIR /app

COPY lernzeit-manager/package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]