package utils

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

// ancillary function used to clean the code in handlers;
// by wrapping db methods and return the result if no error
// is found, or panic otherwise.
func Must[V any](res V, err error) V {
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
// beginning of any function that uses utils.Must.
func Recover() error {
	if r := recover(); r != nil {
		log.Println(r)
	}
	return nil
}

// ancillary function that shall be used (deferred) in the
// beginning of fiber handlers where anc.Must is used within.
func FiberRecover(c *fiber.Ctx) error {
	if r := recover(); r != nil {
		log.Println(r)
		return c.SendStatus(
			fiber.StatusInternalServerError,
		)
	}
	return nil
}

func Filter[T any](list []T, callback func(item T) bool) []T {
	result := []T{}

	for _, item := range list {
		if callback(item) {
			result = append(result, item)
		}
	}

	return result
}

func Find[T any](list []T, callback func(item T) bool) *T {

	for _, item := range list {
		if callback(item) {
			return &item
		}
	}

	return nil
}
