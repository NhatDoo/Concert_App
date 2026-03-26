# Đang trong quá trình xây dựng  !!!!

<p align="center">
  <img src="https://img.icons8.com/fluency/96/concert.png" alt="Concert App Logo" width="96"/>
</p>

<h1 align="center">🎵 Concert App</h1>

<p align="center">
  <em>Hệ thống quản lý sự kiện concert — đặt vé, tổ chức, thanh toán</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Storage-MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white" />
</p>

---

## 📖 Giới thiệu

**Concert App** là một hệ thống quản lý sự kiện concert toàn diện, cho phép người dùng tìm kiếm, đặt vé concert, và xử lý thanh toán trực tuyến. Hệ thống cũng hỗ trợ ban tổ chức quản lý logistics, nhân sự và thiết bị cho sự kiện.

### Tính năng chính

- 🎤 **Quản lý Concert** — Tạo, chỉnh sửa, lên lịch concert với thông tin nghệ sĩ và tiết mục biểu diễn
- 🎫 **Đặt vé (Booking)** — Đặt vé, xác nhận và hủy booking với quản lý trạng thái chặt chẽ
- 💰 **Thanh toán (Billing)** — Xuất hóa đơn, tính thuế, xử lý thanh toán qua VNPay
- 🏗️ **Tổ chức sự kiện (Organizing)** — Quản lý địa điểm, thiết bị, hậu cần và phân công nhân sự
- 👤 **Xác thực người dùng (Identity)** — Đăng ký, đăng nhập với JWT Authentication
- 📸 **Upload ảnh** — Lưu trữ hình ảnh concert trên MinIO (S3-compatible)

---

## 🏗️ Architecture & Patterns

### Domain-Driven Design (DDD)

Hệ thống được xây dựng theo kiến trúc **Domain-Driven Design**, phân chia thành các **Bounded Contexts** độc lập:

```
┌─────────────────────────────────────────────────────────┐
│                     Concert App                         │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Concert  │ Booking  │ Billing  │Organizing│  Identity   │
│ Context  │ Context  │ Context  │ Context  │  Context    │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│              Shared Kernel (Common)                     │
│           Money VO, Base Entities, etc.                 │
└─────────────────────────────────────────────────────────┘
```

### CQRS (Command Query Responsibility Segregation)

Mỗi context sử dụng pattern **CQRS** với NestJS CQRS module:

```
Request → Controller → Command/Query → Handler → Domain → Repository → Database
```

### Layered Architecture (mỗi context)

```
┌──────────────────────────────────┐
│   Presentation Layer (REST API)  │   ← Controllers, DTOs, Swagger
├──────────────────────────────────┤
│   Application Layer (Use Cases)  │   ← Commands, Handlers
├──────────────────────────────────┤
│   Domain Layer (Business Logic)  │   ← Entities, Aggregates, VOs, Events
├──────────────────────────────────┤
│  Infrastructure Layer (Persist)  │   ← Prisma Repositories, Mappers
└──────────────────────────────────┘
```

### Các Design Patterns sử dụng

| Pattern | Mô tả |
|---------|--------|
| **Aggregate** | Booking, Invoice, Organize là các Aggregate Root quản lý consistency |
| **Value Object** | Money, Email, Password, Role, BookingId, StartDate... |
| **Domain Event** | ConcertCreated, BookingConfirmed, InvoicePaid... |
| **Repository** | Abstract repository interface ở Domain, implement ở Infrastructure |
| **Factory Method** | `static create()` và `static hydrate()/reconstruct()` trên các Entity |
| **Policy** | TaxPolicy để tính thuế cho Invoice |

---

## 📁 Cấu trúc thư mục

```
Concert_app/
├── concertapp/                          # 🖥️ Backend (NestJS)
│   ├── src/
│   │   ├── common/                      # Shared Kernel
│   │   │   └── domain/value-object/     # Common VOs (Money, etc.)
│   │   │
│   │   ├── contexts/                    # Bounded Contexts
│   │   │   ├── concert/                 # 🎤 Concert Context
│   │   │   │   ├── application/         # Commands & Handlers
│   │   │   │   │   └── commands/
│   │   │   │   │       ├── create-concert.command.ts
│   │   │   │   │       ├── artist.command.ts
│   │   │   │   │       ├── performance.command.ts
│   │   │   │   │       ├── generate-tickets.command.ts
│   │   │   │   │       └── handlers/
│   │   │   │   ├── domain/             # Entities, VOs, Events
│   │   │   │   │   ├── entity/         # Concert, Artist, Performance
│   │   │   │   │   ├── VO/             # StartDate, ConcertId
│   │   │   │   │   └── events/         # ConcertCreated, ConcertRescheduled
│   │   │   │   ├── infrastructure/     # Prisma Repositories & Mappers
│   │   │   │   └── presentation/       # REST Controllers & DTOs
│   │   │   │
│   │   │   ├── booking/                # 🎫 Booking Context
│   │   │   │   ├── application/commands/
│   │   │   │   │   ├── create-booking.command.ts
│   │   │   │   │   └── cancel-booking.command.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── aggregate/      # Booking Aggregate
│   │   │   │   │   ├── entity/         # Ticket
│   │   │   │   │   ├── VO/             # BookingId
│   │   │   │   │   └── events/         # BookingCreated, Confirmed, Cancelled
│   │   │   │   ├── infrastructure/
│   │   │   │   └── presentation/
│   │   │   │
│   │   │   ├── billing/                # 💰 Billing Context
│   │   │   │   ├── application/commands/
│   │   │   │   │   ├── create-invoice.command.ts
│   │   │   │   │   ├── issue-invoice.command.ts
│   │   │   │   │   ├── initiate-payment.command.ts
│   │   │   │   │   └── confirm-payment.command.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── aggregate/      # Invoice Aggregate
│   │   │   │   │   ├── entity/         # Payment
│   │   │   │   │   ├── VO/             # InvoiceItem
│   │   │   │   │   ├── events/         # InvoiceIssued, InvoicePaid
│   │   │   │   │   └── policy/         # TaxPolicy
│   │   │   │   ├── infrastructure/
│   │   │   │   └── presentation/
│   │   │   │
│   │   │   ├── organizing/             # 🏗️ Organizing Context
│   │   │   │   ├── application/commands/
│   │   │   │   │   ├── assign-location.command.ts
│   │   │   │   │   ├── equipment-staff.command.ts
│   │   │   │   │   ├── logistics.command.ts
│   │   │   │   │   └── staff-task.command.ts
│   │   │   │   ├── domain/
│   │   │   │   │   ├── aggregate/      # Organize Aggregate
│   │   │   │   │   ├── entity/         # Location, Staff, Logistics, Equipment
│   │   │   │   │   └── events/         # LocationAssigned
│   │   │   │   ├── infrastructure/
│   │   │   │   └── presentation/
│   │   │   │
│   │   │   └── identity/               # 👤 Identity Context
│   │   │       ├── application/commands/
│   │   │       │   ├── login.command.ts
│   │   │       │   └── register.command.ts
│   │   │       ├── domain/
│   │   │       │   ├── entity/         # User
│   │   │       │   └── VO/             # Email, Password, Role, PhoneNumber
│   │   │       ├── infrastructure/
│   │   │       └── presentation/
│   │   │
│   │   ├── main.ts                     # Application entry point
│   │   ├── app.module.ts               # Root module
│   │   └── prisma.service.ts           # Prisma database service
│   │
│   ├── prisma.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── fontend/                             # 🌐 Frontend (Next.js)
    ├── app/                             # App Router
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── public/                          # Static assets
    ├── package.json
    └── tsconfig.json
```

---

## 👥 Actors (Tác nhân)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     USER     │     │  ORGANIZER   │     │    ADMIN     │
│   (Khán giả) │     │ (Ban tổ chức)│     │ (Quản trị)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  • Đặt vé         │  • Tạo concert     │  • Quản lý user
       │  • Thanh toán     │  • Quản lý nghệ sĩ │  • Quản lý hệ thống
       │  • Hủy booking   │  • Tổ chức sự kiện  │  • Toàn quyền
       │  • Xem concert   │  • Quản lý logistics│
       │                   │  • Phân công staff  │
       │                   │  • Xuất hóa đơn     │
       └───────────────────┴─────────────────────┘
```

| Actor | Role | Mô tả |
|-------|------|--------|
| **User** | `USER` | Người dùng thông thường — xem concert, đặt vé, thanh toán |
| **Organizer** | `ORGANIZER` | Ban tổ chức — tạo/quản lý concert, tổ chức sự kiện, xuất hóa đơn |
| **Admin** | `ADMIN` | Quản trị viên — quản lý toàn bộ hệ thống |

---

## 📋 Use Cases

### 🎤 Concert Context

| # | Use Case | Actor | Mô tả |
|---|----------|-------|--------|
| UC-01 | Tạo Concert | Organizer | Tạo sự kiện concert mới với tên, ngày, địa điểm, hình ảnh |
| UC-02 | Thêm nghệ sĩ | Organizer | Thêm nghệ sĩ biểu diễn vào concert |
| UC-03 | Thêm tiết mục | Organizer | Thêm performance/tiết mục cho concert |
| UC-04 | Tạo vé | Organizer | Generate tickets cho concert (loại vé, giá, số lượng) |
| UC-05 | Đổi lịch Concert | Organizer | Reschedule ngày tổ chức concert |
| UC-06 | Xem Concert | User | Xem danh sách và chi tiết concert |

### 🎫 Booking Context

| # | Use Case | Actor | Mô tả |
|---|----------|-------|--------|
| UC-07 | Đặt vé | User | Tạo booking với danh sách ticket cho 1 concert |
| UC-08 | Xác nhận Booking | System | Chuyển trạng thái booking từ PENDING → CONFIRMED |
| UC-09 | Hủy Booking | User | Hủy booking (chỉ khi đang PENDING) |

### 💰 Billing Context

| # | Use Case | Actor | Mô tả |
|---|----------|-------|--------|
| UC-10 | Tạo hóa đơn | System | Tạo Invoice (DRAFT) từ booking |
| UC-11 | Xuất hóa đơn | Organizer | Issue invoice — tính thuế qua TaxPolicy, chuyển DRAFT → ISSUED |
| UC-12 | Thanh toán | User | Initiate payment qua VNPay |
| UC-13 | Xác nhận thanh toán | System | Confirm payment — chuyển Invoice sang PAID |

### 🏗️ Organizing Context

| # | Use Case | Actor | Mô tả |
|---|----------|-------|--------|
| UC-14 | Phân bổ địa điểm | Organizer | Gán location cho concert |
| UC-15 | Thêm thiết bị | Organizer | Thêm equipment cho sự kiện |
| UC-16 | Quản lý hậu cần | Organizer | Tạo và cập nhật trạng thái logistics |
| UC-17 | Phân công nhân sự | Organizer | Thêm staff và giao task cho nhân viên |

### 👤 Identity Context

| # | Use Case | Actor | Mô tả |
|---|----------|-------|--------|
| UC-18 | Đăng ký | Guest | Tạo tài khoản mới với email, password, role |
| UC-19 | Đăng nhập | Guest | Login bằng email/password, nhận JWT token |
| UC-20 | Refresh Token | User | Làm mới access token |

---

## 🔄 Booking Flow (Luồng đặt vé)

```
  User                    System                  Organizer
   │                        │                        │
   │  1. Xem Concert        │                        │
   │───────────────────────>│                        │
   │                        │                        │
   │  2. Đặt vé (Booking)   │                        │
   │───────────────────────>│                        │
   │                        │  3. Tạo Booking         │
   │                        │     (PENDING)           │
   │                        │                        │
   │                        │  4. Tạo Invoice         │
   │                        │     (DRAFT)             │
   │                        │                        │
   │                        │                        │  5. Issue Invoice
   │                        │<───────────────────────│
   │                        │  (DRAFT → ISSUED)      │
   │                        │                        │
   │  6. Thanh toán (VNPay) │                        │
   │───────────────────────>│                        │
   │                        │  7. Xác nhận Payment    │
   │                        │  8. Invoice → PAID      │
   │                        │  9. Booking → CONFIRMED │
   │                        │                        │
   │  ✅ Đặt vé thành công  │                        │
   │<───────────────────────│                        │
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu

- **Node.js** >= 18
- **PostgreSQL** 
- **MinIO** (hoặc S3-compatible storage)

### Backend

```bash
cd concertapp
npm install
npx prisma generate
npm run start:dev
```

### Frontend

```bash
cd fontend
npm install
npm run dev
```

### Biến môi trường (Backend)

Tạo file `.env` trong thư mục `concertapp/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/concertdb"
JWT_SECRET="your-jwt-secret"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
```

---

## 📚 API Documentation

Sau khi chạy backend, truy cập Swagger UI:

```
http://localhost:3000/api
```

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Backend Framework** | NestJS 11 |
| **Frontend Framework** | Next.js 16 |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL + Prisma ORM 7 |
| **Authentication** | JWT + Passport |
| **Payment Gateway** | VNPay |
| **Object Storage** | MinIO |
| **API Docs** | Swagger / OpenAPI |
| **Styling** | Tailwind CSS 4 |

---

<p align="center">
  <sub>Built with ❤️ using Domain-Driven Design & CQRS</sub>
</p>
