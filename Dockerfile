# ---- Base Stage ----
FROM node:24-alpine AS base
WORKDIR /app

# Optional: global tooling
RUN npm install -g typescript

# ---- Development Stage ----
FROM base AS development

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200
CMD ["npm", "run", "dev"]

# ---- Production Dependencies Stage ----
FROM base AS prod-deps

COPY package*.json ./
RUN npm ci --omit=dev

# ---- Build Stage ----
FROM prod-deps AS build
COPY . ./

ARG NODE_ENV=production

# Redeclare arguments for runtime
ARG VITE_APP_KEYCLOAK_REALM
ARG VITE_APP_KEYCLOAK_CLIENTID
ARG VITE_APP_KEYCLOAK_URL
ARG VITE_APP_API_BASE_URL

# Set environment variables for runtime
ENV VITE_APP_KEYCLOAK_REALM=$VITE_APP_KEYCLOAK_REALM
ENV VITE_APP_KEYCLOAK_CLIENTID=$VITE_APP_KEYCLOAK_CLIENTID
ENV VITE_APP_KEYCLOAK_URL=$VITE_APP_KEYCLOAK_URL
ENV VITE_APP_API_BASE_URL=$VITE_APP_API_BASE_URL

# build the web app
COPY ./load_env_build.sh ./
CMD ["sh", "load_env_build.sh"]
