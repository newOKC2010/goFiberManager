package utils

type Department struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type EmpUser struct {
	HrEmpID  string  `json:"hr_emp_id"`
	FullName string  `json:"full_name"`
	DeptName *string `json:"dept_name"`
	CID      *string `json:"cid"`
}

type EmpListQuery struct {
	Page   int    // default 1
	Limit  int    // 5 | 10 | 0 (all)
	Name   string // filter full_name ILIKE
	DeptID int64  // 0 = no filter
	HasCID string // "true" | "false" | "" (no filter)
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
