# Getting Started

The `/api` directory has been set up to include basic functionality with Prisma connecting to a PostgreSQL database. It uses Express along with express-promise-router for configuring API endpoints.

### Requirements

- [Node.js](https://nodejs.org/en/)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [PostgreSQL](https://www.postgresql.org/) database

### Running the Database

- Add the below files in the `.env` file with the `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. Please make sure to not commit any `.env` files into source control!

Example .env file:

```
POSTGRES_DB=locker
POSTGRES_USER=locker
POSTGRES_PASSWORD=hunter2
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/postgres?schema=${POSTGRES_DB}"
```

You can double-check that the .env files were correctly set and preview the Docker container settings
with `docker compose config`.

Now, you can spin up the PostgreSQL databse locally:

```sh
docker compose up -d
```

### Running the API service locally for the first time

Run the following commands after you've installed [Node.js](https://nodejs.org/en/) (Version 20) on your respective machine:

```sh
npm install
docker compose up -d
npm run dev
```

Afterward, you can bring up the service with just `npm run dev`.

### Running the Test Suite

Once you have made changes to the codebase, you can run unit and integ [Vitest](https://vitest.dev/) test suite through the following commands:

- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integ`
- Print coverage: `npm run coverage:unit`, `npm run coverage:integ`

If you are using Mac OS, you may need to install the following commands with [Homebrew](https://brew.sh/):

```sh
brew install coreutils && alias timeout=gtimeout
```

### First Steps

- Database models can be defined in `/prisma/schema.prisma` file. [Prisma Docs](https://pris.ly/d/getting-started)
- Endpoints can be configured in `/src/router.ts`
- Install optional development tools, see [README](../README.md).
