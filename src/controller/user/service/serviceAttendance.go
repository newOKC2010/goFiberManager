package serviceUser

import (
	"database/sql"
	"encoding/json"
	"time"

	userUtils "manager/src/controller/user/utils"
	loadEnv "manager/src/loadenv"
)

func GetMyAttendance(db *sql.DB, q userUtils.AttendanceQuery) (userUtils.AttendanceResponse, error) {
	var empID, deptID int64
	var fullName, deptName string
	err := db.QueryRow(`
		SELECT eu.id, COALESCE(eu.department_id,0), eu.full_name, COALESCE(d.name,'-')
		FROM emp_users eu
		LEFT JOIN departments d ON d.id = eu.department_id
		WHERE eu.cid = $1`, q.CID).Scan(&empID, &deptID, &fullName, &deptName)
	if err != nil {
		return userUtils.AttendanceResponse{Data: []userUtils.AttendanceRow{}}, nil
	}
	checkTime := loadEnv.IsTimeCheckDept(deptID)

	rows, err := db.Query(
		`SELECT TO_CHAR(work_date,'YYYY-MM-DD'), scan_times
		 FROM attendance_logs
		 WHERE emp_id = $1 AND work_date BETWEEN $2 AND $3`,
		empID, q.DateFrom, q.DateTo,
	)
	if err != nil {
		return userUtils.AttendanceResponse{}, err
	}
	defer rows.Close()

	attMap := map[string][]string{}
	for rows.Next() {
		var d string
		var scanJSON []byte
		if err := rows.Scan(&d, &scanJSON); err != nil {
			continue
		}
		var times []string
		json.Unmarshal(scanJSON, &times) //nolint
		attMap[d] = times
	}

	dateRange := generateDateRange(q.DateFrom, q.DateTo)
	result := make([]userUtils.AttendanceRow, len(dateRange))
	for i, d := range dateRange {
		scans := attMap[d]
		if scans == nil {
			scans = []string{}
		}
		result[i] = userUtils.AttendanceRow{WorkDate: d, ScanTimes: scans}
	}

	return userUtils.AttendanceResponse{
		CheckTime: checkTime,
		FullName:  fullName,
		DeptName:  deptName,
		Data:      result,
	}, nil
}

func generateDateRange(from, to string) []string {
	start, err1 := time.Parse("2006-01-02", from)
	end, err2 := time.Parse("2006-01-02", to)
	if err1 != nil || err2 != nil {
		return []string{}
	}
	var dates []string
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		dates = append(dates, d.Format("2006-01-02"))
	}
	return dates
}
