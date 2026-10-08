FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV GITHUB_AUTH_MODE=public

# Create non-root user
RUN addgroup -S gitglucose && adduser -S gitglucose -G gitglucose

# Copy application files
COPY package.json ./
COPY server/ ./server/
COPY public/ ./public/

# Set ownership
RUN chown -R gitglucose:gitglucose /app

USER gitglucose

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

CMD ["node", "server/index.js"]
