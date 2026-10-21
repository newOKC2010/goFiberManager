package main

import (
	"log"

	conn "manager/src/database"
	loadenv "manager/src/loadenv"
	cors "manager/src/middleware/cors"

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

	log.Printf("Server started on port: %s", port)

	// routes.SetupAuthRoutes(app, conn.DB)
	// routes.SetupQancRoutes(app, conn.DB)

	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
