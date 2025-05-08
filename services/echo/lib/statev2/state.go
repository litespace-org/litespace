package statev2

import "echo/lib/utils"

type SessionId = string

type Session struct {
	Id      SessionId
	Members []*Member
}

type State struct {
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
	s.Sessions[sid] = &Session{
		Id:      sid,
		Members: []*Member{},
	}
}

func (s *State) GetSession(sid SessionId) *Session {
	return s.Sessions[sid]
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

	session := s.GetSession(sid)
	session.Members = append(session.Members, member)
}

func (s *State) RemoveSessionMember(
	sid SessionId,
	mid MemberId,
) {
	if !s.IsSessionExist(sid) {
		return
	}

	session := s.GetSession(sid)
	session.Members = utils.Filter(session.Members, func(member *Member) bool {
		return member.Id != mid
	})
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
