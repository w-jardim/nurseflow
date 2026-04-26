FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dependencias
COPY package.json package-lock.json* ./
COPY servidor/package.json servidor/package.json
COPY compartilhado/package.json compartilhado/package.json
RUN npm install

FROM dependencias AS build
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM base AS producao
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/servidor/dist ./servidor/dist
COPY --from=build /app/servidor/prisma ./servidor/prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/servidor/package.json ./servidor/package.json
CMD ["node", "servidor/dist/main.js"]
