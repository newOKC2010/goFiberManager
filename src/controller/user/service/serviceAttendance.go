package serviceUser

import (
	"database/sql"
	"encoding/json"
	"strconv"

	userUtils "manager/src/controller/user/utils"
)

func GetMyAttendance(db *sql.DB, q userUtils.AttendanceQuery) (userUtils.AttendanceResponse, error) {
	args := []interface{}{q.CID}
	where := `eu.cid = $1`
	idx := 2

	if q.DateFrom != "" {
		where += ` AND al.work_date >= $` + strconv.Itoa(idx)
		args = append(args, q.DateFrom)
		idx++
	}
	if q.DateTo != "" {
		where += ` AND al.work_date <= $` + strconv.Itoa(idx)
		args = append(args, q.DateTo)
		idx++
	}

	base := `FROM attendance_logs al
			 JOIN emp_users eu ON eu.id = al.emp_id
			 WHERE ` + where

	var total int
	if err := db.QueryRow(`SELECT COUNT(*) `+base, args...).Scan(&total); err != nil {
		return userUtils.AttendanceResponse{}, err
	}

	offset := (q.Page - 1) * q.Limit
	dataArgs := append(args, q.Limit, offset)
	rows, err := db.Query(
		`SELECT TO_CHAR(al.work_date,'YYYY-MM-DD'), al.scan_times `+base+
			` ORDER BY al.work_date DESC
			 LIMIT $`+strconv.Itoa(idx)+` OFFSET $`+strconv.Itoa(idx+1),
		dataArgs...,
	)
	if err != nil {
		return userUtils.AttendanceResponse{}, err
	}
	defer rows.Close()

	data := []userUtils.AttendanceRow{}
	for rows.Next() {
		var r userUtils.AttendanceRow
		var scanJSON []byte
		if err := rows.Scan(&r.WorkDate, &scanJSON); err != nil {
			continue
		}
		json.Unmarshal(scanJSON, &r.ScanTimes) //nolint
		if r.ScanTimes == nil {
			r.ScanTimes = []string{}
		}
		data = append(data, r)
	}

	totalPages := 1
	if q.Limit > 0 {
		totalPages = (total + q.Limit - 1) / q.Limit
	}

	return userUtils.AttendanceResponse{
		TotalCount:  total,
		TotalPages:  totalPages,
		CurrentPage: q.Page,
		Data:        data,
	}, nil
}
