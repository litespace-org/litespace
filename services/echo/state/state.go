// this defines and manages the global state of the server
package state

import (
	"errors"

	"github.com/pion/webrtc/v4"
)

var state = make(PeersMap)

// returns the number of peers in the state map
func Count() int {
	return len(state)
}

// returns a specific PeerContainer from the state map.
func Get(id int) *PeerContainer {
	return state[PeerId(id)]
}

// add a new peer connection in the state map.
func Add(id int, conn *webrtc.PeerConnection) error {
	if state[PeerId(id)] != nil {
		return errors.New("peer id already exists")
	}

	container := PeerContainer{
		Conn:   conn,
		Tracks: []*webrtc.TrackLocalStaticRTP{},
	}

	state[PeerId(id)] = &container
	return nil
}

// ensures the connection is disconnected, and clears the container
// and its associated streams from the memory.
func Remove(id int) error {
	var container = state[PeerId(id)]
	if container == nil {
		return nil
	}

	if err := container.Conn.Close(); err != nil {
		return err
	}

	container.Conn = nil
	container.Tracks = nil
	delete(state, PeerId(id))

	return nil
}
