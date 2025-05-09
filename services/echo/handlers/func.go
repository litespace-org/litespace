package handlers

import (
	"echo/lib/state"
	"echo/lib/utils"

	"github.com/gofiber/fiber/v2"
)

func Stats(state *state.State) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		return c.JSON(
			struct {
				Threads int
				Members int
				Session int
			}{
				Threads: utils.CountThreads(),
				Members: state.CountMembers(),
				Session: state.CountSessions(),
			},
		)
	}
}
