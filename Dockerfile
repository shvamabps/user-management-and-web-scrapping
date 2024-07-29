FROM node:lts-slim 

WORKDIR /app

COPY package.json /app

RUN npm install --legacy-peer-deps

COPY . /app

CMD ["npm", "start"]

EXPOSE 9000
