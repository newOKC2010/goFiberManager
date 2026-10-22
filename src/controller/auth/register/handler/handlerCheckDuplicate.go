package handlerRegister

import (
	"database/sql"
	"fmt"
)

// CheckCIDExistsInUsers - ตรวจว่า CID ลงทะเบียนใน users_e แล้วหรือยัง
func CheckCIDExists(db *sql.DB, cid string) (bool, error) {
	var exists bool
	err := db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM users_e WHERE cid = $1)`, cid,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("ตรวจสอบเลขบัตรประชาชนไม่สำเร็จ: %w", err)
	}
	return exists, nil
}

// CheckCIDInEmpUsers - ตรวจว่า CID มีในตาราง emp_users หรือไม่
func CheckCIDInEmpUsers(db *sql.DB, cid string) (bool, error) {
	var exists bool
	err := db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM emp_users WHERE cid = $1)`, cid,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("ตรวจสอบข้อมูลพนักงานไม่สำเร็จ: %w", err)
	}
	return exists, nil
}

func CheckEmailExists(db *sql.DB, email string) (bool, error) {
	var exists bool
	err := db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM users_e WHERE LOWER(email) = LOWER($1))`, email,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("ตรวจสอบอีเมลไม่สำเร็จ: %w", err)
	}
	return exists, nil
}
