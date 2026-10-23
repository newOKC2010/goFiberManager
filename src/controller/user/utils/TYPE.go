package userUtils

type AttendanceRow struct {
	WorkDate  string   `json:"work_date"`
	ScanTimes []string `json:"scan_times"`
}

type AttendanceQuery struct {
	CID      string
	DateFrom string
	DateTo   string
}

type AttendanceResponse struct {
	CheckTime bool            `json:"check_time"` // true ถ้า dept อยู่ใน time-check list
	Data      []AttendanceRow `json:"data"`
}
