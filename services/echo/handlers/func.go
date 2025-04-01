package handlers

import (
	"echo/constants"
	"echo/state"
	"echo/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/pion/webrtc/v4"
)

// a fiber handler that only responds with the number of current open peer connections.
func Stats(c *fiber.Ctx) error {
	return c.JSON(struct{ Peers int }{Peers: state.Count()})
}

// a fiber handler that shall be used by consumers in order to establish
// a webrtc connection with the server. Moreover, it attaches the in-comming
// streams from the producer to the consumer connection and sends the local
// SDP to the client.
func Consume(c *fiber.Ctx) error {
	var body ApiConsumePayload

	if err := c.BodyParser(&body); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	peerConnection := utils.Must(utils.GetPeerConn(body.PeerId, constants.Config)).(*webrtc.PeerConnection)

	// TODO: handle multiple requests (perhaps we can use set data structure for OutTracks)
	// TODO: handle consume request for a producer in advance

	if peerConnection.ConnectionState() != webrtc.PeerConnectionStateConnected {
		// add the tracks of the producer to the consumer peer connection
		producerPeer := state.Get(body.ProducerPeerId)
		for _, track := range producerPeer.Tracks {
			rtpSender, err := peerConnection.AddTrack(track)
			if err != nil {
				panic(err)
			}

			// Read incoming RTCP packets
			// Before these packets are returned they are processed by interceptors. For things
			// like NACK this needs to be called.
			go func() {
				rtcpBuf := make([]byte, 1500)
				for {
					if _, _, rtcpErr := rtpSender.Read(rtcpBuf); rtcpErr != nil {
						return
					}
				}
			}()
		}

		// decode the remote sdp and set it in the peer connection
		utils.Must(nil, peerConnection.SetRemoteDescription(body.SessionDescription))

		// create answer, set it in the peer connection, and encode and
		// send it in JSON response payload
		var localSDB = utils.Must(peerConnection.CreateAnswer(nil)).(webrtc.SessionDescription)
		utils.Must(nil, peerConnection.SetLocalDescription(localSDB))

		return c.JSON(&localSDB)
	}

	return c.JSON(peerConnection.LocalDescription())
}

// a fiber handler that shall be used by produces in order to establish
// a webrtc connection. Moreover, it stores the in-comming streams in
// the server state and sends the local SDP to the client.
func Produce(c *fiber.Ctx) error {
	defer utils.Recover(c)

	var body ApiProducePayload
	if err := c.BodyParser(&body); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if state.Get(body.PeerId) != nil {
		return c.SendStatus(fiber.StatusConflict)
	}

	peerConnection := utils.Must(utils.GetPeerConn(body.PeerId, constants.Config)).(*webrtc.PeerConnection)

	utils.Must(nil, peerConnection.SetRemoteDescription(body.SessionDescription))

	// create answer, set it in the peer connection, and encode and
	// send it in JSON response payload
	var localSDB = utils.Must(peerConnection.CreateAnswer(nil)).(webrtc.SessionDescription)
	utils.Must(nil, peerConnection.SetLocalDescription(localSDB))

	return c.JSON(&localSDB)
}
