FROM node:22-alpine AS base
WORKDIR /app
RUN npm -g install pnpm

ENV PUBLIC_EXTERNAL_DIRECTUS_API_URL=https://directus.vinnipedia.org
ENV PUBLIC_INTERNAL_DIRECTUS_API_URL=http://directus-web:8055
ENV PUBLIC_EXTERNAL_HOST_URL=https://resaundtill.de
ENV PUBLIC_INTERNAL_HOST_URL=http://localhost:3000
ENV PUBLIC_SERVER=true

FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run check
RUN pnpm run build

FROM base AS runner
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/build ./build

STOPSIGNAL SIGTERM
EXPOSE 3000
CMD ["node", "build"]