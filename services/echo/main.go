package main

import (
	"github.com/litespace-org/litespace/services/echo/constants"
	"github.com/litespace-org/litespace/services/echo/handlers"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()
	app.Static("/demo", "./public/demo.html")

	app.Get("/ice", func(c *fiber.Ctx) error {
		return c.JSON(constants.Config)
	})
	app.Get("/stats", handlers.Stats)

	app.Post("/consume", handlers.Consume)
	app.Post("/produce", handlers.Produce)

	app.Listen(":5001")
}
