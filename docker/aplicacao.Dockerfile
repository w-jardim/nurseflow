FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY aplicacao/package.json aplicacao/package.json
COPY compartilhado/package.json compartilhado/package.json
RUN npm install
COPY . .
RUN npm --workspace @nurseflow/aplicacao run build

FROM nginx:1.27-alpine AS producao
COPY --from=build /app/aplicacao/dist /usr/share/nginx/html
COPY infraestrutura/nginx/aplicacao.conf /etc/nginx/conf.d/default.conf
