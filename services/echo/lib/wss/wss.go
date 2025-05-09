package wss

import (
	"echo/lib/utils"
	"encoding/json"
	"sync"

	"github.com/gofiber/contrib/websocket"
	"github.com/pion/webrtc/v4"
)

type MessageKind int

const (
	MessageKindOffer      MessageKind = 1
	MessageKindAnswer     MessageKind = 2
	MessageKindCandidate  MessageKind = 3
	MessageKindMemberLeft MessageKind = 4
	MessageKindUnkown     MessageKind = -1
)

type ServerMessage struct {
	Kind  MessageKind `json:"kind"`
	Value interface{} `json:"value"`
}

// A proxy for the main socket connection. The proxy uses a mutex to ensure that
// no concurrent writting into the socket is happening which is
// prohibited/not-allowed.
type Socket struct {
	mu             sync.Mutex
	conn           *websocket.Conn
	MessageKindMap map[int]MessageKind
}

func New(conn *websocket.Conn) Socket {
	return Socket{conn: conn, MessageKindMap: map[int]MessageKind{
		1:  MessageKindOffer,
		2:  MessageKindAnswer,
		3:  MessageKindCandidate,
		4:  MessageKindMemberLeft,
		-1: MessageKindUnkown,
	}}
}

func (s *Socket) GetMessageKind(b byte) MessageKind {
	key := int(b)
	kind, ok := s.MessageKindMap[key]
	if !ok {
		return MessageKindUnkown
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

func (s *Socket) SendTextMessage(kind MessageKind, value interface{}) error {
	data := utils.Must(json.Marshal(ServerMessage{
		Kind:  kind,
		Value: value,
	}))
	return s.WriteMessage(websocket.TextMessage, data)
}

func (s *Socket) SendOfferMessage(sessionDescription *webrtc.SessionDescription) {
	s.SendTextMessage(MessageKindOffer, sessionDescription)
}

func (s *Socket) SendAnswerMessage(sessionDescription *webrtc.SessionDescription) {
	s.SendTextMessage(MessageKindAnswer, sessionDescription)
}

func (s *Socket) SendMemberLeftMessage() {
	s.SendTextMessage(MessageKindMemberLeft, nil)
}

func (s *Socket) SendIceCandidateMessage(ice *webrtc.ICECandidateInit) {
	s.SendTextMessage(MessageKindCandidate, ice)
}
