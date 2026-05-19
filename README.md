# CryptoPolio

A crypto portfolio management app. Browse live market data, run virtual
buy/sell trades against a demo wallet, and track portfolio performance.

- **Client** — Next.js 14 (App Router), Tailwind CSS
- **Server** — Express + Mongoose (MongoDB)
- **Market data** — CoinGecko public API

## Project structure

```
task-cryptopolio-main/
├── client/          Next.js frontend
├── server/          Express API
├── test_backend.js  Backend smoke test
└── render.yaml      Render deployment blueprint (backend)
```

## Local development

### Prerequisites

- Node.js 18+
- A MongoDB connection string (optional — see below)

### Setup

```bash
# 1. Install dependencies for both client and server
npm run install-dependencies

# 2. Configure the server
cp server/.env.example server/.env
#    Edit server/.env. If you leave DATABASE_URI blank, the server starts a
#    throwaway in-memory MongoDB so you can run the app with zero infra.

# 3. (Optional) Configure the client
cp client/.env.example client/.env.local
#    Not required for local dev — the client auto-detects localhost and
#    talks to http://localhost:5000.

# 4. Start both client and server
npm start
```

- Client: http://localhost:3000
- Server: http://localhost:5000

### Backend tests

With the server running:

```bash
node test_backend.js
```

This end-to-end suite covers every API endpoint — registration, login, auth,
profile, wallet, and buy/sell transactions — plus error cases.

Test accounts use the `@cryptopolio.test` email domain. If you run the suite
against a real database, remove the test data afterwards:

```bash
cd server && node cleanup_test_data.js
```

## Environment variables

### Server (`server/.env`)

| Variable       | Required        | Description                                            |
| -------------- | --------------- | ------------------------------------------------------ |
| `PORT`         | no              | API port (default `5000`).                             |
| `NODE_ENV`     | no              | Set to `production` when deploying.                    |
| `JWT_SECRET`   | **in prod**     | Secret for signing JWTs. App refuses to start without it in production. |
| `DATABASE_URI` | **in prod**     | MongoDB connection string. Blank in dev → in-memory DB. |
| `CLIENT_URL`   | recommended     | Comma-separated list of allowed frontend origins (CORS). |

### Client (`client/.env.local`)

| Variable               | Required | Description                                     |
| ---------------------- | -------- | ----------------------------------------------- |
| `NEXT_PUBLIC_BASE_URL` | in prod  | Backend API URL. Auto-detected as localhost in dev. |

## Deployment

The frontend and backend deploy independently.

### Backend → Render

A [`render.yaml`](./render.yaml) blueprint is included.

1. Push this repo to GitHub.
2. On [Render](https://render.com), create a new **Blueprint** from the repo.
3. Set `DATABASE_URI` (e.g. a MongoDB Atlas string) and `CLIENT_URL` (your
   deployed frontend URL) in the Render dashboard. `JWT_SECRET` is generated
   automatically.

Manual setup (without the blueprint): Web Service, root directory `server`,
build `npm install`, start `npm start`, health check path `/health`.

### Frontend → Vercel

1. On [Vercel](https://vercel.com), import the repo.
2. Set the **Root Directory** to `client`.
3. Add the environment variable `NEXT_PUBLIC_BASE_URL` = your Render API URL.
4. Deploy.

After both are live, update the backend's `CLIENT_URL` to the Vercel URL so
CORS allows the frontend.

## Security notes

- Passwords are hashed with bcrypt; password hashes are never returned to the client.
- JWTs authenticate API requests; the signing secret is mandatory in production.
- The API uses `helmet`, CORS allow-listing, and rate limiting (stricter on auth routes).
- The in-memory database fallback is **development only** — in production the
  server fails fast if the configured database is unreachable.
