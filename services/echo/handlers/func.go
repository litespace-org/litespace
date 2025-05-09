package handlers

import (
	"echo/lib/state"
	"echo/lib/utils"

	"github.com/gofiber/fiber/v2"
)

// a fiber handler that only responds with the number of current open peer connections,
// websockets, and threads (for loops in the background)
func Stats(appstate *state.State) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		return c.JSON(
			struct {
				Peers    int
				Sockets  int
				Threads  int
				Handlers int
			}{
				Peers:    appstate.Peers.CountPeers(),
				Sockets:  appstate.Peers.CountSockets(),
				Handlers: appstate.Peers.CountHandlers(),
				Threads:  utils.CountThreads(),
			},
		)
	}
}

// returns a fiber handler that shall be used by consumers in order to establish
// a webrtc connection with the server. Moreover, it attaches the in-comming
// streams from the producer to the consumer connection and sends the local
// SDP to the client.
func Consume(appstate *state.State) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		utils.Recover(c)
		var body ApiConsumePayload

		if err := c.BodyParser(&body); err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		peer := utils.Must(appstate.Peers.AddOrGet(body.PeerId))

		// TODO: handle multiple requests (perhaps we can use set data structure for OutTracks)
		// TODO: handle consume request for a producer in advance

		// add the tracks of the producer to the consumer peer connection
		producerPeer := appstate.Peers.AddEmptyOrGet(body.ProducerPeerId)
		if producerPeer == nil {
			return c.SendStatus(fiber.StatusNotFound)
		}
		peer.Consume(producerPeer)

		// decode the remote sdp and set it in the peer connection
		utils.Unwrap(peer.Conn.SetRemoteDescription(body.SessionDescription))

		// create answer, set it in the peer connection, and encode and
		// send it in JSON response payload
		localSDB := utils.Must(peer.Conn.CreateAnswer(nil))
		utils.Unwrap(peer.Conn.SetLocalDescription(localSDB))

		return c.JSON(&localSDB)
	}
}

// returns a fiber handler that shall be used by produces in order to establish
// a webrtc connection. Moreover, it stores the in-comming streams in
// the server state and sends the local SDP to the client.
func Produce(appstate *state.State) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		defer utils.Recover(c)

		var body ApiProducePayload
		if err := c.BodyParser(&body); err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		peer := utils.Must(appstate.Peers.AddOrGet(body.PeerId))

		utils.Unwrap(peer.Conn.SetRemoteDescription(body.SessionDescription))

		// create answer, set it in the peer connection, and encode and
		// send it in JSON response payload
		var localSDB = utils.Must(peer.Conn.CreateAnswer(nil))

		utils.Unwrap(peer.Conn.SetLocalDescription(localSDB))

		return c.JSON(&localSDB)
	}
}
