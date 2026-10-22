package routes

import (
	"database/sql"

	emp "manager/src/controller/emp"
	middleware "manager/src/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupEmpRoutes(app fiber.Router, db *sql.DB) {
	prefix := app.Group("/emp", middleware.AuthGuards(db, []string{"admin"}))

	prefix.Get("/list", emp.GetEmpList(db))
	prefix.Get("/attendance", emp.GetAttendanceList(db))
	prefix.Get("/departments", emp.GetDepartments(db))
	prefix.Patch("/cid", emp.UpdateCID(db))

	manage := prefix.Group("/manage")
	manage.Get("/list", emp.GetManageList(db))
	manage.Patch("/toggle", emp.ToggleStatus(db))
}
