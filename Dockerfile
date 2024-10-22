FROM node:lts-slim 

WORKDIR /app

COPY package.json .

RUN npm install --legacy-peer-deps

COPY . .

CMD ["npm", "start"]

EXPOSE 9000
