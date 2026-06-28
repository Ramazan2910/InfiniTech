# InfiniTech — Stage 2 Complete ✅

## All Endpoints

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register new client account |
| POST | `/api/auth/login` | Public | Login, returns JWT + sets httpOnly refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, return new JWT |
| POST | `/api/auth/logout` | JWT | Revoke refresh token, clear cookie |
| GET | `/api/auth/me` | JWT | Return current user from JWT claims |

### Products — `/api/products`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Public | Paginated list with filtering & sorting |
| GET | `/api/products/{id}` | Public | Single product detail |
| POST | `/api/products` | Admin | Create product (multipart/form-data) |
| PUT | `/api/products/{id}` | Admin | Update product and/or image |
| DELETE | `/api/products/{id}` | Admin | Soft delete (IsActive=false) |
| GET | `/api/categories` | Public | All categories with product counts |

### Cart — `/api/cart`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cart` | Client | View cart with totals |
| POST | `/api/cart/items` | Client | Add item (merges if already exists) |
| PUT | `/api/cart/items/{productId}` | Client | Update item quantity |
| DELETE | `/api/cart/items/{productId}` | Client | Remove single item |
| DELETE | `/api/cart` | Client | Clear entire cart |

### Orders — `/api/orders`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | Client | Checkout cart → create order, deduct stock |
| GET | `/api/orders` | Client | Own orders, paginated |
| GET | `/api/orders/{id}` | JWT | Client: own orders only; Admin: any |
| GET | `/api/admin/orders` | Admin | All orders, filter by status/date |
| PUT | `/api/admin/orders/{id}/status` | Admin | Update order status (forward-only) |

### Repair Tickets — `/api/tickets`, `/api/master/tickets`, `/api/admin/tickets`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/tickets` | Client | Create ticket with optional photos (multipart) |
| GET | `/api/tickets` | Client | Own tickets, paginated |
| GET | `/api/tickets/{id}` | JWT | Detail; internal comments hidden from clients |
| POST | `/api/tickets/{id}/photos` | Client | Add photos (only when WaitingForMaster, max 5 total) |
| GET | `/api/master/tickets` | Staff | Queue: unassigned + own assigned tickets |
| POST | `/api/master/tickets/{id}/assign` | Staff | Claim ticket → set Diagnosis status |
| PUT | `/api/master/tickets/{id}/status` | Staff | Status transition with validation |
| POST | `/api/master/tickets/{id}/comments` | Staff | Add comment (internal or public) |
| GET | `/api/admin/tickets` | Admin | All tickets, full filter set |
| PUT | `/api/admin/tickets/{id}` | Admin | Free-form admin edit (any field, reassign) |

### Users — `/api/profile`, `/api/admin/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profile` | JWT | Own profile |
| PUT | `/api/profile` | JWT | Update own name/phone |
| GET | `/api/admin/users` | Admin | All users, filter by role/status/search |
| GET | `/api/admin/users/{id}` | Admin | User detail with order & ticket counts |
| PUT | `/api/admin/users/{id}/status` | Admin | Activate / deactivate account |
| PUT | `/api/admin/users/{id}/role` | Admin | Change role (cannot change own role) |

### Admin Dashboard — `/api/admin/dashboard`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/dashboard` | Admin | Revenue, orders, repairs, users, low-stock, trends |

---

## Sample cURL Commands

### Register
```bash
curl -X POST https://localhost:7xxx/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","firstName":"Ali","lastName":"Hasanov"}'
```

### Login
```bash
curl -X POST https://localhost:7xxx/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"client1@test.az","password":"Client123!"}'
# → copy accessToken from response
```

### Create Repair Ticket (with photo)
```bash
curl -X POST https://localhost:7xxx/api/tickets \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "deviceType=0" \
  -F "deviceBrand=ASUS" \
  -F "deviceModel=ZenBook 14" \
  -F "problemDescription=Screen flickering at startup" \
  -F "photos=@/path/to/photo.jpg"
```

### Master updates ticket status
```bash
curl -X PUT https://localhost:7xxx/api/master/tickets/{id}/status \
  -H "Authorization: Bearer <MASTER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":2,"diagnosisResult":"GPU solder joints cracked, needs reflow"}'
# Diagnosis → PriceApproval
```

### Admin creates a product
```bash
curl -X POST https://localhost:7xxx/api/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "name=Intel Core i7-13700K" \
  -F "description=16 cores, LGA1700" \
  -F "sku=CPU-INT-I7-13700K" \
  -F "price=699.00" \
  -F "stockQuantity=5" \
  -F "condition=0" \
  -F "categoryId=2"
```

---

## Business Logic Decisions

### Auth
- Register always assigns `Role = Client`. Masters/Admins are created by admin via role change.
- Passwords require ≥ 8 chars, ≥ 1 uppercase, ≥ 1 digit.
- Login finds the user **ignoring the IsActive filter**, then returns "Account deactivated" separately — so deactivated accounts get a clear message instead of generic "not found".
- Refresh tokens are single-use (revoked immediately when used). Stolen tokens cannot be replayed.
- `[JsonIgnore]` on `RefreshToken` field of `AuthResponseDto` prevents it appearing in API JSON — it's set in the httpOnly cookie only.

### Products
- Soft delete (`IsActive = false`) preserves historical order line items.
- SKU uniqueness is checked including inactive products.
- `GET /api/products` applies global query filter (`IsActive = true`) by default.
- Admin endpoints use `IgnoreQueryFilters()` to see deactivated products.

### Cart
- Adding an existing product to cart **merges** (sums quantities) rather than creating duplicates.
- Stock is checked at add-to-cart time AND again at checkout to prevent race conditions.

### Orders
- Checkout snapshots `UnitPrice` per item — future price changes don't affect historical orders.
- Stock is decremented atomically during order creation.
- Order status is **forward-only**: Pending → Confirmed → Processing → Shipped → Delivered. Cancellation is always allowed.

### Repair Tickets
- Valid status transitions:
  ```
  WaitingForMaster → Diagnosis       (assign)
  Diagnosis        → PriceApproval   (needs diagnosisResult)
  PriceApproval    → InRepair        (needs repairCost)
  InRepair         ↔ WaitingForParts (parts toggle)
  InRepair         → ReadyForPickup
  ReadyForPickup   → Completed       (sets CompletedAt)
  Any              → Cancelled
  ```
- Internal comments (`IsInternal = true`) are hidden from client API responses.
- Admins can bypass transition validation via `PUT /api/admin/tickets/{id}`.

### File Uploads
- Images saved to `wwwroot/uploads/products/{guid}.{ext}` and `wwwroot/uploads/tickets/{ticketId}/{guid}.{ext}`.
- Served by ASP.NET Core static files at `/uploads/products/…` and `/uploads/tickets/…`.
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`. Max size: 10 MB.

---

## Global Error Format

All errors return:
```json
{
  "error": "Human-readable description",
  "details": ["Optional", "field-level", "errors"],
  "statusCode": 400
}
```

| Code | When |
|------|------|
| 400 | Bad input, validation failure, invalid state transition |
| 401 | Missing or invalid JWT |
| 403 | Correct role required / accessing another user's resource |
| 404 | Entity not found |
| 409 | Conflict (duplicate email, already assigned, etc.) |
| 500 | Unhandled server error (logged, stack trace not exposed) |

---

## Known Limitations / TODOs

- **No rate limiting** on auth endpoints (register, login) — add middleware for production.
- **No email verification** — users are instantly active after registration.
- **No password reset flow** — forgot-password endpoint not implemented.
- **AutoMapper 13.0.1** has a known CVE advisory (NU1903). Upgrade to 14.x when stable.
- **CORS `SameSite=None; Secure`** on the refresh cookie — requires HTTPS. In local dev, adjust if testing over HTTP.
- **No pagination metadata** on some sub-lists (e.g. ticket comments, order items) — always returned in full.
- **Admin dashboard** loads all order items into memory for category stats — acceptable for current scale, add SQL aggregation for larger datasets.

---

## How to Test via Swagger

1. `dotnet run --project InfiniTech.API`
2. Open `https://localhost:{port}/swagger`
3. Use `POST /api/auth/login` with `client1@test.az / Client123!`
4. Copy the `accessToken` from the response
5. Click **Authorize** (top-right) → paste `Bearer <token>`
6. All secured endpoints now work

To test role restrictions: log in as a Client → try `GET /api/admin/dashboard` → expect **403 Forbidden**.

---

## Stage 3 Preview

- **Real-time notifications** via SignalR (ticket status push to client)
- **Email notifications** (SMTP / SendGrid): ticket created, status changed, order shipped
- **Pagination improvements**: cursor-based for high-volume ticket lists
- **Payment integration**: mock payment gateway for order checkout
- **Reporting exports**: orders and repairs as CSV/PDF
- **Frontend (Vue 3 + Vite)**: connect to this API at `http://localhost:5173`
