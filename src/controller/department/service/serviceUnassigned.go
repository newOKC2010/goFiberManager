package serviceDept

import (
	"database/sql"
	"errors"
	"fmt"

	utils "manager/src/controller/department/utils"
)

func GetUnassigned(db *sql.DB, page, limit int, hrEmpID string) (utils.UnassignedListResponse, error) {
	args := []any{}
	where := `WHERE e.department_id IS NULL`
	idx := 1

	if hrEmpID != "" {
		where += fmt.Sprintf(` AND e.hr_emp_id = $%d`, idx)
		args = append(args, hrEmpID)
		idx++
	}

	var total int
	if err := db.QueryRow(`SELECT COUNT(*) FROM emp_users e `+where, args...).Scan(&total); err != nil {
		return utils.UnassignedListResponse{}, err
	}

	query := `SELECT e.hr_emp_id, e.full_name FROM emp_users e ` + where + ` ORDER BY e.hr_emp_id ASC`
	if limit > 0 {
		query += fmt.Sprintf(` LIMIT $%d OFFSET $%d`, idx, idx+1)
		args = append(args, limit, (page-1)*limit)
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return utils.UnassignedListResponse{}, err
	}
	defer rows.Close()

	data := []utils.UnassignedEmp{}
	for rows.Next() {
		var e utils.UnassignedEmp
		if err := rows.Scan(&e.HrEmpID, &e.FullName); err != nil {
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

	return utils.UnassignedListResponse{
		TotalCount:  total,
		TotalPages:  totalPages,
		CurrentPage: page,
		Data:        data,
	}, nil
}

func AssignDept(db *sql.DB, hrEmpID string, deptID int64) error {
	if hrEmpID == "" {
		return errors.New("กรุณาระบุรหัสพนักงาน")
	}
	if deptID <= 0 {
		return errors.New("กรุณาเลือกแผนก")
	}
	res, err := db.Exec(
		`UPDATE emp_users SET department_id = $1, updated_at = CURRENT_TIMESTAMP WHERE hr_emp_id = $2`,
		deptID, hrEmpID,
	)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return errors.New("ไม่พบพนักงานที่ต้องการอัปเดต")
	}
	return nil
}
