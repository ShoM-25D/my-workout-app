FROM rust:1.94-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

COPY src ./src
RUN touch src/main.rs && cargo build --release

FROM alpine:latest

RUN apk add --no-cache openssl

WORKDIR /app

COPY --from=builder /app/target/release/rust-service .

EXPOSE 8002

CMD ["./rust-service"]