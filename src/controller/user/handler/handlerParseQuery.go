package handlerUser

import (
	"strconv"

	middleware "manager/src/middleware"
	userUtils "manager/src/controller/user/utils"

	"github.com/gofiber/fiber/v2"
)

func ParseUserQuery(c *fiber.Ctx, me *middleware.UserQANCInfo) userUtils.AttendanceQuery {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	return userUtils.AttendanceQuery{
		CID:      me.CID,
		DateFrom: c.Query("date_from", ""),
		DateTo:   c.Query("date_to", ""),
		Page:     page,
		Limit:    limit,
	}
}
