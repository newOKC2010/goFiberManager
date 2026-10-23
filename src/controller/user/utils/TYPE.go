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
	Data []AttendanceRow `json:"data"`
}
