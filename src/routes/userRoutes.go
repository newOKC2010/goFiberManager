package routes

import (
	"database/sql"

	userCtrl "manager/src/controller/user"
	middleware "manager/src/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupUserRoutes(app fiber.Router, db *sql.DB) {
	prefix := app.Group("/user", middleware.AuthGuards(db, []string{"admin", "user"}))
	prefix.Get("/attendance", userCtrl.GetMyAttendance(db))
}
