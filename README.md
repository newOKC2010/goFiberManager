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
Res: { "success": true, "user": { "id", "cid", "full_name", "email", "role" } }
```

---

## Upload `/upload` `🔒 admin`

### POST `/upload/excel` — อัพโหลดข้อมูลการเข้างาน
```
Body: form-data  key="file"  type=File (.xlsx/.xls)

คอลัมน์: A=รหัส HR | B=ชื่อ-สกุล | C=แผนก | D=วันที่ (DD-MM-YYYY) | E=เวลา (H:MM)

Res: { "message": "...", "log": { "file_name", "total_rows", "processed", "errors", "status" } }
```
> Column C sync `department_id` ของพนักงานอัตโนมัติ (lookup/create ใน `departments`)

---

## Emp `/emp` `🔒 admin`

### GET `/emp/list` — รายชื่อพนักงาน (status=true)
```
Query: page, limit, name, dept_id, has_cid
Res: { total_count, total_pages, current_page,
       data: [{ hr_emp_id, full_name, dept_name, cid }] }
```
> ไม่ join attendance แล้ว — ใช้สำหรับแสดง/แก้ไข CID เท่านั้น

### GET `/emp/report` — รายงานการเข้างาน (ตรวจสอบขาด/ลา/สาย)
```
Query: date_from*, date_to*, name, dept_id, page, limit
  - date_from + date_to บังคับ ถ้าไม่ส่ง → 400
  - limit=0 → ดึงทั้งหมด (ใช้กับ print)
  - ไม่กรอง dept_id → sort by dept_name (แผนกเดียวกันอยู่ด้วยกัน)

Res: { total_count, total_pages, current_page,
       data: [{
         hr_emp_id, full_name, dept_id, dept_name,
         check_time,   ← true ถ้าแผนกอยู่ใน DEP_CHECK
         dates: [{ date, scan_times }]
       }] }
```
> ทุกวันในช่วงถูก return — วันที่ไม่มี scan → `scan_times: []`

### GET `/emp/departments` — รายการแผนก
```
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
Query: date_from*, date_to*  (บังคับทั้งคู่)

Res: {
  check_time: bool,   ← true ถ้าแผนกอยู่ใน DEP_CHECK
  data: [{ work_date, scan_times }]
}
```
> ทุกวันในช่วงถูก return — วันที่ไม่มี scan → `scan_times: []`
> ไม่มี pagination — ส่งข้อมูลครบทุกวันในช่วง

---

## Logic เพิ่มเติม
- **Login**: ถ้า `emp_users.status = false` → error "คุณได้ทำการลาออกเรียบร้อยแล้ว..."
- **Register**: ตรวจ CID ใน `emp_users` ก่อน → ถ้าไม่มี error "กรุณาติดต่อ Admin HR"  
  ชื่อภาษาไทยเท่านั้น (รองรับ `.` เช่น `ด.ญ. สมใจ`)
- **Upload Excel**: sync `department_id` อัตโนมัติจาก column C ทุกครั้งที่ upload
- **check_time**: กำหนดแผนกที่ตรวจเวลาผ่าน `DEP_CHECK` ใน `.env`  
  เช่น `DEP_CHECK=2,7,12,9,5,10,11,14`

---

## Environment Variables (สำคัญ)
| Key | ความหมาย |
|---|---|
| `DB_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key |
| `DEP_CHECK` | dept_id ที่ต้องตรวจเวลาเข้า-ออก (คั่น `,`) |
| `PORT` | port ของ server (default 8080) |

---

## Rate Limit
| Route | จำกัด |
|---|---|
| `/auth/req` | 10 ครั้ง / 10 นาที (per email) |
| `/auth/verify` | 10 ครั้ง / 10 นาที (per email) |
| `/auth/register` | 5 ครั้ง / 10 นาที (per IP) |
