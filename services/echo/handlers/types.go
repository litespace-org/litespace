package handlers

import (
	"github.com/pion/webrtc/v4"
)

type ApiConsumePayload struct {
	PeerId         int
	ProducerPeerId int
}

type ApiConnectPayload struct {
	PeerId             int
	SessionDescription webrtc.SessionDescription
}
