package serviceUploadExcel

import (
	"database/sql"
	"strings"
)

// UpsertDepartment - หาหรือสร้าง department แล้ว return id (trim + case-insensitive safe)
func UpsertDepartment(db *sql.DB, name string) (int64, error) {
	name = strings.TrimSpace(name)
	var id int64
	// ใช้ ILIKE เพื่อหาแผนกที่มีชื่อเหมือนกัน (case-insensitive)
	err := db.QueryRow(`SELECT id FROM departments WHERE name ILIKE $1`, name).Scan(&id)
	if err == nil {
		return id, nil
	}
	// ไม่เจอ → สร้างใหม่
	err = db.QueryRow(`INSERT INTO departments (name) VALUES ($1) RETURNING id`, name).Scan(&id)
	return id, err
}
