package utils

type Department struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type EmpUser struct {
	HrEmpID   string   `json:"hr_emp_id"`
	FullName  string   `json:"full_name"`
	DeptName  *string  `json:"dept_name"`
	CID       *string  `json:"cid"`
	WorkDate  *string  `json:"work_date"`
	ScanTimes []string `json:"scan_times"`
}

type EmpListQuery struct {
	Page         int
	Limit        int
	Name         string
	DeptID       int64
	HasCID       string // "true" | "false" | ""
	StatusFilter string // "true" | "false" | ""
	DateFrom     string // YYYY-MM-DD
	DateTo       string // YYYY-MM-DD
}

type Pagination struct {
	TotalCount  *int `json:"total_count,omitempty"`
	TotalPages  *int `json:"total_pages,omitempty"`
	CurrentPage *int `json:"current_page,omitempty"`
}

type EmpListResponse struct {
	Pagination
	Data []EmpUser `json:"data"`
}

type EmpManage struct {
	HrEmpID  string  `json:"hr_emp_id"`
	FullName string  `json:"full_name"`
	DeptName *string `json:"dept_name"`
	Status   bool    `json:"status"`
}

type ManageListResponse struct {
	Pagination
	Data []EmpManage `json:"data"`
}

type AttendanceRecord struct {
	HrEmpID   string   `json:"hr_emp_id"`
	FullName  string   `json:"full_name"`
	DeptName  *string  `json:"dept_name"`
	WorkDate  string   `json:"work_date"`
	ScanTimes []string `json:"scan_times"`
}

type AttendanceQuery struct {
	Page     int
	Limit    int
	Name     string
	DeptID   int64
	DateFrom string // YYYY-MM-DD
	DateTo   string // YYYY-MM-DD
}

type AttendanceListResponse struct {
	Pagination
	Data []AttendanceRecord `json:"data"`
}
