# 🎵 Concert App 🎵

**Concert App** là hệ thống quản lý và vận hành sự kiện concert theo hướng full-stack, gồm backend **NestJS** và frontend **Next.js**. Dự án không chỉ giải quyết bài toán đặt vé, mà còn mở rộng sang quản lý nghệ sĩ, lịch biểu diễn, thanh toán, nhân sự sự kiện, vendor, thiết bị, logistics và báo cáo vận hành.

Tài liệu thiết kế chi tiết hơn được đặt tại [DESIGN.md](./DESIGN.md).

## 1. Tổng quan dự án

### Mục tiêu

Hệ thống được xây dựng để phục vụ 5 nhóm đối tượng chính:

- **Khách hàng**: Tìm kiếm concert, xem chi tiết, đặt vé, thanh toán, theo dõi lịch sử giao dịch.
- **Organizer**: Tạo concert, quản lý ticket, lịch biểu diễn , xem báo cáo tiến độ , nhân sự từ Event Manager, tuyển dụng , liên hệ Vendor + EventManger.
- **Event Manager**: Quản lý Department manager , Vendor , Staff, giám sát + giao công việc, requirement vận hành , Tìm liên hệ kết nối với Vendor , Organizer(Nếu là Freelancer).
- **Vendor và Departmanager**: Quản lý thiết bị, xử lý đơn logistics, tuyển dụng, giao việc cho nhân sự.
- **Staff**: Quản lý công việc được giao , báo cáo tiến độ , tìm việc làm.

### Giá trị chính của hệ thống

- Tách domain thành nhiều context để dễ mở rộng.
- Áp dụng **CQRS** cho backend để tách lệnh ghi và truy vấn đọc.
- Sử dụng **Redis** cho cache và quy trình check-in.
- Sử dụng **Elasticsearch** để đồng bộ dữ liệu tìm kiếm concert.
- Sử dụng **MinIO** cho lưu trữ file media và CV.
- Sử dụng **VNPay sandbox** cho quy trình thanh toán.

## 2. Kiến trúc tổng thể

Repository hiện tại được tổ chức thành 2 phần:

- `concertapp/`: backend API sử dụng NestJS.
- `fontend/`: frontend sử dụng Next.js.

### Sơ đồ mức cao

```text
Frontend (Next.js, port 3000)
        |
        v
Backend API (NestJS, port 3001)
        |
        +-- PostgreSQL   : dữ liệu nghiệp vụ
        +-- Redis        : cache concert, session check-in
        +-- MinIO        : ảnh concert, seat map, CV
        +-- Elasticsearch: tìm kiếm concert
        +-- VNPay        : thanh toán sandbox
```

### Kiến trúc backend

Backend được chia thành các **bounded context**:

- `concert`: quản lý concert, nghệ sĩ, performance, ticket pool, tìm kiếm, upload ảnh.
- `booking`: đặt vé, hủy booking, truy vấn booking theo user.
- `billing`: tạo invoice, issue invoice, tạo payment URL, xử lý callback VNPay.
- `identity`: đăng ký, đăng nhập, refresh token, Google OAuth, quên mật khẩu, cập nhật profile.
- `organizing`: location, shift, zone, staff, recruitment, vendor, task, requirement, report.

Mỗi context được tổ chức theo các lớp:

- `presentation`: controller, DTO, HTTP contract.
- `application`: command, query, handler, event handler.
- `domain`: entity, aggregate, value object, repository interface, policy.
- `infrastructure`: Prisma repository, storage service, Redis, Elasticsearch, auth service.

### Một số pattern đang được áp dụng

- **DDD**: tách domain theo context và repository interface.
- **CQRS**: sử dụng `@nestjs/cqrs` để tách command và query.
- **Repository pattern**: domain interface, infrastructure implementation.
- **Value Object**: `Money`, `Email`, `Password`, `ConcertId`, `BookingId`.
- **Domain Event**: booking, concert, billing có event handler riêng.
- **Storage abstraction**: interface lưu file và implementation bằng MinIO.

## 3. Cấu trúc thư mục

```text
Concert_app/
|-- README.md
|-- DESIGN.md
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

**Lưu ý**:

- Thư mục frontend hiện tại được đặt tên là `fontend/`, không phải `frontend/`.
- Swagger API đang được mount tại `/api/docs`.
- Backend mặc định chạy cổng `3001`.

## 4. Chức năng nghiệp vụ theo module

### 4.1 Identity

**Chức năng chính**:

- Đăng ký tài khoản bằng email/password.
- Đăng nhập và nhận `accessToken`, `refreshToken`.
- Refresh token.
- Đăng nhập bằng Google OAuth.
- Quên mật khẩu và reset mật khẩu qua email.
- Đổi mật khẩu và cập nhật profile.

**Route chính**:

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

**Chức năng chính**:

- Tạo, cập nhật, xóa concert.
- Upload `image` và `seatMap`.
- Tạo nghệ sĩ, cập nhật nghệ sĩ, xóa nghệ sĩ.
- Thêm performance vào concert.
- Quản lý seat-based tickets hoặc ticket pool.
- Tìm kiếm concert.
- Đồng bộ dữ liệu concert lên Elasticsearch.
- Check-in vé theo quy trình 2 bước có Redis.

**Route chính**:

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

**Chức năng chính**:

- Tạo booking từ seat hoặc nhóm ticket.
- Hủy booking.
- Lấy danh sách booking của user.

**Route chính**:

- `POST /bookings`
- `POST /bookings/:id/cancel`
- `GET /bookings/user/:userId`

### 4.4 Billing

**Chức năng chính**:

- Tạo invoice cho booking.
- Issue invoice.
- Tạo payment URL qua VNPay.
- Xử lý callback thanh toán.
- Lấy lịch sử invoice và payment của user.
- Initiate payment trực tiếp từ booking.

**Route chính**:

- `POST /billing/invoices`
- `POST /billing/invoices/:id/issue`
- `POST /billing/payments/initiate`
- `GET /billing/payments/callback`
- `GET /billing/my-history?userId=...`
- `POST /billing/payments/booking/:bookingId/initiate`

### 4.5 Organizing

Đây là module rộng nhất, bao phủ vận hành sự kiện:

- Gán location cho concert.
- Tạo requirement vận hành.
- Tạo zone, shift và assign staff vào shift.
- Quản lý logistics và equipment cho concert.
- Tạo và giao task cho staff.
- Mời nhân sự tham gia đội ngũ.
- Quản lý job board và review đơn ứng tuyển.
- Quản lý vendor, thiết bị, đơn logistics và tuyển dụng phía vendor.
- Tạo report sau sự kiện.

**Route chính** được tách thành 4 nhóm:

- `organize/*`: operation, concert staffing, recruitment, reports.
- `vendor/*`: equipment, order, vendor staff, requirement, vendor jobs.
- `organize/jobs*`: job board organizer/manager.
- `organize/staff*`: invite, join team, profile, task, discover staff.

## 5. Frontend hiện có

Frontend sử dụng **Next.js App Router** và đã có nhiều màn hình nghiệp vụ thực tế:

- Trang chủ và trang chi tiết concert.
- Đăng ký, đăng nhập, quên mật khẩu, đổi mật khẩu.
- Bookings và payment callback.
- Dashboard organizer.
- Quản lý staff, task, recruitment, operations.
- Khu vực vendor: logistics, equipment, requirement, recruitment.
- Khu vực staff: dashboard, manager page, scan ticket.

**Một số route frontend để tham khảo**:

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

## 6. Công nghệ sử dụng

| Thành phần     | Công nghệ             |
|----------------|-----------------------|
| Backend        | NestJS 11, TypeScript |
| Frontend       | Next.js 16, React 19  |
| Database       | PostgreSQL            |
| ORM            | Prisma 7              |
| Cache          | Redis                 |
| Search         | Elasticsearch         |
| Storage        | MinIO                 |
| Authentication | JWT, Passport, Google OAuth |
| Payment        | VNPay sandbox         |
| Mail           | Nodemailer            |
| Queue/Background | Bull               |
| API docs       | Swagger               |
| State management frontend | Redux Toolkit |
| Styling        | Tailwind CSS 4        |

## 7. Yêu cầu môi trường

Cần chuẩn bị:

- **Node.js** 18 trở lên
- **npm**
- **Docker Desktop** nếu muốn chạy bằng compose
- **PostgreSQL, Redis, MinIO, Elasticsearch** nếu chạy local từng dịch vụ

## 8. Chạy nhanh bằng Docker Compose

Đây là cách đơn giản nhất để dùng toàn bộ stack:

### Bước 1: Tạo file `.env` ở thư mục gốc

Bạn có thể tạo `.env` cơ bản như sau:

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

### Bước 2: Chạy compose

```bash
docker compose up --build
```

### Bước 3: Truy cập hệ thống

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **Swagger**: `http://localhost:3001/api/docs`
- **MinIO Console**: `http://localhost:9001`
- **Elasticsearch**: `http://localhost:9200`

## 9. Chạy local từng phần

### 9.1 Khởi động backend

```bash
cd concertapp
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

Nếu cần seed category:

```bash
cd concertapp
npx ts-node prisma/seed.ts
```

Backend mặc định chạy tại:

```text
http://localhost:3001
```

### 9.2 Khởi động frontend

```bash
cd fontend
npm install
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:3000
```

## 10. Biến môi trường quan trọng

### 10.1 Backend

| Biến                  | Bắt buộc | Ý nghĩa                               |
|-----------------------|----------|---------------------------------------|
| `PORT`                | Không    | Cổng backend, mặc định `3001`         |
| `DATABASE_URL`        | Có       | Chuỗi kết nối PostgreSQL              |
| `REDIS_HOST`          | Không    | Host Redis                            |
| `REDIS_PORT`          | Không    | Port Redis                            |
| `ELASTICSEARCH_NODE`  | Không    | URL Elasticsearch                     |
| `JWT_SECRET`          | Có       | Secret ký access token                |
| `JWT_EXPIRES_IN`      | Có       | Thời gian hết hạn access token        |
| `JWT_REFRESH_SECRET`  | Có       | Secret ký refresh token               |
| `JWT_REFRESH_EXPIRES_IN` | Có    | Thời gian hết hạn refresh token       |
| `FRONTEND_URL`        | Nên có   | URL frontend để redirect OAuth và reset password |
| `GOOGLE_CLIENT_ID`    | Tùy chọn | Cấu hình Google login                 |
| `GOOGLE_CLIENT_SECRET`| Tùy chọn | Cấu hình Google login                 |
| `GOOGLE_CALLBACK_URL` | Tùy chọn | Callback OAuth                        |
| `MAIL_HOST`           | Tùy chọn | SMTP host                             |
| `MAIL_PORT`           | Tùy chọn | SMTP port                             |
| `MAIL_USER`           | Tùy chọn | Tài khoản gửi mail                    |
| `MAIL_PASS`           | Tùy chọn | Mật khẩu hoặc app password            |
| `MAIL_FROM`           | Tùy chọn | Địa chỉ người gửi                     |
| `MINIO_ENDPOINT`      | Nên có   | Host MinIO                            |
| `MINIO_PORT`          | Nên có   | Port MinIO                            |
| `MINIO_USE_SSL`       | Không    | Dùng HTTPS hay không                  |
| `MINIO_ACCESS_KEY`    | Nên có   | Access key MinIO                      |
| `MINIO_SECRET_KEY`    | Nên có   | Secret key MinIO                      |
| `VNP_TMN_CODE`        | Tùy chọn | Mã terminal VNPay                     |
| `VNP_HASH_SECRET`     | Tùy chọn | Secret VNPay                          |
| `DEFAULT_OAUTH_PASSWORD_HASH` | Tùy chọn | Hash mặc định cho user đăng nhập OAuth |

### 10.2 Frontend

| Biến                | Bắt buộc | Ý nghĩa                    |
|---------------------|----------|----------------------------|
| `NEXT_PUBLIC_API_URL` | Có     | URL để frontend gọi backend |

## 11. Luồng nghiệp vụ chính

### 11.1 Tạo và bán concert

1. Organizer tạo concert.
2. Organizer upload ảnh, seat map, category, hashtag.
3. Organizer tạo nghệ sĩ và performance.
4. Organizer tạo seat/ticket pool.
5. Frontend hiển thị concert để user đặt vé.

### 11.2 Đặt vé và thanh toán

1. User đăng nhập.
2. User tạo booking.
3. Hệ thống tạo invoice.
4. Invoice được issue.
5. User khởi tạo thanh toán qua VNPay.
6. VNPay gọi callback về backend.
7. Hệ thống cập nhật payment, invoice và booking.

### 11.3 Check-in vé

1. Staff scan ticket.
2. Backend tạo verification token và lưu session trong Redis.
3. Client xác nhận token ở bước 2.
4. Vé được check-in, có thể check-in theo cả booking.

### 11.4 Vận hành sự kiện

1. Organizer tạo requirement cho concert.
2. Tạo zone và shift.
3. Gán manager, staff, vendor cho từng nhu cầu.
4. Theo dõi equipment, logistics, task và báo cáo.

## 12. Dữ liệu và persistence

**Prisma schema** hiện tại bao phủ các nhóm dữ liệu lớn sau:

- Người dùng và xác thực: `User`, `Staff`, `Vendor`, `StaffInvitation`
- Concert: `Concert`, `Artist`, `Performance`, `Category`
- Ticketing: `Seat`, `TicketPool`, `Ticket`, `Booking`
- Billing: `Invoice`, `InvoiceItem`, `Payment`
- Operations: `Organize`, `Location`, `Logistics`, `Zone`, `Shift`, `ShiftAssignment`
- Recruitment: `JobPost`, `StaffApplication`
- Vendor operations: `Equipment`, `LogisticsOrder`, `LogisticsOrderItem`, `EventRequirement`
- Reporting: `EventReport`

## 13. Swagger và kiểm thử API

Sau khi chạy backend, mở:

```text
http://localhost:3001/api/docs
```

**Swagger** là điểm bắt đầu tốt nhất để:

- xem request/response contract,
- test nhanh API,
- kiểm tra authentication bearer token,
- đối chiếu endpoint với frontend.

## 14. Scripts hữu ích

### Backend `concertapp/package.json`

- `npm run start:dev`: chạy backend ở chế độ watch
- `npm run build`: build backend
- `npm run test`: unit test
- `npm run test:e2e`: end-to-end test
- `npm run lint`: lint và sửa lỗi có thể autofix

### Frontend `fontend/package.json`

- `npm run dev`: chạy frontend
- `npm run build`: build production
- `npm run start`: chạy production build
- `npm run lint`: lint frontend

## 15. Ghi chú kỹ thuật quan trọng

- Controller `GET /concerts/:id` đang sử dụng **Redis cache TTL 300 giây**.
- Tìm kiếm concert có hỗ trợ đồng bộ **Elasticsearch** qua endpoint `POST /concerts/sync-es`.
- Upload media concert và CV hiện tại dùng **MinIO**.
- **VNPay** đang ở `testMode: true`, phù hợp môi trường dev/sandbox.
- Password reset mail có fallback log nếu SMTP chưa cấu hình đầy đủ.
- Có một số route organizing và vendor sử dụng `RolesGuard`, cần đảm bảo payload JWT và role mapping đúng.

## 16. Hướng mở rộng đề xuất

Nếu tiếp tục phát triển, có thể ưu tiên:

- tích hợp AI duyệt CV , cũng như hỗ trợ organizer + user
- bổ sung migration workflow rõ ràng cho Prisma,
- viết thêm test cho booking concurrency và payment callback,
- bổ sung **RBAC** chặt chẽ hơn cho toàn bộ route,
- tách API contract thành **OpenAPI versioned**,
- thêm observability: logging, tracing, health checks,
- thêm CI/CD và quy trình release.

## 17. Tài liệu liên quan

- [DESIGN.md](./DESIGN.md): tài liệu thiết kế kiến trúc và quyết định kỹ thuật.
- `docker-compose.yml`: khởi động nhanh hệ thống local.
- `concertapp/prisma/schema.prisma`: mô hình dữ liệu tổng.
- `concertapp/src/app.module.ts`: composition root của backend.
- `fontend/app/`: các route chính của frontend.

