package state

import (
	"echo/lib/utils"
	"errors"
	"log"
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

func (s *Session) SetMemberAudio(mid MemberId, audio bool) error {
	member := s.GetMember(mid)

	if member == nil {
		return errors.New("member not found")
	}

	member.SetAudio(audio)

	s.Broadcast(mid, func(member *Member) {
		log.Println("broadcast")
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

func (s *State) NewSession(sid SessionId) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Sessions[sid] = &Session{
		Id:      sid,
		Members: []*Member{},
	}
}

func (s *State) GetSession(sid SessionId) *Session {
	return s.Sessions[sid]
}

func (s *State) RemoveSession(sid SessionId) {
	delete(s.Sessions, sid)
}

func (s *State) IsSessionEmpty(sid SessionId) bool {
	session := s.GetSession(sid)
	if session == nil {
		return true
	}

	return len(session.Members) == 0
}

func (s *State) IsMemberExist(sid SessionId, mid MemberId) bool {
	member := s.GetSessionMember(sid, mid)
	return member != nil
}

func (s *State) AddSessionMember(
	sid SessionId,
	member *Member,
) {
	if !s.IsSessionExist(sid) {
		s.NewSession(sid)
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	session := s.GetSession(sid)
	session.Members = append(session.Members, member)
	s.react(sid, member)
}

func (s *State) react(sid SessionId, member *Member) {
	current := member
	mid := member.Id

	go func() {
		utils.IncreaseThread()
		defer utils.DecreaseThread()
		for {
			select {
			// ===================== share current member stream with the other member ===================
			case track := <-member.TracksChannel:

				members := s.GetSessionMembers(sid)

				for _, member := range members {
					// skip current member
					if member.Id == mid {
						continue
					}

					log.Printf("sending %s track from %d to %d", track.Kind().String(), member.Id, mid)
					member.SendTrack(track)
				}

			case cs := <-current.PeerConnectionState:
				if cs == webrtc.PeerConnectionStateClosed || cs == webrtc.PeerConnectionStateDisconnected || cs == webrtc.PeerConnectionStateFailed {
					s.RemoveSessionMember(sid, mid)
					members := s.GetSessionMembers(sid)
					for _, member := range members {
						member.Socket.SendMemberLeftMessage(mid)
					}
					return
				}
			}
		}
	}()
}

func (s *State) RemoveSessionMember(
	sid SessionId,
	mid MemberId,
) {
	if !s.IsSessionExist(sid) {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	session := s.GetSession(sid)
	session.Members = utils.Filter(session.Members, func(member *Member) bool {
		return member.Id != mid
	})

	if session.IsEmpty() {
		s.RemoveSession(sid)
	}
}

func (s *State) GetSessionMembers(sid SessionId) []*Member {
	if !s.IsSessionExist(sid) {
		return []*Member{}
	}

	return s.GetSession(sid).Members
}

func (s *State) GetSessionMember(sid SessionId, mid MemberId) *Member {
	if !s.IsSessionExist(sid) {
		return nil
	}

	session := s.GetSession(sid)

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
