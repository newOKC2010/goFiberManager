package utils

type Department struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	EmpCount int    `json:"emp_count"`
}

type DeptListResponse struct {
	TotalCount  int          `json:"total_count"`
	TotalPages  int          `json:"total_pages"`
	CurrentPage int          `json:"current_page"`
	Data        []Department `json:"data"`
}

type DeptRequest struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type EmpDept struct {
	HrEmpID  string  `json:"hr_emp_id"`
	FullName string  `json:"full_name"`
	DeptName *string `json:"dept_name"`
}

type EmpDeptListResponse struct {
	TotalCount  int       `json:"total_count"`
	TotalPages  int       `json:"total_pages"`
	CurrentPage int       `json:"current_page"`
	Data        []EmpDept `json:"data"`
}

type AssignDeptRequest struct {
	HrEmpID  string `json:"hr_emp_id"`
	DeptID   int64  `json:"dept_id"`
	FullName string `json:"full_name"`
}
