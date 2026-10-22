package service

import (
	"database/sql"
	"fmt"
	"strings"

	"manager/src/controller/emp/utils"
)

func GetManageList(db *sql.DB, q utils.EmpListQuery) (utils.ManageListResponse, error) {
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

	whereClause := strings.Join(where, " AND ")

	var total int
	if err := db.QueryRow(fmt.Sprintf(`SELECT COUNT(*) FROM emp_users e WHERE %s`, whereClause), args...).Scan(&total); err != nil {
		return utils.ManageListResponse{}, err
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

	rows, err := db.Query(fmt.Sprintf(`
		SELECT e.hr_emp_id, e.full_name, d.name, e.status
		FROM emp_users e
		LEFT JOIN departments d ON d.id = e.department_id
		WHERE %s
		ORDER BY e.hr_emp_id ASC
		%s`, whereClause, limitClause), args...)
	if err != nil {
		return utils.ManageListResponse{}, err
	}
	defer rows.Close()

	data := []utils.EmpManage{}
	for rows.Next() {
		var emp utils.EmpManage
		if err := rows.Scan(&emp.HrEmpID, &emp.FullName, &emp.DeptName, &emp.Status); err != nil {
			continue
		}
		data = append(data, emp)
	}

	resp := utils.ManageListResponse{Data: data}
	resp.TotalCount = &total
	resp.TotalPages = &totalPages
	resp.CurrentPage = &page
	return resp, nil
}
