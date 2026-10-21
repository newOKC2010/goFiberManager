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

func GetDepartments(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		depts, err := service.GetDepartments(db)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลแผนกไม่สำเร็จ"})
		}
		return c.JSON(fiber.Map{"data": depts})
	}
}
