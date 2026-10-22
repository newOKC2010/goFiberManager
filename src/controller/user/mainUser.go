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

		// default = วันล่าสุดของตัวเอง
		if q.DateFrom == "" && q.DateTo == "" {
			if latest, err := serviceUser.GetMyLatestAttendanceDate(db, me.CID); err == nil {
				q.DateFrom = latest
				q.DateTo = latest
			}
		}

		resp, err := serviceUser.GetMyAttendance(db, q)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"message": "ดึงข้อมูลไม่สำเร็จ"})
		}
		return c.JSON(resp)
	}
}
