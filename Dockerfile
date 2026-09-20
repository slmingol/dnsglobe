# Build stage
FROM rust:1.88-slim AS build
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release --bins -j2

# Runtime stage — no libc needed (pure UDP/TCP, no TLS)
FROM gcr.io/distroless/cc-debian12
COPY --from=build /app/target/release/dnsglobe     /usr/local/bin/dnsglobe
COPY --from=build /app/target/release/dnsglobe-web /usr/local/bin/dnsglobe-web
ENTRYPOINT ["/usr/local/bin/dnsglobe"]
