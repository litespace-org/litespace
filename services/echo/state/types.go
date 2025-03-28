package state

import (
	"github.com/pion/webrtc/v4"
)

type PeerId int // each client should supply the server with a unique number
type PeersMap map[PeerId]*PeerContainer

// this describes a peer connection between the client (producer/consumer) and the server.
type PeerContainer struct {
	Conn *webrtc.PeerConnection

	// slice of tracks that are received from the client in the server
	Tracks []*webrtc.TrackLocalStaticRTP
}
