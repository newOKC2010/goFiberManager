package emp

import (
	"database/sql"
	"strconv"

	"manager/src/controller/emp/handler"
	"manager/src/controller/emp/service"
	"manager/src/controller/emp/utils"

	"github.com/gofiber/fiber/v2"
)

func GetEmpList(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		q := handler.ParseEmpQuery(c)
		resp, err := service.GetEmpList(db, q)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลพนักงานไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}

func UpdateCID(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		body, err := handler.ParseUpdateCIDBody(c)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"message": err.Error()})
		}
		if err := service.UpdateEmpCID(db, body.HrEmpID, body.CID); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "อัพเดท CID สำเร็จ"})
	}
}

func GetManageList(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		q := handler.ParseEmpQuery(c)
		resp, err := service.GetManageList(db, q)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}

func ToggleStatus(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body struct {
			HrEmpID string `json:"hr_emp_id"`
		}
		if err := c.BodyParser(&body); err != nil || body.HrEmpID == "" {
			return c.Status(400).JSON(fiber.Map{"message": "กรุณาระบุ hr_emp_id"})
		}
		newStatus, err := service.ToggleEmpStatus(db, body.HrEmpID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"message": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "อัพเดทสถานะสำเร็จ", "status": newStatus})
	}
}

func GetAttendanceList(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// default วันที่ล่าสุด
		dateFrom := c.Query("date_from", "")
		dateTo := c.Query("date_to", "")
		if dateFrom == "" && dateTo == "" {
			latest, err := service.GetLatestAttendanceDate(db)
			if err == nil && latest != "" {
				dateFrom = latest
				dateTo = latest
			}
		}

		q := utils.AttendanceQuery{
			Page: func() int { v, _ := strconv.Atoi(c.Query("page", "1")); return v }(),
			Limit: func() int {
				v, _ := strconv.Atoi(c.Query("limit", "10"))
				if v != 5 && v != 10 && v != 0 {
					return 10
				}
				return v
			}(),
			Name:     c.Query("name", ""),
			DeptID:   func() int64 { v, _ := strconv.ParseInt(c.Query("dept_id", "0"), 10, 64); return v }(),
			DateFrom: dateFrom,
			DateTo:   dateTo,
		}
		resp, err := service.GetAttendanceList(db, q)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}

func GetReport(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		dateFrom := c.Query("date_from", "")
		dateTo := c.Query("date_to", "")
		if dateFrom == "" || dateTo == "" {
			return c.Status(400).JSON(fiber.Map{"message": "กรุณาระบุช่วงวันที่ (date_from และ date_to)"})
		}

		page, _ := strconv.Atoi(c.Query("page", "1"))
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		deptID, _ := strconv.ParseInt(c.Query("dept_id", "0"), 10, 64)
		if page < 1 {
			page = 1
		}

		q := utils.ReportQuery{
			DateFrom: dateFrom,
			DateTo:   dateTo,
			Name:     c.Query("name", ""),
			DeptID:   deptID,
			Page:     page,
			Limit:    limit,
		}
		resp, err := service.GetReport(db, q)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลรายงานไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}

func GetDepartments(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		depts, err := service.GetDepartments(db)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลแผนกไม่สำเร็จ"})
		}
		return c.JSON(fiber.Map{"data": depts})
	}
}
