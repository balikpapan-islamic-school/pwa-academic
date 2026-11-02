# syntax=docker/dockerfile:1

# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variabel VITE_* ditanam ke bundle saat build, jadi dikirim sebagai build args (bukan env runtime).
ARG VITE_APP_NAME="BIS - Student"
ARG VITE_DATA_SOURCE=api
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_SPMB_SCHOOL_YEAR=""
ARG VITE_SPMB_URL=""

RUN test -n "$VITE_API_BASE_URL" || (echo "VITE_API_BASE_URL wajib diisi" && exit 1)

ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_DATA_SOURCE=$VITE_DATA_SOURCE \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_SPMB_SCHOOL_YEAR=$VITE_SPMB_SCHOOL_YEAR \
    VITE_SPMB_URL=$VITE_SPMB_URL

RUN npm run build

# ---- Serve ----
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/healthz || exit 1
