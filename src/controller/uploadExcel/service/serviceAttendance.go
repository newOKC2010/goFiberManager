package serviceUploadExcel

import (
	"database/sql"
	"time"
)

// UpsertAttendance - บันทึก attendance_logs โดย merge scan_times ถ้ามีอยู่แล้ว
func UpsertAttendance(db *sql.DB, empID int64, workDate time.Time, scanTimesJSON string) error {
	_, err := db.Exec(
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
		empID, workDate, scanTimesJSON,
	)
	return err
}
