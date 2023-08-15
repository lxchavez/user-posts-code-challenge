# User Management and Posts API Code-Challenge

## Description

Your task is to build a User Management API with a one-to-many relationship to Posts using Node.js, Express.js, and PostgresQL (using Prisma.js for communication). The API should allow CRUD operations on both User and Post data.

\*\* Please fork this repo and commit all changes to your newly created repo following standard git procedures. A link to the newly created repo should be shared once the code challenge is complete.

### Requirements

1. **Technology Stack:**
   - Backend: Node.js with Express.js
   - Database: PostgreSQL with Prisma.js for database operations
   - Typescript should be used throughout the project
2. **API Design and Endpoints:**
   - User Endpoints
     - Create a new user: POST `/api/users`
     - Retrieve a user by ID: GET `/api/users/:id`
     - Update a user by ID: PUT `/api/users/:id`
     - Delete a user by ID: DELETE `/api/users/:id`
     - Get all Post objects associated with a specific user account `/api/users/:id/posts`
   - Post Endpoints
     - Create a new post: POST `/api/posts`
     - Retrieve a post by ID: GET `/api/posts/:id`
     - Update a post by ID: PUT `/api/posts/:id`
     - Delete a post by ID: DELETE `/api/posts/:id`
3. **User and Post Data Models:**
   - UserModel:
     - Fields: full name, email, username, date of birth, created at, updated at, posts
   - Post Model:
     - Fields: title, description, user (foreign key to User), created at, updated at
4. **Validation:**
   - Implement validation for user input data, such as email format validation and min/max length for fields
   - Ensure username and email are always unique for newly created users
5. **Documentation:**
   - Provide detailed JSDoc comments to functions and comment complex code for readability
   - Include a detailed README with clear instructions for setting up, installing, and running the project
   - Include a section in the README or separate markdown file describing what was done, what worked/didn't work, what could have been done differently, and what additional functionality could be included next to expand/improve on the existing functionality.
6. **Bonus Features** (Not required but nice to have):
   - Authentication and Security
     - User sign in/ ign up
     - Gate user actions behind auth (creating user posts, etc...)
   - Allow users to upload a profile image or image for a post, storing the URL in an additional field on the User/Post model.

## Setting Up Development Tools (Optional)

If you'd like to setup optional tooling to work on this project, then:

1. Install [Node](https://nodejs.org/en) 20, with something like [nvm](https://github.com/nvm-sh/nvm).
2. Run `npm install`
3. Install the following VS Code extensions to boost development productivity:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)

## Getting Started

Navigate to `/api/README.md` to get started

\*\* The `/web` directory contains a boilerplate Next.js project for use with the api endpoints. Simple pages with plain inputs and buttons are acceptable here.
