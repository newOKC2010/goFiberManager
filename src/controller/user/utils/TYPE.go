package userUtils

type AttendanceRow struct {
	WorkDate  string   `json:"work_date"`
	ScanTimes []string `json:"scan_times"`
}

type AttendanceQuery struct {
	CID      string
	DateFrom string
	DateTo   string
	Page     int
	Limit    int
}

type AttendanceResponse struct {
	TotalCount  int             `json:"total_count"`
	TotalPages  int             `json:"total_pages"`
	CurrentPage int             `json:"current_page"`
	Data        []AttendanceRow `json:"data"`
}
