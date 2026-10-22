# HR Manager — Backend API

Base URL: `http://localhost:8080`

---

## Auth `/auth`

### POST `/auth/req` — ขอ OTP
```json
Body: { "email": "user@mail.com" }
Res:  { "message": "..." }
```

### POST `/auth/verify` — ยืนยัน OTP
```json
Body: { "email": "user@mail.com", "otp": "123456" }
Res:  { "token": "<jwt>" }
```

### POST `/auth/register` — ลงทะเบียน
```json
Body: { "cid": "1234567890123", "full_name": "ชื่อ นามสกุล", "email": "user@mail.com" }
Res:  { "message": "..." }
```
> ต้องมี CID ใน `emp_users` ก่อน มิฉะนั้น error "กรุณาติดต่อ Admin HR"

### GET `/auth/status` — ตรวจสอบ token `🔒`
```
Header: Authorization: Bearer <token>
Res:  { "success": true, "user": { "id", "cid", "full_name", "email", "role" } }
```

---

## Upload `/upload` `🔒 admin`

### POST `/upload/excel` — อัพโหลดข้อมูลการเข้างาน
```
Header: Authorization: Bearer <token>
Body:   form-data  key="file"  type=File (.xlsx/.xls)

คอลัมน์: A=รหัส HR | B=ชื่อ-สกุล | C=แผนก | D=วันที่ (DD-MM-YYYY) | E=เวลา (H:MM)

Res: { "message": "...", "log": { "file_name", "total_rows", "processed", "errors", "status" } }
```

---

## Emp `/emp` `🔒 admin`

### GET `/emp/list` — รายชื่อพนักงาน (status=true เท่านั้น)
```
Query: page, limit, name, dept_id, has_cid, date_from, date_to
  - ไม่ส่ง date → default วันล่าสุดในระบบ
  - ส่ง name/dept/cid แต่ไม่ส่ง date → ดึงทุกวัน
  - ส่ง date range → กรองตาม range

Res: { total_count, total_pages, current_page,
       data: [{ hr_emp_id, full_name, dept_name, cid, work_date, scan_times }] }
```

### GET `/emp/attendance` — ข้อมูลการเข้างาน
```
Query: page, limit, name, dept_id, date_from, date_to
Res: { total_count, total_pages, current_page,
       data: [{ hr_emp_id, full_name, dept_name, work_date, scan_times }] }
```

### GET `/emp/departments` — รายการแผนก
```
Header: Authorization: Bearer <token>
Res: { "data": [{ "id", "name" }] }
```

### PATCH `/emp/cid` — แก้ไข CID พนักงาน
```json
Body: { "hr_emp_id": "222", "cid": "1234567890123" }
Res:  { "message": "อัพเดท CID สำเร็จ" }
```

### GET `/emp/manage/list` — รายชื่อพนักงานทั้งหมด (รวมคนออก)
```
Query: page, limit, name, dept_id, status=true|false
Res: { ..., data: [{ hr_emp_id, full_name, dept_name, status }] }
```

### PATCH `/emp/manage/toggle` — เปิด/ปิดสถานะพนักงาน
```json
Body: { "hr_emp_id": "222" }
Res:  { "message": "...", "status": true/false }
```

---

## User `/user` `🔒 user/admin`

### GET `/user/attendance` — ข้อมูลการเข้างานของตัวเอง
```
Query: page, limit, date_from, date_to
  - ไม่ส่ง date → default วันล่าสุดของตัวเอง
Res: { total_count, total_pages, current_page,
       data: [{ work_date, scan_times }] }
```

---

## Logic เพิ่มเติม
- **Login**: ถ้า `emp_users.status = false` → error "คุณได้ทำการลาออกเรียบร้อยแล้ว..."
- **Register**: ตรวจ CID ใน `emp_users` ก่อน → ถ้าไม่มี error "กรุณาติดต่อ Admin HR"
- **Upload Excel**: sync `department_id` อัตโนมัติจาก column C ทุกครั้งที่ upload

---

## Rate Limit
| Route | จำกัด |
|---|---|
| `/auth/req` | 10 ครั้ง / 10 นาที (per email) |
| `/auth/verify` | 10 ครั้ง / 10 นาที (per email) |
| `/auth/register` | 5 ครั้ง / 10 นาที (per IP) |
