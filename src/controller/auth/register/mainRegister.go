package registerMain

import (
	"database/sql"
	"log"

	"github.com/gofiber/fiber/v2"

	handlerRegister "manager/src/controller/auth/register/handler"
	serviceRegister "manager/src/controller/auth/register/service"
	registerUtils "manager/src/controller/auth/register/utils"
)

func Register(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req registerUtils.RegisterRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "ข้อมูลไม่ถูกต้อง",
			})
		}

		if err := handlerRegister.ValidateCID(req.CID); err != nil {
			return c.Status(400).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: err.Error(),
			})
		}

		if err := handlerRegister.ValidateEmail(req.Email); err != nil {
			return c.Status(400).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: err.Error(),
			})
		}

		if err := handlerRegister.ValidateFullName(req.FullName); err != nil {
			return c.Status(400).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: err.Error(),
			})
		}

		// ตรวจว่า CID มีในระบบ HR (emp_users) หรือไม่
		empExists, err := handlerRegister.CheckCIDInEmpUsers(db, req.CID)
		if err != nil {
			log.Printf("CheckCIDInEmpUsers error: %v", err)
			return c.Status(500).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
			})
		}
		if !empExists {
			return c.Status(400).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "หมายเลขบัตรประชาชนของคุณยังไม่มีในระบบ กรุณาติดต่อ Admin HR เพื่อลงทะเบียนหมายเลขบัตรประชาชน",
			})
		}

		cidExists, err := handlerRegister.CheckCIDExists(db, req.CID)
		if err != nil {
			log.Printf("CheckCIDExists error: %v", err)
			return c.Status(500).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
			})
		}
		if cidExists {
			return c.Status(400).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "เลขบัตรประชาชนนี้มีในระบบแล้ว",
			})
		}

		emailExists, err := handlerRegister.CheckEmailExists(db, req.Email)
		if err != nil {
			log.Printf("CheckEmailExists error: %v", err)
			return c.Status(500).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
			})
		}
		if emailExists {
			return c.Status(400).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "อีเมลนี้มีในระบบแล้ว",
			})
		}

		user, err := serviceRegister.CreateUser(db, req.CID, req.FullName, req.Email)
		if err != nil {
			log.Printf("CreateUser error: %v", err)
			return c.Status(500).JSON(registerUtils.RegisterResponse{
				Success: false,
				Message: "ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
			})
		}

		log.Printf("ลงทะเบียนสำเร็จ: %s - %s", user.CID, user.FullName)

		return c.Status(201).JSON(registerUtils.RegisterResponse{
			Success: true,
			Message: "ลงทะเบียนสำเร็จ",
		})
	}
}
