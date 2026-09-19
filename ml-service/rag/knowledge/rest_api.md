# REST API Technical Reference

## REST Architectural Constraints
REST (Representational State Transfer) relies on stateless communication, client-server separation, cacheability, uniform interface, and layered system architecture. Resources are identified via URI endpoints and manipulated using HTTP methods (GET, POST, PUT, PATCH, DELETE).

## Idempotency and HTTP Status Codes
GET, PUT, DELETE, and HEAD operations are idempotent (producing identical side effects regardless of invocation frequency). POST operations are non-idempotent. Standard status codes include 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, and 500/503 Server Errors.

## Authentication and Security
Stateless authentication commonly uses JSON Web Tokens (JWT) or API keys sent via HTTP Authorization Bearer headers. Security practices include HTTPS encryption, CORS origin validation, rate limiting, and request payload validation.

## Pagination and Versioning
Large API result sets are paginated using offset/limit or cursor-based pagination. API versioning techniques include URI path prefixes (`/api/v1/`), query parameters, or HTTP accept headers.
