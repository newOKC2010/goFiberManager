package handlerUploadExcel

import (
	"bytes"
	"fmt"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"

	utils "manager/src/controller/uploadExcel/utils"
)

// ParseExcel - อ่านไฟล์ Excel และ return slice ของ ExcelRow
func ParseExcel(fileBytes []byte) ([]utils.ExcelRow, error) {
	f, err := excelize.OpenReader(bytes.NewReader(fileBytes))
	if err != nil {
		return nil, fmt.Errorf("เปิดไฟล์ Excel ไม่สำเร็จ: %w", err)
	}
	defer f.Close()

	sheets := f.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("ไม่พบ sheet ในไฟล์")
	}

	rows, err := f.GetRows(sheets[0])
	if err != nil {
		return nil, fmt.Errorf("อ่านข้อมูลไม่สำเร็จ: %w", err)
	}

	var result []utils.ExcelRow
	for i, row := range rows {
		if len(row) < 5 {
			continue
		}

		hrEmpID := strings.TrimSpace(row[0])
		fullName := strings.TrimSpace(row[1])
		department := strings.TrimSpace(row[2])
		dateStr := strings.TrimSpace(row[3])
		timeStr := strings.TrimSpace(row[4])

		if hrEmpID == "" || fullName == "" {
			continue
		}

		workDate, err := parseDate(dateStr)
		if err != nil {
			return nil, fmt.Errorf("row %d: วันที่ไม่ถูกต้อง '%s'", i+1, dateStr)
		}

		result = append(result, utils.ExcelRow{
			HrEmpID:    hrEmpID,
			FullName:   fullName,
			Department: department,
			WorkDate:   workDate,
			ScanTime:   timeStr,
		})
	}

	return result, nil
}

// parseDate - แปลงวันที่จาก string หลายรูปแบบ
func parseDate(s string) (time.Time, error) {
	formats := []string{
		"02-01-2006",
		"2006-01-02",
		"01/02/2006",
		"02/01/2006",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("ไม่รู้จักรูปแบบวันที่: %s", s)
}
