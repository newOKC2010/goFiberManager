package emp

import (
	"database/sql"

	"manager/src/controller/emp/handler"
	"manager/src/controller/emp/service"

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

func GetDepartments(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		depts, err := service.GetDepartments(db)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลแผนกไม่สำเร็จ"})
		}
		return c.JSON(fiber.Map{"data": depts})
	}
}
