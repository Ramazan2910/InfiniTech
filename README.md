# InfiniTech — E-commerce & Service Desk Platform

Full-stack web application for a tech company in Baku, Azerbaijan. Supports product sales, order management, and device repair ticketing with three role levels: Client, Master (technician), and Admin.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | ASP.NET Core 8, EF Core 8, SQL Server LocalDB |
| Auth | JWT Bearer + httpOnly refresh cookie, BCrypt.Net-Next |
| Frontend | React 18, TypeScript, Vite 8 |
| State | Redux Toolkit + RTK Query |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3, Inter + Space Grotesk |
| Forms | react-hook-form + zod |

## Prerequisites

- .NET 8 SDK
- Node.js 18+
- SQL Server LocalDB (included with Visual Studio or installable separately)

## Quick Start

### Backend

```bash
cd InfiniTech.API
dotnet restore
dotnet ef database update
dotnet run
```

Swagger UI → http://localhost:5178/swagger

### Frontend

```bash
cd infinitech-client
npm install
npm run dev
```

App → http://localhost:5173

## Test Accounts

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Client | client1@test.az    | Client123! |
| Master | master1@test.az    | Master123! |
| Admin  | admin@test.az      | Admin123!  |

## Project Structure

```
InfiniTech/
├── InfiniTech.Core/          # Entities, enums, repository interfaces
├── InfiniTech.Infrastructure/ # EF Core DbContext, repositories, migrations
├── InfiniTech.Application/   # DTOs, AutoMapper profiles, service interfaces & implementations
├── InfiniTech.API/           # Controllers, middleware, DI registration
└── infinitech-client/        # React + TypeScript frontend
    └── src/
        ├── api/              # RTK Query endpoints (baseApi, authApi, productsApi, ...)
        ├── features/         # Pages grouped by domain (landing, auth, client, master, admin, shop)
        ├── components/       # Shared UI primitives and layout components
        ├── guards/           # ProtectedRoute, GuestRoute
        └── types/            # TypeScript interfaces
```

## Known Limitations

- No email notifications (SMTP not configured)
- No real payment processing (orders are simulated)
- Real-time updates via 30-second polling (not WebSocket/SignalR)
- File uploads stored locally in `wwwroot/uploads/` (not cloud storage)
- Single JS bundle (~528 KB) — code splitting recommended for production
