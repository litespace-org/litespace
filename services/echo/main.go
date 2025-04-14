package main

import (
	"echo/constants"
	"echo/handlers"
	"echo/state"
	"log"
	"strconv"
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, https://app.staging.litespace.org, https://app.litespace.org, https://echo.staging.litespace.org",
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

	app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			c.Close()
			return
		}
		state.AddWS(id, c)

		candidates := make(chan string)

		go func() {
			var peer *state.PeerContainer
			state.CountThreadsUp()
			defer state.CountThreadsDown()
			for {
				c := <-candidates
				if c == "close" {
					return
				}
				if peer == nil {
					peer = state.GetPeer(id)
				}
				if peer == nil {
					peer = state.WaitPeer(id)
				}
				peer.AddIceCandidate(c)
			}
		}()

		timer := time.AfterFunc(30*time.Second, func() {
			candidates <- "close"
			c.Close()
			state.RmvWS(id)
		})
		state.CountThreadsUp()
		defer state.CountThreadsDown()
		for {
			msgType, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("error:", err)
				break
			}
			if msgType == websocket.TextMessage {
				candidates <- string(msg)
				timer.Reset(5 * time.Second)
			}
		}
	}))

	app.Listen(":4004")
}
