package serviceDept

import (
	"database/sql"
	"errors"
	"strings"

	utils "manager/src/controller/department/utils"
)

func GetList(db *sql.DB, page, limit int) (utils.DeptListResponse, error) {
	var total int
	if err := db.QueryRow(`SELECT COUNT(*) FROM departments`).Scan(&total); err != nil {
		return utils.DeptListResponse{}, err
	}

	var rows *sql.Rows
	var err error
	if limit <= 0 {
		rows, err = db.Query(`
			SELECT d.id, d.name, COUNT(e.id) AS emp_count
			FROM departments d
			LEFT JOIN emp_users e ON e.department_id = d.id
			GROUP BY d.id, d.name
			ORDER BY d.name ASC
		`)
	} else {
		rows, err = db.Query(`
			SELECT d.id, d.name, COUNT(e.id) AS emp_count
			FROM departments d
			LEFT JOIN emp_users e ON e.department_id = d.id
			GROUP BY d.id, d.name
			ORDER BY d.name ASC
			LIMIT $1 OFFSET $2
		`, limit, (page-1)*limit)
	}
	if err != nil {
		return utils.DeptListResponse{}, err
	}
	defer rows.Close()

	depts := []utils.Department{}
	for rows.Next() {
		var d utils.Department
		if err := rows.Scan(&d.ID, &d.Name, &d.EmpCount); err != nil {
			continue
		}
		depts = append(depts, d)
	}

	totalPages := 1
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
		if totalPages == 0 {
			totalPages = 1
		}
	}

	return utils.DeptListResponse{
		TotalCount:  total,
		TotalPages:  totalPages,
		CurrentPage: page,
		Data:        depts,
	}, nil
}

func Create(db *sql.DB, name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return errors.New("กรุณาระบุชื่อแผนก")
	}

	var exists bool
	if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM departments WHERE name ILIKE $1)`, name).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return errors.New("มีแผนกนี้อยู่แล้ว")
	}

	_, err := db.Exec(`INSERT INTO departments (name) VALUES ($1)`, name)
	return err
}

func Update(db *sql.DB, id int64, name string) error {
	name = strings.TrimSpace(name)
	if id <= 0 {
		return errors.New("กรุณาระบุ id แผนก")
	}
	if name == "" {
		return errors.New("กรุณาระบุชื่อแผนก")
	}

	var exists bool
	if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM departments WHERE name ILIKE $1 AND id != $2)`, name, id).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return errors.New("มีชื่อแผนกนี้อยู่แล้ว")
	}

	res, err := db.Exec(`UPDATE departments SET name = $1 WHERE id = $2`, name, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return errors.New("ไม่พบแผนกที่ต้องการแก้ไข")
	}
	return nil
}
