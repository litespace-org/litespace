# LiteSpace Auth Package

Authentication and autherization logic is segregated from all LiteSpace components/packages by inclusively defining it in this package.

## Overview (Developer Guide)

### Extend The Request Type

The express.Request struct type is extended, to include __query_ and _user_ properties, in [src/index.ts](./src/index.ts). The first is used for handshaking, and the latter for authorization (it should be initialized after authentication).

### AuthMiddleware

The _authMiddleware_ in [src/middleware.ts](./src/middleware.ts) investigates the clients requests header and authenticate them with either the 'Basic' or 'Bearer' method. By convention or by the system definition, so to speak, the 'Basic' method is only applied for _ghost_ clients. Whereas the `Bearer` method must be applied for regular clients (the end users).

> A ghost client is a system that joins and participates to sessions in order to carry recording and storing them.

### Authorizer Class

[src/autherization.ts](./src/authorization.ts) exports the Autherizer class which is basically a container in which you can add different roles with the _role_ method, and eventually check users for autherization with _check(user)_ method.

### JWT

JWT encoding and decoding functions are written in [src/jwt.ts](./src/jwt.ts).
