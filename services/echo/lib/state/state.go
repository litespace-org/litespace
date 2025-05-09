// this defines and manages the global state of the server
package state

type State struct {
	Peers *PeersStorage
}

func New() State {
	return State{
		Peers: &PeersStorage{
			PeerMap: make(map[int]*PeerContainer),
		},
	}
}
