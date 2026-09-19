# Node.js Technical Reference

## Non-Blocking Architecture and Libuv
Node.js uses the V8 JavaScript engine and `libuv` C library to manage non-blocking I/O operations and thread pooling. Libuv manages a thread pool (default 4 threads) for CPU-bound disk and network operations that cannot be performed asynchronously at the OS kernel level.

## Streams and Buffers
Streams handle chunked data reading and writing (Readable, Writable, Duplex, Transform). Streaming reduces memory consumption when handling large files or continuous network payloads. Buffers represent fixed-length raw binary memory allocations outside V8 heap.

## Middleware Pattern and Express
Express web framework uses a layer-based middleware pipeline (`req`, `res`, `next`). Middleware functions execute sequentially, performing request authentication, body parsing, CORS handling, and error middleware handling with 4 parameters `(err, req, res, next)`.

## Process Management and Security
Node.js applications manage concurrency using the `cluster` module or process managers like PM2. Essential security practices include input validation, rate limiting, preventing prototype pollution, sanitizing headers (Helmet), and managing environment secrets safely.
