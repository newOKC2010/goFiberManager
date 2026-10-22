package service

import (
	"database/sql"
	"errors"
)

func ToggleEmpStatus(db *sql.DB, hrEmpID string) (bool, error) {
	var newStatus bool
	err := db.QueryRow(`
		UPDATE emp_users
		SET status = NOT status, updated_at = NOW()
		WHERE hr_emp_id = $1
		RETURNING status`, hrEmpID).Scan(&newStatus)
	if err == sql.ErrNoRows {
		return false, errors.New("ไม่พบพนักงาน")
	}
	return newStatus, err
}
