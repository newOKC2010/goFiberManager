package service

import (
	"database/sql"
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"manager/src/controller/emp/utils"
	loadEnv "manager/src/loadenv"
)

func GetReport(db *sql.DB, q utils.ReportQuery) (utils.ReportResponse, error) {
	// --- 1. build WHERE employees ---
	args := []interface{}{}
	conditions := []string{"eu.status = true"}
	idx := 1

	if q.Name != "" {
		conditions = append(conditions, `eu.full_name ILIKE $`+strconv.Itoa(idx))
		args = append(args, "%"+q.Name+"%")
		idx++
	}
	if q.DeptID > 0 {
		conditions = append(conditions, `eu.department_id = $`+strconv.Itoa(idx))
		args = append(args, q.DeptID)
		idx++
	}

	where := strings.Join(conditions, " AND ")
	orderBy := "COALESCE(d.name,'') ASC, eu.full_name ASC" // จัดกลุ่มแผนก

	// --- 2. count total employees ---
	countSQL := `SELECT COUNT(*) FROM emp_users eu
				 LEFT JOIN departments d ON d.id = eu.department_id
				 WHERE ` + where
	var total int
	if err := db.QueryRow(countSQL, args...).Scan(&total); err != nil {
		return utils.ReportResponse{}, err
	}

	// --- 3. query employees (paginated) ---
	offset := (q.Page - 1) * q.Limit
	empSQL := `SELECT eu.hr_emp_id, eu.full_name, COALESCE(eu.department_id,0), COALESCE(d.name,'-') as dept_name
			   FROM emp_users eu
			   LEFT JOIN departments d ON d.id = eu.department_id
			   WHERE ` + where + `
			   ORDER BY ` + orderBy
	empArgs := append([]interface{}{}, args...)
	if q.Limit > 0 {
		empSQL += ` LIMIT $` + strconv.Itoa(idx) + ` OFFSET $` + strconv.Itoa(idx+1)
		empArgs = append(empArgs, q.Limit, offset)
	}

	rows, err := db.Query(empSQL, empArgs...)
	if err != nil {
		return utils.ReportResponse{}, err
	}
	defer rows.Close()

	empList := []utils.ReportRow{}
	hrIDs := []string{}
	for rows.Next() {
		var r utils.ReportRow
		if err := rows.Scan(&r.HrEmpID, &r.FullName, &r.DeptID, &r.DeptName); err != nil {
			continue
		}
		r.CheckTime = loadEnv.IsTimeCheckDept(r.DeptID)
		empList = append(empList, r)
		hrIDs = append(hrIDs, r.HrEmpID)
	}

	if len(empList) == 0 {
		totalPages := 1
		if q.Limit > 0 {
			totalPages = (total + q.Limit - 1) / q.Limit
		}
		tc, tp, cp := total, totalPages, q.Page
		return utils.ReportResponse{
			Pagination: utils.Pagination{TotalCount: &tc, TotalPages: &tp, CurrentPage: &cp},
			Data:       []utils.ReportRow{},
		}, nil
	}

	// --- 4. generate date range ---
	dateRange := generateDateRange(q.DateFrom, q.DateTo)

	// --- 5. query attendance ทีเดียว ---
	// build $1,$2,... สำหรับ hr_emp_ids
	placeholders := make([]string, len(hrIDs))
	attArgs := []interface{}{q.DateFrom, q.DateTo}
	for i, id := range hrIDs {
		placeholders[i] = "$" + strconv.Itoa(i+3)
		attArgs = append(attArgs, id)
	}

	attSQL := `SELECT eu.hr_emp_id, TO_CHAR(al.work_date,'YYYY-MM-DD'), al.scan_times
			   FROM attendance_logs al
			   JOIN emp_users eu ON eu.id = al.emp_id
			   WHERE al.work_date BETWEEN $1 AND $2
			   AND eu.hr_emp_id IN (` + strings.Join(placeholders, ",") + `)`

	attRows, err := db.Query(attSQL, attArgs...)
	if err != nil {
		return utils.ReportResponse{}, err
	}
	defer attRows.Close()

	// map[hr_emp_id][date] → scan_times
	attMap := map[string]map[string][]string{}
	for attRows.Next() {
		var hrID, workDate string
		var scanJSON []byte
		if err := attRows.Scan(&hrID, &workDate, &scanJSON); err != nil {
			continue
		}
		var times []string
		json.Unmarshal(scanJSON, &times) //nolint
		if attMap[hrID] == nil {
			attMap[hrID] = map[string][]string{}
		}
		attMap[hrID][workDate] = times
	}

	// --- 6. build result ---
	for i, emp := range empList {
		dates := make([]utils.DateRecord, len(dateRange))
		for j, d := range dateRange {
			scans := attMap[emp.HrEmpID][d]
			if scans == nil {
				scans = []string{}
			}
			dates[j] = utils.DateRecord{Date: d, ScanTimes: scans}
		}
		empList[i].Dates = dates
	}

	totalPages := 1
	if q.Limit > 0 {
		totalPages = (total + q.Limit - 1) / q.Limit
	}
	tc, tp, cp := total, totalPages, q.Page
	return utils.ReportResponse{
		Pagination: utils.Pagination{TotalCount: &tc, TotalPages: &tp, CurrentPage: &cp},
		Data:       empList,
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
