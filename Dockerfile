FROM node:16 as builder

WORKDIR /build
COPY ./web .
COPY ./VERSION .
RUN yarn install
RUN REACT_APP_VERSION=$(cat VERSION) yarn build

FROM golang AS builder2

ENV GO111MODULE=on \
    CGO_ENABLED=1 \
    GOOS=linux

WORKDIR /build
COPY . .
COPY --from=builder /build/build ./web/build
RUN go mod download
RUN go build -ldflags "-s -w -X 'message-pusher/common.Version=$(cat VERSION)' -extldflags '-static'" -o message-pusher

FROM alpine

ENV PORT=3000
RUN apk update \
    && apk upgrade \
    && apk add --no-cache ca-certificates tzdata \
    && update-ca-certificates 2>/dev/null || true
COPY --from=builder2 /build/message-pusher /
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/message-pusher"]
