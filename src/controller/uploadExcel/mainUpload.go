package uploadExcel

import (
	"database/sql"
	"log"

	"github.com/gofiber/fiber/v2"

	handler "manager/src/controller/uploadExcel/handler"
	service "manager/src/controller/uploadExcel/service"
	utils "manager/src/controller/uploadExcel/utils"
	middleware "manager/src/middleware"
)

func UploadExcel(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user := c.Locals("users").(*middleware.UserQANCInfo)

		file, err := c.FormFile("file")
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "กรุณาแนบไฟล์ Excel",
			})
		}

		f, err := file.Open()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "เปิดไฟล์ไม่สำเร็จ",
			})
		}
		defer f.Close()

		fileBytes := make([]byte, file.Size)
		if _, err := f.Read(fileBytes); err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "อ่านไฟล์ไม่สำเร็จ",
			})
		}

		rows, err := handler.ParseExcel(fileBytes)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		}

		records := handler.GroupByEmpAndDate(rows)
		result := utils.UploadResult{TotalRows: len(rows)}

		for _, rec := range records {
			deptID, err := service.UpsertDepartment(db, rec.Department)
			if err != nil {
				log.Printf("UpsertDepartment error [%s]: %v", rec.Department, err)
				result.Errors++
				continue
			}

			empID, err := service.UpsertEmployee(db, rec.HrEmpID, rec.FullName, deptID)
			if err != nil {
				log.Printf("UpsertEmployee error [%s]: %v", rec.HrEmpID, err)
				result.Errors++
				continue
			}

			scanJSON := handler.ScanTimesToJSON(rec.ScanTimes)
			if err := service.UpsertAttendance(db, empID, rec.WorkDate, scanJSON); err != nil {
				log.Printf("UpsertAttendance error [empID=%d date=%s]: %v", empID, rec.WorkDate.Format("2006-01-02"), err)
				result.Errors++
				continue
			}

			result.Processed++
		}

		if err := service.InsertUploadLog(db, user.ID, file.Filename, result.TotalRows, result.Processed, result.Errors); err != nil {
			log.Printf("InsertUploadLog error: %v", err)
		}

		return c.JSON(fiber.Map{
			"success": true,
			"message": "อัพโหลดสำเร็จ",
			"result":  result,
		})
	}
}
