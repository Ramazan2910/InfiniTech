# InfiniTech — Final Report

## Project Summary

InfiniTech is a full-stack web platform for a tech company in Baku, Azerbaijan, combining:
- **E-commerce**: product catalog (new and used tech), shopping cart, order management
- **Service Desk**: device repair ticket system with multi-stage workflow

Developed in 4 stages over a single session using ASP.NET Core 8 (backend) and React 18 + TypeScript (frontend).

---

## Tech Stack — Final Versions

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | .NET | 8.0 |
| ORM | Entity Framework Core | 8.0.16 |
| Database | SQL Server LocalDB | 2022 |
| Auth | JWT Bearer + BCrypt | BCrypt.Net-Next 4.0.3 |
| Object mapping | AutoMapper | 13.0.1 |
| Build tool (frontend) | Vite | 8.1.0 |
| UI framework | React | 18 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| State management | Redux Toolkit + RTK Query | 2.x |
| Router | React Router | 6.x |
| Form validation | react-hook-form + zod | latest |
| Icons | lucide-react | latest |
| Toasts | react-hot-toast | latest |

---

## Architecture Overview

### Backend (Clean Architecture)

```
API layer         → Controllers, middleware, DI, Swagger
Application layer → Services, DTOs, AutoMapper profiles, AppException hierarchy
Infrastructure    → EF Core DbContext, repositories, migrations, BCrypt seeding
Core              → Entities (User, Product, Order, RepairTicket, ...), enums, repository interfaces
```

**Auth flow**: POST /auth/login → JWT access token (15 min) in JSON body + httpOnly refresh cookie (7 days). Refresh via POST /auth/refresh. Re-auth middleware in RTK Query retries 401 responses automatically.

**Error handling**: `AppException` hierarchy maps to HTTP status codes:
- 400 BadRequest, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict

**File storage**: multipart uploads saved to `wwwroot/uploads/products/` and `wwwroot/uploads/tickets/{id}/`, served as static files.

### Frontend (Feature-based)

```
features/landing     → Full landing page (7 sections)
features/auth        → Login, Register
features/shop        → Product catalog, product detail
features/client      → Dashboard, orders, repairs, cart, checkout
features/master      → Ticket queue, ticket detail with status management
features/admin       → Dashboard, products CRUD, orders, tickets, users
components/layout    → Navbar, Footer, DashboardLayout, Logo
components/ui        → Button, Input, Badge, Modal, Pagination, Spinner, EmptyState
components/shared    → ProductCard, StatusTracker, StatusBadge, SkeletonCard
```

---

## All Pages

### Public
| URL | Page |
|-----|------|
| `/` | Landing page (hero, categories, products, stats, how-it-works) |
| `/shop` | Product catalog with filters, search, pagination |
| `/shop/:id` | Product detail with add-to-cart |
| `/auth/login` | Login (JWT, demo accounts listed) |
| `/auth/register` | Registration |

### Client (authenticated, Role: Client)
| URL | Page |
|-----|------|
| `/client/dashboard` | Welcome, stats, recent orders/tickets |
| `/client/orders` | Order history |
| `/client/orders/:id` | Order detail |
| `/client/repairs` | Ticket list with status badges |
| `/client/repairs/new` | 3-step repair wizard |
| `/client/repairs/:id` | Ticket detail with status tracker + 30s polling |
| `/client/cart` | Shopping cart |
| `/client/checkout` | Checkout with address |

### Master (Role: Master or Admin)
| URL | Page |
|-----|------|
| `/master/dashboard` | Ticket queue with filters + 30s polling |
| `/master/tickets/:id` | Ticket detail with status transitions, comments |

### Admin (Role: Admin)
| URL | Page |
|-----|------|
| `/admin/dashboard` | Revenue, stats, low stock, recent orders |
| `/admin/products` | Product table with search, edit, soft-delete |
| `/admin/products/new` | Create product |
| `/admin/products/:id/edit` | Edit product |
| `/admin/orders` | All orders with status updates |
| `/admin/orders/:id` | Order detail |
| `/admin/tickets` | All tickets table |
| `/admin/tickets/:id` | Ticket detail |
| `/admin/users` | Users table with role management |

---

## Known Remaining Issues

1. **Bundle size**: Single 528 KB JS chunk — use `React.lazy()` per route for production
2. **No email notifications**: SMTP integration not included
3. **Polling not WebSocket**: Ticket status updates every 30s, not real-time push
4. **AutoMapper vulnerability**: AutoMapper 13.0.1 has a known advisory — update to 14.x when upgrading
5. **Admin ticket transitions**: Admin reuses MasterTicketDetail — admin-specific overrides not separately surfaced
6. **No image lightbox**: Ticket photos open in new tab

---

## Suggested Future Enhancements

- **SignalR**: Real-time ticket status push (replace 30s polling)
- **Code splitting**: `React.lazy()` per route for faster initial load (~100 KB chunks)
- **Dark mode**: Tailwind `dark:` class toggle
- **i18n**: Azerbaijani (`az`) language alongside Russian
- **PWA**: Service worker + offline shell for mobile service desk
- **Analytics**: Revenue trend chart on admin dashboard
- **Email**: SendGrid integration for order confirmations and ticket updates
- **Cloud storage**: Azure Blob or S3 for uploaded images
- **Unit tests**: xUnit for service layer, Vitest + Testing Library for React components
