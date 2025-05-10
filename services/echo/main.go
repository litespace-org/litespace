package main

import (
	"echo/handlers"
	"echo/lib/state"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	appstate := state.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, https://app.staging.litespace.org, https://app.litespace.org, https://echo.staging.litespace.org",
		AllowCredentials: true,
	}))

	// TODO: enable for development and staging only
	app.Static("/demo", "./public/demo.html")

	app.Get("/stats", handlers.Stats(&appstate))

	app.Post("/connect", handlers.Connect(&appstate))
	app.Post("/consume", handlers.Consume(&appstate))

	app.Use("/ws", handlers.UpgradeWS)
	app.Get("/ws/:id", handlers.NewSocketConn(&appstate))

	app.Listen(":4004")
}
