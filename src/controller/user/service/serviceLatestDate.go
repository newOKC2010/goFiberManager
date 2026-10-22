package serviceUser

import "database/sql"

// GetMyLatestAttendanceDate - วันล่าสุดของ user คนนั้นเอง
func GetMyLatestAttendanceDate(db *sql.DB, cid string) (string, error) {
	var date string
	err := db.QueryRow(
		`SELECT TO_CHAR(al.work_date, 'YYYY-MM-DD')
		 FROM attendance_logs al
		 JOIN emp_users eu ON eu.id = al.emp_id
		 WHERE eu.cid = $1
		 ORDER BY al.work_date DESC LIMIT 1`,
		cid,
	).Scan(&date)
	return date, err
}
