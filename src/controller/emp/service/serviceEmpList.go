package service

import (
	"database/sql"
	"fmt"
	"strings"

	"manager/src/controller/emp/utils"
)

func GetEmpList(db *sql.DB, q utils.EmpListQuery) (utils.EmpListResponse, error) {
	args := []any{}
	where := []string{"e.status = true"}
	i := 1

	if q.Name != "" {
		where = append(where, fmt.Sprintf("e.full_name ILIKE $%d", i))
		args = append(args, "%"+q.Name+"%")
		i++
	}
	if q.DeptID > 0 {
		where = append(where, fmt.Sprintf("e.department_id = $%d", i))
		args = append(args, q.DeptID)
		i++
	}
	if q.HasCID == "true" {
		where = append(where, "e.cid IS NOT NULL AND e.cid != ''")
	} else if q.HasCID == "false" {
		where = append(where, "(e.cid IS NULL OR e.cid = '')")
	}

	whereClause := strings.Join(where, " AND ")

	var total int
	if err := db.QueryRow(fmt.Sprintf(
		`SELECT COUNT(*) FROM emp_users e
		 LEFT JOIN departments d ON d.id = e.department_id
		 WHERE %s`, whereClause), args...).Scan(&total); err != nil {
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
		limitClause = fmt.Sprintf("LIMIT $%d OFFSET $%d", i, i+1)
		args = append(args, q.Limit, offset)
	}

	rows, err := db.Query(fmt.Sprintf(
		`SELECT e.hr_emp_id, e.full_name, d.name, e.cid
		 FROM emp_users e
		 LEFT JOIN departments d ON d.id = e.department_id
		 WHERE %s
		 ORDER BY d.name ASC, e.hr_emp_id ASC
		 %s`, whereClause, limitClause), args...)
	if err != nil {
		return utils.EmpListResponse{}, err
	}
	defer rows.Close()

	data := []utils.EmpUser{}
	for rows.Next() {
		var emp utils.EmpUser
		if err := rows.Scan(&emp.HrEmpID, &emp.FullName, &emp.DeptName, &emp.CID); err != nil {
			continue
		}
		emp.ScanTimes = []string{}
		data = append(data, emp)
	}

	resp := utils.EmpListResponse{Data: data}
	resp.TotalCount = &total
	resp.TotalPages = &totalPages
	resp.CurrentPage = &page
	return resp, nil
}
