FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

EXPOSE 3000 9229

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm ci

RUN npx prisma generate

COPY . .

ENV NODE_OPTIONS="--inspect=0.0.0.0:9229"

CMD ["npm", "run", "dev"]
