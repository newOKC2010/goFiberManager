package department

import (
	"database/sql"
	"strconv"

	service "manager/src/controller/department/service"
	utils "manager/src/controller/department/utils"

	"github.com/gofiber/fiber/v2"
)

func GetEmpByDept(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		page, _ := strconv.Atoi(c.Query("page", "1"))
		limit, _ := strconv.Atoi(c.Query("limit", "10"))
		hrEmpID := c.Query("hr_emp_id", "")
		fullName := c.Query("full_name", "")
		deptFilter := c.Query("dept_filter", "")
		if page < 1 {
			page = 1
		}
		resp, err := service.GetEmpByDept(db, page, limit, hrEmpID, deptFilter, fullName)
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
		if err := service.AssignDept(db, body.HrEmpID, body.DeptID, body.FullName); err != nil {
			return c.Status(400).JSON(fiber.Map{"message": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "กำหนดแผนกสำเร็จ"})
	}
}

func GetUnassignedCount(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var count int
		if err := db.QueryRow(`SELECT COUNT(*) FROM emp_users WHERE department_id IS NULL`).Scan(&count); err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลไม่สำเร็จ"})
		}
		return c.JSON(fiber.Map{"count": count})
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
