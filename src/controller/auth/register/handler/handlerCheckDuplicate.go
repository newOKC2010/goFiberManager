package handlerRegister

import (
	"database/sql"
	"fmt"
)

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
