package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	conn "manager/src/database"
	loadenv "manager/src/loadenv"
	cors "manager/src/middleware/cors"
	routes "manager/src/routes"
	worker "manager/src/worker"

	"github.com/gofiber/fiber/v2"
)

func main() {
	port := loadenv.LoadPort()
	if port == "" {
		log.Fatal("PORT is not set")
	}

	conn.ConnectDB()

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	// start Hikvision worker
	go worker.RunWorker(ctx, conn.DB)

	app := fiber.New()
	cors.CorsConfig(app)

	routes.SetupAuthRoutes(app, conn.DB)
	routes.SetupUploadRoutes(app, conn.DB)
	routes.SetupEmpRoutes(app, conn.DB)
	routes.SetupUserRoutes(app, conn.DB)
	routes.SetupDeptRoutes(app, conn.DB)

	log.Printf("Server started on port: %s", port)

	go func() {
		if err := app.Listen(":" + port); err != nil {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()
	log.Println("hik worker: shutting down...")
	app.Shutdown()
}
