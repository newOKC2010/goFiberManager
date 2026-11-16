package serviceUploadExcel

import (
	"database/sql"
	"strings"

	utils "manager/src/controller/uploadExcel/utils"
)

// UpsertRecord - บันทึก dept + emp + attendance ใน transaction เดียว
func UpsertRecord(db *sql.DB, rec utils.AttendanceRecord, scanTimesJSON string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// 1. dept
	name := strings.TrimSpace(rec.Department)
	var deptID int64
	if err = tx.QueryRow(`SELECT id FROM departments WHERE name ILIKE $1`, name).Scan(&deptID); err != nil {
		if err = tx.QueryRow(`INSERT INTO departments (name) VALUES ($1) RETURNING id`, name).Scan(&deptID); err != nil {
			return err
		}
	}

	// 2. emp
	var empID int64
	if err = tx.QueryRow(
		`INSERT INTO emp_users (hr_emp_id, full_name, department_id)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (hr_emp_id) DO UPDATE
		 SET full_name = EXCLUDED.full_name,
		     department_id = EXCLUDED.department_id,
		     updated_at = CURRENT_TIMESTAMP
		 RETURNING id`,
		rec.HrEmpID, rec.FullName, deptID,
	).Scan(&empID); err != nil {
		return err
	}

	// 3. attendance
	_, err = tx.Exec(
		`INSERT INTO attendance_logs (emp_id, work_date, scan_times)
		 VALUES ($1, $2, $3::jsonb)
		 ON CONFLICT (emp_id, work_date) DO UPDATE
		 SET scan_times = (
		     SELECT jsonb_agg(DISTINCT elem ORDER BY elem)
		     FROM jsonb_array_elements_text(
		         attendance_logs.scan_times || EXCLUDED.scan_times
		     ) AS elem
		 ),
		 updated_at = CURRENT_TIMESTAMP`,
		empID, rec.WorkDate, scanTimesJSON,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}
