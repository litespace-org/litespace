# LiteSpace Models Package

This package can be considered as the controllers of the entities or data models defined in [types](../types//README.md) package. The database is initialized and seeded by this package. And it is primary used by [the server](../../services/server) in order to communicate with the database while handling users requests.

## Main Dependencies

inner dependencies:
- [types](../types/README.md)
- [sol](../sol/README.md)

outer dependencies:
- [Knex](https://knexjs.org/)
- [Redis](https://redis.io/)
- [Lodash](https://lodash.com/docs/4.17.15)
- [Zod](https://zod.dev/)
