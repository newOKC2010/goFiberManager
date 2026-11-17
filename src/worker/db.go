package worker

import (
	"database/sql"
	"log"
	"time"
)

// insertHikErrorLog - บันทึก error ของเครื่องที่ดึงไม่สำเร็จ
func insertHikErrorLog(db *sql.DB, deviceName, deviceHost, errMsg string) {
	_, err := db.Exec(
		`INSERT INTO hik_sync_logs (device_name, device_host, error_message) VALUES ($1, $2, $3)`,
		deviceName, deviceHost, errMsg,
	)
	if err != nil {
		log.Printf("[HIK] บันทึก error log ไม่สำเร็จ: %v", err)
	}
}

// ensureEmp - INSERT ถ้าไม่มี, ไม่ทับข้อมูลเดิม
func ensureEmp(db *sql.DB, hrEmpID, fullName string) (isNew bool, err error) {
	var id int64
	if err = db.QueryRow(`SELECT id FROM emp_users WHERE hr_emp_id = $1`, hrEmpID).Scan(&id); err == nil {
		return false, nil // มีอยู่แล้ว
	}
	err = db.QueryRow(
		`INSERT INTO emp_users (hr_emp_id, full_name) VALUES ($1, $2)
		 ON CONFLICT (hr_emp_id) DO NOTHING RETURNING id`,
		hrEmpID, fullName,
	).Scan(&id)
	if err == sql.ErrNoRows {
		return false, nil // race condition → ok
	}
	return err == nil, err
}

// upsertAttendance - merge scan_times แบบไม่ซ้ำ เรียงลำดับ
func upsertAttendance(db *sql.DB, empID int64, workDate time.Time, scanTimesJSON string) error {
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
