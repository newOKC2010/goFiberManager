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

### GET `/emp/list` — รายชื่อพนักงาน
```
Header: Authorization: Bearer <token>
Query:
  page     = 1          (หน้า)
  limit    = 5|10|0     (0 = ทั้งหมด)
  name     = สมชาย      (กรองชื่อ)
  dept_id  = 3          (กรองแผนก)
  has_cid  = true|false (กรองสถานะ CID)

Res: {
  "total_count": 50,
  "total_pages": 5,
  "current_page": 1,
  "data": [{ "hr_emp_id", "full_name", "dept_name", "cid" }]
}
```

### GET `/emp/departments` — รายการแผนก
```
Header: Authorization: Bearer <token>
Res: { "data": [{ "id", "name" }] }
```

---

## Rate Limit
| Route | จำกัด |
|---|---|
| `/auth/req` | 10 ครั้ง / 10 นาที (per email) |
| `/auth/verify` | 10 ครั้ง / 10 นาที (per email) |
| `/auth/register` | 5 ครั้ง / 10 นาที (per IP) |
