// this defines and manages the global state of the server
package state

import (
	"errors"

	"github.com/gofiber/contrib/websocket"
	"github.com/pion/webrtc/v4"
)

var peers = make(PeersMap)
var peer_chans = make(PeerChansMap)

// Returns the number of peers (produers + consumers) in the state.
func GetPeersCount() int {
	return len(peers)
}

// returns a specific PeerContainer from the state map.
func GetPeer(id int) *PeerContainer {
	return peers[PeerId(id)]
}

// returns a specific PeerContainer from the state map.
func WaitPeer(id int) *PeerContainer {
	if peer_chans[PeerId(id)] == nil {
		peer_chans[PeerId(id)] = make(chan *PeerContainer)
	}
	defer delete(peer_chans, PeerId(id))
	return <-peer_chans[PeerId(id)]
}

// add a new peer connection in the state map.
func AddPeer(
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
	if peer_chans[PeerId(id)] != nil {
		peer_chans[PeerId(id)] <- &container
	}
	return nil
}

var sockets = make(map[int]*websocket.Conn)

func GetSocketsCount() int {
	return len(sockets)
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

func RmvWS(id int) {
	delete(sockets, id)
}

// ensures the connection is disconnected, and clears the container
// and its associated streams from the memory.
func RmvPeer(id int) error {
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

var no_threads int = 0

func GetThreadsCount() int {
	return no_threads
}

func CountThreadsUp() {
	no_threads += 1
}

func CountThreadsDown() {
	no_threads -= 1
}
