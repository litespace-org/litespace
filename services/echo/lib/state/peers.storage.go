package state

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/pion/webrtc/v4"
)

type PeersStorage struct {
	PeerMap map[int]*PeerContainer
	ChanMap map[int]chan *PeerContainer
}

// Get a specific peer container, returns nil if not found
func (ps *PeersStorage) Get(id int) *PeerContainer {
	return ps.PeerMap[id]
}

// Return the number of peer containers in the server
func (ps *PeersStorage) CountPeers() int {
	return len(ps.PeerMap)
}

// Return the number of socket connections in the server
func (ps *PeersStorage) CountSockets() int {
	var count int
	for _, container := range ps.PeerMap {
		if container.Socket != nil {
			count += 1
		}
	}
	return count
}

// Get a specific peer container, just like Get, but hangs the flow of control
// until it's initialized, in case the value is currently nil
func (ps *PeersStorage) Wait(id int) *PeerContainer {
	if ps.PeerMap[id] != nil {
		return ps.PeerMap[id]
	}
	if ps.ChanMap[id] == nil {
		ps.ChanMap[id] = make(chan *PeerContainer)
	}
	defer delete(ps.ChanMap, id)
	return <-ps.ChanMap[id]
}

// Add a new peer container, with the socker property defined. If a socket connection
// already exists, it's being closed and replaced by the new one.
func (ps *PeersStorage) AddWithSocket(id int, socket *websocket.Conn) (*PeerContainer, error) {
	if ps.PeerMap[id] != nil {
		err := ps.PeerMap[id].Socket.Close()
		if err != nil {
			return nil, err
		}
		ps.PeerMap[id].Socket = socket
		return ps.PeerMap[id], nil
	}

	container := PeerContainer{
		Id:            id,
		Conn:          nil,
		Tracks:        []*webrtc.TrackLocalStaticRTP{},
		Socket:        socket,
		iceCandidates: []string{},
		onDestroy:     func() { ps.Remove(id) },
	}

	ps.PeerMap[id] = &container
	if ps.ChanMap[id] != nil {
		ps.ChanMap[id] <- &container
	}

	return ps.PeerMap[id], nil
}

// Add a new peer container, with a new peer connection configured. It returns error
// in case there's a peer connection already.
func (ps *PeersStorage) Add(id int) (*PeerContainer, error) {
	if ps.PeerMap[id] != nil {
		_, err := ps.PeerMap[id].InitConn()
		return ps.PeerMap[id], err
	}

	container := PeerContainer{
		Id:            id,
		Conn:          nil,
		Tracks:        []*webrtc.TrackLocalStaticRTP{},
		Socket:        nil,
		iceCandidates: []string{},
		onDestroy:     func() { ps.Remove(id) },
	}
	_, err := container.InitConn()
	if err != nil {
		return nil, err
	}

	ps.PeerMap[id] = &container
	if ps.ChanMap[id] != nil {
		ps.ChanMap[id] <- &container
	}

	return ps.PeerMap[id], err
}

// Remove the peer container from the map and invoke the destroy method within as well
func (ps *PeersStorage) Remove(id int) {
	container := ps.PeerMap[id]
	if container == nil {
		return
	}
	if !container.Destroyed {
		container.Destroy()
	}

	delete(ps.PeerMap, id)
}
