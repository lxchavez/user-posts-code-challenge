#!/usr/bin/env bash

# While the unit tests use mock Prisma client, we need to spin up
# a real DB to generate the Prisma data model from our defined schema.

# Gain access to the environment variables
DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh

# Start Docker container in the background
docker-compose up -d

# Make the script wait until the database is ready
echo '🟡 - Waiting for database to be ready...'
$DIR/wait-for-it.sh "${DATABASE_URL}" -- echo '🟢 - Database is ready!'

# Prep the database using our Prisma schema 
npx prisma db push --accept-data-loss && npx prisma generate

# Finally, run our integration tests
vitest -c ./vitest.config.integration.ts
