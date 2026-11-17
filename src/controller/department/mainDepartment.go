package department

import (
	"database/sql"
	"strconv"

	service "manager/src/controller/department/service"
	utils "manager/src/controller/department/utils"

	"github.com/gofiber/fiber/v2"
)

func GetUnassigned(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page, _ := strconv.Atoi(c.Query("page", "1"))
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		hrEmpID := c.Query("hr_emp_id", "")
		if page < 1 {
			page = 1
		}
		resp, err := service.GetUnassigned(db, page, limit, hrEmpID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}

func AssignDept(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body utils.AssignDeptRequest
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": "ข้อมูลไม่ถูกต้อง"})
		}
		if err := service.AssignDept(db, body.HrEmpID, body.DeptID); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "กำหนดแผนกสำเร็จ"})
	}
}

func GetList(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page, _ := strconv.Atoi(c.Query("page", "1"))
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		if page < 1 {
			page = 1
		}
		// limit <= 0 = ทั้งหมด

		resp, err := service.GetList(db, page, limit)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลแผนกไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}

func Create(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body utils.DeptRequest
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": "ข้อมูลไม่ถูกต้อง"})
		}
		if err := service.Create(db, body.Name); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "เพิ่มแผนกสำเร็จ"})
	}
}

func Update(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body utils.DeptRequest
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": "ข้อมูลไม่ถูกต้อง"})
		}
		if err := service.Update(db, body.ID, body.Name); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "แก้ไขชื่อแผนกสำเร็จ"})
	}
}
