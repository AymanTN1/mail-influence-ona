# =========================================================
# Multi-stage Dockerfile for MailInfluence-ONA Backend (C11)
# =========================================================

# Stage 1: Build stage
FROM gcc:bookworm AS builder

WORKDIR /build

# Copy backend sources & headers
COPY backend/include ./include
COPY backend/src ./src
COPY backend/Makefile ./Makefile

# Compile with high optimization flags
RUN make clean && make

# Stage 2: Minimal runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /build/ona_backend /app/ona_backend

# Copy dataset
COPY mock-data /app/mock-data

# Default environment variables
ENV PORT=8080
ENV DATASET_PATH=/app/mock-data/enterprise_emails_dataset.csv

EXPOSE 8080

CMD ["/app/ona_backend"]
