package service

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"manager/src/controller/emp/utils"
)

func GetEmpList(db *sql.DB, q utils.EmpListQuery) (utils.EmpListResponse, error) {
	hasDate := q.DateFrom != "" || q.DateTo != ""
	// date args อยู่ใน subquery, emp args อยู่ใน WHERE หลัก
	dateArgs := []any{}
	dateWhere := []string{}
	di := 1
	if q.DateFrom != "" {
		dateWhere = append(dateWhere, fmt.Sprintf("work_date >= $%d", di))
		dateArgs = append(dateArgs, q.DateFrom)
		di++
	}
	if q.DateTo != "" {
		dateWhere = append(dateWhere, fmt.Sprintf("work_date <= $%d", di))
		dateArgs = append(dateArgs, q.DateTo)
	}

	// subquery attendance (date args อยู่ข้างหน้าเสมอ)
	attSubQ := "(SELECT emp_id, work_date, scan_times FROM attendance_logs"
	if len(dateWhere) > 0 {
		attSubQ += " WHERE " + strings.Join(dateWhere, " AND ")
	}
	attSubQ += ")"

	// emp args (อ้างอิง $N หลังจาก dateArgs หมดแล้ว)
	empArgs := []any{}
	empWhere := []string{"e.status = true"}
	ei := len(dateArgs) + 1
	if q.Name != "" {
		empWhere = append(empWhere, fmt.Sprintf("e.full_name ILIKE $%d", ei))
		empArgs = append(empArgs, "%"+q.Name+"%")
		ei++
	}
	if q.DeptID > 0 {
		empWhere = append(empWhere, fmt.Sprintf("e.department_id = $%d", ei))
		empArgs = append(empArgs, q.DeptID)
		ei++
	}
	if q.HasCID == "true" {
		empWhere = append(empWhere, "e.cid IS NOT NULL AND e.cid != ''")
	} else if q.HasCID == "false" {
		empWhere = append(empWhere, "(e.cid IS NULL OR e.cid = '')")
	}

	joinType := "LEFT JOIN"
	if hasDate {
		joinType = "JOIN"
	}

	allArgs := append(dateArgs, empArgs...)
	whereClause := strings.Join(empWhere, " AND ")

	var total int
	if err := db.QueryRow(fmt.Sprintf(`
		SELECT COUNT(*) FROM emp_users e
		%s %s att ON att.emp_id = e.id
		WHERE %s`, joinType, attSubQ, whereClause), allArgs...).Scan(&total); err != nil {
		return utils.EmpListResponse{}, err
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
		limitClause = fmt.Sprintf("LIMIT $%d OFFSET $%d", ei, ei+1)
		allArgs = append(allArgs, q.Limit, offset)
	}

	orderClause := "ORDER BY att.work_date DESC, e.hr_emp_id ASC"

	rows, err := db.Query(fmt.Sprintf(`
		SELECT e.hr_emp_id, e.full_name, d.name, e.cid,
		       TO_CHAR(att.work_date, 'YYYY-MM-DD'), att.scan_times
		FROM emp_users e
		%s %s att ON att.emp_id = e.id
		LEFT JOIN departments d ON d.id = e.department_id
		WHERE %s
		%s %s`, joinType, attSubQ, whereClause, orderClause, limitClause), allArgs...)
	if err != nil {
		return utils.EmpListResponse{}, err
	}
	defer rows.Close()

	data := []utils.EmpUser{}
	for rows.Next() {
		var emp utils.EmpUser
		var scanJSON []byte
		if err := rows.Scan(&emp.HrEmpID, &emp.FullName, &emp.DeptName, &emp.CID, &emp.WorkDate, &scanJSON); err != nil {
			continue
		}
		json.Unmarshal(scanJSON, &emp.ScanTimes)
		if emp.ScanTimes == nil {
			emp.ScanTimes = []string{}
		}
		data = append(data, emp)
	}

	resp := utils.EmpListResponse{Data: data}
	resp.TotalCount = &total
	resp.TotalPages = &totalPages
	resp.CurrentPage = &page
	return resp, nil
}
