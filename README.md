# Lernzeit-Manager

The Lernzeit-Manager is a web application for students that helps with planning, tracking, and maintaining study times and learning goals. The system assists in scheduling study sessions according to the intended workload from module handbooks, verifying compliance, and adjusting plans as needed.

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, TypeScript, Vite        |
| Backend   | Node.js, Express 4                |
| Database  | SQLite (via Prisma ORM)           |
| DevOps    | Docker, Docker Compose            |

## Prerequisites

- **Docker** (version 24.x)
- **Docker Compose** (version 2.x)
- **Git** to clone the repository

No local Node.js installation required – all dependencies are resolved inside the Docker containers.

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/jasmin261098/lernzeit-manager
cd lernzeit-manager
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

At minimum, set `JWT_SECRET` in `backend/.env` to a secure, random value (see [Configuration](#configuration)).

### 3. Start the application

```bash
docker compose up --build
```

The first start may take several minutes as Node.js dependencies are installed. On startup, the backend automatically runs the following steps (`entrypoint.sh`):

1. Create the database directory `/app/data`
2. `prisma generate` – generate the Prisma client
3. `prisma db push` – create/update the database schema
4. `npm run dev` – start the development server

### Accessing the application

| Service      | URL                       |
|--------------|---------------------------|
| Frontend     | http://localhost:5173     |
| Backend API  | http://localhost:3000     |

### Stopping the application

```bash
# Stop containers (data is preserved)
docker compose down

# Stop and remove volumes (data will be deleted)
docker compose down -v
```

## Configuration

The backend is configured via `backend/.env`:

| Variable       | Default value                                      | Description                                                                     |
|----------------|----------------------------------------------------|---------------------------------------------------------------------------------|
| `DATABASE_URL` | `file:/app/data/dev.db`                            | Path to the SQLite database file inside the container                           |
| `JWT_SECRET`   | `change-this-to-a-random-secret-before-deploying`  | Secret key for JWT signing – must be changed before the first start             |
| `PORT`         | `3000`                                             | Port of the backend server                                                      |

Recommended way to generate a secure JWT secret:

```bash
openssl rand -base64 48
```

The frontend does not require a separate `.env` file. The proxy target (`http://backend:3000`) is hardcoded in [frontend/lernzeit-manager/vite.config.ts](frontend/lernzeit-manager/vite.config.ts) and works within the Docker network.

## Demo Account

On first startup, the application automatically creates a demo account with sample data:

| Field     | Value              |
|-----------|--------------------|
| Email     | demo@lernzeit.de   |
| Password  | demo1234           |

The demo account includes the following sample data:

- 3 learning goals (e.g. "Learn TypeScript", "Deepen React knowledge")
- 1 study plan with 6 monthly plans (January–June)
- 5 completed study sessions
- 2 reminders

The demo account is for demonstration purposes only. Use the **Register** button to create your own account.

## System Architecture

The Lernzeit-Manager follows a classic client-server architecture with two independent services orchestrated via Docker Compose.

```
Browser
└── React SPA (Vite, port 5173)
        │ HTTP /api/*  (Vite proxy → http://backend:3000)
        ▼
    Backend
    └── Express.js REST API (Node.js, port 3000)
            │ Prisma ORM
            ▼
        Database
        └── SQLite (file: /app/data/dev.db, Docker volume)
```

The frontend communicates with the backend exclusively through the Vite proxy setup. All browser requests to `/api/*` are forwarded by the proxy to `http://backend:3000`.
