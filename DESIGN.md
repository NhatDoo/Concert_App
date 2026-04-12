# DESIGNE.md

## 1. Muc dich tai lieu

Tai lieu nay mo ta thiet ke ky thuat cua Concert App o muc do kien truc va implementation. Muc tieu la giup:

- hieu cach he thong duoc chia module,
- hieu luong du lieu giua frontend, backend va ha tang,
- thong nhat cac quyet dinh thiet ke chinh,
- de bao tri, mo rong hoac thuyet trinh do an.

## 2. Pham vi he thong

Concert App khong chi la ung dung dat ve. He thong bao gom cac phan:

- quan ly concert,
- quan ly artist va performance,
- booking va billing,
- identity va authentication,
- van hanh staff va vendor,
- requirement, shift, task, logistics,
- check-in su kien,
- dashboard frontend cho nhieu vai tro.

## 3. Nguyen tac thiet ke

### 3.1 Tach domain theo bounded context

Thay vi dua toan bo nghiep vu vao mot module lon, he thong tach thanh:

- Concert
- Booking
- Billing
- Identity
- Organizing

Dieu nay giup:

- de phan chia trach nhiem,
- giam coupling giua nghiep vu,
- de mo rong them team hoac service ve sau.

### 3.2 Dung CQRS cho backend

Lenh thay doi state va truy van doc du lieu duoc tach rieng:

- Command: xu ly thay doi du lieu.
- Query: xu ly doc du lieu.

Loi ich:

- de to chuc use case theo nghiep vu,
- de toi uu rieng cho luong doc va luong ghi,
- de chen event handler hoac side-effect sau nay.

### 3.3 Infrastructure an sau abstraction

Code domain khong phu thuoc truc tiep vao Prisma, Redis, MinIO hay VNPay. Cac thanh phan nay nam o infrastructure layer va duoc inject vao qua interface hoac service.

## 4. So do kien truc

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

## 5. Mo ta tung context

### 5.1 Identity Context

Trach nhiem:

- quan ly user account,
- login/password flow,
- refresh token,
- Google OAuth,
- profile update,
- forgot/reset password.

Thanh phan chinh:

- `User` entity
- VO: `Email`, `Password`, `PhoneNumber`, `Role`
- `JwtTokenService`
- `JwtStrategy`
- `GoogleStrategy`
- `MailService`

Quyet dinh ky thuat:

- Access token va refresh token duoc tao rieng.
- JWT payload co the mang them `staffRole`.
- Password reset link dua tren `FRONTEND_URL`.

### 5.2 Concert Context

Trach nhiem:

- tao va cap nhat concert,
- luu hinh anh va seat map,
- quan ly artist va performance,
- quan ly ticket type/seat,
- truy van chi tiet concert,
- tim kiem va dong bo Elasticsearch,
- check-in.

Diem noi bat:

- `GET /concerts/:id` co cache Redis TTL 300 giay.
- He thong ho tro 2 mo hinh ve:
  - seat-based qua bang `Seat`
  - quantity-based qua bang `TicketPool`
- Khi doc concert detail, backend tu tong hop thong ke ticket tu `Seat` neu concert co seat map.

Quyet dinh ky thuat:

- Redis giup giam truy van lap lai cho concert detail.
- Elasticsearch dung cho search, khong phai source of truth.
- MinIO tra ve public URL sau khi upload.

### 5.3 Booking Context

Trach nhiem:

- tao booking,
- huy booking,
- doc booking theo user,
- phoi hop voi billing thong qua event/side effect.

Quyet dinh ky thuat:

- Booking la aggregate chinh cua luong dat ve.
- Trang thai booking can dam bao hop le theo state transition.
- Co dau vet cho optimistic/concurrency control trong model thong qua `version`.

### 5.4 Billing Context

Trach nhiem:

- tao invoice tu booking,
- issue invoice,
- thanh toan qua VNPay,
- callback xac nhan payment,
- lich su thanh toan.

Quyet dinh ky thuat:

- Invoice va Payment duoc luu rieng.
- Payment gateway duoc abstract qua interface.
- Backend luu metadata giao dich VNPay vao `transactionId` duoi dang JSON string de ho tro refund sau nay.
- Hien tai dang chay VNPay sandbox `testMode: true`.

### 5.5 Organizing Context

Trach nhiem:

- location va logistics,
- concert staffing,
- tasks va shift,
- requirement van hanh,
- staff invitation,
- job board va recruitment,
- vendor equipment/order,
- event report.

Diem dac biet:

- Day la context rong va hien tai bao gom ca organizer-side va vendor-side.
- Su dung nhieu route truc tiep voi Prisma trong controller cho toc do phat trien.
- Da co `RolesGuard`, nhung muc do chat che chua dong deu giua cac route.

## 6. Mo hinh du lieu muc cao

### 6.1 Nhom identity

- `User`
- `Staff`
- `Vendor`
- `StaffInvitation`

Quan he:

- `User` co the tro thanh `Staff`.
- `User` co the co mot `Vendor`.
- `Staff` co the thuoc concert, vendor, manager hoac giu vai tro event manager.

### 6.2 Nhom concert va ticket

- `Concert`
- `Artist`
- `Performance`
- `Seat`
- `TicketPool`
- `Ticket`
- `Category`

Quan he:

- `Concert` co nhieu `Performance`.
- `Performance` thuoc mot `Artist`.
- `Concert` co the co `Seat` hoac `TicketPool`.
- `Ticket` gan voi booking, seat va concert.

### 6.3 Nhom booking va billing

- `Booking`
- `Invoice`
- `InvoiceItem`
- `Payment`

Quan he:

- `Booking` thuoc `User` va `Concert`.
- `Invoice` thuoc `Booking` va `User`.
- `Payment` thuoc `Invoice`.

### 6.4 Nhom operations

- `Organize`
- `Location`
- `Logistics`
- `EventRequirement`
- `Zone`
- `Shift`
- `ShiftAssignment`
- `StaffTask`
- `EventReport`

### 6.5 Nhom recruitment va vendor

- `JobPost`
- `StaffApplication`
- `Equipment`
- `LogisticsOrder`
- `LogisticsOrderItem`

## 7. Luong xu ly chinh

### 7.1 Luong tao concert

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

Neu co file:

- anh duoc upload len MinIO,
- seat map duoc upload len MinIO,
- URL luu vao bang `Concert`.

### 7.2 Luong xem chi tiet concert

```text
Frontend
  -> GET /concerts/:id
  -> Redis lookup
  -> Neu hit: tra du lieu ngay
  -> Neu miss: doc PostgreSQL, tong hop ticket info, luu Redis, tra response
```

### 7.3 Luong booking va billing

```text
User tao booking
  -> Booking aggregate duoc tao
  -> Billing tao invoice
  -> Invoice issue
  -> User thanh toan qua VNPay
  -> Callback xac nhan
  -> Payment success
  -> Invoice = PAID
  -> Booking = CONFIRMED
```

### 7.4 Luong check-in 2 buoc

Buoc 1:

- Staff scan ticket.
- He thong tao `verificationToken`.
- Redis luu session check-in trong 5 phut.

Buoc 2:

- Client gui lai token.
- He thong doi chieu token trong Redis.
- Neu hop le, danh dau `isCheckedIn = true`.

Ly do chon thiet ke nay:

- tranh check-in nham chi bang 1 lan quet,
- cho phep xac nhan tren thiet bi khach hang,
- phu hop quy trinh gate control.

## 8. Frontend design

Frontend duoc xay bang Next.js App Router va chia theo route + feature:

- `app/`: route va page
- `src/features/`: chia theo domain UI
- `src/stores/`: Redux store
- `src/components/`: component dung chung

Kieu thiet ke hien tai:

- frontend dong vai tro BFF client, goi truc tiep backend REST API,
- UI da co dashboard cho organizer, vendor, staff,
- state phuc tap duoc dua qua Redux Toolkit,
- route dynamic dung cho concert detail va dashboard theo concert.

## 9. Ha tang va external services

### 9.1 PostgreSQL

La source of truth cho toan bo nghiep vu.

### 9.2 Redis

Dung cho 2 muc tieu:

- cache concert detail,
- luu phien check-in tam thoi.

### 9.3 MinIO

Dung de luu:

- concert image,
- seat map,
- CV upload.

Bucket duoc tao dong khi can va dat public-read.

### 9.4 Elasticsearch

Dung de:

- ho tro tim kiem concert,
- tach read concern cho search.

Can bo sung indexing strategy va reindex workflow ro rang hon neu dua len production.

### 9.5 VNPay

Dung cho:

- tao payment URL,
- verify callback,
- chuan bi cho refund.

Hien tai:

- dang o sandbox,
- amount duoc nhan 100 de dung format VNPay.

### 9.6 SMTP Mail

Dung de gui reset password. Neu cau hinh mail chua day du, he thong log reset link de phuc vu giai doan MVP/dev.

## 10. Bao mat va phan quyen

Da co:

- JWT authentication
- `JwtAuthGuard`
- `RolesGuard`
- role trong user/staff/vendor

Can cai thien them:

- dong bo enforcement auth cho tat ca route quan trong,
- han che user can thi du lieu cua user khac qua `userId` tren payload/request,
- tach role business va role technical ro hon,
- audit log cho thao tac nhay cam.

## 11. Diem manh cua thiet ke hien tai

- Phan tach context ro rang.
- Co du lieu nghiep vu kha day du cho mot he thong su kien.
- Ho tro nhieu actor: customer, organizer, staff, vendor.
- Co cache, search, object storage, payment.
- Co frontend va backend trong cung mot workspace, de dev nhanh.

## 12. No ky thuat va rui ro hien tai

### 12.1 Organizing context rat lon

Mot context dang gom qua nhieu trach nhiem:

- staffing,
- recruitment,
- vendor,
- operations,
- reporting.

Rui ro:

- kho test,
- kho tach team,
- controller de phinh to.

### 12.2 Mot so controller truy cap Prisma truc tiep

Dieu nay nhanh cho MVP, nhung lam giam tinh dong nhat voi DDD/CQRS.

### 12.3 Authorization chua thuc su chat che

Nhieu endpoint nhan `userId` tu body/query. Neu khong doi chieu voi JWT claim, co the phat sinh loi bao mat.

### 12.4 Chua thay ro workflow migration

Repository co `schema.prisma`, `schema/` va mot so thay doi dang mo. Nen thong nhat cach sinh schema va chay migration.

### 12.5 Test coverage chua tuong xung do phuc tap nghiep vu

Can uu tien:

- booking concurrency,
- payment callback,
- role guard,
- check-in session flow.

## 13. Dinh huong cai tien de xuat

### Gan han

- Bo sung `.env.example` cho root, backend, frontend.
- Chuan hoa README setup va migration workflow.
- Them health check endpoint.
- Them test cho cac flow quan trong.

### Trung han

- Tach `organizing` thanh `operations`, `staffing`, `vendor`.
- Chuyen mot so Prisma query truc tiep vao query service/repository.
- Chuan hoa RBAC.
- Them logging co cau truc.

### Dai han

- Tach service theo domain neu luong tai tang.
- Dua message broker that su vao event-driven flow.
- Them monitoring, tracing, retry va outbox pattern.

## 14. Ket luan

Concert App dang co nen tang kha tot cho mot he thong quan ly su kien concert da nghiep vu. Thiet ke hien tai uu tien toc do phat trien, tinh thuc dung va kha nang demo end-to-end. Neu muon dua sang muc production vung hon, huong toi tiep theo nen la:

- cung co auth/authorization,
- siet lai boundary giua domain va infrastructure,
- tang test va observability,
- tach nho organizing context.
