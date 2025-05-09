package main

import (
	"echo/handlers"
	"echo/lib/state"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	app := fiber.New()
	state := state.New()
	err := godotenv.Load(".env")

	if err != nil {
		log.Println("unable to load the .env file")
		panic(err)
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, https://app.staging.litespace.org, https://app.litespace.org, https://echo.staging.litespace.org",
		AllowCredentials: true,
	}))

	app.Static("/demo", "./public/demo.html")
	app.Get("/stats", handlers.Stats(&state))
	app.Use("/ws", handlers.UpgradeWs)
	app.Get("/ws/:sid/:mid", handlers.NewSocketConn(&state))

	app.Listen(":4004")
}
