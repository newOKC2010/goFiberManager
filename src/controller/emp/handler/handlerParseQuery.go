package handler

import (
	"strconv"

	"manager/src/controller/emp/utils"

	"github.com/gofiber/fiber/v2"
)

func ParseEmpQuery(c *fiber.Ctx) utils.EmpListQuery {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	deptID, _ := strconv.ParseInt(c.Query("dept_id", "0"), 10, 64)

	// รองรับเฉพาะ 5, 10, 0 (ทั้งหมด)
	if limit != 5 && limit != 10 && limit != 0 {
		limit = 10
	}

	return utils.EmpListQuery{
		Page:   page,
		Limit:  limit,
		Name:   c.Query("name", ""),
		DeptID: deptID,
		HasCID: c.Query("has_cid", ""),
	}
}
