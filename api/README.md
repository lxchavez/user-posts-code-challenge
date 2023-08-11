# Getting Started

The `/api` directory has been set up to include basic functionality with Prisma connecting to a PostgreSQL database. It uses Express along with express-promise-router for configuring API endpoints.

### Requirements

- [Node.js](https://nodejs.org/en/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [PostgreSQL](https://www.postgresql.org/) database

### First steps:

- Set the DATABASE_URL in the `.env` file to point to your existing database.
- Database models can be defined in `/prisma/schema.prisma` file. [Prisma Docs](https://pris.ly/d/getting-started)
- Endpoints can be configured in `/src/router.ts`
