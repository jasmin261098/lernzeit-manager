# Lernzeit-Manager

A study session tracker to manage and log your learning time. Built with a React/TypeScript frontend, an Express.js backend, and a SQLite database via Prisma.

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 19, TypeScript, Vite        |
| Backend  | Node.js, Express 4                |
| Database | SQLite (via Prisma ORM)           |
| DevOps   | Docker, Docker Compose            |

## Project Structure

```
lernzeit-manager/
├── backend/                    # Express API server (port 3000)
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (StudySession model)
│   │   └── migrations/         # Prisma migration history
│   ├── src/
│   │   └── app.js              # Express entry point
│   ├── .env                    # Environment variables (DATABASE_URL)
│   └── Dockerfile
├── frontend/
│   └── lernzeit-manager/       # React/Vite app (port 5173)
│       ├── src/
│       │   ├── App.tsx         # Main component
│       │   └── main.tsx        # React entry point
│       └── Dockerfile
└── docker-compose.yml
```

## Running with Docker (recommended)

### Start

```bash
docker compose up --build
```

The `--build` flag rebuilds images on each start, which is useful after dependency or Dockerfile changes. Once running:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Stop

```bash
# Stop containers (keeps data)
docker compose down

# Stop and remove volumes (resets database)
docker compose down -v
```

### Rebuild without starting

```bash
docker compose build
```

### View logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f backend
docker compose logs -f frontend
```

## Running Locally (without Docker)

### Prerequisites

- Node.js 18+ (backend) / Node.js 22+ (frontend)
- npm

### Backend

```bash
cd backend
npm install
npx prisma migrate dev   # Apply database migrations
npm run dev              # Starts on http://localhost:3000
```

### Frontend

```bash
cd frontend/lernzeit-manager
npm install
npm run dev              # Starts on http://localhost:5173
```

## Database

The project uses SQLite with Prisma. The database file is created at `backend/dev.db`.


### Prisma commands

```bash
cd backend

npx prisma migrate dev       # Create and apply a new migration
npx prisma migrate deploy    # Apply migrations in production
npx prisma studio            # Open the database GUI at http://localhost:5555
```

## Environment Variables

The backend reads from `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
```

No additional environment variables are required for local development.

## API

| Method | Path | Description              |
|--------|------|--------------------------|
| GET    | `/`  | Health check             |

## Development Scripts

### Backend (`cd backend`)

| Command           | Description                      |
|-------------------|----------------------------------|
| `npm run dev`     | Start with auto-reload (Nodemon) |

### Frontend (`cd frontend/lernzeit-manager`)

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start Vite dev server              |
| `npm run build`     | Compile TypeScript + production build |
| `npm run preview`   | Preview the production build locally  |
| `npm run lint`      | Run ESLint                         |
