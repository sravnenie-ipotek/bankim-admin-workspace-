# Local Development Setup

This guide helps you run the local development environment alongside your production SSH tunnel without conflicts.

## 🚀 Quick Start

### Start Local Development
```bash
./scripts/start-local-dev.sh
```

### Stop Local Development
```bash
./scripts/stop-local-dev.sh
```

## 📊 Port Configuration

| Service | Production Port | Local Port | Purpose |
|---------|----------------|------------|---------|
| Backend API | 3000 | 4000 | API Server |
| Frontend | 3002 | 4002 | React App |
| Database | Railway | Railway | PostgreSQL |

## 🔧 Environment Files

- **`.env`** - Production configuration
- **`.env.local`** - Local development configuration (auto-created)

## 🌐 Access URLs

### Local Development
- **Frontend**: http://localhost:4002
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **API Menu**: http://localhost:4000/api/content/menu

### Production (via SSH tunnel)
- **Frontend**: http://localhost:3002 (or your tunnel port)
- **Backend API**: http://localhost:3000 (or your tunnel port)

## 🔄 Switching Between Environments

### To use Local Development:
```bash
./scripts/start-local-dev.sh
```

### To use Production (via SSH tunnel):
```bash
./scripts/stop-local-dev.sh
# Then access via your SSH tunnel
```

## 🛠️ Manual Setup

If you prefer to run manually:

### Backend (Port 4000)
```bash
cd packages/server
source ../../.env.local
npm run dev
```

### Frontend (Port 4002)
```bash
cd packages/client
source ../../.env.local
PORT=4002 npm run dev
```

## 🔍 Troubleshooting

### Port Conflicts
If you get port conflicts:
```bash
# Check what's using the ports
lsof -i :4000
lsof -i :4002

# Kill processes if needed
lsof -ti:4000,4002 | xargs kill -9
```

### Database Connection Issues
The local environment uses the same production database but with different ports. If you have connection issues:
1. Check your `.env.local` file has correct database URLs
2. Verify your SSH tunnel is working for production
3. Ensure the database is accessible

### Environment Variables
The local environment loads from `.env.local` first, then falls back to `.env`. Make sure your `.env.local` has:
- `PORT=4000` (for backend)
- `VITE_API_URL=http://localhost:4000` (for frontend)
- `NODE_ENV=development`

## 📝 Notes

- Local development uses the same production database
- Changes to `.env.local` require restarting the services
- The local environment is completely separate from production
- Your SSH tunnel for production will remain unaffected 