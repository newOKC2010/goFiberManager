package routes

import (
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v2"

	loginMain "manager/src/controller/auth/login"
	registerMain "manager/src/controller/auth/register"
	middleware "manager/src/middleware"
	ratelimit "manager/src/middleware/rateLimit"
)

func SetupAuthRoutes(app fiber.Router, db *sql.DB) {
	prefix := app.Group("/auth")

	prefix.Post("/req", ratelimit.RateLimitByEmail(10, 10*time.Minute), loginMain.RequestOTP(db))
	prefix.Post("/verify", ratelimit.RateLimitByEmail(10, 10*time.Minute), loginMain.VerifyOTP(db))
	prefix.Post("/register", ratelimit.RateLimitByIP(5, 10*time.Minute), registerMain.Register(db))
	prefix.Get("/status", middleware.AuthGuards(db, nil), func(c *fiber.Ctx) error {
		user := c.Locals("users").(*middleware.UserQANCInfo)
		return c.JSON(fiber.Map{
			"success": true,
			"user":    user,
		})
	})
}
