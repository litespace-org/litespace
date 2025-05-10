package wss

import (
	"echo/lib/utils"
	"encoding/json"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/pion/webrtc/v4"
)

type ClientMessageType int

const (
	ClientMessageTypeOffer        ClientMessageType = 1
	ClientMessageTypeAnswer       ClientMessageType = 2
	ClientMessageTypeCandidate    ClientMessageType = 3
	ClientMessageTypeLeaveSession ClientMessageType = 4
	ClientMessageTypeToggleVideo  ClientMessageType = 5
	ClientMessageTypeToggleAudio  ClientMessageType = 6
	ClientMessageTypeUnkown       ClientMessageType = -1
)

func (m ClientMessageType) String() string {
	switch m {
	case ClientMessageTypeOffer:
		return "ClientMessageTypeOffer"
	case ClientMessageTypeAnswer:
		return "ClientMessageTypeAnswer"
	case ClientMessageTypeCandidate:
		return "ClientMessageTypeCandidate"
	case ClientMessageTypeLeaveSession:
		return "ClientMessageTypeLeaveSession"
	case ClientMessageTypeToggleVideo:
		return "ClientMessageTypeToggleVideo"
	case ClientMessageTypeToggleAudio:
		return "ClientMessageTypeToggleAudio"
	case ClientMessageTypeUnkown:
		return "ClientMessageTypeUnkown"
	default:
		return "n/a"
	}
}

type ServerMessageType int

const (
	ServerMessageTypeOffer        ServerMessageType = 1
	ServerMessageTypeAnswer       ServerMessageType = 2
	ServerMessageTypeCandidate    ServerMessageType = 3
	ServerMessageTypeMemberJoined ServerMessageType = 4
	ServerMessageTypeMemberLeft   ServerMessageType = 5
	ServerMessageTypeToggleVideo  ServerMessageType = 6
	ServerMessageTypeToggleAudio  ServerMessageType = 7
)

type ServerMessage struct {
	Type  ServerMessageType `json:"type"`
	Value interface{}       `json:"value"`
}

type MemberLeftMessage struct {
	Mid int `json:"mid"`
}

type ToggleVideoMessage struct {
	Mid   int  `json:"mid"`
	Video bool `json:"video"`
}

type ToggleAudioMessage struct {
	Mid   int  `json:"mid"`
	Audio bool `json:"audio"`
}

// A proxy for the main socket connection. The proxy uses a mutex to ensure that
// no concurrent writting into the socket is happening which is
// prohibited/not-allowed.
type Socket struct {
	mu                   sync.Mutex
	conn                 *websocket.Conn
	ClientMessageTypeMap map[int]ClientMessageType
}

func New(conn *websocket.Conn) Socket {
	return Socket{conn: conn, ClientMessageTypeMap: map[int]ClientMessageType{
		1:  ClientMessageTypeOffer,
		2:  ClientMessageTypeAnswer,
		3:  ClientMessageTypeCandidate,
		4:  ClientMessageTypeLeaveSession,
		5:  ClientMessageTypeToggleVideo,
		6:  ClientMessageTypeToggleAudio,
		-1: ClientMessageTypeUnkown,
	}}
}

func (s *Socket) GetMessageKind(b byte) ClientMessageType {
	key := int(b)
	kind, ok := s.ClientMessageTypeMap[key]
	if !ok {
		return ClientMessageTypeUnkown
	}
	return kind
}

func (s *Socket) ReadMessage() (messageType int, p []byte, err error) {
	return s.conn.ReadMessage()
}

func (s *Socket) Params(key string, defaultValue ...string) string {
	return s.conn.Params(key, defaultValue...)
}

func (s *Socket) WriteMessage(messageType int, data []byte) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.conn.WriteMessage(messageType, data)
}

func (s *Socket) SendTextMessage(t ServerMessageType, v interface{}) error {
	data := utils.Must(json.Marshal(ServerMessage{
		Type:  t,
		Value: v,
	}))
	return s.WriteMessage(websocket.TextMessage, data)
}

func (s *Socket) SendOfferMessage(sessionDescription *webrtc.SessionDescription) {
	s.SendTextMessage(ServerMessageTypeOffer, sessionDescription)
}

func (s *Socket) SendAnswerMessage(sessionDescription *webrtc.SessionDescription) {
	s.SendTextMessage(ServerMessageTypeAnswer, sessionDescription)
}

func (s *Socket) SendMemberLeftMessage(mid int) {
	s.SendTextMessage(ServerMessageTypeMemberLeft, MemberLeftMessage{Mid: mid})
}

func (s *Socket) SendIceCandidateMessage(ice *webrtc.ICECandidateInit) {
	s.SendTextMessage(ServerMessageTypeCandidate, ice)
}

func (s *Socket) SendToggleVideoMessage(mid int, video bool) {
	s.SendTextMessage(ServerMessageTypeToggleVideo, ToggleVideoMessage{Mid: mid, Video: video})
}

func (s *Socket) SendToggleAudioMessage(mid int, audio bool) {
	s.SendTextMessage(ServerMessageTypeToggleAudio, ToggleAudioMessage{
		Mid:   mid,
		Audio: audio,
	})
}
