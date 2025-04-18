// this defines and manages the global state of the server
package state

type State struct {
	Peers *PeersStorage
}

func New() State {
	return State{
		Peers: &PeersStorage{
			PeerMap: make(map[int]*PeerContainer),
			ChanMap: make(map[int]chan *PeerContainer),
		},
	}
}

var no_threads int

func CountThreads() int {
	return no_threads
}

func IncreaseThread() {
	no_threads += 1
}

func DecreaseThread() {
	no_threads -= 1
}
