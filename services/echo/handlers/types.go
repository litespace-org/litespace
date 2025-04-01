package handlers

import (
	"github.com/pion/webrtc/v4"
)

type ApiConsumePayload struct {
	PeerId             int
	SessionDescription webrtc.SessionDescription
	ProducerPeerId     int
}

type ApiProducePayload struct {
	PeerId             int
	SessionDescription webrtc.SessionDescription
}
