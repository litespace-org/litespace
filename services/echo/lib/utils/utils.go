package utils

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

// ancillary function used to clean the code in handlers;
// by wrapping db methods and return the result if no error
// is found, or panic otherwise.
func Must[V interface{}](res V, err error) V {
	if err != nil {
		panic(err)
	}
	return res
}

func Unwrap(err error) {
	if err != nil {
		panic(err)
	}
}

// ancillary function that shall be used (deferred) in the
// beginning of fiber handlers where anc.Must is used within.
func Recover(c *fiber.Ctx) error {
	if r := recover(); r != nil {
		log.Println(r)
		return c.SendStatus(
			fiber.StatusInternalServerError,
		)
	}
	return nil
}
