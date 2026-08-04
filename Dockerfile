# Tracklume frontend image. Build and runtime settings are supplied by build.env.

ARG BUILD_IMAGE=node:20.11-slim
ARG RUNTIME_IMAGE=node:20.11-slim

FROM ${BUILD_IMAGE} AS build
WORKDIR /app
COPY . .
ARG INSTALL_COMMAND="npm ci"
ARG BUILD_COMMAND="npm run build"
ARG RUNTIME_PREPARE_COMMAND="mkdir -p /runtime/.next && cp -a .next/standalone/. /runtime/ && cp -a .next/static /runtime/.next/static && cp -a public /runtime/public"
RUN sh -c "${INSTALL_COMMAND}"
RUN sh -c "${BUILD_COMMAND}"
RUN mkdir -p /runtime && sh -c "${RUNTIME_PREPARE_COMMAND}"

FROM ${RUNTIME_IMAGE} AS runtime
WORKDIR /app
ARG START_COMMAND="node server.js"
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    START_COMMAND="${START_COMMAND}"
COPY --from=build --chown=1001:1001 /runtime/ ./
USER 1001:1001
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=15s \
  CMD ["node", "-e", "require('http').get('http://127.0.0.1:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"]
CMD ["sh", "-c", "exec $START_COMMAND"]
