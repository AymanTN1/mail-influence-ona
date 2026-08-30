# =========================================================
# Dockerfile for MailInfluence-ONA Backend (C11)
# =========================================================

FROM gcc:bookworm AS builder

WORKDIR /build

COPY include ./include
COPY src ./src
COPY Makefile ./Makefile

RUN make clean && make

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/ona_backend /app/ona_backend

ENV PORT=8080

EXPOSE 8080

CMD ["/app/ona_backend"]
