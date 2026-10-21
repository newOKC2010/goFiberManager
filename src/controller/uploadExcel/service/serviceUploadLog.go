package serviceUploadExcel

import "database/sql"

// InsertUploadLog - บันทึก log การ upload
func InsertUploadLog(db *sql.DB, uploadedBy int64, fileName string, totalRows, processed, errors int) error {
	status := "success"
	if errors > 0 && processed == 0 {
		status = "failed"
	} else if errors > 0 {
		status = "partial"
	}

	_, err := db.Exec(
		`INSERT INTO upload_logs (uploaded_by, file_name, total_rows, processed, errors, status)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		uploadedBy, fileName, totalRows, processed, errors, status,
	)
	return err
}
