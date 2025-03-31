package main

import (
	"echo/constants"
	"echo/handlers"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()
	// TODO: enable for development and staging only
	app.Static("/demo", "./public/demo.html")

	app.Get("/ice", func(c *fiber.Ctx) error {
		return c.JSON(constants.Config)
	})
	app.Get("/stats", handlers.Stats)

	app.Post("/consume", handlers.Consume)
	app.Post("/produce", handlers.Produce)

	app.Listen(":4004")
}
