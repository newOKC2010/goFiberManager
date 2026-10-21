package serviceUploadExcel

import "database/sql"

// UpsertEmployee - หาหรือสร้าง emp_user แล้ว return id
func UpsertEmployee(db *sql.DB, hrEmpID, fullName string, departmentID int64) (int64, error) {
	var id int64
	err := db.QueryRow(
		`INSERT INTO emp_users (hr_emp_id, full_name, department_id)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (hr_emp_id) DO UPDATE
		 SET full_name = EXCLUDED.full_name,
		     department_id = EXCLUDED.department_id,
		     updated_at = CURRENT_TIMESTAMP
		 RETURNING id`,
		hrEmpID, fullName, departmentID,
	).Scan(&id)
	return id, err
}
