package routes

import (
	"database/sql"

	dept "manager/src/controller/department"
	middleware "manager/src/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupDeptRoutes(app fiber.Router, db *sql.DB) {
	prefix := app.Group("/dept", middleware.AuthGuards(db, []string{"admin"}))

	prefix.Get("/list", dept.GetList(db))
	prefix.Post("/", dept.Create(db))
	prefix.Patch("/", dept.Update(db))
	prefix.Get("/unassigned", dept.GetUnassigned(db))
	prefix.Patch("/assign", dept.AssignDept(db))
}
