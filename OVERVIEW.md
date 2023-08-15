# Overview

Thanks for the fun project! I've enjoyed learning how to build an Express.js and
using sweet ORM tools like Prisma for the first time 😎

Unfortunately I did not have enough time to build the /web portion of this project
due to time constraints. However, I have enough confidence in the high code coverage
of my unit (100%) and integration tests (99+%) to ensure that my code works as intended
(in addition to the manual testing I've done as I built the API portion of the coding
challenge).

With that said, however, I can spend a couple additional days building the site out if
it's a make-it-or-break-it situation.

\-Alex

## What was done

### Core Business Logic

- Extended router with requested User and Post endpoints. I've leaned toward
  keeping things KISS (keep it simple, silly 😄) by keeping business logic
  related to request input and output handling in `router.ts`.
- I've split things off when needed to keep code flow straightforward and
  maintainable — while not adding too much abstraction for when the inevitable
  refactor comes along
- Created `middleware.ts` to hook into our Express routes to do a first-pass
  validation of request input fields (things like length constraints, validating
  emails, etc.) before passing it off to entity (`/src/entities`) CRUD methods
  and having Prisma/Postgres (and ourselves) deal with it

### Data Modeling

- Create `post.ts`, `user.ts` "entities" (more like logical ones) to mutate
  data for respective CRUD operations, return data fetched by Prisma back to the
  router, and marshall exceptions in unexpected errors against expected data. E.g.
  when a record with duplicate fields attempt to be saved (username, email, etc.)
  or when attempting to update/delete a record that no longer exists in the DB
- Model a one-to-many relationship between Posts and Users using the provided
  `schema.prisma` file. I've use the `@relation` annotated fields to define the 1:\*
  relationship
- I've decided to index the `userId` field as we are querying Posts by `userId`
  when fetching a specific User's posts or when updating a Post on behalf of a User.
  This index has the potential to cause a performance hit on Post mutation operations
  — like deleting a User with a ton of posts — but we are optimizing for read operations
  based on these access patterns

### Infrastructure Changes

- I've Dockerized the PostgreSQL database to make integration tests easier
  to setup and run
- Wrote unit and integration tests with [Vitest](https://vitest.dev/) and
  [SuperTest](https://github.com/ladjs/supertest); made sure that my code
  changes were well-covered
- Setup Prisma mocking for unit testing in the /lib directory, added
  integration test scripts (/scripts) I've learned about while reading through Prisma's
  official blog
  - [The Ultimate Guide to Testing with Prisma: Integration Testing](https://www.prisma.io/blog/testing-series-3-aBUyF8nxAn)

## Future work and additional design considerations

- Finish building out the `/web` component of our project; do extra credit tasks
- Add more types, type hints (which I'm sure I've forgotten a couple), and general
  code clean-up
- Productionalize database by using Prisma migrations instead of `prisma db push`
  - https://www.prisma.io/docs/concepts/components/prisma-migrate
- Add versioning to our API routes and Post/User tables
- Learn how to do things the idiomatic Express/NodeJS way (there's always more to learn!)
- Write load tests to ensure that the `userId` index in the Posts table bring
  expected performance benefits
- Write load tests to measure performance of our DB and endpoints; figure out
  expected TPS load and breaking points
- Mitigate resource intensive operations (e.g. deleting a User with many posts). We can
  potentially queue these slower operations off as part of a seperate process so as to not
  affect read-optimized queries (retrieving Users and Posts)
- Scale up the PostgreSQL database. Scale out by deploying more nodes in the DB cluster,
  configure replications to optimize read-only requests (like retrieving posts)
- Paginate retrievel of Posts and not simply return all of them for a request; implement LRU
  caching with something like memcached or redis on recently created or trending posts to optimize
  common access patterns of our application
- Emit event metrics to track sucessful requests, operation errors (e.g.
  `PostMutationError`) to build engineering dashboards and suppoer Operational
  Excellence
