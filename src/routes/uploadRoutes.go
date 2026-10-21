package routes

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"

	uploadExcel "manager/src/controller/uploadExcel"
	middleware "manager/src/middleware"
)

func SetupUploadRoutes(app fiber.Router, db *sql.DB) {
	prefix := app.Group("/upload")

	prefix.Post("/excel", middleware.AuthGuards(db, []string{"admin"}), uploadExcel.UploadExcel(db))
}
