package serviceUploadExcel

import "database/sql"

// UpsertDepartment - หาหรือสร้าง department แล้ว return id
func UpsertDepartment(db *sql.DB, name string) (int64, error) {
	var id int64
	err := db.QueryRow(
		`INSERT INTO departments (name)
		 VALUES ($1)
		 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
		 RETURNING id`,
		name,
	).Scan(&id)
	return id, err
}
