FROM node:20-alpine AS deps
WORKDIR /app
# Copy package files
COPY package.json package-lock.json* ./

RUN npm ci

# --- Stage 2: Build Next.js ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Tambahkan ini jika frontend Anda perlu menembak URL julu-api:
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build project
RUN npm run build

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# create user non-root for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy file public (aset image/font)
COPY --from=builder /app/public ./public

# Folder .next/standalone 
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3005
ENV PORT 3005

ENV HOSTNAME "0.0.0.0" 

CMD ["node", "server.js"]
# CMD ["npm", "run", "start"]