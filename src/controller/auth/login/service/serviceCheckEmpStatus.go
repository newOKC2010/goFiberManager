package serviceLogin

import "database/sql"

// CheckEmpStatus - ตรวจ status ของพนักงานใน emp_users (true = ยังทำงาน)
func CheckEmpStatus(db *sql.DB, cid string) (bool, error) {
	var status bool
	err := db.QueryRow(
		`SELECT status FROM emp_users WHERE cid = $1`, cid,
	).Scan(&status)
	if err != nil {
		return true, err // ถ้าไม่เจอให้ผ่าน (อาจยังไม่มีใน emp_users)
	}
	return status, nil
}
