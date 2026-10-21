package handler

import (
	"regexp"

	"github.com/gofiber/fiber/v2"
)

var cidRegex = regexp.MustCompile(`^\d{13}$`)

type UpdateCIDBody struct {
	HrEmpID string `json:"hr_emp_id"`
	CID     string `json:"cid"`
}

func ParseUpdateCIDBody(c *fiber.Ctx) (*UpdateCIDBody, error) {
	var body UpdateCIDBody
	if err := c.BodyParser(&body); err != nil {
		return nil, fiber.NewError(400, "ข้อมูลไม่ถูกต้อง")
	}
	if body.HrEmpID == "" {
		return nil, fiber.NewError(400, "กรุณาระบุ hr_emp_id")
	}
	if !cidRegex.MatchString(body.CID) {
		return nil, fiber.NewError(400, "CID ต้องเป็นตัวเลข 13 หลัก")
	}
	return &body, nil
}
