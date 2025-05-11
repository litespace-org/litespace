package state

import (
	"echo/lib/utils"
	"errors"
	"log"
	"slices"
	"sync"

	"github.com/pion/webrtc/v4"
)

type SessionId = string

type Session struct {
	Id      SessionId
	Members []*Member
}

func (s *Session) IsEmpty() bool {
	return len(s.Members) == 0
}

// invokes the callback function with each member, as its parameter, except the `from` member
func (s *Session) Broadcast(from MemberId, callback func(member *Member)) {
	for _, member := range s.Members {
		if member.Id == from {
			continue
		}
		callback(member)
	}
}

func (s *Session) GetMember(mid MemberId) *Member {
	member := utils.Find(s.Members, func(member *Member) bool {
		return member.Id == mid
	})

	if member == nil {
		return nil
	}

	return *member
}

func (s *Session) AddMember(m *Member) error {
	if s.GetMember(m.Id) != nil {
		return errors.New("Member already exists")
	}
	s.Members = append(s.Members, m)
	return nil
}

func (s *Session) RmvMember(mid MemberId) {
	s.Members = slices.DeleteFunc(s.Members, func(m *Member) bool {
		return m.Id == mid
	})
}

// turns on/off video for a specific member. this function broadcasts
// (by WebSocket) to all members in the associated session that this
// specfic user has turned on/off his cam.
func (s *Session) SetMemberVideo(mid MemberId, video bool) error {
	member := s.GetMember(mid)

	if member == nil {
		return errors.New("member not found")
	}

	member.SetVideo(video)

	s.Broadcast(mid, func(member *Member) {
		member.Socket.SendToggleVideoMessage(mid, video)
	})

	return nil
}

// turns on/off audio for a specific member. this function broadcasts
// (by WebSocket) to all members in the associated session that this
// specfic user has turned on/off his mic.
func (s *Session) SetMemberAudio(mid MemberId, audio bool) error {
	member := s.GetMember(mid)

	if member == nil {
		return errors.New("member not found")
	}

	member.SetAudio(audio)

	s.Broadcast(mid, func(member *Member) {
		member.Socket.SendToggleAudioMessage(mid, audio)
	})

	return nil
}

type State struct {
	mu       sync.Mutex
	Sessions map[SessionId]*Session
}

func New() State {
	return State{
		Sessions: make(map[SessionId]*Session),
	}
}

func (s *State) IsSessionExist(sid SessionId) bool {
	return s.Sessions[sid] != nil
}

func (s *State) NewSession(sid SessionId) *Session {
	s.Sessions[sid] = &Session{
		Id:      sid,
		Members: []*Member{},
	}
	return s.Sessions[sid]
}

func (s *State) GetSession(sid SessionId) *Session {
	return s.Sessions[sid]
}

func (s *State) RemoveSession(sid SessionId) {
	delete(s.Sessions, sid)
}

func (s *State) IsSessionEmpty(sid SessionId) bool {
	session := s.Sessions[sid]
	return session == nil || len(session.Members) == 0
}

func (s *State) IsMemberExist(sid SessionId, mid MemberId) bool {
	member := s.GetSessionMember(sid, mid)
	return member != nil
}

func (s *State) AddSessionMember(sid SessionId, member *Member) {
	utils.Recover()

	s.mu.Lock()
	defer s.mu.Unlock()

	session := s.Sessions[sid]
	if session == nil {
		session = s.NewSession(sid)
	}

	utils.Unwrap(session.AddMember(member))
	s.react(sid, member)
}

// receive tracks from the curMember and send them to all other members in the session.
// and remove member from session (notify other members as well) when the webrtc connection is closed.
// @NOTE: this function must be called for each new member in the session.
func (s *State) react(sid SessionId, curMember *Member) {
	go func() {
		utils.IncreaseThread()
		defer utils.DecreaseThread()
		for {
			select {
			// share current member stream with the other member
			case track := <-curMember.TracksChannel:

				members := s.GetSessionMembers(sid)

				for _, m := range members {
					// skip current member
					if m.Id == curMember.Id {
						continue
					}

					log.Printf("sending %s track from %d to %d", track.Kind().String(), curMember.Id, m.Id)
					m.SendTrack(track)
				}

			case cs := <-curMember.PeerConnectionState:
				if cs == webrtc.PeerConnectionStateClosed ||
					cs == webrtc.PeerConnectionStateDisconnected ||
					cs == webrtc.PeerConnectionStateFailed {

					s.RemoveSessionMember(sid, curMember.Id)
					members := s.GetSessionMembers(sid)
					for _, member := range members {
						member.Socket.SendMemberLeftMessage(curMember.Id)
					}
					return

				}
			}
		}
	}()
}

func (s *State) RemoveSessionMember(sid SessionId, mid MemberId) {
	session := s.Sessions[sid]
	if session == nil {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	session.RmvMember(mid)

	if session.IsEmpty() {
		s.RemoveSession(sid)
	}
}

func (s *State) GetSessionMembers(sid SessionId) []*Member {
	session := s.Sessions[sid]
	if session == nil {
		return []*Member{}
	}
	return session.Members[:]
}

func (s *State) GetSessionMember(sid SessionId, mid MemberId) *Member {
	session := s.Sessions[sid]
	if session == nil {
		return nil
	}

	member := utils.Find(session.Members, func(member *Member) bool {
		return member.Id == mid
	})
	if member == nil {
		return nil
	}

	return *member
}

func (s *State) CountMembers() int {
	count := 0

	for _, session := range s.Sessions {
		count += len(session.Members)
	}

	return count
}

func (s *State) CountSessions() int {
	return len(s.Sessions)
}
