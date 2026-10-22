package service

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"manager/src/controller/emp/utils"
)

// ดึงวันที่ล่าสุดที่มีข้อมูลใน attendance_logs
func GetLatestAttendanceDate(db *sql.DB) (string, error) {
	var date string
	err := db.QueryRow(`SELECT TO_CHAR(MAX(work_date), 'YYYY-MM-DD') FROM attendance_logs`).Scan(&date)
	return date, err
}

func GetAttendanceList(db *sql.DB, q utils.AttendanceQuery) (utils.AttendanceListResponse, error) {
	args := []any{}
	idx := 1
	where := []string{"e.status = true"}

	if q.Name != "" {
		where = append(where, fmt.Sprintf("e.full_name ILIKE $%d", idx))
		args = append(args, "%"+q.Name+"%")
		idx++
	}
	if q.DeptID > 0 {
		where = append(where, fmt.Sprintf("e.department_id = $%d", idx))
		args = append(args, q.DeptID)
		idx++
	}
	if q.DateFrom != "" {
		where = append(where, fmt.Sprintf("a.work_date >= $%d", idx))
		args = append(args, q.DateFrom)
		idx++
	}
	if q.DateTo != "" {
		where = append(where, fmt.Sprintf("a.work_date <= $%d", idx))
		args = append(args, q.DateTo)
		idx++
	}

	whereClause := strings.Join(where, " AND ")

	var total int
	countQ := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM attendance_logs a
		JOIN emp_users e ON e.id = a.emp_id
		LEFT JOIN departments d ON d.id = e.department_id
		WHERE %s`, whereClause)
	if err := db.QueryRow(countQ, args...).Scan(&total); err != nil {
		return utils.AttendanceListResponse{}, err
	}

	page := q.Page
	if page < 1 {
		page = 1
	}
	totalPages := 1
	limitClause := ""
	if q.Limit > 0 {
		offset := (page - 1) * q.Limit
		totalPages = (total + q.Limit - 1) / q.Limit
		limitClause = fmt.Sprintf("LIMIT $%d OFFSET $%d", idx, idx+1)
		args = append(args, q.Limit, offset)
	}

	dataQ := fmt.Sprintf(`
		SELECT e.hr_emp_id, e.full_name, d.name, TO_CHAR(a.work_date, 'YYYY-MM-DD'), a.scan_times
		FROM attendance_logs a
		JOIN emp_users e ON e.id = a.emp_id
		LEFT JOIN departments d ON d.id = e.department_id
		WHERE %s
		ORDER BY a.work_date DESC, e.hr_emp_id ASC
		%s`, whereClause, limitClause)

	rows, err := db.Query(dataQ, args...)
	if err != nil {
		return utils.AttendanceListResponse{}, err
	}
	defer rows.Close()

	data := []utils.AttendanceRecord{}
	for rows.Next() {
		var rec utils.AttendanceRecord
		var scanJSON []byte
		if err := rows.Scan(&rec.HrEmpID, &rec.FullName, &rec.DeptName, &rec.WorkDate, &scanJSON); err != nil {
			continue
		}
		json.Unmarshal(scanJSON, &rec.ScanTimes)
		if rec.ScanTimes == nil {
			rec.ScanTimes = []string{}
		}
		data = append(data, rec)
	}

	resp := utils.AttendanceListResponse{Data: data}
	resp.TotalCount = &total
	resp.TotalPages = &totalPages
	resp.CurrentPage = &page
	return resp, nil
}
