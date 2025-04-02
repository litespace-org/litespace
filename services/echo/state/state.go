// this defines and manages the global state of the server
package state

import (
	"errors"

	"github.com/pion/webrtc/v4"
)

var producers = make(PeersMap)
var consumers = make(PeersMap)

type PeerRole string

const (
	PeerRoleProducer PeerRole = "producer"
	PeerRoleConsumer PeerRole = "consumer"
)

// Returns the number of peers (produers + consumers) in the state.
func Count() int {
	return len(producers) + len(consumers)
}

func getPeerMap(role PeerRole) PeersMap {
	if role == PeerRoleProducer {
		return producers
	}

	return consumers
}

// returns a specific PeerContainer from the state map.
func Get(id int, role PeerRole) *PeerContainer {
	return getPeerMap(role)[PeerId(id)]
}

// add a new peer connection in the state map.
func Add(
	id int,
	role PeerRole,
	conn *webrtc.PeerConnection,
) error {
	peerMap := getPeerMap(role)

	if peerMap[PeerId(id)] != nil {
		return errors.New(
			"peer id already exists",
		)
	}

	container := PeerContainer{
		Conn:   conn,
		Tracks: []*webrtc.TrackLocalStaticRTP{},
	}

	peerMap[PeerId(id)] = &container
	return nil
}

// ensures the connection is disconnected, and clears the container
// and its associated streams from the memory.
func Remove(id int, role PeerRole) error {
	peerMap := getPeerMap(role)
	container := peerMap[PeerId(id)]

	if container == nil {
		return nil
	}

	if err := container.Conn.Close(); err != nil {
		return err
	}

	container.Conn = nil
	container.Tracks = nil
	delete(peerMap, PeerId(id))

	return nil
}
