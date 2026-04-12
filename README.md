# Concert App

Concert App la he thong quan ly va van hanh su kien concert theo huong full-stack, gom backend NestJS va frontend Next.js. Du an khong chi giai quyet bai toan dat ve, ma con mo rong sang quan ly nghe si, lich bieu dien, thanh toan, nhan su su kien, vendor, thiet bi, logistics va bao cao van hanh.

Tai lieu thiet ke chi tiet hon duoc dat tai [DESIGNE.md](./DESIGNE.md).

## 1. Tong quan du an

### Muc tieu

He thong duoc xay dung de phuc vu 3 nhom doi tuong chinh:

- Khach hang: tim kiem concert, xem chi tiet, dat ve, thanh toan, theo doi lich su giao dich.
- Organizer: tao concert, quan ly ticket, lich bieu dien, staff, cong viec, requirement van hanh.
- Vendor va manager: quan ly thiet bi, xu ly don logistics, tuyen dung, giao viec cho nhan su.

### Gia tri chinh cua he thong

- Tach domain thanh nhieu context de de mo rong.
- Ap dung CQRS cho backend de tach lenh ghi va truy van doc.
- Su dung Redis cho cache va quy trinh check-in.
- Su dung Elasticsearch de dong bo du lieu tim kiem concert.
- Su dung MinIO cho luu tru file media va CV.
- Su dung VNPay sandbox cho quy trinh thanh toan.

## 2. Kien truc tong the

Repository hien tai duoc to chuc thanh 2 phan:

- `concertapp/`: backend API su dung NestJS.
- `fontend/`: frontend su dung Next.js.

### So do muc cao

```text
Frontend (Next.js, port 3000)
        |
        v
Backend API (NestJS, port 3001)
        |
        +-- PostgreSQL   : du lieu nghiep vu
        +-- Redis        : cache concert, session check-in
        +-- MinIO        : anh concert, seat map, CV
        +-- Elasticsearch: tim kiem concert
        +-- VNPay        : thanh toan sandbox
```

### Kien truc backend

Backend duoc chia thanh cac bounded context:

- `concert`: quan ly concert, nghe si, performance, ticket pool, tim kiem, upload anh.
- `booking`: dat ve, huy booking, truy van booking theo user.
- `billing`: tao invoice, issue invoice, tao payment URL, xu ly callback VNPay.
- `identity`: dang ky, dang nhap, refresh token, Google OAuth, quen mat khau, cap nhat profile.
- `organizing`: location, shift, zone, staff, recruitment, vendor, task, requirement, report.

Moi context duoc to chuc theo cac lop:

- `presentation`: controller, DTO, HTTP contract.
- `application`: command, query, handler, event handler.
- `domain`: entity, aggregate, value object, repository interface, policy.
- `infrastructure`: Prisma repository, storage service, Redis, Elasticsearch, auth service.

### Mot so pattern dang duoc ap dung

- DDD: tach domain theo context va repository interface.
- CQRS: su dung `@nestjs/cqrs` de tach command va query.
- Repository pattern: domain interface, infrastructure implementation.
- Value Object: `Money`, `Email`, `Password`, `ConcertId`, `BookingId`.
- Domain Event: booking, concert, billing co event handler rieng.
- Storage abstraction: interface luu file va implementation bang MinIO.

## 3. Cau truc thu muc

```text
Concert_app/
|-- README.md
|-- DESIGNE.md
|-- docker-compose.yml
|-- concertapp/
|   |-- package.json
|   |-- prisma/
|   |   |-- schema.prisma
|   |   |-- schema/
|   |   `-- seed.ts
|   `-- src/
|       |-- app.module.ts
|       |-- main.ts
|       |-- prisma.service.ts
|       |-- common/
|       `-- contexts/
|           |-- billing/
|           |-- booking/
|           |-- concert/
|           |-- identity/
|           `-- organizing/
`-- fontend/
    |-- package.json
    |-- app/
    |-- src/
    `-- public/
```

Luu y:

- Thu muc frontend hien tai duoc dat ten la `fontend/`, khong phai `frontend/`.
- Swagger API dang duoc mount tai `/api/docs`.
- Backend mac dinh chay cong `3001`.

## 4. Chuc nang nghiep vu theo module

### 4.1 Identity

Chuc nang chinh:

- Dang ky tai khoan bang email/password.
- Dang nhap va nhan `accessToken`, `refreshToken`.
- Refresh token.
- Dang nhap bang Google OAuth.
- Quen mat khau va reset mat khau qua email.
- Doi mat khau va cap nhat profile.

Route chinh:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh-token`
- `GET /auth/google`
- `GET /auth/google/callback`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/change-password`
- `POST /auth/profile/update`

### 4.2 Concert

Chuc nang chinh:

- Tao, cap nhat, xoa concert.
- Upload `image` va `seatMap`.
- Tao nghe si, cap nhat nghe si, xoa nghe si.
- Them performance vao concert.
- Quan ly seat-based tickets hoac ticket pool.
- Tim kiem concert.
- Dong bo du lieu concert len Elasticsearch.
- Check-in ve theo quy trinh 2 buoc co Redis.

Route chinh:

- `GET /concerts`
- `GET /concerts/search?query=...`
- `GET /concerts/:id`
- `GET /concerts/organizer/:organizerId`
- `POST /concerts`
- `PUT /concerts/:id`
- `DELETE /concerts/:id`
- `POST /concerts/:id/tickets`
- `GET /concerts/:id/tickets`
- `PUT /concerts/:id/tickets/:ticketType`
- `DELETE /concerts/:id/tickets/:ticketType`
- `POST /concerts/:id/tickets/:ticketId/check-in`
- `GET /concerts/:id/tickets/:ticketId/status`
- `POST /concerts/:id/performances`
- `GET /concerts/:id/performances`
- `PUT /concerts/:concertId/performances/:performanceId`
- `DELETE /concerts/:concertId/performances/:performanceId`
- `POST /concerts/artists`
- `GET /concerts/artists`
- `GET /concerts/artists/:artistId`
- `PUT /concerts/artists/:artistId`
- `DELETE /concerts/artists/:artistId`
- `POST /concerts/sync-es`

### 4.3 Booking

Chuc nang chinh:

- Tao booking tu seat hoac nhom ticket.
- Huy booking.
- Lay danh sach booking cua user.

Route chinh:

- `POST /bookings`
- `POST /bookings/:id/cancel`
- `GET /bookings/user/:userId`

### 4.4 Billing

Chuc nang chinh:

- Tao invoice cho booking.
- Issue invoice.
- Tao payment URL qua VNPay.
- Xu ly callback thanh toan.
- Lay lich su invoice va payment cua user.
- Initiate payment truc tiep tu booking.

Route chinh:

- `POST /billing/invoices`
- `POST /billing/invoices/:id/issue`
- `POST /billing/payments/initiate`
- `GET /billing/payments/callback`
- `GET /billing/my-history?userId=...`
- `POST /billing/payments/booking/:bookingId/initiate`

### 4.5 Organizing

Day la module rong nhat, bao phu van hanh su kien:

- Gan location cho concert.
- Tao requirement van hanh.
- Tao zone, shift va assign staff vao shift.
- Quan ly logistics va equipment cho concert.
- Tao va giao task cho staff.
- Moi nhan su tham gia doi ngu.
- Quan ly job board va review don ung tuyen.
- Quan ly vendor, thiet bi, don logistics va tuyen dung phia vendor.
- Tao report sau su kien.

Route chinh duoc tach thanh 4 nhom:

- `organize/*`: operation, concert staffing, recruitment, reports.
- `vendor/*`: equipment, order, vendor staff, requirement, vendor jobs.
- `organize/jobs*`: job board organizer/manager.
- `organize/staff*`: invite, join team, profile, task, discover staff.

## 5. Frontend hien co

Frontend su dung Next.js App Router va da co nhieu man hinh nghiep vu thuc te:

- Trang chu va trang chi tiet concert.
- Dang ky, dang nhap, quen mat khau, doi mat khau.
- Bookings va payment callback.
- Dashboard organizer.
- Quan ly staff, task, recruitment, operations.
- Khu vuc vendor: logistics, equipment, requirement, recruitment.
- Khu vuc staff: dashboard, manager page, scan ticket.

Mot so route frontend de tham khao:

- `/`
- `/concerts/[id]`
- `/login`
- `/register`
- `/bookings`
- `/organizer`
- `/organizer/concerts/[id]/tickets`
- `/organizer/concerts/[id]/operations`
- `/organizer/staff`
- `/vendor`
- `/vendor/logistics`
- `/vendor/equipment`
- `/vendor/recruitment`
- `/staff`
- `/staff/scan`

## 6. Cong nghe su dung

| Thanh phan | Cong nghe |
| --- | --- |
| Backend | NestJS 11, TypeScript |
| Frontend | Next.js 16, React 19 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Cache | Redis |
| Search | Elasticsearch |
| Storage | MinIO |
| Authentication | JWT, Passport, Google OAuth |
| Payment | VNPay sandbox |
| Mail | Nodemailer |
| Queue/Background | Bull |
| API docs | Swagger |
| State management frontend | Redux Toolkit |
| Styling | Tailwind CSS 4 |

## 7. Yeu cau moi truong

Can chuan bi:

- Node.js 18 tro len
- npm
- Docker Desktop neu muon chay bang compose
- PostgreSQL, Redis, MinIO, Elasticsearch neu chay local tung dich vu

## 8. Chay nhanh bang Docker Compose

Day la cach don gian nhat de dung toan bo stack:

### Buoc 1: tao file `.env` o thu muc goc

Ban co the tao `.env` can ban nhu sau:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=concert

MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password

JWT_SECRET=replace_me
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=replace_me_too
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

ELASTICSEARCH_NODE=http://elasticsearch:9200
REDIS_HOST=redis
REDIS_PORT=6379

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

VNP_TMN_CODE=
VNP_HASH_SECRET=

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM="Concert App <noreply@concertapp.com>"

DEFAULT_OAUTH_PASSWORD_HASH=
```

### Buoc 2: chay compose

```bash
docker compose up --build
```

### Buoc 3: truy cap he thong

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`
- MinIO Console: `http://localhost:9001`
- Elasticsearch: `http://localhost:9200`

## 9. Chay local tung phan

### 9.1 Khoi dong backend

```bash
cd concertapp
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

Neu can seed category:

```bash
cd concertapp
npx ts-node prisma/seed.ts
```

Backend mac dinh chay tai:

```text
http://localhost:3001
```

### 9.2 Khoi dong frontend

```bash
cd fontend
npm install
npm run dev
```

Frontend mac dinh chay tai:

```text
http://localhost:3000
```

## 10. Bien moi truong quan trong

### 10.1 Backend

| Bien | Bat buoc | Y nghia |
| --- | --- | --- |
| `PORT` | Khong | Cong backend, mac dinh `3001` |
| `DATABASE_URL` | Co | Chuoi ket noi PostgreSQL |
| `REDIS_HOST` | Khong | Host Redis |
| `REDIS_PORT` | Khong | Port Redis |
| `ELASTICSEARCH_NODE` | Khong | URL Elasticsearch |
| `JWT_SECRET` | Co | Secret ky access token |
| `JWT_EXPIRES_IN` | Co | Thoi gian het han access token |
| `JWT_REFRESH_SECRET` | Co | Secret ky refresh token |
| `JWT_REFRESH_EXPIRES_IN` | Co | Thoi gian het han refresh token |
| `FRONTEND_URL` | Nen co | URL frontend de redirect OAuth va reset password |
| `GOOGLE_CLIENT_ID` | Tuy chon | Cau hinh Google login |
| `GOOGLE_CLIENT_SECRET` | Tuy chon | Cau hinh Google login |
| `GOOGLE_CALLBACK_URL` | Tuy chon | Callback OAuth |
| `MAIL_HOST` | Tuy chon | SMTP host |
| `MAIL_PORT` | Tuy chon | SMTP port |
| `MAIL_USER` | Tuy chon | Tai khoan gui mail |
| `MAIL_PASS` | Tuy chon | Mat khau hoac app password |
| `MAIL_FROM` | Tuy chon | Dia chi nguoi gui |
| `MINIO_ENDPOINT` | Nen co | Host MinIO |
| `MINIO_PORT` | Nen co | Port MinIO |
| `MINIO_USE_SSL` | Khong | Dung HTTPS hay khong |
| `MINIO_ACCESS_KEY` | Nen co | Access key MinIO |
| `MINIO_SECRET_KEY` | Nen co | Secret key MinIO |
| `VNP_TMN_CODE` | Tuy chon | Ma terminal VNPay |
| `VNP_HASH_SECRET` | Tuy chon | Secret VNPay |
| `DEFAULT_OAUTH_PASSWORD_HASH` | Tuy chon | Hash mac dinh cho user dang nhap OAuth |

### 10.2 Frontend

| Bien | Bat buoc | Y nghia |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Co | URL de frontend goi backend |

## 11. Luong nghiep vu chinh

### 11.1 Tao va ban concert

1. Organizer tao concert.
2. Organizer upload anh, seat map, category, hashtag.
3. Organizer tao nghe si va performance.
4. Organizer tao seat/ticket pool.
5. Frontend hien thi concert de user dat ve.

### 11.2 Dat ve va thanh toan

1. User dang nhap.
2. User tao booking.
3. He thong tao invoice.
4. Invoice duoc issue.
5. User khoi tao thanh toan qua VNPay.
6. VNPay goi callback ve backend.
7. He thong cap nhat payment, invoice va booking.

### 11.3 Check-in ve

1. Staff scan ticket.
2. Backend tao verification token va luu session trong Redis.
3. Client xac nhan token o buoc 2.
4. Ve duoc check-in, co the check-in theo ca booking.

### 11.4 Van hanh su kien

1. Organizer tao requirement cho concert.
2. Tao zone va shift.
3. Gan manager, staff, vendor cho tung nhu cau.
4. Theo doi equipment, logistics, task va bao cao.

## 12. Du lieu va persistence

Prisma schema hien tai bao phu cac nhom du lieu lon sau:

- Nguoi dung va xac thuc: `User`, `Staff`, `Vendor`, `StaffInvitation`
- Concert: `Concert`, `Artist`, `Performance`, `Category`
- Ticketing: `Seat`, `TicketPool`, `Ticket`, `Booking`
- Billing: `Invoice`, `InvoiceItem`, `Payment`
- Operations: `Organize`, `Location`, `Logistics`, `Zone`, `Shift`, `ShiftAssignment`
- Recruitment: `JobPost`, `StaffApplication`
- Vendor operations: `Equipment`, `LogisticsOrder`, `LogisticsOrderItem`, `EventRequirement`
- Reporting: `EventReport`

## 13. Swagger va kiem thu API

Sau khi chay backend, mo:

```text
http://localhost:3001/api/docs
```

Swagger la diem bat dau tot nhat de:

- xem request/response contract,
- test nhanh API,
- kiem tra authentication bearer token,
- doi chieu endpoint voi frontend.

## 14. Scripts huu ich

### Backend `concertapp/package.json`

- `npm run start:dev`: chay backend o che do watch
- `npm run build`: build backend
- `npm run test`: unit test
- `npm run test:e2e`: end-to-end test
- `npm run lint`: lint va sua loi co the autofix

### Frontend `fontend/package.json`

- `npm run dev`: chay frontend
- `npm run build`: build production
- `npm run start`: chay production build
- `npm run lint`: lint frontend

## 15. Ghi chu ky thuat quan trong

- Controller `GET /concerts/:id` dang su dung Redis cache TTL 300 giay.
- Tim kiem concert co ho tro dong bo Elasticsearch qua endpoint `POST /concerts/sync-es`.
- Upload media concert va CV hien tai dung MinIO.
- VNPay dang o `testMode: true`, phu hop moi truong dev/sandbox.
- Password reset mail co fallback log neu SMTP chua cau hinh day du.
- Co mot so route organizing va vendor su dung `RolesGuard`, can dam bao payload JWT va role mapping dung.

## 16. Huong mo rong de xuat

Neu tiep tuc phat trien, co the uu tien:

- bo sung migration workflow ro rang cho Prisma,
- viet them test cho booking concurrency va payment callback,
- bo sung RBAC chat che hon cho toan bo route,
- tach API contract thanh OpenAPI versioned,
- them observability: logging, tracing, health checks,
- them ci/cd va quy trinh release.

## 17. Tai lieu lien quan

- [DESIGNE.md](./DESIGNE.md): tai lieu thiet ke kien truc va quyet dinh ky thuat.
- `docker-compose.yml`: khoi dong nhanh he thong local.
- `concertapp/prisma/schema.prisma`: mo hinh du lieu tong.
- `concertapp/src/app.module.ts`: composition root cua backend.
- `fontend/app/`: cac route chinh cua frontend.

