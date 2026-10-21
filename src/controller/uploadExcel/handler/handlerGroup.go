package handlerUploadExcel

import (
	"fmt"

	utils "manager/src/controller/uploadExcel/utils"
)

// GroupByEmpAndDate - รวม scan times ของคนเดิมในวันเดิมให้อยู่ใน record เดียว
func GroupByEmpAndDate(rows []utils.ExcelRow) []utils.AttendanceRecord {
	type key struct {
		HrEmpID  string
		WorkDate string
	}

	indexMap := make(map[key]int)
	var records []utils.AttendanceRecord

	for _, row := range rows {
		k := key{
			HrEmpID:  row.HrEmpID,
			WorkDate: row.WorkDate.Format("2006-01-02"),
		}

		if idx, exists := indexMap[k]; exists {
			records[idx].ScanTimes = appendUnique(records[idx].ScanTimes, row.ScanTime)
		} else {
			indexMap[k] = len(records)
			records = append(records, utils.AttendanceRecord{
				HrEmpID:    row.HrEmpID,
				FullName:   row.FullName,
				Department: row.Department,
				WorkDate:   row.WorkDate,
				ScanTimes:  []string{row.ScanTime},
			})
		}
	}

	return records
}

// appendUnique - เพิ่มค่าถ้ายังไม่มีใน slice
func appendUnique(slice []string, val string) []string {
	for _, v := range slice {
		if v == val {
			return slice
		}
	}
	return append(slice, val)
}

// ScanTimesToJSON - แปลง []string เป็น JSON string สำหรับ JSONB
func ScanTimesToJSON(times []string) string {
	if len(times) == 0 {
		return "[]"
	}
	result := "["
	for i, t := range times {
		result += fmt.Sprintf("%q", t)
		if i < len(times)-1 {
			result += ","
		}
	}
	return result + "]"
}
