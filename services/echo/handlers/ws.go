package handlers

import (
	"echo/lib/state"
	"echo/lib/utils"
	"log"
	"strconv"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func UpgradeWS(c *fiber.Ctx) error {
	// IsWebSocketUpgrade returns true if the client
	// requested upgrade to the WebSocket protocol.
	if websocket.IsWebSocketUpgrade(c) {
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

// Returns a fiber connection by using the websocket module. It handles the socket
// connection by adding a PeerContainer with the associated id (if it doesn't exist)
// and then attach the socket connection to it in order to be able to send candidates
// to the other peer, and finally handle recieving ice candidates from the other peer.
//
// NOTE: the socket connection is automatically closed after a certain amount of seconds.
// it's used only to establish connection. exchanging data shall be proceeded by using
// webrtc data channels.
func NewSocketConn(appstate *state.State) fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			c.Close()
			return
		}

		peer := utils.Must(appstate.Peers.AddWithSocket(id, c))

		state.IncreaseThread()
		defer state.DecreaseThread()
		for {
			msgType, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("error:", err)
				break
			}
			if msgType == websocket.TextMessage {
				peer.AddICECandidate(string(msg))
			}
		}
	})
}
