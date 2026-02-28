# Dockerfile
# Next.js (App Router) + Tailwind + shadcn/ui + Auth0
# Optimized multi-stage build using Next "standalone" output.

########## deps ##########
FROM node:20-alpine AS deps
WORKDIR /app

# If you use native deps (rare), you may need:
# RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

########## builder ##########
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure Next builds a standalone server bundle.
# Add this to next.config.(js|mjs|ts):
#   export default { output: "standalone" }
RUN npm run build

########## runner ##########
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Optional: run as non-root
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy standalone build output
# This folder exists only when next.config sets output: "standalone"
COPY --from=builder /app/.next/standalone ./

# Static assets + public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# If you use next/image optimization, set this for correct runtime caching:
ENV PORT=3000
EXPOSE 3000

USER nextjs

# The standalone output includes server.js at the root
CMD ["node", "server.js"]