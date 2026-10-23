package handlerUser

import (
	userUtils "manager/src/controller/user/utils"
	middleware "manager/src/middleware"

	"github.com/gofiber/fiber/v2"
)

func ParseUserQuery(c *fiber.Ctx, me *middleware.UserQANCInfo) userUtils.AttendanceQuery {
	return userUtils.AttendanceQuery{
		CID:      me.CID,
		DateFrom: c.Query("date_from", ""),
		DateTo:   c.Query("date_to", ""),
	}
}
