package state

import (
	"encoding/json"
	"log"

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

func (pc *PeerContainer) AddIceCandidate(candidate string) {
	ice := &webrtc.ICECandidateInit{}
	if err := json.Unmarshal([]byte(candidate), ice); err != nil {
		log.Println("error:", err)
		return
	}
	if err := pc.Conn.AddICECandidate(*ice); err != nil {
		log.Println("warning: candidate couldn't be added.")
		return
	}
}
