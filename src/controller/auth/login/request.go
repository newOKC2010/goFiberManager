package loginMain

import (
	"database/sql"
	"log"

	"github.com/gofiber/fiber/v2"

	handlerLogin "manager/src/controller/auth/login/handler"
	serviceLogin "manager/src/controller/auth/login/service"
	loginUtils "manager/src/controller/auth/login/utils"
)

func RequestOTP(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(loginUtils.Response{
				Success: false,
				Message: "ข้อมูลไม่ถูกต้อง",
			})
		}

		email, errMsg := handlerLogin.ValidateRequestOTP(body)
		if errMsg != "" {
			return c.Status(400).JSON(loginUtils.Response{
				Success: false,
				Message: errMsg,
			})
		}

		user, err := serviceLogin.GetUserByEmail(db, email)
		if err != nil {
			return c.Status(404).JSON(loginUtils.Response{
				Success: false,
				Message: "ไม่พบผู้ใช้งาน email นี้ในระบบ",
			})
		}

		if !user.Status {
			return c.Status(403).JSON(loginUtils.Response{
				Success: false,
				Message: "บัญชีผู้ใช้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ",
			})
		}

		otpCode, err := handlerLogin.GenerateOTP()
		if err != nil {
			log.Printf("Generate OTP ล้มเหลว: %v", err)
			return c.Status(500).JSON(loginUtils.Response{
				Success: false,
				Message: "ระบบขัดข้อง กรุณาลองใหม่",
			})
		}

		if err := serviceLogin.UpdateOTPInDB(db, user.CID, otpCode); err != nil {
			log.Printf("บันทึก OTP ล้มเหลว: %v", err)
			return c.Status(500).JSON(loginUtils.Response{
				Success: false,
				Message: "ระบบขัดข้อง กรุณาลองใหม่",
			})
		}

		handlerLogin.SendOTPToUser(user, otpCode)

		return c.JSON(loginUtils.Response{
			Success: true,
			Message: "ส่งรหัส OTP ไปยัง email และ line หมอพร้อม ของคุณเรียบร้อย",
		})
	}
}
