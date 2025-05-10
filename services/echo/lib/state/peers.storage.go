package state

import (
	"github.com/gofiber/contrib/websocket"
)

type PeersStorage struct {
	PeerMap map[int]*PeerContainer
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

// Return the number of handlers and callback stored in memory
func (ps *PeersStorage) CountHandlers() int {
	var count int
	for _, container := range ps.PeerMap {
		count += container.CountHandlers()
	}
	return count
}

// Add a new peer container, with the socket property defined. If a socket connection
// already exists, it's being closed and replaced by the new one.
func (ps *PeersStorage) AddWithSocket(id int, socket *websocket.Conn) (*PeerContainer, error) {
	if ps.PeerMap[id] != nil {
		ps.PeerMap[id].destroySocket()
		ps.PeerMap[id].Socket = socket
		return ps.PeerMap[id], nil
	}

	container := NewPeerContainer(id, nil, socket, func(self *PeerContainer) {
		if len(self.consumers) == 0 {
			ps.Remove(id)
		}
	})
	ps.PeerMap[id] = &container

	return ps.PeerMap[id], nil
}

// Add a new peer container, with a new peer connection configured. It returns error
// in case there's a peer connection already.
func (ps *PeersStorage) AddOrGet(id int) (*PeerContainer, error) {
	if ps.PeerMap[id] != nil {
		ps.PeerMap[id].InitConn()
		return ps.PeerMap[id], nil
	}

	container := NewPeerContainer(id, nil, nil, func(self *PeerContainer) {
		if len(self.consumers) == 0 {
			ps.Remove(id)
		}
	})

	_, err := container.InitConn()
	if err != nil {
		return nil, err
	}
	ps.PeerMap[id] = &container

	return ps.PeerMap[id], err
}

// Add an empty peer container, or return it if one found.
func (ps *PeersStorage) AddEmptyOrGet(id int) *PeerContainer {
	if ps.PeerMap[id] != nil {
		return ps.PeerMap[id]
	}

	container := NewPeerContainer(id, nil, nil, func(self *PeerContainer) {
		if len(self.consumers) == 0 {
			ps.Remove(id)
		}
	})
	ps.PeerMap[id] = &container

	return &container
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
