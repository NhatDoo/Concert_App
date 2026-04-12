# 🎨 DESIGN.md

## 1. Mục đích tài liệu

Tài liệu này mô tả **thiết kế kỹ thuật** của **Concert App** ở mức độ kiến trúc và implementation. Mục tiêu là giúp:

- hiểu cách hệ thống được chia module,
- hiểu luồng dữ liệu giữa frontend, backend và hạ tầng,
- thống nhất các quyết định thiết kế chính,
- dễ bảo trì, mở rộng hoặc thuyết trình đồ án.

## 2. Phạm vi hệ thống

**Concert App** không chỉ là ứng dụng đặt vé. Hệ thống bao gồm các phần:

- quản lý concert,
- quản lý artist và performance,
- booking và billing,
- identity và authentication,
- vận hành staff và vendor,
- requirement, shift, task, logistics,
- check-in sự kiện,
- dashboard frontend cho nhiều vai trò.

## 3. Nguyên tắc thiết kế

### 3.1 Tách domain theo bounded context

Thay vì đưa toàn bộ nghiệp vụ vào một module lớn, hệ thống tách thành:

- **Concert**
- **Booking**
- **Billing**
- **Identity**
- **Organizing**

Điều này giúp:

- dễ phân chia trách nhiệm,
- giảm coupling giữa nghiệp vụ,
- dễ mở rộng thêm team hoặc service về sau.

### 3.2 Dùng CQRS cho backend

Lệnh thay đổi state và truy vấn đọc dữ liệu được tách riêng:

- **Command**: xử lý thay đổi dữ liệu.
- **Query**: xử lý đọc dữ liệu.

Lợi ích:

- dễ tổ chức use case theo nghiệp vụ,
- dễ tối ưu riêng cho luồng đọc và luồng ghi,
- dễ chèn event handler hoặc side-effect sau này.

### 3.3 Infrastructure ẩn sau abstraction

Code domain không phụ thuộc trực tiếp vào **Prisma**, **Redis**, **MinIO** hay **VNPay**. Các thành phần này nằm ở infrastructure layer và được inject vào qua interface hoặc service.

## 4. Sơ đồ kiến trúc

```text
[ Next.js Frontend ]
        |
        | HTTP / JSON
        v
[ NestJS Controllers ]
        |
        | CQRS
        +--> CommandBus --> Command Handlers --> Domain --> Repository --> PostgreSQL
        |
        +--> QueryBus   --> Query Handlers   --> Prisma/Read Model
        |
        +--> Redis            : cache, check-in session
        +--> MinIO            : media storage
        +--> Elasticsearch    : search index
        +--> VNPay            : payment gateway
        +--> Nodemailer/SMTP  : reset password email
```

## 5. Mô tả từng context

### 5.1 Identity Context

**Trách nhiệm**:

- quản lý user account,
- login/password flow,
- refresh token,
- Google OAuth,
- profile update,
- forgot/reset password.

**Thành phần chính**:

- `User` entity
- **VO**: `Email`, `Password`, `PhoneNumber`, `Role`
- `JwtTokenService`
- `JwtStrategy`
- `GoogleStrategy`
- `MailService`

**Quyết định kỹ thuật**:

- Access token và refresh token được tạo riêng.
- JWT payload có thể mang thêm `staffRole`.
- Password reset link dựa trên `FRONTEND_URL`.

### 5.2 Concert Context

**Trách nhiệm**:

- tạo và cập nhật concert,
- lưu hình ảnh và seat map,
- quản lý artist và performance,
- quản lý ticket type/seat,
- truy vấn chi tiết concert,
- tìm kiếm và đồng bộ **Elasticsearch**,
- check-in.

**Điểm nổi bật**:

- `GET /concerts/:id` có cache **Redis TTL 300 giây**.
- Hệ thống hỗ trợ 2 mô hình vé:
  - seat-based qua bảng `Seat`
  - quantity-based qua bảng `TicketPool`
- Khi đọc concert detail, backend tự tổng hợp thống kê ticket từ `Seat` nếu concert có seat map.

**Quyết định kỹ thuật**:

- **Redis** giúp giảm truy vấn lặp lại cho concert detail.
- **Elasticsearch** dùng cho search, không phải source of truth.
- **MinIO** trả về public URL sau khi upload.

### 5.3 Booking Context

**Trách nhiệm**:

- tạo booking,
- hủy booking,
- đọc booking theo user,
- phối hợp với billing thông qua event/side effect.

**Quyết định kỹ thuật**:

- Booking là aggregate chính của luồng đặt vé.
- Trạng thái booking cần đảm bảo hợp lệ theo state transition.
- Có dấu vết cho optimistic/concurrency control trong model thông qua `version`.

### 5.4 Billing Context

**Trách nhiệm**:

- tạo invoice từ booking,
- issue invoice,
- thanh toán qua **VNPay**,
- callback xác nhận payment,
- lịch sử thanh toán.

**Quyết định kỹ thuật**:

- Invoice và Payment được lưu riêng.
- Payment gateway được abstract qua interface.
- Backend lưu metadata giao dịch **VNPay** vào `transactionId` dưới dạng JSON string để hỗ trợ refund sau này.
- Hiện tại đang chạy **VNPay sandbox** `testMode: true`.

### 5.5 Organizing Context

**Trách nhiệm**:

- location và logistics,
- concert staffing,
- tasks và shift,
- requirement vận hành,
- staff invitation,
- job board và recruitment,
- vendor equipment/order,
- event report.

**Điểm đặc biệt**:

- Đây là context rộng và hiện tại bao gồm cả organizer-side và vendor-side.
- Sử dụng nhiều route trực tiếp với **Prisma** trong controller cho tốc độ phát triển.
- Đã có `RolesGuard`, nhưng mức độ chặt chẽ chưa đồng đều giữa các route.

## 6. Mô hình dữ liệu mức cao

### 6.1 Nhóm identity

- `User`
- `Staff`
- `Vendor`
- `StaffInvitation`

**Quan hệ**:

- `User` có thể trở thành `Staff`.
- `User` có thể có một `Vendor`.
- `Staff` có thể thuộc concert, vendor, manager hoặc giữ vai trò event manager.

### 6.2 Nhóm concert và ticket

- `Concert`
- `Artist`
- `Performance`
- `Seat`
- `TicketPool`
- `Ticket`
- `Category`

**Quan hệ**:

- `Concert` có nhiều `Performance`.
- `Performance` thuộc một `Artist`.
- `Concert` có thể có `Seat` hoặc `TicketPool`.
- `Ticket` gắn với booking, seat và concert.

### 6.3 Nhóm booking và billing

- `Booking`
- `Invoice`
- `InvoiceItem`
- `Payment`

**Quan hệ**:

- `Booking` thuộc `User` và `Concert`.
- `Invoice` thuộc `Booking` và `User`.
- `Payment` thuộc `Invoice`.

### 6.4 Nhóm operations

- `Organize`
- `Location`
- `Logistics`
- `EventRequirement`
- `Zone`
- `Shift`
- `ShiftAssignment`
- `StaffTask`
- `EventReport`

### 6.5 Nhóm recruitment và vendor

- `JobPost`
- `StaffApplication`
- `Equipment`
- `LogisticsOrder`
- `LogisticsOrderItem`

## 7. Luồng xử lý chính

### 7.1 Luồng tạo concert

```text
Organizer UI
  -> POST /concerts
  -> ConcertController
  -> CreateConcertCommand
  -> CreateConcertHandler
  -> Domain + Storage service
  -> Prisma repository
  -> PostgreSQL
```

Nếu có file:

- ảnh được upload lên **MinIO**,
- seat map được upload lên **MinIO**,
- URL lưu vào bảng `Concert`.

### 7.2 Luồng xem chi tiết concert

```text
Frontend
  -> GET /concerts/:id
  -> Redis lookup
  -> Nếu hit: trả dữ liệu ngay
  -> Nếu miss: đọc PostgreSQL, tổng hợp ticket info, lưu Redis, trả response
```

### 7.3 Luồng booking và billing

```text
User tạo booking
  -> Booking aggregate được tạo
  -> Billing tạo invoice
  -> Invoice issue
  -> User thanh toán qua VNPay
  -> Callback xác nhận
  -> Payment success
  -> Invoice = PAID
  -> Booking = CONFIRMED
```

### 7.4 Luồng check-in 2 bước

**Bước 1**:

- Staff scan ticket.
- Hệ thống tạo `verificationToken`.
- **Redis** lưu session check-in trong 5 phút.

**Bước 2**:

- Client gửi lại token.
- Hệ thống đối chiếu token trong **Redis**.
- Nếu hợp lệ, đánh dấu `isCheckedIn = true`.

**Lý do chọn thiết kế này**:

- tránh check-in nhầm chỉ bằng 1 lần quét,
- cho phép xác nhận trên thiết bị khách hàng,
- phù hợp quy trình gate control.

## 8. Frontend design

Frontend được xây bằng **Next.js App Router** và chia theo route + feature:

- `app/`: route và page
- `src/features/`: chia theo domain UI
- `src/stores/`: Redux store
- `src/components/`: component dùng chung

**Kiểu thiết kế hiện tại**:

- frontend đóng vai trò **BFF client**, gọi trực tiếp backend REST API,
- UI đã có dashboard cho organizer, vendor, staff,
- state phức tạp được đẩy qua **Redux Toolkit**,
- route dynamic dùng cho concert detail và dashboard theo concert.

## 9. Hạ tầng và external services

### 9.1 PostgreSQL

Là **source of truth** cho toàn bộ nghiệp vụ.

### 9.2 Redis

Dùng cho 2 mục tiêu:

- cache concert detail,
- lưu phiên check-in tạm thời.

### 9.3 MinIO

Dùng để lưu:

- concert image,
- seat map,
- CV upload.

Bucket được tạo động khi cần và đặt **public-read**.

### 9.4 Elasticsearch

Dùng để:

- hỗ trợ tìm kiếm concert,
- tách read concern cho search.

Cần bổ sung indexing strategy và reindex workflow rõ ràng hơn nếu đưa lên production.

### 9.5 VNPay

Dùng cho:

- tạo payment URL,
- verify callback,
- chuẩn bị cho refund.

**Hiện tại**:

- đang ở sandbox,
- amount được nhân 100 để đúng format VNPay.

### 9.6 SMTP Mail

Dùng để gửi reset password. Nếu cấu hình mail chưa đầy đủ, hệ thống log reset link để phục vụ giai đoạn **MVP/dev**.

## 10. Bảo mật và phân quyền

**Đã có**:

- **JWT authentication**
- `JwtAuthGuard`
- `RolesGuard`
- role trong user/staff/vendor

**Cần cải thiện thêm**:

- đồng bộ enforcement auth cho tất cả route quan trọng,
- hạn chế user căn thiệp dữ liệu của user khác qua `userId` trên payload/request,
- tách role business và role technical rõ hơn,
- audit log cho thao tác nhạy cảm.

## 11. Điểm mạnh của thiết kế hiện tại

- Phân tách context rõ ràng.
- Có dữ liệu nghiệp vụ khá đầy đủ cho một hệ thống sự kiện.
- Hỗ trợ nhiều actor: customer, organizer, staff, vendor.
- Có cache, search, object storage, payment.
- Có frontend và backend trong cùng một workspace, dễ dev nhanh.

## 12. Nợ kỹ thuật và rủi ro hiện tại

### 12.1 Organizing context rất lớn

Một context đang gồm quá nhiều trách nhiệm:

- staffing,
- recruitment,
- vendor,
- operations,
- reporting.

**Rủi ro**:

- khó test,
- khó tách team,
- controller dễ phình to.

### 12.2 Một số controller truy cập Prisma trực tiếp

Điều này nhanh cho **MVP**, nhưng làm giảm tính đồng nhất với **DDD/CQRS**.

### 12.3 Authorization chưa thực sự chặt chẽ

Nhiều endpoint nhận `userId` từ body/query. Nếu không đối chiếu với **JWT claim**, có thể phát sinh lỗ bảo mật.

### 12.4 Chưa thấy rõ workflow migration

Repository có `schema.prisma`, `schema/` và một số thay đổi đang mở. Nên thống nhất cách sinh schema và chạy migration.

### 12.5 Test coverage chưa tương xứng độ phức tạp nghiệp vụ

Cần ưu tiên:

- booking concurrency,
- payment callback,
- role guard,
- check-in session flow.

## 13. Định hướng cải tiến đề xuất

### Gần hạn

- Bổ sung `.env.example` cho root, backend, frontend.
- Chuẩn hóa README setup và migration workflow.
- Thêm health check endpoint.
- Thêm test cho các flow quan trọng.

### Trung hạn

- Tách `organizing` thành `operations`, `staffing`, `vendor`.
- Chuyển một số Prisma query trực tiếp vào query service/repository.
- Chuẩn hóa **RBAC**.
- Thêm logging có cấu trúc.

### Dài hạn

- Tách service theo domain nếu lưu lượng tăng.
- Đưa message broker thực sự vào event-driven flow.
- Thêm monitoring, tracing, retry và outbox pattern.

## 14. Kết luận

**Concert App** đang có nền tảng khá tốt cho một hệ thống quản lý sự kiện concert đa nghiệp vụ. Thiết kế hiện tại ưu tiên tốc độ phát triển, tính thực dụng và khả năng demo end-to-end. Nếu muốn đưa sang mức production vững hơn, hướng tới tiếp theo nên là:

- cứng cáp auth/authorization,
- siết lại boundary giữa domain và infrastructure,
- tăng test và observability,
- tách nhỏ organizing context.

