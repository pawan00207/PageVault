# cd server
# docker build -t publishelf-backend . 
# docker run -p 3000:3000 publishelf-backend

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]