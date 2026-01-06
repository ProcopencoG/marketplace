# 🥕 PiataOnline - Digital Farmers Market

A peer-to-peer marketplace platform connecting Romanian farmers and local producers directly with consumers. Think "digital farmers market" where anyone can create their own stand to sell homemade, organic, and locally-produced food products.

**Live at:** [https://piataonline.bio](https://piataonline.bio)

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ProcopencoG_marketplace&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ProcopencoG_marketplace)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/quality_gate?project=ProcopencoG_marketplace)](https://sonarcloud.io/summary/new_code?id=ProcopencoG_marketplace)

## 🎬 Demo

[![Watch the demo](https://img.shields.io/badge/▶_Watch_Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/6IJBt_1FpNQ)

> *Click to watch the full demo walkthrough*

---

## 🎯 Features

### For Buyers
- 🛒 Browse and order from local farmers
- 💬 Direct chat with sellers
- ⭐ Leave reviews after purchase
- 📍 Filter by location

### For Sellers  
- 🏪 Create your own digital market stand
- 📦 Manage products and inventory
- 📊 View orders and sales metrics
- 💰 Zero commission fees

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | .NET 9 Web API |
| **Database** | PostgreSQL 15 |
| **Auth** | JWT + Google OAuth2 |
| **Styling** | TailwindCSS |
| **Deployment** | Docker + Kamal on Azure VM |

---

## 🚀 Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- [Docker](https://www.docker.com/) (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/marketplace.git
cd marketplace
```

### 2. Backend Setup

```bash
cd backend

# Copy the example config files
cp PiataOnline.API/Properties/launchSettings.example.json PiataOnline.API/Properties/launchSettings.json

# Edit launchSettings.json with your values:
# - DATABASE_URL: Your PostgreSQL connection string
# - JWT_SECRET: A random string (minimum 32 characters)
```

**Required Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `Host=localhost;Port=5432;Database=piataonline;Username=postgres;Password=yourpass` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `your-super-secret-key-minimum-32-characters` |
| `JwtSettings__OwnerEmail` | Email that gets auto-admin rights | `your-email@example.com` |

**Run the backend:**

```bash
dotnet run --project PiataOnline.API
```

The API will be available at `http://localhost:5066`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5066" > .env

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Database Setup

The database migrations run automatically on first startup (in Development mode).

To manually create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE piataonline;
```

---

## 📁 Project Structure

```
marketplace/
├── backend/
│   ├── PiataOnline.API/          # Controllers, Middleware
│   ├── PiataOnline.Core/         # Entities, DTOs, Interfaces
│   └── PiataOnline.Infrastructure/ # Repositories, DbContext, Services
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── pages/               # Page components
│   │   ├── hooks/               # Custom React hooks
│   │   └── services/            # API client services
│   └── public/                  # Static assets
└── config/
    └── deploy.example.yml       # Kamal deployment template
```

---

## 🚢 Deployment

### Using Docker + Kamal

1. **Setup Azure Container Registry** (or any Docker registry)
2. **Create `config/deploy.yml`** from `deploy.example.yml`
3. **Create `deploy.ps1`** (Windows) with your credentials:

```powershell
$ErrorActionPreference = "Stop"

Write-Host "`n=== DEPLOYING PIATA ONLINE ===`n" -ForegroundColor Green

# Configuration (replace with your values)
$Registry = "YOUR_REGISTRY.azurecr.io"
$ImageName = "piata_online"
$FullImage = "$Registry/$ImageName"
$KamalVersion = "ghcr.io/basecamp/kamal:v2.2.2"

# Set your registry password as environment variable
$env:KAMAL_REGISTRY_PASSWORD = "YOUR_REGISTRY_PASSWORD"

# Get version from git
try {
    $GitCommit = (git rev-parse HEAD).Trim()
} catch {
    $GitCommit = Get-Date -Format "yyyyMMdd-HHmmss"
}
$ImageWithTag = "$FullImage`:$GitCommit"

Write-Host "Version: $GitCommit" -ForegroundColor Cyan

# Build Docker image
Write-Host "`nBuilding Docker image..." -ForegroundColor Yellow
docker build --no-cache --platform linux/amd64 -t $ImageWithTag .
if ($LASTEXITCODE -ne 0) { exit 1 }

# Push to registry
Write-Host "`nPushing to registry..." -ForegroundColor Yellow
docker push $ImageWithTag
if ($LASTEXITCODE -ne 0) { exit 1 }

# Deploy with Kamal
Write-Host "`nDeploying with Kamal..." -ForegroundColor Yellow
docker run --rm `
    -v "${PWD}:/workdir" `
    -v "${PWD}/YOUR_SSH_KEY.pem:/workdir/YOUR_SSH_KEY.pem" `
    -w /workdir `
    -e KAMAL_REGISTRY_PASSWORD="$env:KAMAL_REGISTRY_PASSWORD" `
    $KamalVersion deploy --skip-push --version=$GitCommit

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
} else {
    Write-Host "`n=== FAILED ===" -ForegroundColor Red
}
```

4. **Run deployment:**

```powershell
./deploy.ps1
```

---

## 🔐 Security Notes

This project follows security best practices:

- ✅ No secrets in source control
- ✅ JWT authentication with short-lived tokens (60 min)
- ✅ Refresh token rotation (7 days)
- ✅ Rate limiting (100 requests/minute)
- ✅ Input validation with FluentValidation
- ✅ OAuth2 authentication (Google)

**Files excluded from git:**
- `launchSettings.json` (use `.example` template)
- `deploy.yml` (use `.example` template)  
- `deploy.ps1` (create from README example)
- `*.pem` (SSH keys)
- `.env` files

---

## 📖 API Documentation

When running in development mode, API documentation is available at:
- **Scalar UI:** `http://localhost:5066/scalar`
- **OpenAPI JSON:** `http://localhost:5066/openapi/v1.json`

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
dotnet test

# Frontend tests
cd frontend
npm test
```

---

## 📝 License

This project is for demonstration and portfolio purposes.

---

## 👤 Author

**Gabriel Procopenco**
- GitHub: [@ProcopencoG](https://github.com/ProcopencoG)
- LinkedIn: [gabrielprocopenco](https://www.linkedin.com/in/gabrielprocopenco/)

---

## 🙏 Acknowledgments

- Built with [.NET 9](https://dot.net)
- Frontend powered by [React](https://react.dev) + [Vite](https://vitejs.dev)
- Deployed with [Kamal](https://kamal-deploy.org)
