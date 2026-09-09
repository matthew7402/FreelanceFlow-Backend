# FreelanceFlow Backend

FreelanceFlow is a portfolio backend for a freelance-workspace product. It provides the foundations for users to create workspaces, collaborate on projects, chat in real time, and manage workspace subscriptions.

This repository is an active work in progress. Its purpose is to demonstrate backend architecture and product thinking; several production features and a dedicated client-facing flow are planned for future iterations.

## Current capabilities

- JWT-based registration, login, and current-user endpoints
- PostgreSQL-backed workspaces with owner and member roles
- Workspace member invitations by registered-user email
- Project creation, listing, updating, and owner-only deletion
- Real-time, project-scoped chat with Socket.IO, with messages persisted in PostgreSQL
- Stripe Checkout session creation for workspace subscriptions
- Database health-check endpoint

## Stack

- Node.js and Express 5
- PostgreSQL (`pg`)
- Socket.IO
- JSON Web Tokens and bcrypt
- Stripe Checkout
- dotenv and CORS

## Getting started

### Prerequisites

- Node.js 18 or newer
- A PostgreSQL database (the current configuration is suitable for a hosted PostgreSQL provider)
- A Stripe account and recurring-price ID if testing billing

### Installation

```bash
git clone <your-repository-url>
cd FreelanceFlow-Backend
npm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
FRONTEND_URL=http://localhost:3000
```

Initialize the database using [`schema.sql`](./schema.sql):

```bash
psql "$DATABASE_URL" -f schema.sql
```

Start the API:

```bash
npm run dev
```

The service runs at `http://localhost:5000` by default. Visit `/` to confirm that the API is running, or `/api/health/db` to check database connectivity.

## API overview

Protected HTTP endpoints require the following header:

```http
Authorization: Bearer <token>
```

| Area | Endpoint | Purpose |
| --- | --- | --- |
| Authentication | `POST /api/auth/register` | Create a user |
| Authentication | `POST /api/auth/login` | Sign in and receive a JWT |
| Authentication | `GET /api/auth/me` | Get the signed-in user |
| Workspaces | `POST /api/workspaces` | Create a workspace |
| Workspaces | `GET /api/workspaces` | List the user’s workspaces |
| Workspaces | `POST /api/workspaces/:workspaceId/invite` | Add an existing user as a member (owner only) |
| Projects | `POST /api/workspaces/:workspaceId/projects` | Create a project |
| Projects | `GET /api/workspaces/:workspaceId/projects` | List workspace projects |
| Projects | `PUT /api/workspaces/:workspaceId/projects/:projectId` | Update a project |
| Projects | `DELETE /api/workspaces/:workspaceId/projects/:projectId` | Delete a project (owner only) |
| Messages | `GET /api/messages/:projectId` | Get a project’s chat history |
| Billing | `POST /api/workspaces/:workspaceId/create-checkout-session` | Create a Stripe Checkout session (owner only) |
| Billing | `GET /api/stripe-success?session_id=...` | Activate a workspace after Checkout |

## Real-time chat

Socket.IO clients join a project room and send messages with the events below:

```js
socket.emit("joinProject", projectId);

socket.emit("sendMessage", {
  projectId,
  senderId,
  content,
});

socket.on("newMessage", (message) => {
  // render the persisted message
});
```

The server verifies that the sender belongs to the workspace containing the project before persisting and broadcasting a message.

## Planned work

The next major product direction is a separate flow for clients/project owners. The goal is to give clients a focused experience for reviewing work, communicating with the freelancer, and following project progress without exposing the full internal workspace.

Planned improvements include:

- Client/project-owner accounts, roles, invitations, and a tailored portal
- Project status, milestones, deliverables, approvals, and activity history
- More granular project and message authorization
- Stripe webhooks and reliable subscription lifecycle handling
- Request validation, consistent error responses, and API tests
- Environment-specific CORS, rate limiting, logging, and production hardening
- API documentation and frontend integration examples

## Notes for contributors

- Never commit `.env` files or Stripe secrets.
- Apply schema changes deliberately and keep [`schema.sql`](./schema.sql) aligned with the application.
- This is a portfolio project: feedback and small, focused improvements are welcome.

