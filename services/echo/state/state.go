// this defines and manages the global state of the server
package state

import (
	"errors"

	"github.com/gofiber/contrib/websocket"
	"github.com/pion/webrtc/v4"
)

var peers = make(PeersMap)
var sockets = make(map[int]*websocket.Conn)

// Returns the number of peers (produers + consumers) in the state.
func Count() int {
	return len(peers)
}

// returns a specific PeerContainer from the state map.
func Get(id int) *PeerContainer {
	return peers[PeerId(id)]
}

// add a new peer connection in the state map.
func Add(
	id int,
	conn *webrtc.PeerConnection,
) error {
	if peers[PeerId(id)] != nil {
		return errors.New(
			"peer id already exists",
		)
	}

	container := PeerContainer{
		Conn:   conn,
		Tracks: []*webrtc.TrackLocalStaticRTP{},
	}

	peers[PeerId(id)] = &container
	return nil
}

func GetWS(id int) *websocket.Conn {
	return sockets[id]
}

func AddWS(id int, ws *websocket.Conn) error {
	if sockets[id] != nil {
		return errors.New(
			"websocket id already exists",
		)
	}
	sockets[id] = ws
	return nil
}

// ensures the connection is disconnected, and clears the container
// and its associated streams from the memory.
func Remove(id int) error {
	container := peers[PeerId(id)]

	if container == nil {
		return nil
	}

	if err := container.Conn.Close(); err != nil {
		return err
	}

	container.Conn = nil
	container.Tracks = nil
	delete(peers, PeerId(id))
	delete(sockets, id)

	return nil
}
