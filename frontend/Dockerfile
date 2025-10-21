# Etapa 1: build del frontend
FROM node:18 AS build
WORKDIR /app

# Copia package.json e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el código fuente
COPY . .

# Importante: pasa el ARG al entorno de build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Compila el build de producción
RUN npm run build

# Etapa 2: servidor Nginx para servir el build
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copia configuración personalizada si la tienes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
