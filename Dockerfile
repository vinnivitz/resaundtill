FROM node:18-alpine as base
WORKDIR /app
RUN npm -g install pnpm

FROM base as builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run check
RUN pnpm run build
ARG PUBLIC_DIRECTUS_API_TOKEN
ENV PUBLIC_DIRECTUS_API_TOKEN ${PUBLIC_DIRECTUS_API_TOKEN}
ARG PUBLIC_DIRECTUS_API_URL
ENV PUBLIC_DIRECTUS_API_URL ${PUBLIC_DIRECTUS_API_URL}

FROM base as runner
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/build ./build
ARG PUBLIC_DIRECTUS_API_TOKEN
ENV PUBLIC_DIRECTUS_API_TOKEN ${PUBLIC_DIRECTUS_API_TOKEN}
ARG PUBLIC_DIRECTUS_API_URL
ENV PUBLIC_DIRECTUS_API_URL ${PUBLIC_DIRECTUS_API_URL}

STOPSIGNAL SIGTERM
EXPOSE 3000
CMD ["node", "build"]