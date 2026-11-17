package serviceDept

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	utils "manager/src/controller/department/utils"
)

// deptFilter: ""=ทั้งหมด | "assigned"=มีแผนก | "unassigned"=ยังไม่มีแผนก
func GetEmpByDept(db *sql.DB, page, limit int, hrEmpID, deptFilter string) (utils.EmpDeptListResponse, error) {
	args := []any{}
	where := `WHERE 1=1`
	idx := 1

	switch deptFilter {
	case "unassigned":
		where += ` AND e.department_id IS NULL`
	case "assigned":
		where += ` AND e.department_id IS NOT NULL`
	}
	if hrEmpID != "" {
		where += fmt.Sprintf(` AND e.hr_emp_id = $%d`, idx)
		args = append(args, hrEmpID)
		idx++
	}

	var total int
	if err := db.QueryRow(`SELECT COUNT(*) FROM emp_users e `+where, args...).Scan(&total); err != nil {
		return utils.EmpDeptListResponse{}, err
	}

	query := `
		SELECT e.hr_emp_id, e.full_name, d.name AS dept_name
		FROM emp_users e
		LEFT JOIN departments d ON e.department_id = d.id
	` + where + ` ORDER BY e.hr_emp_id ASC`

	if limit > 0 {
		query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, idx, idx+1)
		args = append(args, limit, (page-1)*limit)
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return utils.EmpDeptListResponse{}, err
	}
	defer rows.Close()

	data := []utils.EmpDept{}
	for rows.Next() {
		var e utils.EmpDept
		if err := rows.Scan(&e.HrEmpID, &e.FullName, &e.DeptName); err != nil {
			continue
		}
		data = append(data, e)
	}

	totalPages := 1
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
		if totalPages == 0 {
			totalPages = 1
		}
	}

	return utils.EmpDeptListResponse{
		TotalCount:  total,
		TotalPages:  totalPages,
		CurrentPage: page,
		Data:        data,
	}, nil
}

func AssignDept(db *sql.DB, hrEmpID string, deptID int64, fullName string) error {
	if hrEmpID == "" {
		return errors.New("กรุณาระบุรหัสพนักงาน")
	}
	if deptID <= 0 {
		return errors.New("กรุณาเลือกแผนก")
	}
	fullName = strings.TrimSpace(fullName)
	if fullName == "" {
		return errors.New("กรุณากรอกชื่อ-นามสกุล")
	}
	res, err := db.Exec(
		`UPDATE emp_users SET department_id = $1, full_name = $2, updated_at = CURRENT_TIMESTAMP WHERE hr_emp_id = $3`,
		deptID, fullName, hrEmpID,
	)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return errors.New("ไม่พบพนักงานที่ต้องการอัปเดต")
	}
	return nil
}
