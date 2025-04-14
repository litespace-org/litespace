package handlers

import (
	"echo/constants"
	"echo/state"
	"echo/utils"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/pion/webrtc/v4"
)

// a fiber handler that only responds with the number of current open peer connections.
func Stats(c *fiber.Ctx) error {
	return c.JSON(
		struct {
			Peers   int
			Sockets int
			Threads int
		}{
			Peers:   state.GetPeersCount(),
			Sockets: state.GetSocketsCount(),
			Threads: state.GetThreadsCount(),
		},
	)
}

// a fiber handler that shall be used by consumers in order to establish
// a webrtc connection with the server. Moreover, it attaches the in-comming
// streams from the producer to the consumer connection and sends the local
// SDP to the client.
func Consume(c *fiber.Ctx) error {
	utils.Recover(c)
	var body ApiConsumePayload

	if err := c.BodyParser(&body); err != nil {
		return c.SendStatus(
			fiber.StatusBadRequest,
		)
	}

	peerConnection := utils.Must(utils.GetPeerConn(body.PeerId, constants.Config)).(*webrtc.PeerConnection)

	// TODO: handle multiple requests (perhaps we can use set data structure for OutTracks)
	// TODO: handle consume request for a producer in advance

	// add the tracks of the producer to the consumer peer connection
	producerPeer := state.GetPeer(body.ProducerPeerId)

	if producerPeer == nil {
		return c.SendStatus(404)
	}

	for _, track := range producerPeer.Tracks {
		rtpSender, err := peerConnection.AddTrack(
			track,
		)
		if err != nil {
			log.Printf(
				"Unable to add track to the peer (%d) connection: %s",
				body.PeerId,
				err,
			)
			panic(err)
		}

		// Read incoming RTCP packets
		// Before these packets are returned they are processed by interceptors. For things
		// like NACK this needs to be called.
		go func() {
			rtcpBuf := make([]byte, 1500)
			state.CountThreadsUp()
			defer state.CountThreadsDown()
			for {
				if _, _, rtcpErr := rtpSender.Read(rtcpBuf); rtcpErr != nil {
					log.Printf(
						"Unable to read rtcp for peer %d: %s",
						body.PeerId,
						rtcpErr,
					)
					return
				}
			}
		}()
	}

	// decode the remote sdp and set it in the peer connection
	utils.Must(
		nil,
		peerConnection.SetRemoteDescription(
			body.SessionDescription,
		),
	)

	// create answer, set it in the peer connection, and encode and
	// send it in JSON response payload
	localSDB := utils.Must(peerConnection.CreateAnswer(nil)).(webrtc.SessionDescription)

	utils.Must(
		nil,
		peerConnection.SetLocalDescription(
			localSDB,
		),
	)

	return c.JSON(&localSDB)
}

// a fiber handler that shall be used by produces in order to establish
// a webrtc connection. Moreover, it stores the in-comming streams in
// the server state and sends the local SDP to the client.
func Produce(c *fiber.Ctx) error {
	defer utils.Recover(c)

	var body ApiProducePayload
	if err := c.BodyParser(&body); err != nil {
		return c.SendStatus(
			fiber.StatusBadRequest,
		)
	}

	if state.GetPeer(body.PeerId) != nil {
		return c.SendStatus(fiber.StatusConflict)
	}

	peerConnection := utils.Must(utils.GetPeerConn(
		body.PeerId,
		constants.Config,
	)).(*webrtc.PeerConnection)

	utils.Must(
		nil,
		peerConnection.SetRemoteDescription(
			body.SessionDescription,
		),
	)

	// create answer, set it in the peer connection, and encode and
	// send it in JSON response payload
	var localSDB = utils.Must(peerConnection.CreateAnswer(nil)).(webrtc.SessionDescription)

	utils.Must(
		nil,
		peerConnection.SetLocalDescription(
			localSDB,
		),
	)

	return c.JSON(&localSDB)
}
