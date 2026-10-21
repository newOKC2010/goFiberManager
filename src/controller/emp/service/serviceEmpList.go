package service

import (
	"database/sql"
	"fmt"
	"strings"

	"manager/src/controller/emp/utils"
)

func GetEmpList(db *sql.DB, q utils.EmpListQuery) (utils.EmpListResponse, error) {
	args := []any{}
	idx := 1
	where := []string{"1=1"}

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
	if q.HasCID == "true" {
		where = append(where, "e.cid IS NOT NULL AND e.cid != ''")
	} else if q.HasCID == "false" {
		where = append(where, "(e.cid IS NULL OR e.cid = '')")
	}

	whereClause := strings.Join(where, " AND ")

	// count
	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM emp_users e WHERE %s`, whereClause)
	if err := db.QueryRow(countQ, args...).Scan(&total); err != nil {
		return utils.EmpListResponse{}, err
	}

	// pagination
	offset := 0
	totalPages := 1
	page := q.Page
	if page < 1 {
		page = 1
	}

	limitClause := ""
	if q.Limit > 0 {
		offset = (page - 1) * q.Limit
		totalPages = (total + q.Limit - 1) / q.Limit
		limitClause = fmt.Sprintf("LIMIT $%d OFFSET $%d", idx, idx+1)
		args = append(args, q.Limit, offset)
	}

	dataQ := fmt.Sprintf(`
		SELECT e.hr_emp_id, e.full_name, d.name, e.cid
		FROM emp_users e
		LEFT JOIN departments d ON d.id = e.department_id
		WHERE %s
		ORDER BY e.hr_emp_id ASC
		%s`, whereClause, limitClause)

	rows, err := db.Query(dataQ, args...)
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
		data = append(data, emp)
	}

	resp := utils.EmpListResponse{Data: data}
	resp.TotalCount = &total
	resp.TotalPages = &totalPages
	resp.CurrentPage = &page
	return resp, nil
}
