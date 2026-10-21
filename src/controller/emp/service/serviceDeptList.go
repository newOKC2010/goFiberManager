package service

import (
	"database/sql"

	"manager/src/controller/emp/utils"
)

func GetDepartments(db *sql.DB) ([]utils.Department, error) {
	rows, err := db.Query(`SELECT id, name FROM departments ORDER BY name ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	depts := []utils.Department{}
	for rows.Next() {
		var d utils.Department
		if err := rows.Scan(&d.ID, &d.Name); err != nil {
			continue
		}
		depts = append(depts, d)
	}
	return depts, nil
}
