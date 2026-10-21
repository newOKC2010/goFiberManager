package uploadExcelUtils

import "time"

// ExcelRow - แต่ละ row จาก Excel ก่อน group
type ExcelRow struct {
	HrEmpID    string
	FullName   string
	Department string
	WorkDate   time.Time
	ScanTime   string
}

// AttendanceRecord - ข้อมูลที่ group แล้วต่อคนต่อวัน
type AttendanceRecord struct {
	HrEmpID    string
	FullName   string
	Department string
	WorkDate   time.Time
	ScanTimes  []string
}

// UploadResult - ผลลัพธ์การ upload
type UploadResult struct {
	TotalRows int `json:"total_rows"`
	Processed int `json:"processed"`
	Errors    int `json:"errors"`
}
