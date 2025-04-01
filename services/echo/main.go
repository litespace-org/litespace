package main

import (
	"echo/constants"
	"echo/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	// TODO: add cors optios
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, https://app.staging.litespace.org, https://app.litespace.org",
		AllowCredentials: true,
	}))
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
