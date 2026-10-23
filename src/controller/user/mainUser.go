package user

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"

	handlerUser "manager/src/controller/user/handler"
	serviceUser "manager/src/controller/user/service"
	middleware "manager/src/middleware"
)

func GetMyAttendance(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		me := c.Locals("users").(*middleware.UserQANCInfo)
		q := handlerUser.ParseUserQuery(c, me)

		if q.DateFrom == "" || q.DateTo == "" {
			return c.Status(400).JSON(fiber.Map{"message": "กรุณาระบุช่วงวันที่ (date_from และ date_to)"})
		}

		resp, err := serviceUser.GetMyAttendance(db, q)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}
