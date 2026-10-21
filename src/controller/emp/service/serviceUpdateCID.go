package service

import (
	"database/sql"
	"errors"
)

func UpdateEmpCID(db *sql.DB, hrEmpID string, cid string) error {
	res, err := db.Exec(
		`UPDATE emp_users SET cid = $1, updated_at = NOW() WHERE hr_emp_id = $2`,
		cid, hrEmpID,
	)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("ไม่พบพนักงาน")
	}
	return nil
}
