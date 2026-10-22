package main

import (
	"log"

	conn "manager/src/database"
	loadenv "manager/src/loadenv"
	cors "manager/src/middleware/cors"
	routes "manager/src/routes"

	"github.com/gofiber/fiber/v2"
)

func main() {
	port := loadenv.LoadPort()
	if port == "" {
		log.Fatal("PORT is not set")
	}

	conn.ConnectDB()

	app := fiber.New()
	cors.CorsConfig(app)

	routes.SetupAuthRoutes(app, conn.DB)
	routes.SetupUploadRoutes(app, conn.DB)
	routes.SetupEmpRoutes(app, conn.DB)
	routes.SetupUserRoutes(app, conn.DB)

	log.Printf("Server started on port: %s", port)

	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
