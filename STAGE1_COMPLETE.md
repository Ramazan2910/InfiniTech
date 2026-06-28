# InfiniTech — Stage 1 Complete ✅

## Projects

| Project | Type | Purpose |
|---------|------|---------|
| `InfiniTech.API` | ASP.NET Core 8 Web API | Startup project — HTTP pipeline, auth, Swagger, DI wiring |
| `InfiniTech.Core` | Class Library | Domain entities, enums, repository interfaces |
| `InfiniTech.Infrastructure` | Class Library | EF Core DbContext, migrations, repository implementations |
| `InfiniTech.Application` | Class Library | DTOs, AutoMapper profiles |

## Entities & Relationships

```
User ─────────────────────────────────────────────────────────
  │  (Role: Client / Master / Admin)
  ├─ Orders[]           (Client → many Orders)
  ├─ RepairTickets[]    (Client → many RepairTickets as customer)
  ├─ AssignedTickets[]  (Master → many RepairTickets as technician)
  ├─ CartItems[]
  └─ RefreshTokens[]

Category ──────────────────────────────────────────────────────
  └─ Products[]

Product ───────────────────────────────────────────────────────
  ├─ Category (FK)
  ├─ OrderItems[]
  └─ CartItems[]

Order ─────────────────────────────────────────────────────────
  ├─ Client (User FK)
  └─ OrderItems[]
       └─ Product (FK, snapshot UnitPrice)

RepairTicket ──────────────────────────────────────────────────
  ├─ Client (User FK)
  ├─ Master (User FK, nullable)
  ├─ Photos[]  (TicketPhoto)
  └─ Comments[] (TicketComment)
       └─ Author (User FK)

CartItem: UserId + ProductId + Quantity
RefreshToken: UserId + Token + ExpiresAt + IsRevoked
```

### Global Query Filters (Soft Delete)
- `User` — filtered by `IsActive == true`
- `Product` — filtered by `IsActive == true`

## Migrations

| Migration | Contents |
|-----------|----------|
| `InitialCreate` | Full schema — all 10 tables with FK constraints, unique indexes, decimal precision |
| `SeedInitialData` | 8 categories, 5 users, 13 products, 3 repair tickets |

## Seed Data Summary

### Categories (8)
Laptops 💻, Processors ⚡, Graphics Cards 🎮, RAM 🧠, Storage 💾, Monitors 🖥, Smartphones 📱, Peripherals ⌨️

### Users (5)
| Email | Role | Password |
|-------|------|----------|
| admin@infinitech.az | Admin | Admin123! |
| namig@infinitech.az | Master | Master123! |
| rauf@infinitech.az | Master | Master123! |
| client1@test.az | Client | Client123! |
| client2@test.az | Client | Client123! |

*Passwords stored as BCrypt hashes (work-factor 11)*

### Products (13)
- 2 Laptops (New): Lenovo ThinkPad E14 Gen 5, ASUS VivoBook 15
- 2 Processors (New): AMD Ryzen 5 7600X, Intel Core i5-13400F
- 2 Graphics Cards (1 New, 1 Used): RTX 3060, RTX 2060
- 1 RAM (New): Kingston FURY Beast DDR5 32GB
- 2 Storage (1 New, 1 Used): Samsung 990 Pro 1TB, Seagate BarraCuda 2TB
- 1 Monitor (New): Dell UltraSharp 27" 4K
- 1 Smartphone (Used): iPhone 14 128GB
- 2 Peripherals (New): Logitech MX Keys S, Logitech MX Master 3S
- Price range: ₼89 – ₼1,449 (Azerbaijani Manat)

### Repair Tickets (3)
| Status | Device | Assigned To |
|--------|--------|-------------|
| InRepair (3) | Lenovo ThinkPad E14 Gen 4 | Namig (water damage) |
| Diagnosis (1) | Samsung Galaxy S23 | Unassigned (cracked screen) |
| ReadyForPickup (5) | HP Pavilion 15 | Rauf (overheating) |

## How to Run Locally

### Prerequisites
- .NET 8 SDK
- SQL Server (Express or Developer edition) running on `.\` (default instance)

### Steps
```bash
# 1. Clone / open the solution
cd InfiniTech

# 2. Apply migrations (creates InfiniTechDb with seed data)
dotnet ef database update --project InfiniTech.Infrastructure --startup-project InfiniTech.API

# 3. Run the API
cd InfiniTech.API
dotnet run

# 4. Open Swagger UI
# → https://localhost:{port}/swagger
```

### Connection String (appsettings.json)
```
Server=.;Database=InfiniTechDb;Trusted_Connection=true;TrustServerCertificate=true;
```
*(Uses Windows Authentication against the default SQL Server instance.)*
*(Original spec used LocalDB — change to `(localdb)\\mssqllocaldb` if LocalDB is installed.)*

## JWT Configuration
- Access Token: 15-minute expiry, signed with HS256
- Refresh Token: 7 days, stored in httpOnly cookie (to be wired in Stage 2)
- Secret: `InfiniTech-Super-Secret-Key-2025-AzTU-Diploma-Project`

## Repository Pattern
```
IRepository<T>          → GenericRepository<T>
IUserRepository         → UserRepository
IProductRepository      → ProductRepository
IOrderRepository        → OrderRepository
IRepairTicketRepository → RepairTicketRepository
ICartRepository         → CartRepository
IRefreshTokenRepository → RefreshTokenRepository
```
All registered as Scoped in DI.

## AutoMapper Profiles
| Profile | Mappings |
|---------|----------|
| `UserProfile` | User ↔ UserDto, User → UserTokenDto, RegisterRequestDto → User |
| `ProductProfile` | Product → ProductDto, Category → CategoryDto, CreateProductDto → Product |
| `OrderProfile` | Order → OrderDto, OrderItem → OrderItemDto |
| `TicketProfile` | RepairTicket → RepairTicketDto, TicketPhoto → TicketPhotoDto, TicketComment → TicketCommentDto |
| `CartProfile` | CartItem → CartItemDto |

## Authorization Policies
| Policy | Requirement |
|--------|-------------|
| `ClientOnly` | Role: Client |
| `MasterOnly` | Role: Master |
| `AdminOnly` | Role: Admin |
| `StaffOnly` | Role: Master or Admin |
| `Authenticated` | Any authenticated user |

---

## Stage 2 Preview

Stage 2 will add all API Controllers:

- `POST /api/auth/register` — register new client
- `POST /api/auth/login` — issue JWT + refresh token cookie
- `POST /api/auth/refresh` — rotate refresh token
- `POST /api/auth/logout` — revoke refresh token

- `GET/POST /api/products` — list and create products
- `GET/PUT/DELETE /api/products/{id}` — manage products
- `POST /api/products/{id}/image` — upload product image

- `GET/POST /api/cart` — view and add to cart
- `PUT /api/cart/{id}` — update quantity
- `DELETE /api/cart/{id}` — remove item
- `POST /api/orders` — checkout cart → create order
- `GET /api/orders` — order history

- `GET/POST /api/tickets` — list and create repair tickets
- `GET /api/tickets/{id}` — ticket details
- `PUT /api/tickets/{id}/status` — update status (Staff only)
- `POST /api/tickets/{id}/assign` — assign master (Admin only)
- `POST /api/tickets/{id}/comments` — add comment
- `POST /api/tickets/{id}/photos` — upload photos

- `GET /api/admin/users` — user management (Admin only)
- `GET /api/admin/dashboard` — stats dashboard
