package worker

import "time"

// Device - Hikvision device info
type Device struct {
	Name string
	Host string
}

// HikEvent - 1 event จาก InfoList[]
type HikEvent struct {
	Major            int    `json:"major"`
	Minor            int    `json:"minor"`
	Time             string `json:"time"`
	Name             string `json:"name"`
	EmployeeNoString string `json:"employeeNoString"`
	SerialNo         int    `json:"serialNo"`
}

// HikResponse - response body จาก ISAPI
type HikResponse struct {
	AcsEvent struct {
		SearchID           string     `json:"searchID"`
		ResponseStatusStrg string     `json:"responseStatusStrg"`
		NumOfMatches       int        `json:"numOfMatches"`
		TotalMatches       int        `json:"totalMatches"`
		InfoList           []HikEvent `json:"InfoList"`
	} `json:"AcsEvent"`
}

// ScanGroup - group scan_times ต่อ (emp, วัน)
type ScanGroup struct {
	HrEmpID   string
	FullName  string
	WorkDate  time.Time
	ScanTimes []string
}
