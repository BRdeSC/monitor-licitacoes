FROM node:20-alpine

# Instala OpenSSL para compatibilidade com o Prisma Client no Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Copia manifestos de dependências do backend
COPY package*.json ./

# Instala as dependências da API
RUN npm install

# Copia os arquivos de código-fonte
COPY . .

# Expõe a porta de desenvolvimento
EXPOSE 3333

# Inicializa a API REST em modo de desenvolvimento
CMD ["npm", "run", "dev"]