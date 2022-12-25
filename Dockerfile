FROM node

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

#ENV TELEGRAM_API_TOKEN 5766357787:AAHz_AKrlyf30z_QpFLDM38BvsnbPmLwqHQ

CMD ["npm", "start"]
